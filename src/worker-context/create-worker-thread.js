import { createReaderToWorker, createWriterToWorker } from "remote-worker-streams/client";

export const CREATE_CHILD_PROCESS = "CREATE_CHILD_PROCESS"
export const CHILD_PROCESS_SUCCEEDED = "CHILD_PROCESS_SUCCEEDED"
export const CHILD_PROCESS_FAILED = "CHILD_PROCESS_FAILED"

export function createWorkerThreadProcess(command, options = {}) {
  if (!options.workerUrl) throw "options.workerUrl is required for browser";

  const worker = new Worker(options.workerUrl);

  const [processStdin, readablePortToWorker] = createWriterToWorker();
  const [processStdout, writablePortToWorker] = createReaderToWorker();

  processStdout.on("end", () => worker.terminate());
  
  const onMessage = options.onMessage;
  delete options.onMessage;

  worker.postMessage(
    {
      readablePort: readablePortToWorker,
      writablePort: writablePortToWorker,
      command,
      ...options
    },
    [readablePortToWorker, writablePortToWorker, options.fsProxyPort]
  );

  worker.onmessage = onMessage;

  return [processStdin, processStdout, worker]
}