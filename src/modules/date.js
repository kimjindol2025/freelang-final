/**
 * FreeLang date Module: 날짜/시간 처리
 * 35개 함수 (생성, 조작, 포맷팅, 계산, 타임존)
 */

// ============================================================================
// 날짜 생성 (5개 함수)
// ============================================================================

/**
 * 현재 시간 (밀리초)
 * @returns {number}
 */
function now() {
  return Date.now();
}

/**
 * 현재 시간 (초)
 * @returns {number}
 */
function timestamp() {
  return Math.floor(Date.now() / 1000);
}

/**
 * Date 객체 생성
 * @param {number|string} year - 연도 또는 ISO 문자열
 * @param {number} month - 월 (1-12)
 * @param {number} date - 일
 * @param {number} hours - 시간 (기본: 0)
 * @param {number} minutes - 분 (기본: 0)
 * @param {number} seconds - 초 (기본: 0)
 * @returns {object} {_date: Date, getTime: fn, ...}
 */
function create(year, month = 1, date = 1, hours = 0, minutes = 0, seconds = 0) {
  let d;
  if (typeof year === 'string') {
    d = new Date(year);
  } else {
    d = new Date(year, month - 1, date, hours, minutes, seconds);
  }

  return {
    _date: d,
    getTime: () => d.getTime(),
    getFullYear: () => d.getFullYear(),
    getMonth: () => d.getMonth() + 1,
    getDate: () => d.getDate(),
    getDay: () => d.getDay(),
    getHours: () => d.getHours(),
    getMinutes: () => d.getMinutes(),
    getSeconds: () => d.getSeconds(),
    getMilliseconds: () => d.getMilliseconds()
  };
}

/**
 * 오늘 날짜 (자정)
 * @returns {object} Date 래퍼 객체
 */
function today() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return {
    _date: d,
    getTime: () => d.getTime(),
    getFullYear: () => d.getFullYear(),
    getMonth: () => d.getMonth() + 1,
    getDate: () => d.getDate(),
    getDay: () => d.getDay(),
    getHours: () => d.getHours(),
    getMinutes: () => d.getMinutes(),
    getSeconds: () => d.getSeconds()
  };
}

/**
 * 내일 날짜 (자정)
 * @returns {object} Date 래퍼 객체
 */
function tomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return {
    _date: d,
    getTime: () => d.getTime(),
    getFullYear: () => d.getFullYear(),
    getMonth: () => d.getMonth() + 1,
    getDate: () => d.getDate(),
    getDay: () => d.getDay(),
    getHours: () => d.getHours(),
    getMinutes: () => d.getMinutes(),
    getSeconds: () => d.getSeconds()
  };
}

// ============================================================================
// 날짜 조작 (10개 함수)
// ============================================================================

/**
 * 연도 추가
 * @param {object} dateObj - Date 객체
 * @param {number} years - 추가할 연도
 * @returns {object} 새로운 Date 객체
 */
function addYears(dateObj, years) {
  const d = new Date(dateObj._date);
  d.setFullYear(d.getFullYear() + years);
  return wrap(d);
}

/**
 * 월 추가
 * @param {object} dateObj - Date 객체
 * @param {number} months - 추가할 월
 * @returns {object}
 */
function addMonths(dateObj, months) {
  const d = new Date(dateObj._date);
  d.setMonth(d.getMonth() + months);
  return wrap(d);
}

/**
 * 일 추가
 * @param {object} dateObj - Date 객체
 * @param {number} days - 추가할 일
 * @returns {object}
 */
function addDays(dateObj, days) {
  const d = new Date(dateObj._date);
  d.setDate(d.getDate() + days);
  return wrap(d);
}

/**
 * 시간 추가
 * @param {object} dateObj - Date 객체
 * @param {number} hours - 추가할 시간
 * @returns {object}
 */
function addHours(dateObj, hours) {
  const d = new Date(dateObj._date);
  d.setHours(d.getHours() + hours);
  return wrap(d);
}

/**
 * 분 추가
 * @param {object} dateObj - Date 객체
 * @param {number} minutes - 추가할 분
 * @returns {object}
 */
function addMinutes(dateObj, minutes) {
  const d = new Date(dateObj._date);
  d.setMinutes(d.getMinutes() + minutes);
  return wrap(d);
}

/**
 * 초 추가
 * @param {object} dateObj - Date 객체
 * @param {number} seconds - 추가할 초
 * @returns {object}
 */
function addSeconds(dateObj, seconds) {
  const d = new Date(dateObj._date);
  d.setSeconds(d.getSeconds() + seconds);
  return wrap(d);
}

/**
 * 연도 설정
 * @param {object} dateObj - Date 객체
 * @param {number} year - 연도
 * @returns {object}
 */
function setYear(dateObj, year) {
  const d = new Date(dateObj._date);
  d.setFullYear(year);
  return wrap(d);
}

/**
 * 월 설정
 * @param {object} dateObj - Date 객체
 * @param {number} month - 월 (1-12)
 * @returns {object}
 */
function setMonth(dateObj, month) {
  const d = new Date(dateObj._date);
  d.setMonth(month - 1);
  return wrap(d);
}

/**
 * 일 설정
 * @param {object} dateObj - Date 객체
 * @param {number} day - 일
 * @returns {object}
 */
function setDay(dateObj, day) {
  const d = new Date(dateObj._date);
  d.setDate(day);
  return wrap(d);
}

/**
 * 시간 설정
 * @param {object} dateObj - Date 객체
 * @param {number} hour - 시간
 * @param {number} minute - 분 (기본: 0)
 * @param {number} second - 초 (기본: 0)
 * @returns {object}
 */
function setTime(dateObj, hour, minute = 0, second = 0) {
  const d = new Date(dateObj._date);
  d.setHours(hour, minute, second, 0);
  return wrap(d);
}

// ============================================================================
// 날짜 포맷팅 (8개 함수)
// ============================================================================

/**
 * ISO 문자열 (YYYY-MM-DD)
 * @param {object} dateObj - Date 객체
 * @returns {string}
 */
function toDateString(dateObj) {
  const d = dateObj._date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const date = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${date}`;
}

/**
 * 시간 문자열 (HH:MM:SS)
 * @param {object} dateObj - Date 객체
 * @returns {string}
 */
function toTimeString(dateObj) {
  const d = dateObj._date;
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * 날짜+시간 문자열 (YYYY-MM-DD HH:MM:SS)
 * @param {object} dateObj - Date 객체
 * @returns {string}
 */
function toDateTimeString(dateObj) {
  return `${toDateString(dateObj)} ${toTimeString(dateObj)}`;
}

/**
 * ISO 8601 문자열
 * @param {object} dateObj - Date 객체
 * @returns {string}
 */
function toISOString(dateObj) {
  return dateObj._date.toISOString();
}

/**
 * 현지 시간 문자열
 * @param {object} dateObj - Date 객체
 * @returns {string}
 */
function toLocaleString(dateObj) {
  return dateObj._date.toLocaleString();
}

/**
 * 커스텀 포맷팅
 * @param {object} dateObj - Date 객체
 * @param {string} format - 포맷 (YYYY, MM, DD, HH, mm, ss)
 * @returns {string}
 */
function format(dateObj, formatStr) {
  const d = dateObj._date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const date = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return formatStr
    .replace(/YYYY/g, year)
    .replace(/MM/g, month)
    .replace(/DD/g, date)
    .replace(/HH/g, hours)
    .replace(/mm/g, minutes)
    .replace(/ss/g, seconds)
    .replace(/ddd/g, dayNames[d.getDay()])
    .replace(/MMM/g, monthNames[d.getMonth()]);
}

/**
 * 요일 문자열 (0-6, 0=일요일)
 * @param {object} dateObj - Date 객체
 * @returns {number}
 */
function getDay(dateObj) {
  return dateObj._date.getDay();
}

/**
 * 요일 이름 (영어)
 * @param {object} dateObj - Date 객체
 * @returns {string}
 */
function getDayName(dateObj) {
  const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return names[dateObj._date.getDay()];
}

// ============================================================================
// 날짜 계산 (7개 함수)
// ============================================================================

/**
 * 두 날짜 간 차이 (밀리초)
 * @param {object} date1 - 첫 번째 날짜
 * @param {object} date2 - 두 번째 날짜
 * @returns {number}
 */
function diffMilliseconds(date1, date2) {
  return date2._date.getTime() - date1._date.getTime();
}

/**
 * 두 날짜 간 차이 (초)
 * @param {object} date1 - 첫 번째 날짜
 * @param {object} date2 - 두 번째 날짜
 * @returns {number}
 */
function diffSeconds(date1, date2) {
  return Math.floor((date2._date.getTime() - date1._date.getTime()) / 1000);
}

/**
 * 두 날짜 간 차이 (분)
 * @param {object} date1 - 첫 번째 날짜
 * @param {object} date2 - 두 번째 날짜
 * @returns {number}
 */
function diffMinutes(date1, date2) {
  return Math.floor((date2._date.getTime() - date1._date.getTime()) / (1000 * 60));
}

/**
 * 두 날짜 간 차이 (시간)
 * @param {object} date1 - 첫 번째 날짜
 * @param {object} date2 - 두 번째 날짜
 * @returns {number}
 */
function diffHours(date1, date2) {
  return Math.floor((date2._date.getTime() - date1._date.getTime()) / (1000 * 60 * 60));
}

/**
 * 두 날짜 간 차이 (일)
 * @param {object} date1 - 첫 번째 날짜
 * @param {object} date2 - 두 번째 날짜
 * @returns {number}
 */
function diffDays(date1, date2) {
  return Math.floor((date2._date.getTime() - date1._date.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * 윤년 여부 확인
 * @param {number} year - 연도
 * @returns {boolean}
 */
function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/**
 * 월의 마지막 날 반환
 * @param {number} year - 연도
 * @param {number} month - 월 (1-12)
 * @returns {number}
 */
function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

// ============================================================================
// 비교 (5개 함수)
// ============================================================================

/**
 * 더 이른 날짜 반환
 * @param {object} date1 - 첫 번째 날짜
 * @param {object} date2 - 두 번째 날짜
 * @returns {object}
 */
function min(date1, date2) {
  return date1._date.getTime() < date2._date.getTime() ? date1 : date2;
}

/**
 * 더 늦은 날짜 반환
 * @param {object} date1 - 첫 번째 날짜
 * @param {object} date2 - 두 번째 날짜
 * @returns {object}
 */
function max(date1, date2) {
  return date1._date.getTime() > date2._date.getTime() ? date1 : date2;
}

/**
 * 두 날짜가 같은지 확인
 * @param {object} date1 - 첫 번째 날짜
 * @param {object} date2 - 두 번째 날짜
 * @returns {boolean}
 */
function equals(date1, date2) {
  return date1._date.getTime() === date2._date.getTime();
}

/**
 * 두 날짜의 일자가 같은지 확인 (시간 무시)
 * @param {object} date1 - 첫 번째 날짜
 * @param {object} date2 - 두 번째 날짜
 * @returns {boolean}
 */
function isSameDay(date1, date2) {
  const d1 = date1._date;
  const d2 = date2._date;
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}

/**
 * date1 < date2 확인
 * @param {object} date1 - 첫 번째 날짜
 * @param {object} date2 - 두 번째 날짜
 * @returns {boolean}
 */
function isBefore(date1, date2) {
  return date1._date.getTime() < date2._date.getTime();
}

// ============================================================================
// 유틸리티
// ============================================================================

/**
 * Date 래퍼 객체 생성 (내부용)
 * @param {Date} d - JavaScript Date 객체
 * @returns {object}
 */
function wrap(d) {
  return {
    _date: d,
    getTime: () => d.getTime(),
    getFullYear: () => d.getFullYear(),
    getMonth: () => d.getMonth() + 1,
    getDate: () => d.getDate(),
    getDay: () => d.getDay(),
    getHours: () => d.getHours(),
    getMinutes: () => d.getMinutes(),
    getSeconds: () => d.getSeconds(),
    getMilliseconds: () => d.getMilliseconds()
  };
}

// ============================================================================
// Module Exports
// ============================================================================

module.exports = {
  // 날짜 생성 (5개)
  now,
  timestamp,
  create,
  today,
  tomorrow,

  // 날짜 조작 (10개)
  addYears,
  addMonths,
  addDays,
  addHours,
  addMinutes,
  addSeconds,
  setYear,
  setMonth,
  setDay,
  setTime,

  // 날짜 포맷팅 (8개)
  toDateString,
  toTimeString,
  toDateTimeString,
  toISOString,
  toLocaleString,
  format,
  getDay,
  getDayName,

  // 날짜 계산 (7개)
  diffMilliseconds,
  diffSeconds,
  diffMinutes,
  diffHours,
  diffDays,
  isLeapYear,
  getDaysInMonth,

  // 비교 (5개)
  min,
  max,
  equals,
  isSameDay,
  isBefore
};
