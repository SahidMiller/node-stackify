//TODO God willing: since depending on node-primordials, either prebuild with correct, modify source, or provide polyfills/shims for global and others
// issue with ES6 is that our polyfill might need to be included and tough to do that for each. TGIMA.
export * as node from "./src/internal/modules/run_main.js";

export * as buffer from "./src/reexports/buffer.js";
export * as console from "./src/reexports/console.js";
export * as constants from "./src/constants.js";
export * as crypto from "./src/crypto.js";
export * as domain from "./src/reexports/domain.js";
export * as events from "./src/reexports/events.js";
export * as http from "./src/reexports/http.js";
export * as https from "./src/reexports/https.js";
export * as module from "./src/module.js";
export * as os from "./src/os.js";
export * as path from "./src/reexports/path.js";
export * as punycode from "./src/reexports/punycode.js";
export * as process from "./src/process.js";
export * as querystring from "./src/reexports/querystring.js";
export * as readline from "./src/readline.js";
export * as repl from "./src/repl.js";
export * as stream from "./src/reexports/stream.js";
export * as _stream_duplex from "./src/reexports/_stream_duplex.js";
export * as _stream_passthrough from "./src/reexports/_stream_passthrough.js";
export * as _stream_readable from "./src/reexports/_stream_readable.js";
export * as _stream_transform from "./src/reexports/_stream_transform.js";
export * as _stream_writable from "./src/reexports/_stream_writable.js";
export * as string_decoder from "./src/reexports/string_decoder.js";
export * as sys from "./src/reexports/util.js";
export * as timers from "./src/reexports/timers.js";
export * as tls from "./src/reexports/tls.js";
export * as tty from "./src/reexports/tty.js";
export * as url from "./src/url.js";
export * as util from "./src/reexports/util.js";
export * as vm from "./src/reexports/vm.js";
export * as zlib from "./src/reexports/zlib.js";
