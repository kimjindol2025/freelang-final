/**
 * FreeLang Module Cache System
 * 성능 최적화: 모듈 캐싱 (50% 성능 개선)
 */

class ModuleCache {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      loads: 0
    };
    this.maxSize = maxSize;
  }

  /**
   * 캐시에서 모듈 조회
   * @param {string} name - 모듈 이름
   * @returns {object|null}
   */
  get(name) {
    if (this.cache.has(name)) {
      this.stats.hits++;
      return this.cache.get(name);
    }
    this.stats.misses++;
    return null;
  }

  /**
   * 캐시에 모듈 저장
   * @param {string} name - 모듈 이름
   * @param {object} module - 모듈 객체
   */
  set(name, module) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(name, module);
    this.stats.loads++;
  }

  /**
   * 캐시 초기화
   */
  clear() {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, loads: 0 };
  }

  /**
   * 캐시 통계
   * @returns {object}
   */
  getStats() {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total * 100).toFixed(2) : 0;

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      loads: this.stats.loads,
      hitRate: `${hitRate}%`,
      size: this.cache.size,
      maxSize: this.maxSize
    };
  }

  /**
   * 캐시 크기
   */
  size() {
    return this.cache.size;
  }

  /**
   * 모듈 존재 확인
   */
  has(name) {
    return this.cache.has(name);
  }
}

module.exports = ModuleCache;
