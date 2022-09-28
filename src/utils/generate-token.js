const jwt = require('jsonwebtoken');

const generateToken = (data) => {
  const token = jwt.sign(data, process.env.JWT_SECRET, { expiresIn: 60 * 20 });

  return token;
};

module.exports = generateToken;
