## **PARENT/GUARDIAN** 

## **The recommended account structure**

We should distinguish between three things:

1. Parent/Guardian Account: The account used to log in.  
2. Child Patient Profile: The child's individual identity and medical record.  
3. Guardian Relationship: The permission connecting the parent or guardian to the child's profile.

Parent / Guardian Account

One login using phone number or email  
Manages multiple child profiles

Child 1

Individual patient IDOwn medical recordsAppointments and prescriptions

Child 2

Individual patient IDOwn medical recordsAppointments and prescriptions

Parent's own patient profile

The parent can also be a patient independently.

For example:

A mother registers on VEMTAP with her phone number. She adds her three children.

* The mother has her own patient identity.  
* Child 1 has a separate patient identity.  
* Child 2 has a separate patient identity.  
* Child 3 has a separate patient identity.

She logs in once and switches between the profiles.

Important: The children must not share one medical record. Each child has their own patient ID, consultation history, eye examination results, prescriptions, diagnoses, appointments and bills.

## **2\. How the registration process should work**

We should support two routes.

### **Route A: Parent registers first**

1. Parent creates a VEMTAP account  
   Registers with a phone number or email address. At least one is required.  
2. Selects their account relationship  
   The parent can use their own patient profile or manage a child.  
3. Adds a child  
   Enters the child's name, date of birth, gender and other required information.  
4. VEMTAP creates a child patient profile  
   The system generates a unique patient ID for that child.  
5. Parent becomes the authorised guardian  
   The parent can manage the child's appointments, information and permitted medical records.  
6. Parent can add more children  
   There is no need to create another login account for each child.

### **Route B: Child visits a clinic with a parent**

This is particularly important for clinics such as Flourish iClinic.

1. Child arrives at the clinic  
   The parent may have an existing VEMTAP account, or may not have one.  
2. Reception searches for the child  
   Search using the child's patient ID, verified details or guardian's account information.  
3. If the child already has a profile  
   The clinic locates the existing profile and verifies the accompanying parent's authority to manage it.  
4. If the child does not have a profile  
   Reception can register the parent and child together, or create an assisted/provisional child profile and link the guardian.  
5. Child gets an individual clinic record  
   The child's medical history and clinical activities are recorded under the child's identity, not the parent's.

This means a clinic can onboard a child even when the parent has never used VEMTAP before.

## **3\. What happens when the child visits another VEMTAP clinic?**

This is where our central patient identity becomes particularly important.

Imagine a child is registered at Flourish iClinic. Six months later, the parent takes the child to another VEMTAP clinic.

The second clinic should not create another VEMTAP patient identity.

Instead:

1. The parent logs into their existing account.  
2. Selects the child's profile.  
3. The parent checks in at the new clinic.  
4. The new clinic creates its own local patient relationship for that child.  
5. The child retains the same central VEMTAP Patient ID.  
6. The new clinic does not automatically gain access to the child's records at Flourish.  
7. If records are needed, the parent authorises the appropriate record-sharing request.

The child's records remain independent of the clinics, and each clinic maintains its own clinical history and authorship.

## **4\. What should the parent be able to do?**

The parent/guardian area should be a proper section of the patient portal.

[Ascension One \| Ascension](https://images.openai.com/static-rsc-4/1FGjtmpv3w4Hxz0lpWw2p1oajf4Q4wZoVxW32K8GjOf3xNwbtqIjk9Uswj8K6Od_95BEJHX7_j1EV0zzJLhHAmcNR53wq2RGAILkSDn5Zoq5rounMd6eY9FH6ds4Jl0TUg6Vku5JCiDIbXblBuBsk45L9nIIp59LxvaCD-7UI20?purpose=inline)  
[healthcare.ascension.org](https://healthcare.ascension.org/ascension-one?utm_source=chatgpt.com)

| Feature | Parent/Guardian capability |
| ----- | ----- |
| Add child | Create another child profile |
| Switch profile | Switch between own profile and children's profiles |
| Appointments | Book, reschedule and cancel appointments |
| Medical records | View permitted records for each child |
| Prescriptions | View prescriptions and treatment instructions |
| Eye examination | View vision test and eye examination history |
| Optical orders | Track glasses, lenses and collection status |
| Billing | View and pay bills |
| Notifications | Receive appointment and treatment reminders |
| Record sharing | Approve or reject requests from other clinics |
| Guardian management | Manage authorised access and relationships |

The parent should always know which child's profile they are currently managing. We should make the active child's name and profile photo clearly visible throughout the portal to reduce the risk of entering information under the wrong child.

## **5\. What happens when the child grows up?**

We should plan for this from the beginning.

A child who was previously managed by a parent may eventually become capable of managing their own VEMTAP account.

I recommend a transition-to-independent-account process.

* The child can create or activate their own login when they meet the applicable age and consent requirements.  
* Their existing patient identity and medical history remain intact.  
* The parent does not lose access automatically without the applicable consent and legal requirements being considered.  
* The child's account becomes independently managed when appropriate.  
* Any continued parental access must be governed by the applicable consent and authority rules.

We should not hardcode an age threshold into the application yet. It should be configurable following the appropriate legal and clinical review.

## **6\. What the developer must include**

This is not just a frontend screen. It affects the platform's identity architecture, patient database, permissions, registration, appointments and medical records.

I would give the developer the following requirements.

Developer requirement

Feature: Parent/Guardian and Child Patient Management

Implement a parent/guardian management system within the existing VEMTAP Eye Clinic architecture.

A. Account architecture

* A parent or guardian must have one VEMTAP login account.  
* A guardian must be able to manage multiple children from the same account.  
* Each child must have a separate patient profile and unique VEMTAP Patient ID.  
* The parent/guardian must have a separate identity from each child.  
* A parent can also be a patient independently.  
* Do not create a separate login account for every child by default.

B. Patient registration

* Add a registration option for "Register myself" and "Register a child".  
* Allow a parent to add multiple children.  
* Capture the child's required demographic details.  
* Capture the guardian's relationship to the child.  
* Support clinic-assisted registration where reception creates the child profile and links the guardian.  
* Support provisional child records where the guardian cannot immediately complete registration.

C. Patient portal

* Add a Family / Dependants section.  
* Display all children connected to the guardian.  
* Include an Add Child action.  
* Include a Switch Profile function.  
* Show the active child's name and patient ID clearly.  
* Ensure appointments, records, prescriptions, bills and optical orders are associated with the correct child.

D. Clinic dashboard

* Allow reception to register a child through a guardian.  
* Allow reception to search for existing child profiles.  
* Prevent duplicate patient identities.  
* Allow a guardian relationship to be verified and recorded.  
* Allow clinic staff to assist parents who do not have VEMTAP accounts.  
* Ensure clinical staff document consultations under the child's profile.

E. Permissions and privacy

* Keep each child's medical records separate.  
* Do not automatically expose one clinic's records to another clinic.  
* Support guardian-authorised record sharing.  
* Record who created, updated, viewed or shared a child's information.  
* Support multiple authorised guardians where appropriate.  
* Support guardian access review, revocation and transition to independent account management.

F. Future-proofing

* Support a child transitioning to an independent patient account without creating a new patient identity.  
* Preserve the child's entire medical history during the transition.  
* Make age thresholds and applicable consent rules configurable.  
* Never delete or transfer clinical records simply because a child becomes independently managed.

Important: This feature must be integrated into the existing patient identity, registration, reception, appointment, medical records, patient portal and permission architecture. It must not be implemented as a disconnected family dashboard.

## **7\. Screens we need to add to the design**

We should make sure Google Stitch includes these screens in the relevant portals.

[Como incluir um ou mais dependentes?](https://images.openai.com/static-rsc-4/_3JcIvqEnBblp7Q6GCrwiXQv9dh8cnCKVZb2YyPEGWJyf36gEM_AZ-BYXW4M-XM44UlMj1HlXd2Sv67UEJXqVfbCVbzgziC2BYnnvFHM2gb0tIaFLpwG8L6ktdr-aovytkWsSqTRmTLMN4o1LQMyX55aL_atVH3Im3b7IBgzJnM?purpose=inline)

1\. Add Child Profile

Form for entering the child's details and linking the parent or guardian.

[MyUPMC \- Medical App \| MWM](https://images.openai.com/static-rsc-4/mHWVq3PiA52Czy1eBHLSZJa1gDqCfya024MfQCfq6rrzyfxv3vmh9acad9fKYGy6uaUBNNtkgK3-PCBAWe-q3S_5iT3rOqdKkM04vnuXUmh1DJmoxk8lQHylXNLoGUI0tG5aMtPDxIGEkdZgqE4I82JmTzdboi8cW8JLNc1iI2U?purpose=inline)

2\. Family / Dependants

List of children, their patient IDs and profile status.

[Hospital Britânico \| Sua saúde e a de sua família, sob controle](https://images.openai.com/static-rsc-4/UmNbaRXs7srB4M_8E9d-dTisgD3B2tBJ-7-27Vvhuyu3jxMpIwG6TtSo2eGgedU8Om9NHYJUbQuvZhgpcPYXu7UpmV2gcDQNWdI9EF3q2WzZi0OdoLWs3SLJf9-wT9kNcfRjheg_fL2LUaQkgmi8-tp6bDNKUPx_PWC3MJdSsfU?purpose=inline)

3\. Child Patient Dashboard

Appointments, eye examinations, prescriptions, records and optical orders.

[HealthMed \| One Intelligent Platform for Modern Healthcare Operations](https://images.openai.com/static-rsc-4/JqyahuL-i65EF-pzma0N9AxnHqrTw0VvR74U7iBmU84IZNwxtojW9BfcOYtLcT4YwugxVO4nimb79b7xNqfRUFO1YW-WBYc_kwp0fl7azyuV6KkxuPtr9Ar69r66x4fbQAuy8fG8Iv8XaMMj5oNIlUjIgiJmOEEoTeHwvGxtUKk?purpose=inline)

4\. Reception Child Registration

Clinic-assisted registration and guardian verification.

[AOK Mein Leben \- 건강 및 피트니스 앱 \| MWM](https://images.openai.com/static-rsc-4/KUl3-v6Bbk6JD96E6NnzBTiLCfal3DlGqmsOHid_3pdRs4sEIuo5RLU9dLM-f6rffJ4qbhkGs1n0WcBSwGJ6xzwx2DWU64dBgZC0CR68scZTQR6lU-L_R3Oit9W8GRg71qt-sYGszVpVPIQA3MWsT29jGPmLQWYaDX5iIJ7PHWw?purpose=inline)

5\. Guardian Consent and Record Sharing

Requests, approvals, access history and authorised guardians.

## **8\. Three decisions we should preserve**

I recommend these as the foundational rules:

1. One guardian account, multiple child profiles. No separate child login by default.  
2. One independent patient identity per child. Never combine a parent's and child's medical records.  
3. The same child identity across all VEMTAP clinics. A new clinic creates its own relationship with the child, not a duplicate VEMTAP identity.

One additional distinction is important: a parent, legal guardian or other authorised caregiver should not automatically be treated as interchangeable. The platform must record the relationship and authority under which someone manages a child's records.

This is the same basic account principle already accepted in our DHA planning: one guardian account can manage multiple children, while every child retains an independent patient profile and identity. We should carry that principle into VEMTAP Eye Clinic.

My recommendation: Add this to the core platform documentation now, before we finalise the Super Admin, Clinic Admin, Reception and Patient Portal designs. Otherwise, the developer may build a patient system that assumes every patient must register and log in independently, and we would have to restructure important parts later.

