/**
 * FreeLang Promise 통합 테스트
 * Runtime에 등록된 Promise를 테스트합니다.
 */

const runtime = require('./src/runtime');

console.log('🔷 FreeLang Promise 통합 테스트\n');

const Promise = runtime.Promise;

// Test 1: 기본 비동기 작업 시뮬레이션
console.log('Test 1: 비동기 작업 체인');
const asyncTask1 = new Promise((resolve) => {
  setTimeout(() => {
    console.log('  → 1초 후 작업 완료');
    resolve('result1');
  }, 1000);
});

asyncTask1
  .then((result) => {
    console.log(`  → then 콜백: ${result}`);
    return result + ' modified';
  })
  .then((result) => {
    console.log(`  → 두 번째 then: ${result}`);
  });

// Test 2: 에러 처리
console.log('\nTest 2: 에러 처리');
new Promise((resolve, reject) => {
  setTimeout(() => {
    reject(new Error('작업 실패'));
  }, 500);
})
  .catch((error) => {
    console.log(`  → catch: ${error.message}`);
    return 'recovered';
  })
  .then((value) => {
    console.log(`  → 복구 후: ${value}`);
  });

// Test 3: Promise.all - 병렬 작업
console.log('\nTest 3: Promise.all (병렬 작업)');
const task1 = new Promise((resolve) => {
  setTimeout(() => {
    console.log('  → Task 1 완료');
    resolve('result1');
  }, 300);
});

const task2 = new Promise((resolve) => {
  setTimeout(() => {
    console.log('  → Task 2 완료');
    resolve('result2');
  }, 300);
});

const task3 = Promise.resolve('result3');

Promise.all([task1, task2, task3]).then((results) => {
  console.log(`  → 모든 작업 완료: [${results.join(', ')}]`);
});

// Test 4: Promise.race - 가장 빠른 완료
console.log('\nTest 4: Promise.race (가장 빠른 완료)');
const fast = new Promise((resolve) => {
  setTimeout(() => {
    resolve('fast result');
  }, 100);
});

const slow = new Promise((resolve) => {
  setTimeout(() => {
    resolve('slow result');
  }, 1000);
});

Promise.race([slow, fast]).then((result) => {
  console.log(`  → 가장 빠른 결과: ${result}`);
});

// Test 5: finally 처리
console.log('\nTest 5: finally 처리');
new Promise((resolve) => {
  resolve('data');
})
  .then((value) => {
    console.log(`  → 처리: ${value}`);
    return value;
  })
  .finally(() => {
    console.log('  → finally: 항상 실행됨');
  });

// Test 6: 에러에서 finally
console.log('\nTest 6: 에러 후 finally');
new Promise((_, reject) => {
  reject('error');
})
  .catch((e) => {
    console.log(`  → 에러 처리: ${e}`);
  })
  .finally(() => {
    console.log('  → finally: 에러 후에도 실행됨');
  });

// Test 7: Promise.allSettled
console.log('\nTest 7: Promise.allSettled');
Promise.allSettled([
  Promise.resolve('success1'),
  Promise.reject('error1'),
  Promise.resolve('success2')
]).then((results) => {
  console.log('  → 모든 상태:');
  results.forEach((result, idx) => {
    if (result.status === 'fulfilled') {
      console.log(`    [${idx}] fulfilled: ${result.value}`);
    } else {
      console.log(`    [${idx}] rejected: ${result.reason}`);
    }
  });
});

// Test 8: Promise.any
console.log('\nTest 8: Promise.any');
Promise.any([
  Promise.reject('error1'),
  new Promise((resolve) => {
    setTimeout(() => resolve('success'), 200);
  }),
  Promise.reject('error2')
]).then((result) => {
  console.log(`  → 첫 성공: ${result}`);
});

// Test 9: 중첩된 Promise
console.log('\nTest 9: 중첩된 Promise');
new Promise((resolve) => {
  setTimeout(() => {
    resolve(
      new Promise((resolve2) => {
        console.log('  → 내부 Promise 시작');
        setTimeout(() => {
          resolve2('중첩 결과');
        }, 200);
      })
    );
  }, 100);
}).then((result) => {
  console.log(`  → 중첩 해결: ${result}`);
});

// Test 10: 정적 메서드 활용
console.log('\nTest 10: 정적 메서드 활용');
Promise.resolve('static resolve')
  .then((v) => {
    console.log(`  → Promise.resolve: ${v}`);
    return Promise.reject('static reject');
  })
  .catch((e) => {
    console.log(`  → Promise.reject caught: ${e}`);
  });

// 최종 완료 메시지
setTimeout(() => {
  console.log('\n' + '='.repeat(60));
  console.log('✅ 모든 Promise 통합 테스트 완료!');
  console.log('='.repeat(60));
}, 2500);
