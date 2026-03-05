/**
 * FreeLang Promise 테스트 파일
 * Promise 클래스의 모든 기능을 검증합니다.
 */

const Promise = require('./src/promise');

// 테스트 카운트 및 결과 추적
let testCount = 0;
let passCount = 0;
let failCount = 0;

function assert(condition, testName) {
  testCount++;
  if (condition) {
    passCount++;
    console.log(`✅ [${testCount}] ${testName}`);
  } else {
    failCount++;
    console.log(`❌ [${testCount}] ${testName}`);
  }
}

function printResults() {
  console.log('\n' + '='.repeat(60));
  console.log(`총 테스트: ${testCount}, 성공: ${passCount}, 실패: ${failCount}`);
  console.log('='.repeat(60));
  if (failCount === 0) {
    console.log('✅ 모든 Promise 테스트 완료!');
  } else {
    console.log(`❌ ${failCount}개 테스트 실패`);
  }
}

console.log('🔷 FreeLang Promise 클래스 테스트 시작\n');

// ============================================================
// Test 1: 기본 Promise 생성 및 resolve
// ============================================================
new Promise((resolve) => {
  resolve(42);
}).then((value) => {
  assert(value === 42, '기본 Promise resolve - 값 확인');
});

// ============================================================
// Test 2: Promise reject 처리
// ============================================================
new Promise((_, reject) => {
  reject('error');
}).catch((reason) => {
  assert(reason === 'error', 'Promise reject - 에러 메시지 확인');
});

// ============================================================
// Test 3: then 체인
// ============================================================
new Promise((resolve) => {
  resolve(1);
})
  .then((v) => v + 1)
  .then((v) => v + 1)
  .then((v) => {
    assert(v === 3, 'then 체인 - 연쇄적 값 계산');
  });

// ============================================================
// Test 4: catch 에러 처리
// ============================================================
new Promise((_, reject) => {
  reject('initial error');
})
  .catch((reason) => {
    assert(reason === 'initial error', 'catch 에러 처리 - 에러 캡처');
    return 'recovered';
  })
  .then((value) => {
    assert(value === 'recovered', 'catch 후 then - 복구 값 확인');
  });

// ============================================================
// Test 5: finally 항상 실행 (성공)
// ============================================================
let finallyExecuted1 = false;
new Promise((resolve) => {
  resolve(1);
}).finally(() => {
  finallyExecuted1 = true;
}).then(() => {
  assert(finallyExecuted1, 'finally 항상 실행 (성공) - 플래그 확인');
});

// ============================================================
// Test 6: finally 항상 실행 (실패)
// ============================================================
let finallyExecuted2 = false;
new Promise((_, reject) => {
  reject('error');
}).finally(() => {
  finallyExecuted2 = true;
}).catch(() => {
  assert(finallyExecuted2, 'finally 항상 실행 (실패) - 플래그 확인');
});

// ============================================================
// Test 7: Promise.resolve
// ============================================================
Promise.resolve(123).then((value) => {
  assert(value === 123, 'Promise.resolve - 정적 메서드');
});

// ============================================================
// Test 8: Promise.reject
// ============================================================
Promise.reject('reject error').catch((reason) => {
  assert(reason === 'reject error', 'Promise.reject - 정적 메서드');
});

// ============================================================
// Test 9: Promise.all (성공)
// ============================================================
Promise.all([
  Promise.resolve(1),
  Promise.resolve(2),
  Promise.resolve(3)
]).then((results) => {
  assert(
    JSON.stringify(results) === '[1,2,3]',
    'Promise.all (성공) - 모든 값 수집'
  );
});

// ============================================================
// Test 10: Promise.all (실패 시 즉시 reject)
// ============================================================
Promise.all([
  Promise.resolve(1),
  Promise.reject('error'),
  Promise.resolve(3)
]).catch((reason) => {
  assert(reason === 'error', 'Promise.all (실패) - 첫 에러 전파');
});

// ============================================================
// Test 11: Promise.race (첫 번째 완료)
// ============================================================
Promise.race([
  new Promise((resolve) => setTimeout(() => resolve(1), 100)),
  Promise.resolve(2)
]).then((value) => {
  assert(value === 2, 'Promise.race - 가장 빠른 완료 값');
});

// ============================================================
// Test 12: Promise.race (첫 번째 거부)
// ============================================================
Promise.race([
  new Promise((_, reject) => setTimeout(() => reject('error1'), 100)),
  Promise.reject('error2')
]).catch((reason) => {
  assert(reason === 'error2', 'Promise.race - 가장 빠른 거부');
});

// ============================================================
// Test 13: Promise.allSettled (성공 + 실패 혼합)
// ============================================================
Promise.allSettled([
  Promise.resolve(1),
  Promise.reject('error'),
  Promise.resolve(3)
]).then((results) => {
  const isCorrect =
    results[0].status === 'fulfilled' && results[0].value === 1 &&
    results[1].status === 'rejected' && results[1].reason === 'error' &&
    results[2].status === 'fulfilled' && results[2].value === 3;
  assert(isCorrect, 'Promise.allSettled - 모든 상태 수집');
});

// ============================================================
// Test 14: Promise.any (성공)
// ============================================================
Promise.any([
  Promise.reject('error1'),
  Promise.resolve(2),
  Promise.reject('error3')
]).then((value) => {
  assert(value === 2, 'Promise.any (성공) - 첫 성공값');
});

// ============================================================
// Test 15: Promise.any (모두 실패)
// ============================================================
Promise.any([
  Promise.reject('error1'),
  Promise.reject('error2')
]).catch((error) => {
  assert(error.message === 'All promises rejected', 'Promise.any (실패) - 모두 실패 메시지');
});

// ============================================================
// Test 16: 동기 에러 캡처
// ============================================================
new Promise((resolve, reject) => {
  throw new Error('sync error');
}).catch((error) => {
  assert(error.message === 'sync error', '동기 에러 캡처 - executor에서의 에러');
});

// ============================================================
// Test 17: 중첩된 Promise 해결
// ============================================================
new Promise((resolve) => {
  resolve(
    new Promise((resolve2) => {
      resolve2(42);
    })
  );
}).then((value) => {
  assert(value === 42, '중첩된 Promise - 자동 해결');
});

// ============================================================
// Test 18: then에서 Promise 반환
// ============================================================
Promise.resolve(1)
  .then((v) => {
    return new Promise((resolve) => {
      resolve(v + 1);
    });
  })
  .then((v) => {
    assert(v === 2, 'then에서 Promise 반환 - 자동 체이닝');
  });

// ============================================================
// Test 19: finally에서 에러 던지기
// ============================================================
Promise.resolve(1)
  .finally(() => {
    throw new Error('finally error');
  })
  .catch((error) => {
    assert(error.message === 'finally error', 'finally 에러 - 전파');
  });

// ============================================================
// Test 20: 여러 then 핸들러
// ============================================================
let callCount = 0;
const p = Promise.resolve(10);
p.then(() => callCount++);
p.then(() => callCount++);
p.then(() => {
  assert(callCount === 2, '여러 then 핸들러 - 모두 실행');
});

// ============================================================
// Test 21: null/undefined 값 처리
// ============================================================
Promise.resolve(null).then((value) => {
  assert(value === null, 'null 값 처리');
});

Promise.resolve(undefined).then((value) => {
  assert(value === undefined, 'undefined 값 처리');
});

// ============================================================
// Test 22: 빈 배열 Promise.all
// ============================================================
Promise.all([]).then((results) => {
  assert(JSON.stringify(results) === '[]', 'Promise.all 빈 배열');
});

// ============================================================
// 결과 출력 (0.5초 후)
// ============================================================
setTimeout(() => {
  printResults();
}, 500);
