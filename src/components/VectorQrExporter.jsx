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
    <div className={`border rounded-3xl p-4 sm:p-6 shadow-xl space-y-6 ${
      isDark ? 'bg-slate-900/90 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
    }`}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex-shrink-0">
            <FileArchive className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold">Bulk Vector QR Code Asset Exporter</h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Export resolution-independent vector SVG/PDF QR codes with Delegate IDs for invitation printers
            </p>
          </div>
        </div>

        <button
          onClick={downloadAllAsZip}
          disabled={vectorAssets.length === 0 || zipping}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex-shrink-0 transition-all"
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
        <div className="text-center py-12 text-xs text-slate-400">Generating vector SVG payloads for attendees...</div>
      ) : (
        /* Grid-Fitted Cards Layout */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {vectorAssets.map(asset => {
            const delegateIdStr = asset.delegateId || asset.id;
            return (
              <div key={asset.id} className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 transition-all ${
                isDark ? 'bg-slate-950 border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}>
                
                {/* Header Info */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold truncate pr-1">{asset.name}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-amber-500/20 text-amber-300 font-extrabold flex-shrink-0 flex items-center gap-0.5">
                      <Hash className="w-2.5 h-2.5" /> {delegateIdStr}
                    </span>
                  </div>
                  <div className="text-xs text-indigo-400 font-semibold truncate">{asset.company || asset.email}</div>
                  <div className="text-[11px] text-slate-400 truncate">{asset.tier}</div>
                </div>

                {/* Constrained SVG Container Box */}
                <div className="bg-white p-3 rounded-2xl w-full max-w-[180px] aspect-square mx-auto flex items-center justify-center border border-slate-300 shadow-inner overflow-hidden">
                  <div 
                    dangerouslySetInnerHTML={{ __html: asset.svgData }} 
                    className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:object-contain" 
                  />
                </div>

                {/* Delegate ID Banner under QR Code */}
                <div className="bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg text-center font-mono font-bold text-[11px] text-amber-400 truncate">
                  Delegate ID: {delegateIdStr}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/40 text-xs">
                  <button
                    onClick={() => downloadSingleSvgFile(asset)}
                    className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow"
                  >
                    <Download className="w-3.5 h-3.5" /> Download SVG
                  </button>

                  <button
                    onClick={() => copySvgText(asset)}
                    className={`p-2 rounded-xl border text-xs font-semibold ${
                      copiedId === asset.id ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500' : 'bg-slate-800 text-slate-300 border-slate-700'
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
