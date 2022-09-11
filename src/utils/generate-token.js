const jwt = require('jsonwebtoken');

const generateToken = (data) => {
  const token = jwt.sign(data, process.env.JWT_SECRET, { expiresIn: 60 * 5 });

  console.log(token);

  return token;
};

module.exports = generateToken;
