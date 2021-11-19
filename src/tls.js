import rootCertificates from "./tls/rootCertificates.js";
import { checkServerIdentity } from "./tls/checkServerIdentity.js";
import { TLSSocket, connect } from "./tls/socket.js";
import { Server, createServer } from "./tls/server.js";

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
