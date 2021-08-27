export const ENCODING_UTF8 = 'utf8';

let resolve = (filename, base = process.cwd()) => path.resolve(base, filename);

export function strToEncoding(str, encoding) {
  if (!encoding || encoding === ENCODING_UTF8) return str; // UTF-8
  if (encoding === 'buffer') return Buffer.from(str); // `buffer` encoding
  return Buffer.from(str).toString(encoding); // Custom encoding
}

export function filenameToSteps(filename, base) {
  const fullPath = resolve(filename, base);
  const fullPathSansSlash = fullPath.substr(1);
  if (!fullPathSansSlash) return [];
  return fullPathSansSlash.split(sep);
}

export function getPathFromURLPosix(url) {
  if (url.hostname !== '') {
    throw new errors.TypeError('ERR_INVALID_FILE_URL_HOST', process.platform);
  }
  const pathname = url.pathname;
  for (let n = 0; n < pathname.length; n++) {
    if (pathname[n] === '%') {
      const third = pathname.codePointAt(n + 2) | 0x20;
      if (pathname[n + 1] === '2' && third === 102) {
        throw new errors.TypeError('ERR_INVALID_FILE_URL_PATH', 'must not include encoded / characters');
      }
    }
  }
  return decodeURIComponent(pathname);
}

export function getOptions(defaults, options) {
  let opts;
  if (!options) return defaults;
  else {
    const tipeof = typeof options;
    switch (tipeof) {
      case 'string':
        opts = Object.assign({}, defaults, { encoding: options });
        break;
      case 'object':
        opts = Object.assign({}, defaults, options);
        break;
      default:
        throw TypeError(ERRSTR_OPTS(tipeof));
    }
  }

  //if (opts.encoding !== 'buffer') assertEncoding(opts.encoding);

  return opts;
}

export function optsGenerator(defaults) {
  return options => getOptions(defaults, options);
}

export function validateCallback(callback) {
  if (typeof callback !== 'function') throw TypeError(ERRSTR.CB);
  return callback;
}

export function optsAndCbGenerator(getOpts) {
  return (options, callback) => typeof options === 'function' ? [getOpts(), options] : [getOpts(options), validateCallback(callback)];
}

const optsDefaults = {
  encoding: 'utf8',
};

export const getDefaultOpts = optsGenerator(optsDefaults);

export const getDefaultOptsAndCb = optsAndCbGenerator(getDefaultOpts);

export function nullCheck(path, callback) {
  if (('' + path).indexOf('\u0000') !== -1) {
    const er = new Error('Path must be a string without null bytes');
    (er).code = ENOENT;
    if (typeof callback !== 'function') throw er;
    process.nextTick(callback, er);
    return false;
  }
  return true;
}

export function pathToFilename(path) {
  if (typeof path !== 'string' && !Buffer.isBuffer(path)) {
    try {
      if (!(path instanceof require('url').URL)) throw new TypeError(ERRSTR.PATH_STR);
    } catch (err) {
      throw new TypeError(ERRSTR.PATH_STR);
    }

    path = getPathFromURLPosix(path);
  }

  const pathString = String(path);
  nullCheck(pathString);
  // return slash(pathString);
  return pathString;
}
