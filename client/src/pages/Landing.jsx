import { Link } from 'react-router-dom';
import { FaBook, FaUsers, FaChartBar, FaMicrophone, FaArrowRight } from 'react-icons/fa';
import './Landing.css';

export default function Landing() {
  return (
    <div className="landing">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="nav-brand">
          <span className="nav-logo">📚</span>
          <span>Smart Library</span>
        </div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#about">About</a>
          <Link to="/login" className="nav-btn">Sign In</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-bg-orb orb-1" />
        <div className="hero-bg-orb orb-2" />
        <div className="hero-bg-orb orb-3" />
        <div className="hero-content">
          <span className="hero-badge">🎓 VEMU Institute of Technology</span>
          <h1>Smart Library<br /><span className="gradient-text">Management System</span></h1>
          <p className="hero-sub">
            A modern, AI-powered library platform with voice commands, real-time book tracking,
            and role-based dashboards for students, teachers, librarians, and administrators.
          </p>
          <div className="hero-actions">
            <Link to="/role" className="btn-hero-primary">
              Get Started <FaArrowRight />
            </Link>
            <Link to="/login" className="btn-hero-secondary">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features" id="features">
        <h2 className="section-title">Powerful Features</h2>
        <p className="section-sub">Everything you need to manage a modern university library</p>
        <div className="features-grid">
          {[
            { icon: <FaBook />, title: 'Book Management', desc: 'Add, edit, search, and track books with real-time availability across all departments.' },
            { icon: <FaUsers />, title: 'Role-Based Access', desc: 'Dedicated dashboards for students, teachers, librarians, and admins with unique capabilities.' },
            { icon: <FaChartBar />, title: 'Reports & Analytics', desc: 'Track borrowing trends, fines, and inventory with visual analytics and summaries.' },
            { icon: <FaMicrophone />, title: 'AI Voice Assistant', desc: 'Navigate the system hands-free with offline speech recognition powered by Web Speech API.' },
          ].map((f, i) => (
            <div className="feature-card" key={i}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="about" id="about">
        <div className="about-content">
          <h2>Built for VEMU</h2>
          <p>
            The Smart Library Management System is designed specifically for VEMU Institute of Technology.
            It streamlines book borrowing, returns, and fine management while providing intelligent
            recommendations and real-time notifications.
          </p>
          <div className="about-stats">
            <div><h3>10+</h3><span>Book Categories</span></div>
            <div><h3>4</h3><span>User Roles</span></div>
            <div><h3>100%</h3><span>Offline Voice AI</span></div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2026 Smart Library Management System — VEMU Institute of Technology</p>
      </footer>
    </div>
  );
}
