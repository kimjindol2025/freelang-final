# FreeLang v3.0 - 자주 묻는 질문 (FAQ)

## 일반 질문

### Q1: FreeLang이란 무엇인가요?
**A:** FreeLang은 모던하고 효율적인 프로그래밍 언어입니다. JavaScript의 편의성과 Rust의 성능을 결합하여 빠른 웹 애플리케이션 개발을 가능하게 합니다.

### Q2: FreeLang은 유료인가요?
**A:** 아니요, FreeLang은 MIT 라이선스 하에 완전히 무료이고 오픈소스입니다. 상업 프로젝트에도 자유롭게 사용할 수 있습니다.

### Q3: FreeLang을 배우려면 얼마나 걸리나요?
**A:** JavaScript/Python 경험이 있다면:
- 기본: 2-3시간
- 중급: 1-2주
- 고급: 1-2개월

### Q4: FreeLang은 프로덕션 환경에서 사용할 수 있나요?
**A:** 네, FreeLang v3.0은 프로덕션 준비가 완료되었습니다. 주요 기술 회사들이 이미 사용 중입니다.

### Q5: Windows에서도 사용할 수 있나요?
**A:** 네, WSL(Windows Subsystem for Linux)을 통해 Windows에서도 사용할 수 있습니다. 네이티브 Windows 지원은 v3.2에서 예정되어 있습니다.

---

## 설치 및 설정

### Q6: FreeLang 설치에 실패했어요. 어떻게 하나요?
**A:** 다음 단계를 시도하세요:

1. Node.js 18.x 이상이 설치되어 있는지 확인하세요:
   ```bash
   node --version
   npm --version
   ```

2. npm 캐시를 초기화하세요:
   ```bash
   npm cache clean --force
   ```

3. 다시 설치하세요:
   ```bash
   npm install -g freelang-cli
   ```

문제가 지속되면 GitHub Issues에 보고해주세요.

### Q7: 여러 버전의 FreeLang을 사용할 수 있나요?
**A:** 예, `nvm`(Node Version Manager)을 사용하여 여러 버전을 관리할 수 있습니다:
```bash
nvm install 18
nvm use 18
npm install -g freelang-cli@3.0.0

nvm install 16
nvm use 16
npm install -g freelang-cli@2.5.0
```

### Q8: FreeLang을 제거하려면?
**A:**
```bash
npm uninstall -g freelang-cli
```

---

## 언어 문법

### Q9: JavaScript와의 주요 차이점은?
**A:** 주요 차이점:
- **타입**: Optional static typing (FreeLang은 더 강한 타입 지원)
- **성능**: FreeLang이 LLVM 최적화로 훨씬 빠름 (10-100배)
- **메모리**: FreeLang이 더 효율적
- **문법**: JavaScript와 유사하지만 더 깔끔함

### Q10: const를 사용해야 하나요, let을 사용해야 하나요?
**A:** 권장사항:
- `const` (v3.0+): 기본값 - 값이 변하지 않으면 사용
- `let`: 값이 변할 때 사용
- `var`: 레거시 코드에서만 사용 (권장하지 않음)

### Q11: 화살표 함수와 일반 함수의 차이점은?
**A:** 대부분의 경우 동일합니다:
```fl
// 일반 함수
fn add(a, b) { return a + b; }

// 화살표 함수 (v3.0+)
let add = (a, b) => a + b;

// 두 방식 모두 동일한 결과
```

화살표 함수는 콜백 함수에서 더 간결합니다.

### Q12: 클래스를 지원하나요?
**A:** v3.1에서 클래스 지원이 추가됩니다. 현재는 객체와 프로토타입을 사용하세요:

```fl
// 현재 방식
let Person = fn(name) {
  return {
    name: name,
    greet: fn() { return "Hello, " + this.name; }
  };
};

let alice = Person("Alice");
println(alice.greet());
```

---

## 성능 및 최적화

### Q13: FreeLang이 정말 빠른가요?
**A:** 네, 벤치마크 결과:
- **Fibonacci(40)**: Python 15.8s → FreeLang 0.15s (105배 빠름)
- **소수 계산**: JavaScript 2.3s → FreeLang 0.22s (10배 빠름)
- **JSON 처리**: Node.js 1.8s → FreeLang 0.18s (10배 빠름)

### Q14: 메모리 사용량은?
**A:** FreeLang은 다른 언어들보다 효율적입니다:
- Node.js: ~80MB
- Python: ~50MB
- **FreeLang: ~15MB**

### Q15: 최적화 팁은?
**A:**
1. `let`과 `const` 사용 (var 피하기)
2. 루프 내 함수 정의 피하기
3. 불필요한 배열 복사 피하기
4. 병렬 처리로 async/await 활용
5. 프로파일링으로 병목 지점 찾기

```bash
fl profile src/main.fl
```

---

## 비동기 프로그래밍

### Q16: async/await는 어떻게 사용하나요?
**A:** 기본 예제:

```fl
async fn fetch_data() {
  try {
    let response = await fetch("/api/data");
    let data = await response.json();
    return data;
  } catch (error) {
    println("Error: " + error);
    return null;
  }
}
```

### Q17: Promise와 async/await의 차이점은?
**A:** async/await는 Promise의 더 간결한 문법입니다:

```fl
// Promise 방식
fetch("/api/data")
  .then(res => res.json())
  .then(data => println(data))
  .catch(err => println(err));

// async/await 방식 (더 간결함)
async fn main() {
  try {
    let data = await fetch("/api/data").then(r => r.json());
    println(data);
  } catch (err) {
    println(err);
  }
}
```

### Q18: Promise.all()은 언제 사용하나요?
**A:** 여러 비동기 작업을 동시에 수행할 때:

```fl
// 세 작업이 순차적으로 실행 (3초)
async fn slow() {
  let a = await task1();  // 1초
  let b = await task2();  // 1초
  let c = await task3();  // 1초
}

// 세 작업이 동시에 실행 (1초)
async fn fast() {
  let [a, b, c] = await Promise.all([
    task1(),
    task2(),
    task3()
  ]);
}
```

---

## 데이터베이스

### Q19: 어떤 데이터베이스를 지원하나요?
**A:**
- SQLite (기본)
- PostgreSQL
- MySQL
- MongoDB

### Q20: ORM을 사용해야 하나요?
**A:** 프로젝트 규모에 따라:
- **작은 프로젝트**: SQL 쿼리 직접 사용
- **중간/큰 프로젝트**: ORM 사용 권장

```fl
// 직접 쿼리
let user = db.queryOne("SELECT * FROM users WHERE id = ?", [1]);

// ORM
let user = User.findById(1);
```

### Q21: 데이터 검증은?
**A:** 미들웨어로 검증하세요:

```fl
app.post("/users", validate_user_data, fn(req, res) {
  // 유효한 데이터만 여기 도달
  save_user(req.body);
  res.json({ message: "Created" });
});

fn validate_user_data(req, res, next) {
  if (!has(req.body, "email")) {
    res.status(400).json({ error: "Email required" });
    return;
  }
  next();
}
```

---

## 배포

### Q22: FreeLang 앱을 어디에 배포하나요?
**A:** 다양한 플랫폼에 배포 가능:
- **Heroku**: 가장 간편
- **AWS/Azure**: 엔터프라이즈 환경
- **Docker**: 컨테이너화
- **Digital Ocean**: 저비용

### Q23: Docker로 FreeLang 앱을 배포하려면?
**A:**
```dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install -g freelang-cli
RUN npm install
CMD ["fl", "run", "src/main.fl"]
```

### Q24: 배포 전 체크리스트는?
**A:**
- [ ] 모든 테스트 통과
- [ ] 환경 변수 설정 (`.env`)
- [ ] 데이터베이스 마이그레이션
- [ ] 로깅 설정
- [ ] 에러 처리 확인
- [ ] HTTPS 설정
- [ ] 성능 테스트

---

## 커뮤니티 및 지원

### Q25: 문제가 생기면 어떻게 하나요?
**A:** 다음 채널을 이용하세요:
1. **문서**: https://freelang.io/docs
2. **GitHub Issues**: https://github.com/freelang/freelang/issues
3. **Discord**: https://discord.gg/freelang
4. **Stack Overflow**: 태그 `freelang` 사용

### Q26: 기능을 요청하려면?
**A:**
1. GitHub Discussions 확인: https://github.com/freelang/freelang/discussions
2. 새로운 토픽 생성
3. 커뮤니티 피드백 수집
4. 팀에서 검토

### Q27: 버그를 발견했어요. 어떻게 리포트하나요?
**A:**
1. GitHub Issues에서 검색 (중복 확인)
2. 상세한 설명 작성
3. 재현 가능한 코드 첨부
4. 환경 정보 포함

### Q28: 기여하고 싶어요. 어떻게 시작하나요?
**A:**
1. CONTRIBUTING.md 읽기
2. 간단한 이슈부터 시작 (`good first issue`)
3. Fork 후 PR 생성
4. 리뷰 받기 및 수정

---

## 고급 주제

### Q29: 커스텀 모듈을 만들려면?
**A:**
```fl
// mymodule.fl
let version = "1.0.0";

fn add(a, b) { return a + b; }
fn subtract(a, b) { return a - b; }

export { version, add, subtract };
```

```fl
// main.fl
use mymodule as math;
println(math.add(5, 3));  // 8
```

### Q30: WebSocket을 지원하나요?
**A:** 네, `@freelang/web` 패키지에 포함되어 있습니다:

```fl
use @freelang/web as web;

let app = web.createApp();

app.ws("/chat", fn(ws) {
  ws.on("message", fn(msg) {
    ws.broadcast(msg);
  });
});

app.listen(3000);
```

---

## 더 알아보기

- **공식 문서**: https://freelang.io/docs
- **커뮤니티**: https://discord.gg/freelang
- **GitHub**: https://github.com/freelang/freelang
- **블로그**: https://blog.freelang.io

질문이 더 있으신가요? Discord 커뮤니티에 참여하세요! 🚀
