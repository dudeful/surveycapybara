const crypto = require('crypto');
const pg = require('pg');
const { Client } = pg;
const validate = require('../utils/validators.js');
const bcrypt = require('bcrypt');
const saltRounds = 12;

const savePool = async (pool) => {
  const client = new Client();
  await client.connect();

  try {
    validate.pool(pool);
    validate.email(pool.owner);

    const selectPoolsIds = `
      SELECT id FROM public.pools
    `;

    const pools_results = await client.query(selectPoolsIds);
    const current_ids = pools_results.rows.map((row) => row.id);
    let id = crypto.randomBytes(4).toString('hex');

    while (current_ids.includes(id)) {
      id = crypto.randomBytes(4).toString('hex');
    }

    if (pool.owner) {
      const selectUser = `
				SELECT * FROM public.users
				WHERE email = $1
			`;
      const users_results = await client.query(selectUser, [pool.owner]);

      if (users_results.rows[0]) {
        pool.owner = users_results.rows[0].id;
      } else {
        throw new Error('No user with this email has been found');
      }
    }

    let hash;

    if (pool.private_pool) {
      hash = await bcrypt.hash(pool.pool_password, saltRounds);
    }

    pool.options = JSON.stringify(pool.options);

    const insertPool = `
		  INSERT INTO public.pools
		  (
		    id,
		    owner,
		    name,
		    description,
		    positive_votes_per_voter,
		    negative_votes_per_voter,
        negative_votes_threshold,
		    weighted_vote,
		    visible_vote,
		    private_pool,
		    pool_password,
		    voting_time,
		    registered_pool,
		    open_options,
		    options_per_voter,
		    options
		  )
		  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
		`;

    const poolData = [
      id,
      pool.owner,
      pool.name,
      pool.description,
      pool.positive_votes_per_voter,
      pool.negative_votes_per_voter,
      pool.negative_votes_threshold,
      pool.weighted_vote,
      pool.visible_vote,
      pool.private_pool,
      hash,
      pool.voting_time,
      pool.registered_pool,
      pool.open_options,
      pool.options_per_voter,
      pool.options,
    ];

    const insert_results = await client.query(insertPool, poolData);

    return {
      status: 'success',
      pool: {
        id,
        name: 'name',
        description: 'description',
      },
    };
  } catch (error) {
    await client.query('ROLLBACK');
    return { error };
  } finally {
    await client.end();
  }
};

module.exports = savePool;
