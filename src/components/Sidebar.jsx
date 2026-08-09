import React from 'react';
import { 
  BarChart2, 
  Users, 
  Palette, 
  FileCheck, 
  Mail, 
  Download, 
  Camera, 
  ShieldCheck, 
  UserCheck, 
  LogOut,
  Sun,
  Moon,
  QrCode,
  Sparkles,
  MapPin
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Sidebar({
  activeTab,
  onTabChange,
  currentUser,
  isWsOnline,
  onLogout
}) {
  const { theme, toggleTheme } = useTheme();
  const isManager = currentUser?.role === 'Manager';
  const isDark = theme === 'dark';

  const navItems = isManager ? [
    { key: 'analytics', label: 'Dashboard Overview', icon: BarChart2, color: 'text-indigo-400' },
    { key: 'attendees', label: 'Attendees Directory', icon: Users, color: 'text-cyan-400' },
    { key: 'template', label: 'Ticket Pass Designer', icon: Palette, color: 'text-purple-400' },
    { key: 'invitationStudio', label: 'PDF Card Overlay Studio', icon: FileCheck, color: 'text-amber-400' },
    { key: 'bulkEmail', label: 'Bulk Email Dispatcher', icon: Mail, color: 'text-emerald-400' },
    { key: 'vectorExport', label: 'Vector QR Exporter', icon: Download, color: 'text-blue-400' },
    { key: 'scanner', label: 'Gate Scanner & Staff', icon: Camera, color: 'text-rose-400' },
    { key: 'users', label: 'Staff & Role Management', icon: ShieldCheck, color: 'text-indigo-400' },
  ] : [
    { key: 'scanner', label: 'Gate Camera Scanner', icon: Camera, color: 'text-emerald-400' }
  ];

  return (
    <aside className={`w-64 flex-shrink-0 border-r flex flex-col justify-between p-4 transition-colors duration-300 ${
      isDark ? 'bg-slate-900/95 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
    }`}>
      
      {/* Top Header */}
      <div className="space-y-6">
        
        {/* Brand */}
        <div className="flex items-center space-x-3 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <QrCode className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-extrabold text-lg tracking-tight">GatePass</div>
            <div className="text-[10px] text-indigo-400 font-mono flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isWsOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              {isWsOnline ? 'LIVE SYNC' : 'OFFLINE BUFFER'}
            </div>
          </div>
        </div>

        {/* Current Active User Profile Badge */}
        <div className={`p-3 rounded-2xl border flex items-center space-x-3 ${
          isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <img src={currentUser?.avatar} alt={currentUser?.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/30" />
          <div className="overflow-hidden">
            <div className="text-xs font-bold truncate flex items-center gap-1">
              {currentUser?.name}
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold ${
                isManager ? 'bg-purple-500/20 text-purple-300' : 'bg-emerald-500/20 text-emerald-300'
              }`}>
                {currentUser?.role}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 truncate">{currentUser?.title}</div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map(item => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onTabChange(item.key)}
                className={`w-full px-3 py-2.5 rounded-xl font-semibold text-xs flex items-center space-x-3 transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 font-bold'
                    : isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : item.color}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

      </div>

      {/* Bottom Footer Controls */}
      <div className="space-y-3 pt-4 border-t border-slate-800/40">
        
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`w-full py-2 px-3 rounded-xl border flex items-center justify-between text-xs font-semibold transition-all ${
            isDark ? 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-300 text-slate-700 hover:text-slate-900'
          }`}
        >
          <span className="flex items-center gap-2">
            {isDark ? <Moon className="w-4 h-4 text-purple-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
            <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
          </span>
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
            {theme}
          </span>
        </button>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-full py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit / Sign Out</span>
        </button>

      </div>

    </aside>
  );
}
