import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileUploadService } from './file-upload.service';
import { CreateFileUploadDto, UpdateFileUploadDto, FileUploadQueryDto } from './dto';
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

  @Post()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST, UserRole.NURSE)
  @ApiOperation({ summary: 'Create file upload record' })
  create(@Body() dto: CreateFileUploadDto, @CurrentUser() user: any) {
    return this.fileUploadService.create(dto, user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'List file uploads' })
  findAll(@Query() query: FileUploadQueryDto) {
    return this.fileUploadService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get file upload statistics' })
  getStats(@Query('clinicId') clinicId: string) {
    return this.fileUploadService.getStats(clinicId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file upload by ID' })
  findOne(@Param('id') id: string) {
    return this.fileUploadService.findById(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update file upload record' })
  update(@Param('id') id: string, @Body() dto: UpdateFileUploadDto) {
    return this.fileUploadService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete file upload record' })
  remove(@Param('id') id: string) {
    return this.fileUploadService.remove(id);
  }
}