/* eslint-disable no-underscore-dangle */
const mongoose = require('mongoose');
const Movie = require('../models/movies');

const BadDataError = require('../errors/bad-request-err');
const NotFoundError = require('../errors/not-found-err');
const ForbiddenError = require('../errors/forbidden-err');

module.exports.getMovies = (req, res, next) => {
  const owner = req.user._id;
  Movie.find({ owner })
    .populate(['owner'])
    .then((movies) => {
      res.send(movies);
    })
    .catch((err) => { next(err); });
};

module.exports.createMovie = (req, res, next) => {
  const owner = req.user._id;
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
  } = req.body;
  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
    owner,
  })
    .then((movie) => {
      movie.populate('owner')
        .then((newMovie) => res.status(200).send(newMovie))
        .catch((err) => next(err));
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        next(new BadDataError('Переданы некорректные данные'));
      } else { next(err); }
    });
};

module.exports.deleteMovie = (req, res, next) => {
  const userId = req.user._id;
  const { movieId } = req.params;
  Movie.findById(movieId)
    .then((movie) => {
      if (!movie) {
        throw new NotFoundError(`Фильм с id:${movieId} не найден`);
      } else if (movie.owner.valueOf() === userId) {
        movie.deleteOne()
          .then(res.send({ message: 'Фильм удалён!' }))
          .catch((err) => next(err));
      } else {
        throw new ForbiddenError('Вы не можете удалить чужой фильм');
      }
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.CastError) {
        next(new BadDataError('Передан некорректный id'));
      } else { next(err); }
    });
};

/*
const BadRequestError = require('../errors/bad-request-err');
const { OK_STATUS, CREATED_STATUS } = require('../errors/status');
const ForbiddenError = require('../errors/forbidden-err');
const NotFoundError = require('../errors/not-found-err');

const Movie = require('../models/movies');

module.exports.getMovies = async (req, res, next) => {
  const owner = req.user._id;
  try {
    const movies = await Movie.find({ owner });
    if (!movies || movies.length === 0) {
      res.send('Сохраненных фильмов не найдено.');
    }
    return res.status(OK_STATUS).send(movies);
  } catch (err) {
    return next(err);
  }
};

module.exports.addMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
  } = req.body;

  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
    owner: req.user._id,
  })
    .then((movie) => res.status(CREATED_STATUS).send(movie))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Переданы неверные данные.'));
      }
      return next(err);
    });
};
// eslint-disable-next-line
module.exports.deleteMovie = async (req, res, next) => {
  const { movieId } = req.params;
  const { _id } = req.user;

  try {
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return next(new NotFoundError('Карточка не найдена.'));
    }
    if (movie.owner.valueOf() !== _id) {
      return next(new ForbiddenError('Нельзя удалить чужую карточку!'));
    }
    await movie.deleteOne();

    res.status(OK_STATUS).send({ message: 'Карточка успешно удалена.' });
  } catch (err) {
    next(err);
  }
};
 */
