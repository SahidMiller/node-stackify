import { ENCODING_UTF8, filenameToSteps, pathToFilename } from "./utils.js";
import fs from "./index.js";
import EventEmitter from "events";

export class FSWatcher extends EventEmitter {
  _timer; // Timer that keeps this task persistent.

  constructor(vol) {
    super();

    this._filename = "";
    this._steps = [];
    this._filenameEncoded = "";

    this._recursive = false;
    this._encoding = ENCODING_UTF8;
    this._link = null;
  }

  _getName() {
    return this._steps[this._steps.length - 1];
  }

  _onNodeChange = () => {
    this._emit("change");
  };

  _onParentChild = (link) => {
    if (link.getName() === this._getName()) {
      this._emit("rename");
    }
  };

  _emit = (type) => {
    this.emit("change", type, this._filenameEncoded);
  };

  _persist = () => {
    this._timer = setTimeout(this._persist, 1e6);
  };

  start(path, persistent = true, recursive = false, encoding = ENCODING_UTF8) {
    this._filename = pathToFilename(path);
    this._steps = filenameToSteps(this._filename);
    this._filenameEncoded = Buffer.from(this._filename).toString(ENCODING_UTF8);
    this._recursive = recursive;
    this._encoding = encoding;

    try {
      //TODO God willing, instead move to virtualfs.
      const { ino } = fs.statSync(this._filename);
      this._link = fs._iNodeMgr.getINode(ino);
    } catch (err) {
      const error = new Error(`watch ${this._filename} ${err.code}`);
      error.code = err.code;
      error.errno = err.code;
      throw error;
    }

    this._link.on("change", this._onNodeChange);
    this._link.on("child:add", this._onNodeChange);
    this._link.on("child:delete", this._onNodeChange);

    const parent = this._link.parent;
    if (parent) {
      // parent.on('child:add', this._onParentChild);
      parent.setMaxListeners(parent.getMaxListeners() + 1);
      parent.on("child:delete", this._onParentChild);
    }

    if (persistent) this._persist();
  }

  close() {
    clearTimeout(this._timer);

    this._link.removeListener("change", this._onNodeChange);
    this._link.removeListener("child:add", this._onNodeChange);
    this._link.removeListener("child:delete", this._onNodeChange);

    const parent = this._link.parent;
    if (parent) {
      // parent.removeListener('child:add', this._onParentChild);
      parent.removeListener("child:delete", this._onParentChild);
    }
  }
}
