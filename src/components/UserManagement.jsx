import React, { useState } from 'react';
import { ShieldCheck, UserPlus, MapPin, User, Mail, Shield, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function UserManagement({ users, gates, onAddUser, onUpdateUserGate, currentUser }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Gate Attendant',
    title: 'Gate Attendant',
    activeGate: gates[0]?.id || 'gate_a'
  });

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    onAddUser(formData);
    setFormData({
      name: '',
      email: '',
      role: 'Gate Attendant',
      title: 'Gate Attendant',
      activeGate: gates[0]?.id || 'gate_a'
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Add User Form */}
      <div className={`p-6 rounded-3xl border shadow-xl space-y-6 ${
        isDark ? 'bg-slate-900/90 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="flex items-center space-x-3 border-b pb-4 border-slate-800">
          <div className="p-2.5 rounded-xl bg-cyan-500/15 text-cyan-500 border border-cyan-500/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold">Staff & Manager Gate Station Allocation</h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Allocate gate stations to attendants, manage staff credentials, and update assignments
            </p>
          </div>
        </div>

        {/* Add Staff Member Form */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div>
            <label className="block font-semibold mb-1 text-slate-400">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Marcus Miller"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full border rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 ${
                isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-400">Email Address</label>
            <input
              type="email"
              required
              placeholder="marcus@gatepass.io"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full border rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 ${
                isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-400">System Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ 
                ...formData, 
                role: e.target.value,
                title: e.target.value === 'Manager' ? 'Event Operations Manager' : 'Gate Attendant'
              })}
              className={`w-full border rounded-xl px-3 py-2 font-semibold focus:outline-none focus:border-indigo-500 ${
                isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            >
              <option value="Gate Attendant">Gate Attendant</option>
              <option value="Manager">Event Manager</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-400">Allocated Gate Station</label>
            <select
              disabled={formData.role === 'Manager'}
              value={formData.activeGate}
              onChange={(e) => setFormData({ ...formData, activeGate: e.target.value })}
              className={`w-full border rounded-xl px-3 py-2 font-semibold focus:outline-none focus:border-indigo-500 disabled:opacity-40 ${
                isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            >
              {gates.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/20"
            >
              {saveSuccess ? <CheckCircle2 className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              <span>{saveSuccess ? 'Staff Created!' : 'Add Staff Member'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Staff Directory Table */}
      <div className={`p-6 rounded-3xl border shadow-xl space-y-4 ${
        isDark ? 'bg-slate-900/90 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <h3 className="text-base font-extrabold">Active Event Staff & Allocated Gate Stations</h3>

        <div className={`overflow-x-auto rounded-2xl border ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <table className="w-full text-left text-xs">
            <thead className={`uppercase tracking-wider text-[10px] border-b ${
              isDark ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-600 border-slate-200 font-bold'
            }`}>
              <tr>
                <th className="p-3.5 font-bold">Staff Member</th>
                <th className="p-3.5 font-bold">Role</th>
                <th className="p-3.5 font-bold">Allocated Gate Station</th>
                <th className="p-3.5 font-bold">Status</th>
                <th className="p-3.5 font-bold text-right">Reallocate Gate</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-200'}`}>
              {users.map(u => {
                const assignedGate = gates.find(g => g.id === u.activeGate);
                return (
                  <tr key={u.id} className={isDark ? 'hover:bg-indigo-500/5' : 'hover:bg-indigo-50/60'}>
                    <td className="p-3.5 flex items-center space-x-3">
                      <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full border border-slate-700 object-cover" />
                      <div>
                        <div className="font-bold">{u.name}</div>
                        <div className="text-[11px] text-slate-500">{u.email}</div>
                      </div>
                    </td>
                    <td className="p-3.5 font-semibold">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        u.role === 'Manager' 
                          ? 'bg-purple-500/15 text-purple-600 dark:text-purple-300 border-purple-500/30'
                          : 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border-cyan-500/30'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5 font-medium">
                      {u.role === 'Manager' ? (
                        <span className="text-slate-400 italic">All Event Gates (Manager Override)</span>
                      ) : (
                        <span className="font-bold text-indigo-500 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{assignedGate ? assignedGate.name : 'Unallocated'}</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold">
                        ONLINE
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      {u.role === 'Gate Attendant' ? (
                        <select
                          value={u.activeGate || ''}
                          onChange={(e) => onUpdateUserGate(u.id, e.target.value)}
                          className={`border rounded-xl px-3 py-1 text-xs font-semibold focus:outline-none focus:border-indigo-500 ${
                            isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'
                          }`}
                        >
                          {gates.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                      ) : (
                        <span className="text-slate-400 font-mono text-[11px]">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
