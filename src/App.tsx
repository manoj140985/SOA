import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { AppLayout } from './components/layout/AppLayout';

import { Overview } from './pages/Overview';
import { QuestionBank } from './pages/QuestionBank';
import { CohortExposure } from './pages/CohortExposure';
import { PaperAssembly } from './pages/PaperAssembly';
import { GeneratedPapers } from './pages/GeneratedPapers';
import { EventMonitor } from './pages/EventMonitor';
import { ServiceHealth } from './pages/ServiceHealth';
import { AccessSecurity } from './pages/AccessSecurity';
import { Settings } from './pages/Settings';

export default function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <DataProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Overview />} />
                <Route path="questions" element={<QuestionBank />} />
                <Route path="cohorts" element={<CohortExposure />} />
                <Route path="assembly" element={<PaperAssembly />} />
                <Route path="papers" element={<GeneratedPapers />} />
                <Route path="events" element={<EventMonitor />} />
                <Route path="health" element={<ServiceHealth />} />
                <Route path="security" element={<AccessSecurity />} />
                <Route path="settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}
