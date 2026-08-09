import React from 'react';
import { 
  ShieldCheck, 
  QrCode, 
  UserCheck, 
  Radio, 
  Sliders, 
  Users, 
  Calendar,
  Sparkles
} from 'lucide-react';

export default function Navbar({ 
  currentUser, 
  users, 
  onUserChange, 
  events, 
  currentEvent, 
  onEventChange,
  activeTab,
  onTabChange,
  isWsOnline
}) {
  const isManager = currentUser?.role === 'Manager';

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xl tracking-tight text-white">GatePass</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-cyan-400" />
                  HMAC AES-256
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Encrypted Event Ticket & Gate Scanner System</p>
            </div>
          </div>

          {/* Role & User Switcher Controls */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            
            {/* Event Selector */}
            <div className="hidden md:flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <select
                value={currentEvent?.id || ''}
                onChange={(e) => {
                  const ev = events.find(item => item.id === e.target.value);
                  if (ev) onEventChange(ev);
                }}
                className="bg-transparent text-sm text-slate-200 focus:outline-none cursor-pointer"
              >
                {events.map(ev => (
                  <option key={ev.id} value={ev.id} className="bg-slate-900 text-slate-100">
                    {ev.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Live Socket Status */}
            <div className="flex items-center space-x-1.5 bg-slate-800/60 px-2.5 py-1 rounded-full border border-slate-700 text-xs">
              <span className={`w-2 h-2 rounded-full ${isWsOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              <span className="text-slate-300 font-mono hidden sm:inline">
                {isWsOnline ? 'LIVE SYNC' : 'OFFLINE BUFFER'}
              </span>
            </div>

            {/* Current Active User Account Switcher */}
            <div className="flex items-center space-x-2 bg-slate-800/90 border border-slate-700/80 px-3 py-1.5 rounded-xl">
              <img
                src={currentUser?.avatar}
                alt={currentUser?.name}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-indigo-500/50"
              />
              <div className="text-left hidden lg:block">
                <div className="text-xs font-medium text-white flex items-center gap-1">
                  {currentUser?.name}
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                    isManager ? 'bg-purple-500/20 text-purple-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {currentUser?.role}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                  {currentUser?.title}
                </div>
              </div>

              {/* Quick User Switcher Dropdown */}
              <select
                value={currentUser?.id || ''}
                onChange={(e) => {
                  const u = users.find(usr => usr.id === e.target.value);
                  if (u) onUserChange(u);
                }}
                className="bg-transparent text-xs text-indigo-400 font-semibold focus:outline-none cursor-pointer ml-1"
                title="Switch Active Account / Role"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id} className="bg-slate-900 text-slate-100">
                    Switch to {u.role === 'Manager' ? '👑 Manager' : '📱 Gate Attendant'}: {u.name}
                  </option>
                ))}
              </select>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
}
