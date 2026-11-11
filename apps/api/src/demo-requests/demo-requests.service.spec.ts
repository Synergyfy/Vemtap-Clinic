import { DemoRequestsService } from './demo-requests.service';
import { NotificationsService } from '../notifications/notifications.service';

describe('DemoRequestsService', () => {
  it('stores a submitted demo request and returns the saved payload', async () => {
    const notifications = {
      notifySuperAdmins: jest.fn().mockResolvedValue([]),
    } as unknown as NotificationsService;
    const service = new DemoRequestsService(notifications);

    const result = await service.create({
      clinicType: 'eye-clinic',
      clinicName: 'BrightSight Eye Clinic',
      branchCount: '2-5',
      preferredDate: '2026-12-01',
      preferredTime: 'morning',
      firstName: 'Ada',
      lastName: 'Okafor',
      email: 'ada@brightsight.example',
      phone: '+2348123456789',
    });

    expect(result.success).toBe(true);
    expect(result.data.email).toBe('ada@brightsight.example');
    expect(service.findAll()).toHaveLength(1);
    expect(notifications.notifySuperAdmins).toHaveBeenCalledTimes(1);
  });
});
