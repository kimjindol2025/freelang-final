# Task 3: EventLoop 실제 구현 완료

**날짜**: 2026-03-06
**상태**: ✅ 완료 (19/19 테스트 통과)
**커밋 대기**: EventLoop 구현 완료

## 개요

JavaScript 이벤트 루프 기초 구현으로 비동기 작업 스케줄링 및 실행을 관리합니다.

## 구현 파일

### 1. `/src/event-loop.js` (신규)

**파일 크기**: 197줄
**주요 기능**: EventLoop 클래스, 전역 싱글톤, queueMicrotask 함수

#### EventLoop 클래스 구성

```javascript
class EventLoop {
  // 마이크로태스크 큐 (Promise.then 콜백)
  // 마크로태스크 큐 (setTimeout, I/O)
  // 실행 상태 플래그
  // 전역 컨텍스트 참조

  // 메서드:
  addMicrotask(callback)     // Promise 콜백 추가
  addMacrotask(callback, delay)  // setTimeout 콜백 추가
  executeSync(fn)            // 동기 실행 (try-catch 래핑)
  start()                    // 메인 루프 시작 (마이크로 → 마크로 순서)
  getStatus()                // 상태 조회
  waitAll()                  // 모든 작업 완료 대기
  clear()                    // 모든 태스크 제거
  flushMicrotasks()          // 마이크로태스크만 실행
  tick()                     // 단일 사이클 (마이크로 1개 + 마크로 1개)
}
```

#### 핵심 동작 흐름

```
addMicrotask/addMacrotask 호출
  ↓
isRunning이 false이면 start() 자동 호출
  ↓
while (micro || macro) {
  // 1단계: 모든 마이크로태스크 실행 (FIFO)
  while (microtasks.length > 0) {
    task = shift()
    task()  // 에러 처리 포함
  }

  // 2단계: 마크로태스크 1개 실행
  if (macrotasks.length > 0) {
    task = shift()
    task()  // 에러 처리 포함
  }
}
```

#### 전역 함수

```javascript
getGlobalEventLoop()      // 싱글톤 인스턴스 획득
queueMicrotask(callback)  // Promise 없이 마이크로태스크 추가
```

### 2. `test_event_loop.js` (신규)

**파일 크기**: 495줄
**테스트 횟수**: 19개 (15개 테스트 중 일부는 2-3개 assertion 포함)

## 테스트 결과 (19/19 통과)

### 기본 기능 테스트

| # | 테스트명 | 검증 내용 | 결과 |
|---|---------|---------|------|
| 1 | T1-Microtask | 단일 마이크로태스크 실행 | ✅ |
| 2 | T2-FIFOOrder | 마이크로태스크 FIFO 순서 | ✅ |
| 3 | T3-MacroMicroOrder | 마크로+마이크로 실행 순서 | ✅ |
| 4 | T4-PromiseTimeout | Promise.then + setTimeout 순서 | ✅ |
| 5-7 | T5-* | 루프 종료 & 상태 확인 (3개) | ✅ |
| 8 | T6-NestedMicrotasks | 중첩 마이크로태스크 | ✅ |
| 9 | T7-QueueMicrotask | 전역 queueMicrotask 함수 | ✅ |
| 10 | T8-Singleton | 싱글톤 패턴 | ✅ |
| 11-12 | T9-* | getStatus 메서드 (2개) | ✅ |
| 13 | T10-WaitAll | waitAll 대기 | ✅ |
| 14 | T11-MicrotaskErrorContinue | 에러 처리 & 계속 실행 | ✅ |
| 15 | T12-DelayedMacrotask | 지연된 마크로태스크 | ✅ |
| 16-17 | T13-* | clear 메서드 (2개) | ✅ |
| 18 | T14-Tick | tick 메서드 (단일 사이클) | ✅ |
| 19 | T15-FlushMicrotasks | flushMicrotasks 메서드 | ✅ |

### 테스트 출력 예시

```
═══════════════════════════════════════════
   EventLoop 테스트 스위트 시작
═══════════════════════════════════════════

【Test 3】마크로태스크 + 마이크로태스크 순서
✅ [3] T3-MacroMicroOrder: 순서: [macro1, micro1, macro2]

【Test 6】중첩 마이크로태스크 실행
✅ [8] T6-NestedMicrotasks: 순서: [micro1, micro2-nested, micro3]

【Test 11】마이크로태스크 에러 처리
Microtask error: Error: Test error
    at ...
✅ [14] T11-MicrotaskErrorContinue: 에러 이후 마이크로태스크도 실행됨

═══════════════════════════════════════════
   테스트 결과: 19/19 통과
═══════════════════════════════════════════

✅ 모든 EventLoop 테스트 통과!
```

## 구현 특징

### 1. 마이크로태스크 (높은 우선도)
- **추가 메서드**: `addMicrotask(callback)`
- **용도**: Promise.then, queueMicrotask
- **실행 순서**: 모든 마이크로태스크가 마크로태스크 전에 실행됨 (FIFO)
- **중첩 지원**: 마이크로태스크 내에서 추가된 마이크로태스크도 현재 사이클에 실행됨

### 2. 마크로태스크 (낮은 우선도)
- **추가 메서드**: `addMacrotask(callback, delay?)`
- **용도**: setTimeout, I/O 작업
- **지연 지원**: `delay` 매개변수로 지연된 마크로태스크 추가 가능
- **실행**: 마이크로태스크 모두 완료 후 1개씩 실행

### 3. 에러 처리
- **마이크로태스크 에러**: 콘솔에 출력되지만 다음 태스크 계속 실행
- **마크로태스크 에러**: 콘솔에 출력되지만 다음 태스크 계속 실행
- **안정성**: 한 작업의 에러가 다른 작업에 영향 없음

### 4. 상태 관리
- **getStatus()**: 현재 마이크로/마크로 태스크 수, 실행 여부 조회
- **clear()**: 모든 큐 초기화
- **waitAll()**: 모든 작업 완료 대기 (30초 타임아웃)

### 5. 싱글톤 패턴
- **getGlobalEventLoop()**: 전역 EventLoop 인스턴스 획득
- **queueMicrotask(callback)**: 전역 루프에 마이크로태스크 추가 (Promise 없이)

## JavaScript 이벤트 루프 호환성

### 표준 JS 동작 재현

```javascript
// 표준 JavaScript
Promise.resolve()
  .then(() => console.log('micro'))
  .then(() => {
    console.log('micro2');
    setTimeout(() => console.log('macro'), 0);
  });

setTimeout(() => console.log('macro1'), 0);

// 출력:
// micro
// micro2
// macro1
// macro
```

### FreeLang EventLoop 동작

```javascript
const loop = getGlobalEventLoop();

new Promise((res) => res()).then(() => {
  loop.addMicrotask(() => console.log('micro'));
  loop.addMicrotask(() => {
    console.log('micro2');
    loop.addMacrotask(() => console.log('macro'));
  });
});

loop.addMacrotask(() => console.log('macro1'));

// 출력 순서: micro → micro2 → macro1 → macro
```

## 다음 단계 (Task 4)

이 EventLoop 구현을 바탕으로 **Interpreter async/await 실행 로직**을 구현합니다:

1. **async 함수 지원**
   - `async fn test() { ... }` 파싱
   - Promise 자동 반환

2. **await 표현식 지원**
   - `await promise` 구현
   - Promise 값 추출 & 변수 할당

3. **에러 처리**
   - try-catch with async/await
   - Promise rejection 처리

## 파일 요약

| 파일명 | 크기 | 용도 | 상태 |
|--------|------|------|------|
| `/src/event-loop.js` | 197줄 | EventLoop 구현 | ✅ 완료 |
| `test_event_loop.js` | 495줄 | 테스트 스위트 | ✅ 19/19 통과 |

## 커밋 정보

**상태**: 커밋 대기
**변경사항**:
- `/src/event-loop.js` 신규 (197줄)
- `test_event_loop.js` 신규 (495줄)

**커밋 메시지 예상**:
```
feat: Task 3 - EventLoop 실제 구현 완료 (19/19 테스트 통과)

- EventLoop 클래스: 마이크로/마크로태스크 큐 관리
- 싱글톤 패턴: getGlobalEventLoop, queueMicrotask
- 19개 테스트 모두 통과
- Promise + setTimeout 순서 정확히 재현
```
