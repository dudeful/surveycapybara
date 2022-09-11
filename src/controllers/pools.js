const router = require('express').Router();
const newPool = require('../services/register-pool.js');
const getPool = require('../services/get-pool.js');
const validate = require('../utils/validators.js');

router.get('/', async (req, res) => {
  try {
    const result = await getPool({ pool: req.query, token: req.cookies.token });

    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(400).send({ error: true, message: error.message });
  }
});

router.post('/new', async (req, res) => {
  try {
    validate.token(req.cookies.token);

    const result = await newPool(req.body.pool);

    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(400).send({ error: true, message: error.message });
  }
});

module.exports = router;
