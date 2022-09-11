const pg = require('pg');
const { Client } = pg;
const bcrypt = require('bcrypt');
const validate = require('../utils/validators.js');

const getPool = async (data) => {
  const client = new Client();
  await client.connect();

  try {
    const selectPool = `
      SELECT * FROM public.pools
      WHERE id = $1
    `;

    const poolResults = await client.query(selectPool, [data.pool.id]);

    if (poolResults.rows[0].private_pool) {
      const matchPassword = await bcrypt.compare(
        data.pool.password,
        poolResults.rows[0].pool_password
      );

      if (!matchPassword) {
        throw new Error('wrong pool password');
      }
    }

    if (poolResults.rows[0].registered_pool) {
      validate.token(data.token);
    }

    return {
      status: 'success',
      pool: poolResults.rows[0],
    };
  } catch (error) {
    await client.query('ROLLBACK');
    return error;
  } finally {
    await client.end();
  }
};

module.exports = getPool;
