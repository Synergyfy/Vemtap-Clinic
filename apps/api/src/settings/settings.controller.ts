import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { SettingsService } from './settings.service';
import { SetSettingDto, SettingQueryDto } from './dto';

@ApiTags('Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly service: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'List all settings' })
  findAll(@Query() query: SettingQueryDto) {
    return this.service.findAll(query);
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all settings as key-value map' })
  getAll(@Query('clinicId') clinicId: string) {
    return this.service.getAll(clinicId);
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get settings by category' })
  getByCategory(@Param('category') category: string, @Query('clinicId') clinicId: string) {
    return this.service.getByCategory(clinicId, category);
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get a setting by key' })
  get(@Param('key') key: string, @Query('clinicId') clinicId: string) {
    return this.service.get(clinicId, key);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Set a setting' })
  set(@Body() dto: SetSettingDto, @Query('clinicId') clinicId: string) {
    return this.service.set(clinicId, dto);
  }

  @Post('bulk')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Bulk set settings' })
  bulkSet(@Body() body: { settings: SetSettingDto[] }, @Query('clinicId') clinicId: string) {
    return this.service.bulkSet(clinicId, body.settings);
  }

  @Delete(':key')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a setting' })
  remove(@Param('key') key: string, @Query('clinicId') clinicId: string) {
    return this.service.remove(clinicId, key);
  }
}
