# FreeLang v2.4.0 사용 가이드

## 📦 설치 및 활성화

### 로컬 개발 환경 (npm link)

```bash
cd ~/freelang-final
npm link

# 전역 설치 확인
npm list -g freelang
# /usr/lib/node_modules/freelang@2.4.0 -> ~/freelang-final
```

## 🚀 사용 방법

### 1. 기본 FreeLang 프로그램 실행

```bash
# 로컬에서 직접 실행
cd ~/freelang-final
node main.fl

# 다른 프로젝트에서 freelang 모듈 사용
node -e "const fl = require('freelang'); console.log(fl);"
```

### 2. FreeLang 프로그램 작성 예시

**hello.fl**:
```freeLang
fn main() {
  println!("Hello, FreeLang v2.4.0!")

  # for-in 루프
  for i in range(0, 3) {
    println!("Loop: {}", i)
  }

  # 딕셔너리 리터럴
  let user = {"name": "Alice", "age": 30}
  println!("User: {}", user.name)

  # Result 패턴
  let result = ok(42)
  if is_ok(result) {
    println!("Value: {}", unwrap(result))
  }

  # 함수형 프로그래밍
  let nums = [1, 2, 3, 4, 5]
  let squared = map(nums, fn(x) { return x * x })
  println!("Squared: {}", squared)
}

main()
```

**실행**:
```bash
node main.fl < hello.fl
```

### 3. 주요 기능별 사용

#### for-in 루프
```freeLang
for item in arr { ... }
for i in range(0, 10) { ... }
```

#### return 조기 종료
```freeLang
fn find_value(arr, target) {
  for item in arr {
    if item == target { return item }
  }
  return null
}
```

#### 딕셔너리 & 멤버 접근
```freeLang
let obj = {"name": "bob", "age": 25}
let name = obj.name        # 읽기
obj.age = 26               # 쓰기
```

#### struct 기초 지원
```freeLang
struct User {
  name: string,
  age: i32
}

let u = User { name: "charlie", age: 35 }
println!("Name: {}", u.name)
```

#### Result 에러 처리
```freeLang
fn safe_divide(a, b) {
  if b == 0 { return err("Division by zero") }
  return ok(a / b)
}

let result = safe_divide(10, 2)
if is_ok(result) {
  println!("Result: {}", unwrap(result))
} else {
  println!("Error: {}", result.error)
}
```

#### 디버깅 도구
```freeLang
assert_eq(2 + 2, 4, "Basic arithmetic")
let value = trace("my_value", 42)  # 값 출력 후 반환
let type_name = debug_type(value)  # "i32"
```

#### 맵 유틸리티
```freeLang
let m = {"a": 1, "b": 2, "c": 3}
let keys = map_keys(m)           # ["a", "b", "c"]
let values = map_values(m)       # [1, 2, 3]
let merged = map_merge(m, {"d": 4})
```

#### 고급 함수형
```freeLang
# groupBy
let grouped = groupBy([1,2,3,4,5], fn(x) {
  return if x % 2 == 0 { "even" } else { "odd" }
})

# memoize (캐싱)
let fib_memo = memoize(fn(n) {
  if n <= 1 { return n }
  return fib_memo(n-1) + fib_memo(n-2)
})

# pipe (함수 파이프라인)
let result = pipe(5, [
  fn(x) { return x * 2 },      # 10
  fn(x) { return x + 3 },      # 13
  fn(x) { return x * x }       # 169
])
```

## 📊 stdlib 완성도

### Math (8/8 함수)
- `floor(x)`, `ceil(x)`, `round(x)`
- `gcd(a, b)`, `lcm(a, b)`
- `isPrime(n)`, `factorial(n)`, `fibonacci(n)`

### String (10/10 함수)
- `split(s, sep)`, `join(arr, sep)`, `trim(s)`
- `replace(s, search, rep)`, `replaceAll(s, search, rep)`
- `toInt(s)`, `toFloat(s)`, `isNumeric(s)`, `format(tpl, args)`

### Array (6/6 함수)
- `push(arr, item)`, `pop(arr)`
- `sort(arr, fn)`, `zip(arr1, arr2)`
- `chunk(arr, size)`, `compact(arr)`

### Advanced (6함수)
- `groupBy(arr, keyFn)`
- `memoize(fn)`, `once(fn)`
- `pipe(value, fns)`

### Map (10/10 함수)
- `map_get`, `map_set`, `map_delete`, `map_clear`
- `map_keys`, `map_values`, `map_entries`, `map_from_entries`
- `map_merge`, `map_filter`, `map_map`

### Result (Monad)
- `ok(value)`, `err(message)`
- `is_ok(result)`, `is_err(result)`
- `unwrap(result)`, `unwrap_or(result, default)`
- `result_map(result, fn)`, `result_and_then(result, fn)`

### Debug
- `assert_eq(a, b, msg)`, `assert_ne(a, b, msg)`, `assert_true(cond, msg)`
- `trace(label, value)`
- `timer_start()`, `timer_elapsed(timer)`
- `debug_type(value)`

## ✅ 테스트 실행

```bash
cd ~/freelang-final

# 전체 테스트 (48개)
node v2_4_tests.fl

# 개별 영역 테스트
# A: 언어 핵심, B: stdlib, C: Result, D: Debug, E: Map, F: Advanced, G: Integration
```

## 🔧 개발 환경 설정

### package.json 정보
```json
{
  "name": "freelang",
  "version": "2.4.0",
  "main": "main.fl",
  "repository": "https://gogs.dclub.kr/kim/freelang-final.git"
}
```

### 소스 파일 구조
```
freelang-final/
├── lexer.fl (490줄)
├── parser.fl (900줄)
├── interpreter_v2.fl (580줄)
├── main.fl (실행 진입점)
├── stdlib_math.fl (650줄)
├── stdlib_string.fl (590줄)
├── stdlib_array.fl (660줄)
├── stdlib_result.fl (200줄)
├── stdlib_debug.fl (180줄)
├── stdlib_map.fl (250줄)
├── stdlib_advanced.fl (550줄)
└── v2_4_tests.fl (560줄)
```

## 🌐 GOGS 저장소

**위치**: https://gogs.dclub.kr/kim/freelang-final.git

```bash
# 저장소 복제
git clone https://gogs.dclub.kr/kim/freelang-final.git

# 최신 변경 확인
cd freelang-final
git log --oneline

# 로컬 변경 저장
git add .
git commit -m "Feature: description"
git push origin master
```

## 🚦 무관용 규칙 (8/8 달성)

1. ✅ `for-in` 루프 100% 동작 (배열 & range)
2. ✅ `return` 조기종료 함수 중간 탈출 100% 동작
3. ✅ 딕셔너리 `{}` 리터럴 생성/접근 완전 동작
4. ✅ `string.split()` 정확히 배열 반환
5. ✅ `Result ok/err` 패턴 unwrap/map 완전 동작
6. ✅ v2.2.0 stdlib 100% 하위 호환
7. ✅ `assert_eq` 실패 시 메시지 포함 에러 출력
8. ✅ `timer_elapsed` 0 이상 f64 반환

## 📝 다음 단계

1. **KPM 통합**: KPM registry에 https://gogs.dclub.kr/kim/freelang-final.git 등록
2. **로컬 프로젝트**: `npm link freelang`으로 freelang 모듈 의존성 추가
3. **문서화**: Language Guide, API Reference 작성
4. **커뮤니티**: GitHub/GOGS에 사용 예시 및 튜토리얼 공유

---

**FreeLang v2.4.0** 🎉
완전 자체호스팅, 8,204줄 순수 FreeLang 코드
48개 통합 테스트, 8개 무관용 규칙 100% 달성
