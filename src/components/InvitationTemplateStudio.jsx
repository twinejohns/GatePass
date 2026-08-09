import React, { useState, useEffect } from 'react';
import { FileCheck, Upload, Save, Check, Move, Eye, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function InvitationTemplateStudio({ eventId, sampleAttendee }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [cardImageUrl, setCardImageUrl] = useState(
    'https://images.unsplash.com/photo-1557683316-973673baf926?w=800'
  );
  const [fields, setFields] = useState({
    name: { x: 40, y: 100, fontSize: 24, color: '#ffffff', enabled: true },
    company: { x: 40, y: 140, fontSize: 16, color: '#38bdf8', enabled: true },
    tier: { x: 40, y: 170, fontSize: 14, color: '#a855f7', enabled: true },
    qrCode: { x: 480, y: 80, width: 140, height: 140, enabled: true }
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    loadTemplate();
  }, [eventId]);

  const loadTemplate = async () => {
    if (!eventId) return;
    try {
      const res = await api.getInvitationStudio(eventId);
      if (res.success && res.template) {
        if (res.template.cardImageUrl) setCardImageUrl(res.template.cardImageUrl);
        if (res.template.fields) setFields(res.template.fields);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCardImageUrl(event.target.result.toString());
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      await api.saveInvitationStudio(eventId, {
        cardImageUrl,
        fields
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      alert('Failed to save layout: ' + err.message);
    }
  };

  const nameVal = sampleAttendee?.name || 'Alexander Wright';
  const companyVal = sampleAttendee?.company || 'Quantum Dynamics';
  const tierVal = sampleAttendee?.tier || 'VIP Access Pass';

  return (
    <div className={`border rounded-3xl p-6 shadow-xl space-y-6 ${
      isDark ? 'bg-slate-900/90 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
    }`}>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold">PDF Invitation Importer & Field Auto-Placement Studio</h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Upload custom invitation artwork and visually position attendee name, company, tier, and QR code coordinates
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-600/20"
        >
          {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{savedSuccess ? 'Layout Coordinates Saved!' : 'Save Auto-Placement Layout'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Controls Column */}
        <div className="space-y-4 text-xs">
          
          {/* Card Artwork Upload */}
          <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <label className="block font-bold mb-2">Upload Invitation Card Artwork (PDF/Image)</label>
            <label className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs cursor-pointer inline-flex items-center gap-2 shadow">
              <Upload className="w-4 h-4" /> Browse Artwork File
              <input type="file" accept="image/*, .pdf" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>

          {/* Coordinate Fields Controls */}

          {/* 1. Name */}
          <div className={`p-4 rounded-2xl border space-y-2 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center justify-between font-bold">
              <span>{`{Attendee Name}`} Field</span>
              <input
                type="color"
                value={fields.name.color}
                onChange={(e) => setFields({ ...fields, name: { ...fields.name, color: e.target.value } })}
                className="w-6 h-6 rounded bg-transparent border-0 cursor-pointer"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-slate-400">X Position (px)</label>
                <input
                  type="number"
                  value={fields.name.x}
                  onChange={(e) => setFields({ ...fields, name: { ...fields.name, x: parseInt(e.target.value, 10) || 0 } })}
                  className={`w-full p-1.5 rounded border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'}`}
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400">Y Position (px)</label>
                <input
                  type="number"
                  value={fields.name.y}
                  onChange={(e) => setFields({ ...fields, name: { ...fields.name, y: parseInt(e.target.value, 10) || 0 } })}
                  className={`w-full p-1.5 rounded border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'}`}
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400">Font Size (px)</label>
                <input
                  type="number"
                  value={fields.name.fontSize}
                  onChange={(e) => setFields({ ...fields, name: { ...fields.name, fontSize: parseInt(e.target.value, 10) || 0 } })}
                  className={`w-full p-1.5 rounded border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'}`}
                />
              </div>
            </div>
          </div>

          {/* 2. Company */}
          <div className={`p-4 rounded-2xl border space-y-2 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center justify-between font-bold">
              <span>{`{Company}`} Field</span>
              <input
                type="color"
                value={fields.company.color}
                onChange={(e) => setFields({ ...fields, company: { ...fields.company, color: e.target.value } })}
                className="w-6 h-6 rounded bg-transparent border-0 cursor-pointer"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-slate-400">X Position (px)</label>
                <input
                  type="number"
                  value={fields.company.x}
                  onChange={(e) => setFields({ ...fields, company: { ...fields.company, x: parseInt(e.target.value, 10) || 0 } })}
                  className={`w-full p-1.5 rounded border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'}`}
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400">Y Position (px)</label>
                <input
                  type="number"
                  value={fields.company.y}
                  onChange={(e) => setFields({ ...fields, company: { ...fields.company, y: parseInt(e.target.value, 10) || 0 } })}
                  className={`w-full p-1.5 rounded border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'}`}
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400">Font Size (px)</label>
                <input
                  type="number"
                  value={fields.company.fontSize}
                  onChange={(e) => setFields({ ...fields, company: { ...fields.company, fontSize: parseInt(e.target.value, 10) || 0 } })}
                  className={`w-full p-1.5 rounded border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'}`}
                />
              </div>
            </div>
          </div>

          {/* 3. Encrypted QR Code */}
          <div className={`p-4 rounded-2xl border space-y-2 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <div className="font-bold">{`{Encrypted QR Code}`} Placement</div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-slate-400">X Position (px)</label>
                <input
                  type="number"
                  value={fields.qrCode.x}
                  onChange={(e) => setFields({ ...fields, qrCode: { ...fields.qrCode, x: parseInt(e.target.value, 10) || 0 } })}
                  className={`w-full p-1.5 rounded border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'}`}
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400">Y Position (px)</label>
                <input
                  type="number"
                  value={fields.qrCode.y}
                  onChange={(e) => setFields({ ...fields, qrCode: { ...fields.qrCode, y: parseInt(e.target.value, 10) || 0 } })}
                  className={`w-full p-1.5 rounded border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'}`}
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400">Size (px)</label>
                <input
                  type="number"
                  value={fields.qrCode.width}
                  onChange={(e) => setFields({ ...fields, qrCode: { ...fields.qrCode, width: parseInt(e.target.value, 10) || 0, height: parseInt(e.target.value, 10) || 0 } })}
                  className={`w-full p-1.5 rounded border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'}`}
                />
              </div>
            </div>
          </div>

        </div>

        {/* Live Canvas Overlay Interactive Preview Column */}
        <div className="lg:col-span-2 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-indigo-400" /> Interactive Artwork Auto-Placement Canvas
            </span>
            <span>Real-time Attendee Overlay</span>
          </div>

          <div className="relative w-full min-h-[360px] max-w-2xl bg-slate-950 rounded-3xl border-2 border-slate-800 overflow-hidden shadow-2xl">
            {/* Background Card Image */}
            <img src={cardImageUrl} alt="Invitation Artwork" className="w-full h-full object-cover opacity-90" />

            {/* Overlaid Auto-placed Fields */}
            {fields.name.enabled && (
              <div
                className="absolute font-bold drop-shadow-md select-none"
                style={{
                  left: `${fields.name.x}px`,
                  top: `${fields.name.y}px`,
                  fontSize: `${fields.name.fontSize}px`,
                  color: fields.name.color
                }}
              >
                {nameVal}
              </div>
            )}

            {fields.company.enabled && (
              <div
                className="absolute font-semibold drop-shadow-md select-none"
                style={{
                  left: `${fields.company.x}px`,
                  top: `${fields.company.y}px`,
                  fontSize: `${fields.company.fontSize}px`,
                  color: fields.company.color
                }}
              >
                {companyVal}
              </div>
            )}

            {fields.tier.enabled && (
              <div
                className="absolute font-bold uppercase tracking-wider drop-shadow-md select-none"
                style={{
                  left: `${fields.tier.x}px`,
                  top: `${fields.tier.y}px`,
                  fontSize: `${fields.tier.fontSize}px`,
                  color: fields.tier.color
                }}
              >
                {tierVal}
              </div>
            )}

            {fields.qrCode.enabled && (
              <div
                className="absolute bg-white p-2 rounded-2xl shadow-xl border-2 border-indigo-400 select-none flex items-center justify-center"
                style={{
                  left: `${fields.qrCode.x}px`,
                  top: `${fields.qrCode.y}px`,
                  width: `${fields.qrCode.width}px`,
                  height: `${fields.qrCode.height}px`
                }}
              >
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=GP1.evt_tech_2026.att_101.v1.ENCRYPTED"
                  alt="Placed Encrypted QR"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
