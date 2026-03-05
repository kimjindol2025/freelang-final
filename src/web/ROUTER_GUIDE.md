# FreeLang Web Framework - Router Guide

**Express/Django 수준의 라우팅 시스템**

라우터는 HTTP 요청을 처리하고 URL 패턴에 따라 적절한 핸들러로 매핑합니다.

## 설치 및 기본 사용

```javascript
const Router = require('./src/web/router');

// 라우터 생성
const router = new Router();

// 라우트 등록
router.get('/users', (req) => {
  return { users: [...] };
});

router.post('/users', (req) => {
  return { created: true, id: req.body.id };
});

// 라우트 매칭
const result = router.match('GET', '/users');
if (result) {
  const response = result.handler({ params: result.params });
  console.log(response);
}
```

## 주요 기능

### 1. HTTP 메서드별 라우트

```javascript
router.get('/users', handler);        // GET
router.post('/users', handler);       // POST
router.put('/users/:id', handler);    // PUT
router.delete('/users/:id', handler); // DELETE
router.patch('/users/:id', handler);  // PATCH
router.head('/users', handler);       // HEAD
router.options('/users', handler);    // OPTIONS
router.all('/api/*', handler);        // 모든 메서드
```

### 2. 동적 라우팅 (파라미터)

```javascript
// 단일 파라미터
router.get('/users/:id', (req) => {
  console.log(req.params.id);  // "123"
});

// 다중 파라미터
router.get('/posts/:id/comments/:cid', (req) => {
  console.log(req.params.id);  // "42"
  console.log(req.params.cid); // "99"
});

// 매칭
const result = router.match('GET', '/users/123');
// result.params = { id: '123' }
```

### 3. 와일드카드 경로

```javascript
// 특정 프리픽스 이후의 모든 경로 매칭
router.get('/static/*', (req) => {
  return { type: 'static' };
});

router.match('GET', '/static/css/style.css');  // 매칭 ✓
router.match('GET', '/static/js/app.js');      // 매칭 ✓
router.match('GET', '/dynamic/file');          // 미매칭 ✗
```

### 4. 라우터 그룹 (프리픽스)

```javascript
// 메인 라우터
const mainRouter = new Router();

// API v1 라우터
const apiV1Router = new Router();
apiV1Router.get('/status', () => ({ status: 'ok' }));
apiV1Router.get('/users', () => ({ users: [...] }));

// API v2 라우터
const apiV2Router = new Router();
apiV2Router.get('/status', () => ({ status: 'ok', version: '2' }));

// 메인에 통합
mainRouter.use('/api/v1', apiV1Router);
mainRouter.use('/api/v2', apiV2Router);

// 매칭
mainRouter.match('GET', '/api/v1/status');  // apiV1Router의 handler
mainRouter.match('GET', '/api/v2/status');  // apiV2Router의 handler
```

### 5. URL 파라미터 디코딩

```javascript
// URL 인코딩된 파라미터는 자동으로 디코딩됨
router.get('/search/:query', (req) => {
  console.log(req.params.query);
});

router.match('GET', '/search/hello%20world');
// params.query = 'hello world' (자동 디코딩)
```

## API 레퍼런스

### Router 클래스

#### 생성자
```javascript
new Router(prefix = '')
```
- `prefix`: 라우터에 적용할 URL 프리픽스 (기본값: '')

#### HTTP 메서드
```javascript
router.get(path, handler)
router.post(path, handler)
router.put(path, handler)
router.delete(path, handler)
router.patch(path, handler)
router.head(path, handler)
router.options(path, handler)
router.all(path, handler)  // 모든 메서드
```

#### 라우트 매칭
```javascript
router.match(method, path)
```
반환값:
```javascript
{
  handler: Function,
  params: Object,
  path: String
}
// 또는 null (매칭 실패 시)
```

#### 라우터 통합
```javascript
router.use(prefix, subRouter)    // 중첩 라우터
router.use(prefix, middleware)   // 미들웨어
router.addMiddleware(handler)     // 글로벌 미들웨어
```

#### 라우트 관리
```javascript
router.listRoutes()           // 모든 라우트 목록 반환
router.getRoutesByMethod(method)  // 특정 메서드의 라우트
router.getStats()             // 라우트 통계
router.hasRoute(method, path) // 라우트 존재 여부
router.removeRoute(method, path)  // 라우트 제거
router.clear()                // 모든 라우트 제거
```

## 실제 예제

### RESTful API 서버

```javascript
const Router = require('./src/web/router');

const apiRouter = new Router('/api');

// 사용자 관련 라우트
const userRoutes = new Router();
userRoutes.get('', (req) => ({ users: ['Alice', 'Bob'] }));
userRoutes.get('/:id', (req) => ({ id: req.params.id, name: 'Alice' }));
userRoutes.post('', (req) => ({ created: true, id: 1 }));
userRoutes.put('/:id', (req) => ({ updated: true, id: req.params.id }));
userRoutes.delete('/:id', (req) => ({ deleted: true, id: req.params.id }));

// 게시물 관련 라우트
const postRoutes = new Router();
postRoutes.get('', (req) => ({ posts: [] }));
postRoutes.get('/:id/comments/:cid', (req) => ({
  postId: req.params.id,
  commentId: req.params.cid
}));

// 통합
apiRouter.use('/users', userRoutes);
apiRouter.use('/posts', postRoutes);

// 사용
const result = apiRouter.match('GET', '/api/users/123');
if (result) {
  const response = result.handler({ params: result.params });
  console.log(response);  // { id: '123', name: 'Alice' }
}
```

### 정적 파일 서빙

```javascript
const mainRouter = new Router();

// 정적 파일
mainRouter.get('/static/*', (req) => {
  return { type: 'static' };
});

// 동적 페이지
mainRouter.get('/:page', (req) => {
  return { page: req.params.page };
});

mainRouter.match('GET', '/static/css/style.css');
// { handler: ..., params: {} }

mainRouter.match('GET', '/about');
// { handler: ..., params: { page: 'about' } }
```

### 마이크로서비스 아키텍처

```javascript
const mainRouter = new Router();

// Service A
const serviceA = new Router('/api/service-a');
serviceA.get('/data', () => ({ service: 'A', data: [...] }));

// Service B
const serviceB = new Router('/api/service-b');
serviceB.get('/data', () => ({ service: 'B', data: [...] }));

// Service C
const serviceC = new Router('/api/service-c');
serviceC.get('/data', () => ({ service: 'C', data: [...] }));

// 통합
mainRouter.use('', serviceA);
mainRouter.use('', serviceB);
mainRouter.use('', serviceC);

// 요청 라우팅
const serviceAData = mainRouter.match('GET', '/api/service-a/data');
const serviceBData = mainRouter.match('GET', '/api/service-b/data');
```

## 성능 특성

### 매칭 알고리즘
- **시간 복잡도**: O(n) - n은 등록된 라우트 수
- **정규식 캐싱**: 각 라우트의 정규식을 미리 컴파일하여 저장
- **단락(Short-circuit)**: 메서드와 경로가 모두 일치할 때만 계속 진행

### 벤치마크 (1000개 라우트)
```
처리 시간: ~9ms
성능: < 10ms 이하
```

### 최적화 팁

1. **라우트 순서**: 자주 사용되는 라우트를 먼저 등록
2. **라우터 분할**: 큰 애플리케이션은 기능별로 라우터 분할
3. **와일드카드 최소화**: 와일드카드 사용을 최소한으로 줄임

## 제약 사항

1. **파라미터 이름**: 반드시 알파벳, 숫자, 언더스코어로 구성 (`[a-zA-Z0-9_]`)
2. **정규식 특수문자**: 경로에 `.`, `+`, `*` 등을 사용하려면 이스케이프 필요
3. **슬래시 민감도**: 경로는 슬래시에 민감함 (`/users` ≠ `/users/`)

## 테스트

```bash
# 테스트 실행
node src/web/router.test.js

# 결과
✅ 통과: 36개
❌ 실패: 0개
📊 총합: 36개
📈 성공률: 100%
```

### 테스트 항목

- ✅ GET /users (단순 경로)
- ✅ GET /users/:id (단일 파라미터)
- ✅ POST /users (메서드 분기)
- ✅ 다중 파라미터
- ✅ PUT, DELETE, PATCH 메서드
- ✅ 없는 라우트 처리
- ✅ 라우터 프리픽스 (중첩 라우터)
- ✅ 라우트 통계 및 관리
- ✅ 성능 (1000개 라우트)
- ✅ URL 파라미터 디코딩
- ✅ 와일드카드 경로

## 향후 계획

- [ ] 정규식 라우트 지원
- [ ] 라우트 우선순위 설정
- [ ] 요청/응답 미들웨어 체인
- [ ] 라우트 그룹 가드
- [ ] 라우트 이름 지정 (reverse routing)
