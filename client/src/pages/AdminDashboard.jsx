import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Layout/Sidebar';
import Toast from '../components/Toast/Toast';
import { getBooks, getUsers, addBook as apiAddBook, deleteBook as apiDeleteBook, deleteUser as apiDeleteUser, register } from '../services/api';
import { FaHome, FaUsers, FaBook, FaChartBar, FaSearch, FaPlus, FaTrash } from 'react-icons/fa';
import './Dashboard.css';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [view, setView] = useState('dashboard');
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddBook, setShowAddBook] = useState(false);

  const sidebarLinks = [
    { to: '/admin', end: true, icon: <FaHome />, label: 'Dashboard' },
    { to: '/admin/users', icon: <FaUsers />, label: 'Manage Users' },
    { to: '/admin/books', icon: <FaBook />, label: 'Manage Books' },
    { to: '/admin/reports', icon: <FaChartBar />, label: 'Reports' },
  ];

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [bData, uData] = await Promise.all([getBooks(), getUsers()]);
      setBooks(bData);
      setUsers(uData);
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to load data' });
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteUser(id) {
    if (!window.confirm('Delete this user?')) return;
    try {
      await apiDeleteUser(id);
      setToast({ type: 'success', message: 'User deleted' });
      loadData();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  }

  async function handleDeleteBook(id) {
    if (!window.confirm('Delete this book?')) return;
    try {
      await apiDeleteBook(id);
      setToast({ type: 'success', message: 'Book deleted' });
      loadData();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  }

  const totalBorrowed = books.reduce((s, b) => s + (b.totalCopies - b.availableCopies), 0);

  return (
    <div className="dashboard-layout">
      <Sidebar brand="Admin Panel" brandIcon="🛡️" links={sidebarLinks} />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <main className="dashboard-main">
        <div className="dash-topbar">
          <h2 className="page-title">Admin Dashboard</h2>
          <span className="user-greeting">Welcome, <strong>{user?.name}</strong></span>
        </div>

        <div className="dash-tabs">
          {['dashboard', 'users', 'books', 'reports'].map(v => (
            <button key={v} className={`tab ${view === v ? 'active' : ''}`} onClick={() => setView(v)}>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-state"><div className="loader" /><p>Loading...</p></div>
        ) : (
          <>
            {view === 'dashboard' && (
              <div className="fade-in">
                <div className="stats-row">
                  <div className="stat-card purple"><h4>Total Users</h4><span className="stat-num">{users.length}</span></div>
                  <div className="stat-card blue"><h4>Total Books</h4><span className="stat-num">{books.length}</span></div>
                  <div className="stat-card green"><h4>Available</h4><span className="stat-num">{books.filter(b => b.availableCopies > 0).length}</span></div>
                  <div className="stat-card amber"><h4>Borrowed</h4><span className="stat-num">{totalBorrowed}</span></div>
                </div>

                <div className="section-card">
                  <h3>👥 User Distribution</h3>
                  <div className="stats-row">
                    {['admin', 'librarian', 'teacher', 'student'].map(role => (
                      <div key={role} className="mini-stat">
                        <span className="mini-label">{role}</span>
                        <span className="mini-num">{users.filter(u => u.role === role).length}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {view === 'users' && (
              <div className="fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                  <h3 style={{ margin: 0 }}>All Users ({users.length})</h3>
                  <button className="btn-primary" onClick={() => setShowAddUser(!showAddUser)}><FaPlus /> Add User</button>
                </div>
                {showAddUser && <AddUserForm onSuccess={(msg) => { setToast({ type: 'success', message: msg }); setShowAddUser(false); loadData(); }} onError={(msg) => setToast({ type: 'error', message: msg })} />}
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Fines</th><th>Action</th></tr></thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u._id}>
                          <td className="fw-600">{u.name}</td>
                          <td>{u.email}</td>
                          <td><span className={`badge badge-${u.role === 'admin' ? 'red' : u.role === 'student' ? 'blue' : u.role === 'teacher' ? 'amber' : 'green'}`}>{u.role}</span></td>
                          <td>{u.department || 'N/A'}</td>
                          <td>₹{u.fines || 0}</td>
                          <td><button className="btn-sm btn-danger" onClick={() => handleDeleteUser(u._id)}><FaTrash /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {view === 'books' && (
              <div className="fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                  <h3 style={{ margin: 0 }}>All Books ({books.length})</h3>
                  <button className="btn-primary" onClick={() => setShowAddBook(!showAddBook)}><FaPlus /> Add Book</button>
                </div>
                {showAddBook && <AddBookForm onSuccess={(msg) => { setToast({ type: 'success', message: msg }); setShowAddBook(false); loadData(); }} onError={(msg) => setToast({ type: 'error', message: msg })} />}
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Title</th><th>Author</th><th>ISBN</th><th>Category</th><th>Copies</th><th>Action</th></tr></thead>
                    <tbody>
                      {books.map(b => (
                        <tr key={b._id}>
                          <td className="fw-600">{b.title}</td>
                          <td>{b.author}</td>
                          <td><span className="badge badge-purple">{b.isbn}</span></td>
                          <td>{b.category}</td>
                          <td>{b.availableCopies}/{b.totalCopies}</td>
                          <td><button className="btn-sm btn-danger" onClick={() => handleDeleteBook(b._id)}><FaTrash /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {view === 'reports' && (
              <div className="fade-in">
                <div className="stats-row">
                  <div className="stat-card purple"><h4>Total Users</h4><span className="stat-num">{users.length}</span></div>
                  <div className="stat-card blue"><h4>Total Copies</h4><span className="stat-num">{books.reduce((s, b) => s + b.totalCopies, 0)}</span></div>
                  <div className="stat-card green"><h4>Available Copies</h4><span className="stat-num">{books.reduce((s, b) => s + b.availableCopies, 0)}</span></div>
                  <div className="stat-card pink"><h4>Borrowed</h4><span className="stat-num">{totalBorrowed}</span></div>
                </div>
                <div className="section-card">
                  <h3>📊 Books by Category</h3>
                  {[...new Set(books.map(b => b.category))].map(cat => {
                    const count = books.filter(b => b.category === cat).length;
                    const pct = Math.round((count / books.length) * 100);
                    return (
                      <div key={cat} style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                          <span style={{ fontWeight: 600 }}>{cat}</span>
                          <span style={{ color: '#94a3b8' }}>{count} books ({pct}%)</span>
                        </div>
                        <div style={{ height: 8, background: '#f1f5f9', borderRadius: 100, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 100, transition: 'width 0.5s' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function AddUserForm({ onSuccess, onError }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', department: '', enrollmentNumber: '' });
  const set = (k, v) => setForm({ ...form, [k]: v });

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await register(form);
      onSuccess('User added successfully!');
    } catch (err) {
      onError(err.message);
    }
  }

  return (
    <div className="section-card" style={{ marginBottom: 20 }}>
      <form onSubmit={handleSubmit} className="dash-form">
        <div className="form-row">
          <div className="form-group"><label>Name</label><input value={form.name} onChange={e => set('name', e.target.value)} required /></div>
          <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e => set('email', e.target.value)} required /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Password</label><input type="password" value={form.password} onChange={e => set('password', e.target.value)} required /></div>
          <div className="form-group"><label>Role</label>
            <select value={form.role} onChange={e => set('role', e.target.value)}>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="librarian">Librarian</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Department</label><input value={form.department} onChange={e => set('department', e.target.value)} required /></div>
          <div className="form-group"><label>Enrollment No.</label><input value={form.enrollmentNumber} onChange={e => set('enrollmentNumber', e.target.value)} /></div>
        </div>
        <button type="submit" className="btn-primary">Add User</button>
      </form>
    </div>
  );
}

function AddBookForm({ onSuccess, onError }) {
  const [form, setForm] = useState({ title: '', author: '', isbn: '', category: 'Computer Science', totalCopies: 1, location: '', description: '', publishedYear: '', publisher: '' });
  const set = (k, v) => setForm({ ...form, [k]: v });

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await apiAddBook({ ...form, totalCopies: parseInt(form.totalCopies), publishedYear: parseInt(form.publishedYear) });
      onSuccess('Book added successfully!');
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
        <div className="form-group"><label>Description</label><textarea value={form.description} onChange={e => set('description', e.target.value)} rows="2" /></div>
        <button type="submit" className="btn-primary">Add Book</button>
      </form>
    </div>
  );
}
