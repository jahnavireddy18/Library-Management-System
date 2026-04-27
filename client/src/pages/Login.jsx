import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as apiLogin, healthCheck } from '../services/api';
import { FaSignInAlt, FaSpinner, FaArrowLeft } from 'react-icons/fa';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverOk, setServerOk] = useState(null);
  const { loginUser, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(`/${user.role}`, { replace: true });
    }
    healthCheck().then(setServerOk);
  }, [user, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await apiLogin(email, password);
      loginUser(data.user, data.token);
      navigate(`/${data.user.role}`, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-bg-orb orb-a" />
      <div className="login-bg-orb orb-b" />

      <div className="login-card">
        <Link to="/" className="login-back"><FaArrowLeft /> Back</Link>
        <div className="login-header">
          <span className="login-logo">📚</span>
          <h1>Welcome Back</h1>
          <p>Sign in to Smart Library</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@vemu.edu"
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? <><FaSpinner className="spin" /> Signing In...</> : <><FaSignInAlt /> Sign In</>}
          </button>
        </form>

        <div className="login-status">
          {serverOk === null ? 'Checking server...' :
           serverOk ? '✅ Backend connected' : '⚠️ Backend not reachable — run: cd backend && npm start'}
        </div>

        <div className="login-help">
          <h4>Demo Credentials</h4>
          <div className="cred-grid">
            <div><strong>Admin</strong><br/>admin@vemu.edu / admin123</div>
            <div><strong>Student</strong><br/>john.student@vemu.edu / student123</div>
            <div><strong>Teacher</strong><br/>jane.teacher@vemu.edu / teacher123</div>
            <div><strong>Librarian</strong><br/>librarian@vemu.edu / lib123</div>
          </div>
        </div>
      </div>
    </div>
  );
}
