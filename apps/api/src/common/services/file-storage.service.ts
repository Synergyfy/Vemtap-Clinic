import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { v4 as uuidv4 } from 'uuid';

export interface FileUploadResult {
  path: string;
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

@Injectable()
export class FileStorageService {
  private provider: string;
  private localUploadDir: string;

  constructor(private config: ConfigService) {
    this.provider = this.config.get('FILE_STORAGE_PROVIDER') || 'local';
    this.localUploadDir = this.config.get('UPLOAD_DIR') || './uploads';

    if (this.provider === 'cloudinary') {
      this.initCloudinary();
    } else {
      this.ensureUploadDir();
    }
  }

  private initCloudinary() {
    const cloudName = this.config.get('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.config.get('CLOUDINARY_API_KEY');
    const apiSecret = this.config.get('CLOUDINARY_API_SECRET');

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error('Cloudinary credentials not fully configured');
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
  }

  private ensureUploadDir() {
    if (!fs.existsSync(this.localUploadDir)) {
      fs.mkdirSync(this.localUploadDir, { recursive: true });
    }
    const categories = ['patient-documents', 'claim-documents', 'profile-images', 'general'];
    categories.forEach(cat => {
      const catDir = path.join(this.localUploadDir, cat);
      if (!fs.existsSync(catDir)) {
        fs.mkdirSync(catDir, { recursive: true });
      }
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    category: string = 'general',
    clinicId: string,
  ): Promise<FileUploadResult> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const allowedCategories = ['patient-documents', 'claim-documents', 'profile-images', 'general'];
    if (!allowedCategories.includes(category)) {
      throw new BadRequestException(`Invalid category. Allowed: ${allowedCategories.join(', ')}`);
    }

    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.csv'];
    if (!allowedExts.includes(ext)) {
      throw new BadRequestException(`File type not allowed. Allowed: ${allowedExts.join(', ')}`);
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
    }

    const fileName = `${uuidv4()}${ext}`;
    const fullPath = `${category}/${fileName}`;

    if (this.provider === 'cloudinary') {
      return this.uploadToCloudinary(file, fullPath, fileName, file.originalname, file.mimetype, file.size);
    } else {
      return this.uploadLocally(file, fullPath, fileName, file.originalname, file.mimetype, file.size);
    }
  }

  private async uploadToCloudinary(
    file: Express.Multer.File,
    fullPath: string,
    fileName: string,
    originalName: string,
    mimeType: string,
    size: number,
  ): Promise<FileUploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: fullPath.replace(/\.[^/.]+$/, ''), // Remove extension for public_id
          resource_type: 'auto',
          folder: 'vemtap',
          metadata: {
            originalName,
            uploadedAt: new Date().toISOString(),
          },
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (!result || !result.secure_url) {
            reject(new Error('Cloudinary upload failed: no secure_url returned'));
          } else {
            resolve({
              path: fullPath,
              url: result.secure_url,
              fileName: originalName,
              fileSize: size,
              mimeType,
            });
          }
        }
      );
      uploadStream.end(file.buffer);
    });
  }

  private async uploadLocally(
    file: Express.Multer.File,
    fullPath: string,
    fileName: string,
    originalName: string,
    mimeType: string,
    size: number,
  ): Promise<FileUploadResult> {
    const categoryDir = path.join(this.localUploadDir, path.dirname(fullPath));
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }

    const filePath = path.join(this.localUploadDir, fullPath);
    fs.writeFileSync(filePath, file.buffer);

    return {
      path: fullPath,
      url: `/api/file-upload/download/${fullPath}`,
      fileName: originalName,
      fileSize: size,
      mimeType,
    };
  }

  async deleteFile(relativePath: string): Promise<void> {
    if (this.provider === 'cloudinary') {
      const publicId = relativePath.replace(/\.[^/.]+$/, '');
      await cloudinary.uploader.destroy(`vemtap/${publicId}`);
    } else {
      const filePath = path.join(this.localUploadDir, relativePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }

  async getPresignedUploadUrl(relativePath: string, mimeType: string, expiresIn: number = 3600): Promise<string> {
    if (this.provider !== 'cloudinary') {
      throw new BadRequestException('Presigned URLs only available with Cloudinary provider');
    }

    // Cloudinary doesn't use presigned URLs in the same way as S3
    // Instead, we can use unsigned upload with upload presets
    // For now, throw an error to indicate this needs Cloudinary-specific implementation
    throw new BadRequestException('Presigned upload URLs require Cloudinary upload preset configuration');
  }

  async getPresignedDownloadUrl(relativePath: string, expiresIn: number = 3600): Promise<string> {
    if (this.provider !== 'cloudinary') {
      throw new BadRequestException('Presigned URLs only available with Cloudinary provider');
    }

    const publicId = relativePath.replace(/\.[^/.]+$/, '');
    const result = await cloudinary.url(`vemtap/${publicId}`, {
      sign_url: true,
      type: 'upload',
      expires_at: Math.floor(Date.now() / 1000) + expiresIn,
    });

    return result;
  }

  getFileInfo(relativePath: string): { exists: boolean; size: number } {
    if (this.provider === 'cloudinary') {
      // For Cloudinary, we'd need an API call to check
      return { exists: true, size: 0 };
    } else {
      const filePath = path.join(this.localUploadDir, relativePath);
      if (!fs.existsSync(filePath)) {
        return { exists: false, size: 0 };
      }
      const stats = fs.statSync(filePath);
      return { exists: true, size: stats.size };
    }
  }
}

// Need to import missing modules
import * as fs from 'fs';
import * as path from 'path';