import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaBars, FaSignOutAlt } from 'react-icons/fa';
import { useState } from 'react';
import './Sidebar.css';

export default function Sidebar({ brand, brandIcon, links }) {
  const { logout, user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-brand">
          <span className="brand-icon">{brandIcon}</span>
          <span className="brand-text">{brand}</span>
        </div>
        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
          <button className="nav-item logout-btn" onClick={logout}>
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </nav>
        {user && (
          <div className="sidebar-footer">
            <div className="user-avatar">{user.name?.charAt(0).toUpperCase()}</div>
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-role">{user.role}</span>
            </div>
          </div>
        )}
      </aside>
      <button className="hamburger" onClick={() => setCollapsed(!collapsed)}>
        <FaBars />
      </button>
    </>
  );
}
