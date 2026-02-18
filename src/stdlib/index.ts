/**
 * FreeLang Standard Library: Aggregated Exports
 *
 * Provides unified access to all standard library modules.
 *
 * Usage:
 *   import { io, string, array, math, object, json } from "std"
 *   import { console, file } from "std/io"
 *   import { map, filter } from "std/array"
 */

// Re-export all modules (Phase 1)
export * as io from './io';
export * as string from './string';
export * as array from './array';
export * as math from './math';
export * as object from './object';
export * as json from './json';

// Re-export additional modules (Phase 2)
export * as regex from './regex';
export * as date from './date';
export * as set from './set';
export * as map from './map';
export * as encoding from './encoding';

// For backward compatibility, also export default objects and key functions
// Phase 1 modules
export { io, console, file, dir, path_ops, input, readLines } from './io';
export { string, toUpperCase, toLowerCase, trim, trimStart, trimEnd, split, join, replace, replaceAll, startsWith, endsWith, includes, substring, indexOf, lastIndexOf, charAt, charCodeAt, repeat, capitalize, capitalizeWords, reverse, camelCase, snakeCase, pascalCase, kebabCase, padStart, padEnd, format, length, similarity } from './string';
export { array, map, filter, reduce, forEach, find, findIndex, some, every, sort, reverse, slice, splice, push, pop, shift, unshift, includes, indexOf, lastIndexOf, join, concat, flatten, unique, uniqueBy, groupBy, length, at, fill, range, repeat, transpose, zip, sum, average, min, max } from './array';
export { math, PI, E, LN2, LN10, LOG2E, LOG10E, SQRT1_2, SQRT2, abs, round, floor, ceil, trunc, sign, pow, sqrt, cbrt, exp, log, log10, log2, sin, cos, tan, asin, acos, atan, atan2, sinh, cosh, tanh, min, max, clamp, lerp, toRadians, toDegrees, random, randomInt, factorial, permutations, combinations, gcd, lcm, isPrime, isEven, isOdd } from './math';
export { object, keys, values, entries, has, get, set, deleteProperty, isEmpty, length, assign, clone, deepClone, mapValues, filterKeys, pick, omit, invert, groupBy, toArray, fromArray, getDeep, setDeep, deepEqual } from './object';
export { json, stringify, parse, prettify, minify, isValid, merge, schema, validate } from './json';

// Phase 2 modules
export { regex, compile, test, match, matchAll, split, replace, replaceAll, escape, isEmail, isUrl, isAlphanumeric, extractEmails, extractUrls } from './regex';
export { date, create, now, timestamp, parse, format, components, addDays, addMonths, addYears, daysBetween, isToday, isLeapYear, daysInMonth, dayOfWeek, dayName, monthName, isSameDay, startOfDay, endOfDay, range, isInRange } from './date';
export { setOps, create as createSet, add, remove, has, size, clear, toArray, union, intersection, difference, symmetricDifference, isSubset, isSuperset, equals, map as setMap, filter as setFilter } from './set';
export { mapOps, create as createMap, fromObject, toObject, set as setMap, get, has as hasMap, delete as deleteMap, clear as clearMap, size as sizeMap, keys, values, entries, forEach, mapValues as mapMapValues, filter as mapFilter, merge, equals as mapEquals, clone, groupBy as mapGroupBy, indexBy } from './map';
export { encoding, base64Encode, base64Decode, urlEncode, urlDecode, urlEncodeObject, urlDecodeObject, hexEncode, hexDecode, htmlEncode, htmlDecode, csvEncode, csvDecode, csvEncodeTable, csvDecodeTable, createDataUrl, parseDataUrl } from './encoding';

/**
 * Standard Library namespace
 *
 * Provides organized access to all stdlib modules with clear separation of concerns.
 *
 * Phase 1 (6 modules): io, string, array, math, object, json
 * Phase 2 (5 modules): regex, date, set, map, encoding
 *
 * @example
 * import std from "std"
 *
 * // Phase 1 examples
 * std.io.console.log("Hello")
 * std.string.toUpperCase("hello")
 * std.array.map([1, 2, 3], x => x * 2)
 * std.math.sqrt(16)
 * std.object.keys({ a: 1, b: 2 })
 * std.json.stringify({ x: 10 })
 *
 * // Phase 2 examples
 * std.regex.test("hello@example.com", ".*@.*")
 * std.date.format(std.date.now())
 * std.set.union(set1, set2)
 * std.map.create([["a", 1], ["b", 2]])
 * std.encoding.base64Encode("hello")
 */
import * as ioModule from './io';
import * as stringModule from './string';
import * as arrayModule from './array';
import * as mathModule from './math';
import * as objectModule from './object';
import * as jsonModule from './json';
import * as regexModule from './regex';
import * as dateModule from './date';
import * as setModule from './set';
import * as mapModule from './map';
import * as encodingModule from './encoding';

const std = {
  // Phase 1 modules
  io: ioModule,
  string: stringModule,
  array: arrayModule,
  math: mathModule,
  object: objectModule,
  json: jsonModule,
  // Phase 2 modules
  regex: regexModule,
  date: dateModule,
  set: setModule,
  map: mapModule,
  encoding: encodingModule
};

export default std;
