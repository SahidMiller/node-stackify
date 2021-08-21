'use strict';

import ModuleJob from "./module_job.js";
import { SafeMap } from "@darkwolf/primordials";
import { debuglog } from "util";
let debug = debuglog("esm", (fn) => {
  debug = fn;
});
import { codes } from "../../errors.js";
const { ERR_INVALID_ARG_TYPE } = codes
import { validateString } from "../../validators.js";

// Tracks the state of the loader-level module cache
class ModuleMap extends SafeMap {
  constructor(i) { super(i); } // eslint-disable-line no-useless-constructor
  get(url) {
    validateString(url, 'url');
    return super.get(url);
  }
  set(url, job) {
    validateString(url, 'url');
    if (job instanceof ModuleJob !== true &&
        typeof job !== 'function') {
      throw new ERR_INVALID_ARG_TYPE('job', 'ModuleJob', job);
    }
    debug(`Storing ${url} in ModuleMap`);
    return super.set(url, job);
  }
  has(url) {
    validateString(url, 'url');
    return super.has(url);
  }
}
export default ModuleMap;
