const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/unauthorized-err');

const { SECRET_STRING } = require('../utils/config');

module.exports = (req, res, next) => {
  const token = req.cookies.jwt;
  let payload;

  try {
    payload = jwt.verify(token, SECRET_STRING);
  } catch (err) {
    return next(new UnauthorizedError('Необходима авторизация.'));
  }

  req.user = payload;
  return next();
};
