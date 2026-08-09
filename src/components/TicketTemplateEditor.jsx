import React, { useState, useEffect } from 'react';
import { Layout, Palette, Image as ImageIcon, Save, Check, QrCode } from 'lucide-react';

export default function TicketTemplateEditor({ template, onSave }) {
  const [formData, setFormData] = useState({
    headerTitle: 'GLOBAL TECH SUMMIT 2026',
    bannerBgColor: '#4f46e5',
    cardBgColor: '#0f172a',
    textColor: '#ffffff',
    accentColor: '#38bdf8',
    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200',
    showPhone: true,
    showEmail: true,
    footerNote: 'Present this digital pass at designated entrance gate.'
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (template) {
      setFormData(prev => ({ ...prev, ...template }));
    }
  }, [template]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
      
      {/* Controls Column */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Digital Ticket Pass Designer</h2>
            <p className="text-xs text-slate-400">Customize visual branding, colors, and layout for attendee tickets</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Header Title */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Header Title Text</label>
            <input
              type="text"
              value={formData.headerTitle}
              onChange={(e) => setFormData({ ...formData, headerTitle: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Color Pickers */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Banner Accent Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={formData.bannerBgColor}
                  onChange={(e) => setFormData({ ...formData, bannerBgColor: e.target.value })}
                  className="w-9 h-9 rounded-lg bg-transparent border border-slate-700 cursor-pointer"
                />
                <span className="font-mono text-slate-400">{formData.bannerBgColor}</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Card Background Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={formData.cardBgColor}
                  onChange={(e) => setFormData({ ...formData, cardBgColor: e.target.value })}
                  className="w-9 h-9 rounded-lg bg-transparent border border-slate-700 cursor-pointer"
                />
                <span className="font-mono text-slate-400">{formData.cardBgColor}</span>
              </div>
            </div>
          </div>

          {/* Logo URL */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Event Brand Logo URL</label>
            <input
              type="text"
              value={formData.logoUrl}
              onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
              placeholder="https://..."
            />
          </div>

          {/* Toggle Fields */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="block text-slate-300 font-semibold">Attendee Information Placement</span>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.showPhone}
                  onChange={(e) => setFormData({ ...formData, showPhone: e.target.checked })}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-0"
                />
                <span className="text-slate-300">Show Phone Number</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.showEmail}
                  onChange={(e) => setFormData({ ...formData, showEmail: e.target.checked })}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-0"
                />
                <span className="text-slate-300">Show Email Address</span>
              </label>
            </div>
          </div>

          {/* Footer Note */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Footer Notice Note</label>
            <input
              type="text"
              value={formData.footerNote}
              onChange={(e) => setFormData({ ...formData, footerNote: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all"
            >
              {savedSuccess ? <Check className="w-5 h-5 text-white" /> : <Save className="w-5 h-5" />}
              <span>{savedSuccess ? 'Template Layout Saved!' : 'Save Ticket Template Design'}</span>
            </button>
          </div>

        </form>
      </div>

      {/* Live Card Preview Column */}
      <div className="space-y-4">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Ticket Card Preview</div>
        
        {/* Pass Visual Card Container */}
        <div 
          className="rounded-3xl shadow-2xl overflow-hidden border border-white/10 max-w-md mx-auto transition-all"
          style={{ backgroundColor: formData.cardBgColor, color: formData.textColor }}
        >
          
          {/* Card Header Banner */}
          <div 
            className="p-6 text-center space-y-2 relative"
            style={{ backgroundColor: formData.bannerBgColor }}
          >
            <div className="w-12 h-12 rounded-xl bg-white/20 p-1 mx-auto flex items-center justify-center backdrop-blur-md">
              <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-lg" />
            </div>
            <h3 className="font-extrabold text-lg uppercase tracking-wider text-white">
              {formData.headerTitle}
            </h3>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white border border-white/30">
              VIP ACCESS PASS
            </span>
          </div>

          {/* Card Body & QR Section */}
          <div className="p-6 space-y-6 text-center">
            
            {/* Attendee Details */}
            <div className="space-y-1">
              <h4 className="text-xl font-bold text-white">Alexander Wright</h4>
              <p className="text-xs text-indigo-300">Quantum Dynamics</p>
              {formData.showEmail && <p className="text-xs text-slate-400">alexander.wright@techcorp.com</p>}
              {formData.showPhone && <p className="text-xs text-slate-400">+1 (555) 234-5678</p>}
            </div>

            {/* Encrypted QR Placement */}
            <div className="bg-white p-4 rounded-2xl w-48 h-48 mx-auto flex items-center justify-center shadow-lg border-4 border-indigo-400/30">
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=GP1.evt_tech_2026.att_101.v1.ENCRYPTED_SAMPLE"
                alt="Encrypted QR Code"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="font-mono text-[10px] text-indigo-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800 truncate">
              GP1.evt_tech_2026.att_101.v1.7f8b9a2c...
            </div>

            {/* Footer Note */}
            <div className="pt-4 border-t border-white/10 text-[11px] text-slate-400">
              {formData.footerNote}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
