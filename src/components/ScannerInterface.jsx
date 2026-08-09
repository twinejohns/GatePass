import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  Camera, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RotateCcw, 
  Search, 
  Users, 
  Zap,
  Clock,
  MapPin,
  Sparkles,
  Lock
} from 'lucide-react';
import { soundEngine } from '../services/audioFeedback';
import confetti from 'canvas-confetti';

export default function ScannerInterface({ 
  event, 
  currentUser, 
  onScanPayload, 
  users,
  attendees,
  onManualCheckIn
}) {
  // Gate station is locked to the Gate Attendant's manager-allocated activeGate
  const allocatedGateId = currentUser?.activeGate || 'gate_a';
  const gateObj = (event?.gates || []).find(g => g.id === allocatedGateId) || { name: 'Main Entrance Gate' };

  const [isScanning, setIsScanning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [personalScanCount, setPersonalScanCount] = useState(0);
  const [manualQuery, setManualQuery] = useState('');
  const [showManualModal, setShowManualModal] = useState(false);

  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    Html5Qrcode.getCameras()
      .then(devices => {
        if (devices && devices.length > 0) {
          setCameras(devices);
          const backCam = devices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('environment'));
          setSelectedCameraId(backCam ? backCam.id : devices[0].id);
        }
      })
      .catch(err => console.warn('Camera lookup notice:', err));

    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    if (!selectedCameraId) return;
    try {
      if (html5QrCodeRef.current) {
        await stopCamera();
      }

      const html5QrCode = new Html5Qrcode('qr-reader-container');
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        selectedCameraId,
        {
          fps: 10,
          qrbox: { width: 260, height: 260 },
          aspectRatio: 1.0
        },
        (decodedText) => {
          handleDecodedText(decodedText);
        },
        () => {
          // ignore frame errors
        }
      );
      setIsScanning(true);
    } catch (err) {
      console.error('Failed to start camera:', err);
      setIsScanning(false);
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.warn('Stop camera notice:', err);
      }
    }
    setIsScanning(false);
  };

  const handleDecodedText = async (payload) => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.pause(true);
      } catch (err) {
        console.warn(err);
      }
    }

    try {
      // Always pass the Manager-Allocated Gate ID
      const result = await onScanPayload(payload, allocatedGateId, currentUser?.name);
      setScanResult(result);

      if (result.result === 'VALID_CHECKIN') {
        soundEngine.playSuccess();
        setPersonalScanCount(prev => prev + 1);
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      } else if (result.result === 'TEST_SCAN_OK') {
        soundEngine.playTestChime();
      } else {
        soundEngine.playError();
      }
    } catch (err) {
      soundEngine.playError();
      setScanResult({
        success: false,
        result: 'ERROR',
        error: err.message || 'Verification failed'
      });
    }

    setTimeout(() => {
      setScanResult(null);
      if (html5QrCodeRef.current) {
        try {
          html5QrCodeRef.current.resume();
        } catch (err) {
          console.warn(err);
        }
      }
    }, 2800);
  };

  const filteredAttendees = (attendees || []).filter(a => {
    const q = manualQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      a.name.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      (a.company && a.company.toLowerCase().includes(q)) ||
      (a.phone && a.phone.toLowerCase().includes(q)) ||
      a.id.toLowerCase().includes(q)
    );
  }).slice(0, 10);

  const handleManualScanClick = (attendee) => {
    const fakeQrPayload = `GP1.${attendee.eventId}.${attendee.id}.${attendee.qrVersion}.MANUAL_KEY.PAYLOAD`;
    handleDecodedText(fakeQrPayload);
    setShowManualModal(false);
  };

  const activeAttendants = (users || []).filter(u => u.role === 'Gate Attendant');

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Top Gate Allocation & Attendant Info Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Manager-Allocated Gate Station Badge (Locked for Gate Attendants) */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                <Lock className="w-3 h-3 text-amber-400" /> Manager-Assigned Station
              </div>
              <div className="text-sm font-extrabold text-white mt-0.5">{gateObj.name}</div>
            </div>
          </div>
        </div>

        {/* Personal Scan Counter */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Personal Scans Today</div>
              <div className="text-xl font-extrabold text-white">{personalScanCount} <span className="text-xs font-normal text-slate-400">checked-in</span></div>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 font-semibold">
            {currentUser?.name}
          </span>
        </div>

        {/* Audio & Manual Search Controls */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
          <button
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              soundEngine.toggleSound(next);
            }}
            className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-semibold transition-all ${
              soundEnabled 
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' 
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            <span>{soundEnabled ? 'Audio On' : 'Muted'}</span>
          </button>

          <button
            onClick={() => setShowManualModal(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Search className="w-4 h-4" />
            <span>Manual Search</span>
          </button>
        </div>

      </div>

      {/* Main Camera Viewfinder Card */}
      <div className="relative bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden">
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Smartphone Camera Scanner</h2>
          </div>

          {cameras.length > 1 && (
            <select
              value={selectedCameraId}
              onChange={(e) => {
                setSelectedCameraId(e.target.value);
                if (isScanning) startCamera();
              }}
              className="bg-slate-800 text-xs text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg focus:outline-none cursor-pointer"
            >
              {cameras.map(c => (
                <option key={c.id} value={c.id}>
                  📷 {c.label || `Camera ${c.id.substring(0, 5)}`}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Viewfinder Container */}
        <div className="relative min-h-[340px] max-w-md mx-auto bg-slate-950 rounded-2xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center overflow-hidden">
          
          <div id="qr-reader-container" className="w-full h-full"></div>

          {!isScanning && (
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
                <Camera className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Camera Viewfinder Ready</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Scanning active for <strong className="text-indigo-400">{gateObj.name}</strong>
                </p>
              </div>
              <button
                onClick={startCamera}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold text-sm shadow-xl shadow-indigo-500/20 hover:scale-105 transition-all"
              >
                Activate Live Camera
              </button>
            </div>
          )}

          {isScanning && !scanResult && (
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-laser pointer-events-none shadow-lg shadow-cyan-400/50"></div>
          )}

          {/* Instant Scan Result Feedback Modal Overlay */}
          {scanResult && (
            <div className={`absolute inset-0 z-30 p-6 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-200 ${
              scanResult.result === 'VALID_CHECKIN' ? 'bg-emerald-950/95 border-4 border-emerald-500' :
              scanResult.result === 'TEST_SCAN_OK' ? 'bg-purple-950/95 border-4 border-purple-500' :
              scanResult.result === 'DUPLICATE_BLOCKED' ? 'bg-rose-950/95 border-4 border-rose-600 animate-flash-red' :
              'bg-amber-950/95 border-4 border-amber-500'
            }`}>
              
              <div className="mb-3">
                {scanResult.result === 'VALID_CHECKIN' && (
                  <CheckCircle2 className="w-16 h-16 text-emerald-400 animate-bounce" />
                )}
                {scanResult.result === 'TEST_SCAN_OK' && (
                  <Sparkles className="w-16 h-16 text-purple-400 animate-pulse" />
                )}
                {scanResult.result === 'DUPLICATE_BLOCKED' && (
                  <XCircle className="w-16 h-16 text-rose-500 animate-pulse" />
                )}
                {['TAMPERED_CODE', 'REVOKED_CODE_REISSUED', 'EXPIRED_EVENT'].includes(scanResult.result) && (
                  <AlertTriangle className="w-16 h-16 text-amber-400" />
                )}
              </div>

              <h3 className={`text-xl font-extrabold tracking-wide uppercase ${
                scanResult.result === 'VALID_CHECKIN' ? 'text-emerald-300' :
                scanResult.result === 'TEST_SCAN_OK' ? 'text-purple-300' :
                scanResult.result === 'DUPLICATE_BLOCKED' ? 'text-rose-400' :
                'text-amber-300'
              }`}>
                {scanResult.result === 'VALID_CHECKIN' && '✅ ACCESS GRANTED'}
                {scanResult.result === 'TEST_SCAN_OK' && '🧪 TEST SCAN SUCCESSFUL'}
                {scanResult.result === 'DUPLICATE_BLOCKED' && '⛔ DUPLICATE SCAN BLOCKED'}
                {scanResult.result === 'REVOKED_CODE_REISSUED' && '⚠️ REVOKED PASS'}
                {scanResult.result === 'TAMPERED_CODE' && '🚨 TAMPERED QR CODE'}
                {scanResult.result === 'EXPIRED_EVENT' && '🔴 EVENT CLOSED'}
              </h3>

              {scanResult.attendee && (
                <div className="mt-2 space-y-1 bg-slate-900/80 px-4 py-3 rounded-xl border border-slate-700/80 w-full max-w-xs">
                  <div className="text-lg font-bold text-white">{scanResult.attendee.name}</div>
                  <div className="text-xs font-semibold text-cyan-300">{scanResult.attendee.company || scanResult.attendee.email}</div>
                  <div className="text-[11px] text-slate-400">{scanResult.attendee.tier}</div>
                </div>
              )}

              {scanResult.result === 'DUPLICATE_BLOCKED' && scanResult.originalCheckIn && (
                <div className="mt-3 text-xs text-rose-200 bg-rose-900/50 p-3 rounded-xl border border-rose-700 max-w-xs text-left space-y-1">
                  <div className="font-bold flex items-center gap-1 text-rose-300">
                    <Clock className="w-3.5 h-3.5" /> Checked-in earlier at:
                  </div>
                  <div>• Time: {new Date(scanResult.originalCheckIn.timestamp).toLocaleTimeString()}</div>
                  <div>• Attendant: {scanResult.originalCheckIn.attendant || 'Gate Staff'}</div>
                </div>
              )}

              <p className="text-xs text-slate-300 mt-3 font-medium px-4">
                {scanResult.message || scanResult.error}
              </p>
            </div>
          )}

        </div>

        {/* Viewfinder Footer */}
        <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Allocated Station: <strong className="text-white">{gateObj.name}</strong></span>
          </div>
          {isScanning && (
            <button
              onClick={stopCamera}
              className="text-rose-400 hover:text-rose-300 font-semibold"
            >
              Stop Camera
            </button>
          )}
        </div>

      </div>

      {/* Gate Staff Roster */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center space-x-2 mb-3">
          <Users className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">Active Gate Staff Roster</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {activeAttendants.map(att => {
            const isSelf = att.id === currentUser?.id;
            const gateName = (event?.gates || []).find(g => g.id === att.activeGate)?.name || 'Unassigned Gate';
            return (
              <div key={att.id} className="flex items-center space-x-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <img src={att.avatar} alt={att.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/30" />
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="truncate">{att.name}</span>
                    {isSelf && <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1 rounded">You</span>}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-indigo-400" />
                    <span>{gateName}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Manual Search Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Search className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white">Manual Attendee Lookup</h3>
              </div>
              <button
                onClick={() => setShowManualModal(false)}
                className="text-slate-400 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                value={manualQuery}
                onChange={(e) => setManualQuery(e.target.value)}
                placeholder="Search attendee by name, email, company, phone..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                autoFocus
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {filteredAttendees.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">No attendees found matching search criteria.</div>
              ) : (
                filteredAttendees.map(att => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800 hover:border-indigo-500/50 transition-all"
                  >
                    <div>
                      <div className="text-sm font-bold text-white">{att.name}</div>
                      <div className="text-xs text-slate-400">{att.email} • {att.company}</div>
                      <div className="text-[11px] text-indigo-400 font-medium">{att.tier}</div>
                    </div>

                    {att.status === 'CHECKED_IN' ? (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 font-medium">
                        Already Checked In
                      </span>
                    ) : (
                      <button
                        onClick={() => handleManualScanClick(att)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
                      >
                        Check In Now
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
