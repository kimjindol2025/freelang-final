/**
 * FreeLang Module Loader
 * require('moduleName') 시스템 구현
 *
 * 7개 표준 모듈:
 * - fs: 파일시스템 (25 함수)
 * - os: 운영체제 (20 함수)
 * - path: 경로 조작 (15 함수)
 * - crypto: 암호화 (30 함수)
 * - http: HTTP (40 함수)
 * - date: 날짜/시간 (35 함수)
 * - encoding: 인코딩 (25 함수)
 */

const fs = require('fs');
const path = require('path');

class ModuleLoader {
  constructor() {
    this.modules = new Map();
    this.modulesPath = path.join(__dirname, 'modules');
    this.loadStandardModules();
  }

  /**
   * 표준 모듈 로드
   */
  loadStandardModules() {
    const standardModules = [
      'fs',
      'os',
      'path',
      'crypto',
      'http',
      'date',
      'encoding'
    ];

    for (const moduleName of standardModules) {
      try {
        // eslint-disable-next-line global-require, import/no-dynamic-require
        const moduleExports = require(path.join(this.modulesPath, `${moduleName}.js`));
        this.modules.set(moduleName, moduleExports);
      } catch (error) {
        console.warn(`Warning: Could not load module '${moduleName}': ${error.message}`);
      }
    }
  }

  /**
   * 모듈 로드 (require 구현)
   * @param {string} moduleName - 모듈 이름
   * @returns {object} 모듈 exports
   */
  require(moduleName) {
    if (this.modules.has(moduleName)) {
      return this.modules.get(moduleName);
    }

    throw new Error(`Module not found: '${moduleName}'`);
  }

  /**
   * 모듈 등록 (테스트용)
   */
  register(name, exports) {
    this.modules.set(name, exports);
  }

  /**
   * 로드된 모듈 목록
   */
  getModuleNames() {
    return Array.from(this.modules.keys());
  }

  /**
   * 모듈 통계
   */
  getStatistics() {
    const stats = {};
    for (const [name, exports] of this.modules) {
      const funcCount = Object.keys(exports).filter(key => typeof exports[key] === 'function').length;
      stats[name] = funcCount;
    }
    return stats;
  }
}

// 싱글톤 인스턴스
const loader = new ModuleLoader();

module.exports = loader;
