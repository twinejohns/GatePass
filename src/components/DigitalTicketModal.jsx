import React, { useRef, useState, useEffect } from 'react';
import { Download, Mail, MessageSquare, Share2, Check, QrCode, Shield, MapPin, Calendar, Building2, UserCheck, Hash } from 'lucide-react';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function DigitalTicketModal({ passData, onClose }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const cardRef = useRef(null);

  const [qrDataUrl, setQrDataUrl] = useState('');
  const [currentPass, setCurrentPass] = useState(passData);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (passData) {
      setCurrentPass(passData);
      setQrDataUrl(passData.qrDataUrl || '');
    }
  }, [passData]);

  if (!currentPass) return null;
  const { attendee, event, template } = currentPass;

  const delegateIdText = attendee.delegateId || attendee.id;

  // Determine dynamic tier header color
  const tierColor = (template?.tierColors && template.tierColors[attendee.tier]) 
    ? template.tierColors[attendee.tier] 
    : (template?.bannerBgColor || '#4f46e5');

  // Render and export the ENTIRE Passcard as a high-resolution PNG image
  const handleDownloadFullPassPng = () => {
    setDownloading(true);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // High Resolution 300 DPI Passcard Dimensions (width: 800px, height: 1100px)
    canvas.width = 800;
    canvas.height = 1100;

    // 1. Fill Base Background
    ctx.fillStyle = template?.cardBgColor || '#0f172a';
    ctx.beginPath();
    ctx.roundRect(0, 0, canvas.width, canvas.height, 40);
    ctx.fill();

    // 2. Render Header Banner with Access Tier Color
    ctx.fillStyle = tierColor;
    ctx.beginPath();
    ctx.roundRect(0, 0, canvas.width, 180, [40, 40, 0, 0]);
    ctx.fill();

    // Header Text
    ctx.font = 'bold 20px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText('OFFICIAL EVENT PASS', 50, 60);

    ctx.font = 'bold 36px Inter, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(template?.headerTitle || event?.name || 'GatePass Event', 50, 115);

    // Tier Badge on Header
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.beginPath();
    ctx.roundRect(580, 50, 170, 50, 25);
    ctx.fill();

    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(attendee.tier, 665, 83);
    ctx.textAlign = 'left';

    // 3. Attendee Info Section
    ctx.font = 'bold 20px Inter, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('ATTENDEE DELEGATE', 50, 240);

    ctx.font = 'bold 42px Inter, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(attendee.name, 50, 295);

    if (attendee.company) {
      ctx.font = 'bold 26px Inter, sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`🏢 ${attendee.company}`, 50, 340);
    }

    if (template?.showContactInfo) {
      ctx.font = '22px Inter, sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText(`${attendee.email} • ${attendee.phone || ''}`, 50, 380);
    }

    // Delegate ID Badge Container
    ctx.fillStyle = 'rgba(245, 158, 11, 0.12)';
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(520, 220, 230, 90, 20);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('DELEGATE ID', 545, 252);

    ctx.font = 'bold 26px JetBrains Mono, monospace';
    ctx.fillStyle = '#fde68a';
    ctx.fillText(delegateIdText, 545, 290);

    // 4. Large QR Code Box Container
    ctx.fillStyle = '#030712';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(50, 420, 700, 560, 30);
    ctx.fill();
    ctx.stroke();

    // QR Image
    const qrImg = new Image();
    qrImg.src = qrDataUrl;
    qrImg.onload = () => {
      // White QR Canvas Box
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(200, 470, 400, 400, 24);
      ctx.fill();

      ctx.drawImage(qrImg, 220, 490, 360, 360);

      // Delegate ID under QR
      ctx.font = 'bold 26px JetBrains Mono, monospace';
      ctx.fillStyle = '#f59e0b';
      ctx.textAlign = 'center';
      ctx.fillText(`Unique Delegate ID: ${delegateIdText}`, 400, 925);

      ctx.font = '20px Inter, sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText(`AES-256 Encrypted & Signed (v${attendee.qrVersion || 1})`, 400, 960);
      ctx.textAlign = 'left';

      // 5. Footer Note
      ctx.font = '18px Inter, sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'center';
      ctx.fillText(template?.footerNote || 'Present this pass at designated gate entrance. Non-transferable.', 400, 1040);

      // Trigger Download
      const link = document.createElement('a');
      link.download = `${delegateIdText}_${attendee.name.replace(/\s+/g, '_')}_WholePassCard.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setDownloading(false);
    };
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
              <h3 className="text-base font-bold">Executive Digital Attendee Pass</h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Clean, color-coded pass card with encrypted QR & Delegate ID
              </p>
            </div>
          </div>
          <button onClick={onClose} className="font-bold text-lg text-slate-400 hover:text-slate-200">✕</button>
        </div>

        {/* Clean Executive Ticket Pass Card Container */}
        <div 
          ref={cardRef}
          style={{ backgroundColor: template?.cardBgColor || '#0f172a' }}
          className="rounded-3xl border border-slate-700 shadow-2xl overflow-hidden text-white"
        >
          {/* Header Banner with Access Level Color */}
          <div 
            style={{ backgroundColor: tierColor }}
            className="p-5 flex items-center justify-between transition-colors duration-300 shadow-md"
          >
            <div>
              <span className="text-[10px] font-extrabold tracking-widest uppercase text-white/80">OFFICIAL EVENT PASS</span>
              <h4 className="text-base font-extrabold text-white leading-snug">{template?.headerTitle || event?.name}</h4>
            </div>
            <span className="text-xs px-3.5 py-1 rounded-full font-bold bg-white/20 backdrop-blur border border-white/30 text-white shadow">
              {attendee.tier}
            </span>
          </div>

          {/* Card Body & QR Section */}
          <div className="p-6 space-y-6">
            
            {/* Delegate Info */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">ATTENDEE DELEGATE</span>
                <h3 className="text-2xl font-extrabold text-white">{attendee.name}</h3>
                {template?.showCompany !== false && attendee.company && (
                  <div className="text-sm text-cyan-400 font-bold flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" />
                    <span>{attendee.company}</span>
                  </div>
                )}
                {template?.showContactInfo && (
                  <div className="text-xs text-slate-400 mt-1">{attendee.email} • {attendee.phone}</div>
                )}
              </div>

              {/* Delegate ID Badge */}
              <div className="bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl text-center flex flex-col items-center shadow-inner">
                <span className="text-[9px] uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1">
                  <Hash className="w-3 h-3" /> DELEGATE ID
                </span>
                <span className="text-xs font-mono font-extrabold text-amber-300">{delegateIdText}</span>
              </div>
            </div>

            {/* QR Code & Delegate ID Container */}
            <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 flex flex-col items-center justify-center space-y-3 shadow-inner">
              <div className="bg-white p-3 rounded-2xl shadow-xl">
                <img src={qrDataUrl} alt="Encrypted Event QR Code" className="w-44 h-44 object-contain" />
              </div>
              
              {/* Highlighted Delegate ID Number */}
              <div className="flex items-center space-x-2 bg-indigo-950/60 px-4 py-1.5 rounded-xl border border-indigo-500/30 text-xs">
                <span className="text-slate-400 font-medium">Delegate ID:</span>
                <span className="font-mono font-extrabold text-amber-400 text-sm tracking-wider">{delegateIdText}</span>
              </div>

              <div className="text-[11px] text-slate-400 text-center flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>AES-256 Encrypted & Signed (v{attendee.qrVersion || 1})</span>
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
            onClick={handleDownloadFullPassPng}
            disabled={downloading}
            className="py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> {downloading ? 'Exporting Pass...' : 'Download Whole Passcard'}
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
