'use strict';

import { codes } from '../errors.js'
const {
  ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING,
} = codes
import { Loader } from "../modules/esm/loader.js";
import { hasUncaughtExceptionCaptureCallback } from "./execution.js";
import { pathToFileURL } from "../url.js";
import { getModuleFromWrap } from "../vm/module.js";
import { callbackMap } from "../callbackMap.js"

const initializeImportMetaObject = function(wrap, meta) {
  if (callbackMap.has(wrap)) {
    const { initializeImportMeta } = callbackMap.get(wrap);
    if (initializeImportMeta !== undefined) {
      initializeImportMeta(meta, getModuleFromWrap(wrap) || wrap);
    }
  }
};

const importModuleDynamicallyCallback = async function(wrap, specifier) {
  if (callbackMap.has(wrap)) {
    const { importModuleDynamically } = callbackMap.get(wrap);
    if (importModuleDynamically !== undefined) {
      return importModuleDynamically(
        specifier, getModuleFromWrap(wrap) || wrap);
    }
  }
  throw new ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING();
};


import { emitExperimentalWarning } from "../util.js";
import * as AltLoader from "esbuild-esm-loader"

let ESMLoader = new Loader();
ESMLoader.hook(AltLoader);
ESMLoader.runGlobalPreloadCode();

async function initializeLoader() {
  //import { getOptionValue } from "internal/options";
  const userLoader = false; //getOptionValue('--experimental-loader');
  if (!userLoader)
    return;
  let cwd;
  try {
    cwd = process.cwd() + '/';
  } catch {
    cwd = 'file:///';
  }
  // If --experimental-loader is specified, create a loader with user hooks.
  // Otherwise create the default loader.
  emitExperimentalWarning('--experimental-loader');
  return (async () => {
    const hooks =
        await ESMLoader.import(userLoader, pathToFileURL(cwd).href);
    // console.log("salam init")
    ESMLoader = new Loader();
    ESMLoader.hook(hooks);
    ESMLoader.runGlobalPreloadCode();
    return exports.ESMLoader = ESMLoader;
  })();
}

const loadESM = async function loadESM(callback) {
  try {
    //await initializeLoader();
    await callback(ESMLoader);
  } catch (err) {
    if (hasUncaughtExceptionCaptureCallback()) {
      process._fatalException(err);
      return;
    }
    console.log(err)
    // internalBinding('errors').triggerUncaughtException(
    //   err,
    //   true /* fromPromise */
    // );
  }
};

export {
  initializeImportMetaObject,
  importModuleDynamicallyCallback,
  ESMLoader,
  loadESM
}