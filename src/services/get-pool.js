const pg = require('pg');
const { Client } = pg;

const getPool = async (query) => {
	const client = new Client();
	await client.connect();

	try {
		const selectPool = `
      SELECT * FROM public.pools
      WHERE id = $1
    `;

		const poolResults = await client.query(selectPool, [
			query.pool_id,
		]);

		console.log(poolResults.rows);

		return {
			status: 'success',
			pool: poolResults.rows[0],
		};
	} catch (error) {
		await client.query('ROLLBACK');
		return { error: true, error };
	} finally {
		await client.end();
	}
};

module.exports = getPool;
