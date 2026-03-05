/**
 * FreeLang Web Framework - Router
 * Express/Django 수준의 라우팅 시스템
 * URL 패턴 매칭 및 핸들러 연결
 */

class Router {
  constructor(prefix = '') {
    this.prefix = prefix;
    this.routes = [];
    this.middlewares = [];
  }

  /**
   * GET 라우트 등록
   * @param {string} path - 라우트 경로 (예: /users/:id)
   * @param {Function} handler - 요청 핸들러
   * @returns {Router} - 메서드 체이닝을 위한 this
   */
  get(path, handler) {
    this.addRoute('GET', path, handler);
    return this;
  }

  /**
   * POST 라우트 등록
   */
  post(path, handler) {
    this.addRoute('POST', path, handler);
    return this;
  }

  /**
   * PUT 라우트 등록
   */
  put(path, handler) {
    this.addRoute('PUT', path, handler);
    return this;
  }

  /**
   * DELETE 라우트 등록
   */
  delete(path, handler) {
    this.addRoute('DELETE', path, handler);
    return this;
  }

  /**
   * PATCH 라우트 등록
   */
  patch(path, handler) {
    this.addRoute('PATCH', path, handler);
    return this;
  }

  /**
   * HEAD 라우트 등록
   */
  head(path, handler) {
    this.addRoute('HEAD', path, handler);
    return this;
  }

  /**
   * OPTIONS 라우트 등록
   */
  options(path, handler) {
    this.addRoute('OPTIONS', path, handler);
    return this;
  }

  /**
   * 모든 HTTP 메서드를 수용하는 라우트 등록
   */
  all(path, handler) {
    ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'].forEach(method => {
      this.addRoute(method, path, handler);
    });
    return this;
  }

  /**
   * 라우트 추가 (내부 메서드)
   * @private
   */
  addRoute(method, path, handler) {
    const fullPath = this.prefix + path;
    this.routes.push({
      method: method,
      path: fullPath,
      pattern: this.pathToRegex(fullPath),
      params: this.extractParams(fullPath),
      handler: handler,
      regex: this.pathToRegex(fullPath).toString()
    });
  }

  /**
   * 경로 문자열을 정규식으로 변환
   * /users/:id → /users/([^/]+)
   * /posts/:id/comments/:cid → /posts/([^/]+)/comments/([^/]+)
   * /files/* → /files/.*
   *
   * @param {string} path - 경로 패턴
   * @returns {RegExp} - 매칭용 정규식
   * @private
   */
  pathToRegex(path) {
    // 이스케이프: / 문자 처리
    let pattern = path
      .split('/') // 각 세그먼트별로 처리하면 더 정확함
      .map(segment => {
        // :param 처리 (단어 시작, 문자/숫자/언더스코어 조합)
        if (segment.startsWith(':')) {
          return '([^/]+)'; // 슬래시를 제외한 모든 문자
        } else if (segment === '*') {
          return '.*'; // 나머지 모든 문자
        } else {
          // 특수 정규식 문자 이스케이프
          return segment.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
        }
      })
      .join('\\/');

    return new RegExp(`^${pattern}$`);
  }

  /**
   * 경로에서 파라미터 이름 추출
   * /users/:id/comments/:cid → ['id', 'cid']
   *
   * @param {string} path - 경로 패턴
   * @returns {string[]} - 파라미터 이름 배열
   * @private
   */
  extractParams(path) {
    const params = [];
    const regex = /:([a-zA-Z_][a-zA-Z0-9_]*)/g;
    let match;

    while ((match = regex.exec(path)) !== null) {
      params.push(match[1]);
    }

    return params;
  }

  /**
   * 라우트 매칭 및 파라미터 추출
   * @param {string} method - HTTP 메서드
   * @param {string} path - 요청 경로
   * @returns {Object|null} - {handler, params} 또는 null
   */
  match(method, path) {
    for (const route of this.routes) {
      // 메서드와 경로 패턴 모두 매칭되어야 함
      if (route.method === method && route.pattern.test(path)) {
        // 정규식 실행 결과에서 캡처 그룹(파라미터 값) 추출
        const matches = route.pattern.exec(path);
        const values = matches ? matches.slice(1) : [];

        // 파라미터 이름과 값을 매핑
        const params = {};
        route.params.forEach((param, idx) => {
          params[param] = decodeURIComponent(values[idx]);
        });

        return {
          handler: route.handler,
          params: params,
          path: route.path
        };
      }
    }

    return null;
  }

  /**
   * 라우터 그룹 (프리픽스와 중첩 라우터 지원)
   * @param {string} prefix - URL 프리픽스
   * @param {Router|Function} routerOrMiddleware - 라우터 또는 미들웨어
   * @returns {Router} - 메서드 체이닝을 위한 this
   */
  use(prefix, routerOrMiddleware) {
    if (typeof routerOrMiddleware === 'function') {
      // 미들웨어: 글로벌 미들웨어 추가
      this.middlewares.push(routerOrMiddleware);
    } else if (routerOrMiddleware instanceof Router) {
      // 중첩 라우터: 프리픽스를 추가하여 통합
      routerOrMiddleware.routes.forEach(route => {
        // 새로운 경로 계산: this.prefix + prefix + 중첩 라우터의 prefix + 라우트 경로
        const newPath = this.prefix + prefix + route.path;
        const newPattern = this.pathToRegex(newPath);
        this.routes.push({
          ...route,
          path: newPath,
          pattern: newPattern,
          regex: newPattern.toString(),
          params: this.extractParams(newPath)
        });
      });

      // 중첩 라우터의 미들웨어도 추가
      routerOrMiddleware.middlewares.forEach(mw => {
        this.middlewares.push(mw);
      });
    }
    return this;
  }

  /**
   * 미들웨어 추가 (글로벌)
   * @param {Function} handler - 미들웨어 핸들러
   * @returns {Router} - 메서드 체이닝을 위한 this
   */
  addMiddleware(handler) {
    this.middlewares.push(handler);
    return this;
  }

  /**
   * 전체 라우트 목록 반환
   * @returns {Array} - 라우트 배열 [{method, path}, ...]
   */
  listRoutes() {
    return this.routes.map(r => ({
      method: r.method,
      path: r.path,
      regex: r.regex
    }));
  }

  /**
   * 특정 메서드의 라우트 필터링
   * @param {string} method - HTTP 메서드
   * @returns {Array} - 필터링된 라우트
   */
  getRoutesByMethod(method) {
    return this.routes
      .filter(r => r.method === method)
      .map(r => ({ path: r.path }));
  }

  /**
   * 라우트 통계
   * @returns {Object} - {total, byMethod}
   */
  getStats() {
    const stats = {
      total: this.routes.length,
      byMethod: {}
    };

    this.routes.forEach(route => {
      stats.byMethod[route.method] = (stats.byMethod[route.method] || 0) + 1;
    });

    return stats;
  }

  /**
   * 라우터 초기화 (모든 라우트 제거)
   */
  clear() {
    this.routes = [];
    this.middlewares = [];
  }

  /**
   * 라우트 제거 (특정 메서드와 경로)
   * @param {string} method - HTTP 메서드
   * @param {string} path - 라우트 경로
   * @returns {boolean} - 제거 성공 여부
   */
  removeRoute(method, path) {
    const fullPath = this.prefix + path;
    const idx = this.routes.findIndex(r => r.method === method && r.path === fullPath);

    if (idx > -1) {
      this.routes.splice(idx, 1);
      return true;
    }
    return false;
  }

  /**
   * 라우트 중복 체크
   * @param {string} method - HTTP 메서드
   * @param {string} path - 라우트 경로
   * @returns {boolean} - 중복 여부
   */
  hasRoute(method, path) {
    const fullPath = this.prefix + path;
    return this.routes.some(r => r.method === method && r.path === fullPath);
  }
}

module.exports = Router;
