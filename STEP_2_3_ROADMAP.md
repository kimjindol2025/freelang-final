# Step 2 & Step 3 로드맵

**작성 날짜**: 2026-03-05
**상태**: 📋 **계획 단계**
**이전 단계**: ✅ Step 1 완료 (JS 브릿지 런타임 구축)

---

## 📊 현황 요약

### Step 1: ✅ 완료
- **목표**: `require('freelang')` 기능 구현
- **결과**: 25개 내장 함수 구현, 모듈 로드 가능
- **커밋**: 33c6261, 1a96e2a

### Step 2: ⏳ KPM 통합 수정 (선택사항)
- **목표**: KPM으로 패키지 배포 가능하게
- **예상 시간**: ~30분
- **우선순위**: 낮음 (Optional)

### Step 3: ⏳ stdlib 함수 실제 구현 (필수)
- **목표**: 다수 stub 함수를 실제로 구현
- **예상 시간**: ~1주일
- **우선순위**: 높음 (프로덕션 준비)

---

## 📌 Step 2: KPM 통합 수정

### 현재 문제

**파일**: `kpm/lib/api.js:29`
```js
// 현재 (잘못됨)
params.url = `http://localhost:4000/api${params.url}`;
```

**결과**: KPM이 localhost:4000으로만 요청 → 253 서버 접근 불가

### 해결 방법 A (권장): api.js 3줄 수정

**파일**: `kpm/lib/api.js`
```js
// 수정 전 (line 29)
params.url = `http://localhost:4000/api${params.url}`;

// 수정 후
const config = require('./api-config');
params.url = `${config.baseUrl}${params.url}`;
```

**효과**: api-config.js의 baseUrl 사용 → 253 서버 접근 가능

### 해결 방법 B: 253 서버 KPM 서버 기동

**SSH 접속**:
```bash
ssh -p 22253 kimjin@123.212.111.26
cd ~/kpm-all-data
bash kpm-integration-phase2.sh
```

**결과**: localhost:4000이 응답하면 Option A 불필요

### 검증 절차

```bash
# Step 2 수정 후 테스트
cd ~/freelang-final
kpm publish .

# 예상 출력
# ✓ Published freelang@2.5.0
# ✓ Available at https://kpm.dclub.kr/freelang
```

---

## 📌 Step 3: stdlib 함수 실제 구현

### 3-1. 우선순위 (1주일 일정)

#### **Day 1-2: stdlib_string.fl** (100줄)
중요도: 🔴 **높음** (문자열은 모든 프로그램의 기초)

**구현 목록**:
1. ✅ `split(s, sep): [string]` - 이미 구현됨
2. ❌ `upper(s: string): string` - stub → 실제 구현
3. ❌ `lower(s: string): string` - stub → 실제 구현
4. ✅ `trim(s): string` - 이미 구현됨
5. ⚠️ `replace(s, search, rep): string` - 부분 구현 → 완성
6. ⚠️ `replaceAll(s, search, rep): string` - 부분 구현 → 완성

**구현 코드 예시**:
```freeLang
fn upper(s: string): string {
  let result = ""
  for i in range(0, len(s)) {
    let ch = s[i]
    if ch >= "a" and ch <= "z" {
      # ASCII: 'a' = 97, 'A' = 65, 차이 = 32
      result = result + ascii_char(ascii_code(ch) - 32)
    } else {
      result = result + ch
    }
  }
  return result
}
```

#### **Day 2-3: stdlib_math.fl** (150줄)
중요도: 🟡 **중간** (수치 계산 필요 시)

**구현 목록**:
1. ✅ `floor(x: f64): i32` - 이미 구현됨
2. ❌ `sin(x: f64): f64` - stub → 테일러급수로 구현
3. ❌ `cos(x: f64): f64` - stub → 테일러급수로 구현
4. ❌ `tan(x: f64): f64` - stub → sin/cos로 계산
5. ✅ `sqrt(x: f64): f64` - 이미 구현됨
6. ⚠️ `pow(x: f64, n: i32): f64` - 부분 구현 → 완성
7. ❌ `abs(x: f64): f64` - stub → 부호 제거
8. ❌ `max(a: f64, b: f64): f64` - stub → 비교
9. ❌ `min(a: f64, b: f64): f64` - stub → 비교

**테일러급수 구현**:
```freeLang
# sin(x) = x - x^3/3! + x^5/5! - x^7/7! + ...
fn sin(x: f64): f64 {
  let result = 0.0
  for n in range(0, 20) {  # 20항까지 계산
    let sign = if n % 2 == 0 { 1.0 } else { -1.0 }
    let fact = factorial(2*n + 1)
    let term = sign * pow(x, 2*n + 1) / fact
    result = result + term
  }
  return result
}
```

#### **Day 3-4: stdlib_io.fl** (120줄)
중요도: 🔴 **높음** (I/O는 반드시 필요)

**구현 목록**:
1. ❌ `print(value: any): null` - stub → 실제 출력
2. ❌ `println(value: any): null` - stub → 실제 출력
3. ❌ `readFile(path: string): string` - stub → 파일 읽기
4. ❌ `writeFile(path: string, content: string): bool` - stub → 파일 쓰기
5. ⚠️ `appendFile(path: string, content: string): bool` - 미구현
6. ❌ `readStdin(): string` - stub → stdin 읽기
7. ❌ `getStdin(): string` - stub → stdin 읽기 (alias)

**구현 방식**:
```freeLang
# JavaScript 런타임 함수 호출 (src/runtime.js의 함수 사용)
# FreeLang의 내부 함수로 JS 함수를 래핑

fn print(value: any): null {
  # 내부 호출: __builtin_print(value)
  # 이는 src/runtime.js의 print()를 호출
  return null
}
```

#### **Day 4-5: stdlib_array.fl** (150줄)
중요도: 🟡 **중간** (배열 처리 필요 시)

**구현 목록**:
1. ❌ `push(arr: [any], item: any): [any]` - stub → 배열 끝에 추가
2. ❌ `pop(arr: [any]): any` - stub → 배열 끝에서 제거
3. ❌ `shift(arr: [any]): any` - stub → 배열 앞에서 제거
4. ❌ `unshift(arr: [any], item: any): [any]` - stub → 배열 앞에 추가
5. ✅ `sort(arr: [any], fn: fn): [any]` - 부분 구현 → Quick Sort
6. ❌ `reverse(arr: [any]): [any]` - stub → 역순
7. ❌ `slice(arr: [any], start: i32, end?: i32): [any]` - stub → 부분 추출
8. ❌ `splice(arr: [any], start: i32, count: i32): [any]` - stub → 제거 및 추가
9. ❌ `indexOf(arr: [any], item: any): i32` - stub → 인덱스 검색
10. ❌ `includes(arr: [any], item: any): bool` - stub → 포함 확인

#### **Day 5-6: stdlib_advanced.fl** (100줄)
중요도: 🟢 **낮음** (고급 함수형)

**구현 목록**:
1. ❌ `map(arr: [any], fn: fn): [any]` - stub → 각 요소에 함수 적용
2. ❌ `filter(arr: [any], fn: fn): [any]` - stub → 조건 만족하는 요소만
3. ❌ `reduce(arr: [any], fn: fn, init: any): any` - stub → 누적 계산
4. ❌ `forEach(arr: [any], fn: fn): null` - stub → 각 요소에 함수 실행
5. ✅ `groupBy(arr: [any], keyFn: fn): map` - 부분 구현 → 완성
6. ⚠️ `memoize(fn: fn): fn` - 미구현 → 캐싱 함수 래퍼

#### **Day 6-7: 테스트 및 검증** (150줄)
중요도: 🔴 **높음** (품질 보장)

**생성**: `test_stdlib_impl.fl`
- 40개 테스트 케이스
- 8개 무관용 규칙 검증
- 성능 벤치마크

---

### 3-2. 무관용 규칙 (Unforgiving Rules)

이 규칙들은 100% 정확하게 작동해야 합니다:

1. **문자열 변환 100%**: `upper("hello")` = `"HELLO"`, `lower("HELLO")` = `"hello"`
2. **배열 메서드 100%**: `push([1,2], 3)` = `[1,2,3]`, `pop([1,2,3])` = `2`
3. **삼각함수 95% 정확도**: `sin(0.0)` ≤ `0.001`, `cos(0.0)` ≥ `0.999`
4. **파일 I/O 100%**: `write_file("x", "y")` + `read_file("x")` = `"y"`
5. **배열 검색 100%**: `indexOf([1,2,3], 2)` = `1`, `includes([1,2,3], 2)` = `true`
6. **고차함수 100%**: `map([1,2,3], x => x*2)` = `[2,4,6]`
7. **stdlib v2.4.0 호환 100%**: 기존 함수는 모두 작동해야 함
8. **성능**: 배열 정렬 1,000개 요소 < 100ms

---

### 3-3. 구현 순서

**순환 의존성 회피**:
1. stdlib_string.fl (다른 모듈과 무관)
2. stdlib_math.fl (다른 모듈과 무관)
3. stdlib_io.fl (런타임 필요, src/runtime.js 사용)
4. stdlib_array.fl (string, math 사용)
5. stdlib_advanced.fl (array, string, math 사용)
6. test_stdlib_impl.fl (모든 모듈 테스트)

---

## 🎯 추정 시간표

| 단계 | 항목 | 예상 시간 | 상태 |
|------|------|---------|------|
| Step 2 | KPM api.js 수정 | 30분 | ⏳ |
| Step 3 | string 함수 | 4시간 | ⏳ |
| Step 3 | math 함수 | 4시간 | ⏳ |
| Step 3 | io 함수 | 3시간 | ⏳ |
| Step 3 | array 함수 | 4시간 | ⏳ |
| Step 3 | advanced 함수 | 3시간 | ⏳ |
| Step 3 | 테스트 작성 | 4시간 | ⏳ |
| **합계** | | **22.5시간** | |

---

## 📁 최종 파일 구조

```
freelang-final/ (v2.5.0)
├── index.js ✅ (24줄)
├── src/
│   └── runtime.js ✅ (541줄)
├── lexer.fl ✅
├── parser.fl ✅
├── interpreter_v2.fl ✅
├── stdlib_io.fl ⏳ (print, read_file 미구현)
├── stdlib_string.fl ⏳ (upper, lower 미구현)
├── stdlib_math.fl ⏳ (sin, cos, tan 미구현)
├── stdlib_array.fl ⏳ (push, pop, sort 미구현)
├── stdlib_advanced.fl ⏳ (map, filter, reduce 미구현)
├── stdlib_result.fl ✅
├── stdlib_debug.fl ✅
├── stdlib_map.fl ✅
├── test_stdlib_impl.fl ⏳ (40개 신규 테스트)
└── 문서들
    ├── PROBLEM_ANALYSIS_AND_PLAN.md ✅
    ├── STEP_1_JS_RUNTIME_COMPLETION.md ✅
    └── STEP_2_3_ROADMAP.md (이 파일)
```

---

## 🚀 시작 시점

**Step 2 시작**: 사용자 승인 후 언제든지 (KPM 필요 시)
**Step 3 시작**: 사용자 승인 후 즉시 (프로덕션 준비 위해 권장)

---

**작성 날짜**: 2026-03-05
**예상 완료**: 2026-03-12 (Step 3 포함 시)
**최소 요구사항**: Step 1 ✅ + Step 3 (일부)
