import { Reflector } from '@nestjs/core';
import { SupportTicketsController } from './support-tickets.controller';
import { SupportTicketsService } from './support-tickets.service';
import { UserRole } from '../entities/user.entity';
import { ROLES_KEY } from '../auth/decorators/roles.decorator';

describe('SupportTicketsController', () => {
  it('allows pharmacists to list and create support tickets', () => {
    const controller = new SupportTicketsController(new SupportTicketsService());
    const metadata = Reflect.getMetadata(ROLES_KEY, controller.findAll);
    const createMetadata = Reflect.getMetadata(ROLES_KEY, controller.create);

    expect(metadata).toContain(UserRole.PHARMACIST);
    expect(createMetadata).toContain(UserRole.PHARMACIST);
  });
});
