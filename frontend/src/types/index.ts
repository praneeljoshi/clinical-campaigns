export type ScreeningType = 'mammogram' | 'colonoscopy' | 'pap_smear';

export type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';

export type CallStatus = 'NOT_CONTACTED' | 'ATTEMPTED' | 'CONTACTED' | 'SCHEDULED' | 'COMPLETED' | 'OPTED_OUT';

export interface Campaign {
  id: string;
  name: string;
  screeningType: ScreeningType;
  status: CampaignStatus;
  startDate: string;
  endDate?: string;
  totalPatients: number;
  contactedPatients: number;
  scheduledAppointments: number;
  completedScreenings: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  language: string;
  timezone: string;
  lastScreening?: string;
  callStatus: CallStatus;
  lastContactDate?: string;
  scheduledDate?: string;
  notes?: string;
}

export interface CampaignDetail extends Campaign {
  patients: Patient[];
}

export interface CampaignFormData {
  name: string;
  screeningType: ScreeningType;
  description?: string;
  startDate: string;
  endDate?: string;
}

export interface CampaignMetrics {
  contactRate: number;
  conversionRate: number;
  showRate: number;
  totalCalls: number;
  successfulContacts: number;
  appointmentsBooked: number;
  appointmentsCompleted: number;
}
