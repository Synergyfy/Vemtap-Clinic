import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddClinicQrCodeColumns1750000000000 implements MigrationInterface {
  name = 'AddClinicQrCodeColumns1750000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "clinics"
        ADD COLUMN IF NOT EXISTS "qrCode" character varying(80),
        ADD COLUMN IF NOT EXISTS "qrUrl" character varying(255);
    `);

    await queryRunner.query(`
      UPDATE "clinics"
      SET "qrCode" = CASE
        WHEN "qrCode" IS NULL OR trim("qrCode") = '' THEN 'VEM-' || UPPER(regexp_replace(CAST("id" AS text), '[^A-Za-z0-9]', '', 'g'))
        ELSE "qrCode"
      END,
      "qrUrl" = CASE
        WHEN "qrUrl" IS NULL OR trim("qrUrl") = '' THEN
          COALESCE(NULLIF(current_setting('app.frontend_url', true), ''), NULLIF(current_setting('FRONTEND_URL', true), ''), 'http://localhost:3000')
          || '/reception/check-in?clinic=' || COALESCE(NULLIF("qrCode", ''), 'VEM-' || UPPER(regexp_replace(CAST("id" AS text), '[^A-Za-z0-9]', '', 'g')))
        ELSE "qrUrl"
      END
      WHERE "qrCode" IS NULL OR "qrUrl" IS NULL OR trim("qrCode") = '' OR trim("qrUrl") = '';
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_clinics_qrCode"
      ON "clinics" ("qrCode")
      WHERE "qrCode" IS NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_clinics_qrCode";`);
    await queryRunner.query(`ALTER TABLE "clinics" DROP COLUMN IF EXISTS "qrUrl";`);
    await queryRunner.query(`ALTER TABLE "clinics" DROP COLUMN IF EXISTS "qrCode";`);
  }
}
