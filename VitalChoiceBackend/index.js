const express = require('express');
const cors = require('cors');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/music', express.static('music'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
