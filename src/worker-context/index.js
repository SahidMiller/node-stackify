export default function bootstrap({ bootstrapFs, afterProcess, beforeExecution, sigtermTimeout = 5000 }) {
  
  if (!bootstrapFs) {
    throw "Invalid options. options.bootstrapFs callback is required."
  } 

  self.addEventListener("message", async function handleNode(event) {
    
    self.removeEventListener("message", handleNode);
    self.addEventListener("message", (e) => {
      const { action, payload } = e.data || {}
      //TODO God willing: dedicate worker message events directly to process from now on or single action with payload to emit, God willing?
      if (action === "SIGTERM") {
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
        }, sigtermTimeout)
      }

      if (action === "SIGKILL") {
        process.exit(0);
      }
    });

    //TODO God willing: get terminal columns and rows God willing;
    const { 
      command = "", 
      readablePort, 
      writablePort, 
      dimensions = {}, 
      pid,
      stdinIsTTY = false,
      stdoutIsTTY = false,
      env,
    } = event.data;

    const fs = await bootstrapFs();
    
    globalThis.fs = fs
    
    //TODO God willing: legit navigation and other polyfills and web-worker-proxies for window
    globalThis.window = globalThis;
    
    const { bootstrapStdin, bootstrapStdout } = await import("./bootstrap-stdio.js");

    const stdin = bootstrapStdin(readablePort, {
      isTTY: stdinIsTTY,
      columns: dimensions.columns,
      rows: dimensions.rows
    });

    const stdout = bootstrapStdout(writablePort, {
      isTTY: stdoutIsTTY,
      columns: dimensions.columns,
      rows: dimensions.rows
    });
    
    const { bootstrap: bootstrapTTY } = await import("./bootstrap-tty.cjs");
    const tty = bootstrapTTY(self);
    globalThis.tty = tty

    const { default: Process } = await import("../process/index.js");
    
    //TODO God willing: don't start/load whatever we're running until this we get our stdout, God willing.
    const process = globalThis.process = new Process({
      stdin, 
      stdout, 
      stderr: stdout
    });

    if (env) process.env = env;

    //TODO God willing: run "bootstrapPath" and getArgs here for now since we can't rely on fs access in child_process.js launcher yet.
    const { bootstrapPath } = await import("./executables.js");
    await bootstrapPath();
    
    process.argv = ["node", ...(command.split(" "))]; //getArgs(command);

    //TODO God willing: could also move it to client api hooks, God willing
    if (afterProcess) {
      await afterProcess(process);
    }

    //Delay setting up worker until fs is setup globally
    const { executeUserEntryPoint } = await import("../internal/modules/run_main.js");
    const module = await import("../module.js");
    
    const { Module } = module;
    const { Console } = await import("console")
    const console = new Console(process.stdout);
    
    //TODO God willing: hook for adding built in modules
    Module._builtinModules = await bootstrapModules({ process, console, tty, module, global });
  
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
      
      if (beforeExecution) {
        await beforeExecution(module);
      }
      
      const entryPath = Module._findPath(entry, (process.env.PATH || "").split(";").filter(Boolean), true);

      if (!entryPath) throw new Error(`nodejs: ${entry} command not found\n`);
      
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
  })
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