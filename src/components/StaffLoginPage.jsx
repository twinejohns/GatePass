import React, { useState } from 'react';
import { ShieldCheck, QrCode, Lock, Mail, ArrowLeft, CheckCircle2, UserCheck } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Footer from './Footer';

export default function StaffLoginPage({ users, onLoginSuccess, onBackToLanding }) {
  const { theme } = useTheme();
  const [selectedUser, setSelectedUser] = useState(users[0] || null);
  const [password, setPassword] = useState('password123');

  const handleLogin = (e) => {
    e.preventDefault();
    if (selectedUser) {
      onLoginSuccess(selectedUser);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex flex-col justify-between transition-colors duration-300 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      
      {/* Top Header Bar with Back Button */}
      <div className="p-4 sm:p-6 max-w-7xl w-full mx-auto flex items-center justify-between">
        <button
          onClick={onBackToLanding}
          className={`flex items-center space-x-2 text-xs font-semibold px-3.5 py-2 rounded-xl border transition-all ${
            isDark ? 'bg-[#090d16] border-slate-800 text-slate-300 hover:text-white' : 'bg-white border-slate-300 text-slate-700 hover:text-slate-900 shadow-sm'
          }`}
        >
          <ArrowLeft className="w-4 h-4 text-[#1698E1]" />
          <span>Back to Event Landing Page</span>
        </button>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md mx-auto p-4 sm:p-6 my-8">
        <div className={`p-8 rounded-3xl border shadow-2xl space-y-6 ${
          isDark ? 'bg-[#090d16] border-slate-800' : 'bg-white border-slate-200 shadow-slate-200/50'
        }`}>
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#1698E1] text-white flex items-center justify-center mx-auto shadow-md">
              <QrCode className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">Staff Portal Login</h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Sign in to access your assigned Event Management module
            </p>
          </div>

          {/* Demo User Selection Buttons */}
          <div className="space-y-2">
            <label className={`block text-xs font-extrabold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Select Staff Account / Role
            </label>

            <div className="space-y-2">
              {users.map(u => {
                const isSelected = selectedUser?.id === u.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setSelectedUser(u)}
                    className={`w-full p-3 rounded-2xl border flex items-center justify-between text-left transition-all ${
                      isSelected
                        ? 'bg-[#1698E1]/15 border-[#1698E1] text-[#1698E1] ring-2 ring-[#1698E1]/30 font-bold'
                        : isDark ? 'bg-[#030712] border-slate-800 hover:border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-[#1698E1]/30" />
                      <div>
                        <div className="text-xs font-extrabold flex items-center gap-1.5">
                          <span className={isSelected ? 'text-[#1698E1]' : isDark ? 'text-white' : 'text-slate-900'}>{u.name}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold border ${
                            u.role === 'Manager' ? 'bg-[#3250FF]/15 text-[#3250FF] border-[#3250FF]/30' : 'bg-[#01BD9B]/15 text-[#01BD9B] border-[#01BD9B]/30'
                          }`}>
                            {u.role}
                          </span>
                        </div>
                        <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{u.title}</div>
                      </div>
                    </div>

                    {isSelected && <CheckCircle2 className="w-5 h-5 text-[#1698E1]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={selectedUser?.email || ''}
                  readOnly
                  className={`w-full rounded-xl pl-9 pr-3 py-2.5 border focus:outline-none ${
                    isDark ? 'bg-[#030712] border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-800'
                  }`}
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full rounded-xl pl-9 pr-3 py-2.5 border focus:outline-none focus:border-[#1698E1] ${
                    isDark ? 'bg-[#030712] border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                  required
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl btn-brand-primary font-extrabold text-sm shadow flex items-center justify-center gap-2 transition-all mt-2"
            >
              <UserCheck className="w-5 h-5" />
              <span>Sign In to {selectedUser?.role === 'Manager' ? 'Manager Dashboard' : 'Gate Scanner'}</span>
            </button>
          </form>

        </div>
      </div>

      {/* Global Mangrove Media Copyright Footer */}
      <Footer />

    </div>
  );
}
