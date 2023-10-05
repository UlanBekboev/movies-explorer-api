/* eslint-disable import/no-extraneous-dependencies */
const router = require('express').Router();
const {
  updateUserValidation,
} = require('../middlewares/validations');
const {
  updateUser, getProfile,
} = require('../controllers/users');

router.get('/me', getProfile);
router.patch('/me', updateUserValidation, updateUser);
/* router.get('/', getUsers);

router.get('/:id', userIdValidation, getUser); */

/* router.patch('/me/avatar', updateAvatarValidation, updateAvatar); */

module.exports = router;
