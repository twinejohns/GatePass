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
      activeAttendantsList: activeAttendants.map(u => ({ name: u.name, status: u.status }))
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
    capacity: evt?.capacity || 1000,
    phase: evt?.phase || 'LIVE_GATES_OPEN',
    gateStats,
    tierStats,
    recentScans: scans.slice(0, 15)
  };
}

// Events
router.get('/events', (req, res) => {
  res.json({ success: true, events: db.getEvents() });
});

// GET Event Analytics Endpoint
router.get('/events/:id/analytics', (req, res) => {
  const analytics = calculateAnalytics(req.params.id);
  res.json({ success: true, analytics });
});

router.get('/events/:id', (req, res) => {
  const event = db.getEvent(req.params.id);
  if (!event) return res.status(404).json({ success: false, error: 'Event not found' });
  const analytics = calculateAnalytics(req.params.id);
  res.json({ success: true, event, analytics });
});

// Manager Update Event Details & ID Format Pattern
router.put('/events/:id', (req, res) => {
  const updatedEvent = db.updateEventDetails(req.params.id, req.body);
  if (!updatedEvent) return res.status(404).json({ success: false, error: 'Event not found' });

  wsManager.broadcast('EVENT_UPDATED', {
    event: updatedEvent,
    analytics: calculateAnalytics(req.params.id)
  });

  res.json({ success: true, event: updatedEvent });
});

router.post('/events/:id/phase', (req, res) => {
  const { phase } = req.body;
  const updatedEvent = db.updateEventPhase(req.params.id, phase);
  wsManager.broadcast('PHASE_CHANGE_EVENT', {
    eventId: req.params.id,
    phase,
    analytics: calculateAnalytics(req.params.id)
  });
  res.json({ success: true, event: updatedEvent });
});

// Templates
router.get('/events/:id/template', (req, res) => {
  res.json({ success: true, template: db.getTicketTemplate(req.params.id) });
});

router.post('/events/:id/template', (req, res) => {
  const savedTemplate = db.saveTicketTemplate({ eventId: req.params.id, ...req.body });
  res.json({ success: true, template: savedTemplate });
});

// Invitation Canvas Overlay Template
router.get('/events/:id/invitation-studio', (req, res) => {
  res.json({ success: true, template: db.getInvitationTemplate(req.params.id) });
});

router.post('/events/:id/invitation-studio', (req, res) => {
  const saved = db.saveInvitationTemplate({ eventId: req.params.id, ...req.body });
  res.json({ success: true, template: saved });
});

// Attendees CRUD
router.get('/events/:id/attendees', (req, res) => {
  res.json({ success: true, attendees: db.getAttendees(req.params.id) });
});

// Add Single Attendee
router.post('/events/:id/attendees', (req, res) => {
  const newAttendee = db.addSingleAttendee(req.params.id, req.body);
  wsManager.broadcast('ATTENDEES_UPDATED', {
    eventId: req.params.id,
    analytics: calculateAnalytics(req.params.id)
  });
  res.json({ success: true, attendee: newAttendee });
});

// Edit Attendee Record
router.put('/attendees/:id', (req, res) => {
  const updated = db.updateAttendee(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, error: 'Attendee not found' });
  wsManager.broadcast('ATTENDEES_UPDATED', {
    eventId: updated.eventId,
    analytics: calculateAnalytics(updated.eventId)
  });
  res.json({ success: true, attendee: updated });
});

// Bulk Import / Update
router.post('/events/:id/attendees/bulk', (req, res) => {
  const { attendees } = req.body;
  const created = db.addAttendeesBulk(req.params.id, attendees);
  wsManager.broadcast('ATTENDEES_UPDATED', {
    eventId: req.params.id,
    analytics: calculateAnalytics(req.params.id)
  });
  res.json({ success: true, importedCount: created.length, attendees: created });
});

// Bulk Email Pass Dispatcher
router.post('/events/:id/send-emails-bulk', (req, res) => {
  const { attendeeIds, subject } = req.body;
  if (!Array.isArray(attendeeIds) || attendeeIds.length === 0) {
    return res.status(400).json({ success: false, error: 'No attendees selected for email dispatch' });
  }

  const updatedAttendees = db.markEmailsSent(attendeeIds);
  wsManager.broadcast('ATTENDEES_UPDATED', {
    eventId: req.params.id,
    analytics: calculateAnalytics(req.params.id)
  });

  res.json({
    success: true,
    dispatchedCount: updatedAttendees.length,
    message: `✉️ Bulk email dispatch complete! Sent ${updatedAttendees.length} digital passes.`
  });
});

// Bulk Vector QR Code Asset Exporter
router.get('/events/:id/export-vector-qrs', async (req, res) => {
  const attendees = db.getAttendees(req.params.id);
  const vectorAssets = [];

  for (const att of attendees) {
    const qrString = generateQrPayload(att.eventId, att.id, att.qrVersion);
    let svgData = '';
    try {
      svgData = await QRCode.toString(qrString, { type: 'svg', margin: 2, width: 300 });
    } catch (err) {
      console.error(err);
    }
    vectorAssets.push({
      id: att.id,
      delegateId: att.delegateId || att.id,
      name: att.name,
      email: att.email,
      company: att.company,
      tier: att.tier,
      qrString,
      svgData
    });
  }

  res.json({ success: true, vectorAssets });
});

// Digital Pass Card
router.get('/tickets/:attendeeId/pass', async (req, res) => {
  const attendee = db.getAttendee(req.params.attendeeId);
  if (!attendee) return res.status(404).json({ success: false, error: 'Attendee not found' });

  const event = db.getEvent(attendee.eventId);
  const template = db.getTicketTemplate(attendee.eventId);
  const qrString = generateQrPayload(attendee.eventId, attendee.id, attendee.qrVersion);

  let qrDataUrl = '';
  try {
    qrDataUrl = await QRCode.toDataURL(qrString, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 400
    });
  } catch (err) {
    console.error(err);
  }

  res.json({
    success: true,
    pass: {
      attendee,
      event,
      template,
      qrString,
      qrDataUrl
    }
  });
});

// Scanner Verification Endpoint
router.post('/scan', (req, res) => {
  const { qrPayload, gateId, attendantName } = req.body;
  if (!qrPayload) return res.status(400).json({ success: false, error: 'QR Payload required' });

  const verification = verifyQrPayload(qrPayload);
  if (!verification.valid) {
    const scanLog = db.recordScan({
      eventId: 'unknown',
      attendeeId: null,
      attendeeName: 'Unknown / Suspicious',
      tier: 'N/A',
      company: 'N/A',
      attendantName: attendantName || 'Gate Scanner',
      gateId: gateId || 'gate_a',
      gateName: gateId || 'Gate Scanner',
      result: verification.tampered ? 'TAMPERED_CODE' : 'MALFORMED_CODE',
      phase: 'LIVE_GATES_OPEN',
      note: verification.error
    });

    wsManager.broadcast('LIVE_SCAN_EVENT', { scanLog });
    return res.json({
      success: false,
      result: verification.tampered ? 'TAMPERED_CODE' : 'MALFORMED_CODE',
      error: verification.error,
      scanLog
    });
  }

  const { eventId, attendeeId, version } = verification;
  const event = db.getEvent(eventId);
  const attendee = db.getAttendee(attendeeId);

  if (!event || !attendee) {
    const scanLog = db.recordScan({
      eventId,
      attendeeId,
      attendeeName: 'Unregistered',
      tier: 'N/A',
      company: 'N/A',
      attendantName: attendantName || 'Gate Scanner',
      gateId: gateId || 'gate_a',
      gateName: gateId || 'Gate Scanner',
      result: 'NOT_FOUND',
      phase: event?.phase || 'UNKNOWN'
    });
    wsManager.broadcast('LIVE_SCAN_EVENT', { scanLog });
    return res.json({ success: false, result: 'NOT_FOUND', error: 'Ticket record not found' });
  }

  const gateObj = (event.gates || []).find(g => g.id === gateId) || { name: gateId || 'Main Gate' };

  if (event.phase === 'PRE_EVENT_TEST') {
    const scanLog = db.recordScan({
      eventId,
      attendeeId,
      delegateId: attendee.delegateId,
      attendeeName: attendee.name,
      tier: attendee.tier,
      company: attendee.company,
      attendantName: attendantName || 'Gate Scanner',
      gateId: gateId || 'gate_a',
      gateName: gateObj.name,
      result: 'TEST_SCAN_OK',
      phase: 'PRE_EVENT_TEST'
    });

    wsManager.broadcast('LIVE_SCAN_EVENT', { scanLog, analytics: calculateAnalytics(eventId) });

    return res.json({
      success: true,
      result: 'TEST_SCAN_OK',
      message: '🧪 PRE-EVENT TEST PASSED: QR Code signature authentic! (No live check-in recorded)',
      attendee,
      scanLog
    });
  }

  if (event.phase === 'CLOSED') {
    const scanLog = db.recordScan({
      eventId,
      attendeeId,
      delegateId: attendee.delegateId,
      attendeeName: attendee.name,
      tier: attendee.tier,
      company: attendee.company,
      attendantName: attendantName || 'Gate Scanner',
      gateId: gateId || 'gate_a',
      gateName: gateObj.name,
      result: 'EXPIRED_EVENT',
      phase: 'CLOSED'
    });

    wsManager.broadcast('LIVE_SCAN_EVENT', { scanLog, analytics: calculateAnalytics(eventId) });

    return res.json({
      success: false,
      result: 'EXPIRED_EVENT',
      error: '🔴 EVENT IS CLOSED: Gates are no longer open for ticket validation.',
      attendee,
      scanLog
    });
  }

  if (version < attendee.qrVersion) {
    const scanLog = db.recordScan({
      eventId,
      attendeeId,
      delegateId: attendee.delegateId,
      attendeeName: attendee.name,
      tier: attendee.tier,
      company: attendee.company,
      attendantName: attendantName || 'Gate Scanner',
      gateId: gateId || 'gate_a',
      gateName: gateObj.name,
      result: 'REVOKED_CODE_REISSUED',
      phase: event.phase
    });

    wsManager.broadcast('LIVE_SCAN_EVENT', { scanLog, analytics: calculateAnalytics(eventId) });

    return res.json({
      success: false,
      result: 'REVOKED_CODE_REISSUED',
      error: `⚠️ REVOKED PASS: This QR code (v${version}) has been invalidated because a newer ticket (v${attendee.qrVersion}) was issued!`,
      attendee,
      scanLog
    });
  }

  if (attendee.status === 'CHECKED_IN') {
    const scanLog = db.recordScan({
      eventId,
      attendeeId,
      delegateId: attendee.delegateId,
      attendeeName: attendee.name,
      tier: attendee.tier,
      company: attendee.company,
      attendantName: attendantName || 'Gate Scanner',
      gateId: gateId || 'gate_a',
      gateName: gateObj.name,
      result: 'DUPLICATE_BLOCKED',
      phase: event.phase
    });

    wsManager.broadcast('LIVE_SCAN_EVENT', { scanLog, analytics: calculateAnalytics(eventId) });

    return res.json({
      success: false,
      result: 'DUPLICATE_BLOCKED',
      error: `⛔ DUPLICATE CHECK-IN BLOCKED: Ticket was already scanned at ${new Date(attendee.checkedInAt).toLocaleTimeString()} by ${attendee.checkedInBy || 'Gate Staff'}!`,
      attendee,
      originalCheckIn: {
        timestamp: attendee.checkedInAt,
        gate: attendee.checkedInGate,
        attendant: attendee.checkedInBy
      },
      scanLog
    });
  }

  // Valid Check-In
  const scanLog = db.recordScan({
    eventId,
    attendeeId,
    delegateId: attendee.delegateId,
    attendeeName: attendee.name,
    tier: attendee.tier,
    company: attendee.company,
    attendantName: attendantName || 'Gate Staff',
    gateId: gateId || 'gate_a',
    gateName: gateObj.name,
    result: 'VALID_CHECKIN',
    phase: event.phase
  });

  const updatedAttendee = db.getAttendee(attendeeId);
  const analytics = calculateAnalytics(eventId);

  wsManager.broadcast('LIVE_SCAN_EVENT', { scanLog, analytics });

  res.json({
    success: true,
    result: 'VALID_CHECKIN',
    message: `✅ ACCESS GRANTED: Welcome ${attendee.name} (${attendee.company || attendee.tier})! [ID: ${attendee.delegateId || attendee.id}]`,
    attendee: updatedAttendee,
    scanLog,
    analytics
  });
});

// Ticket Re-issuance
router.post('/tickets/:attendeeId/reissue', (req, res) => {
  const { managerName, reason } = req.body;
  const result = db.reissueQrCode(req.params.attendeeId, managerName, reason);
  if (!result) return res.status(404).json({ success: false, error: 'Attendee not found' });

  wsManager.broadcast('TICKET_REISSUED', {
    attendee: result.attendee,
    auditEntry: result.auditEntry,
    analytics: calculateAnalytics(result.attendee.eventId)
  });

  res.json({ success: true, ...result });
});

router.get('/events/:id/audit-logs', (req, res) => {
  res.json({ success: true, auditLogs: db.getAuditLogs(req.params.id) });
});

// Users & Gate Allocation
router.get('/users', (req, res) => {
  res.json({ success: true, users: db.getUsers() });
});

router.post('/users', (req, res) => {
  const newUser = db.addUser(req.body);
  res.json({ success: true, user: newUser });
});

router.put('/users/:id/gate', (req, res) => {
  const { gateId } = req.body;
  const updatedUser = db.updateUserGate(req.params.id, gateId);
  if (!updatedUser) return res.status(404).json({ success: false, error: 'Gate Attendant user not found' });

  wsManager.broadcast('USER_UPDATED', {
    user: updatedUser,
    users: db.getUsers()
  });

  res.json({ success: true, user: updatedUser });
});

export default router;
