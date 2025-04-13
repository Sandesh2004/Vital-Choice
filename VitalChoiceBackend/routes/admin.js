const express = require('express');
const router = express.Router();
const { loginDoctor } = require('../controllers/adminController');

router.post('/login', loginDoctor); // POST /api/admin/login → verify password

module.exports = router;
