# Clinical Campaigns - System Architecture

## Table of Contents

1. [System Overview](#system-overview)
2. [High-Level Architecture](#high-level-architecture)
3. [Core Components](#core-components)
4. [Voice AI Integration Layer](#voice-ai-integration-layer)
5. [Guardrails & Safety Layer](#guardrails--safety-layer)
6. [Session Decoration & Context Management](#session-decoration--context-management)
7. [Data Flow](#data-flow)
8. [Security Architecture](#security-architecture)
9. [Deployment Architecture](#deployment-architecture)

---

## System Overview

The Clinical Campaigns platform orchestrates AI-powered voice outreach to patients for preventive healthcare screenings. The architecture prioritizes safety, compliance, and scalability while maintaining natural patient interactions.

### Design Principles

- **Safety First**: Multi-layer guardrails prevent harmful or non-compliant conversations
- **Privacy by Design**: HIPAA compliance built into every layer
- **Observability**: Comprehensive logging and monitoring of all interactions
- **Modularity**: Loosely coupled services enable independent scaling and updates
- **Resilience**: Graceful degradation and failover mechanisms

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                          │
│                     (React + TypeScript)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Campaign    │  │  Patient     │  │  Analytics   │         │
│  │  Dashboard   │  │  Management  │  │  Dashboard   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/REST API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     API Gateway Layer                           │
│              (Authentication, Rate Limiting)                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend API Layer                            │
│                  (TypeScript + Node.js)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Campaign    │  │  Session     │  │  Scheduling  │         │
│  │  Service     │  │  Manager     │  │  Service     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
           │                    │                    │
           │                    ▼                    │
           │     ┌──────────────────────────┐       │
           │     │  Guardrail Engine        │       │
           │     │  (Safety & Compliance)   │       │
           │     └──────────────────────────┘       │
           │                    │                    │
           ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                Voice AI Integration Layer                       │
│                    (Vapi / 11 Labs)                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Voice Agent │  │  Session     │  │  Call        │         │
│  │  Orchestrator│  │  Decorator   │  │  Controller  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   Voice AI      │
                    │   Provider      │
                    │  (Vapi/11Labs)  │
                    └─────────────────┘
                              │
                              ▼
                       Patient Phone Call

┌─────────────────────────────────────────────────────────────────┐
│                   Data Services Layer                           │
│                        (Python)                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Patient     │  │  Analytics   │  │  ML Models   │         │
│  │  Eligibility │  │  Engine      │  │  (Scoring)   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Data Storage Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  PostgreSQL  │  │  Redis       │  │  S3/Object   │         │
│  │  (Primary)   │  │  (Cache)     │  │  Storage     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. Frontend Layer (React + TypeScript)

**Responsibilities:**
- Campaign creation and management interface
- Patient list management and segmentation
- Real-time call monitoring dashboard
- Analytics and reporting visualizations

**Key Features:**
- Type-safe component architecture
- Redux/Zustand for state management
- React Query for server state synchronization
- Recharts/D3 for data visualization

### 2. Backend API Layer (TypeScript + Node.js)

**Responsibilities:**
- Campaign orchestration and workflow management
- Session lifecycle management
- Integration with voice AI providers
- Real-time event processing

**Key Modules:**

#### Campaign Service
```typescript
interface CampaignService {
  createCampaign(config: CampaignConfig): Promise<Campaign>
  scheduleCalls(campaignId: string, patients: Patient[]): Promise<void>
  monitorProgress(campaignId: string): Promise<CampaignMetrics>
}
```

#### Session Manager
```typescript
interface SessionManager {
  initializeSession(callContext: CallContext): Promise<Session>
  decorateSession(session: Session, patientData: PatientData): Session
  updateSessionState(sessionId: string, event: SessionEvent): void
  terminateSession(sessionId: string, reason: string): void
}
```

#### Scheduling Service
```typescript
interface SchedulingService {
  findAvailableSlots(clinicId: string, date: Date): Promise<TimeSlot[]>
  bookAppointment(appointment: AppointmentRequest): Promise<Confirmation>
  sendConfirmation(patientId: string, appointment: Appointment): void
}
```

### 3. Data Services Layer (Python)

**Responsibilities:**
- Patient eligibility determination
- Campaign analytics and reporting
- ML-based patient scoring and prioritization

**Key Modules:**

#### Patient Eligibility Engine
```python
class EligibilityEngine:
    def score_patients(self, patients: list[Patient]) -> list[ScoredPatient]:
        """Calculate eligibility scores based on demographics, history, risk factors"""

    def segment_cohorts(self, patients: list[Patient]) -> dict[str, list[Patient]]:
        """Group patients into targeted cohorts"""
```

#### Analytics Engine
```python
class AnalyticsEngine:
    def calculate_campaign_metrics(self, campaign_id: str) -> CampaignMetrics:
        """Compute KPIs: contact rate, conversion rate, appointment show rate"""

    def generate_insights(self, campaign_id: str) -> list[Insight]:
        """ML-driven insights on campaign performance"""
```

---

## Voice AI Integration Layer

### Architecture Pattern: Adapter + Decorator

The Voice AI Integration Layer abstracts provider-specific implementations (Vapi, 11 Labs) behind a unified interface, enabling easy provider switching and multi-provider support.

### Voice Agent Orchestrator

```typescript
interface VoiceProvider {
  initiateCall(request: CallRequest): Promise<CallSession>
  updateCallContext(sessionId: string, context: CallContext): void
  terminateCall(sessionId: string): void
  subscribeToEvents(sessionId: string, handler: EventHandler): void
}

class VapiProvider implements VoiceProvider {
  private apiKey: string
  private webhookUrl: string

  async initiateCall(request: CallRequest): Promise<CallSession> {
    const vapiCall = await this.vapiClient.calls.create({
      phoneNumberId: this.phoneNumberId,
      customer: { number: request.phoneNumber },
      assistant: {
        model: { provider: "openai", model: "gpt-4" },
        voice: { provider: "11labs", voiceId: request.voiceId },
        firstMessage: request.greeting,
      },
      assistantOverrides: {
        variableValues: request.sessionContext
      }
    })

    return this.mapToCallSession(vapiCall)
  }
}

class ElevenLabsProvider implements VoiceProvider {
  // 11 Labs specific implementation
}
```

### Provider Selection Strategy

```typescript
class ProviderSelector {
  selectProvider(campaign: Campaign): VoiceProvider {
    // Route based on campaign requirements, cost, availability
    if (campaign.requiresLowLatency) {
      return new VapiProvider()
    } else if (campaign.requiresHighQualityVoice) {
      return new ElevenLabsProvider()
    }
    return this.defaultProvider
  }
}
```

---

## Guardrails & Safety Layer

The Guardrails system implements multi-layer safety controls to ensure compliant, safe, and effective patient interactions.

### Guardrail Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Guardrail Engine                          │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                 │
│  │  Pre-Call       │  │  Real-Time      │                 │
│  │  Validation     │  │  Monitoring     │                 │
│  └─────────────────┘  └─────────────────┘                 │
│           │                    │                           │
│           ▼                    ▼                           │
│  ┌──────────────────────────────────────┐                 │
│  │      Guardrail Rules Engine          │                 │
│  │                                      │                 │
│  │  • Content Filtering                │                 │
│  │  • HIPAA Compliance Checks          │                 │
│  │  • Sentiment Analysis               │                 │
│  │  • Topic Boundary Enforcement       │                 │
│  │  • Emergency Detection              │                 │
│  └──────────────────────────────────────┘                 │
│                      │                                     │
│                      ▼                                     │
│  ┌──────────────────────────────────────┐                 │
│  │      Action Handler                  │                 │
│  │                                      │                 │
│  │  • Warn                              │                 │
│  │  • Redirect Conversation             │                 │
│  │  • Escalate to Human                 │                 │
│  │  • Terminate Call                    │                 │
│  └──────────────────────────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

### Guardrail Implementation

```typescript
interface Guardrail {
  name: string
  evaluate(context: ConversationContext): GuardrailResult
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
}

class ComplianceGuardrail implements Guardrail {
  name = 'HIPAA_COMPLIANCE'
  severity = 'CRITICAL'

  private prohibitedTopics = [
    'diagnosis', 'prescription', 'treatment_recommendation'
  ]

  evaluate(context: ConversationContext): GuardrailResult {
    const transcription = context.latestUtterance
    const detectedTopics = this.detectTopics(transcription)

    const violations = detectedTopics.filter(topic =>
      this.prohibitedTopics.includes(topic)
    )

    if (violations.length > 0) {
      return {
        passed: false,
        action: 'REDIRECT',
        message: 'Agent attempted to provide medical advice',
        redirectScript: this.getRedirectScript(violations[0])
      }
    }

    return { passed: true }
  }

  private getRedirectScript(topic: string): string {
    return "I'm here to help you schedule your screening. For specific medical questions, please consult with your healthcare provider during your appointment."
  }
}

class SentimentGuardrail implements Guardrail {
  name = 'PATIENT_DISTRESS'
  severity = 'HIGH'

  evaluate(context: ConversationContext): GuardrailResult {
    const sentiment = this.analyzeSentiment(context.latestUtterance)

    if (sentiment.distress > 0.8 || sentiment.anger > 0.9) {
      return {
        passed: false,
        action: 'ESCALATE',
        message: 'Patient exhibiting high distress/anger',
        escalationReason: 'EMOTIONAL_DISTRESS'
      }
    }

    return { passed: true }
  }
}

class EmergencyDetectionGuardrail implements Guardrail {
  name = 'EMERGENCY_DETECTION'
  severity = 'CRITICAL'

  private emergencyKeywords = [
    'chest pain', 'can\'t breathe', 'suicidal', 'emergency'
  ]

  evaluate(context: ConversationContext): GuardrailResult {
    const text = context.latestUtterance.toLowerCase()
    const hasEmergency = this.emergencyKeywords.some(kw => text.includes(kw))

    if (hasEmergency) {
      return {
        passed: false,
        action: 'TERMINATE_AND_ESCALATE',
        message: 'Emergency situation detected',
        immediateAction: this.provideEmergencyGuidance()
      }
    }

    return { passed: true }
  }

  private provideEmergencyGuidance(): string {
    return "If you're experiencing a medical emergency, please hang up and call 911 immediately."
  }
}
```

### Guardrail Orchestration

```typescript
class GuardrailEngine {
  private guardrails: Guardrail[] = [
    new ComplianceGuardrail(),
    new SentimentGuardrail(),
    new EmergencyDetectionGuardrail(),
    new TopicBoundaryGuardrail(),
    new ContentFilterGuardrail()
  ]

  async evaluateConversation(context: ConversationContext): Promise<GuardrailDecision> {
    const results = await Promise.all(
      this.guardrails.map(g => g.evaluate(context))
    )

    // Critical failures take immediate precedence
    const criticalFailures = results.filter(r =>
      !r.passed && this.getGuardrailSeverity(r) === 'CRITICAL'
    )

    if (criticalFailures.length > 0) {
      return this.handleCriticalFailure(criticalFailures[0])
    }

    // Handle non-critical violations
    const violations = results.filter(r => !r.passed)
    if (violations.length > 0) {
      return this.handleViolations(violations)
    }

    return { allowed: true, modifications: [] }
  }

  private handleCriticalFailure(result: GuardrailResult): GuardrailDecision {
    this.logViolation(result, 'CRITICAL')
    this.alertSecurityTeam(result)

    switch (result.action) {
      case 'TERMINATE_AND_ESCALATE':
        return {
          allowed: false,
          terminateCall: true,
          finalMessage: result.immediateAction
        }
      case 'ESCALATE':
        return {
          allowed: true,
          escalateToHuman: true,
          reason: result.escalationReason
        }
      default:
        return { allowed: false, terminateCall: true }
    }
  }
}
```

---

## Session Decoration & Context Management

Session decoration enriches voice agent interactions with personalized patient context while maintaining privacy and compliance.

### Session Lifecycle

```
1. Session Initialization
   ├─ Generate session ID
   ├─ Fetch patient data (encrypted)
   └─ Initialize conversation context

2. Session Decoration
   ├─ Personalization layer (name, preferred language)
   ├─ Clinical context (screening type, last visit)
   ├─ Behavioral context (preferred contact time, call history)
   └─ Compliance metadata (consent status, opt-out flags)

3. Active Session Management
   ├─ Real-time context updates
   ├─ Guardrail evaluation
   ├─ Event streaming
   └─ State persistence

4. Session Termination
   ├─ Outcome recording
   ├─ Audit trail creation
   └─ Context cleanup
```

### Session Decorator Implementation

```typescript
interface SessionContext {
  sessionId: string
  patientId: string
  campaignId: string
  personalization: PersonalizationContext
  clinicalContext: ClinicalContext
  conversationState: ConversationState
  metadata: SessionMetadata
}

class SessionDecorator {
  async decorateSession(
    baseSession: Session,
    patientId: string,
    campaignId: string
  ): Promise<SessionContext> {
    // Fetch patient data (cached where possible)
    const [patient, clinicalData, history] = await Promise.all([
      this.patientService.getPatient(patientId),
      this.clinicalService.getScreeningData(patientId),
      this.historyService.getContactHistory(patientId)
    ])

    // Build personalization layer
    const personalization = this.buildPersonalization(patient, history)

    // Build clinical context
    const clinicalContext = this.buildClinicalContext(clinicalData, campaignId)

    // Initialize conversation state
    const conversationState = this.initializeConversationState(campaignId)

    return {
      sessionId: baseSession.id,
      patientId,
      campaignId,
      personalization,
      clinicalContext,
      conversationState,
      metadata: {
        startTime: new Date(),
        channel: 'voice',
        provider: baseSession.provider
      }
    }
  }

  private buildPersonalization(
    patient: Patient,
    history: ContactHistory
  ): PersonalizationContext {
    return {
      firstName: patient.firstName,
      preferredName: patient.preferredName || patient.firstName,
      preferredLanguage: patient.language || 'en',
      timezone: patient.timezone,
      bestContactTime: history.preferredContactWindow,
      voicePreference: this.selectVoice(patient.demographics)
    }
  }

  private buildClinicalContext(
    data: ScreeningData,
    campaignId: string
  ): ClinicalContext {
    const campaign = this.campaignService.getCampaign(campaignId)

    return {
      screeningType: campaign.screeningType,
      isOverdue: data.isOverdue,
      lastScreeningDate: data.lastScreening?.date,
      riskFactors: this.sanitizeForVoice(data.riskFactors),
      eligibilityStatus: data.eligibility,
      recommendedAction: this.getRecommendedAction(data, campaign)
    }
  }

  private initializeConversationState(campaignId: string): ConversationState {
    const campaign = this.campaignService.getCampaign(campaignId)

    return {
      currentPhase: 'GREETING',
      objectives: campaign.conversationObjectives,
      completedObjectives: [],
      topicHistory: [],
      patientIntent: null,
      requiresFollowup: false
    }
  }
}
```

### Context Variables for Voice AI

```typescript
interface VoiceAgentContext {
  // Personalization
  patient_first_name: string
  preferred_name: string

  // Clinical Context (sanitized for voice)
  screening_type: 'mammogram' | 'colonoscopy' | 'pap_smear'
  is_overdue: boolean
  last_screening: string // e.g., "over a year ago"

  // Conversation Flow
  conversation_objective: string
  allowed_topics: string[]

  // Scheduling
  available_locations: string[]
  next_available_date: string

  // Compliance
  has_consent: boolean
  can_leave_voicemail: boolean
}

class ContextAdapter {
  adaptForVoiceProvider(context: SessionContext): VoiceAgentContext {
    return {
      patient_first_name: context.personalization.firstName,
      preferred_name: context.personalization.preferredName,

      screening_type: context.clinicalContext.screeningType,
      is_overdue: context.clinicalContext.isOverdue,
      last_screening: this.formatLastScreening(
        context.clinicalContext.lastScreeningDate
      ),

      conversation_objective: this.getObjectiveText(context.campaignId),
      allowed_topics: this.getAllowedTopics(context.campaignId),

      available_locations: context.clinicalContext.eligibleLocations,
      next_available_date: this.getNextAvailableSlot(context.patientId),

      has_consent: context.metadata.consentStatus === 'GRANTED',
      can_leave_voicemail: context.metadata.voicemailConsent
    }
  }

  private formatLastScreening(date?: Date): string {
    if (!date) return "no prior screening on record"

    const monthsAgo = this.monthsSince(date)
    if (monthsAgo < 12) return `${monthsAgo} months ago`

    const yearsAgo = Math.floor(monthsAgo / 12)
    return `${yearsAgo} year${yearsAgo > 1 ? 's' : ''} ago`
  }
}
```

### Real-Time Context Updates

```typescript
class SessionContextManager {
  private sessions: Map<string, SessionContext> = new Map()

  async updateContext(
    sessionId: string,
    event: ConversationEvent
  ): Promise<void> {
    const context = this.sessions.get(sessionId)
    if (!context) throw new Error('Session not found')

    // Update conversation state based on event
    switch (event.type) {
      case 'PATIENT_RESPONSE':
        await this.processPatientResponse(context, event)
        break

      case 'OBJECTIVE_COMPLETED':
        context.conversationState.completedObjectives.push(event.objective)
        break

      case 'TOPIC_CHANGE':
        context.conversationState.topicHistory.push(event.topic)
        context.conversationState.currentPhase = event.newPhase
        break

      case 'SCHEDULING_INTENT':
        context.conversationState.patientIntent = 'SCHEDULE'
        await this.prepareSchedulingContext(context)
        break
    }

    // Persist updated context
    await this.persistContext(context)

    // Push updates to voice provider if needed
    if (this.requiresProviderUpdate(event)) {
      await this.updateProviderContext(sessionId, context)
    }
  }

  private async prepareSchedulingContext(context: SessionContext): Promise<void> {
    // Fetch real-time availability
    const slots = await this.schedulingService.getAvailableSlots(
      context.clinicalContext.screeningType,
      context.personalization.preferredLocation
    )

    context.schedulingContext = {
      availableSlots: slots,
      preparedForScheduling: true
    }
  }
}
```

---

## Data Flow

### Patient Outreach Flow

```
1. Campaign Creation
   ├─ Define target screening type
   ├─ Set eligibility criteria
   └─ Configure messaging strategy

2. Patient Selection
   ├─ Query eligible patients from data services
   ├─ Apply ML scoring/prioritization
   └─ Generate call queue

3. Call Initiation
   ├─ Session initialization
   ├─ Session decoration with patient context
   ├─ Guardrail validation
   └─ Voice provider call initiation

4. Active Conversation
   ├─ Real-time transcription
   ├─ Guardrail monitoring (every utterance)
   ├─ Context updates
   └─ Intent detection

5. Outcome Recording
   ├─ Conversation summary generation
   ├─ Appointment booking (if applicable)
   ├─ Follow-up task creation
   └─ Analytics event emission

6. Post-Call Processing
   ├─ Audit log creation
   ├─ Campaign metrics update
   └─ Next patient selection
```

### Data Security Flow

```
┌──────────────┐     Encrypted      ┌──────────────┐
│   Frontend   │ ◄────────────────► │   Backend    │
└──────────────┘      TLS 1.3       └──────────────┘
                                            │
                                            │ Field-level
                                            │ Encryption
                                            ▼
                                   ┌──────────────┐
                                   │  PostgreSQL  │
                                   │  (Encrypted  │
                                   │   at Rest)   │
                                   └──────────────┘

┌──────────────┐
│  Voice AI    │ ◄── PHI Minimization: Only send necessary context
│  Provider    │     No raw PHI stored by provider
└──────────────┘
```

---

## Security Architecture

### Defense in Depth

```
Layer 1: Network Security
├─ WAF (Web Application Firewall)
├─ DDoS protection
└─ IP whitelisting for admin access

Layer 2: Application Security
├─ JWT-based authentication
├─ Role-based access control (RBAC)
├─ API rate limiting
└─ Input validation & sanitization

Layer 3: Data Security
├─ Field-level encryption (PII/PHI)
├─ Encryption at rest (AES-256)
├─ Encryption in transit (TLS 1.3)
└─ Secure key management (KMS)

Layer 4: Voice AI Security
├─ PHI minimization in context
├─ Guardrail enforcement
├─ Real-time conversation monitoring
└─ Automatic session termination on violations

Layer 5: Audit & Compliance
├─ Comprehensive audit logging
├─ HIPAA compliance monitoring
├─ Regular security audits
└─ Incident response procedures
```

### Key Management

```typescript
class EncryptionService {
  private kms: KeyManagementService

  async encryptPHI(data: PHIData): Promise<EncryptedData> {
    const dataKey = await this.kms.generateDataKey()
    const encrypted = this.encrypt(data, dataKey.plaintext)

    return {
      ciphertext: encrypted,
      encryptedKey: dataKey.encrypted,
      algorithm: 'AES-256-GCM'
    }
  }

  async decryptPHI(encrypted: EncryptedData): Promise<PHIData> {
    const dataKey = await this.kms.decrypt(encrypted.encryptedKey)
    return this.decrypt(encrypted.ciphertext, dataKey)
  }
}
```

---

## Deployment Architecture

### Production Environment (AWS/GCP)

```
┌─────────────────────────────────────────────────────────┐
│                     CDN (CloudFront)                    │
│                    Static Assets + WAF                  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  Load Balancer (ALB)                    │
│                SSL Termination + Routing                │
└─────────────────────────────────────────────────────────┘
                            │
          ┌─────────────────┴─────────────────┐
          │                                   │
          ▼                                   ▼
┌──────────────────┐              ┌──────────────────┐
│   Frontend       │              │   Backend API    │
│   (ECS/Fargate)  │              │   (ECS/Fargate)  │
│   Auto-scaling   │              │   Auto-scaling   │
└──────────────────┘              └──────────────────┘
                                          │
                                          ▼
                              ┌──────────────────────┐
                              │   Data Services      │
                              │   (ECS/Lambda)       │
                              └──────────────────────┘
                                          │
          ┌───────────────────────────────┼──────────────┐
          │                               │              │
          ▼                               ▼              ▼
┌──────────────────┐          ┌──────────────┐  ┌──────────────┐
│   RDS PostgreSQL │          │    Redis     │  │  S3 Storage  │
│   Multi-AZ       │          │ (ElastiCache)│  │  (Call Logs) │
└──────────────────┘          └──────────────┘  └──────────────┘
```

### Infrastructure as Code

```typescript
// Example CDK/Terraform structure
const infraConfig = {
  vpc: {
    cidr: '10.0.0.0/16',
    subnets: {
      public: ['10.0.1.0/24', '10.0.2.0/24'],
      private: ['10.0.10.0/24', '10.0.11.0/24'],
      database: ['10.0.20.0/24', '10.0.21.0/24']
    }
  },

  services: {
    frontend: {
      cpu: 512,
      memory: 1024,
      minInstances: 2,
      maxInstances: 10
    },
    backend: {
      cpu: 1024,
      memory: 2048,
      minInstances: 2,
      maxInstances: 20
    }
  },

  database: {
    instanceType: 'db.r5.large',
    multiAZ: true,
    backupRetention: 30
  }
}
```

---

## Monitoring & Observability

### Key Metrics

```typescript
interface SystemMetrics {
  // Campaign Metrics
  activeCampaigns: number
  callsInProgress: number
  dailyCallVolume: number

  // Performance Metrics
  apiLatencyP95: number
  voiceProviderLatencyP95: number
  databaseQueryTimeP95: number

  // Quality Metrics
  guardrailViolationRate: number
  callCompletionRate: number
  appointmentBookingRate: number

  // System Health
  errorRate: number
  cpuUtilization: number
  memoryUtilization: number
}
```

### Logging Strategy

```typescript
interface AuditLog {
  timestamp: Date
  sessionId: string
  patientId: string // Hashed
  eventType: AuditEventType
  actor: string
  action: string
  outcome: 'SUCCESS' | 'FAILURE'
  metadata: Record<string, any>
}

// Log levels by component
const loggingConfig = {
  guardrailEngine: 'DEBUG', // High verbosity for compliance
  sessionManager: 'INFO',
  voiceProvider: 'INFO',
  dataServices: 'WARN'
}
```

---

## Technology Stack Summary

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React, TypeScript, Redux/Zustand, React Query, Tailwind CSS |
| **Backend API** | Node.js, TypeScript, Express/Fastify, Socket.IO |
| **Data Services** | Python 3.10+, FastAPI, Pandas, Scikit-learn |
| **Voice AI** | Vapi, 11 Labs, OpenAI GPT-4 |
| **Database** | PostgreSQL 14+, Redis |
| **Infrastructure** | AWS/GCP, Docker, Kubernetes/ECS |
| **Monitoring** | Datadog, Sentry, CloudWatch |
| **Security** | AWS KMS, Vault, Auth0/Cognito |

---

## Next Steps

1. **Phase 1: Foundation**
   - Set up monorepo structure
   - Configure development environments
   - Implement core data models

2. **Phase 2: Voice Integration**
   - Integrate Vapi/11 Labs
   - Build session management
   - Implement basic guardrails

3. **Phase 3: Safety & Compliance**
   - Comprehensive guardrail system
   - HIPAA compliance audit
   - Security hardening

4. **Phase 4: Production Readiness**
   - Load testing
   - Monitoring & alerting
   - Disaster recovery procedures

---

**Document Version**: 1.0
**Last Updated**: 2026-01-03
**Maintained By**: Engineering Team
