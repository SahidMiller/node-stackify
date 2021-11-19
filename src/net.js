//TODO God willing: add similar isIP, isIPv4/6 types for multiaddresses and hops
//TODO God willing: blocklist and Server could be useful.

import { Server, createServer, normalizeArgs as normalizeServerArgs } from "./net/server.js";
import { Socket, connect } from "./net/internals/socket.js.js";
export * from "./internal/net.js";

import * as self from "./net.js";
export default self;

export {
  connect,
  connect as createConnection,
  Socket,
  Socket as Stream,
  Server,
  createServer,
  normalizeServerArgs
};
