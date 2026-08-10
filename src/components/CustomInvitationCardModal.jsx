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
    const windowFeatures = 'left=50,top=50,width=850,height=650';
    const printWindow = window.open(windowUrl, uniqueName, windowFeatures);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Invitation Card - ${currentAttendee.name}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800;900&family=JetBrains+Mono:wght@600;800&display=swap" rel="stylesheet">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800;900&family=JetBrains+Mono:wght@600;800&display=swap');
            
            * { box-sizing: border-box; }
            body { 
              margin: 0; 
              padding: 20px; 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              background: #ffffff; 
              font-family: 'Poppins', 'Inter', system-ui, sans-serif;
              -webkit-font-smoothing: antialiased;
            }
            .card-wrapper { 
              width: 100%; 
              max-width: 800px; 
              position: relative; 
              border-radius: 16px; 
              overflow: hidden; 
              box-shadow: 0 10px 30px rgba(0,0,0,0.15); 
              aspect-ratio: 16/9;
            }
            img.bg-art { width: 100%; height: 100%; object-fit: contain; display: block; }
            .field-overlay { 
              position: absolute; 
              font-family: 'Poppins', 'Inter', system-ui, sans-serif; 
              white-space: nowrap; 
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .field-overlay.font-mono {
              font-family: 'JetBrains Mono', monospace !important;
            }
            .qr-box { 
              position: absolute; 
              background: #ffffff; 
              padding: 6px; 
              border-radius: 12px; 
              box-shadow: 0 4px 12px rgba(0,0,0,0.15); 
              border: 1px solid #cbd5e1;
            }
            .qr-box img { width: 100%; height: 100%; object-fit: contain; }
            
            @media print {
              body { padding: 0; background: none; }
              .card-wrapper { box-shadow: none; border-radius: 0; }
            }
          </style>
        </head>
        <body>
          <div class="card-wrapper">
            ${printContent.innerHTML}
          </div>
          <script>
            document.fonts.ready.then(() => {
              setTimeout(() => {
                window.print();
                window.close();
              }, 400);
            });
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadPng = () => {
    if (!cardRef.current) return;
    // Create canvas for high-resolution export
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = studioTemplate?.cardImageUrl || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800';
    
    img.onload = () => {
      canvas.width = img.naturalWidth || 1200;
      canvas.height = img.naturalHeight || 675;
      
      // Draw background
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const fields = studioTemplate?.fields || {};

      // Auto-fit helper function for canvas text to prevent overlap
      const drawAutoFitText = (text, targetX, targetY, baseFontSize, fontFamily, fontStyle, color, maxAllowedWidth) => {
        let currentFontSize = baseFontSize;
        ctx.font = `${fontStyle} ${currentFontSize}px ${fontFamily}`;
        
        while (ctx.measureText(text).width > maxAllowedWidth && currentFontSize > 14) {
          currentFontSize -= 1.5;
          ctx.font = `${fontStyle} ${currentFontSize}px ${fontFamily}`;
        }
        
        ctx.fillStyle = color;
        ctx.fillText(text, targetX, targetY);
      };

      // Draw Name (Auto-Fitted to prevent overlap)
      if (fields.name?.enabled && currentAttendee.name) {
        const nameX = (fields.name.x / 100) * canvas.width;
        const nameY = (fields.name.y / 100) * canvas.height;
        const baseFontSize = (fields.name.fontSize || 22) * (canvas.height / 450);
        const maxAllowedWidth = canvas.width - nameX - (canvas.width * 0.05);

        drawAutoFitText(
          currentAttendee.name, 
          nameX, 
          nameY, 
          baseFontSize, 
          "Poppins, Inter, sans-serif", 
          "900", 
          fields.name.color || '#ffffff', 
          maxAllowedWidth
        );
      }

      // Draw Delegate ID
      if (fields.delegateId?.enabled) {
        const delX = (fields.delegateId.x / 100) * canvas.width;
        const delY = (fields.delegateId.y / 100) * canvas.height;
        const baseFontSize = (fields.delegateId.fontSize || 16) * (canvas.height / 450);
        const delegateIdStr = currentAttendee.delegateId || currentAttendee.id;
        const maxAllowedWidth = canvas.width - delX - (canvas.width * 0.05);

        drawAutoFitText(
          delegateIdStr, 
          delX, 
          delY, 
          baseFontSize, 
          "JetBrains Mono, monospace", 
          "800", 
          fields.delegateId.color || '#f59e0b', 
          maxAllowedWidth
        );
      }

      // Draw Company (Auto-Fitted)
      if (fields.company?.enabled && currentAttendee.company) {
        const compX = (fields.company.x / 100) * canvas.width;
        const compY = (fields.company.y / 100) * canvas.height;
        const baseFontSize = (fields.company.fontSize || 15) * (canvas.height / 450);
        const maxAllowedWidth = canvas.width - compX - (canvas.width * 0.05);

        drawAutoFitText(
          currentAttendee.company, 
          compX, 
          compY, 
          baseFontSize, 
          "Poppins, Inter, sans-serif", 
          "700", 
          fields.company.color || '#38bdf8', 
          maxAllowedWidth
        );
      }

      // Draw Tier
      if (fields.tier?.enabled && currentAttendee.tier) {
        const tierX = (fields.tier.x / 100) * canvas.width;
        const tierY = (fields.tier.y / 100) * canvas.height;
        const baseFontSize = (fields.tier.fontSize || 13) * (canvas.height / 450);
        const maxAllowedWidth = canvas.width - tierX - (canvas.width * 0.05);

        drawAutoFitText(
          currentAttendee.tier, 
          tierX, 
          tierY, 
          baseFontSize, 
          "Poppins, Inter, sans-serif", 
          "800", 
          fields.tier.color || '#a855f7', 
          maxAllowedWidth
        );
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

  // Helper for dynamic auto-fit font size based on text length
  const getAutoFitFontSize = (baseSize, text) => {
    if (!text) return baseSize;
    if (text.length > 25) return Math.max(12, Math.round(baseSize * 0.65));
    if (text.length > 18) return Math.max(13, Math.round(baseSize * 0.78));
    if (text.length > 13) return Math.max(14, Math.round(baseSize * 0.88));
    return baseSize;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className={`border rounded-3xl p-6 w-full max-w-2xl shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto font-sans ${
        isDark ? 'bg-[#090d16] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-[#F7D06B]/20 text-[#F7D06B] border border-[#F7D06B]/30">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-extrabold">Custom Personalized Invitation Card</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-[#01BD9B]/20 text-[#01BD9B] border border-[#01BD9B]/40 font-extrabold">
                  v{currentAttendee.qrVersion || 1} QR Code Linked
                </span>
              </div>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Aligned for {currentAttendee.name} ({currentAttendee.delegateId || currentAttendee.id})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="font-extrabold text-lg text-slate-400 hover:text-slate-200">✕</button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-xs text-slate-400 font-semibold">Loading custom invitation artwork & dynamic QR...</div>
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

            {/* Overlay: Name (Auto-Fit & Truncated) */}
            {fields.name?.enabled && (
              <div
                style={{
                  left: `${fields.name.x}%`,
                  top: `${fields.name.y}%`,
                  fontSize: `${getAutoFitFontSize(fields.name.fontSize || 22, currentAttendee.name)}px`,
                  color: fields.name.color || '#ffffff',
                  maxWidth: `calc(95% - ${fields.name.x}%)`
                }}
                className="field-overlay font-extrabold tracking-tight"
                title={currentAttendee.name}
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
                  fontSize: `${fields.delegateId.fontSize || 16}px`,
                  color: fields.delegateId.color || '#f59e0b',
                  maxWidth: `calc(95% - ${fields.delegateId.x}%)`
                }}
                className="field-overlay font-mono font-extrabold"
              >
                {currentAttendee.delegateId || currentAttendee.id}
              </div>
            )}

            {/* Overlay: Company (Auto-Fit) */}
            {fields.company?.enabled && (
              <div
                style={{
                  left: `${fields.company.x}%`,
                  top: `${fields.company.y}%`,
                  fontSize: `${getAutoFitFontSize(fields.company.fontSize || 15, currentAttendee.company)}px`,
                  color: fields.company.color || '#38bdf8',
                  maxWidth: `calc(95% - ${fields.company.x}%)`
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
                  fontSize: `${fields.tier.fontSize || 13}px`,
                  color: fields.tier.color || '#a855f7',
                  maxWidth: `calc(95% - ${fields.tier.x}%)`
                }}
                className="field-overlay font-bold uppercase tracking-wider"
              >
                {currentAttendee.tier}
              </div>
            )}

            {/* Overlay: Dynamic QR Code */}
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
            className="py-3 rounded-xl btn-brand-primary font-extrabold flex items-center justify-center gap-2 shadow"
          >
            <Download className="w-4 h-4" /> Download Card PNG
          </button>
          
          <button
            onClick={handlePrint}
            className="py-3 rounded-xl btn-brand-gold font-extrabold flex items-center justify-center gap-2 shadow"
          >
            <Printer className="w-4 h-4" /> Print Custom Invitation
          </button>
        </div>

      </div>
    </div>
  );
}
