import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3StorageProvider {
    private readonly s3Client: S3Client;
    private readonly bucketName: string;
    private readonly logger = new Logger(S3StorageProvider.name);

    constructor(private readonly configService: ConfigService) {
        this.bucketName = this.configService.get<string>('S3_BUCKET_NAME') || 'trivexa-storage';

        // AWS S3 client configuration using environment variables
        this.s3Client = new S3Client({
            region: this.configService.get<string>('S3_REGION') || 'eu-central-1',
            credentials: {
                accessKeyId: this.configService.get<string>('S3_ACCESS_KEY') || 'dummy-access-key',
                secretAccessKey: this.configService.get<string>('S3_SECRET_KEY') || 'dummy-secret-key',
            },
            // If using MinIO or custom endpoint
            ...(this.configService.get<string>('S3_ENDPOINT') && {
                endpoint: this.configService.get<string>('S3_ENDPOINT'),
                forcePathStyle: true,
            })
        });
    }

    /**
     * Uploads a file buffer to S3
     * @param buffer The file buffer to upload
     * @param mimetype The MIME type of the file
     * @param originalName The original file name
     * @param folder The target folder path in the bucket
     * @returns The generated key and the public/signed URL of the uploaded file
     */
    async uploadFile(buffer: Buffer, mimetype: string, originalName: string, folder: string = 'general'): Promise<{ key: string, url: string }> {
        const extension = originalName.split('.').pop();
        const uniqueFileName = `${folder}/${uuidv4()}-${Date.now()}.${extension}`;

        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: uniqueFileName,
            Body: buffer,
            ContentType: mimetype,
            // Optional: ACL: 'public-read' (Configure carefully depending on S3 Bucket Policy)
        });

        try {
            await this.s3Client.send(command);
            this.logger.log(`File uploaded successfully: ${uniqueFileName}`);

            // If the bucket is not public, return a signed URL. Otherwise, return a direct URL.
            // For this example, we'll return a raw S3 path-like URL. A specific CloudFront or public S3 URL is typical here.
            const url = `https://${this.bucketName}.s3.${this.configService.get<string>('S3_REGION') || 'eu-central-1'}.amazonaws.com/${uniqueFileName}`;

            return { key: uniqueFileName, url };
        } catch (error) {
            this.logger.error(`Error uploading file ${originalName} to S3`, error);
            throw new Error(`Failed to upload file to S3: ${error.message}`);
        }
    }

    /**
     * Deletes a file from S3
     * @param key The key/path of the file in the bucket
     */
    async deleteFile(key: string): Promise<void> {
        const command = new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });

        try {
            await this.s3Client.send(command);
            this.logger.log(`File deleted successfully: ${key}`);
        } catch (error) {
            this.logger.error(`Error deleting file ${key} from S3`, error);
            throw new Error(`Failed to delete file from S3: ${error.message}`);
        }
    }

    /**
     * Generates a pre-signed URL for downloading a private file
     * @param key The key/path of the file in the bucket
     * @param expiresIn Expiration time in seconds (default 1 hour)
     */
    async getSignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });

        try {
            return await getSignedUrl(this.s3Client, command, { expiresIn });
        } catch (error) {
            this.logger.error(`Error generating signed URL for ${key}`, error);
            throw new Error(`Failed to generate signed URL: ${error.message}`);
        }
    }
}
