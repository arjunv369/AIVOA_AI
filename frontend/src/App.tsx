import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { NewComplaintPage } from './pages/NewComplaintPage';
import { ComplaintsPage } from './pages/ComplaintsPage';
import { DashboardPage } from './pages/DashboardPage';
import { AICopilotPage } from './pages/AICopilotPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { RiskAssessmentPage } from './pages/RiskAssessmentPage';
import { ReportsPage } from './pages/ReportsPage';

export const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/complaints" element={<ComplaintsPage />} />
      <Route path="/complaints/new" element={<NewComplaintPage />} />
      <Route path="/complaints/:id" element={<ComplaintsPage />} />
      <Route path="/ai-copilot" element={<AICopilotPage />} />
      <Route path="/documents" element={<DocumentsPage />} />
      <Route path="/risk-assessment" element={<RiskAssessmentPage />} />
      <Route path="/reports" element={<ReportsPage />} />
      {/* Default fallback route redirects to /complaints/new */}
      <Route path="*" element={<Navigate to="/complaints/new" replace />} />
    </Routes>
  );
};

export default App;
