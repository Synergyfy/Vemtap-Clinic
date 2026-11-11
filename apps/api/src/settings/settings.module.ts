import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClinicSetting } from '../entities/clinic-setting.entity';
import { UserSetting } from '../entities/user-setting.entity';
import { AppSetting } from '../entities/app-setting.entity';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ClinicSetting, UserSetting, AppSetting])],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
