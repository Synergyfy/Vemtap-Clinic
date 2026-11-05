# **VEMTAP EYE CLINIC APP DOCUMENTATION**

# **VEMTAP EYE CLINIC PLATFORM**

## **Complete Platform Architecture, Account Management, Registration, Onboarding & Patient Access Documentation**

Master Product Blueprint  
Multi-Clinic Architecture

## **1\. Introduction: What exactly are we building?**

We are not simply building a clinic management dashboard.

We are building a multi-clinic healthcare management ecosystem powered by VEMTAP, where VEMTAP controls the overall platform, individual clinics manage their own operations, healthcare professionals attend to patients, and patients have a personal account that they can use across different clinics operating on VEMTAP.

For this first version, our specialty is eye care. We will use Flourish iClinic as an example clinic throughout this documentation.

The platform should accommodate:

* One VEMTAP platform.  
* Multiple independent eye clinics.  
* Multiple branches under each clinic.  
* Multiple staff members under each clinic.  
* Multiple HMOs and different HMO agreements.  
* Thousands of patients.  
* Patients who visit more than one VEMTAP-powered clinic.  
* Patients who register themselves.  
* Patients who are registered by clinic staff.  
* Patients who use QR codes to check in.  
* Patients who want to access their medical records, appointments, prescriptions and optical orders.

### **Our fundamental architectural decision**

I recommend that we build VEMTAP around one central patient identity with separate clinic relationships and securely managed medical records.

This is important.

Imagine a patient visits Flourish iClinic today and another eye clinic tomorrow.

We should not force that patient to create two completely different VEMTAP accounts.

Instead:

1. The patient has one VEMTAP patient account.  
2. Flourish iClinic has its own relationship with that patient.  
3. The second clinic establishes its own relationship with the same patient.  
4. Each clinic maintains its own consultations, prescriptions, bills, appointments and operational records.  
5. The patient can access their records from both clinics through one patient account.  
6. Medical records are only shared between clinics when the patient authorizes the sharing, or when a properly governed emergency access process applies.

This preserves the patient's continuity of care without allowing one clinic to automatically access another clinic's confidential records.

This patient-centred, permission-based approach also supports the earlier VEMTAP vision of longitudinal patient records with clear doctor and facility attribution.

# **2\. THE COMPLETE ACCOUNT STRUCTURE**

VEMTAP should have the following account categories.

| Account | Purpose |
| ----- | ----- |
| 1\. Super Admin | VEMTAP internal platform control |
| 2\. Clinic Owner / Clinic Admin | Owns and manages a clinic organization |
| 3\. Branch Manager | Manages an assigned clinic branch |
| 4\. Doctor / Ophthalmologist | Handles consultations and clinical records |
| 5\. Nurse | Handles vitals, monitoring and nursing activities |
| 6\. Receptionist / Frontdesk | Handles registration, check-in and appointments |
| 7\. HMO Officer | Handles HMO verification, claims and reconciliation |
| 8\. Optician / Optical Staff | Handles lens orders, frames and optical inventory |
| 9\. Pharmacist | Handles prescriptions and drug inventory |
| 10\. Cashier / Accountant | Handles billing, payments and accounting |
| 11\. Patient | Accesses personal healthcare services and records |
| 12\. Public Queue Display | Displays queue information to waiting patients |

Important: These are account roles, not necessarily twelve different applications.

We should build one connected platform with role-based access. Each user sees the dashboard, pages, actions and information permitted by their role.

A clinic may assign multiple roles to one staff member where appropriate. For example, a small clinic might have a receptionist who also handles cashier duties. Permissions should be configurable rather than hardcoded to job titles.

# **3\. THE VEMTAP SUPER ADMIN ACCOUNT**

This is our internal control centre.

VEMTAP Super Admin is responsible for managing the entire platform, not managing the daily clinical operations of individual clinics.

## **3.1 How Super Admin enters the platform**

The Super Admin accesses:

`platform-domain.com/super-admin/login`

Authentication should include:

* Email and password.  
* Two-factor authentication.  
* Session management.  
* Login activity tracking.  
* Role and permission verification.

Only authorized VEMTAP internal personnel should have access.

## **3.2 Super Admin dashboard**

The dashboard should display:

Platform overview

* Total registered clinics.  
* Active clinics.  
* Suspended clinics.  
* Total branches.  
* Total registered patients.  
* Active patient accounts.  
* Total registered healthcare professionals.  
* Total active staff.  
* New clinic registrations.  
* Clinics awaiting verification.

Financial overview

* Total subscription revenue.  
* Monthly recurring revenue.  
* Outstanding clinic subscriptions.  
* Successful transactions.  
* Failed transactions.  
* Subscription cancellations.

Platform usage

* Patient registrations.  
* QR check-ins.  
* Appointments booked.  
* Consultations recorded.  
* HMO transactions.  
* OCR documents processed.  
* Optical orders.  
* Active branches.

System monitoring

* System alerts.  
* Failed integrations.  
* API errors.  
* Support tickets.  
* Security alerts.

## **3.3 Clinic management**

Super Admin should be able to:

* View all registered clinics.  
* Create a clinic manually.  
* Review clinic registration requests.  
* Verify clinic information.  
* Approve or reject registrations.  
* Activate or suspend clinics.  
* View clinic subscriptions.  
* Assign or change subscription plans.  
* Monitor usage limits.  
* View clinic branches.  
* View clinic staff accounts.  
* Monitor platform activity.  
* View clinic billing information.  
* Reset clinic administrator access through a secure recovery process.

### **Clinic quick-view**

Clicking a clinic should open a side drawer showing:

* Clinic name.  
* Registration status.  
* Owner.  
* Contact details.  
* Number of branches.  
* Number of staff.  
* Number of patients associated with the clinic.  
* Subscription.  
* Account status.  
* Last activity.

A separate clinic details page should contain tabs:

1. Overview  
2. Branches  
3. Staff  
4. Subscription  
5. Billing  
6. Usage  
7. HMO configuration  
8. Activity logs  
9. Verification documents

## **3.4 What Super Admin controls**

Super Admin controls:

* Clinic registration and verification.  
* Platform subscription plans.  
* Platform-wide pricing configuration.  
* Platform feature availability.  
* Global HMO master database.  
* Drug master database.  
* Lens and frame catalogues.  
* Platform integrations.  
* SMS and WhatsApp configurations.  
* Email templates.  
* API connections.  
* Platform security.  
* Internal support.  
* Platform analytics.

Medical privacy restriction: Super Admin must not have unrestricted access to individual patient medical records simply because it controls the platform. Any exceptional technical or support access must be specifically authorized, limited, logged and auditable.

# **4\. HOW CLINICS JOIN VEMTAP**

This is one of the most important parts of the system.

We need TWO registration methods.

METHOD A — VEMTAP-ASSISTED REGISTRATION

Admin-assisted onboarding

VEMTAP registers the clinic on its behalf.

METHOD B — SELF-SERVICE REGISTRATION

Clinic self-registration

The clinic visits the VEMTAP website and registers independently.

Both methods must eventually produce exactly the same clinic account structure.

## **4.1 Method A: VEMTAP helps the clinic register**

Imagine we approach Flourish iClinic and agree to onboard them.

The process:

Step 1 — Super Admin opens Clinic Management

Navigate to:

Super Admin → Clinics → Add New Clinic.

Step 2 — Enter clinic information

* Clinic name.  
* Clinic type.  
* Owner's full name.  
* Owner's email.  
* Owner's phone number.  
* Clinic address.  
* Primary branch.  
* Number of branches.  
* Clinic logo.  
* Registration information.  
* Contact person.

Step 3 — Create the clinic organization

The system generates:

* Unique Clinic ID.  
* Clinic workspace.  
* Primary branch record.  
* Clinic administrator invitation.  
* Initial onboarding status.

Step 4 — Send administrator invitation

The owner receives an email, SMS or WhatsApp invitation.

The invitation contains a secure, time-limited registration link.

Step 5 — Owner activates account

The owner:

* Opens the invitation.  
* Verifies their email or phone.  
* Creates a password.  
* Enables two-factor authentication.  
* Accepts platform terms.  
* Completes their profile.

Step 6 — Clinic completes onboarding

The owner enters the clinic dashboard and completes:

* Clinic profile.  
* Branch configuration.  
* HMO agreements.  
* Service pricing.  
* Staff invitations.  
* Optical settings.  
* Pharmacy settings, if applicable.  
* Appointment settings.  
* Notification settings.

Step 7 — Clinic becomes operational

After required verification and setup, the clinic can activate its operations and begin registering patients.

## **4.2 Method B: Clinic registers independently**

The clinic visits:

`vemtap.com/eye-clinic/register`

The registration flow should be:

1. Create account  
   Owner's name, email, phone and password.  
2. Verify contact details  
   Email or phone OTP.  
3. Register clinic  
   Clinic name, type, address, registration details and logo.  
4. Set up primary branch  
   Branch name, address, contact details and manager.  
5. Select subscription  
   Starter, Growth, Enterprise or applicable plan.  
6. Complete clinic profile  
   Services, operating hours, departments and operational preferences.  
7. Invite staff  
   Doctors, nurses, receptionists, opticians, pharmacists and other staff.  
8. Configure clinic operations  
   HMOs, service prices, appointments, optical workflows and billing.  
9. Verification and activation  
   Complete required verification before full production access.  
10. Generate clinic QR codes  
    Create patient check-in and other configured QR entry points.  
11. Enter clinic dashboard  
    Clinic is ready for its operational setup and patient onboarding.

The clinic should be able to save progress and continue onboarding later.

Important distinction: Registration does not automatically mean the clinic is fully operational. We should support statuses such as:

* Draft.  
* Email/phone verification pending.  
* Verification pending.  
* Onboarding incomplete.  
* Awaiting payment, where applicable.  
* Active.  
* Suspended.  
* Rejected.

# **5\. CLINIC OWNER / CLINIC ADMIN ACCOUNT**

After registration, the clinic owner becomes the administrator of their clinic organization.

For our example:

Flourish iClinic

Active

Example clinic organization

Organization structure

Flourish iClinic — Clinic Owner

Organization administrator

Branch A

Main branch

Staff and operations

Branch B

Second branch

Staff and operations

Each branch belongs to the same clinic organization.

## **5.1 What happens when the owner first logs in?**

The owner should not be taken directly to an empty dashboard.

The system should recognize whether onboarding is complete.

If incomplete, show an onboarding checklist.

Clinic setup checklist

1. Complete clinic profile.  
2. Create primary branch.  
3. Add additional branches, if needed.  
4. Configure departments and services.  
5. Configure HMO agreements.  
6. Configure private patient pricing.  
7. Invite doctors.  
8. Invite nurses.  
9. Invite receptionists.  
10. Invite optical staff.  
11. Invite pharmacists, if applicable.  
12. Configure billing and payment methods.  
13. Configure appointments and queue rules.  
14. Set up clinic QR codes.  
15. Configure patient notifications.  
16. Review and activate clinic operations.

The owner can see completed, pending and incomplete tasks.

## **5.2 Branch management**

A clinic can have one or multiple branches.

For example:

* Flourish iClinic — Wuse.  
* Flourish iClinic — Gwarinpa.  
* Flourish iClinic — Maitama.

The owner should be able to create a new branch.

### **Create branch workflow**

Clinic Admin → Branch Management → Add Branch.

Fields:

* Branch name.  
* Branch address.  
* State.  
* City.  
* Contact phone.  
* Branch email.  
* Operating hours.  
* Branch manager.  
* Available services.  
* Doctors assigned.  
* Staff assigned.  
* HMO availability.  
* Branch-specific pricing.  
* Queue configuration.

Each branch receives:

* Unique Branch ID.  
* Branch dashboard.  
* Branch staff assignments.  
* Branch operational records.  
* Branch QR codes.  
* Branch analytics.

### **Important architecture decision**

Branches should not become independent clinics.

They remain under the same clinic organization.

This means the owner can see consolidated reports while each branch manager sees only their authorized branch operations.

## **5.3 Staff onboarding**

The owner should not need VEMTAP to manually create every staff account.

The clinic administrator should be able to invite staff directly.

### **Staff invitation process**

Clinic Admin → Staff Management → Add Staff.

The owner selects:

* Doctor.  
* Nurse.  
* Receptionist.  
* HMO Officer.  
* Optician.  
* Pharmacist.  
* Cashier.  
* Accountant.  
* Branch Manager.  
* Other authorized staff.

Then enters:

* Full name.  
* Email.  
* Phone number.  
* Professional registration details, where applicable.  
* Assigned branch.  
* Assigned department.  
* Role.  
* Permissions.

The system sends an invitation.

Staff member:

1. Receives invitation.  
2. Opens invitation link.  
3. Verifies email or phone.  
4. Creates password.  
5. Completes profile.  
6. Accepts clinic invitation.  
7. Enters assigned dashboard.

### **Existing VEMTAP user**

If a doctor already has an account with another clinic, VEMTAP should not create a duplicate login.

The clinic should invite the existing user to join its organization.

The user accepts the invitation, and the new clinic relationship is created.

A healthcare professional can work at more than one clinic, subject to their access permissions.

## **5.4 Roles and permissions**

The owner controls staff permissions within their organization.

For example:

| Role | Main responsibility |
| ----- | ----- |
| Clinic Admin | Overall clinic management |
| Branch Manager | Assigned branch operations |
| Doctor | Clinical consultations |
| Nurse | Vitals and patient monitoring |
| Receptionist | Patient registration and check-in |
| HMO Officer | Insurance verification and claims |
| Optician | Optical orders and inventory |
| Pharmacist | Prescriptions and drugs |
| Cashier | Patient payments |
| Accountant | Accounting and financial reports |

Permissions must be configurable.

A receptionist should not automatically access all medical records simply because they can register patients.

A doctor should not automatically have access to clinic subscription settings.

# **6\. THE PATIENT ACCOUNT SYSTEM — THE MOST IMPORTANT ARCHITECTURAL DECISION**

Now we come to the question you raised about Flourish iClinic.

Suppose a patient visits Flourish iClinic today.

Tomorrow, the same patient visits another clinic operating on VEMTAP.

How do we handle that?

Should they create another account?

Should the second clinic register them again?

Should the patient use their original login?

My recommendation: one permanent VEMTAP patient account, usable across all participating clinics.

The patient should not have to create a separate account for every clinic.

However, each clinic should have its own patient registration and treatment relationship.

We need to separate three things:

1. VEMTAP Patient Identity.  
2. Clinic Patient Relationship.  
3. Medical Records.

## **6.1 VEMTAP Patient Identity**

Every patient who joins VEMTAP receives a unique Patient ID.

Example:

`VPT-000001`

This identifier belongs to the patient, not to Flourish iClinic.

The patient's central profile contains:

* Unique Patient ID.  
* Full name.  
* Date of birth.  
* Gender, where required.  
* Phone number.  
* Email address.  
* Profile photograph, optional.  
* Emergency contact.  
* Preferred language.  
* Login credentials.  
* Identity verification status.  
* Notification preferences.

The patient can use one account to access the VEMTAP patient portal.

## **6.2 Clinic-specific patient relationships**

When the patient visits Flourish iClinic, the platform creates a patient relationship for Flourish.

Example:

Patient: John Doe

One VEMTAP Patient ID

# **VPT-000001**

Associated clinics

Flourish iClinic

Clinic patient number: FIC-00125  
Registered

Another VEMTAP Eye Clinic

Clinic patient number: AEC-00451  
Registered  
Both clinic records point to the same central patient identity. Each clinic maintains its own local patient number and operational records.

This means:

* John has one VEMTAP account.  
* Flourish has its own patient number for John.  
* The second clinic has its own patient number for John.  
* Both relationships are connected to the same central identity.

The clinics do not need to share their internal patient numbering systems.

## **6.3 What if the patient does not have a VEMTAP account?**

This should not stop the clinic from attending to the patient.

We need two registration methods.

Method A — Patient self-registration

The patient registers independently using the VEMTAP website or mobile experience.

Method B — Clinic-assisted registration

The clinic creates a patient record during registration or check-in.

The patient can activate their VEMTAP login later.

This is essential because not every patient will have a smartphone, email address, or interest in creating an account before receiving care.

The clinical workflow must never depend on the patient owning a VEMTAP account.

# **7\. PATIENT REGISTRATION AND CHECK-IN: ALL POSSIBLE ENTRY METHODS**

We should provide multiple entry points.

## **7.1 Method A — Patient scans the clinic QR code**

This is one of the most important VEMTAP features.

Every clinic should have a unique clinic QR code.

Every branch should also have a unique branch QR code.

For example:

`Flourish iClinic → Wuse Branch → Patient Check-in QR`

[Patient Journey Integrated into the System](https://images.openai.com/static-rsc-4/-J7tstexHxnowkdqpJi_rFKgEYIeI6CgCQINl1ROFffNnJAwNCMN3mfRhtQ9OmPO15EOZux6lJsFOx-0Au7k4GojiOlFYTERj-BJClcxuIyI-H_wbR8ekmeV3htIk59fOpX5gMFQxPhXDRlbCbn1t2X6hWpDib0ECkTP_7yhlYg?purpose=inline)  
[english.apolo.app](https://english.apolo.app/patient-journey-integrated-into-the-system/?utm_source=chatgpt.com)

### **Exact patient flow**

1. Patient arrives  
   Reception directs the patient to scan the QR code or use the clinic's check-in link.  
2. QR code opens VEMTAP  
   The link identifies Flourish iClinic and its Wuse branch automatically.  
3. Patient selects an option  
   * I am a new patient.  
   * I have visited this clinic before.  
   * I already have a VEMTAP account.  
4. New patient  
   The patient completes the registration and visit form.  
5. Returning patient  
   The patient enters their registered phone number or Patient ID and verifies identity.  
6. Choose visit purpose  
   * Eye consultation.  
   * Eye test.  
   * Lens purchase.  
   * Frame selection.  
   * Lens pickup.  
   * Follow-up.  
   * Emergency.  
7. Select payment category  
   * HMO.  
   * Private.  
8. Complete required information  
   HMO details, visit information and relevant updates.  
9. Submit check-in  
   The system creates or updates the clinic patient record.  
10. Queue assignment  
    The patient receives a queue number or is directed to the appropriate department.

## **7.2 Method B — Patient uses a clinic-specific link**

Some patients may receive the link through WhatsApp, SMS or the clinic's website.

Example:

`vemtap.com/c/flourish/wuse/check-in`

The link should behave exactly like the QR code.

It must identify the clinic and branch without requiring the patient to search for them manually.

## **7.3 Method C — Patient already has a VEMTAP account**

Suppose John has already registered with VEMTAP through another clinic.

He visits Flourish iClinic.

He scans Flourish's QR code.

The system asks him to:

* Log in.  
* Verify his phone number using OTP.  
* Confirm his identity.

VEMTAP recognizes that he already has a central patient identity.

It then checks whether Flourish already has a patient relationship with him.

If not, it creates a new Flourish patient relationship linked to his existing VEMTAP Patient ID.

It does not create another central patient account.

## **7.4 Method D — Receptionist registers the patient**

Some patients will not scan QR codes.

The receptionist should be able to use:

Reception → Register Patient.

The system asks:

* Is this a new patient?  
* Is this an existing VEMTAP patient?  
* Is this an existing Flourish patient?

The receptionist searches using:

* Phone number.  
* Patient ID.  
* Name.  
* Clinic patient number.  
* Other approved matching identifiers.

If an existing patient is found, the receptionist links the clinic record rather than creating a duplicate.

If no matching patient is found, a new patient record is created.

The receptionist can complete registration even if the patient cannot immediately activate an online account.

## **7.5 Method E — Patient books an appointment online**

The patient can visit the clinic's public booking page.

Example:

`vemtap.com/c/flourish/appointments`

They:

1. Select a branch.  
2. Select a service.  
3. Select an available doctor, if applicable.  
4. Select a date.  
5. Select an available time.  
6. Log in or provide their details.  
7. Confirm booking.

If they are new, the system creates a patient identity or a provisional booking record that can be linked during verification.

The clinic sees the appointment on its dashboard.

# **8\. WHAT HAPPENS WHEN A PATIENT VISITS ANOTHER VEMTAP CLINIC?**

This is where our architecture must be particularly strong.

Let's walk through the example.

## **Scenario: John visits two different eye clinics**

## **John's healthcare journey**

John Doe

VPT-000001  
One central VEMTAP patient identity  
[Soteria Eye Clinic – Your Total Eye Care Our Responsibility](https://images.openai.com/static-rsc-4/oi9gQcliPO3n2FDDm_mUCh-IYmvj7dAohIRXwA2HPLFHUdWjvGwspJK9aMkrJszp2IrI0cKytCNCM_SaAY7yJ1sJzapW6iGF37T7vx5UQ8UExFdJH_j-z7zGftAjnpYLxt3fCZAhqCvsKoHcdJEqTAEwVE1Zx0JYmRNYIOsotoE?purpose=inline)

Visit 1 — Flourish iClinic

Patient relationship created

* Eye examination.  
* Doctor consultation.  
* Prescription.  
* Lens recommendation.  
* Appointment scheduled.

[Eye Care Clinic :: Behance](https://images.openai.com/static-rsc-4/j_M_JqQQtz3ffNsZCE1lN8rG6qqdDNIM26tu9-o64sQiY2tGrPa3dbw8IwXBce9Cp16_yXYu_I4DozT7KKdWnH_xO3wRQBkUcQvbtd2MnCW_CktEdNkTAl02P6NtPk622dgp9WPqoD6Sc31rJj8ziUoKCy59mN5Oc0YXrApc5gg?purpose=inline)

Visit 2 — Another VEMTAP clinic

Same patient identified

* Scans QR code.  
* Verifies existing VEMTAP account.  
* New clinic relationship created.  
* New consultation recorded.

Result

One patient login. Two clinic relationships. Separate clinic records. Patient-controlled medical record sharing.

## **8.1 Does the second clinic automatically see the first clinic's medical records?**

No.

This is a critical privacy and security decision.

The second clinic can identify that the patient already has a VEMTAP account, but it must not automatically access confidential medical records belonging to Flourish iClinic.

Instead, we introduce a Patient Record Sharing System.

## **8.2 How record sharing works**

Suppose the second doctor wants to review John's previous eye examination.

The doctor clicks:

`Request Previous Medical Records`

The system:

1. Identifies the records or clinic from which information is requested.  
2. Sends John a notification.  
3. Explains which clinic is requesting the records.  
4. Specifies what information is requested.  
5. Allows John to approve or reject the request.  
6. Records the patient's authorization.  
7. Makes the approved records accessible to the authorized provider for the permitted period.  
8. Records the access in the audit log.

John can also revoke future access where applicable.

For emergency access, we should provide a controlled break-glass process, with a documented reason, restricted scope and immediate audit notification.

## **8.3 Patient's medical record ownership and attribution**

We should avoid presenting records as if VEMTAP itself was the doctor or clinic that created them.

Each record should preserve:

* Original clinic.  
* Original branch.  
* Doctor or healthcare professional.  
* Date and time.  
* Record type.  
* Record creation history.  
* Authorization and sharing history.

This is important for medical accountability.

## **8.4 What should the patient see?**

The patient's portal should have a section called:

My Healthcare Providers

Example:

* Flourish iClinic.  
* Another VEMTAP Eye Clinic.  
* Other healthcare providers that have joined VEMTAP.

When the patient selects Flourish, they see the information associated with their Flourish relationship.

When they select another clinic, they see that clinic's information.

They should also have a unified timeline showing their healthcare journey, with each entry clearly identifying its source.

The unified timeline should only display information the patient is authorized to view.

# **9\. PATIENT PORTAL — HOW PATIENTS ACCESS THEIR ACCOUNTS**

We should not make patients download a separate application for every clinic.

VEMTAP should provide one patient-facing portal that works on:

* Mobile browsers.  
* Desktop browsers.  
* Installable mobile web/PWA experience.  
* Native mobile applications later, if needed.

The patient portal should have a central login:

`vemtap.com/patient/login`

## **9.1 Patient account creation**

Patients can create an account independently.

Registration fields:

* Full name.  
* Phone number.  
* Email, optional where supported.  
* Date of birth.  
* Password.  
* OTP verification.

The system generates a unique VEMTAP Patient ID.

The patient does not need to select a clinic to create their general VEMTAP account.

However, if they enter through a clinic's QR code or booking link, VEMTAP should automatically associate their registration with that clinic.

## **9.2 Patient login**

Patient login options:

* Phone number and password.  
* Email and password.  
* OTP-based login.  
* Secure account recovery.

The system should support two-factor authentication and secure session management.

## **9.3 Patient dashboard**

The dashboard should show:

Overview

* Upcoming appointments.  
* Recent consultations.  
* Outstanding bills.  
* Current queue position, when checked in.  
* Lens order status.  
* Notifications.

My Clinics

* Clinics visited.  
* Associated branches.  
* Upcoming clinic visits.  
* Clinic contact information.

Medical Records

* Consultation history.  
* Eye examination results.  
* Prescriptions.  
* Medical documents.  
* Uploaded scans.  
* Follow-up recommendations.

Appointments

* Book appointments.  
* Reschedule.  
* Cancel.  
* View appointment history.  
* Receive reminders.

Optical Orders

* Lens orders.  
* Frame orders.  
* Production status.  
* Pickup information.  
* Delivery updates.

Billing

* Invoices.  
* Receipts.  
* Outstanding payments.  
* Payment history.  
* HMO information.

My Health

* Eye health tips.  
* Vision care education.  
* Eye examination reminders.  
* Preventive care reminders.  
* Personalized educational content.

Notifications

* Appointment reminders.  
* Prescription notifications.  
* Lens pickup notifications.  
* Follow-up alerts.  
* Payment reminders.  
* Clinic announcements.

Privacy & Security

* Manage account.  
* Change password.  
* Login sessions.  
* Manage record-sharing permissions.  
* Review access history.  
* Manage notification preferences.

## **9.4 Patients without smartphones**

We must accommodate patients who cannot use the portal.

They should still be able to:

* Visit the clinic.  
* Register through reception.  
* Receive treatment.  
* Receive printed prescriptions.  
* Receive printed receipts.  
* Book appointments through staff.  
* Receive SMS notifications where possible.

A digital account should improve access, not become a barrier to healthcare.

# **10\. HOW THE COMPLETE CLINIC OPERATION WORKS**

Now that we understand clinic onboarding and patient identity, let's connect the operational departments.

We will use Flourish iClinic as our example.

## **10.1 Patient arrives at Flourish iClinic**

There are three possible situations:

* New patient.  
* Existing Flourish patient.  
* Existing VEMTAP patient from another clinic.

The frontdesk system identifies which situation applies.

## **10.2 New patient workflow**

1. Patient scans QR or receptionist registers them.  
2. Patient details are collected and verified.  
3. VEMTAP checks for an existing matching patient identity.  
4. If no match exists, create a central Patient ID and clinic patient relationship.  
5. Patient selects HMO or Private.  
6. HMO details are collected and eligibility is verified where possible.  
7. Visit purpose is selected.  
8. Queue number is generated.  
9. Doctor receives the patient in the consultation queue.  
10. Doctor opens the patient profile and reviews available history.

## **10.3 Returning patient workflow**

1. Patient scans QR code.  
2. Enters phone number or Patient ID.  
3. Verifies identity.  
4. VEMTAP finds the existing Flourish relationship.  
5. Displays basic patient details for confirmation.  
6. Patient updates any changed information.  
7. Selects visit purpose.  
8. Confirms HMO or private status.  
9. Queue number is generated.  
10. Doctor receives the patient.

This should be significantly faster than registering the patient again.

## **10.4 Doctor workflow**

When the patient reaches the doctor:

* Doctor opens consultation queue.  
* Selects patient.  
* Reviews previous consultations from the clinic.  
* Reviews authorized external records, if any.  
* Views medical history.  
* Reviews eye examination results.  
* Records diagnosis.  
* Adds treatment notes.  
* Adds prescriptions.  
* Records lens recommendations.  
* Requests further tests where necessary.  
* Schedules follow-up.  
* Completes consultation.

## **10.5 Optical workflow**

If the doctor recommends lenses:

1. Prescription is sent to Optical Department.  
2. Optician receives a new order.  
3. Confirms lens specifications.  
4. Checks inventory.  
5. Generates optical quotation.  
6. Applies HMO coverage or private pricing.  
7. Patient pays applicable amount.  
8. Production begins.  
9. Quality check is performed.  
10. Order is marked ready.  
11. Patient receives notification.  
12. Patient collects the lens or receives delivery.  
13. Order is marked completed.

## **10.6 Pharmacy workflow**

If medication is prescribed:

1. Prescription enters pharmacy queue.  
2. Pharmacist reviews prescription.  
3. Checks drug availability.  
4. Confirms applicable HMO coverage.  
5. Calculates patient co-payment.  
6. Dispenses medication.  
7. Updates stock.  
8. Generates dispensing record.  
9. Confirms collection.

## **10.7 Billing workflow**

The billing engine should combine:

* Consultation charges.  
* Eye examination charges.  
* Diagnostic services.  
* Drug charges.  
* Optical charges.  
* Procedures.  
* HMO-covered amounts.  
* Patient co-payments.  
* Private payments.  
* Outstanding balances.

It generates the appropriate invoices, receipts and HMO claim records.

# **11\. HOW HMO FITS INTO THE CLINIC AND PATIENT ARCHITECTURE**

HMO configuration must exist at multiple levels.

Level 1 — VEMTAP Super Admin

Maintains the global HMO master database.

Level 2 — Clinic Admin

Activates the HMOs with which the clinic has agreements.

Level 3 — Branch

Configures which activated HMOs are accepted at that branch, where agreements differ.

Level 4 — Patient

Has an HMO membership profile, including provider, plan, membership number and verification status.

Level 5 — Billing Engine

Uses the correct clinic agreement, plan, service coverage and applicable branch rules to calculate HMO and patient liabilities.

For example, Flourish Wuse and Flourish Gwarinpa may accept the same HMO but have different agreed prices.

The platform must support this without creating duplicate HMO organizations.

### **HMO configuration hierarchy**

VEMTAP Global HMO Database

HMO providers and master plans

Flourish iClinic HMO Agreements

Negotiated prices, coverage and claim rules

Wuse Branch

Branch-specific rules

Gwarinpa Branch

Branch-specific rules

Patient Membership & Eligibility

Provider, plan, membership and verification

Coverage, Billing & Claims Engine

HMO liability \+ patient co-payment \+ receivables

The full HMO operations engine should work as a shared platform service, while each clinic's agreements, patients, claims and financial records remain isolated.

# **12\. HOW THE DIFFERENT CLINIC ACCOUNTS CONNECT**

We should make all accounts operate from the same underlying clinic records.

This prevents staff from entering the same information multiple times.

For example, when reception registers a patient, the doctor should immediately see that patient in the queue.

When the doctor completes a consultation, the optical staff should receive the lens order automatically.

When the pharmacist dispenses medication, inventory should update automatically.

When payment is collected, the cashier and clinic administrator should see the updated financial record.

## **12.1 Connected workflow**

## **One connected clinic workflow**

1. Patient / QR check-in  
   Patient information and visit purpose captured.  
2. Reception  
   Registration, identity matching, HMO verification and queue assignment.  
3. Nurse  
   Vitals, initial assessment and monitoring.  
4. Doctor  
   Consultation, examination, diagnosis and prescription.  
5. Optical / Pharmacy  
   Lens orders, drug dispensing and inventory updates.  
6. HMO / Billing  
   Coverage calculation, invoices, payments and claims.  
7. Patient Portal  
   Appointments, prescriptions, results, payments and follow-ups.  
8. Clinic Admin  
   Operational monitoring, reporting and performance analytics.

The workflow must also support exceptions. For example, a patient may go directly to the doctor without needing a nurse, or visit optical for a lens pickup without a new consultation.

## **12.2 Automatic notifications between departments**

Examples:

| Event | Notification recipient |
| ----- | ----- |
| New patient checked in | Reception and assigned department |
| Patient added to doctor queue | Assigned doctor |
| Vitals completed | Assigned doctor |
| Consultation completed | Reception, where billing action is required |
| Lens order created | Optical staff |
| Prescription created | Pharmacy |
| HMO authorization required | HMO officer |
| Payment completed | Cashier and relevant department |
| Appointment booked | Patient and clinic |
| Follow-up due | Patient and relevant clinic staff |
| Lens ready | Patient |
| Claim rejected | HMO officer |

These notifications should be based on events and permissions, not manual messages between staff.

# **13\. HOW PATIENT IDENTITY MATCHING AND DUPLICATE PREVENTION WILL WORK**

This deserves its own technical module.

One of the biggest risks in a multi-clinic platform is creating multiple patient accounts for the same person.

Imagine:

* John registers at Flourish with one phone number.  
* John visits another clinic and uses another phone number.  
* Reception creates a new account.  
* Later, the clinic discovers both records belong to John.

We need a duplicate detection and resolution system.

## **13.1 Matching information**

Use a combination of:

* Verified phone number.  
* Verified email.  
* Patient ID.  
* Date of birth.  
* Full name.  
* Additional identity information where legitimately necessary.

A name alone should never automatically merge two patients.

## **13.2 Matching workflow**

When a clinic creates a patient:

1. VEMTAP checks for existing central identities.  
2. It compares verified identifiers.  
3. If there is an exact verified match, it suggests linking the patient.  
4. If there are multiple possible matches, it asks for further verification.  
5. If there is no match, a new identity is created.  
6. If there is uncertainty, the record remains provisional pending resolution.

## **13.3 Duplicate management dashboard**

Clinic Admin and authorized staff should have:

* Possible duplicate patients.  
* Patient matching requests.  
* Duplicate review.  
* Merge requests.  
* Merge history.  
* Identity correction requests.

Merging must be controlled, logged and reversible through a governed correction process.

Important: Merging patient identities must not merge separate clinics' financial transactions, clinical authorship or ownership of records.

## **13.4 Provisional patient accounts**

We should support a provisional patient profile.

For example, an emergency patient arrives and cannot provide a verified phone number.

Reception can create:

`TEMP-PATIENT-0001`

The clinic attends to the patient.

Later, when identity is verified, the provisional record can be linked to the permanent VEMTAP Patient ID.

This avoids delaying treatment.

# **14\. CLINIC QR CODE ARCHITECTURE**

We should not generate only one generic QR code for everything.

The QR system should be configurable.

## **14.1 QR types**

| QR code | Purpose |
| ----- | ----- |
| Clinic QR | Opens clinic information and available services |
| Branch QR | Identifies a particular branch |
| Patient check-in QR | Starts patient check-in |
| Appointment QR | Opens appointment booking |
| Optical QR | Opens optical service entry |
| Patient identity QR | Identifies an authenticated patient |
| Public queue QR | Opens permitted queue information |

## **14.2 QR generation rules**

When a clinic is activated, VEMTAP generates its clinic-specific QR assets.

Each branch can generate its own QR codes.

A QR code must contain a secure, non-sensitive identifier or signed reference, not medical records, passwords or patient information.

A patient identity QR must not expose medical records to someone who scans it.

Instead, it should resolve to a secure verification process.

## **14.3 QR management**

Clinic Admin should be able to:

* View QR codes.  
* Download QR codes.  
* Print QR codes.  
* Regenerate QR codes.  
* Disable compromised QR codes.  
* Assign QR codes to branches.  
* Track check-in usage.  
* View QR activity analytics.

# **15\. HOW CLINIC STAFF CAN WORK ACROSS DIFFERENT BRANCHES**

Consider a doctor who works at Flourish Wuse and Flourish Gwarinpa.

They should have one VEMTAP staff account.

When they log in, they should see their assigned clinic and branches.

They can switch branches only where authorized.

Their dashboard should reflect:

* Assigned branch.  
* Today's appointments.  
* Assigned patients.  
* Consultation queue.  
* Branch availability.  
* Relevant clinical records they are authorized to access.

The clinic owner can assign or remove their branch access.

If a staff member leaves the clinic, the owner can revoke access without deleting the staff member's central VEMTAP account.

The staff member can still retain their separate professional account and any other valid clinic affiliations.

# **16\. CLINIC SUBSCRIPTION AND ACCOUNT CONTROL**

We need a clear relationship between VEMTAP subscription and clinic operations.

## **16.1 Subscription belongs to the clinic organization**

Not to each individual staff member.

For example:

Flourish iClinic subscribes to Growth.

That subscription covers the organization according to the plan limits.

Possible limits include:

* Number of branches.  
* Number of staff accounts.  
* Patient records.  
* OCR usage.  
* WhatsApp notifications.  
* Optical inventory.  
* Reporting.  
* Storage.  
* API integrations.

Some limits may be unlimited depending on the selected plan.

## **16.2 Subscription changes**

Clinic Admin can:

* View current plan.  
* Upgrade plan.  
* Downgrade plan.  
* View billing history.  
* Pay invoices.  
* View renewal date.  
* Request cancellation.

Super Admin controls platform-wide subscription configuration.

## **16.3 What happens when a subscription expires?**

The platform should not delete patient records or clinical histories.

Instead:

* Notify the clinic before expiry.  
* Notify authorized clinic administrators.  
* Apply the appropriate plan restrictions.  
* Preserve access to necessary records.  
* Provide a billing recovery period where configured.  
* Restrict new paid features or certain operations according to the agreed subscription policy.

Emergency care and access to existing patient records should not be casually blocked because of a subscription issue.

# **17\. HOW VEMTAP HANDLES PATIENTS WHO DO NOT BELONG TO ANY CLINIC YET**

This is another important opportunity.

A patient should be able to join VEMTAP before visiting any clinic.

For example:

John visits:

`vemtap.com/patient/register`

He creates an account.

He receives Patient ID:

`VPT-000001`

His dashboard is initially empty.

He can then:

* Search for VEMTAP-powered eye clinics.  
* View clinic profiles.  
* View available services.  
* Compare clinic information.  
* Book an appointment.  
* Select a branch.  
* View appointment details.

When he books an appointment at Flourish iClinic, the platform creates the clinic relationship.

When he arrives, he checks in.

This means VEMTAP can acquire patients independently of individual clinics.

It also creates a future patient discovery network.

However, a patient account without a clinic relationship must not be treated as having received care or having a medical record at a clinic.

# **18\. CLINIC DISCOVERY AND PATIENT ACQUISITION**

We should build a public directory of clinics operating on VEMTAP.

A patient should be able to:

1. Open VEMTAP.  
2. Search for eye clinics.  
3. Find clinics by location.  
4. View clinic information.  
5. View available branches.  
6. View services.  
7. View operating hours.  
8. View appointment availability.  
9. Book appointments.  
10. Access the clinic's check-in link.

A clinic should have a public profile containing:

* Clinic name.  
* Logo.  
* Description.  
* Address.  
* Branch locations.  
* Contact details.  
* Services.  
* Available doctors, where published.  
* Appointment booking.  
* Patient reviews, if enabled.  
* Official website and social links.

The clinic should control what public information is displayed.

This is also where the original VEMTAP customer discovery and engagement capabilities can be adapted into healthcare patient acquisition.

# **19\. DATA STRUCTURE: HOW EVERYTHING MUST CONNECT**

For developers, this is the underlying architecture we need to establish before building the frontend workflows.

We should use a multi-tenant architecture.

This means each clinic organization has its own isolated operational environment, while certain platform services are shared.

## **19.1 Main entities**

| Entity | What it represents |
| ----- | ----- |
| Platform User | A person with a VEMTAP login |
| Patient Identity | Central patient identity |
| Clinic Organization | A registered clinic |
| Branch | A clinic's physical location |
| Staff Membership | A user's relationship with a clinic |
| Role | Assigned staff role |
| Permission | Specific allowed actions |
| Clinic Patient | Patient relationship with a clinic |
| Medical Record | Clinical information |
| Appointment | Scheduled visit |
| Encounter | Actual clinical visit |
| HMO Membership | Patient insurance details |
| HMO Agreement | Clinic's contractual arrangement |
| HMO Plan | Insurance plan and benefits |
| Invoice | Amount billed |
| Payment | Money collected |
| HMO Claim | Amount submitted to insurer |
| Optical Order | Lens or frame order |
| Prescription | Doctor-issued prescription |
| QR Asset | Clinic/branch entry point |
| Consent Record | Permission to share data |
| Audit Event | Record of system activity |

## **19.2 Important relationships**

* One platform user can have multiple clinic staff memberships.  
* One clinic organization can have multiple branches.  
* One branch can have multiple staff members.  
* One central patient identity can have multiple clinic relationships.  
* One clinic patient relationship can have many encounters.  
* One encounter can have many clinical records, orders and bills.  
* One patient can have multiple HMO memberships over time.  
* One clinic can have multiple HMO agreements.  
* One HMO can have multiple plans.  
* One HMO plan can have multiple coverage rules.  
* One patient can authorize access to selected records by another provider.  
* Every clinical and financial transaction must preserve its source clinic and branch.

## **19.3 Separate identity from authorization**

Having a VEMTAP account does not automatically give a person access to every clinic.

For example:

* A patient has a central login.  
* Flourish grants that patient access to its patient portal relationship.  
* Another clinic establishes its own relationship.  
* A doctor has a central staff login.  
* Flourish grants the doctor professional access.  
* A second clinic can separately invite the same doctor.

Each relationship must have its own authorization rules.

# **20\. SECURITY, PRIVACY AND DATA PROTECTION**

Because we are handling healthcare information, this must be part of the foundation, not something we add at the end.

The system should implement:

Identity security

* Verified phone numbers and emails.  
* Secure password storage.  
* Two-factor authentication.  
* Session expiration.  
* Login alerts.  
* Account recovery.  
* Protection against unauthorized access.

Role-based access control

* Staff only access permitted modules.  
* Doctors access assigned clinical workflows.  
* Reception accesses registration and check-in information.  
* Cashiers access authorized financial information.  
* Clinic administrators manage their organization.  
* Super Admin access is restricted and audited.

Patient privacy

* Patient consent management.  
* Medical record access requests.  
* Cross-clinic sharing permissions.  
* Consent withdrawal.  
* Access history.  
* Emergency access controls.

Data security

* Encryption in transit and at rest.  
* Secure document storage.  
* Backups and disaster recovery.  
* Audit trails.  
* Data retention policies.  
* Secure API authentication.  
* Tenant isolation.

The implementation should be reviewed against applicable Nigerian data protection and healthcare confidentiality requirements, including the Nigeria Data Protection Act.

# **21\. WHAT HAPPENS WHEN A CLINIC MOVES FROM ECMS TO VEMTAP?**

Since the eye clinic we are working with already uses ECMS, we must provide a migration process.

We should not expect the clinic to abandon its existing records and start from zero.

## **Migration workflow**

1. Clinic provides existing data  
   Patient records, appointments, medical history, HMO information, inventory, lens catalogue, financial records and other relevant information.  
2. VEMTAP reviews available export formats  
   Excel, CSV, database exports, documents and authorized integration methods.  
3. Data mapping  
   Match ECMS fields to VEMTAP fields.  
4. Patient matching  
   Detect duplicates and identify existing VEMTAP patient identities where possible.  
5. Data cleaning  
   Identify missing information, invalid dates, duplicate records and inconsistent identifiers.  
6. Test migration  
   Import a controlled sample and compare it against ECMS.  
7. Clinic validation  
   Authorized clinic personnel confirm that the migrated information is correct.  
8. Final migration  
   Import approved information and preserve original record references and provenance.  
9. Go-live  
   Activate VEMTAP for the clinic and monitor operations.

We should also support a controlled transition period if the clinic needs to operate both systems temporarily.

Do not assume that we can connect to ECMS through an API without first obtaining its technical documentation and integration permission.

# **22\. IMPORTANT EXCEPTION SCENARIOS WE MUST DESIGN FOR**

A complete platform must account for situations outside the normal workflow.

| Situation | Expected VEMTAP behaviour |
| ----- | ----- |
| Patient has no phone | Reception creates a provisional patient record |
| Patient forgets password | Secure account recovery |
| Patient visits another clinic | Existing identity is matched and new clinic relationship created |
| Patient changes phone number | Verify new number and update identity |
| Two patients have similar names | Do not automatically merge |
| Patient has no HMO card | Manual verification workflow |
| HMO API is unavailable | Authorized manual verification |
| Internet goes down | Supported offline workflows and later synchronization |
| Doctor works at two clinics | One staff login, separate clinic permissions |
| Staff leaves clinic | Revoke clinic membership and sessions |
| Clinic opens a new branch | Add branch under existing organization |
| Clinic is suspended | Restrict organization operations according to policy while preserving records |
| Patient loses access to phone | Alternative identity verification |
| Patient requests records | Authenticated records access/export workflow |
| Patient requests record correction | Controlled amendment and audit trail |
| HMO rejects claim | Rejection review and resubmission |
| Lens production is delayed | Update tracking and notify patient |
| Patient requires emergency treatment | Emergency workflow without unnecessary registration delays |

# **23\. COMPLETE PLATFORM USER JOURNEYS**

Here are the major journeys that the product must support from beginning to end.

## **Journey A — VEMTAP brings a clinic onboard**

VEMTAP Sales → Super Admin → Add Clinic → Clinic Invitation → Owner Activation → Clinic Setup → Branch Creation → Staff Invitations → HMO Configuration → QR Generation → Clinic Activation → Dashboard.

## **Journey B — Clinic registers itself**

Public Website → Register Clinic → Verify Email/Phone → Clinic Details → Branch Setup → Select Plan → Invite Staff → Configure Operations → Verification → Activation → Dashboard.

## **Journey C — Clinic registers a new patient**

Patient Arrives → QR/Reception → New Patient Registration → Identity Matching → Patient ID Creation → Clinic Relationship → HMO/Private Selection → Visit Purpose → Check-In → Queue → Consultation.

## **Journey D — Returning patient checks in**

Patient Arrives → Scan Clinic QR → Identify Existing Patient → OTP Verification → Confirm Details → Select Visit Purpose → HMO/Private Confirmation → Check-In → Queue → Doctor.

## **Journey E — Patient independently joins VEMTAP**

Public Website → Patient Register → Verify Identity → Patient ID Generated → Patient Dashboard → Search Clinics → Select Clinic → Book Appointment → Clinic Relationship Created → Visit.

## **Journey F — Patient visits another VEMTAP clinic**

Patient Arrives at New Clinic → Scan QR → Existing VEMTAP Login → Verify Identity → Identify Patient ID → Create New Clinic Relationship → Check-In → Consultation → Request External Records, If Needed → Patient Consent → Authorized Records Access.

## **Journey G — Clinic hires a doctor already on VEMTAP**

Clinic Admin → Staff Management → Invite Existing User → Doctor Receives Invitation → Accepts → Clinic Membership Created → Role Assigned → Branch Assigned → Doctor Dashboard.

## **Journey H — Clinic opens a second branch**

Clinic Admin → Branch Management → Add Branch → Branch Details → Assign Manager → Assign Staff → Configure HMOs → Configure Prices → Generate Branch QR → Activate Branch.

## **Journey I — Doctor recommends optical treatment**

Patient Check-In → Doctor Consultation → Eye Examination → Lens Prescription → Optical Order → HMO/Private Calculation → Production → Quality Check → Patient Notification → Pickup → Completion.

# **24\. WHAT EACH ACCOUNT SHOULD BE ABLE TO SEE**

This is the proposed account-access matrix.

| Information / Action | Super Admin | Clinic Admin | Branch Manager | Doctor | Reception | Patient |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| Platform clinics | Yes | No | No | No | No | Public listings |
| Clinic settings | No direct operational control | Yes | Limited | No | No | No |
| Branch management | Platform oversight | Yes | Assigned branch | No | No | No |
| Staff management | Platform-level | Yes | Assigned staff | No | No | No |
| Patient registration | No routine care | Yes | Permitted | Limited | Yes | Self |
| Clinical records | Restricted support access | Authorized scope | Authorized scope | Assigned scope | Limited | Own permitted records |
| Appointments | Platform analytics | Yes | Assigned branch | Own schedule | Yes | Own appointments |
| HMO agreements | Global configuration support | Yes | Assigned branch | Relevant coverage | Verification | Own membership |
| Claims | Platform monitoring | Yes | Assigned branch | Clinical documentation | Limited | Own claim status |
| Billing | Platform subscription | Yes | Assigned branch | Relevant consultation | Authorized tasks | Own bills |
| Optical operations | Platform catalogues | Yes | Assigned branch | Recommendations | Limited | Own orders |
| Clinic reports | Platform-level usage | Yes | Assigned branch | Clinical reports | Limited | Own history |
| Subscription | Platform control | Own clinic | No | No | No | No |

This is a starting permission matrix. Detailed permissions should be configurable, and the exact clinical scope should follow professional responsibility and clinic policy.

# **25\. RECOMMENDED IMPLEMENTATION ORDER**

We should not try to build every account and workflow at the same time.

The best approach is to establish the underlying architecture first, then build each workflow on top of it.

## **Development roadmap**

Phase 1

Platform foundation and identity

* Multi-tenant architecture.  
* Super Admin.  
* Clinic organization.  
* Clinic registration.  
* Branch management.  
* User authentication.  
* Staff invitations.  
* Role and permission system.  
* Central patient identity.  
* Patient and clinic relationships.

Phase 2

Patient acquisition and frontdesk

* Patient self-registration.  
* Clinic-assisted registration.  
* QR check-in.  
* Clinic-specific links.  
* Patient matching.  
* OCR scanning.  
* Appointment booking.  
* Queue management.  
* Patient portal foundation.

Phase 3

Clinical operations

* Doctor dashboard.  
* Nurse dashboard.  
* Consultation workspace.  
* Eye examination records.  
* Diagnosis.  
* Prescriptions.  
* Medical history.  
* Clinical document management.  
* Follow-up management.

Phase 4

HMO and financial operations

* HMO master database.  
* Clinic HMO agreements.  
* Patient HMO membership.  
* Coverage engine.  
* Eligibility verification.  
* Billing calculation.  
* Claims management.  
* Authorization workflow.  
* Receivables and reconciliation.  
* Accounting.

Phase 5

Optical and pharmacy

* Lens catalogue.  
* Frames catalogue.  
* Optical inventory.  
* Lens production tracking.  
* Pharmacy.  
* Drug inventory.  
* Procurement.  
* Returns and stock transfers.

Phase 6

Patient experience and integrations

* Patient mobile experience.  
* Cross-clinic record sharing.  
* Patient notifications.  
* WhatsApp integration.  
* SMS integration.  
* Payment gateways.  
* HMO APIs.  
* ECMS migration.

Phase 7

Enterprise intelligence

* Multi-branch analytics.  
* Advanced accounting.  
* AI automation.  
* Predictive queue analytics.  
* Inventory forecasting.  
* Advanced security monitoring.  
* Business intelligence.

These are implementation stages, not a reason to delay essential privacy, audit, backup and access-control requirements until later.

# **26\. IMPORTANT: WHAT WE SHOULD BUILD FIRST FOR FLOURISH iCLINIC**

I recommend using Flourish iClinic as our first implementation partner and pilot environment.

Rather than trying to onboard ten clinics immediately, we should establish that the complete architecture works for one clinic first.

### **Pilot implementation**

| Stage | What we implement |
| ----- | ----- |
| 1 | Create Flourish iClinic on Super Admin |
| 2 | Invite clinic owner |
| 3 | Configure its primary branch |
| 4 | Invite its existing staff |
| 5 | Configure HMOs and private pricing |
| 6 | Import existing patient records from ECMS |
| 7 | Generate clinic and branch QR codes |
| 8 | Test new patient registration |
| 9 | Test returning patient check-in |
| 10 | Test HMO verification and billing |
| 11 | Test doctor and nurse workflows |
| 12 | Test optical and pharmacy workflows |
| 13 | Test patient portal |
| 14 | Test another clinic's patient relationship and consent-based record sharing |
| 15 | Test reports, audit and multi-branch operations |

Before production, validate the patient identity matching, access isolation, financial calculations, clinical records and migration results.

Once Flourish works properly, we can onboard other eye clinics using the same architecture.

# **27\. FINAL PRODUCT DECISIONS WE SHOULD ADOPT**

These are the architectural decisions I recommend treating as the foundation of VEMTAP Eye Clinic.

| Area | Recommended decision |
| ----- | ----- |
| Platform | One VEMTAP healthcare platform |
| Clinics | Multiple independent clinic organizations |
| Branches | Multiple branches per clinic |
| Clinic registration | Both assisted and self-service |
| Clinic owner | Organization administrator |
| Staff accounts | Central user accounts with clinic memberships |
| Patient accounts | One central VEMTAP patient identity |
| Patient registration | Self-registration and clinic-assisted |
| Patient without login | Can still receive treatment |
| Patient ID | One permanent VEMTAP Patient ID |
| Clinic patient number | Separate number for each clinic |
| Patient visiting multiple clinics | Same central account, separate clinic relationships |
| Medical records | Attributed to originating clinic and professional |
| Cross-clinic records | Permission-based sharing |
| QR codes | Clinic-specific and branch-specific |
| HMO | Central master database, clinic-specific agreements |
| Pricing | Supports clinic, branch, HMO and plan-specific rules |
| Subscriptions | Organization-level |
| Staff permissions | Role-based and configurable |
| Analytics | Clinic, branch and platform levels |
| Security | Tenant isolation, encryption, consent and audit trails |

## **My final recommendation: Build VEMTAP around three connected layers**

Layer 1 — VEMTAP Platform

Super Admin, clinic registration, subscriptions, global configurations, integrations, security and platform monitoring.

Layer 2 — Clinic Operations

Clinic owners, branches, doctors, nurses, reception, HMO, optical, pharmacy, accounting and daily clinic operations.

Layer 3 — Patient Network

Central patient identity, patient portal, appointments, QR check-in, medical records, record sharing and multi-clinic healthcare access.

One connected healthcare ecosystem

The most important decision is that patients belong to the VEMTAP patient network, while their individual clinic relationships and clinical records remain properly separated and protected.

This gives us something much more valuable than a conventional eye clinic management system.

It gives us a platform where clinics can independently manage their businesses, healthcare professionals can work across authorized clinics, and patients can maintain continuity of care without creating a new account every time they visit a different VEMTAP-powered clinic.

That should be the foundation on which we build everything else.

