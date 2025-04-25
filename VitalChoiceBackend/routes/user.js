const express = require('express');
const router = express.Router();

const { registerUser } = require('../controllers/userController');
const { loginUser } = require('../controllers/userController');
const { validateToken } = require('../controllers/userController');
const { createProfile } = require('../controllers/userController');
const { authenticate } = require('../controllers/userController');
const { fetchProfile } = require('../controllers/userController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/validate-token', validateToken);
router.post('/create-profile', authenticate, createProfile);
router.get('/profile', authenticate, fetchProfile);

module.exports = router;
