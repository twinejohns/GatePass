import React from 'react';
import { Beaker, Play, Lock, ShieldAlert, CheckCircle2, Info } from 'lucide-react';

export default function EventPhaseBanner({ event, currentPhase, onPhaseChange, isManager }) {
  const phases = [
    {
      key: 'PRE_EVENT_TEST',
      label: 'Pre-Event Test Period',
      shortLabel: '🧪 Test Mode',
      icon: Beaker,
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      activeBorder: 'border-purple-500 shadow-purple-500/10',
      description: 'Organizers can scan & test QR codes to confirm hardware and signature validation without consuming live attendee tickets.'
    },
    {
      key: 'LIVE_GATES_OPEN',
      label: 'Live (Gates Open)',
      shortLabel: '🟢 Gates Open',
      icon: Play,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      activeBorder: 'border-emerald-500 shadow-emerald-500/10',
      description: 'Official event entry mode. Scanning QR codes checks attendees in atomically and blocks duplicate/re-entry attempts.'
    },
    {
      key: 'CLOSED',
      label: 'Event Closed / Expired',
      shortLabel: '🔴 Event Closed',
      icon: Lock,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      activeBorder: 'border-rose-500 shadow-rose-500/10',
      description: 'Gates are locked. Standard QR codes are rendered invalid unless a Manager explicitly re-issues a pass.'
    }
  ];

  const currentObj = phases.find(p => p.key === currentPhase) || phases[1];

  return (
    <div className={`rounded-2xl border bg-slate-900/90 p-5 shadow-xl transition-all duration-300 ${currentObj.activeBorder}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left Status Info */}
        <div className="flex items-start space-x-3.5">
          <div className={`p-3 rounded-xl border ${currentObj.badgeColor} flex-shrink-0`}>
            <currentObj.icon className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Event Phase</span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${currentObj.badgeColor}`}>
                {currentObj.label}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mt-0.5">{event?.name || 'GatePass Event'}</h3>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {currentObj.description}
            </p>
          </div>
        </div>

        {/* Right Phase Switcher (Manager Only Control) */}
        {isManager ? (
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Manager Phase Controls</span>
            <div className="flex items-center space-x-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
              {phases.map((p) => {
                const isActive = currentPhase === p.key;
                return (
                  <button
                    key={p.key}
                    onClick={() => onPhaseChange(p.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isActive
                        ? `${p.badgeColor} shadow-md border font-bold`
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <p.icon className="w-3.5 h-3.5" />
                    <span>{p.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-2 bg-slate-950/60 px-3 py-2 rounded-xl border border-slate-800 text-xs text-slate-300">
            <Info className="w-4 h-4 text-indigo-400" />
            <span>Mode managed by Event Manager ({currentObj.shortLabel})</span>
          </div>
        )}
      </div>
    </div>
  );
}
