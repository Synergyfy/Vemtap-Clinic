import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserBranchId1760000000000 implements MigrationInterface {
  name = 'AddUserBranchId1760000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "branchId" uuid;
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      DROP CONSTRAINT IF EXISTS "FK_users_branchId";
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      ADD CONSTRAINT "FK_users_branchId"
      FOREIGN KEY ("branchId") REFERENCES "branches"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      DROP CONSTRAINT IF EXISTS "FK_users_branchId";
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN IF EXISTS "branchId";
    `);
  }
}
