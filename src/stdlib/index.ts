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

// Re-export all modules as namespaces
export * as io from './io';
export * as string from './string';
export * as array from './array';
export * as math from './math';
export * as object from './object';
export * as json from './json';

/**
 * Standard Library namespace
 *
 * Provides organized access to all stdlib modules with clear separation of concerns.
 *
 * @example
 * import std from "std"
 *
 * std.io.console.log("Hello")
 * std.string.toUpperCase("hello")
 * std.array.map([1, 2, 3], x => x * 2)
 * std.math.sqrt(16)
 * std.object.keys({ a: 1, b: 2 })
 * std.json.stringify({ x: 10 })
 */
import * as ioModule from './io';
import * as stringModule from './string';
import * as arrayModule from './array';
import * as mathModule from './math';
import * as objectModule from './object';
import * as jsonModule from './json';

const std = {
  io: ioModule,
  string: stringModule,
  array: arrayModule,
  math: mathModule,
  object: objectModule,
  json: jsonModule
};

export default std;
