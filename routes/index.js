/* eslint-disable import/no-extraneous-dependencies */
const router = require('express').Router();
const cardRouter = require('./movies');
const userRouter = require('./users');

router.use('/users', userRouter);
router.use('/cards', cardRouter);

module.exports = router;
