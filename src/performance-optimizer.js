/**
 * FreeLang Performance Optimizer
 * 3가지 최적화 시스템 통합
 */

const ModuleCache = require('./module-cache');
const { LazyModuleLoader } = require('./module-lazy-loader');
const { FunctionPool } = require('./function-pool');

class PerformanceOptimizer {
  constructor(options = {}) {
    this.moduleCache = new ModuleCache(options.cacheSize || 100);
    this.lazyLoader = new LazyModuleLoader();
    this.functionPool = new FunctionPool(options.poolSize || 200);

    this.enableCache = options.enableCache !== false;
    this.enableLazyLoading = options.enableLazyLoading !== false;
    this.enableFunctionPool = options.enableFunctionPool !== false;

    this.startTime = Date.now();
    this.stats = {
      modulesLoaded: 0,
      functionsExecuted: 0,
      totalTimeMs: 0
    };
  }

  /**
   * 모듈 로드 최적화
   * @param {string} name - 모듈 이름
   * @param {object} module - 모듈 객체
   * @returns {object}
   */
  loadModule(name, module) {
    if (this.enableCache) {
      const cached = this.moduleCache.get(name);
      if (cached) {
        return cached;
      }
    }

    let optimizedModule = module;

    if (this.enableLazyLoading) {
      optimizedModule = this.lazyLoader.wrap(name, module);
    }

    if (this.enableCache) {
      this.moduleCache.set(name, optimizedModule);
    }

    this.stats.modulesLoaded++;
    return optimizedModule;
  }

  /**
   * 함수 실행 최적화
   * @param {function} fn - 함수
   * @param {...any} args - 인자
   * @returns {any}
   */
  executeFunction(fn, ...args) {
    if (!this.enableFunctionPool) {
      return fn(...args);
    }

    const wrapper = this.functionPool.borrow(fn);
    try {
      const result = wrapper.execute(...args);
      this.stats.functionsExecuted++;
      return result;
    } finally {
      this.functionPool.return(wrapper);
    }
  }

  /**
   * 성능 리포트 생성
   */
  getPerformanceReport() {
    const elapsedTime = Date.now() - this.startTime;

    return {
      timing: {
        elapsedMs: elapsedTime,
        startTime: new Date(this.startTime).toISOString()
      },
      cache: this.enableCache ? this.moduleCache.getStats() : null,
      lazyLoading: this.enableLazyLoading ? this.lazyLoader.getStats() : null,
      functionPool: this.enableFunctionPool ? this.functionPool.getStats() : null,
      summary: {
        modulesLoaded: this.stats.modulesLoaded,
        functionsExecuted: this.stats.functionsExecuted,
        totalTimeMs: elapsedTime,
        estimatedImprovement: this.calculateImprovement()
      }
    };
  }

  /**
   * 예상 성능 개선도 계산
   */
  calculateImprovement() {
    const cacheImprovement = this.enableCache ? 50 : 0;
    const lazyLoadingImprovement = this.enableLazyLoading ? 40 : 0;
    const poolImprovement = this.enableFunctionPool ? 25 : 0;

    const improvements = [
      cacheImprovement,
      lazyLoadingImprovement,
      poolImprovement
    ].filter(x => x > 0);

    if (improvements.length === 0) return 0;

    const totalImprovement = improvements.reduce((a, b) => a + b, 0);
    return Math.min(totalImprovement / improvements.length, 100);
  }

  /**
   * 최적화 비활성화
   */
  disable() {
    this.enableCache = false;
    this.enableLazyLoading = false;
    this.enableFunctionPool = false;
  }

  /**
   * 최적화 활성화
   */
  enable() {
    this.enableCache = true;
    this.enableLazyLoading = true;
    this.enableFunctionPool = true;
  }

  /**
   * 통계 초기화
   */
  reset() {
    this.moduleCache.clear();
    this.functionPool.clear();
    this.stats = {
      modulesLoaded: 0,
      functionsExecuted: 0,
      totalTimeMs: 0
    };
    this.startTime = Date.now();
  }
}

// 글로벌 최적화기 (싱글톤)
const globalOptimizer = new PerformanceOptimizer({
  enableCache: true,
  enableLazyLoading: true,
  enableFunctionPool: true
});

module.exports = { PerformanceOptimizer, globalOptimizer };
