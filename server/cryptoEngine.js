import crypto from 'crypto';

// Secret key for HMAC signing and AES payload encryption
const SECRET_KEY = process.env.GATEPASS_SECRET || 'gatepass-secure-hmac-secret-2026-key-v1-super-secret';
const ENCRYPTION_KEY = crypto.createHash('sha256').update(SECRET_KEY).digest(); // 32 bytes

/**
 * Encrypts payload string using AES-256-CBC
 */
export function encryptPayload(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts AES-256-CBC ciphertext
 */
export function decryptPayload(encryptedText) {
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 2) return null;
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    return null;
  }
}

/**
 * Generates HMAC-SHA256 signature for a message
 */
export function generateHmac(message) {
  return crypto
    .createHmac('sha256', SECRET_KEY)
    .update(message)
    .digest('hex')
    .substring(0, 16); // 16-char truncated hex signature
}

/**
 * Constructs an encrypted & signed QR payload for a ticket
 * Format: GP1.{eventId}.{attendeeId}.{version}.{hmacSig}.{encryptedPayload}
 */
export function generateQrPayload(eventId, attendeeId, version = 1, metadata = {}) {
  const payloadData = JSON.stringify({
    e: eventId,
    a: attendeeId,
    v: version,
    t: Date.now(),
    m: metadata
  });

  const encryptedData = encryptPayload(payloadData);
  const signatureBase = `${eventId}:${attendeeId}:${version}:${encryptedData}`;
  const hmacSig = generateHmac(signatureBase);

  return `GP1.${eventId}.${attendeeId}.${version}.${hmacSig}.${encryptedData}`;
}

/**
 * Parses and verifies an incoming QR payload string
 */
export function verifyQrPayload(qrString) {
  if (!qrString || typeof qrString !== 'string') {
    return { valid: false, error: 'Empty or invalid payload structure' };
  }

  const parts = qrString.split('.');
  if (parts.length !== 6 || parts[0] !== 'GP1') {
    return { valid: false, error: 'Malformed QR code signature format' };
  }

  const [prefix, eventId, attendeeId, versionStr, providedHmac, encryptedData] = parts;
  const version = parseInt(versionStr, 10);

  // 1. Verify HMAC Signature
  const signatureBase = `${eventId}:${attendeeId}:${version}:${encryptedData}`;
  const expectedHmac = generateHmac(signatureBase);

  if (providedHmac !== expectedHmac) {
    return { 
      valid: false, 
      tampered: true, 
      error: 'CRITICAL WARNING: Tampered or forged QR code signature detected!' 
    };
  }

  // 2. Decrypt Payload
  const decryptedStr = decryptPayload(encryptedData);
  if (!decryptedStr) {
    return { valid: false, error: 'Failed to decrypt QR payload payload contents' };
  }

  try {
    const payload = JSON.parse(decryptedStr);
    return {
      valid: true,
      eventId,
      attendeeId,
      version,
      timestamp: payload.t,
      metadata: payload.m || {}
    };
  } catch (err) {
    return { valid: false, error: 'Invalid JSON structure inside QR code' };
  }
}
