import React, { useState, useEffect } from 'react';
import { Palette, Eye, Save, Sparkles, CheckCircle2, Shield, Upload, Layers } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function TicketTemplateEditor({ template, onSave }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [formData, setFormData] = useState({
    bannerBgColor: '#4f46e5',
    cardBgColor: '#0f172a',
    textColor: '#ffffff',
    accentColor: '#38bdf8',
    headerTitle: 'GLOBAL TECH SUMMIT 2026',
    cardImageUrl: '',
    showContactInfo: false,
    showCompany: true,
    showDelegateId: true,
    tierColors: {
      'VIP Access': '#d97706',        // Amber / Gold
      'General Admission': '#4f46e5', // Indigo
      'Speaker': '#059669',           // Emerald
      'Press / Media': '#9333ea'      // Purple
    },
    footerNote: 'Present this pass at designated gate. Non-transferable once checked in.'
  });

  const [activeTierPreview, setActiveTierPreview] = useState('VIP Access');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (template) {
      setFormData({
        bannerBgColor: template.bannerBgColor || '#4f46e5',
        cardBgColor: template.cardBgColor || '#0f172a',
        textColor: template.textColor || '#ffffff',
        accentColor: template.accentColor || '#38bdf8',
        headerTitle: template.headerTitle || 'GLOBAL TECH SUMMIT 2026',
        cardImageUrl: template.cardImageUrl || '',
        showContactInfo: template.showContactInfo || false,
        showCompany: template.showCompany ?? true,
        showDelegateId: template.showDelegateId ?? true,
        tierColors: template.tierColors || {
          'VIP Access': '#d97706',
          'General Admission': '#4f46e5',
          'Speaker': '#059669',
          'Press / Media': '#9333ea'
        },
        footerNote: template.footerNote || 'Present this pass at designated gate.'
      });
    }
  }, [template]);

  const handleTierColorChange = (tier, color) => {
    setFormData({
      ...formData,
      tierColors: {
        ...formData.tierColors,
        [tier]: color
      }
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setFormData({ ...formData, cardImageUrl: evt.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const currentHeaderColor = formData.tierColors[activeTierPreview] || formData.bannerBgColor;

  return (
    <div className={`border rounded-3xl p-4 sm:p-6 shadow-xl space-y-6 ${
      isDark ? 'bg-slate-900/90 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
    }`}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold">Digital Ticket Pass Designer</h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Customize executive card styles, access tier header colors, and custom artwork
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-purple-600/20 transition-all"
        >
          {saveSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{saveSuccess ? 'Pass Styles Saved!' : 'Save Pass Design'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Controls Panel (2 Cols) */}
        <div className="lg:col-span-2 space-y-6 text-xs">
          
          {/* Access Level Tier Color Customizer */}
          <div className={`p-4 rounded-2xl border space-y-3 ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                <Layers className="w-4 h-4" /> Access Level Tier Header Colors
              </span>
              <span className="text-[11px] text-slate-400">Card header adopts color of attendee's tier</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.keys(formData.tierColors).map((tier) => (
                <div key={tier} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-800 bg-slate-900/60">
                  <div className="flex items-center space-x-2">
                    <span 
                      style={{ backgroundColor: formData.tierColors[tier] }}
                      className="w-3.5 h-3.5 rounded-full border border-white/30"
                    ></span>
                    <span className="font-semibold text-slate-200">{tier}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={formData.tierColors[tier]}
                      onChange={(e) => handleTierColorChange(tier, e.target.value)}
                      className="w-8 h-7 rounded-lg cursor-pointer bg-slate-950 border border-slate-700"
                    />
                    <button
                      type="button"
                      onClick={() => setActiveTierPreview(tier)}
                      className={`px-2 py-1 rounded text-[10px] font-bold ${
                        activeTierPreview === tier ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Preview
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pass Title & Footer Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1 text-slate-300">Header Title Text</label>
              <input
                type="text"
                value={formData.headerTitle}
                onChange={(e) => setFormData({ ...formData, headerTitle: e.target.value })}
                className={`w-full rounded-xl px-3 py-2 border focus:outline-none focus:border-indigo-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-300">Card Base Background Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={formData.cardBgColor}
                  onChange={(e) => setFormData({ ...formData, cardBgColor: e.target.value })}
                  className="w-10 h-9 rounded-xl cursor-pointer bg-slate-950 border border-slate-800"
                />
                <input
                  type="text"
                  value={formData.cardBgColor}
                  onChange={(e) => setFormData({ ...formData, cardBgColor: e.target.value })}
                  className={`flex-1 rounded-xl px-3 py-2 border font-mono text-xs focus:outline-none ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Visibility Toggles for Executive Clean Look */}
          <div className={`p-4 rounded-2xl border space-y-2 ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="font-bold text-indigo-400 block mb-1">Executive Card Display Toggles</span>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.showDelegateId}
                  onChange={(e) => setFormData({ ...formData, showDelegateId: e.target.checked })}
                  className="w-4 h-4 accent-indigo-500 rounded"
                />
                <span className="font-semibold text-slate-300">Show Delegate ID</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.showCompany}
                  onChange={(e) => setFormData({ ...formData, showCompany: e.target.checked })}
                  className="w-4 h-4 accent-indigo-500 rounded"
                />
                <span className="font-semibold text-slate-300">Show Company</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.showContactInfo}
                  onChange={(e) => setFormData({ ...formData, showContactInfo: e.target.checked })}
                  className="w-4 h-4 accent-indigo-500 rounded"
                />
                <span className="font-semibold text-slate-300">Show Raw Email/Phone</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-300">Footer Instructions</label>
            <input
              type="text"
              value={formData.footerNote}
              onChange={(e) => setFormData({ ...formData, footerNote: e.target.value })}
              className={`w-full rounded-xl px-3 py-2 border focus:outline-none focus:border-indigo-500 ${
                isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>

        </div>

        {/* Live Card Preview (1 Col) */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-cyan-400" /> Live Executive Pass Preview ({activeTierPreview})
          </span>

          <div 
            style={{ backgroundColor: formData.cardBgColor }}
            className="rounded-3xl border border-slate-700 shadow-2xl overflow-hidden text-white transition-all"
          >
            {/* Tier Color Header Banner */}
            <div 
              style={{ backgroundColor: currentHeaderColor }}
              className="p-4 flex items-center justify-between transition-colors duration-300"
            >
              <div>
                <span className="text-[9px] font-extrabold tracking-widest uppercase text-white/80">OFFICIAL EVENT PASS</span>
                <h4 className="text-sm font-extrabold text-white leading-snug">{formData.headerTitle}</h4>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-white/20 backdrop-blur border border-white/30 text-white shadow">
                {activeTierPreview}
              </span>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">ATTENDEE DELEGATE</span>
                  <h3 className="text-lg font-extrabold text-white">Sophia Chen</h3>
                  {formData.showCompany && (
                    <div className="text-xs text-cyan-400 font-bold">Nexus AI Labs</div>
                  )}
                  {formData.showContactInfo && (
                    <div className="text-[11px] text-slate-400 mt-1">sophia.chen@nexusai.io</div>
                  )}
                </div>

                {formData.showDelegateId && (
                  <div className="bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-xl text-center">
                    <span className="text-[8px] uppercase tracking-wider text-amber-400 font-bold block">DELEGATE ID</span>
                    <span className="text-xs font-mono font-extrabold text-amber-300">ATS-2026-0002</span>
                  </div>
                )}
              </div>

              {/* QR Box */}
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex flex-col items-center justify-center space-y-2">
                <div className="bg-white p-2.5 rounded-xl shadow-xl">
                  <img 
                    src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=GP1.DEMO" 
                    alt="QR Code" 
                    className="w-32 h-32 object-contain"
                  />
                </div>
                <span className="text-[10px] font-mono text-amber-400 font-bold">ATS-2026-0002</span>
              </div>

              <div className="text-[9px] text-slate-400 text-center border-t border-slate-800/60 pt-2">
                {formData.footerNote}
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
