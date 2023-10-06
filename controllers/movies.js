/* eslint-disable no-underscore-dangle */
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
