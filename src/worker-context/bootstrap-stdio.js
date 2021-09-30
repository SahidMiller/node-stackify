import { createReaderToClient, createWriterToClient } from "remote-worker-streams/worker"

export function bootstrapStdin(readablePort, options) {
  const readableStream = createReaderToClient(readablePort);
  const stdin = bootstrapStdioMetadata(readableStream, options);

  return stdin;
}

export function bootstrapStdout(writablePort, options) {
  const writableStream = createWriterToClient(writablePort);
  const stdout = bootstrapStdioMetadata(writableStream, options);

  return stdout;
}

export function bootstrapStdioMetadata(stdio, { columns, rows, isTTY }) {
  stdio.columns = columns;
  stdio.rows = rows;
  stdio.isTTY = isTTY;
  return stdio
}