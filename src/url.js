import {
  URL,
  URLSearchParams,
  domainToASCII,
  domainToUnicode,
  fileURLToPath,
  pathToFileURL,
  urlToHttpOptions,
} from "./internal/url.js";

import {
  parse,
  resolve,
  resolveObject,
  format,
  Url,
} from "url_browserify";

export {
  // Original API
  Url,
  parse,
  resolve,
  resolveObject,
  format,
  // WHATWG API
  URL,
  URLSearchParams,
  domainToASCII,
  domainToUnicode,
  // Utilities
  pathToFileURL,
  fileURLToPath,
  urlToHttpOptions,
};

import * as self from "./url.js";
export default self;
