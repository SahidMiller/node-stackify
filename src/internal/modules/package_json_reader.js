'use strict';

import { SafeMap } from "@darkwolf/primordials";
// const { internalModuleReadJSON } = internalBinding('fs');
import { pathToFileURL } from "../url.js";
import { toNamespacedPath } from "path";
// import { getOptionValue } from "internal/options";

const cache = new SafeMap();

let manifest;

/**
 *
 * @param {string} jsonPath
 */
function read(jsonPath) {
  if (cache.has(jsonPath)) {
    return cache.get(jsonPath);
  }

  const { 0: string, 1: containsKeys } = internalModuleReadJSON(
    toNamespacedPath(jsonPath)
  );
  const result = { string, containsKeys };
  if (string !== undefined) {
    if (manifest === undefined) {
      manifest = getOptionValue('--experimental-policy') ?
        require('internal/process/policy').manifest :
        null;
    }
    if (manifest !== null) {
      const jsonURL = pathToFileURL(jsonPath);
      manifest.assertIntegrity(jsonURL, string);
    }
  }
  cache.set(jsonPath, result);
  return result;
}

export default { read };
