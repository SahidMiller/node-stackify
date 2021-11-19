import { createReaderToWorker, createWriterToWorker } from "remote-worker-streams/client";

export const CREATE_CHILD_PROCESS = "CREATE_CHILD_PROCESS"
export const CHILD_PROCESS_SUCCEEDED = "CHILD_PROCESS_SUCCEEDED"
export const CHILD_PROCESS_FAILED = "CHILD_PROCESS_FAILED"

export function createWorkerThreadProcess(command, options = {}) {
  if (!options.workerUrl && !globalThis.process.env.WORKER_URL) throw "options.workerUrl is required for browser or set WORKER_URL env";

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

    processStdout.destroy();
  });
  
  const onMessage = options.onMessage;
  delete options.onMessage;

  worker.postMessage(
    {
      readablePort: readablePortToWorker,
      writablePort: writablePortToWorker,
      command,
      ...options
    },
    [readablePortToWorker, writablePortToWorker]
  );

  worker.onmessage = onMessage

  return [processStdin, processStdout, worker]
}