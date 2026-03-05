# FreeLang v3.0 - 기본 문법

## 목차
1. [변수와 자료형](#변수와-자료형)
2. [연산자](#연산자)
3. [함수](#함수)
4. [제어문](#제어문)
5. [루프](#루프)
6. [배열](#배열)
7. [객체](#객체)
8. [주석](#주석)

---

## 변수와 자료형

### 변수 선언

FreeLang은 세 가지 변수 선언 방식을 제공합니다:

```fl
// let: 블록 스코프 변수 (대부분의 경우 권장)
let x = 10;
let name = "FreeLang";

// var: 함수 스코프 변수 (레거시, 권장하지 않음)
var y = 20;

// const: 상수 (v3.0+, 재할당 불가)
const PI = 3.14159;
// PI = 3.14;  // 에러!
```

### 기본 자료형

```fl
// 숫자 (정수, 실수 모두 지원)
let integer = 42;
let float_num = 3.14;
let negative = -100;
let big = 1_000_000;  // 언더스코어로 가독성 향상

// 문자열 (큰따옴표, 작은따옴표, 백틱 모두 지원)
let str1 = "Hello";
let str2 = 'World';
let str3 = `Hello, ${name}!`;  // 템플릿 리터럴

// 불린
let is_active = true;
let is_done = false;

// Null과 Undefined
let empty = null;
let not_defined = undefined;

// 배열
let arr = [1, 2, 3, 4, 5];
let mixed = [1, "string", 3.14, true];

// 객체
let obj = {
  name: "John",
  age: 30,
  city: "Seoul"
};
```

### 타입 변환

```fl
// 문자열 변환
str(42);           // "42"
str(3.14);         // "3.14"
str(true);         // "true"

// 숫자 변환
num("42");         // 42
num("3.14");       // 3.14
num("invalid");    // NaN

// 불린 변환
bool(1);           // true
bool(0);           // false
bool("");          // false
bool("hello");     // true

// 타입 검사
type(42);          // "number"
type("hello");     // "string"
type(true);        // "boolean"
type([]);          // "array"
type({});          // "object"
```

---

## 연산자

### 산술 연산자

```fl
let a = 10;
let b = 3;

println(a + b);      // 13 (덧셈)
println(a - b);      // 7 (뺄셈)
println(a * b);      // 30 (곱셈)
println(a / b);      // 3.333... (나눗셈)
println(a % b);      // 1 (나머지)
println(a ** b);     // 1000 (거듭제곱)

// 단축 연산자
let x = 5;
x += 3;              // x = 8
x -= 2;              // x = 6
x *= 2;              // x = 12
x /= 3;              // x = 4
x %= 3;              // x = 1
```

### 비교 연산자

```fl
let a = 10;
let b = 5;

println(a == b);     // false (같음)
println(a != b);     // true (다름)
println(a > b);      // true (크다)
println(a < b);      // false (작다)
println(a >= b);     // true (크거나 같다)
println(a <= b);     // false (작거나 같다)

// 엄격한 비교 (타입도 확인)
println(5 === "5");  // false
println(5 === 5);    // true
println(5 !== "5");  // true
```

### 논리 연산자

```fl
let x = true;
let y = false;

println(x && y);     // false (AND)
println(x || y);     // true (OR)
println(!x);         // false (NOT)

// 단축 평가 (short-circuit evaluation)
let a = null || "default";  // "default"
let b = "value" && "result"; // "result"
```

### 문자열 연산자

```fl
let first = "Hello";
let second = "World";

println(first + " " + second);  // "Hello World"

// 타입 강제
println("5" + 3);               // "53"
println(5 + "3");               // "53"

// 템플릿 리터럴
let name = "Alice";
let age = 25;
println(`${name} is ${age} years old`); // "Alice is 25 years old"
```

---

## 함수

### 함수 정의

```fl
// 기본 함수
fn greet(name) {
  println("Hello, " + name);
}

// 매개변수 여러 개
fn add(a, b) {
  return a + b;
}

// 반환값 없음
fn log_message(msg) {
  println(msg);
  // 명시적 return이 없으면 undefined 반환
}

// 기본값 설정
fn greet_with_default(name = "Guest") {
  return "Hello, " + name;
}

// 가변 인수
fn sum(...args) {
  let total = 0;
  for arg in args {
    total += arg;
  }
  return total;
}
```

### 함수 호출

```fl
greet("Alice");
let result = add(5, 3);
println(result);  // 8

greet_with_default();        // "Hello, Guest"
greet_with_default("Bob");   // "Hello, Bob"

println(sum(1, 2, 3, 4, 5)); // 15
```

### 고급 함수

#### 클로저

```fl
fn make_counter() {
  let count = 0;
  return fn() {
    count += 1;
    return count;
  };
}

let counter = make_counter();
println(counter());  // 1
println(counter());  // 2
println(counter());  // 3
```

#### 고차 함수 (Higher-Order Functions)

```fl
// 함수를 인수로 받음
fn apply_twice(func, value) {
  return func(func(value));
}

fn double(x) {
  return x * 2;
}

println(apply_twice(double, 5));  // 20

// 함수를 반환
fn create_multiplier(factor) {
  return fn(x) {
    return x * factor;
  };
}

let triple = create_multiplier(3);
println(triple(7));  // 21
```

#### 화살표 함수 (v3.0+)

```fl
// 한 줄 함수
let square = (x) => x * x;
println(square(5));  // 25

// 여러 줄 함수
let calculate = (a, b) => {
  let sum = a + b;
  return sum * 2;
};
println(calculate(3, 4));  // 14

// 배열 메서드와 함께 사용
let numbers = [1, 2, 3, 4, 5];
let doubled = map(numbers, (x) => x * 2);
println(doubled);  // [2, 4, 6, 8, 10]
```

---

## 제어문

### If 문

```fl
let score = 85;

if (score >= 90) {
  println("Grade: A");
} else if (score >= 80) {
  println("Grade: B");
} else if (score >= 70) {
  println("Grade: C");
} else {
  println("Grade: F");
}

// 삼항 연산자
let result = score >= 80 ? "Pass" : "Fail";
println(result);  // "Pass"
```

### Switch 문

```fl
let day = 3;

switch (day) {
  case 1:
    println("Monday");
    break;
  case 2:
    println("Tuesday");
    break;
  case 3:
    println("Wednesday");
    break;
  default:
    println("Other day");
}

// 버전 3.1+: Match 식
match day {
  1 => println("Monday"),
  2 => println("Tuesday"),
  3 => println("Wednesday"),
  _ => println("Other day")
}
```

### Try-Catch 예외 처리

```fl
try {
  let result = risky_operation();
  println(result);
} catch (error) {
  println("Error occurred: " + error);
} finally {
  println("Cleanup");
}

// 에러 발생
fn risky_operation() {
  throw "Something went wrong!";
}

// 조건부 에러
fn divide(a, b) {
  if (b == 0) {
    throw "Division by zero";
  }
  return a / b;
}
```

---

## 루프

### For 루프

```fl
// C 스타일 for 루프
for (let i = 0; i < 5; i++) {
  println(i);  // 0, 1, 2, 3, 4
}

// for-in 루프 (배열)
let arr = ["a", "b", "c"];
for item in arr {
  println(item);
}

// for-in 루프 (범위)
for i in range(0, 5) {  // 0부터 4까지
  println(i);
}

// for-in 루프 (객체 키)
let obj = { x: 10, y: 20 };
for key in keys(obj) {
  println(key + ": " + obj[key]);
}
```

### While 루프

```fl
let count = 0;
while (count < 5) {
  println(count);
  count += 1;
}

// do-while (최소 1회 실행)
let x = 0;
do {
  println(x);
  x += 1;
} while (x < 3);
```

### Break와 Continue

```fl
// break: 루프 즉시 종료
for i in range(0, 10) {
  if (i == 5) {
    break;  // 루프 탈출
  }
  println(i);  // 0, 1, 2, 3, 4
}

// continue: 다음 반복으로 건너뛰기
for i in range(0, 10) {
  if (i % 2 == 0) {
    continue;  // 짝수 건너뛰기
  }
  println(i);  // 1, 3, 5, 7, 9
}
```

### Nested 루프

```fl
for i in range(1, 4) {
  for j in range(1, 4) {
    println(str(i) + " x " + str(j) + " = " + str(i * j));
  }
}
// 구구단 출력
```

---

## 배열

### 배열 생성

```fl
// 리터럴
let arr = [1, 2, 3];
let mixed = [1, "hello", 3.14, true];
let empty = [];

// 생성자
let arr2 = array(5);      // 길이 5인 빈 배열
let arr3 = array(3, 0);   // 길이 3, 초기값 0
```

### 배열 접근 및 수정

```fl
let arr = [10, 20, 30, 40, 50];

// 인덱싱 (0부터 시작)
println(arr[0]);      // 10
println(arr[2]);      // 30
println(arr[-1]);     // 50 (마지막 요소)

// 값 할당
arr[0] = 99;
arr[1] = arr[1] + 5;  // 25

// 길이
println(len(arr));    // 5
```

### 배열 메서드

```fl
let arr = [3, 1, 4, 1, 5, 9];

// push: 끝에 추가
push(arr, 2);

// pop: 끝에서 제거
let last = pop(arr);

// shift: 앞에서 제거
let first = shift(arr);

// unshift: 앞에 추가
unshift(arr, 0);

// slice: 부분 복사
let sub = slice(arr, 1, 4);

// splice: 요소 삽입/삭제
splice(arr, 2, 1, 99);  // 인덱스 2 위치에서 1개 제거, 99 삽입

// reverse: 역순 정렬
reverse(arr);

// sort: 정렬
sort(arr);

// indexOf: 요소 검색
let idx = indexOf(arr, 5);

// includes: 포함 여부
if (includes(arr, 5)) {
  println("Found 5");
}

// join: 문자열로 변환
let str = join(arr, ", ");
println(str);  // "0, 1, 3, 4, 5, 9, 2"

// map: 변환
let doubled = map(arr, (x) => x * 2);

// filter: 필터링
let evens = filter(arr, (x) => x % 2 == 0);

// reduce: 축약
let sum = reduce(arr, 0, (acc, x) => acc + x);

// forEach: 순회
forEach(arr, (item, idx) => {
  println(str(idx) + ": " + str(item));
});
```

---

## 객체

### 객체 생성

```fl
// 리터럴
let person = {
  name: "Alice",
  age: 30,
  city: "Seoul",
  email: "alice@example.com"
};

// 생성자
let obj = object();

// 중첩 객체
let company = {
  name: "TechCorp",
  ceo: {
    name: "Bob",
    age: 45
  },
  employees: 100
};
```

### 객체 접근 및 수정

```fl
let person = { name: "Alice", age: 30 };

// 점 표기법
println(person.name);   // "Alice"
println(person.age);    // 30

// 대괄호 표기법
println(person["name"]); // "Alice"
let key = "age";
println(person[key]);    // 30

// 값 수정
person.name = "Bob";
person["email"] = "bob@example.com";

// 속성 추가
person.phone = "010-1234-5678";

// 속성 삭제
delete person.phone;
```

### 객체 메서드

```fl
let person = { name: "Alice", age: 30, city: "Seoul" };

// keys: 모든 키 가져오기
let keys_list = keys(person);  // ["name", "age", "city"]

// values: 모든 값 가져오기
let vals = values(person);     // ["Alice", 30, "Seoul"]

// entries: [키, 값] 쌍
let entries = entries(person); // [["name", "Alice"], ...]

// has: 속성 존재 여부
if (has(person, "name")) {
  println("Has name property");
}

// get: 기본값과 함께 값 가져오기
let city = get(person, "city", "Unknown");  // "Seoul"
let country = get(person, "country", "Korea");  // "Korea"

// assign: 객체 병합
let more = { phone: "010-1234-5678", email: "alice@example.com" };
let merged = assign(person, more);
// merged = { name: "Alice", age: 30, city: "Seoul", phone: "...", email: "..." }

// freeze: 수정 불가능하게
let frozen = freeze(person);
// frozen.name = "Bob";  // 에러!

// JSON 변환
let json_str = stringify(person);
let parsed = parse(json_str);
```

### 메서드 (객체의 함수)

```fl
let calculator = {
  value: 0,
  add: fn(x) {
    this.value += x;
    return this;
  },
  subtract: fn(x) {
    this.value -= x;
    return this;
  },
  result: fn() {
    return this.value;
  }
};

// 메서드 호출
calculator.add(10).subtract(3);
println(calculator.result());  // 7
```

---

## 주석

### 한 줄 주석

```fl
// 이것은 한 줄 주석입니다
let x = 10;  // 인라인 주석도 가능
```

### 여러 줄 주석

```fl
/*
  이것은
  여러 줄
  주석입니다
*/

let y = 20;
```

### 문서화 주석 (JSDoc 형식)

```fl
/**
 * 두 수를 더합니다
 *
 * @param {number} a - 첫 번째 수
 * @param {number} b - 두 번째 수
 * @returns {number} 두 수의 합
 * @example
 * add(5, 3);  // 8
 */
fn add(a, b) {
  return a + b;
}
```

---

## 요약

이제 FreeLang의 기본 문법을 이해했습니다:

| 항목 | 설명 |
|------|------|
| 변수 | let, var, const |
| 자료형 | number, string, boolean, array, object |
| 연산자 | 산술, 비교, 논리, 문자열 |
| 함수 | fn, 반환값, 매개변수, 클로저 |
| 제어문 | if, switch, try-catch |
| 루프 | for, while, break, continue |
| 배열 | 생성, 접근, 메서드 |
| 객체 | 생성, 접근, 메서드 |

다음 단계: **[비동기 프로그래밍](TUTORIAL_02_ASYNC_AWAIT.md)**
