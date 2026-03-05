/**
 * FreeLang path Module: 경로 조작
 * 15개 함수 (경로 분석, 결합, 정규화)
 */

const path = require('path');

// ============================================================================
// 경로 분석 (8개 함수)
// ============================================================================

/**
 * 경로의 디렉토리 부분만 추출
 * @param {string} filePath - 파일 경로
 * @returns {string}
 */
function dirname(filePath) {
  return path.dirname(filePath);
}

/**
 * 경로의 파일명만 추출
 * @param {string} filePath - 파일 경로
 * @param {string} ext - 제거할 확장자 (선택사항)
 * @returns {string}
 */
function basename(filePath, ext = '') {
  return ext ? path.basename(filePath, ext) : path.basename(filePath);
}

/**
 * 파일 확장자 추출
 * @param {string} filePath - 파일 경로
 * @returns {string}
 */
function extname(filePath) {
  return path.extname(filePath);
}

/**
 * 경로를 구성요소별로 분석
 * @param {string} filePath - 파일 경로
 * @returns {object}
 */
function parse(filePath) {
  return path.parse(filePath);
}

/**
 * 경로 구성요소로부터 경로 생성
 * @param {object} pathObj - 경로 객체 {root, dir, base, ext, name}
 * @returns {string}
 */
function format(pathObj) {
  return path.format(pathObj);
}

/**
 * 상대 경로 계산
 * @param {string} from - 시작 경로
 * @param {string} to - 끝 경로
 * @returns {string}
 */
function relative(from, to) {
  return path.relative(from, to);
}

/**
 * 경로 정규화
 * @param {string} filePath - 파일 경로
 * @returns {string}
 */
function normalize(filePath) {
  return path.normalize(filePath);
}

/**
 * 경로의 루트 디렉토리 추출
 * @param {string} filePath - 파일 경로
 * @returns {string}
 */
function getRoot(filePath) {
  return path.parse(filePath).root;
}

// ============================================================================
// 경로 결합 (4개 함수)
// ============================================================================

/**
 * 경로 요소들을 결합
 * @param {...string} segments - 경로 세그먼트
 * @returns {string}
 */
function join(...segments) {
  return path.join(...segments);
}

/**
 * 절대 경로 생성
 * @param {...string} segments - 경로 세그먼트
 * @returns {string}
 */
function resolve(...segments) {
  return path.resolve(...segments);
}

/**
 * 현재 작업 디렉토리 반환
 * @returns {string}
 */
function cwd() {
  try {
    return process.cwd();
  } catch {
    return '/';
  }
}

/**
 * 경로의 절대 경로 확인
 * @param {string} filePath - 파일 경로
 * @returns {boolean}
 */
function isAbsolute(filePath) {
  return path.isAbsolute(filePath);
}

// ============================================================================
// 경로 조작 (3개 함수)
// ============================================================================

/**
 * 경로에 확장자 추가/변경
 * @param {string} filePath - 파일 경로
 * @param {string} ext - 새 확장자
 * @returns {string}
 */
function changeExtension(filePath, ext) {
  const parsed = path.parse(filePath);
  parsed.ext = ext;
  parsed.base = parsed.name + ext;
  return path.format(parsed);
}

/**
 * 경로에서 확장자 제거
 * @param {string} filePath - 파일 경로
 * @returns {string}
 */
function removeExtension(filePath) {
  const parsed = path.parse(filePath);
  return path.join(parsed.dir, parsed.name);
}

/**
 * 경로의 모든 구성요소 반환
 * @param {string} filePath - 파일 경로
 * @returns {string[]}
 */
function splitPath(filePath) {
  const normalized = path.normalize(filePath);
  return normalized.split(path.sep).filter(segment => segment);
}

// ============================================================================
// Module Exports
// ============================================================================

module.exports = {
  // 경로 분석 (8개)
  dirname,
  basename,
  extname,
  parse,
  format,
  relative,
  normalize,
  getRoot,

  // 경로 결합 (4개)
  join,
  resolve,
  cwd,
  isAbsolute,

  // 경로 조작 (3개)
  changeExtension,
  removeExtension,
  splitPath
};
