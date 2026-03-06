/**
 * Test Suite for QueryBuilder
 * 8 comprehensive tests covering all functionality
 *
 * @author Claude
 * @version 1.0.0
 */

const QueryBuilder = require('./querybuilder');
const assert = require('assert');

// Color output helpers
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

let testsPassed = 0;
let testsFailed = 0;
let testResults = [];

/**
 * Test helper
 */
function test(name, fn) {
  try {
    fn();
    console.log(`${colors.green}✓${colors.reset} ${name}`);
    testsPassed++;
    testResults.push({ name, passed: true });
  } catch (err) {
    console.log(`${colors.red}✗${colors.reset} ${name}`);
    console.log(`  Error: ${err.message}`);
    testsFailed++;
    testResults.push({ name, passed: false, error: err.message });
  }
}

/**
 * Assert equality helper
 */
function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected "${expected}", got "${actual}"`);
  }
}

/**
 * Assert includes helper
 */
function assertIncludes(str, substring, message) {
  if (!str.includes(substring)) {
    throw new Error(message || `Expected string to include "${substring}", got "${str}"`);
  }
}

// ============================================================================
// TEST SUITE
// ============================================================================

console.log(`\n${colors.cyan}QueryBuilder Test Suite${colors.reset}\n`);

// T1: Basic SELECT
test('T1: Basic SELECT', () => {
  const qb = new QueryBuilder('users', null);
  const sql = qb.select('id', 'name', 'email').build();

  assertIncludes(sql, 'SELECT', 'Should contain SELECT');
  assertIncludes(sql, 'id', 'Should contain id column');
  assertIncludes(sql, 'name', 'Should contain name column');
  assertIncludes(sql, 'email', 'Should contain email column');
  assertIncludes(sql, 'FROM users', 'Should contain FROM users');

  assertEqual(sql, 'SELECT id, name, email FROM users', 'Full query should match');
});

// T2: WHERE conditions (single and multiple)
test('T2: WHERE conditions (single/multiple)', () => {
  // Single WHERE
  const qb1 = new QueryBuilder('users', null);
  const sql1 = qb1.where('age > 18').build();
  assertIncludes(sql1, 'WHERE age > 18', 'Should contain single WHERE');

  // Multiple WHERE with AND
  const qb2 = new QueryBuilder('users', null);
  const sql2 = qb2.where('age > 18').andWhere('status = "active"').build();
  assertIncludes(sql2, 'WHERE age > 18 AND status = "active"', 'Should contain AND condition');

  // OR condition
  const qb3 = new QueryBuilder('users', null);
  const sql3 = qb3.where('role = "admin"').orWhere('role = "moderator"').build();
  assertIncludes(sql3, 'OR', 'Should contain OR operator');
  assertIncludes(sql3, '(', 'Should contain parentheses for OR grouping');
});

// T3: JOINs (INNER and LEFT)
test('T3: JOINs (INNER/LEFT)', () => {
  // INNER JOIN
  const qb1 = new QueryBuilder('users', null);
  const sql1 = qb1
    .select('users.id', 'users.name', 'posts.title')
    .join('posts', 'users.id = posts.user_id')
    .build();

  assertIncludes(sql1, 'INNER JOIN', 'Should contain INNER JOIN');
  assertIncludes(sql1, 'posts ON users.id = posts.user_id', 'Should contain JOIN condition');

  // LEFT JOIN
  const qb2 = new QueryBuilder('users', null);
  const sql2 = qb2
    .select('users.id', 'users.name', 'posts.title')
    .leftJoin('posts', 'users.id = posts.user_id')
    .build();

  assertIncludes(sql2, 'LEFT JOIN', 'Should contain LEFT JOIN');
  assertIncludes(sql2, 'posts ON users.id = posts.user_id', 'Should contain LEFT JOIN condition');
});

// T4: ORDER BY, LIMIT, OFFSET
test('T4: ORDER BY + LIMIT + OFFSET', () => {
  const qb = new QueryBuilder('users', null);
  const sql = qb
    .select('id', 'name')
    .orderBy('created_at', 'DESC')
    .limit(10)
    .offset(5)
    .build();

  assertIncludes(sql, 'ORDER BY created_at DESC', 'Should contain ORDER BY with DESC');
  assertIncludes(sql, 'LIMIT 10', 'Should contain LIMIT clause');
  assertIncludes(sql, 'OFFSET 5', 'Should contain OFFSET clause');
});

// T5: INSERT, UPDATE, DELETE
test('T5: INSERT + UPDATE + DELETE', () => {
  // INSERT
  const qb1 = new QueryBuilder('users', null);
  const sql1 = qb1.insert({ name: 'John', email: 'john@example.com' }).build();
  assertIncludes(sql1, 'INSERT INTO users', 'Should contain INSERT INTO');
  assertIncludes(sql1, '(name, email)', 'Should contain column names');
  assertIncludes(sql1, '"John"', 'Should contain string value');

  // UPDATE
  const qb2 = new QueryBuilder('users', null);
  const sql2 = qb2.where('id = 1').update({ name: 'Jane', status: 'active' }).build();
  assertIncludes(sql2, 'UPDATE users', 'Should contain UPDATE');
  assertIncludes(sql2, 'SET', 'Should contain SET');
  assertIncludes(sql2, 'name = "Jane"', 'Should contain updated column');
  assertIncludes(sql2, 'WHERE id = 1', 'Should contain WHERE condition');

  // DELETE
  const qb3 = new QueryBuilder('users', null);
  const sql3 = qb3.where('id = 5').delete().build();
  assertIncludes(sql3, 'DELETE FROM users', 'Should contain DELETE FROM');
  assertIncludes(sql3, 'WHERE id = 5', 'Should contain WHERE condition');
});

// T6: COUNT aggregation
test('T6: COUNT aggregation', () => {
  const qb = new QueryBuilder('users', null);
  const sql = qb.where('status = "active"').count().build();

  assertIncludes(sql, 'SELECT COUNT(*)', 'Should contain COUNT(*) aggregation');
  assertIncludes(sql, 'FROM users', 'Should contain FROM table');
  assertIncludes(sql, 'WHERE status = "active"', 'Should contain WHERE condition');
});

// T7: Complex query (3-table JOIN + WHERE + ORDER BY)
test('T7: Complex query (3-table JOIN + WHERE + ORDER BY)', () => {
  const qb = new QueryBuilder('users', null);
  const sql = qb
    .select('users.id', 'users.name', 'posts.title', 'comments.content')
    .where('users.status = "active"')
    .andWhere('posts.published = 1')
    .join('posts', 'users.id = posts.user_id')
    .join('comments', 'posts.id = comments.post_id')
    .orderBy('posts.created_at', 'DESC')
    .limit(20)
    .build();

  assertIncludes(sql, 'SELECT users.id, users.name, posts.title, comments.content', 'Should contain all selected columns');
  assertIncludes(sql, 'FROM users', 'Should contain FROM users');
  assertIncludes(sql, 'INNER JOIN posts ON users.id = posts.user_id', 'Should contain first JOIN');
  assertIncludes(sql, 'INNER JOIN comments ON posts.id = comments.post_id', 'Should contain second JOIN');
  assertIncludes(sql, 'WHERE users.status = "active" AND posts.published = 1', 'Should contain multiple WHERE conditions');
  assertIncludes(sql, 'ORDER BY posts.created_at DESC', 'Should contain ORDER BY');
  assertIncludes(sql, 'LIMIT 20', 'Should contain LIMIT');
});

// T8: Performance (1000 query builds < 50ms)
test('T8: Performance (1000 query builds < 50ms)', () => {
  const startTime = Date.now();

  for (let i = 0; i < 1000; i++) {
    const qb = new QueryBuilder(`table_${i % 10}`, null);
    const sql = qb
      .select('id', 'name', 'email')
      .where(`id > ${i}`)
      .andWhere(`status = "active"`)
      .join('posts', 'users.id = posts.user_id')
      .orderBy('created_at', 'DESC')
      .limit(10)
      .build();
  }

  const elapsed = Date.now() - startTime;

  if (elapsed > 50) {
    throw new Error(`Performance test failed: ${elapsed}ms > 50ms`);
  }

  console.log(`    (${elapsed}ms for 1000 queries)`);
});

// ============================================================================
// ADDITIONAL EDGE CASE TESTS
// ============================================================================

// Test: Default SELECT (no columns specified)
test('Additional: Default SELECT without columns', () => {
  const qb = new QueryBuilder('users', null);
  const sql = qb.build();
  assertEqual(sql, 'SELECT * FROM users', 'Should default to SELECT *');
});

// Test: String escaping in INSERT/UPDATE
test('Additional: String escaping in INSERT', () => {
  const qb = new QueryBuilder('users', null);
  const sql = qb.insert({ name: 'O"Brien', description: 'Test "quoted" text' }).build();
  assertIncludes(sql, '""', 'Should escape double quotes');
});

// Test: NULL handling in UPDATE
test('Additional: NULL handling in UPDATE', () => {
  const qb = new QueryBuilder('users', null);
  const sql = qb.where('id = 1').update({ deleted_at: null }).build();
  assertIncludes(sql, 'deleted_at = NULL', 'Should handle NULL values');
});

// Test: Chaining validation
test('Additional: Method chaining works correctly', () => {
  const qb = new QueryBuilder('users', null);
  const result = qb
    .select('id')
    .where('id > 0')
    .orderBy('id')
    .limit(5);

  assert(result instanceof QueryBuilder, 'Should return QueryBuilder instance for chaining');
});

// Test: Multiple columns with spaces
test('Additional: Multiple column select', () => {
  const qb = new QueryBuilder('users', null);
  const sql = qb.select('id', 'first_name', 'last_name', 'email').build();
  assertEqual(sql, 'SELECT id, first_name, last_name, email FROM users', 'Should handle multiple columns');
});

// ============================================================================
// RESULTS SUMMARY
// ============================================================================

console.log(`\n${colors.cyan}Test Results${colors.reset}`);
console.log(`${colors.green}Passed: ${testsPassed}${colors.reset}`);
console.log(`${colors.red}Failed: ${testsFailed}${colors.reset}`);
console.log(`Total:  ${testsPassed + testsFailed}\n`);

if (testsFailed === 0) {
  console.log(`${colors.green}✓ All tests passed!${colors.reset}\n`);
  process.exit(0);
} else {
  console.log(`${colors.red}✗ Some tests failed${colors.reset}\n`);
  process.exit(1);
}

module.exports = { QueryBuilder, test, assertEqual, assertIncludes };
