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
    <div className="space-y-6">

      {/* 1. ATTENDEES DIRECTORY */}
      {activeTab === 'attendees' && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-6">
          
          {/* Action Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                <span>Attendees Directory & Digital Passes</span>
              </h2>
              <p className="text-xs text-slate-400">Manage registered attendees, view ticket passes, export PDF cards, and reissue credentials</p>
            </div>

            <div className="flex items-center space-x-2.5">
              <button
                onClick={onOpenAddAttendee}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/20"
              >
                <Plus className="w-4 h-4" /> Single Attendee
              </button>

              <button
                onClick={onOpenBulkUpload}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 shadow"
              >
                <Upload className="w-4 h-4 text-cyan-400" /> CSV Bulk Upload
              </button>
            </div>
          </div>

          {/* Search & Filter Tools */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search by Name, Company, Email, Delegate ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Ticket Tiers</option>
                {tiersList.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Attendees Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3.5 font-semibold">Delegate ID / Name</th>
                  <th className="p-3.5 font-semibold">Company</th>
                  <th className="p-3.5 font-semibold">Contact Info</th>
                  <th className="p-3.5 font-semibold">Ticket Tier</th>
                  <th className="p-3.5 font-semibold">QR Version</th>
                  <th className="p-3.5 font-semibold">Status</th>
                  <th className="p-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {filteredAttendees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      No attendee records found matching your query.
                    </td>
                  </tr>
                ) : (
                  filteredAttendees.map(att => {
                    const isDropdownOpen = activeDropdownId === att.id;
                    return (
                      <tr key={att.id} className="hover:bg-indigo-500/5 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-white">{att.name}</div>
                          <div className="font-mono text-[11px] text-amber-400 font-bold flex items-center gap-0.5">
                            <Hash className="w-2.5 h-2.5" /> {att.delegateId || att.id}
                          </div>
                        </td>
                        <td className="p-3.5 text-indigo-400 font-medium">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            {att.company || 'N/A'}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-400">
                          <div>{att.email}</div>
                          <div className="text-[11px]">{att.phone || 'No Phone'}</div>
                        </td>
                        <td className="p-3.5 font-semibold text-cyan-400">{att.tier}</td>
                        <td className="p-3.5 font-mono text-indigo-300">v{att.qrVersion || 1}</td>
                        <td className="p-3.5">
                          {att.status === 'CHECKED_IN' ? (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Checked In
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold inline-flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-indigo-400" /> Issued
                            </span>
                          )}
                        </td>
                        
                        {/* Consolidated Actions Dropdown Menu */}
                        <td className="p-3.5 text-right relative">
                          <div className="inline-block text-left" ref={isDropdownOpen ? dropdownRef : null}>
                            <button
                              type="button"
                              onClick={() => setActiveDropdownId(isDropdownOpen ? null : att.id)}
                              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all inline-flex items-center gap-1.5 ${
                                isDropdownOpen 
                                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20'
                                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                              }`}
                            >
                              <span>Actions</span>
                              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Popover Menu */}
                            {isDropdownOpen && (
                              <div className="absolute right-3 mt-1.5 w-48 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-50 overflow-hidden text-xs py-1.5 divide-y divide-slate-800/60 animate-in fade-in duration-150">
                                
                                <div className="py-1">
                                  <button
                                    onClick={() => {
                                      setActiveDropdownId(null);
                                      onOpenEditAttendee(att);
                                    }}
                                    className="w-full px-3.5 py-2 text-left text-slate-300 hover:text-white hover:bg-slate-800 font-semibold flex items-center gap-2"
                                  >
                                    <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                                    <span>Edit Record</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      setActiveDropdownId(null);
                                      onOpenCustomCardModal(att);
                                    }}
                                    className="w-full px-3.5 py-2 text-left text-amber-300 hover:text-amber-200 hover:bg-slate-800 font-semibold flex items-center gap-2"
                                  >
                                    <FileCheck className="w-3.5 h-3.5 text-amber-400" />
                                    <span>View/Export PDF Card</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      setActiveDropdownId(null);
                                      onOpenPassModal(att.id);
                                    }}
                                    className="w-full px-3.5 py-2 text-left text-indigo-300 hover:text-indigo-200 hover:bg-slate-800 font-semibold flex items-center gap-2"
                                  >
                                    <QrCode className="w-3.5 h-3.5 text-indigo-400" />
                                    <span>Digital Pass Card</span>
                                  </button>
                                </div>

                                <div className="py-1">
                                  <button
                                    onClick={() => {
                                      setActiveDropdownId(null);
                                      onOpenReissueModal(att);
                                    }}
                                    className="w-full px-3.5 py-2 text-left text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 font-bold flex items-center gap-2"
                                  >
                                    <RefreshCw className="w-3.5 h-3.5 text-rose-400" />
                                    <span>Re-Issue QR Code</span>
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
