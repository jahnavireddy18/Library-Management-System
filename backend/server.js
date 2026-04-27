const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartlibrary', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.log('❌ MongoDB connection error:', err.message));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/books', require('./routes/books'));
app.use('/api/users', require('./routes/users'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Smart Library API is running' });
});

// Serve React client build in production
const clientBuild = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientBuild));

// Also serve legacy static HTML pages from the project root
app.use(express.static(path.join(__dirname, '..')));

// Catch-all: serve React's index.html for client-side routing
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api/')) {
    const reactIndex = path.join(clientBuild, 'index.html');
    const fs = require('fs');
    if (fs.existsSync(reactIndex)) {
      res.sendFile(reactIndex);
    } else {
      // Fallback to legacy HTML
      res.sendFile(path.join(__dirname, '..', 'index.html'));
    }
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📂 React build: ${clientBuild}`);
});