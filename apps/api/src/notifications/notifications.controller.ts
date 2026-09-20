import { Controller, Get, Put, Delete, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST, UserRole.PHARMACIST, UserRole.OPTOMETRIST, UserRole.CASHIER)
  @ApiOperation({ summary: 'Get my notifications' })
  getMyNotifications(@Request() req: any, @Query('unreadOnly') unreadOnly?: boolean) {
    return this.notificationsService.findByUser(req.user.sub, unreadOnly === true);
  }

  @Get('unread-count')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST, UserRole.PHARMACIST, UserRole.OPTOMETRIST, UserRole.CASHIER)
  @ApiOperation({ summary: 'Get unread notification count' })
  getUnreadCount(@Request() req: any) {
    return this.notificationsService.getUnreadCount(req.user.sub);
  }

  @Put('read-all')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST, UserRole.PHARMACIST, UserRole.OPTOMETRIST, UserRole.CASHIER)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllAsRead(@Request() req: any) {
    return this.notificationsService.markAllAsRead(req.user.sub);
  }

  @Put(':id/read')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST, UserRole.PHARMACIST, UserRole.OPTOMETRIST, UserRole.CASHIER)
  @ApiOperation({ summary: 'Mark notification as read' })
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST, UserRole.PHARMACIST, UserRole.OPTOMETRIST, UserRole.CASHIER)
  @ApiOperation({ summary: 'Delete notification' })
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(id);
  }
}
