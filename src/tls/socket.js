import { Socket, _normalizeArgs } from "net";
import { _extend } from "util";
import { Duplex, PassThrough, Transform } from "stream";
import forge from "node-forge";

import rootCerts from "./rootCertificates.js";
import { checkServerIdentity } from "./checkServerIdentity.js";

// Compatibility shim for the browser
// Compatibility shim for the browser
if (forge.forge) {
  forge = forge.forge;
}

export class TLSSocket extends Duplex {
  constructor(socket, options) {
    //Wrap socket with TLS commands, God willing.
    //Create new socket if none passed, God willing.
    super();

    this._options = options;
    this._secureEstablished = false;
    this._chunks = [];

    // Just a documented property to make secure sockets
    // distinguishable from regular ones.
    this.encrypted = true;

    this.incomingStream = new PassThrough();
    this.securedOutgoingStream = new PassThrough();

    this.incomingStream.on("data", (chunk) => {
      const data = Buffer.from(chunk, "binary");
      
      this.log("[tls] recieved from socket:", data.toString("hex"));
      this.ssl.process(data.toString("binary"));
    });

    this.outgoingStream = new Transform({
      transform: (chunk, encoding, done) => {
        
        const result = this.ssl.prepare(chunk);
        
        if (result === false) {
          done("Error while packaging data into a TLS record");
        } else {
          done(null)
        }
      }
    });
    
    this.incomingStream.on('error', (err) => {
      console.log("incoming tls stream err: ", err)
      this.emit(err)
    })
    
    this.outgoingStream.on('error', (err) => {
      console.log("outgoing tls stream err: ", err)
      this.emit(err)
    })

    this.securedOutgoingStream.on('error', (err) => {
      console.log("secured outgoing tls stream err: ", err)
      this.emit(err)
    })
    
    this.outgoingStream.cork();

    this._connecting = true;
  }
  
  init() {
    const self = this;
    const options = this._options;
    const rootCertificates = options.rootCertificates || [];

    //If no root certificates but no cert or rejectUnauthorized is true, then stop.
    if (
      !rootCertificates.length &&
      !options.servername &&
      !options.rejectUnauthorized
    ) {
      throw new Error(
        "Cannot verify nor skip verification. Provide options.rootCertificates or set options.rejectUnauthorized to false"
      );
    }

    //TODO God willing: if any errors swalled by ssl, make sure to emit ourselves
    const caStore = this.createCaStore();
    const sslOptions = {
      server: options.isServer,
      caStore: caStore,
      verify: function (connection, verified, depth, certs) {
        const currentCert = certs[depth];

        if (!options.rejectUnauthorized || !options.servername) {
          self.log("[tls] server certificate verification skipped");
          return true;
        }

        if (depth === 0) {
          const cn = currentCert.subject.getField("CN").value;
          const subjectAltNames = currentCert.getExtension("subjectAltName");

          if (
            !checkServerIdentity(
              options.servername,
              cn,
              subjectAltNames && subjectAltNames.altNames,
              currentCert
            )
          ) {
            verified = {
              alert: forge.tls.Alert.Description.bad_certificate,
              message: "Certificate common name does not match hostname.",
            };
            console.warn("[tls] " + cn + " !== " + options.servername);
          }

          try {
            if (forge.pki.verifyCertificateChain(caStore, certs)) {
              caStore.addCertificate(currentCert);
            } else {
              self.log("[tls] failed to verify certificate chain");
              return false;
            }
          } catch (err) {
            self.log("[tls] failed to verify certificate chain");
            return false;
          }

          self.log("[tls] server certificate verified");
        }

        return verified;
      },
      connected: function (connection) {
        self.log("[tls] connected");

        //TODO God willing: Write any pending data to secureStream
        process.nextTick(() => {
          self._secureEstablished = true;
          self.outgoingStream.uncork();
          self.emit("secure");
        });
      },
      tlsDataReady: function (connection) {
        // encrypted data is ready to be sent to the server
        const data = connection.tlsData.getBytes();
        self.securedOutgoingStream.write(data, "binary"); // encoding should be 'binary'
      },
      dataReady: function (connection) {
        // clear data from the server is ready
        const chunk = connection.data.getBytes();
        const data = Buffer.from(chunk, "binary")
        //Publish to readers of TLSSocket
        self.push(data);
      },
      closed: function () {
        self.log("[tls] disconnected");
        self.end();
      },
      error: function (connection, error) {
        self.log("[tls] error", error);
        self.emit("error", error);
      },
    };

    if (options.isServer) {
      sslOptions.getCertificate = () => options.cert;
      sslOptions.getPrivateKey = () => options.key;
    }

    this.ssl = forge.tls.createConnection(sslOptions);

    if (!options.isServer) {
      this.log("[tls] handshaking");
      this.ssl.handshake();
    }
  }

  initSocket(socket) {
    if (!socket) return;

    this._socket = socket;

    this.securedOutgoingStream.pipe(this._socket);
    this._socket.pipe(this.incomingStream);

    this._socket.once("close", (hadError) => this.emit("close", hadError))

    this._socket.on('error', (err) => {
      console.log("tls socket err: ", err)
      this.emit(err)
    })

    if (this._socket.connecting || this._socket.readyState !== "open") {
      this._socket.once("connect", this.onConnect.bind(this));
    } else {
      this.onConnect();
    }
    
    return this;
  }

  connect(...args) {
    const netSocket = new Socket().connect(...args);
    return this.initSocket(netSocket);
  }

  onConnect() {
    this.init();
    this.emit("connect");
  }

  _read() {}

  _write(data, encoding, cb) {
    this.outgoingStream.write(data, encoding, cb);
  }

  createCaStore() {
    const rootCertificates = this._options.rootCertificates || rootCerts;
    const caStore = forge.pki.createCaStore([]);

    for (let i = 0; i < rootCertificates.length; i++) {
      const rootCertificate = rootCertificates[i];
      try {
        caStore.addCertificate(rootCertificate);
      } catch (err) {}
    }

    return caStore;
  }

  setTimeout(timeout, cb) {
  }

  setNoDelay(noDelay) {
  }

  unref() {
  }

  ref() {
  }

  setKeepAlive(enable, delay) {
  }

  log(...args) {
    if (this._options.debug) {
      console.log.apply(console, Array.prototype.slice.call(args));
    }
  }

}

function isObject(val) {
  return val !== null && typeof val === "object";
}

function normalizeConnectArgs(listArgs) {
  var args = _normalizeArgs(listArgs);
  var options = args[0];
  var cb = args[1];
  if (isObject(listArgs[1])) {
    options = _extend(options, listArgs[1]);
  } else if (isObject(listArgs[2])) {
    options = _extend(options, listArgs[2]);
  }
  return cb ? [options, cb] : [options];
}

function onConnectSecure() {
  this.authorized = true;
  this._socket.authorized = true;
  this.emit("secureConnect");
}

export function connect(...args) {
  var args = normalizeConnectArgs(args);
  var options = args[0];
  var cb = args[1];

  var defaults = {
    rejectUnauthorized: "0" !== process.env.NODE_TLS_REJECT_UNAUTHORIZED,
    ciphers: null, //tls.DEFAULT_CIPHERS
  };

  options = _extend(defaults, options || {});

  var socket = new TLSSocket(options.socket, {
    ...options,
    isServer: false,
    servername: options.host,
    rejectUnauthorized: options.rejectUnauthorized,
    rootCertificates: options.rootCertificates,
  });

  socket.once("secure", onConnectSecure);
  if (cb) socket.once("secureConnect", cb);

  if (!options.socket) {
    socket.connect(options);
  }

  return socket;
}
