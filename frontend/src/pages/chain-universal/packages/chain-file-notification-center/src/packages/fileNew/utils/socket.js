
import service from '../../../service';

const W3CWebSocket = require('websocket').w3cwebsocket;


export default class Socket {
  constructor(taskId, callback) {
    const { host } = service.geiBase.URL;
    if (host) {
      this.client = new W3CWebSocket(`wss://${host}/eximport`);
      this.client.onerror = () => {
        console.log('Connection Error');
      };
      this.client.onopen = () => {
        console.log('WebSocket Client Connected');
        this.client.send(taskId);
      };
      this.client.onclose = () => {
        console.log('echo-protocol Client Closed');
      };

      this.client.onmessage = (e) => {
        if (typeof e.data === 'string') {
          try {
            const item = JSON.parse(e.data);
            callback(item);
          } catch (error) {
            console.error('parse data eror:', error);
          }
        }
      };
    }
  }

  close() {
    this.client.close();
  }
}

