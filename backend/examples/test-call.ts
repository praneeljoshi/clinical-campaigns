/**
 * Test script for initiating a call to a specific number
 */

import { createSessionManager } from '../src'
import { logger } from '../src/utils/logger'

async function testCall() {
  logger.info('=== Testing Session Manager with Real Call ===')

  const sessionManager = createSessionManager()

  // Setup graceful shutdown
  process.on('SIGINT', async () => {
    logger.info('Shutting down...')
    await sessionManager.cleanup()
    process.exit(0)
  })

  try {
    // Test call to user's number
    const session = await sessionManager.initiateSession({
      patientName: 'Test Patient',
      phoneNumber: '+19362037673', // User's number with US country code
      screeningType: 'breast_cancer',
    })

    logger.info('✅ Call initiated successfully!', {
      sessionId: session.sessionId,
      status: session.status,
      vapiCallId: session.vapiCallId,
      screeningType: session.screeningType,
    })

    // Monitor the session for 60 seconds
    logger.info('Monitoring session for 60 seconds...')

    const monitorInterval = setInterval(() => {
      const currentSession = sessionManager.getSession(session.sessionId)
      if (currentSession) {
        const duration = Math.floor(
          (Date.now() - currentSession.startTime.getTime()) / 1000
        )
        logger.info('Session status update', {
          sessionId: currentSession.sessionId,
          status: currentSession.status,
          duration: `${duration}s`,
        })
      }
    }, 10000) // Check every 10 seconds

    // Keep running for monitoring
    logger.info('\nCall in progress. Press Ctrl+C to stop monitoring and cleanup.')
    logger.info('The call will continue even after you stop this script.')
    logger.info('\nTo manually complete the session later, use:')
    logger.info(`  sessionManager.completeSession('${session.sessionId}', 'APPOINTMENT_SCHEDULED')`)

    // Wait for user to stop
    await new Promise(() => {}) // Run indefinitely until Ctrl+C

  } catch (error) {
    logger.error('❌ Failed to initiate call', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    await sessionManager.cleanup()
    process.exit(1)
  }
}

// Run test
testCall()
