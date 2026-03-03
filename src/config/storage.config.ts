import { registerAs } from '@nestjs/config';

export default registerAs('storage', () => ({
  /** Depolama yöntemi: 'local' veya 's3' */
  driver: process.env.STORAGE_DRIVER || 'local',

  /** Yerel dosya depolama ayarları */
  local: {
    uploadDir: process.env.UPLOAD_DIR || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
    allowedMimeTypes: (
      process.env.ALLOWED_MIME_TYPES ||
      'image/jpeg,image/png,image/gif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain'
    ).split(','),
  },

  /** AWS S3 ayarları */
  s3: {
    bucket: process.env.AWS_S3_BUCKET || '',
    region: process.env.AWS_S3_REGION || 'eu-central-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    endpoint: process.env.AWS_S3_ENDPOINT || undefined,
    presignedUrlExpiry: parseInt(
      process.env.S3_PRESIGNED_URL_EXPIRY || '3600',
      10,
    ), // 1 saat
  },
}));
