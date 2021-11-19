module.exports = function getBuiltins(additional = {}) {
  //TODO God willing: rather than including builtins on build, have modules fetch via fs using module loader.

  return {
    events: require('events'),
    fs: globalThis.fs,
    path: require("path"),
    child_process: require("child_process"),
    url: require("url"),
    readline: require("readline"),
    util: require("util"),
    assert: require("assert"),
    stream: require("stream"),
    os: require("os"),
    buffer: require("buffer"),
    crypto: require("crypto"),
    zlib: require("zlib"),
    vm: require("vm"),
    http: require("http"),
    https: require("https"),
    querystring: require("querystring"),
    worker_threads: {},
    string_decoder: require("string_decoder"),
    constants: require("constants"),
    Buffer: require("buffer").Buffer,
    dgram: require("dgram"),
    "graceful-fs": globalThis.fs,
    net: require("net"),
    tls: require("tls"),
    dns: require("dns"),
    tty: require("tty"),
    ...additional,
  };
}