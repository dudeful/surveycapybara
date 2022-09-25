const pg = require('pg');
const { Client } = pg;

const getPrivatePools = async (data) => {
  const client = new Client();
  await client.connect();

  try {
    const selectUser = `
    SELECT * FROM public.users
    WHERE email = $1`;
    const userResults = await client.query(selectUser, [data.pool.email]);

    if (!userResults.rows[0]) {
      throw new Error('no email has been found for this owner');
    }

    const selectPool = `
      SELECT * FROM public.pools
      where private_pool = true and owner = $1
    `;

    const poolResults = await client.query(selectPool, [userResults.rows[0].id]);

    if (!poolResults.rows[0]) {
      throw new Error('could not find any public pool');
    }

    const pools = poolResults.rows.map((p) => {
      return {
        id: p.id,
        name: p.name,
        email: p.email,
        password: p.password,
        description: p.description,
      };
    });

    return {
      status: 'success',
      pools,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    return { error };
  } finally {
    await client.end();
  }
};

module.exports = getPrivatePools;
