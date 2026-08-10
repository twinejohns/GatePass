import express from 'express';
import QRCode from 'qrcode';
import { db } from './db.js';
import { generateQrPayload, verifyQrPayload } from './cryptoEngine.js';
import { wsManager } from './websocket.js';

const router = express.Router();

function calculateAnalytics(eventId) {
  const evt = db.getEvent(eventId);
  const attendees = db.getAttendees(eventId);
  const scans = db.getScans(eventId);
  const users = db.getUsers();

  const totalTickets = attendees.length;
  const checkedInCount = attendees.filter(a => a.status === 'CHECKED_IN').length;
  const remainingCount = totalTickets - checkedInCount;
  const checkInRatePercent = totalTickets > 0 ? Math.round((checkedInCount / totalTickets) * 100) : 0;
  const emailsSentCount = attendees.filter(a => a.emailSent).length;

  const gateStats = (evt?.gates || []).map(g => {
    const count = scans.filter(s => s.gateId === g.id && s.result === 'VALID_CHECKIN').length;
    const activeAttendants = users.filter(u => u.role === 'Gate Attendant' && u.activeGate === g.id);
    return {
      gateId: g.id,
      gateName: g.name,
      checkedInCount: count,
      activeAttendantsCount: activeAttendants.length,
      activeAttendantsList: activeAttendants.map(u => ({ id: u.id, name: u.name, avatar: u.avatar, title: u.title, status: u.status }))
    };
  });

  const tierStats = {};
  attendees.forEach(a => {
    if (!tierStats[a.tier]) {
      tierStats[a.tier] = { total: 0, checkedIn: 0 };
    }
    tierStats[a.tier].total += 1;
    if (a.status === 'CHECKED_IN') {
      tierStats[a.tier].checkedIn += 1;
    }
  });

  return {
    totalTickets,
    checkedInCount,
    remainingCount,
    checkInRatePercent,
    emailsSentCount,
    capacity: evt?.capacity || 1500,
    phase: evt?.phase || 'LIVE_GATES_OPEN',
    gateStats,
    tierStats,
    recentScans: scans.slice(0, 15)
  };
}

// Handler for Ticket Pass Lookup (shared by /attendees/:id/pass and /tickets/:id/pass)
const handleGetTicketPass = async (req, res) => {
  try {
    const attendee = db.getAttendee(req.params.id);
    if (!attendee) return res.status(404).json({ success: false, error: 'Attendee not found' });

    const event = db.getEvent(attendee.eventId);
    const template = db.getTicketTemplate(attendee.eventId);

    const qrPayload = generateQrPayload(attendee.eventId, attendee.id, attendee.qrVersion || 1);
    const qrDataUrl = await QRCode.toDataURL(qrPayload, {
      width: 300,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' }
    });

    res.json({
      success: true,
      pass: {
        attendee,
        event,
        template,
        qrString: qrPayload,
        qrDataUrl
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Handler for Reissuing Ticket (shared by /attendees/:id/reissue and /tickets/:id/reissue)
const handleReissueTicket = async (req, res) => {
  try {
    const { managerName, reason } = req.body;
    const result = db.reissueQrCode(req.params.id, managerName, reason);
    if (!result) return res.status(404).json({ success: false, error: 'Attendee not found' });

    wsManager.broadcast('TICKET_REISSUED', {
      attendeeId: result.attendee.id,
      delegateId: result.attendee.delegateId,
      newVersion: result.attendee.qrVersion,
      managerName,
      analytics: calculateAnalytics(result.attendee.eventId)
    });

    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Handler for Vector QR Exporter (shared by /events/:id/vector-qr and /events/:id/export-vector-qrs)
const handleExportVectorQrs = async (req, res) => {
  try {
    const attendees = db.getAttendees(req.params.id);
    const vectorAssets = await Promise.all(attendees.map(async (a) => {
      const payload = generateQrPayload(req.params.id, a.id, a.qrVersion || 1);
      const svgString = await QRCode.toString(payload, { type: 'svg', margin: 2 });
      return {
        id: a.id,
        attendeeId: a.id,
        delegateId: a.delegateId || a.id,
        name: a.name,
        company: a.company,
        email: a.email,
        tier: a.tier,
        qrVersion: a.qrVersion || 1,
        svgData: svgString,
        svgString
      };
    }));

    res.json({ success: true, vectorAssets });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Handler for Bulk Email Dispatcher (shared by /events/:id/bulk-email and /events/:id/send-emails-bulk)
const handleSendBulkEmails = (req, res) => {
  try {
    const { attendeeIds, subject } = req.body;
    const updated = db.markEmailsSent(attendeeIds || []);
    res.json({
      success: true,
      sentCount: updated.length,
      message: `Dispatched ${updated.length} ticket emails successfully`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Events
router.get('/events', (req, res) => {
  res.json({ success: true, events: db.getEvents() });
});

// GET Event Analytics Endpoint
router.get('/events/:id/analytics', (req, res) => {
  const analytics = calculateAnalytics(req.params.id);
  res.json({ success: true, analytics });
});

// GET Audit Logs Endpoint
router.get('/events/:id/audit-logs', (req, res) => {
  res.json({ success: true, auditLogs: db.getAuditLogs(req.params.id) });
});

router.get('/events/:id', (req, res) => {
  const event = db.getEvent(req.params.id);
  if (!event) return res.status(404).json({ success: false, error: 'Event not found' });
  const analytics = calculateAnalytics(req.params.id);
  res.json({ success: true, event, analytics });
});

// Manager Update Event Details & ID Format Pattern
router.put('/events/:id', (req, res) => {
  try {
    const updatedEvent = db.updateEventDetails(req.params.id, req.body);
    if (!updatedEvent) return res.status(404).json({ success: false, error: 'Event not found' });

    wsManager.broadcast('EVENT_UPDATED', {
      event: updatedEvent,
      analytics: calculateAnalytics(req.params.id)
    });

    res.json({ success: true, event: updatedEvent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/events/:id/phase', (req, res) => {
  try {
    const { phase } = req.body;
    const updatedEvent = db.updateEventPhase(req.params.id, phase);
    wsManager.broadcast('PHASE_CHANGE_EVENT', {
      eventId: req.params.id,
      phase,
      analytics: calculateAnalytics(req.params.id)
    });
    res.json({ success: true, event: updatedEvent, analytics: calculateAnalytics(req.params.id) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Ticket Templates
router.get('/events/:id/template', (req, res) => {
  res.json({ success: true, template: db.getTicketTemplate(req.params.id) });
});

router.post('/events/:id/template', (req, res) => {
  try {
    const template = db.saveTicketTemplate({ eventId: req.params.id, ...req.body });
    res.json({ success: true, template });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PDF Invitation Overlay Templates Studio
router.get('/events/:id/invitation-studio', (req, res) => {
  res.json({ success: true, template: db.getInvitationTemplate(req.params.id) });
});

router.post('/events/:id/invitation-studio', (req, res) => {
  try {
    const template = db.saveInvitationTemplate({ eventId: req.params.id, ...req.body });
    res.json({ success: true, template });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Attendees CRUD
router.get('/events/:id/attendees', (req, res) => {
  res.json({ success: true, attendees: db.getAttendees(req.params.id) });
});

router.post('/events/:id/attendees', (req, res) => {
  try {
    const attendee = db.addSingleAttendee(req.params.id, req.body);
    wsManager.broadcast('ATTENDEES_UPDATED', {
      eventId: req.params.id,
      attendee,
      analytics: calculateAnalytics(req.params.id)
    });
    res.json({ success: true, attendee });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/attendees/:id', (req, res) => {
  try {
    const attendee = db.updateAttendee(req.params.id, req.body);
    if (!attendee) return res.status(404).json({ success: false, error: 'Attendee not found' });
    wsManager.broadcast('ATTENDEES_UPDATED', {
      eventId: attendee.eventId,
      attendee,
      analytics: calculateAnalytics(attendee.eventId)
    });
    res.json({ success: true, attendee });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/events/:id/attendees/bulk', (req, res) => {
  try {
    const { attendees } = req.body;
    const created = db.addAttendeesBulk(req.params.id, attendees);
    wsManager.broadcast('ATTENDEES_UPDATED', {
      eventId: req.params.id,
      count: created.length,
      analytics: calculateAnalytics(req.params.id)
    });
    res.json({ success: true, importedCount: created.length, attendees: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Digital Ticket Pass Lookup (Supported via both /attendees/:id/pass and /tickets/:id/pass)
router.get('/attendees/:id/pass', handleGetTicketPass);
router.get('/tickets/:id/pass', handleGetTicketPass);

// Re-issue Ticket (Supported via both /attendees/:id/reissue and /tickets/:id/reissue)
router.post('/attendees/:id/reissue', handleReissueTicket);
router.post('/tickets/:id/reissue', handleReissueTicket);

// Bulk Email Pass Dispatcher (Supported via both /events/:id/bulk-email and /events/:id/send-emails-bulk)
router.post('/events/:id/bulk-email', handleSendBulkEmails);
router.post('/events/:id/send-emails-bulk', handleSendBulkEmails);

// Vector QR Code Exporter Asset Generator (Supported via both /events/:id/vector-qr and /events/:id/export-vector-qrs)
router.get('/events/:id/vector-qr', handleExportVectorQrs);
router.get('/events/:id/export-vector-qrs', handleExportVectorQrs);

// Scanner API: Validate and record scan
router.post('/scan', (req, res) => {
  try {
    const { qrPayload, gateId, attendantName } = req.body;
    const verified = verifyQrPayload(qrPayload);

    if (!verified.valid) {
      const scanRecord = db.recordScan({
        eventId: 'unknown',
        attendeeId: null,
        delegateId: null,
        attendeeName: 'Unknown',
        tier: 'None',
        attendantName: attendantName || 'Attendant',
        gateId,
        gateName: 'Gate Station',
        result: 'INVALID_SIGNATURE',
        phase: 'LIVE_GATES_OPEN'
      });

      wsManager.broadcast('LIVE_SCAN_EVENT', {
        scanRecord,
        analytics: calculateAnalytics('evt_tech_2026')
      });

      return res.json({
        success: false,
        result: 'INVALID_SIGNATURE',
        message: 'Invalid QR signature or corrupted ticket payload'
      });
    }

    const { eventId, attendeeId, qrVersion } = verified;
    const attendee = db.getAttendee(attendeeId);
    const evt = db.getEvent(eventId);
    const gateObj = (evt?.gates || []).find(g => g.id === gateId);

    if (!attendee) {
      return res.json({
        success: false,
        result: 'ATTENDEE_NOT_FOUND',
        message: 'Attendee credential not found in registry'
      });
    }

    // Check version
    if (qrVersion < (attendee.qrVersion || 1)) {
      const scanRecord = db.recordScan({
        eventId,
        attendeeId: attendee.id,
        delegateId: attendee.delegateId,
        attendeeName: attendee.name,
        tier: attendee.tier,
        company: attendee.company,
        attendantName: attendantName || 'Attendant',
        gateId,
        gateName: gateObj?.name || 'Gate Station',
        result: 'OLD_QR_VERSION',
        phase: evt?.phase || 'LIVE_GATES_OPEN'
      });

      wsManager.broadcast('LIVE_SCAN_EVENT', {
        scanRecord,
        analytics: calculateAnalytics(eventId)
      });

      return res.json({
        success: false,
        result: 'OLD_QR_VERSION',
        message: `REJECTED: Old QR Code (v${qrVersion}). Ticket was reissued to v${attendee.qrVersion}.`,
        attendee
      });
    }

    // Check phase
    if (evt?.phase === 'PRE_EVENT_TEST') {
      const scanRecord = db.recordScan({
        eventId,
        attendeeId: attendee.id,
        delegateId: attendee.delegateId,
        attendeeName: attendee.name,
        tier: attendee.tier,
        company: attendee.company,
        attendantName: attendantName || 'Attendant',
        gateId,
        gateName: gateObj?.name || 'Gate Station',
        result: 'TEST_SCAN_OK',
        phase: 'PRE_EVENT_TEST'
      });

      wsManager.broadcast('LIVE_SCAN_EVENT', {
        scanRecord,
        analytics: calculateAnalytics(eventId)
      });

      return res.json({
        success: true,
        result: 'TEST_SCAN_OK',
        message: 'Pre-Event Test Scan Successful (Simulated)',
        attendee
      });
    }

    // Check if already checked in
    if (attendee.status === 'CHECKED_IN') {
      const scanRecord = db.recordScan({
        eventId,
        attendeeId: attendee.id,
        delegateId: attendee.delegateId,
        attendeeName: attendee.name,
        tier: attendee.tier,
        company: attendee.company,
        attendantName: attendantName || 'Attendant',
        gateId,
        gateName: gateObj?.name || 'Gate Station',
        result: 'DUPLICATE_SCAN',
        phase: evt?.phase || 'LIVE_GATES_OPEN'
      });

      wsManager.broadcast('LIVE_SCAN_EVENT', {
        scanRecord,
        analytics: calculateAnalytics(eventId)
      });

      return res.json({
        success: false,
        result: 'DUPLICATE_SCAN',
        message: `ALERT: Already checked in at ${new Date(attendee.checkedInAt).toLocaleTimeString()} by ${attendee.checkedInBy}`,
        attendee
      });
    }

    // Success checkin
    const scanRecord = db.recordScan({
      eventId,
      attendeeId: attendee.id,
      delegateId: attendee.delegateId,
      attendeeName: attendee.name,
      tier: attendee.tier,
      company: attendee.company,
      attendantName: attendantName || 'Attendant',
      gateId,
      gateName: gateObj?.name || 'Gate Station',
      result: 'VALID_CHECKIN',
      phase: evt?.phase || 'LIVE_GATES_OPEN'
    });

    wsManager.broadcast('LIVE_SCAN_EVENT', {
      scanRecord,
      analytics: calculateAnalytics(eventId)
    });

    res.json({
      success: true,
      result: 'VALID_CHECKIN',
      message: `Access Granted! Welcome ${attendee.name} (${attendee.tier})`,
      attendee
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Users & Gate Allocation APIs
router.get('/users', (req, res) => {
  res.json({ success: true, users: db.getUsers() });
});

router.post('/users', (req, res) => {
  try {
    const newUser = db.addUser(req.body);
    wsManager.broadcast('USER_UPDATED', { user: newUser, users: db.getUsers() });
    res.json({ success: true, user: newUser });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/users/:id/gate', (req, res) => {
  try {
    const { gateId } = req.body;
    const updatedUser = db.updateUserGate(req.params.id, gateId);
    if (!updatedUser) return res.status(404).json({ success: false, error: 'User not found or not an attendant' });

    wsManager.broadcast('USER_UPDATED', { user: updatedUser, users: db.getUsers() });
    res.json({ success: true, user: updatedUser });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
