/**
 * Basic usage example for Session Manager
 */

import { createSessionManager } from '../src'
import { logger } from '../src/utils/logger'

async function example() {
  logger.info('=== Clinical Campaigns Session Manager Example ===')

  // Initialize session manager
  const sessionManager = createSessionManager()

  // Setup graceful shutdown
  process.on('SIGINT', async () => {
    logger.info('Shutting down...')
    await sessionManager.cleanup()
    process.exit(0)
  })

  try {
    // Example 1: Breast cancer screening call
    logger.info('\n--- Example 1: Breast Cancer Screening ---')
    const session1 = await sessionManager.initiateSession({
      patientName: 'Maria Garcia',
      phoneNumber: '+14155551234', // Replace with test number
      screeningType: 'breast_cancer',
    })

    logger.info('Session initiated', {
      sessionId: session1.sessionId,
      status: session1.status,
      vapiCallId: session1.vapiCallId,
    })

    // Wait a bit then check status
    await new Promise(resolve => setTimeout(resolve, 5000))

    const updatedSession = sessionManager.getSession(session1.sessionId)
    logger.info('Session status after 5 seconds', {
      sessionId: updatedSession?.sessionId,
      status: updatedSession?.status,
      duration: updatedSession
        ? Math.floor((Date.now() - updatedSession.startTime.getTime()) / 1000)
        : 0,
    })

    // Example 2: Colorectal cancer screening call
    logger.info('\n--- Example 2: Colorectal Cancer Screening ---')
    const session2 = await sessionManager.initiateSession({
      patientName: 'John Smith',
      phoneNumber: '+14155555678', // Replace with test number
      screeningType: 'colorectal_cancer',
    })

    logger.info('Session initiated', {
      sessionId: session2.sessionId,
      status: session2.status,
    })

    // Example 3: Check all active sessions
    logger.info('\n--- Example 3: Active Sessions ---')
    const activeSessions = sessionManager.getActiveSessions()
    logger.info('Active sessions', {
      count: activeSessions.length,
      sessions: activeSessions.map(s => ({
        sessionId: s.sessionId,
        patientName: s.patientName,
        screeningType: s.screeningType,
        status: s.status,
      })),
    })

    // Example 4: Complete a session (normally done via webhook)
    logger.info('\n--- Example 4: Complete Session ---')
    await new Promise(resolve => setTimeout(resolve, 10000)) // Wait 10 seconds

    await sessionManager.completeSession(
      session1.sessionId,
      'APPOINTMENT_SCHEDULED'
    )

    const completedSession = sessionManager.getSession(session1.sessionId)
    logger.info('Session completed', {
      sessionId: completedSession?.sessionId,
      status: completedSession?.status,
      outcome: completedSession?.outcome,
      duration: completedSession?.callDuration,
    })

    // Example 5: Terminate a session early
    logger.info('\n--- Example 5: Terminate Session ---')
    await sessionManager.terminateSession(
      session2.sessionId,
      'Example termination'
    )

    const terminatedSession = sessionManager.getSession(session2.sessionId)
    logger.info('Session terminated', {
      sessionId: terminatedSession?.sessionId,
      status: terminatedSession?.status,
      duration: terminatedSession?.callDuration,
    })

    // Cleanup
    logger.info('\n--- Cleaning Up ---')
    await sessionManager.cleanup()
    logger.info('Example completed successfully')
  } catch (error) {
    logger.error('Example failed', {
      error: error instanceof Error ? error.message : String(error),
    })
    await sessionManager.cleanup()
    process.exit(1)
  }
}

// Run example
example()
