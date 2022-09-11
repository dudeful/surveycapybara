const bcrypt = require('bcrypt');
const pg = require('pg');
const { Client } = pg;
const generateToken = require('../utils/generate-token.js');
const validate = require('../utils/validators.js');

const login = async (data) => {
  const client = new Client();
  await client.connect();

  try {
    validate.email(data.email);

    const { email, password } = data;

    const selectUsers = `
      SELECT * FROM public.users
      WHERE email = $1
    `;

    const userResults = await client.query(selectUsers, [email]);

    if (!userResults.rows[0]) {
      throw new Error('No user with this email has been found');
    }

    const matchPassword = await bcrypt.compare(password, userResults.rows[0].password);

    if (!matchPassword) {
      throw new Error('wrong password');
    }

    const token = generateToken({ username: userResults.rows[0].username });

    const updateToken = `
		  UPDATE public.users
		  SET token=$1 WHERE id=$2 RETURNING *
		`;

    const updateResults = await client.query(updateToken, [token, userResults.rows[0].id]);

    // await setRedis(`user-${email}`, JSON.stringify(updateResults.rows[0]));

    console.log('<<<<<RETURNING * AFTER UPDATING TOKEN>>>>>');
    console.log(updateResults.rows[0]);

    return {
      status: 'success',
      data: { email: updateResults.rows[0].email, username: updateResults.rows[0].username },
      token,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    return { error };
  } finally {
    await client.end();
  }
};

module.exports = login;
