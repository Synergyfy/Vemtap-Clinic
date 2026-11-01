import { StaffService } from './staff.service';
import { UserRole } from '../entities/user.entity';
import { StaffRole } from '../entities/staff.entity';

describe('StaffService.create', () => {
  it('creates a matching user account so staff can log in from the regular login page', async () => {
    const staffRepository = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((entity) => ({ ...entity, id: 'staff-123' })),
      save: jest.fn(async (entity) => entity),
    };

    const userRepository = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((entity) => ({ ...entity, id: 'user-123' })),
      save: jest.fn(async (entity) => entity),
    };

    const service = new StaffService(staffRepository as any, userRepository as any);

    await service.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@vemtap.com',
      phone: '+1234567890',
      role: StaffRole.DOCTOR,
      clinicId: 'clinic-123',
      branchId: 'branch-123',
    } as any);

    expect(userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@vemtap.com',
        role: UserRole.DOCTOR,
        clinicId: 'clinic-123',
        isActive: true,
      }),
    );
  });
});
