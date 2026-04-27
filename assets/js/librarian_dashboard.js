// Librarian Dashboard - Full Backend Integration
let books = [];

document.addEventListener('DOMContentLoaded', function () {
  const user = JSON.parse(localStorage.getItem('user'));
  const nameEl = document.getElementById('librarianName');
  if (nameEl && user) nameEl.textContent = user.name;

  loadBooks();
  updateNotifyIcon();
});

async function loadBooks() {
  try {
    const response = await apiFetch('/api/books');
    if (response.ok) {
      books = await response.json();
    } else {
      books = [];
    }
  } catch (error) {
    console.error('Error loading books:', error);
    books = [];
  } finally {
    viewHome();
  }
}

/* Panel functions */
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('collapsed');
  document.getElementById('main').classList.toggle('expanded');
}

function navigate(view) {
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  event.currentTarget.classList.add('active');
  if (view === 'home') viewHome();
  if (view === 'manage') viewManage();
  if (view === 'issue') viewIssue();
  if (view === 'return') viewReturn();
}

/* Notification functions */
function updateNotifyIcon() {
  let libMsgs = JSON.parse(localStorage.getItem('librarianMsg')) || [];
  let recMsgs = JSON.parse(localStorage.getItem('recommendations')) || [];
  const el = document.getElementById('notifyCount');
  if (el) el.innerText = libMsgs.length + recMsgs.length;
}

function toggleNotify() {
  let box = document.getElementById("notifyBox");
  box.classList.toggle('active');
  if (box.classList.contains('active')) {
    let list = document.getElementById('notifyList');
    list.innerHTML = "";
    let libMsgs = JSON.parse(localStorage.getItem('librarianMsg')) || [];
    let recMsgs = JSON.parse(localStorage.getItem('recommendations')) || [];
    if (libMsgs.length === 0 && recMsgs.length === 0) {
      list.innerHTML = `<div class="notify-item">No new messages or requests.</div>`;
    } else {
      libMsgs.forEach(m => list.innerHTML += `<div class="notify-item"><i class="fas fa-info-circle" style="color:var(--primary-500);margin-right:8px;"></i>${m.text}</div>`);
      recMsgs.forEach(m => list.innerHTML += `<div class="notify-item"><i class="fas fa-book" style="color:var(--accent-500);margin-right:8px;"></i>Request: ${m.book} by ${m.author}</div>`);
    }
  }
}

function clearNotify() {
  localStorage.removeItem('librarianMsg');
  localStorage.removeItem('recommendations');
  updateNotifyIcon();
  toggleNotify();
}

/* Views */
const contentArea = document.getElementById("contentArea");

function viewHome() {
  const categories = [...new Set(books.map(book => book.category))];
  const imageMap = {
    'Computer Science': 'computer.jpg', 'Programming': 'csebook.jpg', 'Web Development': 'web.jpg',
    'AI': 'ai.jpg', 'Machine Learning': 'machinelearning.jpg', 'Database': 'dbms.jpeg', 'Security': 'cyber.jpg'
  };

  const categoryCards = categories.map(cat => {
    const catBooks = books.filter(b => b.category === cat);
    const avail = catBooks.filter(b => b.availableCopies > 0).length;
    const img = imageMap[cat] || 'logo.jpg';
    return `<div class="book-card" onclick="showCategoryBooks('${cat}')">
      <img src="assets/img/${img}" alt="${cat}" onerror="this.src='assets/img/logo.jpg'">
      <div class="card-content"><h4>${cat}</h4><p>${avail}/${catBooks.length} available</p></div>
    </div>`;
  }).join('');

  contentArea.innerHTML = `
    <div class="dashboard-section">
      <h2><i class="fas fa-layer-group"></i> Department Book Categories</h2>
      <p style="color:var(--slate-500);margin-bottom:20px;">Quick overview of books across departments.</p>
      <div class="books-grid">${categoryCards || '<p>No books found. Is the server running?</p>'}</div>
    </div>`;
}

function showCategoryBooks(category) {
  const catBooks = books.filter(b => b.category === category);
  const list = catBooks.map(b => `
    <div class="book-item">
      <div class="book-info">
        <h4>${b.title}</h4>
        <p><strong>Author:</strong> ${b.author} | <strong>ISBN:</strong> ${b.isbn} | <strong>Available:</strong> ${b.availableCopies}/${b.totalCopies} | <strong>Location:</strong> ${b.location}</p>
      </div>
    </div>`).join('');

  contentArea.innerHTML = `
    <div class="dashboard-section">
      <h2><i class="fas fa-book"></i> ${category} Books</h2>
      <button class="btn-secondary" onclick="viewHome()" style="margin-bottom:20px;"><i class="fas fa-arrow-left"></i> Back</button>
      <div class="books-list">${list || '<p>No books in this category.</p>'}</div>
    </div>`;
}

function viewManage() {
  const tableRows = books.map(book => `
    <tr>
      <td><span class="badge badge-primary">${book.isbn}</span></td>
      <td style="font-weight:600;">${book.title}</td>
      <td>${book.author}</td>
      <td>${book.category}</td>
      <td>${book.availableCopies}/${book.totalCopies}</td>
      <td><span class="status ${book.availableCopies > 0 ? 'avail' : 'issued'}">${book.availableCopies > 0 ? 'Available' : 'Unavailable'}</span></td>
      <td>
        <div class="action-btn-group">
          <button class="btn-danger btn-sm" onclick="deleteBook('${book._id}')"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>`).join('');

  contentArea.innerHTML = `
    <div class="dashboard-section">
      <h2><i class="fas fa-plus-circle"></i> Add New Book</h2>
      <div class="form-grid">
        <div class="form-group"><label>Title</label><input type="text" class="input" id="newTitle" placeholder="Book Title"></div>
        <div class="form-group"><label>Author</label><input type="text" class="input" id="newAuthor" placeholder="Author Name"></div>
        <div class="form-group"><label>ISBN</label><input type="text" class="input" id="newIsbn" placeholder="ISBN"></div>
        <div class="form-group"><label>Category</label>
          <select class="input" id="newCategory">
            <option>Computer Science</option><option>Programming</option><option>Database</option><option>AI</option><option>Machine Learning</option><option>Web Development</option><option>Security</option>
          </select>
        </div>
        <div class="form-group"><label>Total Copies</label><input type="number" class="input" id="newCopies" placeholder="1" min="1"></div>
        <div class="form-group"><label>Location</label><input type="text" class="input" id="newLocation" placeholder="Shelf A1"></div>
        <div class="form-group"><label>Published Year</label><input type="number" class="input" id="newYear" placeholder="2023"></div>
        <div class="form-group"><label>Publisher</label><input type="text" class="input" id="newPublisher" placeholder="Publisher"></div>
      </div>
      <div class="form-group full-width"><label>Description</label><textarea class="input" id="newDescription" placeholder="Book description" rows="3"></textarea></div>
      <div class="form-actions"><button class="btn-primary" onclick="addBook()"><i class="fas fa-save"></i> Save Book</button></div>
    </div>
    <div class="dashboard-section">
      <h2><i class="fas fa-list"></i> Inventory (${books.length} books)</h2>
      <div class="table-container">
        <table class="styled-table">
          <thead><tr><th>ISBN</th><th>Title</th><th>Author</th><th>Category</th><th>Copies</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>${tableRows || '<tr><td colspan="7">No books in inventory.</td></tr>'}</tbody>
        </table>
      </div>
    </div>`;
}

async function addBook() {
  const bookData = {
    title: document.getElementById('newTitle').value,
    author: document.getElementById('newAuthor').value,
    isbn: document.getElementById('newIsbn').value,
    category: document.getElementById('newCategory').value,
    description: document.getElementById('newDescription').value,
    totalCopies: parseInt(document.getElementById('newCopies').value) || 1,
    location: document.getElementById('newLocation').value,
    publishedYear: parseInt(document.getElementById('newYear').value),
    publisher: document.getElementById('newPublisher').value
  };
  if (!bookData.title || !bookData.author || !bookData.isbn) { alert('Title, Author, and ISBN are required.'); return; }

  try {
    const response = await apiFetch('/api/books', { method: 'POST', body: JSON.stringify(bookData) });
    if (response.ok) {
      alert('Book added successfully!');
      await loadBooks();
      viewManage();
    } else {
      const err = await response.json();
      alert(err.msg || 'Failed to add book');
    }
  } catch (error) {
    console.error('Error adding book:', error);
    alert('Network error.');
  }
}

async function deleteBook(bookId) {
  if (!confirm('Delete this book?')) return;
  try {
    const response = await apiFetch(`/api/books/${bookId}`, { method: 'DELETE' });
    if (response.ok) {
      alert('Book deleted');
      await loadBooks();
      viewManage();
    } else {
      alert('Failed to delete book');
    }
  } catch (error) {
    console.error('Error deleting book:', error);
  }
}

function viewIssue() {
  const available = books.filter(b => b.availableCopies > 0);
  const rows = available.map(b => `
    <tr>
      <td><span class="badge badge-primary">${b.isbn}</span></td>
      <td style="font-weight:600;">${b.title}</td>
      <td>${b.author}</td>
      <td>${b.category}</td>
      <td><span class="status avail">Available (${b.availableCopies})</span></td>
      <td style="text-align:center;">
        <button class="btn-accent btn-sm" onclick="alert('Book issuing requires user selection – use Admin dashboard')"><i class="fas fa-bookmark"></i> Issue</button>
      </td>
    </tr>`).join('');

  contentArea.innerHTML = `
    <div class="dashboard-section">
      <h2><i class="fas fa-hand-holding"></i> Issue Books</h2>
      <div class="table-container">
        <table class="styled-table">
          <thead><tr><th>ISBN</th><th>Title</th><th>Author</th><th>Category</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>${rows || '<tr><td colspan="6">No books available.</td></tr>'}</tbody>
        </table>
      </div>
    </div>`;
}

function viewReturn() {
  contentArea.innerHTML = `
    <div class="dashboard-section">
      <h2><i class="fas fa-undo"></i> Return Books</h2>
      <p style="color:var(--slate-500);margin-bottom:16px;">System calculates ₹10/day fine after due date automatically.</p>
      <div class="placeholder-message" style="text-align:center;padding:40px;">
        <i class="fas fa-clock" style="font-size:48px;color:var(--slate-400);"></i>
        <p style="margin-top:12px;color:var(--slate-500);">Return functionality is handled through the student/teacher dashboards.</p>
      </div>
    </div>`;
}

function closeModal() {
  document.getElementById('editModal').classList.remove('active');
}

/* Listen for cross-tab storage changes */
window.addEventListener('storage', updateNotifyIcon);