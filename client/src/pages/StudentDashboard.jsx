import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Layout/Sidebar';
import Toast from '../components/Toast/Toast';
import { getBooks, getUserProfile, borrowBook as apiBorrow, returnBook as apiReturn } from '../services/api';
import { FaHome, FaBook, FaHandHolding, FaPaperPlane, FaQuestionCircle, FaSearch } from 'react-icons/fa';
import './Dashboard.css';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [profile, setProfile] = useState(null);
  const [view, setView] = useState('dashboard');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  const sidebarLinks = [
    { to: '/student', end: true, icon: <FaHome />, label: 'Dashboard' },
    { to: '/student/books', icon: <FaBook />, label: 'Browse Books' },
    { to: '/student/borrowed', icon: <FaHandHolding />, label: 'My Books' },
    { to: '/student/request', icon: <FaPaperPlane />, label: 'Request Book' },
    { to: '/student/help', icon: <FaQuestionCircle />, label: 'Help Center' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [booksData, profileData] = await Promise.all([getBooks(), getUserProfile()]);
      setBooks(booksData);
      setProfile(profileData);
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to load data. Is the server running?' });
    } finally {
      setLoading(false);
    }
  }

  async function handleBorrow(bookId) {
    if (!window.confirm('Borrow this book?')) return;
    try {
      const data = await apiBorrow(bookId);
      setToast({ type: 'success', message: `Book borrowed! Due: ${new Date(data.dueDate).toLocaleDateString()}` });
      loadData();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  }

  async function handleReturn(bookId) {
    if (!window.confirm('Return this book?')) return;
    try {
      await apiReturn(bookId);
      setToast({ type: 'success', message: 'Book returned successfully!' });
      loadData();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  }

  const filteredBooks = books.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase()) ||
    b.category.toLowerCase().includes(search.toLowerCase())
  );

  const activeBorrowed = profile?.borrowedBooks?.filter(b => !b.returned) || [];
  const availableCount = books.filter(b => b.availableCopies > 0).length;
  const categories = [...new Set(books.map(b => b.category))].length;

  return (
    <div className="dashboard-layout">
      <Sidebar brand="Student Portal" brandIcon="📚" links={sidebarLinks} />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <main className="dashboard-main">
        <div className="dash-topbar">
          <h2 className="page-title">
            {view === 'dashboard' && 'Dashboard'}
            {view === 'books' && 'Browse Books'}
            {view === 'borrowed' && 'My Books'}
            {view === 'request' && 'Request Book'}
            {view === 'help' && 'Help Center'}
          </h2>
          <div className="topbar-user">
            <span className="user-greeting">Hello, <strong>{user?.name}</strong></span>
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="dash-tabs">
          {['dashboard', 'books', 'borrowed', 'request', 'help'].map(v => (
            <button key={v} className={`tab ${view === v ? 'active' : ''}`} onClick={() => setView(v)}>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-state"><div className="loader" /><p>Loading your dashboard...</p></div>
        ) : (
          <>
            {/* Dashboard View */}
            {view === 'dashboard' && (
              <div className="fade-in">
                <div className="stats-row">
                  <div className="stat-card purple"><h4>Available Books</h4><span className="stat-num">{availableCount}</span></div>
                  <div className="stat-card blue"><h4>My Borrowed</h4><span className="stat-num">{activeBorrowed.length}</span></div>
                  <div className="stat-card cyan"><h4>Categories</h4><span className="stat-num">{categories}</span></div>
                  <div className="stat-card pink"><h4>Fines</h4><span className="stat-num">₹{profile?.fines || 0}</span></div>
                </div>

                <div className="section-card">
                  <h3>📚 Recently Added Books</h3>
                  <div className="book-grid">
                    {books.slice(0, 6).map(book => (
                      <BookCard key={book._id} book={book} onBorrow={handleBorrow} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Books View */}
            {view === 'books' && (
              <div className="fade-in">
                <div className="search-bar">
                  <FaSearch className="search-icon" />
                  <input placeholder="Search books by title, author, or category..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className="book-grid">
                  {filteredBooks.length === 0 ? (
                    <p className="empty-msg">No books found matching "{search}"</p>
                  ) : (
                    filteredBooks.map(book => (
                      <BookCard key={book._id} book={book} onBorrow={handleBorrow} />
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Borrowed View */}
            {view === 'borrowed' && (
              <div className="fade-in">
                {activeBorrowed.length === 0 ? (
                  <div className="empty-state"><span className="empty-icon">📭</span><p>No books currently borrowed.</p></div>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead><tr><th>Title</th><th>Borrow Date</th><th>Due Date</th><th>Status</th><th>Action</th></tr></thead>
                      <tbody>
                        {activeBorrowed.map((item, i) => {
                          const isOverdue = new Date() > new Date(item.dueDate);
                          const bookId = item.book?._id || item.book;
                          const bookTitle = item.book?.title || 'Unknown Book';
                          return (
                            <tr key={i}>
                              <td className="fw-600">{bookTitle}</td>
                              <td>{new Date(item.borrowDate).toLocaleDateString()}</td>
                              <td>{new Date(item.dueDate).toLocaleDateString()}</td>
                              <td><span className={`badge ${isOverdue ? 'badge-red' : 'badge-green'}`}>{isOverdue ? 'Overdue' : 'Active'}</span></td>
                              <td><button className="btn-sm btn-accent" onClick={() => handleReturn(bookId)}>Return</button></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Request View */}
            {view === 'request' && (
              <div className="fade-in">
                <div className="section-card" style={{ maxWidth: 600 }}>
                  <h3>📬 Request a New Book</h3>
                  <RequestForm onSuccess={(msg) => setToast({ type: 'success', message: msg })} />
                </div>
              </div>
            )}

            {/* Help View */}
            {view === 'help' && (
              <div className="fade-in">
                <div className="section-card" style={{ maxWidth: 600 }}>
                  <h3>🆘 Need Help?</h3>
                  <HelpForm onSuccess={(msg) => setToast({ type: 'success', message: msg })} />
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function BookCard({ book, onBorrow }) {
  const avail = book.availableCopies > 0;
  return (
    <div className="book-card">
      <div className="book-img" style={{ backgroundImage: `url(${book.imageUrl || '/logo.jpg'})` }} />
      <div className="book-body">
        <h4>{book.title}</h4>
        <p className="book-author">{book.author}</p>
        <div className="book-meta">
          <span className="badge badge-purple">{book.category}</span>
          <span className={`badge ${avail ? 'badge-green' : 'badge-red'}`}>{avail ? `${book.availableCopies} avail` : 'Unavailable'}</span>
        </div>
        <button className="btn-sm btn-primary" onClick={() => onBorrow(book._id)} disabled={!avail}>
          {avail ? 'Borrow' : 'Unavailable'}
        </button>
      </div>
    </div>
  );
}

function RequestForm({ onSuccess }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!title || !author) return;
    let msgs = JSON.parse(localStorage.getItem('librarianMsg') || '[]');
    msgs.push({ text: `📚 Book Request: ${title} by ${author}` });
    localStorage.setItem('librarianMsg', JSON.stringify(msgs));
    setTitle(''); setAuthor('');
    onSuccess('Book request sent to librarian!');
  }

  return (
    <form onSubmit={handleSubmit} className="dash-form">
      <div className="form-row">
        <div className="form-group"><label>Book Title</label><input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Clean Code" required /></div>
        <div className="form-group"><label>Author</label><input value={author} onChange={e => setAuthor(e.target.value)} placeholder="e.g. Robert C. Martin" required /></div>
      </div>
      <button type="submit" className="btn-primary">Send Request</button>
    </form>
  );
}

function HelpForm({ onSuccess }) {
  const [msg, setMsg] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!msg) return;
    let arr = JSON.parse(localStorage.getItem('librarianMsg') || '[]');
    arr.push({ text: `❓ Help: ${msg}` });
    localStorage.setItem('librarianMsg', JSON.stringify(arr));
    setMsg('');
    onSuccess('Help message sent!');
  }

  return (
    <form onSubmit={handleSubmit} className="dash-form">
      <div className="form-group"><label>Describe your issue</label><textarea value={msg} onChange={e => setMsg(e.target.value)} rows="4" placeholder="Describe your question or issue..." required /></div>
      <button type="submit" className="btn-primary">Send Message</button>
    </form>
  );
}
