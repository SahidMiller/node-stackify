import { pathToFilename } from "./utils.js";
import EventEmitter from "events";

export class StatWatcher extends EventEmitter {
  constructor(vol) {
    super();
    this.vol = vol;
    this.filename = "";
    this.interval = 0;
    this.timeoutRef = null;
    this.setTimeout = () => {};
    this.prev = null;
  }

  loop() {
    this.timeoutRef = this.setTimeout(this.onInterval, this.interval);
  }

  hasChanged(stats) {
    // if(!this.prev) return false;
    if (stats.mtimeMs > this.prev.mtimeMs) return true;
    if (stats.nlink !== this.prev.nlink) return true;
    return false;
  }

  onInterval = () => {
    try {
      const stats = this.vol.statSync(this.filename);
      if (this.hasChanged(stats)) {
        this.emit("change", stats, this.prev);
        this.prev = stats;
      }
    } finally {
      this.loop();
    }
  };

  start(path, persistent = true, interval = 5007) {
    this.filename = pathToFilename(path);
    this.setTimeout = persistent ? setTimeout : setTimeoutUnref;
    this.interval = interval;
    this.prev = this.vol.statSync(this.filename);
    this.loop();
  }

  stop() {
    clearTimeout(this.timeoutRef);
    process.nextTick(emitStop, this);
  }
}
