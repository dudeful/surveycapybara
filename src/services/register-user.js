const bcrypt = require('bcrypt');
const saltRounds = 12;
const pg = require('pg');
const { Client } = pg;

const saveUser = async (data) => {
	const client = new Client();
	await client.connect();

	try {
		const selectUsers = `
      SELECT * FROM public.users
      WHERE email = $1
    `;

		const users_results = await client.query(selectUsers);

		if (users_results.rows[0]) {
			throw new Error('This email is already in use');
		}

		const password = await bcrypt.hash(data.password, saltRounds);

		const insertUser = `
		  INSERT INTO public.users
		  (email, password)
		  VALUES ($1, $2)
		`;

		const insert_results = await client.query(insertUser, [
			data.email,
			password,
		]);

		await setRedis(`user-${user.email}`, JSON.stringify(insert_results));

		console.log(insert_results.rows);

		return {
			status: 'success',
			user: data.email,
		};
	} catch (error) {
		await client.query('ROLLBACK');
		return { error: true, error };
	} finally {
		await client.end();
	}
};

module.exports = saveUser;
