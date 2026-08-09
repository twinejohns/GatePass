import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateQrPayload } from './cryptoEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'database.json');

function formatDelegateId(pattern, seq, tier = '') {
  const paddedSeq = String(seq).padStart(4, '0');
  const tierPrefix = tier ? tier.substring(0, 3).toUpperCase() : 'DEL';
  return pattern
    .replace('{SEQ}', paddedSeq)
    .replace('{TIER}', tierPrefix);
}

// Default initial state
const defaultData = {
  users: [
    {
      id: 'usr_mgr_1',
      name: 'Sarah Jenkins',
      email: 'sarah.mgr@gatepass.io',
      password: 'password123',
      role: 'Manager',
      title: 'Head Event Director',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      activeGate: null,
      status: 'ONLINE'
    },
    {
      id: 'usr_gate_1',
      name: 'David Miller',
      email: 'david.gate@gatepass.io',
      password: 'password123',
      role: 'Gate Attendant',
      title: 'Gate Attendant - Gate A',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      activeGate: 'gate_a',
      status: 'ONLINE'
    },
    {
      id: 'usr_gate_2',
      name: 'Elena Rostova',
      email: 'elena.gate@gatepass.io',
      password: 'password123',
      role: 'Gate Attendant',
      title: 'Gate Attendant - VIP Gate',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      activeGate: 'gate_vip',
      status: 'ONLINE'
    }
  ],
  events: [
    {
      id: 'evt_tech_2026',
      name: 'Global Tech Innovation Summit 2026',
      description: 'The flagship AI, Cloud, and Cybersecurity Conference featuring keynote speeches and live tech demos.',
      venue: 'Metropolitan Convention Center, Grand Ballroom',
      city: 'San Francisco, CA',
      date: '2026-09-15T09:00:00.000Z',
      endDate: '2026-09-17T18:00:00.000Z',
      capacity: 1500,
      phase: 'LIVE_GATES_OPEN', // PRE_EVENT_TEST | LIVE_GATES_OPEN | CLOSED
      bannerUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
      idFormatPattern: 'ATS-2026-{SEQ}', // Manager ID Pattern: e.g. ATS-2026-0001
      nextSeqNumber: 106,
      gates: [
        { id: 'gate_a', name: 'Gate A - Main Entrance' },
        { id: 'gate_b', name: 'Gate B - North Concourse' },
        { id: 'gate_vip', name: 'VIP & Executive Entrance' },
        { id: 'gate_press', name: 'Press & Media Pass Desk' }
      ]
    }
  ],
  ticketTemplates: [
    {
      eventId: 'evt_tech_2026',
      bannerBgColor: '#4f46e5',
      cardBgColor: '#0f172a',
      textColor: '#ffffff',
      accentColor: '#38bdf8',
      headerTitle: 'GLOBAL TECH SUMMIT 2026',
      logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200',
      showAttendeePhoto: true,
      showPhone: true,
      showEmail: true,
      showCompany: true,
      showDelegateId: true,
      footerNote: 'Present this pass at designated gate. Non-transferable once checked in.'
    }
  ],
  invitationOverlayTemplates: [
    {
      eventId: 'evt_tech_2026',
      cardImageUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800',
      fields: {
        name: { x: 40, y: 90, fontSize: 22, color: '#ffffff', enabled: true },
        delegateId: { x: 40, y: 125, fontSize: 16, color: '#f59e0b', enabled: true },
        company: { x: 40, y: 155, fontSize: 15, color: '#38bdf8', enabled: true },
        tier: { x: 40, y: 185, fontSize: 13, color: '#a855f7', enabled: true },
        qrCode: { x: 480, y: 70, width: 140, height: 140, enabled: true }
      }
    }
  ],
  attendees: [
    {
      id: 'att_101',
      delegateId: 'ATS-2026-0001',
      eventId: 'evt_tech_2026',
      name: 'Alexander Wright',
      email: 'alexander.wright@techcorp.com',
      phone: '+1 (555) 234-5678',
      tier: 'VIP Access',
      company: 'Quantum Dynamics',
      status: 'ISSUED',
      qrVersion: 1,
      emailSent: false,
      checkedInAt: null,
      checkedInGate: null,
      checkedInBy: null,
      createdAt: '2026-08-01T10:00:00.000Z'
    },
    {
      id: 'att_102',
      delegateId: 'ATS-2026-0002',
      eventId: 'evt_tech_2026',
      name: 'Sophia Chen',
      email: 'sophia.chen@nexusai.io',
      phone: '+1 (555) 876-5432',
      tier: 'General Admission',
      company: 'Nexus AI Labs',
      status: 'CHECKED_IN',
      qrVersion: 1,
      emailSent: true,
      checkedInAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      checkedInGate: 'gate_a',
      checkedInBy: 'David Miller',
      createdAt: '2026-08-02T11:30:00.000Z'
    },
    {
      id: 'att_103',
      delegateId: 'ATS-2026-0003',
      eventId: 'evt_tech_2026',
      name: 'Marcus Brody',
      email: 'marcus.brody@cyberfort.net',
      phone: '+1 (555) 345-6789',
      tier: 'Speaker',
      company: 'CyberFort Security',
      status: 'CHECKED_IN',
      qrVersion: 1,
      emailSent: true,
      checkedInAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
      checkedInGate: 'gate_vip',
      checkedInBy: 'Elena Rostova',
      createdAt: '2026-08-02T14:15:00.000Z'
    },
    {
      id: 'att_104',
      delegateId: 'ATS-2026-0004',
      eventId: 'evt_tech_2026',
      name: 'Isabella Rodriguez',
      email: 'isabella.r@futuremedia.org',
      phone: '+1 (555) 901-2345',
      tier: 'Press / Media',
      company: 'Future Media Group',
      status: 'ISSUED',
      qrVersion: 1,
      emailSent: false,
      checkedInAt: null,
      checkedInGate: null,
      checkedInBy: null,
      createdAt: '2026-08-03T09:20:00.000Z'
    },
    {
      id: 'att_105',
      delegateId: 'ATS-2026-0005',
      eventId: 'evt_tech_2026',
      name: 'David Vance',
      email: 'david.vance@cloudnative.co',
      phone: '+1 (555) 432-1098',
      tier: 'General Admission',
      company: 'CloudNative Systems',
      status: 'ISSUED',
      qrVersion: 1,
      emailSent: false,
      checkedInAt: null,
      checkedInGate: null,
      checkedInBy: null,
      createdAt: '2026-08-04T16:45:00.000Z'
    }
  ],
  emailLogs: [],
  scans: [
    {
      id: 'scn_1',
      eventId: 'evt_tech_2026',
      attendeeId: 'att_102',
      delegateId: 'ATS-2026-0002',
      attendeeName: 'Sophia Chen',
      tier: 'General Admission',
      company: 'Nexus AI Labs',
      attendantName: 'David Miller',
      gateId: 'gate_a',
      gateName: 'Gate A - Main Entrance',
      result: 'VALID_CHECKIN',
      phase: 'LIVE_GATES_OPEN',
      timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString()
    }
  ],
  auditLogs: [
    {
      id: 'aud_1',
      eventId: 'evt_tech_2026',
      attendeeId: 'att_101',
      delegateId: 'ATS-2026-0001',
      attendeeName: 'Alexander Wright',
      action: 'REISSUE_QR',
      reason: 'Lost phone - requested clean QR refresh',
      managerName: 'Sarah Jenkins',
      previousVersion: 1,
      newVersion: 2,
      timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString()
    }
  ]
};

class Database {
  constructor() {
    this.data = defaultData;
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(raw);
      } else {
        this.save();
      }
    } catch (err) {
      console.error('Error loading database file:', err);
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to save database file:', err);
    }
  }

  // Getters
  getUsers() { return this.data.users; }
  getUser(id) { return this.data.users.find(u => u.id === id); }
  getEvents() { return this.data.events; }
  getEvent(id) { return this.data.events.find(e => e.id === id); }
  getTicketTemplate(eventId) { 
    return this.data.ticketTemplates.find(t => t.eventId === eventId) || this.data.ticketTemplates[0]; 
  }
  getInvitationTemplate(eventId) {
    return this.data.invitationOverlayTemplates.find(t => t.eventId === eventId) || this.data.invitationOverlayTemplates[0];
  }
  getAttendees(eventId) { 
    return this.data.attendees.filter(a => a.eventId === eventId); 
  }
  getAttendee(id) { return this.data.attendees.find(a => a.id === id || a.delegateId === id); }
  getScans(eventId) { 
    return this.data.scans.filter(s => s.eventId === eventId); 
  }
  getAuditLogs(eventId) { 
    return this.data.auditLogs.filter(l => l.eventId === eventId); 
  }

  // Event Details Mutator
  updateEventDetails(eventId, updateObj) {
    const evt = this.getEvent(eventId);
    if (evt) {
      Object.assign(evt, updateObj);
      this.save();
      return evt;
    }
    return null;
  }

  // User Gate Allocation Mutator
  updateUserGate(userId, gateId) {
    const user = this.getUser(userId);
    if (user && user.role === 'Gate Attendant') {
      user.activeGate = gateId;
      const evt = this.data.events[0];
      const gateObj = (evt?.gates || []).find(g => g.id === gateId);
      if (gateObj) {
        user.title = `Gate Attendant - ${gateObj.name}`;
      }
      this.save();
      return user;
    }
    return null;
  }

  updateEventPhase(eventId, newPhase) {
    const evt = this.getEvent(eventId);
    if (evt) {
      evt.phase = newPhase;
      this.save();
      return evt;
    }
    return null;
  }

  saveTicketTemplate(template) {
    const idx = this.data.ticketTemplates.findIndex(t => t.eventId === template.eventId);
    if (idx >= 0) {
      this.data.ticketTemplates[idx] = { ...this.data.ticketTemplates[idx], ...template };
    } else {
      this.data.ticketTemplates.push(template);
    }
    this.save();
    return this.getTicketTemplate(template.eventId);
  }

  saveInvitationTemplate(template) {
    const idx = this.data.invitationOverlayTemplates.findIndex(t => t.eventId === template.eventId);
    if (idx >= 0) {
      this.data.invitationOverlayTemplates[idx] = { ...this.data.invitationOverlayTemplates[idx], ...template };
    } else {
      this.data.invitationOverlayTemplates.push(template);
    }
    this.save();
    return this.getInvitationTemplate(template.eventId);
  }

  addSingleAttendee(eventId, attendeeObj) {
    const evt = this.getEvent(eventId);
    const pattern = evt?.idFormatPattern || 'ATS-2026-{SEQ}';
    const seq = evt?.nextSeqNumber || (this.data.attendees.length + 1);

    if (evt) {
      evt.nextSeqNumber = seq + 1;
    }

    const id = `att_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const delegateId = attendeeObj.delegateId || formatDelegateId(pattern, seq, attendeeObj.tier);

    const newAttendee = {
      id,
      delegateId,
      eventId,
      name: attendeeObj.name || 'Anonymous',
      email: attendeeObj.email || '',
      phone: attendeeObj.phone || '',
      tier: attendeeObj.tier || 'General Admission',
      company: attendeeObj.company || '',
      status: attendeeObj.status || 'ISSUED',
      qrVersion: 1,
      emailSent: false,
      checkedInAt: null,
      checkedInGate: null,
      checkedInBy: null,
      createdAt: new Date().toISOString()
    };
    this.data.attendees.unshift(newAttendee);
    this.save();
    return newAttendee;
  }

  updateAttendee(attendeeId, updateObj) {
    const att = this.getAttendee(attendeeId);
    if (att) {
      Object.assign(att, updateObj);
      this.save();
      return att;
    }
    return null;
  }

  addAttendeesBulk(eventId, attendeesArray) {
    const evt = this.getEvent(eventId);
    const pattern = evt?.idFormatPattern || 'ATS-2026-{SEQ}';
    let seq = evt?.nextSeqNumber || (this.data.attendees.length + 1);

    const created = [];
    attendeesArray.forEach(a => {
      const existing = a.email ? this.data.attendees.find(x => x.eventId === eventId && x.email.toLowerCase() === a.email.toLowerCase()) : null;
      if (existing) {
        existing.name = a.name || existing.name;
        existing.phone = a.phone || existing.phone;
        existing.tier = a.tier || existing.tier;
        existing.company = a.company || existing.company;
        if (a.delegateId) existing.delegateId = a.delegateId;
        created.push(existing);
      } else {
        const id = `att_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        const delegateId = a.delegateId || a.id || formatDelegateId(pattern, seq, a.tier);
        seq += 1;

        const newAtt = {
          id,
          delegateId,
          eventId,
          name: a.name || 'Attendee',
          email: a.email || '',
          phone: a.phone || '',
          tier: a.tier || 'General Admission',
          company: a.company || '',
          status: 'ISSUED',
          qrVersion: 1,
          emailSent: false,
          checkedInAt: null,
          checkedInGate: null,
          checkedInBy: null,
          createdAt: new Date().toISOString()
        };
        this.data.attendees.unshift(newAtt);
        created.push(newAtt);
      }
    });

    if (evt) {
      evt.nextSeqNumber = seq;
    }

    this.save();
    return created;
  }

  markEmailsSent(attendeeIds) {
    const updated = [];
    attendeeIds.forEach(id => {
      const att = this.getAttendee(id);
      if (att) {
        att.emailSent = true;
        updated.push(att);
      }
    });
    this.save();
    return updated;
  }

  reissueQrCode(attendeeId, managerName, reason) {
    const attendee = this.getAttendee(attendeeId);
    if (!attendee) return null;

    const previousVersion = attendee.qrVersion || 1;
    attendee.qrVersion = previousVersion + 1;
    attendee.status = 'ISSUED';
    attendee.checkedInAt = null;
    attendee.checkedInGate = null;
    attendee.checkedInBy = null;

    const auditEntry = {
      id: `aud_${Date.now()}`,
      eventId: attendee.eventId,
      attendeeId: attendee.id,
      delegateId: attendee.delegateId,
      attendeeName: attendee.name,
      action: 'REISSUE_QR',
      reason: reason || 'Manager requested QR code reset',
      managerName: managerName || 'Admin Manager',
      previousVersion,
      newVersion: attendee.qrVersion,
      timestamp: new Date().toISOString()
    };

    this.data.auditLogs.unshift(auditEntry);
    this.save();

    return {
      attendee,
      auditEntry,
      newQrPayload: generateQrPayload(attendee.eventId, attendee.id, attendee.qrVersion)
    };
  }

  recordScan(scanData) {
    const scanRecord = {
      id: `scn_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      ...scanData,
      timestamp: new Date().toISOString()
    };
    this.data.scans.unshift(scanRecord);

    if (scanData.result === 'VALID_CHECKIN' && scanData.attendeeId) {
      const attendee = this.getAttendee(scanData.attendeeId);
      if (attendee) {
        attendee.status = 'CHECKED_IN';
        attendee.checkedInAt = scanRecord.timestamp;
        attendee.checkedInGate = scanData.gateId;
        attendee.checkedInBy = scanData.attendantName;
      }
    }

    this.save();
    return scanRecord;
  }

  addUser(userObj) {
    const newUser = {
      id: `usr_${Date.now()}`,
      password: 'password123',
      status: 'ONLINE',
      activeGate: userObj.role === 'Gate Attendant' ? (userObj.activeGate || 'gate_a') : null,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`,
      ...userObj
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }
}

export const db = new Database();
