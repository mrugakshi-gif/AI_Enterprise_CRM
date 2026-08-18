import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { LeadsPage } from './pages/LeadsPage';
import { ContactsPage } from './pages/ContactsPage';
import { CompaniesPage } from './pages/CompaniesPage';
import { DealsPage } from './pages/DealsPage';
import { TasksPage } from './pages/TasksPage';
import { ActivitiesPage } from './pages/ActivitiesPage';
import { CalendarPage } from './pages/CalendarPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AIInsightsPage } from './pages/AIInsightsPage';
import { KnowledgeBasePage } from './pages/KnowledgeBasePage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { ReportsPage } from './pages/ReportsPage';
import { UsersTeamsPage } from './pages/UsersTeamsPage';
import { RolesPermissionsPage } from './pages/RolesPermissionsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);

  if (!isAuthenticated) {
    return <LoginPage onSuccess={() => setCurrentTab('dashboard')} />;
  }

  const renderCurrentView = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardPage onNavigate={setCurrentTab} />;
      case 'leads':
        return <LeadsPage />;
      case 'contacts':
        return <ContactsPage />;
      case 'companies':
        return <CompaniesPage />;
      case 'deals':
        return <DealsPage />;
      case 'tasks':
        return <TasksPage />;
      case 'activities':
        return <ActivitiesPage />;
      case 'calendar':
        return <CalendarPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'ai-insights':
        return <AIInsightsPage onNavigate={setCurrentTab} />;
      case 'reports':
        return <ReportsPage />;
      case 'knowledge':
        return <KnowledgeBasePage />;
      case 'ai-assistant':
        return <AIAssistantPage onNavigate={setCurrentTab} />;
      case 'users':
        return <UsersTeamsPage />;
      case 'roles':
        return <RolesPermissionsPage />;
      case 'audit-logs':
        return <AuditLogsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage onNavigate={setCurrentTab} />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileDrawerOpen}
        setMobileOpen={setMobileDrawerOpen}
      />

      <div className="main-wrapper">
        <Header
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          mobileOpen={mobileDrawerOpen}
          setMobileOpen={setMobileDrawerOpen}
        />

        <main className="content-area">
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
};
