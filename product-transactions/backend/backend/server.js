// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');

const app = express();

// Accessing environment variables using process.env
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const THIRD_PARTY_API_URL = process.env.THIRD_PARTY_API_URL;

// Database connection using the environment variable
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log(err));

// Example usage of environment variable in a function
app.get('/fetch-data', async (req, res) => {
  try {
    const response = await axios.get(THIRD_PARTY_API_URL);
    res.json(response.data);
  } catch (error) {
    res.status(500).send('Error fetching data');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
