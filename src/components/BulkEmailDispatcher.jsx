import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, AlertCircle, RefreshCw, Users } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function BulkEmailDispatcher({ attendees, onSendBulkEmails }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [selectedIds, setSelectedIds] = useState(attendees.map(a => a.id));
  const [subject, setSubject] = useState('🎟️ Your Digital Pass for Global Tech Innovation Summit 2026');
  const [isSending, setIsSending] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [sendResult, setSendResult] = useState(null);

  const toggleSelectAll = () => {
    if (selectedIds.length === attendees.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(attendees.map(a => a.id));
    }
  };

  const toggleSelectId = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleDispatch = async (e) => {
    e.preventDefault();
    if (selectedIds.length === 0) return;

    setIsSending(true);
    setProgressPct(10);
    setSendResult(null);

    // Simulate batch progress animation
    const interval = setInterval(() => {
      setProgressPct(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 20;
      });
    }, 250);

    try {
      const res = await onSendBulkEmails(selectedIds, subject);
      clearInterval(interval);
      setProgressPct(100);
      setIsSending(false);
      setSendResult(res);
    } catch (err) {
      clearInterval(interval);
      setIsSending(false);
      alert('Email dispatch failed: ' + err.message);
    }
  };

  return (
    <div className={`border rounded-3xl p-6 shadow-xl space-y-6 ${
      isDark ? 'bg-slate-900/90 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
    }`}>
      
      <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
        <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          <Mail className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold">Bulk Invitation Email Dispatcher</h2>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Send digital pass cards with encrypted QR codes directly to attendees' email inboxes
          </p>
        </div>
      </div>

      {/* Form Controls */}
      <form onSubmit={handleDispatch} className="space-y-4 text-xs">
        
        <div>
          <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Email Subject Line</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className={`w-full rounded-xl px-3.5 py-2.5 border focus:outline-none focus:border-indigo-500 ${
              isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
            }`}
            required
          />
        </div>

        {/* Dispatch Progress Indicator */}
        {isSending && (
          <div className="space-y-2 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30">
            <div className="flex items-center justify-between text-xs font-bold text-indigo-400">
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                Dispatching Email Passes ({selectedIds.length} recipients)...
              </span>
              <span>{progressPct}%</span>
            </div>
            
            <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-indigo-500/20">
              <div
                className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {sendResult && (
          <div className="bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs p-4 rounded-2xl flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div>
              <div className="font-bold text-white">{sendResult.message}</div>
              <div className="text-[11px] text-emerald-300 mt-0.5">All recipients received an email containing their digital pass card and encrypted QR code.</div>
            </div>
          </div>
        )}

        {/* Attendee Selection Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold">Recipients Queue ({selectedIds.length} selected of {attendees.length}):</span>
            <button
              type="button"
              onClick={toggleSelectAll}
              className="text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              {selectedIds.length === attendees.length ? 'Deselect All' : 'Select All Attendees'}
            </button>
          </div>

          <div className={`max-h-60 overflow-y-auto border rounded-xl ${
            isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'
          }`}>
            <table className="w-full text-left text-xs">
              <thead className={`border-b sticky top-0 ${
                isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-200 border-slate-300 text-slate-700'
              }`}>
                <tr>
                  <th className="p-2.5 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === attendees.length && attendees.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded text-indigo-600 focus:ring-0 cursor-pointer"
                    />
                  </th>
                  <th className="p-2.5 font-semibold">Attendee Name</th>
                  <th className="p-2.5 font-semibold">Company</th>
                  <th className="p-2.5 font-semibold">Email</th>
                  <th className="p-2.5 font-semibold">Email Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {attendees.map(att => {
                  const isChecked = selectedIds.includes(att.id);
                  return (
                    <tr key={att.id} className="hover:bg-indigo-500/5 transition-colors">
                      <td className="p-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectId(att.id)}
                          className="rounded text-indigo-600 focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="p-2.5 font-bold">{att.name}</td>
                      <td className="p-2.5 text-slate-400">{att.company || 'N/A'}</td>
                      <td className="p-2.5 text-indigo-400">{att.email}</td>
                      <td className="p-2.5">
                        {att.emailSent ? (
                          <span className="text-[11px] font-bold text-emerald-400">✓ Sent</span>
                        ) : (
                          <span className="text-[11px] font-medium text-amber-400">Pending</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={selectedIds.length === 0 || isSending}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
          >
            <Send className="w-5 h-5" />
            <span>{isSending ? 'Dispatching Digital Passes...' : `Bulk Send ${selectedIds.length} Digital Pass Emails`}</span>
          </button>
        </div>

      </form>

    </div>
  );
}
