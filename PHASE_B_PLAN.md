# 🚀 Phase B: FreeLang 자체 런타임 구현 (4주)

**시작**: 2026-03-03
**기한**: 2026-03-31
**상태**: 🔄 **계획 단계**

---

## 📊 Phase B 목표

### 최종 산출물
| 항목 | 크기 | 역할 |
|------|------|------|
| **stdlib.fl** | 3,000+줄 | FreeLang 표준 라이브러리 |
| **runtime.rs** | 2,000+줄 | Rust 기반 자체 런타임 |
| **통합 테스트** | 500+줄 | Phase B 검증 |
| **문서** | 1,000+줄 | 설치, 사용 가이드 |

### 성능 목표
- **속도**: 5-10배 개선 (현재 TypeScript 인터프리터 대비)
- **메모리**: 50% 절감
- **동시성**: Go-style 코루틴 지원

---

## 🗓️ 주간 계획 (4주)

### 📅 Week 1 (2026-03-03 ~ 03-09): 표준 함수 설계 & 기초

**목표**: stdlib.fl 기초 구축 (800줄)

**작업**:
1. **Module 구조 설계** (200줄)
   - builtin.fl: 기본 함수 (print, len, type, etc.)
   - string.fl: 문자열 함수 (split, join, upper, lower, etc.)
   - array.fl: 배열 함수 (map, filter, reduce, sort, etc.)
   - math.fl: 수학 함수 (sin, cos, sqrt, abs, etc.)
   - io.fl: I/O 함수 (readFile, writeFile, readLine, etc.)

2. **Builtin 함수 구현** (300줄)
   - print(value) - 콘솔 출력
   - println(value) - 줄바꿈 포함 출력
   - len(s) - 길이
   - type(v) - 타입 확인
   - assert(cond, msg) - 어서션
   - panic(msg) - 예외

3. **String 함수 기초** (300줄)
   - split(s, sep) - 분할
   - join(arr, sep) - 연결
   - upper(s) / lower(s) - 대소문자
   - trim(s) - 공백 제거
   - startsWith(s, prefix) - 시작 확인
   - endsWith(s, suffix) - 끝 확인

**검증**:
- [ ] 모든 함수 문법 검증
- [ ] 10개 테스트 케이스 작성
- [ ] stdlib.fl 로드 가능 확인

---

### 📅 Week 2 (2026-03-10 ~ 03-16): Array & Math 확장 (900줄)

**목표**: stdlib.fl 중간 완성 (1,700줄)

**작업**:
1. **Array 함수 확장** (400줄)
   - map(arr, fn) - 맵핑
   - filter(arr, fn) - 필터링
   - reduce(arr, fn, init) - 축약
   - sort(arr, fn) - 정렬
   - reverse(arr) - 역순
   - slice(arr, start, end) - 슬라이스
   - concat(arr1, arr2) - 연결
   - indexOf(arr, item) - 인덱스

2. **Math 함수 구현** (300줄)
   - abs(x) - 절댓값
   - sqrt(x) - 제곱근
   - pow(x, y) - 거듭제곱
   - floor(x) / ceil(x) - 올림/내림
   - round(x) - 반올림
   - sin(x) / cos(x) - 삼각함수
   - min(a, b) / max(a, b) - 최소/최대
   - random() - 난수

3. **Rust Runtime 초안** (200줄)
   - Evaluator 구조 정의
   - Value 타입 정의
   - 기본 연산 구현

**검증**:
- [ ] Array 함수 15개 테스트
- [ ] Math 함수 10개 테스트
- [ ] 총 25개 테스트 통과

---

### 📅 Week 3 (2026-03-17 ~ 03-23): I/O & Runtime 완성 (1,000줄)

**목표**: stdlib.fl 완성 (2,700줄) + runtime.rs 시작 (500줄)

**작업**:
1. **I/O 함수 구현** (500줄)
   - readFile(path) - 파일 읽기
   - writeFile(path, content) - 파일 쓰기
   - appendFile(path, content) - 파일 추가
   - readLine() - 한 줄 읽기
   - exists(path) - 파일 존재 확인
   - delete(path) - 파일 삭제
   - listDir(path) - 디렉토리 목록

2. **고급 함수 구현** (300줄)
   - find(arr, fn) - 찾기
   - findIndex(arr, fn) - 인덱스 찾기
   - some(arr, fn) - 조건 확인 (하나라도)
   - every(arr, fn) - 조건 확인 (모두)
   - unique(arr) - 중복 제거
   - flatten(arr) - 평탄화
   - zip(arr1, arr2) - 짝맞추기
   - partition(arr, fn) - 분할

3. **Rust Runtime 구현** (500줄)
   - Lexer 인터페이스
   - Parser 인터페이스
   - Evaluator 구현 (기본)
   - Value 저장소
   - 환경 관리

**검증**:
- [ ] I/O 함수 10개 테스트 (파일 기반)
- [ ] 고급 함수 10개 테스트
- [ ] Rust 컴파일 성공
- [ ] 총 20개 테스트 통과

---

### 📅 Week 4 (2026-03-24 ~ 03-31): 최적화 & 완성 (800줄)

**목표**: Phase B 완성 (총 3,500줄 + runtime.rs 2,000줄)

**작업**:
1. **성능 최적화** (300줄)
   - 함수 캐싱
   - 메모리 풀 구현
   - 가비지 컬렉션 (기초)

2. **통합 테스트** (300줄)
   - 50개 종합 시나리오
   - 성능 벤치마크
   - 메모리 프로파일링

3. **문서 작성** (200줄)
   - 설치 가이드
   - API 레퍼런스
   - 예제 집합

4. **Rust Runtime 완성** (1,500줄)
   - 전체 Evaluator 완성
   - 예외 처리
   - 디버깅 모드

**검증**:
- [ ] 모든 함수 문서화
- [ ] 50개 통합 테스트 통과
- [ ] 성능 목표 달성 (5-10배)
- [ ] GOGS 푸시

---

## 🎯 세부 구현 전략

### 1. stdlib.fl 모듈화 (2,700줄)

```freelang
# builtin.ml - 기본 함수 (300줄)
fn print(value: any): null { ... }
fn println(value: any): null { ... }
fn len(s: any): i32 { ... }
fn type(v: any): string { ... }

# string.fl - 문자열 함수 (300줄)
fn split(s: string, sep: string): [string] { ... }
fn join(arr: [string], sep: string): string { ... }
fn upper(s: string): string { ... }
fn lower(s: string): string { ... }

# array.fl - 배열 함수 (400줄)
fn map(arr: [any], fn: fn(any)->any): [any] { ... }
fn filter(arr: [any], fn: fn(any)->bool): [any] { ... }
fn reduce(arr: [any], fn: fn(any, any)->any, init: any): any { ... }
fn sort(arr: [any], fn: fn(any, any)->i32): [any] { ... }

# math.fl - 수학 함수 (300줄)
fn abs(x: i32): i32 { ... }
fn sqrt(x: f64): f64 { ... }
fn sin(x: f64): f64 { ... }
fn cos(x: f64): f64 { ... }

# io.fl - I/O 함수 (500줄)
fn readFile(path: string): string { ... }
fn writeFile(path: string, content: string): null { ... }
fn readLine(): string { ... }
```

### 2. Rust Runtime (2,000줄)

```rust
// runtime/src/main.rs
mod lexer;
mod parser;
mod evaluator;
mod stdlib;
mod value;

use evaluator::Evaluator;
use value::Value;

fn main() {
    let args: Vec<String> = std::env::args().collect();

    match args.get(1).map(|s| s.as_str()) {
        Some("--eval") => {
            // eval mode
        }
        Some(path) => {
            // file mode
        }
        None => {
            // repl mode
        }
    }
}

// runtime/src/value.rs (500줄)
#[derive(Clone, Debug)]
pub enum Value {
    Null,
    Bool(bool),
    Number(f64),
    String(String),
    Array(Vec<Value>),
    Object(std::collections::HashMap<String, Value>),
    Function(Function),
}

// runtime/src/evaluator.rs (1,000줄)
pub struct Evaluator {
    env: Environment,
}

impl Evaluator {
    pub fn eval(&mut self, node: ASTNode) -> Result<Value, Error> {
        // Full evaluation logic
    }
}

// runtime/src/stdlib.rs (500줄)
pub fn register_stdlib(env: &mut Environment) {
    // Register all stdlib functions
}
```

---

## 📈 진행 추적

### Milestones
- [ ] **Week 1**: stdlib.fl 800줄 + 10개 테스트
- [ ] **Week 2**: stdlib.fl 1,700줄 + 25개 테스트
- [ ] **Week 3**: stdlib.fl 2,700줄 + 45개 테스트 + runtime.rs 500줄
- [ ] **Week 4**: 완전 완성 + 50개 통합 테스트

### 성능 목표
| 메트릭 | 목표 | 검증 방법 |
|--------|------|---------|
| **속도** | 5-10배 향상 | 100개 연산 시간 측정 |
| **메모리** | 50% 절감 | 힙 프로파일링 |
| **함수** | 50+개 | 함수 목록 카운트 |
| **테스트** | 50개 통과 | 자동화 테스트 |

---

## 🔧 기술 스택

### FreeLang (stdlib.fl)
- 언어: 순수 FreeLang
- 스타일: 함수형 (map, filter, reduce)
- 모듈: 5개 (builtin, string, array, math, io)

### Rust (runtime.rs)
- 버전: 1.70+
- 의존성: 최소화 (serde, chrono만 사용)
- 아키텍처: Tree-walking 인터프리터

---

## 🎖️ 성공 기준

### 코드 기준
- [ ] stdlib.fl: 2,700줄 (목표 2,700줄)
- [ ] runtime.rs: 2,000줄 (목표 2,000줄)
- [ ] 통합 테스트: 500줄

### 기능 기준
- [ ] 표준 함수 50+개 구현
- [ ] 모든 함수 문서화
- [ ] 5가지 모드 지원 (eval, file, repl, REPL-advanced, debug)

### 성능 기준
- [ ] TypeScript 대비 5배 이상 빠름
- [ ] 메모리 50% 절감
- [ ] 벤치마크 문서 작성

### 품질 기준
- [ ] 50개 통합 테스트 100% 통과
- [ ] 모든 함수 에러 처리
- [ ] 완전한 문서 (설치, API, 예제)

---

## 📝 다음 단계

### Phase B 완성 후 (2026-03-31)
1. GOGS에 저장
2. 최종 완성 보고서 작성
3. Phase C 계획 (배포 준비)

### Phase C 계획 (4월)
1. FPM 패키지 관리자
2. 공식 배포 (Linux, macOS, Windows)
3. 오픈소스 공개

---

**상태**: 📋 **계획 단계**
**다음**: Week 1 시작 (2026-03-03)
**목표**: 2026-03-31 완성

🚀 **Let's Build the Runtime!**
