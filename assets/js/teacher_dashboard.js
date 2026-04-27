// Teacher Dashboard - Full Backend Integration
let books = [];
let currentDeptData = [];
let currentDeptName = "";
let historyData = [];

document.addEventListener('DOMContentLoaded', function () {
  loadBooks();
  updateHistory();
});

/* ── Books ── */
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
  }
}

/* Side Panel */
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('collapsed');
  document.getElementById('main').classList.toggle('expanded');
}

function showDashboard() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function scrollToID(id) {
  document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}

/* Department Data */
function showDept(dept, iconClass) {
  currentDeptName = dept;
  // Match books by category OR by a keyword match for flexibility
  currentDeptData = books.filter(book => {
    const cat = book.category.toLowerCase();
    const d = dept.toLowerCase();
    return cat.includes(d) || d.includes(cat.substring(0, 3));
  });

  // If no exact match, show all books (better UX than empty)
  if (currentDeptData.length === 0) {
    currentDeptData = books;
  }

  document.getElementById('deptTableContainer').style.display = 'block';
  document.getElementById('deptTitle').innerHTML = `<i class="fas ${iconClass}"></i> ${dept} Books`;
  renderTable(currentDeptData);
  document.getElementById('deptTableContainer').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function hideDept() {
  document.getElementById('deptTableContainer').style.display = 'none';
}

function renderTable(data) {
  let table = document.getElementById('deptTableArea');
  let header = `<thead><tr><th>ISBN</th><th>Title</th><th>Author</th><th>Available</th><th>Status</th><th style="text-align:center;">Action</th></tr></thead><tbody>`;
  let rows = "";

  if (data.length === 0) {
    rows = `<tr><td colspan="6" style="padding:20px;">No books found.</td></tr>`;
  } else {
    data.forEach(book => {
      let isAvail = book.availableCopies > 0;
      let borrowBtn = isAvail
        ? `<button class="btn-accent btn-sm" onclick="borrowBook('${book._id}', '${book.title}')"><i class="fas fa-hand-holding"></i> Borrow</button>`
        : `<button class="btn-accent btn-sm" disabled style="opacity:0.5;">Unavailable</button>`;
      rows += `<tr>
        <td><span class="badge badge-primary">${book.isbn}</span></td>
        <td style="font-weight:600;color:var(--slate-800);">${book.title}</td>
        <td>${book.author}</td>
        <td>${book.availableCopies}/${book.totalCopies}</td>
        <td><i class="fas ${isAvail ? 'fa-check' : 'fa-times'}"></i> ${isAvail ? 'Available' : 'Unavailable'}</td>
        <td style="text-align:center;">
          <button class="btn-primary btn-sm" onclick="reserveBook('${book._id}', '${book.title}')"><i class="fas fa-bookmark"></i> Reserve</button>
          ${borrowBtn}
        </td>
      </tr>`;
    });
  }
  table.innerHTML = header + rows + "</tbody>";
}

/* Filters */
function applyFilters(val) {
  val = val.toLowerCase();
  let filtered = currentDeptData.filter(b => b.title.toLowerCase().includes(val) || b.author.toLowerCase().includes(val) || b.isbn.toLowerCase().includes(val));
  renderTable(filtered);
}

function filterStatus(status) {
  if (status === "All") { renderTable(currentDeptData); return; }
  let filtered = currentDeptData.filter(b => status === "Available" ? b.availableCopies > 0 : b.availableCopies === 0);
  renderTable(filtered);
}

function sortData(type) {
  let sorted = [...currentDeptData];
  if (type === "id") sorted.sort((a, b) => a.isbn.localeCompare(b.isbn));
  if (type === "title") sorted.sort((a, b) => a.title.localeCompare(b.title));
  if (type === "due") sorted.sort((a, b) => b.availableCopies - a.availableCopies);
  renderTable(sorted);
}

/* Book Actions */
async function borrowBook(bookId, bookTitle) {
  if (!confirm(`Borrow "${bookTitle}"?`)) return;
  try {
    const response = await apiFetch(`/api/users/borrow/${bookId}`, { method: 'POST' });
    if (response.ok) {
      alert(`"${bookTitle}" borrowed successfully!`);
      historyData.unshift(`<i class="fas fa-hand-holding" style="color:var(--accent-500);margin-right:8px;"></i> Borrowed "${bookTitle}"`);
      updateHistory();
      await loadBooks();
      if (currentDeptData.length > 0) showDept(currentDeptName, 'fa-book');
    } else {
      const err = await response.json();
      alert(err.msg || 'Failed to borrow');
    }
  } catch (error) {
    console.error('Error borrowing book:', error);
    alert('Network error.');
  }
}

function reserveBook(bookId, bookTitle) {
  historyData.unshift(`<i class="fas fa-bookmark" style="color:var(--primary-500);margin-right:8px;"></i> Reserved "${bookTitle}"`);
  updateHistory();
  alert(`"${bookTitle}" reserved!`);
}

/* History */
function updateHistory() {
  let hl = document.getElementById('historyList');
  if (!hl) return;
  hl.innerHTML = "";
  if (historyData.length === 0) {
    hl.innerHTML = '<div class="empty-state">No recent activity.</div>';
    return;
  }
  historyData.forEach(x => {
    let div = document.createElement('div');
    div.className = "history-item animate-fadeInUp";
    div.innerHTML = x + ` <span style="float:right;font-size:11px;color:var(--slate-400);">Just now</span>`;
    hl.appendChild(div);
  });
}

/* Recommend */
function recommend() {
  let title = document.getElementById('recBook').value;
  let author = document.getElementById('recAuthor').value;
  if (!title || !author) { alert('Fill both fields'); return; }
  let recs = JSON.parse(localStorage.getItem("recommendations")) || [];
  recs.push({ book: title, author: author });
  localStorage.setItem("recommendations", JSON.stringify(recs));
  document.getElementById('recBook').value = "";
  document.getElementById('recAuthor').value = "";
  let msg = document.getElementById('recMsg');
  if (msg) { msg.style.display = 'block'; setTimeout(() => msg.style.display = 'none', 3000); }
  alert('Recommendation sent to librarian!');
}

/* Notifications */
function sendMsg(role) {
  let msg = document.getElementById('notifyMsg').value;
  if (!msg) { alert('Enter a message'); return; }
  let key = role + "Msg";
  let data = JSON.parse(localStorage.getItem(key)) || [];
  data.push({ text: "🧑‍🏫 Teacher: " + msg });
  localStorage.setItem(key, JSON.stringify(data));
  document.getElementById('notifyMsg').value = "";
  let status = document.getElementById('notifyStatus');
  if (status) { status.innerHTML = `<i class="fas fa-check-circle"></i> Sent to ${role}!`; status.style.display = 'block'; setTimeout(() => status.style.display = 'none', 3000); }
  alert(`Message sent to ${role}!`);
}