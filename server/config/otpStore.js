/**
 * OTP Store
 * Simple in-memory store for OTP codes.
 * Each entry expires after 10 minutes.
 * In production replace with Redis.
 */

const store = new Map(); // email -> { code, expiresAt }

const TTL_MS = 10 * 60 * 1000; // 10 minutes

function set(email, code) {
  store.set(email.toLowerCase(), {
    code,
    expiresAt: Date.now() + TTL_MS,
  });
}

function verify(email, code) {
  const entry = store.get(email.toLowerCase());
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    store.delete(email.toLowerCase());
    return false;
  }
  if (entry.code !== code) return false;
  store.delete(email.toLowerCase()); // one-time use
  return true;
}

module.exports = { set, verify };
