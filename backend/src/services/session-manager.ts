/**
 * Session Manager - Orchestrates conversation sessions
 */

import { v4 as uuidv4 } from 'uuid'
import { VoiceProvider } from '../types/voice-provider'
import {
  SessionContext,
  SessionInitParams,
  SessionStatus,
  CallOutcome,
  SessionEvent,
} from '../types/session'
import { logger } from '../utils/logger'

export interface SessionManagerConfig {
  maxConcurrentSessions?: number
  sessionTimeoutMs?: number
}

export class SessionManager {
  private voiceProvider: VoiceProvider
  private sessions: Map<string, SessionContext>
  private config: SessionManagerConfig
  private cleanupInterval?: NodeJS.Timeout

  constructor(
    voiceProvider: VoiceProvider,
    config: SessionManagerConfig = {}
  ) {
    this.voiceProvider = voiceProvider
    this.sessions = new Map()
    this.config = {
      maxConcurrentSessions: config.maxConcurrentSessions || 100,
      sessionTimeoutMs: config.sessionTimeoutMs || 1800000, // 30 minutes default
    }

    // Start cleanup interval
    this.startCleanupInterval()

    logger.info('SessionManager initialized', {
      maxConcurrentSessions: this.config.maxConcurrentSessions,
      sessionTimeoutMs: this.config.sessionTimeoutMs,
    })
  }

  /**
   * Initiate a new conversation session
   */
  async initiateSession(params: SessionInitParams): Promise<SessionContext> {
    this.validateInitParams(params)

    // Check capacity
    if (this.sessions.size >= this.config.maxConcurrentSessions!) {
      throw new Error(
        `Maximum concurrent sessions reached: ${this.config.maxConcurrentSessions}`
      )
    }

    const sessionId = uuidv4()

    logger.info('Initiating new session', {
      sessionId,
      patientName: params.patientName,
      screeningType: params.screeningType,
    })

    // Create session context
    const session: SessionContext = {
      sessionId,
      patientName: params.patientName,
      phoneNumber: params.phoneNumber,
      screeningType: params.screeningType,
      status: 'INITIALIZING',
      startTime: new Date(),
      metadata: {},
    }

    // Store session
    this.sessions.set(sessionId, session)

    try {
      // Initiate call via voice provider
      const callSession = await this.voiceProvider.initiateCall({
        phoneNumber: params.phoneNumber,
        patientName: params.patientName,
        screeningType: params.screeningType,
        sessionId,
      })

      // Update session with call details
      session.vapiCallId = callSession.callId
      session.status = 'ACTIVE'

      this.emitEvent({
        sessionId,
        type: 'STARTED',
        timestamp: new Date(),
        data: { vapiCallId: callSession.callId },
      })

      logger.info('Session initiated successfully', {
        sessionId,
        vapiCallId: callSession.callId,
        status: session.status,
      })

      return session
    } catch (error) {
      // Mark session as failed
      session.status = 'FAILED'
      session.endTime = new Date()

      logger.error('Failed to initiate session', {
        sessionId,
        error: error instanceof Error ? error.message : String(error),
      })

      this.emitEvent({
        sessionId,
        type: 'FAILED',
        timestamp: new Date(),
        data: { error: error instanceof Error ? error.message : String(error) },
      })

      throw error
    }
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): SessionContext | undefined {
    return this.sessions.get(sessionId)
  }

  /**
   * Get all active sessions
   */
  getActiveSessions(): SessionContext[] {
    return Array.from(this.sessions.values()).filter(
      session => session.status === 'ACTIVE'
    )
  }

  /**
   * Update session context
   */
  async updateSession(
    sessionId: string,
    updates: Partial<SessionContext>
  ): Promise<void> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`)
    }

    // Apply updates
    Object.assign(session, updates)

    logger.debug('Session updated', {
      sessionId,
      updates: Object.keys(updates),
    })

    this.emitEvent({
      sessionId,
      type: 'UPDATED',
      timestamp: new Date(),
      data: updates,
    })
  }

  /**
   * Complete a session with outcome
   */
  async completeSession(
    sessionId: string,
    outcome: CallOutcome
  ): Promise<void> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`)
    }

    logger.info('Completing session', {
      sessionId,
      outcome,
      duration: this.calculateDuration(session),
    })

    // Update session
    session.status = 'COMPLETED'
    session.outcome = outcome
    session.endTime = new Date()
    session.callDuration = this.calculateDuration(session)

    // Terminate call if still active
    if (session.vapiCallId) {
      try {
        await this.voiceProvider.terminateCall(session.vapiCallId)
      } catch (error) {
        logger.warn('Failed to terminate call during session completion', {
          sessionId,
          vapiCallId: session.vapiCallId,
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }

    this.emitEvent({
      sessionId,
      type: 'COMPLETED',
      timestamp: new Date(),
      data: { outcome, duration: session.callDuration },
    })

    logger.info('Session completed', {
      sessionId,
      outcome,
      duration: session.callDuration,
    })
  }

  /**
   * Terminate a session (emergency stop)
   */
  async terminateSession(sessionId: string, reason?: string): Promise<void> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`)
    }

    logger.warn('Terminating session', {
      sessionId,
      reason,
      currentStatus: session.status,
    })

    // Update session
    session.status = 'TERMINATED'
    session.endTime = new Date()
    session.callDuration = this.calculateDuration(session)
    session.metadata.terminationReason = reason

    // Terminate call immediately
    if (session.vapiCallId) {
      try {
        await this.voiceProvider.terminateCall(session.vapiCallId)
      } catch (error) {
        logger.error('Failed to terminate call', {
          sessionId,
          vapiCallId: session.vapiCallId,
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }

    this.emitEvent({
      sessionId,
      type: 'TERMINATED',
      timestamp: new Date(),
      data: { reason },
    })

    logger.warn('Session terminated', {
      sessionId,
      reason,
      duration: session.callDuration,
    })
  }

  /**
   * Cleanup all sessions and resources
   */
  async cleanup(): Promise<void> {
    logger.info('Cleaning up SessionManager', {
      totalSessions: this.sessions.size,
      activeSessions: this.getActiveSessions().length,
    })

    // Stop cleanup interval
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }

    // Terminate all active sessions
    const activeSessions = this.getActiveSessions()
    const terminationPromises = activeSessions.map(session =>
      this.terminateSession(session.sessionId, 'Manager cleanup').catch(err =>
        logger.error('Failed to terminate session during cleanup', {
          sessionId: session.sessionId,
          error: err,
        })
      )
    )

    await Promise.all(terminationPromises)

    // Cleanup voice provider
    await this.voiceProvider.cleanup()

    // Clear sessions
    this.sessions.clear()

    logger.info('SessionManager cleanup completed')
  }

  /**
   * Private: Validate session initialization parameters
   */
  private validateInitParams(params: SessionInitParams): void {
    if (!params.patientName || params.patientName.trim().length === 0) {
      throw new Error('Patient name is required')
    }

    if (!params.phoneNumber || !this.isValidPhoneNumber(params.phoneNumber)) {
      throw new Error('Valid phone number is required')
    }

    const validScreeningTypes = ['breast_cancer', 'cervical_cancer', 'colorectal_cancer']
    if (!validScreeningTypes.includes(params.screeningType)) {
      throw new Error(
        `Invalid screening type. Must be one of: ${validScreeningTypes.join(', ')}`
      )
    }
  }

  /**
   * Private: Basic phone number validation
   */
  private isValidPhoneNumber(phoneNumber: string): boolean {
    // Basic validation - should contain only digits, spaces, +, -, (, )
    // Minimum 10 digits for US numbers
    const cleaned = phoneNumber.replace(/[\s\-\(\)\+]/g, '')
    return /^\d{10,15}$/.test(cleaned)
  }

  /**
   * Private: Calculate session duration in seconds
   */
  private calculateDuration(session: SessionContext): number {
    const endTime = session.endTime || new Date()
    return Math.floor((endTime.getTime() - session.startTime.getTime()) / 1000)
  }

  /**
   * Private: Emit session event (for future event bus integration)
   */
  private emitEvent(event: SessionEvent): void {
    // For now, just log events
    // In production, this would publish to an event bus
    logger.debug('Session event', {
      sessionId: event.sessionId,
      type: event.type,
      timestamp: event.timestamp,
    })
  }

  /**
   * Private: Start cleanup interval to remove old sessions
   */
  private startCleanupInterval(): void {
    // Run cleanup every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupOldSessions()
    }, 300000)
  }

  /**
   * Private: Remove completed sessions older than timeout
   */
  private cleanupOldSessions(): void {
    const now = Date.now()
    const timeout = this.config.sessionTimeoutMs!

    let removedCount = 0

    for (const [sessionId, session] of this.sessions.entries()) {
      // Only clean up completed, failed, or terminated sessions
      if (['COMPLETED', 'FAILED', 'TERMINATED'].includes(session.status)) {
        const sessionAge = now - session.startTime.getTime()
        if (sessionAge > timeout) {
          this.sessions.delete(sessionId)
          removedCount++
        }
      }
    }

    if (removedCount > 0) {
      logger.info('Cleaned up old sessions', {
        removedCount,
        remainingSessions: this.sessions.size,
      })
    }
  }
}
