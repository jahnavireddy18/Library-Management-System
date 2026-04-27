// Authentication utility for dashboard pages
function checkAuthentication() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  // Check if token exists
  if (!token) {
    redirectToLogin('No authentication token found. Please login first.');
    return false;
  }

  // Check if user data exists
  if (!user) {
    redirectToLogin('User data not found. Please login again.');
    return false;
  }

  // Check if token is expired (basic check)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    if (payload.exp && payload.exp < currentTime) {
      redirectToLogin('Session expired. Please login again.');
      return false;
    }
  } catch (error) {
    redirectToLogin('Invalid authentication token. Please login again.');
    return false;
  }

  return { token, user };
}

function checkRole(requiredRole) {
  const auth = checkAuthentication();
  if (!auth) return false;

  const { user } = auth;

  // Check if user has the required role
  if (user.role !== requiredRole) {
    alert(`Access denied. This page requires ${requiredRole} privileges.`);
    window.location.href = getDashboardForRole(user.role);
    return false;
  }

  return true;
}

function getDashboardForRole(role) {
  switch (role) {
    case 'admin':
      return 'admin_dashboard.html';
    case 'librarian':
      return 'librarian_dashboard.html';
    case 'student':
      return 'student_dashboard.html';
    case 'teacher':
      return 'teacher_dashboard.html';
    default:
      return 'index.html';
  }
}

function redirectToLogin(message) {
  // Clear invalid session data
  localStorage.removeItem('token');
  localStorage.removeItem('user');

  alert(message);
  window.location.href = 'login.html';
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

// Auto-logout on page load if not authenticated
document.addEventListener('DOMContentLoaded', function() {
  // This will be called by individual dashboard scripts
});