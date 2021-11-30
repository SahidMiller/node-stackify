import { ReadStream, WriteStream } from "tty";

export function bootstrapStdin(handle, options) {
  options = options || {}
  const { isTTY = false } = options;

  if (isTTY) {

    return new ReadStream(0, {
      handle: bootstrapHandler(handle, options)
    });

  } else {

    handle.isTTY = false;
    return readableStream
  }
}

export function bootstrapStdout(handle, options) {
  options = options || {}
  const { columns, rows, isTTY = false } = options;

  if (isTTY) {

    return new WriteStream(1, {
      handle: bootstrapHandler(handle, options)
    });

  } else {

    handle.columns = columns;
    handle.rows = rows;
    handle.isTTY = false;

    return handle
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

  stream.getColorDepth = function() {
    return 24;
  }

  return stream
}