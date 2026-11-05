# **Customisable Patient Registration Forms and Data Collection.**

Different clinics have different registration procedures. One eye clinic may collect only basic patient information, while another may collect occupation, referral source, next of kin, previous eye-care history, detailed HMO information or other specific details.

We should not force every clinic to use exactly the same registration form.

However, there is an important architectural distinction: VEMTAP should have a standard patient information structure, with customisable fields that each clinic can add to it.

That means we give clinics flexibility without destroying consistency across the VEMTAP patient network.

## **1\. How the system should work**

Every clinic gets a default VEMTAP registration form containing the standard fields.

The Clinic Owner or authorised Clinic Admin can then customise the form by:

* Adding new fields.  
* Removing optional fields from their form.  
* Making fields compulsory or optional.  
* Changing field labels.  
* Reordering fields.  
* Creating sections.  
* Adding instructions and descriptions.  
* Choosing which fields appear during different registration processes.

Example: Patient registration form builder

Flourish iClinic

Custom form

## **Patient Registration**

Standard VEMTAP fields plus clinic-specific information

Basic Information

Full Name \*

John Okafor

Date of Birth \*

12/06/1990

Phone Number \*

080...

Additional Clinic Information

Occupation

Engineer

How did you hear about us?

Referral

Previous eye surgery?

No

\* Required fields

Illustrative form preview

Clinic-configured

The same form configuration should drive the reception registration screen, QR registration page and relevant OCR review fields.

## **2\. Different forms for different stages**

I would go one step further. Rather than giving clinics one large form that they have to use everywhere, let them configure forms for different stages of the patient journey.

For example:

| Form | What the clinic can configure |
| ----- | ----- |
| New Patient Registration | Demographic information, contact details, occupation, next of kin |
| Reception / Visit Intake | Reason for visit, referral source, symptoms, appointment type |
| HMO Registration | HMO provider, plan, membership number, employer, policy details |
| Payment / Billing Intake | Payer details, payment method and required billing information |
| Child Registration | Child details, parent/guardian details and relationship |
| Follow-up Registration | Changes in contact information, new complaints and follow-up details |

A clinic can decide which forms it needs and which fields appear in each.

Important distinction: Payment transactions, invoices and clinical examination records should remain structured VEMTAP modules. A clinic can customise the information collected around those processes, but should not be able to replace or bypass essential payment controls or clinical data structures with arbitrary text fields.

## **3\. The field types clinics should be able to create**

The form builder should support different field types, not just text boxes.

Available custom field types

Short text

Names, occupation, ID references

Long text

Descriptions and additional notes

Dropdown

Choose one option from a list

Multiple selection

Select multiple options

Single selection

Choose one of several options

Date

Date of an event or registration

Number

Measurements or numerical values

Phone number

Contact information with validation

Email

Email address with validation

Checkbox

Yes/no or acknowledgement

File upload

Documents and supporting files

Image capture

Photographs and document images

For every field, the clinic should be able to configure:

* Field name and label.  
* Help text or instructions.  
* Required or optional.  
* Placeholder.  
* Default value, where appropriate.  
* Available options for dropdowns and selections.  
* Minimum and maximum values or character lengths.  
* Validation rules.  
* Whether it is visible to patients, reception or other authorised staff.  
* Whether it can be edited after submission.

## **4\. Make the form builder intelligent**

There are three additional capabilities I strongly recommend.

A. Conditional fields

Fields should be able to appear based on previous answers.

Example:

* Question: Are you registered with an HMO?  
* If Yes → Show HMO provider, plan and membership number.  
* If No → Hide those fields.

Another example:

* Is this patient a child?  
* If Yes → Show guardian details and relationship.  
* If No → Continue with the normal registration form.

B. Reusable form sections

A clinic should be able to create sections once and reuse them across different forms.

For example, an HMO information section could be used in new registration, reception intake and patient profile updates.

C. Branch-specific configuration

The clinic owner should decide whether all branches use the same form or whether a particular branch has additional fields.

For example, Flourish's main branch might collect additional referral information, while another branch uses the standard registration form.

I recommend supporting both clinic-wide forms and branch-specific overrides.

## **5\. Where these custom fields should appear**

This is essential to get right.

A custom field must not disappear after the patient submits the form. It should be available wherever an authorised staff member needs to see it.

For example:

* Patient profile → Additional Information.  
* Reception → Registration details.  
* Clinic Admin → Patient information.  
* Patient portal → Relevant information the patient is permitted to view.  
* OCR review → Matching custom fields where the scanned document contains that information.  
* Reports → Custom-field data where reporting is supported.

The system should also allow authorised staff to search and filter by selected custom fields.

For example, a clinic could search for patients whose referral source is `Doctor Referral`, or filter by a clinic-specific patient category.

## **6\. One important architectural rule: standard fields versus custom fields**

We must protect the central VEMTAP patient identity structure.

I recommend two categories:

Category 1

Standard VEMTAP patient fields

These are the common fields used to identify and manage patients across the VEMTAP network.

Examples:

* VEMTAP Patient ID  
* Full name  
* Date of birth  
* Gender  
* Verified phone number  
* Email address, where provided

These fields have standard internal definitions and cannot be deleted by a clinic.

Category 2

Clinic-specific custom fields

These are additional details collected by individual clinics.

Examples:

* Occupation  
* Referral source  
* Employer  
* Previous clinic attended  
* Clinic-specific patient number  
* Additional registration questions

These fields belong to the clinic and should not automatically become part of another clinic's patient registration form.

A clinic can change how standard fields are displayed, where appropriate, but should not change their underlying meaning or data structure.

For example, a clinic may label `Phone Number` as `Patient Contact Number`, but the system must still recognise it as the standard phone-number field.

This distinction is particularly important because a patient may visit multiple VEMTAP clinics.

The patient's central identity remains consistent, while each clinic can collect its own additional information.

## **7\. Form configuration should work with OCR and bulk imports**

This is where the different features we have discussed come together.

Suppose Flourish iClinic has an old registration card containing:

* Patient name  
* Date of birth  
* Phone number  
* Occupation  
* Employer  
* Referral source  
* Previous eye condition

The clinic has configured those additional fields in its registration form.

When reception scans that card:

1. OCR extracts the information.  
2. VEMTAP identifies the standard fields.  
3. It matches the remaining extracted information against the clinic's custom fields.  
4. It displays the original document alongside the extracted values.  
5. Reception corrects uncertain information.  
6. The system checks for duplicate patients.  
7. Reception confirms and saves.

The same applies to Excel imports. The column-mapping screen should allow imported columns to map to either standard VEMTAP fields or the clinic's existing custom fields.

If a column has no matching field, the administrator can create a new custom field or leave it unmapped for review.

This means clinics do not need to redesign their old records to fit VEMTAP.

## **8\. Form versioning and historical records**

One thing developers sometimes overlook is what happens when a clinic changes its registration form.

Imagine a clinic originally collects 10 fields. Six months later, it adds five more.

The system must not make old patient records appear incomplete simply because those new fields did not exist when the patients registered.

Therefore:

* Every published form should have a version.  
* New registrations use the current published version.  
* Existing records retain their original submitted values.  
* Changing a form must not delete historical information.  
* New required fields should not automatically invalidate existing patients.  
* The system should retain who changed the form and when.

I would also include a draft and preview mode so the clinic can test a form before publishing it.

## **9\. Exact developer instruction to add to the project**

Core feature specification

Required

# **Customisable Patient Forms & Field Builder**

Objective

Build a configurable form management system that allows each clinic to customise the information it collects from patients during registration, reception intake and other supported patient onboarding processes.

A. Default VEMTAP forms

* Provide standard patient registration forms.  
* Include the standard VEMTAP patient identity fields.  
* Allow clinics to add their own fields and sections.  
* Do not allow clinics to delete essential platform identity fields.  
* Allow standard field labels to be customised for display without changing their underlying data definitions.

B. Form Builder

Add a new configuration area under:

`Clinic Settings → Patient Forms & Fields`

Include:

* Create new form.  
* Edit form.  
* Duplicate form.  
* Preview form.  
* Save as draft.  
* Publish form.  
* Archive form.  
* Manage form versions.  
* Restore or duplicate an earlier configuration where appropriate.

C. Form types

Support independently configurable forms for:

* New patient registration.  
* Reception and visit intake.  
* HMO information collection.  
* Child and guardian registration.  
* Patient information updates.  
* Other approved clinic-specific onboarding processes.

Keep clinical examination templates, prescriptions and financial transaction structures in their respective modules. They should not be replaced by arbitrary registration fields.

D. Custom field types

Support:

* Short text.  
* Long text.  
* Number.  
* Date.  
* Phone number.  
* Email.  
* Dropdown.  
* Single-select.  
* Multi-select.  
* Checkbox.  
* File upload.  
* Image capture.

E. Field configuration

Allow authorised clinic administrators to configure:

* Field label.  
* Description/help text.  
* Placeholder.  
* Required/optional.  
* Default value.  
* Options.  
* Validation.  
* Minimum/maximum length.  
* Minimum/maximum numerical value.  
* Display order.  
* Section grouping.  
* Visibility by user role and registration channel, subject to privacy rules.  
* Editability after submission.

F. Conditional logic

Support conditional field visibility.

Examples:

* HMO selected → show HMO fields.  
* Patient is a child → show guardian details.  
* Referral selected → show referral source details.  
* Other selected → show an additional description field.

Allow multiple conditional rules where appropriate, with clear validation to prevent conflicting configurations.

G. Reusable sections

Allow clinics to create reusable field groups, such as:

* HMO information.  
* Next of kin.  
* Referral information.  
* Employer information.  
* Additional contact information.

Allow these groups to be reused across supported forms.

H. Branch configuration

* Allow clinic-wide default forms.  
* Allow authorised administrators to create branch-specific form variations.  
* Support inherited clinic-wide fields and additional branch-specific fields.  
* Do not create separate patient identities simply because branches collect different information.

I. Integration with onboarding channels

The same applicable form configuration must drive:

* Reception manual registration.  
* Patient QR self-registration.  
* Assisted registration.  
* OCR extracted-field review.  
* Excel/CSV column mapping.  
* Patient information update workflows.

Ensure the form is responsive on desktop and mobile.

J. Patient profiles and reporting

* Display custom information in a dedicated Additional Information section of the patient profile.  
* Make fields searchable or filterable where appropriate.  
* Support authorised reporting on custom-field values.  
* Respect role-based visibility and patient privacy.  
* Do not expose one clinic's custom information to another clinic by default.

K. Data architecture and history

* Maintain standard patient identity fields separately from clinic-specific custom fields.  
* Give every custom field a stable internal identifier.  
* Associate custom values with the correct clinic and patient relationship.  
* Preserve form versions and historical submissions.  
* Never delete existing patient data when a form changes.  
* Record field creation, editing, publishing and archival actions.  
* Ensure custom field values remain available even if a field is later archived.

L. Integration with patient migration

* Map OCR-extracted values to standard and custom fields.  
* Allow staff to create new custom fields during migration review where authorised.  
* Support mapping spreadsheet columns to existing custom fields.  
* Flag unmapped or incompatible data for review.  
* Preserve the original source document and import history.

Frontend implementation requirements

* Build the complete form builder interface.  
* Build the field configuration interface.  
* Build conditional logic configuration.  
* Build form preview and publishing workflows.  
* Demonstrate different clinics using different registration forms.  
* Demonstrate the same form working on reception and QR registration.  
* Use realistic sample data and simulated interactions.  
* Integrate with existing patient profiles and migration screens.  
* Frontend only; do not build backend services or claim persistence is operational.

Acceptance criteria

Demonstrate two clinics with different registration requirements. Each clinic must be able to configure its own fields, publish its form and use that configuration in manual registration, QR registration, OCR review and bulk-import mapping without affecting the other clinic.

## **10\. My final recommendation**

I would make this a central part of the VEMTAP platform, not a small settings feature.

The overall architecture now looks like this:

## **VEMTAP Patient Onboarding Architecture**

OCR scanning

Paper cards and forms

Bulk import

Excel and CSV

Manual entry

Reception registration

QR registration

Patient self-service

Clinic-specific form configuration

Standard fields \+ custom fields \+ conditional rules

Validation, review and identity matching

Check information, resolve duplicates and verify guardian relationships

VEMTAP Patient Identity \+ Clinic Patient Record

Central patient identity, clinic-specific information and preserved history

I would also establish one rule for the whole product:

VEMTAP standardises how patient identities and core records are managed, but allows each clinic to customise how it collects additional patient information.

That is the balance we want: flexibility for clinics without fragmenting the patient network.

This should be added to the main architecture and developer documentation before we finalise the patient registration and reception designs.

