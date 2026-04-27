import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Layout/Sidebar';
import Toast from '../components/Toast/Toast';
import { getBooks, borrowBook as apiBorrow, reserveBook as apiReserve } from '../services/api';
import { FaHome, FaBook, FaBell, FaSearch, FaBookmark, FaHandHolding } from 'react-icons/fa';
import './Dashboard.css';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [view, setView] = useState('dashboard');
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);

  const sidebarLinks = [
    { to: '/teacher', end: true, icon: <FaHome />, label: 'Dashboard' },
    { to: '/teacher/books', icon: <FaBook />, label: 'Browse Books' },
    { to: '/teacher/recommend', icon: <FaBookmark />, label: 'Recommend' },
    { to: '/teacher/notify', icon: <FaBell />, label: 'Notify' },
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

  async function handleBorrow(id, title) {
    if (!window.confirm(`Borrow "${title}"?`)) return;
    try {
      await apiBorrow(id);
      setHistory(h => [`Borrowed "${title}"`, ...h]);
      setToast({ type: 'success', message: `"${title}" borrowed!` });
      loadBooks();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  }

  async function handleReserve(id, title) {
    try {
      await apiReserve(id);
      setHistory(h => [`Reserved "${title}"`, ...h]);
      setToast({ type: 'success', message: `"${title}" reserved!` });
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  }

  const categories = [...new Set(books.map(b => b.category))];
  const filteredBooks = selectedCat ? books.filter(b => b.category === selectedCat) : books;
  const searchedBooks = filteredBooks.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard-layout">
      <Sidebar brand="Teacher Portal" brandIcon="🎓" links={sidebarLinks} />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <main className="dashboard-main">
        <div className="dash-topbar">
          <h2 className="page-title">Teacher Dashboard</h2>
          <span className="user-greeting">Hello, <strong>{user?.name}</strong></span>
        </div>

        <div className="dash-tabs">
          {['dashboard', 'books', 'recommend', 'notify'].map(v => (
            <button key={v} className={`tab ${view === v ? 'active' : ''}`} onClick={() => setView(v)}>{v.charAt(0).toUpperCase() + v.slice(1)}</button>
          ))}
        </div>

        {loading ? <div className="loading-state"><div className="loader" /></div> : (
          <>
            {view === 'dashboard' && (
              <div className="fade-in">
                <div className="stats-row">
                  <div className="stat-card blue"><h4>Total Books</h4><span className="stat-num">{books.length}</span></div>
                  <div className="stat-card green"><h4>Available</h4><span className="stat-num">{books.filter(b => b.availableCopies > 0).length}</span></div>
                  <div className="stat-card cyan"><h4>Categories</h4><span className="stat-num">{categories.length}</span></div>
                </div>
                <div className="section-card">
                  <h3>📂 Browse by Department</h3>
                  <div className="book-grid">
                    {categories.map(cat => {
                      const catBooks = books.filter(b => b.category === cat);
                      return (
                        <div key={cat} className="book-card" style={{ cursor: 'pointer' }} onClick={() => { setSelectedCat(cat); setView('books'); }}>
                          <div className="book-body">
                            <h4>{cat}</h4>
                            <p className="book-author">{catBooks.filter(b => b.availableCopies > 0).length}/{catBooks.length} available</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {history.length > 0 && (
                  <div className="section-card">
                    <h3>📋 Recent Activity</h3>
                    {history.map((h, i) => <p key={i} style={{ fontSize: 13, color: '#64748b', marginBottom: 6 }}>• {h}</p>)}
                  </div>
                )}
              </div>
            )}

            {view === 'books' && (
              <div className="fade-in">
                <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                  <button className={`btn-sm ${!selectedCat ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setSelectedCat(null)}>All</button>
                  {categories.map(c => <button key={c} className={`btn-sm ${selectedCat === c ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setSelectedCat(c)}>{c}</button>)}
                </div>
                <div className="search-bar"><FaSearch className="search-icon" /><input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} /></div>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Title</th><th>Author</th><th>ISBN</th><th>Available</th><th>Actions</th></tr></thead>
                    <tbody>
                      {searchedBooks.map(b => (
                        <tr key={b._id}>
                          <td className="fw-600">{b.title}</td>
                          <td>{b.author}</td>
                          <td><span className="badge badge-purple">{b.isbn}</span></td>
                          <td>{b.availableCopies}/{b.totalCopies}</td>
                          <td style={{ display: 'flex', gap: 6 }}>
                            <button className="btn-sm btn-primary" onClick={() => handleReserve(b._id, b.title)}><FaBookmark /> Reserve</button>
                            <button className="btn-sm btn-accent" onClick={() => handleBorrow(b._id, b.title)} disabled={b.availableCopies <= 0}>
                              <FaHandHolding /> {b.availableCopies > 0 ? 'Borrow' : 'N/A'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {view === 'recommend' && (
              <div className="fade-in">
                <RecommendForm onSuccess={(msg) => setToast({ type: 'success', message: msg })} />
              </div>
            )}

            {view === 'notify' && (
              <div className="fade-in">
                <NotifyForm onSuccess={(msg) => setToast({ type: 'success', message: msg })} />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function RecommendForm({ onSuccess }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');

  function submit(e) {
    e.preventDefault();
    let recs = JSON.parse(localStorage.getItem('recommendations') || '[]');
    recs.push({ book: title, author });
    localStorage.setItem('recommendations', JSON.stringify(recs));
    setTitle(''); setAuthor('');
    onSuccess('Recommendation sent to librarian!');
  }

  return (
    <div className="section-card" style={{ maxWidth: 600 }}>
      <h3>📖 Recommend a Book</h3>
      <form onSubmit={submit} className="dash-form">
        <div className="form-row">
          <div className="form-group"><label>Book Title</label><input value={title} onChange={e => setTitle(e.target.value)} required /></div>
          <div className="form-group"><label>Author</label><input value={author} onChange={e => setAuthor(e.target.value)} required /></div>
        </div>
        <button type="submit" className="btn-primary">Send Recommendation</button>
      </form>
    </div>
  );
}

function NotifyForm({ onSuccess }) {
  const [msg, setMsg] = useState('');
  const [target, setTarget] = useState('student');

  function submit(e) {
    e.preventDefault();
    let key = target + 'Msg';
    let data = JSON.parse(localStorage.getItem(key) || '[]');
    data.push({ text: '🧑‍🏫 Teacher: ' + msg });
    localStorage.setItem(key, JSON.stringify(data));
    setMsg('');
    onSuccess(`Message sent to ${target}!`);
  }

  return (
    <div className="section-card" style={{ maxWidth: 600 }}>
      <h3>📢 Send Notification</h3>
      <form onSubmit={submit} className="dash-form">
        <div className="form-group">
          <label>Send to</label>
          <select value={target} onChange={e => setTarget(e.target.value)}>
            <option value="student">Students</option>
            <option value="librarian">Librarian</option>
          </select>
        </div>
        <div className="form-group"><label>Message</label><textarea value={msg} onChange={e => setMsg(e.target.value)} rows="3" required /></div>
        <button type="submit" className="btn-primary">Send</button>
      </form>
    </div>
  );
}
