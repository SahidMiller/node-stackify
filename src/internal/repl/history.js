"use strict";

import { Interface } from "../../readline.js";
import { join } from "path";
import { open, close, readFile, ftruncate, write } from "fs";
import { homedir, EOL } from "os";
import { debuglog } from "util";
let debug = debuglog("repl", (fn) => {
  debug = fn;
});
import { clearTimeout, setTimeout } from "timers";

const noop = () => {};

// XXX(chrisdickinson): The 15ms debounce value is somewhat arbitrary.
// The debounce is to guard against code pasted into the REPL.
const kDebounceHistoryMS = 15;

export default setupHistory;

function _writeToOutput(repl, message) {
  repl._writeToOutput(message);
  repl._refreshLine();
}

function setupHistory(repl, historyPath, ready) {
  // Empty string disables persistent history
  if (typeof historyPath === "string")
    historyPath = String.prototype.trim.call(historyPath);

  if (historyPath === "") {
    repl._historyPrev = _replHistoryMessage;
    return ready(null, repl);
  }

  if (!historyPath) {
    try {
      historyPath = join(homedir(), ".node_repl_history");
    } catch (err) {
      _writeToOutput(
        repl,
        "\nError: Could not get the home directory.\n" +
          "REPL session history will not be persisted.\n"
      );

      debug(err.stack);
      repl._historyPrev = _replHistoryMessage;
      return ready(null, repl);
    }
  }

  let timer = null;
  let writing = false;
  let pending = false;
  repl.pause();
  // History files are conventionally not readable by others:
  // https://github.com/nodejs/node/issues/3392
  // https://github.com/nodejs/node/pull/3394
  open(historyPath, "a+", 0o0600, oninit);

  function oninit(err, hnd) {
    if (err) {
      // Cannot open history file.
      // Don't crash, just don't persist history.
      _writeToOutput(
        repl,
        "\nError: Could not open history file.\n" +
          "REPL session history will not be persisted.\n"
      );
      debug(err.stack);

      repl._historyPrev = _replHistoryMessage;
      repl.resume();
      return ready(null, repl);
    }
    close(hnd, onclose);
  }

  function onclose(err) {
    if (err) {
      return ready(err);
    }
    readFile(historyPath, "utf8", onread);
  }

  function onread(err, data) {
    if (err) {
      return ready(err);
    }

    if (data) {
      repl.history = String.prototype.split.call(
        data,
        /[\n\r]+/,
        repl.historySize
      );
    } else {
      repl.history = [];
    }

    open(historyPath, "r+", onhandle);
  }

  function onhandle(err, hnd) {
    if (err) {
      return ready(err);
    }
    ftruncate(hnd, 0, (err) => {
      repl._historyHandle = hnd;
      repl.on("line", online);
      repl.once("exit", onexit);

      // Reading the file data out erases it
      repl.once("flushHistory", function () {
        repl.resume();
        ready(null, repl);
      });
      flushHistory();
    });
  }

  // ------ history listeners ------
  function online(line) {
    repl._flushing = true;

    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(flushHistory, kDebounceHistoryMS);
  }

  function flushHistory() {
    timer = null;
    if (writing) {
      pending = true;
      return;
    }
    writing = true;
    const historyData = Array.prototype.join.call(repl.history, EOL);
    write(repl._historyHandle, historyData, 0, "utf8", onwritten);
  }

  function onwritten(err, data) {
    writing = false;
    if (pending) {
      pending = false;
      online();
    } else {
      repl._flushing = Boolean(timer);
      if (!repl._flushing) {
        repl.emit("flushHistory");
      }
    }
  }

  function onexit() {
    if (repl._flushing) {
      repl.once("flushHistory", onexit);
      return;
    }
    repl.off("line", online);
    close(repl._historyHandle, noop);
  }
}

function _replHistoryMessage() {
  if (this.history.length === 0) {
    _writeToOutput(
      this,
      "\nPersistent history support disabled. " +
        "Set the NODE_REPL_HISTORY environment\nvariable to " +
        "a valid, user-writable path to enable.\n"
    );
  }
  this._historyPrev = Interface.prototype._historyPrev;
  return this._historyPrev();
}
