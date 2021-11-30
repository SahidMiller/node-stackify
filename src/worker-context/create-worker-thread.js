import { createReaderToClient, createWriterToClient } from "remote-worker-streams/worker";
import { PassThrough, Readable, Stream, Writable } from "stream"
import { postMessageClient } from "./postMessageClient.js";

export const CREATE_CHILD_PROCESS = "CREATE_CHILD_PROCESS"
export const CHILD_PROCESS_SUCCEEDED = "CHILD_PROCESS_SUCCEEDED"
export const CHILD_PROCESS_FAILED = "CHILD_PROCESS_FAILED"

let child_processes = 0;
export function createWorkerThreadProcess(command, options = {}) {
  if (!options.workerUrl && !globalThis.process.env.WORKER_URL) throw "options.workerUrl is required for browser or set WORKER_URL env";

  const processId = child_processes++;
  const stdioTypes = options.stdio instanceof Array ? 
    options.stdio : 
    typeof options.stdio === 'string' ?
      [options.stdio, options.stdio, options.stdio] : 
      ['pipe', 'pipe', 'pipe'];

  const defaultStdios = [0, 1, 2].map((fd) => stdioTypes[fd]);
  const allStdioTypes = [...defaultStdios, ...stdioTypes.slice(3)];

  //TODO God willing: not much reason to do this ourselves if streams have file descriptors, God willing.
  // file descriptors of parent copied to child and when we open a fd, it's having opened a file itself , or grabbed a ref to the stream
  const [stdin, stdout, stderr, ...restStreams] = allStdioTypes.map((type, fd) => {
    const passthrough = new PassThrough();

    if (!type) {
      type = fd < 3 ? "pipe" : "ignore"
    }
    
    if (type === "pipe" || type === "overlapped" || (!type && fd < 3)) {
      return passthrough;
    }

    if (type === "inherit") {
      if (fd === 0) {
        globalThis.process.stdin.pipe(passthrough);
      }

      if (fd === 1) {
        passthrough.pipe(globalThis.process.stdout);
      }
      
      if (fd === 2) {
        passthrough.pipe(globalThis.process.stderr);
      }

      //Return an empty pass through since inherited
      return new PassThrough();
    }

    if (type === "ignore" || (!type && fd >= 3)) {
      return passthrough;
    }

    if (type === "ipc") {
      return passthrough;
    }
    
    if (type instanceof Stream) {
      return passthrough;
    }

    if (Number.isInteger(type)) {
      return passthrough;
    }
  })

  const worker = new Worker(options.workerUrl || globalThis.process.env.WORKER_URL);

  //any worker code without access to request ports will need to use global postMessage.
  //likewise any worker code we want to reach listens on global worker unless worker sets it up before hand.
  worker.onmessage = (e) => {
    const { action, payload, transferables, pid } = e.data || {};

    const [responsePort] = transferables;

    if (action === "GET_OPTIONS") {
      const response = Object.assign({}, { command, ...options }, { onMessage: undefined });
      responsePort.postMessage({ action: "SUCCESS", payload: response });
      notifyParentProcess("CHILD_PROCESS_STARTED", processId)
      return
    }

    else if (action === "STDIN_STREAM") {

      //Recieving a port is easier since we just need to anticipate what to send back, God willing.
      const { stdinPort } = payload;

      const rawStdin = new Writable({
        write: (chunk, encoding, done) => {
          const action = "STDIN"
          const payload = Buffer.from(chunk, encoding);
          const transferables = [payload.buffer]
          //Could also be created by us or them, God willing
          stdinPort.postMessage({ action, payload, transferables }, transferables);
          done()
        }
      });
      
      //TODO God willing: figure out how to differentiate process getting destroyed on this end or other end.
      // reason being if our side closes, we definitely want to send sigterm, God willing, and not terminate quickly.
      // whereas if from other end, then no need to do sigterm. 
      // alternative solution is to close on other side when they initiate the close (but since workers don't notify, it's not possible to tell it's closed)
      
      //Actual stdio which we pass in globals if inherited, God willing. or passthroughs if piped.
      
      //Dispatch via stdin port (so they're listening on other side when using this method)
      const dispatchToWorker = postMessageClient(stdinPort.postMessage.bind(stdinPort));
      
      let closed = false;
      async function done() {
        if (!closed) {
          
          closed = true; 

          //TODO God willing: rather than awaiting and doing all this, instead emit on process ourselves or 
          // figure out who ended it and how to end on other side, then emitting appropriate stuff, God willing.
          await dispatchToWorker({ action: "SIGTERM" });  

          worker.terminate();

          notifyParentProcess("CHILD_PROCESS_FINISHED", processId);  

          stdout.destroy();
        }
      }

      stdout.on("error", done)
      stdout.on("close", done)
      stdout.on("end", done)

      //TODO God willing: if size changes send over as stdin/stdout, God willing.
      stdin.pipe(rawStdin);

      return responsePort.postMessage({
        action: "SUCCESS",
        payload: {
          isTTY: true,
        }
      })
    }

    else if (action === "STDOUT_STREAM") {
      //Recieving a port is easier since we just need to anticipate what to send back, God willing.

      const { stdoutPort } = payload;

      stdoutPort.onmessage = (e) => {
        const { action, payload } = e.data || {};

        if (action === "STDOUT") {
          stdout.write(payload);
        }
      }

      //TODO God willing: if size changes send over as stdin/stdout, God willing.
      //stdoutPort.postMessage({ action, payload, transferables }, transferables);

      return responsePort.postMessage({
        action: "SUCCESS",
        payload: {
          isTTY: true,
        },
      })
    }

    else if (action === "STDERR_STREAM") {
      
      const { stderrPort } = payload;

      stderrPort.onmessage = (e) => {
        const { action, payload } = e.data || {};

        if (action === "STDERR") {
          stderr.write(payload);
        }
      }
      
      //TODO God willing: if size changes send over as stdin/stdout, God willing.
      //stderrPort.postMessage({ action, payload, transferables }, transferables);

      return responsePort.postMessage({
        action: "SUCCESS",
        payload: {
          isTTY: true,
        },
      })
    }

    else {
      //TODO God willing: validate in case of tampering, essentially verify it's actually an id from a child, God willing.
      e.data.processId = (typeof pid === 'undefined' ? "" : pid) + "/" + processId;

      if (options.onMessage) {
        
        options.onMessage(e);
      
      } else {
        
        try {
          self.postMessage(e.data, transferables)
        } catch (err) {
          console.log(err);
        }
      }
    }
  }

  return [stdin, stdout, stderr, worker]
}

function notifyParentProcess(action, processId) {
  //TODO God willing: maybe move this init postMessage over regular child_process when starting up a worker
  // might be a better strategy to decouple, God willing.
  self.postMessage && self.postMessage({ action, processId: "/" + processId });
}