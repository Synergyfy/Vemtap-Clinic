import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { FileUpload, FileCategory } from '../entities/file-upload.entity';
import { CreateFileUploadDto, UpdateFileUploadDto, FileUploadQueryDto } from './dto';

export function mapCloudinaryResult(
  input: {
    originalName: string;
    mimeType: string;
    fileSize: number;
    category: FileCategory | string;
    clinicId: string;
    patientId?: string;
    uploadedById: string;
    relatedEntityId?: string;
    relatedEntityType?: string;
  },
  result: {
    public_id: string;
    secure_url: string;
    resource_type: string;
    format?: string;
    bytes?: number;
  },
) {
  return {
    originalName: input.originalName,
    storedName: result.public_id,
    url: result.secure_url,
    mimeType: input.mimeType,
    fileSize: input.fileSize,
    category: input.category,
    clinicId: input.clinicId,
    patientId: input.patientId,
    uploadedById: input.uploadedById,
    relatedEntityId: input.relatedEntityId,
    relatedEntityType: input.relatedEntityType,
    metadata: {
      cloudinaryPublicId: result.public_id,
      resourceType: result.resource_type,
      format: result.format ?? null,
    },
  };
}

@Injectable()
export class FileUploadService {
  constructor(
    @InjectRepository(FileUpload) private fileRepo: Repository<FileUpload>,
  ) {}

  async create(dto: CreateFileUploadDto, uploadedById: string): Promise<FileUpload> {
    const file = this.fileRepo.create({
      ...dto,
      uploadedById,
    });
    return this.fileRepo.save(file);
  }

  async findAll(query: FileUploadQueryDto): Promise<FileUpload[]> {
    const where: any = {};
    if (query.clinicId) where.clinicId = query.clinicId;
    if (query.patientId) where.patientId = query.patientId;
    if (query.category) where.category = query.category;
    if (query.uploadedById) where.uploadedById = query.uploadedById;
    return this.fileRepo.find({ where, relations: ['patient', 'uploadedBy'], order: { createdAt: 'DESC' } });
  }

  async findById(id: string): Promise<FileUpload> {
    const file = await this.fileRepo.findOne({ where: { id }, relations: ['patient', 'uploadedBy', 'clinic'] });
    if (!file) throw new NotFoundException('File not found');
    return file;
  }

  async update(id: string, dto: UpdateFileUploadDto): Promise<FileUpload> {
    const file = await this.findById(id);
    Object.assign(file, dto);
    return this.fileRepo.save(file);
  }

  async remove(id: string): Promise<void> {
    const file = await this.findById(id);
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