/**
 * Clinical Campaigns - Session Manager Entry Point
 */

import { config } from './config'
import { VapiProvider } from './providers/vapi-provider'
import { SessionManager } from './services/session-manager'
import { logger } from './utils/logger'

/**
 * Initialize the session manager with Vapi provider
 */
export function createSessionManager(): SessionManager {
  // Initialize Vapi provider
  const vapiProvider = new VapiProvider({
    apiKey: config.vapi.apiKey,
    phoneNumberId: config.vapi.phoneNumberId,
    modelProvider: config.vapi.modelProvider,
    model: config.vapi.model,
    voiceProvider: config.vapi.voiceProvider,
    voiceId: config.vapi.voiceId,
  })

  // Initialize session manager
  const sessionManager = new SessionManager(vapiProvider, {
    maxConcurrentSessions: 100,
    sessionTimeoutMs: 1800000, // 30 minutes
  })

  return sessionManager
}

/**
 * Main execution example
 */
async function main() {
  logger.info('Starting Clinical Campaigns Session Manager')

  const sessionManager = createSessionManager()

  // Setup graceful shutdown
  const cleanup = async () => {
    logger.info('Shutting down gracefully...')
    await sessionManager.cleanup()
    process.exit(0)
  }

  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)

  // Example: Initiate a session
  try {
    const session = await sessionManager.initiateSession({
      patientName: 'Maria Garcia',
      phoneNumber: '+1234567890', // Replace with actual number
      screeningType: 'breast_cancer',
    })

    logger.info('Session created successfully', {
      sessionId: session.sessionId,
      status: session.status,
    })

    // Example: Monitor session
    setTimeout(async () => {
      const currentSession = sessionManager.getSession(session.sessionId)
      if (currentSession) {
        logger.info('Session status check', {
          sessionId: currentSession.sessionId,
          status: currentSession.status,
          duration: Math.floor(
            (Date.now() - currentSession.startTime.getTime()) / 1000
          ),
        })
      }
    }, 10000) // Check after 10 seconds

    // Example: Complete session after some time (or based on webhook)
    // In production, this would be triggered by Vapi webhooks
    // setTimeout(async () => {
    //   await sessionManager.completeSession(session.sessionId, 'APPOINTMENT_SCHEDULED')
    // }, 60000)
  } catch (error) {
    logger.error('Failed to create session', {
      error: error instanceof Error ? error.message : String(error),
    })
  }

  // Keep process running
  logger.info('Session Manager is running. Press Ctrl+C to stop.')
}

// Run if this file is executed directly
if (require.main === module) {
  main().catch(error => {
    logger.error('Fatal error', {
      error: error instanceof Error ? error.message : String(error),
    })
    process.exit(1)
  })
}

export { SessionManager, VapiProvider }
