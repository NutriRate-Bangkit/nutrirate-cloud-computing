// app.js
const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const predictRoutes = require('./routes/predict');
const historyRoutes = require('./routes/history');

const app = express();

app.use(bodyParser.json());

app.use('/auth', authRoutes);
app.use('/predict', predictRoutes);
app.use('/history', historyRoutes);

const PORT = process.env.PORT || 3009;
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
