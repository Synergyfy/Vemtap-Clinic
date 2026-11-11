import { ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Patient } from '../entities/patient.entity';

/**
 * Resolves which patient profile a patient-portal request should act on.
 *
 * Guardians can act on their own profile or on any dependent in their family
 * group; the selected profile arrives from the web client in the
 * `X-Patient-Id` header. Anyone outside the family group gets a 403.
 */
export async function resolvePatientProfileId(
  patientRepo: Repository<Patient>,
  actorId: string,
  requestedId?: string | null,
): Promise<string> {
  const targetId = String(requestedId ?? '').trim();
  if (!targetId || targetId === actorId) {
    return actorId;
  }

  const [actor, target] = await Promise.all([
    patientRepo.findOne({ where: { id: actorId } }),
    patientRepo.findOne({ where: { id: targetId } }),
  ]);

  if (!actor) {
    throw new UnauthorizedException('Patient not found');
  }
  if (!target) {
    throw new NotFoundException('The selected family profile could not be found.');
  }

  const actorGroupId = actor.guardianId ?? actor.id;
  const targetGroupId = target.guardianId ?? target.id;
  if (actorGroupId !== targetGroupId) {
    throw new ForbiddenException('You do not have access to this family profile.');
  }

  return target.id;
}
