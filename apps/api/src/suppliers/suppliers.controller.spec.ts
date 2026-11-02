import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { SuppliersController } from './suppliers.controller';

describe('SuppliersController role access', () => {
  it('allows pharmacists to create and manage supplier records', () => {
    const createRoles = Reflect.getMetadata(ROLES_KEY, SuppliersController.prototype.createSupplier);
    const updateRoles = Reflect.getMetadata(ROLES_KEY, SuppliersController.prototype.updateSupplier);
    const orderRoles = Reflect.getMetadata(ROLES_KEY, SuppliersController.prototype.createOrder);

    expect(createRoles).toContain(UserRole.PHARMACIST);
    expect(updateRoles).toContain(UserRole.PHARMACIST);
    expect(orderRoles).toContain(UserRole.PHARMACIST);
  });
});
