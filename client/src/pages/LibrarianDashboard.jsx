import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Layout/Sidebar';
import Toast from '../components/Toast/Toast';
import { getBooks, addBook as apiAddBook, deleteBook as apiDeleteBook } from '../services/api';
import { FaHome, FaBook, FaHandHolding, FaUndo, FaPlus, FaTrash, FaSearch } from 'react-icons/fa';
import './Dashboard.css';

export default function LibrarianDashboard() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [view, setView] = useState('dashboard');
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');

  const sidebarLinks = [
    { to: '/librarian', end: true, icon: <FaHome />, label: 'Dashboard' },
    { to: '/librarian/manage', icon: <FaBook />, label: 'Manage Books' },
    { to: '/librarian/issue', icon: <FaHandHolding />, label: 'Issue Books' },
    { to: '/librarian/return', icon: <FaUndo />, label: 'Returns' },
  ];

  useEffect(() => { loadBooks(); }, []);

  async function loadBooks() {
    setLoading(true);
    try {
      const data = await getBooks();
      setBooks(data);
    } catch {
      setToast({ type: 'error', message: 'Failed to load books' });
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteBook(id) {
    if (!window.confirm('Delete this book?')) return;
    try {
      await apiDeleteBook(id);
      setToast({ type: 'success', message: 'Book deleted!' });
      loadBooks();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  }

  const categories = [...new Set(books.map(b => b.category))];
  const filteredBooks = books.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase())
  );

  // Notification count from localStorage
  const notifCount = (JSON.parse(localStorage.getItem('librarianMsg') || '[]')).length +
                     (JSON.parse(localStorage.getItem('recommendations') || '[]')).length;

  return (
    <div className="dashboard-layout">
      <Sidebar brand="Librarian Portal" brandIcon="📖" links={sidebarLinks} />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <main className="dashboard-main">
        <div className="dash-topbar">
          <h2 className="page-title">Librarian Dashboard</h2>
          <div className="topbar-user">
            {notifCount > 0 && <span className="badge badge-red" style={{ fontSize: 11 }}>{notifCount} notifications</span>}
            <span className="user-greeting">Hello, <strong>{user?.name}</strong></span>
          </div>
        </div>

        <div className="dash-tabs">
          {['dashboard', 'manage', 'issue', 'return'].map(v => (
            <button key={v} className={`tab ${view === v ? 'active' : ''}`} onClick={() => setView(v)}>{v.charAt(0).toUpperCase() + v.slice(1)}</button>
          ))}
        </div>

        {loading ? <div className="loading-state"><div className="loader" /></div> : (
          <>
            {view === 'dashboard' && (
              <div className="fade-in">
                <div className="stats-row">
                  <div className="stat-card purple"><h4>Total Books</h4><span className="stat-num">{books.length}</span></div>
                  <div className="stat-card green"><h4>Available</h4><span className="stat-num">{books.filter(b => b.availableCopies > 0).length}</span></div>
                  <div className="stat-card cyan"><h4>Categories</h4><span className="stat-num">{categories.length}</span></div>
                  <div className="stat-card amber"><h4>Notifications</h4><span className="stat-num">{notifCount}</span></div>
                </div>
                <div className="section-card">
                  <h3>📂 Book Categories</h3>
                  <div className="book-grid">
                    {categories.map(cat => {
                      const catBooks = books.filter(b => b.category === cat);
                      return (
                        <div key={cat} className="book-card" style={{ cursor: 'pointer' }} onClick={() => { setSearch(cat); setView('manage'); }}>
                          <div className="book-body">
                            <h4>{cat}</h4>
                            <p className="book-author">{catBooks.filter(b => b.availableCopies > 0).length}/{catBooks.length} available</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {view === 'manage' && (
              <div className="fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h3 style={{ margin: 0 }}>Inventory ({books.length})</h3>
                  <button className="btn-primary" onClick={() => setShowAdd(!showAdd)}><FaPlus /> Add Book</button>
                </div>
                {showAdd && (
                  <AddBookForm onSuccess={(msg) => { setToast({ type: 'success', message: msg }); setShowAdd(false); loadBooks(); }} onError={(msg) => setToast({ type: 'error', message: msg })} />
                )}
                <div className="search-bar"><FaSearch className="search-icon" /><input placeholder="Search books..." value={search} onChange={e => setSearch(e.target.value)} /></div>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>ISBN</th><th>Title</th><th>Author</th><th>Category</th><th>Copies</th><th>Status</th><th>Action</th></tr></thead>
                    <tbody>
                      {filteredBooks.map(b => (
                        <tr key={b._id}>
                          <td><span className="badge badge-purple">{b.isbn}</span></td>
                          <td className="fw-600">{b.title}</td>
                          <td>{b.author}</td>
                          <td>{b.category}</td>
                          <td>{b.availableCopies}/{b.totalCopies}</td>
                          <td><span className={`badge ${b.availableCopies > 0 ? 'badge-green' : 'badge-red'}`}>{b.availableCopies > 0 ? 'Available' : 'Unavailable'}</span></td>
                          <td><button className="btn-sm btn-danger" onClick={() => handleDeleteBook(b._id)}><FaTrash /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {view === 'issue' && (
              <div className="fade-in">
                <div className="section-card">
                  <h3>📚 Available for Issue</h3>
                  <div className="table-wrap">
                    <table>
                      <thead><tr><th>Title</th><th>Author</th><th>Category</th><th>Available</th></tr></thead>
                      <tbody>
                        {books.filter(b => b.availableCopies > 0).map(b => (
                          <tr key={b._id}>
                            <td className="fw-600">{b.title}</td>
                            <td>{b.author}</td>
                            <td>{b.category}</td>
                            <td><span className="badge badge-green">{b.availableCopies} copies</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {view === 'return' && (
              <div className="fade-in">
                <div className="empty-state">
                  <span className="empty-icon">📬</span>
                  <p>Returns are handled through student/teacher dashboards.<br />Fines calculated at ₹10/day after the due date.</p>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function AddBookForm({ onSuccess, onError }) {
  const [form, setForm] = useState({ title: '', author: '', isbn: '', category: 'Computer Science', totalCopies: 1, location: '', description: '' });
  const set = (k, v) => setForm({ ...form, [k]: v });

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await apiAddBook({ ...form, totalCopies: parseInt(form.totalCopies) });
      onSuccess('Book added!');
    } catch (err) {
      onError(err.message);
    }
  }

  return (
    <div className="section-card" style={{ marginBottom: 20 }}>
      <form onSubmit={handleSubmit} className="dash-form">
        <div className="form-row">
          <div className="form-group"><label>Title</label><input value={form.title} onChange={e => set('title', e.target.value)} required /></div>
          <div className="form-group"><label>Author</label><input value={form.author} onChange={e => set('author', e.target.value)} required /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>ISBN</label><input value={form.isbn} onChange={e => set('isbn', e.target.value)} required /></div>
          <div className="form-group"><label>Category</label>
            <select value={form.category} onChange={e => set('category', e.target.value)}>
              {['Computer Science', 'Programming', 'Web Development', 'AI', 'Machine Learning', 'Database', 'Security'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Copies</label><input type="number" min="1" value={form.totalCopies} onChange={e => set('totalCopies', e.target.value)} /></div>
          <div className="form-group"><label>Location</label><input value={form.location} onChange={e => set('location', e.target.value)} /></div>
        </div>
        <button type="submit" className="btn-primary">Add Book</button>
      </form>
    </div>
  );
}
