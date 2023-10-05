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

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.status(OK_STATUS).send(users))
    .catch(next);
};

module.exports.getUser = (req, res, next) => {
  const { id } = req.params;

  User.findById(id)
    .then((user) => {
      if (!user) {
        return next(new NotFoundError('Пользователь не найден'));
      }
      return res.status(OK_STATUS).send(user);
    })
    .catch(next);
};

module.exports.updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(
    req.user.id,
    { avatar },
    { new: true, runValidators: true },
  )
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Неверная ссылка'));
      }
      return next(err);
    });
};

module.exports.updateUser = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    req.user.id,
    { name, about },
    { new: true, runValidators: true },
  )
    .then((user) => res.status(OK_STATUS).send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Неверный тип данных.'));
      }
      return next(err);
    });
};

module.exports.getProfile = (req, res, next) => {
  const { _id } = req.user;

  User.findById(_id)
    .then((user) => {
      if (!user) {
        return next(new NotFoundError('Нет пользователя с таким id'));
      }
      return res.status(OK_STATUS).send(user);
    })
    .catch(next);
};
