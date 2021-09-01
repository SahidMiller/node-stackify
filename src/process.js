import hrtime from "browser-process-hrtime";
import process from "process_browserify";

import constants from "./constants.js";

let fs;
let loadingFs = false;
const lazyLoadFs = () => {
  if (!loadingFs) {
    loadingFs = true;
    import("fs").then((mod) => {
      fs = mod.default;
    });
  }

  return fs;
};

lazyLoadFs();

//TODO God willing, either bootstrap process here or use loader as in node to bootstrap with native modules, God willing.
const binding = (lib) => {
  if (lib === "constants") {
    return constants;
  }

  if (lib === "natives") {
    return {};
  }
};

const setArgv = (...args) => {
  process.argv = args;
};

const setVersion = (version) => {
  process.version = version;
};

const setVersions = (version) => {
  process.versions = { ...version };
};

const setTitle = (title) => {
  process.title = title;
};

const setBrowser = (...args) => {
  process.browser = !!browser;
};

const setEnv = (env) => {
  process.env = { ...env };
};

let _memoryUsage = {};
const setMemoryUsage = (memoryUsage) => {
  _memoryUsage = { ...memoryUsage };
};

const setStdin = (stdin) => {
  process.stdin = stdin;
};

const setStdout = (stdout) => {
  process.stdout = stdout;
};

const setStderr = (stderr) => {
  process.stderr = stderr;
};

process.cwd = () => {
  if (!lazyLoadFs()) {
    throw "File system not ready";
  }

  return fs.getCwd();
};

process.chdir = (...args) => {
  if (!lazyLoadFs()) {
    throw "File system not ready";
  }

  return fs.chdir(...args);
};

process.hrtime = hrtime;
process.binding = binding;
process.setArgv = setArgv;
process.setVersion = setVersion;
process.setVersions = setVersions;
process.setTitle = setTitle;
process.setBrowser = setBrowser;
process.setEnv = setEnv;
process.setMemoryUsage = setMemoryUsage;
process.setStdin = setStdin;
process.setStdout = setStdout;
process.setStderr = setStderr;
process.execArgv = [];

process.memoryUsage = () => {
  return _memoryUsage;
};

process.exit = () => {
  //Reset argv on exit
  process.setArgv([]);
  // process.setStderr(null);
  // process.setStdin(null);
  // process.setStdout(null);
};

export default process;
