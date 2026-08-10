import React, { useState, useEffect, useRef } from 'react';
import { Camera, ShieldCheck, CheckCircle2, XCircle, AlertTriangle, RefreshCw, Lock, MapPin, Volume2, VolumeX } from 'lucide-react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { useTheme } from '../context/ThemeContext';

export default function ScannerInterface({ event, currentUser, onScanPayload }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [manualPayloadInput, setManualPayloadInput] = useState('');
  const scannerRef = useRef(null);

  const activeGateId = currentUser?.activeGate || 'gate_a';
  const gateObj = (event?.gates || []).find(g => g.id === activeGateId) || { id: activeGateId, name: 'Gate A - Main Entrance' };

  useEffect(() => {
    let html5QrCode;

    if (isScanning) {
      html5QrCode = new Html5Qrcode("reader");
      html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          handleScanSuccess(decodedText);
          html5QrCode.stop().catch(console.error);
          setIsScanning(false);
        },
        () => {}
      ).catch((err) => {
        console.error("Camera access error:", err);
      });
    }

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
    };
  }, [isScanning]);

  const handleScanSuccess = async (qrPayload) => {
    try {
      const res = await onScanPayload(qrPayload, activeGateId, currentUser?.name || 'Gate Attendant');
      setScanResult(res);
      if (soundEnabled) {
        playBeepSound(res.success);
      }
    } catch (err) {
      setScanResult({
        success: false,
        message: err.message,
        result: 'ERROR'
      });
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualPayloadInput.trim()) return;
    handleScanSuccess(manualPayloadInput.trim());
    setManualPayloadInput('');
  };

  const playBeepSound = (isSuccess) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (isSuccess) {
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else {
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 font-sans">
      
      {/* Scanner Station Header Card */}
      <div className={`p-6 rounded-3xl border shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        isDark ? 'bg-[#090d16] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-slate-200/50'
      }`}>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#01BD9B] animate-ping"></span>
            <h2 className="text-lg font-extrabold">{gateObj.name}</h2>
          </div>
          <p className={`text-xs flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            <Lock className="w-3.5 h-3.5 text-[#F7D06B]" />
            <span>Station Locked for Attendant: <strong>{currentUser?.name || 'David Miller'}</strong></span>
          </p>
        </div>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 ${
            soundEnabled 
              ? 'bg-[#01BD9B]/15 text-[#01BD9B] border-[#01BD9B]/30' 
              : isDark ? 'bg-[#222222] border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-300 text-slate-600'
          }`}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          <span>{soundEnabled ? 'Audio Beep Active' : 'Muted'}</span>
        </button>
      </div>

      {/* Camera Viewfinder & Scanner Frame */}
      <div className={`p-6 rounded-3xl border shadow-2xl space-y-6 text-center ${
        isDark ? 'bg-[#090d16] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-slate-200/50'
      }`}>
        <div className="space-y-2">
          <h3 className="text-base font-extrabold flex items-center justify-center gap-2">
            <Camera className="w-5 h-5 text-[#1698E1]" />
            <span>Smartphone QR Ticket Scanner</span>
          </h3>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Point your camera at the attendee's physical or digital QR code pass
          </p>
        </div>

        {/* Camera Video Viewfinder Element */}
        <div className={`relative min-h-[280px] rounded-2xl border flex flex-col items-center justify-center overflow-hidden ${
          isDark ? 'bg-[#030712] border-slate-800' : 'bg-slate-100 border-slate-300'
        }`}>
          <div id="reader" className="w-full max-w-sm"></div>

          {!isScanning && (
            <div className="p-8 space-y-4 text-center">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-[#1698E1]/15 border border-[#1698E1]/30 flex items-center justify-center text-[#1698E1]">
                <Camera className="w-10 h-10" />
              </div>
              <button
                onClick={() => setIsScanning(true)}
                className="px-6 py-3 rounded-2xl btn-brand-primary font-extrabold text-xs shadow-lg shadow-[#1698E1]/25 transition-all"
              >
                Launch Smartphone Camera Scanner
              </button>
            </div>
          )}
        </div>

        {/* Manual Payload Override Keypad */}
        <form onSubmit={handleManualSubmit} className="pt-2">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Paste or type raw QR payload string (e.g. GP1.evt_tech_2026...)"
              value={manualPayloadInput}
              onChange={(e) => setManualPayloadInput(e.target.value)}
              className={`flex-1 border rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-[#1698E1] ${
                isDark ? 'bg-[#030712] border-slate-800 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
              }`}
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl btn-brand-primary font-bold text-xs shadow"
            >
              Verify Code
            </button>
          </div>
        </form>
      </div>

      {/* Live Scan Verification Result Banner */}
      {scanResult && (
        <div className={`p-6 rounded-3xl border shadow-2xl space-y-4 animate-in fade-in duration-200 ${
          scanResult.success 
            ? 'bg-[#01BD9B]/15 border-[#01BD9B]/40 text-emerald-100'
            : 'bg-[#E55555]/15 border-[#E55555]/40 text-rose-100'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-2xl ${scanResult.success ? 'bg-[#01BD9B]/20 text-[#01BD9B]' : 'bg-[#E55555]/20 text-[#E55555]'}`}>
              {scanResult.success ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
            </div>

            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest block opacity-80">VERIFICATION RESULT</span>
              <h3 className="text-xl font-extrabold">{scanResult.message}</h3>
            </div>
          </div>

          {scanResult.attendee && (
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Attendee Name:</span>
                <span className="font-extrabold text-white text-sm">{scanResult.attendee.name}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Delegate ID:</span>
                <span className="font-mono font-extrabold text-[#F7D06B]">{scanResult.attendee.delegateId || scanResult.attendee.id}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Ticket Tier:</span>
                <span className="font-bold text-[#58BAD7]">{scanResult.attendee.tier}</span>
              </div>

              {scanResult.attendee.company && (
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Company:</span>
                  <span className="font-bold text-slate-200">{scanResult.attendee.company}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
