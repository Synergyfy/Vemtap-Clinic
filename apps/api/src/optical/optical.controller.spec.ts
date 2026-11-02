import { Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { CreateOpticalItemDto } from './dto';

class RestrictedController {
  @Roles(UserRole.DOCTOR, UserRole.OPTOMETRIST)
  static restricted() {
    return true;
  }
}

describe('RolesGuard', () => {
  it('allows admin users to bypass role restrictions on protected routes', () => {
    const guard = new RolesGuard(new Reflector());

    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ user: { roles: [UserRole.ADMIN] } }),
      }),
      getHandler: () => RestrictedController.restricted,
      getClass: () => RestrictedController,
    } as any;

    expect(guard.canActivate(context)).toBe(true);
  });
});

describe('CreateOpticalItemDto validation', () => {
  it('accepts reorderLevel and isActive fields required by the optical inventory form', async () => {
    const pipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    });

    const payload = {
      name: 'Ray-Ban Aviator',
      brand: 'Ray-Ban',
      category: 'frame',
      type: 'Full Rim',
      unitPrice: 5000,
      quantityInStock: 10,
      reorderLevel: 5,
      isActive: true,
      clinicId: '11111111-1111-4111-8111-111111111111',
    };

    const result = await pipe.transform(payload, {
      type: 'body',
      metatype: CreateOpticalItemDto,
    } as any);

    expect(result).toMatchObject({
      name: 'Ray-Ban Aviator',
      reorderLevel: 5,
      isActive: true,
      clinicId: '11111111-1111-4111-8111-111111111111',
    });
  });
});
