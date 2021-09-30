const { ReadStream, WriteStream, isatty } = require("tty");

function bootstrap(messagePort) {
  ReadStream.messagePort = messagePort;
  WriteStream.messagePort = messagePort;

  Object.assign(module.exports, { ReadStream, WriteStream, isatty });
  return module.exports
}

module.exports = { bootstrap }