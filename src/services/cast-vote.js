const { WebSocket } = require('ws');
const redisCache = require('./redis-cache.js');

const castVote = async (wss, parsed_data, pool_id) => {
  const pool = await redisCache.pool(parsed_data, pool_id);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client.pool_id === pool_id) {
      client.send(JSON.stringify({ options: pool.options, code: 1 }));
    }
  });
};

module.exports = castVote;
