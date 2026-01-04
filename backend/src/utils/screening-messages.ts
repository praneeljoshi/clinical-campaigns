/**
 * Screening-specific messaging templates
 */

import { ScreeningType } from '../types/session'

export interface ScreeningMessage {
  greeting: string
  description: string
  importance: string
}

export function getScreeningMessage(
  patientName: string,
  screeningType: ScreeningType
): ScreeningMessage {
  const firstName = patientName.split(' ')[0]

  const messages: Record<ScreeningType, ScreeningMessage> = {
    breast_cancer: {
      greeting: `Hi ${firstName}, this is a call from your healthcare clinic regarding your preventive care.`,
      description: 'I\'m calling to help you schedule your breast cancer screening, also known as a mammogram.',
      importance: 'Regular mammograms are important for early detection and can significantly improve treatment outcomes.',
    },
    cervical_cancer: {
      greeting: `Hi ${firstName}, this is a call from your healthcare clinic regarding your preventive care.`,
      description: 'I\'m calling to help you schedule your cervical cancer screening, also known as a Pap smear.',
      importance: 'Regular cervical cancer screenings are important for early detection and prevention.',
    },
    colorectal_cancer: {
      greeting: `Hi ${firstName}, this is a call from your healthcare clinic regarding your preventive care.`,
      description: 'I\'m calling to help you schedule your colorectal cancer screening, also known as a colonoscopy.',
      importance: 'Regular colorectal screenings are crucial for early detection and can prevent cancer from developing.',
    },
  }

  return messages[screeningType]
}

export function buildFirstMessage(
  patientName: string,
  screeningType: ScreeningType
): string {
  const message = getScreeningMessage(patientName, screeningType)
  return `${message.greeting} ${message.description} ${message.importance} Would you be interested in scheduling an appointment?`
}
