import React, { useState } from 'react';
import { Upload, FileSpreadsheet, Download, CheckCircle, AlertCircle } from 'lucide-react';

export default function BulkAttendeeUpload({ onImport, onClose }) {
  const [fileContent, setFileContent] = useState('');
  const [parsedData, setParsedData] = useState([]);
  const [fileName, setFileName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const sampleCsvContent = `name,email,phone,tier,company
Sarah Conner,sarah.c@skynet.org,+15550192834,VIP Access,Cyberdyne Systems
Jonathan Wick,john.wick@continental.com,+15559876543,VIP Access,High Table Inc
Elena Rostova,elena.r@techsummit.io,+15553334444,General Admission,TechCorp
Marcus Aurelius,marcus@roman.org,+15557778888,Speaker,Philosophy Foundation
Clara Oswald,clara.o@tardis.net,+15559990000,Press / Media,BBC Media`;

  const downloadSampleCsv = () => {
    const blob = new Blob([sampleCsvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'gatepass_attendees_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        parseCsv(text);
      }
    };
    reader.readAsText(file);
  };

  const parseCsv = (csvText) => {
    try {
      const lines = csvText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length <= 1) {
        setErrorMsg('CSV file must contain a header row and at least 1 attendee row.');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const records = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length >= 2) {
          const rec = {};
          headers.forEach((h, idx) => {
            rec[h] = values[idx] || '';
          });
          records.push({
            name: rec.name || rec.attendee || 'Attendee',
            email: rec.email || '',
            phone: rec.phone || rec.mobile || '',
            tier: rec.tier || rec.ticket_tier || 'General Admission',
            company: rec.company || rec.organization || ''
          });
        }
      }

      setParsedData(records);
      setErrorMsg('');
    } catch (err) {
      setErrorMsg('Failed to parse CSV file format. Please check structure.');
    }
  };

  const handleConfirmImport = async () => {
    if (parsedData.length === 0) return;
    setIsImporting(true);
    try {
      await onImport(parsedData);
      setIsImporting(false);
      onClose();
    } catch (err) {
      setIsImporting(false);
      setErrorMsg('Import failed: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-3xl shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Bulk Import Attendees</h3>
              <p className="text-xs text-slate-400">Upload CSV file with Name, Email, Phone, and Ticket Tier</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white font-bold text-lg"
          >
            ✕
          </button>
        </div>

        {/* Drag & Drop Upload Zone */}
        <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-6 text-center bg-slate-950/50 transition-all">
          <Upload className="w-10 h-10 text-indigo-400 mx-auto mb-2" />
          <div className="text-sm font-semibold text-white">
            {fileName ? `File Selected: ${fileName}` : 'Select or drag CSV file here'}
          </div>
          <p className="text-xs text-slate-400 mt-1">Supports standard CSV file format</p>
          
          <div className="mt-4 flex items-center justify-center gap-3">
            <label className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs cursor-pointer shadow-lg shadow-indigo-600/20">
              Browse Files
              <input type="file" accept=".csv, .txt" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              onClick={downloadSampleCsv}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 font-semibold text-xs flex items-center gap-1.5 border border-slate-700"
            >
              <Download className="w-3.5 h-3.5" /> Download Sample CSV Template
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-rose-950/80 border border-rose-700 text-rose-200 text-xs p-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Preview Data Table */}
        {parsedData.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-bold">Previewing {parsedData.length} Attendees to Import:</span>
              <span className="text-indigo-400">Ready for digital pass generation</span>
            </div>

            <div className="max-h-48 overflow-y-auto border border-slate-800 rounded-xl bg-slate-950">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 sticky top-0">
                  <tr>
                    <th className="p-2.5 font-semibold">Name</th>
                    <th className="p-2.5 font-semibold">Email</th>
                    <th className="p-2.5 font-semibold">Phone</th>
                    <th className="p-2.5 font-semibold">Tier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {parsedData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/50">
                      <td className="p-2.5 font-medium">{row.name}</td>
                      <td className="p-2.5 text-slate-400">{row.email}</td>
                      <td className="p-2.5 text-slate-400">{row.phone}</td>
                      <td className="p-2.5 text-indigo-400 font-semibold">{row.tier}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Actions Footer */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmImport}
            disabled={parsedData.length === 0 || isImporting}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{isImporting ? 'Generating Passes...' : `Import & Generate ${parsedData.length} Tickets`}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
