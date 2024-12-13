const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const predictRoutes = require('./routes/predict');
const historyRoutes = require('./routes/history');
const profileRoutes = require('./routes/profile');
const path = require('path');
const fs = require('fs');
const { marked } = require('marked');

const app = express();

app.use(bodyParser.json());

app.use('/auth', authRoutes);
app.use('/predict', predictRoutes);
app.use('/history', historyRoutes);
app.use('/profile', profileRoutes);

const PORT = process.env.PORT || 8080;

// Tangkap objek server dari app.listen
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
  console.error('Server startup error:', err);
});

// Tambahkan timeout untuk debugging
server.setTimeout(30000); // 30 detik timeout
