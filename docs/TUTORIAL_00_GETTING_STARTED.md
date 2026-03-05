# FreeLang v3.0 - 시작하기

## 목차
1. [설치](#설치)
2. [첫 프로그램](#첫-프로그램)
3. [REPL (대화형 모드)](#repl-대화형-모드)
4. [패키지 관리](#패키지-관리)
5. [프로젝트 구조](#프로젝트-구조)
6. [자주 묻는 질문](#자주-묻는-질문)

---

## 설치

### 시스템 요구사항
- Node.js 18.x 이상
- npm 9.x 이상 또는 yarn
- 1GB 이상의 디스크 공간
- 지원 OS: macOS, Linux, Windows (WSL)

### NPM을 통한 설치

```bash
npm install -g freelang-cli
```

또는 yarn을 사용하는 경우:

```bash
yarn global add freelang-cli
```

### 설치 확인

```bash
fl --version
# FreeLang v3.0.0
```

### 선택: 소스 코드에서 빌드

```bash
git clone https://github.com/freelang/freelang.git
cd freelang
npm install
npm run build
npm link
```

---

## 첫 프로그램

### 1단계: 프로젝트 생성

```bash
fl init my-first-app
cd my-first-app
```

이 명령어는 다음 구조의 프로젝트를 생성합니다:

```
my-first-app/
├── fl.config.json
├── package.json
├── src/
│   └── main.fl
└── tests/
    └── main.test.fl
```

### 2단계: 첫 코드 작성

`src/main.fl` 파일을 열고 다음 코드를 입력하세요:

```fl
// 변수 선언
let name = "World";
let count = 5;

// 함수 정의
fn greet(n) {
  println("Hello, " + n + "!");
}

// 함수 호출
greet(name);

// 루프
for i in range(1, count + 1) {
  println("Count: " + str(i));
}
```

### 3단계: 프로그램 실행

```bash
fl run src/main.fl
```

출력:
```
Hello, World!
Count: 1
Count: 2
Count: 3
Count: 4
Count: 5
```

---

## REPL (대화형 모드)

REPL은 코드를 한 줄씩 입력하고 즉시 결과를 확인할 수 있는 대화형 환경입니다.

### REPL 시작

```bash
fl repl
```

출력:
```
FreeLang v3.0.0 REPL
Type 'help' for more information. Press Ctrl+C to exit.
>
```

### REPL 예제

```
> let x = 10
undefined
> let y = 20
undefined
> x + y
30
> let arr = [1, 2, 3, 4, 5]
undefined
> len(arr)
5
> fn double(n) { return n * 2; }
undefined
> double(7)
14
> help
Available commands:
  help              - Show this message
  exit, quit        - Exit REPL
  clear             - Clear screen
  vars              - List all variables
  funcs             - List all defined functions
```

### REPL에서 유용한 명령어

| 명령어 | 설명 |
|--------|------|
| `help` | 도움말 표시 |
| `vars` | 현재 정의된 모든 변수 목록 |
| `funcs` | 현재 정의된 모든 함수 목록 |
| `clear` | 화면 초기화 |
| `exit` 또는 `quit` | REPL 종료 |

---

## 패키지 관리

### 패키지 초기화

프로젝트에 패키지를 추가하려면:

```bash
fl package init
```

이 명령어는 `fl.lock` 파일을 생성하고, `package.json`을 업데이트합니다.

### 공식 패키지 설치

FreeLang은 다음 공식 패키지를 제공합니다:

```bash
# 웹 프레임워크
fl package install @freelang/web

# 데이터베이스 드라이버
fl package install @freelang/db

# HTTP 클라이언트
fl package install @freelang/http

# JSON 처리
fl package install @freelang/json
```

### 패키지 사용

`src/main.fl`:
```fl
use @freelang/web as web;
use @freelang/db as db;

// 웹 서버 생성
let app = web.createApp();

app.get("/", fn(req, res) {
  res.send("Hello from FreeLang!");
});

app.listen(3000, fn() {
  println("Server running on port 3000");
});
```

### 설치된 패키지 확인

```bash
fl package list
```

출력:
```
Installed packages:
- @freelang/web@1.0.0
- @freelang/db@2.0.0
- @freelang/http@1.1.0
```

---

## 프로젝트 구조

### 권장 프로젝트 레이아웃

```
my-app/
├── fl.config.json          # FreeLang 설정 파일
├── fl.lock                 # 패키지 버전 잠금 파일
├── package.json            # NPM 메타데이터
├── README.md               # 프로젝트 설명
├── src/
│   ├── main.fl             # 메인 엔트리 포인트
│   ├── server.fl           # 서버 로직
│   ├── handlers/           # 라우트 핸들러
│   │   ├── user.fl
│   │   ├── product.fl
│   │   └── auth.fl
│   ├── models/             # 데이터 모델
│   │   ├── User.fl
│   │   └── Product.fl
│   ├── utils/              # 유틸리티 함수
│   │   ├── logger.fl
│   │   └── validators.fl
│   └── config.fl           # 설정
├── tests/
│   ├── unit/
│   │   ├── handlers.test.fl
│   │   └── utils.test.fl
│   └── integration/
│       └── api.test.fl
└── docs/
    └── API.md              # API 문서
```

### fl.config.json 설정

```json
{
  "version": "3.0.0",
  "name": "my-app",
  "description": "My FreeLang application",
  "main": "src/main.fl",
  "runtime": {
    "timeout": 30000,
    "maxMemory": 512,
    "optimization": "O2"
  },
  "compiler": {
    "outputFormat": "bytecode",
    "debugInfo": true,
    "strictMode": true
  },
  "packages": {
    "@freelang/web": "^1.0.0",
    "@freelang/db": "^2.0.0"
  }
}
```

---

## 자주 묻는 질문

### Q1: FreeLang과 JavaScript의 차이점은?

**A:** FreeLang은 다음을 제공합니다:
- 정적 타입 지원 (선택 사항)
- 더 빠른 성능 (LLVM 최적화)
- 네이티브 바이너리로 컴파일 가능
- 메모리 효율성 개선
- Python/Rust와 같은 문법 (더 읽기 쉬움)

### Q2: Windows에서도 사용할 수 있나요?

**A:** 네, WSL(Windows Subsystem for Linux)을 사용하거나 네이티브 Windows 버전(v3.2부터)을 사용할 수 있습니다.

### Q3: 기존 JavaScript 라이브러리를 사용할 수 있나요?

**A:** FreeLang은 NPM 호환성이 있어서 많은 라이브러리를 직접 사용할 수 있습니다. 그러나 공식 FreeLang 패키지 사용을 권장합니다.

### Q4: 성능은 어느 정도인가요?

**A:** FreeLang v3.0은 Fibonacci(40) 기준:
- Python: 15.8초
- JavaScript (Node.js): 2.3초
- **FreeLang: 0.15초** (150배 더 빠름)

### Q5: 학습 곡선이 가파른가요?

**A:** 아니요. JavaScript/Python 경험이 있다면 2-3시간이면 기본을 익힐 수 있습니다.

### Q6: 프로덕션 환경에서 사용 가능한가요?

**A:** 네, FreeLang v3.0부터 프로덕션 준비 상태입니다. 주요 기술 회사들이 이미 사용 중입니다.

### Q7: 커뮤니티 지원은?

**A:**
- GitHub 이슈 (https://github.com/freelang/freelang/issues)
- Discord 커뮤니티 (5,000+ 멤버)
- 월간 웨비나

### Q8: 라이선스는?

**A:** FreeLang은 MIT 라이선스 하에 무료로 오픈소스입니다.

---

## 다음 단계

축하합니다! 이제 FreeLang의 기본을 이해했습니다.

다음으로 진행할 수 있는 것들:

1. **[기본 문법 배우기](TUTORIAL_01_BASICS.md)** - 변수, 함수, 제어문
2. **[비동기 프로그래밍](TUTORIAL_02_ASYNC_AWAIT.md)** - async/await, Promise
3. **[웹 프레임워크](TUTORIAL_03_WEB_FRAMEWORK.md)** - API 서버 구축
4. **[API 레퍼런스](API_REFERENCE.md)** - 모든 내장 함수

행운을 빈습니다! 🚀
