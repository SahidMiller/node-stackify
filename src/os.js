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

export const getNetworkInterfaces = networkInterfaces;

export { platform, cpus, homedir, tmpdir, networkInterfaces };

os.platform = platform;
os.cpus = cpus;
os.homedir = homedir;
os.tmpdir = tmpdir;
os.networkInterfaces = os.getNetworkInterfaces = networkInterfaces;

export default os;
