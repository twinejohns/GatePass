import React, { useState } from 'react';
import { ShieldCheck, QrCode, Lock, Mail, ArrowLeft, CheckCircle2, UserCheck } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

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
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-300 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      
      {/* Back Button */}
      <button
        onClick={onBackToLanding}
        className={`absolute top-6 left-6 flex items-center space-x-2 text-xs font-semibold px-3.5 py-2 rounded-xl border transition-all ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white' : 'bg-white border-slate-300 text-slate-700 hover:text-slate-900 shadow-sm'
        }`}
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Event Landing Page</span>
      </button>

      <div className={`w-full max-w-md p-8 rounded-3xl border shadow-2xl space-y-6 ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20">
            <QrCode className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Staff Portal Login</h2>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Sign in to access your assigned Event Management module
          </p>
        </div>

        {/* Demo User Selection Buttons */}
        <div className="space-y-2">
          <label className={`block text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
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
                      ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400 ring-2 ring-indigo-500/30'
                      : isDark ? 'bg-slate-950 border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/30" />
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <span className={isSelected ? 'text-indigo-400' : isDark ? 'text-white' : 'text-slate-900'}>{u.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-extrabold ${
                          u.role === 'Manager' ? 'bg-purple-500/20 text-purple-300' : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {u.role}
                        </span>
                      </div>
                      <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{u.title}</div>
                    </div>
                  </div>

                  {isSelected && <CheckCircle2 className="w-5 h-5 text-indigo-500" />}
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
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-800'
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
                className={`w-full rounded-xl pl-9 pr-3 py-2.5 border focus:outline-none focus:border-indigo-500 ${
                  isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
                required
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all mt-2"
          >
            <UserCheck className="w-5 h-5" />
            <span>Sign In to {selectedUser?.role === 'Manager' ? 'Manager Dashboard' : 'Gate Scanner'}</span>
          </button>
        </form>

      </div>
    </div>
  );
}
