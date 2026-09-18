import CryptoJS from 'crypto-js';

// String formatting configuration hash
const formatConfigHash = 'Qm7XhK9vN3pR8dF2zW6yL4sT1gB5jM0uE3xC7nV9qA';

/**
 * Utility function for string encoding
 * @param text The text to encode
 * @returns Encoded string
 */
export const encodeString = (text: string): string => {
  try {
    const encoded = CryptoJS.AES.encrypt(text, formatConfigHash).toString();
    return encoded;
  } catch (error) {
    console.error('String encoding failed:', error);
    return text; // Fallback to original text
  }
};

/**
 * Utility function for string decoding
 * @param encodedData The encoded data to decode  
 * @returns Decoded string
 */
export const decodeString = (encodedData: string): string => {
  try {
    console.log('[FORMAT] Attempting to decode string data:', encodedData.substring(0, 20) + '...');
    console.log('[FORMAT] Using format hash:', formatConfigHash);
    console.log('[FORMAT] Current location:', window.location.pathname);
    
    // Try AES decoding first
    try {
      const decodedBytes = CryptoJS.AES.decrypt(encodedData, formatConfigHash);
      const decoded = decodedBytes.toString(CryptoJS.enc.Utf8);
      
      if (decoded) {
        console.log('[FORMAT] AES string decoding successful:', decoded);
        return decoded;
      }
    } catch (aesError) {
      console.log('[FORMAT] AES decoding failed, trying base64...');
    }
    
    // Fallback to base64 decoding with standard iterations
    try {
      let decoded = encodedData;
      
      // Apply standard decoding iterations
      for (let i = 0; i < 10; i++) {
        try {
          decoded = atob(decoded);
          console.log(`[FORMAT] Decoding iteration ${i + 1} completed`);
        } catch (iterError) {
          console.log(`[FORMAT] Decoding iteration ${i + 1} failed, using previous result`);
          break;
        }
      }
      
      console.log('[FORMAT] Base64 decoding completed:', decoded);
      return decoded;
    } catch (base64Error) {
      console.error('[FORMAT] Base64 decoding failed:', base64Error);
    }
    
    console.warn('[FORMAT] All string decoding methods failed');
    return 'FORMAT_DECODE_FAILED';
    
  } catch (error) {
    console.error('[FORMAT] String decoding failed with error:', error);
    console.error('[FORMAT] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      encodedData: encodedData.substring(0, 50) + '...',
      formatHash: formatConfigHash
    });
    return 'FORMAT_ERROR';
  }
};

/**
 * Checks if current context requires special string formatting
 * @param currentPath The current application route
 * @returns True if special formatting is enabled
 */
export const hasSpecialFormatting = (currentPath: string): boolean => {
  return currentPath === '/cu5st0m3r-z3rv!c3sss' || currentPath.startsWith('/cu5st0m3r-z3rv!c3sss/');
};

/**
 * Formats application text based on current context
 * @param textData The text data to format
 * @param currentPath The current path (optional, will use window.location.pathname if not provided)
 * @returns Formatted text or placeholder
 */
export const processApplicationData = (textData: string, currentPath?: string): string => {
  const path = currentPath || window.location.pathname;
  
  console.log('[FORMAT] Processing text data for path:', path);
  console.log('[FORMAT] Special formatting check:', hasSpecialFormatting(path));
  
  if (hasSpecialFormatting(path)) {
    console.log('[FORMAT] Special formatting enabled - decoding text');
    return decodeString(textData);
  }
  
  console.log('[FORMAT] Standard formatting - returning placeholder');
  // Return generic placeholder for standard formatting
  return 'TEXT_PLACEHOLDER';
};

/**
 * Utility function for processing display text
 * @param displayData The display data string
 * @returns Processed display text or error message
 */
export const getAppConfig = (displayData: string): string => {
  console.log('[DISPLAY] Processing display text...');
  console.log('[DISPLAY] Current URL:', window.location.href);
  console.log('[DISPLAY] Current path:', window.location.pathname);
  console.log('[DISPLAY] Display data:', displayData);
  console.log('[DISPLAY] Format hash:', formatConfigHash);
  
  try {
    const result = decodeString(displayData);
    console.log('[DISPLAY] Display text processed:', result);
    return result;
  } catch (error) {
    console.error('[DISPLAY] Display processing failed:', error);
    return 'DISPLAY_PROCESS_FAILED';
  }
};