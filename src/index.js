const express = require('express');
const app = express();

app.get('/test', (req, res) => {
  console.log('server hit');
  res.send('hello friend!');
});

app.listen(5000, () => console.log('Server Running on Port 5000'));
