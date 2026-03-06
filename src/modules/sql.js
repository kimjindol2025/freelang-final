/**
 * FreeLang sql Module: SQL 쿼리 빌더 + 유틸리티
 * 20개 함수 (쿼리 빌더, 이스케이프, 검증)
 */

// ============================================================================
// 쿼리 빌더 (8개 함수)
// ============================================================================

/**
 * SELECT 쿼리 빌더
 * @param {string[]} columns - 컬럼 목록
 * @param {string} table - 테이블명
 * @returns {object} 쿼리 빌더 객체
 */
function select(columns, table) {
  let query = `SELECT ${columns.join(', ')} FROM ${table}`;
  let conditions = [];
  let joins = [];
  let orderBy = null;
  let limit_ = null;

  return {
    where: (condition) => {
      conditions.push(condition);
      return arguments.callee.builder;
    },
    join: (joinClause) => {
      joins.push(joinClause);
      return arguments.callee.builder;
    },
    order: (column, direction = 'ASC') => {
      orderBy = `${column} ${direction}`;
      return arguments.callee.builder;
    },
    limit: (count) => {
      limit_ = count;
      return arguments.callee.builder;
    },
    build: () => {
      let sql = query;
      if (joins.length > 0) sql += ' ' + joins.join(' ');
      if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');
      if (orderBy) sql += ' ORDER BY ' + orderBy;
      if (limit_) sql += ' LIMIT ' + limit_;
      return sql;
    },
    builder: this
  };
}

/**
 * INSERT 쿼리 빌더
 * @param {string} table - 테이블명
 * @param {object} values - {column: value, ...}
 * @returns {string} INSERT 쿼리
 */
function insert(table, values) {
  const columns = Object.keys(values);
  const vals = columns.map(col => escapeValue(values[col]));
  return `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${vals.join(', ')})`;
}

/**
 * UPDATE 쿼리 빌더
 * @param {string} table - 테이블명
 * @param {object} values - {column: value, ...}
 * @param {string} condition - WHERE 조건
 * @returns {string} UPDATE 쿼리
 */
function update(table, values, condition) {
  const sets = Object.entries(values)
    .map(([col, val]) => `${col} = ${escapeValue(val)}`)
    .join(', ');
  return `UPDATE ${table} SET ${sets} WHERE ${condition}`;
}

/**
 * DELETE 쿼리 빌더
 * @param {string} table - 테이블명
 * @param {string} condition - WHERE 조건
 * @returns {string} DELETE 쿼리
 */
function deleteQuery(table, condition) {
  return `DELETE FROM ${table} WHERE ${condition}`;
}

/**
 * CREATE TABLE 쿼리
 * @param {string} table - 테이블명
 * @param {object} columns - {name: type, ...}
 * @returns {string}
 */
function createTable(table, columns) {
  const defs = Object.entries(columns)
    .map(([name, type]) => `${name} ${type}`)
    .join(', ');
  return `CREATE TABLE ${table} (${defs})`;
}

/**
 * DROP TABLE 쿼리
 * @param {string} table - 테이블명
 * @returns {string}
 */
function dropTable(table) {
  return `DROP TABLE ${table}`;
}

/**
 * ALTER TABLE 쿼리
 * @param {string} table - 테이블명
 * @param {string} alteration - ALTER 명령
 * @returns {string}
 */
function alterTable(table, alteration) {
  return `ALTER TABLE ${table} ${alteration}`;
}

// ============================================================================
// 이스케이프/검증 (7개 함수)
// ============================================================================

/**
 * SQL 값 이스케이프
 * @param {any} value - 값
 * @returns {string}
 */
function escapeValue(value) {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  if (typeof value === 'string') {
    return `'${value.replace(/'/g, "''")}'`;
  }
  if (typeof value === 'boolean') {
    return value ? '1' : '0';
  }
  return String(value);
}

/**
 * 식별자 이스케이프 (테이블명, 컬럼명)
 * @param {string} identifier - 식별자
 * @returns {string}
 */
function escapeIdentifier(identifier) {
  return `\`${identifier.replace(/`/g, '``')}\``;
}

/**
 * SQL 인젝션 방지용 와일드카드 이스케이프
 * @param {string} str - 문자열
 * @returns {string}
 */
function escapeLike(str) {
  return String(str).replace(/[%_]/g, '\\$&');
}

/**
 * 유효한 테이블명인지 확인
 * @param {string} table - 테이블명
 * @returns {boolean}
 */
function isValidTableName(table) {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(String(table));
}

/**
 * 유효한 컬럼명인지 확인
 * @param {string} column - 컬럼명
 * @returns {boolean}
 */
function isValidColumnName(column) {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(String(column));
}

/**
 * 위험한 쿼리 감지 (기본적인 SQL 인젝션 감지)
 * @param {string} query - SQL 쿼리
 * @returns {boolean} true면 위험함
 */
function hasSqlInjectionRisk(query) {
  const riskPatterns = [
    /;\s*(DROP|DELETE|TRUNCATE)/i,
    /--\s/,
    /\/\*/,
    /UNION\s+SELECT/i
  ];
  return riskPatterns.some(pattern => pattern.test(query));
}

/**
 * 쿼리 정규화 (여러 공백 제거)
 * @param {string} query - SQL 쿼리
 * @returns {string}
 */
function normalizeQuery(query) {
  return String(query).replace(/\s+/g, ' ').trim();
}

// ============================================================================
// 유틸리티 (5개 함수)
// ============================================================================

/**
 * WHERE 조건 생성기
 * @param {object} filters - {column: value, ...}
 * @returns {string}
 */
function buildWhere(filters) {
  return Object.entries(filters)
    .map(([col, val]) => `${col} = ${escapeValue(val)}`)
    .join(' AND ');
}

/**
 * IN 절 생성
 * @param {string} column - 컬럼명
 * @param {any[]} values - 값 배열
 * @returns {string}
 */
function buildIn(column, values) {
  const escaped = values.map(v => escapeValue(v)).join(', ');
  return `${column} IN (${escaped})`;
}

/**
 * BETWEEN 절 생성
 * @param {string} column - 컬럼명
 * @param {any} start - 시작값
 * @param {any} end - 종료값
 * @returns {string}
 */
function buildBetween(column, start, end) {
  return `${column} BETWEEN ${escapeValue(start)} AND ${escapeValue(end)}`;
}

/**
 * LIKE 절 생성
 * @param {string} column - 컬럼명
 * @param {string} pattern - 패턴
 * @returns {string}
 */
function buildLike(column, pattern) {
  return `${column} LIKE '${escapeLike(String(pattern))}'`;
}

/**
 * 배열을 INSERT 문으로 변환
 * @param {string} table - 테이블명
 * @param {object[]} rows - 행 배열
 * @returns {string}
 */
function bulkInsert(table, rows) {
  if (!rows || rows.length === 0) return '';

  const columns = Object.keys(rows[0]);
  const valuesList = rows.map(row => {
    const vals = columns.map(col => escapeValue(row[col]));
    return `(${vals.join(', ')})`;
  });

  return `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${valuesList.join(', ')}`;
}

// ============================================================================
// Module Exports
// ============================================================================

module.exports = {
  // 쿼리 빌더 (8개)
  select,
  insert,
  update,
  deleteQuery,
  createTable,
  dropTable,
  alterTable,

  // 이스케이프/검증 (7개)
  escapeValue,
  escapeIdentifier,
  escapeLike,
  isValidTableName,
  isValidColumnName,
  hasSqlInjectionRisk,
  normalizeQuery,

  // 유틸리티 (5개)
  buildWhere,
  buildIn,
  buildBetween,
  buildLike,
  bulkInsert
};
