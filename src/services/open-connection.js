const redisCache = require('./redis-cache.js');

const openConnection = async (ws, parsed_data, ws_token) => {
  const pool = await redisCache.pool(parsed_data);
  const messages = await redisCache.messages(null, parsed_data.pool_id);

  ws.send(JSON.stringify({ code: 3, options: pool.options, messages }));
};

module.exports = openConnection;
