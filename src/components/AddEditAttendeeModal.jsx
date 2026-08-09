import React, { useState, useEffect } from 'react';
import { UserPlus, Edit3, Save, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function AddEditAttendeeModal({ attendee, onSave, onClose }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isEditing = !!attendee;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    tier: 'General Admission',
    company: '',
    status: 'ISSUED'
  });

  useEffect(() => {
    if (attendee) {
      setFormData({
        name: attendee.name || '',
        email: attendee.email || '',
        phone: attendee.phone || '',
        tier: attendee.tier || 'General Admission',
        company: attendee.company || '',
        status: attendee.status || 'ISSUED'
      });
    }
  }, [attendee]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className={`border rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              {isEditing ? <Edit3 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold">{isEditing ? 'Edit Attendee Record' : 'Add Single Attendee'}</h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {isEditing ? 'Modify registration information' : 'Create new attendee pass'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="font-bold text-lg text-slate-400 hover:text-slate-200">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Attendee Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Robert Ford"
              className={`w-full rounded-xl px-3 py-2 border focus:outline-none focus:border-indigo-500 ${
                isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
              required
            />
          </div>

          <div>
            <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Company / Organization</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="e.g. Cyberdyne Systems"
              className={`w-full rounded-xl px-3 py-2 border focus:outline-none focus:border-indigo-500 ${
                isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="robert@cyberdyne.com"
                className={`w-full rounded-xl px-3 py-2 border focus:outline-none focus:border-indigo-500 ${
                  isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
                required
              />
            </div>

            <div>
              <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+15559876543"
                className={`w-full rounded-xl px-3 py-2 border focus:outline-none focus:border-indigo-500 ${
                  isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Ticket Tier</label>
              <select
                value={formData.tier}
                onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                className={`w-full rounded-xl px-3 py-2 border focus:outline-none focus:border-indigo-500 ${
                  isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              >
                <option value="VIP Access">VIP Access</option>
                <option value="General Admission">General Admission</option>
                <option value="Speaker">Speaker</option>
                <option value="Press / Media">Press / Media</option>
                <option value="Staff Pass">Staff Pass</option>
              </select>
            </div>

            {isEditing && (
              <div>
                <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Pass Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className={`w-full rounded-xl px-3 py-2 border focus:outline-none focus:border-indigo-500 ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="ISSUED">ISSUED (Valid)</option>
                  <option value="CHECKED_IN">CHECKED_IN</option>
                  <option value="REVOKED">REVOKED</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/20 flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Save Changes' : 'Create Attendee Pass'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
