import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Persist settings end to end:
 * - `users.phone` lets staff update a contact number from Settings.
 * - `user_settings` stores per-user preferences (notifications, display,
 *   regional, session, etc.).
 * - `app_settings` stores platform-wide configuration for the super admin console.
 */
export class SettingsPersistence1794300000000 implements MigrationInterface {
  name = 'SettingsPersistence1794300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "phone" character varying(30);
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_settings" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "key" character varying(100) NOT NULL,
        "value" text NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_settings" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_settings_user_key" UNIQUE ("userId", "key")
      );
    `);

    await queryRunner.query(`
      ALTER TABLE "user_settings"
      DROP CONSTRAINT IF EXISTS "FK_user_settings_userId";
    `);

    await queryRunner.query(`
      ALTER TABLE "user_settings"
      ADD CONSTRAINT "FK_user_settings_userId"
      FOREIGN KEY ("userId") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "app_settings" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "key" character varying(100) NOT NULL,
        "value" text NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_app_settings" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_app_settings_key" UNIQUE ("key")
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "app_settings";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_settings";`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "phone";`);
  }
}
