# Clinical Campaigns Frontend

A modern React + TypeScript dashboard for managing preventive care outreach campaigns.

## Features

- **Campaign Dashboard**: View and manage all campaigns in one place
- **Campaign Creation**: Easy-to-use form for creating new campaigns
- **CRM-like Patient Tracking**: Detailed view of patient progress with visual analytics
- **Status Filtering**: Filter patients by contact status
- **Progress Visualization**: Charts and metrics for campaign performance

## Tech Stack

- **React 18** with TypeScript
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **React Hook Form + Zod** for form validation
- **Vite** for fast development and building

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at http://localhost:5173

### Build

```bash
npm run build
```

The production build will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── CampaignDashboard.tsx   # Main dashboard view
│   │   ├── CampaignForm.tsx        # Campaign creation form
│   │   └── CampaignDetail.tsx      # Campaign detail with patient tracking
│   ├── services/
│   │   └── api.ts                  # API service with mock data
│   ├── types/
│   │   └── index.ts                # TypeScript type definitions
│   ├── App.tsx                     # Main app with routing
│   ├── main.tsx                    # App entry point
│   └── index.css                   # Global styles
├── public/
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

## Key Components

### CampaignDashboard
Main landing page showing all campaigns in a card grid layout with:
- Campaign status badges
- Patient contact progress
- Quick stats (contacted, scheduled, completed)

### CampaignForm
Form for creating new campaigns with validation:
- Campaign name and description
- Screening type selection
- Date range picker

### CampaignDetail
Detailed campaign view with CRM-like features:
- Patient status distribution (pie chart)
- Campaign metrics (contact rate, conversion rate, completion rate)
- Patient list with filtering by status
- Patient contact history and notes

## Mock Data

The app currently uses mock data defined in `src/services/api.ts`. This includes:
- 3 sample campaigns (Mammogram, Colonoscopy, Pap Smear)
- Patient data with various contact statuses
- Realistic campaign metrics

## Patient Status Types

- **Not Contacted**: Patient hasn't been reached yet
- **Attempted**: Call attempted but not completed
- **Contacted**: Successfully contacted patient
- **Scheduled**: Appointment scheduled
- **Completed**: Screening completed
- **Opted Out**: Patient declined participation

## Future Enhancements

- Connect to real backend API
- Add patient search and advanced filtering
- Export campaign reports
- Real-time call monitoring integration
- Patient communication history timeline
- Appointment scheduling integration
