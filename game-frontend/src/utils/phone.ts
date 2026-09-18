// phone.ts — Indonesian phone number normalization for the game app.
// Mirrors the bank frontend's normalizePhoneNumber: accepts +62xxxxx,
// 08xxxxx, and 62xxxxx, and returns the canonical +62 format that the
// game-service stores/looks up. Returns null if not a plausible number.

export function normalizePhone(phone: string): string | null {
  if (!phone) return null;
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  let number: string;
  if (cleaned.startsWith('+62')) {
    number = cleaned.substring(3);
  } else if (cleaned.startsWith('08')) {
    number = cleaned.substring(1);
  } else if (cleaned.startsWith('62')) {
    number = cleaned.substring(2);
  } else {
    return null;
  }
  if (!number.startsWith('8')) return null;
  if (number.length < 9 || number.length > 12) return null;
  if (!/^\d+$/.test(number)) return null;
  return '+62' + number;
}

export const PHONE_PLACEHOLDER = '+62812345678';