import { createReaderToWorker, createWriterToWorker } from "remote-worker-streams/client";

export const CREATE_CHILD_PROCESS = "CREATE_CHILD_PROCESS"
export const CHILD_PROCESS_SUCCEEDED = "CHILD_PROCESS_SUCCEEDED"
export const CHILD_PROCESS_FAILED = "CHILD_PROCESS_FAILED"

let child_processes = 0;
export function createWorkerThreadProcess(command, options = {}) {
  if (!options.workerUrl && !globalThis.process.env.WORKER_URL) throw "options.workerUrl is required for browser or set WORKER_URL env";

  const processId = child_processes++;

  const worker = new Worker(options.workerUrl || globalThis.process.env.WORKER_URL);

  const [processStdin, readablePortToWorker] = createWriterToWorker();
  const [processStdout, writablePortToWorker] = createReaderToWorker();

  //TODO God willing: figure out how to differentiate process getting destroyed on this end or other end.
  // reason being if our side closes, we definitely want to send sigterm, God willing, and not terminate quickly.
  // whereas if from other end, then no need to do sigterm. 
  // alternative solution is to close on other side when they initiate the close (but since workers don't notify, it's not possible to tell it's closed)
  processStdout.on("end", () => { 
    worker.postMessage({ action: "SIGTERM" });
    setTimeout(() => {
      worker.terminate();
    }, options.timeout || 10000);

    self.postMessage && self.postMessage({ action: "CHILD_PROCESS_FINISHED", processId: "/" + processId  })
    processStdout.destroy();
  });
  
  const onMessage = options.onMessage;
  delete options.onMessage;

  const transferables = [readablePortToWorker, writablePortToWorker];
  worker.postMessage({ 
    action: "INIT", 
    payload: { 
      command, 
      ...options 
    }, 
    transferables 
  }, transferables);

  //TODO God willing: maybe move this init postMessage over regular child_process when starting up a worker
  // might be a better strategy to decouple, God willing.
  self.postMessage && self.postMessage({ action: "CHILD_PROCESS_STARTED", processId: "/" + processId });

  //TODO God willing: wait for successful init first, God willing.
  // since no message if failed totally.
  worker.onmessage = ((e) => {
    //TODO God willing: validate in case of tampering, God willing.
    // essentially verify it's actually an id from a child
    e.data.processId = (typeof e.data.processId === 'undefined' ? "" : e.data.processId) + "/" + processId;
    
    if (onMessage) {
      onMessage(e);
    } else if (e.data.action === "TTY_OUT") {
      processStdout.push(Buffer.from(e.data.payload))
      return;
    } else if (e.data.transferables) {
      self.postMessage(e.data, e.data.transferables)
    }
  });

  return [processStdin, processStdout, worker]
}