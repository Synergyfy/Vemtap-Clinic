import { SettingsService } from './settings.service';

const createRepo = () => ({
  find: jest.fn().mockResolvedValue([]),
  findOne: jest.fn().mockResolvedValue(null),
  create: jest.fn((entity) => entity),
  save: jest.fn(async (entity) => entity),
  delete: jest.fn().mockResolvedValue(undefined),
});

describe('SettingsService', () => {
  let clinicRepo: ReturnType<typeof createRepo>;
  let userRepo: ReturnType<typeof createRepo>;
  let appRepo: ReturnType<typeof createRepo>;
  let service: SettingsService;

  beforeEach(() => {
    clinicRepo = createRepo();
    userRepo = createRepo();
    appRepo = createRepo();
    service = new SettingsService(clinicRepo as any, userRepo as any, appRepo as any);
  });

  describe('clinic settings', () => {
    it('returns a key-value map for a clinic', async () => {
      clinicRepo.find.mockResolvedValue([
        { key: 'clinic_name', value: 'Vemtap' },
        { key: 'currency', value: 'NGN' },
      ]);

      await expect(service.getAll('clinic-a')).resolves.toEqual({
        clinic_name: 'Vemtap',
        currency: 'NGN',
      });
      expect(clinicRepo.find).toHaveBeenCalledWith({ where: { clinicId: 'clinic-a' } });
    });

    it('updates an existing clinic setting', async () => {
      const existing = { clinicId: 'clinic-a', key: 'currency', value: 'USD', category: 'profile' };
      clinicRepo.findOne.mockResolvedValue(existing);

      await service.set('clinic-a', { key: 'currency', value: 'NGN' });

      expect(clinicRepo.save).toHaveBeenCalledWith(expect.objectContaining({ value: 'NGN' }));
      expect(clinicRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('personal settings', () => {
    it('creates a new per-user setting', async () => {
      await service.setMine('user-1', { key: 'nurse.notifications', value: '{"vitals":true}' });

      expect(userRepo.create).toHaveBeenCalledWith({
        userId: 'user-1',
        key: 'nurse.notifications',
        value: '{"vitals":true}',
      });
    });

    it('bulk saves personal settings one key at a time', async () => {
      await service.bulkSetMine('user-1', [
        { key: 'a', value: '1' },
        { key: 'b', value: '2' },
      ]);

      expect(userRepo.save).toHaveBeenCalledTimes(2);
      expect(userRepo.create).toHaveBeenCalledWith({ userId: 'user-1', key: 'a', value: '1' });
      expect(userRepo.create).toHaveBeenCalledWith({ userId: 'user-1', key: 'b', value: '2' });
    });

    it('deletes only the current user setting', async () => {
      await service.removeMine('user-1', 'a');
      expect(userRepo.delete).toHaveBeenCalledWith({ userId: 'user-1', key: 'a' });
    });
  });

  describe('platform settings', () => {
    it('returns platform settings as a map', async () => {
      appRepo.find.mockResolvedValue([{ key: 'features', value: '{"telemedicine":true}' }]);

      await expect(service.getApp()).resolves.toEqual({ features: '{"telemedicine":true}' });
    });

    it('updates an existing platform setting', async () => {
      const existing = { key: 'features', value: '{}' };
      appRepo.findOne.mockResolvedValue(existing);

      await service.setApp({ key: 'features', value: '{"telemedicine":true}' });

      expect(appRepo.save).toHaveBeenCalledWith(expect.objectContaining({ value: '{"telemedicine":true}' }));
    });
  });
});
