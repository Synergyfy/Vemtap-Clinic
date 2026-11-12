import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../entities/user.entity';
import { SettingsService } from './settings.service';
import { resolveClinicScope } from './settings-scope';
import { SetSettingDto, SettingQueryDto } from './dto';

@ApiTags('Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly service: SettingsService) {}

  // ─── Current user's own preferences ────────────────────────────────────────

  @Get('me')
  @ApiOperation({ summary: 'Get the signed-in user\'s personal settings as a key-value map' })
  getMine(@CurrentUser() user: any) {
    return this.service.getMine(this.requireStaffUser(user));
  }

  @Post('me')
  @ApiOperation({ summary: 'Set one of the signed-in user\'s personal settings' })
  setMine(@CurrentUser() user: any, @Body() dto: SetSettingDto) {
    return this.service.setMine(this.requireStaffUser(user), dto);
  }

  @Post('me/bulk')
  @ApiOperation({ summary: 'Bulk set the signed-in user\'s personal settings' })
  bulkSetMine(@CurrentUser() user: any, @Body() body: { settings: SetSettingDto[] }) {
    return this.service.bulkSetMine(this.requireStaffUser(user), body.settings ?? []);
  }

  @Delete('me/:key')
  @ApiOperation({ summary: 'Delete one of the signed-in user\'s personal settings' })
  removeMine(@CurrentUser() user: any, @Param('key') key: string) {
    return this.service.removeMine(this.requireStaffUser(user), key);
  }

  // ─── Platform settings (super admin console) ───────────────────────────────

  @Get('platform')
  @ApiOperation({ summary: 'Get platform-wide settings (super admin only)' })
  getPlatform(@CurrentUser() user: any) {
    this.assertPlatformAdmin(user);
    return this.service.getApp();
  }

  @Post('platform')
  @ApiOperation({ summary: 'Set a platform-wide setting (super admin only)' })
  setPlatform(@CurrentUser() user: any, @Body() dto: SetSettingDto) {
    this.assertPlatformAdmin(user);
    return this.service.setApp(dto);
  }

  @Post('platform/bulk')
  @ApiOperation({ summary: 'Bulk set platform-wide settings (super admin only)' })
  bulkSetPlatform(@CurrentUser() user: any, @Body() body: { settings: SetSettingDto[] }) {
    this.assertPlatformAdmin(user);
    return this.service.bulkSetApp(body.settings ?? []);
  }

  @Delete('platform/:key')
  @ApiOperation({ summary: 'Delete a platform-wide setting (super admin only)' })
  removePlatform(@CurrentUser() user: any, @Param('key') key: string) {
    this.assertPlatformAdmin(user);
    return this.service.removeApp(key);
  }

  // ─── Clinic-scoped settings ────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'List all settings for the current clinic' })
  findAll(@CurrentUser() user: any, @Query() query: SettingQueryDto) {
    const clinicId = resolveClinicScope(user, query.clinicId);
    return this.service.findAll({ ...query, clinicId });
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all settings as key-value map' })
  getAll(@CurrentUser() user: any, @Query('clinicId') clinicId: string) {
    return this.service.getAll(resolveClinicScope(user, clinicId));
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get settings by category' })
  getByCategory(
    @CurrentUser() user: any,
    @Param('category') category: string,
    @Query('clinicId') clinicId: string,
  ) {
    return this.service.getByCategory(resolveClinicScope(user, clinicId), category);
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get a setting by key' })
  get(@CurrentUser() user: any, @Param('key') key: string, @Query('clinicId') clinicId: string) {
    return this.service.get(resolveClinicScope(user, clinicId), key);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Set a setting' })
  set(@CurrentUser() user: any, @Body() dto: SetSettingDto, @Query('clinicId') clinicId: string) {
    return this.service.set(resolveClinicScope(user, clinicId), dto);
  }

  @Post('bulk')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Bulk set settings' })
  bulkSet(
    @CurrentUser() user: any,
    @Body() body: { settings: SetSettingDto[] },
    @Query('clinicId') clinicId: string,
  ) {
    return this.service.bulkSet(resolveClinicScope(user, clinicId), body.settings ?? []);
  }

  @Delete(':key')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a setting' })
  remove(@CurrentUser() user: any, @Param('key') key: string, @Query('clinicId') clinicId: string) {
    return this.service.remove(resolveClinicScope(user, clinicId), key);
  }

  /**
   * Patient-portal tokens also pass `JwtAuthGuard`, but `user_settings` is keyed
   * by staff user id — writing a patient id would violate the foreign key.
   */
  private requireStaffUser(user: any): string {
    if (user?.type === 'patient' || !user?.userId) {
      throw new ForbiddenException('Personal settings are only available to staff accounts.');
    }
    return user.userId;
  }

  private assertPlatformAdmin(user: any) {
    const roles = Array.isArray(user?.roles) ? user.roles.map((role: string) => String(role).toLowerCase()) : [];
    if (!roles.includes('super_admin') && !roles.includes('admin')) {
      throw new ForbiddenException('Only platform administrators can manage platform settings.');
    }
  }
}
