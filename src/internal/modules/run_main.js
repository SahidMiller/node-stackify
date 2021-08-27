'use strict';

import {
  StringPrototypeEndsWith,
} from "@darkwolf/primordials";
import { Module, toRealPath, readPackageScope } from './cjs/loader.js';
// const { getOptionValue } = require('internal/options');
import path from 'path';

function resolveMainPath(main) {
  // Note extension resolution for the main entry point can be deprecated in a
  // future major.
  // Module._findPath is monkey-patchable here.
  let mainPath = Module._findPath(path.resolve(main), null, true);
  if (!mainPath)
    return;

  const preserveSymlinksMain = false //getOptionValue('--preserve-symlinks-main');
  if (!preserveSymlinksMain)
    mainPath = toRealPath(mainPath);

  return mainPath;
}



function shouldUseESMLoader(mainPath) {
  const userLoader = true //getOptionValue('--experimental-loader');
  if (userLoader)
    return true;
  const esModuleSpecifierResolution =
    false //getOptionValue('--experimental-specifier-resolution');
  if (esModuleSpecifierResolution === 'node')
    return true;
  // Determine the module format of the main
  if (mainPath && StringPrototypeEndsWith(mainPath, '.mjs'))
    return true;
  if (!mainPath || StringPrototypeEndsWith(mainPath, '.cjs'))
    return false;
  const pkg = readPackageScope(mainPath);
  return pkg && pkg.data.type === 'module';
}

import * as esmLoader from '../process/esm_loader.js'
import { pathToFileURL } from '../url.js';

function runMainESM(mainPath) {
  //console.log("running main esm at path", mainPath);
  handleMainPromise(esmLoader.loadESM((ESMLoader) => {
    const main = path.isAbsolute(mainPath) ?
      pathToFileURL(mainPath).href : mainPath;
    return ESMLoader.import(main);
  }));
}

async function handleMainPromise(promise) {
  // Handle a Promise from running code that potentially does Top-Level Await.
  // In that case, it makes sense to set the exit code to a specific non-zero
  // value if the main code never finishes running.
  function handler() {
    if (process.exitCode === undefined)
      process.exitCode = 13;
  }
  process.on('exit', handler);
  try {
    return await promise;
  } finally {
    process.off('exit', handler);
  }
}

// For backwards compatibility, we have to run a bunch of
// monkey-patchable code that belongs to the CJS loader (exposed by
// `require('module')`) even when the entry point is ESM.
function executeUserEntryPoint(main = process.argv[1]) {
  const resolvedMain = resolveMainPath(main);
  const useESMLoader = false //shouldUseESMLoader(resolvedMain);
  if (useESMLoader) {
    runMainESM(resolvedMain || main);
  } else {
    // Module._load is the monkey-patchable CJS module loader.
    Module._load(main, null, true);
  }
}

export {
  executeUserEntryPoint,
  handleMainPromise,
};
