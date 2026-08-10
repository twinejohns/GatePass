import React from 'react';
import { 
  BarChart2, 
  Users, 
  Palette, 
  Mail, 
  Download, 
  Camera, 
  ShieldCheck, 
  LogOut, 
  QrCode, 
  Sun, 
  Moon,
  Sparkles,
  FileCheck,
  X
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Sidebar({ 
  activeTab, 
  onTabChange, 
  currentUser, 
  isWsOnline, 
  onLogout,
  isOpenMobile,
  onCloseMobile
}) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const isManager = currentUser?.role === 'Manager';

  const navItems = [
    { id: 'analytics', label: 'Overview & Telemetry', icon: BarChart2, roleReq: 'Manager' },
    { id: 'attendees', label: 'Attendees Directory', icon: Users, roleReq: 'Manager' },
    { id: 'template', label: 'Ticket Pass Designer', icon: Palette, roleReq: 'Manager' },
    { id: 'invitationStudio', label: 'PDF Overlay Studio', icon: FileCheck, roleReq: 'Manager' },
    { id: 'bulkEmail', label: 'Bulk Email Dispatcher', icon: Mail, roleReq: 'Manager' },
    { id: 'vectorExport', label: 'Vector QR Exporter', icon: Download, roleReq: 'Manager' },
    { id: 'scanner', label: 'Gate Scanner Tool', icon: Camera, roleReq: 'All' },
    { id: 'users', label: 'Staff & Gate Allocation', icon: ShieldCheck, roleReq: 'Manager' }
  ];

  const visibleNavItems = navItems.filter(item => {
    if (item.roleReq === 'All') return true;
    if (item.roleReq === 'Manager' && isManager) return true;
    return false;
  });

  const content = (
    <div className="flex flex-col h-full justify-between p-4 space-y-6">
      
      {/* Brand Header */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2 pt-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1698E1] text-white flex items-center justify-center shadow-md">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight font-sans">GatePass</h1>
              <div className="flex items-center space-x-1.5 text-[10px]">
                <span className={`w-2 h-2 rounded-full ${isWsOnline ? 'bg-[#01BD9B] animate-pulse' : 'bg-[#F7D06B]'}`}></span>
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                  {isWsOnline ? 'Live WebSockets Active' : 'Offline Mode'}
                </span>
              </div>
            </div>
          </div>

          {isOpenMobile && (
            <button 
              onClick={onCloseMobile}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Current User Card */}
        <div className={`p-3 rounded-2xl border transition-all ${
          isDark ? 'bg-[#222222]/80 border-slate-800 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-800'
        }`}>
          <div className="flex items-center space-x-3">
            <img 
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
              alt={currentUser?.name || 'User'} 
              className="w-9 h-9 rounded-full border border-[#1698E1] object-cover"
            />
            <div className="flex-1 min-w-0">
              <div className="font-bold text-xs truncate">{currentUser?.name || 'David Miller'}</div>
              <div className="text-[10px] text-[#1698E1] font-bold truncate">{currentUser?.role || 'Gate Attendant'}</div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 text-slate-400 block mb-2">
            Main Navigation
          </span>

          {visibleNavItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  if (isOpenMobile) onCloseMobile();
                }}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all ${
                  isActive
                    ? 'bg-[#1698E1] text-white shadow-md'
                    : isDark 
                      ? 'text-slate-400 hover:text-white hover:bg-[#222222]' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#F7D06B]' : 'opacity-70'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Tools: Theme Switcher & Logout */}
      <div className="space-y-2 pt-4 border-t border-slate-800/40">
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
            isDark 
              ? 'bg-[#222222] border-slate-800 text-slate-300 hover:text-white' 
              : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
          }`}
        >
          <span className="flex items-center space-x-2">
            {isDark ? <Moon className="w-4 h-4 text-[#F7D06B]" /> : <Sun className="w-4 h-4 text-[#1698E1]" />}
            <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#1698E1]/20 text-[#1698E1]">
            Active
          </span>
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-[#E55555] hover:bg-[#E55555]/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit / Sign Out</span>
        </button>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed Left) */}
      <aside className={`hidden md:flex flex-col w-64 border-r min-h-screen transition-colors duration-300 flex-shrink-0 ${
        isDark ? 'bg-[#090d16] border-slate-800/80 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {content}
      </aside>

      {/* Mobile Drawer (Slide Out) */}
      {isOpenMobile && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div 
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          ></div>
          <div className={`relative flex-1 max-w-xs w-full shadow-2xl transition-colors duration-300 ${
            isDark ? 'bg-[#090d16] text-slate-100' : 'bg-white text-slate-900'
          }`}>
            {content}
          </div>
        </div>
      )}
    </>
  );
}
