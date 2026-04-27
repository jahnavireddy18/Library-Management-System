const mongoose = require('mongoose');
const Book = require('./models/Book');
const User = require('./models/User');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartlibrary');
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    await Book.deleteMany();
    await User.deleteMany();

    // Sample books
    const books = [
      {
        title: 'Data Structures and Algorithms',
        author: 'Thomas Cormen',
        isbn: '9780262033848',
        category: 'Computer Science',
        description: 'Comprehensive guide to data structures and algorithms',
        totalCopies: 5,
        availableCopies: 5,
        location: 'Shelf A1',
        imageUrl: 'assets/img/ds.jpeg',
        publishedYear: 2009,
        publisher: 'MIT Press'
      },
      {
        title: 'Python Programming',
        author: 'John Zelle',
        isbn: '9781590282755',
        category: 'Programming',
        description: 'Introduction to programming using Python',
        totalCopies: 3,
        availableCopies: 3,
        location: 'Shelf B2',
        imageUrl: 'assets/img/python.jpeg',
        publishedYear: 2016,
        publisher: 'Franklin, Beedle & Associates'
      },
      {
        title: 'Full Stack Development',
        author: 'Anthony Accomazzo',
        isbn: '9781734480509',
        category: 'Web Development',
        description: 'Complete guide to full stack web development',
        totalCopies: 4,
        availableCopies: 4,
        location: 'Shelf C3',
        imageUrl: 'assets/img/web.jpg',
        publishedYear: 2020,
        publisher: 'Fullstack.io'
      },
      {
        title: 'JavaScript: The Good Parts',
        author: 'Douglas Crockford',
        isbn: '9780596517748',
        category: 'Programming',
        description: 'Essential guide to JavaScript programming',
        totalCopies: 6,
        availableCopies: 6,
        location: 'Shelf D4',
        imageUrl: 'assets/img/js.jpeg',
        publishedYear: 2008,
        publisher: "O'Reilly Media"
      },
      {
        title: 'Java Programming Basics',
        author: 'Herbert Schildt',
        isbn: '9780071808552',
        category: 'Programming',
        description: 'Fundamentals of Java programming',
        totalCopies: 4,
        availableCopies: 4,
        location: 'Shelf E5',
        imageUrl: 'assets/img/java.jpeg',
        publishedYear: 2014,
        publisher: 'McGraw-Hill Education'
      },
      {
        title: 'C Programming Language',
        author: 'Brian Kernighan',
        isbn: '9780131103627',
        category: 'Programming',
        description: 'Classic guide to C programming',
        totalCopies: 3,
        availableCopies: 3,
        location: 'Shelf F6',
        imageUrl: 'assets/img/c++.jpeg',
        publishedYear: 1988,
        publisher: 'Prentice Hall'
      },
      {
        title: 'Artificial Intelligence: A Modern Approach',
        author: 'Stuart Russell',
        isbn: '9780136042594',
        category: 'AI',
        description: 'Comprehensive introduction to AI',
        totalCopies: 2,
        availableCopies: 2,
        location: 'Shelf G7',
        imageUrl: 'assets/img/ai.jpg',
        publishedYear: 2020,
        publisher: 'Pearson'
      },
      {
        title: 'Machine Learning',
        author: 'Tom Mitchell',
        isbn: '9780070428072',
        category: 'Machine Learning',
        description: 'Foundations of machine learning',
        totalCopies: 3,
        availableCopies: 3,
        location: 'Shelf H8',
        imageUrl: 'assets/img/machinelearning.jpg',
        publishedYear: 1997,
        publisher: 'McGraw-Hill'
      },
      {
        title: 'Database System Concepts',
        author: 'Abraham Silberschatz',
        isbn: '9780073523323',
        category: 'Database',
        description: 'Principles of database systems',
        totalCopies: 4,
        availableCopies: 4,
        location: 'Shelf I9',
        imageUrl: 'assets/img/dbms.jpeg',
        publishedYear: 2010,
        publisher: 'McGraw-Hill'
      },
      {
        title: 'Cybersecurity Fundamentals',
        author: 'Vince Lobello',
        isbn: '9781492023263',
        category: 'Security',
        description: 'Essential cybersecurity concepts',
        totalCopies: 3,
        availableCopies: 3,
        location: 'Shelf J10',
        imageUrl: 'assets/img/cyber.jpg',
        publishedYear: 2019,
        publisher: "O'Reilly Media"
      }
    ];

    // Sample users
    const users = [
      {
        name: 'Admin User',
        email: 'admin@vemu.edu',
        password: 'admin123',
        role: 'admin',
        department: 'IT'
      },
      {
        name: 'Librarian User',
        email: 'librarian@vemu.edu',
        password: 'lib123',
        role: 'librarian',
        department: 'Library'
      },
      {
        name: 'John Student',
        email: 'john.student@vemu.edu',
        password: 'student123',
        role: 'student',
        enrollmentNumber: 'CS2024001',
        department: 'Computer Science'
      },
      {
        name: 'Jane Teacher',
        email: 'jane.teacher@vemu.edu',
        password: 'teacher123',
        role: 'teacher',
        department: 'Computer Science'
      }
    ];

    // Hash passwords
    const bcrypt = require('bcryptjs');
    for (let user of users) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }

    await Book.insertMany(books);
    await User.insertMany(users);

    console.log('Sample data seeded successfully!');
    console.log('Books added:', books.length);
    console.log('Users added:', users.length);
    console.log('\nLogin credentials:');
    console.log('Admin: admin@vemu.edu / admin123');
    console.log('Librarian: librarian@vemu.edu / lib123');
    console.log('Student: john.student@vemu.edu / student123');
    console.log('Teacher: jane.teacher@vemu.edu / teacher123');

    process.exit();
  } catch (err) {
    console.error('Seeding error:', err.message);
    process.exit(1);
  }
};

connectDB().then(seedData);