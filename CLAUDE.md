# CLAUDE.md - AI Assistant Guide for Clinical Campaigns

> **Purpose**: This file provides comprehensive context and best practices for AI assistants (Claude) working on the Clinical Campaigns codebase. Read this file thoroughly before making any changes.

**Last Updated**: 2026-01-04
**Document Version**: 2.0

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Current Repository State](#current-repository-state)
3. [Core Principles](#core-principles)
4. [Architecture Reference](#architecture-reference)
5. [Code Conventions](#code-conventions)
6. [Security & Compliance](#security--compliance)
7. [Development Workflow](#development-workflow)
8. [Testing Standards](#testing-standards)
9. [Common Pitfalls](#common-pitfalls)
10. [AI Assistant Guidelines](#ai-assistant-guidelines)
11. [Quick Reference](#quick-reference)

---

## 🎯 Project Overview

**Clinical Campaigns** is a HIPAA-compliant platform for deploying AI-powered voice outreach campaigns to patients who have not utilized preventive care screening benefits.

### Target Screenings
- **Breast Cancer Screening** (Mammogram)
- **Cervical Cancer Screening** (Pap Smear)
- **Colorectal Cancer Screening** (Colonoscopy)

### Critical Context
⚠️ **This system handles Protected Health Information (PHI)** - every decision must prioritize patient safety and regulatory compliance.

### Core Capabilities
- Intelligent 1:1 voice outreach via AI agents
- Personalized health information delivery
- Automated appointment scheduling
- Multi-layer safety guardrails
- Real-time campaign analytics

---

## 📁 Current Repository State

**Status**: Documentation & Planning Phase
**Code Status**: No implementation files yet

### Current Files
```
clinical-campaigns/
├── .claude.md          # Hidden AI context file (legacy)
├── ARCHITECTURE.md     # Detailed system architecture (986 lines)
├── README.md           # Project overview
└── CLAUDE.md          # This file (AI assistant guide)
```

### What This Means for AI Assistants
- **Read First**: Review `ARCHITECTURE.md` to understand the planned system design
- **No Existing Code**: When implementing features, you're starting from scratch
- **Follow Architecture**: Implement according to the architectural patterns in `ARCHITECTURE.md`
- **Ask Questions**: If architectural decisions are unclear, ask before implementing

### Planned Structure
When implementation begins, the repository will follow this structure:

```
clinical-campaigns/
├── frontend/                 # React + TypeScript UI
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page-level components
│   │   ├── services/        # API clients
│   │   ├── store/           # State management (Redux/Zustand)
│   │   └── types/           # TypeScript type definitions
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                  # Node.js + TypeScript API
│   ├── src/
│   │   ├── api/             # Route handlers
│   │   ├── services/        # Business logic
│   │   ├── models/          # Data models & schemas
│   │   ├── middleware/      # Express/Fastify middleware
│   │   ├── voice/           # Voice AI integration
│   │   ├── guardrails/      # Safety & compliance layer
│   │   └── utils/           # Shared utilities
│   ├── package.json
│   └── tsconfig.json
│
├── data-services/            # Python analytics & ML
│   ├── api/                 # FastAPI routes
│   ├── services/            # Business logic
│   ├── models/              # Pydantic models
│   ├── ml/                  # ML models & scoring
│   └── requirements.txt
│
├── infrastructure/           # IaC (Terraform/CDK)
│   ├── terraform/
│   └── docker/
│
├── docs/                     # Additional documentation
├── .github/                  # CI/CD workflows
└── docker-compose.yml        # Local development
```

---

## 🎯 Core Principles

### 1. Safety & Compliance First
**ALWAYS prioritize patient safety and regulatory compliance over feature velocity.**

- **HIPAA Compliance**: Every feature touching PHI requires privacy safeguards
- **Guardrails**: Voice AI requires multi-layer safety controls
- **Audit Trails**: Log all PHI access (actor, action, timestamp, outcome)
- **Data Minimization**: Share minimum necessary PHI with external services

### 2. Type Safety
**Leverage TypeScript/Python type systems to prevent runtime errors.**

```typescript
// GOOD: Explicit types, runtime validation
import { z } from 'zod'

const PatientSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string().min(1),
  phoneNumber: z.string().regex(/^\+?1?\d{10,14}$/)
})

type Patient = z.infer<typeof PatientSchema>

async function getPatient(id: string): Promise<Patient> {
  const data = await db.patients.findUnique({ where: { id } })
  return PatientSchema.parse(data) // Runtime validation
}

// BAD: No types, no validation
async function getPatient(id) {
  return await db.patients.findUnique({ where: { id } })
}
```

### 3. Security by Design
**Assume breach at every layer.**

```typescript
// Defense in Depth Checklist:
// ✅ Encrypt PHI at rest (field-level encryption)
// ✅ Encrypt in transit (TLS 1.3 minimum)
// ✅ Never log PHI in plain text
// ✅ Use parameterized queries (prevent SQL injection)
// ✅ Sanitize user inputs (prevent XSS)
// ✅ Implement RBAC (role-based access control)
```

### 4. Observability
**You can't fix what you can't see.**

- Structured JSON logging (never log PHI!)
- Metrics for critical paths (latency, error rate, throughput)
- Distributed tracing for cross-service requests
- Real-time alerting for guardrail violations

---

## 🏗️ Architecture Reference

**See**: [`ARCHITECTURE.md`](./ARCHITECTURE.md) for comprehensive architectural documentation.

### Key Architectural Patterns

#### 1. Provider Abstraction Pattern
**Always code against interfaces, not concrete implementations**

```typescript
// Voice Provider Interface
interface VoiceProvider {
  initiateCall(request: CallRequest): Promise<CallSession>
  updateContext(sessionId: string, context: any): Promise<void>
  terminateCall(sessionId: string): Promise<void>
}

// Concrete implementations
class VapiProvider implements VoiceProvider { /* ... */ }
class ElevenLabsProvider implements VoiceProvider { /* ... */ }

// Service uses interface
class CallService {
  constructor(private provider: VoiceProvider) {}

  async startCall(patient: Patient) {
    return this.provider.initiateCall({ ... })
  }
}

// Easy to swap providers
const service = new CallService(new VapiProvider())
// or
const service = new CallService(new ElevenLabsProvider())
```

#### 2. Decorator Pattern for Session Management
**Enrich sessions with context while maintaining separation of concerns**

```typescript
class SessionDecorator {
  async decorateSession(
    baseSession: Session,
    patientId: string,
    campaignId: string
  ): Promise<DecoratedSession> {
    const [patient, clinicalData] = await Promise.all([
      this.patientService.getPatient(patientId),
      this.clinicalService.getScreeningData(patientId)
    ])

    return {
      ...baseSession,
      personalization: this.buildPersonalization(patient),
      clinicalContext: this.buildClinicalContext(clinicalData),
      conversationState: this.initializeConversationState(campaignId)
    }
  }
}
```

#### 3. Guardrail Chain of Responsibility
**Multiple guardrails evaluate in priority order**

```typescript
class GuardrailEngine {
  private guardrails: Guardrail[] = [
    new EmergencyDetectionGuardrail(),    // CRITICAL
    new ComplianceGuardrail(),            // CRITICAL
    new SentimentGuardrail(),             // HIGH
    new TopicBoundaryGuardrail(),         // MEDIUM
    new ContentFilterGuardrail()          // LOW
  ]

  async evaluate(context: ConversationContext): Promise<GuardrailDecision> {
    for (const guardrail of this.guardrails) {
      const result = await guardrail.evaluate(context)
      if (!result.passed && result.severity === 'CRITICAL') {
        return this.handleCriticalFailure(result)
      }
    }
    // ... handle other violations
  }
}
```

---

## 📝 Code Conventions

### TypeScript/JavaScript

#### Naming Conventions
| Type | Convention | Example |
|------|-----------|---------|
| Files | kebab-case | `patient-service.ts`, `guardrail-engine.ts` |
| Classes | PascalCase | `PatientService`, `GuardrailEngine` |
| Interfaces | PascalCase | `Patient`, `CallSession`, `VoiceProvider` |
| Functions | camelCase | `initiateCall`, `validateGuardrails` |
| Constants | UPPER_SNAKE_CASE | `MAX_CALL_DURATION`, `HIPAA_COMPLIANCE_LEVEL` |

#### Code Style Best Practices

```typescript
// ✅ GOOD: Explicit types, error handling, clear logic
async function initiateCall(
  patientId: string,
  campaignId: string
): Promise<CallSession> {
  try {
    // Validate inputs
    if (!patientId || !campaignId) {
      throw new ValidationError('Patient ID and Campaign ID required')
    }

    // Create session
    const session = await this.sessionManager.createSession(
      patientId,
      campaignId
    )

    // Decorate with patient context
    const decoratedSession = await this.decorator.decorate(session)

    // Validate guardrails BEFORE initiating call
    const guardrailCheck = await this.guardrails.preCallValidation(
      decoratedSession
    )

    if (!guardrailCheck.passed) {
      throw new GuardrailViolationError(guardrailCheck.violations)
    }

    // Initiate call
    return await this.voiceProvider.initiateCall(decoratedSession)

  } catch (error) {
    // Never log PHI
    logger.error('Failed to initiate call', {
      patientIdHash: hashPatientId(patientId),
      campaignId,
      error: error.message
    })
    throw new CallInitiationError('Unable to start call', { cause: error })
  }
}

// ❌ BAD: No types, poor error handling, no validation
async function initiateCall(patientId, campaignId) {
  const session = await createSession(patientId, campaignId)
  return voiceProvider.call(session) // What if this fails?
}
```

### Python

#### Naming Conventions
| Type | Convention | Example |
|------|-----------|---------|
| Files | snake_case | `patient_eligibility.py`, `analytics_engine.py` |
| Classes | PascalCase | `PatientEligibility`, `AnalyticsEngine` |
| Functions | snake_case | `calculate_risk_score`, `segment_patients` |
| Constants | UPPER_SNAKE_CASE | `MAX_AGE_FOR_SCREENING` |

#### Code Style Best Practices

```python
# ✅ GOOD: Type hints, docstrings, error handling
from typing import List, Optional
from pydantic import BaseModel

class PatientScore(BaseModel):
    patient_id: str
    eligibility_score: float
    risk_factors: List[str]

async def score_patients(
    patients: List[Patient],
    screening_type: str
) -> List[PatientScore]:
    """Calculate eligibility scores for a cohort of patients.

    Args:
        patients: List of patient records
        screening_type: Type of screening (mammogram, colonoscopy, pap_smear)

    Returns:
        List of scored patients sorted by priority

    Raises:
        ValidationError: If patient data is incomplete
    """
    scored = []
    for patient in patients:
        try:
            score = await self._calculate_score(patient, screening_type)
            scored.append(score)
        except ValidationError as e:
            logger.warning(f"Skipping patient {hash_patient_id(patient.id)}: {e}")
            continue

    return sorted(scored, key=lambda x: x.eligibility_score, reverse=True)

# ❌ BAD: No types, unclear logic, poor error handling
def score_patients(patients, type):
    return sorted([calc(p) for p in patients])
```

---

## 🔐 Security & Compliance

### PHI (Protected Health Information) Handling

**PHI includes**: Name, phone number, email, address, SSN, medical history, screening results, appointment details.

#### ✅ DO

```typescript
// Hash patient IDs in logs
logger.info('Call initiated', {
  patientIdHash: hashPatientId(patientId),
  campaignId: campaignId,
  timestamp: new Date().toISOString()
})

// Encrypt PHI before database storage
const encryptedData = await encryptionService.encryptPHI({
  firstName: patient.firstName,
  lastName: patient.lastName,
  phoneNumber: patient.phoneNumber,
  ssn: patient.ssn
})

await db.patients.create({
  id: patient.id,
  encryptedData: encryptedData.ciphertext,
  encryptionKeyId: encryptedData.keyId
})

// Minimize PHI sent to voice provider
const voiceContext = {
  patient_first_name: patient.firstName,      // OK: Needed for personalization
  screening_type: campaign.screeningType,     // OK: No PHI
  is_overdue: isOverdue(patient.lastScreening) // OK: Derived, not PHI
  // DO NOT send: SSN, full address, detailed medical history
}
```

#### ❌ DON'T

```typescript
// NEVER log PHI in plain text
logger.info('Processing patient', { patient }) // ❌ Contains PHI
console.log('Phone:', patient.phoneNumber)     // ❌ Logs PHI

// NEVER send unnecessary PHI to external services
const voiceContext = {
  ...patient,                          // ❌ Sends entire patient object
  medicalHistory: patient.fullHistory  // ❌ Not needed by voice agent
}

// NEVER store PHI in plain text
await db.patients.create({
  phone: patient.phoneNumber  // ❌ Should be encrypted
})
```

### Authentication & Authorization

```typescript
// Role-Based Access Control (RBAC)
enum Role {
  ADMIN = 'admin',
  CAMPAIGN_MANAGER = 'campaign_manager',
  VIEWER = 'viewer',
  AUDITOR = 'auditor'
}

enum Permission {
  CREATE_CAMPAIGN = 'create_campaign',
  VIEW_PHI = 'view_phi',
  INITIATE_CALLS = 'initiate_calls',
  VIEW_AUDIT_LOGS = 'view_audit_logs'
}

interface User {
  id: string
  email: string
  role: Role
  permissions: Permission[]
}

// Middleware for permission checks
function requirePermission(permission: Permission) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.permissions.includes(permission)) {
      throw new ForbiddenError('Insufficient permissions')
    }
    next()
  }
}

// Usage
app.post('/campaigns',
  authenticate,
  requirePermission(Permission.CREATE_CAMPAIGN),
  createCampaignHandler
)
```

### Input Validation

```typescript
import { z } from 'zod'

// Define schemas for ALL external inputs
const CreateCampaignSchema = z.object({
  name: z.string().min(1).max(200),
  screeningType: z.enum(['mammogram', 'colonoscopy', 'pap_smear']),
  patientCohortId: z.string().uuid(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  messageTemplate: z.string().max(500),
  targetCallsPerDay: z.number().int().min(1).max(1000)
})

type CreateCampaignInput = z.infer<typeof CreateCampaignSchema>

async function createCampaign(
  req: Request,
  res: Response
): Promise<Response> {
  // Validate and parse - throws ZodError if invalid
  const data = CreateCampaignSchema.parse(req.body)

  // data is now type-safe and validated
  const campaign = await campaignService.create(data)

  return res.status(201).json(campaign)
}
```

---

## 🔄 Development Workflow

### When Starting a New Feature

1. **Understand Requirements**
   - Read the feature request thoroughly
   - Consult `ARCHITECTURE.md` for architectural patterns
   - Identify affected components

2. **Check for PHI Impact**
   - Does this feature access/store/transmit PHI?
   - If YES: Document privacy safeguards and encryption approach

3. **Plan Implementation**
   - Break down into small, testable units
   - Identify dependencies
   - Consider edge cases and error scenarios

4. **Implement with Safety**
   - Write types/interfaces first
   - Implement core logic
   - Add comprehensive error handling
   - Add logging (hash any PHI!)

5. **Test Thoroughly**
   - Unit tests for business logic
   - Integration tests for workflows
   - Security tests for PHI handling
   - Guardrail tests if applicable

6. **Document**
   - Update relevant documentation
   - Add inline comments for complex logic
   - Document any architectural decisions

### Git Workflow

```bash
# Always work on feature branches
git checkout -b feature/add-patient-eligibility-scoring

# Make atomic commits with clear messages
git commit -m "feat(data-services): Add patient eligibility scoring

- Implement EligibilityEngine with risk factor analysis
- Add ML-based prioritization using scikit-learn
- Include comprehensive test coverage (95%)
- Add PHI encryption for patient demographic data

Refs: #123"

# Push to remote
git push -u origin feature/add-patient-eligibility-scoring

# Create PR with detailed description
gh pr create --title "Add Patient Eligibility Scoring" --body "..."
```

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
**Scopes**: `frontend`, `backend`, `data-services`, `guardrails`, `voice`, `infrastructure`

---

## 🧪 Testing Standards

### Test Coverage Targets
- **Critical Paths**: 90%+ (guardrails, encryption, PHI handling, scheduling)
- **Business Logic**: 80%+
- **UI Components**: 70%+

### Unit Test Example (TypeScript)

```typescript
import { describe, it, expect, beforeEach, jest } from '@jest/globals'

describe('SessionDecorator', () => {
  let decorator: SessionDecorator
  let mockPatientService: jest.Mocked<PatientService>
  let mockClinicalService: jest.Mocked<ClinicalService>

  beforeEach(() => {
    mockPatientService = {
      getPatient: jest.fn(),
    } as any

    mockClinicalService = {
      getScreeningData: jest.fn(),
    } as any

    decorator = new SessionDecorator(
      mockPatientService,
      mockClinicalService
    )
  })

  describe('decorateSession', () => {
    it('should include patient first name in personalization', async () => {
      // Arrange
      const baseSession = { id: 'session-123' }
      const patient = {
        id: 'patient-456',
        firstName: 'Jane',
        lastName: 'Doe'
      }

      mockPatientService.getPatient.mockResolvedValue(patient)
      mockClinicalService.getScreeningData.mockResolvedValue({
        lastScreening: null,
        isOverdue: true
      })

      // Act
      const decorated = await decorator.decorateSession(
        baseSession,
        'patient-456',
        'campaign-789'
      )

      // Assert
      expect(decorated.personalization.firstName).toBe('Jane')
      expect(mockPatientService.getPatient).toHaveBeenCalledWith('patient-456')
    })

    it('should handle missing patient data gracefully', async () => {
      // Arrange
      mockPatientService.getPatient.mockRejectedValue(
        new NotFoundError('Patient not found')
      )

      // Act & Assert
      await expect(
        decorator.decorateSession({}, 'invalid-id', 'campaign-789')
      ).rejects.toThrow(SessionDecorationError)
    })

    it('should NOT include PHI in logs on error', async () => {
      // Arrange
      const logSpy = jest.spyOn(logger, 'error')
      mockPatientService.getPatient.mockRejectedValue(new Error('DB error'))

      // Act
      try {
        await decorator.decorateSession({}, 'patient-456', 'campaign-789')
      } catch (e) {
        // Expected
      }

      // Assert - ensure no PHI in logs
      expect(logSpy).toHaveBeenCalled()
      const logCall = logSpy.mock.calls[0]
      expect(JSON.stringify(logCall)).not.toContain('Jane')
      expect(JSON.stringify(logCall)).not.toContain('Doe')
    })
  })
})
```

### Integration Test Example

```typescript
describe('Voice Call Integration', () => {
  it('should complete full call lifecycle with guardrail validation', async () => {
    // 1. Initiate call
    const call = await callService.initiateCall(
      testPatientId,
      testCampaignId
    )
    expect(call.status).toBe('ACTIVE')

    // 2. Simulate patient accepting to schedule
    await callService.processEvent(call.id, {
      type: 'PATIENT_RESPONSE',
      content: 'Yes, I would like to schedule my screening'
    })

    // 3. Verify guardrails passed
    const violations = await guardrailService.getViolations(call.id)
    expect(violations).toHaveLength(0)

    // 4. Book appointment
    const appointment = await callService.bookAppointment(
      call.id,
      testSlotId
    )
    expect(appointment.status).toBe('CONFIRMED')

    // 5. Verify audit log created
    const auditLogs = await auditService.getLogs({
      sessionId: call.id
    })
    expect(auditLogs).toContainEqual(
      expect.objectContaining({
        action: 'APPOINTMENT_BOOKED',
        outcome: 'SUCCESS'
      })
    )

    // 6. Terminate call
    await callService.terminateCall(call.id)
    expect(await callService.getStatus(call.id)).toBe('COMPLETED')
  })
})
```

### Guardrail Test Example

```typescript
describe('ComplianceGuardrail', () => {
  let guardrail: ComplianceGuardrail

  beforeEach(() => {
    guardrail = new ComplianceGuardrail()
  })

  it('should block medical diagnosis attempts', async () => {
    const context = {
      sessionId: 'test-session',
      latestUtterance: "Can you tell me if I have cancer based on my symptoms?"
    }

    const result = await guardrail.evaluate(context)

    expect(result.passed).toBe(false)
    expect(result.action).toBe('REDIRECT')
    expect(result.redirectScript).toContain('healthcare provider')
    expect(result.severity).toBe('CRITICAL')
  })

  it('should allow scheduling questions', async () => {
    const context = {
      sessionId: 'test-session',
      latestUtterance: "What times are available for my mammogram screening?"
    }

    const result = await guardrail.evaluate(context)

    expect(result.passed).toBe(true)
  })

  it('should block prescription requests', async () => {
    const context = {
      sessionId: 'test-session',
      latestUtterance: "Can you prescribe me medication for my condition?"
    }

    const result = await guardrail.evaluate(context)

    expect(result.passed).toBe(false)
    expect(result.action).toBe('REDIRECT')
    expect(result.severity).toBe('CRITICAL')
  })
})
```

---

## ⚠️ Common Pitfalls

### 1. Logging PHI
❌ **NEVER**:
```typescript
logger.info('Processing patient', { patient })
console.log('Phone number:', patient.phoneNumber)
logger.debug('Patient data:', JSON.stringify(patient))
```

✅ **ALWAYS**:
```typescript
logger.info('Processing patient', {
  patientIdHash: hashPatientId(patient.id),
  campaignId: campaign.id,
  timestamp: new Date().toISOString()
})
```

### 2. Insufficient Error Handling
❌ **NEVER**:
```typescript
const patient = await db.patients.findOne(id)
return patient.phoneNumber // What if patient is null?
```

✅ **ALWAYS**:
```typescript
const patient = await db.patients.findOne(id)
if (!patient) {
  throw new NotFoundError(`Patient not found`, {
    patientIdHash: hashPatientId(id)
  })
}
return patient.phoneNumber
```

### 3. Ignoring Guardrail Violations
❌ **NEVER**:
```typescript
const result = await guardrails.evaluate(context)
// Continue anyway, ignore result
await sendMessage(context.message)
```

✅ **ALWAYS**:
```typescript
const result = await guardrails.evaluate(context)
if (!result.passed) {
  logger.error('Guardrail violation detected', {
    sessionIdHash: hashSessionId(sessionId),
    violation: result.violation,
    severity: result.severity
  })

  if (result.severity === 'CRITICAL') {
    await terminateCall(sessionId)
    return
  }

  if (result.action === 'REDIRECT') {
    await sendMessage(result.redirectScript)
    return
  }
}

await sendMessage(context.message)
```

### 4. Hardcoding Configuration
❌ **NEVER**:
```typescript
const apiKey = 'vapi_sk_1234567890'
const dbUrl = 'postgresql://localhost:5432/prod'
```

✅ **ALWAYS**:
```typescript
const apiKey = process.env.VAPI_API_KEY
if (!apiKey) {
  throw new ConfigurationError('VAPI_API_KEY environment variable not set')
}

const dbUrl = process.env.DATABASE_URL
if (!dbUrl) {
  throw new ConfigurationError('DATABASE_URL environment variable not set')
}
```

### 5. Not Validating External Inputs
❌ **NEVER**:
```typescript
app.post('/campaigns', async (req, res) => {
  const campaign = await createCampaign(req.body) // No validation!
  res.json(campaign)
})
```

✅ **ALWAYS**:
```typescript
app.post('/campaigns', async (req, res) => {
  const validatedData = CreateCampaignSchema.parse(req.body) // Throws if invalid
  const campaign = await createCampaign(validatedData)
  res.json(campaign)
})
```

---

## 🤖 AI Assistant Guidelines

### When to Ask for Clarification

**STOP and ask** if you encounter:

1. **Unclear PHI handling**: Not sure if a field contains PHI?
2. **Guardrail edge cases**: Found a scenario not covered by existing guardrails?
3. **External service integration**: Adding a new third-party service?
4. **Database schema changes**: Modifying patient or campaign tables?
5. **Voice provider changes**: Switching or adding voice providers?
6. **Architectural decisions**: Multiple valid approaches with different trade-offs?

### Decision-Making Framework

```
┌─────────────────────────────────────────┐
│  Does this change handle PHI?           │
│                                         │
│  YES → Document encryption approach     │
│        Add audit logging                │
│        Review with security mindset     │
│                                         │
│  NO  → Proceed with standard practices  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Does this change affect voice AI?      │
│                                         │
│  YES → Review guardrail requirements    │
│        Test conversation flows          │
│        Validate context minimization    │
│                                         │
│  NO  → Proceed with standard practices  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Are there multiple valid approaches?   │
│                                         │
│  YES → List trade-offs                  │
│        Ask user for preference          │
│        Document decision rationale      │
│                                         │
│  NO  → Proceed with best practice       │
└─────────────────────────────────────────┘
```

### Implementation Checklist

Before marking a feature as complete:

- [ ] **Type Safety**: All functions have explicit return types
- [ ] **Error Handling**: Try-catch blocks around external calls
- [ ] **Validation**: Input validation with Zod/Pydantic
- [ ] **PHI Safety**: No PHI in logs, encrypted at rest
- [ ] **Tests**: Unit tests with 80%+ coverage
- [ ] **Guardrails**: If voice-related, guardrails implemented and tested
- [ ] **Documentation**: Inline comments for complex logic
- [ ] **Audit Logging**: Critical actions logged with actor/action/outcome

### Code Review Self-Check

```typescript
// Before committing, ask yourself:
// 1. Would this code pass a HIPAA compliance audit?
// 2. Are all error cases handled gracefully?
// 3. Is PHI properly encrypted/hashed?
// 4. Are there sufficient tests?
// 5. Is the code self-documenting or well-commented?
// 6. Does this follow the architectural patterns in ARCHITECTURE.md?
```

---

## 📚 Quick Reference

### Environment Variables

```bash
# Backend API
DATABASE_URL=postgresql://user:pass@host:5432/clinical_campaigns
REDIS_URL=redis://localhost:6379
VAPI_API_KEY=vapi_sk_...
ELEVEN_LABS_API_KEY=...
ENCRYPTION_KEY_ID=...
JWT_SECRET=...
NODE_ENV=production

# Frontend
REACT_APP_API_URL=https://api.clinical-campaigns.com
REACT_APP_ENV=production

# Data Services (Python)
DATABASE_URL=postgresql://user:pass@host:5432/clinical_campaigns
MODEL_PATH=/models/eligibility
LOG_LEVEL=INFO
```

### Useful Commands

```bash
# Development
npm run dev              # Start backend dev server
npm start                # Start frontend dev server
python -m uvicorn main:app --reload  # Start Python API

# Testing
npm test                 # Run Jest tests
npm run test:coverage    # Coverage report
pytest                   # Run Python tests
pytest --cov             # Python coverage

# Type Checking
npm run type-check       # TypeScript
mypy data_services/      # Python

# Linting
npm run lint             # ESLint
npm run lint:fix         # Auto-fix
black data_services/     # Python formatting
ruff check data_services/ # Python linting

# Database
npm run migrate          # Run Prisma migrations
npm run db:seed          # Seed test data
alembic upgrade head     # Python migrations

# Docker
docker-compose up        # Start all services
docker-compose down      # Stop all services
```

### Key Files to Review

| File | Purpose |
|------|---------|
| `ARCHITECTURE.md` | System architecture and design patterns |
| `README.md` | Project overview and quick start |
| `CLAUDE.md` | This file - AI assistant guide |

### Tech Stack Summary

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React, TypeScript, Redux/Zustand, React Query, Tailwind CSS |
| **Backend** | Node.js, TypeScript, Express/Fastify, Socket.IO, Prisma |
| **Data Services** | Python 3.10+, FastAPI, Pandas, Scikit-learn, SQLAlchemy |
| **Voice AI** | Vapi, 11 Labs, OpenAI GPT-4 |
| **Database** | PostgreSQL 14+, Redis |
| **Infrastructure** | Docker, AWS/GCP, Terraform |
| **Security** | AWS KMS, Auth0/Cognito |
| **Monitoring** | Datadog, Sentry, CloudWatch |

### Patient ID Hashing Utility

```typescript
import { createHash } from 'crypto'

/**
 * Hash patient ID for logging (one-way hash for privacy)
 */
export function hashPatientId(patientId: string): string {
  return createHash('sha256')
    .update(patientId)
    .digest('hex')
    .substring(0, 16) // First 16 chars for brevity
}

/**
 * Hash session ID for logging
 */
export function hashSessionId(sessionId: string): string {
  return createHash('sha256')
    .update(sessionId)
    .digest('hex')
    .substring(0, 16)
}

// Usage in logs
logger.info('Call initiated', {
  patientIdHash: hashPatientId(patient.id),
  sessionIdHash: hashSessionId(session.id),
  campaignId: campaign.id
})
```

---

## 🎓 Learning Resources

### HIPAA Compliance
- [HHS HIPAA Overview](https://www.hhs.gov/hipaa/index.html)
- [HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/index.html)

### Voice AI
- [Vapi Documentation](https://docs.vapi.ai/)
- [11 Labs API Reference](https://docs.elevenlabs.io/)
- [OpenAI GPT-4 Best Practices](https://platform.openai.com/docs/guides/gpt-best-practices)

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Zod Documentation](https://zod.dev/)

### Python
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Pydantic Documentation](https://docs.pydantic.dev/)

---

## 🔄 Document Maintenance

**This document should be updated when:**
- New architectural patterns are introduced
- Security practices change
- New third-party integrations are added
- HIPAA compliance requirements evolve
- Tech stack changes

**Update Process:**
1. Make changes to `CLAUDE.md`
2. Update version number and "Last Updated" date
3. Commit with message: `docs: Update CLAUDE.md - [brief description]`
4. Notify team of significant changes

---

## ✅ Final Checklist for AI Assistants

Before implementing ANY feature:
- [ ] Read `ARCHITECTURE.md` for architectural context
- [ ] Understand PHI implications
- [ ] Review relevant guardrails
- [ ] Plan error handling strategy
- [ ] Consider security implications
- [ ] Plan test coverage

When in doubt:
- **Prioritize safety over speed**
- **Ask questions rather than assume**
- **Default to stricter security/privacy measures**

---

**Remember**: This platform impacts real patients' health outcomes. Every line of code matters. When in doubt, prioritize safety, security, and patient privacy.
