## **1\. The four patient onboarding methods**

These should all be available from the Clinic Dashboard, particularly under Patients → Add / Import Patients.

[Comment numériser des dossiers médicaux papier avec votre téléphone \| doctoLys](https://images.openai.com/static-rsc-4/uAU3DzSL7595acdLdkfhO3SuOTf6EfOw4MhbIf_lzeL-w54NIizTxHQj5GYFs4S4nFjG2iwlucW-AqorA8GIUlbBMXHykkovBxz6mFClJz9SDfYyzOqPFRmsw9oVufnge4yldqVXHU97n1JOweG9Z6denbP29KWZNLFVcX-ASJI?purpose=inline)

A. Scan paper records

OCR-assisted

Photograph patient cards, registration forms, case files and other paper documents. Extract the information into digital fields.

[DeliverHealth Blog \- Healthcare AI Insights & Updates](https://images.openai.com/static-rsc-4/I5V9GiEiX6HByBHNeiRnSqmAjicL-NQNEoG4JfSP4xFBilVu4snKkaXW61EVgZWKiJK21NMQKfKUkvZS4Ht2YjAPNEeGarwCn9xjVrZkAe1_pgxGYKu6a4ynNRJdCSgLQayuUdwR7CnWCyi2sqDWoTUEbBBnflqZa2i-F4-vmJQ?purpose=inline)

B. Upload Excel or CSV

Import hundreds or thousands of existing patient records in batches, with column mapping and validation.

[How to Reduce Data Entry Errors in Prime Clinical \| Clean Intake Data](https://images.openai.com/static-rsc-4/oQXn6VPMJgLtgoK2lFUpw4f6o-q2G12SZ1HzA-wGQiaIEIrlQMER01UjleTL6jmZMCkPQYkxAygeviL0v5E8lFmdDfJCckN3bTNLcx185bRCtKYOy2BUNDLfDrTwlEmHkpUWAcQXOIj36EjianJfNBToSRRr9WVawJBEuUyVuew?purpose=inline)

C. Manual registration

Staff search for an existing patient or create a new patient profile by entering the information directly.

[QR Codes for Healthcare: HIPAA-Compliant Forms \| QR Master](https://images.openai.com/static-rsc-4/39Rz2iA_ohQdGFqQdiHM5rSuWVCeg7_G3-a2VX8PJ89Oyx213hVlyZqYI-h57zktOUCP3m78ytONbT7QcR-kzY9LzhTLKVqaZ04ORV7M9sXNqCCSZRizrXt62Cg3thyD5JLDDXqwheUqJIn6PXMeuAJj1kzCiE5Jt-HlLxGZOGk?purpose=inline)

D. Patient self-registration

Patient scans the clinic QR code, completes the registration form and submits their details to the clinic.

The important point is that these are different ways of collecting information, not different types of patient accounts.

## **2\. OCR scanning: the intelligent paper-to-digital process**

This is the part that deserves the most attention because it can solve a major problem for clinics with large paper archives.

Imagine Flourish iClinic has 5,000 existing paper patient cards. A receptionist should not have to open the patient record and type every field manually.

Instead, the receptionist opens the VEMTAP dashboard on a computer or phone, selects Scan Existing Patient Record, and photographs the card.

[Как отсканировать документы через смартфон или планшет](https://images.openai.com/static-rsc-4/lh-pZBYs5qolimafQEYWHxiDxrTg9aNPLDZ2NQuhaKVNrcmYSdPrYG5ysF8s8QhFzHv9-qNNwZxN6bnyij53vhh5RIjqKNvikN9Le1SMthdaQKoEmyRMgcehMdY6gSF3Jn64UqZpNGB2t_KyVR42xhYqMt23lV0Du5g-DoQpg98?purpose=inline)  
[左手医生病历OCR识别及结构化数据处理系统\_医疗文档自动识别-云巴巴 \-云巴巴](https://images.openai.com/static-rsc-4/WUrJuEBGdInTWuHuO8WloCl3_-6CMB8ge2ifBvZQVIy1PHUP5k_I4DcA30m1dZgBSHmdqsTjrgEnbC1LjM3juSVsNmtFeTKdf7hGf-4phFKL14PY5qKvgC70IkJb5I1ykqluByv_OHv7s3j23qMQnsl1GOhpaVxDcBIzvbP_YAY?purpose=inline)  
[Need a scanner? The Google Drive app has one built in…](https://images.openai.com/static-rsc-4/Vc9BsrAUTYYVT90s79GrazlV-g5FI9VLMY1DwzFwjhlyx7keEskKFo4Pot2HHpigMFvukqjNAfUpIvOwIYE02sDojpmxNP0qe51JeuYn8Qz23M_jv5EowiQc6Tnuj6VTJSA6qfoc6t-7wj-7Saedn8cYJuGrKWFxclu13-Biknw?purpose=inline)  
7

### **Exact OCR workflow**

1. Open the scanner  
   Clinic Dashboard → Patients → Import Patients → Scan Paper Record.  
2. Capture the document  
   Staff can use a phone camera, laptop camera or upload an existing image or PDF.  
   Support multiple pages, front and back of a patient card, and several documents belonging to the same patient.  
3. Improve the image automatically  
   The system should detect document edges, crop, rotate, correct perspective, improve contrast and reduce image noise where possible.  
4. Extract the information  
   OCR and document recognition identify the fields and attempt to extract:  
   * Full name  
   * Date of birth or age  
   * Gender  
   * Phone number  
   * Email, if available  
   * Address  
   * Existing clinic patient number  
   * HMO/provider and membership number  
   * Registration date  
   * Relevant clinical information, where the document contains it  
5. Compare extracted information with the original  
   Display the original document beside the extracted information. When staff select a field, highlight the corresponding area of the scanned document where possible.  
6. Flag uncertain information  
   The system highlights fields that are unclear, incomplete, inconsistent or potentially misread.  
7. Staff correct and confirm  
   The receptionist checks the original document, edits the extracted value and confirms the record.  
8. Check for existing patients  
   VEMTAP checks whether the patient may already exist in the central patient network or in that clinic's records.  
9. Save the record  
   After verification, VEMTAP creates a new patient profile or links the information to an existing verified patient identity. The original scanned document is retained according to the clinic's document-retention rules.

### **The character recognition problem you identified**

This is particularly important for Nigerian clinics because handwritten records, old patient cards and inconsistent handwriting can make OCR unreliable.

The system must not silently assume that a character is correct.

Examples:

| What the system reads | Possible alternatives |
| ----- | ----- |
| I | I, L, 1 |
| L | L, I, 1 |
| 1 | 1, I, L |
| G | G, A |
| A | A, G |
| O | O, 0 |
| S | S, 5 |
| B | B, 8 |
| Z | Z, 2 |

These are examples, not an exhaustive list.

[マンスリーソフトウェアニュース](https://images.openai.com/static-rsc-4/DHX94JuQahXwmRiGykVK_CkVqilWEPejAVE3V3sR2FPb6KNE0JDwzPTJEiJxbx63_i2O-4lbdnpsl21NQqxVDvVHLgn2UpY4ttBCgIN9G4yJ7X81sKtgGAR1XSuQnkSvPYvVQM41FsesuKTf6FBS7QtuTzbRRIv8AIgGP2mtRNc?purpose=inline)  
[software.univcoop.or.jp](https://software.univcoop.or.jp/news/page/201910/item/10155?unit_category_id=582&utm_source=chatgpt.com)

How the correction interface should work:

For example, suppose the old card has patient number `FLI00125`, but OCR reads `FL100125`.

The system should:

* Highlight the uncertain characters.  
* Show the original image area.  
* Display the extracted value.  
* Allow the staff member to click the uncertain character or field.  
* Allow the staff member to type the correct value.  
* Save the corrected value only after confirmation.

The same applies to names, dates, phone numbers, membership numbers and clinical information.

We should also distinguish between a low-confidence character and a high-confidence field. A field can be flagged even when the OCR confidence is high if it conflicts with another field or fails validation.

One critical rule: OCR must extract and suggest. It must never independently decide that an unclear character is correct, create a verified identity from an uncertain match, or turn an unverified historical diagnosis into a confirmed current diagnosis.

## **3\. Bulk Excel and CSV import**

We should reuse the staged bulk-import approach we previously discussed for VEMTAP, rather than building a completely different import experience.

[Building a Seamless CSV Import Experience with Flatfile \| Flatfile](https://images.openai.com/static-rsc-4/FSFToMGpVFPMIFWgwji7q2aFpdZj-R2Vnm35x9IMRelyKAX_TpvL_NegEVxuCEhKCo6ofOCcFfyKujJ-bDucDdEUasPC9po9i06WqdIeIS7uz6LRGJRkx61SjzF-temNbF2DcGBSmISrhkP4iW36ohtAnDrgCMvuVE8Cs53bkoc?purpose=inline)  
[flatfile.com](https://flatfile.com/blog/optimizing-csv-import-experiences-flatfile-portal/?utm_source=chatgpt.com)

### **Exact bulk-import workflow**

1. Select Bulk Import  
   Patients → Import Patients → Upload Excel / CSV.  
2. Upload the file  
   Support `.xlsx`, `.xls` and `.csv`, subject to file validation and size limits.  
3. Read and preview the spreadsheet  
   Show the detected sheet, headers, number of rows and sample records.  
4. Map spreadsheet columns  
   The clinic maps its existing column names to VEMTAP fields.  
   For example:

| Existing column | VEMTAP field |
| :---- | :---- |
| Patient No. | Clinic Patient Number |
| Surname | Last Name |
| First Name | First Name |
| DOB | Date of Birth |
| Tel | Phone Number |
| HMO | HMO Provider |
| HMO No. | Membership Number |

5.   
   Validate the records  
   Check required fields, date formats, invalid phone numbers, duplicate patient numbers, missing information and possible duplicate identities.  
6. Review the import  
   Display records grouped into:  
   * Ready to import  
   * Missing information  
   * Invalid information  
   * Possible duplicates  
   * Records requiring manual review  
7. Resolve errors  
   Staff can edit individual rows, exclude rows, correct information or download an error report.  
8. Confirm and import  
   Import only the records that pass the required checks. Unresolved rows remain in the review queue.  
9. Show the import report  
   Display total rows, successfully imported records, linked existing patients, skipped records and records requiring further review.

We should allow staff to download a VEMTAP spreadsheet template, but we must not force clinics to rearrange their existing spreadsheets before importing. Column mapping should handle different formats.

For example, one clinic might store names as `Surname, First Name, Middle Name`, while another has a single `Full Name` column. Both should be supported.

## **4\. Duplicate detection and central patient identity**

This is one of the most important parts of the entire system.

Remember our earlier decision: a patient should have one central VEMTAP identity, while each clinic maintains its own local patient number and relationship.

Therefore, when a clinic imports 5,000 patients, VEMTAP must not automatically create 5,000 new central identities without checking for existing ones.

For each imported or scanned patient, the system should:

1. Check the existing clinic patient number.  
2. Check verified phone numbers and email addresses.  
3. Check an existing VEMTAP Patient ID, if available.  
4. Compare other available identifying information, such as date of birth and name.  
5. Identify possible matches.  
6. Ask authorised staff to review uncertain matches.

Example: Possible existing patient

Review required

A patient imported from Flourish iClinic appears similar to an existing VEMTAP patient.

* Imported name: John A. Okafor  
* Existing name: John Anthony Okafor  
* Date of birth: Same  
* Phone number: Not supplied in the old spreadsheet

The system suggests a possible match, but does not automatically merge them.

Staff can verify the identity and link the Flourish clinic record to the existing VEMTAP patient identity.

If there is no reliable match, the system can create a new patient identity. If there is uncertainty, keep the record pending review.

Also, importing historical clinical information is not the same as verifying that information clinically. Preserve its source and date, and do not silently present an old diagnosis or prescription as a current clinical decision.

## **5\. Manual registration**

We should retain a simple manual option for cases where:

* The patient has no existing paper card.  
* The old card is damaged or unreadable.  
* The receptionist has the information but cannot scan it.  
* The patient is a new walk-in.  
* A record needs to be created quickly.

The flow:

Patients → Add Patient → Register Manually

The form should include patient details, contact details, clinic-specific patient number, HMO information, and guardian details where applicable.

Before saving, the system checks for possible duplicates.

The receptionist should also be able to register a child under a parent or guardian, following the family-management rules we have established.

## **6\. Patient self-registration through QR code**

This is the other important onboarding route.

The clinic displays its VEMTAP QR code at reception, on appointment cards, posters or other appropriate locations.

[QR code at the front desk: more productivity for your clinic](https://images.openai.com/static-rsc-4/-mc2GjbLnXBKG3PPjo_KekVgDLTw56S-3jqepASUw7lPO1p26Y7ol8PYcvtUYJtZV2EYkrn5LODktDypQxgr_Q-hwspsCyW9dEEdtoS-Z92EmKSHwlwHV9ZeOvF8GaQ4n0909GoVhkkTbMkZMiNAudpAevyEEPOCTbfPwlrEHZo?purpose=inline)  
[english.apolo.app](https://english.apolo.app/how-qr-codes-improve-front-desk-productivity/?utm_source=chatgpt.com)

The patient scans the QR code and:

1. Opens the clinic's registration page.  
2. Selects whether they are a new or returning patient.  
3. Logs into their existing VEMTAP account or creates one.  
4. Completes their patient information.  
5. Selects the visit purpose.  
6. Supplies HMO information where applicable.  
7. Submits the form.  
8. Receives confirmation and a check-in or queue reference.

If the patient is registering a child, the parent selects the child profile or adds a child.

If the patient cannot use a smartphone, reception can assist them.

The clinic QR code should identify the clinic and branch automatically. It must not contain patient medical information.

## **7\. A fifth capability: Batch scanning and gradual migration**

There is something else I want us to include.

We should not force a clinic to scan one patient card, finish the entire process, save it, and then start again for the next patient.

For a clinic with 5,000 records, that would still be too slow.

We should design a Batch Scanning Mode.

For example:

* Staff selects `Batch Scan`.  
* They photograph multiple patient cards consecutively.  
* The system creates one document package per card.  
* OCR processes them in the background.  
* Each card becomes an individual review item.  
* Staff can move from one extracted record to the next.  
* Confirmed records enter the import queue.  
* Unclear records remain pending.

This should support a phone camera and a desktop scanner, where available.

We should also support a gradual migration strategy:

| Migration stage | What happens |
| ----- | ----- |
| New patients | Register digitally immediately |
| Returning patients | Digitise their old records when they visit |
| Historical records | Import spreadsheet batches or scan archives |
| Unclear records | Keep pending until verified |
| Completed migration | Reconcile imported records against clinic totals |

This way, clinics can start using VEMTAP without waiting for all their old files to be digitised.

## **8\. Where this should appear in the different dashboards**

| Dashboard | Required functionality |
| ----- | ----- |
| Super Admin | Monitor migration activity, platform usage, OCR service status and system-level import errors without routinely viewing clinical records |
| Clinic Admin | Full patient migration centre, import history, batch status and review oversight |
| Reception | Scan cards, manual registration, QR-assisted registration and patient search |
| Doctor | Access verified patient records and clearly labelled historical documents |
| Nurse | Access relevant patient history and verified information |
| Patient Portal | Self-registration, profile activation and correction requests |

Access should be role-based. For example, reception can digitise and correct demographic information, but clinical diagnoses and prescriptions should require the appropriate clinical professional to verify them.

## **9\. The migration centre we should design**

I recommend a dedicated page within the Clinic Admin dashboard:

Patients → Patient Migration Centre

[New Feature\! Standalone prescribers can now bulk upload and validate patients using a spreadsheet. See more at www\.parchment.health \| Parchment eScripts](https://images.openai.com/static-rsc-4/Ec74adUsX4QHtIJvPqjdVsybZY4k_t2lISMkSNLlrurRh3uQ8wSVFXGcozE2P2nXqtJulpYrwU1jg22ikdLbV_QIdtBy1jOwcPBPJrRxSGroO7XnW-LFfhNtAldMfaDVqi89YXEH_tk0eSOv5rmIOE2VsWPzUBHPuQZzwYwSurg?purpose=inline)  
[linkedin.com](https://www.linkedin.com/posts/parchment-eprescriptions_new-feature-standalone-prescribers-can-now-activity-7437055711597117440-CVvo?utm_source=chatgpt.com)

Its layout should have:

* Overview: total records processed, imported, pending review and failed.  
* Scan Paper Records.  
* Batch Scan.  
* Upload Excel / CSV.  
* Manual Patient Registration.  
* Import History.  
* Review Queue.  
* Duplicate Resolution.  
* Download Templates.

Each migration should have a batch ID, source, uploading staff member, date, status and processing report.

The clinic should be able to pause and resume large imports, and retry failed records without importing already completed records again.

## **10\. Exact developer instruction**

This is the instruction I would add to the existing VEMTAP Eye Clinic project documentation.

Feature specification

Add to core scope

# **Patient Migration & Smart Onboarding Centre**

Objective

Build a comprehensive patient onboarding and migration experience that allows eye clinics to transfer existing patient records into VEMTAP using OCR scanning, batch scanning, Excel/CSV imports, manual entry and patient self-registration.

1\. Patient onboarding entry points

Add the following options under Patients → Add / Import Patients:

* Scan Paper Record  
* Batch Scan  
* Upload Excel / CSV  
* Register Manually  
* Patient Self-Registration via QR

All methods must feed into the same central patient identity and clinic patient registration architecture.

2\. OCR and document scanning

* Support smartphone camera capture, desktop camera capture and document uploads.  
* Support images and PDF documents.  
* Support patient cards, registration forms, case-history forms and other clinic documents.  
* Include image crop, rotation, perspective correction and contrast enhancement.  
* Extract structured information using OCR/document recognition.  
* Display the original document beside extracted fields.  
* Highlight the corresponding document area when a field is selected, where possible.  
* Show confidence indicators and flag unclear, missing or inconsistent information.  
* Allow staff to correct extracted information before confirmation.  
* Support multiple pages and multiple documents per patient.

3\. Uncertain character verification

Explicitly handle common handwriting and OCR ambiguities:

* I / L / 1  
* G / A  
* O / 0  
* S / 5  
* B / 8  
* Z / 2

The list must not be hardcoded as exhaustive.

Highlight uncertain characters and allow field-level correction with the original image visible.

Never silently guess an unclear patient name, date, patient number, phone number, HMO membership number or clinical value.

4\. Excel/CSV bulk import

* Support `.xlsx`, `.xls` and `.csv`.  
* Provide downloadable VEMTAP import templates.  
* Allow clinics to upload existing spreadsheets without manually rearranging their columns.  
* Build an interactive column-mapping interface.  
* Support different naming conventions, including full-name and separate first/middle/last-name columns.  
* Preview records before importing.  
* Validate required fields, formats and duplicates.  
* Categorise records into ready, incomplete, invalid, duplicate and review-required groups.  
* Allow row-level correction, exclusion and error report downloads.  
* Support large imports in manageable batches.  
* Display a final import report.

5\. Batch scanning

* Allow staff to photograph multiple cards/documents in succession.  
* Separate documents into individual patient review items.  
* Process documents asynchronously.  
* Allow staff to review, correct and approve records individually.  
* Support pausing, resuming and retrying failed batches.  
* Prevent already completed records from being imported again on retry.

6\. Patient identity and duplicate matching

* Check existing VEMTAP Patient IDs, clinic patient numbers, verified phone numbers and email addresses, where available.  
* Compare additional identifying information.  
* Show possible matches for human review.  
* Never automatically merge uncertain identities.  
* Preserve each clinic's local patient number.  
* Maintain one central patient identity across participating VEMTAP clinics.  
* Record the source and provenance of imported information.

7\. Manual registration and QR onboarding

Integrate manual registration and QR self-registration into the same patient onboarding architecture.

* Reception can create patient profiles.  
* Patients can register independently through clinic-specific QR codes.  
* Existing VEMTAP patients can use their existing accounts.  
* Parent/guardian registration must support child profiles.  
* Patients without smartphones must still be registerable by clinic staff.

8\. Historical clinical record handling

* Preserve the original scanned documents.  
* Record document source, date, uploading staff member and verification status.  
* Keep historical diagnoses and prescriptions distinguishable from current verified clinical decisions.  
* Do not automatically convert extracted clinical information into confirmed diagnoses or active prescriptions.  
* Allow authorised clinicians to review and validate clinical records.

9\. Permissions, privacy and audit

* Restrict access to scanning, editing, reviewing and approving records by role.  
* Record who uploaded, edited, reviewed and approved each record.  
* Protect patient information during processing and storage.  
* Do not expose one clinic's records to another clinic through migration.  
* Apply the platform's patient consent and identity rules.

10\. Frontend implementation requirements

* Build all required screens, forms, tables, review states, validation states, loading states and success/error states.  
* Use realistic sample data to demonstrate the entire workflow.  
* Ensure responsive desktop and mobile experiences.  
* Integrate with the existing Patients section and patient profile screens.  
* Do not create a disconnected migration dashboard.  
* Do not implement backend services or claim OCR is operational unless the relevant services are actually integrated.  
* Use mock extraction results and simulated processing states for frontend demonstrations.

Acceptance criteria

A clinic administrator should be able to demonstrate the complete journey: upload a spreadsheet, map columns, review errors, resolve possible duplicates, import approved records, scan an old patient card, correct uncertain OCR fields and save the verified patient record.

## **11\. Recommended development order**

We should not attempt to build sophisticated handwriting OCR before we have the underlying migration workflow.

I recommend this sequence:

| Priority | Capability |
| ----- | ----- |
| 1 | Manual registration and patient identity matching |
| 2 | Excel/CSV bulk import with staging, validation and correction |
| 3 | QR self-registration and assisted registration |
| 4 | Single-document OCR scanning with human verification |
| 5 | Batch scanning and background processing |
| 6 | Advanced handwriting recognition and improved OCR |
| 7 | Migration analytics, reconciliation and advanced integrations |

This is consistent with the earlier DHA migration planning: start with structured spreadsheet imports and validation, then add scanned-document workflows and OCR/handwriting recognition.

One architectural point: OCR, spreadsheet import and QR registration should all produce a staged patient record, not immediately create an unquestioned permanent patient identity. Identity matching, review and approval should happen before final linking or creation.

That will make VEMTAP much easier to adopt for clinics with existing patient databases, while protecting patient identity and clinical-record accuracy.