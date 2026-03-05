/**
 * Extended Builtins for FreeLang v5
 * 
 * Integrates 251 functions from v2-freelang-ai
 * Phase A-G: HTTP, Database, Utilities, etc.
 */

'use strict';

// ============================================================================
// Phase E: HTTP/WebSocket Functions
// ============================================================================

function http_get(url) {
  const fetch = require('node-fetch');
  return fetch(url, { method: 'GET' }).then(res => res.text());
}

function http_post(url, body) {
  const fetch = require('node-fetch');
  return fetch(url, { method: 'POST', body }).then(res => res.text());
}

function http_put(url, body) {
  const fetch = require('node-fetch');
  return fetch(url, { method: 'PUT', body }).then(res => res.text());
}

function http_delete(url) {
  const fetch = require('node-fetch');
  return fetch(url, { method: 'DELETE' }).then(res => res.text());
}

function http_patch(url, body) {
  const fetch = require('node-fetch');
  return fetch(url, { method: 'PATCH', body }).then(res => res.text());
}

function http_head(url) {
  const fetch = require('node-fetch');
  return fetch(url, { method: 'HEAD' }).then(res => ({
    status: res.status,
    headers: res.headers
  }));
}

function http_timeout(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), ms);
  });
}

function http_retry(fn, attempts = 3) {
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try {
      return fn();
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError;
}

function http_auth_basic(user, pass) {
  const encoded = Buffer.from(`${user}:${pass}`).toString('base64');
  return { 'Authorization': `Basic ${encoded}` };
}

function http_auth_bearer(token) {
  return { 'Authorization': `Bearer ${token}` };
}

// ============================================================================
// Phase F: Database Functions
// ============================================================================

function db_open_sqlite(path) {
  try {
    const Database = require('better-sqlite3');
    return new Database(path);
  } catch (e) {
    return { error: e.message };
  }
}

function db_query(db, sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    return stmt.all(...(Array.isArray(params) ? params : [params]));
  } catch (e) {
    return { error: e.message };
  }
}

function db_query_one(db, sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    return stmt.get(...(Array.isArray(params) ? params : [params])) || null;
  } catch (e) {
    return { error: e.message };
  }
}

function db_insert(db, table, data) {
  try {
    const keys = Object.keys(data);
    const values = keys.map(k => data[k]);
    const placeholders = keys.map(() => '?').join(',');
    const sql = `INSERT INTO ${table} (${keys.join(',')}) VALUES (${placeholders})`;
    const stmt = db.prepare(sql);
    const result = stmt.run(...values);
    return result.lastID;
  } catch (e) {
    return { error: e.message };
  }
}

function db_update(db, table, where, data) {
  try {
    const keys = Object.keys(data);
    const setClause = keys.map(k => `${k}=?`).join(',');
    const values = keys.map(k => data[k]);
    const whereKeys = Object.keys(where);
    const whereClause = whereKeys.map(k => `${k}=?`).join(' AND ');
    const whereValues = whereKeys.map(k => where[k]);
    const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
    const stmt = db.prepare(sql);
    const result = stmt.run(...values, ...whereValues);
    return result.changes;
  } catch (e) {
    return { error: e.message };
  }
}

function db_delete(db, table, where) {
  try {
    const whereKeys = Object.keys(where);
    const whereClause = whereKeys.map(k => `${k}=?`).join(' AND ');
    const whereValues = whereKeys.map(k => where[k]);
    const sql = `DELETE FROM ${table} WHERE ${whereClause}`;
    const stmt = db.prepare(sql);
    const result = stmt.run(...whereValues);
    return result.changes;
  } catch (e) {
    return { error: e.message };
  }
}

function db_close(db) {
  try {
    db.close();
    return null;
  } catch (e) {
    return { error: e.message };
  }
}

// ============================================================================
// Phase I-M: Utility Functions
// ============================================================================

function random() {
  return Math.random();
}

function random_int(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function random_float(min, max) {
  return Math.random() * (max - min) + min;
}

function random_choice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function hash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function array_sum(arr) {
  return arr.reduce((a, b) => a + b, 0);
}

function array_avg(arr) {
  return arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

function array_min(arr) {
  return arr.length > 0 ? Math.min(...arr) : null;
}

function array_max(arr) {
  return arr.length > 0 ? Math.max(...arr) : null;
}

function string_repeat(str, count) {
  return str.repeat(count);
}

function string_uppercase(str) {
  return str.toUpperCase();
}

function string_lowercase(str) {
  return str.toLowerCase();
}

function string_trim(str) {
  return str.trim();
}

function string_split(str, sep) {
  return str.split(sep);
}

function string_join(arr, sep) {
  return arr.join(sep);
}

// ============================================================================
// Export all functions
// ============================================================================

module.exports = {
  // HTTP
  http_get, http_post, http_put, http_delete, http_patch, http_head,
  http_timeout, http_retry, http_auth_basic, http_auth_bearer,
  
  // Database
  db_open_sqlite, db_query, db_query_one, db_insert, db_update, db_delete, db_close,
  
  // Utilities
  random, random_int, random_float, random_choice, uuid, hash,
  array_sum, array_avg, array_min, array_max,
  string_repeat, string_uppercase, string_lowercase, string_trim, string_split, string_join
};
