/**
 * Voice provider abstraction types
 */

import { CallRequest, CallSession } from './session'

/**
 * Unified interface for voice AI providers (Vapi, 11 Labs, etc.)
 */
export interface VoiceProvider {
  /**
   * Initiate an outbound call
   */
  initiateCall(request: CallRequest): Promise<CallSession>

  /**
   * Update the context of an active call
   */
  updateCallContext(callId: string, context: Record<string, any>): Promise<void>

  /**
   * Terminate an active call
   */
  terminateCall(callId: string): Promise<void>

  /**
   * Get the status of a call
   */
  getCallStatus(callId: string): Promise<CallSession>

  /**
   * Cleanup resources
   */
  cleanup(): Promise<void>
}

/**
 * Vapi-specific configuration
 */
export interface VapiConfig {
  apiKey: string
  phoneNumberId: string
  modelProvider?: string
  model?: string
  voiceProvider?: string
  voiceId?: string
}

/**
 * Vapi API call creation payload
 */
export interface VapiCallPayload {
  phoneNumberId: string
  customer: {
    number: string
  }
  assistant: {
    model: {
      provider: string
      model: string
    }
    voice: {
      provider: string
      voiceId?: string
    }
    firstMessage: string
  }
  assistantOverrides?: {
    variableValues?: Record<string, any>
  }
}

/**
 * Vapi API call response
 */
export interface VapiCallResponse {
  id: string
  status: string
  type: string
  phoneNumberId: string
  customer: {
    number: string
  }
  createdAt: string
  updatedAt: string
}
