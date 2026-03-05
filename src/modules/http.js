/**
 * FreeLang http Module: HTTP 통신
 * 40개 함수 (클라이언트, 서버, 요청/응답 처리)
 */

const http = require('http');
const https = require('https');
const url = require('url');
const querystring = require('querystring');

// ============================================================================
// HTTP Client (12개 함수)
// ============================================================================

/**
 * GET 요청 전송
 * @param {string} urlStr - URL
 * @param {object} options - 옵션 (선택사항)
 * @returns {Promise<object>} {status, headers, body}
 */
function get(urlStr, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new url.URL(urlStr);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      ...options
    };

    protocol.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    }).on('error', reject).end();
  });
}

/**
 * POST 요청 전송
 * @param {string} urlStr - URL
 * @param {string|object} body - 요청 본문
 * @param {object} options - 옵션
 * @returns {Promise<object>}
 */
function post(urlStr, body, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new url.URL(urlStr);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);

    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Length': Buffer.byteLength(bodyStr),
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    protocol.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    }).on('error', reject).write(bodyStr).end();
  });
}

/**
 * PUT 요청 전송
 * @param {string} urlStr - URL
 * @param {string|object} body - 요청 본문
 * @param {object} options - 옵션
 * @returns {Promise<object>}
 */
function put(urlStr, body, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new url.URL(urlStr);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);

    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'PUT',
      headers: {
        'Content-Length': Buffer.byteLength(bodyStr),
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    protocol.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    }).on('error', reject).write(bodyStr).end();
  });
}

/**
 * DELETE 요청 전송
 * @param {string} urlStr - URL
 * @param {object} options - 옵션
 * @returns {Promise<object>}
 */
function deleteRequest(urlStr, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new url.URL(urlStr);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'DELETE',
      ...options
    };

    protocol.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    }).on('error', reject).end();
  });
}

/**
 * PATCH 요청 전송
 * @param {string} urlStr - URL
 * @param {string|object} body - 요청 본문
 * @param {object} options - 옵션
 * @returns {Promise<object>}
 */
function patch(urlStr, body, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new url.URL(urlStr);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);

    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'PATCH',
      headers: {
        'Content-Length': Buffer.byteLength(bodyStr),
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    protocol.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    }).on('error', reject).write(bodyStr).end();
  });
}

/**
 * HEAD 요청 전송
 * @param {string} urlStr - URL
 * @param {object} options - 옵션
 * @returns {Promise<object>}
 */
function head(urlStr, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new url.URL(urlStr);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'HEAD',
      ...options
    };

    protocol.request(requestOptions, (res) => {
      resolve({
        status: res.statusCode,
        headers: res.headers,
        body: ''
      });
    }).on('error', reject).end();
  });
}

/**
 * OPTIONS 요청 전송
 * @param {string} urlStr - URL
 * @param {object} options - 옵션
 * @returns {Promise<object>}
 */
function options(urlStr, opts = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new url.URL(urlStr);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'OPTIONS',
      ...opts
    };

    protocol.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    }).on('error', reject).end();
  });
}

/**
 * 일반 요청 전송
 * @param {string} urlStr - URL
 * @param {object} options - {method, body, headers, ...}
 * @returns {Promise<object>}
 */
function request(urlStr, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new url.URL(urlStr);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    const method = options.method || 'GET';
    const bodyStr = options.body ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) : '';

    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: options.headers || {},
      ...options
    };

    if (bodyStr) {
      requestOptions.headers['Content-Length'] = Buffer.byteLength(bodyStr);
    }

    const req = protocol.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    }).on('error', reject);

    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

/**
 * JSON 데이터와 함께 POST 요청
 * @param {string} urlStr - URL
 * @param {object} jsonData - JSON 객체
 * @param {object} options - 옵션
 * @returns {Promise<object>}
 */
function postJson(urlStr, jsonData, options = {}) {
  return post(urlStr, jsonData, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
}

/**
 * 폼 데이터와 함께 POST 요청
 * @param {string} urlStr - URL
 * @param {object} formData - 폼 데이터 객체
 * @param {object} options - 옵션
 * @returns {Promise<object>}
 */
function postForm(urlStr, formData, options = {}) {
  const encoded = querystring.stringify(formData);
  return post(urlStr, encoded, {
    ...options,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      ...options.headers
    }
  });
}

// ============================================================================
// HTTP Server (15개 함수)
// ============================================================================

/**
 * HTTP 서버 생성
 * @param {function} requestHandler - (req, res) => void
 * @param {number} port - 포트 번호
 * @returns {object} 서버 객체
 */
function createServer(requestHandler, port = 3000) {
  const server = http.createServer(requestHandler);
  server.listen(port);
  return {
    listen: (p = port) => new Promise(resolve => {
      server.listen(p, () => resolve(p));
    }),
    close: () => new Promise(resolve => {
      server.close(() => resolve());
    }),
    port: port,
    _server: server
  };
}

/**
 * HTTPS 서버 생성
 * @param {object} options - {key, cert} SSL 옵션
 * @param {function} requestHandler - (req, res) => void
 * @param {number} port - 포트 번호
 * @returns {object} 서버 객체
 */
function createSecureServer(sslOptions, requestHandler, port = 443) {
  const server = https.createServer(sslOptions, requestHandler);
  server.listen(port);
  return {
    listen: (p = port) => new Promise(resolve => {
      server.listen(p, () => resolve(p));
    }),
    close: () => new Promise(resolve => {
      server.close(() => resolve());
    }),
    port: port,
    _server: server
  };
}

/**
 * 응답 상태 코드 설정
 * @param {object} res - 응답 객체
 * @param {number} statusCode - 상태 코드
 * @returns {object} 응답 객체 (체이닝용)
 */
function setStatus(res, statusCode) {
  res.statusCode = statusCode;
  return res;
}

/**
 * 응답 헤더 설정
 * @param {object} res - 응답 객체
 * @param {object} headers - 헤더 객체
 * @returns {object} 응답 객체
 */
function setHeaders(res, headers) {
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  return res;
}

/**
 * JSON 응답 전송
 * @param {object} res - 응답 객체
 * @param {object} data - JSON 데이터
 * @param {number} statusCode - 상태 코드 (기본: 200)
 * @returns {Promise<void>}
 */
function sendJson(res, data, statusCode = 200) {
  return new Promise((resolve) => {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data), () => resolve());
  });
}

/**
 * 텍스트 응답 전송
 * @param {object} res - 응답 객체
 * @param {string} text - 텍스트 데이터
 * @param {number} statusCode - 상태 코드 (기본: 200)
 * @returns {Promise<void>}
 */
function sendText(res, text, statusCode = 200) {
  return new Promise((resolve) => {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'text/plain');
    res.end(String(text), () => resolve());
  });
}

/**
 * HTML 응답 전송
 * @param {object} res - 응답 객체
 * @param {string} html - HTML 마크업
 * @param {number} statusCode - 상태 코드 (기본: 200)
 * @returns {Promise<void>}
 */
function sendHtml(res, html, statusCode = 200) {
  return new Promise((resolve) => {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'text/html');
    res.end(html, () => resolve());
  });
}

/**
 * 리다이렉트
 * @param {object} res - 응답 객체
 * @param {string} location - 리다이렉트 위치
 * @param {number} statusCode - 상태 코드 (기본: 302)
 * @returns {void}
 */
function redirect(res, location, statusCode = 302) {
  res.statusCode = statusCode;
  res.setHeader('Location', location);
  res.end();
}

/**
 * 파일 응답 전송
 * @param {object} res - 응답 객체
 * @param {string} filePath - 파일 경로
 * @param {string} contentType - 컨텐츠 타입
 * @returns {Promise<void>}
 */
function sendFile(res, filePath, contentType = 'application/octet-stream') {
  return new Promise((resolve, reject) => {
    const fs = require('fs');
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.statusCode = 404;
        res.end('File not found', () => reject(err));
      } else {
        res.statusCode = 200;
        res.setHeader('Content-Type', contentType);
        res.end(data, () => resolve());
      }
    });
  });
}

/**
 * 에러 응답 전송
 * @param {object} res - 응답 객체
 * @param {number} statusCode - 상태 코드
 * @param {string} message - 에러 메시지
 * @returns {Promise<void>}
 */
function sendError(res, statusCode, message) {
  return sendJson(res, { error: message, status: statusCode }, statusCode);
}

/**
 * URL 쿼리 파싱
 * @param {string} queryString - 쿼리 스트링
 * @returns {object} 파싱된 쿼리 객체
 */
function parseQuery(queryString) {
  return querystring.parse(queryString);
}

/**
 * URL 파싱
 * @param {string} urlStr - URL 문자열
 * @returns {object} 파싱된 URL 객체
 */
function parseUrl(urlStr) {
  const parsed = new url.URL(urlStr);
  return {
    protocol: parsed.protocol,
    hostname: parsed.hostname,
    port: parsed.port,
    pathname: parsed.pathname,
    search: parsed.search,
    hash: parsed.hash,
    query: querystring.parse(parsed.search.substring(1))
  };
}

/**
 * 요청 본문 읽기
 * @param {object} req - 요청 객체
 * @returns {Promise<string>}
 */
function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

/**
 * 요청 본문을 JSON으로 파싱
 * @param {object} req - 요청 객체
 * @returns {Promise<object>}
 */
function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

// ============================================================================
// 라우팅 (8개 함수)
// ============================================================================

/**
 * 간단한 라우터 생성
 * @returns {object} 라우터 객체
 */
function createRouter() {
  const routes = {};

  return {
    get: (path, handler) => {
      routes[`GET:${path}`] = handler;
    },
    post: (path, handler) => {
      routes[`POST:${path}`] = handler;
    },
    put: (path, handler) => {
      routes[`PUT:${path}`] = handler;
    },
    delete: (path, handler) => {
      routes[`DELETE:${path}`] = handler;
    },
    patch: (path, handler) => {
      routes[`PATCH:${path}`] = handler;
    },
    all: (path, handler) => {
      for (const method of ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']) {
        routes[`${method}:${path}`] = handler;
      }
    },
    handle: (req, res) => {
      const key = `${req.method}:${req.url}`;
      const handler = routes[key];
      if (handler) {
        handler(req, res);
      } else {
        res.statusCode = 404;
        res.end('Not Found');
      }
    },
    routes: () => Object.keys(routes)
  };
}

/**
 * 경로 매칭 (정확)
 * @param {string} pattern - 패턴
 * @param {string} path - 경로
 * @returns {boolean}
 */
function matchPath(pattern, path) {
  return pattern === path;
}

/**
 * 경로 매칭 (와일드카드)
 * @param {string} pattern - 패턴 (예: /api/:id)
 * @param {string} path - 경로
 * @returns {object|null} {id: "123", ...} 또는 null
 */
function matchPathParams(pattern, path) {
  const patternParts = pattern.split('/').filter(p => p);
  const pathParts = path.split('/').filter(p => p);

  if (patternParts.length !== pathParts.length) return null;

  const params = {};
  for (let i = 0; i < patternParts.length; i++) {
    const part = patternParts[i];
    if (part.startsWith(':')) {
      params[part.substring(1)] = pathParts[i];
    } else if (part !== pathParts[i]) {
      return null;
    }
  }

  return params;
}

// ============================================================================
// Module Exports
// ============================================================================

module.exports = {
  // HTTP Client (12개)
  get,
  post,
  put,
  deleteRequest,
  patch,
  head,
  options,
  request,
  postJson,
  postForm,

  // HTTP Server (15개)
  createServer,
  createSecureServer,
  setStatus,
  setHeaders,
  sendJson,
  sendText,
  sendHtml,
  redirect,
  sendFile,
  sendError,
  parseQuery,
  parseUrl,
  readBody,
  readJsonBody,

  // 라우팅 (8개)
  createRouter,
  matchPath,
  matchPathParams
};
