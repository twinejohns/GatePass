import React, { useState } from 'react';
import { RefreshCw, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';

export default function ReissueTicketModal({ attendee, managerName, onConfirm, onClose }) {
  const [reason, setReason] = useState('Lost smartphone - attendee requested clean QR token refresh');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onConfirm(attendee.id, managerName, reason);
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      alert('Re-issuance failed: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Re-Issue Encrypted QR Code</h3>
              <p className="text-xs text-slate-400">Invalidate old QR & generate new pass</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white font-bold text-lg"
          >
            ✕
          </button>
        </div>

        {/* Warning Alert */}
        <div className="bg-amber-950/50 border border-amber-700/60 p-3.5 rounded-xl text-xs text-amber-200 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-amber-300">
            <AlertTriangle className="w-4 h-4" /> Manager Override Action:
          </div>
          <p>
            This action will immediately <strong>invalidate version {attendee.qrVersion || 1}</strong> of {attendee.name}'s ticket. Previous QR codes will trigger a <strong>REVOKED PASS</strong> warning at all gate scanners.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Attendee</label>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-bold text-white">
              {attendee.name} ({attendee.tier})
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Re-Issuance Manager ID</label>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-indigo-300 font-semibold">
              👑 {managerName}
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Reason for Re-Issuance (Required for Audit Trail)</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-lg shadow-amber-600/20 flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`} />
              <span>{isSubmitting ? 'Re-issuing...' : `Invalidate v${attendee.qrVersion || 1} & Issue v${(attendee.qrVersion || 1) + 1}`}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
