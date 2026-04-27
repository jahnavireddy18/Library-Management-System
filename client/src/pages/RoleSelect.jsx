import { Link } from 'react-router-dom';
import { FaUserGraduate, FaChalkboardTeacher, FaBookReader, FaUserShield } from 'react-icons/fa';
import './RoleSelect.css';

const roles = [
  { role: 'student', icon: <FaUserGraduate />, label: 'Student', desc: 'Browse & borrow books, track due dates', color: '#6366f1' },
  { role: 'teacher', icon: <FaChalkboardTeacher />, label: 'Teacher', desc: 'View department books, recommend titles', color: '#8b5cf6' },
  { role: 'librarian', icon: <FaBookReader />, label: 'Librarian', desc: 'Manage inventory, issue & return books', color: '#06b6d4' },
  { role: 'admin', icon: <FaUserShield />, label: 'Admin', desc: 'Full system control, manage users & reports', color: '#ec4899' },
];

export default function RoleSelect() {
  return (
    <div className="role-page">
      <div className="role-orb role-orb-1" />
      <div className="role-orb role-orb-2" />
      <div className="role-container">
        <h1>Choose Your Role</h1>
        <p className="role-subtitle">Select how you'd like to access the Smart Library</p>
        <div className="role-grid">
          {roles.map((r) => (
            <Link to="/login" key={r.role} className="role-card" style={{ '--accent': r.color }}>
              <div className="role-icon">{r.icon}</div>
              <h3>{r.label}</h3>
              <p>{r.desc}</p>
            </Link>
          ))}
        </div>
        <Link to="/" className="role-back">← Back to Home</Link>
      </div>
    </div>
  );
}
