const route = require('express').Router();
const newUser = require('../services/register-user.js');
const login = require('../services/login.js');
const validate = require('../utils/validators.js');

route.post('/login', async (req, res) => {
  try {
    console.log(req.body);
    const user = await login(req.body.user);

    if (user.error) {
      throw user.error;
    }

    res
      .cookie('token', user.token, {
        expires: new Date(Date.now() + 3600000),
        httpOnly: true,
      })
      .send({ isAuthorized: true, user: user.data });
  } catch (error) {
    console.error(error);
    res.status(400).send({ error: error.message });
  }
});

route.post('/register', async (req, res) => {
  try {
    const user = await newUser(req.body.user);

    if (user.error) {
      throw user.error;
    }

    res
      .cookie('token', user.token, {
        expires: new Date(Date.now() + 3600000),
        httpOnly: true,
      })
      .send({ isAuthorized: true, user: user.data });
  } catch (error) {
    console.error(error);
    res.status(400).send({ error: error.message });
  }
});

route.post('/refresh', async (req, res) => {
  try {
    const payload = validate.tokenFresh(req.cookies);

    res.send({ isAuthorized: true, payload });
  } catch (error) {
    console.error(error);
    res.status(400).send({ error: error.message });
  }
});

module.exports = route;
