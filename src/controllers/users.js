const route = require('express').Router();
const newUser = require('../services/register-user.js');

route.post('/register', (req, res) => {
  try {
    const user = newUser(req.body.user);

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
    res.status(error.code || 400).send({ error: error.message });
  }
});

module.exports = route;
