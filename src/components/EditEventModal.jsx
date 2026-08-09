import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Edit3, Save, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function EditEventModal({ event, onSave, onClose }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    venue: '',
    city: '',
    date: '',
    endDate: '',
    capacity: 1000,
    bannerUrl: '',
    gates: []
  });

  useEffect(() => {
    if (event) {
      setFormData({
        name: event.name || '',
        description: event.description || '',
        venue: event.venue || '',
        city: event.city || '',
        date: event.date ? new Date(event.date).toISOString().slice(0, 16) : '',
        endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
        capacity: event.capacity || 1000,
        bannerUrl: event.bannerUrl || '',
        gates: event.gates ? [...event.gates] : []
      });
    }
  }, [event]);

  const handleGateNameChange = (idx, newName) => {
    const nextGates = [...formData.gates];
    nextGates[idx].name = newName;
    setFormData({ ...formData, gates: nextGates });
  };

  const handleAddGate = () => {
    const newId = `gate_${Date.now()}`;
    const nextGates = [...formData.gates, { id: newId, name: `Gate ${String.fromCharCode(65 + formData.gates.length)}` }];
    setFormData({ ...formData, gates: nextGates });
  };

  const handleRemoveGate = (idx) => {
    if (formData.gates.length <= 1) return;
    const nextGates = formData.gates.filter((_, i) => i !== idx);
    setFormData({ ...formData, gates: nextGates });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className={`border rounded-3xl p-6 w-full max-w-2xl shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Edit Event Details & Gates</h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Update event title, dates, venue, capacity, and entrance gate stations
              </p>
            </div>
          </div>
          <button onClick={onClose} className="font-bold text-lg text-slate-400 hover:text-slate-200">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div>
            <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Event Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full rounded-xl px-3 py-2.5 border focus:outline-none focus:border-indigo-500 ${
                isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
              required
            />
          </div>

          <div>
            <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`w-full rounded-xl p-3 border focus:outline-none focus:border-indigo-500 ${
                isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Venue Name</label>
              <input
                type="text"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                className={`w-full rounded-xl px-3 py-2 border focus:outline-none focus:border-indigo-500 ${
                  isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
                required
              />
            </div>

            <div>
              <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>City & State</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className={`w-full rounded-xl px-3 py-2 border focus:outline-none focus:border-indigo-500 ${
                  isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Start Date & Time</label>
              <input
                type="datetime-local"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={`w-full rounded-xl px-2.5 py-2 border focus:outline-none focus:border-indigo-500 ${
                  isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>End Date & Time</label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className={`w-full rounded-xl px-2.5 py-2 border focus:outline-none focus:border-indigo-500 ${
                  isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Total Venue Capacity</label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value, 10) || 1000 })}
                className={`w-full rounded-xl px-3 py-2 border focus:outline-none focus:border-indigo-500 ${
                  isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          <div>
            <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Header Banner Image URL</label>
            <input
              type="text"
              value={formData.bannerUrl}
              onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
              className={`w-full rounded-xl px-3 py-2 border focus:outline-none focus:border-indigo-500 ${
                isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
              placeholder="https://..."
            />
          </div>

          {/* Gate Stations Editor */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-400">Entrance Gate Stations ({formData.gates.length})</span>
              <button
                type="button"
                onClick={handleAddGate}
                className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] flex items-center gap-1 shadow"
              >
                <Plus className="w-3 h-3" /> Add Gate Station
              </button>
            </div>

            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {formData.gates.map((g, idx) => (
                <div key={g.id} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={g.name}
                    onChange={(e) => handleGateNameChange(idx, e.target.value)}
                    className={`flex-1 rounded-xl px-3 py-1.5 border text-xs focus:outline-none focus:border-indigo-500 ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                  {formData.gates.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveGate(idx)}
                      className="p-2 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white"
                      title="Remove Gate"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
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
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold shadow-lg shadow-indigo-600/20 flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Event Details</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
