/* eslint-disable import/no-extraneous-dependencies */
const router = require('express').Router();
const {
  createCardValidation,
  cardIdValidation,
} = require('../middlewares/validations');

const {
  createMovie, getMovies, deleteMovie,
} = require('../controllers/movies');

router.get('/', getMovies);

router.post('/', createCardValidation, createMovie);

router.delete('/:id', cardIdValidation, deleteMovie);

module.exports = router;
