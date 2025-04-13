require('dotenv').config();

// Admin password check
const loginDoctor = (req, res) => {
  const { password } = req.body;

  if (password === process.env.DOCTOR_PASSWORD) {
    return res.status(200).json({ message: 'Access granted' });
  } else {
    return res.status(401).json({ error: 'Wrong password' });
  }
};

module.exports = { loginDoctor };
