import React from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AddExpensePage from './pages/AddExpensePage';
import AddSalesPage from './pages/AddSalesPage';
import ReportsPage from './pages/ReportsPage';
import TeamPage from './pages/TeamPage';
import TransactionsPage from './pages/TransactionsPage';
import ProfitLossPage from './pages/ProfitLossPage';
import SalesAnalyticsPage from './pages/SalesAnalyticsPage';
import HistoryPage from './pages/HistoryPage';
import BudgetPage from './pages/BudgetPage';
import { appConfig } from './config/appConfig';
import { KitchenProvider, useKitchen } from './KitchenContext';

/** 
 * Role-based access control constants 
 */
function getRole() {
  return localStorage.getItem('userRole') || 'guest';
}

const isChef = () => getRole() === 'chef';

const OWNER_ROUTES = ['/dashboard', '/expenses/add', '/sales/add', '/reports', '/team', '/sales-analytics', '/history', '/transactions', '/profit-loss', '/budget'];
const CHEF_ROUTES = ['/expenses/add', '/team'];

function canAccess(path) {
  const role = getRole();
  if (role === 'owner') return OWNER_ROUTES.includes(path);
  if (role === 'chef') return CHEF_ROUTES.includes(path);
  return false;
}

/** 
 * Protected Route Wrapper 
 */
function Protected({ path, children }) {
  const isAuth = localStorage.getItem('isAuthenticated') === 'true';
  if (!isAuth) return <Navigate to="/login" replace />;
  if (!canAccess(path)) {
    return <Navigate to={isChef() ? '/expenses/add' : '/dashboard'} replace />;
  }
  return children;
}

/** 
 * Sidebar Configuration 
 */
const NAV_MENU = [
  { path: '/dashboard', icon: '📊', label: 'Dashboard', roles: ['owner'] },
  { path: '/expenses/add', icon: '💸', label: 'Add Expense', roles: ['owner', 'chef'] },
  { path: '/sales/add', icon: '💰', label: 'Add Sale', roles: ['owner'] },
  { path: '/transactions', icon: '🧾', label: 'Transactions', roles: ['owner'] },
  { path: '/reports', icon: '📈', label: 'Reports', roles: ['owner'] },
  { path: '/sales-analytics', icon: '🎯', label: 'Sales Analytics', roles: ['owner'] },
  { path: '/profit-loss', icon: '⚖️', label: 'Profit & Loss', roles: ['owner'] },
  { path: '/history', icon: '🏛️', label: 'History', roles: ['owner'] },
  { path: '/budget', icon: '💰', label: 'Budget', roles: ['owner'] },
  { path: '/team', icon: '👥', label: 'Team', roles: ['owner', 'chef'] },
];

function Sidebar({ onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const role = getRole();
  const { selectedKitchen: kitchenKey } = useKitchen(); 
  const username = localStorage.getItem('loggedInUser') || 'User';

  // Logos from global config
  const mainLogo = `/${appConfig.logos.mainLogo}`;
  
  // Use specific logo if kitchen-specific ones exist, otherwise fall back to KITCHEN_LOGO
  const kitchenLogo = `/${appConfig.logos.kitchen1}`; 
  const kitchenName = kitchenKey === 'Kitchen 1' ? 'NightWokDelight' : 'Biryani Culture';

  const menuItems = NAV_MENU.filter(item => item.roles.includes(role));

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src={mainLogo} alt="KitchenTrack" className="sidebar-logo-img" />
        <div>
          <h3 style={{ fontSize: '1.2rem', color: 'inherit', margin: 0 }}>{appConfig.appName}</h3>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: 0 }}>Smart Finances</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.path}
            className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}
        <button
          className="sidebar-link logout-link"
          onClick={onLogout}
          style={{ color: '#dc2626', marginTop: '2rem', borderTop: '1px solid var(--border)', borderRadius: '0', paddingTop: '1.5rem' }}
        >
          <span>🚪</span>
          Logout
        </button>
      </nav>

      <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', padding: '0 0.5rem' }}>
          <img src={kitchenLogo} alt="Kitchen" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }} />
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600 }}>ACTIVE KITCHEN</div>
            <div style={{ fontSize: '0.8rem', color: 'inherit', fontWeight: 600 }}>{kitchenName}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--background)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
          <div style={{ width: '32px', height: '32px', background: 'var(--accent)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            <span style={{ margin: 'auto' }}>{username.charAt(0).toUpperCase()}</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.8rem', color: 'inherit', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>{username}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{role.toUpperCase()}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function AppShell({ children }) {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('loggedInUser');
    navigate('/login');
  };

  return (
    <div className="app-container">
      <Sidebar onLogout={handleLogout} />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <KitchenProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Routes accessible by both */}
        <Route path="/expenses/add" element={
          <Protected path="/expenses/add">
            <AppShell><AddExpensePage /></AppShell>
          </Protected>
        } />
        <Route path="/team" element={
          <Protected path="/team">
            <AppShell><TeamPage /></AppShell>
          </Protected>
        } />

        {/* Owner-only routes */}
        <Route path="/dashboard" element={
          <Protected path="/dashboard">
            <AppShell><DashboardPage /></AppShell>
          </Protected>
        } />
        <Route path="/sales/add" element={
          <Protected path="/sales/add">
            <AppShell><AddSalesPage /></AppShell>
          </Protected>
        } />
        <Route path="/transactions" element={
          <Protected path="/transactions">
            <AppShell><TransactionsPage /></AppShell>
          </Protected>
        } />
        <Route path="/reports" element={
          <Protected path="/reports">
            <AppShell><ReportsPage /></AppShell>
          </Protected>
        } />
        <Route path="/profit-loss" element={
          <Protected path="/profit-loss">
            <AppShell><ProfitLossPage /></AppShell>
          </Protected>
        } />
        <Route path="/sales-analytics" element={
          <Protected path="/sales-analytics">
            <AppShell><SalesAnalyticsPage /></AppShell>
          </Protected>
        } />
        <Route path="/history" element={
          <Protected path="/history">
            <AppShell><HistoryPage /></AppShell>
          </Protected>
        } />
        <Route path="/budget" element={
          <Protected path="/budget">
            <AppShell><BudgetPage /></AppShell>
          </Protected>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </KitchenProvider>
  );
}

export default App;