import { DemoRequestsService } from './demo-requests.service';

describe('DemoRequestsService', () => {
  it('stores a submitted demo request and returns the saved payload', () => {
    const service = new DemoRequestsService();

    const result = service.create({
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
  });
});
