import React, { useRef, useState, useEffect } from 'react';
import { Download, Printer, Share2, Check, QrCode, FileCheck, Shield, Hash } from 'lucide-react';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function CustomInvitationCardModal({ attendee, eventId, onClose }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const cardRef = useRef(null);

  const [studioTemplate, setStudioTemplate] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [currentAttendee, setCurrentAttendee] = useState(attendee);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCardData();
  }, [attendee, eventId]);

  const loadCardData = async () => {
    if (!attendee || !eventId) return;
    setLoading(true);
    try {
      const [studioRes, passRes] = await Promise.all([
        api.getInvitationStudio(eventId),
        api.getTicketPass(attendee.id)
      ]);

      if (studioRes.success && studioRes.template) {
        setStudioTemplate(studioRes.template);
      }

      if (passRes.success && passRes.pass) {
        setQrDataUrl(passRes.pass.qrDataUrl);
        setCurrentAttendee(passRes.pass.attendee || attendee);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handlePrint = () => {
    const printContent = cardRef.current;
    if (!printContent) return;
    const windowUrl = 'about:blank';
    const uniqueName = 'Print_Invitation_Card';
    const windowFeatures = 'left=50,top=50,width=800,height=600';
    const printWindow = window.open(windowUrl, uniqueName, windowFeatures);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Invitation Card - ${currentAttendee.name}</title>
          <style>
            body { margin: 0; padding: 20px; display: flex; justify-content: center; align-items: center; background: #fff; }
            .card-wrapper { width: 100%; max-width: 800px; position: relative; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.15); }
            img.bg-art { width: 100%; height: auto; display: block; }
            .field-overlay { position: absolute; font-family: system-ui, -apple-system, sans-serif; white-space: nowrap; }
            .qr-box { position: absolute; background: white; padding: 6px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .qr-box img { width: 100%; height: 100%; object-fit: contain; }
            @media print {
              body { padding: 0; }
              .card-wrapper { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="card-wrapper">
            ${printContent.innerHTML}
          </div>
          <script>
            setTimeout(() => {
              window.print();
              window.close();
            }, 500);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadPng = () => {
    if (!cardRef.current) return;
    // Create an offscreen canvas to render the card
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = studioTemplate?.cardImageUrl || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800';
    
    img.onload = () => {
      canvas.width = img.naturalWidth || 800;
      canvas.height = img.naturalHeight || 450;
      
      // Draw background
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const fields = studioTemplate?.fields || {};

      // Draw Name
      if (fields.name?.enabled) {
        ctx.font = `bold ${fields.name.fontSize * 1.5}px Inter, sans-serif`;
        ctx.fillStyle = fields.name.color || '#ffffff';
        ctx.fillText(currentAttendee.name, (fields.name.x / 100) * canvas.width, (fields.name.y / 100) * canvas.height);
      }

      // Draw Delegate ID
      if (fields.delegateId?.enabled) {
        ctx.font = `bold ${fields.delegateId.fontSize * 1.5}px JetBrains Mono, monospace`;
        ctx.fillStyle = fields.delegateId.color || '#f59e0b';
        ctx.fillText(currentAttendee.delegateId || currentAttendee.id, (fields.delegateId.x / 100) * canvas.width, (fields.delegateId.y / 100) * canvas.height);
      }

      // Draw Company
      if (fields.company?.enabled && currentAttendee.company) {
        ctx.font = `bold ${fields.company.fontSize * 1.5}px Inter, sans-serif`;
        ctx.fillStyle = fields.company.color || '#38bdf8';
        ctx.fillText(currentAttendee.company, (fields.company.x / 100) * canvas.width, (fields.company.y / 100) * canvas.height);
      }

      // Draw Tier
      if (fields.tier?.enabled) {
        ctx.font = `bold ${fields.tier.fontSize * 1.5}px Inter, sans-serif`;
        ctx.fillStyle = fields.tier.color || '#a855f7';
        ctx.fillText(currentAttendee.tier, (fields.tier.x / 100) * canvas.width, (fields.tier.y / 100) * canvas.height);
      }

      // Draw QR Code
      if (fields.qrCode?.enabled && qrDataUrl) {
        const qrImg = new Image();
        qrImg.src = qrDataUrl;
        qrImg.onload = () => {
          const qrX = (fields.qrCode.x / 100) * canvas.width;
          const qrY = (fields.qrCode.y / 100) * canvas.height;
          const qrW = (fields.qrCode.width / 100) * canvas.width;
          const qrH = (fields.qrCode.height / 100) * canvas.height;

          // Draw white background for QR
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.roundRect(qrX, qrY, qrW, qrH, 12);
          ctx.fill();

          ctx.drawImage(qrImg, qrX + 8, qrY + 8, qrW - 16, qrH - 16);

          const link = document.createElement('a');
          const delegateIdStr = currentAttendee.delegateId || currentAttendee.id;
          link.download = `${delegateIdStr}_${currentAttendee.name.replace(/\s+/g, '_')}_Invitation_Card.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
        };
      } else {
        const link = document.createElement('a');
        const delegateIdStr = currentAttendee.delegateId || currentAttendee.id;
        link.download = `${delegateIdStr}_${currentAttendee.name.replace(/\s+/g, '_')}_Invitation_Card.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    };
  };

  if (!currentAttendee) return null;

  const fields = studioTemplate?.fields || {
    name: { x: 4, y: 22, fontSize: 22, color: '#ffffff', enabled: true },
    delegateId: { x: 4, y: 32, fontSize: 16, color: '#f59e0b', enabled: true },
    company: { x: 4, y: 39, fontSize: 15, color: '#38bdf8', enabled: true },
    tier: { x: 4, y: 46, fontSize: 13, color: '#a855f7', enabled: true },
    qrCode: { x: 68, y: 18, width: 22, height: 22, enabled: true }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className={`border rounded-3xl p-6 w-full max-w-2xl shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold">Custom Personalized Invitation Card</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                  v{currentAttendee.qrVersion || 1} QR Code Linked
                </span>
              </div>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Personalized for {currentAttendee.name} ({currentAttendee.delegateId || currentAttendee.id})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="font-bold text-lg text-slate-400 hover:text-slate-200">✕</button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-xs text-slate-400">Loading custom invitation artwork & dynamic QR...</div>
        ) : (
          /* Rendered Card Overlay Container */
          <div 
            ref={cardRef}
            className="relative w-full aspect-[16/9] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl"
          >
            {/* Background Artwork */}
            <img 
              src={studioTemplate?.cardImageUrl || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800'} 
              alt="Invitation Card Artwork" 
              className="bg-art w-full h-full object-contain"
            />

            {/* Overlay: Name */}
            {fields.name?.enabled && (
              <div
                style={{
                  left: `${fields.name.x}%`,
                  top: `${fields.name.y}%`,
                  fontSize: `${fields.name.fontSize}px`,
                  color: fields.name.color || '#ffffff'
                }}
                className="field-overlay font-extrabold"
              >
                {currentAttendee.name}
              </div>
            )}

            {/* Overlay: Delegate ID */}
            {fields.delegateId?.enabled && (
              <div
                style={{
                  left: `${fields.delegateId.x}%`,
                  top: `${fields.delegateId.y}%`,
                  fontSize: `${fields.delegateId.fontSize}px`,
                  color: fields.delegateId.color || '#f59e0b'
                }}
                className="field-overlay font-mono font-extrabold"
              >
                {currentAttendee.delegateId || currentAttendee.id}
              </div>
            )}

            {/* Overlay: Company */}
            {fields.company?.enabled && (
              <div
                style={{
                  left: `${fields.company.x}%`,
                  top: `${fields.company.y}%`,
                  fontSize: `${fields.company.fontSize}px`,
                  color: fields.company.color || '#38bdf8'
                }}
                className="field-overlay font-semibold"
              >
                {currentAttendee.company || 'Corporate Guest'}
              </div>
            )}

            {/* Overlay: Tier */}
            {fields.tier?.enabled && (
              <div
                style={{
                  left: `${fields.tier.x}%`,
                  top: `${fields.tier.y}%`,
                  fontSize: `${fields.tier.fontSize}px`,
                  color: fields.tier.color || '#a855f7'
                }}
                className="field-overlay font-bold"
              >
                {currentAttendee.tier}
              </div>
            )}

            {/* Overlay: Dynamic QR Code (vN based on current attendee.qrVersion) */}
            {fields.qrCode?.enabled && qrDataUrl && (
              <div
                style={{
                  left: `${fields.qrCode.x}%`,
                  top: `${fields.qrCode.y}%`,
                  width: `${fields.qrCode.width}%`,
                  height: `${fields.qrCode.height}%`
                }}
                className="qr-box shadow-2xl border border-slate-300"
              >
                <img 
                  src={qrDataUrl} 
                  alt="Dynamic Encrypted QR Code" 
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </div>
        )}

        {/* Footer Action Buttons */}
        <div className="grid grid-cols-2 gap-3 text-xs pt-2">
          <button
            onClick={handleDownloadPng}
            className="py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
          >
            <Download className="w-4 h-4" /> Download Card PNG
          </button>
          
          <button
            onClick={handlePrint}
            className="py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20"
          >
            <Printer className="w-4 h-4" /> Print Custom Invitation
          </button>
        </div>

      </div>
    </div>
  );
}
