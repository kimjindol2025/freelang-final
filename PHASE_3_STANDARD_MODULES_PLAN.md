# FreeLang Phase 3: 표준 모듈 시스템 계획

**작성 날짜**: 2026-03-05
**상태**: 📋 **계획 단계**
**예상 기간**: 12주 (3개월)
**목표**: +200개 함수, 7개 표준 모듈

---

## 🎯 전략

```
Phase 1 (완료)        Phase 2 (진행중)      Phase 3 (계획)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
195개 함수  ✅     인터프리터       표준 모듈
(내장)              (Week 3-8)      (Week 9-20)

                                    ├─ fs (파일시스템)
                                    ├─ os (운영체제)
                                    ├─ path (경로)
                                    ├─ crypto (암호화)
                                    ├─ http (웹)
                                    ├─ date (시간)
                                    └─ encoding (인코딩)

                                    결과: 395개 함수
```

---

## 📦 표준 모듈 설계

### **Module 1: fs (파일시스템)** 📁
**위치**: `freelang/fs`
**함수 수**: 25개
**기간**: 2주

#### 파일 읽기 (5개)
```javascript
fs.readFileSync(path, encoding)           // 동기 읽기
fs.readFile(path, encoding)               // 비동기 읽기
fs.readFileAsBuffer(path)                 // 바이너리
fs.readFileAsJson(path)                   // JSON 파싱
fs.readFileAsLines(path)                  // 라인 배열
```

#### 파일 쓰기 (5개)
```javascript
fs.writeFileSync(path, content, encoding) // 동기 쓰기
fs.writeFile(path, content, encoding)     // 비동기 쓰기
fs.appendFileSync(path, content)          // 동기 추가
fs.appendFile(path, content)              // 비동기 추가
fs.writeFileAsJson(path, obj, pretty)     // JSON 쓰기
```

#### 파일 조작 (8개)
```javascript
fs.copyFileSync(src, dest)                // 동기 복사
fs.copyFile(src, dest)                    // 비동기 복사
fs.renameSync(oldPath, newPath)           // 동기 이름변경
fs.rename(oldPath, newPath)               // 비동기 이름변경
fs.deleteFileSync(path)                   // 동기 삭제
fs.deleteFile(path)                       // 비동기 삭제
fs.truncateSync(path, len)                // 파일 자르기
fs.truncate(path, len)                    // 비동기 자르기
```

#### 파일 정보 (7개)
```javascript
fs.existsSync(path)                       // 존재 확인
fs.exists(path)                           // 비동기 확인
fs.isFileSync(path)                       // 파일 여부
fs.isFile(path)                           // 비동기 확인
fs.isDirectorySync(path)                  // 디렉토리 여부
fs.isDirectory(path)                      // 비동기 확인
fs.getStatSync(path)                      // 상세 정보
```

**테스트**: 25개 (예상 2시간)

---

### **Module 2: os (운영체제)** 🖥️
**위치**: `freelang/os`
**함수 수**: 20개
**기간**: 1.5주

#### 시스템 정보 (10개)
```javascript
os.platform()                             // OS 종류 (linux, win32, darwin)
os.arch()                                 // CPU 아키텍처 (x64, arm64)
os.cpus()                                 // CPU 정보 배열
os.cpuCount()                             // CPU 코어 수
os.totalMemory()                          // 전체 메모리 (바이트)
os.freeMemory()                           // 사용 가능 메모리
os.usedMemory()                           // 사용 메모리
os.uptime()                               // 시스템 가동 시간 (초)
os.hostname()                             // 호스트명
os.networkInterfaces()                    // 네트워크 인터페이스
```

#### 환경/경로 (10개)
```javascript
os.homeDir()                              // 홈 디렉토리
os.tempDir()                              // 임시 디렉토리
os.cwd()                                  // 현재 디렉토리
os.getEnv(name)                           // 환경변수 조회
os.setEnv(name, value)                    // 환경변수 설정
os.getUser()                              // 현재 사용자
os.getUid()                               // 사용자 ID
os.getGid()                               // 그룹 ID
os.getPid()                               // 프로세스 ID
os.getArgs()                              // 커맨드라인 인자
```

**테스트**: 20개 (예상 1.5시간)

---

### **Module 3: path (경로)** 🗂️
**위치**: `freelang/path`
**함수 수**: 15개
**기간**: 1주

#### 경로 조작 (15개)
```javascript
path.join(...parts)                       // 경로 결합
path.resolve(...parts)                    // 절대경로
path.normalize(path)                      // 정규화
path.dirname(path)                        // 디렉토리명
path.basename(path)                       // 파일명
path.extname(path)                        // 확장자
path.parseSync(path)                      // 경로 분석
path.formatSync(parts)                    // 경로 구성
path.isAbsolute(path)                     // 절대경로 여부
path.relative(from, to)                   // 상대경로 계산
path.commonPrefix(paths)                  // 공통 접두사
path.separator()                          // 경로 구분자
path.delimiter()                          // 환경변수 구분자
path.match(path, pattern)                 // 패턴 매칭
path.resolve2(path, base)                 // 기준점 기반 해석
```

**테스트**: 15개 (예상 1시간)

---

### **Module 4: crypto (암호화)** 🔐
**위치**: `freelang/crypto`
**함수 수**: 30개
**기간**: 3주

#### 해시 함수 (15개)
```javascript
crypto.md5(data)                          // MD5 해시
crypto.sha1(data)                         // SHA-1 해시
crypto.sha256(data)                       // SHA-256 해시
crypto.sha512(data)                       // SHA-512 해시
crypto.sha3(data, bits)                   // SHA-3 해시
crypto.blake2b(data)                      // BLAKE2b 해시
crypto.xxhash(data)                       // xxHash
crypto.crc32(data)                        // CRC-32
crypto.hmac(algo, data, key)              // HMAC
crypto.pbkdf2(password, salt, iterations) // PBKDF2
crypto.scrypt(password, salt)             // Scrypt
crypto.argon2(password, salt)             // Argon2
crypto.hashFile(path, algo)               // 파일 해시
crypto.hashObject(obj, algo)              // 객체 해시
crypto.hashArray(arr, algo)               // 배열 해시
```

#### 대칭 암호화 (8개)
```javascript
crypto.aesEncrypt(data, key, iv)          // AES 암호화
crypto.aesDecrypt(data, key, iv)          // AES 복호화
crypto.chaCha20(data, key, nonce)         // ChaCha20
crypto.xchacha20(data, key, nonce)        // XChaCha20
crypto.aead_encrypt(data, key, iv, ad)    // AEAD 암호화
crypto.aead_decrypt(data, key, iv, ad)    // AEAD 복호화
crypto.cipher(algo, data, key)            // 일반 암호화
crypto.decipher(algo, data, key)          // 일반 복호화
```

#### 비대칭 암호화 (7개)
```javascript
crypto.generateRSAKeyPair()               // RSA 키 쌍 생성
crypto.rsaEncrypt(data, publicKey)        // RSA 암호화
crypto.rsaDecrypt(data, privateKey)       // RSA 복호화
crypto.generateECDSAKeyPair()             // ECDSA 키 쌍
crypto.ecdsaSign(data, privateKey)        // ECDSA 서명
crypto.ecdsaVerify(data, signature, key)  // ECDSA 검증
crypto.generateDiffieHellman()            // DH 키 교환
```

**테스트**: 30개 (예상 3시간)

---

### **Module 5: http (웹/HTTP)** 🌐
**위치**: `freelang/http`
**함수 수**: 40개
**기간**: 3주

#### HTTP 클라이언트 (15개)
```javascript
http.get(url, options)                    // GET 요청
http.post(url, data, options)             // POST 요청
http.put(url, data, options)              // PUT 요청
http.patch(url, data, options)            // PATCH 요청
http.delete(url, options)                 // DELETE 요청
http.head(url, options)                   // HEAD 요청
http.request(url, method, options)        // 일반 요청
http.createClient(baseUrl)                // 클라이언트 생성
http.setDefaultHeaders(headers)           // 기본 헤더
http.setDefaultTimeout(ms)                // 기본 타임아웃
http.setDefaultRetries(count)             // 기본 재시도
http.setCookie(url, cookie)               // 쿠키 설정
http.getCookies(url)                      // 쿠키 조회
http.clearCookies(url)                    // 쿠키 삭제
http.setProxy(proxyUrl)                   // 프록시 설정
```

#### HTTP 서버 (15개)
```javascript
http.createServer(handler)                // 서버 생성
http.createSecureServer(options, handler) // HTTPS 서버
http.listen(port, host)                   // 포트 바인딩
http.close()                              // 서버 종료
http.createRouter()                       // 라우터 생성
http.router.get(path, handler)            // GET 라우트
http.router.post(path, handler)           // POST 라우트
http.router.put(path, handler)            // PUT 라우트
http.router.delete(path, handler)         // DELETE 라우트
http.router.patch(path, handler)          // PATCH 라우트
http.middleware.json()                    // JSON 파서
http.middleware.urlencoded()              // URL 인코딩
http.middleware.cors(options)             // CORS 미들웨어
http.middleware.rateLimit(options)        // Rate Limit
http.serveStatic(basePath)                // 정적 파일
```

#### HTTP 유틸리티 (10개)
```javascript
http.parseUrl(url)                        // URL 분석
http.buildUrl(parts)                      // URL 구성
http.parseQuery(queryString)              // 쿼리 파싱
http.buildQuery(obj)                      // 쿼리 문자열
http.parseHeaders(headerString)           // 헤더 파싱
http.encodeFormData(data)                 // Form 데이터
http.parseFormData(body, contentType)     // Form 파싱
http.decodeJWT(token)                     // JWT 디코드
http.verifyJWT(token, secret)             // JWT 검증
http.createJWT(payload, secret, options)  // JWT 생성
```

**테스트**: 40개 (예상 4시간)

---

### **Module 6: date (시간/날짜)** 📅
**위치**: `freelang/date`
**함수 수**: 35개
**기간**: 2.5주

#### 시간 생성 (10개)
```javascript
date.now()                                // 현재 타임스탬프
date.today()                              // 오늘 날짜
date.tomorrow()                           // 내일 날짜
date.yesterday()                          // 어제 날짜
date.fromTimestamp(ts)                    // 타임스탬프→날짜
date.fromString(str, format)              // 문자열→날짜
date.fromISO(isoString)                   // ISO→날짜
date.fromUnix(seconds)                    // Unix→날짜
date.create(year, month, day, ...)        // 날짜 생성
date.now_utc()                            // UTC 타임스탬프
```

#### 시간 조작 (15개)
```javascript
date.add(date, amount, unit)              // 시간 더하기
date.subtract(date, amount, unit)         // 시간 빼기
date.startOfDay(date)                     // 하루 시작
date.endOfDay(date)                       // 하루 끝
date.startOfWeek(date)                    // 주 시작
date.endOfWeek(date)                      // 주 끝
date.startOfMonth(date)                   // 월 시작
date.endOfMonth(date)                     // 월 끝
date.startOfYear(date)                    // 년 시작
date.endOfYear(date)                      // 년 끝
date.setHours(date, hours)                // 시간 설정
date.setMinutes(date, minutes)            // 분 설정
date.setSeconds(date, seconds)            // 초 설정
date.setMilliseconds(date, ms)            // 밀리초 설정
date.clone(date)                          // 날짜 복사
```

#### 시간 비교 (10개)
```javascript
date.isBefore(date1, date2)               // 이전 확인
date.isAfter(date1, date2)                // 이후 확인
date.isSame(date1, date2, unit)           // 같은지 확인
date.isBetween(date, start, end)          // 범위 확인
date.differenceInMs(date1, date2)         // 밀리초 차이
date.differenceInSeconds(date1, date2)    // 초 차이
date.differenceInMinutes(date1, date2)    // 분 차이
date.differenceInHours(date1, date2)      // 시간 차이
date.differenceInDays(date1, date2)       // 일 차이
date.differenceInMonths(date1, date2)     // 월 차이
```

**테스트**: 35개 (예상 3시간)

---

### **Module 7: encoding (인코딩)** 🔤
**위치**: `freelang/encoding`
**함수 수**: 25개
**기간**: 2주

#### Base 인코딩 (8개)
```javascript
encoding.base64Encode(data)               // Base64 인코딩
encoding.base64Decode(encoded)            // Base64 디코딩
encoding.base32Encode(data)               // Base32 인코딩
encoding.base32Decode(encoded)            // Base32 디코딩
encoding.hexEncode(data)                  // 16진수 인코딩
encoding.hexDecode(encoded)               // 16진수 디코딩
encoding.base85Encode(data)               // Base85 인코딩
encoding.base85Decode(encoded)            // Base85 디코딩
```

#### URL 인코딩 (6개)
```javascript
encoding.uriEncode(str)                   // URI 인코딩
encoding.uriDecode(encoded)               // URI 디코딩
encoding.uriComponentEncode(str)          // 컴포넌트 인코딩
encoding.uriComponentDecode(encoded)      // 컴포넌트 디코딩
encoding.htmlEscape(str)                  // HTML 이스케이프
encoding.htmlUnescape(escaped)            // HTML 언이스케이프
```

#### 문자 인코딩 (11개)
```javascript
encoding.utf8Encode(str)                  // UTF-8 인코딩
encoding.utf8Decode(bytes)                // UTF-8 디코딩
encoding.utf16Encode(str)                 // UTF-16 인코딩
encoding.utf16Decode(bytes)               // UTF-16 디코딩
encoding.utf32Encode(str)                 // UTF-32 인코딩
encoding.utf32Decode(bytes)               // UTF-32 디코딩
encoding.asciiEncode(str)                 // ASCII 인코딩
encoding.asciiDecode(bytes)               // ASCII 디코딩
encoding.latinEncode(str)                 // Latin-1 인코딩
encoding.latinDecode(bytes)               // Latin-1 디코딩
encoding.iconv(str, from, to)             // 문자셋 변환
```

**테스트**: 25개 (예상 2시간)

---

## 📊 표준 모듈 요약

| 모듈 | 함수 | 기간 | 테스트 | 우선순위 |
|------|------|------|--------|----------|
| **fs** | 25개 | 2주 | 25개 | ⭐⭐⭐⭐⭐ |
| **os** | 20개 | 1.5주 | 20개 | ⭐⭐⭐⭐ |
| **path** | 15개 | 1주 | 15개 | ⭐⭐⭐⭐ |
| **crypto** | 30개 | 3주 | 30개 | ⭐⭐⭐ |
| **http** | 40개 | 3주 | 40개 | ⭐⭐⭐⭐⭐ |
| **date** | 35개 | 2.5주 | 35개 | ⭐⭐⭐⭐⭐ |
| **encoding** | 25개 | 2주 | 25개 | ⭐⭐⭐ |
| **합계** | **190개** | **15주** | **190개** | - |

---

## 🗓️ 구현 로드맵

### **Phase 3-1: 기본 모듈** (Week 1-5)
```
Week 9:   fs + os 모듈 시작
Week 10:  fs + os 완성, path 시작
Week 11:  path 완성, crypto 1차
Week 12:  crypto 2차, http 기초
Week 13:  date 모듈 시작
```

### **Phase 3-2: 핵심 모듈** (Week 6-10)
```
Week 14:  http 클라이언트 완성
Week 15:  http 서버 완성
Week 16:  date 완성, encoding 시작
Week 17:  encoding 완성
Week 18:  통합 테스트 및 버그 수정
```

### **Phase 3-3: 마무리** (Week 11-15)
```
Week 19:  성능 최적화
Week 20:  문서화 + 예제 작성
Week 21:  최종 테스트 + 버그 수정
Week 22:  GOGS 커밋 + 릴리스 준비
```

---

## 📚 모듈 사용 예제

### **예제 1: 파일 처리**
```javascript
const fs = require('freelang/fs');
const path = require('freelang/path');

// 디렉토리의 모든 JS 파일 읽기
const dir = '/project/src';
const files = fs.listDir(dir);
const jsFiles = files.filter(f => f.endsWith('.js'));

// 각 파일 처리
jsFiles.forEach(file => {
  const fullPath = path.join(dir, file);
  const content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split('\n').length;
  console.log(`${file}: ${lines} lines`);
});
```

### **예제 2: 웹 서버**
```javascript
const http = require('freelang/http');

const server = http.createServer();
const router = http.createRouter();

router.get('/api/users', async (req, res) => {
  const users = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
  ];
  res.json(users);
});

router.post('/api/users', async (req, res) => {
  const user = req.body;
  res.json({ id: 3, ...user });
});

server.use(http.middleware.json());
server.use(router);
server.listen(3000);
```

### **예제 3: 암호화**
```javascript
const crypto = require('freelang/crypto');

// 비밀번호 해싱
const password = 'myPassword123';
const salt = crypto.generateSalt();
const hashed = crypto.pbkdf2(password, salt, 100000);

// 검증
const isValid = crypto.pbkdf2(password, salt, 100000) === hashed;

// 데이터 암호화
const data = 'sensitive information';
const key = crypto.generateKey(32);
const encrypted = crypto.aesEncrypt(data, key);
const decrypted = crypto.aesDecrypt(encrypted, key);
```

### **예제 4: 날짜 처리**
```javascript
const date = require('freelang/date');

// 날짜 계산
const now = date.now();
const nextWeek = date.add(now, 7, 'day');
const lastMonth = date.subtract(now, 1, 'month');

// 날짜 비교
const isFuture = date.isAfter(nextWeek, now);
const dayDiff = date.differenceInDays(nextWeek, now);

// 형식 변환
const formatted = date.format(now, 'YYYY-MM-DD HH:mm:ss');
```

---

## 🛠️ 기술 아키텍처

### **모듈 구조**
```
freelang-final/
├── src/
│   ├── runtime.js          (195개 기본 함수)
│   └── modules/
│       ├── fs.js           (25개)
│       ├── os.js           (20개)
│       ├── path.js         (15개)
│       ├── crypto.js       (30개)
│       ├── http.js         (40개)
│       ├── date.js         (35개)
│       └── encoding.js     (25개)
├── test/
│   ├── test_modules_fs.js
│   ├── test_modules_os.js
│   ├── test_modules_path.js
│   ├── test_modules_crypto.js
│   ├── test_modules_http.js
│   ├── test_modules_date.js
│   └── test_modules_encoding.js
└── docs/
    ├── MODULES_GUIDE.md
    ├── API_REFERENCE.md
    └── EXAMPLES.md
```

### **모듈 로딩**
```javascript
// 방법 1: 전체 로드
const freelang = require('freelang');
freelang.fs.readFile(...);

// 방법 2: 개별 로드
const fs = require('freelang/fs');
fs.readFile(...);

// 방법 3: 구조 분해
const { readFile, writeFile } = require('freelang/fs');
readFile(...);
```

---

## 📊 예상 효과

### **함수 증가**
```
Phase 1: 195개
Phase 2: 195개 (인터프리터, 함수 추가 X)
Phase 3: 195 + 190 = 385개

vs Python: 1000개 (모듈 분산)
진행률: 38.5%
```

### **커버리지**
```
내장 기능       ████████░ 80%
파일시스템      ████████░ 90%
웹/HTTP        ████████░ 85%
암호화         ████░ 70%
시간/날짜      ██████░ 75%

평균:          ████████░ 80%
```

---

## ✅ 무관용 규칙

### **테스트 요구사항**
- ✅ 모든 함수 사용 예제 (최소 1개)
- ✅ 에러 케이스 테스트 (최소 1개)
- ✅ 성능 테스트 (모든 함수 < 10ms)
- ✅ 드큐멘테이션 (API 설명 + 예제)

### **코드 품질**
- ✅ 타입 안정성 (try-catch)
- ✅ 에러 메시지 명확성
- ✅ 코드 커버리지 > 90%
- ✅ JSDoc 주석 완전성

---

## 🎯 성공 기준

| 지표 | 목표 | 기준 |
|------|------|------|
| 함수 개수 | 190개 | >= 190 |
| 테스트 통과율 | 100% | == 100% |
| 코드 커버리지 | 90% | >= 90% |
| 성능 | < 10ms | 모든 함수 |
| 문서화 | 100% | 모든 함수 |
| 예제 | 100% | 모든 모듈 |

---

## 🚀 다음 단계

### **지금 (Week 1-2)**
- ✅ Phase 3 계획 완료 (본 문서)
- 📋 모듈 구조 디자인

### **Week 3-8**
- Phase 2: JavaScript 인터프리터 구현

### **Week 9-15**
- Phase 3-1: 기본 모듈 (fs, os, path, crypto)

### **Week 16-20**
- Phase 3-2: 핵심 모듈 (http, date, encoding)

### **Week 21-22**
- Phase 3-3: 최적화 및 릴리스

---

## 📝 결론

### 단계별 함수 증가
```
Phase 1 (완료):    195개
Phase 2 (진행):    195개
Phase 3 (계획):    +190개 = 385개

6개월 후: 385개 함수
1년 후:   500+개 (커뮤니티 모듈)
```

### 전략적 이점
```
✅ 핵심 기능 우선 (195개)
✅ 운영체제 통합 (fs, os, path)
✅ 보안 강화 (crypto)
✅ 웹 개발 지원 (http)
✅ 데이터 처리 (date, encoding)

→ Python처럼 실용적이고 확장 가능한 생태계
```

---

**계획 작성일**: 2026-03-05
**상태**: 📋 계획 단계, 구현 대기 중
**다음**: Phase 2 JavaScript 인터프리터 구현 (2026-03-06~)

