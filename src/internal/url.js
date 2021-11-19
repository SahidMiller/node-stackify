'use strict';

import { Array, ArrayPrototypeJoin, ArrayPrototypeMap, ArrayPrototypePush, ArrayPrototypeReduce, ArrayPrototypeSlice, FunctionPrototypeBind, Int8Array, Number, ObjectCreate, ObjectDefineProperties, ObjectDefineProperty, ObjectGetOwnPropertySymbols, ObjectGetPrototypeOf, ObjectKeys, ReflectApply, ReflectGetOwnPropertyDescriptor, ReflectOwnKeys, RegExpPrototypeExec, String, StringPrototypeCharCodeAt, StringPrototypeIncludes, StringPrototypeReplace, StringPrototypeSlice, StringPrototypeSplit, StringPrototypeStartsWith, Symbol, SymbolIterator, SymbolToStringTag, decodeURIComponent } from "@darkwolf/primordials";

import { inspect } from 'node-inspect-extracted';
import { encodeStr, hexTable, isHexTable } from './querystring.js';

import { getConstructorOf, removeColors } from './util.js';
import { codes } from './errors.js';
const {
  ERR_ARG_NOT_ITERABLE, ERR_INVALID_ARG_TYPE, ERR_INVALID_ARG_VALUE, ERR_INVALID_FILE_URL_HOST, ERR_INVALID_FILE_URL_PATH, ERR_INVALID_THIS, ERR_INVALID_TUPLE, ERR_INVALID_URL, ERR_INVALID_URL_SCHEME, ERR_MISSING_ARGS
} = codes;
import { CHAR_AMPERSAND, CHAR_BACKWARD_SLASH, CHAR_EQUAL, CHAR_FORWARD_SLASH, CHAR_LOWERCASE_A, CHAR_LOWERCASE_Z, CHAR_PERCENT, CHAR_PLUS } from './constants.js';

import { validateCallback, validateObject } from './validators.js';
import path from 'path';
import querystring from 'querystring';

const { platform } = process;
const isWindows = platform === 'win32';

const URL_FLAGS_CANNOT_BE_BASE = 2;
const URL_FLAGS_SPECIAL = 16;
const URL_FLAGS_HAS_USERNAME = 32;
const URL_FLAGS_HAS_PASSWORD = 64;
const URL_FLAGS_HAS_HOST = 128;
const URL_FLAGS_HAS_PATH = 256;
const URL_FLAGS_HAS_QUERY = 512;
const URL_FLAGS_HAS_FRAGMENT = 1024;
const URL_FLAGS_IS_DEFAULT_SCHEME_PORT = 2048;
const kSchemeStart = 0;
const kHost = 10;
const kHostname = 11;
const kPort = 12;
const kPathStart = 16;
const kQuery = 19;
const kFragment = 20;

import tr46 from "tr46";

function _domainToASCII(domain, beStrict = false) {
  const result = tr46.toASCII(domain, {
    checkBidi: true,
    checkHyphens: false,
    checkJoiners: true,
    useSTD3ASCIIRules: beStrict,
    verifyDNSLength: beStrict
  });
  if (result === null || result === "") {
    return failure;
  }
  return result;
}

function _domainToUnicode(domain, beStrict = false) {
  const result = tr46.toUnicode(domain, {
    checkBidi: true,
    checkHyphens: false,
    checkJoiners: true,
    useSTD3ASCIIRules: beStrict,
    verifyDNSLength: beStrict
  });
  if (result === null || result === "") {
    return failure;
  }
  return result;
}

const context = Symbol('context');
const searchParams = Symbol('query');
const kFormat = Symbol('format');

// https://tc39.github.io/ecma262/#sec-%iteratorprototype%-object
const IteratorPrototype = ObjectGetPrototypeOf(
  ObjectGetPrototypeOf([][SymbolIterator]())
);

const unpairedSurrogateRe =
    /(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])/;
function toUSVString(val) {
  const str = `${val}`;
  // As of V8 5.5, `str.search()` (and `unpairedSurrogateRe[@@search]()`) are
  // slower than `unpairedSurrogateRe.exec()`.
  const match = RegExpPrototypeExec(unpairedSurrogateRe, str);
  if (!match)
    return str;
  return _toUSVString(str, match.index);
}

import { URL, URLSearchParams } from "whatwg-url";

ObjectDefineProperties(URLSearchParams.prototype, {
  append: { enumerable: true },
  delete: { enumerable: true },
  get: { enumerable: true },
  getAll: { enumerable: true },
  has: { enumerable: true },
  set: { enumerable: true },
  sort: { enumerable: true },
  entries: { enumerable: true },
  forEach: { enumerable: true },
  keys: { enumerable: true },
  values: { enumerable: true },
  toString: { enumerable: true },
  [SymbolToStringTag]: { configurable: true, value: 'URLSearchParams' },

  // https://heycam.github.io/webidl/#es-iterable-entries
  [SymbolIterator]: {
    configurable: true,
    writable: true,
    value: URLSearchParams.prototype.entries,
  },
});


ObjectDefineProperties(URL.prototype, {
  [kFormat]: { configurable: false, writable: false },
  [SymbolToStringTag]: { configurable: true, value: 'URL' },
  toString: { enumerable: true },
  href: { enumerable: true },
  origin: { enumerable: true },
  protocol: { enumerable: true },
  username: { enumerable: true },
  password: { enumerable: true },
  host: { enumerable: true },
  hostname: { enumerable: true },
  port: { enumerable: true },
  pathname: { enumerable: true },
  search: { enumerable: true },
  searchParams: { enumerable: true },
  hash: { enumerable: true },
  toJSON: { enumerable: true },
});

// Special version of hexTable that uses `+` for U+0020 SPACE.
const paramHexTable = hexTable.slice();
paramHexTable[0x20] = '+';

// Mainly to mitigate func-name-matching ESLint rule
function defineIDLClass(proto, classStr, obj) {
  // https://heycam.github.io/webidl/#dfn-class-string
  ObjectDefineProperty(proto, SymbolToStringTag, {
    writable: false,
    enumerable: false,
    configurable: true,
    value: classStr
  });

  // https://heycam.github.io/webidl/#es-operations
  for (const key of ObjectKeys(obj)) {
    ObjectDefineProperty(proto, key, {
      writable: true,
      enumerable: true,
      configurable: true,
      value: obj[key]
    });
  }
  for (const key of ObjectGetOwnPropertySymbols(obj)) {
    ObjectDefineProperty(proto, key, {
      writable: true,
      enumerable: false,
      configurable: true,
      value: obj[key]
    });
  }
}
// https://heycam.github.io/webidl/#dfn-iterator-prototype-object
const URLSearchParamsIteratorPrototype = ObjectCreate(IteratorPrototype);

defineIDLClass(URLSearchParamsIteratorPrototype, 'URLSearchParams Iterator', {
  next() {
    if (!this ||
        ObjectGetPrototypeOf(this) !== URLSearchParamsIteratorPrototype) {
      throw new ERR_INVALID_THIS('URLSearchParamsIterator');
    }

    const {
      target,
      kind,
      index
    } = this[context];
    const values = target[searchParams];
    const len = values.length;
    if (index >= len) {
      return {
        value: undefined,
        done: true
      };
    }

    const name = values[index];
    const value = values[index + 1];
    this[context].index = index + 2;

    let result;
    if (kind === 'key') {
      result = name;
    } else if (kind === 'value') {
      result = value;
    } else {
      result = [name, value];
    }

    return {
      value: result,
      done: false
    };
  },
  [inspect.custom](recurseTimes, ctx) {
    if (this == null || this[context] == null || this[context].target == null)
      throw new ERR_INVALID_THIS('URLSearchParamsIterator');

    if (typeof recurseTimes === 'number' && recurseTimes < 0)
      return ctx.stylize('[Object]', 'special');

    const innerOpts = { ...ctx };
    if (recurseTimes !== null) {
      innerOpts.depth = recurseTimes - 1;
    }
    const {
      target,
      kind,
      index
    } = this[context];
    const output = ArrayPrototypeReduce(
      ArrayPrototypeSlice(target[searchParams], index),
      (prev, cur, i) => {
        const key = i % 2 === 0;
        if (kind === 'key' && key) {
          ArrayPrototypePush(prev, cur);
        } else if (kind === 'value' && !key) {
          ArrayPrototypePush(prev, cur);
        } else if (kind === 'key+value' && !key) {
          ArrayPrototypePush(prev, [target[searchParams][index + i - 1], cur]);
        }
        return prev;
      },
      []
    );
    const breakLn = inspect(output, innerOpts).includes('\n');
    const outputStrs = ArrayPrototypeMap(output, (p) => inspect(p, innerOpts));
    let outputStr;
    if (breakLn) {
      outputStr = `\n  ${ArrayPrototypeJoin(outputStrs, ',\n  ')}`;
    } else {
      outputStr = ` ${ArrayPrototypeJoin(outputStrs, ', ')}`;
    }
    return `${this[SymbolToStringTag]} {${outputStr} }`;
  }
});

function domainToASCII(domain) {
  if (arguments.length < 1)
    throw new ERR_MISSING_ARGS('domain');

  // toUSVString is not needed.
  return _domainToASCII(`${domain}`);
}

function domainToUnicode(domain) {
  if (arguments.length < 1)
    throw new ERR_MISSING_ARGS('domain');

  // toUSVString is not needed.
  return _domainToUnicode(`${domain}`);
}

// Utility function that converts a URL object into an ordinary
// options object as expected by the http.request and https.request
// APIs.
function urlToHttpOptions(url) {
  const options = {
    protocol: url.protocol,
    hostname: typeof url.hostname === 'string' &&
              StringPrototypeStartsWith(url.hostname, '[') ?
      StringPrototypeSlice(url.hostname, 1, -1) :
      url.hostname,
    hash: url.hash,
    search: url.search,
    pathname: url.pathname,
    path: `${url.pathname || ''}${url.search || ''}`,
    href: url.href
  };
  if (url.port !== '') {
    options.port = Number(url.port);
  }
  if (url.username || url.password) {
    options.auth = `${url.username}:${url.password}`;
  }
  return options;
}

const forwardSlashRegEx = /\//g;

function getPathFromURLWin32(url) {
  const hostname = url.hostname;
  let pathname = url.pathname;
  for (let n = 0; n < pathname.length; n++) {
    if (pathname[n] === '%') {
      const third = pathname.codePointAt(n + 2) | 0x20;
      if ((pathname[n + 1] === '2' && third === 102) || // 2f 2F /
          (pathname[n + 1] === '5' && third === 99)) {  // 5c 5C \
        throw new ERR_INVALID_FILE_URL_PATH(
          'must not include encoded \\ or / characters'
        );
      }
    }
  }
  pathname = pathname.replace(forwardSlashRegEx, '\\');
  pathname = decodeURIComponent(pathname);
  if (hostname !== '') {
    // If hostname is set, then we have a UNC path
    // Pass the hostname through domainToUnicode just in case
    // it is an IDN using punycode encoding. We do not need to worry
    // about percent encoding because the URL parser will have
    // already taken care of that for us. Note that this only
    // causes IDNs with an appropriate `xn--` prefix to be decoded.
    return `\\\\${domainToUnicode(hostname)}${pathname}`;
  }
  // Otherwise, it's a local path that requires a drive letter
  const letter = pathname.codePointAt(1) | 0x20;
  const sep = pathname[2];
  if (letter < CHAR_LOWERCASE_A || letter > CHAR_LOWERCASE_Z ||   // a..z A..Z
      (sep !== ':')) {
    throw new ERR_INVALID_FILE_URL_PATH('must be absolute');
  }
  return pathname.slice(1);
}

function getPathFromURLPosix(url) {
  if (url.hostname !== '') {
    throw new ERR_INVALID_FILE_URL_HOST(platform);
  }
  const pathname = url.pathname;
  for (let n = 0; n < pathname.length; n++) {
    if (pathname[n] === '%') {
      const third = pathname.codePointAt(n + 2) | 0x20;
      if (pathname[n + 1] === '2' && third === 102) {
        throw new ERR_INVALID_FILE_URL_PATH(
          'must not include encoded / characters'
        );
      }
    }
  }
  return decodeURIComponent(pathname);
}

function fileURLToPath(path) {
  if (typeof path === 'string')
    path = new URL(path);
  else if (!isURLInstance(path))
    throw new ERR_INVALID_ARG_TYPE('path', ['string', 'URL'], path);
  if (path.protocol !== 'file:')
    throw new ERR_INVALID_URL_SCHEME('file');
  return isWindows ? getPathFromURLWin32(path) : getPathFromURLPosix(path);
}

// The following characters are percent-encoded when converting from file path
// to URL:
// - %: The percent character is the only character not encoded by the
//        `pathname` setter.
// - \: Backslash is encoded on non-windows platforms since it's a valid
//      character but the `pathname` setters replaces it by a forward slash.
// - LF: The newline character is stripped out by the `pathname` setter.
//       (See whatwg/url#419)
// - CR: The carriage return character is also stripped out by the `pathname`
//       setter.
// - TAB: The tab character is also stripped out by the `pathname` setter.
const percentRegEx = /%/g;
const backslashRegEx = /\\/g;
const newlineRegEx = /\n/g;
const carriageReturnRegEx = /\r/g;
const tabRegEx = /\t/g;

function encodePathChars(filepath) {
  if (StringPrototypeIncludes(filepath, '%'))
    filepath = StringPrototypeReplace(filepath, percentRegEx, '%25');
  // In posix, backslash is a valid character in paths:
  if (!isWindows && StringPrototypeIncludes(filepath, '\\'))
    filepath = StringPrototypeReplace(filepath, backslashRegEx, '%5C');
  if (StringPrototypeIncludes(filepath, '\n'))
    filepath = StringPrototypeReplace(filepath, newlineRegEx, '%0A');
  if (StringPrototypeIncludes(filepath, '\r'))
    filepath = StringPrototypeReplace(filepath, carriageReturnRegEx, '%0D');
  if (StringPrototypeIncludes(filepath, '\t'))
    filepath = StringPrototypeReplace(filepath, tabRegEx, '%09');
  return filepath;
}

function pathToFileURL(filepath) {
  const outURL = new URL('file://');
  if (isWindows && StringPrototypeStartsWith(filepath, '\\\\')) {
    // UNC path format: \\server\share\resource
    const paths = StringPrototypeSplit(filepath, '\\');
    if (paths.length <= 3) {
      throw new ERR_INVALID_ARG_VALUE(
        'filepath',
        filepath,
        'Missing UNC resource path'
      );
    }
    const hostname = paths[2];
    if (hostname.length === 0) {
      throw new ERR_INVALID_ARG_VALUE(
        'filepath',
        filepath,
        'Empty UNC servername'
      );
    }
    outURL.hostname = domainToASCII(hostname);
    outURL.pathname = encodePathChars(
      ArrayPrototypeJoin(ArrayPrototypeSlice(paths, 3), '/'));
  } else {
    let resolved = path.resolve(filepath);
    // path.resolve strips trailing slashes so we must add them back
    const filePathLast = StringPrototypeCharCodeAt(filepath,
                                                   filepath.length - 1);
    if ((filePathLast === CHAR_FORWARD_SLASH ||
         (isWindows && filePathLast === CHAR_BACKWARD_SLASH)) &&
        resolved[resolved.length - 1] !== path.sep)
      resolved += '/';
    outURL.pathname = encodePathChars(resolved);
  }
  return outURL;
}

function isURLInstance(fileURLOrPath) {
  return fileURLOrPath != null && fileURLOrPath.href && fileURLOrPath.origin;
}

function toPathIfFileURL(fileURLOrPath) {
  if (!isURLInstance(fileURLOrPath))
    return fileURLOrPath;
  return fileURLToPath(fileURLOrPath);
}

export default {
  domainToASCII,
  toUSVString,
  fileURLToPath,
  pathToFileURL,
  toPathIfFileURL,
  isURLInstance,
  URL,
  URLSearchParams,
  domainToUnicode,
  urlToHttpOptions,
  formatSymbol: kFormat,
  searchParamsSymbol: searchParams,
  encodeStr
};

const formatSymbol = kFormat;
const searchParamsSymbol = searchParams;

export {
  domainToASCII,
  toUSVString,
  fileURLToPath,
  pathToFileURL,
  toPathIfFileURL,
  isURLInstance,
  URL,
  URLSearchParams,
  domainToUnicode,
  urlToHttpOptions,
  formatSymbol,
  searchParamsSymbol,
  encodeStr
};
