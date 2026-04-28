const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bcryptjs = require('bcryptjs');
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
.then(() => {
  console.log('✅ MongoDB connected');
  // Auto-seed users if they don't exist
  seedDefaultUsers();
})
.catch(err => console.log('❌ MongoDB connection error:', err.message));

// Auto-seed function
async function seedDefaultUsers() {
  try {
    // Wait a bit for mongoose to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('🌱 Starting seed check...');
    const User = require('./models/User');
    
    const userCount = await User.countDocuments();
    console.log(`📊 Current users in database: ${userCount}`);
    
    if (userCount === 0) {
      console.log('🌱 Seeding default users...');
      const defaultUsers = [
        { name: 'Admin User', email: 'admin@vemu.edu', password: 'admin123', role: 'admin', department: 'IT' },
        { name: 'Librarian User', email: 'librarian@vemu.edu', password: 'lib123', role: 'librarian', department: 'Library' },
        { name: 'John Student', email: 'john.student@vemu.edu', password: 'student123', role: 'student', enrollmentNumber: 'CS2024001', department: 'Computer Science' },
        { name: 'Jane Teacher', email: 'jane.teacher@vemu.edu', password: 'teacher123', role: 'teacher', department: 'Computer Science' }
      ];

      for (let user of defaultUsers) {
        const salt = await bcryptjs.genSalt(10);
        user.password = await bcryptjs.hash(user.password, salt);
      }

      const result = await User.insertMany(defaultUsers);
      console.log('✅ Default users created successfully!');
      console.log('📝 Login with: admin@vemu.edu / admin123');
      console.log(`👥 Created ${result.length} users`);
    } else {
      console.log('✅ Users already exist in database, skipping seed');
    }
  } catch (err) {
    console.error('❌ Seeding error:', err.message);
    console.error('Stack:', err.stack);
  }
}

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