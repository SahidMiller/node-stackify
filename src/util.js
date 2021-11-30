// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';
import types from './internal/util/types.js';

export { types }

import { ArrayIsArray, ArrayPrototypeJoin, ArrayPrototypePop, Date, DatePrototypeGetDate, DatePrototypeGetHours, DatePrototypeGetMinutes, DatePrototypeGetMonth, DatePrototypeGetSeconds, Error, FunctionPrototypeBind, NumberIsSafeInteger, ObjectDefineProperties, ObjectDefineProperty, ObjectGetOwnPropertyDescriptors, ObjectKeys, ObjectPrototypeToString, ObjectSetPrototypeOf, ReflectApply, StringPrototypePadStart } from "@darkwolf/primordials";

import errors from './internal/errors.js';
const {
    codes: {
        ERR_FALSY_VALUE_REJECTION, ERR_INVALID_ARG_TYPE, ERR_OUT_OF_RANGE
    }, errnoException, exceptionWithHostPort, hideStackFrames
} = errors;
import { format, formatWithOptions, inspect } from './internal/util/inspect.js';
import { debuglog } from './internal/util/debuglog.js';
import { validateFunction, validateNumber } from './internal/validators.js';
import { TextDecoder, TextEncoder } from './internal/encoding.cjs';
import { Buffer } from 'buffer';
const { isBuffer } = Buffer;

import { deprecate, getSystemErrorMap, getSystemErrorName as internalErrorName, promisify } from './internal/util.js';

import { isDeepStrictEqual } from './internal/util/comparisons.js';

/**
 * @deprecated since v4.0.0{ isRegExp as _isRegExp, isDate as _isDate } 
 * @param {any} arg
 * @returns {arg is boolean}
 */
function isBoolean(arg) {
  return typeof arg === 'boolean';
}

/**
 * @deprecated since v4.0.0
 * @param {any} arg
 * @returns {arg is null}
 */
function isNull(arg) {
  return arg === null;
}

/**
 * @deprecated since v4.0.0
 * @param {any} arg
 * @returns {arg is (null | undefined)}
 */
function isNullOrUndefined(arg) {
  return arg === null || arg === undefined;
}

/**
 * @deprecated since v4.0.0
 * @param {any} arg
 * @returns {arg is number}
 */
function isNumber(arg) {
  return typeof arg === 'number';
}

/**
 * @param {any} arg
 * @returns {arg is string}
 */
function isString(arg) {
  return typeof arg === 'string';
}

/**
 * @deprecated since v4.0.0
 * @param {any} arg
 * @returns {arg is symbol}
 */
function isSymbol(arg) {
  return typeof arg === 'symbol';
}

/**
 * @deprecated since v4.0.0
 * @param {any} arg
 * @returns {arg is undefined}
 */
function isUndefined(arg) {
  return arg === undefined;
}

/**
 * @deprecated since v4.0.0
 * @param {any} arg
 * @returns {a is NonNullable<object>}
 */
function isObject(arg) {
  return arg !== null && typeof arg === 'object';
}

/**
 * @deprecated since v4.0.0
 * @param {any} e
 * @returns {arg is Error}
 */
function isError(e) {
  return ObjectPrototypeToString(e) === '[object Error]' || e instanceof Error;
}

/**
 * @deprecated since v4.0.0
 * @param {any} arg
 * @returns {arg is Function}
 */
function isFunction(arg) {
  return typeof arg === 'function';
}

/**
 * @deprecated since v4.0.0
 * @param {any} arg
 * @returns {arg is (boolean | null | number | string | symbol | undefined)}
 */
function isPrimitive(arg) {
  return arg === null ||
         (typeof arg !== 'object' && typeof arg !== 'function');
}

/**
 * @param {number} n
 * @returns {string}
 */
function pad(n) {
  return StringPrototypePadStart(n.toString(), 2, '0');
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
                'Oct', 'Nov', 'Dec'];

/**
 * @returns {string}  26 Feb 16:19:34
 */
function timestamp() {
  const d = new Date();
  const t = ArrayPrototypeJoin([
    pad(DatePrototypeGetHours(d)),
    pad(DatePrototypeGetMinutes(d)),
    pad(DatePrototypeGetSeconds(d)),
  ], ':');
  return `${DatePrototypeGetDate(d)} ${months[DatePrototypeGetMonth(d)]} ${t}`;
}

//TODO God willing: if this works, try for other areas, God willing.
//const console = require('internal/console/global');

/**
 * Log is just a thin wrapper to console.log that prepends a timestamp
 * @deprecated since v6.0.0
 * @type {(...args: any[]) => void}
 */
function log(...args) {
  console.log('%s - %s', timestamp(), format(...args));
}

/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {Function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {Function} superCtor Constructor function to inherit prototype from.
 * @throws {TypeError} Will error if either constructor is null, or if
 *     the super constructor lacks a prototype.
 */
function inherits(ctor, superCtor) {

  if (ctor === undefined || ctor === null)
    throw new ERR_INVALID_ARG_TYPE('ctor', 'Function', ctor);

  if (superCtor === undefined || superCtor === null)
    throw new ERR_INVALID_ARG_TYPE('superCtor', 'Function', superCtor);

  if (superCtor.prototype === undefined) {
    throw new ERR_INVALID_ARG_TYPE('superCtor.prototype',
                                   'Object', superCtor.prototype);
  }
  ObjectDefineProperty(ctor, 'super_', {
    value: superCtor,
    writable: true,
    configurable: true
  });
  ObjectSetPrototypeOf(ctor.prototype, superCtor.prototype);
}

/**
 * @deprecated since v6.0.0
 * @template T
 * @template S
 * @param {T} target
 * @param {S} source
 * @returns {S extends null ? T : (T & S)}
 */
function _extend(target, source) {
  // Don't do anything if source isn't an object
  if (source === null || typeof source !== 'object') return target;

  const keys = ObjectKeys(source);
  let i = keys.length;
  while (i--) {
    target[keys[i]] = source[keys[i]];
  }
  return target;
}

const callbackifyOnRejected = hideStackFrames((reason, cb) => {
  // `!reason` guard inspired by bluebird (Ref: https://goo.gl/t5IS6M).
  // Because `null` is a special error value in callbacks which means "no error
  // occurred", we error-wrap so the callback consumer can distinguish between
  // "the promise rejected with null" or "the promise fulfilled with undefined".
  if (!reason) {
    reason = new ERR_FALSY_VALUE_REJECTION(reason);
  }
  return cb(reason);
});

/**
 * @template {(...args: any[]) => Promise<any>} T
 * @param {T} original
 * @returns {T extends (...args: infer TArgs) => Promise<infer TReturn> ?
 *   ((...params: [...TArgs, ((err: Error, ret: TReturn) => any)]) => void) :
 *   never
 * }
 */
function callbackify(original) {
  validateFunction(original, 'original');

  // We DO NOT return the promise as it gives the user a false sense that
  // the promise is actually somehow related to the callback's execution
  // and that the callback throwing will reject the promise.
  function callbackified(...args) {
    const maybeCb = ArrayPrototypePop(args);
    validateFunction(maybeCb, 'last argument');
    const cb = FunctionPrototypeBind(maybeCb, this);
    // In true node style we process the callback on `nextTick` with all the
    // implications (stack, `uncaughtException`, `async_hooks`)
    ReflectApply(original, this, args)
      .then((ret) => process.nextTick(cb, null, ret),
            (rej) => process.nextTick(callbackifyOnRejected, rej, cb));
  }

  const descriptors = ObjectGetOwnPropertyDescriptors(original);
  // It is possible to manipulate a functions `length` or `name` property. This
  // guards against the manipulation.
  if (typeof descriptors.length.value === 'number') {
    descriptors.length.value++;
  }
  if (typeof descriptors.name.value === 'string') {
    descriptors.name.value += 'Callbackified';
  }
  ObjectDefineProperties(callbackified, descriptors);
  return callbackified;
}

/**
 * @param {number} err
 * @returns {string}
 */
function getSystemErrorName(err) {
  validateNumber(err, 'err');
  if (err >= 0 || !NumberIsSafeInteger(err)) {
    throw new ERR_OUT_OF_RANGE('err', 'a negative integer', err);
  }
  return internalErrorName(err);
}

const { isRegExp, isDate } = types;

// Keep the `exports =` so that various functions can still be monkeypatched
export {
  errnoException as _errnoException,
  exceptionWithHostPort as _exceptionWithHostPort,
  _extend,
  callbackify,
  debuglog as debug,
  debuglog,
  deprecate,
  format,
  formatWithOptions,
  getSystemErrorMap,
  getSystemErrorName,
  inherits,
  inspect,
  ArrayIsArray as isArray,
  isBoolean,
  isBuffer,
  isDeepStrictEqual,
  isNull,
  isNullOrUndefined,
  isNumber,
  isString,
  isSymbol,
  isUndefined,
  isRegExp,
  isObject,
  isDate,
  isError,
  isFunction,
  isPrimitive,
  log,
  promisify,
  TextDecoder,
  TextEncoder,
};

import * as mySelf from "./util.js"
export default mySelf;