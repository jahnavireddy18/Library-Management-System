/**
 * Smart Library - API Configuration
 * Central config for all frontend API calls.
 * When running via the backend server, use '' (same origin).
 * For local file:// development, fall back to localhost:5001.
 */
const API_BASE = window.location.protocol === 'file:'
  ? 'http://localhost:5001'
  : '';

/**
 * Helper: make an authenticated API request.
 * Automatically attaches the JWT token from localStorage.
 */
async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) {
    headers['x-auth-token'] = token;
  }
  const url = API_BASE + endpoint;
  const response = await fetch(url, { ...options, headers });
  return response;
}
