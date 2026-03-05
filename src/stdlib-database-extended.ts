/**
 * FreeLang v2 - Database Extended Functions (150개)
 *
 * 고급 데이터베이스 기능:
 * - 쿼리 빌더 (30개)
 * - 마이그레이션 (20개)
 * - SQLite 확장 (20개)
 * - Redis (30개)
 * - 트랜잭션/풀 (25개)
 * - NoSQL (25개)
 */

import { NativeFunctionRegistry } from './vm/native-function-registry';

/**
 * 확장 데이터베이스 함수 등록
 */
export function registerDatabaseExtendedFunctions(registry: NativeFunctionRegistry): void {
  // ════════════════════════════════════════════════════════════════
  // 파트 1: 쿼리 빌더 (30개)
  // ════════════════════════════════════════════════════════════════

  registry.register({
    name: 'qb_select',
    module: 'database',
    executor: (args) => {
      const columns = args[0] || '*';
      return { type: 'select', columns };
    }
  });

  registry.register({
    name: 'qb_from',
    module: 'database',
    executor: (args) => {
      const table = args[0];
      return { type: 'from', table };
    }
  });

  registry.register({
    name: 'qb_where',
    module: 'database',
    executor: (args) => {
      const column = args[0];
      const operator = args[1];
      const value = args[2];
      return { type: 'where', column, operator, value };
    }
  });

  registry.register({
    name: 'qb_and',
    module: 'database',
    executor: (args) => {
      const column = args[0];
      const operator = args[1];
      const value = args[2];
      return { type: 'and', column, operator, value };
    }
  });

  registry.register({
    name: 'qb_or',
    module: 'database',
    executor: (args) => {
      const column = args[0];
      const operator = args[1];
      const value = args[2];
      return { type: 'or', column, operator, value };
    }
  });

  registry.register({
    name: 'qb_not',
    module: 'database',
    executor: (args) => {
      const condition = args[0];
      return { type: 'not', condition };
    }
  });

  registry.register({
    name: 'qb_in',
    module: 'database',
    executor: (args) => {
      const column = args[0];
      const values = args[1];
      return { type: 'in', column, values };
    }
  });

  registry.register({
    name: 'qb_not_in',
    module: 'database',
    executor: (args) => {
      const column = args[0];
      const values = args[1];
      return { type: 'not_in', column, values };
    }
  });

  registry.register({
    name: 'qb_like',
    module: 'database',
    executor: (args) => {
      const column = args[0];
      const pattern = args[1];
      return { type: 'like', column, pattern };
    }
  });

  registry.register({
    name: 'qb_not_like',
    module: 'database',
    executor: (args) => {
      const column = args[0];
      const pattern = args[1];
      return { type: 'not_like', column, pattern };
    }
  });

  registry.register({
    name: 'qb_between',
    module: 'database',
    executor: (args) => {
      const column = args[0];
      const start = args[1];
      const end = args[2];
      return { type: 'between', column, start, end };
    }
  });

  registry.register({
    name: 'qb_is_null',
    module: 'database',
    executor: (args) => {
      const column = args[0];
      return { type: 'is_null', column };
    }
  });

  registry.register({
    name: 'qb_is_not_null',
    module: 'database',
    executor: (args) => {
      const column = args[0];
      return { type: 'is_not_null', column };
    }
  });

  registry.register({
    name: 'qb_join',
    module: 'database',
    executor: (args) => {
      const table = args[0];
      const condition = args[1];
      return { type: 'join', table, condition };
    }
  });

  registry.register({
    name: 'qb_left_join',
    module: 'database',
    executor: (args) => {
      const table = args[0];
      const condition = args[1];
      return { type: 'left_join', table, condition };
    }
  });

  registry.register({
    name: 'qb_right_join',
    module: 'database',
    executor: (args) => {
      const table = args[0];
      const condition = args[1];
      return { type: 'right_join', table, condition };
    }
  });

  registry.register({
    name: 'qb_full_join',
    module: 'database',
    executor: (args) => {
      const table = args[0];
      const condition = args[1];
      return { type: 'full_join', table, condition };
    }
  });

  registry.register({
    name: 'qb_cross_join',
    module: 'database',
    executor: (args) => {
      const table = args[0];
      return { type: 'cross_join', table };
    }
  });

  registry.register({
    name: 'qb_group_by',
    module: 'database',
    executor: (args) => {
      const columns = args[0];
      return { type: 'group_by', columns };
    }
  });

  registry.register({
    name: 'qb_having',
    module: 'database',
    executor: (args) => {
      const condition = args[0];
      return { type: 'having', condition };
    }
  });

  registry.register({
    name: 'qb_order_by',
    module: 'database',
    executor: (args) => {
      const column = args[0];
      const direction = args[1] || 'ASC';
      return { type: 'order_by', column, direction };
    }
  });

  registry.register({
    name: 'qb_limit',
    module: 'database',
    executor: (args) => {
      const limit = args[0];
      return { type: 'limit', limit };
    }
  });

  registry.register({
    name: 'qb_offset',
    module: 'database',
    executor: (args) => {
      const offset = args[0];
      return { type: 'offset', offset };
    }
  });

  registry.register({
    name: 'qb_distinct',
    module: 'database',
    executor: (args) => {
      return { type: 'distinct' };
    }
  });

  registry.register({
    name: 'qb_count',
    module: 'database',
    executor: (args) => {
      const column = args[0] || '*';
      return { type: 'count', column };
    }
  });

  registry.register({
    name: 'qb_sum',
    module: 'database',
    executor: (args) => {
      const column = args[0];
      return { type: 'sum', column };
    }
  });

  registry.register({
    name: 'qb_avg',
    module: 'database',
    executor: (args) => {
      const column = args[0];
      return { type: 'avg', column };
    }
  });

  registry.register({
    name: 'qb_min',
    module: 'database',
    executor: (args) => {
      const column = args[0];
      return { type: 'min', column };
    }
  });

  registry.register({
    name: 'qb_max',
    module: 'database',
    executor: (args) => {
      const column = args[0];
      return { type: 'max', column };
    }
  });

  registry.register({
    name: 'qb_subquery',
    module: 'database',
    executor: (args) => {
      const query = args[0];
      const alias = args[1];
      return { type: 'subquery', query, alias };
    }
  });

  // ════════════════════════════════════════════════════════════════
  // 파트 2: 마이그레이션 (20개)
  // ════════════════════════════════════════════════════════════════

  registry.register({
    name: 'migration_create',
    module: 'database',
    executor: (args) => {
      const name = args[0];
      return { type: 'migration_create', name, timestamp: Date.now() };
    }
  });

  registry.register({
    name: 'migration_run',
    module: 'database',
    executor: (args) => {
      const migrationName = args[0];
      return { type: 'migration_run', migrationName };
    }
  });

  registry.register({
    name: 'migration_rollback',
    module: 'database',
    executor: (args) => {
      const steps = args[0] || 1;
      return { type: 'migration_rollback', steps };
    }
  });

  registry.register({
    name: 'migration_status',
    module: 'database',
    executor: (args) => {
      return { type: 'migration_status' };
    }
  });

  registry.register({
    name: 'migration_reset',
    module: 'database',
    executor: (args) => {
      return { type: 'migration_reset' };
    }
  });

  registry.register({
    name: 'migration_list',
    module: 'database',
    executor: (args) => {
      return { type: 'migration_list' };
    }
  });

  registry.register({
    name: 'migration_plan',
    module: 'database',
    executor: (args) => {
      return { type: 'migration_plan' };
    }
  });

  registry.register({
    name: 'schema_create_table',
    module: 'database',
    executor: (args) => {
      const tableName = args[0];
      const definition = args[1];
      return { type: 'schema_create_table', tableName, definition };
    }
  });

  registry.register({
    name: 'schema_alter_table',
    module: 'database',
    executor: (args) => {
      const tableName = args[0];
      const operations = args[1];
      return { type: 'schema_alter_table', tableName, operations };
    }
  });

  registry.register({
    name: 'schema_drop_table',
    module: 'database',
    executor: (args) => {
      const tableName = args[0];
      const ifExists = args[1] || true;
      return { type: 'schema_drop_table', tableName, ifExists };
    }
  });

  registry.register({
    name: 'schema_add_column',
    module: 'database',
    executor: (args) => {
      const tableName = args[0];
      const columnName = args[1];
      const columnType = args[2];
      return { type: 'schema_add_column', tableName, columnName, columnType };
    }
  });

  registry.register({
    name: 'schema_drop_column',
    module: 'database',
    executor: (args) => {
      const tableName = args[0];
      const columnName = args[1];
      return { type: 'schema_drop_column', tableName, columnName };
    }
  });

  registry.register({
    name: 'schema_rename_column',
    module: 'database',
    executor: (args) => {
      const tableName = args[0];
      const oldName = args[1];
      const newName = args[2];
      return { type: 'schema_rename_column', tableName, oldName, newName };
    }
  });

  registry.register({
    name: 'schema_create_index',
    module: 'database',
    executor: (args) => {
      const indexName = args[0];
      const tableName = args[1];
      const columns = args[2];
      const isUnique = args[3] || false;
      return { type: 'schema_create_index', indexName, tableName, columns, isUnique };
    }
  });

  registry.register({
    name: 'schema_drop_index',
    module: 'database',
    executor: (args) => {
      const indexName = args[0];
      return { type: 'schema_drop_index', indexName };
    }
  });

  registry.register({
    name: 'schema_create_foreign_key',
    module: 'database',
    executor: (args) => {
      const fkName = args[0];
      const tableName = args[1];
      const columnName = args[2];
      const refTable = args[3];
      const refColumn = args[4];
      return { type: 'schema_create_foreign_key', fkName, tableName, columnName, refTable, refColumn };
    }
  });

  registry.register({
    name: 'schema_drop_foreign_key',
    module: 'database',
    executor: (args) => {
      const fkName = args[0];
      return { type: 'schema_drop_foreign_key', fkName };
    }
  });

  registry.register({
    name: 'schema_add_constraint',
    module: 'database',
    executor: (args) => {
      const constraintName = args[0];
      const tableName = args[1];
      const definition = args[2];
      return { type: 'schema_add_constraint', constraintName, tableName, definition };
    }
  });

  registry.register({
    name: 'schema_drop_constraint',
    module: 'database',
    executor: (args) => {
      const constraintName = args[0];
      const tableName = args[1];
      return { type: 'schema_drop_constraint', constraintName, tableName };
    }
  });

  registry.register({
    name: 'schema_info',
    module: 'database',
    executor: (args) => {
      const tableName = args[0];
      return { type: 'schema_info', tableName };
    }
  });

  // ════════════════════════════════════════════════════════════════
  // 파트 3: SQLite 확장 (20개)
  // ════════════════════════════════════════════════════════════════

  registry.register({
    name: 'sqlite_attach',
    module: 'database',
    executor: (args) => {
      const dbPath = args[0];
      const alias = args[1];
      return { type: 'sqlite_attach', dbPath, alias };
    }
  });

  registry.register({
    name: 'sqlite_detach',
    module: 'database',
    executor: (args) => {
      const alias = args[0];
      return { type: 'sqlite_detach', alias };
    }
  });

  registry.register({
    name: 'sqlite_vacuum',
    module: 'database',
    executor: (args) => {
      return { type: 'sqlite_vacuum' };
    }
  });

  registry.register({
    name: 'sqlite_analyze',
    module: 'database',
    executor: (args) => {
      const tableName = args[0];
      return { type: 'sqlite_analyze', tableName };
    }
  });

  registry.register({
    name: 'sqlite_pragma',
    module: 'database',
    executor: (args) => {
      const pragma = args[0];
      const value = args[1];
      return { type: 'sqlite_pragma', pragma, value };
    }
  });

  registry.register({
    name: 'sqlite_wal_mode',
    module: 'database',
    executor: (args) => {
      const enable = args[0] !== false;
      return { type: 'sqlite_wal_mode', enable };
    }
  });

  registry.register({
    name: 'sqlite_fts_create',
    module: 'database',
    executor: (args) => {
      const tableName = args[0];
      const columns = args[1];
      return { type: 'sqlite_fts_create', tableName, columns };
    }
  });

  registry.register({
    name: 'sqlite_fts_insert',
    module: 'database',
    executor: (args) => {
      const tableName = args[0];
      const data = args[1];
      return { type: 'sqlite_fts_insert', tableName, data };
    }
  });

  registry.register({
    name: 'sqlite_fts_search',
    module: 'database',
    executor: (args) => {
      const tableName = args[0];
      const query = args[1];
      return { type: 'sqlite_fts_search', tableName, query };
    }
  });

  registry.register({
    name: 'sqlite_json_field',
    module: 'database',
    executor: (args) => {
      const column = args[0];
      const path = args[1];
      return { type: 'sqlite_json_field', column, path };
    }
  });

  registry.register({
    name: 'sqlite_regex',
    module: 'database',
    executor: (args) => {
      const column = args[0];
      const pattern = args[1];
      return { type: 'sqlite_regex', column, pattern };
    }
  });

  registry.register({
    name: 'sqlite_aggregate',
    module: 'database',
    executor: (args) => {
      const funcName = args[0];
      const stepFunc = args[1];
      const finalFunc = args[2];
      return { type: 'sqlite_aggregate', funcName, stepFunc, finalFunc };
    }
  });

  registry.register({
    name: 'sqlite_window_func',
    module: 'database',
    executor: (args) => {
      const funcName = args[0];
      const definition = args[1];
      return { type: 'sqlite_window_func', funcName, definition };
    }
  });

  registry.register({
    name: 'sqlite_explain',
    module: 'database',
    executor: (args) => {
      const sql = args[0];
      return { type: 'sqlite_explain', sql };
    }
  });

  registry.register({
    name: 'sqlite_trace',
    module: 'database',
    executor: (args) => {
      const callback = args[0];
      return { type: 'sqlite_trace', callback };
    }
  });

  registry.register({
    name: 'sqlite_profile',
    module: 'database',
    executor: (args) => {
      const callback = args[0];
      return { type: 'sqlite_profile', callback };
    }
  });

  registry.register({
    name: 'sqlite_hook',
    module: 'database',
    executor: (args) => {
      const hookType = args[0]; // 'update', 'insert', 'delete'
      const callback = args[1];
      return { type: 'sqlite_hook', hookType, callback };
    }
  });

  registry.register({
    name: 'sqlite_extension_load',
    module: 'database',
    executor: (args) => {
      const extensionPath = args[0];
      const entryPoint = args[1];
      return { type: 'sqlite_extension_load', extensionPath, entryPoint };
    }
  });

  registry.register({
    name: 'sqlite_checkpoint',
    module: 'database',
    executor: (args) => {
      const mode = args[0] || 'PASSIVE';
      return { type: 'sqlite_checkpoint', mode };
    }
  });

  registry.register({
    name: 'sqlite_integrity_check',
    module: 'database',
    executor: (args) => {
      return { type: 'sqlite_integrity_check' };
    }
  });

  // ════════════════════════════════════════════════════════════════
  // 파트 4: Redis (30개)
  // ════════════════════════════════════════════════════════════════

  registry.register({
    name: 'redis_connect',
    module: 'database',
    executor: (args) => {
      const host = args[0] || 'localhost';
      const port = args[1] || 6379;
      return { type: 'redis_connect', host, port };
    }
  });

  registry.register({
    name: 'redis_get',
    module: 'database',
    executor: (args) => {
      const key = args[0];
      return { type: 'redis_get', key };
    }
  });

  registry.register({
    name: 'redis_set',
    module: 'database',
    executor: (args) => {
      const key = args[0];
      const value = args[1];
      const ttl = args[2];
      return { type: 'redis_set', key, value, ttl };
    }
  });

  registry.register({
    name: 'redis_del',
    module: 'database',
    executor: (args) => {
      const keys = args[0];
      return { type: 'redis_del', keys };
    }
  });

  registry.register({
    name: 'redis_exists',
    module: 'database',
    executor: (args) => {
      const key = args[0];
      return { type: 'redis_exists', key };
    }
  });

  registry.register({
    name: 'redis_expire',
    module: 'database',
    executor: (args) => {
      const key = args[0];
      const seconds = args[1];
      return { type: 'redis_expire', key, seconds };
    }
  });

  registry.register({
    name: 'redis_ttl',
    module: 'database',
    executor: (args) => {
      const key = args[0];
      return { type: 'redis_ttl', key };
    }
  });

  registry.register({
    name: 'redis_incr',
    module: 'database',
    executor: (args) => {
      const key = args[0];
      return { type: 'redis_incr', key };
    }
  });

  registry.register({
    name: 'redis_decr',
    module: 'database',
    executor: (args) => {
      const key = args[0];
      return { type: 'redis_decr', key };
    }
  });

  registry.register({
    name: 'redis_append',
    module: 'database',
    executor: (args) => {
      const key = args[0];
      const value = args[1];
      return { type: 'redis_append', key, value };
    }
  });

  registry.register({
    name: 'redis_lpush',
    module: 'database',
    executor: (args) => {
      const key = args[0];
      const values = args[1];
      return { type: 'redis_lpush', key, values };
    }
  });

  registry.register({
    name: 'redis_rpush',
    module: 'database',
    executor: (args) => {
      const key = args[0];
      const values = args[1];
      return { type: 'redis_rpush', key, values };
    }
  });

  registry.register({
    name: 'redis_lpop',
    module: 'database',
    executor: (args) => {
      const key = args[0];
      const count = args[1] || 1;
      return { type: 'redis_lpop', key, count };
    }
  });

  registry.register({
    name: 'redis_rpop',
    module: 'database',
    executor: (args) => {
      const key = args[0];
      const count = args[1] || 1;
      return { type: 'redis_rpop', key, count };
    }
  });

  registry.register({
    name: 'redis_lrange',
    module: 'database',
    executor: (args) => {
      const key = args[0];
      const start = args[1];
      const stop = args[2];
      return { type: 'redis_lrange', key, start, stop };
    }
  });

  registry.register({
    name: 'redis_sadd',
    module: 'database',
    executor: (args) => {
      const key = args[0];
      const members = args[1];
      return { type: 'redis_sadd', key, members };
    }
  });

  registry.register({
    name: 'redis_srem',
    module: 'database',
    executor: (args) => {
      const key = args[0];
      const members = args[1];
      return { type: 'redis_srem', key, members };
    }
  });

  registry.register({
    name: 'redis_smembers',
    module: 'database',
    executor: (args) => {
      const key = args[0];
      return { type: 'redis_smembers', key };
    }
  });

  registry.register({
    name: 'redis_sismember',
    module: 'database',
    executor: (args) => {
      const key = args[0];
      const member = args[1];
      return { type: 'redis_sismember', key, member };
    }
  });

  registry.register({
    name: 'redis_hset',
    module: 'database',
    executor: (args) => {
      const key = args[0];
      const field = args[1];
      const value = args[2];
      return { type: 'redis_hset', key, field, value };
    }
  });

  registry.register({
    name: 'redis_hget',
    module: 'database',
    executor: (args) => {
      const key = args[0];
      const field = args[1];
      return { type: 'redis_hget', key, field };
    }
  });

  registry.register({
    name: 'redis_hdel',
    module: 'database',
    executor: (args) => {
      const key = args[0];
      const fields = args[1];
      return { type: 'redis_hdel', key, fields };
    }
  });

  registry.register({
    name: 'redis_hgetall',
    module: 'database',
    executor: (args) => {
      const key = args[0];
      return { type: 'redis_hgetall', key };
    }
  });

  registry.register({
    name: 'redis_zadd',
    module: 'database',
    executor: (args) => {
      const key = args[0];
      const score = args[1];
      const member = args[2];
      return { type: 'redis_zadd', key, score, member };
    }
  });

  registry.register({
    name: 'redis_zrange',
    module: 'database',
    executor: (args) => {
      const key = args[0];
      const start = args[1];
      const stop = args[2];
      const withScores = args[3] || false;
      return { type: 'redis_zrange', key, start, stop, withScores };
    }
  });

  registry.register({
    name: 'redis_zscore',
    module: 'database',
    executor: (args) => {
      const key = args[0];
      const member = args[1];
      return { type: 'redis_zscore', key, member };
    }
  });

  registry.register({
    name: 'redis_publish',
    module: 'database',
    executor: (args) => {
      const channel = args[0];
      const message = args[1];
      return { type: 'redis_publish', channel, message };
    }
  });

  registry.register({
    name: 'redis_subscribe',
    module: 'database',
    executor: (args) => {
      const channels = args[0];
      const callback = args[1];
      return { type: 'redis_subscribe', channels, callback };
    }
  });

  registry.register({
    name: 'redis_pipeline',
    module: 'database',
    executor: (args) => {
      const commands = args[0];
      return { type: 'redis_pipeline', commands };
    }
  });

  registry.register({
    name: 'redis_multi',
    module: 'database',
    executor: (args) => {
      return { type: 'redis_multi' };
    }
  });

  // ════════════════════════════════════════════════════════════════
  // 파트 5: 트랜잭션/풀 (25개)
  // ════════════════════════════════════════════════════════════════

  registry.register({
    name: 'tx_begin',
    module: 'database',
    executor: (args) => {
      const isolationLevel = args[0] || 'READ_COMMITTED';
      return { type: 'tx_begin', isolationLevel };
    }
  });

  registry.register({
    name: 'tx_commit',
    module: 'database',
    executor: (args) => {
      return { type: 'tx_commit' };
    }
  });

  registry.register({
    name: 'tx_rollback',
    module: 'database',
    executor: (args) => {
      return { type: 'tx_rollback' };
    }
  });

  registry.register({
    name: 'tx_savepoint',
    module: 'database',
    executor: (args) => {
      const savepointName = args[0];
      return { type: 'tx_savepoint', savepointName };
    }
  });

  registry.register({
    name: 'tx_release_savepoint',
    module: 'database',
    executor: (args) => {
      const savepointName = args[0];
      return { type: 'tx_release_savepoint', savepointName };
    }
  });

  registry.register({
    name: 'tx_rollback_to',
    module: 'database',
    executor: (args) => {
      const savepointName = args[0];
      return { type: 'tx_rollback_to', savepointName };
    }
  });

  registry.register({
    name: 'pool_create',
    module: 'database',
    executor: (args) => {
      const config = args[0];
      return { type: 'pool_create', config };
    }
  });

  registry.register({
    name: 'pool_acquire',
    module: 'database',
    executor: (args) => {
      return { type: 'pool_acquire' };
    }
  });

  registry.register({
    name: 'pool_release',
    module: 'database',
    executor: (args) => {
      const connection = args[0];
      return { type: 'pool_release', connection };
    }
  });

  registry.register({
    name: 'pool_destroy',
    module: 'database',
    executor: (args) => {
      return { type: 'pool_destroy' };
    }
  });

  registry.register({
    name: 'pool_size',
    module: 'database',
    executor: (args) => {
      return { type: 'pool_size' };
    }
  });

  registry.register({
    name: 'pool_idle',
    module: 'database',
    executor: (args) => {
      return { type: 'pool_idle' };
    }
  });

  registry.register({
    name: 'pool_wait',
    module: 'database',
    executor: (args) => {
      return { type: 'pool_wait' };
    }
  });

  registry.register({
    name: 'conn_ping',
    module: 'database',
    executor: (args) => {
      return { type: 'conn_ping' };
    }
  });

  registry.register({
    name: 'conn_reconnect',
    module: 'database',
    executor: (args) => {
      return { type: 'conn_reconnect' };
    }
  });

  registry.register({
    name: 'conn_is_alive',
    module: 'database',
    executor: (args) => {
      return { type: 'conn_is_alive' };
    }
  });

  registry.register({
    name: 'conn_execute_batch',
    module: 'database',
    executor: (args) => {
      const statements = args[0];
      return { type: 'conn_execute_batch', statements };
    }
  });

  registry.register({
    name: 'conn_prepare',
    module: 'database',
    executor: (args) => {
      const sql = args[0];
      return { type: 'conn_prepare', sql };
    }
  });

  registry.register({
    name: 'prepared_execute',
    module: 'database',
    executor: (args) => {
      const statement = args[0];
      const params = args[1];
      return { type: 'prepared_execute', statement, params };
    }
  });

  registry.register({
    name: 'prepared_bind',
    module: 'database',
    executor: (args) => {
      const statement = args[0];
      const paramIndex = args[1];
      const value = args[2];
      return { type: 'prepared_bind', statement, paramIndex, value };
    }
  });

  registry.register({
    name: 'cursor_open',
    module: 'database',
    executor: (args) => {
      const query = args[0];
      return { type: 'cursor_open', query };
    }
  });

  registry.register({
    name: 'cursor_next',
    module: 'database',
    executor: (args) => {
      const cursor = args[0];
      return { type: 'cursor_next', cursor };
    }
  });

  registry.register({
    name: 'cursor_fetch',
    module: 'database',
    executor: (args) => {
      const cursor = args[0];
      const count = args[1] || 1;
      return { type: 'cursor_fetch', cursor, count };
    }
  });

  registry.register({
    name: 'cursor_close',
    module: 'database',
    executor: (args) => {
      const cursor = args[0];
      return { type: 'cursor_close', cursor };
    }
  });

  registry.register({
    name: 'cursor_all',
    module: 'database',
    executor: (args) => {
      const cursor = args[0];
      return { type: 'cursor_all', cursor };
    }
  });

  // ════════════════════════════════════════════════════════════════
  // 파트 6: NoSQL (25개)
  // ════════════════════════════════════════════════════════════════

  registry.register({
    name: 'mongo_connect',
    module: 'database',
    executor: (args) => {
      const uri = args[0] || 'mongodb://localhost:27017';
      return { type: 'mongo_connect', uri };
    }
  });

  registry.register({
    name: 'mongo_find',
    module: 'database',
    executor: (args) => {
      const collection = args[0];
      const query = args[1];
      return { type: 'mongo_find', collection, query };
    }
  });

  registry.register({
    name: 'mongo_find_one',
    module: 'database',
    executor: (args) => {
      const collection = args[0];
      const query = args[1];
      return { type: 'mongo_find_one', collection, query };
    }
  });

  registry.register({
    name: 'mongo_insert',
    module: 'database',
    executor: (args) => {
      const collection = args[0];
      const document = args[1];
      return { type: 'mongo_insert', collection, document };
    }
  });

  registry.register({
    name: 'mongo_update',
    module: 'database',
    executor: (args) => {
      const collection = args[0];
      const query = args[1];
      const update = args[2];
      return { type: 'mongo_update', collection, query, update };
    }
  });

  registry.register({
    name: 'mongo_delete',
    module: 'database',
    executor: (args) => {
      const collection = args[0];
      const query = args[1];
      return { type: 'mongo_delete', collection, query };
    }
  });

  registry.register({
    name: 'mongo_aggregate',
    module: 'database',
    executor: (args) => {
      const collection = args[0];
      const pipeline = args[1];
      return { type: 'mongo_aggregate', collection, pipeline };
    }
  });

  registry.register({
    name: 'mongo_index_create',
    module: 'database',
    executor: (args) => {
      const collection = args[0];
      const fieldName = args[1];
      const isUnique = args[2] || false;
      return { type: 'mongo_index_create', collection, fieldName, isUnique };
    }
  });

  registry.register({
    name: 'mongo_index_drop',
    module: 'database',
    executor: (args) => {
      const collection = args[0];
      const indexName = args[1];
      return { type: 'mongo_index_drop', collection, indexName };
    }
  });

  registry.register({
    name: 'mongo_count',
    module: 'database',
    executor: (args) => {
      const collection = args[0];
      const query = args[1];
      return { type: 'mongo_count', collection, query };
    }
  });

  registry.register({
    name: 'mongo_distinct',
    module: 'database',
    executor: (args) => {
      const collection = args[0];
      const field = args[1];
      const query = args[2];
      return { type: 'mongo_distinct', collection, field, query };
    }
  });

  registry.register({
    name: 'influx_write',
    module: 'database',
    executor: (args) => {
      const measurement = args[0];
      const tags = args[1];
      const fields = args[2];
      const timestamp = args[3];
      return { type: 'influx_write', measurement, tags, fields, timestamp };
    }
  });

  registry.register({
    name: 'influx_query',
    module: 'database',
    executor: (args) => {
      const query = args[0];
      return { type: 'influx_query', query };
    }
  });

  registry.register({
    name: 'elastic_index',
    module: 'database',
    executor: (args) => {
      const indexName = args[0];
      const document = args[1];
      return { type: 'elastic_index', indexName, document };
    }
  });

  registry.register({
    name: 'elastic_search',
    module: 'database',
    executor: (args) => {
      const indexName = args[0];
      const query = args[1];
      return { type: 'elastic_search', indexName, query };
    }
  });

  registry.register({
    name: 'elastic_delete',
    module: 'database',
    executor: (args) => {
      const indexName = args[0];
      const documentId = args[1];
      return { type: 'elastic_delete', indexName, documentId };
    }
  });

  registry.register({
    name: 'elastic_update',
    module: 'database',
    executor: (args) => {
      const indexName = args[0];
      const documentId = args[1];
      const update = args[2];
      return { type: 'elastic_update', indexName, documentId, update };
    }
  });

  registry.register({
    name: 'elastic_bulk',
    module: 'database',
    executor: (args) => {
      const operations = args[0];
      return { type: 'elastic_bulk', operations };
    }
  });

  registry.register({
    name: 'cassandra_query',
    module: 'database',
    executor: (args) => {
      const query = args[0];
      const params = args[1];
      return { type: 'cassandra_query', query, params };
    }
  });

  registry.register({
    name: 'dynamo_get',
    module: 'database',
    executor: (args) => {
      const tableName = args[0];
      const key = args[1];
      return { type: 'dynamo_get', tableName, key };
    }
  });

  registry.register({
    name: 'dynamo_put',
    module: 'database',
    executor: (args) => {
      const tableName = args[0];
      const item = args[1];
      return { type: 'dynamo_put', tableName, item };
    }
  });

  registry.register({
    name: 'dynamo_delete',
    module: 'database',
    executor: (args) => {
      const tableName = args[0];
      const key = args[1];
      return { type: 'dynamo_delete', tableName, key };
    }
  });

  registry.register({
    name: 'dynamo_query',
    module: 'database',
    executor: (args) => {
      const tableName = args[0];
      const query = args[1];
      return { type: 'dynamo_query', tableName, query };
    }
  });

  registry.register({
    name: 'dynamo_scan',
    module: 'database',
    executor: (args) => {
      const tableName = args[0];
      const filters = args[1];
      return { type: 'dynamo_scan', tableName, filters };
    }
  });

  registry.register({
    name: 'dynamo_batch',
    module: 'database',
    executor: (args) => {
      const operations = args[0];
      return { type: 'dynamo_batch', operations };
    }
  });
}

/**
 * 데이터베이스 함수 통계
 */
export const STDLIB_DATABASE_EXTENDED_STATS = {
  totalFunctions: 150,
  categories: {
    'Query Builder': 30,
    'Migration': 20,
    'SQLite Extended': 20,
    'Redis': 30,
    'Transaction/Pool': 25,
    'NoSQL': 25
  },
  module: 'database'
};
