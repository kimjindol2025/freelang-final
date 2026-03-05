/**
 * FreeLang Promise 클래스
 * 비동기 작업 처리를 위한 Promise 구현
 * JavaScript Promise와 호환되는 API 제공
 */

class Promise {
  constructor(executor) {
    this.state = 'pending';      // pending, fulfilled, rejected
    this.value = undefined;
    this.reason = undefined;
    this.fulfilledHandlers = [];
    this.rejectedHandlers = [];
    this.finallyHandlers = [];

    const resolve = (value) => {
      if (this.state === 'pending') {
        // Promise 값이면 체이닝
        if (value instanceof Promise) {
          value.then(
            (v) => this.settlePromise('fulfilled', v),
            (r) => this.settlePromise('rejected', r)
          );
          return;
        }

        this.settlePromise('fulfilled', value);
      }
    };

    const reject = (reason) => {
      if (this.state === 'pending') {
        this.settlePromise('rejected', reason);
      }
    };

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  settlePromise(state, value) {
    this.state = state;
    if (state === 'fulfilled') {
      this.value = value;
    } else {
      this.reason = value;
    }
    this.executeHandlers();
  }

  executeHandlers() {
    if (this.state === 'fulfilled') {
      this.fulfilledHandlers.forEach((handler) => {
        try {
          const result = handler(this.value);
          if (result instanceof Promise) {
            result.then(
              (v) => this.resolveNext(v),
              (r) => this.rejectNext(r)
            );
          } else {
            this.resolveNext(result);
          }
        } catch (error) {
          this.rejectNext(error);
        }
      });
    } else if (this.state === 'rejected') {
      this.rejectedHandlers.forEach((handler) => {
        try {
          const result = handler(this.reason);
          this.resolveNext(result);
        } catch (error) {
          this.rejectNext(error);
        }
      });
    }

    // Finally 핸들러는 항상 실행
    this.finallyHandlers.forEach((handler) => {
      try {
        handler();
      } catch (error) {
        // finally의 에러는 무시하거나 기록
        console.error('Error in finally handler:', error);
      }
    });

    this.fulfilledHandlers = [];
    this.rejectedHandlers = [];
    this.finallyHandlers = [];
  }

  then(onFulfilled, onRejected) {
    return new Promise((resolve, reject) => {
      const fulfillmentHandler = (value) => {
        if (typeof onFulfilled === 'function') {
          try {
            const result = onFulfilled(value);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        } else {
          resolve(value);
        }
      };

      const rejectionHandler = (reason) => {
        if (typeof onRejected === 'function') {
          try {
            const result = onRejected(reason);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        } else {
          reject(reason);
        }
      };

      if (this.state === 'pending') {
        this.fulfilledHandlers.push(fulfillmentHandler);
        this.rejectedHandlers.push(rejectionHandler);
      } else if (this.state === 'fulfilled') {
        fulfillmentHandler(this.value);
      } else {
        rejectionHandler(this.reason);
      }
    });
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }

  finally(onFinally) {
    return new Promise((resolve, reject) => {
      this.then(
        (value) => {
          if (typeof onFinally === 'function') {
            try {
              onFinally();
            } catch (error) {
              reject(error);
              return;
            }
          }
          resolve(value);
        },
        (reason) => {
          if (typeof onFinally === 'function') {
            try {
              onFinally();
            } catch (error) {
              reject(error);
              return;
            }
          }
          reject(reason);
        }
      );
    });
  }

  // 정적 메서드: Promise.resolve
  static resolve(value) {
    if (value instanceof Promise) {
      return value;
    }
    return new Promise((resolve) => {
      resolve(value);
    });
  }

  // 정적 메서드: Promise.reject
  static reject(reason) {
    return new Promise((_, reject) => {
      reject(reason);
    });
  }

  // 정적 메서드: Promise.all
  static all(promises) {
    return new Promise((resolve, reject) => {
      const results = [];
      let completed = 0;
      const promiseArray = Array.isArray(promises) ? promises : [];

      if (promiseArray.length === 0) {
        resolve([]);
        return;
      }

      promiseArray.forEach((promise, index) => {
        Promise.resolve(promise).then(
          (value) => {
            results[index] = value;
            completed++;
            if (completed === promiseArray.length) {
              resolve(results);
            }
          },
          (reason) => {
            reject(reason);
          }
        );
      });
    });
  }

  // 정적 메서드: Promise.race
  static race(promises) {
    return new Promise((resolve, reject) => {
      const promiseArray = Array.isArray(promises) ? promises : [];

      if (promiseArray.length === 0) {
        // race는 빈 배열이면 영원히 pending
        return;
      }

      promiseArray.forEach((promise) => {
        Promise.resolve(promise).then(resolve, reject);
      });
    });
  }

  // 정적 메서드: Promise.allSettled
  static allSettled(promises) {
    return new Promise((resolve) => {
      const results = [];
      let completed = 0;
      const promiseArray = Array.isArray(promises) ? promises : [];

      if (promiseArray.length === 0) {
        resolve([]);
        return;
      }

      promiseArray.forEach((promise, index) => {
        Promise.resolve(promise).then(
          (value) => {
            results[index] = { status: 'fulfilled', value };
            completed++;
            if (completed === promiseArray.length) {
              resolve(results);
            }
          },
          (reason) => {
            results[index] = { status: 'rejected', reason };
            completed++;
            if (completed === promiseArray.length) {
              resolve(results);
            }
          }
        );
      });
    });
  }

  // 정적 메서드: Promise.any (ES2021)
  static any(promises) {
    return new Promise((resolve, reject) => {
      const errors = [];
      let completed = 0;
      const promiseArray = Array.isArray(promises) ? promises : [];

      if (promiseArray.length === 0) {
        reject(new Error('All promises rejected'));
        return;
      }

      promiseArray.forEach((promise, index) => {
        Promise.resolve(promise).then(
          (value) => {
            resolve(value);
          },
          (reason) => {
            errors[index] = reason;
            completed++;
            if (completed === promiseArray.length) {
              const error = new Error('All promises rejected');
              error.errors = errors;
              reject(error);
            }
          }
        );
      });
    });
  }

  // 인스턴스 메서드: Promise를 위한 내부 상태 관리
  resolveNext(value) {
    // then 체인에서 사용하지만, 현재 구현에서는 then에서 직접 처리
    // 이 메서드는 미사용이지만 호환성을 위해 유지
  }

  rejectNext(reason) {
    // then 체인에서 사용하지만, 현재 구현에서는 then에서 직접 처리
    // 이 메서드는 미사용이지만 호환성을 위해 유지
  }
}

module.exports = Promise;
