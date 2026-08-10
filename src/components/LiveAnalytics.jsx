import React from 'react';
import { 
  Users, 
  UserCheck, 
  Clock, 
  BarChart3, 
  TrendingUp, 
  ShieldCheck, 
  Download, 
  Activity,
  Layers,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Tag
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function LiveAnalytics({ analytics, auditLogs, onExportCsv }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!analytics) {
    return (
      <div className={`p-12 text-center text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
        Loading live event telemetry & analytics stream...
      </div>
    );
  }

  const {
    totalTickets,
    checkedInCount,
    remainingCount,
    checkInRatePercent,
    emailsSentCount,
    capacity,
    phase,
    gateStats = [],
    tierStats = {},
    recentScans = []
  } = analytics;

  const capacityPercent = capacity > 0 ? Math.min(100, Math.round((checkedInCount / capacity) * 100)) : 0;
  const tierKeys = Object.keys(tierStats);

  return (
    <div className="space-y-6 font-sans">
      
      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Total Registered Attendees */}
        <div className={`p-5 rounded-3xl border shadow-xl flex items-center justify-between transition-all ${
          isDark ? 'bg-[#090d16] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-slate-200/50'
        }`}>
          <div className="space-y-1">
            <span className={`text-[11px] font-extrabold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Registered Delegates
            </span>
            <div className="text-3xl font-extrabold font-mono text-[#1698E1]">{totalTickets.toLocaleString()}</div>
            <div className="text-[11px] text-[#01BD9B] font-bold">{emailsSentCount} credentials sent</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#1698E1]/15 text-[#1698E1] border border-[#1698E1]/30">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2: Total Checked-In */}
        <div className={`p-5 rounded-3xl border shadow-xl flex items-center justify-between transition-all ${
          isDark ? 'bg-[#090d16] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-slate-200/50'
        }`}>
          <div className="space-y-1">
            <span className={`text-[11px] font-extrabold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Live Checked-In
            </span>
            <div className="text-3xl font-extrabold font-mono text-[#01BD9B]">{checkedInCount.toLocaleString()}</div>
            <div className="text-[11px] text-[#01BD9B] font-bold">{checkInRatePercent}% check-in rate</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#01BD9B]/15 text-[#01BD9B] border border-[#01BD9B]/30">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3: Remaining Outstanding */}
        <div className={`p-5 rounded-3xl border shadow-xl flex items-center justify-between transition-all ${
          isDark ? 'bg-[#090d16] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-slate-200/50'
        }`}>
          <div className="space-y-1">
            <span className={`text-[11px] font-extrabold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Expected Remaining
            </span>
            <div className={`text-3xl font-extrabold font-mono ${isDark ? 'text-[#F7D06B]' : 'text-[#1D69D6]'}`}>
              {remainingCount.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 font-bold">Pending gate arrival</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#F7D06B]/20 text-[#F7D06B] dark:text-[#F7D06B] border border-[#F7D06B]/40">
            <Clock className="w-6 h-6 text-[#1D69D6] dark:text-[#F7D06B]" />
          </div>
        </div>

        {/* KPI 4: Venue Capacity Progress */}
        <div className={`p-5 rounded-3xl border shadow-xl flex items-center justify-between transition-all ${
          isDark ? 'bg-[#090d16] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-slate-200/50'
        }`}>
          <div className="space-y-1 flex-1 pr-3">
            <span className={`text-[11px] font-extrabold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Venue Capacity ({capacityPercent}%)
            </span>
            <div className="text-2xl font-extrabold font-mono">{checkedInCount} / {capacity}</div>
            
            <div className={`w-full h-2.5 rounded-full overflow-hidden mt-2 ${isDark ? 'bg-slate-950 border border-slate-800' : 'bg-slate-200'}`}>
              <div 
                style={{ width: `${capacityPercent}%` }}
                className="h-full bg-gradient-to-r from-[#1698E1] via-[#1D69D6] to-[#01BD9B] transition-all duration-500"
              ></div>
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#3250FF]/15 text-[#3250FF] border border-[#3250FF]/30">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Middle Section: Gate Stations Throughput & Tier Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gate Stations Throughput Bar Chart */}
        <div className={`lg:col-span-2 p-5 rounded-3xl border shadow-xl space-y-4 ${
          isDark ? 'bg-[#090d16] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-slate-200/50'
        }`}>
          <div className="flex items-center justify-between border-b pb-3 border-slate-800">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-[#1698E1]" />
              <h3 className="text-base font-extrabold">Live Gate Stations Throughput</h3>
            </div>
            <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-[#1698E1]/15 text-[#1698E1] uppercase border border-[#1698E1]/30">
              Real-time
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {gateStats.map(g => {
              const maxGateCount = Math.max(1, ...gateStats.map(x => x.checkedInCount));
              const percent = Math.round((g.checkedInCount / maxGateCount) * 100);
              return (
                <div key={g.gateId} className="space-y-1.5">
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#1698E1]" />
                      <span>{g.gateName}</span>
                    </span>
                    <span className="font-mono text-[#01BD9B] font-extrabold">
                      {g.checkedInCount} Scanned ({g.activeAttendantsCount} Staff Active)
                    </span>
                  </div>

                  <div className={`w-full h-3 rounded-full overflow-hidden ${isDark ? 'bg-slate-950 border border-slate-800' : 'bg-slate-100 border border-slate-200'}`}>
                    <div
                      style={{ width: `${percent}%` }}
                      className="h-full bg-gradient-to-r from-[#1698E1] via-[#1D69D6] to-[#01BD9B] rounded-full transition-all duration-500"
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ticket Tiers Breakdown */}
        <div className={`p-5 rounded-3xl border shadow-xl space-y-4 ${
          isDark ? 'bg-[#090d16] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-slate-200/50'
        }`}>
          <div className="flex items-center space-x-2 border-b pb-3 border-slate-800">
            <Layers className="w-5 h-5 text-[#3250FF]" />
            <h3 className="text-base font-extrabold">Ticket Tiers Breakdown</h3>
          </div>

          <div className="space-y-3 text-xs">
            {tierKeys.length === 0 ? (
              <div className={`p-4 text-center text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                No ticket tier data recorded yet.
              </div>
            ) : (
              tierKeys.map(tier => {
                const item = tierStats[tier];
                const rate = item.total > 0 ? Math.round((item.checkedIn / item.total) * 100) : 0;
                return (
                  <div key={tier} className={`p-3.5 rounded-2xl border space-y-2 transition-all ${
                    isDark ? 'bg-[#030712] border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Tag className="w-3.5 h-3.5 text-[#1698E1]" />
                        <span className="font-extrabold text-xs">{tier}</span>
                      </div>
                      <span className="font-mono font-extrabold text-[#1698E1] text-xs">{rate}%</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                        {item.checkedIn} of {item.total} Checked In
                      </span>
                      <span className="font-semibold text-[#01BD9B]">{item.total - item.checkedIn} Remaining</span>
                    </div>

                    {/* Tier Progress Bar */}
                    <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-slate-200'}`}>
                      <div
                        style={{ width: `${rate}%` }}
                        className="h-full bg-gradient-to-r from-[#1698E1] to-[#01BD9B] transition-all duration-500"
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Bottom Section: Scan Log Ticker & Export CSV */}
      <div className={`p-5 rounded-3xl border shadow-xl space-y-4 ${
        isDark ? 'bg-[#090d16] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-slate-200/50'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-3 border-slate-800">
          <div className="flex items-center space-x-3">
            <Activity className="w-5 h-5 text-[#01BD9B] animate-pulse" />
            <div>
              <h3 className="text-base font-extrabold">Live Scan Stream & Post-Event Report Log</h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Real-time check-in activity telemetry recorded in central database
              </p>
            </div>
          </div>

          <button
            onClick={onExportCsv}
            className="px-4 py-2.5 rounded-xl btn-brand-emerald font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#01BD9B]/25 transition-all flex-shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Export Attendance Report CSV</span>
          </button>
        </div>

        {/* Scan Stream Ticker Table */}
        <div className={`overflow-x-auto rounded-2xl border ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <table className="w-full text-left text-xs">
            <thead className={`uppercase tracking-wider text-[10px] border-b ${
              isDark ? 'bg-[#030712] text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-700 border-slate-200 font-extrabold'
            }`}>
              <tr>
                <th className="p-3 font-bold">Timestamp</th>
                <th className="p-3 font-bold">Attendee</th>
                <th className="p-3 font-bold">Company / Tier</th>
                <th className="p-3 font-bold">Gate Station</th>
                <th className="p-3 font-bold">Attendant</th>
                <th className="p-3 font-bold">Scan Result</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-200'}`}>
              {recentScans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500 font-medium">
                    No scan activity recorded yet.
                  </td>
                </tr>
              ) : (
                recentScans.map(s => {
                  const isValid = s.result === 'VALID_CHECKIN' || s.result === 'TEST_SCAN_OK';
                  return (
                    <tr key={s.id} className={isDark ? 'hover:bg-[#1698E1]/5' : 'hover:bg-slate-50'}>
                      <td className="p-3 font-mono text-[11px] text-slate-500">
                        {new Date(s.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="p-3 font-extrabold">{s.attendeeName}</td>
                      <td className="p-3 text-[#1698E1] font-bold">{s.company || s.tier}</td>
                      <td className="p-3 font-medium">{s.gateName}</td>
                      <td className="p-3 text-slate-500 font-medium">{s.attendantName}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border inline-flex items-center gap-1 ${
                          isValid 
                            ? 'bg-[#01BD9B]/15 text-[#01BD9B] border-[#01BD9B]/30' 
                            : 'bg-[#E55555]/15 text-[#E55555] border-[#E55555]/30'
                        }`}>
                          {isValid ? <CheckCircle2 className="w-3 h-3 text-[#01BD9B]" /> : <XCircle className="w-3 h-3 text-[#E55555]" />}
                          {s.result}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
