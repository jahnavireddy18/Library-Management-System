const express = require('express');
const Book = require('../models/Book');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all books
router.get('/', async (req, res) => {
  try {
    const books = await Book.find().populate('reservations.user', 'name email');
    res.json(books);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get book by ID
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('reservations.user', 'name email');
    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }
    res.json(book);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Add new book (Admin/Librarian only)
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'librarian') {
    return res.status(403).json({ msg: 'Access denied' });
  }

  const { title, author, isbn, category, description, totalCopies, location, imageUrl, publishedYear, publisher } = req.body;

  try {
    let book = await Book.findOne({ isbn });
    if (book) {
      return res.status(400).json({ msg: 'Book with this ISBN already exists' });
    }

    book = new Book({
      title,
      author,
      isbn,
      category,
      description,
      totalCopies,
      availableCopies: totalCopies,
      location,
      imageUrl,
      publishedYear,
      publisher,
    });

    await book.save();
    res.json(book);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update book
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'librarian') {
    return res.status(403).json({ msg: 'Access denied' });
  }

  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }
    res.json(book);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Delete book
router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'librarian') {
    return res.status(403).json({ msg: 'Access denied' });
  }

  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }
    res.json({ msg: 'Book deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Reserve book
router.post('/:id/reserve', auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }

    if (book.availableCopies <= 0) {
      return res.status(400).json({ msg: 'No copies available' });
    }

    // Check if user already has a pending reservation
    const existingReservation = book.reservations.find(r => r.user.toString() === req.user.id && r.status === 'pending');
    if (existingReservation) {
      return res.status(400).json({ msg: 'You already have a pending reservation for this book' });
    }

    book.reservations.push({
      user: req.user.id,
      reservationDate: new Date(),
      status: 'pending',
    });

    await book.save();
    res.json({ msg: 'Reservation request submitted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;