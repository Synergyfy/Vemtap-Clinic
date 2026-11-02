import { mapCloudinaryResult } from './file-upload.service';

describe('mapCloudinaryResult', () => {
  it('maps a Cloudinary response into a persisted upload record', () => {
    const result = {
      public_id: 'clinic-docs/patient-123/receipt',
      secure_url: 'https://res.cloudinary.com/demo/image/upload/clinic-docs/patient-123/receipt.pdf',
      format: 'pdf',
      resource_type: 'image',
      bytes: 2048,
      width: 1200,
      height: 800,
    };

    const record = mapCloudinaryResult({
      originalName: 'receipt.pdf',
      mimeType: 'application/pdf',
      fileSize: 2048,
      category: 'patient_document',
      clinicId: 'clinic-123',
      patientId: 'patient-123',
      uploadedById: 'user-123',
    }, result as any);

    expect(record.originalName).toBe('receipt.pdf');
    expect(record.storedName).toBe('clinic-docs/patient-123/receipt');
    expect(record.url).toBe('https://res.cloudinary.com/demo/image/upload/clinic-docs/patient-123/receipt.pdf');
    expect(record.mimeType).toBe('application/pdf');
    expect(record.fileSize).toBe(2048);
    expect(record.metadata).toMatchObject({
      cloudinaryPublicId: 'clinic-docs/patient-123/receipt',
      resourceType: 'image',
      format: 'pdf',
    });
  });
});
