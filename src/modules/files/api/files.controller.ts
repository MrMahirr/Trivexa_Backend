import { Body, Controller, Get, Param, Post, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { FilesService } from '../application/files.service';
import { FileUploadMetadataDto } from './dto/file-upload.dto';

import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Files')
@ApiBearerAuth()
@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
    constructor(private readonly filesService: FilesService) { }

    @ApiOperation({ summary: 'Upload a file' })
    @ApiResponse({ status: 201, description: 'File uploaded successfully.' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
                entityType: { type: 'string' },
                entityId: { type: 'string' },
                folderPath: { type: 'string' },
                isPublic: { type: 'boolean' },
            },
        },
    })
    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Body() metadata: FileUploadMetadataDto,
        @CurrentUser() user: any
    ) {
        if (!file) {
            throw new Error('File is required');
        }
        return this.filesService.saveFile(file, metadata, user.userId);
    }

    @ApiOperation({ summary: 'Download a file' })
    @ApiResponse({ status: 200, description: 'File stream.' })
    @Get(':id/download')
    async downloadFile(@Param('id') id: string, @Res() res: Response) {
        const { stream, record } = await this.filesService.getFileStream(id);

        res.set({
            'Content-Type': record.mimeType,
            'Content-Disposition': `attachment; filename="${record.fileName}"`,
        });

        stream.pipe(res);
    }

    @ApiOperation({ summary: 'Get file metadata' })
    @ApiResponse({ status: 200, description: 'Return file metadata.' })
    @ApiResponse({ status: 404, description: 'File not found.' })
    @Get(':id')
    async getMetadata(@Param('id') id: string) {
        return this.filesService.findById(id);
    }
}
