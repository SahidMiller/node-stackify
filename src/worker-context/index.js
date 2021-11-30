let process;

export default function bootstrap(options) {
  
  if (!options || !options.bootstrapFs) {
    throw "Invalid options. options.bootstrapFs callback is required."
  } 

  self.addEventListener("message", async function handleNode(e) {
    const { action, payload, transferables } = e.data || {}
    
    try {
      
      if (action === "INIT") {
        await init(payload, transferables, options);
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
}

async function init(payload, transferables, options) {
  const { bootstrapFs, beforeProcess, afterProcess, beforeExecution } = options;

  //TODO God willing: get terminal columns and rows God willing;
  const { 
    command = "", 
    dimensions = {}, 
    stdinIsTTY = false,
    stdoutIsTTY = false,
    env,
  } = payload;

  const [readablePort, writablePort] = transferables;

  const fs = await bootstrapFs();
  
  globalThis.fs = fs
  
  if (beforeProcess) {
    await beforeProcess(payload, transferables);
  }

  
  const { default: Process } = await import("../process/index.js");
  
  //TODO God willing: don't start/load whatever we're running until this we get our stdout, God willing.
  const process = globalThis.process = new Process();

  if (env) process.env = env;    
  process.argv = ["node", ...(command.split(" "))]; //getArgs(command);

  //Bootstrap stdin afterwards to take advantage of debuglog with proper errrors which streams rely on.
  const { bootstrapStdin, bootstrapStdout } = await import("./bootstrap-stdio.js");

  process._stdin = bootstrapStdin(readablePort, { isTTY: stdinIsTTY });
  process._stdout = process._stderr = bootstrapStdout(writablePort, {
    isTTY: stdoutIsTTY,
    columns: dimensions.columns,
    rows: dimensions.rows
  });
  
  //TODO God willing: could also move it to client api hooks, God willing
  if (afterProcess) {
    await afterProcess(process, payload, transferables);
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