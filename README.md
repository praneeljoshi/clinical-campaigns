# Clinical Campaigns Platform

> AI-powered 1:1 patient outreach for preventive healthcare screenings

## Overview

Clinical Campaigns is a platform that enables healthcare clinics to deploy personalized outreach campaigns targeting patients who have not utilized their preventive care benefits. The platform focuses on critical screenings including:

- **Breast Cancer Screening**
- **Cervical Cancer Screening**
- **Colorectal Cancer Screening**

Using AI-powered voice agents, the platform delivers short, personalized phone calls that provide health information and coordinate treatment scheduling—improving patient engagement and preventive care utilization.

## Core Capabilities

- **Intelligent Voice Outreach**: AI voice agents deliver natural, empathetic conversations
- **Personalized Messaging**: Tailored health information based on patient demographics and history
- **Automated Scheduling**: Seamless coordination of screening appointments
- **Compliance & Safety**: HIPAA-compliant with robust guardrails and safety controls
- **Campaign Analytics**: Track engagement, conversion, and health outcomes

## Tech Stack

### Frontend
- **TypeScript** + **React**: Modern, type-safe UI components
- Responsive design for campaign management dashboards

### Backend API
- **TypeScript** + **Node.js**: RESTful API for campaign orchestration
- Real-time session management and logging

### Data Services
- **Python**: Data processing, analytics, and ML-based personalization
- Patient eligibility scoring and campaign optimization

### Voice AI Integration
- **Vapi** or **11 Labs**: Voice agent orchestration
- Custom guardrails and conversation flow management

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL 14+

### Installation

```bash
# Clone repository
git clone <repository-url>
cd clinical-campaigns

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install

# Install data services dependencies
cd ../data-services
pip install -r requirements.txt
```

### Environment Setup

Create `.env` files in each service directory:

```bash
# Backend .env
DATABASE_URL=postgresql://user:password@localhost:5432/clinical_campaigns
VAPI_API_KEY=your_vapi_key
ENCRYPTION_KEY=your_encryption_key

# Frontend .env
REACT_APP_API_URL=http://localhost:3001
```

### Running Locally

```bash
# Terminal 1: Backend API
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm start

# Terminal 3: Data Services
cd data-services
python -m uvicorn main:app --reload
```

## Documentation

- [Architecture Overview](./ARCHITECTURE.md) - Detailed system design and components
- [API Documentation](./docs/api.md) - Backend API reference
- [Voice Agent Guide](./docs/voice-agents.md) - Guardrails and conversation design
- [Deployment Guide](./docs/deployment.md) - Production deployment instructions

## Safety & Compliance

This platform handles Protected Health Information (PHI) and implements:

- End-to-end encryption for patient data
- HIPAA-compliant data storage and transmission
- Audit logging for all patient interactions
- Multi-layer guardrails preventing harmful agent behavior
- Regular security audits and penetration testing

## License

Proprietary - All rights reserved

## Support

For questions or issues, contact the development team or open an issue in this repository.
