import React, { useState, useEffect } from 'react';
import { Download, FileCode, CheckCircle2, Sparkles, Printer, Copy, Check, QrCode, FileArchive, Loader2, Hash } from 'lucide-react';
import JSZip from 'jszip';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function VectorQrExporter({ eventId }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [vectorAssets, setVectorAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zipping, setZipping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    loadVectorAssets();
  }, [eventId]);

  const loadVectorAssets = async () => {
    if (!eventId) return;
    setLoading(true);
    try {
      const res = await api.exportVectorQrs(eventId);
      if (res.success) {
        setVectorAssets(res.vectorAssets);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const downloadSingleSvgFile = (asset) => {
    const delegateIdStr = asset.delegateId || asset.id;
    const blob = new Blob([asset.svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${delegateIdStr}_${asset.name.replace(/\s+/g, '_')}_Vector_QR.svg`;
    link.click();
  };

  const copySvgText = (asset) => {
    navigator.clipboard.writeText(asset.svgData);
    setCopiedId(asset.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadAllAsZip = async () => {
    if (vectorAssets.length === 0) return;
    setZipping(true);

    try {
      const zip = new JSZip();
      const folder = zip.folder("GatePass_Vector_QR_Codes");

      vectorAssets.forEach((asset) => {
        const delegateIdStr = asset.delegateId || asset.id;
        const sanitizedName = asset.name.replace(/[^a-zA-Z0-9_-]/g, '_');
        const filename = `${delegateIdStr}_${sanitizedName}_${asset.tier.replace(/[^a-zA-Z0-9_-]/g, '_')}.svg`;
        folder.file(filename, asset.svgData);
      });

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `GatePass_Vector_QR_Codes_${eventId || 'export'}.zip`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to generate ZIP archive: ' + err.message);
    }

    setZipping(false);
  };

  return (
    <div className={`border rounded-3xl p-4 sm:p-6 shadow-xl space-y-6 font-sans transition-colors duration-300 ${
      isDark ? 'bg-[#090d16] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-slate-200/50'
    }`}>
      
      {/* Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${
        isDark ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-[#1698E1]/15 text-[#1698E1] border border-[#1698E1]/30 flex-shrink-0">
            <FileArchive className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold">Bulk Vector QR Code Asset Exporter</h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Export resolution-independent vector SVG QR codes with Delegate IDs for invitation printers
            </p>
          </div>
        </div>

        <button
          onClick={downloadAllAsZip}
          disabled={vectorAssets.length === 0 || zipping}
          className="px-4 py-2.5 rounded-xl btn-brand-primary font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#1698E1]/25 disabled:opacity-50 flex-shrink-0 transition-all"
        >
          {zipping ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Building ZIP Bundle...</span>
            </>
          ) : (
            <>
              <FileArchive className="w-4 h-4" />
              <span>Download ZIP Archive ({vectorAssets.length} SVGs)</span>
            </>
          )}
        </button>
      </div>

      {loading ? (
        <div className={`text-center py-12 text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Generating high-resolution vector SVG payloads for attendees...
        </div>
      ) : (
        /* High-Visibility Grid-Fitted Cards Layout */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {vectorAssets.map(asset => {
            const delegateIdStr = asset.delegateId || asset.id;
            return (
              <div key={asset.id} className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 transition-all ${
                isDark 
                  ? 'bg-[#030712] border-slate-800 hover:border-slate-700' 
                  : 'bg-white border-slate-300 shadow-md hover:shadow-xl hover:border-[#1698E1]'
              }`}>
                
                {/* Header Info */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold truncate pr-1">{asset.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-extrabold flex-shrink-0 flex items-center gap-0.5 border ${
                      isDark 
                        ? 'bg-[#F7D06B]/20 text-[#F7D06B] border-[#F7D06B]/40' 
                        : 'bg-[#1698E1]/15 text-[#1D69D6] border-[#1698E1]/30'
                    }`}>
                      <Hash className="w-2.5 h-2.5" /> {delegateIdStr}
                    </span>
                  </div>
                  <div className="text-xs text-[#1698E1] font-bold truncate">{asset.company || asset.email}</div>
                  <div className={`text-[11px] font-medium truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{asset.tier}</div>
                </div>

                {/* Constrained High-Contrast White SVG Container Box */}
                <div className="bg-white p-3.5 rounded-2xl w-full max-w-[190px] aspect-square mx-auto flex items-center justify-center border border-slate-300 shadow-md overflow-hidden">
                  <div 
                    dangerouslySetInnerHTML={{ __html: asset.svgData }} 
                    className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:object-contain" 
                  />
                </div>

                {/* Delegate ID Banner under QR Code */}
                <div className={`px-2.5 py-1 rounded-xl text-center font-mono font-extrabold text-[11px] truncate border ${
                  isDark 
                    ? 'bg-[#222222] border-slate-800 text-[#F7D06B]' 
                    : 'bg-slate-100 border-slate-300 text-[#1D69D6]'
                }`}>
                  Delegate ID: {delegateIdStr}
                </div>

                {/* Action Buttons */}
                <div className={`flex items-center gap-2 pt-2 border-t text-xs ${
                  isDark ? 'border-slate-800' : 'border-slate-200'
                }`}>
                  <button
                    onClick={() => downloadSingleSvgFile(asset)}
                    className="flex-1 py-2 rounded-xl btn-brand-primary font-bold text-xs flex items-center justify-center gap-1 shadow transition-all"
                  >
                    <Download className="w-3.5 h-3.5" /> SVG
                  </button>

                  <button
                    onClick={() => copySvgText(asset)}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      copiedId === asset.id 
                        ? 'bg-[#01BD9B]/20 text-[#01BD9B] border-[#01BD9B]' 
                        : isDark ? 'bg-[#222222] text-slate-300 border-slate-700 hover:text-white' : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                    }`}
                    title="Copy Raw SVG XML Code"
                  >
                    {copiedId === asset.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
