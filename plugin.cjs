"use strict";
const { ProvidePlugin } = require("webpack");
const filterObject = require("filter-obj");
const path = require("path");
const { resolve } = require("url");

const excludeObjectKeys = (object, excludeKeys) =>
  filterObject(object, (key) => !excludeKeys.includes(key));
console.log(path.resolve(__dirname, "./src/reexports/buffer.js"));
const resolves = {
  //TODO God willing: port child_process, cluster, dns, http2, perf_hooks, v8, worker_threads
  buffer: path.resolve(__dirname, "./src/reexports/buffer.js"),
  console: path.resolve(__dirname, "./src/reexports/console.js"),
  constants: path.resolve(__dirname, "./src/constants.js"),
  crypto: path.resolve(__dirname, "./src/crypto.js"),
  domain: path.resolve(__dirname, "./src/reexports/domain.js"),
  events: path.resolve(__dirname, "./src/reexports/events.js"),
  http: path.resolve(__dirname, "./src/reexports/http.js"),
  https: path.resolve(__dirname, "./src/reexports/https.js"),
  module: path.resolve(__dirname, "./src/module.js"),
  os: path.resolve(__dirname, "./src/os.js"),
  path: path.resolve(__dirname, "./src/reexports/path.js"),
  punycode: path.resolve(__dirname, "./src/reexports/punycode.js"),
  process: path.resolve(__dirname, "./src/process.js"),
  querystring: path.resolve(__dirname, "./src/reexports/querystring.js"),
  readline: path.resolve(__dirname, "./src/readline.js"),
  repl: path.resolve(__dirname, "./src/repl.js"),
  stream: path.resolve(__dirname, "./src/reexports/stream.js"),
  _stream_duplex: path.resolve(__dirname, "./src/reexports/_stream_duplex.js"),
  _stream_passthrough: path.resolve(
    __dirname,
    "./src/reexports/_stream_passthrough.js"
  ),
  _stream_readable: path.resolve(
    __dirname,
    "./src/reexports/_stream_readable.js"
  ),
  _stream_transform: path.resolve(
    __dirname,
    "./src/reexports/_stream_transform.js"
  ),
  _stream_writable: path.resolve(
    __dirname,
    "./src/reexports/_stream_writable.js"
  ),
  string_decoder: path.resolve(__dirname, "./src/reexports/string_decoder.js"),
  sys: path.resolve(__dirname, "./src/reexports/util.js"),
  timers: path.resolve(__dirname, "./src/reexports/timers.js"),
  tls: path.resolve(__dirname, "./src/reexports/tls.js"),
  tty: path.resolve(__dirname, "./src/reexports/tty.js"),
  url: path.resolve(__dirname, "./src/url.js"),
  util: path.resolve(__dirname, "./src/reexports/util.js"),
  vm: path.resolve(__dirname, "./src/reexports/vm.js"),
  zlib: path.resolve(__dirname, "./src/reexports/zlib.js"),

  child_process: false,
  cluster: false,
  dns: false,
  http2: false,
  perf_hooks: false,
  v8: false,
  worker_threads: false,
};

module.exports = class NodePolyfillPlugin {
  constructor(options = {}) {
    this.options = {
      excludeAliases: [],
      ...options,
    };
  }

  apply(compiler) {
    compiler.options.plugins.push(
      new ProvidePlugin(
        excludeObjectKeys(
          {
            Buffer: [path.resolve(__dirname, "src/buffer/"), "Buffer"],
            console: require.resolve("console-browserify"),
            process: path.resolve(__dirname, "src/process"),
          },
          this.options.excludeAliases
        )
      )
    );

    compiler.options.resolve.alias = {
      ...excludeObjectKeys(resolves, this.options.excludeAliases),
      ...compiler.options.resolve.alias,
    };

    compiler.options.resolve.fallback = {
      ...excludeObjectKeys(resolves, this.options.excludeAliases),
      ...compiler.options.resolve.fallback,
    };
  }
};
