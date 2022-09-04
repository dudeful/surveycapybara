const { WebSocket, WebSocketServer } = require('ws');

const wss = new WebSocketServer({ port: 5050 });

wss.on('connection', function connection(ws) {
  ws.on('message', function message(data) {
    try {
      let timestamp = new Date();
      let parsed_data = data.toString();
      parsed_data = JSON.parse(parsed_data);

      parsed_data.timestamp = timestamp.toISOString()
      
      console.log(parsed_data);

      wss.clients.forEach((client)=>{
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(parsed_data));
        }
      })
    } catch (error) {
      console.error(error)
      ws.send('some shit happened')
    }
  });
});