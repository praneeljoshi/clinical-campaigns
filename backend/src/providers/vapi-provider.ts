/**
 * Vapi voice provider implementation
 */

import axios, { AxiosInstance } from 'axios'
import { VoiceProvider, VapiConfig, VapiCallPayload, VapiCallResponse } from '../types/voice-provider'
import { CallRequest, CallSession } from '../types/session'
import { logger } from '../utils/logger'
import { buildFirstMessage } from '../utils/screening-messages'

export class VapiProvider implements VoiceProvider {
  private client: AxiosInstance
  private config: VapiConfig
  private activeCalls: Set<string>

  constructor(config: VapiConfig) {
    this.config = config
    this.activeCalls = new Set()

    // Initialize Vapi HTTP client
    this.client = axios.create({
      baseURL: 'https://api.vapi.ai',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 second timeout
    })

    logger.info('VapiProvider initialized', {
      phoneNumberId: config.phoneNumberId,
      modelProvider: config.modelProvider,
      voiceProvider: config.voiceProvider,
    })
  }

  async initiateCall(request: CallRequest): Promise<CallSession> {
    logger.info('Initiating Vapi call', {
      sessionId: request.sessionId,
      phoneNumber: this.maskPhoneNumber(request.phoneNumber),
      screeningType: request.screeningType,
    })

    try {
      // Build the first message based on screening type
      const firstMessage = buildFirstMessage(
        request.patientName,
        request.screeningType
      )

      // Prepare Vapi call payload
      const payload: VapiCallPayload = {
        phoneNumberId: this.config.phoneNumberId,
        customer: {
          number: request.phoneNumber,
        },
        assistant: {
          model: {
            provider: this.config.modelProvider,
            model: this.config.model,
          },
          voice: {
            provider: this.config.voiceProvider,
            ...(this.config.voiceId && { voiceId: this.config.voiceId }),
          },
          firstMessage,
        },
        assistantOverrides: {
          variableValues: {
            patient_name: request.patientName,
            screening_type: request.screeningType,
            session_id: request.sessionId,
          },
        },
      }

      // Make API call to Vapi
      const response = await this.client.post<VapiCallResponse>(
        '/call',
        payload
      )

      const vapiCall = response.data

      // Track active call
      this.activeCalls.add(vapiCall.id)

      logger.info('Vapi call initiated successfully', {
        sessionId: request.sessionId,
        vapiCallId: vapiCall.id,
        status: vapiCall.status,
      })

      return {
        callId: vapiCall.id,
        status: vapiCall.status,
        startedAt: new Date(vapiCall.createdAt),
        phoneNumber: request.phoneNumber,
      }
    } catch (error) {
      logger.error('Failed to initiate Vapi call', {
        sessionId: request.sessionId,
        error: this.serializeError(error),
      })
      throw new Error(`Failed to initiate call: ${this.getErrorMessage(error)}`)
    }
  }

  async updateCallContext(
    callId: string,
    context: Record<string, any>
  ): Promise<void> {
    logger.debug('Updating Vapi call context', { callId, context })

    try {
      await this.client.patch(`/call/${callId}`, {
        assistantOverrides: {
          variableValues: context,
        },
      })

      logger.info('Vapi call context updated', { callId })
    } catch (error) {
      logger.error('Failed to update Vapi call context', {
        callId,
        error: this.serializeError(error),
      })
      throw new Error(`Failed to update call context: ${this.getErrorMessage(error)}`)
    }
  }

  async terminateCall(callId: string): Promise<void> {
    logger.info('Terminating Vapi call', { callId })

    try {
      await this.client.delete(`/call/${callId}`)

      // Remove from active calls
      this.activeCalls.delete(callId)

      logger.info('Vapi call terminated successfully', { callId })
    } catch (error) {
      logger.error('Failed to terminate Vapi call', {
        callId,
        error: this.serializeError(error),
      })
      // Don't throw - call might already be ended
      // Just remove from tracking
      this.activeCalls.delete(callId)
    }
  }

  async getCallStatus(callId: string): Promise<CallSession> {
    logger.debug('Getting Vapi call status', { callId })

    try {
      const response = await this.client.get<VapiCallResponse>(`/call/${callId}`)
      const vapiCall = response.data

      return {
        callId: vapiCall.id,
        status: vapiCall.status,
        startedAt: new Date(vapiCall.createdAt),
        phoneNumber: vapiCall.customer.number,
      }
    } catch (error) {
      logger.error('Failed to get Vapi call status', {
        callId,
        error: this.serializeError(error),
      })
      throw new Error(`Failed to get call status: ${this.getErrorMessage(error)}`)
    }
  }

  async cleanup(): Promise<void> {
    logger.info('Cleaning up VapiProvider', {
      activeCallsCount: this.activeCalls.size,
    })

    // Terminate all active calls
    const terminationPromises = Array.from(this.activeCalls).map(callId =>
      this.terminateCall(callId).catch(err =>
        logger.warn('Failed to terminate call during cleanup', { callId, error: err })
      )
    )

    await Promise.all(terminationPromises)

    this.activeCalls.clear()
    logger.info('VapiProvider cleanup completed')
  }

  /**
   * Utility: Mask phone number for logging (HIPAA compliance)
   */
  private maskPhoneNumber(phoneNumber: string): string {
    if (phoneNumber.length < 4) return '***'
    return `***${phoneNumber.slice(-4)}`
  }

  /**
   * Utility: Safely serialize error for logging
   */
  private serializeError(error: unknown): any {
    if (axios.isAxiosError(error)) {
      return {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      }
    }
    if (error instanceof Error) {
      return {
        message: error.message,
        name: error.name,
        stack: error.stack,
      }
    }
    return { error: String(error) }
  }

  /**
   * Utility: Extract error message
   */
  private getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
      return error.response?.data?.message || error.message
    }
    if (error instanceof Error) {
      return error.message
    }
    return String(error)
  }
}
