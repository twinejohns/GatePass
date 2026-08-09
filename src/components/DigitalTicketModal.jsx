import React, { useState } from 'react';
import { Mail, MessageSquare, Download, Share2, Printer, Check, Copy } from 'lucide-react';

export default function DigitalTicketModal({ passData, onClose }) {
  const [activeTab, setActiveTab] = useState('email'); // 'email' | 'mobile' | 'print'
  const [copiedLink, setCopiedLink] = useState(false);

  if (!passData) return null;

  const { attendee, event, template, qrDataUrl, qrString } = passData;
  const passUrl = `${window.location.origin}/ticket/${attendee.id}`;

  const copyShareLink = () => {
    navigator.clipboard.writeText(passUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-2xl shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Digital Pass Distribution Hub</h3>
            <p className="text-xs text-slate-400">Issued to: <strong className="text-indigo-400">{attendee.name}</strong> ({attendee.email})</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white font-bold text-lg"
          >
            ✕
          </button>
        </div>

        {/* Tab Distribution Channel Switcher */}
        <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('email')}
            className={`flex-1 py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'email' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Pass Card</span>
          </button>

          <button
            onClick={() => setActiveTab('mobile')}
            className={`flex-1 py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'mobile' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>SMS / WhatsApp Pass</span>
          </button>

          <button
            onClick={() => setActiveTab('print')}
            className={`flex-1 py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'print' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Printable Pass / PNG</span>
          </button>
        </div>

        {/* Channel View Content */}

        {/* 1. EMAIL SIMULATOR VIEW */}
        {activeTab === 'email' && (
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="text-xs text-slate-400 space-y-1 pb-3 border-b border-slate-800">
              <div><strong>To:</strong> {attendee.name} &lt;{attendee.email}&gt;</div>
              <div><strong>From:</strong> GatePass Ticketing System &lt;tickets@{event.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com&gt;</div>
              <div><strong>Subject:</strong> 🎟️ Your Official Entry Pass for {event.name}</div>
            </div>

            {/* Email Body Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4 max-w-sm mx-auto shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center mx-auto text-xl font-bold">
                GP
              </div>
              <div>
                <h4 className="text-base font-bold text-white">{event.name}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{event.venue}</p>
              </div>

              <div className="bg-indigo-500/10 border border-indigo-500/30 p-3 rounded-xl">
                <div className="text-sm font-bold text-white">{attendee.name}</div>
                <div className="text-xs font-semibold text-indigo-300">{attendee.tier}</div>
                <div className="text-[11px] text-slate-400 mt-1">Phone: {attendee.phone || 'N/A'}</div>
              </div>

              {/* QR Image */}
              <div className="bg-white p-3 rounded-xl w-44 h-44 mx-auto flex items-center justify-center">
                <img src={qrDataUrl} alt="QR Code" className="w-full h-full object-contain" />
              </div>

              <p className="text-[11px] text-slate-400">
                Please present this encrypted QR code at Gate A or VIP Entrance for instant validation.
              </p>
            </div>
          </div>
        )}

        {/* 2. SMS / WHATSAPP PASS VIEW */}
        {activeTab === 'mobile' && (
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="max-w-xs mx-auto bg-emerald-950/40 border border-emerald-500/30 p-4 rounded-2xl space-y-3">
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold">
                <MessageSquare className="w-4 h-4" />
                <span>SMS / WhatsApp Digital Ticket Preview</span>
              </div>
              
              <div className="text-xs text-slate-200 bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2">
                <p>Hello <strong>{attendee.name}</strong>! Your ticket for <strong>{event.name}</strong> is confirmed.</p>
                <p className="text-indigo-300 font-semibold">Tier: {attendee.tier}</p>
                <p>Tap your secure mobile pass link below to view your encrypted QR entry code:</p>
                <div className="p-2 bg-slate-950 rounded text-[11px] text-cyan-400 font-mono break-all">
                  {passUrl}
                </div>
              </div>

              <button
                onClick={copyShareLink}
                className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Copy WhatsApp Digital Pass Link'}</span>
              </button>
            </div>
          </div>
        )}

        {/* 3. PRINTABLE PASS VIEW */}
        {activeTab === 'print' && (
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm mx-auto space-y-4 shadow-xl">
              <h4 className="text-base font-bold text-white">{event.name}</h4>
              <div className="text-xs text-indigo-400 font-bold uppercase">{attendee.tier}</div>
              
              <div className="text-sm text-white font-bold">{attendee.name}</div>
              <div className="text-xs text-slate-400">{attendee.email} • {attendee.phone}</div>

              <div className="bg-white p-4 rounded-xl w-48 h-48 mx-auto flex items-center justify-center">
                <img src={qrDataUrl} alt="QR Code" className="w-full h-full object-contain" />
              </div>

              <div className="text-[10px] font-mono text-slate-500 break-all">
                {qrString}
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <a
                href={qrDataUrl}
                download={`${attendee.name.replace(/\s+/g, '_')}_GatePass_QR.png`}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg"
              >
                <Download className="w-4 h-4" /> Download QR Image PNG
              </a>

              <button
                onClick={handlePrint}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 border border-slate-700"
              >
                <Printer className="w-4 h-4" /> Print Physical Pass
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
