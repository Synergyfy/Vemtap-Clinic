import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * HMO plans expose a single `coveragePercentage` value in the admin console
 * (alongside the per-service coverage columns), so persist it instead of
 * deriving it on the client.
 */
export class HmoPlanCoveragePercentage1794400000000 implements MigrationInterface {
  name = 'HmoPlanCoveragePercentage1794400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "hmo_plans"
      ADD COLUMN IF NOT EXISTS "coveragePercentage" numeric(5,2) NOT NULL DEFAULT '100';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "hmo_plans" DROP COLUMN IF EXISTS "coveragePercentage";
    `);
  }
}
