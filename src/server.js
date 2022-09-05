const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

app.use(express.json());
app.use(cors());

app.get('/ping', (req, res) => {
	res.send('pong');
});

app.listen(5000, () => console.log('Server Running on Port 5000'));
