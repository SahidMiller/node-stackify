export default function bootstrap({ bootstrapFs, afterProcess }) {
  
  if (!bootstrapFs) {
    throw "Invalid options. options.bootstrapFs callback is required."
  } 

  self.addEventListener("message", async function handleNode(event) {
  
    self.removeEventListener("message", handleNode);

    //TODO God willing: get terminal columns and rows God willing;
    const { 
      command, 
      readablePort, 
      writablePort, 
      fsProxyPort, 
      dimensions, 
      pid,
      stdinIsTTY,
      stdoutIsTTY,
      argv
    } = event.data;

    const fs = await bootstrapFs(fsProxyPort);
    
    globalThis.fs = fs
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
    const process = global.process = new Process({
      stdin, 
      stdout, 
      stderr: stdout,
      argv
    });

    //TODO God willing: run "bootstrapPath" and getArgs here for now since we can't rely on fs access in child_process.js launcher yet.
    const { bootstrapPath } = await import("./executables.js");
    await bootstrapPath();
    const { default: getArgs } = await import("./commandToArgv.js");
    process.argv = getArgs(command);

    //TODO God willing: could also move it to client api hooks, God willing
    if (afterProcess) {
      await afterProcess(process);
    }

    //Delay setting up worker until fs is setup globally
    await execute(process);
  })
}

async function waitForProcessExit(process) {
  return await new Promise((res, rej) => {
    process.on("exit", (code) => {
      return code === 0 || typeof code === "undefined" ? res() : rej(code);
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

async function execute(process) {

  const { executeUserEntryPoint } = await import("../internal/modules/run_main.js");
  const { Module } = await import("../module.js");
  const console = Object.assign({}, await import("console"));
  const tty = globalThis.tty;
    
  console.log = (...data) => {
    process.stdout.write(data.join(",") + "\n");
  }

  Module._builtinModules = await bootstrapModules({ process, console, tty, module: Module });

  //TODO God willing: expansion of args is important but I can wait for executables in here, God willing.
  // In which case assuming a fs is present.
  const entry = process.argv[1];
  const exitPromise = waitForProcessExit(process);

  try {

    //Assume the tool writes to process.stdin? TGIMA.
    executeUserEntryPoint(entry);
    await exitPromise;

  } catch (err) {

    if (err) {
      process.stdout.write(err + "\n");
    }

  } finally {

    process.stdout.destroy();
  }
}