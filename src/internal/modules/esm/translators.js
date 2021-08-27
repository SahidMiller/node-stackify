'use strict';

import {
  ArrayPrototypeForEach,
  ArrayPrototypeMap,
  Boolean,
  JSONParse,
  ObjectGetPrototypeOf,
  ObjectPrototypeHasOwnProperty,
  ObjectKeys,
  PromisePrototypeCatch,
  PromiseReject,
  RegExpPrototypeTest,
  SafeArrayIterator,
  SafeMap,
  SafeSet,
  StringPrototypeReplace,
  StringPrototypeSlice,
  StringPrototypeSplit,
  StringPrototypeStartsWith,
  SyntaxErrorPrototype,
  globalThis,
} from "@darkwolf/primordials";

const { WebAssembly } = globalThis

import { types } from "util"
import { readFileSync } from "fs";
import { extname, isAbsolute } from "path";
import { stripBOM, loadNativeModule } from "../cjs/helpers.js";
import { Module as CJSModule, cjsParseCache, Module } from "../cjs/loader.js";
import { defaultGetSource } from "./get_source.js";
import { defaultTransformSource } from "./transform_source.js";
import createDynamicModule from "./create_dynamic_module.js";
import { fileURLToPath, URL } from "../../url.js";
import { debuglog, TextDecoder } from "util";
let debug = debuglog("repl", (fn) => {
  debug = fn;
});
import { emitExperimentalWarning } from "../../util.js";
import { codes } from "../../errors.js";
const {
  ERR_UNKNOWN_BUILTIN_MODULE,
  ERR_INVALID_RETURN_PROPERTY_VALUE
} = codes
// const { maybeCacheSourceMap } = require('internal/source_map/source_map_cache');
// const moduleWrap = internalBinding('module_wrap');
// const { ModuleWrap } = moduleWrap;
// const { getOptionValue } = require('internal/options');
// const experimentalImportMetaResolve =
//     getOptionValue('--experimental-import-meta-resolve');
const experimentalImportMetaResolve = false;
import * as asyncESM from "../../process/esm_loader.js";
import { emitWarningSync } from "../../process/warning.js";

let cjsParse;
async function initCJSParse() {
  if (typeof WebAssembly === 'undefined') {
    // cjsParse = require('internal/deps/cjs-module-lexer/lexer').parse;
  } else {
    // const { parse, init } = require("internal/deps/cjs-module-lexer/dist/lexer");
    await init();
    cjsParse = parse;
  }
}

import { callbackMap } from "../../callbackMap.js"

const translators = new SafeMap();

export { translators, enrichCJSError }

let DECODER = null;
function assertBufferSource(body, allowString, hookName) {
  if (allowString && typeof body === 'string') {
    return;
  }
  const { isArrayBufferView, isAnyArrayBuffer } = types;
  if (isArrayBufferView(body) || isAnyArrayBuffer(body)) {
    return;
  }
  throw new ERR_INVALID_RETURN_PROPERTY_VALUE(
    `${allowString ? 'string, ' : ''}array buffer, or typed array`,
    hookName,
    'source',
    body
  );
}

function stringify(body) {
  if (typeof body === 'string') return body;
  assertBufferSource(body, false, 'transformSource');
  DECODER = DECODER === null ? new TextDecoder() : DECODER;
  return DECODER.decode(body);
}

function errPath(url) {
  const parsed = new URL(url);
  if (parsed.protocol === 'file:') {
    return fileURLToPath(parsed);
  }
  return url;
}

async function importModuleDynamically(specifier, { url }) {
  //console.log("importModuleDynamically with spec", specifier, "and url", url, new Error().stack)
  const ret = await asyncESM.ESMLoader.import(specifier, url);
  //console.log("importModuleDynamically returned", ret, new Error().stack)
  return ret
}

function createImportMetaResolve(defaultParentUrl) {
  return async function resolve(specifier, parentUrl = defaultParentUrl) {
    return PromisePrototypeCatch(
      asyncESM.ESMLoader.resolve(specifier, parentUrl),
      (error) => (
        error.code === 'ERR_UNSUPPORTED_DIR_IMPORT' ?
          error.url : PromiseReject(error))
    );
  };
}

function initializeImportMeta(meta, { url }) {
  // Alphabetical
  if (true) //experimentalImportMetaResolve)
    meta.resolve = createImportMetaResolve(url);
  meta.url = url;
}

// import { transform, default as babel } from "@babel/standalone"
import * as esm from "../../process/esm_loader.js"
// import depGraph from "es-dependency-graph"
//import { ESMLoader as AltLoader } from 'esm-loader/loader.mjs'

// Strategy for loading a standard JavaScript module.
translators.set('module', async function moduleStrategy(url, isMain) {
  //console.log("Fetching source and translating module for url", url, new Error().stack)

  let { source } = await this._getSource(
    url, { format: 'module' }, defaultGetSource);
  
  //console.log("Source fetched for url", url, "content", source.toString(), new Error().stack)

  assertBufferSource(source, true, 'getSource');
  ({ source } = await this._transformSource(
    source, { url, format: 'module' }, defaultTransformSource));
  source = stringify(source);

  const dependencies = depGraph(source);

  source = (
    babel.transform(source, {
      presets: ["env"],
      sourceType: 'module',
      filename: fileURLToPath(url),
    })
  )?.code

  //console.log("Source transformed for url", url, "content", source, new Error().stack)
  
  if (!dependencies.length) {
    // const mod = new Module();
    // await mod._compile(source, filename)
  }

  //maybeCacheSourceMap(url, source);
  debug(`Translating StandardModule ${url}`);
  const module = {
    url,
    link (addDependentJob) {
      //console.log("running link", new Error().stack)
      const test = {}
      //console.log("running init import meta", esm.initializeImportMetaObject(module, test));
      //console.log("module after init meta", module, "meta", test, test.resolve)
      //This seems to run import just like handleMainPromise?
      //console.log("import dynamic callback results", await esm.importModuleDynamicallyCallback(module, url));
      const ret = dependencies.map(async (specifier) => {
        //console.log("before link", specifier)
        //To make sure we wait before linked finishes AND so dependent modules finish loading, God willing.
        await esm.importModuleDynamicallyCallback(module, specifier)
        const dependency = await addDependentJob(specifier)
        //console.log("after link", specifier, dependency);
        return dependency
      })



      //console.log("ready for next step", module.url, dependencies, ret)
      return ret;
    },
    instantiate: async (...args) => {
      //console.log("instantiate", ...args, new Error().stack)
    },
    async evaluate (...args) {
      //console.log("evaluate", ...args, new Error().stack)
      let filename = fileURLToPath(new URL(url));
      
      //console.log("compiling", module.url, source)
      const mod = new Module(filename);
      mod.source = source
      Module._cache[filename] = mod;

      if (isMain) {
        mod._compile(source, filename)
      }
      //console.log("done evaluating")
    },
    getNamespace: (...args) => {
      //console.log("getNamespace", ...args, new Error().stack)
    }
  }
  callbackMap.set(module, {
    initializeImportMeta,
    importModuleDynamically,
  });

  return module;
});

function enrichCJSError(err) {
  if (err == null || ObjectGetPrototypeOf(err) !== SyntaxErrorPrototype) {
    return;
  }
  const stack = StringPrototypeSplit(err.stack, '\n');
  /*
  * The regular expression below targets the most common import statement
  * usage. However, some cases are not matching, cases like import statement
  * after a comment block and/or after a variable definition.
  */
  if (StringPrototypeStartsWith(err.message, 'Unexpected token \'export\'') ||
    RegExpPrototypeTest(/^\s*import(?=[ {'"*])\s*(?![ (])/, stack[1])) {
    // Emit the warning synchronously because we are in the middle of handling
    // a SyntaxError that will throw and likely terminate the process before an
    // asynchronous warning would be emitted.
    emitWarningSync(
      'To load an ES module, set "type": "module" in the package.json or use ' +
      'the .mjs extension.'
    );
  }
}

// Strategy for loading a node-style CommonJS module
const isWindows = process.platform === 'win32';
const winSepRegEx = /\//g;
translators.set('commonjs', async function commonjsStrategy(url, isMain) {
  debug(`Translating CJSModule ${url}`);

  let filename = fileURLToPath(new URL(url));
  if (isWindows)
    filename = StringPrototypeReplace(filename, winSepRegEx, '\\');

  if (!cjsParse) await initCJSParse();
  const { module, exportNames } = cjsPreparseModuleExports(filename);
  const namesWithDefault = exportNames.has('default') ?
    [...exportNames] : ['default', ...exportNames];

  return new ModuleWrap(url, undefined, namesWithDefault, function() {
    debug(`Loading CJSModule ${url}`);

    let exports;
    if (asyncESM.ESMLoader.cjsCache.has(module)) {
      exports = asyncESM.ESMLoader.cjsCache.get(module);
      asyncESM.ESMLoader.cjsCache.delete(module);
    } else {
      try {
        exports = CJSModule._load(filename, undefined, isMain);
      } catch (err) {
        enrichCJSError(err);
        throw err;
      }
    }

    for (const exportName of exportNames) {
      if (!ObjectPrototypeHasOwnProperty(exports, exportName) ||
          exportName === 'default')
        continue;
      // We might trigger a getter -> dont fail.
      let value;
      try {
        value = exports[exportName];
      } catch {}
      this.setExport(exportName, value);
    }
    this.setExport('default', exports);
  });
});

function cjsPreparseModuleExports(filename) {
  let module = CJSModule._cache[filename];
  if (module) {
    const cached = cjsParseCache.get(module);
    if (cached)
      return { module, exportNames: cached.exportNames };
  }
  const loaded = Boolean(module);
  if (!loaded) {
    module = new CJSModule(filename);
    module.filename = filename;
    module.paths = CJSModule._nodeModulePaths(module.path);
    CJSModule._cache[filename] = module;
  }

  let source;
  try {
    source = readFileSync(filename, 'utf8');
  } catch {}

  let exports, reexports;
  try {
    ({ exports, reexports } = cjsParse(source || ''));
  } catch {
    exports = [];
    reexports = [];
  }

  const exportNames = new SafeSet(new SafeArrayIterator(exports));

  // Set first for cycles.
  cjsParseCache.set(module, { source, exportNames, loaded });

  if (reexports.length) {
    module.filename = filename;
    module.paths = CJSModule._nodeModulePaths(module.path);
  }
  ArrayPrototypeForEach(reexports, (reexport) => {
    let resolved;
    try {
      resolved = CJSModule._resolveFilename(reexport, module);
    } catch {
      return;
    }
    const ext = extname(resolved);
    if ((ext === '.js' || ext === '.cjs' || !CJSModule._extensions[ext]) &&
        isAbsolute(resolved)) {
      const { exportNames: reexportNames } = cjsPreparseModuleExports(resolved);
      for (const name of reexportNames)
        exportNames.add(name);
    }
  });

  return { module, exportNames };
}

// Strategy for loading a node builtin CommonJS module that isn't
// through normal resolution
translators.set('builtin', async function builtinStrategy(url) {
  debug(`Translating BuiltinModule ${url}`);
  // Slice 'node:' scheme
  const id = StringPrototypeSlice(url, 5);
  const module = loadNativeModule(id, url);
  if (!StringPrototypeStartsWith(url, 'node:') || !module) {
    throw new ERR_UNKNOWN_BUILTIN_MODULE(url);
  }
  debug(`Loading BuiltinModule ${url}`);
  return module.getESMFacade();
});

// Strategy for loading a JSON file
translators.set('json', async function jsonStrategy(url) {
  emitExperimentalWarning('Importing JSON modules');
  debug(`Translating JSONModule ${url}`);
  debug(`Loading JSONModule ${url}`);
  const pathname = StringPrototypeStartsWith(url, 'file:') ?
    fileURLToPath(url) : null;
  let modulePath;
  let module;
  if (pathname) {
    modulePath = isWindows ?
      StringPrototypeReplace(pathname, winSepRegEx, '\\') : pathname;
    module = CJSModule._cache[modulePath];
    if (module && module.loaded) {
      const exports = module.exports;
      return new ModuleWrap(url, undefined, ['default'], function() {
        this.setExport('default', exports);
      });
    }
  }
  let { source } = await this._getSource(
    url, { format: 'json' }, defaultGetSource);
  assertBufferSource(source, true, 'getSource');
  ({ source } = await this._transformSource(
    source, { url, format: 'json' }, defaultTransformSource));
  source = stringify(source);
  if (pathname) {
    // A require call could have been called on the same file during loading and
    // that resolves synchronously. To make sure we always return the identical
    // export, we have to check again if the module already exists or not.
    module = CJSModule._cache[modulePath];
    if (module && module.loaded) {
      const exports = module.exports;
      return new ModuleWrap(url, undefined, ['default'], function() {
        this.setExport('default', exports);
      });
    }
  }
  try {
    const exports = JSONParse(stripBOM(source));
    module = {
      exports,
      loaded: true
    };
  } catch (err) {
    // TODO (BridgeAR): We could add a NodeCore error that wraps the JSON
    // parse error instead of just manipulating the original error message.
    // That would allow to add further properties and maybe additional
    // debugging information.
    err.message = errPath(url) + ': ' + err.message;
    throw err;
  }
  if (pathname) {
    CJSModule._cache[modulePath] = module;
  }
  return new ModuleWrap(url, undefined, ['default'], function() {
    debug(`Parsing JSONModule ${url}`);
    this.setExport('default', module.exports);
  });
});

// Strategy for loading a wasm module
translators.set('wasm', async function(url) {
  emitExperimentalWarning('Importing Web Assembly modules');
  let { source } = await this._getSource(
    url, { format: 'wasm' }, defaultGetSource);
  assertBufferSource(source, false, 'getSource');
  ({ source } = await this._transformSource(
    source, { url, format: 'wasm' }, defaultTransformSource));
  assertBufferSource(source, false, 'transformSource');
  debug(`Translating WASMModule ${url}`);
  let compiled;
  try {
    compiled = await WebAssembly.compile(source);
  } catch (err) {
    err.message = errPath(url) + ': ' + err.message;
    throw err;
  }

  const imports =
      ArrayPrototypeMap(WebAssembly.Module.imports(compiled),
                        ({ module }) => module);
  const exports =
    ArrayPrototypeMap(WebAssembly.Module.exports(compiled),
                      ({ name }) => name);

  return createDynamicModule(imports, exports, url, (reflect) => {
    const { exports } = new WebAssembly.Instance(compiled, reflect.imports);
    for (const expt of ObjectKeys(exports))
      reflect.exports[expt].set(exports[expt]);
  }).module;
});
