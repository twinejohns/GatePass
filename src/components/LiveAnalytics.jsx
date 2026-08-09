import React, { useState } from 'react';
import { 
  BarChart2, 
  Users, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Download, 
  ShieldAlert, 
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react';

export default function LiveAnalytics({ analytics, auditLogs, onExportCsv }) {
  const [activeTab, setActiveTab] = useState('scans'); // 'scans' | 'audit'
  const [logQuery, setLogQuery] = useState('');

  if (!analytics) return null;

  const {
    totalTickets,
    checkedInCount,
    remainingCount,
    checkInRatePercent,
    capacity,
    gateStats,
    tierStats,
    recentScans
  } = analytics;

  const filteredScans = (recentScans || []).filter(s => {
    const q = logQuery.toLowerCase();
    if (!q) return true;
    return (
      s.attendeeName.toLowerCase().includes(q) ||
      s.attendantName.toLowerCase().includes(q) ||
      s.gateName.toLowerCase().includes(q) ||
      s.result.toLowerCase().includes(q)
    );
  });

  const filteredAudits = (auditLogs || []).filter(a => {
    const q = logQuery.toLowerCase();
    if (!q) return true;
    return (
      a.attendeeName.toLowerCase().includes(q) ||
      a.managerName.toLowerCase().includes(q) ||
      a.reason.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Issued */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Tickets Issued</div>
            <div className="text-2xl font-extrabold text-white mt-1">{totalTickets}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Capacity: {capacity}</div>
          </div>
          <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Checked-In */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Scanned / Checked In</div>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">{checkedInCount}</div>
            <div className="text-[11px] text-emerald-300 font-semibold mt-0.5">{checkInRatePercent}% Attendance Rate</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Remaining */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Remaining Outside</div>
            <div className="text-2xl font-extrabold text-cyan-400 mt-1">{remainingCount}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Expected at Gates</div>
          </div>
          <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Capacity Progress */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Live Venue Capacity</span>
            <span className="text-xs font-extrabold text-indigo-400">{checkInRatePercent}%</span>
          </div>
          
          <div className="w-full bg-slate-950 rounded-full h-3 border border-slate-800 overflow-hidden my-2">
            <div
              className="bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(checkInRatePercent, 100)}%` }}
            ></div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>{checkedInCount} inside</span>
            <span>{capacity} max venue</span>
          </div>
        </div>

      </div>

      {/* Breakdown Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gate Throughput Breakdown */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">Gate Throughput Breakdown</h3>
            </div>
            <span className="text-xs text-slate-400">Scans per Station</span>
          </div>

          <div className="space-y-3">
            {(gateStats || []).map(g => {
              const pct = totalTickets > 0 ? Math.round((g.checkedInCount / totalTickets) * 100) : 0;
              return (
                <div key={g.gateId} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{g.gateName}</span>
                    <span className="font-bold text-emerald-400">{g.checkedInCount} scans ({pct}%)</span>
                  </div>
                  
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="bg-indigo-500 h-full rounded-full"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Attendants Active: {g.activeAttendantsCount}</span>
                    <span className="truncate max-w-[200px]">
                      Staff: {g.activeAttendantsList.map(a => a.name).join(', ') || 'None'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ticket Tier Breakdown */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChart2 className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white">Ticket Tier Attendance</h3>
            </div>
            <span className="text-xs text-slate-400">Checked-in vs Total</span>
          </div>

          <div className="space-y-3">
            {Object.entries(tierStats || {}).map(([tierName, stats]) => {
              const tierPct = stats.total > 0 ? Math.round((stats.checkedIn / stats.total) * 100) : 0;
              return (
                <div key={tierName} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-cyan-300">{tierName}</span>
                    <span className="font-bold text-white">{stats.checkedIn} / {stats.total} ({tierPct}%)</span>
                  </div>
                  
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="bg-cyan-400 h-full rounded-full"
                      style={{ width: `${tierPct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Live Stream Table & Re-issue Audit Logs */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          
          {/* Tabs */}
          <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('scans')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'scans' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              📡 Live Scan Stream ({recentScans?.length || 0})
            </button>
            
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'audit' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              📜 Re-Issue Audit Log ({auditLogs?.length || 0})
            </button>
          </div>

          {/* Search & CSV Export */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <input
                type="text"
                value={logQuery}
                onChange={(e) => setLogQuery(e.target.value)}
                placeholder="Search log records..."
                className="bg-slate-950 border border-slate-700 text-xs rounded-xl pl-8 pr-3 py-1.5 text-white focus:outline-none focus:border-indigo-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            </div>

            <button
              onClick={onExportCsv}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 flex items-center gap-1.5 shadow"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" /> Export CSV Log
            </button>
          </div>

        </div>

        {/* 1. Live Scans Table */}
        {activeTab === 'scans' && (
          <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-950">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3 font-semibold">Timestamp</th>
                  <th className="p-3 font-semibold">Attendee</th>
                  <th className="p-3 font-semibold">Tier</th>
                  <th className="p-3 font-semibold">Gate Station</th>
                  <th className="p-3 font-semibold">Attendant</th>
                  <th className="p-3 font-semibold">Scan Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {filteredScans.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-500">No scan activity recorded yet.</td>
                  </tr>
                ) : (
                  filteredScans.map(scan => (
                    <tr key={scan.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-3 text-slate-400 font-mono">
                        {new Date(scan.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="p-3 font-bold text-white">{scan.attendeeName}</td>
                      <td className="p-3 text-indigo-300 font-medium">{scan.tier}</td>
                      <td className="p-3 text-slate-300">{scan.gateName}</td>
                      <td className="p-3 text-slate-400">{scan.attendantName}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] inline-flex items-center gap-1 ${
                          scan.result === 'VALID_CHECKIN' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          scan.result === 'TEST_SCAN_OK' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                          scan.result === 'DUPLICATE_BLOCKED' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                          'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {scan.result === 'VALID_CHECKIN' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                          {scan.result === 'DUPLICATE_BLOCKED' && <XCircle className="w-3 h-3 text-rose-400" />}
                          {scan.result}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. Re-Issue Audit Log Table */}
        {activeTab === 'audit' && (
          <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-950">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3 font-semibold">Timestamp</th>
                  <th className="p-3 font-semibold">Attendee</th>
                  <th className="p-3 font-semibold">Manager</th>
                  <th className="p-3 font-semibold">Version Change</th>
                  <th className="p-3 font-semibold">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {filteredAudits.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-500">No ticket re-issuance audit records found.</td>
                  </tr>
                ) : (
                  filteredAudits.map(log => (
                    <tr key={log.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-3 text-slate-400 font-mono">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="p-3 font-bold text-white">{log.attendeeName}</td>
                      <td className="p-3 text-indigo-300 font-medium">👑 {log.managerName}</td>
                      <td className="p-3 font-mono text-amber-300">
                        v{log.previousVersion} ➔ <strong className="text-emerald-400">v{log.newVersion}</strong>
                      </td>
                      <td className="p-3 text-slate-300">{log.reason}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}
