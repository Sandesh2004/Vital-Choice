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

// Middleware to verify Firebase ID token
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid token' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.uid = decodedToken.uid; // attach UID to request
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(403).json({ message: 'Unauthorized' });
  }
};

const createProfile = async (req, res) => {
    try {
        const profile = req.body;
    
        if (!profile || !profile.name || !profile.phone) {
          return res.status(400).json({ message: 'Missing required fields' });
        }
    
        const profileData = {
          ...profile,
          uid: req.uid,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };
    
        // Save profile with UID as document ID (ensures 1 profile per user)
        await admin.firestore().collection('profiles').doc(req.uid).set(profileData);
    
        res.json({ message: 'Profile saved successfully' });
      } catch (error) {
        console.error('Error saving profile:', error);
        res.status(500).json({ message: 'Server error' });
      }
};

const fetchProfile = async (req, res) => {
  try {
    const docRef = admin.firestore().collection('profiles').doc(req.uid);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    return res.json(doc.data());
  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {registerUser, loginUser, validateToken, authenticate, createProfile, fetchProfile};

