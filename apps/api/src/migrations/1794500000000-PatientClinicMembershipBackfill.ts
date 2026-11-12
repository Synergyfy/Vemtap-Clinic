import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Backfill clinic memberships for patients that clinics created before
 * memberships were written on create. Without a membership row the patient
 * portal dashboard has no clinic to show, even though the patient belongs to
 * one. `isPrimary` is only set when the patient has no membership yet.
 */
export class PatientClinicMembershipBackfill1794500000000 implements MigrationInterface {
  name = 'PatientClinicMembershipBackfill1794500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
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
  }

  public async down(): Promise<void> {
    // Data backfill only: there is no reliable way to tell these rows apart from
    // memberships created at runtime, so nothing is removed.
  }
}
