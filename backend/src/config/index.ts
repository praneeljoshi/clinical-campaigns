/**
 * Configuration management
 */

import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

export interface AppConfig {
  vapi: {
    apiKey: string
    phoneNumberId: string
    modelProvider: string
    model: string
    voiceProvider: string
    voiceId?: string
  }
  app: {
    nodeEnv: string
    logLevel: string
  }
}

function getRequiredEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

function getOptionalEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue
}

export const config: AppConfig = {
  vapi: {
    apiKey: getRequiredEnv('VAPI_API_KEY'),
    phoneNumberId: getRequiredEnv('VAPI_PHONE_NUMBER_ID'),
    modelProvider: getOptionalEnv('VAPI_MODEL_PROVIDER', 'openai'),
    model: getOptionalEnv('VAPI_MODEL', 'gpt-4'),
    voiceProvider: getOptionalEnv('VAPI_VOICE_PROVIDER', '11labs'),
    voiceId: process.env.VAPI_VOICE_ID,
  },
  app: {
    nodeEnv: getOptionalEnv('NODE_ENV', 'development'),
    logLevel: getOptionalEnv('LOG_LEVEL', 'info'),
  },
}
