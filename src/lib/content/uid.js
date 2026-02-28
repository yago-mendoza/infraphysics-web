// UID generation for fieldnotes
// Browser-safe — uses crypto.getRandomValues (available in both Node 19+ and browsers)

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const UID_LENGTH = 8;

/**
 * Generate a random 8-char alphanumeric UID.
 * @param {Set<string>} [existingUids] - set of already-used UIDs to avoid collisions
 * @returns {string}
 */
export function generateUid(existingUids) {
  const existing = existingUids || new Set();
  let uid;
  do {
    const bytes = new Uint8Array(UID_LENGTH);
    // Works in both Node (globalThis.crypto) and browsers (window.crypto)
    (globalThis.crypto || crypto).getRandomValues(bytes);
    uid = '';
    for (let i = 0; i < UID_LENGTH; i++) {
      uid += ALPHABET[bytes[i] % ALPHABET.length];
    }
  } while (existing.has(uid));
  return uid;
}
