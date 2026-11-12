import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Repair the two ways a patient can end up without a clinic on the portal
 * dashboard:
 *
 * 1. A patient row that belongs to a clinic but has no membership row (rows
 *    written before memberships were created on patient create). This mirrors
 *    `PatientClinicMembershipBackfill1794500000000` so the repair is complete
 *    even on databases where that migration was skipped.
 *
 * 2. A portal account that already existed when clinic staff registered the
 *    same person again, leaving two rows with the same email: the staff row
 *    carries the clinic, the portal row (the one the patient logs into) does
 *    not. Older builds created that second row instead of adopting the portal
 *    account; `PatientsService.create` now adopts it. Email is the authoritative
 *    identity in the app, so the clinic is linked onto the portal row here.
 *
 * Memberships are additive: existing rows are never moved or deleted, so the
 * clinic keeps its own clinical record while the patient sees every clinic they
 * belong to.
 */
export class PatientClinicMembershipReconcile1794600000000 implements MigrationInterface {
  name = 'PatientClinicMembershipReconcile1794600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Patients attached to a clinic but missing their membership row.
    await queryRunner.query(`
      INSERT INTO "patient_clinic_memberships"
        ("id", "patientId", "clinicId", "branchId", "isPrimary", "isActive", "createdAt", "updatedAt")
      SELECT
        uuid_generate_v4(),
        p."id",
        p."clinicId",
        CASE WHEN b."id" IS NULL THEN NULL ELSE p."branchId" END,
        NOT EXISTS (
          SELECT 1 FROM "patient_clinic_memberships" existing
          WHERE existing."patientId" = p."id"
        ),
        true,
        now(),
        now()
      FROM "patients" p
      LEFT JOIN "branches" b ON b."id" = p."branchId"
      WHERE p."clinicId" IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM "patient_clinic_memberships" m
          WHERE m."patientId" = p."id" AND m."clinicId" = p."clinicId"
        );
    `);

    // 2. Portal accounts whose clinic lives on a duplicate row with the same email.
    await queryRunner.query(`
      INSERT INTO "patient_clinic_memberships"
        ("id", "patientId", "clinicId", "branchId", "isPrimary", "isActive", "createdAt", "updatedAt")
      SELECT DISTINCT ON (portal."id", source."clinicId")
        uuid_generate_v4(),
        portal."id",
        source."clinicId",
        source."branchId",
        NOT EXISTS (
          SELECT 1 FROM "patient_clinic_memberships" existing
          WHERE existing."patientId" = portal."id"
        ),
        true,
        now(),
        now()
      FROM "patients" portal
      INNER JOIN "patients" source
        ON lower(trim(source."email")) = lower(trim(portal."email"))
       AND source."id" <> portal."id"
      WHERE portal."portalAccessEnabled" = true
        AND portal."clinicId" IS NULL
        AND portal."email" IS NOT NULL
        AND trim(portal."email") <> ''
        AND source."clinicId" IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM "patient_clinic_memberships" existing
          WHERE existing."patientId" = portal."id"
            AND existing."clinicId" = source."clinicId"
        )
      ORDER BY portal."id", source."clinicId", source."createdAt" ASC;
    `);

    // Exactly one primary membership per patient so portal login can resolve it.
    await queryRunner.query(`
      UPDATE "patient_clinic_memberships" m
      SET "isPrimary" = true
      WHERE m."isPrimary" = false
        AND NOT EXISTS (
          SELECT 1 FROM "patient_clinic_memberships" other
          WHERE other."patientId" = m."patientId" AND other."isPrimary" = true
        );
    `);

    // Mirror the primary clinic onto the patient row (profile/login payload).
    await queryRunner.query(`
      UPDATE "patients" p
      SET "clinicId" = m."clinicId",
          "branchId" = COALESCE(p."branchId", m."branchId")
      FROM "patient_clinic_memberships" m
      WHERE m."patientId" = p."id"
        AND m."isPrimary" = true
        AND p."clinicId" IS NULL;
    `);
  }

  public async down(): Promise<void> {
    // Data repair only: runtime-written memberships are indistinguishable from
    // the rows created here, so nothing is removed on rollback.
  }
}
