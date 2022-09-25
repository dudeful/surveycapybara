const pg = require('pg');
const { Client } = pg;

const getPubPools = async () => {
  const client = new Client();
  await client.connect();

  try {
    const selectPool = `
      SELECT * FROM public.pools
      where private_pool = false
    `;

    const poolResults = await client.query(selectPool);

    if (!poolResults.rows[0]) {
      throw new Error('could not find any public pool');
    }

    const pools = poolResults.rows.map((p) => {
      return { id: p.id, name: p.name, description: p.description };
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

module.exports = getPubPools;
