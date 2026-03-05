/**
 * FreeLang json Module: JSON 처리
 * 15개 함수 (파싱, 직렬화, 검증, 조작)
 */

// ============================================================================
// 기본 파싱/직렬화 (4개 함수)
// ============================================================================

/**
 * JSON 문자열 파싱
 * @param {string} jsonStr - JSON 문자열
 * @returns {any} 파싱된 객체
 */
function parse(jsonStr) {
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    throw new Error(`JSON parse error: ${e.message}`);
  }
}

/**
 * 객체를 JSON 문자열로 직렬화
 * @param {any} obj - 객체
 * @param {boolean} pretty - 예쁜 출력 (기본: false)
 * @returns {string} JSON 문자열
 */
function stringify(obj, pretty = false) {
  try {
    if (pretty) {
      return JSON.stringify(obj, null, 2);
    }
    return JSON.stringify(obj);
  } catch (e) {
    throw new Error(`JSON stringify error: ${e.message}`);
  }
}

/**
 * JSON 유효성 확인
 * @param {string} jsonStr - JSON 문자열
 * @returns {boolean}
 */
function isValid(jsonStr) {
  try {
    JSON.parse(jsonStr);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * JSON 정규화 (정렬 + 정렬된 키)
 * @param {any} obj - 객체
 * @returns {string}
 */
function normalize(obj) {
  const sorted = sortKeys(obj);
  return JSON.stringify(sorted);
}

// ============================================================================
// 객체 조작 (6개 함수)
// ============================================================================

/**
 * 깊은 복사 (Deep Clone)
 * @param {any} obj - 객체
 * @returns {any}
 */
function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * 객체 병합
 * @param {object} obj1 - 첫 번째 객체
 * @param {object} obj2 - 두 번째 객체
 * @returns {object} 병합된 객체
 */
function merge(obj1, obj2) {
  return { ...obj1, ...obj2 };
}

/**
 * 중첩 병합 (Deep Merge)
 * @param {object} obj1 - 첫 번째 객체
 * @param {object} obj2 - 두 번째 객체
 * @returns {object}
 */
function deepMerge(obj1, obj2) {
  const result = { ...obj1 };
  for (const key of Object.keys(obj2)) {
    if (typeof obj2[key] === 'object' && obj2[key] !== null && typeof result[key] === 'object' && result[key] !== null) {
      result[key] = deepMerge(result[key], obj2[key]);
    } else {
      result[key] = obj2[key];
    }
  }
  return result;
}

/**
 * 특정 경로 값 추출 (경로: "a.b.c")
 * @param {object} obj - 객체
 * @param {string} path - 경로
 * @param {any} defaultValue - 기본값
 * @returns {any}
 */
function get(obj, path, defaultValue = null) {
  const keys = path.split('.');
  let current = obj;
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return defaultValue;
    }
  }
  return current;
}

/**
 * 특정 경로에 값 설정
 * @param {object} obj - 객체
 * @param {string} path - 경로
 * @param {any} value - 설정할 값
 * @returns {object} 수정된 객체
 */
function set(obj, path, value) {
  const keys = path.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  current[keys[keys.length - 1]] = value;
  return obj;
}

/**
 * 특정 경로 값 제거
 * @param {object} obj - 객체
 * @param {string} path - 경로
 * @returns {object}
 */
function unset(obj, path) {
  const keys = path.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!(keys[i] in current)) return obj;
    current = current[keys[i]];
  }
  delete current[keys[keys.length - 1]];
  return obj;
}

// ============================================================================
// 검증 (3개 함수)
// ============================================================================

/**
 * JSON 스키마 검증 (간단한 타입 체크)
 * @param {any} obj - 검증할 객체
 * @param {object} schema - 스키마 {key: type, ...}
 * @returns {boolean}
 */
function validate(obj, schema) {
  if (typeof obj !== 'object' || obj === null) return false;
  for (const [key, expectedType] of Object.entries(schema)) {
    if (!(key in obj)) return false;
    const actualType = typeof obj[key];
    if (actualType !== expectedType && expectedType !== 'any') return false;
  }
  return true;
}

/**
 * 필수 필드 확인
 * @param {object} obj - 객체
 * @param {string[]} requiredFields - 필수 필드 배열
 * @returns {boolean}
 */
function hasRequiredFields(obj, requiredFields) {
  for (const field of requiredFields) {
    if (!(field in obj) || obj[field] === null || obj[field] === undefined) {
      return false;
    }
  }
  return true;
}

/**
 * 필드 타입 확인
 * @param {object} obj - 객체
 * @param {string} field - 필드명
 * @param {string} expectedType - 예상 타입
 * @returns {boolean}
 */
function isType(obj, field, expectedType) {
  if (!(field in obj)) return false;
  return typeof obj[field] === expectedType;
}

// ============================================================================
// 유틸리티 (2개 함수)
// ============================================================================

/**
 * 키 정렬 (오름차순)
 * @param {any} obj - 객체
 * @returns {any}
 */
function sortKeys(obj) {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return obj;
  }
  const sorted = {};
  const keys = Object.keys(obj).sort();
  for (const key of keys) {
    sorted[key] = sortKeys(obj[key]);
  }
  return sorted;
}

/**
 * 비어있는 필드 제거
 * @param {object} obj - 객체
 * @returns {object}
 */
function compact(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => compact(item)).filter(item => item !== null && item !== undefined);
  }
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined && value !== '') {
      result[key] = compact(value);
    }
  }
  return result;
}

// ============================================================================
// Module Exports
// ============================================================================

module.exports = {
  // 기본 (4개)
  parse,
  stringify,
  isValid,
  normalize,

  // 조작 (6개)
  clone,
  merge,
  deepMerge,
  get,
  set,
  unset,

  // 검증 (3개)
  validate,
  hasRequiredFields,
  isType,

  // 유틸리티 (2개)
  sortKeys,
  compact
};
