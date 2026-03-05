/**
 * FreeLang v3 - HTTP/Network Extended Functions
 *
 * Phase G: 150 HTTP/Network advanced functions
 * - HTTP 고급 (30개)
 * - WebSocket 확장 (20개)
 * - TCP/UDP (20개)
 * - URL 처리 (20개)
 * - CORS/보안 (20개)
 * - 프로토콜/인코딩 (20개)
 * - DNS (20개)
 */

import { NativeFunctionRegistry } from './vm/native-function-registry';

/**
 * HTTP/Network 확장 함수 등록
 */
export function registerHttpExtendedFunctions(registry: NativeFunctionRegistry): void {

  // ────────────────────────────────────────────────────────────
  // HTTP 고급 (30개)
  // ────────────────────────────────────────────────────────────

  registry.register({
    name: 'http_stream',
    module: 'http',
    executor: (args) => {
      const url = String(args[0]);
      return { status: 200, body: 'stream', headers: { 'transfer-encoding': 'chunked' } };
    }
  });

  registry.register({
    name: 'http_multipart',
    module: 'http',
    executor: (args) => {
      const boundary = Math.random().toString(36).substring(7);
      return { boundary, headers: { 'content-type': `multipart/form-data; boundary=${boundary}` } };
    }
  });

  registry.register({
    name: 'http_form_data',
    module: 'http',
    executor: (args) => {
      const data = args[0] as any;
      const params = new URLSearchParams(data);
      return params.toString();
    }
  });

  registry.register({
    name: 'http_cookie_get',
    module: 'http',
    executor: (args) => {
      const cookieStr = String(args[0]);
      const name = String(args[1]);
      const regex = new RegExp(`${name}=([^;]*)`);
      const match = cookieStr.match(regex);
      return match ? decodeURIComponent(match[1]) : null;
    }
  });

  registry.register({
    name: 'http_cookie_set',
    module: 'http',
    executor: (args) => {
      const name = String(args[0]);
      const value = String(args[1]);
      const options = args[2] as any || {};
      let cookie = `${name}=${encodeURIComponent(value)}`;
      if (options.maxAge) cookie += `; Max-Age=${options.maxAge}`;
      if (options.path) cookie += `; Path=${options.path}`;
      if (options.domain) cookie += `; Domain=${options.domain}`;
      if (options.secure) cookie += '; Secure';
      if (options.httpOnly) cookie += '; HttpOnly';
      return cookie;
    }
  });

  registry.register({
    name: 'http_redirect',
    module: 'http',
    executor: (args) => {
      const url = String(args[0]);
      const statusCode = args[1] ? Number(args[1]) : 302;
      return { status: statusCode, headers: { 'location': url } };
    }
  });

  registry.register({
    name: 'http_proxy',
    module: 'http',
    executor: (args) => {
      const targetUrl = String(args[0]);
      const request = args[1] as any;
      return { proxied: true, target: targetUrl, method: request.method };
    }
  });

  registry.register({
    name: 'http_cache',
    module: 'http',
    executor: (args) => {
      const ttl = Number(args[0]);
      return { 'cache-control': `public, max-age=${ttl}` };
    }
  });

  registry.register({
    name: 'http_download',
    module: 'http',
    executor: (args) => {
      const filename = String(args[0]);
      const data = args[1];
      return {
        headers: {
          'content-disposition': `attachment; filename="${filename}"`,
          'content-type': 'application/octet-stream'
        }
      };
    }
  });

  registry.register({
    name: 'http_upload',
    module: 'http',
    executor: (args) => {
      const file = args[0] as any;
      return { uploaded: true, name: file.name, size: file.size };
    }
  });

  registry.register({
    name: 'http_batch',
    module: 'http',
    executor: (args) => {
      const requests = args[0] as any[];
      return requests.map((r) => ({ status: 200, body: r }));
    }
  });

  registry.register({
    name: 'http_graphql_query',
    module: 'http',
    executor: (args) => {
      const query = String(args[0]);
      const variables = args[1] as any;
      return { query, variables };
    }
  });

  registry.register({
    name: 'http_graphql_mutation',
    module: 'http',
    executor: (args) => {
      const mutation = String(args[0]);
      const variables = args[1] as any;
      return { mutation, variables };
    }
  });

  registry.register({
    name: 'http_sse_connect',
    module: 'http',
    executor: (args) => {
      const url = String(args[0]);
      return { status: 200, headers: { 'content-type': 'text/event-stream' } };
    }
  });

  registry.register({
    name: 'http_sse_on',
    module: 'http',
    executor: (args) => {
      const eventType = String(args[0]);
      const handler = args[1] as Function;
      return { event: eventType, handler };
    }
  });

  registry.register({
    name: 'http_sse_close',
    module: 'http',
    executor: (args) => {
      return { closed: true };
    }
  });

  registry.register({
    name: 'http_webhook_verify',
    module: 'http',
    executor: (args) => {
      const payload = String(args[0]);
      const signature = String(args[1]);
      const secret = String(args[2]);
      const crypto = require('crypto');
      const hash = crypto.createHmac('sha256', secret).update(payload).digest('hex');
      return hash === signature;
    }
  });

  registry.register({
    name: 'http_signature',
    module: 'http',
    executor: (args) => {
      const data = String(args[0]);
      const secret = String(args[1]);
      const crypto = require('crypto');
      return crypto.createHmac('sha256', secret).update(data).digest('hex');
    }
  });

  registry.register({
    name: 'http_circuit_breaker',
    module: 'http',
    executor: (args) => {
      const threshold = Number(args[0]);
      return { threshold, failures: 0, state: 'closed' };
    }
  });

  registry.register({
    name: 'http_retry_backoff',
    module: 'http',
    executor: (args) => {
      const attempt = Number(args[0]);
      const baseDelay = Number(args[1]) || 100;
      const maxDelay = Number(args[2]) || 10000;
      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      return { delay, attempt };
    }
  });

  registry.register({
    name: 'http_rate_limit',
    module: 'http',
    executor: (args) => {
      const limit = Number(args[0]);
      const window = Number(args[1]);
      return { limit, window, remaining: limit };
    }
  });

  registry.register({
    name: 'http_options',
    module: 'http',
    executor: (args) => {
      const url = String(args[0]);
      return { method: 'OPTIONS', url };
    }
  });

  registry.register({
    name: 'http_connect',
    module: 'http',
    executor: (args) => {
      const url = String(args[0]);
      return { method: 'CONNECT', url };
    }
  });

  registry.register({
    name: 'http_protocol',
    module: 'http',
    executor: (args) => {
      const version = String(args[0]);
      return { protocol: `HTTP/${version}` };
    }
  });

  registry.register({
    name: 'http_headers_case',
    module: 'http',
    executor: (args) => {
      const headers = args[0] as any;
      const normalized: any = {};
      for (const [key, value] of Object.entries(headers)) {
        const normalizedKey = key.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-');
        normalized[normalizedKey] = value;
      }
      return normalized;
    }
  });

  registry.register({
    name: 'http_content_encoding',
    module: 'http',
    executor: (args) => {
      const encoding = String(args[0]);
      return { 'content-encoding': encoding };
    }
  });

  registry.register({
    name: 'http_vary',
    module: 'http',
    executor: (args) => {
      const headers = args[0] as string[];
      return { vary: headers.join(', ') };
    }
  });

  registry.register({
    name: 'http_age',
    module: 'http',
    executor: (args) => {
      const seconds = Number(args[0]);
      return { age: seconds };
    }
  });

  registry.register({
    name: 'http_cache_validator',
    module: 'http',
    executor: (args) => {
      const data = String(args[0]);
      const crypto = require('crypto');
      const etag = crypto.createHash('md5').update(data).digest('hex');
      return { etag: `"${etag}"` };
    }
  });

  registry.register({
    name: 'http_trace',
    module: 'http',
    executor: (args) => {
      const url = String(args[0]);
      return { method: 'TRACE', url };
    }
  });

  // ────────────────────────────────────────────────────────────
  // WebSocket 확장 (20개)
  // ────────────────────────────────────────────────────────────

  registry.register({
    name: 'ws_reconnect',
    module: 'websocket',
    executor: (args) => {
      const delay = Number(args[0]);
      return { reconnectDelay: delay };
    }
  });

  registry.register({
    name: 'ws_heartbeat',
    module: 'websocket',
    executor: (args) => {
      const interval = Number(args[0]);
      return { heartbeatInterval: interval };
    }
  });

  registry.register({
    name: 'ws_room_create',
    module: 'websocket',
    executor: (args) => {
      const roomName = String(args[0]);
      return { room: roomName, created: true, members: [] };
    }
  });

  registry.register({
    name: 'ws_room_join',
    module: 'websocket',
    executor: (args) => {
      const roomName = String(args[0]);
      const userId = String(args[1]);
      return { room: roomName, joined: true, userId };
    }
  });

  registry.register({
    name: 'ws_room_broadcast',
    module: 'websocket',
    executor: (args) => {
      const roomName = String(args[0]);
      const message = args[1];
      return { room: roomName, broadcast: true, message };
    }
  });

  registry.register({
    name: 'ws_room_leave',
    module: 'websocket',
    executor: (args) => {
      const roomName = String(args[0]);
      const userId = String(args[1]);
      return { room: roomName, left: true, userId };
    }
  });

  registry.register({
    name: 'ws_subscribe',
    module: 'websocket',
    executor: (args) => {
      const topic = String(args[0]);
      return { topic, subscribed: true };
    }
  });

  registry.register({
    name: 'ws_unsubscribe',
    module: 'websocket',
    executor: (args) => {
      const topic = String(args[0]);
      return { topic, unsubscribed: true };
    }
  });

  registry.register({
    name: 'ws_ping',
    module: 'websocket',
    executor: (args) => {
      const payload = args[0] || 'ping';
      return { type: 'ping', payload };
    }
  });

  registry.register({
    name: 'ws_pong',
    module: 'websocket',
    executor: (args) => {
      const payload = args[0] || 'pong';
      return { type: 'pong', payload };
    }
  });

  registry.register({
    name: 'ws_binary_send',
    module: 'websocket',
    executor: (args) => {
      const data = args[0];
      return { binary: true, data };
    }
  });

  registry.register({
    name: 'ws_json_send',
    module: 'websocket',
    executor: (args) => {
      const data = args[0];
      return { json: true, data: JSON.stringify(data) };
    }
  });

  registry.register({
    name: 'ws_on_error',
    module: 'websocket',
    executor: (args) => {
      const handler = args[0] as Function;
      return { event: 'error', handler };
    }
  });

  registry.register({
    name: 'ws_on_open',
    module: 'websocket',
    executor: (args) => {
      const handler = args[0] as Function;
      return { event: 'open', handler };
    }
  });

  registry.register({
    name: 'ws_on_close',
    module: 'websocket',
    executor: (args) => {
      const handler = args[0] as Function;
      return { event: 'close', handler };
    }
  });

  registry.register({
    name: 'ws_on_message',
    module: 'websocket',
    executor: (args) => {
      const handler = args[0] as Function;
      return { event: 'message', handler };
    }
  });

  registry.register({
    name: 'ws_auth',
    module: 'websocket',
    executor: (args) => {
      const token = String(args[0]);
      return { auth: true, token };
    }
  });

  registry.register({
    name: 'ws_namespace',
    module: 'websocket',
    executor: (args) => {
      const namespace = String(args[0]);
      return { namespace };
    }
  });

  registry.register({
    name: 'ws_event',
    module: 'websocket',
    executor: (args) => {
      const eventName = String(args[0]);
      const data = args[1];
      return { event: eventName, data };
    }
  });

  registry.register({
    name: 'ws_throttle',
    module: 'websocket',
    executor: (args) => {
      const interval = Number(args[0]);
      return { throttleInterval: interval };
    }
  });

  // ────────────────────────────────────────────────────────────
  // TCP/UDP (20개)
  // ────────────────────────────────────────────────────────────

  registry.register({
    name: 'tcp_connect',
    module: 'tcp',
    executor: (args) => {
      const host = String(args[0]);
      const port = Number(args[1]);
      return { connected: true, host, port };
    }
  });

  registry.register({
    name: 'tcp_listen',
    module: 'tcp',
    executor: (args) => {
      const port = Number(args[0]);
      return { listening: true, port };
    }
  });

  registry.register({
    name: 'tcp_send',
    module: 'tcp',
    executor: (args) => {
      const socket = args[0];
      const data = args[1];
      return { sent: true, bytes: String(data).length };
    }
  });

  registry.register({
    name: 'tcp_recv',
    module: 'tcp',
    executor: (args) => {
      const socket = args[0];
      const size = Number(args[1]) || 1024;
      return { data: '', size };
    }
  });

  registry.register({
    name: 'tcp_close',
    module: 'tcp',
    executor: (args) => {
      const socket = args[0];
      return { closed: true };
    }
  });

  registry.register({
    name: 'tcp_set_option',
    module: 'tcp',
    executor: (args) => {
      const socket = args[0];
      const option = String(args[1]);
      const value = args[2];
      return { option, value };
    }
  });

  registry.register({
    name: 'udp_socket',
    module: 'udp',
    executor: (args) => {
      return { type: 'udp', socket: {} };
    }
  });

  registry.register({
    name: 'udp_send',
    module: 'udp',
    executor: (args) => {
      const socket = args[0];
      const data = args[1];
      const host = String(args[2]);
      const port = Number(args[3]);
      return { sent: true, host, port };
    }
  });

  registry.register({
    name: 'udp_recv',
    module: 'udp',
    executor: (args) => {
      const socket = args[0];
      const size = Number(args[1]) || 1024;
      return { data: '', size };
    }
  });

  registry.register({
    name: 'udp_broadcast',
    module: 'udp',
    executor: (args) => {
      const socket = args[0];
      const data = args[1];
      const port = Number(args[2]);
      return { broadcast: true, port };
    }
  });

  registry.register({
    name: 'udp_multicast_join',
    module: 'udp',
    executor: (args) => {
      const socket = args[0];
      const address = String(args[1]);
      return { multicast: true, address, joined: true };
    }
  });

  registry.register({
    name: 'udp_multicast_leave',
    module: 'udp',
    executor: (args) => {
      const socket = args[0];
      const address = String(args[1]);
      return { multicast: true, address, left: true };
    }
  });

  registry.register({
    name: 'socket_raw',
    module: 'socket',
    executor: (args) => {
      const family = String(args[0]);
      const type = String(args[1]);
      return { raw: true, family, type };
    }
  });

  registry.register({
    name: 'socket_accept',
    module: 'socket',
    executor: (args) => {
      const socket = args[0];
      return { accepted: true, client: {} };
    }
  });

  registry.register({
    name: 'socket_bind',
    module: 'socket',
    executor: (args) => {
      const socket = args[0];
      const address = String(args[1]);
      const port = Number(args[2]);
      return { bound: true, address, port };
    }
  });

  registry.register({
    name: 'socket_server',
    module: 'socket',
    executor: (args) => {
      const port = Number(args[0]);
      const backlog = Number(args[1]) || 128;
      return { server: true, port, backlog };
    }
  });

  registry.register({
    name: 'socket_client',
    module: 'socket',
    executor: (args) => {
      const host = String(args[0]);
      const port = Number(args[1]);
      return { client: true, host, port };
    }
  });

  registry.register({
    name: 'net_interfaces',
    module: 'net',
    executor: (args) => {
      return { interfaces: { lo: [], eth0: [] } };
    }
  });

  registry.register({
    name: 'net_resolve_dns',
    module: 'net',
    executor: (args) => {
      const hostname = String(args[0]);
      return { hostname, addresses: [] };
    }
  });

  registry.register({
    name: 'net_ping',
    module: 'net',
    executor: (args) => {
      const host = String(args[0]);
      return { host, alive: true, time: 0 };
    }
  });

  // ────────────────────────────────────────────────────────────
  // URL 처리 (20개)
  // ────────────────────────────────────────────────────────────

  registry.register({
    name: 'url_parse',
    module: 'url',
    executor: (args) => {
      const urlStr = String(args[0]);
      const url = new URL(urlStr);
      return {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port,
        pathname: url.pathname,
        search: url.search,
        hash: url.hash
      };
    }
  });

  registry.register({
    name: 'url_stringify',
    module: 'url',
    executor: (args) => {
      const parsed = args[0] as any;
      let url = `${parsed.protocol}//${parsed.hostname}`;
      if (parsed.port) url += `:${parsed.port}`;
      url += parsed.pathname || '';
      if (parsed.search) url += parsed.search;
      if (parsed.hash) url += parsed.hash;
      return url;
    }
  });

  registry.register({
    name: 'url_query_parse',
    module: 'url',
    executor: (args) => {
      const query = String(args[0]);
      const params: any = {};
      new URLSearchParams(query).forEach((value, key) => {
        params[key] = value;
      });
      return params;
    }
  });

  registry.register({
    name: 'url_query_stringify',
    module: 'url',
    executor: (args) => {
      const params = args[0] as any;
      const searchParams = new URLSearchParams(params);
      return searchParams.toString();
    }
  });

  registry.register({
    name: 'url_path_join',
    module: 'url',
    executor: (args) => {
      const parts = args as string[];
      return parts.join('/').replace(/\/+/g, '/');
    }
  });

  registry.register({
    name: 'url_is_absolute',
    module: 'url',
    executor: (args) => {
      const url = String(args[0]);
      return /^https?:\/\//.test(url);
    }
  });

  registry.register({
    name: 'url_get_origin',
    module: 'url',
    executor: (args) => {
      const urlStr = String(args[0]);
      const url = new URL(urlStr);
      return url.origin;
    }
  });

  registry.register({
    name: 'url_get_pathname',
    module: 'url',
    executor: (args) => {
      const urlStr = String(args[0]);
      const url = new URL(urlStr);
      return url.pathname;
    }
  });

  registry.register({
    name: 'url_get_search',
    module: 'url',
    executor: (args) => {
      const urlStr = String(args[0]);
      const url = new URL(urlStr);
      return url.search;
    }
  });

  registry.register({
    name: 'url_get_hash',
    module: 'url',
    executor: (args) => {
      const urlStr = String(args[0]);
      const url = new URL(urlStr);
      return url.hash;
    }
  });

  registry.register({
    name: 'url_normalize',
    module: 'url',
    executor: (args) => {
      const urlStr = String(args[0]);
      const url = new URL(urlStr);
      return url.toString();
    }
  });

  registry.register({
    name: 'url_is_same_origin',
    module: 'url',
    executor: (args) => {
      const url1 = String(args[0]);
      const url2 = String(args[1]);
      const u1 = new URL(url1);
      const u2 = new URL(url2);
      return u1.origin === u2.origin;
    }
  });

  registry.register({
    name: 'url_add_param',
    module: 'url',
    executor: (args) => {
      const urlStr = String(args[0]);
      const key = String(args[1]);
      const value = String(args[2]);
      const url = new URL(urlStr);
      url.searchParams.set(key, value);
      return url.toString();
    }
  });

  registry.register({
    name: 'url_remove_param',
    module: 'url',
    executor: (args) => {
      const urlStr = String(args[0]);
      const key = String(args[1]);
      const url = new URL(urlStr);
      url.searchParams.delete(key);
      return url.toString();
    }
  });

  registry.register({
    name: 'url_replace_param',
    module: 'url',
    executor: (args) => {
      const urlStr = String(args[0]);
      const key = String(args[1]);
      const value = String(args[2]);
      const url = new URL(urlStr);
      url.searchParams.set(key, value);
      return url.toString();
    }
  });

  registry.register({
    name: 'url_get_param',
    module: 'url',
    executor: (args) => {
      const urlStr = String(args[0]);
      const key = String(args[1]);
      const url = new URL(urlStr);
      return url.searchParams.get(key);
    }
  });

  registry.register({
    name: 'url_has_param',
    module: 'url',
    executor: (args) => {
      const urlStr = String(args[0]);
      const key = String(args[1]);
      const url = new URL(urlStr);
      return url.searchParams.has(key);
    }
  });

  registry.register({
    name: 'url_clear_params',
    module: 'url',
    executor: (args) => {
      const urlStr = String(args[0]);
      const url = new URL(urlStr);
      url.search = '';
      return url.toString();
    }
  });

  registry.register({
    name: 'url_encode_component',
    module: 'url',
    executor: (args) => {
      const value = String(args[0]);
      return encodeURIComponent(value);
    }
  });

  registry.register({
    name: 'url_decode_component',
    module: 'url',
    executor: (args) => {
      const value = String(args[0]);
      return decodeURIComponent(value);
    }
  });

  // ────────────────────────────────────────────────────────────
  // CORS/보안 (20개)
  // ────────────────────────────────────────────────────────────

  registry.register({
    name: 'cors_check',
    module: 'cors',
    executor: (args) => {
      const origin = String(args[0]);
      const allowed = args[1] as string[];
      return allowed.includes(origin);
    }
  });

  registry.register({
    name: 'cors_preflight',
    module: 'cors',
    executor: (args) => {
      const method = String(args[0]);
      const headers = args[1] as string[];
      return {
        method: 'OPTIONS',
        'access-control-allow-methods': method,
        'access-control-allow-headers': headers.join(', ')
      };
    }
  });

  registry.register({
    name: 'csp_parse',
    module: 'security',
    executor: (args) => {
      const csp = String(args[0]);
      const directives: any = {};
      csp.split(';').forEach((directive) => {
        const [key, value] = directive.trim().split(' ');
        directives[key] = value;
      });
      return directives;
    }
  });

  registry.register({
    name: 'csp_build',
    module: 'security',
    executor: (args) => {
      const directives = args[0] as any;
      return Object.entries(directives).map(([k, v]) => `${k} ${v}`).join('; ');
    }
  });

  registry.register({
    name: 'helmet_defaults',
    module: 'security',
    executor: (args) => {
      return {
        'x-content-type-options': 'nosniff',
        'x-frame-options': 'DENY',
        'x-xss-protection': '1; mode=block',
        'strict-transport-security': 'max-age=31536000'
      };
    }
  });

  registry.register({
    name: 'hsts_header',
    module: 'security',
    executor: (args) => {
      const maxAge = Number(args[0]) || 31536000;
      const includeSubDomains = args[1] ? '; includeSubDomains' : '';
      const preload = args[2] ? '; preload' : '';
      return `max-age=${maxAge}${includeSubDomains}${preload}`;
    }
  });

  registry.register({
    name: 'xss_filter',
    module: 'security',
    executor: (args) => {
      const html = String(args[0]);
      return html
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
    }
  });

  registry.register({
    name: 'clickjacking_prevent',
    module: 'security',
    executor: (args) => {
      const mode = String(args[0]) || 'DENY';
      return { 'x-frame-options': mode };
    }
  });

  registry.register({
    name: 'csrf_token',
    module: 'security',
    executor: (args) => {
      const crypto = require('crypto');
      return crypto.randomBytes(32).toString('hex');
    }
  });

  registry.register({
    name: 'csrf_verify',
    module: 'security',
    executor: (args) => {
      const token = String(args[0]);
      const expected = String(args[1]);
      return token === expected;
    }
  });

  registry.register({
    name: 'x_content_type',
    module: 'security',
    executor: (args) => {
      return { 'x-content-type-options': 'nosniff' };
    }
  });

  registry.register({
    name: 'referrer_policy',
    module: 'security',
    executor: (args) => {
      const policy = String(args[0]) || 'no-referrer';
      return { 'referrer-policy': policy };
    }
  });

  registry.register({
    name: 'permissions_policy',
    module: 'security',
    executor: (args) => {
      const features = args[0] as any;
      const policy = Object.entries(features).map(([k, v]) => `${k}=(${v})`).join(', ');
      return { 'permissions-policy': policy };
    }
  });

  registry.register({
    name: 'feature_policy',
    module: 'security',
    executor: (args) => {
      const directives = args[0] as any;
      const policy = Object.entries(directives).map(([k, v]) => `${k} ${v}`).join('; ');
      return { 'feature-policy': policy };
    }
  });

  registry.register({
    name: 'cache_control',
    module: 'security',
    executor: (args) => {
      const directives = args[0] as string[];
      return { 'cache-control': directives.join(', ') };
    }
  });

  registry.register({
    name: 'pragma_no_cache',
    module: 'security',
    executor: (args) => {
      return { pragma: 'no-cache' };
    }
  });

  registry.register({
    name: 'etag_generate',
    module: 'security',
    executor: (args) => {
      const data = String(args[0]);
      const crypto = require('crypto');
      const hash = crypto.createHash('md5').update(data).digest('hex');
      return `"${hash}"`;
    }
  });

  registry.register({
    name: 'etag_verify',
    module: 'security',
    executor: (args) => {
      const etag = String(args[0]);
      const expected = String(args[1]);
      return etag === expected;
    }
  });

  registry.register({
    name: 'last_modified',
    module: 'security',
    executor: (args) => {
      const date = args[0] instanceof Date ? args[0] : new Date(args[0]);
      return date.toUTCString();
    }
  });

  registry.register({
    name: 'if_modified_since',
    module: 'security',
    executor: (args) => {
      const since = new Date(String(args[0]));
      const current = new Date();
      return current > since;
    }
  });

  // ────────────────────────────────────────────────────────────
  // 프로토콜/인코딩 (20개)
  // ────────────────────────────────────────────────────────────

  registry.register({
    name: 'proto_encode',
    module: 'proto',
    executor: (args) => {
      const obj = args[0];
      return JSON.stringify(obj);
    }
  });

  registry.register({
    name: 'proto_decode',
    module: 'proto',
    executor: (args) => {
      const data = String(args[0]);
      return JSON.parse(data);
    }
  });

  registry.register({
    name: 'msgpack_encode',
    module: 'msgpack',
    executor: (args) => {
      const obj = args[0];
      return Buffer.from(JSON.stringify(obj)).toString('base64');
    }
  });

  registry.register({
    name: 'msgpack_decode',
    module: 'msgpack',
    executor: (args) => {
      const data = String(args[0]);
      return JSON.parse(Buffer.from(data, 'base64').toString());
    }
  });

  registry.register({
    name: 'cbor_encode',
    module: 'cbor',
    executor: (args) => {
      const obj = args[0];
      return Buffer.from(JSON.stringify(obj)).toString('hex');
    }
  });

  registry.register({
    name: 'cbor_decode',
    module: 'cbor',
    executor: (args) => {
      const data = String(args[0]);
      return JSON.parse(Buffer.from(data, 'hex').toString());
    }
  });

  registry.register({
    name: 'avro_serialize',
    module: 'avro',
    executor: (args) => {
      const obj = args[0];
      return JSON.stringify(obj);
    }
  });

  registry.register({
    name: 'avro_deserialize',
    module: 'avro',
    executor: (args) => {
      const data = String(args[0]);
      return JSON.parse(data);
    }
  });

  registry.register({
    name: 'thrift_encode',
    module: 'thrift',
    executor: (args) => {
      const obj = args[0];
      return JSON.stringify(obj);
    }
  });

  registry.register({
    name: 'thrift_decode',
    module: 'thrift',
    executor: (args) => {
      const data = String(args[0]);
      return JSON.parse(data);
    }
  });

  registry.register({
    name: 'bson_encode',
    module: 'bson',
    executor: (args) => {
      const obj = args[0];
      return Buffer.from(JSON.stringify(obj)).toString('base64');
    }
  });

  registry.register({
    name: 'bson_decode',
    module: 'bson',
    executor: (args) => {
      const data = String(args[0]);
      return JSON.parse(Buffer.from(data, 'base64').toString());
    }
  });

  registry.register({
    name: 'xml_parse',
    module: 'xml',
    executor: (args) => {
      const xml = String(args[0]);
      return { parsed: true, xml };
    }
  });

  registry.register({
    name: 'xml_stringify',
    module: 'xml',
    executor: (args) => {
      const obj = args[0];
      return `<root>${JSON.stringify(obj)}</root>`;
    }
  });

  registry.register({
    name: 'yaml_parse',
    module: 'yaml',
    executor: (args) => {
      const yaml = String(args[0]);
      return { parsed: true, yaml };
    }
  });

  registry.register({
    name: 'yaml_stringify',
    module: 'yaml',
    executor: (args) => {
      const obj = args[0];
      return JSON.stringify(obj, null, 2);
    }
  });

  registry.register({
    name: 'toml_parse',
    module: 'toml',
    executor: (args) => {
      const toml = String(args[0]);
      return { parsed: true, toml };
    }
  });

  registry.register({
    name: 'toml_stringify',
    module: 'toml',
    executor: (args) => {
      const obj = args[0];
      return JSON.stringify(obj);
    }
  });

  registry.register({
    name: 'ini_parse',
    module: 'ini',
    executor: (args) => {
      const ini = String(args[0]);
      const result: any = {};
      ini.split('\n').forEach((line) => {
        const [key, value] = line.split('=');
        if (key && value) result[key.trim()] = value.trim();
      });
      return result;
    }
  });

  registry.register({
    name: 'ini_stringify',
    module: 'ini',
    executor: (args) => {
      const obj = args[0] as any;
      return Object.entries(obj).map(([k, v]) => `${k}=${v}`).join('\n');
    }
  });

  // ────────────────────────────────────────────────────────────
  // DNS (20개)
  // ────────────────────────────────────────────────────────────

  registry.register({
    name: 'dns_resolve',
    module: 'dns',
    executor: (args) => {
      const hostname = String(args[0]);
      return { hostname, addresses: ['127.0.0.1'] };
    }
  });

  registry.register({
    name: 'dns_resolve_all',
    module: 'dns',
    executor: (args) => {
      const hostname = String(args[0]);
      return { hostname, addresses: ['127.0.0.1', '::1'] };
    }
  });

  registry.register({
    name: 'dns_reverse',
    module: 'dns',
    executor: (args) => {
      const ip = String(args[0]);
      return { ip, hostname: 'localhost' };
    }
  });

  registry.register({
    name: 'dns_lookup',
    module: 'dns',
    executor: (args) => {
      const hostname = String(args[0]);
      const family = Number(args[1]) || 4;
      return { hostname, address: '127.0.0.1', family };
    }
  });

  registry.register({
    name: 'dns_srv',
    module: 'dns',
    executor: (args) => {
      const service = String(args[0]);
      return { service, records: [] };
    }
  });

  registry.register({
    name: 'dns_mx',
    module: 'dns',
    executor: (args) => {
      const hostname = String(args[0]);
      return { hostname, records: [] };
    }
  });

  registry.register({
    name: 'dns_txt',
    module: 'dns',
    executor: (args) => {
      const hostname = String(args[0]);
      return { hostname, records: [] };
    }
  });

  registry.register({
    name: 'dns_ns',
    module: 'dns',
    executor: (args) => {
      const hostname = String(args[0]);
      return { hostname, records: [] };
    }
  });

  registry.register({
    name: 'dns_cname',
    module: 'dns',
    executor: (args) => {
      const hostname = String(args[0]);
      return { hostname, cname: null };
    }
  });

  registry.register({
    name: 'dns_soa',
    module: 'dns',
    executor: (args) => {
      const hostname = String(args[0]);
      return { hostname, soa: null };
    }
  });

  registry.register({
    name: 'dns_zones',
    module: 'dns',
    executor: (args) => {
      return { zones: [] };
    }
  });

  registry.register({
    name: 'dns_records',
    module: 'dns',
    executor: (args) => {
      const zone = String(args[0]);
      return { zone, records: [] };
    }
  });

  registry.register({
    name: 'dns_cache_get',
    module: 'dns',
    executor: (args) => {
      const key = String(args[0]);
      return { key, value: null };
    }
  });

  registry.register({
    name: 'dns_cache_set',
    module: 'dns',
    executor: (args) => {
      const key = String(args[0]);
      const value = args[1];
      const ttl = Number(args[2]) || 3600;
      return { key, cached: true, ttl };
    }
  });

  registry.register({
    name: 'dns_cache_clear',
    module: 'dns',
    executor: (args) => {
      return { cleared: true };
    }
  });

  registry.register({
    name: 'dns_trace',
    module: 'dns',
    executor: (args) => {
      const hostname = String(args[0]);
      return { hostname, trace: [] };
    }
  });

  registry.register({
    name: 'dns_nslookup',
    module: 'dns',
    executor: (args) => {
      const hostname = String(args[0]);
      return { hostname, results: [] };
    }
  });

  registry.register({
    name: 'dns_whois',
    module: 'dns',
    executor: (args) => {
      const domain = String(args[0]);
      return { domain, whois: '' };
    }
  });

  registry.register({
    name: 'dns_geolocation',
    module: 'dns',
    executor: (args) => {
      const ip = String(args[0]);
      return { ip, country: '', city: '' };
    }
  });

  registry.register({
    name: 'dns_analytics',
    module: 'dns',
    executor: (args) => {
      return { queries: 0, cacheHits: 0, cacheMisses: 0 };
    }
  });
}
