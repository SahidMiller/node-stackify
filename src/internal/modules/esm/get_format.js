'use strict';
import { RegExpPrototypeExec, StringPrototypeStartsWith } from "@darkwolf/primordials";
import { extname } from "path";
// const { getOptionValue } = require('internal/options');

const experimentalJsonModules = false //getOptionValue('--experimental-json-modules');
const experimentalSpecifierResolution = false 
  //getOptionValue('--experimental-specifier-resolution');
const experimentalWasmModules = false //getOptionValue('--experimental-wasm-modules');
import { getPackageType } from "./resolve.js";
import { URL, fileURLToPath } from "../../url.js";
import { codes } from "../../errors.js"
const { ERR_UNKNOWN_FILE_EXTENSION } = codes

const extensionFormatMap = {
  '__proto__': null,
  '.cjs': 'commonjs',
  '.js': 'module',
  '.mjs': 'module'
};

const legacyExtensionFormatMap = {
  '__proto__': null,
  '.cjs': 'commonjs',
  '.js': 'commonjs',
  '.json': 'commonjs',
  '.mjs': 'module',
  '.node': 'commonjs'
};

if (experimentalWasmModules)
  extensionFormatMap['.wasm'] = legacyExtensionFormatMap['.wasm'] = 'wasm';

if (experimentalJsonModules)
  extensionFormatMap['.json'] = legacyExtensionFormatMap['.json'] = 'json';

function defaultGetFormat(url, context, defaultGetFormatUnused) {
  if (StringPrototypeStartsWith(url, 'node:')) {
    return { format: 'builtin' };
  }
  const parsed = new URL(url);
  if (parsed.protocol === 'data:') {
    const { 1: mime } = RegExpPrototypeExec(
      /^([^/]+\/[^;,]+)(?:[^,]*?)(;base64)?,/,
      parsed.pathname,
    ) || [ , null ];
    const format = ({
      '__proto__': null,
      'text/javascript': 'module',
      'application/json': experimentalJsonModules ? 'json' : null,
      'application/wasm': experimentalWasmModules ? 'wasm' : null
    })[mime] || null;
    return { format };
  } else if (parsed.protocol === 'file:') {
    const ext = extname(parsed.pathname);
    let format;
    if (ext === '.js') {
      format = getPackageType(parsed.href) === 'module' ? 'module' : 'commonjs';
    } else {
      format = extensionFormatMap[ext];
    }
    if (!format) {
      if (experimentalSpecifierResolution === 'node') {
        process.emitWarning(
          'The Node.js specifier resolution in ESM is experimental.',
          'ExperimentalWarning');
        format = legacyExtensionFormatMap[ext];
      } else {
        throw new ERR_UNKNOWN_FILE_EXTENSION(ext, fileURLToPath(url));
      }
    }
    return { format: format || null };
  }
  return { format: null };
}

export {
  defaultGetFormat,
  extensionFormatMap,
  legacyExtensionFormatMap,
};
