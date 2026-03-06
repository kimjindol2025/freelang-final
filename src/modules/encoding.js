/**
 * FreeLang encoding Module: 인코딩/디코딩
 * 25개 함수 (Base64, Hex, URL, UTF-8, 데이터 변환)
 */

const crypto = require('crypto');

// ============================================================================
// Base64 (4개 함수)
// ============================================================================

/**
 * Base64 인코딩
 * @param {string} data - 데이터
 * @returns {string} Base64 문자열
 */
function base64Encode(data) {
  return Buffer.from(String(data)).toString('base64');
}

/**
 * Base64 디코딩
 * @param {string} encoded - Base64 문자열
 * @returns {string} 디코딩된 데이터
 */
function base64Decode(encoded) {
  try {
    return Buffer.from(encoded, 'base64').toString();
  } catch (e) {
    throw new Error('Invalid Base64 string');
  }
}

/**
 * Base64 유효성 확인
 * @param {string} encoded - Base64 문자열
 * @returns {boolean}
 */
function isBase64(encoded) {
  try {
    return Buffer.from(encoded, 'base64').toString('base64') === encoded;
  } catch (e) {
    return false;
  }
}

/**
 * Base64url (URL-safe) 인코딩
 * @param {string} data - 데이터
 * @returns {string}
 */
function base64urlEncode(data) {
  return Buffer.from(String(data)).toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// ============================================================================
// Hex (4개 함수)
// ============================================================================

/**
 * Hex 인코딩
 * @param {string} data - 데이터
 * @returns {string} 16진수 문자열
 */
function hexEncode(data) {
  return Buffer.from(String(data)).toString('hex');
}

/**
 * Hex 디코딩
 * @param {string} encoded - 16진수 문자열
 * @returns {string} 디코딩된 데이터
 */
function hexDecode(encoded) {
  try {
    return Buffer.from(encoded, 'hex').toString();
  } catch (e) {
    throw new Error('Invalid hex string');
  }
}

/**
 * Hex 유효성 확인
 * @param {string} encoded - 16진수 문자열
 * @returns {boolean}
 */
function isHex(encoded) {
  return /^[0-9a-fA-F]*$/.test(encoded) && encoded.length % 2 === 0;
}

/**
 * Hex 버퍼로 변환
 * @param {string} hexString - 16진수 문자열
 * @returns {Buffer}
 */
function hexToBuffer(hexString) {
  return Buffer.from(hexString, 'hex');
}

// ============================================================================
// URL 인코딩 (4개 함수)
// ============================================================================

/**
 * URL 인코딩
 * @param {string} data - 데이터
 * @returns {string} URL 인코딩된 문자열
 */
function urlEncode(data) {
  return encodeURIComponent(String(data));
}

/**
 * URL 디코딩
 * @param {string} encoded - URL 인코딩된 문자열
 * @returns {string} 디코딩된 데이터
 */
function urlDecode(encoded) {
  try {
    return decodeURIComponent(encoded);
  } catch (e) {
    throw new Error('Invalid URL encoding');
  }
}

/**
 * URL 컴포넌트 인코딩 (슬래시 포함)
 * @param {string} data - 데이터
 * @returns {string}
 */
function urlPathEncode(data) {
  return String(data).split('/').map(part => encodeURIComponent(part)).join('/');
}

/**
 * Query String 인코딩
 * @param {object} obj - 객체
 * @returns {string}
 */
function queryStringEncode(obj) {
  const parts = [];
  for (const [key, value] of Object.entries(obj)) {
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  }
  return parts.join('&');
}

// ============================================================================
// UTF-8 / ASCII (4개 함수)
// ============================================================================

/**
 * 문자열을 UTF-8 바이트로 변환
 * @param {string} data - 데이터
 * @returns {string} 16진수 문자열
 */
function utf8Encode(data) {
  return Buffer.from(String(data), 'utf8').toString('hex');
}

/**
 * UTF-8 바이트에서 문자열로 변환
 * @param {string} hex - 16진수 문자열
 * @returns {string}
 */
function utf8Decode(hex) {
  return Buffer.from(hex, 'hex').toString('utf8');
}

/**
 * ASCII 인코딩
 * @param {string} data - 데이터
 * @returns {string} 16진수 문자열
 */
function asciiEncode(data) {
  return Buffer.from(String(data), 'ascii').toString('hex');
}

/**
 * ASCII 디코딩
 * @param {string} hex - 16진수 문자열
 * @returns {string}
 */
function asciiDecode(hex) {
  return Buffer.from(hex, 'hex').toString('ascii');
}

// ============================================================================
// 데이터 변환 (5개 함수)
// ============================================================================

/**
 * 버퍼를 문자열로 변환
 * @param {Buffer} buffer - 버퍼
 * @param {string} encoding - 인코딩 (utf8, hex, base64 등)
 * @returns {string}
 */
function bufferToString(buffer, encoding = 'utf8') {
  if (Buffer.isBuffer(buffer)) {
    return buffer.toString(encoding);
  }
  return String(buffer);
}

/**
 * 문자열을 버퍼로 변환
 * @param {string} data - 데이터
 * @param {string} encoding - 인코딩
 * @returns {Buffer}
 */
function stringToBuffer(data, encoding = 'utf8') {
  return Buffer.from(String(data), encoding);
}

/**
 * 배열을 버퍼로 변환
 * @param {number[]} arr - 바이트 배열
 * @returns {Buffer}
 */
function arrayToBuffer(arr) {
  return Buffer.from(Array.isArray(arr) ? arr : []);
}

/**
 * 버퍼를 배열로 변환
 * @param {Buffer} buffer - 버퍼
 * @returns {number[]}
 */
function bufferToArray(buffer) {
  if (Buffer.isBuffer(buffer)) {
    return Array.from(buffer);
  }
  return [];
}

/**
 * 인코딩 변환
 * @param {string} data - 데이터
 * @param {string} fromEncoding - 원본 인코딩
 * @param {string} toEncoding - 대상 인코딩
 * @returns {string}
 */
function convert(data, fromEncoding, toEncoding) {
  try {
    const buffer = Buffer.from(data, fromEncoding);
    return buffer.toString(toEncoding);
  } catch (e) {
    throw new Error(`Conversion error: ${e.message}`);
  }
}

// ============================================================================
// 추가 유틸리티 (4개 함수)
// ============================================================================

/**
 * 데이터 크기 (바이트)
 * @param {string} data - 데이터
 * @returns {number}
 */
function byteLength(data) {
  return Buffer.byteLength(String(data), 'utf8');
}

/**
 * Base32 인코딩
 * @param {string} data - 데이터
 * @returns {string}
 */
function base32Encode(data) {
  const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  const bytes = Buffer.from(String(data));

  for (let i = 0; i < bytes.length; i++) {
    bits += bytes[i].toString(2).padStart(8, '0');
  }

  bits = bits.padEnd(Math.ceil(bits.length / 5) * 5, '0');

  let result = '';
  for (let i = 0; i < bits.length; i += 5) {
    const chunk = bits.substring(i, i + 5);
    result += base32Chars[parseInt(chunk, 2)];
  }

  return result;
}

/**
 * Base32 디코딩
 * @param {string} encoded - Base32 문자열
 * @returns {string}
 */
function base32Decode(encoded) {
  const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';

  for (const char of encoded) {
    const index = base32Chars.indexOf(char.toUpperCase());
    if (index < 0) throw new Error('Invalid Base32 character');
    bits += index.toString(2).padStart(5, '0');
  }

  let result = '';
  bits = bits.slice(0, Math.floor(bits.length / 8) * 8);
  for (let i = 0; i < bits.length; i += 8) {
    const byte = parseInt(bits.substring(i, i + 8), 2);
    result += String.fromCharCode(byte);
  }

  return result;
}

/**
 * HTML 이스케이프
 * @param {string} data - 데이터
 * @returns {string}
 */
function htmlEscape(data) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return String(data).replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * HTML 언이스케이프
 * @param {string} data - 이스케이프된 데이터
 * @returns {string}
 */
function htmlUnescape(data) {
  const map = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'"
  };
  return String(data).replace(/&amp;|&lt;|&gt;|&quot;|&#39;/g, (match) => map[match]);
}

// ============================================================================
// Module Exports
// ============================================================================

module.exports = {
  // Base64 (4개)
  base64Encode,
  base64Decode,
  isBase64,
  base64urlEncode,

  // Hex (4개)
  hexEncode,
  hexDecode,
  isHex,
  hexToBuffer,

  // URL (4개)
  urlEncode,
  urlDecode,
  urlPathEncode,
  queryStringEncode,

  // UTF-8 / ASCII (4개)
  utf8Encode,
  utf8Decode,
  asciiEncode,
  asciiDecode,

  // 데이터 변환 (5개)
  bufferToString,
  stringToBuffer,
  arrayToBuffer,
  bufferToArray,
  convert,

  // 추가 유틸리티 (4개)
  byteLength,
  base32Encode,
  base32Decode,
  htmlEscape,
  htmlUnescape
};
