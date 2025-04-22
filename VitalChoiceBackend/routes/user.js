const express = require('express');
const router = express.Router();
const { registerUser } = require('../controllers/userController');
const { loginUser } = require('../controllers/userController');
const { validateToken } = require('../controllers/userController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/validate-token', validateToken);

module.exports = router;
