/* eslint-disable import/no-extraneous-dependencies */
const router = require('express').Router();
const movieRouter = require('./movies');
const userRouter = require('./users');

router.use('/users', userRouter);
router.use('/movies', movieRouter);

module.exports = router;
