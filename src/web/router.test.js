/**
 * FreeLang Web Framework - Router Test Suite
 * 8개 핵심 테스트 + 성능 테스트
 */

const Router = require('./router');

// 테스트 결과 추적
let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ ${message}`);
    passed++;
  } else {
    console.log(`❌ ${message}`);
    failed++;
  }
}

console.log('╔══════════════════════════════════════╗');
console.log('║  FreeLang Router 라우팅 테스트 스위트  ║');
console.log('╚══════════════════════════════════════╝\n');

// ============================================
// Test 1: GET /users (단순 경로)
// ============================================
{
  console.log('【Test 1】GET /users (단순 경로)');
  const router = new Router();
  router.get('/users', (req) => ({ action: 'list' }));

  const result = router.match('GET', '/users');
  assert(result !== null, 'T1-1: 라우트 매칭 성공');
  assert(result.params && Object.keys(result.params).length === 0, 'T1-2: 파라미터 없음');
  assert(typeof result.handler === 'function', 'T1-3: 핸들러 함수');

  console.log('');
}

// ============================================
// Test 2: GET /users/:id (단일 파라미터)
// ============================================
{
  console.log('【Test 2】GET /users/:id (단일 파라미터)');
  const router = new Router();
  router.get('/users/:id', (req) => ({ action: 'get', id: req.params.id }));

  const result = router.match('GET', '/users/123');
  assert(result !== null, 'T2-1: 라우트 매칭 성공');
  assert(result.params.id === '123', 'T2-2: 파라미터 값 추출 (:id = 123)');
  assert(result.handler({ params: result.params }).id === '123', 'T2-3: 핸들러 실행');

  console.log('');
}

// ============================================
// Test 3: POST /users (메서드 분기)
// ============================================
{
  console.log('【Test 3】POST /users (메서드 분기)');
  const router = new Router();
  router.get('/users', (req) => ({ action: 'list' }));
  router.post('/users', (req) => ({ action: 'create' }));

  const getResult = router.match('GET', '/users');
  const postResult = router.match('POST', '/users');

  assert(getResult !== null && getResult.handler({ params: {} }).action === 'list',
    'T3-1: GET /users 처리');
  assert(postResult !== null && postResult.handler({ params: {} }).action === 'create',
    'T3-2: POST /users 처리');
  assert(getResult.handler !== postResult.handler, 'T3-3: 다른 핸들러 분기');

  console.log('');
}

// ============================================
// Test 4: 다중 파라미터 (/posts/:id/comments/:cid)
// ============================================
{
  console.log('【Test 4】다중 파라미터 (/posts/:id/comments/:cid)');
  const router = new Router();
  router.get('/posts/:id/comments/:cid', (req) => ({
    action: 'getComment',
    postId: req.params.id,
    commentId: req.params.cid
  }));

  const result = router.match('GET', '/posts/42/comments/99');
  assert(result !== null, 'T4-1: 복잡한 경로 매칭');
  assert(result.params.id === '42', 'T4-2: 첫 번째 파라미터 (:id = 42)');
  assert(result.params.cid === '99', 'T4-3: 두 번째 파라미터 (:cid = 99)');

  const response = result.handler({ params: result.params });
  assert(response.postId === '42' && response.commentId === '99', 'T4-4: 핸들러 응답 검증');

  console.log('');
}

// ============================================
// Test 5: PUT, DELETE, PATCH 메서드
// ============================================
{
  console.log('【Test 5】PUT, DELETE, PATCH 메서드');
  const router = new Router();
  router.put('/users/:id', (req) => ({ action: 'update', id: req.params.id }));
  router.delete('/users/:id', (req) => ({ action: 'delete', id: req.params.id }));
  router.patch('/users/:id', (req) => ({ action: 'patch', id: req.params.id }));

  const putResult = router.match('PUT', '/users/456');
  const delResult = router.match('DELETE', '/users/456');
  const patchResult = router.match('PATCH', '/users/456');

  assert(putResult !== null && putResult.params.id === '456', 'T5-1: PUT /users/:id');
  assert(delResult !== null && delResult.params.id === '456', 'T5-2: DELETE /users/:id');
  assert(patchResult !== null && patchResult.params.id === '456', 'T5-3: PATCH /users/:id');

  console.log('');
}

// ============================================
// Test 6: 없는 라우트 (404)
// ============================================
{
  console.log('【Test 6】없는 라우트 처리 (404)');
  const router = new Router();
  router.get('/users', () => ({}));

  const result1 = router.match('GET', '/admin');
  const result2 = router.match('POST', '/users');
  const result3 = router.match('GET', '/users/');

  assert(result1 === null, 'T6-1: 없는 경로 → null');
  assert(result2 === null, 'T6-2: 없는 메서드 → null');
  assert(result3 === null, 'T6-3: 경로 불일치 (슬래시 차이)');

  console.log('');
}

// ============================================
// Test 7: 라우터 프리픽스 (서브라우터)
// ============================================
{
  console.log('【Test 7】라우터 프리픽스 (중첩 라우터)');
  const mainRouter = new Router();
  const apiRouter = new Router('/api');
  const v1Router = new Router(); // 프리픽스 없음

  v1Router.get('/status', () => ({ status: 'ok', version: '1.0' }));
  apiRouter.use('/v1', v1Router);
  mainRouter.use('', apiRouter);

  const result = mainRouter.match('GET', '/api/v1/status');
  assert(result !== null, 'T7-1: 중첩 라우터 경로 매칭');
  assert(result.path === '/api/v1/status', 'T7-2: 전체 경로 구성');

  console.log('');
}

// ============================================
// Test 8: 라우트 통계 및 관리
// ============================================
{
  console.log('【Test 8】라우트 통계 및 관리');
  const router = new Router();
  router.get('/users', () => ({}));
  router.post('/users', () => ({}));
  router.put('/users/:id', () => ({}));
  router.delete('/users/:id', () => ({}));

  const stats = router.getStats();
  assert(stats.total === 4, 'T8-1: 총 라우트 수 (4개)');
  assert(stats.byMethod.GET === 1, 'T8-2: GET 라우트 수');
  assert(stats.byMethod.POST === 1, 'T8-3: POST 라우트 수');
  assert(stats.byMethod.PUT === 1, 'T8-4: PUT 라우트 수');
  assert(stats.byMethod.DELETE === 1, 'T8-5: DELETE 라우트 수');

  const routes = router.listRoutes();
  assert(routes.length === 4, 'T8-6: listRoutes() 결과');

  const hasRoute = router.hasRoute('GET', '/users');
  assert(hasRoute === true, 'T8-7: hasRoute() - 있는 라우트');

  const hasRoute2 = router.hasRoute('GET', '/admin');
  assert(hasRoute2 === false, 'T8-8: hasRoute() - 없는 라우트');

  console.log('');
}

// ============================================
// Bonus: 성능 테스트 (1000개 라우트)
// ============================================
{
  console.log('【Performance】1000개 라우트 매칭 성능');
  const largeRouter = new Router();

  // 1000개의 라우트 등록
  for (let i = 0; i < 1000; i++) {
    largeRouter.get(`/route${i}`, () => ({ index: i }));
  }

  const start = Date.now();
  const result = largeRouter.match('GET', '/route999');
  const elapsed = Date.now() - start;

  assert(result !== null, `P1: 마지막 라우트 매칭 성공`);
  assert(elapsed < 10, `P2: 성능 < 10ms (실제: ${elapsed}ms)`);

  console.log(`   처리 시간: ${elapsed}ms`);
  console.log('');
}

// ============================================
// Bonus: URL 파라미터 디코딩
// ============================================
{
  console.log('【Bonus】URL 파라미터 디코딩 (특수 문자)');
  const router = new Router();
  router.get('/search/:query', (req) => ({ q: req.params.query }));

  const result = router.match('GET', '/search/hello%20world');
  assert(result !== null, 'B1: 인코딩된 URL 매칭');
  assert(result.params.query === 'hello world', 'B2: 디코딩된 값 ("hello world")');

  console.log('');
}

// ============================================
// Bonus: 와일드카드 경로 (*)
// ============================================
{
  console.log('【Bonus】와일드카드 경로 (*)');
  const router = new Router();
  router.get('/static/*', () => ({ type: 'static' }));

  const result1 = router.match('GET', '/static/css/style.css');
  const result2 = router.match('GET', '/static/js/app.js');
  const result3 = router.match('GET', '/dynamic/file');

  assert(result1 !== null, 'B3: 와일드카드 매칭 (css)');
  assert(result2 !== null, 'B4: 와일드카드 매칭 (js)');
  assert(result3 === null, 'B5: 와일드카드 미매칭');

  console.log('');
}

// ============================================
// 최종 결과 요약
// ============================================
console.log('╔══════════════════════════════════════╗');
console.log('║             테스트 결과 요약           ║');
console.log('╚══════════════════════════════════════╝\n');

const total = passed + failed;
const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;

console.log(`✅ 통과: ${passed}개`);
console.log(`❌ 실패: ${failed}개`);
console.log(`📊 총합: ${total}개`);
console.log(`📈 성공률: ${percentage}%\n`);

if (failed === 0) {
  console.log('🎉 모든 테스트 통과!\n');
  process.exit(0);
} else {
  console.log(`⚠️  ${failed}개 테스트 실패\n`);
  process.exit(1);
}
