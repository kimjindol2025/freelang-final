/**
 * FreeLang regex Module: 정규식 처리
 * 18개 함수 (매칭, 추출, 치환, 검증)
 */

// ============================================================================
// 기본 매칭 (5개 함수)
// ============================================================================

/**
 * 패턴이 일치하는지 확인
 * @param {string} pattern - 정규식 패턴
 * @param {string} str - 대상 문자열
 * @param {string} flags - 플래그 (i, g, m)
 * @returns {boolean}
 */
function test(pattern, str, flags = '') {
  try {
    const regex = new RegExp(pattern, flags);
    return regex.test(str);
  } catch (e) {
    throw new Error(`Regex error: ${e.message}`);
  }
}

/**
 * 첫 번째 일치 찾기
 * @param {string} pattern - 정규식 패턴
 * @param {string} str - 대상 문자열
 * @param {string} flags - 플래그
 * @returns {object|null} {match, index, groups} 또는 null
 */
function exec(pattern, str, flags = '') {
  try {
    const regex = new RegExp(pattern, flags);
    const result = regex.exec(str);
    if (!result) return null;
    return {
      match: result[0],
      index: result.index,
      groups: result.slice(1)
    };
  } catch (e) {
    throw new Error(`Regex error: ${e.message}`);
  }
}

/**
 * 모든 일치 찾기
 * @param {string} pattern - 정규식 패턴
 * @param {string} str - 대상 문자열
 * @param {string} flags - 플래그
 * @returns {object[]} [{match, index}, ...]
 */
function matchAll(pattern, str, flags = 'g') {
  try {
    const regex = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g');
    const results = [];
    let match;
    while ((match = regex.exec(str)) !== null) {
      results.push({
        match: match[0],
        index: match.index,
        groups: match.slice(1)
      });
    }
    return results;
  } catch (e) {
    throw new Error(`Regex error: ${e.message}`);
  }
}

/**
 * 문자열에서 첫 번째 일치 추출
 * @param {string} pattern - 정규식 패턴
 * @param {string} str - 대상 문자열
 * @returns {string|null}
 */
function match(pattern, str) {
  try {
    const result = str.match(new RegExp(pattern));
    return result ? result[0] : null;
  } catch (e) {
    throw new Error(`Regex error: ${e.message}`);
  }
}

/**
 * 문자열이 패턴으로 시작하는지 확인
 * @param {string} pattern - 정규식 패턴
 * @param {string} str - 대상 문자열
 * @returns {boolean}
 */
function startsWith(pattern, str) {
  try {
    const regex = new RegExp(`^${pattern}`);
    return regex.test(str);
  } catch (e) {
    return false;
  }
}

// ============================================================================
// 치환 (5개 함수)
// ============================================================================

/**
 * 첫 번째 일치 치환
 * @param {string} pattern - 정규식 패턴
 * @param {string} str - 대상 문자열
 * @param {string} replacement - 치환 문자열
 * @returns {string}
 */
function replace(pattern, str, replacement) {
  try {
    return str.replace(new RegExp(pattern), replacement);
  } catch (e) {
    throw new Error(`Regex error: ${e.message}`);
  }
}

/**
 * 모든 일치 치환
 * @param {string} pattern - 정규식 패턴
 * @param {string} str - 대상 문자열
 * @param {string} replacement - 치환 문자열
 * @returns {string}
 */
function replaceAll(pattern, str, replacement) {
  try {
    const regex = new RegExp(pattern, 'g');
    return str.replace(regex, replacement);
  } catch (e) {
    throw new Error(`Regex error: ${e.message}`);
  }
}

/**
 * 함수를 이용한 치환
 * @param {string} pattern - 정규식 패턴
 * @param {string} str - 대상 문자열
 * @param {function} replaceFn - 치환 함수
 * @returns {string}
 */
function replaceWith(pattern, str, replaceFn) {
  try {
    const regex = new RegExp(pattern, 'g');
    return str.replace(regex, replaceFn);
  } catch (e) {
    throw new Error(`Regex error: ${e.message}`);
  }
}

/**
 * 분할 (Split)
 * @param {string} pattern - 정규식 패턴
 * @param {string} str - 대상 문자열
 * @param {number} limit - 최대 분할 수 (선택사항)
 * @returns {string[]}
 */
function split(pattern, str, limit = undefined) {
  try {
    return str.split(new RegExp(pattern), limit);
  } catch (e) {
    throw new Error(`Regex error: ${e.message}`);
  }
}

/**
 * 패턴으로 감싼 문자열 제거
 * @param {string} pattern - 정규식 패턴
 * @param {string} str - 대상 문자열
 * @returns {string}
 */
function trim(pattern, str) {
  try {
    return str.replace(new RegExp(`^${pattern}|${pattern}$`), '');
  } catch (e) {
    throw new Error(`Regex error: ${e.message}`);
  }
}

// ============================================================================
// 검증 (4개 함수)
// ============================================================================

/**
 * 이메일 유효성 확인
 * @param {string} email - 이메일 주소
 * @returns {boolean}
 */
function isEmail(email) {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(String(email));
}

/**
 * URL 유효성 확인
 * @param {string} url - URL
 * @returns {boolean}
 */
function isUrl(url) {
  const pattern = /^https?:\/\/.+/;
  return pattern.test(String(url));
}

/**
 * 숫자만 포함하는지 확인
 * @param {string} str - 문자열
 * @returns {boolean}
 */
function isNumeric(str) {
  return /^\d+$/.test(String(str));
}

/**
 * 알파벳만 포함하는지 확인
 * @param {string} str - 문자열
 * @returns {boolean}
 */
function isAlpha(str) {
  return /^[a-zA-Z]+$/.test(String(str));
}

// ============================================================================
// 추출 (4개 함수)
// ============================================================================

/**
 * 괄호로 감싼 그룹 추출
 * @param {string} pattern - 정규식 패턴 (괄호 포함)
 * @param {string} str - 대상 문자열
 * @returns {string[]|null}
 */
function capture(pattern, str) {
  try {
    const result = str.match(new RegExp(pattern));
    return result ? result.slice(1) : null;
  } catch (e) {
    return null;
  }
}

/**
 * 모든 그룹 추출
 * @param {string} pattern - 정규식 패턴
 * @param {string} str - 대상 문자열
 * @returns {string[][]}
 */
function captureAll(pattern, str) {
  try {
    const regex = new RegExp(pattern, 'g');
    const results = [];
    let match;
    while ((match = regex.exec(str)) !== null) {
      results.push(match.slice(1));
    }
    return results;
  } catch (e) {
    throw new Error(`Regex error: ${e.message}`);
  }
}

/**
 * 숫자 추출
 * @param {string} str - 문자열
 * @returns {number[]}
 */
function extractNumbers(str) {
  const matches = String(str).match(/\d+/g);
  return matches ? matches.map(Number) : [];
}

/**
 * URL 추출
 * @param {string} str - 문자열
 * @returns {string[]}
 */
function extractUrls(str) {
  const matches = String(str).match(/https?:\/\/[^\s]+/g);
  return matches || [];
}

// ============================================================================
// 유틸리티 (1개 함수)
// ============================================================================

/**
 * 정규식 문자 이스케이프
 * @param {string} str - 문자열
 * @returns {string}
 */
function escape(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ============================================================================
// Module Exports
// ============================================================================

module.exports = {
  // 기본 매칭 (5개)
  test,
  exec,
  matchAll,
  match,
  startsWith,

  // 치환 (5개)
  replace,
  replaceAll,
  replaceWith,
  split,
  trim,

  // 검증 (4개)
  isEmail,
  isUrl,
  isNumeric,
  isAlpha,

  // 추출 (4개)
  capture,
  captureAll,
  extractNumbers,
  extractUrls,

  // 유틸리티 (1개)
  escape
};
