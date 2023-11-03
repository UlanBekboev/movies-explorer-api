/* eslint-disable import/no-extraneous-dependencies */
const router = require('express').Router();
const {
  createFilmValidation,
  filmIdValidation,
} = require('../middlewares/validations');

const {
  createMovie, getMovies, deleteMovie,
} = require('../controllers/movies');

router.get('/', getMovies);

router.post('/', createFilmValidation, createMovie);

router.delete('/:movieId', filmIdValidation, deleteMovie);

module.exports = router;
