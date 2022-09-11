const route = require('express').Router();
const newUser = require('../services/register-user.js');
const login = require('../services/login.js');
const jwt = require('jsonwebtoken');

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
      .send({ isAuthenticated: true, user: user.data });
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
      .send({ isAuthenticated: true, user: user.data });
  } catch (error) {
    console.error(error);
    res.status(400).send({ error: error.message });
  }
});

route.get('/refresh', async (req, res) => {
  try {
    if (!req.cookies) {
      throw new Error('user unauthenticated');
    }

    jwt.verify(req.cookies.token, process.env.JWT_SECRET, function (err, decoded) {
      if (err) {
        throw new Error('Invalid JWT Token');
      }

      res.send({ decoded, isAuthenticated: true });
    });
  } catch (error) {
    console.error(error);
    res.status(400).send({ error: error.message });
  }
});

module.exports = route;
