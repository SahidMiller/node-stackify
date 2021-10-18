import { createReaderToClient, createWriterToClient } from "remote-worker-streams/worker"
import { ReadStream, WriteStream } from "tty";

export function bootstrapStdin(readablePort, options) {
  options = options || {}
  const { isTTY = false } = options;
  const readableStream = createReaderToClient(readablePort);

  if (isTTY) {

    return new ReadStream(0, {
      handle: bootstrapHandler(readableStream, options)
    });

  } else {

    readableStream.isTTY = false;
    return readableStream
  }
}

export function bootstrapStdout(writablePort, options) {
  options = options || {}
  const { columns, rows, isTTY = false } = options;
  const writableStream = createWriterToClient(writablePort);

  if (isTTY) {

    return new WriteStream(1, {
      handle: bootstrapHandler(writableStream, options)
    });

  } else {

    writableStream.columns = columns;
    writableStream.rows = rows;
    writableStream.isTTY = false;

    return writableStream
  }
}

export function bootstrapHandler(stream, { columns, rows }) {

  stream.getWindowSize = function(windowSize) {
    windowSize[0] = columns
    windowSize[1] = rows;
  }

  stream.setBlocking = function() {

  }

  stream.setRawMode = function() {
    
  }

  return stream
}