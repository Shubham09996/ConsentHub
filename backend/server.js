const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const ownerRoutes = require('./routes/ownerRoutes');
const consumerRoutes = require('./routes/consumerRoutes');
const userRoutes = require('./routes/userRoutes');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/consumer', consumerRoutes);
app.use('/api/user', userRoutes);

// Base Route
app.get('/', (req, res) => {
  res.send('ConsentHub API is running securely 🚀');
});

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});