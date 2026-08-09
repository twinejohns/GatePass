import React, { useState, useEffect } from 'react';
import { Download, FileCode, CheckCircle2, Sparkles, Printer, Copy, Check } from 'lucide-react';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function VectorQrExporter({ eventId }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [vectorAssets, setVectorAssets] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const downloadSvgFile = (asset) => {
    const blob = new Blob([asset.svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${asset.name.replace(/\s+/g, '_')}_Vector_QR.svg`;
    link.click();
  };

  const copySvgText = (asset) => {
    navigator.clipboard.writeText(asset.svgData);
    setCopiedId(asset.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadAllSvgZip = () => {
    // Trigger batch download for each asset
    vectorAssets.forEach((asset, idx) => {
      setTimeout(() => downloadSvgFile(asset), idx * 200);
    });
  };

  return (
    <div className={`border rounded-3xl p-6 shadow-xl space-y-6 ${
      isDark ? 'bg-slate-900/90 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
    }`}>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold">Bulk Vector QR Code Exporter</h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Export resolution-independent vector SVG/PDF QR codes for external printing on physical invitation cards
            </p>
          </div>
        </div>

        <button
          onClick={downloadAllSvgZip}
          disabled={vectorAssets.length === 0}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
        >
          <Printer className="w-4 h-4" />
          <span>Export All {vectorAssets.length} Vector SVG Assets</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-xs text-slate-400">Generating vector SVG payloads for attendees...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vectorAssets.map(asset => (
            <div key={asset.id} className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-bold">{asset.name}</div>
                  <div className="text-xs text-indigo-400 font-semibold">{asset.company || asset.email}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{asset.tier}</div>
                </div>
                
                <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-blue-500/20 text-blue-300 font-semibold">
                  VECTOR SVG
                </span>
              </div>

              {/* SVG Preview Box */}
              <div className="bg-white p-3 rounded-xl w-36 h-36 mx-auto flex items-center justify-center border border-slate-300 shadow-inner">
                <div dangerouslySetInnerHTML={{ __html: asset.svgData }} className="w-full h-full" />
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/40 text-xs">
                <button
                  onClick={() => downloadSvgFile(asset)}
                  className="flex-1 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] flex items-center justify-center gap-1 shadow"
                >
                  <Download className="w-3.5 h-3.5" /> Download SVG
                </button>

                <button
                  onClick={() => copySvgText(asset)}
                  className={`p-1.5 rounded-lg border text-xs font-semibold ${
                    copiedId === asset.id ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500' : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                  title="Copy Raw SVG XML Code"
                >
                  {copiedId === asset.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
