import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart2, 
  Users, 
  Palette, 
  Mail, 
  Download, 
  Camera, 
  ShieldCheck, 
  Plus, 
  Upload, 
  RefreshCw, 
  QrCode,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Building2,
  Edit3,
  FileCheck,
  ChevronDown,
  MoreVertical,
  Hash
} from 'lucide-react';
import LiveAnalytics from './LiveAnalytics';
import TicketTemplateEditor from './TicketTemplateEditor';
import InvitationTemplateStudio from './InvitationTemplateStudio';
import BulkEmailDispatcher from './BulkEmailDispatcher';
import VectorQrExporter from './VectorQrExporter';
import ScannerInterface from './ScannerInterface';
import UserManagement from './UserManagement';
import { useTheme } from '../context/ThemeContext';

export default function ManagerDashboard({
  event,
  attendees,
  analytics,
  auditLogs,
  template,
  users,
  activeTab,
  onTabChange,
  onOpenBulkUpload,
  onSaveTemplate,
  onOpenPassModal,
  onOpenReissueModal,
  onOpenAddAttendee,
  onOpenEditAttendee,
  onOpenCustomCardModal,
  onAddUser,
  onUpdateUserGate,
  onExportCsv,
  onSendBulkEmails,
  onScanPayload,
  currentUser
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState('ALL');
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tiersList = Array.from(new Set(attendees.map(a => a.tier)));

  const filteredAttendees = attendees.filter(att => {
    const matchSearch = att.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        att.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (att.company && att.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
                        (att.delegateId && att.delegateId.toLowerCase().includes(searchQuery.toLowerCase())) ||
                        att.tier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchTier = selectedTier === 'ALL' || att.tier === selectedTier;
    return matchSearch && matchTier;
  });

  return (
    <div className="space-y-6 font-sans">

      {/* 1. ATTENDEES DIRECTORY */}
      {activeTab === 'attendees' && (
        <div className={`rounded-3xl border p-4 sm:p-6 shadow-xl space-y-6 transition-colors duration-300 ${
          isDark ? 'bg-[#090d16] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-slate-200/50'
        }`}>
          
          {/* Action Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold flex items-center gap-2">
                <Users className="w-5 h-5 text-[#1698E1]" />
                <span>Attendees Directory & Digital Credentials</span>
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Manage registered attendees, view digital pass cards, export PDF cards, and reissue security tokens
              </p>
            </div>

            <div className="flex items-center space-x-2.5">
              <button
                onClick={onOpenAddAttendee}
                className="px-4 py-2.5 rounded-xl btn-brand-primary font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-[#1698E1]/25 transition-all"
              >
                <Plus className="w-4 h-4" /> Single Attendee
              </button>

              <button
                onClick={onOpenBulkUpload}
                className={`px-4 py-2.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 shadow transition-all ${
                  isDark ? 'bg-[#222222] hover:bg-slate-800 text-slate-200 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                }`}
              >
                <Upload className="w-4 h-4 text-[#1698E1]" /> CSV Bulk Import
              </button>
            </div>
          </div>

          {/* Search & Filter Tools */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className={`w-4 h-4 absolute left-3.5 top-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
              <input
                type="text"
                placeholder="Search by Name, Company, Email, Delegate ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:border-[#1698E1] transition-colors ${
                  isDark ? 'bg-[#030712] border-slate-800 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className={`border rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-[#1698E1] ${
                  isDark ? 'bg-[#030712] border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'
                }`}
              >
                <option value="ALL">All Ticket Tiers</option>
                {tiersList.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Attendees Table */}
          <div className={`overflow-x-auto rounded-2xl border ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <table className="w-full text-left text-xs">
              <thead className={`uppercase tracking-wider text-[10px] border-b ${
                isDark ? 'bg-[#030712] text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-700 border-slate-200 font-extrabold'
              }`}>
                <tr>
                  <th className="p-3.5 font-bold">Delegate ID / Name</th>
                  <th className="p-3.5 font-bold">Company</th>
                  <th className="p-3.5 font-bold">Contact Info</th>
                  <th className="p-3.5 font-bold">Ticket Tier</th>
                  <th className="p-3.5 font-bold">QR Version</th>
                  <th className="p-3.5 font-bold">Status</th>
                  <th className="p-3.5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-200'}`}>
                {filteredAttendees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={`p-8 text-center font-medium ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                      No attendee records found matching your search query.
                    </td>
                  </tr>
                ) : (
                  filteredAttendees.map(att => {
                    const isDropdownOpen = activeDropdownId === att.id;
                    return (
                      <tr key={att.id} className={`transition-colors ${
                        isDark ? 'hover:bg-[#1698E1]/5' : 'hover:bg-slate-50'
                      }`}>
                        <td className="p-3.5">
                          <div className={`font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{att.name}</div>
                          <div className={`font-mono text-[11px] font-bold flex items-center gap-0.5 ${
                            isDark ? 'text-[#F7D06B]' : 'text-[#1D69D6]'
                          }`}>
                            <Hash className="w-2.5 h-2.5" /> {att.delegateId || att.id}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className={`flex items-center gap-1.5 font-bold ${
                            isDark ? 'text-[#58BAD7]' : 'text-[#1D69D6]'
                          }`}>
                            <Building2 className={`w-3.5 h-3.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                            {att.company || 'N/A'}
                          </span>
                        </td>
                        <td className={`p-3.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          <div className="font-medium">{att.email}</div>
                          <div className="text-[11px] opacity-80">{att.phone || 'No Phone'}</div>
                        </td>
                        <td className="p-3.5 font-extrabold text-[#1698E1]">{att.tier}</td>
                        <td className="p-3.5 font-mono font-bold text-slate-500">v{att.qrVersion || 1}</td>
                        <td className="p-3.5">
                          {att.status === 'CHECKED_IN' ? (
                            <span className="px-2.5 py-1 rounded-full bg-[#01BD9B]/15 text-[#01BD9B] dark:text-[#01BD9B] border border-[#01BD9B]/30 text-[11px] font-extrabold inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#01BD9B]" /> Checked In
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-[#1698E1]/15 text-[#1698E1] dark:text-[#1698E1] border border-[#1698E1]/30 text-[11px] font-extrabold inline-flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-[#1698E1]" /> Issued
                            </span>
                          )}
                        </td>
                        
                        {/* Consolidated Actions Dropdown Menu */}
                        <td className="p-3.5 text-right relative">
                          <div className="inline-block text-left" ref={isDropdownOpen ? dropdownRef : null}>
                            <button
                              type="button"
                              onClick={() => setActiveDropdownId(isDropdownOpen ? null : att.id)}
                              className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all inline-flex items-center gap-1.5 ${
                                isDropdownOpen 
                                  ? 'btn-brand-primary shadow-lg shadow-[#1698E1]/25'
                                  : isDark ? 'bg-[#030712] border-slate-800 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-300 text-slate-800 hover:text-slate-900'
                              }`}
                            >
                              <span>Actions</span>
                              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Popover Menu */}
                            {isDropdownOpen && (
                              <div className={`absolute right-0 mt-1.5 w-52 rounded-2xl border shadow-2xl z-50 overflow-hidden text-xs py-1.5 divide-y transition-all ${
                                isDark ? 'bg-[#222222] border-slate-800 divide-slate-800 text-slate-200' : 'bg-white border-slate-200 divide-slate-100 text-slate-800 shadow-slate-300/60'
                              }`}>
                                
                                <div className="py-1">
                                  <button
                                    onClick={() => {
                                      setActiveDropdownId(null);
                                      onOpenEditAttendee(att);
                                    }}
                                    className={`w-full px-3.5 py-2 text-left font-semibold flex items-center gap-2 transition-colors ${
                                      isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-800'
                                    }`}
                                  >
                                    <Edit3 className="w-3.5 h-3.5 text-[#F7D06B]" />
                                    <span>Edit Record</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      setActiveDropdownId(null);
                                      onOpenCustomCardModal(att);
                                    }}
                                    className={`w-full px-3.5 py-2 text-left font-semibold flex items-center gap-2 transition-colors ${
                                      isDark ? 'hover:bg-slate-800 text-[#F7D06B]' : 'hover:bg-slate-100 text-[#1D69D6]'
                                    }`}
                                  >
                                    <FileCheck className="w-3.5 h-3.5 text-[#1698E1]" />
                                    <span>View/Export PDF Card</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      setActiveDropdownId(null);
                                      onOpenPassModal(att.id);
                                    }}
                                    className={`w-full px-3.5 py-2 text-left font-semibold flex items-center gap-2 transition-colors ${
                                      isDark ? 'hover:bg-slate-800 text-[#58BAD7]' : 'hover:bg-slate-100 text-[#1D69D6]'
                                    }`}
                                  >
                                    <QrCode className="w-3.5 h-3.5 text-[#1698E1]" />
                                    <span>Digital Credentials Card</span>
                                  </button>
                                </div>

                                <div className="py-1">
                                  <button
                                    onClick={() => {
                                      setActiveDropdownId(null);
                                      onOpenReissueModal(att);
                                    }}
                                    className={`w-full px-3.5 py-2 text-left font-extrabold flex items-center gap-2 transition-colors ${
                                      isDark ? 'hover:bg-[#E55555]/15 text-[#E55555]' : 'hover:bg-red-50 text-[#E55555]'
                                    }`}
                                  >
                                    <RefreshCw className="w-3.5 h-3.5 text-[#E55555]" />
                                    <span>Re-Issue Security Token</span>
                                  </button>
                                </div>

                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* 2. OVERVIEW & ANALYTICS */}
      {activeTab === 'analytics' && (
        <LiveAnalytics
          analytics={analytics}
          auditLogs={auditLogs}
          onExportCsv={onExportCsv}
        />
      )}

      {/* 3. TICKET PASS DESIGNER */}
      {activeTab === 'template' && (
        <TicketTemplateEditor
          template={template}
          onSave={onSaveTemplate}
        />
      )}

      {/* 4. INVITATION CARD OVERLAY STUDIO */}
      {activeTab === 'invitationStudio' && (
        <InvitationTemplateStudio
          eventId={event?.id}
          sampleAttendee={attendees[0]}
        />
      )}

      {/* 5. BULK EMAIL DISPATCHER */}
      {activeTab === 'bulkEmail' && (
        <BulkEmailDispatcher
          attendees={attendees}
          onSendBulkEmails={onSendBulkEmails}
        />
      )}

      {/* 6. VECTOR QR EXPORTER */}
      {activeTab === 'vectorExport' && (
        <VectorQrExporter
          eventId={event?.id}
        />
      )}

      {/* 7. GATE SCANNER & STAFF */}
      {activeTab === 'scanner' && (
        <ScannerInterface
          event={event}
          currentUser={currentUser}
          onScanPayload={onScanPayload}
        />
      )}

      {/* 8. STAFF & ROLE MANAGEMENT */}
      {activeTab === 'users' && (
        <UserManagement
          users={users}
          gates={event?.gates || []}
          onAddUser={onAddUser}
          onUpdateUserGate={onUpdateUserGate}
          currentUser={currentUser}
        />
      )}

    </div>
  );
}
