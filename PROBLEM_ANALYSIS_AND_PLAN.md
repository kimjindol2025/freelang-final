# FreeLang v2.4.0 문제 전수 조사 보고서

**조사일**: 2026-03-05
**상태**: ⚠️ **중대 문제 3가지 발견**
**결론**: v2.4.0은 "완성"이 아닌 "설계 단계" 상태

---

## 🔴 발견된 핵심 문제

### 문제 1: FreeLang 실행 자체 불가능 [CRITICAL]

#### 현황
```bash
$ node main.fl
SyntaxError: Invalid or unexpected token
```

**근본 원인**: 자체호스팅(Self-hosting) 부트스트래핑 미완성

- `.fl` 파일들은 **FreeLang 언어 텍스트**이지 JavaScript가 아님
- lexer.fl → parser.fl → interpreter_v2.fl을 **호출하려고 하지만 import/include 없음**
- 파일 간 연결이 텍스트로만 존재 (실제 실행 불가)
- `stdlib_io.fl`의 `print()`/`println()` 자체가 stub → 출력 불가
- package.json의 `"main": "main.fl"` → Node.js가 거부 (FreeLang 문법 파싱 불가)

#### 코드 증거

**main.fl**:
```freeLang
fn main(args: [string]): i32 {
  let source = if args.length > 0 { readFile(args[0]) } else { getStdin() }  # TODO: 파일에서 읽거나 REPL로 처리
  let env = createEnv()
  let config = parseArgs(args)

  let tokens = tokenize(source)     # ← lexer.fl 함수 호출, 하지만 import 없음!
  let ast = parse(tokens)           # ← parser.fl 함수 호출, 하지만 import 없음!
  let result = evalNode(ast, env)   # ← interpreter_v2.fl 함수 호출

  println!("Result: {}", result)    # ← stdlib_io.fl 함수, 이것도 stub
}

# TODO: 실제 stdin/stdout 구현 필요
```

**stdlib_io.fl**:
```freeLang
fn print(value: any): null {
  # TODO: 실제 출력 구현
  return null  # ← 아무것도 안 함!
}

fn println(value: any): null {
  # TODO: 실제 출력 구현
  return null  # ← 아무것도 안 함!
}
```

#### 해결 방안

**즉시 해결**: Node.js 브릿지 런타임 구축
```
index.js → src/runtime.js (JS 구현)
```

1. `index.js` 생성 (50줄)
   - package.json의 main 필드가 가리킬 파일
   - FreeLang 내장 함수를 JS로 제공

2. `src/runtime.js` 생성 (300줄)
   - print, println, read_file, write_file, fetch 등
   - 모두 Node.js API 래핑

3. package.json 수정 (1줄)
   - `"main": "main.fl"` → `"main": "index.js"`

---

### 문제 2: KPM 통합 완전 실패 [HIGH]

#### 현황
```bash
$ kpm publish .
Error: connect ECONNREFUSED 127.0.0.1:4000
```

**근본 원인**: api.js가 localhost:4000 하드코딩, api-config.js는 사문화

#### 기술적 증거

**kpm/lib/api.js:29** (하드코딩):
```js
params.url = `http://localhost:4000/api${params.url}`;
```

**kpm/lib/api-config.js** (무시됨):
```js
module.exports = {
  baseUrl: 'http://123.212.111.26:4000/api',
  // ... 설정들
};
```

**실제 동작**:
- api.js는 api-config.js를 import하지 않음
- localhost:4000으로만 요청 (253 서버 접근 불가)
- 인증 토큰은 읽지만 주소가 로컬이므로 소용없음

#### KPM의 실체

설치된 kpm은 **Kibana Plugin Manager** (v1.0.0-alpha2, 2016년)
- FreeLang 전용이 아님
- Elasticsearch의 플러그인을 배포하기 위한 도구
- package.json의 name/version 필드만 인식 (다른 필드 무시)
- 자동 로컬호스트 연결 → 원격 레지스트리 미지원

#### KPM Phase 2 현황

```
in_progress (2026-03-05 기준)
├─ Step 1 (GOGS 스캔): ready
├─ Step 2 (자동 통합): pending  ← 대기 중
└─ Step 3 (Registry 업데이트): pending  ← 대기 중

이유: 253 서버 포트 4000이 응답 없음 (Step 2/3 시작 안 됨)
```

#### 해결 방안

**방법 A** (권장): kpm/lib/api.js 3줄 수정
```js
// 수정 전
params.url = `http://localhost:4000/api${params.url}`;

// 수정 후
const config = require('./api-config');
params.url = `${config.baseUrl}${params.url}`;
```

**방법 B**: 253 서버 포트 4000 직접 기동
```bash
ssh -p 22253 kimjin@123.212.111.26 'bash ~/kpm-all-data/kpm-integration-phase2.sh'
```

---

### 문제 3: stdlib 함수 다수가 stub [MEDIUM]

#### 현황

**stdlib_io.fl** (전체 사문화):
```freeLang
fn readFile(path: string): string { return "" }            # stub
fn writeFile(path: string, content: string): bool { return true }  # stub
fn print(value: any): null { # TODO: 실제 출력 구현
fn println(value: any): null { # TODO: 실제 출력 구현
```

**stdlib_string.fl** (부분 stub):
```freeLang
fn upper(s: string): string { return "" }   # stub - 빈 문자열 반환
fn lower(s: string): string { return "" }   # stub
fn split(s: string, sep: string): [string] { ... }  # 구현되어 있음
```

**stdlib_math.fl** (부분 stub):
```freeLang
fn sin(x: f64): f64 { return 0.0 }    # stub
fn cos(x: f64): f64 { return 0.0 }    # stub
fn tan(x: f64): f64 { return 0.0 }    # stub
fn floor(x: f64): f64 { ... }         # 구현됨
```

**stdlib_advanced.fl** (부분 stub):
```freeLang
fn unique(arr: [any]): [any] { return [] }              # stub
fn flatten(arr: [[any]]): [any] { return [] }          # stub
fn union(arr1: [any], arr2: [any]): [any] { return [] }  # stub
fn groupBy(arr, keyFn): map { ... }                    # 구현됨
```

---

## 📊 종합 분석

### 완성도 현황

```
언어 기능 텍스트:     ██████████ 100% (파일 존재)
문법 구현:            ████████░░ 80% (for-in, return 등)
실행 가능성:          ░░░░░░░░░░ 0% ← 핵심 문제
stdlib 함수:          ███████░░░ 70% (많은 stub)
I/O 시스템:           ░░░░░░░░░░ 0% (전무)
네트워킹:             ░░░░░░░░░░ 0% (전무)
KPM 통합:             ░░░░░░░░░░ 0% (실패)
─────────────────────────────────
실제 프로덕션 준비도: ░░░░░░░░░░ 0%
```

### 문제의 근본 원인

1. **아키텍처 미완성**
   - FreeLang 언어 설계는 완성
   - 하지만 이를 실행할 호스트 런타임이 없음
   - 부트스트래핑 미완성 (닭이 먼저냐 달걀이 먼저냐)

2. **패키지 관리 혼란**
   - FreeLang용 KPM이 아닌 Kibana용 KPM 설치됨
   - npm link는 로컬 개발용일 뿐 프로덕션 배포 불가
   - package.json의 main 필드가 .fl 파일을 가리킴 (Node.js 실행 불가)

3. **표준 라이브러리 불완성**
   - 문법은 있지만 구현은 stub
   - print() 자체가 작동 안 함
   - I/O 함수 모두 미구현

---

## 🎯 해결 3단계 플랜

### Step 1: JS 브릿지 런타임 (즉시, ~2시간)

**생성 파일**:
```
freelang-final/
├── index.js (50줄) ← package.json main이 가리킬 파일
└── src/
    └── runtime.js (300줄) ← 내장 함수 10개 JS 구현
```

**수정 파일**:
- package.json: `"main": "index.js"` 변경

**결과**: `require('freelang')`이 실제로 동작

---

### Step 2: KPM 수정 (선택적, ~30분)

**옵션 A**: api.js:29 수정 (권장)
```js
const config = require('./api-config');
params.url = `${config.baseUrl}${params.url}`;
```

**옵션 B**: 253 서버 KPM 서버 기동

---

### Step 3: stub 함수 구현 (지속적, ~1주일)

우선순위:
1. print/println (I/O 기본)
2. read_file/write_file (파일 I/O)
3. upper/lower (string)
4. sin/cos/tan (math)

---

## 📋 액션 아이템

### 즉시 (오늘):
- [ ] index.js 생성 (50줄)
- [ ] src/runtime.js 생성 (300줄)
- [ ] package.json 수정 (1줄)
- [ ] GOGS 커밋

### 이번주:
- [ ] kpm api.js 수정 (3줄)
- [ ] print/println 실제 구현 (stdlib_io.fl)
- [ ] read_file/write_file 실제 구현

### 다음주:
- [ ] HTTP 클라이언트 (fetch)
- [ ] JSON 처리 (json_parse/stringify)
- [ ] 환경변수 (get_env)

---

## 결론

**현재 상태**: "완성"이 아닌 "언어 설계 완료, 런타임 미구현"

**프로덕션 준비도**: 🔴 **0%** (실행 불가능)

**교육 가치**: 🟢 **85%** (완전한 언어 설계 예시)

**다음 단계**: JS 브릿지 런타임 구축으로 **즉시 실행 가능**하게 변환

---

**저장 날짜**: 2026-03-05
**저장소**: https://gogs.dclub.kr/kim/freelang-final.git
