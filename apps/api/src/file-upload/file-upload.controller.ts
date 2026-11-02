import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UseInterceptors,
  UploadedFile, ParseUUIDPipe, Res, StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import type { Response } from 'express';
import { createReadStream } from 'fs';
import { FileUploadService } from './file-upload.service';
import { CreateFileUploadDto, UpdateFileUploadDto, FileUploadQueryDto, UploadFileDto } from './dto';
import { MAX_UPLOAD_SIZE } from '../common/services/file-storage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../entities/user.entity';

@ApiTags('File Upload')
@Controller('file-upload')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('upload')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST, UserRole.NURSE)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_UPLOAD_SIZE } }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadFileDto })
  @ApiOperation({ summary: 'Upload a file to storage and record it' })
  upload(@UploadedFile() file: Express.Multer.File, @Body() dto: UploadFileDto, @CurrentUser() user: any) {
    return this.fileUploadService.upload(file, dto, user.userId, user.clinicId);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST, UserRole.NURSE)
  @ApiOperation({ summary: 'Create file upload record for an externally hosted file' })
  create(@Body() dto: CreateFileUploadDto, @CurrentUser() user: any) {
    return this.fileUploadService.create(dto, user.userId, user.clinicId);
  }

  @Get()
  @ApiOperation({ summary: 'List file uploads' })
  findAll(@Query() query: FileUploadQueryDto, @CurrentUser() user: any) {
    return this.fileUploadService.findAll(query, user.clinicId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get file upload statistics' })
  getStats(@CurrentUser() user: any) {
    return this.fileUploadService.getStats(user.clinicId);
  }

  @Get(':id/download')
  @ApiOperation({
    summary: 'Download a file',
    description: 'Returns { url, expiresAt } with a short-lived signed URL for Cloudinary files; streams the file for local storage.',
  })
  async download(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.fileUploadService.getDownload(id, user.clinicId);
    if (result.type === 'redirect') {
      return { url: result.url, expiresAt: result.expiresAt };
    }
    res.set({
      'Content-Type': result.mimeType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(result.fileName)}"`,
    });
    return new StreamableFile(createReadStream(result.filePath));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file upload by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return this.fileUploadService.findById(id, user.clinicId);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update file upload record' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateFileUploadDto, @CurrentUser() user: any) {
    return this.fileUploadService.update(id, dto, user.clinicId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete file upload record and its stored file' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return this.fileUploadService.remove(id, user.clinicId);
  }
}