const express = require('express');
const router = express.Router();
const { loginDoctor } = require('../controllers/adminController');
const { getAllProfiles, getProfileById, updateProfileById } = require('../controllers/adminController');
const authenticate = require('../middleware/authMiddleware');

router.post('/login', loginDoctor); // POST /api/admin/login → verify password
router.get('/profiles', authenticate, getAllProfiles); // GET all profiles
router.get('/profiles/:uid', authenticate, getProfileById); // GET one profile
router.put('/profiles/:uid', authenticate, updateProfileById); // UPDATE one profile

module.exports = router;
