/* eslint-disable no-underscore-dangle */
const BadRequestError = require('../errors/bad-request-err');
const { OK_STATUS, CREATED_STATUS } = require('../errors/status');
const ForbiddenError = require('../errors/forbidden-err');
const NotFoundError = require('../errors/not-found-err');

const Movie = require('../models/movies');

module.exports.getMovies = (req, res, next) => {
  Movie.find({})
    .then((cards) => res.status(OK_STATUS).send(cards))
    .catch(next);
};

module.exports.createMovie = (req, res, next) => {
  const { name, link } = req.body;

  Movie.create({ name, link, owner: req.user._id })
    .then((card) => res.status(CREATED_STATUS).send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Переданы неверные данные.'));
      }
      return next(err);
    });
};
// eslint-disable-next-line
module.exports.deleteMovie = async (req, res, next) => {
  const { id } = req.params;
  const { _id } = req.user;

  try {
    const card = await Movie.findById(id);
    if (!card) {
      return next(new NotFoundError('Карточка не найдена.'));
    }
    if (card.owner.valueOf() !== _id) {
      return next(new ForbiddenError('Нельзя удалить чужую карточку!'));
    }
    await card.deleteOne();

    res.status(OK_STATUS).send({ message: 'Карточка успешно удалена.' });
  } catch (err) {
    next(err);
  }
};

module.exports.likeCard = (req, res, next) => {
  Movie.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        return next(new NotFoundError('Карточка не найдена.'));
      }
      return res.status(200).send(card);
    })
    .catch(next);
};

module.exports.dislikeCard = (req, res, next) => {
  Movie.findByIdAndUpdate(
    req.params.id,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        return next(
          new NotFoundError('Карточка не найдена. Лайк не удалось убрать.'),
        );
      }
      return res.status(OK_STATUS).send(card);
    })
    .catch(next);
};
