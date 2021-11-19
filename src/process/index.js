import hrtime from "browser-process-hrtime";
import nextTick from "./nextTick.js";

let fs, EventEmitter, constants;
export default class Process {
  constructor({ stdin, stdout, stderr, argv, env } = {}) {
    this._stdin = stdin;
    this._stdout = stdout;
    this._stderr = stderr;
    this._argv = argv;
    this._env = env || {
      PATH: "/bin;/usr/bin;"
    };
    
    this._title = "webterm"
    this._execPath = "/"
    this._browser = true

    this._version = ""
    this._versions = { node: "14.15.1" }
    this._platform = "linux"
    this._release = {
      name: "node",
      lts: "",
      sourceUrl: "",
      libUrl: ""
    }
    this._memoryUsage = {
      rss: 28241920,
      heapTotal: 5308416,
      heapUsed: 3505880,
      external: 1633217,
      arrayBuffers: 337087,
    };

    import("events").then(mod => EventEmitter = mod.default.EventEmitter);
    import("fs").then(mod => fs = mod.default);
    import("constants").then(mod => constants = mod.default);
  }

  get title() {
    return this._title;
  }

  set title(title) {
    this._title = title;
  }

  get browser() {
    return this._browser;
  }

  get env() {
    return this._env;
  }

  set env(env) {
    this._env = env;
  }

  get argv() {
    return this._argv || [];
  }

  set argv(argv) {
    this._argv = argv;
  }

  get execArgv() {
    return this._execArgv || [];
  }

  set execArgv(execArgv) {
    this._execArgv = execArgv;
  }

  get execPath() {
    //TODO God willing: not sure about this part or why it's showing up now
    return this._execPath;
  }

  get stdin() {
    return this._stdin;
  }

  set stdin(stdin) {
    this._stdin = stdin;
  }

  get stdout() {
    return this._stdout;
  }

  set stdout(stdout) {
    this._stdout = stdout;
  }

  get stderr() {
    return this._stderr;
  }

  set stderr(stderr) {
    this._stderr = stderr;
  }

  get exitCode() {
    return this._exitCode;
  }

  set exitCode(code) {
    code = Number(code);

    switch (code) {
      case 0:
      default:
        this._exitCode = code;
    }
  }

  get platform() {
    return this._platform;
  }

  get version() {
    return this._version;
  }

  get versions() {
    return this._versions;
  }

  get release() {
    return this._release;
  }

  memoryUsage() {
    return this._memoryUsage
  }

  cwd() {
    return fs.getCwd ? fs.getCwd() : "/";
  }

  chdir() {
    return fs.chdir && fs.chdir(...arguments)
  }

  binding(lib) {

    if (lib === 'constants') {
      return constants
    }

    return {};
  }

  hrtime() {
    return hrtime(...arguments);
  }

  nextTick() {
    return nextTick(...arguments);
  }

  umask() {
    return 0;
  }

  exit(code) {
    this._exitCode = code;
    this.emit("exit", code);
  }

  get eventEmitter() {
    if (!this._eventEmitter) {
      //TODO God willing: return a proxy that queues in the meantime? TGIMA.
      this._eventEmitter = new EventEmitter();
    }

    return this._eventEmitter;
  }

  //EventEmitter Implementation lazy loaded
  rawListeners() {
    return this.eventEmitter.rawListeners(...arguments);
  }

  eventNames() {
    return this.eventEmitter.eventNames(...arguments);
  }

  getMaxListeners() {
    return this.eventEmitter.getMaxListeners(...arguments);
  }

  setMaxListeners() {
    return this.eventEmitter.setMaxListeners(...arguments);
  }

  on() {
    return this.eventEmitter.on(...arguments);
  }

  addListener() {
    return this.eventEmitter.addListener(...arguments);
  }

  once() {
    return this.eventEmitter.once(...arguments);
  }

  off() {
    return this.eventEmitter.off(...arguments);
  }

  removeListener() {
    return this.eventEmitter.removeListener(...arguments);
  }

  removeAllListeners() {
    return this.eventEmitter.removeAllListeners(...arguments);
  }

  emit() {
    return this.eventEmitter.emit(...arguments);
  }

  prependListener() {
    return this.eventEmitter.prependListener(...arguments);
  }

  prependOnceListener() {
    return this.eventEmitter.prependOnceListener(...arguments);
  }

  listeners() {
    return this.eventEmitter.listeners(...arguments);
  }
};


//EventEmitter
// process.addListener                          process.emit
// process.eventNames                           process.getMaxListeners
// process.listenerCount                        process.listeners
// process.off                                  process.on
// process.once                                 process.prependListener
// process.prependOnceListener                  process.rawListeners
// process.removeAllListeners                   process.removeListener
// process.setMaxListeners

// process._debugEnd                            
// process._debugProcess
// process._events                              
// process._eventsCount
// process._exiting                             
// process._fatalException
// process._getActiveHandles                    
// process._getActiveRequests
// process._kill                                
// process._linkedBinding
// process._maxListeners                        
// process._preload_modules
// process._rawDebug                            
// process._startProfilerIdleNotifier
// process._stopProfilerIdleNotifier            
// process._tickCallback
// process.abort                                
// process.allowedNodeEnvironmentFlags
// process.arch                                 
// process.argv
// process.argv0                                
// process.assert
// process.binding                              
// process.chdir
// process.config                               
// process.cpuUsage
// process.cwd                                  
// process.debugPort
// process.dlopen                               
// process.domain
// process.emitWarning                          
// process.env
// process.execArgv                             
// process.execPath
// process.exit                                 
// process.features
// process.hasUncaughtExceptionCaptureCallback  
// process.hrtime
// process.kill                                 
// process.memoryUsage
// process.moduleLoadList                       
// process.nextTick
// process.openStdin                            
// process.pid
// process.platform                             
// process.ppid
// process.reallyExit                           
// process.release
// process.report                               
// process.resourceUsage
// process.setUncaughtExceptionCaptureCallback  
// process.stderr
// process.stdin                                
// process.stdout
// process.title                                
// process.umask
// process.uptime                               
// process.version
// process.versions