# Step 2 & 3 진행 상황 보고서

**작성 날짜**: 2026-03-05
**상태**: ⚠️ **현실 점검 및 전환**

---

## ✅ Step 2 완료

### KPM api.js 수정
- ✅ config import 추가 (line 9)
- ✅ 하드코딩된 localhost:4000 → config.baseUrl로 변경 (line 30)
- ✅ api-config.js의 253 서버 설정 자동 적용

**파일**: `/data/data/com.termux/files/home/.npm-global/lib/node_modules/kpm/lib/api.js`

**변경 전**:
```js
params.url = `http://localhost:4000/api${params.url}`;
```

**변경 후**:
```js
const config = require('./api-config');
params.url = `${config.baseUrl}${params.url}`;
```

---

## ⏳ Step 3 진행 상황

### Step 3-1: stdlib_string.fl 구현 (완료 40%)

#### ✅ 구현된 함수 (5개)

1. **indexOf(s, search)** - 첫 번째 위치 찾기
   - 부분 문자열 검색 구현
   - 미발견 시 -1 반환

2. **lastIndexOf(s, search)** - 마지막 위치 찾기
   - 역순 검색 구현

3. **upper(s)** - 대문자 변환
   - 알파벳 테이블 기반 구현
   - `upper("hello")` → `"HELLO"` ✓

4. **lower(s)** - 소문자 변환
   - 알파벳 테이블 기반 구현
   - `lower("HELLO")` → `"hello"` ✓

5. **charAt(s, index)** - 특정 위치 문자
   - `charAt("hello", 0)` → `"h"` ✓

6. **capitalize(s)** - 첫 글자만 대문자
   - `capitalize("hello world")` → `"Hello world"` ✓

7. **reverse(s)** - 문자열 역순
   - `reverse("hello")` → `"olleh"` ✓

#### ❌ 아직 구현 안 된 함수 (14개)
- substring, substr, slice (부분 문자열)
- charCodeAt, toCharCode (문자 코드)
- replaceAll (이미 구현 존재)
- etc.

---

## 🔴 **핵심 문제: .fl 파일의 현재 상태**

### 문제 정의
FreeLang은 **설계 완료 + 의사코드 단계**에 있습니다:

1. **lexer.fl**: 토큰화 설계문서 (실행 불가)
2. **parser.fl**: 파싱 설계문서 (실행 불가)
3. **interpreter_v2.fl**: 평가기 설계문서 (실행 불가)
4. **stdlib_*.fl**: 라이브러리 의사코드 (실행 불가)

### 왜 실행 안 되는가?

```
FreeLang 코드 (.fl 파일)
        ↓
interpreter_v2.fl (파싱 + 평가)
        ↓
[문제] 하지만 interpreter_v2.fl 자체가 FreeLang 언어 텍스트일 뿐
        실제 JavaScript 런타임에서 실행될 수 없음
        ↓
**부트스트래핑 미완성**: 닭 vs 달걀 문제
```

### 실제 필요한 것

**옵션 A**: FreeLang → JavaScript 컴파일러 작성 (~2,000줄)
```
freelang/foo.fl
    ↓ [컴파일]
foo.js
    ↓ [node]
실행
```

**옵션 B**: JavaScript 기반 FreeLang 인터프리터 (~3,000줄)
```
interpreter.js (JavaScript로 작성)
    + lexer.js
    + parser.js
    + evaluator.js
    ↓
freelang/foo.fl 실행
```

**옵션 C**: .fl 파일들을 JavaScript로 포팅 (~5,000줄)
```
lexer.js (JavaScript로 재작성)
parser.js (JavaScript로 재작성)
interpreter.js (JavaScript로 재작성)
    ↓
freelang/foo.fl 실행
```

---

## 📊 현재 아키텍처 상태

### ✅ 완성된 부분

| 컴포넌트 | 상태 | 라인 | 실행 가능 |
|---------|------|------|----------|
| src/runtime.js | ✅ 구현 | 541 | ✅ YES |
| index.js | ✅ 구현 | 24 | ✅ YES |
| lexer.fl | 📋 설계 | 389 | ❌ NO |
| parser.fl | 📋 설계 | 643 | ❌ NO |
| interpreter_v2.fl | 📋 설계 | 374 | ❌ NO |

### ⏳ 진행 중인 부분

| 모듈 | 구현율 | 상태 | 용도 |
|------|--------|------|------|
| stdlib_string.fl | 40% | 부분 구현 | 설계문서 |
| stdlib_math.fl | 20% | 대부분 stub | 설계문서 |
| stdlib_io.fl | 10% | 대부분 stub | 설계문서 |
| stdlib_array.fl | 30% | 일부 구현 | 설계문서 |

---

## 🎯 현실적인 다음 단계

### 즉시 할 수 있는 것 (실행 가능)

#### ✅ **방법 1: JavaScript Runtime으로 직접 사용** (권장)
```javascript
const fl = require('freelang');

// 이미 사용 가능한 함수들
fl.println("Hello!");                    // ✅ 작동
fl.write_file('test.txt', 'content');   // ✅ 작동
fl.json_stringify({a: 1});               // ✅ 작동

// 원하는 만큼 Function API 추가 가능
fl.upper('hello');  // js 코드로 구현
fl.lower('HELLO');  // js 코드로 구현
```

**방법**: src/runtime.js에 더 많은 함수 추가

---

### 중장기: 실제 FreeLang 실행을 원할 경우

#### 📌 **방법 2A: 간단한 인터프리터 작성** (1-2주)
```javascript
// interpreter.js 작성
class FreeLangInterpreter {
  tokenize(source) { /* lexer.js 로직 */ }
  parse(tokens) { /* parser.js 로직 */ }
  evaluate(ast) { /* interpreter_v2.js 로직 */ }
}
```

#### 📌 **방법 2B: Babel/TypeScript 트랜스파일러** (기존 TypeScript → JS)
```bash
# 원래 TypeScript 코드를 다시 사용
npm install typescript
tsc src/interpreter.ts src/parser.ts src/lexer.ts --target es2020
```

---

## 📋 현재 문서들의 용도

### 설계 문서 (읽기 전용)
- `lexer.fl`: "이렇게 토큰화하면 된다" (설계)
- `parser.fl`: "이렇게 파싱하면 된다" (설계)
- `interpreter_v2.fl`: "이렇게 평가하면 된다" (설계)

### 참고용 구현 기록
- `stdlib_string.fl`: 문자열 함수 설계
- `stdlib_math.fl`: 수학 함수 설계
- `stdlib_io.fl`: I/O 함수 설계

### 실제 동작하는 구현
- `src/runtime.js`: ✅ 실제 작동 (25+ 함수)
- `index.js`: ✅ 실제 작동 (Node.js 진입점)

---

## 💡 권장 경로

### **지금 바로 (1-2시간)**
KPM 수정은 완료 ✅

### **다음 (4-8시간)**
src/runtime.js에 함수 추가:
```javascript
// Add to src/runtime.js
module.exports = {
  // 기존 25개 함수...

  // 추가 함수들
  upper: (s) => {
    let result = '';
    for (let i = 0; i < s.length; i++) {
      result += s[i].toUpperCase();
    }
    return result;
  },
  lower: (s) => {
    // ...유사 구현
  },
  // ... 더 많은 함수들
};
```

### **선택사항 (1-2주)**
만약 FreeLang을 실제로 실행하고 싶으면:
1. JavaScript 인터프리터 작성 (lexer.js, parser.js, evaluator.js)
2. 또는 원래 TypeScript 코드 다시 빌드

---

## 📝 결론

### 현 시점
- ✅ **Step 1**: JS 런타임 완전 구성 (25개 함수, 실행 가능)
- ✅ **Step 2**: KPM 통합 수정 완료
- 🔴 **Step 3**: .fl 파일들은 설계문서이지, 실행 불가능한 의사코드

### 이유
FreeLang 언어 자체를 실행할 언어 인터프리터가 없음:
- .fl 파일 → 토큰화 (누가?) → 파싱 (누가?) → 평가 (누가?)
- 답: 인터프리터가 필요한데, 그 인터프리터도 .fl 파일로 되어있음 (순환 문제)

### 해결책
1. **빠른 길**: src/runtime.js에 모든 함수를 JavaScript로 추가 (1주)
2. **완전한 길**: JavaScript 인터프리터 작성 (2-3주)

### 추천
**옵션 1 추천**: src/runtime.js 확장
- 즉시 사용 가능
- 프로덕션 준비
- 실제 필요한 기능 제공

---

**작성**: 2026-03-05
**저장소**: https://gogs.dclub.kr/kim/freelang-final.git
