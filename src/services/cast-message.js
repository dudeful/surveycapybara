const { WebSocket } = require('ws');
const redisCache = require('./redis-cache.js');

const castMessage = async (wss, parsed_data, ws_token) => {
  const message = {
    timestamp: parsed_data.timestamp,
    code: 2,
    user: { username: parsed_data.user.username, email: parsed_data.user.email },
    body: parsed_data.message,
  };

  await redisCache.messages(message, parsed_data.pool_id);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client.pool_id === parsed_data.pool_id) {
      client.send(JSON.stringify(message));
    }
  });
};

module.exports = castMessage;
