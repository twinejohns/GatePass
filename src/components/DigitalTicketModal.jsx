import React, { useRef } from 'react';
import { Download, Mail, MessageSquare, Share2, Check, QrCode, Shield, MapPin, Calendar, Building2, UserCheck, Hash } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function DigitalTicketModal({ passData, onClose }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const cardRef = useRef(null);

  if (!passData) return null;
  const { attendee, event, template, qrDataUrl } = passData;

  const delegateIdText = attendee.delegateId || attendee.id;

  const handleDownloadPng = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `${attendee.name.replace(/\s+/g, '_')}_TicketPass.png`;
    link.click();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin + `?ticket=${attendee.id}`);
    alert('🔗 Digital Ticket Link copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className={`border rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Digital Attendee Pass</h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Personalized pass card with encrypted QR & Delegate ID
              </p>
            </div>
          </div>
          <button onClick={onClose} className="font-bold text-lg text-slate-400 hover:text-slate-200">✕</button>
        </div>

        {/* Realistic Digital Ticket Pass Card Container */}
        <div 
          ref={cardRef}
          style={{ backgroundColor: template?.cardBgColor || '#0f172a' }}
          className="rounded-3xl border border-slate-700 shadow-2xl overflow-hidden text-white"
        >
          {/* Header Banner */}
          <div 
            style={{ backgroundColor: template?.bannerBgColor || '#4f46e5' }}
            className="p-5 flex items-center justify-between"
          >
            <div>
              <span className="text-[10px] font-extrabold tracking-widest uppercase text-white/80">OFFICIAL EVENT PASS</span>
              <h4 className="text-base font-extrabold text-white leading-snug">{template?.headerTitle || event?.name}</h4>
            </div>
            <span className="text-xs px-3 py-1 rounded-full font-bold bg-white/20 backdrop-blur border border-white/30 text-white shadow">
              {attendee.tier}
            </span>
          </div>

          {/* Card Body & QR Section */}
          <div className="p-6 space-y-6">
            
            {/* Delegate Info */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">ATTENDEE DELEGATE</span>
                <h3 className="text-xl font-extrabold text-white">{attendee.name}</h3>
                {attendee.company && (
                  <div className="text-xs text-cyan-400 font-bold flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{attendee.company}</span>
                  </div>
                )}
                <div className="text-xs text-slate-400">{attendee.email}</div>
                {attendee.phone && <div className="text-xs text-slate-400">{attendee.phone}</div>}
              </div>

              {/* Delegate ID Badge */}
              <div className="bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl text-center flex flex-col items-center">
                <span className="text-[9px] uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1">
                  <Hash className="w-3 h-3" /> DELEGATE ID
                </span>
                <span className="text-xs font-mono font-extrabold text-amber-300">{delegateIdText}</span>
              </div>
            </div>

            {/* QR Code & Delegate ID Section (Rendered Side-by-Side / Next to QR) */}
            <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 flex flex-col items-center justify-center space-y-3">
              <div className="bg-white p-3 rounded-2xl shadow-xl">
                <img src={qrDataUrl} alt="Encrypted Event QR Code" className="w-44 h-44 object-contain" />
              </div>
              
              {/* Highlighted Delegate ID Number next to/below QR Code */}
              <div className="flex items-center space-x-2 bg-indigo-950/60 px-4 py-1.5 rounded-xl border border-indigo-500/30 text-xs">
                <span className="text-slate-400 font-medium">Unique Delegate ID:</span>
                <span className="font-mono font-extrabold text-amber-400 text-sm tracking-wider">{delegateIdText}</span>
              </div>

              <div className="text-[11px] text-slate-400 text-center flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>AES-256 Encrypted & Signed Payload (v{attendee.qrVersion})</span>
              </div>
            </div>

            {/* Footer Rules */}
            <div className="text-[10px] text-slate-400 text-center border-t border-slate-800 pt-3">
              {template?.footerNote || 'Present this pass at designated gate entrance. Non-transferable.'}
            </div>

          </div>
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <button
            onClick={handleDownloadPng}
            className="py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
          >
            <Download className="w-4 h-4" /> Download Pass PNG
          </button>
          
          <button
            onClick={handleCopyLink}
            className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center justify-center gap-2 border border-slate-700"
          >
            <Share2 className="w-4 h-4 text-cyan-400" /> Share Digital Link
          </button>
        </div>

      </div>
    </div>
  );
}
