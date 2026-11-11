import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationType } from '../entities/notification.entity';
import { UserRole } from '../entities/user.entity';

const notificationRepo = () => {
  let seq = 0;
  return {
    create: jest.fn((data: any) => ({ ...data })),
    save: jest.fn(async (value: any) => {
      const stamp = (item: any) => ({ ...item, id: `notification-${(seq += 1)}` });
      return Array.isArray(value) ? value.map(stamp) : stamp(value);
    }),
    find: jest.fn(async () => []),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  };
};

const build = () => {
  const notifications = notificationRepo();
  const patients: any = { findOne: jest.fn() };
  const users: any = { find: jest.fn(async () => []), findOne: jest.fn() };
  const staff: any = { findOne: jest.fn() };
  const gateway = {
    emitToPatient: jest.fn(),
    emitNotificationToUser: jest.fn(),
  };

  const service = new NotificationsService(
    notifications as any,
    patients as any,
    users as any,
    staff as any,
    gateway as any,
  );

  return { service, notifications, patients, users, staff, gateway };
};

describe('NotificationsService', () => {
  it('fans a clinic alert out to every active user with the target role', async () => {
    const { service, notifications, users, gateway } = build();
    users.find.mockResolvedValue([{ id: 'user-1' }, { id: 'user-2' }]);

    await service.notifyClinicRoles('clinic-1', [UserRole.RECEPTIONIST], {
      title: 'New appointment',
      message: 'A patient booked an appointment.',
      type: NotificationType.APPOINTMENT,
    });

    expect(users.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ clinicId: 'clinic-1', role: expect.anything(), isActive: true }),
      }),
    );

    const saved = notifications.save.mock.calls[0][0];
    expect(saved).toHaveLength(2);
    expect(saved.map((n: any) => n.userId).sort()).toEqual(['user-1', 'user-2']);
    expect(gateway.emitNotificationToUser).toHaveBeenCalledTimes(2);
    expect(gateway.emitToPatient).not.toHaveBeenCalled();
  });

  it('never creates a notification without matching recipients', async () => {
    const { service, notifications } = build();
    const result = await service.notifyClinicRoles(null, [UserRole.CASHIER], {
      title: 'ignored',
      message: 'ignored',
    });

    expect(result).toEqual([]);
    expect(notifications.save).not.toHaveBeenCalled();
  });

  it('deduplicates recipients and honours the exclusion list', async () => {
    const { service, notifications } = build();

    await service.notifyUserIds(
      ['user-1', 'user-1', 'user-2'],
      'clinic-1',
      { title: 'Hello', message: 'World' },
      ['user-2'],
    );

    const saved = notifications.save.mock.calls[0][0];
    expect(saved).toHaveLength(1);
    expect(saved[0].userId).toBe('user-1');
  });

  it('resolves the user account behind an assigned staff member', async () => {
    const { service, notifications, staff, users } = build();
    staff.findOne.mockResolvedValue({ id: 'staff-1', email: 'Doctor@Clinic.example', clinicId: 'clinic-1' });
    users.findOne.mockResolvedValue({ id: 'user-9' });

    await service.notifyAssignedStaff('staff-1', { title: 'Appointment', message: 'With you soon.' });

    expect(users.findOne).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ clinicId: 'clinic-1' }) }),
    );
    expect(notifications.save).toHaveBeenCalledTimes(1);
  });

  it('skips staff notifications when the staff member has no user account', async () => {
    const { service, notifications, staff, users } = build();
    staff.findOne.mockResolvedValue({ id: 'staff-1', email: 'Contractor@Clinic.example', clinicId: 'clinic-1' });
    users.findOne.mockResolvedValue(null);

    const result = await service.notifyAssignedStaff('staff-1', { title: 'Appointment', message: '...' });

    expect(result).toEqual([]);
    expect(notifications.save).not.toHaveBeenCalled();
  });

  it('only lets the owning user mark a staff notification as read', async () => {
    const { service, notifications } = build();
    notifications.findOne.mockResolvedValue(null);

    await expect(service.markAsRead('notification-1', 'user-1')).rejects.toBeInstanceOf(NotFoundException);
    expect(notifications.save).not.toHaveBeenCalled();
  });

  it('lets a guardian manage notifications across their family group', async () => {
    const { service, notifications, patients } = build();
    notifications.findOne.mockResolvedValue({ id: 'n-1', patientId: 'dependent-1', isRead: false });
    patients.findOne
      .mockResolvedValueOnce({ id: 'guardian-1', guardianId: null })
      .mockResolvedValueOnce({ id: 'dependent-1', guardianId: 'guardian-1' });

    const updated = await service.markPatientNotificationAsRead('n-1', 'guardian-1');

    expect(updated.isRead).toBe(true);
    expect(notifications.save).toHaveBeenCalled();
  });

  it('rejects notifications that belong to another family', async () => {
    const { service, notifications, patients } = build();
    notifications.findOne.mockResolvedValue({ id: 'n-1', patientId: 'someone-else', isRead: false });
    patients.findOne
      .mockResolvedValueOnce({ id: 'guardian-1', guardianId: null })
      .mockResolvedValueOnce({ id: 'someone-else', guardianId: 'another-guardian' });

    await expect(service.markPatientNotificationAsRead('n-1', 'guardian-1')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(notifications.save).not.toHaveBeenCalled();
  });
});
