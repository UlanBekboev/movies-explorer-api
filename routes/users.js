/* eslint-disable import/no-extraneous-dependencies */
const router = require('express').Router();
const {
  updateUserValidation,
} = require('../middlewares/validations');
const {
  updateUserInfo, getUserInfo,
} = require('../controllers/users');

router.get('/me', getUserInfo);
router.patch('/me', updateUserValidation, updateUserInfo);

module.exports = router;
