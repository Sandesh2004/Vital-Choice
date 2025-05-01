require('dotenv').config();
const jwt = require('jsonwebtoken');
const { admin } = require('../firebase/firebaseAdmin');

// Admin login
const loginDoctor = (req, res) => {
  const { password } = req.body;

  if (password === process.env.DOCTOR_PASSWORD) {
    const token = jwt.sign({ isAdmin: true }, process.env.JWT_SECRET, { expiresIn: '1d' });
    return res.status(200).json({ message: 'Access granted', token });
  } else {
    return res.status(401).json({ error: 'Wrong password' });
  }
};

// Fetch all profiles
const getAllProfiles = async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection('profiles').get();
    const users = snapshot.docs.map(doc => {
      return {
      uid: doc.id,
      ...doc.data()
      };
    });

    return res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching profiles:', error);
    return res.status(500).json({ message: 'Failed to fetch profiles' });
  }
};

// Fetch profile by UID
const getProfileById = async (req, res) => {
  const { uid } = req.params;

  try {
    const docRef = admin.firestore().collection('profiles').doc(uid);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    return res.status(200).json(doc.data());
  } catch (error) {
    console.error('Error fetching profile by ID:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const updateProfileById = async (req, res) => {
  try {
    const { uid } = req.params;
    const profileData = req.body;
    
    // Add timestamp
    profileData.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    
    await admin.firestore().collection('profiles').doc(uid).update(profileData);
    
    return res.status(200).json({ 
      message: 'Profile updated successfully',
      uid
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(400).json({ error: error.message });
  }
};

module.exports = { loginDoctor, getAllProfiles, getProfileById, updateProfileById };
