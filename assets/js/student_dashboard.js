// Student Dashboard - Full Backend Integration
let books = [];
let currentUser = null;

document.addEventListener('DOMContentLoaded', function () {
  currentUser = JSON.parse(localStorage.getItem('user'));
  if (currentUser) {
    const nameEl = document.getElementById('pname');
    const emailEl = document.getElementById('pemail');
    if (nameEl) nameEl.textContent = currentUser.name;
    if (emailEl) emailEl.textContent = currentUser.email;
  }
  loadBooks();
  loadUserProfile();
  loadNotifications();
});

/* ── Sections ── */
function showSection(section) {
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  event.currentTarget.classList.add('active');

  const sections = ['dashboard', 'books', 'borrowed', 'request', 'help'];
  sections.forEach(s => {
    const el = document.getElementById(s + 'Section');
    if (el) el.style.display = (s === section) ? 'block' : 'none';
  });

  if (section === 'borrowed') loadBorrowedBooks();
}

/* ── Sidebar ── */
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('collapsed');
  document.getElementById('main').classList.toggle('expanded');
}

/* ── Profile ── */
async function loadUserProfile() {
  try {
    const response = await apiFetch('/api/users/profile');
    if (response.ok) {
      const profile = await response.json();
      if (document.getElementById('pname')) document.getElementById('pname').textContent = profile.name;
      if (document.getElementById('pemail')) document.getElementById('pemail').textContent = profile.email;
      if (document.getElementById('borrowedBooksCount')) {
        const active = profile.borrowedBooks ? profile.borrowedBooks.filter(b => !b.returned).length : 0;
        document.getElementById('borrowedBooksCount').textContent = active;
      }
      if (document.getElementById('finesAmount')) {
        document.getElementById('finesAmount').textContent = '₹' + (profile.fines || 0);
      }
    }
  } catch (error) {
    console.error('Error loading profile:', error);
  }
}

/* ── Books ── */
async function loadBooks() {
  try {
    const response = await apiFetch('/api/books');
    if (response.ok) {
      books = await response.json();
      displayBooks(books);
      updateBookStats();
    } else {
      throw new Error('Failed to fetch books');
    }
  } catch (error) {
    console.error('Error loading books:', error);
    books = [];
    const c = document.getElementById('bookContainer');
    if (c) c.innerHTML = '<p style="color:var(--slate-500);">Could not load books. Make sure the server is running.</p>';
  }
}

function displayBooks(bookList) {
  const container = document.getElementById('bookContainer');
  if (!container) return;
  container.innerHTML = '';

  if (bookList.length === 0) {
    container.innerHTML = '<p style="color:var(--slate-500);">No books found.</p>';
    return;
  }

  bookList.forEach(book => {
    const isAvailable = book.availableCopies > 0;
    const card = document.createElement('div');
    card.className = 'card book-card';
    card.innerHTML = `
      <img src="${book.imageUrl || 'assets/img/logo.jpg'}" alt="${book.title}" onerror="this.src='assets/img/logo.jpg'" style="width:100%;height:160px;object-fit:cover;border-radius:var(--radius-md) var(--radius-md) 0 0;">
      <div style="padding:16px;">
        <h4 style="margin-bottom:4px;color:var(--slate-800);">${book.title}</h4>
        <p style="font-size:13px;color:var(--slate-500);margin-bottom:8px;">${book.author}</p>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px;">
          <span class="badge badge-primary">${book.category}</span>
          <span class="badge ${isAvailable ? 'badge-success' : 'badge-danger'}">${isAvailable ? book.availableCopies + ' available' : 'Unavailable'}</span>
        </div>
        <div style="display:flex;gap:8px;">
          <button class="btn-primary btn-sm" onclick="borrowBook('${book._id}')" ${!isAvailable ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>
            <i class="fas fa-hand-holding"></i> ${isAvailable ? 'Borrow' : 'Unavailable'}
          </button>
          <button class="btn-secondary btn-sm" onclick="viewBookDetails('${book._id}')">
            <i class="fas fa-eye"></i> Details
          </button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function searchBooks() {
  const term = document.getElementById('searchInput').value.toLowerCase();
  const filtered = books.filter(b =>
    b.title.toLowerCase().includes(term) ||
    b.author.toLowerCase().includes(term) ||
    b.category.toLowerCase().includes(term) ||
    b.isbn.toLowerCase().includes(term)
  );
  displayBooks(filtered);
}

function updateBookStats() {
  const el1 = document.getElementById('totalBooks');
  const el2 = document.getElementById('categories');
  if (el1) el1.textContent = books.filter(b => b.availableCopies > 0).length;
  if (el2) el2.textContent = [...new Set(books.map(b => b.category))].length;
}

/* ── Borrow ── */
async function borrowBook(bookId) {
  if (!confirm('Are you sure you want to borrow this book?')) return;
  try {
    const response = await apiFetch(`/api/users/borrow/${bookId}`, { method: 'POST' });
    if (response.ok) {
      const data = await response.json();
      alert('Book borrowed successfully! Due date: ' + new Date(data.dueDate).toLocaleDateString());
      loadBooks();
      loadUserProfile();
    } else {
      const err = await response.json();
      alert(err.msg || 'Failed to borrow book');
    }
  } catch (error) {
    console.error('Error borrowing book:', error);
    alert('Network error. Please try again.');
  }
}

function viewBookDetails(bookId) {
  const book = books.find(b => b._id === bookId);
  if (!book) return;
  alert(`Title: ${book.title}\nAuthor: ${book.author}\nISBN: ${book.isbn}\nCategory: ${book.category}\nDescription: ${book.description || 'N/A'}\nPublisher: ${book.publisher || 'N/A'}\nYear: ${book.publishedYear || 'N/A'}\nLocation: ${book.location}\nAvailable: ${book.availableCopies}/${book.totalCopies}`);
}

/* ── Borrowed Books ── */
async function loadBorrowedBooks() {
  const container = document.getElementById('borrowedContainer');
  if (!container) return;
  try {
    const response = await apiFetch('/api/users/profile');
    if (response.ok) {
      const profile = await response.json();
      const borrowed = profile.borrowedBooks || [];
      const active = borrowed.filter(b => !b.returned);

      if (active.length === 0) {
        container.innerHTML = '<div class="section-panel"><p style="color:var(--slate-500);text-align:center;padding:32px;"><i class="fas fa-inbox" style="font-size:32px;display:block;margin-bottom:12px;"></i>No books currently borrowed.</p></div>';
        return;
      }

      let html = '<div class="table-container"><table class="styled-table"><thead><tr><th>Title</th><th>Borrow Date</th><th>Due Date</th><th>Status</th><th>Action</th></tr></thead><tbody>';
      active.forEach(item => {
        const bDate = new Date(item.borrowDate).toLocaleDateString();
        const dDate = new Date(item.dueDate).toLocaleDateString();
        const isOverdue = new Date() > new Date(item.dueDate);
        const bookTitle = item.book ? (item.book.title || item.book) : 'Unknown';
        const bookId = item.book ? (item.book._id || item.book) : '';
        html += `<tr>
          <td style="font-weight:600;">${bookTitle}</td>
          <td>${bDate}</td>
          <td>${dDate}</td>
          <td><span class="badge ${isOverdue ? 'badge-danger' : 'badge-success'}">${isOverdue ? 'Overdue' : 'Active'}</span></td>
          <td><button class="btn-accent btn-sm" onclick="returnBook('${bookId}')"><i class="fas fa-undo"></i> Return</button></td>
        </tr>`;
      });
      html += '</tbody></table></div>';
      container.innerHTML = html;
    }
  } catch (error) {
    console.error('Error loading borrowed books:', error);
    container.innerHTML = '<p style="color:var(--danger);">Failed to load borrowed books.</p>';
  }
}

async function returnBook(bookId) {
  if (!confirm('Return this book?')) return;
  try {
    const response = await apiFetch(`/api/users/return/${bookId}`, { method: 'POST' });
    if (response.ok) {
      alert('Book returned successfully!');
      loadBorrowedBooks();
      loadBooks();
      loadUserProfile();
    } else {
      const err = await response.json();
      alert(err.msg || 'Failed to return book');
    }
  } catch (error) {
    console.error('Error returning book:', error);
    alert('Network error. Please try again.');
  }
}

/* ── Requests & Help ── */
function sendRequest() {
  const title = document.getElementById('reqBook').value;
  const author = document.getElementById('reqAuthor').value;
  if (!title || !author) { alert('Please fill both fields'); return; }
  let msgs = JSON.parse(localStorage.getItem('librarianMsg')) || [];
  msgs.push({ text: '📚 Book Request: ' + title + ' by ' + author });
  localStorage.setItem('librarianMsg', JSON.stringify(msgs));
  document.getElementById('reqBook').value = '';
  document.getElementById('reqAuthor').value = '';
  alert('Book request sent to librarian!');
}

function sendHelp() {
  const msg = document.getElementById('helpMsg').value;
  if (!msg) { alert('Please enter your message'); return; }
  let arr = JSON.parse(localStorage.getItem('librarianMsg')) || [];
  arr.push({ text: '❓ Help: ' + msg });
  localStorage.setItem('librarianMsg', JSON.stringify(arr));
  document.getElementById('helpMsg').value = '';
  alert('Help message sent!');
}

function sendFeedback() {
  const msg = document.getElementById('feedMsg').value;
  if (!msg) { alert('Please enter your feedback'); return; }
  let arr = JSON.parse(localStorage.getItem('adminMsg')) || [];
  arr.push({ text: '⭐ Feedback: ' + msg });
  localStorage.setItem('adminMsg', JSON.stringify(arr));
  document.getElementById('feedMsg').value = '';
  alert('Feedback submitted!');
}

/* ── Notifications ── */
function toggleNotify() {
  const box = document.getElementById('notifyBox');
  box.style.display = box.style.display === 'block' ? 'none' : 'block';
}

function loadNotifications() {
  let msgs = JSON.parse(localStorage.getItem('studentMsg')) || [];
  let all = [...msgs, { text: '📚 Library hours: 9 AM – 6 PM' }];
  const countEl = document.getElementById('notifyCount');
  const listEl = document.getElementById('notifyList');
  if (countEl) countEl.textContent = all.length;
  if (listEl) {
    listEl.innerHTML = '';
    all.forEach(m => {
      listEl.innerHTML += `<div style="padding:8px 12px;border-bottom:1px solid var(--slate-100);font-size:13px;">${m.text}</div>`;
    });
  }
}

// Close notify on outside click
document.addEventListener('click', function (e) {
  if (!e.target.closest('[onclick*="toggleNotify"]') && !e.target.closest('#notifyBox')) {
    const box = document.getElementById('notifyBox');
    if (box) box.style.display = 'none';
  }
});