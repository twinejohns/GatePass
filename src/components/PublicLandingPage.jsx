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
  Moon,
  UserCheck,
  Hash
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Footer from './Footer';

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
    <div className={`min-h-screen flex flex-col justify-between transition-colors duration-300 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      <div>
        {/* Navigation Header */}
        <nav className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200 shadow-sm'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#1698E1] flex items-center justify-center shadow-md text-white">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight">GatePass</span>
                <span className="text-[10px] ml-2 px-2 py-0.5 rounded-full bg-[#1698E1]/20 text-[#1698E1] font-mono font-bold">
                  SECURE ACCESS
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-xl border transition-all ${
                  isDark ? 'bg-[#222222] text-[#F7D06B] border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-300'
                }`}
                title="Toggle Light / Dark Theme"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Staff Login Button */}
              <button
                onClick={onGoToLogin}
                className="px-4 py-2 rounded-xl btn-brand-primary font-bold text-xs flex items-center gap-2 shadow transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>Staff Login Portal</span>
              </button>
            </div>

          </div>
        </nav>

        {/* Hero Banner Section */}
        <section className="relative overflow-hidden py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-6">
          
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#1698E1]/15 text-[#1698E1] border border-[#1698E1]/30 text-xs font-bold">
            <Sparkles className="w-4 h-4 text-[#F7D06B]" />
            <span>Official Digital Event Pass Verification Portal</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-3xl mx-auto leading-tight">
            {event?.name || 'Global Tech Innovation Summit 2026'}
          </h1>

          <p className={`text-base sm:text-lg max-w-2xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {event?.description || 'Experience the flagship AI, Cloud, and Cybersecurity Conference featuring keynote speeches and encrypted instant gate access.'}
          </p>

          {/* Date & Location Cards */}
          <div className="flex flex-wrap justify-center gap-4 pt-4 text-xs sm:text-sm font-semibold">
            <div className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl border ${
              isDark ? 'bg-[#090d16] border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800 shadow-sm'
            }`}>
              <Calendar className="w-4 h-4 text-[#1698E1]" />
              <span>Sept 15 - 17, 2026 • 09:00 AM PST</span>
            </div>

            <div className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl border ${
              isDark ? 'bg-[#090d16] border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800 shadow-sm'
            }`}>
              <MapPin className="w-4 h-4 text-[#01BD9B]" />
              <span>{event?.venue || 'Metropolitan Convention Center'}, {event?.city || 'San Francisco, CA'}</span>
            </div>
          </div>

        </section>

        {/* Public Digital Pass Lookup Tool Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className={`rounded-3xl border p-6 sm:p-8 shadow-xl space-y-6 ${
            isDark ? 'bg-[#090d16] border-slate-800' : 'bg-white border-slate-200 shadow-slate-200/50'
          }`}>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#1698E1]/15 text-[#1698E1] flex items-center justify-center mx-auto border border-[#1698E1]/30">
                <Ticket className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-extrabold">Already Have a Ticket? Retrieve Your Credential Info</h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Enter the email address you registered with to view your verified attendee details & Delegate ID.
              </p>
            </div>

            <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={lookupEmail}
                onChange={(e) => setLookupEmail(e.target.value)}
                placeholder="Enter your registered email address..."
                className={`flex-1 rounded-xl px-4 py-2.5 text-xs font-semibold border focus:outline-none focus:border-[#1698E1] ${
                  isDark ? 'bg-[#030712] border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
                required
              />
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl btn-brand-primary font-extrabold text-xs flex items-center justify-center gap-1.5 shadow"
              >
                <Search className="w-4 h-4" />
                <span>Lookup Pass</span>
              </button>
            </form>

            {errorMsg && (
              <div className="text-center text-xs font-bold text-[#E55555] bg-[#E55555]/10 p-3 rounded-xl border border-[#E55555]/30 max-w-md mx-auto">
                {errorMsg}
              </div>
            )}

            {/* Clean Lookup Result Card Display (QR Code Removed per request) */}
            {lookupResult && (
              <div className={`mt-6 p-6 rounded-2xl border space-y-4 max-w-md mx-auto shadow-lg transition-all ${
                isDark ? 'bg-[#030712] border-slate-800' : 'bg-slate-50 border-slate-300'
              }`}>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/40 dark:border-slate-800">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#01BD9B]/15 text-[#01BD9B] text-xs font-extrabold border border-[#01BD9B]/30">
                    <CheckCircle2 className="w-4 h-4" /> Verified Registration
                  </span>

                  <span className="text-xs font-mono font-extrabold px-2.5 py-1 rounded-lg bg-[#1698E1]/15 text-[#1D69D6] border border-[#1698E1]/30">
                    {lookupResult.attendee.delegateId || lookupResult.attendee.id}
                  </span>
                </div>

                <div className="space-y-1.5 text-left text-xs font-sans">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold">Attendee Name:</span>
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white">{lookupResult.attendee.name}</h4>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold">Access Level Tier:</span>
                    <span className="text-xs font-extrabold text-[#1698E1]">{lookupResult.attendee.tier}</span>
                  </div>

                  {lookupResult.attendee.company && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-bold">Company / Org:</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{lookupResult.attendee.company}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-slate-500 font-bold">Check-In Status:</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                      lookupResult.attendee.status === 'CHECKED_IN'
                        ? 'bg-[#01BD9B]/20 text-[#01BD9B] border-[#01BD9B]/40'
                        : 'bg-[#F7D06B]/20 text-[#222222] dark:text-[#F7D06B] border-[#F7D06B]/40'
                    }`}>
                      {lookupResult.attendee.status === 'CHECKED_IN' ? 'CHECKED IN' : 'PASS ISSUED'}
                    </span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </section>

        {/* Ticket Tiers Showcase */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h3 className="text-lg font-extrabold text-center mb-6">Access Pass Tiers & Gate Perks</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className={`p-5 rounded-2xl border space-y-2 ${
              isDark ? 'bg-[#090d16] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#F7D06B]">VIP Access</span>
              <h4 className="text-base font-bold">Executive VIP Pass</h4>
              <p className="text-xs text-slate-400">Priority gate entrance, VIP Lounge access, and keynote reserved seating.</p>
            </div>

            <div className={`p-5 rounded-2xl border space-y-2 ${
              isDark ? 'bg-[#090d16] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1698E1]">General Admission</span>
              <h4 className="text-base font-bold">Standard Summit Pass</h4>
              <p className="text-xs text-slate-400">Access to all conference tracks, expo hall, and live demonstration stages.</p>
            </div>

            <div className={`p-5 rounded-2xl border space-y-2 ${
              isDark ? 'bg-[#090d16] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#01BD9B]">Speaker Pass</span>
              <h4 className="text-base font-bold">Keynote Presenter</h4>
              <p className="text-xs text-slate-400">Green room access, speaker briefing stage entrance, and press lounge.</p>
            </div>

            <div className={`p-5 rounded-2xl border space-y-2 ${
              isDark ? 'bg-[#090d16] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#3250FF]">Press / Media</span>
              <h4 className="text-base font-bold">Media Desk Pass</h4>
              <p className="text-xs text-slate-400">Press room connectivity, interview booth access, and media briefing kit.</p>
            </div>

          </div>
        </section>
      </div>

      {/* Global Mangrove Media Copyright Footer */}
      <Footer />

    </div>
  );
}
