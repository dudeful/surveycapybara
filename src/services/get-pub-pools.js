const pg = require('pg');
const { Client } = pg;


const getPubPools = async (data) => {
  const client = new Client();
  await client.connect();

  try {
    const selectPool = `
      SELECT * FROM public.pools
      where private_pool = false
    `;

    const poolResults = await client.query(selectPool);
    const pooln = []
    
    if (!poolResults.rows[0]) {
       throw new Error('could not find any public pool');
    }
    

    poolResults.rows.forEach((pool) => {
      pool.options = JSON.parse(pool.options);
      pooln.push({"name": pool.name, "id": pool.id})
    
    });
    
    return {
      status: 'success',
      pool: pooln
    };
  } catch (error) {
    await client.query('ROLLBACK');
    return { error };
  } finally {
    await client.end();
  }
};

// const getPubPools = async (data) => {
//   const client = new Client();
//   await client.connect();

//   try {
//     const selectPool = `
//       SELECT * FROM public.pools
//       WHERE private_pool = false
//     `;

//     const poolResults = await client.query(selectPool);

//     if (!poolResults.rows[0]) {
//       throw new Error('could not find any public pool');
//     }

//     poolResults.rows.forEach((pool) => {
//       pool.options = JSON.parse(pool.options);
//     });

//     return {
//       status: 'success',
//       pool: poolResults.rows,
//     };
//   } catch (error) {
//     await client.query('ROLLBACK');
//     return { error };
//   } finally {
//     await client.end();
//   }
// };

module.exports = getPubPools;
