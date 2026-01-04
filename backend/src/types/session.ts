/**
 * Session types for Clinical Campaigns platform
 */

export type ScreeningType = 'breast_cancer' | 'cervical_cancer' | 'colorectal_cancer'

export type SessionStatus =
  | 'INITIALIZING'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'FAILED'
  | 'TERMINATED'

export type CallOutcome =
  | 'APPOINTMENT_SCHEDULED'
  | 'PATIENT_DECLINED'
  | 'PATIENT_INTERESTED'
  | 'NO_ANSWER'
  | 'VOICEMAIL'
  | 'CALL_FAILED'
  | 'GUARDRAIL_VIOLATION'

/**
 * Input parameters for initiating a new session
 */
export interface SessionInitParams {
  patientName: string
  phoneNumber: string
  screeningType: ScreeningType
}

/**
 * Complete session context
 */
export interface SessionContext {
  sessionId: string
  patientName: string
  phoneNumber: string
  screeningType: ScreeningType
  status: SessionStatus
  startTime: Date
  endTime?: Date
  callDuration?: number // seconds
  outcome?: CallOutcome
  vapiCallId?: string
  metadata: Record<string, any>
}

/**
 * Voice provider call request
 */
export interface CallRequest {
  phoneNumber: string
  patientName: string
  screeningType: ScreeningType
  sessionId: string
}

/**
 * Voice provider call session
 */
export interface CallSession {
  callId: string
  status: string
  startedAt: Date
  phoneNumber: string
}

/**
 * Session event for lifecycle tracking
 */
export interface SessionEvent {
  sessionId: string
  type: 'STARTED' | 'UPDATED' | 'COMPLETED' | 'FAILED' | 'TERMINATED'
  timestamp: Date
  data?: Record<string, any>
}
