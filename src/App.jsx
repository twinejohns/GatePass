import React, { useState, useEffect } from 'react';
import PublicLandingPage from './components/PublicLandingPage';
import StaffLoginPage from './components/StaffLoginPage';
import Sidebar from './components/Sidebar';
import EventPhaseBanner from './components/EventPhaseBanner';
import ManagerDashboard from './components/ManagerDashboard';
import BulkAttendeeUpload from './components/BulkAttendeeUpload';
import DigitalTicketModal from './components/DigitalTicketModal';
import ReissueTicketModal from './components/ReissueTicketModal';
import AddEditAttendeeModal from './components/AddEditAttendeeModal';
import EditEventModal from './components/EditEventModal';
import CustomInvitationCardModal from './components/CustomInvitationCardModal';
import PwaInstallBanner from './components/PwaInstallBanner';
import Footer from './components/Footer';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { api } from './services/api';
import { socketService } from './services/socket';
import { Menu, QrCode, ShieldCheck } from 'lucide-react';

function MainApp() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // View Mode: 'LANDING' | 'LOGIN' | 'APP'
  const [viewMode, setViewMode] = useState('LANDING');
  const [activeTab, setActiveTab] = useState('analytics');
  const [isOpenMobileSidebar, setIsOpenMobileSidebar] = useState(false);

  // Core Data State
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [template, setTemplate] = useState(null);
  const [isWsOnline, setIsWsOnline] = useState(false);

  // Modals state
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showEditEventModal, setShowEditEventModal] = useState(false);
  const [activePassData, setActivePassData] = useState(null);
  const [reissueTargetAttendee, setReissueTargetAttendee] = useState(null);
  const [addEditModalData, setAddEditModalData] = useState(null);
  const [activeCustomCardAttendee, setActiveCustomCardAttendee] = useState(null);

  useEffect(() => {
    loadUsers();
    loadEvents();
  }, []);

  useEffect(() => {
    socketService.connect();

    const unsubStatus = socketService.on('STATUS_CHANGE', (status) => {
      setIsWsOnline(status);
    });

    const unsubScan = socketService.on('LIVE_SCAN_EVENT', (data) => {
      if (data.analytics) setAnalytics(data.analytics);
      if (currentEvent?.id) {
        loadAttendees(currentEvent.id);
      }
    });

    const unsubPhase = socketService.on('PHASE_CHANGE_EVENT', (data) => {
      if (data.eventId === currentEvent?.id) {
        setCurrentEvent(prev => prev ? { ...prev, phase: data.phase } : prev);
        if (data.analytics) setAnalytics(data.analytics);
      }
    });

    const unsubEventUpdate = socketService.on('EVENT_UPDATED', (data) => {
      if (data.event?.id === currentEvent?.id) {
        setCurrentEvent(data.event);
        if (data.analytics) setAnalytics(data.analytics);
      }
    });

    const unsubReissue = socketService.on('TICKET_REISSUED', (data) => {
      if (currentEvent?.id) {
        loadAttendees(currentEvent.id);
        loadAuditLogs(currentEvent.id);
        if (data.analytics) setAnalytics(data.analytics);
      }
    });

    const unsubAttendees = socketService.on('ATTENDEES_UPDATED', (data) => {
      if (currentEvent?.id) {
        loadAttendees(currentEvent.id);
        if (data.analytics) setAnalytics(data.analytics);
      }
    });

    const unsubUser = socketService.on('USER_UPDATED', (data) => {
      if (data.users) setUsers(data.users);
      if (currentUser?.id === data.user?.id) {
        setCurrentUser(data.user);
      }
    });

    return () => {
      unsubStatus();
      unsubScan();
      unsubPhase();
      unsubEventUpdate();
      unsubReissue();
      unsubAttendees();
      unsubUser();
    };
  }, [currentEvent, currentUser]);

  const loadUsers = async () => {
    try {
      const res = await api.getUsers();
      if (res.success) {
        setUsers(res.users);
        if (!currentUser && res.users.length > 0) {
          setCurrentUser(res.users[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const loadEvents = async () => {
    try {
      const res = await api.getEvents();
      if (res.success && res.events.length > 0) {
        setEvents(res.events);
        selectEvent(res.events[0]);
      }
    } catch (err) {
      console.error('Failed to load events:', err);
    }
  };

  const selectEvent = async (evt) => {
    setCurrentEvent(evt);
    
    // Fetch attendees automatically
    loadAttendees(evt.id);
    
    // Fetch analytics safely
    try {
      const analyticsRes = await api.getAnalytics(evt.id);
      if (analyticsRes.success) setAnalytics(analyticsRes.analytics);
    } catch (err) {
      console.error('Analytics load error:', err);
    }

    // Fetch ticket template safely
    try {
      const templateRes = await api.getTicketTemplate(evt.id);
      if (templateRes.success) setTemplate(templateRes.template);
    } catch (err) {
      console.error('Template load error:', err);
    }

    // Fetch audit logs safely
    try {
      const auditRes = await api.getAuditLogs(evt.id);
      if (auditRes.success) setAuditLogs(auditRes.auditLogs);
    } catch (err) {
      console.error('Audit logs load error:', err);
    }
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    if (user.role === 'Manager') {
      setActiveTab('analytics');
    } else {
      setActiveTab('scanner');
    }
    setViewMode('APP');
  };

  const handlePublicLookup = async (email) => {
    const match = attendees.find(a => a.email.toLowerCase() === email.toLowerCase());
    if (!match) return null;
    const res = await api.getTicketPass(match.id);
    return res.pass;
  };

  const handlePhaseChange = async (newPhase) => {
    if (!currentEvent) return;
    try {
      const res = await api.updateEventPhase(currentEvent.id, newPhase);
      if (res.success) setCurrentEvent(res.event);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveEventDetails = async (eventData) => {
    if (!currentEvent) return;
    try {
      const res = await api.updateEventDetails(currentEvent.id, eventData);
      if (res.success) {
        setCurrentEvent(res.event);
        const analyticsRes = await api.getAnalytics(currentEvent.id);
        if (analyticsRes.success) setAnalytics(analyticsRes.analytics);
      }
    } catch (err) {
      alert('Failed to update event: ' + err.message);
    }
  };

  const handleSaveTemplate = async (templateData) => {
    if (!currentEvent) return;
    try {
      const res = await api.saveTicketTemplate(currentEvent.id, templateData);
      if (res.success) setTemplate(res.template);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveAttendeeForm = async (formData) => {
    if (!currentEvent) return;
    try {
      if (addEditModalData?.id) {
        await api.updateAttendee(addEditModalData.id, formData);
      } else {
        await api.addSingleAttendee(currentEvent.id, formData);
      }
      await loadAttendees(currentEvent.id);
      const analyticsRes = await api.getAnalytics(currentEvent.id);
      if (analyticsRes.success) setAnalytics(analyticsRes.analytics);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleBulkImport = async (attendeesArray) => {
    if (!currentEvent) return;
    const res = await api.bulkImportAttendees(currentEvent.id, attendeesArray);
    if (res.success) {
      await loadAttendees(currentEvent.id);
      const analyticsRes = await api.getAnalytics(currentEvent.id);
      if (analyticsRes.success) setAnalytics(analyticsRes.analytics);
    }
  };

  const handleSendBulkEmails = async (attendeeIds, subject) => {
    if (!currentEvent) return;
    return await api.sendBulkEmails(currentEvent.id, attendeeIds, subject);
  };

  const loadAttendees = async (eventId) => {
    try {
      const res = await api.getAttendees(eventId);
      if (res.success) setAttendees(res.attendees);
    } catch (err) {
      console.error('Failed to load attendees:', err);
    }
  };

  const loadAuditLogs = async (eventId) => {
    try {
      const res = await api.getAuditLogs(eventId);
      if (res.success) setAuditLogs(res.auditLogs);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    }
  };

  const handleOpenPassModal = async (attendeeId) => {
    try {
      const res = await api.getTicketPass(attendeeId);
      if (res.success) setActivePassData(res.pass);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReissueConfirm = async (attendeeId, managerName, reason) => {
    const res = await api.reissueTicket(attendeeId, managerName, reason);
    if (res.success && currentEvent) {
      loadAttendees(currentEvent.id);
      loadAuditLogs(currentEvent.id);
    }
  };

  const handleAddUser = async (userData) => {
    const res = await api.addUser(userData);
    if (res.success) loadUsers();
  };

  const handleUpdateUserGate = async (userId, gateId) => {
    const res = await api.updateUserGate(userId, gateId);
    if (res.success) {
      await loadUsers();
      if (currentEvent) {
        const analyticsRes = await api.getAnalytics(currentEvent.id);
        if (analyticsRes.success) setAnalytics(analyticsRes.analytics);
      }
    }
  };

  const handleScanPayload = async (qrPayload, gateId, attendantName) => {
    return await api.scanQrCode(qrPayload, gateId, attendantName);
  };

  const handleExportCsv = () => {
    if (!analytics?.recentScans) return;
    const headers = ['Timestamp', 'Attendee Name', 'Company', 'Tier', 'Gate Station', 'Attendant', 'Result'];
    const rows = analytics.recentScans.map(s => [
      new Date(s.timestamp).toLocaleString(),
      `"${s.attendeeName}"`,
      `"${s.company || ''}"`,
      `"${s.tier}"`,
      `"${s.gateName}"`,
      `"${s.attendantName}"`,
      s.result
    ]);
    const csvStr = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GatePass_CheckIn_Log_${currentEvent?.id || 'export'}.csv`;
    link.click();
  };

  if (viewMode === 'LANDING') {
    return (
      <PublicLandingPage
        event={currentEvent}
        onGoToLogin={() => setViewMode('LOGIN')}
        onLookupPass={handlePublicLookup}
      />
    );
  }

  if (viewMode === 'LOGIN') {
    return (
      <StaffLoginPage
        users={users}
        onLoginSuccess={handleLoginSuccess}
        onBackToLanding={() => setViewMode('LANDING')}
      />
    );
  }

  return (
    <div className={`min-h-screen flex flex-col md:flex-row transition-colors duration-300 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* Mobile Top Navigation Bar */}
      <div className={`md:hidden flex items-center justify-between p-4 border-b sticky top-0 z-30 ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <button
          onClick={() => setIsOpenMobileSidebar(true)}
          className="p-2 rounded-xl border border-slate-700 text-slate-300 hover:text-white"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2">
          <QrCode className="w-5 h-5 text-indigo-400" />
          <span className="font-extrabold text-base tracking-tight">GatePass</span>
        </div>

        <div className="flex items-center space-x-1">
          <span className={`w-2 h-2 rounded-full ${isWsOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentUser={currentUser}
        isWsOnline={isWsOnline}
        onLogout={() => setViewMode('LANDING')}
        isOpenMobile={isOpenMobileSidebar}
        onCloseMobile={() => setIsOpenMobileSidebar(false)}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 justify-between overflow-y-auto min-h-screen">
        <main className="p-4 sm:p-6 space-y-6 max-w-7xl w-full mx-auto flex-1">
          
          {/* PWA Mobile Installation Banner */}
          <PwaInstallBanner />

          {/* Phase Banner with Edit Event Button */}
          <EventPhaseBanner
            event={currentEvent}
            currentPhase={currentEvent?.phase || 'LIVE_GATES_OPEN'}
            onPhaseChange={handlePhaseChange}
            isManager={currentUser?.role === 'Manager'}
            onEditEventDetails={() => setShowEditEventModal(true)}
          />

          {/* Module Content */}
          <ManagerDashboard
            event={currentEvent}
            attendees={attendees}
            analytics={analytics}
            auditLogs={auditLogs}
            template={template}
            users={users}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onOpenBulkUpload={() => setShowBulkModal(true)}
            onSaveTemplate={handleSaveTemplate}
            onOpenPassModal={handleOpenPassModal}
            onOpenReissueModal={setReissueTargetAttendee}
            onOpenAddAttendee={() => setAddEditModalData({})}
            onOpenEditAttendee={(att) => setAddEditModalData(att)}
            onOpenCustomCardModal={(att) => setActiveCustomCardAttendee(att)}
            onAddUser={handleAddUser}
            onUpdateUserGate={handleUpdateUserGate}
            onExportCsv={handleExportCsv}
            onSendBulkEmails={handleSendBulkEmails}
            onScanPayload={handleScanPayload}
            currentUser={currentUser}
          />

        </main>

        {/* Global Mangrove Media Copyright Footer */}
        <Footer />
      </div>

      {/* Modals */}
      {showEditEventModal && (
        <EditEventModal
          event={currentEvent}
          onSave={handleSaveEventDetails}
          onClose={() => setShowEditEventModal(false)}
        />
      )}

      {showBulkModal && (
        <BulkAttendeeUpload
          onImport={handleBulkImport}
          onClose={() => setShowBulkModal(false)}
        />
      )}

      {activePassData && (
        <DigitalTicketModal
          passData={activePassData}
          onClose={() => setActivePassData(null)}
        />
      )}

      {activeCustomCardAttendee && (
        <CustomInvitationCardModal
          attendee={activeCustomCardAttendee}
          eventId={currentEvent?.id}
          onClose={() => setActiveCustomCardAttendee(null)}
        />
      )}

      {reissueTargetAttendee && (
        <ReissueTicketModal
          attendee={reissueTargetAttendee}
          managerName={currentUser?.name || 'Sarah Jenkins'}
          onConfirm={handleReissueConfirm}
          onClose={() => setReissueTargetAttendee(null)}
        />
      )}

      {addEditModalData && (
        <AddEditAttendeeModal
          attendee={addEditModalData.id ? addEditModalData : null}
          onSave={handleSaveAttendeeForm}
          onClose={() => setAddEditModalData(null)}
        />
      )}

    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}
