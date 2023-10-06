/* eslint-disable import/no-extraneous-dependencies */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const NotFoundError = require('../errors/not-found-err');
const { OK_STATUS, CREATED_STATUS } = require('../errors/status');

const { NODE_ENV, JWT_SECRET } = process.env;

const User = require('../models/users');
const BadRequestError = require('../errors/bad-request-err');
const ConflictError = require('../errors/conflict-err');

module.exports.createUser = async (req, res, next) => {
  const {
    email, password, name,
  } = req.body;

  try {
    const hash = await bcrypt.hash(password, 10);
    const createdUser = await User.create({
      email,
      password: hash,
      name,
    });

    res.status(CREATED_STATUS).send({
      name: createdUser.name,
      _id: createdUser.id,
      email: createdUser.email,
    });
  } catch (err) {
    if (err.code === 11000) {
      next(new ConflictError(`Пользователь с ${email} уже существует.`));
    } else {
      next(err);
    }
  }
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user.id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', {
        expiresIn: '7d',
      });
      res
        .cookie('jwt', token, {
          maxage: 3600000,
          httpOnly: true,
          sameSite: true,
        })
        .send({
          email: user.email,
          _id: user.id,
          name: user.name,
        });
    })
    .catch(next);
};

module.exports.getUser = async (req, res, next) => {
  try {
    const { _id } = req.user;
    const currentUser = await User.findById(_id);
    if (!currentUser) {
      return next(new NotFoundError('Пользователь не найден.'));
    }
    return res.status(200).send({
      name: currentUser.name,
      email: currentUser.email,
    });
  } catch (err) {
    return next(err);
  }
};

module.exports.updateUser = (req, res, next) => {
  const { name, email } = req.body;
  User.findByIdAndUpdate(
    req.user.id,
    { name, email },
    { new: true, runValidators: true },
  )
    .then((user) => res.status(OK_STATUS).send({
      name: user.name,
      email: user.email,
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Неверный тип данных.'));
      }
      return next(err);
    });
};
