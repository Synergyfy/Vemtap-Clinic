import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import { FileCategory } from '../../entities/file-upload.entity';

export type StorageProvider = 'local' | 'cloudinary';

export interface FileUploadResult {
  provider: StorageProvider;
  // Cloudinary public_id, or the path relative to the upload dir for local storage
  storageKey: string;
  // Cloudinary resource type ('image' | 'raw'); unused for local storage
  resourceType?: string;
  // File extension without the dot, used to build download URLs
  format: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.csv'];
// Cloudinary can only store these as 'image' assets; everything else is stored as 'raw'
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf'];
const CLOUDINARY_ROOT_FOLDER = 'vemtap';

@Injectable()
export class FileStorageService {
  private provider: StorageProvider;
  private localUploadDir: string;

  constructor(private config: ConfigService) {
    this.provider = this.config.get<StorageProvider>('FILE_STORAGE_PROVIDER') || 'local';
    this.localUploadDir = this.config.get('UPLOAD_DIR') || './uploads';

    if (this.provider === 'cloudinary') {
      this.initCloudinary();
    } else {
      this.ensureUploadDir();
    }
  }

  getProvider(): StorageProvider {
    return this.provider;
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
      secure: true,
    });
  }

  private ensureUploadDir() {
    Object.values(FileCategory).forEach(cat => {
      fs.mkdirSync(path.join(this.localUploadDir, cat), { recursive: true });
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    category: FileCategory = FileCategory.GENERAL,
    clinicId: string,
  ): Promise<FileUploadResult> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!Object.values(FileCategory).includes(category)) {
      throw new BadRequestException(`Invalid category. Allowed: ${Object.values(FileCategory).join(', ')}`);
    }

    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      throw new BadRequestException(`File type not allowed. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`);
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      throw new BadRequestException(`File size exceeds ${MAX_UPLOAD_SIZE / 1024 / 1024}MB limit`);
    }

    if (this.provider === 'cloudinary') {
      return this.uploadToCloudinary(file, ext, category, clinicId);
    }
    return this.uploadLocally(file, ext, category);
  }

  private async uploadToCloudinary(
    file: Express.Multer.File,
    ext: string,
    category: FileCategory,
    clinicId: string,
  ): Promise<FileUploadResult> {
    const isImage = IMAGE_EXTENSIONS.includes(ext);
    const id = uuidv4();
    // Raw assets keep their extension in the public_id; image assets get it from `format`
    const publicId = `${CLOUDINARY_ROOT_FOLDER}/${clinicId}/${category}/${isImage ? id : id + ext}`;

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
          resource_type: isImage ? 'image' : 'raw',
          // Authenticated assets cannot be fetched without a signed URL
          type: 'authenticated',
          overwrite: false,
        },
        (error, res) => {
          if (error) {
            reject(new BadRequestException(`Cloudinary upload failed: ${error.message}`));
          } else if (!res) {
            reject(new BadRequestException('Cloudinary upload failed: empty response'));
          } else {
            resolve(res);
          }
        },
      );
      uploadStream.end(file.buffer);
    });

    return {
      provider: 'cloudinary',
      storageKey: result.public_id,
      resourceType: result.resource_type,
      format: result.format || ext.slice(1),
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
    };
  }

  private async uploadLocally(
    file: Express.Multer.File,
    ext: string,
    category: FileCategory,
  ): Promise<FileUploadResult> {
    const relativePath = `${category}/${uuidv4()}${ext}`;
    const filePath = path.join(this.localUploadDir, relativePath);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, file.buffer);

    return {
      provider: 'local',
      storageKey: relativePath,
      format: ext.slice(1),
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
    };
  }

  async deleteFile(storageKey: string, resourceType: string = 'image'): Promise<void> {
    if (this.provider === 'cloudinary') {
      await cloudinary.uploader.destroy(storageKey, {
        resource_type: resourceType,
        type: 'authenticated',
        invalidate: true,
      });
    } else {
      const filePath = this.resolveLocalPath(storageKey);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }

  /**
   * Time-limited download URL for a Cloudinary asset.
   */
  getSignedDownloadUrl(
    storageKey: string,
    format: string,
    resourceType: string = 'image',
    expiresIn: number = 300,
  ): { url: string; expiresAt: Date } {
    if (this.provider !== 'cloudinary') {
      throw new BadRequestException('Signed URLs are only available with the Cloudinary provider');
    }

    const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;
    // Raw assets already carry the extension in their public_id
    const url = cloudinary.utils.private_download_url(storageKey, resourceType === 'raw' ? '' : format, {
      resource_type: resourceType,
      type: 'authenticated',
      expires_at: expiresAt,
      attachment: true,
    });

    return { url, expiresAt: new Date(expiresAt * 1000) };
  }

  /**
   * Absolute path of a locally stored file, guarded against path traversal.
   */
  resolveLocalPath(storageKey: string): string {
    const root = path.resolve(this.localUploadDir);
    const filePath = path.resolve(root, storageKey);
    if (!filePath.startsWith(root + path.sep)) {
      throw new BadRequestException('Invalid file path');
    }
    return filePath;
  }
}
