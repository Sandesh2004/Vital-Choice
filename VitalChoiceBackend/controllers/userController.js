const { admin } = require('../firebase/firebaseAdmin');
const axios = require('axios');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

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

// Store OTP codes with expiration times
const otpStore = {};

// Forgot password - send OTP
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Check if user exists
    const userRecord = await admin.auth().getUserByEmail(email);
    
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with 10-minute expiration
    otpStore[email] = {
      otp,
      expiry: Date.now() + 10 * 60 * 1000, // 10 minutes
    };

    // Configure email transporter (update with your email service details)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Vital Choice - Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #3498DB; text-align: center;">Vital Choice Password Reset</h2>
          <p>We received a request to reset your password. Please use the following OTP code to verify your identity:</p>
          <div style="background-color: #f8f8f8; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
          <p style="margin-top: 30px; font-size: 12px; color: #777; text-align: center;">
            &copy; ${new Date().getFullYear()} Vital Choice. All rights reserved.
          </p>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Forgot password error:', error);
    
    // Don't reveal if email exists or not for security
    return res.status(200).json({ message: 'If your email is registered, you will receive an OTP shortly' });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required' });
  }

  try {
    // Check if OTP exists and is valid
    const otpData = otpStore[email];
    
    if (!otpData) {
      return res.status(400).json({ error: 'OTP expired or invalid' });
    }

    if (otpData.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    if (Date.now() > otpData.expiry) {
      delete otpStore[email];
      return res.status(400).json({ error: 'OTP expired' });
    }

    // OTP is valid - don't delete it yet as we'll need it for password reset
    return res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('OTP verification error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ error: 'Email, OTP, and new password are required' });
  }

  try {
    // Verify OTP again
    const otpData = otpStore[email];
    
    if (!otpData || otpData.otp !== otp || Date.now() > otpData.expiry) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Get user by email
    const userRecord = await admin.auth().getUserByEmail(email);
    
    // Update password
    await admin.auth().updateUser(userRecord.uid, {
      password: newPassword,
    });

    // Clear OTP after successful password reset
    delete otpStore[email];

    return res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({ error: 'Failed to reset password' });
  }
};

// Save breathing session data
const saveBreathingSession = async (req, res) => {
  try {
    const uid = req.uid; // Get uid directly from req.uid
    const { duration, timestamp } = req.body;
    
    // Validate input
    if (duration === undefined || !timestamp) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Create a new breathing session document
    const sessionData = {
      duration,
      timestamp,
      timestamp: timestamp || new Date().toISOString(),
      uid: req.uid,  // Add the user ID from the authenticated request
    };

    // Save to Firestore - ensure we have a valid document ID
    const breathingSessionsRef = admin.firestore().collection('breathingSessions');
    
    // Generate a new document ID if none is provided
    await breathingSessionsRef.doc().set(sessionData);
    
    res.status(200).json({ message: 'Breathing session saved successfully' });
  } catch (error) {
    console.error('Save breathing session error:', error);
    res.status(500).json({ message: 'Failed to save breathing session', error: error.message });
  }
};

const getBreathingSessions = async (req, res) => {
  try {
    const uid = req.uid;
    
    // Query Firestore to get all breathing sessions for this user
    const sessionsSnapshot = await admin.firestore()
      .collection('breathingSessions')
      .where('uid', '==', uid)
      .orderBy('timestamp', 'asc')
      .get();
    
    if (sessionsSnapshot.empty) {
      return res.status(200).json({ sessions: [] });
    }
    
    // Convert to array of session data
    const sessions = [];
    sessionsSnapshot.forEach(doc => {
      sessions.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return res.status(200).json({ 
      sessions,
      count: sessions.length
    });
  } catch (error) {
    console.error('Get breathing sessions error:', error);
    return res.status(500).json({ error: 'Failed to retrieve breathing sessions' });
  }
};

const songsByMood = {
  Stressed: [
    { id: '1', title: 'Water Fountain', url: 'http://192.168.32.58:5000/music/water_fountain.mp3' },
    { id: '2', title: 'Peaceful Mind', url: 'https://example.com/audio/peaceful-mind.mp3' }
  ],
  Sad: [
    { id: '3', title: 'Hopeful Sunrise', url: 'https://example.com/audio/hopeful-sunrise.mp3' }
  ],
  Hopeful: [
    { id: '4', title: 'Bright Future', url: 'https://example.com/audio/bright-future.mp3' }
  ],
  Motivated: [
    { id: '5', title: 'Go Get It', url: 'https://example.com/audio/go-get-it.mp3' }
  ]
};

const getSongsByMood = (req, res) => {
  const mood = req.query.mood;
  if (!mood || !songsByMood[mood]) {
    return res.status(200).json({ songs: [] });
  }
  return res.status(200).json({ songs: songsByMood[mood] });
};

module.exports = {registerUser, 
                  loginUser, 
                  validateToken,
                  authenticate, 
                  createProfile, 
                  fetchProfile, 
                  forgotPassword, 
                  verifyOTP, 
                  resetPassword, 
                  saveBreathingSession, 
                  getBreathingSessions, 
                  getSongsByMood};

