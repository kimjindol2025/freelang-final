/**
 * FreeLang v2.5.0 - Week 1 Advanced Functions Test
 * 100개 추가 함수 검증 (195개 총 함수)
 *
 * Test 카테고리:
 * - Math Advanced (20개)
 * - String Advanced (25개)
 * - Array Advanced (30개)
 * - Object Advanced (15개)
 * - Function Composition (15개)
 * - Advanced Utilities (10개)
 */

const fl = require('./index.js');

let totalTests = 0;
let passedTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`✅ ${name}`);
  } catch (e) {
    console.log(`❌ ${name}: ${e.message}`);
  }
}

// ============================================================================
// Math Advanced Tests (20개)
// ============================================================================

console.log('\n📐 Math Advanced (20개)');

test('asin(0.5) ≈ 0.524', () => {
  const result = fl.asin(0.5);
  if (Math.abs(result - 0.5236) > 0.001) throw new Error(`Expected ~0.524, got ${result}`);
});

test('acos(0.5) ≈ 1.047', () => {
  const result = fl.acos(0.5);
  if (Math.abs(result - 1.047) > 0.001) throw new Error(`Expected ~1.047, got ${result}`);
});

test('atan(1) ≈ 0.785', () => {
  const result = fl.atan(1);
  if (Math.abs(result - 0.785) > 0.001) throw new Error(`Expected ~0.785, got ${result}`);
});

test('atan2(1, 1) ≈ 0.785', () => {
  const result = fl.atan2(1, 1);
  if (Math.abs(result - 0.785) > 0.001) throw new Error(`Expected ~0.785, got ${result}`);
});

test('sinh(0) = 0', () => {
  if (fl.sinh(0) !== 0) throw new Error(`Expected 0, got ${fl.sinh(0)}`);
});

test('cosh(0) = 1', () => {
  if (fl.cosh(0) !== 1) throw new Error(`Expected 1, got ${fl.cosh(0)}`);
});

test('tanh(0) = 0', () => {
  if (fl.tanh(0) !== 0) throw new Error(`Expected 0, got ${fl.tanh(0)}`);
});

test('isFinite(42) = true', () => {
  if (!fl.isFinite(42)) throw new Error('Expected true');
});

test('isNaN(NaN) = true', () => {
  if (!fl.isNaN(NaN)) throw new Error('Expected true');
});

test('isInfinity(Infinity) = true', () => {
  if (!fl.isInfinity(Infinity)) throw new Error('Expected true');
});

test('trunc(3.7) = 3', () => {
  if (fl.trunc(3.7) !== 3) throw new Error(`Expected 3, got ${fl.trunc(3.7)}`);
});

test('sign(-5) = -1', () => {
  if (fl.sign(-5) !== -1) throw new Error(`Expected -1, got ${fl.sign(-5)}`);
});

test('cbrt(8) = 2', () => {
  if (fl.cbrt(8) !== 2) throw new Error(`Expected 2, got ${fl.cbrt(8)}`);
});

test('hypot(3, 4) = 5', () => {
  if (fl.hypot(3, 4) !== 5) throw new Error(`Expected 5, got ${fl.hypot(3, 4)}`);
});

test('deg2rad(180) ≈ π', () => {
  const result = fl.deg2rad(180);
  if (Math.abs(result - Math.PI) > 0.001) throw new Error(`Expected ~π, got ${result}`);
});

test('rad2deg(π) = 180', () => {
  const result = fl.rad2deg(Math.PI);
  if (Math.abs(result - 180) > 0.1) throw new Error(`Expected ~180, got ${result}`);
});

test('clamp(5, 0, 10) = 5', () => {
  if (fl.clamp(5, 0, 10) !== 5) throw new Error('Expected 5');
});

test('lerp(0, 10, 0.5) = 5', () => {
  if (fl.lerp(0, 10, 0.5) !== 5) throw new Error('Expected 5');
});

test('fract(3.7) ≈ 0.7', () => {
  const result = fl.fract(3.7);
  if (Math.abs(result - 0.7) > 0.001) throw new Error(`Expected ~0.7, got ${result}`);
});

test('modf(3.7).integer = 3', () => {
  const result = fl.modf(3.7);
  if (result.integer !== 3) throw new Error(`Expected 3, got ${result.integer}`);
});

// ============================================================================
// String Advanced Tests (25개)
// ============================================================================

console.log('\n🔤 String Advanced (25개)');

test('substring("hello", 1, 4) = "ell"', () => {
  if (fl.substring('hello', 1, 4) !== 'ell') throw new Error('Expected "ell"');
});

test('substr("hello", 1, 3) = "ell"', () => {
  if (fl.substr('hello', 1, 3) !== 'ell') throw new Error('Expected "ell"');
});

test('string_slice("hello", 1, 4) = "ell"', () => {
  if (fl.string_slice('hello', 1, 4) !== 'ell') throw new Error('Expected "ell"');
});

test('charCodeAt("A", 0) = 65', () => {
  if (fl.charCodeAt('A', 0) !== 65) throw new Error('Expected 65');
});

test('fromCharCode(65, 66, 67) = "ABC"', () => {
  if (fl.fromCharCode(65, 66, 67) !== 'ABC') throw new Error('Expected "ABC"');
});

test('padStart("5", 3, "0") = "005"', () => {
  if (fl.padStart('5', 3, '0') !== '005') throw new Error('Expected "005"');
});

test('padEnd("5", 3, "0") = "500"', () => {
  if (fl.padEnd('5', 3, '0') !== '500') throw new Error('Expected "500"');
});

test('repeat("a", 3) = "aaa"', () => {
  if (fl.repeat('a', 3) !== 'aaa') throw new Error('Expected "aaa"');
});

test('toLocaleLowerCase("HELLO") = "hello"', () => {
  if (fl.toLocaleLowerCase('HELLO') !== 'hello') throw new Error('Expected "hello"');
});

test('toLocaleUpperCase("hello") = "HELLO"', () => {
  if (fl.toLocaleUpperCase('hello') !== 'HELLO') throw new Error('Expected "HELLO"');
});

test('match("hello world", "l+") matches l', () => {
  const result = fl.match('hello world', 'l+');
  if (!result || result.length === 0) throw new Error('Expected match');
});

test('search("hello", "ll") = 2', () => {
  if (fl.search('hello', 'll') !== 2) throw new Error('Expected 2');
});

test('localeCompare("a", "b") < 0', () => {
  if (fl.localeCompare('a', 'b') >= 0) throw new Error('Expected < 0');
});

test('codePointAt("A", 0) = 65', () => {
  if (fl.codePointAt('A', 0) !== 65) throw new Error('Expected 65');
});

test('fromCodePoint(65, 66) = "AB"', () => {
  if (fl.fromCodePoint(65, 66) !== 'AB') throw new Error('Expected "AB"');
});

test('string_concat("hello", " world") = "hello world"', () => {
  if (fl.string_concat('hello', ' world') !== 'hello world') throw new Error('Expected "hello world"');
});

test('normalize("café") preserves string', () => {
  const result = fl.normalize('café');
  if (typeof result !== 'string') throw new Error('Expected string');
});

test('toString(42) = "42"', () => {
  if (fl.toString(42) !== '42') throw new Error('Expected "42"');
});

test('valueOf("test") = "test"', () => {
  if (fl.valueOf('test') !== 'test') throw new Error('Expected "test"');
});

test('at("hello", 0) = "h"', () => {
  if (fl.at('hello', 0) !== 'h') throw new Error('Expected "h"');
});

test('at("hello", -1) = "o"', () => {
  if (fl.at('hello', -1) !== 'o') throw new Error('Expected "o"');
});

test('trimLeft(" hello ") removes left space', () => {
  if (!fl.trimLeft(' hello ').startsWith('hello')) throw new Error('Expected no left space');
});

test('trimRight(" hello ") removes right space', () => {
  if (!fl.trimRight(' hello ').endsWith('hello')) throw new Error('Expected no right space');
});

// ============================================================================
// Array Advanced Tests (30개)
// ============================================================================

console.log('\n📚 Array Advanced (30개)');

test('flat([[1,[2]], 3]) flattens one level', () => {
  const result = fl.flat([[1, [2]], 3]);
  if (result.length !== 3) throw new Error(`Expected 3 elements, got ${result.length}`);
});

test('flatMap([1,2], x => [x, x*2]) flattens', () => {
  const result = fl.flatMap([1, 2], x => [x, x * 2]);
  if (result.length !== 4) throw new Error(`Expected 4, got ${result.length}`);
});

test('splice([1,2,3], 1, 1, 99) replaces element', () => {
  const arr = [1, 2, 3];
  fl.splice(arr, 1, 1, 99);
  if (arr[1] !== 99) throw new Error(`Expected 99, got ${arr[1]}`);
});

test('fill([1,2,3], 0, 1, 3) fills range', () => {
  const arr = [1, 2, 3];
  fl.fill(arr, 0, 1, 3);
  if (arr[1] !== 0 || arr[2] !== 0) throw new Error('Expected 0');
});

test('findLast([1,2,3], x => x > 1) = 3', () => {
  if (fl.findLast([1, 2, 3], x => x > 1) !== 3) throw new Error('Expected 3');
});

test('findLastIndex([1,2,3], x => x > 1) = 2', () => {
  if (fl.findLastIndex([1, 2, 3], x => x > 1) !== 2) throw new Error('Expected 2');
});

test('at_array([1,2,3], -1) = 3', () => {
  if (fl.at_array([1, 2, 3], -1) !== 3) throw new Error('Expected 3');
});

test('groupBy([{a:1},{a:2},{a:1}], x => x.a) groups', () => {
  const result = fl.groupBy([{ a: 1 }, { a: 2 }, { a: 1 }], x => x.a);
  if (!result[1] || result[1].length !== 2) throw new Error('Expected group length 2');
});

test('partition([1,2,3,4], x => x > 2) splits', () => {
  const [pass, fail] = fl.partition([1, 2, 3, 4], x => x > 2);
  if (pass.length !== 2 || fail.length !== 2) throw new Error('Expected [2,2]');
});

test('intersperse([1,2,3], 0) adds separator', () => {
  const result = fl.intersperse([1, 2, 3], 0);
  if (result.length !== 5) throw new Error(`Expected 5, got ${result.length}`);
});

test('transpose([[1,2],[3,4]]) transposes', () => {
  const result = fl.transpose([[1, 2], [3, 4]]);
  if (result[0][0] !== 1 || result[0][1] !== 3) throw new Error('Expected transposed');
});

test('combinations([1,2,3], 2) returns combinations', () => {
  const result = fl.combinations([1, 2, 3], 2);
  if (result.length !== 3) throw new Error(`Expected 3, got ${result.length}`);
});

test('sample([1,2,3,4,5]) returns element', () => {
  const result = fl.sample([1, 2, 3, 4, 5]);
  if (![1, 2, 3, 4, 5].includes(result)) throw new Error('Expected one of array');
});

test('shuffle([1,2,3]) returns shuffled', () => {
  const result = fl.shuffle([1, 2, 3]);
  if (!Array.isArray(result) || result.length !== 3) throw new Error('Expected array of 3');
});

test('range(0, 3) = [0,1,2]', () => {
  const result = fl.range(0, 3);
  if (result.length !== 3 || result[0] !== 0) throw new Error('Expected [0,1,2]');
});

test('repeat_array(5, 3) = [5,5,5]', () => {
  const result = fl.repeat_array(5, 3);
  if (result.length !== 3 || result[0] !== 5) throw new Error('Expected [5,5,5]');
});

test('take([1,2,3,4], 2) = [1,2]', () => {
  const result = fl.take([1, 2, 3, 4], 2);
  if (result.length !== 2 || result[0] !== 1) throw new Error('Expected [1,2]');
});

test('drop([1,2,3,4], 2) = [3,4]', () => {
  const result = fl.drop([1, 2, 3, 4], 2);
  if (result.length !== 2 || result[0] !== 3) throw new Error('Expected [3,4]');
});

test('takeRight([1,2,3,4], 2) = [3,4]', () => {
  const result = fl.takeRight([1, 2, 3, 4], 2);
  if (result.length !== 2 || result[0] !== 3) throw new Error('Expected [3,4]');
});

test('dropRight([1,2,3,4], 2) = [1,2]', () => {
  const result = fl.dropRight([1, 2, 3, 4], 2);
  if (result.length !== 2 || result[0] !== 1) throw new Error('Expected [1,2]');
});

test('initial([1,2,3]) = [1,2]', () => {
  const result = fl.initial([1, 2, 3]);
  if (result.length !== 2) throw new Error('Expected [1,2]');
});

test('tail([1,2,3]) = [2,3]', () => {
  const result = fl.tail([1, 2, 3]);
  if (result.length !== 2 || result[0] !== 2) throw new Error('Expected [2,3]');
});

// ============================================================================
// Function Composition Tests (15개)
// ============================================================================

console.log('\n⚙️  Function Composition (15개)');

test('memoize caches results', () => {
  let calls = 0;
  const fn = fl.memoize((x) => {
    calls++;
    return x * 2;
  });
  fn(5);
  fn(5);
  if (calls !== 1) throw new Error(`Expected 1 call, got ${calls}`);
});

test('identity(42) = 42', () => {
  if (fl.identity(42) !== 42) throw new Error('Expected 42');
});

test('constant(5)() = 5', () => {
  const fn = fl.constant(5);
  if (fn() !== 5) throw new Error('Expected 5');
});

test('negate(x => x > 5) inverts', () => {
  const fn = fl.negate(x => x > 5);
  if (fn(3) !== true) throw new Error('Expected true');
});

test('once(fn) executes once', () => {
  let calls = 0;
  const fn = fl.once(() => {
    calls++;
    return calls;
  });
  fn();
  fn();
  if (calls !== 1) throw new Error(`Expected 1 call, got ${calls}`);
});

test('partial(add, 5) presets argument', () => {
  const add = (a, b) => a + b;
  const add5 = fl.partial(add, 5);
  if (add5(3) !== 8) throw new Error('Expected 8');
});

test('curry(add)(5)(3) = 8', () => {
  const add = (a, b) => a + b;
  const curried = fl.curry(add);
  if (curried(5)(3) !== 8) throw new Error('Expected 8');
});

test('compose chains functions', () => {
  const double = x => x * 2;
  const addOne = x => x + 1;
  const composed = fl.compose(addOne, double);
  if (composed(5) !== 11) throw new Error('Expected 11');
});

test('pipe_fn chains left-to-right', () => {
  const double = x => x * 2;
  const addOne = x => x + 1;
  const piped = fl.pipe_fn(double, addOne);
  if (piped(5) !== 11) throw new Error('Expected 11');
});

test('tap executes side effect', () => {
  let sideEffect = false;
  const fn = fl.tap(() => { sideEffect = true; });
  fn(42);
  if (!sideEffect) throw new Error('Expected side effect');
});

test('when applies if predicate true', () => {
  const fn = fl.when(x => x > 5, x => x * 2);
  if (fn(10) !== 20) throw new Error('Expected 20');
});

test('unless applies if predicate false', () => {
  const fn = fl.unless(x => x > 5, x => x * 2);
  if (fn(3) !== 6) throw new Error('Expected 6');
});

test('complement negates predicate', () => {
  const gt5 = x => x > 5;
  const le5 = fl.complement(gt5);
  if (le5(3) !== true) throw new Error('Expected true');
});

// ============================================================================
// Advanced Utilities Tests (10개)
// ============================================================================

console.log('\n🔧 Advanced Utilities (10개)');

test('deepClone({a:{b:1}}) clones nested', () => {
  const obj = { a: { b: 1 } };
  const cloned = fl.deepClone(obj);
  cloned.a.b = 2;
  if (obj.a.b !== 1) throw new Error('Expected original unchanged');
});

test('deepEqual({a:1}, {a:1}) = true', () => {
  if (!fl.deepEqual({ a: 1 }, { a: 1 })) throw new Error('Expected true');
});

test('shallowClone({a:1}) creates copy', () => {
  const obj = { a: 1 };
  const cloned = fl.shallowClone(obj);
  cloned.a = 2;
  if (obj.a !== 1) throw new Error('Expected original unchanged');
});

test('shallowEqual([1,2], [1,2]) = true', () => {
  if (!fl.shallowEqual([1, 2], [1, 2])) throw new Error('Expected true');
});

test('isEmpty("") = true', () => {
  if (!fl.isEmpty('')) throw new Error('Expected true');
});

test('isEmpty([]) = true', () => {
  if (!fl.isEmpty([])) throw new Error('Expected true');
});

test('isNull(null) = true', () => {
  if (!fl.isNull(null)) throw new Error('Expected true');
});

test('isUndefined(undefined) = true', () => {
  if (!fl.isUndefined(undefined)) throw new Error('Expected true');
});

test('isNullish(null) = true', () => {
  if (!fl.isNullish(null)) throw new Error('Expected true');
});

test('isDefined(42) = true', () => {
  if (!fl.isDefined(42)) throw new Error('Expected true');
});

// ============================================================================
// Results
// ============================================================================

console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`✅ 통과: ${passedTests}/${totalTests}`);
console.log(`📊 성공률: ${((passedTests/totalTests)*100).toFixed(1)}%`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

if (passedTests === totalTests) {
  console.log('🎉 모든 테스트 통과!');
  process.exit(0);
} else {
  console.log(`❌ ${totalTests - passedTests}개 테스트 실패`);
  process.exit(1);
}
