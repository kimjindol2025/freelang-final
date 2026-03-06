# FreeLang v3.0 - 비동기 프로그래밍

## 목차
1. [Promise 기초](#promise-기초)
2. [async/await 문법](#asyncawait-문법)
3. [에러 처리](#에러-처리)
4. [Promise 조합](#promise-조합)
5. [실전 예제](#실전-예제)
6. [성능 최적화](#성능-최적화)

---

## Promise 기초

### Promise란?

Promise는 비동기 작업의 결과를 나타내는 객체입니다. 세 가지 상태를 가집니다:

- **Pending (대기)**: 작업이 진행 중
- **Fulfilled (완료)**: 작업이 성공적으로 완료됨
- **Rejected (거부)**: 작업이 실패함

### Promise 생성

```fl
// resolve: 성공 콜백
// reject: 실패 콜백
let promise = new Promise(fn(resolve, reject) {
  // 비동기 작업 수행
  let success = true;

  if (success) {
    resolve("작업 완료!");
  } else {
    reject("작업 실패!");
  }
});
```

### Promise 사용 (.then/.catch)

```fl
promise
  .then(fn(result) {
    println("Success: " + result);
  })
  .catch(fn(error) {
    println("Error: " + error);
  });

// Promise 체이닝
let promise2 = Promise.resolve(10)
  .then(fn(value) {
    return value * 2;  // 20
  })
  .then(fn(value) {
    return value + 5;  // 25
  })
  .then(fn(value) {
    println(value);    // 25
  });
```

### 간단한 Promise 생성

```fl
// resolve 상태로 완료
let resolved = Promise.resolve(42);

// reject 상태로 완료
let rejected = Promise.reject("Error message");

// delay 함수 (시간 지연 후 resolve)
let delayed = Promise.delay(1000)
  .then(fn() {
    println("1초 후 실행");
  });
```

---

## async/await 문법

### async 함수

async 키워드가 붙은 함수는 자동으로 Promise를 반환합니다:

```fl
// 기본 async 함수
async fn greet(name) {
  return "Hello, " + name;
}

let promise = greet("Alice");
promise.then(fn(msg) {
  println(msg);  // "Hello, Alice"
});

// 또는 await로 결과 얻기
let msg = await greet("Bob");
println(msg);  // "Hello, Bob"
```

### await로 Promise 기다리기

```fl
async fn fetch_user_data(user_id) {
  // 네트워크 요청 시뮬레이션
  let response = await fetch("/api/user/" + str(user_id));
  let data = await response.json();
  return data;
}

// 호출
async fn main() {
  let user = await fetch_user_data(1);
  println(user.name);
}
```

### async 함수의 특징

```fl
// 1. Promise 자동 반환
async fn always_returns_promise() {
  return 42;  // Promise.resolve(42)와 동일
}

// 2. await는 async 함수 내에서만 사용
async fn with_await() {
  let result = await some_async_operation();
  return result;
}

// 3. 순차적 실행
async fn sequential() {
  let a = await operation_a();  // 1초
  let b = await operation_b();  // 1초
  return a + b;  // 총 2초 소요
}

// 4. 병렬 실행 (더 빠름!)
async fn parallel() {
  let [a, b] = await Promise.all([
    operation_a(),  // 동시 실행
    operation_b()   // 동시 실행
  ]);  // 총 1초 소요 (가장 오래 걸리는 작업 기준)
  return a + b;
}
```

---

## 에러 처리

### Try-Catch로 에러 처리

```fl
async fn safe_operation() {
  try {
    let result = await risky_async_operation();
    println("Success: " + result);
  } catch (error) {
    println("Error caught: " + error);
  }
}

fn risky_async_operation() {
  return new Promise(fn(resolve, reject) {
    // 50% 확률로 성공/실패
    if (Math.random() > 0.5) {
      resolve("Operation succeeded");
    } else {
      reject("Operation failed");
    }
  });
}
```

### 에러 핸들링 전략

```fl
// 1. 기본 에러 처리
async fn with_default_error() {
  try {
    let data = await fetch_data();
    return data;
  } catch (error) {
    println("Error: " + error);
    return null;  // 기본값 반환
  }
}

// 2. 재시도
async fn with_retry(fn_to_call, max_retries = 3) {
  let last_error = null;

  for i in range(0, max_retries) {
    try {
      return await fn_to_call();
    } catch (error) {
      last_error = error;
      println("Retry " + str(i + 1) + " of " + str(max_retries));
      await Promise.delay(1000 * (i + 1));  // 지수 백오프
    }
  }

  throw last_error;
}

// 사용
async fn main() {
  try {
    let result = await with_retry(fn() {
      return fetch_unstable_data();
    });
    println(result);
  } catch (error) {
    println("All retries failed: " + error);
  }
}

// 3. Finally로 정리
async fn with_finally() {
  try {
    return await some_operation();
  } catch (error) {
    println("Error: " + error);
  } finally {
    println("Cleanup (항상 실행)");
  }
}
```

### Promise .catch() 사용

```fl
async fn with_catch_method() {
  return await some_promise()
    .catch(fn(error) {
      println("Error caught: " + error);
      return null;  // 폴백 값
    });
}

// 또는 여러 에러 핸들러
fetch_data()
  .then(fn(data) {
    return process_data(data);
  })
  .catch(fn(error) {
    if (error.type == "NetworkError") {
      return cached_data();  // 캐시된 데이터 반환
    } else {
      throw error;  // 다시 throw
    }
  })
  .catch(fn(error) {
    println("Final error: " + error);
    return default_data();
  });
```

---

## Promise 조합

### Promise.all() - 모두 완료될 때까지 기다리기

```fl
async fn all_example() {
  let promises = [
    fetch("/api/user"),
    fetch("/api/posts"),
    fetch("/api/comments")
  ];

  try {
    let [users, posts, comments] = await Promise.all(promises);
    println("All data loaded");
    return { users, posts, comments };
  } catch (error) {
    println("One or more failed: " + error);
  }
}

// 모두 실패해도 에러
async fn all_detailed() {
  let results = await Promise.all([
    Promise.resolve(1),
    Promise.resolve(2),
    Promise.reject("Failed!")  // 이것 때문에 전체 실패
  ]).catch(fn(error) {
    println("Caught: " + error);
    return [1, 2, null];  // 폴백
  });

  return results;
}
```

### Promise.race() - 가장 먼저 완료되는 것

```fl
async fn race_example() {
  let fast_request = fetch("/api/data");
  let timeout = Promise.delay(5000)
    .then(fn() {
      throw "Request timeout";
    });

  try {
    let result = await Promise.race([fast_request, timeout]);
    println("Result: " + result);
  } catch (error) {
    println("Error: " + error);
  }
}
```

### Promise.allSettled() - 모든 결과 기다리기 (v3.1+)

```fl
async fn all_settled_example() {
  let results = await Promise.allSettled([
    Promise.resolve(1),
    Promise.reject("Error"),
    Promise.resolve(3)
  ]);

  // results = [
  //   { status: "fulfilled", value: 1 },
  //   { status: "rejected", reason: "Error" },
  //   { status: "fulfilled", value: 3 }
  // ]

  for result in results {
    if (result.status == "fulfilled") {
      println("Success: " + result.value);
    } else {
      println("Failed: " + result.reason);
    }
  }
}
```

### Promise.any() - 하나라도 성공하면 (v3.1+)

```fl
async fn any_example() {
  try {
    let result = await Promise.any([
      Promise.reject("Error 1"),
      Promise.resolve("Success"),
      Promise.reject("Error 3")
    ]);
    println(result);  // "Success"
  } catch (error) {
    // 모두 실패한 경우
    println("All failed");
  }
}
```

---

## 실전 예제

### 예제 1: 순차적 데이터 로딩

```fl
async fn load_user_profile(user_id) {
  // 1. 사용자 정보 로드
  let user = await fetch_user(user_id);
  println("User loaded: " + user.name);

  // 2. 사용자 게시물 로드
  let posts = await fetch_posts(user_id);
  println("Posts loaded: " + str(len(posts)));

  // 3. 사용자 친구 목록 로드
  let friends = await fetch_friends(user_id);
  println("Friends loaded: " + str(len(friends)));

  return {
    user: user,
    posts: posts,
    friends: friends
  };
}
```

### 예제 2: 병렬 데이터 로딩

```fl
async fn load_dashboard() {
  // 모든 요청을 동시에 수행
  let [user, stats, notifications] = await Promise.all([
    fetch_user(),
    fetch_stats(),
    fetch_notifications()
  ]);

  return {
    user: user,
    stats: stats,
    notifications: notifications
  };
}
```

### 예제 3: 파일 처리

```fl
async fn process_files(file_list) {
  let results = [];

  // 순차 처리 (메모리 효율적)
  for file in file_list {
    try {
      let content = await read_file(file);
      let processed = await process_content(content);
      push(results, processed);
    } catch (error) {
      println("Error processing " + file + ": " + error);
    }
  }

  return results;
}

async fn process_files_parallel(file_list) {
  // 병렬 처리 (빠르지만 메모리 사용 높음)
  let promises = map(file_list, fn(file) {
    return read_file(file)
      .then(fn(content) {
        return process_content(content);
      })
      .catch(fn(error) {
        println("Error: " + file);
        return null;
      });
  });

  return await Promise.all(promises);
}
```

### 예제 4: API 폴링

```fl
async fn poll_status(resource_id, max_attempts = 30) {
  let attempt = 0;

  while (attempt < max_attempts) {
    try {
      let status = await fetch_status(resource_id);

      if (status.state == "completed") {
        return status;
      }

      println("Status: " + status.state + " (attempt " +
              str(attempt + 1) + "/" + str(max_attempts) + ")");

      // 다음 시도 전에 대기
      await Promise.delay(2000);
      attempt += 1;

    } catch (error) {
      println("Poll error: " + error);
      await Promise.delay(1000);
      attempt += 1;
    }
  }

  throw "Timeout: status still not completed";
}
```

### 예제 5: 데이터 스트림 처리

```fl
async fn process_data_stream(stream) {
  let chunk_size = 100;
  let offset = 0;

  while (true) {
    try {
      // 청크 단위로 데이터 가져오기
      let chunk = await fetch_chunk(stream, offset, chunk_size);

      if (len(chunk) == 0) {
        break;  // 끝
      }

      // 청크 처리
      await process_chunk(chunk);
      offset += chunk_size;

    } catch (error) {
      println("Stream error: " + error);
      break;
    }
  }

  println("Stream processing complete");
}
```

---

## 성능 최적화

### 1. 병렬 vs 순차

```fl
// 느린 방식 (순차)
async fn slow_approach() {
  let a = await operation_a();  // 1초
  let b = await operation_b();  // 1초
  let c = await operation_c();  // 1초
  return a + b + c;  // 총 3초
}

// 빠른 방식 (병렬)
async fn fast_approach() {
  let [a, b, c] = await Promise.all([
    operation_a(),
    operation_b(),
    operation_c()
  ]);
  return a + b + c;  // 총 1초
}
```

### 2. 조건부 병렬 처리

```fl
async fn smart_processing(data) {
  // 독립적인 작업은 병렬
  let [processed1, processed2] = await Promise.all([
    process_expensive(data.part1),
    process_expensive(data.part2)
  ]);

  // 의존하는 작업은 순차
  let final = await combine_and_process(processed1, processed2);
  return final;
}
```

### 3. 캐싱

```fl
let cache = {};

async fn fetch_with_cache(key) {
  // 캐시 확인
  if (has(cache, key)) {
    println("Cache hit: " + key);
    return cache[key];
  }

  // 캐시 미스 - 데이터 가져오기
  println("Cache miss: " + key);
  let data = await fetch_data(key);

  // 캐시에 저장
  cache[key] = data;
  return data;
}
```

### 4. 타임아웃 추가

```fl
fn with_timeout(promise, timeout_ms) {
  return Promise.race([
    promise,
    new Promise(fn(resolve, reject) {
      Promise.delay(timeout_ms).then(fn() {
        reject("Operation timeout after " +
               str(timeout_ms) + "ms");
      });
    })
  ]);
}

// 사용
async fn safe_fetch() {
  try {
    let result = await with_timeout(
      fetch_slow_api(),
      5000  // 5초 타임아웃
    );
    return result;
  } catch (error) {
    println("Error: " + error);
  }
}
```

---

## 요약

**핵심 개념**:
- Promise: 비동기 작업의 표현
- async/await: Promise를 더 쉽게 다루는 문법
- 에러 처리: try-catch, .catch()
- Promise 조합: all(), race(), allSettled(), any()

**성능 팁**:
- 독립적인 작업은 Promise.all()로 병렬 실행
- 의존 관계가 있는 작업은 순차 실행
- 캐싱으로 중복 요청 방지
- 타임아웃으로 무한 대기 방지

다음 단계: **[웹 프레임워크](TUTORIAL_03_WEB_FRAMEWORK.md)**
