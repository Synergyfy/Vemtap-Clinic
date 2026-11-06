# VEMTAP EYE CLINIC PLATFORM

## Complete Platform Architecture, Account Management, Registration, Onboarding & Patient Access

## 1. Introduction: What exactly are we building?

We are not simply building a clinic management dashboard.

We are building a multi-clinic healthcare management ecosystem powered by VEMTAP, where VEMTAP controls the overall platform, individual clinics manage their own operations, healthcare professionals attend to patients, and patients have a personal account they can use across different clinics operating on VEMTAP.

For this first version, our specialty is eye care. We will use Flourish iClinic as the example clinic throughout this documentation.

The platform should accommodate:

- One VEMTAP platform
- Multiple independent eye clinics
- Multiple branches under each clinic
- Multiple staff members under each clinic
- Multiple HMOs and different HMO agreements
- Thousands of patients
- Patients who visit more than one VEMTAP-powered clinic
- Patients who register themselves
- Patients who are registered by clinic staff
- Patients who use QR codes to check in
- Patients who want to access their medical records, appointments, prescriptions and optical orders

## 2. Fundamental architectural decision

I recommend that we build VEMTAP around one central patient identity with separate clinic relationships and securely managed medical records.

This is important.

Imagine a patient visits Flourish iClinic today and another eye clinic tomorrow. We should not force that patient to create two completely different VEMTAP accounts.

Instead:

1. The patient has one VEMTAP patient account.
2. Flourish iClinic has its own relationship with that patient.
3. The second clinic establishes its own relationship with the same patient.
4. Each clinic maintains its own consultations, prescriptions, bills, appointments and operational records.
5. The patient can access their records from both clinics through one patient account.
6. Medical records are only shared between clinics when the patient authorizes the sharing, or when a properly governed emergency access process applies.

This preserves the patient's continuity of care without allowing one clinic to automatically access another clinic's confidential records.

This patient-centered, permission-based approach also supports the earlier VEMTAP vision of longitudinal patient records with clear doctor and facility attribution.

## 3. Core platform model

### 3.1 Patient identity model

The patient record should be modeled as:

- One VEMTAP patient identity
- Many clinic relationships
- Many medical encounters, consultations, appointments and orders
- Granular access permissions and audit logs

This means VEMTAP is not a monolithic clinic record database. It is a patient-first platform that connects different provider organizations while preserving confidentiality and governance.

### 3.2 Clinic relationship model

Each clinic has:

- a clinic profile
- one or more branches
- a staff roster
- assigned roles and permissions
- a patient list with clinic-specific relationships
- its own operational, billing, HMO and clinical data

A patient may be:

- registered by a clinic
- self-registered via an app or portal
- linked to multiple clinics
- able to view records across those clinics only where access is permitted

### 3.3 Data ownership principle

The following rule should be explicit in system design:

- VEMTAP owns the platform identity and access infrastructure
- Each clinic owns operational records generated in its environment
- Each patient owns the right to view and consent to sharing of their data
- Clinical records remain attributed to the responsible clinician and facility

## 4. Complete account structure

VEMTAP should have the following account categories.

| Account Type | Purpose |
| --- | --- |
| Super Admin | VEMTAP internal platform control |
| Clinic Owner / Clinic Admin | Owns and manages a clinic organization |
| Branch Manager | Manages an assigned clinic branch |
| Doctor / Ophthalmologist | Handles consultations and clinical records |
| Nurse | Handles vitals, monitoring and nursing activities |
| Receptionist / Frontdesk | Handles registration, check-in and appointments |
| HMO Officer | Handles HMO verification, claims and reconciliation |
| Optician / Optical Staff | Handles lens orders, frames and optical inventory |
| Pharmacist | Handles prescriptions and drug inventory |
| Cashier / Accountant | Handles billing, payments and accounting |
| Patient | Accesses personal healthcare services and records |
| Public Queue Display | Displays queue information to waiting patients |

Important: These are account roles, not necessarily twelve different applications.

We should build one connected platform with role-based access. Each user sees the dashboard, pages, actions and information permitted by their role.

A clinic may assign multiple roles to one staff member where appropriate. For example, a small clinic might have a receptionist who also handles cashier duties. Permissions should be configurable rather than hardcoded to job titles.

## 5. Account relationship model

The account structure should support these relationships:

- One VEMTAP platform account for system administration
- Multiple clinics attached to a VEMTAP-managed platform
- Multiple staff accounts under each clinic
- Multiple patient accounts with clinic linkages
- Clinic-to-HMO relationships
- Branch-level operational assignments

The user role hierarchy should be modeled by permissions rather than by a static role page per job title.

## 6. Registration and onboarding model

### 6.1 Patient registration options

Patients may register in the following ways:

- Self-registration on the patient portal
- Registration by clinic staff at reception
- Registration from a referral or external source
- Registration through a QR check-in flow
- Registration as part of an appointment booking process

### 6.2 Patient onboarding flow

The patient onboarding experience should be simple and trust-building:

1. Patient creates or verifies a VEMTAP patient account.
2. Patient chooses or is linked to a clinic.
3. Patient provides basic identity and contact details.
4. Patient confirms consent for use of their records and communications.
5. Patient is linked to that clinic's patient roster.
6. Patient can now access appointments, consultation records, prescriptions and optical orders for that clinic.

### 6.3 Clinic staff onboarding

Clinic staff onboarding should include:

- clinic assignment
- branch assignment
- role or roles assignment
- approval by clinic owner or administrator
- permission profile creation
- access to only the modules needed for the job

### 6.4 Clinic onboarding

When onboarding a new clinic into VEMTAP:

- create the clinic profile
- define branches
- define HMO relationships
- configure billing rules
- assign owners and administrators
- turn on required modules
- set patient consent rules
- define queue and scheduling policies

## 7. Multi-clinic patient access model

This is the heart of the platform.

A patient should not be forced to maintain a separate login per clinic. The system should instead be designed around one patient identity mapped to many clinic relationships.

### 7.1 Permission model

Each clinic relationship should have its own permission boundary:

- the clinic can see only records relevant to that patient in that clinic
- the patient can access records across all linked clinics through a single account
- additional sharing requires consent or governance rules
- cross-clinic access should be visible in an audit trail

### 7.2 Benefits of this model

- Better continuity of care
- Lower onboarding friction for patients
- Clear ownership of records
- Better privacy compliance and governance
- Strong support for multi-branch and multi-clinic operations

## 8. QR check-in and patient access journey

Patients should be able to check in using a clinic QR code or a patient portal.

### Typical patient journey

1. Patient arrives at a clinic.
2. Patient scans a QR code.
3. Patient chooses the purpose of visit.
4. Patient selects whether they are private or HMO.
5. Patient fills a quick digital form.
6. The system assigns the patient to the queue.
7. The receptionist or queue monitor sees the patient status.
8. The patient is called for consultation or service.

This reduces manual queue management, shortens waiting time, and makes patient intake more efficient.

## 9. Role-based access and permissions

The platform should not hardcode only one route per role. Instead, access should be permission-driven.

Examples:

- A doctor may view clinical notes, orders and prescriptions but not financial billing details.
- A receptionist may manage check-in and appointments but not edit clinical documentation.
- A cashier may process payment but not edit treatment notes.
- A branch manager may view branch analytics but not across all clinics unless granted platform-level permissions.
- A patient may view own appointments, records and optical orders, but not other patients' records.

This flexible permission model is essential for small clinics and larger practices alike.

## 10. Clinic, branch and HMO structure

The platform should support:

- one platform owner
- many clinics
- many branches under each clinic
- many doctors and staff per branch
- many HMO contracts and payer arrangements
- many patient relationships across those entities

This creates a strong foundation for both local and distributed eye care operations.

## 11. Patient experience goals

The patient should feel like they have one healthcare home across VEMTAP clinics.

The patient should be able to:

- log in with one patient account
- manage appointments
- view consultation history
- view prescriptions
- view optical order status
- check queue status
- receive notifications
- consent to sharing between clinics where required

## 12. Staff experience goals

Clinic staff should be able to operate efficiently without duplicate systems or data silos.

Staff should be able to:

- work within their assigned clinic and branch
- access only relevant patient and operational data
- perform their tasks without needing unnecessary permissions
- see queue, HMO, billing and optical operations in the right context

## 13. Platform principles

The design should follow these principles:

- One patient identity, many clinic relationships
- Role-based access, not title-based rigidity
- Clinic-level data boundaries
- Consent-based sharing for cross-clinic care
- Auditability and traceability for sensitive records
- Patient-first access to health information
- Support for both self-service and staff-assisted workflows

## 14. Recommended implementation direction

The VEMTAP platform should be built as a unified system with shared platform services and strongly separated clinic data domains.

For implementation, we should aim for:

- a central identity and auth layer
- shared patient profile model
- per-clinic relationship records
- separate clinical, billing, optical and HMO domains
- secure consent and access governance logic
- event-driven updates for queue, appointment and prescription workflows

This avoids the common mistake of creating one giant shared database with no privacy boundaries, while still giving the patient one coherent experience.

## 15. Summary

VEMTAP should feel like one platform, but operate like many clinics.

The central idea is simple and powerful:

- one patient identity
- many clinic relationships
- clear role-based access
- careful data separation
- patient-controlled continuity of care

This architecture is the correct foundation for an eye clinic platform that can scale from a single clinic to a multi-clinic healthcare network with HMO operations, staff management, patient self-service and long-term patient engagement.
