/**
 * FreeLang fs Module: 파일시스템
 * 25개 함수 (읽기, 쓰기, 조작, 정보)
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// 파일 읽기 (5개 함수)
// ============================================================================

/**
 * 파일을 동기적으로 읽기
 * @param {string} filePath - 파일 경로
 * @param {string} encoding - 인코딩 (기본: utf8)
 * @returns {string|object} 파일 내용
 */
function readFileSync(filePath, encoding = 'utf8') {
  try {
    return fs.readFileSync(filePath, encoding);
  } catch (error) {
    throw new Error(`Failed to read file: ${error.message}`);
  }
}

/**
 * 파일을 비동기적으로 읽기
 * @param {string} filePath - 파일 경로
 * @param {string} encoding - 인코딩 (기본: utf8)
 * @returns {Promise<string>}
 */
async function readFile(filePath, encoding = 'utf8') {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, encoding, (error, data) => {
      if (error) reject(new Error(`Failed to read file: ${error.message}`));
      else resolve(data);
    });
  });
}

/**
 * 파일을 바이너리 버퍼로 읽기
 * @param {string} filePath - 파일 경로
 * @returns {Buffer}
 */
function readFileAsBuffer(filePath) {
  try {
    return fs.readFileSync(filePath);
  } catch (error) {
    throw new Error(`Failed to read file: ${error.message}`);
  }
}

/**
 * 파일을 JSON으로 파싱하여 읽기
 * @param {string} filePath - 파일 경로
 * @returns {object}
 */
function readFileAsJson(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to read JSON file: ${error.message}`);
  }
}

/**
 * 파일을 라인 배열로 읽기
 * @param {string} filePath - 파일 경로
 * @returns {string[]}
 */
function readFileAsLines(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.split('\n');
  } catch (error) {
    throw new Error(`Failed to read file: ${error.message}`);
  }
}

// ============================================================================
// 파일 쓰기 (5개 함수)
// ============================================================================

/**
 * 파일을 동기적으로 쓰기
 * @param {string} filePath - 파일 경로
 * @param {string} content - 쓸 내용
 * @param {string} encoding - 인코딩 (기본: utf8)
 * @returns {void}
 */
function writeFileSync(filePath, content, encoding = 'utf8') {
  try {
    fs.writeFileSync(filePath, content, encoding);
  } catch (error) {
    throw new Error(`Failed to write file: ${error.message}`);
  }
}

/**
 * 파일을 비동기적으로 쓰기
 * @param {string} filePath - 파일 경로
 * @param {string} content - 쓸 내용
 * @param {string} encoding - 인코딩 (기본: utf8)
 * @returns {Promise<void>}
 */
async function writeFile(filePath, content, encoding = 'utf8') {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, content, encoding, (error) => {
      if (error) reject(new Error(`Failed to write file: ${error.message}`));
      else resolve();
    });
  });
}

/**
 * 파일 끝에 내용 동기적으로 추가
 * @param {string} filePath - 파일 경로
 * @param {string} content - 추가할 내용
 * @returns {void}
 */
function appendFileSync(filePath, content) {
  try {
    fs.appendFileSync(filePath, content);
  } catch (error) {
    throw new Error(`Failed to append to file: ${error.message}`);
  }
}

/**
 * 파일 끝에 내용 비동기적으로 추가
 * @param {string} filePath - 파일 경로
 * @param {string} content - 추가할 내용
 * @returns {Promise<void>}
 */
async function appendFile(filePath, content) {
  return new Promise((resolve, reject) => {
    fs.appendFile(filePath, content, (error) => {
      if (error) reject(new Error(`Failed to append to file: ${error.message}`));
      else resolve();
    });
  });
}

/**
 * 객체를 JSON으로 파일에 쓰기
 * @param {string} filePath - 파일 경로
 * @param {object} obj - 쓸 객체
 * @param {boolean} pretty - 들여쓰기 여부 (기본: false)
 * @returns {void}
 */
function writeFileAsJson(filePath, obj, pretty = false) {
  try {
    const content = pretty ? JSON.stringify(obj, null, 2) : JSON.stringify(obj);
    fs.writeFileSync(filePath, content, 'utf8');
  } catch (error) {
    throw new Error(`Failed to write JSON file: ${error.message}`);
  }
}

// ============================================================================
// 파일 조작 (8개 함수)
// ============================================================================

/**
 * 파일을 동기적으로 복사
 * @param {string} src - 원본 경로
 * @param {string} dest - 목적지 경로
 * @returns {void}
 */
function copyFileSync(src, dest) {
  try {
    fs.copyFileSync(src, dest);
  } catch (error) {
    throw new Error(`Failed to copy file: ${error.message}`);
  }
}

/**
 * 파일을 비동기적으로 복사
 * @param {string} src - 원본 경로
 * @param {string} dest - 목적지 경로
 * @returns {Promise<void>}
 */
async function copyFile(src, dest) {
  return new Promise((resolve, reject) => {
    fs.copyFile(src, dest, (error) => {
      if (error) reject(new Error(`Failed to copy file: ${error.message}`));
      else resolve();
    });
  });
}

/**
 * 파일을 동기적으로 이름 변경
 * @param {string} oldPath - 기존 경로
 * @param {string} newPath - 새 경로
 * @returns {void}
 */
function renameSync(oldPath, newPath) {
  try {
    fs.renameSync(oldPath, newPath);
  } catch (error) {
    throw new Error(`Failed to rename file: ${error.message}`);
  }
}

/**
 * 파일을 비동기적으로 이름 변경
 * @param {string} oldPath - 기존 경로
 * @param {string} newPath - 새 경로
 * @returns {Promise<void>}
 */
async function rename(oldPath, newPath) {
  return new Promise((resolve, reject) => {
    fs.rename(oldPath, newPath, (error) => {
      if (error) reject(new Error(`Failed to rename file: ${error.message}`));
      else resolve();
    });
  });
}

/**
 * 파일을 동기적으로 삭제
 * @param {string} filePath - 파일 경로
 * @returns {void}
 */
function deleteFileSync(filePath) {
  try {
    fs.unlinkSync(filePath);
  } catch (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

/**
 * 파일을 비동기적으로 삭제
 * @param {string} filePath - 파일 경로
 * @returns {Promise<void>}
 */
async function deleteFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (error) => {
      if (error) reject(new Error(`Failed to delete file: ${error.message}`));
      else resolve();
    });
  });
}

/**
 * 파일 크기를 동기적으로 자르기 (truncate)
 * @param {string} filePath - 파일 경로
 * @param {number} len - 자를 길이 (바이트)
 * @returns {void}
 */
function truncateSync(filePath, len = 0) {
  try {
    fs.truncateSync(filePath, len);
  } catch (error) {
    throw new Error(`Failed to truncate file: ${error.message}`);
  }
}

/**
 * 파일 크기를 비동기적으로 자르기
 * @param {string} filePath - 파일 경로
 * @param {number} len - 자를 길이 (바이트)
 * @returns {Promise<void>}
 */
async function truncate(filePath, len = 0) {
  return new Promise((resolve, reject) => {
    fs.truncate(filePath, len, (error) => {
      if (error) reject(new Error(`Failed to truncate file: ${error.message}`));
      else resolve();
    });
  });
}

// ============================================================================
// 파일 정보 (7개 함수)
// ============================================================================

/**
 * 파일/디렉토리 존재 여부 동기적으로 확인
 * @param {string} filePath - 파일 경로
 * @returns {boolean}
 */
function existsSync(filePath) {
  return fs.existsSync(filePath);
}

/**
 * 파일/디렉토리 존재 여부 비동기적으로 확인
 * @param {string} filePath - 파일 경로
 * @returns {Promise<boolean>}
 */
async function exists(filePath) {
  return new Promise((resolve) => {
    fs.access(filePath, fs.constants.F_OK, (error) => {
      resolve(!error);
    });
  });
}

/**
 * 동기적으로 파일인지 확인
 * @param {string} filePath - 파일 경로
 * @returns {boolean}
 */
function isFileSync(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

/**
 * 비동기적으로 파일인지 확인
 * @param {string} filePath - 파일 경로
 * @returns {Promise<boolean>}
 */
async function isFile(filePath) {
  return new Promise((resolve) => {
    fs.stat(filePath, (error, stats) => {
      resolve(!error && stats.isFile());
    });
  });
}

/**
 * 동기적으로 디렉토리인지 확인
 * @param {string} filePath - 파일 경로
 * @returns {boolean}
 */
function isDirectorySync(filePath) {
  try {
    return fs.statSync(filePath).isDirectory();
  } catch {
    return false;
  }
}

/**
 * 비동기적으로 디렉토리인지 확인
 * @param {string} filePath - 파일 경로
 * @returns {Promise<boolean>}
 */
async function isDirectory(filePath) {
  return new Promise((resolve) => {
    fs.stat(filePath, (error, stats) => {
      resolve(!error && stats.isDirectory());
    });
  });
}

/**
 * 파일 정보를 동기적으로 가져오기
 * @param {string} filePath - 파일 경로
 * @returns {object} 파일 정보 (크기, 수정시간 등)
 */
function getStatSync(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return {
      size: stats.size,
      isFile: stats.isFile(),
      isDirectory: stats.isDirectory(),
      created: stats.birthtime.toISOString(),
      modified: stats.mtime.toISOString(),
      accessed: stats.atime.toISOString(),
      mode: stats.mode,
      uid: stats.uid,
      gid: stats.gid
    };
  } catch (error) {
    throw new Error(`Failed to get file stats: ${error.message}`);
  }
}

// ============================================================================
// Module Exports
// ============================================================================

module.exports = {
  // 읽기 (5개)
  readFileSync,
  readFile,
  readFileAsBuffer,
  readFileAsJson,
  readFileAsLines,

  // 쓰기 (5개)
  writeFileSync,
  writeFile,
  appendFileSync,
  appendFile,
  writeFileAsJson,

  // 조작 (8개)
  copyFileSync,
  copyFile,
  renameSync,
  rename,
  deleteFileSync,
  deleteFile,
  truncateSync,
  truncate,

  // 정보 (7개)
  existsSync,
  exists,
  isFileSync,
  isFile,
  isDirectorySync,
  isDirectory,
  getStatSync
};
