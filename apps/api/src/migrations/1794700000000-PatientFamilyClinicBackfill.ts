import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Family dependents added from the patient portal copy the guardian's clinic at
 * the moment they are created. A guardian who used the portal before their first
 * clinic visit had no clinic then, so those dependents were saved with
 * `clinicId = NULL` and never appeared in the staff patient registry.
 *
 * `PatientsService.create` now attaches dependents when the guardian is adopted,
 * and reuses an existing dependent row instead of creating a duplicate. This
 * migration repairs the rows that were already written.
 */
export class PatientFamilyClinicBackfill1794700000000 implements MigrationInterface {
  name = 'PatientFamilyClinicBackfill1794700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Give clinic-less dependents their guardian's clinic/branch. Dependents
    //    already attached to a different clinic are left untouched.
    await queryRunner.query(`
      UPDATE "patients" dependent
      SET "clinicId" = guardian."clinicId",
          "branchId" = COALESCE(dependent."branchId", guardian."branchId")
      FROM "patients" guardian
      WHERE dependent."guardianId" = guardian."id"
        AND dependent."clinicId" IS NULL
        AND guardian."clinicId" IS NOT NULL;
    `);

    // 2. Membership rows so the portal shows the clinic for every family profile.
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
      WHERE p."guardianId" IS NOT NULL
        AND p."clinicId" IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM "patient_clinic_memberships" m
          WHERE m."patientId" = p."id" AND m."clinicId" = p."clinicId"
        );
    `);

    // Exactly one primary membership per patient, as the portal expects.
    await queryRunner.query(`
      UPDATE "patient_clinic_memberships" m
      SET "isPrimary" = true
      WHERE m."isPrimary" = false
        AND NOT EXISTS (
          SELECT 1 FROM "patient_clinic_memberships" other
          WHERE other."patientId" = m."patientId" AND other."isPrimary" = true
        );
    `);
  }

  public async down(): Promise<void> {
    // Data repair only: the clinic on a dependent is indistinguishable from one
    // that was inherited at creation, so nothing is reverted on rollback.
  }
}
