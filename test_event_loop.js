/**
 * EventLoop 테스트 스위트
 * Task 3: EventLoop 실제 구현 검증
 */

const { EventLoop, getGlobalEventLoop, queueMicrotask } = require('./src/event-loop');
const Promise = require('./src/promise');

// 테스트 결과 수집
const results = [];
let testCount = 0;
let passCount = 0;

function assert(condition, message, testName) {
  testCount++;
  if (condition) {
    passCount++;
    console.log(`✅ [${testCount}] ${testName}: ${message}`);
    results.push({ test: testName, status: 'PASS', message });
  } else {
    console.log(`❌ [${testCount}] ${testName}: ${message}`);
    results.push({ test: testName, status: 'FAIL', message });
  }
}

async function runTests() {
  console.log('═══════════════════════════════════════════');
  console.log('   EventLoop 테스트 스위트 시작');
  console.log('═══════════════════════════════════════════\n');

  // ============================================
  // Test 1: 단일 마이크로태스크 실행
  // ============================================
  console.log('【Test 1】단일 마이크로태스크 실행');
  await new Promise((resolve) => {
    const loop1 = new EventLoop();
    let executed1 = false;

    loop1.addMicrotask(() => {
      executed1 = true;
    });

    setTimeout(() => {
      assert(executed1, '마이크로태스크 실행됨', 'T1-Microtask');
      resolve();
    }, 50);
  });
  console.log();

  // ============================================
  // Test 2: 마이크로태스크 순서 (FIFO)
  // ============================================
  console.log('【Test 2】마이크로태스크 FIFO 순서');
  await new Promise((resolve) => {
    const loop2 = new EventLoop();
    let order2 = [];

    loop2.addMicrotask(() => order2.push('a'));
    loop2.addMicrotask(() => order2.push('b'));
    loop2.addMicrotask(() => order2.push('c'));

    setTimeout(() => {
      assert(
        JSON.stringify(order2) === '["a","b","c"]',
        `순서: [${order2.join(', ')}] (기대: [a, b, c])`,
        'T2-FIFOOrder'
      );
      resolve();
    }, 100);
  });
  console.log();

  // ============================================
  // Test 3: 마크로태스크 + 마이크로태스크 실행 순서
  // ============================================
  console.log('【Test 3】마크로태스크 + 마이크로태스크 순서');
  await new Promise((resolve) => {
    const loop3 = new EventLoop();
    let order3 = [];

    // 마크로 → 마이크로 → 마크로 순서로 추가
    loop3.addMacrotask(() => order3.push('macro1'));
    loop3.addMicrotask(() => order3.push('micro1'));
    loop3.addMacrotask(() => order3.push('macro2'));

    setTimeout(() => {
      // 기대 순서:
      // 1. macro1 실행 (마크로태스크)
      // 2. micro1 실행 (마이크로태스크 - 마크로태스크 후 즉시)
      // 3. macro2 실행 (다음 마크로태스크)
      const expected = JSON.stringify(['macro1', 'micro1', 'macro2']);
      const actual = JSON.stringify(order3);
      assert(
        actual === expected,
        `순서: [${order3.join(', ')}] (기대: [macro1, micro1, macro2])`,
        'T3-MacroMicroOrder'
      );
      resolve();
    }, 150);
  });
  console.log();

  // ============================================
  // Test 4: Promise then + setTimeout 순서
  // ============================================
  console.log('【Test 4】Promise.then + setTimeout 순서');
  await new Promise((resolve) => {
    const loop4 = new EventLoop();
    let order4 = [];

    // Promise (마이크로태스크)
    new Promise((res) => res('promise')).then((value) => {
      loop4.addMicrotask(() => order4.push(value));
    });

    // setTimeout (마크로태스크)
    loop4.addMacrotask(() => order4.push('timeout'));

    setTimeout(() => {
      // Promise 콜백(마이크로)이 setTimeout(마크로)보다 먼저 실행
      const isPromiseFirst = order4[0] === 'promise';
      const isTimeoutSecond = order4[1] === 'timeout';

      assert(
        isPromiseFirst && isTimeoutSecond,
        `순서: [${order4.join(', ')}] (기대: [promise, timeout])`,
        'T4-PromiseTimeout'
      );
      resolve();
    }, 200);
  });
  console.log();

  // ============================================
  // Test 5: 이벤트 루프 종료 및 상태
  // ============================================
  console.log('【Test 5】이벤트 루프 종료 및 상태 확인');
  await new Promise((resolve) => {
    const loop5 = new EventLoop();
    let executedCount5 = 0;

    loop5.addMicrotask(() => executedCount5++);
    loop5.addMacrotask(() => executedCount5++);
    loop5.addMicrotask(() => executedCount5++);

    setTimeout(() => {
      assert(
        executedCount5 === 3,
        `실행 횟수: ${executedCount5} (기대: 3)`,
        'T5-ExecutionCount'
      );
      assert(
        !loop5.isRunning,
        '루프 종료 상태 확인',
        'T5-LoopEnded'
      );

      const status = loop5.getStatus();
      assert(
        status.microtaskCount === 0 && status.macrotaskCount === 0,
        `태스크 카운트: micro=${status.microtaskCount}, macro=${status.macrotaskCount}`,
        'T5-ZeroTasks'
      );
      resolve();
    }, 250);
  });
  console.log();

  // ============================================
  // Test 6: 중첩 마이크로태스크
  // ============================================
  console.log('【Test 6】중첩 마이크로태스크 실행');
  await new Promise((resolve) => {
    const loop6 = new EventLoop();
    let order6 = [];

    loop6.addMicrotask(() => {
      order6.push('micro1');
      // 마이크로태스크 내에서 새로운 마이크로태스크 추가
      loop6.addMicrotask(() => {
        order6.push('micro2-nested');
      });
    });

    loop6.addMicrotask(() => {
      order6.push('micro3');
    });

    setTimeout(() => {
      // 중첩된 마이크로태스크도 모두 실행됨
      const hasNested = order6.includes('micro2-nested');
      assert(
        hasNested && order6.length === 3,
        `순서: [${order6.join(', ')}]`,
        'T6-NestedMicrotasks'
      );
      resolve();
    }, 300);
  });
  console.log();

  // ============================================
  // Test 7: queueMicrotask 전역 함수
  // ============================================
  console.log('【Test 7】queueMicrotask 전역 함수');
  await new Promise((resolve) => {
    let executed7 = false;

    queueMicrotask(() => {
      executed7 = true;
    });

    setTimeout(() => {
      assert(
        executed7,
        'queueMicrotask으로 추가한 마이크로태스크 실행됨',
        'T7-QueueMicrotask'
      );
      resolve();
    }, 50);
  });
  console.log();

  // ============================================
  // Test 8: getGlobalEventLoop 싱글톤
  // ============================================
  console.log('【Test 8】getGlobalEventLoop 싱글톤 패턴');
  await new Promise((resolve) => {
    const loop8a = getGlobalEventLoop();
    const loop8b = getGlobalEventLoop();

    const isSameInstance = loop8a === loop8b;
    assert(
      isSameInstance,
      '같은 인스턴스 반환됨',
      'T8-Singleton'
    );
    resolve();
  });
  console.log();

  // ============================================
  // Test 9: getStatus 메서드 (완료 후 상태 확인)
  // ============================================
  console.log('【Test 9】getStatus 메서드');
  await new Promise((resolve) => {
    const loop9 = new EventLoop();
    let statusBefore = null;

    // 작업 추가 전 상태
    statusBefore = loop9.getStatus();

    // 작업들 추가 (자동 실행됨)
    loop9.addMicrotask(() => {});
    loop9.addMicrotask(() => {});
    loop9.addMacrotask(() => {});

    setTimeout(() => {
      // 모든 작업이 실행되고 난 후 상태 확인
      const statusAfter = loop9.getStatus();

      assert(
        statusBefore.totalTaskCount === 0,
        `초기 상태: total=${statusBefore.totalTaskCount}`,
        'T9-GetStatus'
      );
      assert(
        statusAfter.totalTaskCount === 0,
        `최종 상태: total=${statusAfter.totalTaskCount}`,
        'T9-GetStatusFinal'
      );
      resolve();
    }, 100);
  });
  console.log();

  // ============================================
  // Test 10: waitAll 메서드
  // ============================================
  console.log('【Test 10】waitAll 메서드 (대기)');
  await new Promise((resolve) => {
    const loop10 = new EventLoop();
    let completed = false;

    loop10.addMicrotask(() => {
      // 비어있음 (즉시 완료)
    });

    loop10.waitAll().then(() => {
      completed = true;
    });

    setTimeout(() => {
      assert(
        completed,
        'waitAll이 모든 태스크 완료 후 resolve됨',
        'T10-WaitAll'
      );
      resolve();
    }, 100);
  });
  console.log();

  // ============================================
  // Test 11: 에러 처리 (마이크로태스크)
  // ============================================
  console.log('【Test 11】마이크로태스크 에러 처리');
  await new Promise((resolve) => {
    const loop11 = new EventLoop();
    let passedError = false;
    let afterError = false;

    loop11.addMicrotask(() => {
      throw new Error('Test error');
    });

    loop11.addMicrotask(() => {
      afterError = true;
    });

    setTimeout(() => {
      // 에러 후에도 다음 마이크로태스크 실행되어야 함
      assert(
        afterError,
        '에러 이후 마이크로태스크도 실행됨',
        'T11-MicrotaskErrorContinue'
      );
      resolve();
    }, 100);
  });
  console.log();

  // ============================================
  // Test 12: 지연된 마크로태스크
  // ============================================
  console.log('【Test 12】지연된 마크로태스크 추가');
  await new Promise((resolve) => {
    const loop12 = new EventLoop();
    let order12 = [];

    loop12.addMacrotask(() => order12.push('immediate'));

    // 100ms 후 마크로태스크 추가
    loop12.addMacrotask(() => order12.push('delayed'), 100);

    setTimeout(() => {
      // immediate는 즉시 실행, delayed는 100ms 후
      const hasImmediate = order12[0] === 'immediate';
      assert(
        hasImmediate,
        `첫 번째: ${order12[0]} (기대: immediate)`,
        'T12-DelayedMacrotask'
      );
      resolve();
    }, 200);
  });
  console.log();

  // ============================================
  // Test 13: clear 메서드 (초기화)
  // ============================================
  console.log('【Test 13】clear 메서드 (초기화)');
  await new Promise((resolve) => {
    const loop13 = new EventLoop();

    // 모든 작업 추가 (자동 실행됨)
    loop13.addMicrotask(() => {});
    loop13.addMacrotask(() => {});
    loop13.addMicrotask(() => {});

    setTimeout(() => {
      // 작업 완료 후 상태 확인
      let afterComplete = loop13.getStatus();
      assert(
        afterComplete.totalTaskCount === 0,
        `작업 완료 후 태스크: ${afterComplete.totalTaskCount}`,
        'T13-AfterComplete'
      );

      // 새로운 작업 추가
      loop13.addMicrotask(() => {});
      loop13.addMicrotask(() => {});

      setTimeout(() => {
        // clear 전 상태 (새로운 작업들도 실행되었음)
        loop13.clear();

        let afterClear = loop13.getStatus();
        assert(
          afterClear.totalTaskCount === 0,
          `초기화 후 태스크: ${afterClear.totalTaskCount}`,
          'T13-AfterClear'
        );

        resolve();
      }, 50);
    }, 100);
  });
  console.log();

  // ============================================
  // Test 14: tick 메서드
  // ============================================
  console.log('【Test 14】tick 메서드 (단일 사이클)');
  await new Promise((resolve) => {
    const loop14 = new EventLoop();
    let order14 = [];

    loop14.addMicrotask(() => order14.push('micro1'));
    loop14.addMicrotask(() => order14.push('micro2'));
    loop14.addMacrotask(() => order14.push('macro1'));

    // 수동으로 한 번의 틱 실행
    loop14.tick();

    setTimeout(() => {
      // micro1, micro2, macro1 모두 실행됨
      const isCorrect =
        order14[0] === 'micro1' &&
        order14[1] === 'micro2' &&
        order14[2] === 'macro1';

      assert(
        isCorrect,
        `순서: [${order14.join(', ')}]`,
        'T14-Tick'
      );
      resolve();
    }, 50);
  });
  console.log();

  // ============================================
  // Test 15: flushMicrotasks 메서드 (명시적 플러시)
  // ============================================
  console.log('【Test 15】flushMicrotasks 메서드 (명시적 플러시)');
  await new Promise((resolve) => {
    const loop15 = new EventLoop();
    let order15 = [];

    // 일반적인 사용: addMicrotask/addMacrotask 사용 시 자동 실행
    // 여기서는 flushMicrotasks의 동작을 테스트하기 위해 직접 큐에 추가
    loop15.microtasks.push(() => order15.push('micro1'));
    loop15.microtasks.push(() => order15.push('micro2'));
    loop15.macrotasks.push(() => order15.push('macro1'));

    // 마이크로태스크만 플러시
    loop15.flushMicrotasks();

    const hasMicros = order15.includes('micro1') && order15.includes('micro2');
    const noMacro = !order15.includes('macro1');

    assert(
      hasMicros && noMacro,
      `실행된 태스크: [${order15.join(', ')}] (마크로 제외)`,
      'T15-FlushMicrotasks'
    );
    resolve();
  });
  console.log();

  // ============================================
  // 최종 결과 출력
  // ============================================
  console.log('═══════════════════════════════════════════');
  console.log(`   테스트 결과: ${passCount}/${testCount} 통과`);
  console.log('═══════════════════════════════════════════\n');

  // 실패한 테스트만 표시
  const failures = results.filter(r => r.status === 'FAIL');
  if (failures.length > 0) {
    console.log('❌ 실패한 테스트:');
    failures.forEach(f => {
      console.log(`  - ${f.test}: ${f.message}`);
    });
  } else {
    console.log('✅ 모든 EventLoop 테스트 통과!');
  }

  console.log('\n✨ 세부 결과:');
  results.forEach((r, idx) => {
    const icon = r.status === 'PASS' ? '✅' : '❌';
    console.log(`  ${icon} [${idx + 1}] ${r.test}`);
  });

  process.exit(passCount === testCount ? 0 : 1);
}

// 테스트 실행
runTests().catch((error) => {
  console.error('테스트 실행 중 오류:', error);
  process.exit(1);
});
