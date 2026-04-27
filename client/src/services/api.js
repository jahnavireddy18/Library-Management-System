const API_BASE = '';

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) {
    headers['x-auth-token'] = token;
  }
  const response = await fetch(API_BASE + endpoint, { ...options, headers });
  return response;
}

export async function login(email, password) {
  const res = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || data.errors?.[0]?.msg || 'Login failed');
  return data;
}

export async function register(userData) {
  const res = await apiFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || data.errors?.[0]?.msg || 'Registration failed');
  return data;
}

export async function getBooks() {
  const res = await apiFetch('/api/books');
  if (!res.ok) throw new Error('Failed to fetch books');
  return res.json();
}

export async function addBook(bookData) {
  const res = await apiFetch('/api/books', {
    method: 'POST',
    body: JSON.stringify(bookData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || 'Failed to add book');
  return data;
}

export async function deleteBook(bookId) {
  const res = await apiFetch(`/api/books/${bookId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete book');
  return res.json();
}

export async function getUsers() {
  const res = await apiFetch('/api/users');
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export async function getUserProfile() {
  const res = await apiFetch('/api/users/profile');
  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json();
}

export async function updateProfile(profileData) {
  const res = await apiFetch('/api/users/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
  if (!res.ok) throw new Error('Failed to update profile');
  return res.json();
}

export async function borrowBook(bookId) {
  const res = await apiFetch(`/api/users/borrow/${bookId}`, { method: 'POST' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || 'Failed to borrow book');
  return data;
}

export async function returnBook(bookId) {
  const res = await apiFetch(`/api/users/return/${bookId}`, { method: 'POST' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || 'Failed to return book');
  return data;
}

export async function reserveBook(bookId) {
  const res = await apiFetch(`/api/books/${bookId}/reserve`, { method: 'POST' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || 'Failed to reserve book');
  return data;
}

export async function deleteUser(userId) {
  const res = await apiFetch(`/api/users/${userId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete user');
  return res.json();
}

export async function healthCheck() {
  try {
    const res = await apiFetch('/api/health');
    return res.ok;
  } catch {
    return false;
  }
}
