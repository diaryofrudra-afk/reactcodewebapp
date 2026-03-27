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

export default function App() {
  const { activePage, sidebarCollapsed, setUser } = useApp();
  const [drawerOpen, setDrawerOpen] = useState(false);

  function handleSignOut() {
    setUser(null);
  }

  return (
    <div id="app-shell" className={sidebarCollapsed ? 'sidebar-collapsed' : ''}>
      <Sidebar onSignOut={handleSignOut} />
      <div className="page-content">
        <FleetPage active={activePage === 'fleet'} />
        <AssetsPage active={activePage === 'assets'} />
        <OperatorsPage active={activePage === 'operators'} />
        <EarningsPage active={activePage === 'earnings'} />
        <AttendancePage active={activePage === 'attendance'} />
        <AnalyticsPage active={activePage === 'analytics'} />
        <BillingPage active={activePage === 'billing'} />
        <GPSPage active={activePage === 'gps'} />
        <FuelPage active={activePage === 'fuel'} />
        <CamerasPage active={activePage === 'cameras'} />
        <DiagnosticsPage active={activePage === 'diagnostics'} />
        <LoggerPage active={activePage === 'logger'} />
        <OpHistoryPage active={activePage === 'op-history'} />
        <OpFilesPage active={activePage === 'op-files'} />
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
