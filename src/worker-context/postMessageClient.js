export function postMessageClient(sendMessage) {
    return async ({ action, payload, transferables = [] } = {}, timeout = null) => {
      return await new Promise((resolve, reject) => {
        
        const { port1: responsePort, port2: transferPort } = new MessageChannel();
        const _transferables = [transferPort, ...transferables];
  
        sendMessage({ 
          action,
          payload, 
          transferables: _transferables
        }, _transferables);
        
        let timeoutId
        function cleanup() {
          if (timeoutId) clearTimeout(timeoutId);
          responsePort.onmessage = null;
        }
  
        if (timeout > 0 && Number.isFinite(timeout)) {
          timeoutId = setTimeout(() => {
            cleanup();
            reject("Timeout exceeded")
          }, timeout || 10000);
        }
  
        responsePort.onmessage = (e) => {
  
          cleanup();
  
          e.data.action === "SUCCESS" ? 
            resolve(e.data.payload) : 
            reject(e.data.payload)
        }
      });
    }
  }
  