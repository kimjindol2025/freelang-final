/**
 * FreeLang os Module: 운영체제 정보
 * 20개 함수 (시스템 정보, CPU, 메모리, 네트워크)
 */

const os = require('os');

// ============================================================================
// 시스템 정보 (6개 함수)
// ============================================================================

/**
 * 운영체제 플랫폼 반환 (win32, linux, darwin 등)
 * @returns {string}
 */
function platform() {
  return os.platform();
}

/**
 * 운영체제 아키텍처 반환 (x64, arm64 등)
 * @returns {string}
 */
function arch() {
  return os.arch();
}

/**
 * 시스템 호스트명 반환
 * @returns {string}
 */
function hostname() {
  return os.hostname();
}

/**
 * OS 유형 반환 (Linux, Darwin 등)
 * @returns {string}
 */
function type() {
  return os.type();
}

/**
 * OS 릴리스 버전 반환
 * @returns {string}
 */
function release() {
  return os.release();
}

/**
 * 전체 OS 정보 반환
 * @returns {object}
 */
function getOSInfo() {
  return {
    platform: os.platform(),
    arch: os.arch(),
    hostname: os.hostname(),
    type: os.type(),
    release: os.release(),
    version: os.version ? os.version() : 'unknown'
  };
}

// ============================================================================
// CPU 정보 (5개 함수)
// ============================================================================

/**
 * CPU 코어 수 반환
 * @returns {number}
 */
function cpuCount() {
  return os.cpus().length;
}

/**
 * 모든 CPU 정보 반환
 * @returns {object[]}
 */
function getCpuInfo() {
  return os.cpus().map((cpu, index) => ({
    index,
    model: cpu.model,
    speed: cpu.speed,
    cores: 1 // Node.js cpus()의 각 항목이 1코어
  }));
}

/**
 * 시스템 로드 평균 반환
 * @returns {number[]} [1분, 5분, 15분]
 */
function getLoadAverage() {
  return os.loadavg();
}

/**
 * CPU 사용률 추정 (간단한 방식)
 * @returns {number} 0-100 범위의 백분율 (추정치)
 */
function getCpuUsage() {
  const cpus = os.cpus();
  let totalIdle = 0;
  let totalTick = 0;

  cpus.forEach((cpu) => {
    for (const type of Object.keys(cpu.times)) {
      totalTick += cpu.times[type];
    }
    totalIdle += cpu.times.idle;
  });

  const idle = totalIdle / cpus.length;
  const total = totalTick / cpus.length;
  const usage = 100 - ~~(100 * idle / total);

  return Math.max(0, Math.min(100, usage));
}

/**
 * CPU 코어별 정보
 * @returns {object[]}
 */
function getCpuCores() {
  return os.cpus().map((cpu, index) => ({
    index,
    model: cpu.model,
    speed: cpu.speed,
    times: cpu.times
  }));
}

// ============================================================================
// 메모리 정보 (5개 함수)
// ============================================================================

/**
 * 총 시스템 메모리 (바이트)
 * @returns {number}
 */
function getTotalMemory() {
  return os.totalmem();
}

/**
 * 사용 가능한 메모리 (바이트)
 * @returns {number}
 */
function getFreeMemory() {
  return os.freemem();
}

/**
 * 사용 중인 메모리 (바이트)
 * @returns {number}
 */
function getUsedMemory() {
  return os.totalmem() - os.freemem();
}

/**
 * 메모리 사용률 백분율
 * @returns {number} 0-100
 */
function getMemoryUsagePercent() {
  const total = os.totalmem();
  const free = os.freemem();
  const used = total - free;
  return Math.round((used / total) * 100 * 100) / 100;
}

/**
 * 전체 메모리 정보
 * @returns {object}
 */
function getMemoryInfo() {
  const total = os.totalmem();
  const free = os.freemem();
  const used = total - free;

  return {
    total,
    used,
    free,
    percent: Math.round((used / total) * 100 * 100) / 100,
    totalMB: Math.round(total / 1024 / 1024),
    usedMB: Math.round(used / 1024 / 1024),
    freeMB: Math.round(free / 1024 / 1024)
  };
}

// ============================================================================
// 네트워크 정보 (4개 함수)
// ============================================================================

/**
 * 네트워크 인터페이스 정보 반환
 * @returns {object}
 */
function getNetworkInterfaces() {
  return os.networkInterfaces();
}

/**
 * 호스트명 반환
 * @returns {string}
 */
function getHostname() {
  return os.hostname();
}

/**
 * 홈 디렉토리 경로 반환
 * @returns {string}
 */
function getHomeDirectory() {
  return os.homedir();
}

/**
 * 임시 디렉토리 경로 반환
 * @returns {string}
 */
function getTempDirectory() {
  return os.tmpdir();
}

// ============================================================================
// Module Exports
// ============================================================================

module.exports = {
  // 시스템 정보 (6개)
  platform,
  arch,
  hostname,
  type,
  release,
  getOSInfo,

  // CPU 정보 (5개)
  cpuCount,
  getCpuInfo,
  getLoadAverage,
  getCpuUsage,
  getCpuCores,

  // 메모리 정보 (5개)
  getTotalMemory,
  getFreeMemory,
  getUsedMemory,
  getMemoryUsagePercent,
  getMemoryInfo,

  // 네트워크 정보 (4개)
  getNetworkInterfaces,
  getHostname,
  getHomeDirectory,
  getTempDirectory
};
