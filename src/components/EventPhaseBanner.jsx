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
      color: 'bg-[#F7D06B]/20 text-[#F7D06B] border-[#F7D06B]/40'
    },
    {
      key: 'LIVE_GATES_OPEN',
      label: '2. Live Gates Open',
      desc: 'Active live attendance check-in across all gate stations',
      color: 'bg-[#01BD9B]/20 text-[#01BD9B] border-[#01BD9B]/40'
    },
    {
      key: 'CLOSED',
      label: '3. Event Closed',
      desc: 'Gates locked. No further check-ins permitted.',
      color: 'bg-[#E55555]/20 text-[#E55555] border-[#E55555]/40'
    }
  ];

  return (
    <div className={`p-6 rounded-3xl border shadow-xl space-y-4 font-sans transition-colors duration-300 ${
      isDark ? 'bg-[#090d16] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-slate-200/50'
    }`}>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left Side: Event Details & Phase Title */}
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                currentPhase === 'LIVE_GATES_OPEN' ? 'bg-[#01BD9B]' : 'bg-[#F7D06B]'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${
                currentPhase === 'LIVE_GATES_OPEN' ? 'bg-[#01BD9B]' : 'bg-[#F7D06B]'
              }`}></span>
            </span>
            <h1 className="text-xl font-extrabold tracking-tight">{event.name}</h1>
          </div>

          <p className={`text-xs flex flex-wrap items-center gap-x-4 gap-y-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
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
                isDark ? 'bg-[#222222] hover:bg-slate-800 text-[#F7D06B] border-slate-700' : 'bg-amber-50 hover:bg-amber-100 text-[#1D69D6] border-amber-200'
              }`}
            >
              <Edit3 className="w-4 h-4 text-[#F7D06B]" />
              <span>Edit Event Details</span>
            </button>
          )}

          {isManager && (
            <div className={`flex rounded-2xl border p-1 ${isDark ? 'bg-[#030712] border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
              {phases.map((p) => {
                const isActive = currentPhase === p.key;
                return (
                  <button
                    key={p.key}
                    onClick={() => onPhaseChange(p.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                      isActive
                        ? 'bg-[#1698E1] text-white shadow-md'
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
