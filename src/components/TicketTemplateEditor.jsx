import React, { useState, useEffect } from 'react';
import { Palette, Eye, Save, Sparkles, CheckCircle2, Shield, Upload, Layers, Image as ImageIcon, X, Sliders, Lock, Unlock } from 'lucide-react';
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
    useCustomArtwork: false,
    passFields: {
      name: { x: 5, y: 70, fontSize: 22, color: '#ffffff', enabled: true },
      delegateId: { x: 5, y: 82, fontSize: 16, color: '#f59e0b', enabled: true },
      company: { x: 5, y: 76, fontSize: 15, color: '#38bdf8', enabled: true },
      tier: { x: 5, y: 12, fontSize: 13, color: '#ffffff', enabled: true },
      qrCode: { x: 70, y: 55, width: 24, height: 24, lockAspect: true, enabled: true }
    },
    tierColors: {
      'VIP Access': '#d97706',        // Amber / Gold
      'General Admission': '#4f46e5', // Indigo
      'Speaker': '#059669',           // Emerald
      'Press / Media': '#9333ea'      // Purple
    },
    footerNote: 'Present this pass at designated gate. Non-transferable once checked in.'
  });

  const [selectedField, setSelectedField] = useState('name');
  const [activeTierPreview, setActiveTierPreview] = useState('VIP Access');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [artworkAspectRatio, setArtworkAspectRatio] = useState(16 / 9);

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
        useCustomArtwork: template.useCustomArtwork || false,
        passFields: template.passFields || {
          name: { x: 5, y: 70, fontSize: 22, color: '#ffffff', enabled: true },
          delegateId: { x: 5, y: 82, fontSize: 16, color: '#f59e0b', enabled: true },
          company: { x: 5, y: 76, fontSize: 15, color: '#38bdf8', enabled: true },
          tier: { x: 5, y: 12, fontSize: 13, color: '#ffffff', enabled: true },
          qrCode: { x: 70, y: 55, width: 24, height: 24, lockAspect: true, enabled: true }
        },
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

  const handlePassFieldChange = (fieldKey, prop, val) => {
    const currentPassFields = formData.passFields || {};
    const currentQr = currentPassFields.qrCode || {};

    if (fieldKey === 'qrCode') {
      if ((prop === 'width' || prop === 'height') && currentQr.lockAspect) {
        setFormData({
          ...formData,
          passFields: {
            ...currentPassFields,
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

    setFormData({
      ...formData,
      passFields: {
        ...currentPassFields,
        [fieldKey]: {
          ...currentPassFields[fieldKey],
          [prop]: val
        }
      }
    });
  };

  const toggleQrAspectLock = () => {
    const currentQr = formData.passFields?.qrCode || {};
    const nextLock = !currentQr.lockAspect;
    setFormData({
      ...formData,
      passFields: {
        ...formData.passFields,
        qrCode: {
          ...currentQr,
          lockAspect: nextLock,
          height: nextLock ? currentQr.width : currentQr.height
        }
      }
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setFormData({ 
          ...formData, 
          cardImageUrl: evt.target.result,
          useCustomArtwork: true 
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    if (naturalWidth && naturalHeight) {
      setArtworkAspectRatio(naturalWidth / naturalHeight);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const currentHeaderColor = formData.tierColors[activeTierPreview] || formData.bannerBgColor;
  const currentFieldConfig = (formData.passFields && formData.passFields[selectedField]) || {};

  return (
    <div className={`border rounded-3xl p-4 sm:p-6 shadow-xl space-y-6 ${
      isDark ? 'bg-slate-900/90 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
    }`}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-[#1698E1]/20 text-[#1698E1] border border-[#1698E1]/30">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold">Digital Ticket Pass & Movable Field Studio</h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Upload custom artwork design and position Name, Delegate ID, Company, Tier & QR Code fields
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="px-5 py-2.5 rounded-xl bg-[#1698E1] hover:bg-[#1D69D6] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-all"
        >
          {saveSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{saveSuccess ? 'Pass Styles Saved!' : 'Save Pass Design'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Controls Panel (2 Cols) */}
        <div className="lg:col-span-2 space-y-6 text-xs">
          
          {/* Custom Design Background Upload */}
          <div className={`p-4 rounded-2xl border space-y-3 ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-[#1698E1] flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4" /> Custom Pass Design Artwork
              </span>
              {formData.cardImageUrl && (
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.useCustomArtwork}
                    onChange={(e) => setFormData({ ...formData, useCustomArtwork: e.target.checked })}
                    className="w-4 h-4 accent-[#1698E1] rounded"
                  />
                  <span className="font-bold text-slate-200">Use Custom Artwork Mode</span>
                </label>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <label className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#1698E1] hover:bg-[#1D69D6] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow">
                <Upload className="w-4 h-4" />
                <span>{formData.cardImageUrl ? 'Replace Custom Pass Artwork' : 'Upload Custom Pass Background Design'}</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>

              {formData.cardImageUrl && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, cardImageUrl: '', useCustomArtwork: false })}
                  className="text-[#E55555] hover:text-red-400 font-semibold flex items-center gap-1"
                >
                  <X className="w-4 h-4" /> Remove Artwork
                </button>
              )}
            </div>
          </div>

          {/* Movable Field Overlay Controls (Active when Custom Artwork Mode Enabled) */}
          {formData.useCustomArtwork && formData.cardImageUrl && (
            <div className={`p-4 rounded-2xl border space-y-4 ${
              isDark ? 'bg-slate-950 border-amber-500/30' : 'bg-amber-50/60 border-amber-200'
            }`}>
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-amber-500 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4" /> Movable Field Positioning Controls
                </span>
                <span className="text-[11px] text-slate-400">Position fields on artwork background</span>
              </div>

              {/* Select Target Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Select Field to Position:</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 font-semibold">
                  {[
                    { key: 'name', label: '👤 Name' },
                    { key: 'delegateId', label: '🆔 Delegate ID' },
                    { key: 'company', label: '🏢 Company' },
                    { key: 'tier', label: '🏷️ Tier' },
                    { key: 'qrCode', label: '📱 QR Code' }
                  ].map(f => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setSelectedField(f.key)}
                      className={`py-2 px-2 rounded-xl border text-center transition-all ${
                        selectedField === f.key
                          ? 'bg-[#1698E1] text-white border-[#1698E1] font-bold'
                          : isDark ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200' : 'bg-white border-slate-300 text-slate-700'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sliders for Selected Field */}
              {selectedField && (
                <div className="space-y-3 pt-2 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span>Horizontal (X %):</span>
                        <span className="font-mono text-[#1698E1]">{currentFieldConfig.x || 0}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="85"
                        value={currentFieldConfig.x || 0}
                        onChange={(e) => handlePassFieldChange(selectedField, 'x', parseInt(e.target.value, 10))}
                        className="w-full accent-[#1698E1]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span>Vertical (Y %):</span>
                        <span className="font-mono text-[#1698E1]">{currentFieldConfig.y || 0}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="85"
                        value={currentFieldConfig.y || 0}
                        onChange={(e) => handlePassFieldChange(selectedField, 'y', parseInt(e.target.value, 10))}
                        className="w-full accent-[#1698E1]"
                      />
                    </div>
                  </div>

                  {selectedField !== 'qrCode' ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="flex justify-between font-semibold mb-1">
                          <span>Font Size:</span>
                          <span className="font-mono text-[#1698E1]">{currentFieldConfig.fontSize || 16}px</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="48"
                          value={currentFieldConfig.fontSize || 16}
                          onChange={(e) => handlePassFieldChange(selectedField, 'fontSize', parseInt(e.target.value, 10))}
                          className="w-full accent-[#1698E1]"
                        />
                      </div>

                      <div>
                        <span className="font-semibold block mb-1">Text Color:</span>
                        <input
                          type="color"
                          value={currentFieldConfig.color || '#ffffff'}
                          onChange={(e) => handlePassFieldChange(selectedField, 'color', e.target.value)}
                          className="w-full h-8 rounded-lg cursor-pointer bg-slate-900 border border-slate-700"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#F7D06B] flex items-center gap-1">
                          {currentFieldConfig.lockAspect ? <Lock className="w-3.5 h-3.5 text-[#01BD9B]" /> : <Unlock className="w-3.5 h-3.5 text-[#E55555]" />}
                          <span>Lock Aspect Ratio (1:1)</span>
                        </span>
                        <button
                          type="button"
                          onClick={toggleQrAspectLock}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            currentFieldConfig.lockAspect ? 'bg-[#01BD9B]/20 text-[#01BD9B] border-[#01BD9B]' : 'bg-[#E55555]/20 text-[#E55555] border-[#E55555]'
                          }`}
                        >
                          {currentFieldConfig.lockAspect ? 'Square 1:1' : 'Custom W/H'}
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="flex justify-between font-semibold mb-1">
                            <span>Width (%):</span>
                            <span className="font-mono text-[#1698E1]">{currentFieldConfig.width || 20}%</span>
                          </div>
                          <input
                            type="range"
                            min="8"
                            max="60"
                            value={currentFieldConfig.width || 20}
                            onChange={(e) => handlePassFieldChange('qrCode', 'width', parseInt(e.target.value, 10))}
                            className="w-full accent-[#1698E1]"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between font-semibold mb-1">
                            <span>Height (%):</span>
                            <span className="font-mono text-[#1698E1]">{currentFieldConfig.height || 20}%</span>
                          </div>
                          <input
                            type="range"
                            min="8"
                            max="60"
                            disabled={currentFieldConfig.lockAspect}
                            value={currentFieldConfig.height || 20}
                            onChange={(e) => handlePassFieldChange('qrCode', 'height', parseInt(e.target.value, 10))}
                            className="w-full accent-[#1698E1] disabled:opacity-40"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          )}

          {/* Access Level Tier Color Customizer */}
          <div className={`p-4 rounded-2xl border space-y-3 ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-[#F7D06B] flex items-center gap-1.5">
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
                        activeTierPreview === tier ? 'bg-[#1698E1] text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
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
                className={`w-full rounded-xl px-3 py-2 border focus:outline-none focus:border-[#1698E1] ${
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

        </div>

        {/* Live Interactive Card Preview (1 Col) */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-[#1698E1]" /> Live Pass Preview ({activeTierPreview})
          </span>

          <div 
            style={{ 
              backgroundColor: formData.cardBgColor,
              aspectRatio: formData.useCustomArtwork && formData.cardImageUrl ? `${artworkAspectRatio}` : 'auto'
            }}
            className="relative rounded-3xl border border-slate-700 shadow-2xl overflow-hidden text-white transition-all"
          >
            {/* Custom Artwork Mode with Movable Overlays */}
            {formData.useCustomArtwork && formData.cardImageUrl ? (
              <div className="relative w-full h-full min-h-[280px]">
                <img 
                  src={formData.cardImageUrl} 
                  alt="Custom Pass Artwork" 
                  onLoad={handleImageLoad}
                  className="w-full h-full object-cover" 
                />

                {/* Movable Name Overlay */}
                {formData.passFields?.name?.enabled && (
                  <div
                    style={{
                      left: `${formData.passFields.name.x}%`,
                      top: `${formData.passFields.name.y}%`,
                      fontSize: `${formData.passFields.name.fontSize}px`,
                      color: formData.passFields.name.color
                    }}
                    onClick={() => setSelectedField('name')}
                    className={`absolute cursor-pointer font-extrabold transition-all px-1.5 py-0.5 rounded border whitespace-nowrap ${
                      selectedField === 'name' ? 'border-[#F7D06B] bg-[#F7D06B]/30 ring-2 ring-[#F7D06B]' : 'border-transparent hover:border-white/40'
                    }`}
                  >
                    Sophia Chen
                  </div>
                )}

                {/* Movable Delegate ID Overlay */}
                {formData.passFields?.delegateId?.enabled && (
                  <div
                    style={{
                      left: `${formData.passFields.delegateId.x}%`,
                      top: `${formData.passFields.delegateId.y}%`,
                      fontSize: `${formData.passFields.delegateId.fontSize}px`,
                      color: formData.passFields.delegateId.color
                    }}
                    onClick={() => setSelectedField('delegateId')}
                    className={`absolute cursor-pointer font-mono font-extrabold transition-all px-1.5 py-0.5 rounded border whitespace-nowrap ${
                      selectedField === 'delegateId' ? 'border-[#F7D06B] bg-[#F7D06B]/30 ring-2 ring-[#F7D06B]' : 'border-transparent hover:border-amber-400/40'
                    }`}
                  >
                    ATS-2026-0002
                  </div>
                )}

                {/* Movable Company Overlay */}
                {formData.passFields?.company?.enabled && (
                  <div
                    style={{
                      left: `${formData.passFields.company.x}%`,
                      top: `${formData.passFields.company.y}%`,
                      fontSize: `${formData.passFields.company.fontSize}px`,
                      color: formData.passFields.company.color
                    }}
                    onClick={() => setSelectedField('company')}
                    className={`absolute cursor-pointer font-semibold transition-all px-1.5 py-0.5 rounded border whitespace-nowrap ${
                      selectedField === 'company' ? 'border-[#F7D06B] bg-[#F7D06B]/30 ring-2 ring-[#F7D06B]' : 'border-transparent hover:border-white/40'
                    }`}
                  >
                    Nexus AI Labs
                  </div>
                )}

                {/* Movable Tier Overlay */}
                {formData.passFields?.tier?.enabled && (
                  <div
                    style={{
                      left: `${formData.passFields.tier.x}%`,
                      top: `${formData.passFields.tier.y}%`,
                      fontSize: `${formData.passFields.tier.fontSize}px`,
                      color: formData.passFields.tier.color
                    }}
                    onClick={() => setSelectedField('tier')}
                    className={`absolute cursor-pointer font-bold transition-all px-1.5 py-0.5 rounded border whitespace-nowrap ${
                      selectedField === 'tier' ? 'border-[#F7D06B] bg-[#F7D06B]/30 ring-2 ring-[#F7D06B]' : 'border-transparent hover:border-white/40'
                    }`}
                  >
                    {activeTierPreview}
                  </div>
                )}

                {/* Movable QR Code Overlay */}
                {formData.passFields?.qrCode?.enabled && (
                  <div
                    style={{
                      left: `${formData.passFields.qrCode.x}%`,
                      top: `${formData.passFields.qrCode.y}%`,
                      width: `${formData.passFields.qrCode.width}%`,
                      height: `${formData.passFields.qrCode.height}%`
                    }}
                    onClick={() => setSelectedField('qrCode')}
                    className={`absolute cursor-pointer bg-white p-1.5 rounded-xl shadow-2xl border flex items-center justify-center ${
                      selectedField === 'qrCode' ? 'border-[#F7D06B] ring-4 ring-[#F7D06B]/40' : 'border-slate-300'
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
            ) : (
              /* Standard Executive Mode */
              <>
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

                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">ATTENDEE DELEGATE</span>
                      <h3 className="text-lg font-extrabold text-white">Sophia Chen</h3>
                      {formData.showCompany && (
                        <div className="text-xs text-[#58BAD7] font-bold">Nexus AI Labs</div>
                      )}
                    </div>

                    {formData.showDelegateId && (
                      <div className="bg-[#F7D06B]/15 border border-[#F7D06B]/30 px-2.5 py-1 rounded-xl text-center">
                        <span className="text-[8px] uppercase tracking-wider text-[#F7D06B] font-bold block">DELEGATE ID</span>
                        <span className="text-xs font-mono font-extrabold text-[#F7D06B]">ATS-2026-0002</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex flex-col items-center justify-center space-y-2">
                    <div className="bg-white p-2.5 rounded-xl shadow-xl">
                      <img 
                        src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=GP1.DEMO" 
                        alt="QR Code" 
                        className="w-32 h-32 object-contain"
                      />
                    </div>
                    <span className="text-[10px] font-mono text-[#F7D06B] font-bold">ATS-2026-0002</span>
                  </div>

                  <div className="text-[9px] text-slate-400 text-center border-t border-slate-800/60 pt-2">
                    {formData.footerNote}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
