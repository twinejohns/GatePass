import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { ShieldCheck } from 'lucide-react';

export default function Footer() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <footer className={`w-full py-4 px-6 border-t text-xs font-sans transition-colors duration-300 ${
      isDark ? 'bg-[#090d16] border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600 shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded-md bg-[#1698E1]/20 text-[#1698E1] flex items-center justify-center">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <span className="font-extrabold text-[#1698E1] tracking-tight">GatePass</span>
          <span className="text-slate-400">•</span>
          <span className="font-medium">Encrypted Event Ticket & Gate Access System</span>
        </div>

        <div className="font-medium">
          © {new Date().getFullYear()} <strong className="font-extrabold text-slate-900 dark:text-slate-100">Mangrove Media</strong>. All rights reserved.
        </div>

      </div>
    </footer>
  );
}
