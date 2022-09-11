const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
const pools = require('./controllers/pools');
const users = require('./controllers/users');
require('dotenv').config();

app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.get('/ping', (req, res) => {
  res.send('pong');
});

app.use('/pools', pools);
app.use('/users', users);

app.listen(5000, () => console.log('Server Running on Port 5000'));
