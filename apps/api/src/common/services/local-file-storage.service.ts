import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LocalFileStorageService {
  private readonly uploadDir: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    this.ensureUploadDir();
  }

  private ensureUploadDir() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
    const categories = ['patient-documents', 'claim-documents', 'profile-images', 'general'];
    categories.forEach(cat => {
      const catDir = path.join(this.uploadDir, cat);
      if (!fs.existsSync(catDir)) {
        fs.mkdirSync(catDir, { recursive: true });
      }
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    category: string = 'general',
    clinicId: string,
  ): Promise<{ path: string; url: string; fileName: string; fileSize: number }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const allowedCategories = ['patient-documents', 'claim-documents', 'profile-images', 'general'];
    if (!allowedCategories.includes(category)) {
      throw new BadRequestException(`Invalid category. Allowed: ${allowedCategories.join(', ')}`);
    }

    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt'];
    if (!allowedExts.includes(ext)) {
      throw new BadRequestException(`File type not allowed. Allowed: ${allowedExts.join(', ')}`);
    }

    const fileName = `${uuidv4()}${ext}`;
    const categoryDir = path.join(this.uploadDir, category);
    const filePath = path.join(categoryDir, fileName);

    fs.writeFileSync(filePath, file.buffer);

    const stats = fs.statSync(filePath);
    const relativePath = path.join(category, fileName);

    return {
      path: relativePath,
      url: `/api/file-upload/download/${relativePath}`,
      fileName: file.originalname,
      fileSize: stats.size,
    };
  }

  async downloadFile(relativePath: string): Promise<{ buffer: Buffer; fileName: string }> {
    const filePath = path.join(this.uploadDir, relativePath);
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }
    const buffer = fs.readFileSync(filePath);
    const fileName = path.basename(relativePath);
    return { buffer, fileName };
  }

  async deleteFile(relativePath: string): Promise<void> {
    const filePath = path.join(this.uploadDir, relativePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  getFileInfo(relativePath: string): { exists: boolean; size: number } {
    const filePath = path.join(this.uploadDir, relativePath);
    if (!fs.existsSync(filePath)) {
      return { exists: false, size: 0 };
    }
    const stats = fs.statSync(filePath);
    return { exists: true, size: stats.size };
  }
}