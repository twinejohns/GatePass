import React from 'react';
import { ShieldCheck, Radio, CheckCircle, AlertTriangle, Clock, Lock, Sparkles, Edit3 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function EventPhaseBanner({ event, currentPhase, onPhaseChange, isManager, onEditEventDetails }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!event) return null;

  const phases = [
    {
      key: 'PRE_EVENT_TEST',
      label: '1. Pre-Event Test Phase',
      desc: 'Simulate scans with test tokens before live check-in opens',
      color: 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30'
    },
    {
      key: 'LIVE_GATES_OPEN',
      label: '2. Live Gates Open',
      desc: 'Active live attendance check-in across all gate stations',
      color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30'
    },
    {
      key: 'CLOSED',
      label: '3. Event Closed',
      desc: 'Gates locked. No further check-ins permitted.',
      color: 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/30'
    }
  ];

  return (
    <div className={`p-6 rounded-3xl border shadow-xl space-y-4 transition-colors duration-300 ${
      isDark ? 'bg-slate-900/90 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
    }`}>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left Side: Event Details & Phase Title */}
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                currentPhase === 'LIVE_GATES_OPEN' ? 'bg-emerald-400' : 'bg-amber-400'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${
                currentPhase === 'LIVE_GATES_OPEN' ? 'bg-emerald-500' : 'bg-amber-500'
              }`}></span>
            </span>
            <h1 className="text-xl font-extrabold tracking-tight">{event.name}</h1>
          </div>

          <p className={`text-xs flex flex-wrap items-center gap-x-4 gap-y-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <span>📍 {event.venue || 'Metropolitan Convention Center'}</span>
            <span>📅 {new Date(event.date).toLocaleDateString()}</span>
            <span>👥 Capacity: {event.capacity} Attendees</span>
          </p>
        </div>

        {/* Right Side: Edit Event Button & Phase Controls */}
        <div className="flex items-center space-x-3">
          {isManager && (
            <button
              onClick={onEditEventDetails}
              className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 shadow transition-all ${
                isDark ? 'bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-700' : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200'
              }`}
            >
              <Edit3 className="w-4 h-4 text-amber-500" />
              <span>Edit Event Details</span>
            </button>
          )}

          {isManager && (
            <div className={`flex rounded-2xl border p-1 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
              {phases.map((p) => {
                const isActive = currentPhase === p.key;
                return (
                  <button
                    key={p.key}
                    onClick={() => onPhaseChange(p.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md'
                        : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {p.key === 'PRE_EVENT_TEST' ? 'Pre-Event' : p.key === 'LIVE_GATES_OPEN' ? 'Live Gates' : 'Closed'}
                  </button>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
