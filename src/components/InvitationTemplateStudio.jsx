import React, { useState, useEffect, useRef } from 'react';
import { Upload, Move, Type, Eye, Save, Image as ImageIcon, Sparkles, Sliders, CheckCircle2, Hash, Lock, Unlock, Maximize2 } from 'lucide-react';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function InvitationTemplateStudio({ eventId }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const canvasRef = useRef(null);

  const [template, setTemplate] = useState({
    cardImageUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800',
    fields: {
      name: { x: 4, y: 22, fontSize: 22, color: '#ffffff', enabled: true },
      delegateId: { x: 4, y: 32, fontSize: 16, color: '#f59e0b', enabled: true },
      company: { x: 4, y: 39, fontSize: 15, color: '#38bdf8', enabled: true },
      tier: { x: 4, y: 46, fontSize: 13, color: '#a855f7', enabled: true },
      qrCode: { x: 68, y: 18, width: 22, height: 22, lockAspect: true, enabled: true }
    }
  });

  const [selectedField, setSelectedField] = useState('qrCode');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(16 / 9);
  const [imageDimensions, setImageDimensions] = useState({ width: 800, height: 450 });

  useEffect(() => {
    loadTemplate();
  }, [eventId]);

  const loadTemplate = async () => {
    if (!eventId) return;
    try {
      const res = await api.getInvitationStudio(eventId);
      if (res.success && res.template) {
        setTemplate(res.template);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    if (naturalWidth && naturalHeight) {
      setAspectRatio(naturalWidth / naturalHeight);
      setImageDimensions({ width: naturalWidth, height: naturalHeight });
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setTemplate({ ...template, cardImageUrl: evt.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFieldChange = (fieldKey, prop, val) => {
    const currentQr = template.fields.qrCode || {};

    if (fieldKey === 'qrCode') {
      if (prop === 'width' && currentQr.lockAspect) {
        setTemplate({
          ...template,
          fields: {
            ...template.fields,
            qrCode: {
              ...currentQr,
              width: val,
              height: val
            }
          }
        });
        return;
      }
      if (prop === 'height' && currentQr.lockAspect) {
        setTemplate({
          ...template,
          fields: {
            ...template.fields,
            qrCode: {
              ...currentQr,
              width: val,
              height: val
            }
          }
        });
        return;
      }
    }

    setTemplate({
      ...template,
      fields: {
        ...template.fields,
        [fieldKey]: {
          ...template.fields[fieldKey],
          [prop]: val
        }
      }
    });
  };

  const toggleQrAspectLock = () => {
    const currentQr = template.fields.qrCode || {};
    const nextLock = !currentQr.lockAspect;
    setTemplate({
      ...template,
      fields: {
        ...template.fields,
        qrCode: {
          ...currentQr,
          lockAspect: nextLock,
          height: nextLock ? currentQr.width : currentQr.height
        }
      }
    });
  };

  const handleSave = async () => {
    if (!eventId) return;
    try {
      const res = await api.saveInvitationStudio(eventId, template);
      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const currentFieldConfig = template.fields[selectedField] || {};

  return (
    <div className={`border rounded-3xl p-4 sm:p-6 shadow-xl space-y-6 ${
      isDark ? 'bg-slate-900/90 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
    }`}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold">Custom PDF Invitation Card Studio</h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Aspect-ratio responsive canvas for uploaded invitation artwork with lockable QR dimensions
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all"
        >
          {saveSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{saveSuccess ? 'Template Saved!' : 'Save Overlay Template'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Responsive Interactive Canvas Preview (2 Cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-cyan-400" /> Card Canvas ({imageDimensions.width} × {imageDimensions.height}px)
            </span>
            <label className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow">
              <Upload className="w-3.5 h-3.5" /> Upload Custom PDF/Card Artwork
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>

          {/* Dynamic Aspect Ratio Container */}
          <div 
            ref={canvasRef}
            style={{ aspectRatio: `${aspectRatio}` }}
            className="relative w-full bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center transition-all duration-300"
          >
            
            {/* Background Artwork */}
            <img 
              src={template.cardImageUrl} 
              alt="Invitation Artwork" 
              onLoad={handleImageLoad}
              className="w-full h-full object-contain"
            />

            {/* Overlay Field: Name */}
            {template.fields.name?.enabled && (
              <div
                style={{
                  left: `${template.fields.name.x}%`,
                  top: `${template.fields.name.y}%`,
                  fontSize: `${template.fields.name.fontSize}px`,
                  color: template.fields.name.color
                }}
                onClick={() => setSelectedField('name')}
                className={`absolute cursor-pointer font-extrabold transition-all px-2 py-0.5 rounded border whitespace-nowrap ${
                  selectedField === 'name' ? 'border-indigo-400 bg-indigo-500/30 ring-2 ring-indigo-400' : 'border-transparent hover:border-white/40'
                }`}
              >
                Sophia Chen
              </div>
            )}

            {/* Overlay Field: Delegate ID */}
            {template.fields.delegateId?.enabled && (
              <div
                style={{
                  left: `${template.fields.delegateId.x}%`,
                  top: `${template.fields.delegateId.y}%`,
                  fontSize: `${template.fields.delegateId.fontSize}px`,
                  color: template.fields.delegateId.color
                }}
                onClick={() => setSelectedField('delegateId')}
                className={`absolute cursor-pointer font-mono font-extrabold transition-all px-2 py-0.5 rounded border whitespace-nowrap ${
                  selectedField === 'delegateId' ? 'border-amber-400 bg-amber-500/30 ring-2 ring-amber-400' : 'border-transparent hover:border-amber-400/40'
                }`}
              >
                ATS-2026-0002
              </div>
            )}

            {/* Overlay Field: Company */}
            {template.fields.company?.enabled && (
              <div
                style={{
                  left: `${template.fields.company.x}%`,
                  top: `${template.fields.company.y}%`,
                  fontSize: `${template.fields.company.fontSize}px`,
                  color: template.fields.company.color
                }}
                onClick={() => setSelectedField('company')}
                className={`absolute cursor-pointer font-semibold transition-all px-2 py-0.5 rounded border whitespace-nowrap ${
                  selectedField === 'company' ? 'border-cyan-400 bg-cyan-500/30 ring-2 ring-cyan-400' : 'border-transparent hover:border-white/40'
                }`}
              >
                Nexus AI Labs
              </div>
            )}

            {/* Overlay Field: Tier */}
            {template.fields.tier?.enabled && (
              <div
                style={{
                  left: `${template.fields.tier.x}%`,
                  top: `${template.fields.tier.y}%`,
                  fontSize: `${template.fields.tier.fontSize}px`,
                  color: template.fields.tier.color
                }}
                onClick={() => setSelectedField('tier')}
                className={`absolute cursor-pointer font-bold transition-all px-2 py-0.5 rounded border whitespace-nowrap ${
                  selectedField === 'tier' ? 'border-purple-400 bg-purple-500/30 ring-2 ring-purple-400' : 'border-transparent hover:border-white/40'
                }`}
              >
                VIP Access Pass
              </div>
            )}

            {/* Overlay Field: QR Code */}
            {template.fields.qrCode?.enabled && (
              <div
                style={{
                  left: `${template.fields.qrCode.x}%`,
                  top: `${template.fields.qrCode.y}%`,
                  width: `${template.fields.qrCode.width}%`,
                  height: `${template.fields.qrCode.height}%`
                }}
                onClick={() => setSelectedField('qrCode')}
                className={`absolute cursor-pointer bg-white p-2 rounded-xl shadow-2xl border flex items-center justify-center ${
                  selectedField === 'qrCode' ? 'border-amber-400 ring-4 ring-amber-500/40' : 'border-slate-300'
                }`}
              >
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=GP1.DEMO" 
                  alt="QR Code" 
                  className="w-full h-full object-contain"
                />
              </div>
            )}

          </div>
        </div>

        {/* Field Controls Panel (1 Col) */}
        <div className={`p-5 rounded-2xl border space-y-4 ${
          isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold">Field Overlay Controls</h3>
          </div>

          {/* Target Field Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Select Field to Position:</label>
            <div className="grid grid-cols-2 gap-1.5 text-xs font-semibold">
              {[
                { key: 'qrCode', label: '📱 Encrypted QR' },
                { key: 'delegateId', label: '🆔 Delegate ID' },
                { key: 'name', label: '👤 Attendee Name' },
                { key: 'company', label: '🏢 Company' },
                { key: 'tier', label: '🏷️ Ticket Tier' }
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setSelectedField(f.key)}
                  className={`py-2 px-2.5 rounded-xl border text-left transition-all ${
                    selectedField === f.key
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500 font-bold'
                      : isDark ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200' : 'bg-white border-slate-300 text-slate-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Controls for Selected Field */}
          {selectedField && (
            <div className="space-y-4 pt-3 border-t border-slate-800 text-xs">
              
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-400 uppercase tracking-wider">Enable Overlay:</span>
                <input
                  type="checkbox"
                  checked={currentFieldConfig.enabled || false}
                  onChange={(e) => handleFieldChange(selectedField, 'enabled', e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
              </div>

              {/* X Position */}
              <div className="space-y-1">
                <div className="flex justify-between font-semibold">
                  <span>Horizontal Position (X %):</span>
                  <span className="font-mono text-indigo-400">{currentFieldConfig.x || 0}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="90"
                  value={currentFieldConfig.x || 0}
                  onChange={(e) => handleFieldChange(selectedField, 'x', parseInt(e.target.value, 10))}
                  className="w-full accent-amber-500"
                />
              </div>

              {/* Y Position */}
              <div className="space-y-1">
                <div className="flex justify-between font-semibold">
                  <span>Vertical Position (Y %):</span>
                  <span className="font-mono text-indigo-400">{currentFieldConfig.y || 0}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="90"
                  value={currentFieldConfig.y || 0}
                  onChange={(e) => handleFieldChange(selectedField, 'y', parseInt(e.target.value, 10))}
                  className="w-full accent-amber-500"
                />
              </div>

              {/* Text vs QR Specific Controls */}
              {selectedField !== 'qrCode' ? (
                <>
                  <div className="space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span>Font Size:</span>
                      <span className="font-mono text-indigo-400">{currentFieldConfig.fontSize || 16}px</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="48"
                      value={currentFieldConfig.fontSize || 16}
                      onChange={(e) => handleFieldChange(selectedField, 'fontSize', parseInt(e.target.value, 10))}
                      className="w-full accent-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="font-semibold block mb-1">Text Color:</span>
                    <input
                      type="color"
                      value={currentFieldConfig.color || '#ffffff'}
                      onChange={(e) => handleFieldChange(selectedField, 'color', e.target.value)}
                      className="w-full h-8 rounded-lg cursor-pointer bg-slate-900 border border-slate-700"
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-3 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
                  
                  {/* Aspect Ratio Lock Toggle */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="font-bold text-amber-400 flex items-center gap-1.5">
                      {currentFieldConfig.lockAspect ? <Lock className="w-4 h-4 text-emerald-400" /> : <Unlock className="w-4 h-4 text-rose-400" />}
                      <span>Lock Aspect Ratio (1:1)</span>
                    </span>
                    <button
                      type="button"
                      onClick={toggleQrAspectLock}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                        currentFieldConfig.lockAspect 
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500' 
                          : 'bg-rose-500/20 text-rose-300 border-rose-500'
                      }`}
                    >
                      {currentFieldConfig.lockAspect ? 'Locked' : 'Independent W/H'}
                    </button>
                  </div>

                  {/* QR Width Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span>QR Width (%):</span>
                      <span className="font-mono text-indigo-400">{currentFieldConfig.width || 20}%</span>
                    </div>
                    <input
                      type="range"
                      min="8"
                      max="60"
                      value={currentFieldConfig.width || 20}
                      onChange={(e) => handleFieldChange('qrCode', 'width', parseInt(e.target.value, 10))}
                      className="w-full accent-amber-500"
                    />
                  </div>

                  {/* QR Height Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span>QR Height (%):</span>
                      <span className="font-mono text-indigo-400">{currentFieldConfig.height || 20}%</span>
                    </div>
                    <input
                      type="range"
                      min="8"
                      max="60"
                      disabled={currentFieldConfig.lockAspect}
                      value={currentFieldConfig.height || 20}
                      onChange={(e) => handleFieldChange('qrCode', 'height', parseInt(e.target.value, 10))}
                      className="w-full accent-amber-500 disabled:opacity-40"
                    />
                    {currentFieldConfig.lockAspect && (
                      <p className="text-[10px] text-emerald-400 italic">Height locked to match Width (Square 1:1 QR code)</p>
                    )}
                  </div>

                </div>
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
