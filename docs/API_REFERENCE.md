# FreeLang v3.0 - API 레퍼런스

## 목차
1. [문자열 함수](#문자열-함수)
2. [배열 함수](#배열-함수)
3. [객체 함수](#객체-함수)
4. [수학 함수](#수학-함수)
5. [타입 함수](#타입-함수)
6. [I/O 함수](#io-함수)
7. [시간 함수](#시간-함수)
8. [정규표현식](#정규표현식)

---

## 문자열 함수

### len(str)
문자열의 길이를 반환합니다.
```fl
len("hello");              // 5
len("");                   // 0
```

### str(value)
값을 문자열로 변환합니다.
```fl
str(42);                   // "42"
str(3.14);                 // "3.14"
str(true);                 // "true"
str([1,2,3]);              // "[1,2,3]"
```

### upper(str)
대문자로 변환합니다.
```fl
upper("hello");            // "HELLO"
upper("Hello World");      // "HELLO WORLD"
```

### lower(str)
소문자로 변환합니다.
```fl
lower("HELLO");            // "hello"
lower("Hello World");      // "hello world"
```

### trim(str)
양쪽 공백을 제거합니다.
```fl
trim("  hello  ");         // "hello"
trim("\n\thello\t\n");     // "hello"
```

### substring(str, start, end?)
부분 문자열을 추출합니다.
```fl
substring("hello", 1, 4);  // "ell"
substring("hello", 2);     // "llo"
substring("hello", -3);    // "llo" (끝에서 3자)
```

### indexOf(str, search)
검색 문자열의 위치를 반환합니다 (-1 = 없음).
```fl
indexOf("hello", "l");     // 2
indexOf("hello", "x");     // -1
indexOf("hello", "lo");    // 3
```

### lastIndexOf(str, search)
마지막 위치를 반환합니다.
```fl
lastIndexOf("hello", "l"); // 3
```

### split(str, separator)
문자열을 나누어 배열로 반환합니다.
```fl
split("a,b,c", ",");       // ["a", "b", "c"]
split("hello", "");        // ["h", "e", "l", "l", "o"]
split("a  b  c", " ");     // ["a", "", "b", "", "c"]
```

### join(arr, separator)
배열을 문자열로 결합합니다.
```fl
join(["a", "b", "c"], ",");  // "a,b,c"
join([1, 2, 3], "-");        // "1-2-3"
join(["x"], "");             // "x"
```

### replace(str, search, replacement)
첫 번째 일치하는 부분을 교체합니다.
```fl
replace("hello world", "world", "there");  // "hello there"
replace("aaa", "a", "b");                  // "baa"
```

### replaceAll(str, search, replacement)
모든 일치하는 부분을 교체합니다.
```fl
replaceAll("aaa", "a", "b");   // "bbb"
replaceAll("hello hello", "l", "x"); // "hexxo hexxo"
```

### startsWith(str, prefix)
문자열이 특정 접두사로 시작하는지 확인합니다.
```fl
startsWith("hello", "hel");    // true
startsWith("hello", "llo");    // false
```

### endsWith(str, suffix)
문자열이 특정 접미사로 끝나는지 확인합니다.
```fl
endsWith("hello", "lo");       // true
endsWith("hello", "hel");      // false
```

### includes(str, search)
문자열에 특정 부분이 포함되어 있는지 확인합니다.
```fl
includes("hello", "ell");      // true
includes("hello", "xyz");      // false
```

### repeat(str, count)
문자열을 반복합니다.
```fl
repeat("ab", 3);               // "ababab"
repeat("x", 5);                // "xxxxx"
```

### pad(str, length, fill?)
문자열을 특정 길이로 패딩합니다.
```fl
pad("5", 3, "0");              // "005"
pad("hello", 8, "*");          // "hello***"
```

---

## 배열 함수

### len(arr)
배열의 길이를 반환합니다.
```fl
len([1, 2, 3]);            // 3
len([]);                   // 0
```

### push(arr, ...items)
끝에 요소를 추가하고 새 길이를 반환합니다.
```fl
let arr = [1, 2];
push(arr, 3, 4);           // 4
// arr = [1, 2, 3, 4]
```

### pop(arr)
끝에서 요소를 제거하고 반환합니다.
```fl
let arr = [1, 2, 3];
let last = pop(arr);       // 3
// arr = [1, 2]
```

### shift(arr)
앞에서 요소를 제거하고 반환합니다.
```fl
let arr = [1, 2, 3];
let first = shift(arr);    // 1
// arr = [2, 3]
```

### unshift(arr, ...items)
앞에 요소를 추가하고 새 길이를 반환합니다.
```fl
let arr = [2, 3];
unshift(arr, 1, 0);        // 4
// arr = [1, 0, 2, 3]
```

### slice(arr, start?, end?)
부분 배열을 추출합니다 (원본 미변경).
```fl
slice([1, 2, 3, 4, 5], 1, 4);  // [2, 3, 4]
slice([1, 2, 3], 1);           // [2, 3]
slice([1, 2, 3], -2);          // [2, 3]
```

### splice(arr, index, deleteCount?, ...items)
배열을 수정합니다 (원본 변경).
```fl
let arr = [1, 2, 3, 4, 5];
splice(arr, 2, 2, 99);    // [3, 4]
// arr = [1, 2, 99, 5]
```

### reverse(arr)
배열을 역순으로 정렬합니다 (원본 변경).
```fl
let arr = [1, 2, 3];
reverse(arr);              // [3, 2, 1]
// arr = [3, 2, 1]
```

### sort(arr, compareFn?)
배열을 정렬합니다 (원본 변경).
```fl
let arr = [3, 1, 2];
sort(arr);                 // [1, 2, 3]

// 커스텀 정렬
sort(arr, fn(a, b) { return b - a; });  // [3, 2, 1]
```

### indexOf(arr, item)
요소의 첫 번째 위치를 반환합니다 (-1 = 없음).
```fl
indexOf([1, 2, 3, 2], 2);  // 1
indexOf([1, 2, 3], 4);     // -1
```

### includes(arr, item)
배열에 요소가 포함되어 있는지 확인합니다.
```fl
includes([1, 2, 3], 2);    // true
includes([1, 2, 3], 4);    // false
```

### map(arr, fn)
각 요소에 함수를 적용한 새 배열을 반환합니다.
```fl
map([1, 2, 3], (x) => x * 2);  // [2, 4, 6]
map(["a", "b"], (x) => upper(x)); // ["A", "B"]
```

### filter(arr, fn)
조건을 만족하는 요소만 필터링합니다.
```fl
filter([1, 2, 3, 4], (x) => x % 2 == 0);  // [2, 4]
filter(["a", "", "b"], (x) => len(x) > 0); // ["a", "b"]
```

### reduce(arr, initial, fn)
배열을 축약합니다.
```fl
reduce([1, 2, 3, 4], 0, (acc, x) => acc + x);  // 10
reduce([1, 2, 3], 1, (acc, x) => acc * x);     // 6
```

### forEach(arr, fn)
각 요소에 함수를 실행합니다.
```fl
forEach([1, 2, 3], (x) => println(x));
forEach(["a", "b"], (x, i) => println(str(i) + ": " + x));
```

### find(arr, fn)
조건을 만족하는 첫 번째 요소를 반환합니다.
```fl
find([1, 2, 3, 4], (x) => x > 2);  // 3
find(["a", "bb", "ccc"], (x) => len(x) > 1); // "bb"
```

### some(arr, fn)
조건을 만족하는 요소가 있는지 확인합니다.
```fl
some([1, 2, 3], (x) => x > 2);     // true
some([1, 2, 3], (x) => x > 5);     // false
```

### every(arr, fn)
모든 요소가 조건을 만족하는지 확인합니다.
```fl
every([2, 4, 6], (x) => x % 2 == 0);  // true
every([1, 2, 3], (x) => x % 2 == 0);  // false
```

### concat(...arrays)
여러 배열을 합칩니다.
```fl
concat([1, 2], [3, 4], [5]);  // [1, 2, 3, 4, 5]
```

### unique(arr)
중복을 제거합니다.
```fl
unique([1, 2, 2, 3, 3, 3]);  // [1, 2, 3]
```

### flatten(arr, depth?)
중첩 배열을 평탄화합니다.
```fl
flatten([[1, 2], [3, [4, 5]]]);           // [1, 2, 3, [4, 5]]
flatten([[1, 2], [3, [4, 5]]], 2);        // [1, 2, 3, 4, 5]
```

---

## 객체 함수

### keys(obj)
객체의 모든 키를 배열로 반환합니다.
```fl
keys({ a: 1, b: 2, c: 3 });  // ["a", "b", "c"]
```

### values(obj)
객체의 모든 값을 배열로 반환합니다.
```fl
values({ a: 1, b: 2, c: 3 }); // [1, 2, 3]
```

### entries(obj)
객체의 [키, 값] 쌍 배열을 반환합니다.
```fl
entries({ a: 1, b: 2 }); // [["a", 1], ["b", 2]]
```

### has(obj, key)
객체에 특정 키가 있는지 확인합니다.
```fl
has({ a: 1, b: 2 }, "a");  // true
has({ a: 1, b: 2 }, "c");  // false
```

### get(obj, key, defaultValue?)
키의 값을 얻거나 기본값을 반환합니다.
```fl
get({ a: 1 }, "a");         // 1
get({ a: 1 }, "b");         // undefined
get({ a: 1 }, "b", 0);      // 0
```

### assign(...objects)
객체들을 병합합니다.
```fl
assign({ a: 1 }, { b: 2 }, { c: 3 }); // { a: 1, b: 2, c: 3 }
```

### freeze(obj)
객체를 수정 불가능하게 만듭니다.
```fl
let frozen = freeze({ x: 1 });
// frozen.x = 2;  // 에러!
```

---

## 수학 함수

### abs(n)
절댓값을 반환합니다.
```fl
abs(-5);                   // 5
abs(3.14);                 // 3.14
```

### round(n, digits?)
반올림합니다.
```fl
round(3.14159, 2);         // 3.14
round(3.5);                // 4
```

### floor(n)
버림합니다.
```fl
floor(3.7);                // 3
floor(-3.7);               // -4
```

### ceil(n)
올림합니다.
```fl
ceil(3.1);                 // 4
ceil(-3.1);                // -3
```

### sqrt(n)
제곱근을 반환합니다.
```fl
sqrt(16);                  // 4
sqrt(2);                   // 1.414...
```

### pow(base, exponent)
거듭제곱을 계산합니다.
```fl
pow(2, 3);                 // 8
pow(10, 2);                // 100
```

### min(...numbers)
최솟값을 반환합니다.
```fl
min(5, 2, 8, 1);           // 1
min(-5, -2);               // -5
```

### max(...numbers)
최댓값을 반환합니다.
```fl
max(5, 2, 8, 1);           // 8
max(-5, -2);               // -2
```

### random()
0 이상 1 미만의 난수를 반환합니다.
```fl
random();                  // 0.123...
random() * 100;            // 0-100 범위
```

---

## 타입 함수

### type(value)
값의 타입을 문자열로 반환합니다.
```fl
type(42);                  // "number"
type("hello");             // "string"
type(true);                // "boolean"
type([]);                  // "array"
type({});                  // "object"
type(null);                // "null"
type(undefined);           // "undefined"
```

### typeof(value)
`type()`과 동일합니다.
```fl
typeof(42);                // "number"
```

### isNumber(value)
숫자인지 확인합니다.
```fl
isNumber(42);              // true
isNumber("42");            // false
```

### isString(value)
문자열인지 확인합니다.
```fl
isString("hello");         // true
isString(42);              // false
```

### isBoolean(value)
불린인지 확인합니다.
```fl
isBoolean(true);           // true
isBoolean(1);              // false
```

### isArray(value)
배열인지 확인합니다.
```fl
isArray([1, 2]);           // true
isArray({});               // false
```

### isObject(value)
객체인지 확인합니다.
```fl
isObject({});              // true
isObject([]);              // false (배열은 제외)
```

### isNull(value)
null인지 확인합니다.
```fl
isNull(null);              // true
isNull(undefined);         // false
```

### isUndefined(value)
undefined인지 확인합니다.
```fl
isUndefined(undefined);    // true
isUndefined(null);         // false
```

---

## I/O 함수

### print(value, ...)
값을 줄바꿈 없이 출력합니다.
```fl
print("Hello");
print(" ");
print("World");
// 출력: "Hello World"
```

### println(value, ...)
값을 출력하고 줄바꿈합니다.
```fl
println("Hello");
println("World");
// 출력:
// Hello
// World
```

---

## 시간 함수

### now()
현재 시간을 밀리초 단위로 반환합니다.
```fl
let start = now();
// ... 작업 수행 ...
let elapsed = now() - start;
println("Elapsed: " + str(elapsed) + "ms");
```

### sleep(milliseconds)
지정된 밀리초만큼 대기합니다.
```fl
sleep(1000);  // 1초 대기
println("1초 후");
```

---

## 정규표현식

### test(pattern, string)
정규표현식이 문자열과 일치하는지 확인합니다.
```fl
test("^hello", "hello world");     // true
test("[0-9]+", "abc123def");       // true
test("@", "notanemail");           // false
```

### match(pattern, string)
일치하는 부분 문자열을 반환합니다.
```fl
match("[0-9]+", "abc123def");      // "123"
match("[a-z]+", "ABC");            // null
```

### matchAll(pattern, string)
일치하는 모든 부분 문자열을 배열로 반환합니다.
```fl
matchAll("[0-9]+", "a1b2c3");      // ["1", "2", "3"]
```

---

## 요약

**자주 사용되는 함수들**:
- 문자열: `len()`, `upper()`, `lower()`, `split()`, `join()`
- 배열: `push()`, `pop()`, `map()`, `filter()`, `reduce()`
- 객체: `keys()`, `values()`, `entries()`, `assign()`
- 수학: `abs()`, `round()`, `sqrt()`, `pow()`, `random()`
- 타입: `type()`, `isNumber()`, `isString()`, `isArray()`

더 자세한 정보: https://freelang.io/docs
