/**
 * Phone number utility functions for Indonesian phone number formats
 * Supports multiple input formats and normalizes to +62 international format
 */

/**
 * Normalizes Indonesian phone numbers to +62 international format
 * 
 * Supported input formats:
 * - +62xxxxxx (Indonesian international format)
 * - 08xxxxxx (Local format starting with 08)
 * - 62xxxxxx (International without leading +)
 * 
 * @param phoneNumber - Phone number in any supported format
 * @returns Normalized phone number in +62 format or null if invalid
 */
export function normalizePhoneNumber(phoneNumber: string): string | null {
  if (!phoneNumber) return null;
  
  // Remove all spaces, dashes, and other non-digit characters except +
  const cleaned = phoneNumber.replace(/[\s\-\(\)\.]/g, '');
  
  // Case 1: Already in +62 format
  if (cleaned.startsWith('+62')) {
    const number = cleaned.substring(3);
    if (isValidIndonesianNumber(number)) {
      return '+62' + number;
    }
    return null;
  }
  
  // Case 2: Local format starting with 08
  if (cleaned.startsWith('08')) {
    const number = cleaned.substring(1); // Remove the '0', keep the '8'
    if (isValidIndonesianNumber(number)) {
      return '+62' + number;
    }
    return null;
  }
  
  // Case 3: International format without + (starts with 62)
  if (cleaned.startsWith('62')) {
    const number = cleaned.substring(2);
    if (isValidIndonesianNumber(number)) {
      return '+62' + number;
    }
    return null;
  }
  
  return null;
}

/**
 * Validates if a number part (after country code) is a valid Indonesian mobile number
 * Indonesian mobile numbers typically start with 8 and have 9-12 digits total
 * 
 * @param number - The number part without country code
 * @returns true if valid Indonesian mobile number format
 */
function isValidIndonesianNumber(number: string): boolean {
  // Must start with 8 (Indonesian mobile numbers)
  if (!number.startsWith('8')) return false;
  
  // Must be between 9-12 digits total (8 + 8-11 more digits)
  if (number.length < 9 || number.length > 12) return false;
  
  // Must contain only digits
  if (!/^\d+$/.test(number)) return false;
  
  return true;
}

/**
 * Formats phone number for display purposes
 * Shows in a user-friendly format while maintaining the +62 standard
 * 
 * @param phoneNumber - Phone number in +62 format
 * @returns Formatted phone number for display
 */
export function formatPhoneNumberForDisplay(phoneNumber: string): string {
  if (!phoneNumber) return '';
  
  const normalized = normalizePhoneNumber(phoneNumber);
  if (!normalized) return phoneNumber; // Return original if can't normalize
  
  // Format as +62 8XX-XXXX-XXXX or similar based on length
  const number = normalized.substring(3); // Remove +62
  
  if (number.length === 9) {
    return `+62 ${number.substring(0, 3)}-${number.substring(3, 6)}-${number.substring(6)}`;
  } else if (number.length === 10) {
    return `+62 ${number.substring(0, 3)}-${number.substring(3, 7)}-${number.substring(7)}`;
  } else if (number.length === 11) {
    return `+62 ${number.substring(0, 3)}-${number.substring(3, 7)}-${number.substring(7)}`;
  } else if (number.length === 12) {
    return `+62 ${number.substring(0, 3)}-${number.substring(3, 7)}-${number.substring(7)}`;
  }
  
  return normalized; // Fallback to normalized format
}

/**
 * Validates phone number input and returns validation result
 * 
 * @param phoneNumber - Phone number to validate
 * @returns Object with isValid boolean and error message if invalid
 */
export function validatePhoneNumber(phoneNumber: string): { isValid: boolean; error?: string } {
  if (!phoneNumber) {
    return { isValid: false, error: 'Phone number is required' };
  }
  
  const normalized = normalizePhoneNumber(phoneNumber);
  
  if (!normalized) {
    return { 
      isValid: false, 
      error: 'Invalid phone number. Use the +62 format, e.g. +62812345678' 
    };
  }
  
  return { isValid: true };
}

/**
 * Gets phone number input placeholder text
 * 
 * @returns Placeholder text showing the canonical format (+62)
 */
export function getPhoneNumberPlaceholder(): string {
  return '+62812345678';
}

/**
 * Converts local format (08xxxxx) to display format for user
 * Useful for showing users their number in familiar local format
 * 
 * @param phoneNumber - Phone number in +62 format
 * @returns Phone number in local 08xxxxx format
 */
export function toLocalFormat(phoneNumber: string): string {
  const normalized = normalizePhoneNumber(phoneNumber);
  if (!normalized) return phoneNumber;
  
  // Convert +628xxxxx to 08xxxxx
  return '0' + normalized.substring(3);
}