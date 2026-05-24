# VEMTAP EYE CLINIC — FULL HMO OPERATIONS ENGINE BLUEPRINT

This document contains the COMPLETE operational architecture, workflow logic, database structure, billing intelligence, claims management system, authorization workflow, reconciliation process, API integration strategy, automation flow, analytics structure, and implementation phases required to build the Vemtap Full HMO Operations Engine.

The goal is to build a modern enterprise-grade HMO management infrastructure specifically optimized for:
- Eye clinics
- Specialist clinics
- Multi-branch healthcare organizations
- Optical centers
- Ophthalmology centers
- Nigerian healthcare operations

This system should simplify:
- HMO operations
- Insurance workflows
- Claims processing
- Billing automation
- Co-payment calculations
- Coverage intelligence
- Receivables tracking
- Multi-HMO management
- Multi-plan configurations
- Multi-branch HMO operations

--------------------------------------------------
1. UNDERSTANDING THE HMO CHALLENGE
--------------------------------------------------

Different HMOs operate differently.

Every HMO can have:
- Different pricing agreements
- Different service coverage
- Different member plans
- Different co-payment rules
- Different approval requirements
- Different claims formats
- Different reimbursement structures
- Different payment timelines
- Different verification methods
- Different operational policies

Examples:
- One HMO may fully cover consultations.
- Another may only partially cover consultations.
- One HMO may cover optical lenses.
- Another may not cover frames.
- One HMO may require authorization for glaucoma tests.
- Another may automatically approve it.

Because of this:

The system cannot use one global pricing or one global coverage rule.

The system must support:
- HMO-specific rules
- Clinic-specific pricing
- Plan-specific coverage
- Service-specific billing logic

--------------------------------------------------
2. THE 7 CORE LAYERS OF THE HMO ENGINE
--------------------------------------------------

The Vemtap HMO Engine should be structured into 7 operational layers:

1. HMO Master Database
2. Clinic HMO Agreements
3. Patient HMO Membership Management
4. Coverage & Eligibility Rules Engine
5. Consultation & Billing Intelligence
6. Claims Management System
7. HMO Financial Reconciliation

--------------------------------------------------
3. PHASE 1 — GLOBAL HMO MASTER DATABASE
--------------------------------------------------

This is controlled by Vemtap Super Admin.

The HMO Master Database becomes the central registry of all HMOs available inside the platform.

--------------------------------------------------
HMO MASTER DATABASE STRUCTURE
--------------------------------------------------

Each HMO profile should contain:

GENERAL INFORMATION
- HMO name
- HMO logo
- Short code
- Description
- Contact person
- Contact phone
- Contact email
- Address
- Website
- Portal URL
- API availability
- API documentation URL
- Status

BUSINESS SETTINGS
- Claims submission method
- Payment cycle
- Authorization requirements
- Reimbursement structure
- Billing rules
- Approval workflow type

SUPPORTED SERVICES
- Consultation coverage
- Diagnostic coverage
- Optical coverage
- Drug coverage
- Surgery coverage

--------------------------------------------------
SUPPORTED HMO EXAMPLES
--------------------------------------------------

Examples:
- NHIA
- Hygeia
- Avon
- AXA Mansard
- Reliance Health
- Leadway Health
- MetroHealth
- Redcare
- Total Health Trust
- Well Health
- Aetna
- Bastion
- Clearline

--------------------------------------------------
4. HMO PLAN MANAGEMENT SYSTEM
--------------------------------------------------

One HMO can have multiple plans.

Example:

Hygeia:
- HyBasic
- HyClassic
- HyPremium
- Executive Plan

Each plan should contain:
- Coverage rules
- Service limits
- Co-pay percentages
- Excluded services
- Optical limits
- Drug limits
- Consultation limits
- Annual limits
- Authorization rules

--------------------------------------------------
HMO PLAN DATABASE STRUCTURE
--------------------------------------------------

Each HMO Plan should contain:
- Plan name
- Plan code
- Coverage percentage
- Annual coverage limit
- Monthly limit
- Co-payment rules
- Excluded services
- Service approval requirements
- Optical allowance
- Drug allowance
- Consultation allowance
- Surgery allowance

--------------------------------------------------
5. PHASE 2 — CLINIC HMO CONFIGURATION
--------------------------------------------------

Not every clinic works with every HMO.

Each clinic must activate and configure the HMOs they support.

--------------------------------------------------
CLINIC HMO ACTIVATION FLOW
--------------------------------------------------

Clinic Admin:
Settings → HMO Management → Activate HMO

Examples:
- Clinic A activates AXA
- Clinic A activates NHIA
- Clinic A activates Hygeia
- Clinic A does not activate Reliance

--------------------------------------------------
CLINIC-HMO AGREEMENT ENGINE
--------------------------------------------------

VERY IMPORTANT:

The same HMO may pay different clinics differently.

Example:

AXA at Clinic A:
- Consultation = ₦5,000

AXA at Clinic B:
- Consultation = ₦3,500

Because of this:
Pricing must be clinic-specific.

--------------------------------------------------
CLINIC HMO AGREEMENT SETTINGS
--------------------------------------------------

Each Clinic-HMO relationship should store:

GENERAL SETTINGS
- HMO status
- Agreement start date
- Agreement end date
- Billing cycle
- Payment cycle
- Claims submission schedule

PRICING RULES
- Consultation pricing
- Eye test pricing
- Optical pricing
- Lens pricing
- Frame pricing
- Drug pricing
- Surgery pricing
- Procedure pricing

CLAIMS SETTINGS
- Claim submission format
- Required supporting documents
- Claim batching rules
- Approval workflow

--------------------------------------------------
6. PHASE 3 — MASTER SERVICE CATALOG
--------------------------------------------------

The platform needs a Master Service Catalog.

This becomes the foundation of:
- Billing
- Coverage
- Pricing
- Claims
- Authorization

--------------------------------------------------
MASTER SERVICE CATALOG EXAMPLES
--------------------------------------------------

CONSULTATIONS
- General consultation
- Specialist consultation
- Follow-up consultation

DIAGNOSTICS
- Refraction
- Glaucoma test
- Retina scan
- IOP test
- CVF test

OPTICAL
- Lens fitting
- Lens production
- Frame purchase

PHARMACY
- Drug dispensing
- Injections

SURGERY
- Cataract surgery
- LASIK
- Laser procedures

--------------------------------------------------
SERVICE CONFIGURATION FIELDS
--------------------------------------------------

Each service should contain:
- Service code
- Service name
- Service category
- Standard price
- HMO eligibility
- Requires authorization
- Requires doctor approval
- Requires supporting documents

--------------------------------------------------
7. PHASE 4 — COVERAGE & ELIGIBILITY ENGINE
--------------------------------------------------

This is the intelligence engine.

The system should determine:
- What is covered
- What is partially covered
- What requires approval
- What is excluded
- What requires co-payment

--------------------------------------------------
COVERAGE TYPES
--------------------------------------------------

For each service:
- Fully covered
- Partially covered
- Not covered
- Requires authorization
- Requires co-payment
- Annual limit reached

--------------------------------------------------
EXAMPLE COVERAGE RULES
--------------------------------------------------

Hygeia Premium:
- Consultation = Fully covered
- Lens = 50% covered
- Frames = Not covered
- Glaucoma test = Requires approval

--------------------------------------------------
8. PHASE 5 — PATIENT HMO REGISTRATION
--------------------------------------------------

When patient arrives:

Patient selects:
- Private
OR
- HMO

--------------------------------------------------
PATIENT HMO PROFILE FIELDS
--------------------------------------------------

Store:
- HMO provider
- HMO plan
- Membership ID
- Card number
- Expiry date
- Principal/dependent status
- Principal name
- Employer/company
- Authorization number
- Enrollment verification status

--------------------------------------------------
QR SELF CHECK-IN HMO FLOW
--------------------------------------------------

Patient scans QR →
Selects HMO →
Form dynamically updates →
Patient enters HMO details →
Queue assigned automatically

--------------------------------------------------
9. PHASE 6 — HMO ELIGIBILITY VERIFICATION
--------------------------------------------------

Before consultation:
System checks whether patient is eligible.

--------------------------------------------------
VERIFICATION METHODS
--------------------------------------------------

METHOD 1 — MANUAL VERIFICATION
- Staff checks card
- Staff checks expiry
- Staff confirms member ID

METHOD 2 — PORTAL VERIFICATION
- Staff enters member ID
- System checks HMO portal manually

METHOD 3 — API VERIFICATION
- System sends API request
- HMO validates patient automatically
- Coverage returned instantly

--------------------------------------------------
10. PHASE 7 — CONSULTATION & BILLING INTELLIGENCE
--------------------------------------------------

This is where automation becomes powerful.

When doctor adds:
- Consultation
- Diagnostics
- Drugs
- Lens
- Procedures

The system automatically calculates:
- What HMO pays
- What patient pays
- Co-payment
- Outstanding balance

--------------------------------------------------
BILLING CALCULATION EXAMPLE
--------------------------------------------------

Consultation = ₦10,000

HMO covers:
₦7,000

Patient co-pay:
₦3,000

System automatically:
- Generates patient invoice
- Generates HMO claim
- Tracks receivables
- Updates HMO analytics

--------------------------------------------------
11. OPTICAL COVERAGE ENGINE
--------------------------------------------------

VERY IMPORTANT FOR EYE CLINICS.

Examples:
- HMO covers consultation only
- HMO partially covers lenses
- HMO excludes premium frames

--------------------------------------------------
OPTICAL BILLING EXAMPLE
--------------------------------------------------

Lens = ₦40,000

HMO optical allowance:
₦15,000

Patient pays:
₦25,000

System automatically calculates:
- HMO portion
- Patient balance
- Receivable tracking

--------------------------------------------------
12. PHASE 8 — AUTHORIZATION WORKFLOW
--------------------------------------------------

Some services require approval.

Examples:
- Surgery
- Expensive diagnostics
- Premium lenses
- Retina procedures

--------------------------------------------------
AUTHORIZATION FLOW
--------------------------------------------------

Doctor recommends service →
System flags authorization required →
HMO Officer uploads documents →
Authorization request submitted →
Await approval

--------------------------------------------------
AUTHORIZATION STATUSES
--------------------------------------------------

- Pending
- Approved
- Rejected
- Expired
- Escalated

--------------------------------------------------
AUTHORIZATION DOCUMENTS
--------------------------------------------------

- Doctor notes
- Test results
- Imaging attachments
- Referral documents
- Consent forms

--------------------------------------------------
13. PHASE 9 — CLAIMS MANAGEMENT SYSTEM
--------------------------------------------------

After consultation:
The system automatically generates:

HMO CLAIM RECORD

--------------------------------------------------
CLAIM DETAILS
--------------------------------------------------

Each claim should contain:
- Patient information
- HMO details
- Diagnosis
- Services rendered
- Drugs dispensed
- Optical items
- Supporting documents
- Doctor notes
- Authorization references

--------------------------------------------------
CLAIM WORKFLOW
--------------------------------------------------

Draft →
Submitted →
Under Review →
Approved →
Paid →
Rejected

--------------------------------------------------
14. PHASE 10 — CLAIM BATCHING SYSTEM
--------------------------------------------------

Most clinics submit claims monthly.

The system should support:
- Monthly claim batches
- Weekly claim batches
- HMO-specific batching

--------------------------------------------------
BATCH EXPORT FORMATS
--------------------------------------------------

- PDF
- Excel
- CSV
- API export

--------------------------------------------------
15. PHASE 11 — HMO RECEIVABLES & RECONCILIATION
--------------------------------------------------

HMOs often delay payment.

The system must track:
- Amount billed
- Amount paid
- Outstanding balances
- Overdue claims
- Partial payments

--------------------------------------------------
RECONCILIATION FEATURES
--------------------------------------------------

- Remittance matching
- Payment reconciliation
- Outstanding balance calculation
- Claim aging reports
- Revenue tracking

--------------------------------------------------
16. PHASE 12 — CLAIM REJECTION MANAGEMENT
--------------------------------------------------

Claims are often rejected.

--------------------------------------------------
COMMON REJECTION REASONS
--------------------------------------------------

- Expired member
- Invalid diagnosis code
- Non-covered service
- Missing documents
- Authorization missing
- Duplicate claim

--------------------------------------------------
REJECTION WORKFLOW
--------------------------------------------------

Rejected claim →
Review rejection reason →
Upload missing documents →
Appeal claim →
Resubmit claim

--------------------------------------------------
17. PHASE 13 — HMO ANALYTICS ENGINE
--------------------------------------------------

Clinic admins should see:
- Revenue by HMO
- Top-performing HMO
- Slowest-paying HMO
- Most rejected claims
- HMO patient volume
- Outstanding balances
- Claims approval rates
- Optical coverage analytics

--------------------------------------------------
18. PATIENT EXPERIENCE FEATURES
--------------------------------------------------

Inside Patient Portal:
Patients should see:
- HMO coverage
- Remaining benefits
- Co-payment amounts
- Authorization status
- Claims history
- Approved services

--------------------------------------------------
19. HMO OFFICER ROLE
--------------------------------------------------

The platform should support a dedicated HMO Officer account.

--------------------------------------------------
HMO OFFICER FEATURES
--------------------------------------------------

- Verify eligibility
- Manage claims
- Upload documents
- Submit batches
- Track approvals
- Handle rejections
- Reconcile payments

--------------------------------------------------
20. MULTI-BRANCH HMO OPERATIONS
--------------------------------------------------

Support:
- Branch-specific HMO pricing
- Branch-specific claims
- Regional HMO analytics
- Shared HMO database
- Centralized reporting

--------------------------------------------------
21. HMO API INTEGRATION STRATEGY
--------------------------------------------------

This should NOT be Phase 1.

The correct strategy:

PHASE 1:
Build internal HMO workflow engine first.

PHASE 2:
Build semi-automated verification.

PHASE 3:
Build direct API integrations.

--------------------------------------------------
22. HOW TO IMPLEMENT HMO API INTEGRATIONS
--------------------------------------------------

STEP 1 — IDENTIFY HMOs WITH APIs

Research:
- Which HMOs provide APIs
- Which HMOs provide partner access
- Which HMOs support claim automation
- Which HMOs support eligibility verification

--------------------------------------------------
STEP 2 — CONTACT HMO TECHNICAL TEAMS
--------------------------------------------------

Request:
- API documentation
- Sandbox environment
- Authentication requirements
- Rate limits
- Claims submission endpoints
- Eligibility verification endpoints

--------------------------------------------------
STEP 3 — CREATE HMO INTEGRATION LAYER
--------------------------------------------------

Build:
- HMO connector engine
- API abstraction layer
- Request handlers
- Response parsers
- Retry systems
- Error handling
- Logging systems

--------------------------------------------------
STEP 4 — IMPLEMENT AUTHENTICATION
--------------------------------------------------

Possible authentication methods:
- API keys
- OAuth2
- JWT tokens
- Basic authentication
- IP whitelisting

--------------------------------------------------
STEP 5 — ELIGIBILITY VERIFICATION API
--------------------------------------------------

FLOW:

Patient enters HMO member ID →
System sends request →
HMO returns:
- Member validity
- Plan type
- Expiry date
- Coverage information

--------------------------------------------------
STEP 6 — CLAIM SUBMISSION API
--------------------------------------------------

FLOW:

Clinic completes consultation →
System generates claim →
Claim submitted automatically via API →
Response stored inside claim record

--------------------------------------------------
STEP 7 — CLAIM STATUS SYNCHRONIZATION
--------------------------------------------------

System periodically checks:
- Pending claims
- Approved claims
- Rejected claims
- Paid claims

--------------------------------------------------
STEP 8 — PAYMENT RECONCILIATION API
--------------------------------------------------

If HMO supports remittance API:
- Pull payment records
- Match against claims
- Auto-reconcile balances

--------------------------------------------------
23. HMO API CHALLENGES IN NIGERIA
--------------------------------------------------

Reality:
- Many HMOs do not have APIs
- Some APIs are outdated
- Some HMOs use email/manual submissions
- Some require Excel uploads
- Some use web portals only

Because of this:
The platform must support:
- Manual workflows
- Semi-automated workflows
- Full API workflows

--------------------------------------------------
24. BEST IMPLEMENTATION STRATEGY FOR VEMTAP
--------------------------------------------------

START SIMPLE.

--------------------------------------------------
PHASE 1 MVP
--------------------------------------------------

Build:
- HMO database
- Plan management
- Coverage rules
- Billing split engine
- Claims records
- HMO reports
- Receivables tracking

--------------------------------------------------
PHASE 2
--------------------------------------------------

Build:
- Authorization workflows
- Claims batching
- Rejection management
- HMO reconciliation
- Advanced analytics

--------------------------------------------------
PHASE 3
--------------------------------------------------

Build:
- API integrations
- Real-time verification
- Automated claims submission
- Automated reconciliation
- Smart claim validation

--------------------------------------------------
25. WHAT WILL MAKE VEMTAP BETTER THAN ECMS
--------------------------------------------------

Vemtap can outperform traditional healthcare systems by combining:

- QR self check-in
- Smart patient intake
- OCR automation
- Queue intelligence
- Real-time analytics
- Modern UI/UX
- Patient mobile portal
- WhatsApp automation
- AI automation
- Optical workflow intelligence
- HMO analytics
- Multi-branch intelligence
- Modern cloud architecture

Most traditional systems are:
- Old
- Slow
- Complex
- Poorly designed
- Difficult to use
- Weak in automation
- Weak in patient experience

The goal of Vemtap should be:

To make enterprise healthcare operations feel simple, modern, intelligent, and automated.

