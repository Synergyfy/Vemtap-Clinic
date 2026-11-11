import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Persist guardian family invitations and allow "profile-first" dependents:
 * the guardian can add a family member (and switch to that profile) before the
 * emailed activation link sets a password and enables the dependent's own login.
 */
export class FamilyDependentProfiles1794200000000 implements MigrationInterface {
  name = 'FamilyDependentProfiles1794200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "patient_family_invitations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "guardianId" uuid NOT NULL,
        "clinicId" uuid,
        "patientId" uuid,
        "fullName" character varying(200) NOT NULL,
        "email" character varying(255) NOT NULL,
        "relationship" character varying(50) NOT NULL,
        "token" character varying NOT NULL,
        "expiresAt" TIMESTAMPTZ NOT NULL,
        "used" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_patient_family_invitations" PRIMARY KEY ("id")
      );
    `);

    await queryRunner.query(`
      ALTER TABLE "patient_family_invitations"
      ADD COLUMN IF NOT EXISTS "patientId" uuid;
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_patient_family_invitations_token"
      ON "patient_family_invitations" ("token");
    `);

    // A dependent profile can exist before its date of birth / phone are known.
    await queryRunner.query(`ALTER TABLE "patients" ALTER COLUMN "dateOfBirth" DROP NOT NULL;`);
    await queryRunner.query(`ALTER TABLE "patients" ALTER COLUMN "phone" DROP NOT NULL;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Existing dependent rows may legitimately have no phone/date of birth, so
    // these columns are left nullable when rolling back.
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_patient_family_invitations_token";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "patient_family_invitations";`);
  }
}
