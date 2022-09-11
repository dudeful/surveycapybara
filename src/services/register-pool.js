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
        throw new Error('No user has been found');
      }
    }

    let hash;

    if (pool.private_pool) {
      hash = await bcrypt.hash(pool.pool_password, saltRounds);
    }

    const insertPool = `
		  INSERT INTO public.pools
		  (
		    id,
		    name,
		    description,
		    positive_votes_per_voter,
		    negative_votes_per_voter,
		    weighted_vote,
		    visible_vote,
		    private_pool,
		    pool_password,
		    voting_time,
		    registered_pool,
		    open_options,
		    options_per_voter,
		    options,
		    owner
		  )
		  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
		`;

    const poolData = [
      id,
      pool.name,
      pool.description,
      pool.positive_votes_per_voter,
      pool.negative_votes_per_voter,
      pool.weighted_vote,
      pool.visible_vote,
      pool.private_pool,
      hash,
      pool.voting_time,
      pool.registered_pool,
      pool.open_options,
      pool.options_per_voter,
      pool.options,
      owner,
    ];

    const insert_results = await client.query(insertPool, poolData);

    console.log(insert_results.rows[0]);

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
    return { error: true, error };
  } finally {
    await client.end();
  }
};

module.exports = savePool;
