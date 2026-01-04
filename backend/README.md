# Clinical Campaigns - Backend API

Session management and voice AI integration for clinical outreach campaigns.

## Quick Start

### Installation

```bash
npm install
```

### Environment Setup

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit `.env` and add your Vapi credentials:

```env
VAPI_API_KEY=your_vapi_api_key_here
VAPI_PHONE_NUMBER_ID=your_phone_number_id
```

### Running the Session Manager

```bash
# Development mode with hot reload
npm run dev

# Production build
npm run build
npm start
```

## Usage

### Initiating a Session

```typescript
import { createSessionManager } from './src'

const sessionManager = createSessionManager()

// Initiate a call session
const session = await sessionManager.initiateSession({
  patientName: 'Maria Garcia',
  phoneNumber: '+1234567890',
  screeningType: 'breast_cancer', // or 'cervical_cancer' or 'colorectal_cancer'
})

console.log('Session created:', session.sessionId)
```

### Monitoring Sessions

```typescript
// Get active sessions
const activeSessions = sessionManager.getActiveSessions()
console.log(`Active sessions: ${activeSessions.length}`)

// Get specific session
const session = sessionManager.getSession(sessionId)
console.log('Session status:', session?.status)
```

### Completing a Session

```typescript
// Complete with outcome
await sessionManager.completeSession(sessionId, 'APPOINTMENT_SCHEDULED')

// Or terminate early
await sessionManager.terminateSession(sessionId, 'Patient requested stop')
```

### Graceful Shutdown

```typescript
// Cleanup all resources
await sessionManager.cleanup()
```

## Session Lifecycle

```
INITIALIZING → ACTIVE → COMPLETED
                  ↓
              TERMINATED
                  ↓
               FAILED
```

### Session States

- **INITIALIZING**: Session is being set up, call is being initiated
- **ACTIVE**: Call is in progress
- **COMPLETED**: Call ended successfully with an outcome
- **FAILED**: Call failed to initiate or encountered an error
- **TERMINATED**: Call was manually terminated

### Call Outcomes

- `APPOINTMENT_SCHEDULED`: Patient scheduled an appointment
- `PATIENT_DECLINED`: Patient declined screening
- `PATIENT_INTERESTED`: Patient interested but didn't schedule
- `NO_ANSWER`: Call went unanswered
- `VOICEMAIL`: Call reached voicemail
- `CALL_FAILED`: Technical failure
- `GUARDRAIL_VIOLATION`: Safety guardrail triggered

## Screening Types

The system supports three screening types:

1. **breast_cancer**: Mammogram screening
2. **cervical_cancer**: Pap smear screening
3. **colorectal_cancer**: Colonoscopy screening

Each type has customized messaging tailored to the specific screening.

## Architecture

### Core Components

- **SessionManager** (`src/services/session-manager.ts`): Orchestrates session lifecycle
- **VapiProvider** (`src/providers/vapi-provider.ts`): Vapi API integration
- **Types** (`src/types/`): TypeScript type definitions
- **Utils** (`src/utils/`): Logger and screening messages

### Session Flow

```
1. initiateSession()
   ├─ Validate input parameters
   ├─ Create session context
   ├─ Call VapiProvider.initiateCall()
   └─ Return session

2. Active Monitoring
   ├─ Track session state
   ├─ Update context as needed
   └─ Emit events

3. completeSession() / terminateSession()
   ├─ Update session status
   ├─ Terminate Vapi call
   ├─ Record outcome
   └─ Cleanup resources
```

## Safety Features

### Automatic Cleanup

- Old sessions are automatically cleaned up after 30 minutes (configurable)
- Cleanup runs every 5 minutes
- Active calls are terminated on process shutdown

### Error Handling

- All Vapi API calls include error handling and logging
- Failed call initiations are tracked and logged
- Graceful degradation when calls can't be terminated

### PHI Protection

- Phone numbers are masked in logs (only last 4 digits shown)
- Patient data is minimized in Vapi context
- All logging follows HIPAA compliance guidelines

## Configuration

Configure via environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `VAPI_API_KEY` | Vapi API key | **Required** |
| `VAPI_PHONE_NUMBER_ID` | Vapi phone number ID | **Required** |
| `VAPI_MODEL_PROVIDER` | LLM provider | `openai` |
| `VAPI_MODEL` | LLM model | `gpt-4` |
| `VAPI_VOICE_PROVIDER` | Voice provider | `11labs` |
| `VAPI_VOICE_ID` | Specific voice ID | Auto-selected |
| `LOG_LEVEL` | Logging level | `info` |
| `NODE_ENV` | Environment | `development` |

## Testing

```bash
npm test
```

## Type Checking

```bash
npm run type-check
```

## Linting

```bash
npm run lint
```

## Troubleshooting

### "Missing required environment variable: VAPI_API_KEY"

Make sure you've created a `.env` file with your Vapi credentials.

### "Failed to initiate call: 401 Unauthorized"

Check that your `VAPI_API_KEY` is correct and active.

### "Failed to initiate call: 404 Not Found"

Verify your `VAPI_PHONE_NUMBER_ID` is correct and the phone number is active in your Vapi account.

## Next Steps

- [ ] Add webhook handlers for Vapi call events
- [ ] Implement guardrail system
- [ ] Add database persistence for sessions
- [ ] Create REST API endpoints
- [ ] Add comprehensive test suite
- [ ] Implement retry logic for failed calls

## Resources

- [Vapi Documentation](https://docs.vapi.ai/)
- [Main Architecture Documentation](../ARCHITECTURE.md)
- [Claude Context](./.claude.md)
