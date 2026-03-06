/**
 * QueryBuilder - ORM/SQL Query Builder for freelang-final
 * Provides fluent interface for building SQL queries
 *
 * @author Claude
 * @version 1.0.0
 */

// sqlite3 is optional - only required for execute() method
let sqlite3;
try {
  sqlite3 = require('sqlite3').verbose();
} catch (e) {
  // sqlite3 not installed, only build() method will work
  sqlite3 = null;
}

class QueryBuilder {
  /**
   * Initialize QueryBuilder with table name and optional database
   * @param {string} table - Table name
   * @param {sqlite3.Database} db - SQLite database connection
   */
  constructor(table, db) {
    this.table = table;
    this.db = db;

    // Query state
    this.selectColumns = ['*'];
    this.whereConditions = [];
    this.joinClauses = [];
    this.orderByClause = null;
    this.limitClause = null;
    this.offsetClause = null;

    // State for mutations
    this.insertData = null;
    this.updateData = null;
    this.deleteMode = false;
    this.countMode = false;
  }

  /**
   * Specify columns to select
   * If no columns specified, defaults to *
   * @param {...string} columns - Column names
   * @returns {QueryBuilder} - this for chaining
   */
  select(...columns) {
    if (columns.length === 0) {
      this.selectColumns = ['*'];
    } else {
      this.selectColumns = columns.map(col => {
        // Handle table.column notation
        if (col.includes('.')) {
          return col;
        }
        // Qualify with table name if simple column name
        return col;
      });
    }
    return this;
  }

  /**
   * Add WHERE condition
   * First where() call replaces any previous conditions
   * @param {string} condition - WHERE condition (e.g., "id > 10")
   * @returns {QueryBuilder} - this for chaining
   */
  where(condition) {
    this.whereConditions = [condition];
    return this;
  }

  /**
   * Add AND WHERE condition
   * Must be called after where()
   * @param {string} condition - AND condition
   * @returns {QueryBuilder} - this for chaining
   */
  andWhere(condition) {
    if (this.whereConditions.length === 0) {
      this.whereConditions = [condition];
    } else {
      this.whereConditions.push(condition);
    }
    return this;
  }

  /**
   * Add OR WHERE condition
   * Wraps previous conditions in parentheses and ORs with new condition
   * @param {string} condition - OR condition
   * @returns {QueryBuilder} - this for chaining
   */
  orWhere(condition) {
    if (this.whereConditions.length === 0) {
      this.whereConditions = [condition];
    } else {
      // Wrap previous conditions in parentheses and OR with new condition
      const previous = this.whereConditions.join(' AND ');
      this.whereConditions = [`(${previous}) OR (${condition})`];
    }
    return this;
  }

  /**
   * INNER JOIN clause
   * @param {string} table - Table to join
   * @param {string} on - ON condition (e.g., "users.id = posts.user_id")
   * @returns {QueryBuilder} - this for chaining
   */
  join(table, on) {
    this.joinClauses.push({
      type: 'INNER JOIN',
      table: table,
      on: on
    });
    return this;
  }

  /**
   * LEFT JOIN clause
   * @param {string} table - Table to join
   * @param {string} on - ON condition
   * @returns {QueryBuilder} - this for chaining
   */
  leftJoin(table, on) {
    this.joinClauses.push({
      type: 'LEFT JOIN',
      table: table,
      on: on
    });
    return this;
  }

  /**
   * ORDER BY clause
   * @param {string} column - Column to order by
   * @param {string} direction - ASC or DESC (default: ASC)
   * @returns {QueryBuilder} - this for chaining
   */
  orderBy(column, direction = 'ASC') {
    const dir = direction.toUpperCase();
    if (!['ASC', 'DESC'].includes(dir)) {
      throw new Error(`Invalid order direction: ${direction}. Must be ASC or DESC`);
    }
    this.orderByClause = `${column} ${dir}`;
    return this;
  }

  /**
   * LIMIT clause
   * @param {number} n - Maximum number of rows to return
   * @returns {QueryBuilder} - this for chaining
   */
  limit(n) {
    if (!Number.isInteger(n) || n < 0) {
      throw new Error(`Invalid limit: ${n}. Must be a non-negative integer`);
    }
    this.limitClause = n;
    return this;
  }

  /**
   * OFFSET clause
   * @param {number} n - Number of rows to skip
   * @returns {QueryBuilder} - this for chaining
   */
  offset(n) {
    if (!Number.isInteger(n) || n < 0) {
      throw new Error(`Invalid offset: ${n}. Must be a non-negative integer`);
    }
    this.offsetClause = n;
    return this;
  }

  /**
   * Prepare for INSERT operation
   * @param {object} data - Object with column:value pairs
   * @returns {QueryBuilder} - this for chaining
   */
  insert(data) {
    if (typeof data !== 'object' || data === null) {
      throw new Error('Insert data must be a non-null object');
    }
    this.insertData = data;
    return this;
  }

  /**
   * Prepare for UPDATE operation
   * Must be called with where() to specify which rows to update
   * @param {object} data - Object with column:value pairs
   * @returns {QueryBuilder} - this for chaining
   */
  update(data) {
    if (typeof data !== 'object' || data === null) {
      throw new Error('Update data must be a non-null object');
    }
    this.updateData = data;
    return this;
  }

  /**
   * Prepare for DELETE operation
   * Must be called with where() to specify which rows to delete
   * @returns {QueryBuilder} - this for chaining
   */
  delete() {
    this.deleteMode = true;
    return this;
  }

  /**
   * Prepare COUNT query
   * @returns {QueryBuilder} - this for chaining
   */
  count() {
    this.countMode = true;
    return this;
  }

  /**
   * Build SQL query string
   * @returns {string} - SQL query string
   */
  build() {
    // Handle mutations first
    if (this.insertData !== null) {
      return this._buildInsert();
    }

    if (this.updateData !== null) {
      return this._buildUpdate();
    }

    if (this.deleteMode) {
      return this._buildDelete();
    }

    if (this.countMode) {
      return this._buildCount();
    }

    // Default: SELECT
    return this._buildSelect();
  }

  /**
   * Build SELECT query
   * @private
   * @returns {string} - SQL query string
   */
  _buildSelect() {
    let sql = 'SELECT ';

    // SELECT columns
    if (this.selectColumns.length === 1 && this.selectColumns[0] === '*') {
      sql += '*';
    } else {
      sql += this.selectColumns.join(', ');
    }

    // FROM table
    sql += ` FROM ${this.table}`;

    // JOINs
    for (const join of this.joinClauses) {
      sql += ` ${join.type} ${join.table} ON ${join.on}`;
    }

    // WHERE
    if (this.whereConditions.length > 0) {
      sql += ' WHERE ' + this.whereConditions.join(' AND ');
    }

    // ORDER BY
    if (this.orderByClause) {
      sql += ` ORDER BY ${this.orderByClause}`;
    }

    // LIMIT
    if (this.limitClause !== null) {
      sql += ` LIMIT ${this.limitClause}`;
    }

    // OFFSET
    if (this.offsetClause !== null) {
      sql += ` OFFSET ${this.offsetClause}`;
    }

    return sql;
  }

  /**
   * Build INSERT query
   * @private
   * @returns {string} - SQL query string
   */
  _buildInsert() {
    const columns = Object.keys(this.insertData);
    const values = columns.map(col => {
      const val = this.insertData[col];
      if (val === null || val === undefined) {
        return 'NULL';
      }
      if (typeof val === 'string') {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    });

    const sql = `INSERT INTO ${this.table} (${columns.join(', ')}) VALUES (${values.join(', ')})`;
    return sql;
  }

  /**
   * Build UPDATE query
   * @private
   * @returns {string} - SQL query string
   */
  _buildUpdate() {
    const setClauses = Object.entries(this.updateData).map(([col, val]) => {
      if (val === null || val === undefined) {
        return `${col} = NULL`;
      }
      if (typeof val === 'string') {
        return `${col} = "${val.replace(/"/g, '""')}"`;
      }
      return `${col} = ${val}`;
    });

    let sql = `UPDATE ${this.table} SET ${setClauses.join(', ')}`;

    // WHERE
    if (this.whereConditions.length > 0) {
      sql += ' WHERE ' + this.whereConditions.join(' AND ');
    }

    return sql;
  }

  /**
   * Build DELETE query
   * @private
   * @returns {string} - SQL query string
   */
  _buildDelete() {
    let sql = `DELETE FROM ${this.table}`;

    // WHERE
    if (this.whereConditions.length > 0) {
      sql += ' WHERE ' + this.whereConditions.join(' AND ');
    }

    return sql;
  }

  /**
   * Build COUNT query
   * @private
   * @returns {string} - SQL query string
   */
  _buildCount() {
    let sql = `SELECT COUNT(*) as count FROM ${this.table}`;

    // JOINs
    for (const join of this.joinClauses) {
      sql += ` ${join.type} ${join.table} ON ${join.on}`;
    }

    // WHERE
    if (this.whereConditions.length > 0) {
      sql += ' WHERE ' + this.whereConditions.join(' AND ');
    }

    return sql;
  }

  /**
   * Execute the query and return results
   * Requires database connection
   * @returns {Promise<any[]>} - Query results
   */
  async execute() {
    if (!this.db) {
      throw new Error('Database connection required to execute query');
    }

    const sql = this.build();

    return new Promise((resolve, reject) => {
      if (this.insertData !== null) {
        this.db.run(sql, (err) => {
          if (err) reject(err);
          else resolve({ success: true, lastID: this.lastID });
        });
      } else if (this.updateData !== null || this.deleteMode) {
        this.db.run(sql, (err) => {
          if (err) reject(err);
          else resolve({ success: true, changes: this.changes });
        });
      } else {
        this.db.all(sql, (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      }
    });
  }

  /**
   * Get first result only
   * @returns {Promise<any>} - First result or null
   */
  async first() {
    if (!this.db) {
      throw new Error('Database connection required to execute query');
    }

    const sql = this._buildSelect() + ' LIMIT 1';

    return new Promise((resolve, reject) => {
      this.db.get(sql, (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });
  }

  /**
   * Debug: Log the built query to console
   * @returns {string} - SQL query string
   */
  debug() {
    const sql = this.build();
    console.log('[QueryBuilder Debug]');
    console.log(sql);
    return sql;
  }
}

module.exports = QueryBuilder;
