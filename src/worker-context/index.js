import { PassThrough, Writable } from "stream";
import { postMessageClient } from "./postMessageClient.js";
import { postMessageHost } from "./postMessageHost.js";

export default async function bootstrap(options) {
  
  if (!options || !options.bootstrapFs) {
    throw "Invalid options. options.bootstrapFs callback is required."
  } 

  //Pass request port for parent to make calls
  const dispatchToParent = postMessageClient(self.postMessage);

  //Request initialization
  const initOptions = await dispatchToParent({ action: "GET_OPTIONS" });
  const { 
    command = "", 
    dimensions = {}, 
    env,
  } = initOptions
  
  //Create local streams and port to handle the stream.
  const [stdin, stdinPort] = createStdin();
  const [stdout, stdoutPort] = createStdout();
  const [stderr, stderrPort] = createStdout("STDERR");
  
  //TODO God willing: get terminal columns and rows God willing;
  const { isTTY: stdinIsTTY } = await dispatchToParent({ action: "STDIN_STREAM", payload: { stdinPort }, transferables: [stdinPort] });
  const { isTTY: stdoutIsTTY } = await dispatchToParent({ action: "STDOUT_STREAM", payload: { stdoutPort }, transferables: [stdoutPort]});
  const { isTTY: stderrIsTTY } = await dispatchToParent({ action: "STDERR_STREAM", payload: { stderrPort }, transferables: [stderrPort]});
  
  const { bootstrapFs, beforeProcess, afterProcess, beforeExecution } = options;

  const fs = await bootstrapFs();
  
  globalThis.fs = fs
  
  if (beforeProcess) {
    await beforeProcess(initOptions);
  }
  
  const { default: Process } = await import("../process/index.js");
  
  //TODO God willing: don't start/load whatever we're running until this we get our stdout, God willing.
  const process = globalThis.process = new Process();

  if (env) process.env = env;    
  process.argv = ["node", ...(command.split(" "))]; //getArgs(command);

  //Bootstrap stdin afterwards to take advantage of debuglog with proper errrors which streams rely on.
  const { bootstrapStdin, bootstrapStdout } = await import("./bootstrap-stdio.js");

  process._stdin = bootstrapStdin(stdin, { isTTY: stdinIsTTY });
  
  process._stdout = bootstrapStdout(stdout, {
    isTTY: stdoutIsTTY,
    columns: dimensions.columns,
    rows: dimensions.rows
  });

  process._stderr = bootstrapStdout(stderr, {
    isTTY: stderrIsTTY,
    columns: dimensions.columns,
    rows: dimensions.rows
  });
  
  //TODO God willing: could also move it to client api hooks, God willing
  if (afterProcess) {
    await afterProcess(process, initOptions);
  }

  //Delay setting up worker until fs is setup globally
  const { executeUserEntryPoint } = await import("../internal/modules/run_main.js");
  const module = await import("../module.js");
  
  const { Module } = module;
  const { Console } = await import("console")
  const console = process.env.ORIGINAL_CONSOLE ? globalThis.console : new Console(process.stdout);
  
  //TODO God willing: expansion of args is important but I can wait for executables in here, God willing.
  // In which case assuming a fs is present.
  const entry = process.argv[1];
  const exitPromise = waitForProcessExit(process);
  
  process.stdout.on('finish', () => {
    if (!process.stdout.destroyed) {
      process.stdout.destroy();
    }
  });

  process.stdout.on('close', () => {
    process.nextTick(() => self.close());
  });

  try {

    const entryPath = Module._findPath(entry, (process.env.PATH || "").split(";").filter(Boolean), true);

    if (!entryPath) throw new Error(`nodejs: ${entry} command not found\n`);

    if (beforeExecution) {
      await beforeExecution(entryPath, module);
    }

    //TODO God willing: hook for adding built in modules
    Module._builtinModules = await bootstrapModules({ process, console, module, global, ...Module._builtinModules });

    //Assume the tool writes to process.stdin? TGIMA.
    executeUserEntryPoint(entryPath);
    await exitPromise;

  } catch (err) {

    if (err) {
      process.stdout.write(err + "\n");
    }

  } finally {

    process.stdout.end();
  }
}

function sigKill(process, options) {
  process.exit(0);
}

function sigTerm(process, options) {

  process.emit("SIGTERM");
  //TODO God willing: check if process.exit or process.stdout.close have listeners, God willing. If not, immediately kill.
  // if so, maybe wait a bit after exit for a graceful exit, God willing.
  setTimeout(() => {
    try {
      process.exit(0);
      process.stdout.destroy();
    } finally {
      self.close();
    }
  }, options.sigtermTimeout || 5000)
}

async function waitForProcessExit(process) {
  return await new Promise((res, rej) => {
    process.on("exit", (code) => {
      return code === 0 || typeof code === "undefined" ? res() : rej();
    });
  });
}

async function bootstrapModules(modules) {
  const { default: getBuiltins } = await import("./builtins.cjs");

  const builtins = getBuiltins({ ...modules });
  
  //Setup globals
  const updatedBuiltins = { ...builtins };
  delete updatedBuiltins.crypto;
  Object.assign(globalThis, updatedBuiltins);
  
  return builtins;
}

function createStdin() {
  const stdin = new PassThrough();

  const [stdinPort, stdinClientPort] = postMessageHost(async ({ action, payload, transferables }) => {
   
    try {

      if (action === "STDIN") {
        stdin.write(Buffer.from(payload));
      }

      if (action === "SIGTERM") {
        await sigTerm(process);
      }

      if (action === "SIGKILL") {
        await sigKill(process)
      }
    
    } catch (err) {

      //TODO God willing: handle any errors
      console.log("error loading node worker", err);
      self.close();
    }
  });

  return [stdin, stdinClientPort]
}

function createStdout(outAction = "STDOUT") {
  const [stdoutPort, stdoutClientPort] = postMessageHost(async ({ action, payload, transferables }) => {
    
    try {

      if (action === "RESIZE") {

      }
    
    } catch (err) {

      //TODO God willing: handle any errors
      console.log("error loading node worker", err);
      self.close();
    }
  });

  const stdout = new Writable({
    write: (chunk, encoding, done) => {
      const action = outAction 
      const payload = Buffer.from(chunk, encoding);
      const transferables = [payload.buffer]
      //Could also be created by us or them, God willing
      stdoutPort.postMessage({ action, payload, transferables }, transferables);
      done()
    }
  });

  return [stdout, stdoutClientPort];
}