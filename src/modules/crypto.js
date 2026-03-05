/**
 * FreeLang crypto Module: 암호화
 * 30개 함수 (해시, 대칭, 비대칭 암호화)
 */

const crypto = require('crypto');

// ============================================================================
// Hash 함수 (6개)
// ============================================================================

/**
 * MD5 해시 생성
 * @param {string} data - 데이터
 * @returns {string} 16진수 해시
 */
function md5(data) {
  return crypto.createHash('md5').update(String(data)).digest('hex');
}

/**
 * SHA1 해시 생성
 * @param {string} data - 데이터
 * @returns {string} 16진수 해시
 */
function sha1(data) {
  return crypto.createHash('sha1').update(String(data)).digest('hex');
}

/**
 * SHA256 해시 생성
 * @param {string} data - 데이터
 * @returns {string} 16진수 해시
 */
function sha256(data) {
  return crypto.createHash('sha256').update(String(data)).digest('hex');
}

/**
 * SHA512 해시 생성
 * @param {string} data - 데이터
 * @returns {string} 16진수 해시
 */
function sha512(data) {
  return crypto.createHash('sha512').update(String(data)).digest('hex');
}

/**
 * SHA384 해시 생성
 * @param {string} data - 데이터
 * @returns {string} 16진수 해시
 */
function sha384(data) {
  return crypto.createHash('sha384').update(String(data)).digest('hex');
}

/**
 * HMAC-SHA256 생성
 * @param {string} data - 데이터
 * @param {string} key - 시크릿 키
 * @returns {string} 16진수 해시
 */
function hmacSha256(data, key) {
  return crypto.createHmac('sha256', key).update(String(data)).digest('hex');
}

// ============================================================================
// 대칭 암호화 (8개)
// ============================================================================

/**
 * AES-256-CBC 암호화
 * @param {string} plaintext - 평문
 * @param {string} key - 256비트 키 (32바이트)
 * @param {string} iv - 초기화 벡터 (16바이트)
 * @returns {string} 16진수 암호문
 */
function aesEncrypt(plaintext, key, iv) {
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), Buffer.from(iv));
  let encrypted = cipher.update(plaintext);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return encrypted.toString('hex');
}

/**
 * AES-256-CBC 복호화
 * @param {string} ciphertext - 암호문 (16진수)
 * @param {string} key - 256비트 키
 * @param {string} iv - 초기화 벡터
 * @returns {string} 평문
 */
function aesDecrypt(ciphertext, key, iv) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), Buffer.from(iv));
  let decrypted = decipher.update(Buffer.from(ciphertext, 'hex'));
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

/**
 * AES-128-CBC 암호화
 * @param {string} plaintext - 평문
 * @param {string} key - 128비트 키 (16바이트)
 * @param {string} iv - 초기화 벡터
 * @returns {string} 16진수 암호문
 */
function aes128Encrypt(plaintext, key, iv) {
  const cipher = crypto.createCipheriv('aes-128-cbc', Buffer.from(key), Buffer.from(iv));
  let encrypted = cipher.update(plaintext);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return encrypted.toString('hex');
}

/**
 * AES-128-CBC 복호화
 * @param {string} ciphertext - 암호문 (16진수)
 * @param {string} key - 128비트 키
 * @param {string} iv - 초기화 벡터
 * @returns {string} 평문
 */
function aes128Decrypt(ciphertext, key, iv) {
  const decipher = crypto.createDecipheriv('aes-128-cbc', Buffer.from(key), Buffer.from(iv));
  let decrypted = decipher.update(Buffer.from(ciphertext, 'hex'));
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

/**
 * DES 암호화
 * @param {string} plaintext - 평문
 * @param {string} key - DES 키 (8바이트)
 * @param {string} iv - 초기화 벡터
 * @returns {string} 16진수 암호문
 */
function desEncrypt(plaintext, key, iv) {
  const cipher = crypto.createCipheriv('des-cbc', Buffer.from(key), Buffer.from(iv));
  let encrypted = cipher.update(plaintext);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return encrypted.toString('hex');
}

/**
 * DES 복호화
 * @param {string} ciphertext - 암호문 (16진수)
 * @param {string} key - DES 키
 * @param {string} iv - 초기화 벡터
 * @returns {string} 평문
 */
function desDecrypt(ciphertext, key, iv) {
  const decipher = crypto.createDecipheriv('des-cbc', Buffer.from(key), Buffer.from(iv));
  let decrypted = decipher.update(Buffer.from(ciphertext, 'hex'));
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

// ============================================================================
// 인코딩/디코딩 (8개)
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
  return Buffer.from(encoded, 'base64').toString();
}

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
  return Buffer.from(encoded, 'hex').toString();
}

/**
 * UTF-8 인코딩
 * @param {string} data - 데이터
 * @returns {string} UTF-8 바이트 배열 (16진수)
 */
function utf8Encode(data) {
  return Buffer.from(String(data), 'utf8').toString('hex');
}

/**
 * UTF-8 디코딩
 * @param {string} encoded - 16진수 UTF-8 바이트
 * @returns {string} 텍스트
 */
function utf8Decode(encoded) {
  return Buffer.from(encoded, 'hex').toString('utf8');
}

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
  return decodeURIComponent(encoded);
}

// ============================================================================
// 난수 생성 (6개)
// ============================================================================

/**
 * 암호학적으로 안전한 난수 생성 (정수)
 * @param {number} max - 최댓값
 * @returns {number}
 */
function randomInt(max) {
  return crypto.randomInt(0, max);
}

/**
 * 암호학적으로 안전한 난수 생성 (16진수 문자열)
 * @param {number} bytes - 바이트 수 (기본: 16)
 * @returns {string} 16진수 문자열
 */
function randomHex(bytes = 16) {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * 암호학적으로 안전한 난수 생성 (Base64 문자열)
 * @param {number} bytes - 바이트 수
 * @returns {string} Base64 문자열
 */
function randomBase64(bytes = 16) {
  return crypto.randomBytes(bytes).toString('base64');
}

/**
 * 난수 바이트 생성
 * @param {number} size - 바이트 크기
 * @returns {string} 16진수 문자열
 */
function randomBytes(size) {
  return crypto.randomBytes(size).toString('hex');
}

/**
 * UUID v4 생성
 * @returns {string} UUID
 */
function uuidv4() {
  return crypto.randomUUID();
}

/**
 * 암호학적으로 안전한 문자열 생성
 * @param {number} length - 길이
 * @returns {string} 무작위 문자열
 */
function randomString(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

// ============================================================================
// 키 생성 (2개)
// ============================================================================

/**
 * AES-256 키 생성
 * @returns {string} 32바이트 16진수 문자열
 */
function generateAes256Key() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * IV (초기화 벡터) 생성
 * @returns {string} 16바이트 16진수 문자열
 */
function generateIv() {
  return crypto.randomBytes(16).toString('hex');
}

// ============================================================================
// Module Exports
// ============================================================================

module.exports = {
  // Hash (6개)
  md5,
  sha1,
  sha256,
  sha512,
  sha384,
  hmacSha256,

  // 대칭 암호화 (8개)
  aesEncrypt,
  aesDecrypt,
  aes128Encrypt,
  aes128Decrypt,
  desEncrypt,
  desDecrypt,

  // 인코딩/디코딩 (8개)
  base64Encode,
  base64Decode,
  hexEncode,
  hexDecode,
  utf8Encode,
  utf8Decode,
  urlEncode,
  urlDecode,

  // 난수 생성 (6개)
  randomInt,
  randomHex,
  randomBase64,
  randomBytes,
  uuidv4,
  randomString,

  // 키 생성 (2개)
  generateAes256Key,
  generateIv
};
