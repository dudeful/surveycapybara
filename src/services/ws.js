const { WebSocket, WebSocketServer } = require('ws');
const castVote = require('./cast-vote.js');
const castMessage = require('./cast-message.js');
const openConnection = require('./open-connection.js');

const wss = new WebSocketServer({ port: 5050 });

wss.on('connection', function connection(ws, req) {
  ws.on('message', function message(data) {
    try {
      const ws_token = req.headers['sec-websocket-protocol']?.split(', ')[0];
      const date = new Date();
      const parsed_data = JSON.parse(data.toString());
      parsed_data.timestamp = date.toISOString();

      switch (parsed_data.code) {
        case 1:
          ws.pool_id = parsed_data.pool_id;
          castVote(wss, parsed_data, ws_token);
          break;
        case 2:
          ws.pool_id = parsed_data.pool_id;
          castMessage(wss, parsed_data, ws_token);
          break;
        case 3:
          ws.pool_id = parsed_data.pool_id;
          openConnection(ws, parsed_data, ws_token);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(error);
      const msg = {
        error: true,
        message: 'something weird happened :S',
      };
      ws.send(JSON.stringify(msg));
    }
  });
});
