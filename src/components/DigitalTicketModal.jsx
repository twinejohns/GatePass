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
  const [artworkAspectRatio, setArtworkAspectRatio] = useState(16 / 9);

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
    : (template?.bannerBgColor || '#1698E1');

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    if (naturalWidth && naturalHeight) {
      setArtworkAspectRatio(naturalWidth / naturalHeight);
    }
  };

  const passFields = template?.passFields || {
    name: { x: 5, y: 70, fontSize: 22, color: '#ffffff', enabled: true },
    delegateId: { x: 5, y: 82, fontSize: 16, color: '#f59e0b', enabled: true },
    company: { x: 5, y: 76, fontSize: 15, color: '#38bdf8', enabled: true },
    tier: { x: 5, y: 12, fontSize: 13, color: '#ffffff', enabled: true },
    qrCode: { x: 70, y: 55, width: 24, height: 24, enabled: true }
  };

  // Helper for dynamic auto-fit font size based on text length in HTML view
  const getAutoFitFontSize = (baseSize, text) => {
    if (!text) return baseSize;
    if (text.length > 25) return Math.max(12, Math.round(baseSize * 0.65));
    if (text.length > 18) return Math.max(13, Math.round(baseSize * 0.78));
    if (text.length > 13) return Math.max(14, Math.round(baseSize * 0.88));
    return baseSize;
  };

  // Render and export the ENTIRE Passcard as a high-resolution PNG image
  const handleDownloadFullPassPng = () => {
    setDownloading(true);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const isCustomArtwork = template?.useCustomArtwork && template?.cardImageUrl;

    // Helper function to draw auto-fitted text on canvas
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

    if (isCustomArtwork) {
      const artImg = new Image();
      artImg.crossOrigin = 'anonymous';
      artImg.src = template.cardImageUrl;

      artImg.onload = () => {
        canvas.width = artImg.naturalWidth || 1200;
        canvas.height = artImg.naturalHeight || 675;

        // Draw custom artwork background
        ctx.drawImage(artImg, 0, 0, canvas.width, canvas.height);

        // Draw Movable Name (Auto-Fitted to prevent overlap)
        if (passFields.name?.enabled && attendee.name) {
          const nameX = (passFields.name.x / 100) * canvas.width;
          const nameY = (passFields.name.y / 100) * canvas.height;
          const baseFontSize = (passFields.name.fontSize || 22) * (canvas.height / 450);
          const maxAllowedWidth = canvas.width - nameX - (canvas.width * 0.05);

          drawAutoFitText(
            attendee.name, 
            nameX, 
            nameY, 
            baseFontSize, 
            "Poppins, Inter, sans-serif", 
            "900", 
            passFields.name.color || '#ffffff', 
            maxAllowedWidth
          );
        }

        // Draw Movable Delegate ID
        if (passFields.delegateId?.enabled) {
          const delX = (passFields.delegateId.x / 100) * canvas.width;
          const delY = (passFields.delegateId.y / 100) * canvas.height;
          const baseFontSize = (passFields.delegateId.fontSize || 16) * (canvas.height / 450);
          const maxAllowedWidth = canvas.width - delX - (canvas.width * 0.05);

          drawAutoFitText(
            delegateIdText, 
            delX, 
            delY, 
            baseFontSize, 
            "JetBrains Mono, monospace", 
            "800", 
            passFields.delegateId.color || '#f59e0b', 
            maxAllowedWidth
          );
        }

        // Draw Movable Company (Auto-Fitted)
        if (passFields.company?.enabled && attendee.company) {
          const compX = (passFields.company.x / 100) * canvas.width;
          const compY = (passFields.company.y / 100) * canvas.height;
          const baseFontSize = (passFields.company.fontSize || 15) * (canvas.height / 450);
          const maxAllowedWidth = canvas.width - compX - (canvas.width * 0.05);

          drawAutoFitText(
            attendee.company, 
            compX, 
            compY, 
            baseFontSize, 
            "Poppins, Inter, sans-serif", 
            "700", 
            passFields.company.color || '#38bdf8', 
            maxAllowedWidth
          );
        }

        // Draw Movable Tier
        if (passFields.tier?.enabled && attendee.tier) {
          const tierX = (passFields.tier.x / 100) * canvas.width;
          const tierY = (passFields.tier.y / 100) * canvas.height;
          const baseFontSize = (passFields.tier.fontSize || 13) * (canvas.height / 450);
          const maxAllowedWidth = canvas.width - tierX - (canvas.width * 0.05);

          drawAutoFitText(
            attendee.tier, 
            tierX, 
            tierY, 
            baseFontSize, 
            "Poppins, Inter, sans-serif", 
            "800", 
            passFields.tier.color || '#ffffff', 
            maxAllowedWidth
          );
        }

        // Draw Movable QR Code Box
        if (passFields.qrCode?.enabled && qrDataUrl) {
          const qrImg = new Image();
          qrImg.src = qrDataUrl;
          qrImg.onload = () => {
            const qrX = (passFields.qrCode.x / 100) * canvas.width;
            const qrY = (passFields.qrCode.y / 100) * canvas.height;
            const qrW = (passFields.qrCode.width / 100) * canvas.width;
            const qrH = (passFields.qrCode.height / 100) * canvas.height;

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.roundRect(qrX, qrY, qrW, qrH, 16);
            ctx.fill();

            ctx.drawImage(qrImg, qrX + 8, qrY + 8, qrW - 16, qrH - 16);

            const link = document.createElement('a');
            link.download = `${delegateIdText}_${attendee.name.replace(/\s+/g, '_')}_CustomPassCard.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            setDownloading(false);
          };
        } else {
          const link = document.createElement('a');
          link.download = `${delegateIdText}_${attendee.name.replace(/\s+/g, '_')}_CustomPassCard.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
          setDownloading(false);
        }
      };
      return;
    }

    // High Resolution Standard Executive Passcard
    canvas.width = 900;
    canvas.height = 1100;

    // Background Card Fill
    ctx.fillStyle = template?.cardBgColor || '#0f172a';
    ctx.beginPath();
    ctx.roundRect(0, 0, canvas.width, canvas.height, 40);
    ctx.fill();

    // Top Header Banner
    ctx.fillStyle = tierColor;
    ctx.fillRect(0, 0, canvas.width, 160);

    ctx.font = "900 24px Poppins, Inter, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.fillText("OFFICIAL EVENT PASS", 50, 60);

    ctx.font = "900 36px Poppins, Inter, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(template?.headerTitle || "GLOBAL TECH SUMMIT 2026", 50, 110);

    // Tier Pill Badge on Right
    ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
    ctx.beginPath();
    ctx.roundRect(canvas.width - 240, 50, 190, 50, 25);
    ctx.fill();
    ctx.font = "900 20px Poppins, Inter, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText(attendee.tier, canvas.width - 145, 82);
    ctx.textAlign = "left";

    // Attendee Name (Auto-Fit)
    ctx.font = "900 20px Poppins, Inter, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.fillText("ATTENDEE DELEGATE", 50, 230);

    drawAutoFitText(
      attendee.name, 
      50, 
      290, 
      46, 
      "Poppins, Inter, sans-serif", 
      "900", 
      "#ffffff", 
      500
    );

    // Company & Delegate ID
    if (template?.showCompany && attendee.company) {
      ctx.font = "700 28px Poppins, Inter, sans-serif";
      ctx.fillStyle = "#58BAD7";
      ctx.fillText(attendee.company, 50, 340);
    }

    if (template?.showDelegateId) {
      ctx.font = "800 26px JetBrains Mono, monospace";
      ctx.fillStyle = "#F7D06B";
      ctx.fillText(`ID: ${delegateIdText}`, 550, 290);
    }

    // Main QR Code White Box Container
    const qrBoxX = 150;
    const qrBoxY = 420;
    const qrBoxSize = 600;

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 36);
    ctx.fill();

    const qrImg = new Image();
    qrImg.src = qrDataUrl;
    qrImg.onload = () => {
      ctx.drawImage(qrImg, qrBoxX + 40, qrBoxY + 40, qrBoxSize - 80, qrBoxSize - 80);

      // Footer Instructions
      ctx.font = "500 20px Poppins, Inter, sans-serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.textAlign = "center";
      ctx.fillText(template?.footerNote || "Present this pass at designated gate. Non-transferable.", canvas.width / 2, 1060);

      const link = document.createElement('a');
      link.download = `${delegateIdText}_${attendee.name.replace(/\s+/g, '_')}_DigitalPass.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setDownloading(false);
    };
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className={`border rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto font-sans ${
        isDark ? 'bg-[#090d16] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-[#1698E1]/15 text-[#1698E1] border border-[#1698E1]/30">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold">Executive Digital Attendee Pass</h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Verified Pass for {attendee.name} ({delegateIdText})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="font-extrabold text-lg text-slate-400 hover:text-slate-200">✕</button>
        </div>

        {/* Passcard Container Preview */}
        <div 
          ref={cardRef}
          style={{ 
            backgroundColor: template?.cardBgColor || '#0f172a',
            aspectRatio: template?.useCustomArtwork && template?.cardImageUrl ? `${artworkAspectRatio}` : 'auto'
          }}
          className="relative rounded-3xl border border-slate-700 shadow-2xl overflow-hidden text-white transition-all"
        >
          {template?.useCustomArtwork && template?.cardImageUrl ? (
            /* Custom Artwork Mode with Movable Field Overlays */
            <div className="relative w-full h-full min-h-[280px]">
              <img 
                src={template.cardImageUrl} 
                alt="Custom Pass Artwork" 
                onLoad={handleImageLoad}
                className="w-full h-full object-cover" 
              />

              {/* Movable Name Overlay (Auto-Fit) */}
              {passFields.name?.enabled && (
                <div
                  style={{
                    left: `${passFields.name.x}%`,
                    top: `${passFields.name.y}%`,
                    fontSize: `${getAutoFitFontSize(passFields.name.fontSize || 22, attendee.name)}px`,
                    color: passFields.name.color || '#ffffff',
                    maxWidth: `calc(95% - ${passFields.name.x}%)`
                  }}
                  className="absolute font-extrabold whitespace-nowrap overflow-hidden text-ellipsis"
                  title={attendee.name}
                >
                  {attendee.name}
                </div>
              )}

              {/* Movable Delegate ID Overlay */}
              {passFields.delegateId?.enabled && (
                <div
                  style={{
                    left: `${passFields.delegateId.x}%`,
                    top: `${passFields.delegateId.y}%`,
                    fontSize: `${passFields.delegateId.fontSize || 16}px`,
                    color: passFields.delegateId.color || '#f59e0b',
                    maxWidth: `calc(95% - ${passFields.delegateId.x}%)`
                  }}
                  className="absolute font-mono font-extrabold whitespace-nowrap overflow-hidden text-ellipsis"
                >
                  {delegateIdText}
                </div>
              )}

              {/* Movable Company Overlay (Auto-Fit) */}
              {passFields.company?.enabled && attendee.company && (
                <div
                  style={{
                    left: `${passFields.company.x}%`,
                    top: `${passFields.company.y}%`,
                    fontSize: `${getAutoFitFontSize(passFields.company.fontSize || 15, attendee.company)}px`,
                    color: passFields.company.color || '#38bdf8',
                    maxWidth: `calc(95% - ${passFields.company.x}%)`
                  }}
                  className="absolute font-semibold whitespace-nowrap overflow-hidden text-ellipsis"
                >
                  {attendee.company}
                </div>
              )}

              {/* Movable Tier Overlay */}
              {passFields.tier?.enabled && (
                <div
                  style={{
                    left: `${passFields.tier.x}%`,
                    top: `${passFields.tier.y}%`,
                    fontSize: `${passFields.tier.fontSize || 13}px`,
                    color: passFields.tier.color || '#ffffff',
                    maxWidth: `calc(95% - ${passFields.tier.x}%)`
                  }}
                  className="absolute font-bold uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis"
                >
                  {attendee.tier}
                </div>
              )}

              {/* Movable QR Code Overlay */}
              {passFields.qrCode?.enabled && qrDataUrl && (
                <div
                  style={{
                    left: `${passFields.qrCode.x}%`,
                    top: `${passFields.qrCode.y}%`,
                    width: `${passFields.qrCode.width}%`,
                    height: `${passFields.qrCode.height}%`
                  }}
                  className="absolute bg-white p-1.5 rounded-xl shadow-2xl border border-slate-300 flex items-center justify-center"
                >
                  <img 
                    src={qrDataUrl} 
                    alt="QR Code" 
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
            </div>
          ) : (
            /* Executive Card Standard Layout */
            <>
              {/* Dynamic Tier Header Bar */}
              <div 
                style={{ backgroundColor: tierColor }}
                className="p-4 flex items-center justify-between transition-colors duration-300"
              >
                <div>
                  <span className="text-[9px] font-extrabold tracking-widest uppercase text-white/80">OFFICIAL EVENT PASS</span>
                  <h4 className="text-sm font-extrabold text-white leading-snug">{template?.headerTitle || 'GLOBAL TECH SUMMIT 2026'}</h4>
                </div>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full font-extrabold bg-white/20 backdrop-blur border border-white/30 text-white shadow">
                  {attendee.tier}
                </span>
              </div>

              {/* Pass Body Info */}
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5 max-w-[65%]">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold">ATTENDEE DELEGATE</span>
                    <h3 className="text-lg font-extrabold text-white truncate" title={attendee.name}>{attendee.name}</h3>
                    {template?.showCompany && attendee.company && (
                      <div className="text-xs text-[#58BAD7] font-extrabold truncate">{attendee.company}</div>
                    )}
                  </div>

                  {template?.showDelegateId && (
                    <div className="bg-[#F7D06B]/15 border border-[#F7D06B]/30 px-2.5 py-1.5 rounded-xl text-center flex-shrink-0">
                      <span className="text-[8px] uppercase tracking-wider text-[#F7D06B] font-extrabold block">DELEGATE ID</span>
                      <span className="text-xs font-mono font-extrabold text-[#F7D06B]">{delegateIdText}</span>
                    </div>
                  )}
                </div>

                {/* QR Code Container */}
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex flex-col items-center justify-center space-y-2">
                  <div className="bg-white p-2.5 rounded-2xl shadow-xl border border-slate-300">
                    <img 
                      src={qrDataUrl} 
                      alt="Encrypted QR Code" 
                      className="w-36 h-36 object-contain"
                    />
                  </div>
                  <div className="flex items-center space-x-2 text-[10px] font-mono text-[#F7D06B] font-extrabold">
                    <Hash className="w-3 h-3 text-[#1698E1]" />
                    <span>{delegateIdText}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-[#01BD9B]">v{attendee.qrVersion || 1} Payload</span>
                  </div>
                </div>

                {/* Footer Note */}
                <div className="text-[9px] text-slate-400 text-center border-t border-slate-800/60 pt-2">
                  {template?.footerNote || 'Present this pass at designated gate. Non-transferable once checked in.'}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Export Full Passcard Button */}
        <div className="pt-2">
          <button
            onClick={handleDownloadFullPassPng}
            disabled={downloading}
            className="w-full py-3 rounded-2xl btn-brand-primary font-extrabold text-xs flex items-center justify-center gap-2 shadow transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Generating High-Res Passcard Image...' : 'Download Whole Passcard (PNG)'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
