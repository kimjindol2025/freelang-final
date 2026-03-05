# 🚀 FreeLang v2.6.0 설계 문서

**작성일**: 2026-03-05
**상태**: 설계 완료
**목표**: 언어 기능 고도화 (타입 시스템, 에러 처리, 모듈 시스템)

---

## 📋 개요

**v2.5.0** (현재):
- 8,994줄 코드
- 54개 테스트 (16개 무관용 규칙)
- 4개 핵심 기능 (break/continue, match, async/await, generic)

**v2.6.0** (계획):
- +1,500줄 코드 추가 (예상)
- 5개 신기능 추가
- 새로운 테스트 추가

---

## ✨ 5개 신기능 계획

### **1️⃣ 모듈 시스템 강화**

#### 문제점 (v2.5.0)
```fl
# 현재: 전체 모듈을 import 해야 함
import math

# 원하는 것: 필요한 함수만 import
import { sqrt, pow } from math
```

#### 솔루션 (v2.6.0)
```fl
// 선택적 import
import { sqrt, pow } from "math"
import { map, filter } from "array"

// 기본 export
export default fn main() { ... }

// 이름 있는 export
export fn calculate(x: i32): i32 { ... }

// 전체 import
import * as math from "math"
```

**구현 영역**:
- Lexer: `import`, `from`, `export`, `default`, `as` 토큰
- Parser: import 문 파싱, export 문 파싱
- Interpreter: 모듈 로딩, 심볼 바인딩
- **규칙**: import 로드 < 100ms (R1)

**테스트** (6개):
- T1: 선택적 import
- T2: 기본 export
- T3: 이름 있는 export
- T4: 전체 import
- T5: 순환 import 방지
- T6: 모듈 스코프

---

### **2️⃣ Union 타입 (tagged union)**

#### 문제점 (v2.5.0)
```fl
# Result 패턴을 수동으로 구현
fn divide(a: i32, b: i32): any {
  if b == 0 {
    return { "error": "Division by zero" }
  }
  return { "ok": a / b }
}
```

#### 솔루션 (v2.6.0)
```fl
// Union 타입 정의
type Result<T, E> = Ok<T> | Err<E>
type Option<T> = Some<T> | None

// 함수에서 사용
fn divide(a: i32, b: i32): Result<i32, string> {
  if b == 0 {
    return Err("Division by zero")
  }
  return Ok(a / b)
}

// 패턴 매칭으로 처리
match divide(10, 2) {
  Ok(val) => println(val),
  Err(msg) => println("Error: " + msg)
}
```

**구현 영역**:
- Lexer: `type`, `|` 토큰
- Parser: union 타입 정의 파싱
- Interpreter: variant 인스턴스 생성
- **규칙**: union 패턴 매칭 100% 정확 (R2)

**테스트** (6개):
- T1: 단순 Union 정의
- T2: Generic Union
- T3: Nested Union
- T4: Pattern matching
- T5: Type checking
- T6: Variant exhaustiveness

---

### **3️⃣ try/catch 에러 처리**

#### 문제점 (v2.5.0)
```fl
# 에러 처리가 수동적
let result = parse_json(text)
if is_error(result) {
  handle_error(result)
}
```

#### 솔루션 (v2.6.0)
```fl
// try/catch 구문
try {
  let data = parse_json(text)
  process_data(data)
} catch (error) {
  println("Error: " + error.message)
  println("Stack: " + error.stack)
} finally {
  cleanup()
}

// 또는 try 표현식
let result = try parse_json(text) catch |e| {
  default_value()
}
```

**구현 영역**:
- Lexer: `try`, `catch`, `finally` 토큰
- Parser: try 문 파싱
- Interpreter: exception 처리, stack unwinding
- **규칙**: exception 전파 < 1ms (R3)

**테스트** (6개):
- T1: try/catch 기본
- T2: finally 블록
- T3: 중첩 try/catch
- T4: 에러 객체
- T5: Stack trace
- T6: 리소스 정리

---

### **4️⃣ `?` 연산자 (Result 전파)**

#### 문제점 (v2.5.0)
```fl
# 에러 처리 반복
fn load_config(): Result<Config, Error> {
  let file = match open_file("config.json") {
    Ok(f) => f,
    Err(e) => return Err(e)
  }
  let text = match read_file(file) {
    Ok(t) => t,
    Err(e) => return Err(e)
  }
  let config = match parse_json(text) {
    Ok(c) => c,
    Err(e) => return Err(e)
  }
  return Ok(config)
}
```

#### 솔루션 (v2.6.0)
```fl
// `?` 연산자로 간결하게
fn load_config(): Result<Config, Error> {
  let file = open_file("config.json")?
  let text = read_file(file)?
  let config = parse_json(text)?
  return Ok(config)
}

// `?` 없을 때의 자동 등가
fn operation(): Result<i32, Error> {
  let x = divide(10, 2)?  // 에러 발생 시 즉시 반환
  return Ok(x * 2)
}
```

**구현 영역**:
- Lexer: `?` 토큰 (이미 있을 수 있음)
- Parser: postfix `?` 파싱
- Interpreter: Result 자동 unpacking
- **규칙**: `?` 오버헤드 < 1µs (R4)

**테스트** (6개):
- T1: 단순 `?` 사용
- T2: 중첩 `?`
- T3: `?` + async/await
- T4: 에러 전파
- T5: 타입 체크
- T6: 성능

---

### **5️⃣ f-string (문자열 보간)**

#### 문제점 (v2.5.0)
```fl
# 문자열 연결이 번거로움
let name = "Alice"
let age = 30
println("Name: " + name + ", Age: " + int_to_string(age))
```

#### 솔루션 (v2.6.0)
```fl
// f-string으로 간결하게
let name = "Alice"
let age = 30
println(f"Name: {name}, Age: {age}")

// 표현식도 가능
let x = 10
let y = 20
println(f"Sum: {x + y}, Product: {x * y}")

// 포맷팅
println(f"Value: {3.14159:.2f}")  // "Value: 3.14"
println(f"Hex: {255:x}")          // "Hex: ff"
```

**구현 영역**:
- Lexer: f-string 토큰화 (특수 처리)
- Parser: 보간 표현식 파싱
- Interpreter: 표현식 평가 + 포맷팅
- **규칙**: f-string 평가 < 10ms (R5)

**테스트** (6개):
- T1: 단순 보간
- T2: 표현식 평가
- T3: 중첩 f-string
- T4: 포맷팅 지정자
- T5: 에스케이프 처리
- T6: 성능

---

## 🎯 구현 우선순위

### **Phase 1: 타입 시스템 (1주)**
1. Union 타입 (2-3일)
2. 제네릭 Union 개선 (1-2일)

### **Phase 2: 에러 처리 (1주)**
1. try/catch (2-3일)
2. `?` 연산자 (1-2일)

### **Phase 3: 모듈 시스템 (1주)**
1. 선택적 import (2-3일)
2. export 시스템 (1-2일)

### **Phase 4: 편의 기능 (3-4일)**
1. f-string (3-4일)

---

## 📊 예상 성과

| 항목 | v2.5.0 | v2.6.0 | 증가 |
|------|--------|--------|------|
| 코드 줄 | 8,994줄 | ~10,500줄 | +1,500줄 |
| 테스트 | 54개 | ~84개 | +30개 |
| 무관용 규칙 | 16개 | ~31개 | +15개 |
| 핵심 기능 | 4개 | 9개 | +5개 |

---

## 🔍 무관용 규칙 (15개 신규)

### 모듈 시스템 (R1-R2)
- **R1**: Import 로드 < 100ms
- **R2**: 순환 import 방지 100%

### Union 타입 (R3-R4)
- **R3**: Union 패턴 매칭 100% 정확
- **R4**: Exhaustiveness 체크 100%

### try/catch (R5-R6)
- **R5**: Exception 전파 < 1ms
- **R6**: Stack trace 캡처 100%

### `?` 연산자 (R7-R8)
- **R7**: `?` 오버헤드 < 1µs
- **R8**: 타입 체크 정확도 100%

### f-string (R9-R10)
- **R9**: f-string 평가 < 10ms
- **R10**: 포맷팅 정확도 100%

### 호환성 (R11-R15)
- **R11**: v2.5.0 호환성 100%
- **R12**: v2.4.0 호환성 100%
- **R13**: 문법 충돌 없음
- **R14**: 성능 저하 < 5%
- **R15**: 메모리 증가 < 10%

---

## 📈 구현 단계

### **Week 1: Phase 1 (Union 타입)**
```
Mon-Tue: Union 타입 정의 + 파싱
Wed-Thu: 패턴 매칭 구현
Fri: 테스트 + 최적화
```

### **Week 2: Phase 2 (에러 처리)**
```
Mon-Tue: try/catch 구현
Wed-Thu: `?` 연산자 구현
Fri: 테스트 + 최적화
```

### **Week 3: Phase 3 (모듈 시스템)**
```
Mon-Tue: import/export 구현
Wed-Thu: 모듈 로딩 구현
Fri: 테스트 + 최적화
```

### **Week 4: Phase 4 (f-string)**
```
Mon-Tue: f-string 토큰화
Wed-Thu: 포맷팅 구현
Fri: 테스트 + 최적화
```

---

## 🎓 언어 완성도 평가

```
v2.4.0: 자체호스팅 완성 (기초)
  ↓
v2.5.0: 4개 핵심 기능 추가 (중급)
  ↓
v2.6.0: 5개 고급 기능 추가 (고급) ← 계획
  ↓
v3.0.0: 완전한 프로그래밍 언어? (미래)
```

---

## 🔗 관련 저장소

- `freelang-final`: v2.5.0 → v2.6.0 업그레이드
- `freelang-mail-sentry`: v2.6.0 기능 활용 (AI 필터)
- `freelang-sovereign-dns`: v2.6.0 기능 활용 (분산 DNS)

---

## ✅ 검증 계획

### 논리 검증
- 5개 신기능의 문법 정의
- 15개 무관용 규칙 정의
- 30개 테스트 케이스 설계

### 실제 검증
- v2.4.0/v2.5.0 호환성 테스트
- 성능 벤치마크 (메모리, 지연)
- 실제 프로젝트에서 사용

---

**상태**: 설계 완료, 구현 대기
**예상 시작**: 2026-03-11
**예상 완료**: 2026-04-08 (4주)

