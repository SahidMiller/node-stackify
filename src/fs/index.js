export * from "virtualfs";

import { default as fs } from "../../node_modules/virtualfs/dist/index.node.es.js";
import { pathToFilename, getDefaultOpts } from "./utils.js";
import { FSWatcher } from "./FSWatcher.js";
import { StatWatcher } from "./StatWatcher.js";

//Bind to key for some reason.
Object.getOwnPropertyNames(Object.getPrototypeOf(fs)).map((key) => {
  if (fs[key] instanceof Function && key !== "constructor")
    fs[key] = fs[key].bind(fs);
});

fs.watchFile = function (path, a, b) {
  const filename = pathToFilename(path);

  let options = a;
  let listener = b;

  if (typeof options === "function") {
    listener = a;
    options = null;
  }

  if (typeof listener !== "function") {
    throw Error('"watchFile()" requires a listener function');
  }

  let interval = 5007;
  let persistent = true;

  if (options && typeof options === "object") {
    if (typeof options.interval === "number") interval = options.interval;
    if (typeof options.persistent === "boolean")
      persistent = options.persistent;
  }

  let watcher = this.statWatchers[filename];

  if (!watcher) {
    watcher = new StatWatcher();
    watcher.start(filename, persistent, interval);
    this.statWatchers[filename] = watcher;
  }

  watcher.addListener("change", listener);
  return watcher;
};

fs.unwatchFile = function (path, listener) {
  const filename = pathToFilename(path);
  const watcher = this.statWatchers[filename];
  if (!watcher) return;

  if (typeof listener === "function") {
    watcher.removeListener("change", listener);
  } else {
    watcher.removeAllListeners("change");
  }

  if (watcher.listenerCount("change") === 0) {
    watcher.stop();
    delete this.statWatchers[filename];
  }
};

fs.watch = function (path, options, listener) {
  const filename = pathToFilename(path);
  let givenOptions = options;

  if (typeof options === "function") {
    listener = options;
    givenOptions = null;
  }

  // tslint:disable-next-line prefer-const
  let { persistent, recursive, encoding } = getDefaultOpts(givenOptions);
  if (persistent === undefined) persistent = true;
  if (recursive === undefined) recursive = false;

  const watcher = new FSWatcher();
  watcher.start(filename, persistent, recursive, encoding);

  if (listener) {
    watcher.addListener("change", listener);
  }

  return watcher;
};

const {
  appendFile,
  appendFileSync,
  access,
  accessSync,
  chown,
  chownSync,
  chmod,
  chmodSync,
  close,
  closeSync,
  copyFile,
  copyFileSync,
  createReadStream,
  createWriteStream,
  exists,
  existsSync,
  fchown,
  fchownSync,
  fchmod,
  fchmodSync,
  fdatasync,
  fdatasyncSync,
  fstat,
  fstatSync,
  fsync,
  fsyncSync,
  ftruncate,
  ftruncateSync,
  futimes,
  futimesSync,
  lchown,
  lchownSync,
  lchmod,
  lchmodSync,
  link,
  linkSync,
  lstat,
  lstatSync,
  lutimes,
  lutimesSync,
  mkdir,
  mkdirSync,
  mkdtemp,
  mkdtempSync,
  open,
  openSync,
  opendir,
  opendirSync,
  readdir,
  readdirSync,
  read,
  readSync,
  readv,
  readvSync,
  readFile,
  readFileSync,
  readlink,
  readlinkSync,
  realpath,
  realpathSync,
  rename,
  renameSync,
  rm,
  rmSync,
  rmdir,
  rmdirSync,
  stat,
  statSync,
  symlink,
  symlinkSync,
  truncate,
  truncateSync,
  unwatchFile,
  unlink,
  unlinkSync,
  utimes,
  utimesSync,
  watch,
  watchFile,
  writeFile,
  writeFileSync,
  write,
  writeSync,
  writev,
  writevSync,
  Dir,
  Dirent,
  Stats,
  WriteStream,
  ReadStream,
} = fs;

export {
  appendFile,
  appendFileSync,
  access,
  accessSync,
  chown,
  chownSync,
  chmod,
  chmodSync,
  close,
  closeSync,
  copyFile,
  copyFileSync,
  createReadStream,
  createWriteStream,
  exists,
  existsSync,
  fchown,
  fchownSync,
  fchmod,
  fchmodSync,
  fdatasync,
  fdatasyncSync,
  fstat,
  fstatSync,
  fsync,
  fsyncSync,
  ftruncate,
  ftruncateSync,
  futimes,
  futimesSync,
  lchown,
  lchownSync,
  lchmod,
  lchmodSync,
  link,
  linkSync,
  lstat,
  lstatSync,
  lutimes,
  lutimesSync,
  mkdir,
  mkdirSync,
  mkdtemp,
  mkdtempSync,
  open,
  openSync,
  opendir,
  opendirSync,
  readdir,
  readdirSync,
  read,
  readSync,
  readv,
  readvSync,
  readFile,
  readFileSync,
  readlink,
  readlinkSync,
  realpath,
  realpathSync,
  rename,
  renameSync,
  rm,
  rmSync,
  rmdir,
  rmdirSync,
  stat,
  statSync,
  symlink,
  symlinkSync,
  truncate,
  truncateSync,
  unwatchFile,
  unlink,
  unlinkSync,
  utimes,
  utimesSync,
  watch,
  watchFile,
  writeFile,
  writeFileSync,
  write,
  writeSync,
  writev,
  writevSync,
  Dir,
  Dirent,
  Stats,
  WriteStream,
  ReadStream,
};

export default fs;
