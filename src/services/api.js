const API_BASE = '/api';

async function fetchJson(url, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Server error occurred');
    }
    return data;
  } catch (err) {
    console.error(`API Error [${url}]:`, err);
    throw err;
  }
}

export const api = {
  // Events & Phase
  getEvents: () => fetchJson('/events'),
  getEvent: (id) => fetchJson(`/events/${id}`),
  updateEventPhase: (id, phase) => fetchJson(`/events/${id}/phase`, {
    method: 'POST',
    body: JSON.stringify({ phase })
  }),

  // Ticket Templates
  getTicketTemplate: (id) => fetchJson(`/events/${id}/template`),
  saveTicketTemplate: (id, template) => fetchJson(`/events/${id}/template`, {
    method: 'POST',
    body: JSON.stringify(template)
  }),

  // Custom Invitation Overlay Studio
  getInvitationStudio: (id) => fetchJson(`/events/${id}/invitation-studio`),
  saveInvitationStudio: (id, template) => fetchJson(`/events/${id}/invitation-studio`, {
    method: 'POST',
    body: JSON.stringify(template)
  }),

  // Attendees & CRUD
  getAttendees: (eventId) => fetchJson(`/events/${eventId}/attendees`),
  addSingleAttendee: (eventId, data) => fetchJson(`/events/${eventId}/attendees`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateAttendee: (attendeeId, data) => fetchJson(`/attendees/${attendeeId}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  bulkImportAttendees: (eventId, attendees) => fetchJson(`/events/${eventId}/attendees/bulk`, {
    method: 'POST',
    body: JSON.stringify({ attendees })
  }),

  // Bulk Email Dispatcher
  sendBulkEmails: (eventId, attendeeIds, subject) => fetchJson(`/events/${eventId}/send-emails-bulk`, {
    method: 'POST',
    body: JSON.stringify({ attendeeIds, subject })
  }),

  // Vector QR Export
  exportVectorQrs: (eventId) => fetchJson(`/events/${eventId}/export-vector-qrs`),

  // Digital Ticket Pass
  getTicketPass: (attendeeId) => fetchJson(`/tickets/${attendeeId}/pass`),

  // QR Scanning & Verification
  scanQrCode: (qrPayload, gateId, attendantName) => fetchJson('/scan', {
    method: 'POST',
    body: JSON.stringify({ qrPayload, gateId, attendantName })
  }),

  // Ticket Re-issuance & Audit Log
  reissueTicket: (attendeeId, managerName, reason) => fetchJson(`/tickets/${attendeeId}/reissue`, {
    method: 'POST',
    body: JSON.stringify({ managerName, reason })
  }),
  getAuditLogs: (eventId) => fetchJson(`/events/${eventId}/audit-logs`),

  // Users & Manager Gate Allocation
  getUsers: () => fetchJson('/users'),
  addUser: (userData) => fetchJson('/users', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  updateUserGate: (userId, gateId) => fetchJson(`/users/${userId}/gate`, {
    method: 'PUT',
    body: JSON.stringify({ gateId })
  }),

  // Analytics
  getAnalytics: (eventId) => fetchJson(`/events/${eventId}/analytics`)
};
