'use strict';

import { FunctionPrototypeBind, Symbol } from "@darkwolf/primordials";

import { codes } from './errors.js';
//TODO God willing: could provide basic udp_wrap for some situation, God willing.
import { UDP } from 'udp_wrap';
// const { guessHandleType } = internalBinding('util');
import { isInt32, validateFunction } from './validators.js';

const UV_EINVAL = -4071;

const {
  ERR_SOCKET_BAD_TYPE,
} = codes;

const kStateSymbol = Symbol('state symbol');
let dns;  // Lazy load for startup performance.
import("dns").then(mod => dns = mod);

function lookup4(lookup, address, callback) {
  return lookup(address || '127.0.0.1', 4, callback);
}


function lookup6(lookup, address, callback) {
  return lookup(address || '::1', 6, callback);
}

function newHandle(type, lookup) {
  if (lookup === undefined) {
    lookup = dns.lookup;
  } else {
    validateFunction(lookup, 'lookup');
  }

  if (type === 'udp4') {
    const handle = new UDP();

    handle.lookup = FunctionPrototypeBind(lookup4, handle, lookup);
    return handle;
  }

  if (type === 'udp6') {
    const handle = new UDP();

    handle.lookup = FunctionPrototypeBind(lookup6, handle, lookup);
    handle.bind = handle.bind6;
    handle.connect = handle.connect6;
    handle.send = handle.send6;
    return handle;
  }

  throw new ERR_SOCKET_BAD_TYPE();
}


function _createSocketHandle(address, port, addressType, fd, flags) {
  const handle = newHandle(addressType);
  let err;

  // if (isInt32(fd) && fd > 0) {
  //   const type = guessHandleType(fd);
  //   if (type !== 'UDP') {
  //     err = UV_EINVAL;
  //   } else {
  //     err = handle.open(fd);
  //   }
  // } else 
  
  if (port || address) {
    err = handle.bind(address, port || 0, flags);
  }

  if (err) {
    handle.close();
    return err;
  }

  return handle;
}

function assignDefaultHandle(handle) {
  Object.assign({
    bufferSize() {

    },
    close() {
      
    },
    recvStart() {

    },
    lookup() {

    },
    bind() {

    },
    send() {

    },
    open() {

    },
    disconnect() {

    },
    getsockname() {

    },
    getpeername() {

    },
    setBroadcast() {

    },
    setTTL() { 

    },
    setMulticastTTL() { 

    },
    setMulticastLoopback() { 

    },
    setMulticastInterface() { 

    },
    addMembership() { 

    },
    dropMembership() { 

    },
    addSourceSpecificMembership() { 

    },
    dropSourceSpecificMembership() { 

    },
    recvStop() { 

    },
    ref() { 

    },
    unref() { 

    }
  }, handle);
}

export default {
  kStateSymbol,
  _createSocketHandle,
  newHandle,
  assignDefaultHandle
};

export {
  kStateSymbol,
  _createSocketHandle,
  newHandle,
  assignDefaultHandle
};
