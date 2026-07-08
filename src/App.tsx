import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/shared/Navbar';
import { CitizenPortal } from './pages/CitizenPortal';
import { AdminPortal } from './pages/AdminPortal';
import { PublicPortal } from './pages/PublicPortal';

export default function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-jan-canvas text-jan-slate">
          {/* Main layout navigation bar */}
          <Navbar />
          
          {/* Router content area */}
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<CitizenPortal />} />
              <Route path="/admin" element={<AdminPortal />} />
              <Route path="/public" element={<PublicPortal />} />
              {/* Redirect fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </Router>
    </LanguageProvider>
  );
}