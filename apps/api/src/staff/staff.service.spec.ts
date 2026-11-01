import { StaffService } from './staff.service';
import { UserRole } from '../entities/user.entity';
import { StaffRole } from '../entities/staff.entity';

describe('StaffService', () => {
  it('returns a paginated staff response so the dashboard can render the staff directory', async () => {
    const staffRepository = {
      findAndCount: jest.fn().mockResolvedValue([
        [{ id: 'staff-1', firstName: 'Jane', lastName: 'Smith', email: 'jane@vemtap.com' }],
        1,
      ]),
    };

    const service = new StaffService(staffRepository as any, {} as any);

    const result = await service.findAll({ clinicId: 'clinic-123', page: 1, limit: 10 } as any);

    expect(result).toEqual({
      data: [{ id: 'staff-1', firstName: 'Jane', lastName: 'Smith', email: 'jane@vemtap.com' }],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    });
  });

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

  it('updates the matching auth-user password when a staff member is created for an existing login record', async () => {
    const staffRepository = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((entity) => ({ ...entity, id: 'staff-456' })),
      save: jest.fn(async (entity) => entity),
    };

    const existingUser = {
      id: 'user-456',
      email: 'jane@vemtap.com',
      password: 'old-hash',
      firstName: 'Old',
      lastName: 'Name',
      role: UserRole.RECEPTIONIST,
      clinicId: 'old-clinic',
      isActive: false,
    };

    const userRepository = {
      findOne: jest.fn().mockResolvedValue(existingUser),
      save: jest.fn(async (entity) => entity),
    };

    const service = new StaffService(staffRepository as any, userRepository as any);

    await service.create({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@vemtap.com',
      phone: '+1234567890',
      role: StaffRole.NURSE,
      clinicId: 'clinic-123',
      branchId: 'branch-123',
      password: 'StrongPass123',
    } as any);

    expect(userRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'jane@vemtap.com',
        firstName: 'Jane',
        lastName: 'Smith',
        role: UserRole.NURSE,
        clinicId: 'clinic-123',
        isActive: true,
      }),
    );
    expect(existingUser.password).not.toBe('old-hash');
    expect(existingUser.password).not.toBe('StrongPass123');
  });
});
