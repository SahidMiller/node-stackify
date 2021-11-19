import rootCertificates from "./tls/internals/rootCertificates.js";
import { checkServerIdentity } from "./tls/internals/checkServerIdentity.js";
import { TLSSocket, connect } from "./tls/internals/socket.js";
import { Server, createServer } from "./tls/internals/server.js";

import * as self from "./tls.js";

export default self;

export {
  checkServerIdentity,
  TLSSocket,
  connect,
  Server,
  createServer,
  rootCertificates,
};
