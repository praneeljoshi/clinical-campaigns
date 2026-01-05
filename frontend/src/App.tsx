import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CampaignDashboard from './components/CampaignDashboard';
import CampaignForm from './components/CampaignForm';
import CampaignDetail from './components/CampaignDetail';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CampaignDashboard />} />
        <Route path="/campaigns/new" element={<CampaignForm />} />
        <Route path="/campaigns/:id" element={<CampaignDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
