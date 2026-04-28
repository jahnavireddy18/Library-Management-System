import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaBars, FaSignOutAlt } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import './Sidebar.css';

export default function Sidebar({ brand, brandIcon, links }) {
  const { logout, user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(false);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu on link click
  const handleLinkClick = () => {
    if (isMobile) setMobileOpen(false);
  };

  return (
    <>
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${isMobile && mobileOpen ? 'mobile-open' : ''}`}>
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
              onClick={handleLinkClick}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
          <button className="nav-item logout-btn" onClick={() => { handleLinkClick(); logout(); }}>
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
      <button className="hamburger" onClick={() => isMobile ? setMobileOpen(!mobileOpen) : setCollapsed(!collapsed)}>
        <FaBars />
      </button>
      {isMobile && <div className={`overlay-mobile ${mobileOpen ? 'active' : ''}`} onClick={() => setMobileOpen(false)} />}
    </>
  );
}
