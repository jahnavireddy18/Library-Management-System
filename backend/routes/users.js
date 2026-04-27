const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all users (Admin only)
router.get('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied' });
  }

  try {
    const users = await User.find().select('-password').populate('borrowedBooks.book');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password').populate('borrowedBooks.book');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, req.body, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Borrow book
router.post('/borrow/:bookId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const book = await require('../models/Book').findById(req.params.bookId);

    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }

    if (book.availableCopies <= 0) {
      return res.status(400).json({ msg: 'No copies available' });
    }

    // Check if user already borrowed this book
    const alreadyBorrowed = user.borrowedBooks.find(b => b.book.toString() === req.params.bookId && !b.returned);
    if (alreadyBorrowed) {
      return res.status(400).json({ msg: 'You have already borrowed this book' });
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // 14 days loan period

    user.borrowedBooks.push({
      book: req.params.bookId,
      dueDate,
    });

    book.availableCopies -= 1;
    await book.save();
    await user.save();

    res.json({ msg: 'Book borrowed successfully', dueDate });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Return book
router.post('/return/:bookId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const book = await require('../models/Book').findById(req.params.bookId);

    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }

    const borrowedBook = user.borrowedBooks.find(b => b.book.toString() === req.params.bookId && !b.returned);
    if (!borrowedBook) {
      return res.status(400).json({ msg: 'You have not borrowed this book' });
    }

    borrowedBook.returned = true;
    book.availableCopies += 1;

    // Calculate fine if overdue
    const today = new Date();
    if (today > borrowedBook.dueDate) {
      const daysOverdue = Math.ceil((today - borrowedBook.dueDate) / (1000 * 60 * 60 * 24));
      const fine = daysOverdue * 10; // $10 per day
      user.fines += fine;
    }

    await book.save();
    await user.save();

    res.json({ msg: 'Book returned successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;