'use strict';

import {
  globalThis,
} from "@darkwolf/primordials";

import path from "path";

import { codes } from "../errors.js";

const {
  ERR_INVALID_ARG_TYPE,
  ERR_UNCAUGHT_EXCEPTION_CAPTURE_ALREADY_SET,
  ERR_EVAL_ESM_CANNOT_PRINT,
} = codes;

// const {
//   executionAsyncId,
//   clearDefaultTriggerAsyncId,
//   clearAsyncIdStack,
//   hasAsyncIdStack,
//   afterHooksExist,
//   emitAfter
// } = require('internal/async_hooks');

// shouldAbortOnUncaughtToggle is a typed array for faster
// communication with JS.
// const { shouldAbortOnUncaughtToggle } = internalBinding('util');

function tryGetCwd() {
  try {
    return process.cwd();
  } catch {
    // getcwd(3) can fail if the current working directory has been deleted.
    // Fall back to the directory name of the (absolute) executable path.
    // It's not really correct but what are the alternatives?
    return path.dirname(process.execPath);
  }
}

import { loadESM } from "./esm_loader.js";
import { handleMainPromise } from "../modules/run_main.js";

function evalModule(source, print) {
  console.log("eval module")
  if (print) {
    throw new ERR_EVAL_ESM_CANNOT_PRINT();
  }
  return handleMainPromise(loadESM(async (loader) => {
    const { result } = await loader.eval(source);
    if (print) {
      console.log(result);
    }
  }));
}

import { Module as CJSModule } from "../modules/cjs/loader.js";
import { kVmBreakFirstLineSymbol } from "../util.js";
import { pathToFileURL } from "../url.js";

import * as asyncESM from "./esm_loader.js";

function evalScript(name, body, breakFirstLine, print) {
  console.log("BismAllah", new Error().stack);
  const cwd = tryGetCwd();
  const origModule = globalThis.module;  // Set e.g. when called from the REPL.

  const module = new CJSModule(name);
  module.filename = path.join(cwd, name);
  module.paths = CJSModule._nodeModulePaths(cwd);

  const baseUrl = pathToFileURL(module.filename).href;

  // Create wrapper for cache entry
  const script = `
    globalThis.module = module;
    globalThis.exports = exports;
    globalThis.__dirname = __dirname;
    globalThis.require = require;
    return (main) => main();
  `;
  globalThis.__filename = name;
  const result = module._compile(script, `${name}-wrapper`)(() =>
    require('vm').runInThisContext(body, {
      filename: name,
      displayErrors: true,
      [kVmBreakFirstLineSymbol]: !!breakFirstLine,
      async importModuleDynamically(specifier) {
        const loader = await asyncESM.ESMLoader;
        return loader.import(specifier, baseUrl);
      }
    }));
  if (print) {
    console.log(result);
  }

  if (origModule !== undefined)
    globalThis.module = origModule;
}

const exceptionHandlerState = {
  captureFn: null,
  reportFlag: false
};

function setUncaughtExceptionCaptureCallback(fn) {
  if (fn === null) {
    exceptionHandlerState.captureFn = fn;
    shouldAbortOnUncaughtToggle[0] = 1;
    process.report.reportOnUncaughtException = exceptionHandlerState.reportFlag;
    return;
  }
  if (typeof fn !== 'function') {
    throw new ERR_INVALID_ARG_TYPE('fn', ['Function', 'null'], fn);
  }
  if (exceptionHandlerState.captureFn !== null) {
    throw new ERR_UNCAUGHT_EXCEPTION_CAPTURE_ALREADY_SET();
  }
  exceptionHandlerState.captureFn = fn;
  shouldAbortOnUncaughtToggle[0] = 0;
  exceptionHandlerState.reportFlag =
    process.report.reportOnUncaughtException === true;
  process.report.reportOnUncaughtException = false;
}

function hasUncaughtExceptionCaptureCallback() {
  return exceptionHandlerState.captureFn !== null;
}

function noop() {}

// XXX(joyeecheung): for some reason this cannot be defined at the top-level
// and exported to be written to process._fatalException, it has to be
// returned as an *anonymous function* wrapped inside a factory function,
// otherwise it breaks the test-timers.setInterval async hooks test -
// this may indicate that node::errors::TriggerUncaughtException() should
// fix up the callback scope before calling into process._fatalException,
// or this function should take extra care of the async hooks before it
// schedules a setImmediate.
function createOnGlobalUncaughtException() {
  // The C++ land node::errors::TriggerUncaughtException() will
  // exit the process if it returns false, and continue execution if it
  // returns true (which indicates that the exception is handled by the user).
  return (er, fromPromise) => {
    // It's possible that defaultTriggerAsyncId was set for a constructor
    // call that threw and was never cleared. So clear it now.
    clearDefaultTriggerAsyncId();

    // If diagnostic reporting is enabled, call into its handler to see
    // whether it is interested in handling the situation.
    // Ignore if the error is scoped inside a domain.
    // use == in the checks as we want to allow for null and undefined
    if (er == null || er.domain == null) {
      try {
        const report = internalBinding('report');
        if (report != null && report.shouldReportOnUncaughtException()) {
          report.writeReport(
            typeof er?.message === 'string' ?
              er.message :
              'Exception',
            'Exception',
            null,
            er ? er : {});
        }
      } catch {}  // Ignore the exception. Diagnostic reporting is unavailable.
    }

    const type = fromPromise ? 'unhandledRejection' : 'uncaughtException';
    process.emit('uncaughtExceptionMonitor', er, type);
    if (exceptionHandlerState.captureFn !== null) {
      exceptionHandlerState.captureFn(er);
    } else if (!process.emit('uncaughtException', er, type)) {
      // If someone handled it, then great. Otherwise, die in C++ land
      // since that means that we'll exit the process, emit the 'exit' event.
      try {
        if (!process._exiting) {
          process._exiting = true;
          process.exitCode = 1;
          process.emit('exit', 1);
        }
      } catch {
        // Nothing to be done about it at this point.
      }
      return false;
    }

    // If we handled an error, then make sure any ticks get processed
    // by ensuring that the next Immediate cycle isn't empty.
    require('timers').setImmediate(noop);

    // Emit the after() hooks now that the exception has been handled.
    if (afterHooksExist()) {
      do {
        emitAfter(executionAsyncId());
      } while (hasAsyncIdStack());
    }
    // And completely empty the id stack, including anything that may be
    // cached on the native side.
    clearAsyncIdStack();

    return true;
  };
}

function readStdin(callback) {
  process.stdin.setEncoding('utf8');

  let code = '';
  process.stdin.on('data', (d) => {
    code += d;
  });

  process.stdin.on('end', () => {
    callback(code);
  });
}

const onGlobalUncaughtException = createOnGlobalUncaughtException();

export {
  readStdin,
  tryGetCwd,
  evalModule,
  evalScript,
  onGlobalUncaughtException,
  setUncaughtExceptionCaptureCallback,
  hasUncaughtExceptionCaptureCallback
};
