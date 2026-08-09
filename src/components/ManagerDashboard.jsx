import React, { useState } from 'react';
import { 
  Users, 
  Upload, 
  Palette, 
  BarChart2, 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  QrCode, 
  UserPlus,
  Edit3,
  Mail,
  Download,
  FileCheck,
  Building2
} from 'lucide-react';
import LiveAnalytics from './LiveAnalytics';
import TicketTemplateEditor from './TicketTemplateEditor';
import UserManagement from './UserManagement';
import BulkEmailDispatcher from './BulkEmailDispatcher';
import VectorQrExporter from './VectorQrExporter';
import InvitationTemplateStudio from './InvitationTemplateStudio';
import ScannerInterface from './ScannerInterface';
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
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredAttendees = (attendees || []).filter(a => {
    const q = searchQuery.toLowerCase();
    const matchesQuery = (
      a.name.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      (a.company && a.company.toLowerCase().includes(q)) ||
      (a.phone && a.phone.toLowerCase().includes(q)) ||
      a.tier.toLowerCase().includes(q)
    );
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* TABS CONTENT BASED ON SIDEBAR */}

      {/* 1. ATTENDEES DIRECTORY */}
      {activeTab === 'attendees' && (
        <div className={`border rounded-3xl p-6 shadow-xl space-y-4 ${
          isDark ? 'bg-slate-900/90 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold">Attendee Passes & Verification Directory</h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Manage individual attendees, edit records, view digital pass cards, and re-issue lost QR tokens
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={onOpenAddAttendee}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/20"
              >
                <UserPlus className="w-4 h-4" /> Add Single Attendee
              </button>

              <button
                onClick={onOpenBulkUpload}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold text-xs border border-slate-700 flex items-center gap-1.5 shadow"
              >
                <Upload className="w-4 h-4" /> Bulk CSV Import
              </button>
            </div>
          </div>

          {/* Search & Status Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center space-x-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`text-xs border px-3 py-2 rounded-xl focus:outline-none ${
                  isDark ? 'bg-slate-950 border-slate-700 text-slate-200' : 'bg-slate-100 border-slate-300 text-slate-800'
                }`}
              >
                <option value="ALL">All Statuses ({attendees.length})</option>
                <option value="ISSUED">Issued / Unscanned</option>
                <option value="CHECKED_IN">Checked-In</option>
              </select>
            </div>

            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, email, company, phone..."
                className={`text-xs rounded-xl pl-8 pr-3 py-2 border focus:outline-none focus:border-indigo-500 ${
                  isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'
                }`}
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Directory Table */}
          <div className={`overflow-x-auto border rounded-2xl ${
            isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'
          }`}>
            <table className="w-full text-left text-xs">
              <thead className={`border-b ${
                isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-200 border-slate-300 text-slate-700'
              }`}>
                <tr>
                  <th className="p-3.5 font-semibold">Attendee Name</th>
                  <th className="p-3.5 font-semibold">Company</th>
                  <th className="p-3.5 font-semibold">Contact Info</th>
                  <th className="p-3.5 font-semibold">Tier</th>
                  <th className="p-3.5 font-semibold">Version</th>
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
                  filteredAttendees.map(att => (
                    <tr key={att.id} className="hover:bg-indigo-500/5 transition-colors">
                      <td className="p-3.5 font-bold">{att.name}</td>
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
                      <td className="p-3.5 text-right space-x-1.5">
                        <button
                          onClick={() => onOpenEditAttendee(att)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-[11px] border border-slate-700 inline-flex items-center gap-1"
                          title="Edit Attendee Record"
                        >
                          <Edit3 className="w-3 h-3 text-amber-400" /> Edit
                        </button>

                        <button
                          onClick={() => onOpenPassModal(att.id)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 font-semibold text-[11px] border border-indigo-500/40 inline-flex items-center gap-1"
                        >
                          <QrCode className="w-3 h-3" /> Pass
                        </button>

                        <button
                          onClick={() => onOpenReissueModal(att)}
                          className="px-2.5 py-1 rounded-lg bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white font-semibold text-[11px] border border-amber-500/40 inline-flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" /> Re-Issue
                        </button>
                      </td>
                    </tr>
                  ))
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

      {/* 6. VECTOR QR CODE EXPORTER */}
      {activeTab === 'vectorExport' && (
        <VectorQrExporter
          eventId={event?.id}
        />
      )}

      {/* 7. GATE SCANNER */}
      {activeTab === 'scanner' && (
        <ScannerInterface
          event={event}
          currentUser={currentUser}
          users={users}
          attendees={attendees}
          onScanPayload={onScanPayload}
        />
      )}

      {/* 8. STAFF & ROLES (Manager Gate Allocation) */}
      {activeTab === 'users' && (
        <UserManagement
          users={users}
          eventGates={event?.gates || []}
          onAddUser={onAddUser}
          onUpdateUserGate={onUpdateUserGate}
        />
      )}

    </div>
  );
}
