'use strict';

import { RegExpPrototypeExec, decodeURIComponent } from "@darkwolf/primordials";
// const { getOptionValue } = require('internal/options');
// Do not eagerly grab .manifest, it may be in TDZ
// const policy = getOptionValue('--experimental-policy') ?
//   require('internal/process/policy') :
//   null;

const policy = null;
import { Buffer } from "buffer";

// const fs = require('internal/fs/promises').exports;
import fs from "fs";
import { URL } from "../../url.js";
import { codes } from "../../errors.js";

const {
  ERR_INVALID_URL,
  ERR_INVALID_URL_SCHEME,
} = codes
const readFileAsync = (source) => new Promise((resolve, reject) => fs.readFile(source, (err, data) => {
  if (err) reject(err)
  resolve(data);
}));

const DATA_URL_PATTERN = /^[^/]+\/[^,;]+(?:[^,]*?)(;base64)?,([\s\S]*)$/;

async function defaultGetSource(url, { format } = {}, defaultGetSource) {
  const parsed = new URL(url);
  let source;
  if (parsed.protocol === 'file:') {
    source = await readFileAsync(parsed);
  } else if (parsed.protocol === 'data:') {
    const match = RegExpPrototypeExec(DATA_URL_PATTERN, parsed.pathname);
    if (!match) {
      throw new ERR_INVALID_URL(url);
    }
    const { 1: base64, 2: body } = match;
    source = Buffer.from(decodeURIComponent(body), base64 ? 'base64' : 'utf8');
  } else {
    throw new ERR_INVALID_URL_SCHEME(['file', 'data']);
  }
  if (policy?.manifest) {
    policy.manifest.assertIntegrity(parsed, source);
  }
  return { source };
}
export { defaultGetSource };
