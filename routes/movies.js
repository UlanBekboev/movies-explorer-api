/* eslint-disable import/no-extraneous-dependencies */
const router = require('express').Router();
const {
  createFilmValidation,
  filmIdValidation,
} = require('../middlewares/validations');

const {
  addMovie, getMovies, deleteMovie,
} = require('../controllers/movies');

router.get('/', getMovies);

router.post('/', createFilmValidation, addMovie);

router.delete('/:movieId', filmIdValidation, deleteMovie);

module.exports = router;
