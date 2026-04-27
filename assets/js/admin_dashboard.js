// Admin Dashboard - Full Backend Integration
document.addEventListener('DOMContentLoaded', function() {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user) {
    const nameEl = document.getElementById('adminName');
    const emailEl = document.getElementById('adminEmail');
    if (nameEl) nameEl.textContent = user.name;
    if (emailEl) emailEl.textContent = user.email;
  }
  loadDashboardData();
});

async function loadDashboardData() {
  try {
    await loadUsers();
    await loadBooks();
    await loadStatistics();
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  }
}

async function loadUsers() {
  try {
    const response = await apiFetch('/api/users');
    if (response.ok) {
      const users = await response.json();
      displayUsers(users);
      updateUserStats(users);
    }
  } catch (error) {
    console.error('Error loading users:', error);
  }
}

async function loadBooks() {
  try {
    const response = await apiFetch('/api/books');
    if (response.ok) {
      const books = await response.json();
      displayBooks(books);
      updateBookStats(books);
    }
  } catch (error) {
    console.error('Error loading books:', error);
  }
}

async function loadStatistics() {
  try {
    const usersResponse = await apiFetch('/api/users');
    const booksResponse = await apiFetch('/api/books');

    if (usersResponse.ok && booksResponse.ok) {
      const users = await usersResponse.json();
      const books = await booksResponse.json();

      document.getElementById('totalUsers').textContent = users.length;
      document.getElementById('totalBooks').textContent = books.length;
      document.getElementById('availableBooks').textContent = books.filter(b => b.availableCopies > 0).length;
      document.getElementById('borrowedBooks').textContent = books.reduce((s, b) => s + (b.totalCopies - b.availableCopies), 0);
    }
  } catch (error) {
    console.error('Error loading statistics:', error);
  }
}

function displayUsers(users) {
  const userTableBody = document.getElementById('userTableBody');
  userTableBody.innerHTML = '';

  users.forEach(user => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td><span class="role-badge role-${user.role}">${user.role}</span></td>
      <td>${user.department || 'N/A'}</td>
      <td>${user.enrollmentNumber || 'N/A'}</td>
      <td>${user.borrowedBooks?.length || 0}</td>
      <td>₹${user.fines || 0}</td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="viewUser('${user._id}')">
          <i class="fas fa-eye"></i>
        </button>
        <button class="btn btn-sm btn-warning" onclick="editUser('${user._id}')">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteUser('${user._id}')">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    userTableBody.appendChild(row);
  });
}

function displayBooks(books) {
  const bookTableBody = document.getElementById('bookTableBody');
  bookTableBody.innerHTML = '';

  books.forEach(book => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${book.title}</td>
      <td>${book.author}</td>
      <td>${book.isbn}</td>
      <td>${book.category}</td>
      <td>${book.availableCopies}/${book.totalCopies}</td>
      <td>${book.location}</td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="viewBook('${book._id}')">
          <i class="fas fa-eye"></i>
        </button>
        <button class="btn btn-sm btn-warning" onclick="editBook('${book._id}')">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteBook('${book._id}')">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    bookTableBody.appendChild(row);
  });
}

function updateUserStats(users) {
  const roleStats = {
    admin: users.filter(u => u.role === 'admin').length,
    librarian: users.filter(u => u.role === 'librarian').length,
    teacher: users.filter(u => u.role === 'teacher').length,
    student: users.filter(u => u.role === 'student').length
  };

  // Update role distribution chart or display
  console.log('User role distribution:', roleStats);
}

function updateBookStats(books) {
  const categoryStats = {};
  books.forEach(book => {
    categoryStats[book.category] = (categoryStats[book.category] || 0) + 1;
  });

  console.log('Book category distribution:', categoryStats);
}

// User management functions
async function addUser() {
  const userData = {
    name: document.getElementById('uname').value,
    email: document.getElementById('uemail').value,
    password: document.getElementById('upassword').value,
    role: document.getElementById('urole').value,
    department: document.getElementById('udept').value,
    enrollmentNumber: document.getElementById('uenrollment').value
  };

  if (!userData.name || !userData.email || !userData.password) {
    alert('Please fill all required fields');
    return;
  }

  try {
    const response = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });

    if (response.ok) {
      alert('User added successfully');
      closeModal();
      loadUsers();
    } else {
      const error = await response.json();
      alert(error.msg || 'Failed to add user');
    }
  } catch (error) {
    console.error('Error adding user:', error);
    alert('Network error. Please try again.');
  }
}

async function deleteUser(userId) {
  if (!confirm('Are you sure you want to delete this user?')) return;

  try {
    const response = await apiFetch(`/api/users/${userId}`, { method: 'DELETE' });
    if (response.ok) {
      alert('User deleted successfully');
      loadUsers();
    } else {
      alert('Failed to delete user');
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    alert('Network error. Please try again.');
  }
}

// Book management functions
async function addBook() {
  const bookData = {
    title: document.getElementById('btitle').value,
    author: document.getElementById('bauthor').value,
    isbn: document.getElementById('bisbn').value,
    category: document.getElementById('bcategory').value,
    description: document.getElementById('bdescription').value,
    totalCopies: parseInt(document.getElementById('bcopies').value),
    location: document.getElementById('blocation').value,
    imageUrl: document.getElementById('bimage').value,
    publishedYear: parseInt(document.getElementById('byear').value),
    publisher: document.getElementById('bpublisher').value
  };

  if (!bookData.title || !bookData.author || !bookData.isbn) {
    alert('Please fill all required fields');
    return;
  }

  try {
    const response = await apiFetch('/api/books', {
      method: 'POST',
      body: JSON.stringify(bookData)
    });
    if (response.ok) {
      alert('Book added successfully');
      closeBookModal();
      loadBooks();
    } else {
      const error = await response.json();
      alert(error.msg || 'Failed to add book');
    }
  } catch (error) {
    console.error('Error adding book:', error);
    alert('Network error. Please try again.');
  }
}

async function deleteBook(bookId) {
  if (!confirm('Are you sure you want to delete this book?')) return;

  try {
    const response = await apiFetch(`/api/books/${bookId}`, { method: 'DELETE' });
    if (response.ok) {
      alert('Book deleted successfully');
      loadBooks();
    } else {
      alert('Failed to delete book');
    }
  } catch (error) {
    console.error('Error deleting book:', error);
    alert('Network error. Please try again.');
  }
}

// Modal functions
function openModal() {
  document.getElementById('addUserModal').classList.add('active');
}

function closeModal() {
  document.getElementById('addUserModal').classList.remove('active');
}

function openBookModal() {
  document.getElementById('addBookModal').classList.add('active');
}

function closeBookModal() {
  document.getElementById('addBookModal').classList.remove('active');
}

// Close on backdrop
document.getElementById('addUserModal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

document.getElementById('addBookModal').addEventListener('click', function(e) {
  if (e.target === this) closeBookModal();
});

// Placeholder functions for view/edit (can be implemented later)
function viewUser(userId) { alert('View user functionality coming soon'); }
function editUser(userId) { alert('Edit user functionality coming soon'); }
function viewBook(bookId) { alert('View book functionality coming soon'); }
function editBook(bookId) { alert('Edit book functionality coming soon'); }

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('collapsed');
  document.getElementById('main').classList.toggle('expanded');
}

function showError(message) {
  // You can implement a proper error display
  console.error(message);
  alert(message);
}