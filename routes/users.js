/* eslint-disable import/no-extraneous-dependencies */
const router = require('express').Router();
const {
  updateUserValidation,
} = require('../middlewares/validations');
const {
  updateUser, getUser,
} = require('../controllers/users');

router.get('/users/me', getUser);
router.patch('/users/me', updateUserValidation, updateUser);

module.exports = router;
