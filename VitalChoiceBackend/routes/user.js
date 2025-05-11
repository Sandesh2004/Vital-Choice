const express = require('express');
const router = express.Router();

const { registerUser } = require('../controllers/userController');
const { loginUser } = require('../controllers/userController');
const { validateToken } = require('../controllers/userController');
const { createProfile } = require('../controllers/userController');
const { authenticate } = require('../controllers/userController');
const { fetchProfile } = require('../controllers/userController');
const { forgotPassword } = require('../controllers/userController');
const { verifyOTP } = require('../controllers/userController');
const { resetPassword } = require('../controllers/userController');
const { saveBreathingSession } = require('../controllers/userController');
const { getBreathingSessions } = require('../controllers/userController');
const { getSongsByMood } = require('../controllers/userController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/validate-token', validateToken);
router.post('/create-profile', authenticate, createProfile);
router.get('/profile', authenticate, fetchProfile);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);
router.post('/save-breathing-session', authenticate, saveBreathingSession);
router.get('/breathing-sessions', authenticate, getBreathingSessions);
router.get('/songs', getSongsByMood);

module.exports = router;
