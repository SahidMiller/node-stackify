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
    command += ["", ...args].join(" ");
  }
  
  //TODO God willing: if shell = true, run /bin/bash -c process first, God willing.
  //TODO God willing: if stdio is set to inherit, auto pipe stdin/stouts, otherwise just return the stdin/out, God willing
  const [stdin, stdout, worker] = createWorkerThreadProcess(command, options);
  const process = new Process({ stdin, stdout, stderr: stdout });
  process.worker = worker;

  //TODO God willing: if closed from this side, then kill the process?
  // but if closed on remote side, then make sure to get exit code ? (not sure how to do error codes)
  stdout.on('close', () => {
    process.emit('close', 0);
  })

  return process;
}


export { exec, execFile, fork, spawn }