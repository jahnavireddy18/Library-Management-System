// Initial Data Load
let users = JSON.parse(localStorage.getItem('libraryUsers')) || [];

// Seed if empty
if (users.length === 0) {
  let roles = ["Student", "Teacher", "Librarian"];
  let depts = ["CSE", "ECE", "EEE", "IT", "MECH", "CIVIL", "AI"];
  
  for(let i=1; i<=25; i++) {
    users.push({
      id: "10" + i,
      name: "Library User " + i,
      role: roles[i % 3],
      year: (i % 3) === 0 ? "Staff" : (i % 4 + 1) + " Year",
      dept: depts[i % 7]
    });
  }
  localStorage.setItem('libraryUsers', JSON.stringify(users));
}

function renderTable(dataToRender) {
  let tbody = document.querySelector('#userTable tbody');
  tbody.innerHTML = '';
  
  if (dataToRender.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="padding:32px 0;">No users found matching criteria.</td></tr>`;
    return;
  }
  
  dataToRender.forEach((u) => {
    // find actual index for editing/deleting based on original array
    let globalIndex = users.indexOf(u);
    
    let tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span style="font-family:monospace; font-weight:600; color:var(--slate-600);">${u.id}</span></td>
      <td style="font-weight:700; color:var(--slate-800);">${u.name}</td>
      <td><span class="badge badge-role-${u.role}">${u.role}</span></td>
      <td>${u.year}</td>
      <td>${u.dept}</td>
      <td style="text-align:center;">
        <button class="btn-secondary btn-sm" onclick="openModal('edit', ${globalIndex})" style="padding:6px 10px; margin-right:4px;"><i class="fas fa-pen"></i></button>
        <button class="btn-danger btn-sm" onclick="deleteUser(${globalIndex})" style="padding:6px 10px;"><i class="fas fa-trash"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  
  updateStats();
}

function updateStats() {
  let students = users.filter(u => u.role === 'Student').length;
  let teachers = users.filter(u => u.role === 'Teacher').length;
  let librarians = users.filter(u => u.role === 'Librarian').length;
  
  let deptSet = new Set(users.map(u => u.dept));
  
  document.getElementById('totalTxt').innerText = users.length;
  document.getElementById('studTxt').innerText = students;
  document.getElementById('teachTxt').innerText = teachers;
  document.getElementById('deptTxt').innerText = deptSet.size;
}

/* Modals */
function openModal(mode, idx = -1) {
  let modal = document.getElementById('userModal');
  let title = document.getElementById('modalTitle');
  
  // reset
  document.querySelectorAll('#userModal .input').forEach(i => i.value = '');
  document.getElementById('editIndex').value = '-1';
  
  if (mode === 'edit') {
    title.innerHTML = `<i class="fas fa-user-edit" style="color:var(--primary-500);margin-right:8px;"></i> Edit User`;
    let u = users[idx];
    document.getElementById('uid').value = u.id;
    document.getElementById('uname').value = u.name;
    document.getElementById('urole').value = u.role;
    document.getElementById('uyear').value = u.year;
    document.getElementById('udept').value = u.dept;
    document.getElementById('editIndex').value = idx;
  } else {
    title.innerHTML = `<i class="fas fa-user-plus" style="color:var(--primary-500);margin-right:8px;"></i> Add New User`;
  }
  
  modal.classList.add('active');
}

function closeModal() {
  document.getElementById('userModal').classList.remove('active');
}

// Backdrop close
document.getElementById('userModal').addEventListener('click', function(e) {
  if(e.target === this) closeModal();
});

function saveUser() {
  let id = document.getElementById('uid').value;
  let name = document.getElementById('uname').value;
  let role = document.getElementById('urole').value;
  let year = document.getElementById('uyear').value;
  let dept = document.getElementById('udept').value;
  let idx = parseInt(document.getElementById('editIndex').value);
  
  if(!id || !name) { alert("ID and Name are required."); return; }
  
  if (idx > -1) {
    users[idx] = { id, name, role, year, dept };
  } else {
    if(users.some(u => u.id === id)) { alert("User ID exists!"); return; }
    users.push({ id, name, role, year, dept });
  }
  
  localStorage.setItem('libraryUsers', JSON.stringify(users));
  closeModal();
  applyFilters(); // re-render
}

function deleteUser(idx) {
  if (confirm("Permanently delete this user?")) {
    users.splice(idx, 1);
    localStorage.setItem('libraryUsers', JSON.stringify(users));
    applyFilters();
  }
}

/* Filters */
function searchUsers() { applyFilters(); }

function applyFilters() {
  let q = document.getElementById('searchInput').value.toLowerCase();
  let role = document.getElementById('roleFilter').value;
  let sort = document.getElementById('sortFilter').value;
  
  let results = users.filter(u => 
    u.name.toLowerCase().includes(q) || u.id.toLowerCase().includes(q)
  );
  
  if (role) {
    results = results.filter(u => u.role === role);
  }
  
  if (sort === 'az') {
    results.sort((a,b) => a.name.localeCompare(b.name));
  } else if (sort === 'za') {
    results.sort((a,b) => b.name.localeCompare(a.name));
  }
  
  renderTable(results);
}

// Init
applyFilters();