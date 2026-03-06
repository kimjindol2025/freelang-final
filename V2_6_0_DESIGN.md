# FreeLang v2.6.0: 언어 고도화 설계

**상태**: 설계 완료, 구현 준비
**버전**: v2.6.0 (v2.5.0 기반, +5개 신기능)
**예상 코드**: 1,500줄 추가 (+18%)
**예상 테스트**: 30개 추가 (+56%)
**구현 기간**: 4주 (1주 1개 기능)

---

## 1️⃣ 현재 v2.5.0 상태

| 항목 | 수치 |
|------|------|
| **총 코드** | 8,204줄 |
| **총 테스트** | 48개 |
| **무관용 규칙** | 8개 (100% 달성) |
| **stdlib 모듈** | 7개 (math, string, array, result, debug, map, functional) |
| **언어 기능** | return, for-in, dict, struct, fn, if, while, break, continue |
| **완성도** | 95%+ |

---

## 2️⃣ v2.6.0 신기능 (5개)

### 기능 1️⃣: 모듈 시스템 (Module System)
**목표**: 코드 조직화 및 재사용성 강화
**구현**: 3주차

```freelang
// math_utils.fl
export fn factorial(n: i32) -> i32 {
  if n <= 1 { return 1 }
  return n * factorial(n - 1)
}

export fn gcd(a: i32, b: i32) -> i32 {
  while b != 0 {
    let temp = b
    b = a % b
    a = temp
  }
  return a
}

// main.fl
import { factorial, gcd } from "math_utils"

fn main() {
  print(factorial(5))      // 120
  print(gcd(48, 18))       // 6
}
```

**설계**:
- `export` 키워드로 공개 함수/변수 선언
- `import { name } from "module"` 문법
- 네임스페이스 분리
- 순환 의존도 감지
- 모듈 캐싱

**테스트** (8개):
1. Export 함수 선언 및 호출
2. 다중 import 처리
3. Named import 별칭 (`as`)
4. 와일드카드 import (`*`)
5. 상대 경로 import
6. 순환 의존도 감지 (에러)
7. 모듈 캐싱 검증
8. 없는 모듈 import (에러)

---

### 기능 2️⃣: Union 타입 (Sum Type)
**목표**: 타입 안전성 강화 (Pattern Matching)
**구현**: 2주차

```freelang
// Option 타입 정의
type Option = Some | None

fn unwrap(opt: Option) -> any {
  match opt {
    Some(val) => val,
    None => panic("unwrap() called on None")
  }
}

// Result 타입 정의
type Result = Ok | Err

fn divide(a: i32, b: i32) -> Result {
  if b == 0 {
    return Err
  }
  return Ok
}

fn main() {
  let x = Some(42)
  match x {
    Some(val) => print(val),     // 42
    None => print("no value")
  }

  let res = divide(10, 2)
  match res {
    Ok => print("success"),
    Err => print("error")
  }
}
```

**설계**:
- `type Name = Variant1 | Variant2` 선언
- `match` 표현식 (패턴 매칭)
- Variant 값 처리
- 타입 검사 (컴파일 타임)
- Exhaustiveness 검증

**테스트** (8개):
1. 간단한 Union 타입 정의
2. Match 표현식 처리
3. Variant 값 매칭
4. 중첩된 Union 타입
5. Exhaustiveness 검증 (모든 경우 처리)
6. 불완전한 match (경고/에러)
7. Union 타입 비교
8. Union 타입 직렬화

---

### 기능 3️⃣: try/catch 에러 처리
**목표**: 구조화된 예외 처리
**구현**: 2주차

```freelang
fn parse_int(s: string) -> i32 {
  try {
    let n = parse(s)
    return n
  } catch (error) {
    print("Parse error: " + error)
    return -1
  }
}

fn main() {
  let result = try {
    let a = divide(10, 0)
    let b = divide(a, 2)
    b
  } catch (err) {
    print("Error: " + err)
    0
  }

  print(result)  // 0
}
```

**설계**:
- `try {...} catch (e) {...}` 블록
- `throw` 문으로 예외 발생
- 예외 타입 (`string`, `error` 등)
- 중첩 try/catch 지원
- finally 블록 (선택사항)

**테스트** (8개):
1. 기본 try/catch
2. 예외 발생 및 캐치
3. 중첩 try/catch
4. catch 블록에서 재발생
5. 예외 메시지 처리
6. 여러 catch 블록
7. finally 블록 실행 순서
8. try에서 return (finally 여전히 실행)

---

### 기능 4️⃣: `?` 연산자 (Result 전파)
**목표**: 보일러플레이트 코드 감소
**구현**: 1주차

```freelang
fn read_file(path: string) -> Result {
  let f = open(path)?      // 에러면 즉시 반환
  let content = read(f)?
  close(f)?
  return Ok(content)
}

fn process_data(path: string) -> Result {
  let data = read_file(path)?   // 에러 전파
  let processed = transform(data)?
  return Ok(processed)
}

fn main() {
  match process_data("input.txt") {
    Ok(val) => print("Success: " + val),
    Err => print("Failed")
  }
}
```

**설계**:
- `expr?` 문법 (에러 전파)
- `Result` 타입과 함께 사용
- 자동 unwrap (성공) 또는 반환 (실패)
- `try` 표현식과 호환

**테스트** (6개):
1. 기본 `?` 연산자
2. `?` 체인 (연속 사용)
3. 함수 내 `?` 전파
4. `?`에서 None 처리
5. `?` 타입 검증
6. `?`와 match 결합

---

### 기능 5️⃣: f-string (포맷 문자열)
**목표**: 문자열 보간 편의성
**구현**: 1주차

```freelang
fn main() {
  let name = "Alice"
  let age = 30
  let pi = 3.14159

  // 기본 보간
  print(f"Hello, {name}!")              // Hello, Alice!

  // 표현식 보간
  print(f"Age in 5 years: {age + 5}")  // Age in 5 years: 35

  // 포맷 지정자
  print(f"π = {pi:.2f}")               // π = 3.14
  print(f"Hex: {255:x}")               // Hex: ff

  // 중첩 표현식
  let items = [1, 2, 3]
  print(f"Items: {items[0]}, {items[1]}, {items[2]}")
}
```

**설계**:
- `f"text {expr}"` 문법
- 표현식 평가 및 문자열 변환
- 포맷 지정자 (`:format_spec`)
- 이스케이핑 (`{{`, `}}`)
- 중첩 표현식 지원

**테스트** (6개):
1. 기본 보간
2. 표현식 평가
3. 포맷 지정자 (숫자, 진법)
4. 문자열 길이 제한 (`:10s`)
5. 중첩된 f-string
6. 이스케이핑 처리

---

## 3️⃣ 구현 우선순위

| 순서 | 기능 | 기간 | 이유 |
|------|------|------|------|
| 1 | Module System | 3주 | 대규모 프로젝트 지원 (복잡도 높음) |
| 2 | Union 타입 | 2주 | 타입 시스템 강화 (핵심 기능) |
| 3 | try/catch | 2주 | 에러 처리 표준화 |
| 4 | `?` 연산자 | 1주 | try/catch 간편화 (의존도 낮음) |
| 5 | f-string | 1주 | 문자열 편의성 (의존도 낮음) |

---

## 4️⃣ 구현 로드맵 (4주)

### Week 1: 기초 및 f-string
- [ ] `?` 연산자 구현 (Lexer + Parser + Interpreter)
- [ ] f-string 구현 (파싱 및 보간)
- [ ] 16개 테스트 추가

### Week 2: 타입 시스템 강화
- [ ] Union 타입 문법 추가
- [ ] Match 표현식 구현
- [ ] try/catch 예외 처리
- [ ] 20개 테스트 추가

### Week 3: 모듈 시스템
- [ ] import/export 문법
- [ ] 모듈 로더 구현
- [ ] 순환 의존도 감지
- [ ] 네임스페이스 관리
- [ ] 8개 테스트 추가

### Week 4: 통합 및 최적화
- [ ] 모든 기능 통합 테스트
- [ ] 성능 최적화
- [ ] 문서화 및 예제
- [ ] 8개 통합 테스트 추가

---

## 5️⃣ 예상 수정 사항

### Lexer 변경
```freelang
// 새로운 토큰
EXPORT, IMPORT, FROM, MATCH, TRY, CATCH, THROW, FINALLY
QUESTION  // ?
FSTRING_START, FSTRING_EXPR, FSTRING_END
TYPE_UNION  // |
```

### Parser 변경
- **Module 선언**: `export fn name(...)`
- **Import**: `import { name1, name2 } from "module"`
- **Match**: `match expr { pattern => result, ... }`
- **Try/Catch**: `try { ... } catch (e) { ... }`
- **Union**: `type Name = Variant1 | Variant2`
- **f-string**: `f"text {expr:format}"`
- **?**: `expr?`

### Interpreter 변경
- 모듈 로더 추가
- 예외 스택 관리
- Union 타입 런타임 표현
- f-string 동적 평가

---

## 6️⃣ 예상 통계

| 항목 | v2.5.0 | v2.6.0 | 증가 |
|------|--------|--------|------|
| **코드** | 8,204줄 | 9,700줄 | +1,500줄 |
| **테스트** | 48개 | 78개 | +30개 |
| **stdlib 모듈** | 7개 | 7개 | 변동 없음 |
| **완성도** | 95%+ | 98%+ | +3% |

---

## 7️⃣ 무관용 규칙 (15개)

### Module System (3개)
- **R1**: Import 해석 < 10ms (모듈 로딩)
- **R2**: 순환 의존도 100% 감지 (컴파일 에러)
- **R3**: 다중 import 모듈 간 타입 호환성 100%

### Union 타입 (3개)
- **R4**: Match exhaustiveness 100% 검증
- **R5**: Union 타입 메모리 오버헤드 < 10% (vs 기존 any)
- **R6**: Pattern matching 성능 >= 95% (vs if-else)

### try/catch (3개)
- **R7**: 예외 발생 < 1ms (오버헤드)
- **R8**: 예외 스택 추적 100% 정확
- **R9**: catch 블록 타입 검증 100%

### `?` 연산자 (3개)
- **R10**: `?` 성능 == try/catch와 동일
- **R11**: 에러 전파 100% 정확
- **R12**: 타입 추론 100% 정확

### f-string (3개)
- **R13**: f-string 파싱 < 1ms (대길이 문자열)
- **R14**: 포맷 지정자 100% 호환 (printf 스타일)
- **R15**: 보간 값 자동 타입 변환 100% 정확

---

## 8️⃣ 기술 문제 및 해결책

### 문제 1: Union 타입의 메모리 효율
**문제**: `type Result = Ok | Err`에서 메모리 표현
**해결**: Tagged Union (태그 1바이트 + 값)
```
| Tag (1B) | Value (7B) | Total: 8B
```

### 문제 2: Module 순환 의존도
**문제**: A → B → A 순환
**해결**: 그래프 기반 DFS + 순환 감지

### 문제 3: f-string의 보간 순서
**문제**: `f"a={a}, b={b}"` 파싱 및 평가 순서
**해결**: 정규식 기반 토큰화 + 순서대로 평가

---

## 9️⃣ 예상 난제 및 전략

| 난제 | 전략 |
|------|------|
| **Module 간 타입 호환성** | 구조적 타입 시스템 (Nominal 회피) |
| **재귀적 Union 타입** | 제한된 깊이 (최대 10레벨) |
| **f-string 중첩 표현식** | 간단한 파서 + 깊이 제한 |
| **예외 스택 추적 성능** | Lazy stack unwinding (필요시만) |

---

## 🔟 검증 전략

### 1️⃣ 단위 테스트 (78개)
- Module System: 8개
- Union 타입: 8개
- try/catch: 8개
- `?` 연산자: 6개
- f-string: 6개
- 통합: 36개

### 2️⃣ 무관용 규칙 검증
- 성능 측정 (ms/µs)
- 정확도 검증 (%)
- 메모리 오버헤드 (<%)

### 3️⃣ 호환성 검증
- 기존 v2.5.0 코드 100% 호환
- Stdlib 모듈 호환
- GOGS 푸시 전 로컬 검증

---

## 1️⃣1️⃣ 다음 단계 (v2.7.0 후보)

- **Async/Await**: `async fn`, `await`, Promise
- **Generics**: `fn<T> process(item: T) -> T`
- **Trait System**: 인터페이스 기반 다형성
- **Macro System**: 메타프로그래밍 지원
- **Garbage Collection Tuning**: GC 성능 최적화

---

## 1️⃣2️⃣ 결론

**v2.6.0**은 FreeLang의 실용성을 크게 향상시킵니다:
- 🎯 **코드 조직화**: Module System으로 대규모 프로젝트 지원
- 🛡️ **타입 안전성**: Union 타입과 Pattern Matching
- 📋 **에러 처리**: try/catch와 `?` 연산자
- ✨ **개발자 경험**: f-string으로 문자열 작업 간편화

**상태**: 설계 완료, 4주 구현 준비 완료 ✅
**시작**: 2026-03-06부터 주간 구현
**목표**: 2026-04-03 완료, v2.6.0 공식 배포

---

**기록이 증명이다** - 모든 진행 과정을 GOGS에 커밋하며 기록합니다. 🚀
