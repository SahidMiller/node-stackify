export function postMessageHost(onRequest) {
    //TODO God willing: send back a port to get responses from, God willing.
    const { port1: hostPort, port2: clientPort } = new MessageChannel();
    hostPort.onmessage = (e) => onRequest(e.data || {})
    return [hostPort, clientPort];
}  