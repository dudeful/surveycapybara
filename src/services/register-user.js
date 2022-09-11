const bcrypt = require('bcrypt');
const saltRounds = 12;
const pg = require('pg');
const { Client } = pg;
const generateToken = require('../utils/generate-token.js');
const validate = require('../utils/validators.js');

const newUser = async (data) => {
  const client = new Client();
  await client.connect();

  try {
    validate.email(data.email);
    validate.username(data.username);
    validate.password(data.password);

    const { email, username, password } = data;

    const selectUsers = `
      SELECT id FROM public.users
      WHERE email = $1
				OR username = $2
    `;

    const users_results = await client.query(selectUsers, [email, username]);

    if (users_results.rows[0]) {
      throw new Error('This email or username is already in use');
    }

    const hash = await bcrypt.hash(password, saltRounds);

    const token = generateToken({ username, email });

    const insertUser = `
		  INSERT INTO public.users
		  (email, username, password, token)
		  VALUES ($1, $2, $3, $4)
		`;

    const insert_results = await client.query(insertUser, [email, username, hash, token]);

    // await setRedis(`user-${email}`, JSON.stringify(insert_results.rows[0]));

    console.log(insert_results.rows[0]);

    return {
      status: 'success',
      data: { email, username },
      token,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    return { error };
  } finally {
    await client.end();
  }
};

module.exports = newUser;
