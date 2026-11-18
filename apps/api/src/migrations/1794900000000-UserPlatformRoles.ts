import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * The initial schema only created the clinic staff roles. `super_admin`
 * (Vemtap platform owner) and `clinic_admin` exist on `UserRole` and must be
 * storable before such accounts can be created in a migrated database.
 */
export class UserPlatformRoles1794900000000 implements MigrationInterface {
  name = 'UserPlatformRoles1794900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TYPE "public"."users_role_enum" ADD VALUE IF NOT EXISTS 'super_admin'`);
    await queryRunner.query(`ALTER TYPE "public"."users_role_enum" ADD VALUE IF NOT EXISTS 'clinic_admin'`);
  }

  public async down(): Promise<void> {
    // Postgres cannot drop enum values; users holding these roles would block it anyway.
  }
}
