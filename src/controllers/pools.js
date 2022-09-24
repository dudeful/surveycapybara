const router = require('express').Router();
const newPool = require('../services/register-pool.js');
const getPools = require('../services/get-pool.js');
const getPubPools = require('../services/get-pub-pools.js');
const validate = require('../utils/validators.js');

router.get('/public', async (req, res) => {
  try {
    const result = await getPubPools();

    if (result.error) {
      throw result.error;
    }

    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(400).send({ error: true, message: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const result = await getPool({ pool: req.query, token: req.cookies.token });

    if (result.error) {
      throw result.error;
    }

    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(400).send({ error: true, message: error.message });
  }
});

router.post('/new', async (req, res) => {
  try {
    // if (!req.cookies) {
    //   throw new Error('the user is not authenticated, please login and try again');
    // }

    // validate.token(req.cookies.token);

    const result = await newPool(req.body.pool);

    if (result.error) {
      throw result.error;
    }

    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(400).send({ error: true, message: error.message });
  }
});

module.exports = router;
