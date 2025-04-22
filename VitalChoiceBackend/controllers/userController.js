const { admin } = require('../firebase/firebaseAdmin');
const axios = require('axios');

const registerUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userRecord = await admin.auth().createUser({ email, password });
    return res.status(201).json({ message: 'User registered successfully', uid: userRecord.uid });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`,
      {
        email,
        password,
        returnSecureToken: true,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return res.status(200).json({
      message: 'Login successful',
      idToken: response.data.idToken,
      refreshToken: response.data.refreshToken,
      uid: response.data.localId,
    });
  } catch (error) {
    console.log('Login error:', error.response?.data || error.message);
    return res.status(401).json({
      error: error.response?.data?.error?.message || 'Login failed',
    });
  }
};

const validateToken = async(req, res) => {
  const { token } = req.body;

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    return res.json({ valid: true, uid: decoded.uid });
  } catch (err) {
    return res.json({ valid: false });
  }
};

module.exports = {registerUser, loginUser, validateToken};

