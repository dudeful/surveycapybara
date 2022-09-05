const router = require('express').Router();
const newPool = require('../services/register-pool.js');
const getPool = require('../services/get-pool.js');
const { options } = require('../utils/validators.js');

router.get('/', async (req, res) => {
	try {
		const result = await getPool(req.query);
		res.send(result);
	} catch (error) {
		console.error(error);
		res.status(400).send({ error: true, message: error.message });
	}
});

router.post('/new', options, async (req, res) => {
	try {
		const result = await newPool(req.pool);
		res.send(result);
	} catch (error) {
		console.error(error);
		res.status(400).send({ error: true, message: error.message });
	}
});

module.exports = router;
