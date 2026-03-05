/**
 * FreeLang EventLoop
 * 비동기 작업 스케줄링 및 실행
 * JavaScript 이벤트 루프 기초 구현 (마이크로태스크, 마크로태스크)
 */

class EventLoop {
  constructor() {
    this.microtasks = [];      // Promise 콜백 (높은 우선도)
    this.macrotasks = [];      // setTimeout, I/O (낮은 우선도)
    this.isRunning = false;
    this.globalContext = global || globalThis;
  }

  /**
   * 마이크로태스크 추가 (Promise.then, queueMicrotask)
   * @param {Function} callback - 실행할 콜백 함수
   */
  addMicrotask(callback) {
    if (typeof callback !== 'function') {
      throw new TypeError('Callback must be a function');
    }
    this.microtasks.push(callback);
    if (!this.isRunning) {
      this.start();
    }
  }

  /**
   * 마크로태스크 추가 (setTimeout, I/O 작업)
   * @param {Function} callback - 실행할 콜백 함수
   * @param {number} delay - 지연 시간 (밀리초), 기본값 0
   */
  addMacrotask(callback, delay = 0) {
    if (typeof callback !== 'function') {
      throw new TypeError('Callback must be a function');
    }

    if (delay > 0) {
      setTimeout(() => {
        this.macrotasks.push(callback);
        if (!this.isRunning) {
          this.start();
        }
      }, delay);
    } else {
      this.macrotasks.push(callback);
      if (!this.isRunning) {
        this.start();
      }
    }
  }

  /**
   * 동기 코드 실행 (try-catch 래핑)
   * @param {Function} fn - 실행할 함수
   * @returns {any} 함수의 반환값
   */
  executeSync(fn) {
    try {
      return fn();
    } catch (error) {
      console.error('Sync execution error:', error);
      throw error;
    }
  }

  /**
   * 이벤트 루프 메인 루프 시작
   * 마이크로태스크 → 마크로태스크 순서로 실행
   */
  start() {
    if (this.isRunning) return;

    this.isRunning = true;

    try {
      while (this.microtasks.length > 0 || this.macrotasks.length > 0) {
        // 1단계: 모든 마이크로태스크 실행 (FIFO)
        while (this.microtasks.length > 0) {
          const task = this.microtasks.shift();
          try {
            task();
          } catch (error) {
            console.error('Microtask error:', error);
            // 마이크로태스크 에러는 콘솔에 출력되지만 루프 계속 진행
          }
        }

        // 2단계: 마크로태스크 1개 실행
        if (this.macrotasks.length > 0) {
          const task = this.macrotasks.shift();
          try {
            task();
          } catch (error) {
            console.error('Macrotask error:', error);
            // 마크로태스크 에러는 콘솔에 출력되지만 루프 계속 진행
          }
        } else {
          // 마크로태스크가 없으면 종료
          break;
        }
      }
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * 현재 이벤트 루프 상태 조회
   * @returns {Object} 상태 정보
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      microtaskCount: this.microtasks.length,
      macrotaskCount: this.macrotasks.length,
      totalTaskCount: this.microtasks.length + this.macrotasks.length
    };
  }

  /**
   * 모든 태스크 실행 완료 대기
   * @returns {Promise<void>} 모든 작업 완료 시 resolve
   */
  waitAll() {
    return new Promise((resolve) => {
      // 이미 완료된 경우
      if (this.microtasks.length === 0 && this.macrotasks.length === 0 && !this.isRunning) {
        resolve();
        return;
      }

      // 정기적으로 상태 확인
      const checkInterval = setInterval(() => {
        if (this.microtasks.length === 0 && this.macrotasks.length === 0 && !this.isRunning) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 5);

      // 타임아웃 설정 (무한 루프 방지)
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve();
      }, 30000); // 30초 타임아웃
    });
  }

  /**
   * 이벤트 루프 초기화 (모든 태스크 제거)
   */
  clear() {
    this.microtasks = [];
    this.macrotasks = [];
    this.isRunning = false;
  }

  /**
   * 마이크로태스크만 모두 실행
   */
  flushMicrotasks() {
    while (this.microtasks.length > 0) {
      const task = this.microtasks.shift();
      try {
        task();
      } catch (error) {
        console.error('Microtask error:', error);
      }
    }
  }

  /**
   * 현재 콜 스택이 비워질 때까지 대기
   * (실제 JS 이벤트 루프 동작 모의)
   */
  tick() {
    // 마이크로태스크 모두 실행
    this.flushMicrotasks();

    // 마크로태스크 1개 실행
    if (this.macrotasks.length > 0) {
      const task = this.macrotasks.shift();
      try {
        task();
      } catch (error) {
        console.error('Macrotask error:', error);
      }
    }
  }
}

// 전역 이벤트 루프 싱글톤
let globalEventLoop = null;

/**
 * 전역 이벤트 루프 인스턴스 획득
 * @returns {EventLoop} 전역 이벤트 루프
 */
function getGlobalEventLoop() {
  if (!globalEventLoop) {
    globalEventLoop = new EventLoop();
  }
  return globalEventLoop;
}

/**
 * queueMicrotask 대체 함수 (Promise 없이 마이크로태스크 추가)
 * @param {Function} callback - 마이크로태스크로 실행할 콜백
 */
function queueMicrotask(callback) {
  getGlobalEventLoop().addMicrotask(callback);
}

module.exports = {
  EventLoop,
  getGlobalEventLoop,
  queueMicrotask
};
