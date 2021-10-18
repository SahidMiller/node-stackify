// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

import { Array, NumberIsInteger, ObjectSetPrototypeOf } from "@darkwolf/primordials";

import { PassThrough, Readable, Writable } from 'stream';
//TODO God willing: provide a tty_wrap that uses process or console, God willing.
import { TTY, isTTY } from 'tty_wrap';
import { codes, errnoException } from './internal/errors.js';
const { ERR_INVALID_FD } = codes;
import { getColorDepth, hasColors } from './internal/tty.js';

let readline;
import("readline").then(mod => readline = mod);

function isatty(fd) {
  return NumberIsInteger(fd) && fd >= 0 && fd <= 2147483647 &&
         isTTY(fd);
}

function ReadStream(fd, options) {
  options = options || {}
  if (!(this instanceof ReadStream))
    return new ReadStream(fd, options);
  if (fd >> 0 !== fd || fd < 0)
    throw new ERR_INVALID_FD(fd);
  
  this._handle = options.handle || new TTY(fd);
  
  PassThrough.call(this, { ...options });

  this._handle && this._handle.pipe(this);
  this.resume()

  this.isRaw = false;
  this.isTTY = true;
}

ObjectSetPrototypeOf(ReadStream.prototype, PassThrough.prototype);
ObjectSetPrototypeOf(ReadStream, PassThrough);

ReadStream.prototype.setRawMode = function(flag) {
  flag = !!flag;
  const err = this._handle.setRawMode(flag);
  if (err) {
    this.emit('error', errnoException(err, 'setRawMode'));
    return this;
  }
  this.isRaw = flag;
  return this;
};

function WriteStream(fd, options) {
  options = options || {}
  if (!(this instanceof WriteStream))
    return new WriteStream(fd);
  if (fd >> 0 !== fd || fd < 0)
    throw new ERR_INVALID_FD(fd);

  this._handle = options.handle || new TTY(fd);

  Writable.call(this, { ...options});

  this._write = function(chunk, enc, done) {
    this._handle.write(chunk, enc, done);
  }

  this._destroy = function() {
    this._handle.destroy()
  }

  // Prevents interleaved or dropped stdout/stderr output for terminals.
  // As noted in the following reference, local TTYs tend to be quite fast and
  // this behavior has become expected due historical functionality on OS X,
  // even though it was originally intended to change in v1.0.2 (Libuv 1.2.1).
  // Ref: https://github.com/nodejs/node/pull/1771#issuecomment-119351671
  this._handle.setBlocking(true);

  const winSize = new Array(2);
  const err = this._handle.getWindowSize(winSize);
  if (!err) {
    this.columns = winSize[0];
    this.rows = winSize[1];
  }
}

ObjectSetPrototypeOf(WriteStream.prototype, Writable.prototype);
ObjectSetPrototypeOf(WriteStream, Writable);

WriteStream.prototype.isTTY = true;

WriteStream.prototype.getColorDepth = getColorDepth;

WriteStream.prototype.hasColors = hasColors;

WriteStream.prototype._refreshSize = function() {
  const oldCols = this.columns;
  const oldRows = this.rows;
  const winSize = new Array(2);
  const err = this._handle.getWindowSize(winSize);
  if (err) {
    this.emit('error', errnoException(err, 'getWindowSize'));
    return;
  }
  const { 0: newCols, 1: newRows } = winSize;
  if (oldCols !== newCols || oldRows !== newRows) {
    this.columns = newCols;
    this.rows = newRows;
    this.emit('resize');
  }
};

// Backwards-compat
WriteStream.prototype.cursorTo = function(x, y, callback) {
  return readline.cursorTo(this, x, y, callback);
};
WriteStream.prototype.moveCursor = function(dx, dy, callback) {
  return readline.moveCursor(this, dx, dy, callback);
};
WriteStream.prototype.clearLine = function(dir, callback) {
  return readline.clearLine(this, dir, callback);
};
WriteStream.prototype.clearScreenDown = function(callback) {
  return readline.clearScreenDown(this, callback);
};
WriteStream.prototype.getWindowSize = function() {
  return [this.columns, this.rows];
};

export default { isatty, ReadStream, WriteStream };
export { isatty, ReadStream, WriteStream };
