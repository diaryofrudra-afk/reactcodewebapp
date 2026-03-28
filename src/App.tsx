import { useState } from 'react';
import { useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { MobileDrawer } from './components/layout/MobileDrawer';
import { ToastContainer } from './components/ui/Toast';
import { FleetPage } from './pages/Fleet/FleetPage';
import { AssetsPage } from './pages/Assets/AssetsPage';
import { OperatorsPage } from './pages/Operators/OperatorsPage';
import { EarningsPage } from './pages/Earnings/EarningsPage';
import { AttendancePage } from './pages/Attendance/AttendancePage';
import { AnalyticsPage } from './pages/Analytics/AnalyticsPage';
import { BillingPage } from './pages/Billing/BillingPage';
import { GPSPage } from './pages/GPS/GPSPage';
import { FuelPage } from './pages/Fuel/FuelPage';
import { CamerasPage } from './pages/Cameras/CamerasPage';
import { DiagnosticsPage } from './pages/Diagnostics/DiagnosticsPage';
import { LoggerPage } from './pages/Logger/LoggerPage';
import { OpHistoryPage } from './pages/OpHistory/OpHistoryPage';
import { OpFilesPage } from './pages/OpFiles/OpFilesPage';
import { ErrorBoundary } from './ErrorBoundary';

export default function App() {
  const { activePage, sidebarCollapsed, user, setUser } = useApp();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [phone, setPhone] = useState('');

  function handleSignOut() {
    setUser(null);
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 10) {
      setUser(cleaned);
    }
  }

  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
      }}>
        <form onSubmit={handleLogin} style={{
          background: 'var(--bg2)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '40px',
          minWidth: '320px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--t1)', fontFamily: 'var(--fh)' }}>
            Suprwise
          </div>
          <div style={{ fontSize: '13px', color: 'var(--t3)' }}>Enter your phone number to continue</div>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="Phone number"
            style={{
              padding: '10px 14px',
              background: 'var(--bg3)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--t1)',
              fontSize: '14px',
              outline: 'none',
            }}
            autoFocus
          />
          <button
            type="submit"
            style={{
              padding: '10px',
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Continue
          </button>
        </form>
      </div>
    );
  }

  return (
    <div id="app-shell" className={sidebarCollapsed ? 'sidebar-collapsed' : ''}>
      <Sidebar onSignOut={handleSignOut} />
      <div className="page-content">
        <ErrorBoundary><FleetPage active={activePage === 'fleet'} /></ErrorBoundary>
        <ErrorBoundary><AssetsPage active={activePage === 'assets'} /></ErrorBoundary>
        <ErrorBoundary><OperatorsPage active={activePage === 'operators'} /></ErrorBoundary>
        <ErrorBoundary><EarningsPage active={activePage === 'earnings'} /></ErrorBoundary>
        <ErrorBoundary><AttendancePage active={activePage === 'attendance'} /></ErrorBoundary>
        <ErrorBoundary><AnalyticsPage active={activePage === 'analytics'} /></ErrorBoundary>
        <ErrorBoundary><BillingPage active={activePage === 'billing'} /></ErrorBoundary>
        <ErrorBoundary><GPSPage active={activePage === 'gps'} /></ErrorBoundary>
        <ErrorBoundary><FuelPage active={activePage === 'fuel'} /></ErrorBoundary>
        <ErrorBoundary><CamerasPage active={activePage === 'cameras'} /></ErrorBoundary>
        <ErrorBoundary><DiagnosticsPage active={activePage === 'diagnostics'} /></ErrorBoundary>
        <ErrorBoundary><LoggerPage active={activePage === 'logger'} /></ErrorBoundary>
        <ErrorBoundary><OpHistoryPage active={activePage === 'op-history'} /></ErrorBoundary>
        <ErrorBoundary><OpFilesPage active={activePage === 'op-files'} /></ErrorBoundary>
      </div>
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSignOut={handleSignOut}
      />
      <ToastContainer />
    </div>
  );
}
