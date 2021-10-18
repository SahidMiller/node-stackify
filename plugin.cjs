"use strict";
const { ProvidePlugin } = require("webpack");
const filterObject = require("filter-obj");
const path = require("path");

const excludeObjectKeys = (object, excludeKeys) =>
  filterObject(object, (key) => !excludeKeys.includes(key));

const resolves = {
  //TODO God willing: port child_process, cluster, dns, http2, perf_hooks, v8, worker_threads
  assert: path.resolve(__dirname, "./src/reexports/assert.cjs"),
  buffer: path.resolve(__dirname, "./src/reexports/buffer.js"),
  child_process: path.resolve(__dirname, "./src/child_process.js"),
  console: path.resolve(__dirname, "./src/console.js"),
  constants: path.resolve(__dirname, "./src/constants.js"),
  crypto: path.resolve(__dirname, "./src/crypto.js"),
  domain: path.resolve(__dirname, "./src/reexports/domain.js"),
  //Events apparently isn't cjs compatible since it's a constructor
  events: path.resolve(__dirname, "./src/reexports/events.cjs"),
  fs: path.resolve(__dirname, "./src/fs.js"),
  http: path.resolve(__dirname, "./src/reexports/http.js"),
  https: path.resolve(__dirname, "./src/reexports/https.js"),
  //module: path.resolve(__dirname, "./src/module.js"),
  net: path.resolve(__dirname, "./src/reexports/net.js"),
  os: path.resolve(__dirname, "./src/os.js"),
  path: path.resolve(__dirname, "./src/reexports/path.js"),
  punycode: path.resolve(__dirname, "./src/reexports/punycode.js"),
  process: path.resolve(__dirname, "./src/process.cjs"),
  querystring: path.resolve(__dirname, "./src/reexports/querystring.js"),
  readline: path.resolve(__dirname, "./src/readline.js"),
  repl: path.resolve(__dirname, "./src/repl.js"),
  stream: path.resolve(__dirname, "./src/reexports/stream.cjs"),
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
  url: path.resolve(__dirname, "./src/url.js"),
  util: path.resolve(__dirname, "./src/reexports/util.js"),
  vm: path.resolve(__dirname, "./src/reexports/vm.js"),
  zlib: path.resolve(__dirname, "./src/reexports/zlib.cjs"),

  cluster: false,
  dns: false,
  http2: false,
  perf_hooks: false,
  v8: false,
  worker_threads: false,

  "assert_browserify": require.resolve('assert/'),
  "util_browserify": require.resolve('util/'),
  "url_browserify": require.resolve('url/'),
  "string_decoder_browserify": require.resolve('string_decoder/'),
  "punycode_browserify": require.resolve('punycode/'),
  "process_browserify": require.resolve('process/browser'),
  "events_browserify": require.resolve('events/'),
  "buffer_browserify": require.resolve('buffer/'),
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
            Buffer: ["buffer", "Buffer"],
            console: require.resolve("console-browserify"),
            process: path.resolve(__dirname, "src/process.cjs"),
            global: path.resolve(__dirname, "src/global.cjs")
          },
          this.options.excludeAliases
        )
      )
    );
    const excludedAliases = excludeObjectKeys(resolves, this.options.excludeAliases)

    compiler.options.resolve.alias = {
      ...excludedAliases,
      ...compiler.options.resolve.alias,
    };

    compiler.options.resolve.fallback = {
      ...excludedAliases,
      ...compiler.options.resolve.fallback,
    };
  }
};
