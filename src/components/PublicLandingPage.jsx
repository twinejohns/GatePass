import React, { useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  QrCode, 
  Search, 
  LogIn, 
  CheckCircle2, 
  Sparkles,
  Ticket,
  Building2,
  Lock,
  ArrowRight,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function PublicLandingPage({ event, onGoToLogin, onLookupPass }) {
  const { theme, toggleTheme } = useTheme();
  const [lookupEmail, setLookupEmail] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!lookupEmail.trim()) return;
    setErrorMsg('');
    try {
      const passData = await onLookupPass(lookupEmail.trim());
      if (passData) {
        setLookupResult(passData);
      } else {
        setErrorMsg('No active ticket pass found for this email address.');
        setLookupResult(null);
      }
    } catch (err) {
      setErrorMsg('Lookup failed: ' + err.message);
      setLookupResult(null);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Navigation Header */}
      <nav className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight">GatePass</span>
              <span className="text-[10px] ml-2 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-mono">
                SECURE QR TICKETING
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition-all ${
                isDark ? 'bg-slate-800 text-amber-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-300'
              }`}
              title="Toggle Light / Dark Theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Staff Login Button */}
            <button
              onClick={onGoToLogin}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Staff Login Portal</span>
            </button>
          </div>

        </div>
      </nav>

      {/* Hero Banner Section */}
      <section className="relative overflow-hidden py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-6">
        
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Official Digital Event Pass Verification Portal</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-3xl mx-auto leading-tight">
          {event?.name || 'Global Tech Innovation Summit 2026'}
        </h1>

        <p className={`text-base sm:text-lg max-w-2xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          {event?.description || 'Experience the flagship AI, Cloud, and Cybersecurity Conference featuring keynote speeches and encrypted instant gate access.'}
        </p>

        {/* Date & Location Cards */}
        <div className="flex flex-wrap justify-center gap-4 pt-4 text-xs sm:text-sm">
          <div className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800 shadow-sm'
          }`}>
            <Calendar className="w-4 h-4 text-indigo-500" />
            <span>Sept 15 - 17, 2026 • 09:00 AM PST</span>
          </div>

          <div className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800 shadow-sm'
          }`}>
            <MapPin className="w-4 h-4 text-emerald-500" />
            <span>{event?.venue || 'Metropolitan Convention Center'}, {event?.city || 'San Francisco, CA'}</span>
          </div>
        </div>

      </section>

      {/* Public Digital Pass Lookup Tool Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className={`rounded-3xl border p-8 shadow-2xl space-y-6 ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/30">
              <Ticket className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold">Already Have a Ticket? Retrieve Your Digital Pass</h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Enter the email address you registered with to view and download your encrypted QR entry code.
            </p>
          </div>

          <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={lookupEmail}
              onChange={(e) => setLookupEmail(e.target.value)}
              placeholder="Enter your registered email address..."
              className={`flex-1 rounded-xl px-4 py-2.5 text-sm border focus:outline-none focus:border-indigo-500 ${
                isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'
              }`}
              required
            />
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/20"
            >
              <Search className="w-4 h-4" />
              <span>Lookup Pass</span>
            </button>
          </form>

          {errorMsg && (
            <div className="text-center text-xs text-rose-500 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 max-w-md mx-auto">
              {errorMsg}
            </div>
          )}

          {/* Lookup Result Card Display */}
          {lookupResult && (
            <div className={`mt-6 p-6 rounded-2xl border text-center space-y-4 max-w-md mx-auto ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-lg'
            }`}>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                <CheckCircle2 className="w-4 h-4" /> Verified Ticket Pass Found
              </div>

              <div className="space-y-1">
                <h4 className="text-lg font-bold">{lookupResult.attendee.name}</h4>
                <p className="text-xs text-indigo-400 font-semibold">{lookupResult.attendee.tier}</p>
                <p className="text-xs text-slate-400">{lookupResult.attendee.company || lookupResult.attendee.email}</p>
              </div>

              <div className="bg-white p-4 rounded-2xl w-44 h-44 mx-auto flex items-center justify-center border-4 border-indigo-400/30">
                <img src={lookupResult.qrDataUrl} alt="Encrypted Pass QR" className="w-full h-full object-contain" />
              </div>

              <div className="font-mono text-[10px] text-indigo-400 bg-slate-900/40 p-2 rounded-lg truncate">
                {lookupResult.qrString}
              </div>
            </div>
          )}

        </div>
      </section>

      {/* Ticket Tiers Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h3 className="text-xl font-bold text-center mb-8">Access Pass Tiers & Gate Perks</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className={`p-6 rounded-3xl border space-y-3 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <span className="text-xs font-bold uppercase text-indigo-400">VIP Access</span>
            <h4 className="text-lg font-bold">Executive VIP Pass</h4>
            <p className="text-xs text-slate-400">Priority gate entrance, VIP Lounge access, and keynote reserved seating.</p>
          </div>

          <div className={`p-6 rounded-3xl border space-y-3 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <span className="text-xs font-bold uppercase text-cyan-400">General Admission</span>
            <h4 className="text-lg font-bold">Standard Summit Pass</h4>
            <p className="text-xs text-slate-400">Access to all conference tracks, expo hall, and live demonstration stages.</p>
          </div>

          <div className={`p-6 rounded-3xl border space-y-3 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <span className="text-xs font-bold uppercase text-purple-400">Speaker Pass</span>
            <h4 className="text-lg font-bold">Keynote Presenter</h4>
            <p className="text-xs text-slate-400">Green room access, speaker briefing stage entrance, and press lounge.</p>
          </div>

          <div className={`p-6 rounded-3xl border space-y-3 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <span className="text-xs font-bold uppercase text-emerald-400">Press / Media</span>
            <h4 className="text-lg font-bold">Media Desk Pass</h4>
            <p className="text-xs text-slate-400">Press room connectivity, interview booth access, and media briefing kit.</p>
          </div>

        </div>
      </section>

    </div>
  );
}
