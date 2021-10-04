import { createWorkerThreadProcess } from "./worker-context/create-worker-thread.js";
import Process from "./process/index.js";

function exec(command, options, callback) {
  
}

function execFile(file, args, options, callback) {
  
}

function fork(modulePath, args, options) {
  
}

function spawn(command, args, options) {
  if (typeof options === 'undefined' && !(args instanceof Array)) {
    options = args;
  } else {
   
    //TODO God willing: need some way to use passed in ENV or cwd or current ENV or cwd to find executables to run, God willing.
    // but since this is client side, can't make assumptions about fs access to this degree, God willing.
    // const { bootstrapPath } = await import("./executables.js");
    // const { default: getArgs } = await import("./commandToArgv.js");
    // const argv = await getArgs(command);
    
    //TODO God willing: make sure args never runs a new command, God willing.
    command += ["", ...args].join(" ");
  }
  
  //TODO God willing: if shell = true, run /bin/bash -c process first, God willing.
  //TODO God willing: if stdio is set to inherit, auto pipe stdin/stouts, otherwise just return the stdin/out, God willing
  const [stdin, stdout, worker] = createWorkerThreadProcess(command, options);
  return new Process({ stdin, stdout, stderr: stdout });
}


export { exec, execFile, fork, spawn }