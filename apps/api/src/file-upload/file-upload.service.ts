import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileUpload, FileCategory } from '../entities/file-upload.entity';
import { CreateFileUploadDto, UpdateFileUploadDto, FileUploadQueryDto, UploadFileDto } from './dto';
import { FileStorageService } from '../common/services/file-storage.service';

export type FileDownload =
  | { type: 'redirect'; url: string; expiresAt?: Date }
  | { type: 'local'; filePath: string; fileName: string; mimeType: string };

@Injectable()
export class FileUploadService {
  constructor(
    @InjectRepository(FileUpload) private fileRepo: Repository<FileUpload>,
    private fileStorage: FileStorageService,
  ) {}

  async create(dto: CreateFileUploadDto, uploadedById: string, clinicId: string): Promise<FileUpload> {
    const file = this.fileRepo.create({
      ...dto,
      clinicId,
      uploadedById,
    });
    return this.fileRepo.save(file);
  }

  async upload(
    file: Express.Multer.File,
    dto: UploadFileDto,
    uploadedById: string,
    clinicId: string,
  ): Promise<FileUpload> {
    if (!file) throw new BadRequestException('No file provided');

    const category = dto.category ?? FileCategory.GENERAL;
    const stored = await this.fileStorage.uploadFile(file, category, clinicId);

    try {
      const record = this.fileRepo.create({
        originalName: stored.fileName,
        storedName: stored.storageKey,
        storageProvider: stored.provider,
        resourceType: stored.resourceType,
        format: stored.format,
        mimeType: stored.mimeType,
        fileSize: stored.fileSize,
        category,
        patientId: dto.patientId,
        relatedEntityId: dto.relatedEntityId,
        relatedEntityType: dto.relatedEntityType,
        uploadedById,
        clinicId,
      });
      return await this.fileRepo.save(record);
    } catch (err) {
      // Don't leave orphaned files in storage when the record can't be saved
      await this.fileStorage.deleteFile(stored.storageKey, stored.resourceType).catch(() => undefined);
      throw err;
    }
  }

  async getDownload(id: string, clinicId: string): Promise<FileDownload> {
    const file = await this.findById(id, clinicId);

    if (file.storageProvider === 'cloudinary') {
      const { url, expiresAt } = this.fileStorage.getSignedDownloadUrl(file.storedName, file.format, file.resourceType);
      return { type: 'redirect', url, expiresAt };
    }
    if (file.storageProvider === 'local') {
      return {
        type: 'local',
        filePath: this.fileStorage.resolveLocalPath(file.storedName),
        fileName: file.originalName,
        mimeType: file.mimeType,
      };
    }
    // Records created via POST /file-upload only point at an external URL
    if (file.url) return { type: 'redirect', url: file.url };
    throw new NotFoundException('File has no stored content');
  }

  async findAll(query: FileUploadQueryDto, clinicId: string): Promise<FileUpload[]> {
    const where: any = { clinicId };
    if (query.patientId) where.patientId = query.patientId;
    if (query.category) where.category = query.category;
    if (query.uploadedById) where.uploadedById = query.uploadedById;
    return this.fileRepo.find({ where, relations: ['patient', 'uploadedBy'], order: { createdAt: 'DESC' } });
  }

  async findById(id: string, clinicId: string): Promise<FileUpload> {
    const file = await this.fileRepo.findOne({ where: { id, clinicId }, relations: ['patient', 'uploadedBy', 'clinic'] });
    if (!file) throw new NotFoundException('File not found');
    return file;
  }

  async update(id: string, dto: UpdateFileUploadDto, clinicId: string): Promise<FileUpload> {
    const file = await this.findById(id, clinicId);
    Object.assign(file, dto);
    return this.fileRepo.save(file);
  }

  async remove(id: string, clinicId: string): Promise<void> {
    const file = await this.findById(id, clinicId);
    if (file.storageProvider === 'cloudinary' || file.storageProvider === 'local') {
      await this.fileStorage.deleteFile(file.storedName, file.resourceType);
    }
    await this.fileRepo.remove(file);
  }

  async getStats(clinicId: string) {
    const files = await this.fileRepo.find({ where: { clinicId } });
    const byCategory: Record<string, number> = {};
    let totalSize = 0;
    for (const f of files) {
      byCategory[f.category] = (byCategory[f.category] || 0) + 1;
      totalSize += f.fileSize;
    }
    return { totalFiles: files.length, totalSize, byCategory };
  }
}
