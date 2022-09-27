const { randomBytes } = require('crypto');
const pg = require('pg');
const { createClient } = require('redis');
const redisClient = createClient();
require('dotenv').config();
redisClient.on('error', (err) => console.error('Redis Client Error!', err));

redisClient.connect();

const pool = async (parsed_data) => {
  if (!parsed_data.pool_id) {
    throw new Error('no pool id has been provided');
  }

  let poolCache = await redisClient.get(parsed_data.pool_id);

  if (poolCache) {
    poolCache = JSON.parse(poolCache);
  } else {
    const pgClient = new pg.Client();
    await pgClient.connect();

    const poolResults = await pgClient.query('SELECT * FROM pools WHERE id = $1', [
      parsed_data.pool_id,
    ]);

    if (!poolResults.rows[0]) {
      throw new Error(`no pool with id ${parsed_data.pool_id} has been found`);
    }

    poolResults.rows[0].pool_password = null;
    poolResults.rows[0].options = JSON.parse(poolResults.rows[0].options);

    await redisClient.set(parsed_data.pool_id, JSON.stringify(poolResults.rows[0]));
    poolCache = poolResults.rows[0];

    await pgClient.end();
  }

  if (parsed_data.code !== 3) {
    console.log(parsed_data);
    const option = poolCache.options.find((op) => op.id === parsed_data.vote);
    console.log(poolCache.options);
    option.votes += 1;

    await redisClient.set(parsed_data.pool_id, JSON.stringify(poolCache));
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

const session = async (ws_token, pool_id, is_first) => {
  const pgClient = new pg.Client();
  await pgClient.connect();

  try {
    const selectPool = `
      SELECT positive_votes_per_voter FROM pools
      WHERE id = $1
    `;

    const poolResult = await pgClient.query(selectPool, [pool_id]);

    if (!poolResult.rows[0]) {
      throw new Error('no pool for such id has been found');
    }

    //we need to get the maximum number of votes allowed for the providade pool_id
    let max_votes = poolResult.rows[0].positive_votes_per_voter;

    //now we get the redis cache for the provided ws_token
    let votes = await redisClient.get(ws_token + '_' + pool_id);

    if (!ws_token || ws_token === 'undefined') {
      ws_token = randomBytes(8).toString('hex');
      await redisClient.set(ws_token + '_' + pool_id, 1);

      return { ws_token };
    }

    if (!votes) {
      await redisClient.set(ws_token + '_' + pool_id, 1);

      return { ws_token, votes: 1 };
    } else if (votes > max_votes) {
      throw new Error('maximum number of votes exceeded');
    } else if (!is_first) {
      await redisClient.set(ws_token + '_' + pool_id, Number(votes) + 1);

      console.log('else: ', { ws_token, votes: 1 });
      return { ws_token, votes: Number(votes) + 1 };
    }
  } catch (error) {
    console.error(error);
    return { error };
  } finally {
    await pgClient.end();
  }
};

module.exports = { pool, messages, session };
