import React, { useState } from 'react';
import { UserPlus, Shield, Smartphone, CheckCircle, Mail, MapPin, Edit, Save } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function UserManagement({ users, eventGates, onAddUser, onUpdateUserGate }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Gate Attendant');
  const [title, setTitle] = useState('Gate Attendant - Main Gate');
  const [assignedGate, setAssignedGate] = useState('gate_a');

  const handleGateAllocationChange = async (userId, newGateId) => {
    try {
      await onUpdateUserGate(userId, newGateId);
    } catch (err) {
      alert('Failed to reallocate gate: ' + err.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email) return;

    onAddUser({
      name,
      email,
      role,
      title,
      activeGate: role === 'Gate Attendant' ? assignedGate : null
    });

    setName('');
    setEmail('');
    setShowAddModal(false);
  };

  return (
    <div className={`border rounded-3xl p-6 shadow-xl space-y-6 ${
      isDark ? 'bg-slate-900/90 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
    }`}>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold">System Users & Manager Gate Station Allocation</h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Manage staff accounts and allocate/reassign Gate Attendants to specific gate stations anytime
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/20"
        >
          <UserPlus className="w-4 h-4" /> Add New Staff User
        </button>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map(u => (
          <div key={u.id} className={`p-4 rounded-2xl border space-y-3 ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            
            <div className="flex items-center space-x-3">
              <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/30" />
              <div className="overflow-hidden">
                <div className="text-sm font-bold truncate flex items-center gap-1.5">
                  {u.name}
                  <span className={`text-[10px] px-2 py-0.5 rounded font-extrabold ${
                    u.role === 'Manager' ? 'bg-purple-500/20 text-purple-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {u.role}
                  </span>
                </div>
                <div className="text-xs text-slate-400 truncate">{u.title}</div>
              </div>
            </div>

            <div className="text-xs space-y-2 pt-2 border-t border-slate-800/40">
              <div className="flex items-center space-x-2 text-slate-400">
                <Mail className="w-3.5 h-3.5" />
                <span>{u.email}</span>
              </div>

              {/* Manager Control: Allocate / Edit Gate Station */}
              {u.role === 'Gate Attendant' ? (
                <div className="space-y-1.5 pt-1">
                  <label className="block text-[11px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> Manager Gate Allocation:
                  </label>
                  <select
                    value={u.activeGate || 'gate_a'}
                    onChange={(e) => handleGateAllocationChange(u.id, e.target.value)}
                    className={`w-full text-xs font-bold px-3 py-2 rounded-xl border focus:outline-none focus:border-indigo-500 cursor-pointer ${
                      isDark ? 'bg-slate-900 border-slate-700 text-emerald-300' : 'bg-white border-slate-300 text-emerald-600 shadow-sm'
                    }`}
                  >
                    {eventGates.map(g => (
                      <option key={g.id} value={g.id} className="bg-slate-900 text-slate-100">
                        Assign to: {g.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="text-[11px] text-purple-400 font-semibold flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" /> Full Event Admin Powers
                </div>
              )}

            </div>

          </div>
        ))}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`border rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold">Add System User / Gate Staff</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jordan Miller"
                  className={`w-full rounded-xl px-3 py-2 border focus:outline-none focus:border-indigo-500 ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. jordan.m@gatepass.io"
                  className={`w-full rounded-xl px-3 py-2 border focus:outline-none focus:border-indigo-500 ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">System Role</label>
                <select
                  value={role}
                  onChange={(e) => {
                    const r = e.target.value;
                    setRole(r);
                    setTitle(r === 'Manager' ? 'Event Director' : 'Gate Attendant - Main Entrance');
                  }}
                  className={`w-full rounded-xl px-3 py-2 border focus:outline-none focus:border-indigo-500 ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="Gate Attendant">Gate Attendant (Scanner View Only)</option>
                  <option value="Manager">Manager (Full Admin & Planner Powers)</option>
                </select>
              </div>

              {role === 'Gate Attendant' && (
                <div>
                  <label className="block font-semibold mb-1">Assigned Gate Station</label>
                  <select
                    value={assignedGate}
                    onChange={(e) => setAssignedGate(e.target.value)}
                    className={`w-full rounded-xl px-3 py-2 border focus:outline-none focus:border-indigo-500 ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    {eventGates.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-semibold mb-1">Job Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full rounded-xl px-3 py-2 border focus:outline-none focus:border-indigo-500 ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg"
                >
                  Create User Account
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
