const redisCache = require('./redis-cache.js');

const openConnection = async (ws, parsed_data, pool_id) => {
  const pool = await redisCache.pool(parsed_data, pool_id);
  const messages = await redisCache.messages(null, pool_id);

  ws.send(JSON.stringify({ code: 3, options: pool.options, messages }));
};

module.exports = openConnection;
