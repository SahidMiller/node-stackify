export * from "os-browserify/browser.js";
import os from "os-browserify/browser.js";

function platform() {
  //TODO God willing: configurability?
  //Compatibility with virtualfs
  return "linux";
}

function cpus() {
  return [];
}

function homedir() {
  return "/";
}

function tmpdir() {
  return "/tmp";
}

//TODO God willing: more sophisticated fake and API for manipulation, maybe tie with libp2p endpoints and addresses, God willing.
// any loopback protocols which send back to us would be loopback.
function networkInterfaces() {
  return {
    "vEthernet (WSL)": [
      {
        address: "2001:0db8:85a3:0000:0000:8a2e:0370:7335",
        netmask: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff",
        family: "IPv6",
        mac: "00:00:00:00:00:01",
        internal: false,
        cidr: "2001:0db8:85a3:0000:0000:8a2e:0370:7335/0",
        scopeid: 52,
      },
      {
        address: "172.23.96.1",
        netmask: "255.255.240.0",
        family: "IPv4",
        mac: "00:00:00:00:00:01",
        internal: false,
        cidr: "172.23.96.1/20",
      },
    ],
    "Wi-Fi": [
      {
        address: "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
        netmask: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff",
        family: "IPv6",
        mac: "00:00:00:00:00:02",
        internal: false,
        cidr: "2001:0db8:85a3:0000:0000:8a2e:0370:7334/0",
        scopeid: 0,
      },
      {
        address: "10.0.0.19",
        netmask: "255.255.255.0",
        family: "IPv4",
        mac: "00:00:00:00:00:02",
        internal: false,
        cidr: "10.0.0.19/24",
      },
    ],
    "Loopback Pseudo-Interface 1": [
      {
        address: "::1",
        netmask: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff",
        family: "IPv6",
        mac: "00:00:00:00:00:00",
        internal: true,
        cidr: "::1/128",
        scopeid: 0,
      },
      {
        address: "127.0.0.1",
        netmask: "255.0.0.0",
        family: "IPv4",
        mac: "00:00:00:00:00:00",
        internal: true,
        cidr: "127.0.0.1/8",
      },
    ],
  };
}

const constants = {
  UV_UDP_REUSEADDR: 4,
  errno: {
    E2BIG: 7,
    EACCES: 13,
    EADDRINUSE: 100,
    EADDRNOTAVAIL: 101,
    EAFNOSUPPORT: 102,
    EAGAIN: 11,
    EALREADY: 103,
    EBADF: 9,
    EBADMSG: 104,
    EBUSY: 16,
    ECANCELED: 105,
    ECHILD: 10,
    ECONNABORTED: 106,
    ECONNREFUSED: 107,
    ECONNRESET: 108,
    EDEADLK: 36,
    EDESTADDRREQ: 109,
    EDOM: 33,
    EEXIST: 17,
    EFAULT: 14,
    EFBIG: 27,
    EHOSTUNREACH: 110,
    EIDRM: 111,
    EILSEQ: 42,
    EINPROGRESS: 112,
    EINTR: 4,
    EINVAL: 22,
    EIO: 5,
    EISCONN: 113,
    EISDIR: 21,
    ELOOP: 114,
    EMFILE: 24,
    EMLINK: 31,
    EMSGSIZE: 115,
    ENAMETOOLONG: 38,
    ENETDOWN: 116,
    ENETRESET: 117,
    ENETUNREACH: 118,
    ENFILE: 23,
    ENOBUFS: 119,
    ENODATA: 120,
    ENODEV: 19,
    ENOENT: 2,
    ENOEXEC: 8,
    ENOLCK: 39,
    ENOLINK: 121,
    ENOMEM: 12,
    ENOMSG: 122,
    ENOPROTOOPT: 123,
    ENOSPC: 28,
    ENOSR: 124,
    ENOSTR: 125,
    ENOSYS: 40,
    ENOTCONN: 126,
    ENOTDIR: 20,
    ENOTEMPTY: 41,
    ENOTSOCK: 128,
    ENOTSUP: 129,
    ENOTTY: 25,
    ENXIO: 6,
    EOPNOTSUPP: 130,
    EOVERFLOW: 132,
    EPERM: 1,
    EPIPE: 32,
    EPROTO: 134,
    EPROTONOSUPPORT: 135,
    EPROTOTYPE: 136,
    ERANGE: 34,
    EROFS: 30,
    ESPIPE: 29,
    ESRCH: 3,
    ETIME: 137,
    ETIMEDOUT: 138,
    ETXTBSY: 139,
    EWOULDBLOCK: 140,
    EXDEV: 18,
    WSAEINTR: 10004,
    WSAEBADF: 10009,
    WSAEACCES: 10013,
    WSAEFAULT: 10014,
    WSAEINVAL: 10022,
    WSAEMFILE: 10024,
    WSAEWOULDBLOCK: 10035,
    WSAEINPROGRESS: 10036,
    WSAEALREADY: 10037,
    WSAENOTSOCK: 10038,
    WSAEDESTADDRREQ: 10039,
    WSAEMSGSIZE: 10040,
    WSAEPROTOTYPE: 10041,
    WSAENOPROTOOPT: 10042,
    WSAEPROTONOSUPPORT: 10043,
    WSAESOCKTNOSUPPORT: 10044,
    WSAEOPNOTSUPP: 10045,
    WSAEPFNOSUPPORT: 10046,
    WSAEAFNOSUPPORT: 10047,
    WSAEADDRINUSE: 10048,
    WSAEADDRNOTAVAIL: 10049,
    WSAENETDOWN: 10050,
    WSAENETUNREACH: 10051,
    WSAENETRESET: 10052,
    WSAECONNABORTED: 10053,
    WSAECONNRESET: 10054,
    WSAENOBUFS: 10055,
    WSAEISCONN: 10056,
    WSAENOTCONN: 10057,
    WSAESHUTDOWN: 10058,
    WSAETOOMANYREFS: 10059,
    WSAETIMEDOUT: 10060,
    WSAECONNREFUSED: 10061,
    WSAELOOP: 10062,
    WSAENAMETOOLONG: 10063,
    WSAEHOSTDOWN: 10064,
    WSAEHOSTUNREACH: 10065,
    WSAENOTEMPTY: 10066,
    WSAEPROCLIM: 10067,
    WSAEUSERS: 10068,
    WSAEDQUOT: 10069,
    WSAESTALE: 10070,
    WSAEREMOTE: 10071,
    WSASYSNOTREADY: 10091,
    WSAVERNOTSUPPORTED: 10092,
    WSANOTINITIALISED: 10093,
    WSAEDISCON: 10101,
    WSAENOMORE: 10102,
    WSAECANCELLED: 10103,
    WSAEINVALIDPROCTABLE: 10104,
    WSAEINVALIDPROVIDER: 10105,
    WSAEPROVIDERFAILEDINIT: 10106,
    WSASYSCALLFAILURE: 10107,
    WSASERVICE_NOT_FOUND: 10108,
    WSATYPE_NOT_FOUND: 10109,
    WSA_E_NO_MORE: 10110,
    WSA_E_CANCELLED: 10111,
    WSAEREFUSED: 10112
  },
  signals: {
    SIGHUP: 1,
    SIGINT: 2,
    SIGILL: 4,
    SIGABRT: 22,
    SIGFPE: 8,
    SIGKILL: 9,
    SIGSEGV: 11,
    SIGTERM: 15,
    SIGBREAK: 21,
    SIGWINCH: 28
  },
  priority: {
    PRIORITY_LOW: 19,
    PRIORITY_BELOW_NORMAL: 10,
    PRIORITY_NORMAL: 0,
    PRIORITY_ABOVE_NORMAL: -7,
    PRIORITY_HIGH: -14,
    PRIORITY_HIGHEST: -20
  }
}

export const getNetworkInterfaces = networkInterfaces;

export { platform, cpus, homedir, tmpdir, networkInterfaces, constants };

os.platform = platform;
os.cpus = cpus;
os.homedir = homedir;
os.tmpdir = tmpdir;
os.networkInterfaces = os.getNetworkInterfaces = networkInterfaces;
os.constants = constants

export default os;
