const { WebSocket } = require('ws');
const redisCache = require('./redis-cache.js');

const castVote = async (wss, parsed_data, ws_token) => {
  // console.log(parsed_data.ws_token);
  // const session = await redisCache.session(parsed_data.ws_token, parsed_data.pool_id);

  // if (session.error) {
  //   throw new Error(session.error.message);
  // }

  const pool = await redisCache.pool(parsed_data);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client.pool_id === parsed_data.pool_id) {
      client.send(JSON.stringify({ options: pool.options, code: 1 }));
    }
  });
};

module.exports = castVote;
