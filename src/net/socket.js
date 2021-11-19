import { Duplex, PassThrough } from "stream";
import {
  normalizedArgsSymbol,
  _normalizeArgs,
} from "../internal/net.js";
import { codes } from "../internal/errors.js"
const { ERR_SOCKET_CLOSED } = codes;

/**
 * Convert async iterator stream to socket
 * @param {Object} options options.stream: required to convert to a socket
 * @returns {Socket} socket like class using underlying stream
 */
function Socket(options) {
  options = options || {};

  if (!(this instanceof Socket)) return new Socket(options);

  //TODO God willing: Implement required net.Socket convensions, setTimeout
  this.setTimeout = () => {};
  this.setNoDelay = () => {};
  this.setKeepAlive = () => {};
  this.ref = () => {};
  this.unref = () => {};
  this.connecting = false;
  if (options.remoteAddress) {
    const { family, port, address } = options.remoteAddress;
    this.remoteFamily = family;
    this.remotePort = port;
    this.remoteAddress = address;
  }

  if (options.address) {
    const { family, port, address } = options.address;
    this.localFamily = family;
    this.localPort = port;
    this.localAddress = address;
    this._address = options.address;
  }

  Duplex.call(this, options);

  this.outgoingStream = new PassThrough()
  this.incomingStream = new PassThrough()
  this.incomingStream.on("data", (data) => {
    this.push(data);
  })
}

Object.setPrototypeOf(Socket.prototype, Duplex.prototype);
Object.setPrototypeOf(Socket, Duplex);

Socket.prototype._read = function() {
}

Socket.prototype._write = function(chunk, enc, done) {
  if (!this._connected) {
    throw new ERR_SOCKET_CLOSED();
  }

  this.outgoingStream.write(chunk, enc, done)
}

Socket.prototype.address = function() {
  if (this._connected) {
    return this._address
  }
}

Socket.prototype.connect = function(...args) {
  try {
    let normalized;
    // If passed an array, it's treated as an array of arguments that have
    // already been normalized (so we don't normalize more than once). This has
    // been solved before in https://github.com/nodejs/node/pull/12342, but was
    // reverted as it had unintended side effects.
    if (Array.isArray(args[0]) && args[0][normalizedArgsSymbol]) {
      normalized = args[0];
    } else {
      normalized = _normalizeArgs(args);
    }

    const options = normalized[0];
    const cb = normalized[1];

    this.once("connect", () => {
      this._connected = true;
      typeof cb === 'function' && cb();
    });

    const connectFn = this.internalConnect || options.connect

    if (!connectFn) {
      throw new Error("No connect method. Implement this.internalConnect or pass options.connect");
    }

    connectFn.call(this, options, cb);

    return this;
  
  } catch (err) {
    
    this.emit('error', err);
  }
}

/**
 *
 * @param {*} multiaddr multiaddress of libp2p proxy
 * @param {*} proto p2p protocol name
 * @returns
 */
function connect(...args) {
  const normalized = _normalizeArgs(args);
  const [options] = normalized;

  if (options.timeout) {
    socket.setTimeout(options.timeout);
  }

  const socket = new Socket(options);
  return socket.connect(normalized);
}

export { Socket, connect };
