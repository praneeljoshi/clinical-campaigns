import type { Campaign, CampaignDetail, CampaignFormData, Patient } from '../types';

// Mock data for development
const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Annual Mammogram Outreach 2026',
    screeningType: 'mammogram',
    status: 'ACTIVE',
    startDate: '2026-01-01',
    endDate: '2026-03-31',
    totalPatients: 150,
    contactedPatients: 87,
    scheduledAppointments: 42,
    completedScreenings: 15,
    description: 'Outreach campaign for overdue mammogram screenings',
    createdAt: '2025-12-15',
    updatedAt: '2026-01-04',
  },
  {
    id: '2',
    name: 'Colonoscopy Screening Q1',
    screeningType: 'colonoscopy',
    status: 'ACTIVE',
    startDate: '2026-01-15',
    endDate: '2026-04-15',
    totalPatients: 200,
    contactedPatients: 45,
    scheduledAppointments: 18,
    completedScreenings: 3,
    description: 'Preventive colonoscopy screening for eligible patients',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-04',
  },
  {
    id: '3',
    name: 'Pap Smear Reminder Campaign',
    screeningType: 'pap_smear',
    status: 'DRAFT',
    startDate: '2026-02-01',
    totalPatients: 0,
    contactedPatients: 0,
    scheduledAppointments: 0,
    completedScreenings: 0,
    description: 'Annual pap smear screening reminders',
    createdAt: '2026-01-03',
    updatedAt: '2026-01-03',
  },
];

const mockPatients: Record<string, Patient[]> = {
  '1': [
    {
      id: 'p1',
      firstName: 'Sarah',
      lastName: 'Johnson',
      phoneNumber: '555-0101',
      email: 'sarah.j@email.com',
      language: 'English',
      timezone: 'America/New_York',
      lastScreening: '2023-01-15',
      callStatus: 'SCHEDULED',
      lastContactDate: '2026-01-03',
      scheduledDate: '2026-01-15',
      notes: 'Preferred morning appointments',
    },
    {
      id: 'p2',
      firstName: 'Maria',
      lastName: 'Garcia',
      phoneNumber: '555-0102',
      email: 'maria.g@email.com',
      language: 'Spanish',
      timezone: 'America/Los_Angeles',
      lastScreening: '2022-11-20',
      callStatus: 'CONTACTED',
      lastContactDate: '2026-01-02',
      notes: 'Needs Spanish-speaking provider',
    },
    {
      id: 'p3',
      firstName: 'Jennifer',
      lastName: 'Smith',
      phoneNumber: '555-0103',
      email: 'jen.smith@email.com',
      language: 'English',
      timezone: 'America/Chicago',
      lastScreening: '2023-03-10',
      callStatus: 'ATTEMPTED',
      lastContactDate: '2026-01-01',
      notes: 'Left voicemail, no callback yet',
    },
    {
      id: 'p4',
      firstName: 'Lisa',
      lastName: 'Chen',
      phoneNumber: '555-0104',
      email: 'lisa.c@email.com',
      language: 'English',
      timezone: 'America/New_York',
      lastScreening: '2022-09-05',
      callStatus: 'COMPLETED',
      lastContactDate: '2025-12-20',
      scheduledDate: '2025-12-28',
      notes: 'Completed screening on 12/28',
    },
    {
      id: 'p5',
      firstName: 'Patricia',
      lastName: 'Brown',
      phoneNumber: '555-0105',
      email: 'pat.brown@email.com',
      language: 'English',
      timezone: 'America/Denver',
      lastScreening: '2023-02-14',
      callStatus: 'NOT_CONTACTED',
      notes: 'High priority - overdue by 2 years',
    },
    {
      id: 'p6',
      firstName: 'Amy',
      lastName: 'Wilson',
      phoneNumber: '555-0106',
      email: 'amy.w@email.com',
      language: 'English',
      timezone: 'America/New_York',
      lastScreening: '2023-01-28',
      callStatus: 'OPTED_OUT',
      lastContactDate: '2025-12-18',
      notes: 'Requested to be removed from campaign',
    },
  ],
  '2': [
    {
      id: 'p7',
      firstName: 'Robert',
      lastName: 'Taylor',
      phoneNumber: '555-0201',
      email: 'rob.t@email.com',
      language: 'English',
      timezone: 'America/New_York',
      lastScreening: '2016-05-10',
      callStatus: 'SCHEDULED',
      lastContactDate: '2026-01-02',
      scheduledDate: '2026-01-20',
      notes: 'First-time colonoscopy',
    },
    {
      id: 'p8',
      firstName: 'Michael',
      lastName: 'Anderson',
      phoneNumber: '555-0202',
      email: 'michael.a@email.com',
      language: 'English',
      timezone: 'America/Chicago',
      lastScreening: '2015-11-15',
      callStatus: 'CONTACTED',
      lastContactDate: '2026-01-03',
      notes: 'Considering appointment options',
    },
  ],
};

// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const campaignApi = {
  // Get all campaigns
  async getCampaigns(): Promise<Campaign[]> {
    await delay(300);
    return mockCampaigns;
  },

  // Get campaign by ID with patient details
  async getCampaignById(id: string): Promise<CampaignDetail | null> {
    await delay(400);
    const campaign = mockCampaigns.find(c => c.id === id);
    if (!campaign) return null;

    return {
      ...campaign,
      patients: mockPatients[id] || [],
    };
  },

  // Create new campaign
  async createCampaign(data: CampaignFormData): Promise<Campaign> {
    await delay(500);
    const newCampaign: Campaign = {
      id: String(mockCampaigns.length + 1),
      ...data,
      status: 'DRAFT',
      totalPatients: 0,
      contactedPatients: 0,
      scheduledAppointments: 0,
      completedScreenings: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockCampaigns.push(newCampaign);
    return newCampaign;
  },

  // Update campaign
  async updateCampaign(id: string, data: Partial<Campaign>): Promise<Campaign | null> {
    await delay(400);
    const index = mockCampaigns.findIndex(c => c.id === id);
    if (index === -1) return null;

    mockCampaigns[index] = {
      ...mockCampaigns[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return mockCampaigns[index];
  },

  // Update patient in campaign
  async updatePatient(campaignId: string, patientId: string, data: Partial<Patient>): Promise<Patient | null> {
    await delay(300);
    const patients = mockPatients[campaignId];
    if (!patients) return null;

    const index = patients.findIndex(p => p.id === patientId);
    if (index === -1) return null;

    patients[index] = {
      ...patients[index],
      ...data,
    };
    return patients[index];
  },
};
