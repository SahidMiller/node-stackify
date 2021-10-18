import console, { Console } from './internal/console/index.js'

const assert = console.assert.bind(this);
const clear = console.clear.bind(this);
const count = console.count.bind(this);
const countReset = console.countReset.bind(this);
const debug = console.debug.bind(this);
const dir = console.dir.bind(this);
const dirxml = console.dirxml.bind(this);
const error = console.error.bind(this);
const group = console.group.bind(this);
const groupCollapsed = console.groupCollapsed.bind(this);
const groupEnd = console.groupEnd.bind(this);
const info = console.info.bind(this);
const log = console.log.bind(this);
const table = console.table.bind(this);
const time = console.time.bind(this);
const timeEnd = console.timeEnd.bind(this);
const timeLog = console.timeLog.bind(this);
const trace = console.trace.bind(this);
const warn = console.warn.bind(this);

export default {
  assert,
  clear,
  count,
  countReset,
  debug,
  dir,
  dirxml,
  error,
  group,
  groupCollapsed,
  groupEnd,
  info,
  log,
  table,
  time,
  timeEnd,
  timeLog,
  trace,
  warn,
}

export { Console }