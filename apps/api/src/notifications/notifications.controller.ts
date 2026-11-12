import { Controller, Get, Put, Delete, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

const isTruthy = (value: unknown) => value === true || value === 'true' || value === '1';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  private isPatient(req: any): boolean {
    return Array.isArray(req.user?.roles) && req.user.roles.includes('patient');
  }

  private selectedPatientId(req: any): string | null {
    const header = req.headers?.['x-patient-id'];
    return Array.isArray(header) ? header[0] : (header ?? null);
  }

  private async resolvePatientId(req: any): Promise<string> {
    return this.notificationsService.resolvePatientScope(req.user.sub, this.selectedPatientId(req));
  }

  @Get()
  @ApiOperation({ summary: 'Get my notifications' })
  async getMyNotifications(@Request() req: any, @Query('unreadOnly') unreadOnly?: string) {
    return this.isPatient(req)
      ? this.notificationsService.findByPatient(await this.resolvePatientId(req), isTruthy(unreadOnly))
      : this.notificationsService.findByUser(req.user.sub, isTruthy(unreadOnly));
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  async getUnreadCount(@Request() req: any) {
    return this.isPatient(req)
      ? this.notificationsService.getPatientUnreadCount(await this.resolvePatientId(req))
      : this.notificationsService.getUnreadCount(req.user.sub);
  }

  @Put('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(@Request() req: any) {
    return this.isPatient(req)
      ? this.notificationsService.markAllPatientNotificationsAsRead(await this.resolvePatientId(req))
      : this.notificationsService.markAllAsRead(req.user.sub);
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  markAsRead(@Param('id') id: string, @Request() req: any) {
    return this.isPatient(req)
      ? this.notificationsService.markPatientNotificationAsRead(id, req.user.sub, this.selectedPatientId(req))
      : this.notificationsService.markAsRead(id, req.user.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.isPatient(req)
      ? this.notificationsService.removePatientNotification(id, req.user.sub, this.selectedPatientId(req))
      : this.notificationsService.remove(id, req.user.sub);
  }
}
