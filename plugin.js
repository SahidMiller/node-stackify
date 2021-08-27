"use strict";
import { ProvidePlugin } from "webpack";
import filterObject from "filter-obj";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(import.meta.url);

const excludeObjectKeys = (object, excludeKeys) =>
  filterObject(object, (key) => !excludeKeys.includes(key));

class NodePolyfillPlugin {
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
            console: path.resolve(__dirname, "src/console"),
            process: path.resolve(__dirname, "src/process"),
          },
          this.options.excludeAliases
        )
      )
    );

    compiler.options.resolve.fallback = {
      ...excludeObjectKeys(
        {
          //TODO God willing: port child_process, cluster, dns, http2, perf_hooks, v8, worker_threads
          assert: path.resolve(__dirname, "src/assert"),
          buffer: path.resolve(__dirname, "src/buffer"),
          child_process: false,
          cluster: false,
          console: path.resolve(__dirname, "src/console"),
          constants: path.resolve(__dirname, "src/constants"),
          crypto: path.resolve(__dirname, "src/crypto"),
          dns: false,
          domain: path.resolve(__dirname, "src/domain"),
          events: path.resolve(__dirname, "src/events"),
          fs: path.resolve(__dirname, "src/fs"),

          http: path.resolve(__dirname, "src/http"),
          https: path.resolve(__dirname, "src/https"),
          http2: false,
          net: path.resolve(__dirname, "src/net"),
          os: path.resolve(__dirname, "src/os"),
          path: path.resolve(__dirname, "src/path"),
          perf_hooks: false,

          punycode: path.resolve(__dirname, "src/punycode"),
          process: path.resolve(__dirname, "src/process"),
          querystring: path.resolve(__dirname, "src/querystring"),
          stream: path.resolve(__dirname, "src/stream"),
          /* eslint-disable camelcase */
          _stream_duplex: path.resolve(__dirname, "src/_stream_duplex"),
          _stream_passthrough: path.resolve(
            __dirname,
            "src/_stream_passthrough"
          ),
          _stream_readable: path.resolve(__dirname, "src/_stream_readable"),
          _stream_transform: path.resolve(__dirname, "src/_stream_transform"),
          _stream_writable: path.resolve(__dirname, "src/_stream_writable"),
          string_decoder: path.resolve(__dirname, "src/string_decoder"),
          /* eslint-enable camelcase */
          sys: path.resolve(__dirname, "src/util"),
          timers: path.resolve(__dirname, "src/timers"),
          tls: path.resolve(__dirname, "src/tls"),
          tty: path.resolve(__dirname, "src/tty"),
          url: path.resolve(__dirname, "src/url"),
          util: path.resolve(__dirname, "src/util"),
          vm: path.resolve(__dirname, "src/vm"),
          v8: false,
          worker_threads: false,
          zlib: path.resolve(__dirname, "src/zlib"),
        },
        this.options.excludeAliases
      ),
      ...compiler.options.resolve.fallback,
    };
  }
}

export { NodePolyfillPlugin };
export default NodePolyfillPlugin;
