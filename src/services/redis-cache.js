const pg = require('pg');
const { createClient } = require('redis');
const redisClient = createClient();
require('dotenv').config();
redisClient.on('error', (err) => console.error('Redis Client Error!', err));

redisClient.connect();

const pool = async (parsed_data, pool_id) => {
  if (!pool_id) {
    throw new Error('no pool id has been provided');
  }

  let poolCache = await redisClient.get(pool_id);

  if (poolCache) {
    poolCache = JSON.parse(poolCache);
  } else {
    const pgClient = new pg.Client();
    await pgClient.connect();

    const poolResults = await pgClient.query('SELECT * FROM pools WHERE id = $1', [pool_id]);

    if (!poolResults.rows[0]) {
      throw new Error(`no pool with id ${pool_id} has been found`);
    }

    poolResults.rows[0].pool_password = null;
    poolResults.rows[0].options = JSON.parse(poolResults.rows[0].options);

    await redisClient.set(pool_id, JSON.stringify(poolResults.rows[0]));
    poolCache = poolResults.rows[0];

    await pgClient.end();
  }

  if (parsed_data.code !== 3) {
    const option = poolCache.options.find((op) => op.id === parsed_data.vote);
    option.votes += 1;

    await redisClient.set(pool_id, JSON.stringify(poolCache));
  }

  const totalVotes = poolCache.options
    .map((item) => item.votes)
    .reduce((prev, next) => prev + next);

  poolCache.totalVotes = totalVotes;

  return poolCache;
};

const messages = async (message, pool_id) => {
  try {
    if (!pool_id) {
      throw new Error('no pool id has been provided');
    }

    let messagesCache = await redisClient.get(pool_id + '_msg');

    if (!messagesCache && message) {
      message.id = 1;
      await redisClient.set(pool_id + '_msg', JSON.stringify([{ message }]));

      messagesCache = [{ message }];
    } else if (message) {
      messagesCache = JSON.parse(messagesCache);
      message.id = messagesCache.length + 1;
      messagesCache.push({ message });

      await redisClient.set(pool_id + '_msg', JSON.stringify(messagesCache));
    } else {
      messagesCache = JSON.parse(messagesCache);
    }

    return messagesCache;
  } catch (error) {
    console.error(error);
    return { error };
  }
};

module.exports = { pool, messages };
