const credentials = {
  student:   { email: "student@gmail.com",   pass: "123" },
  teacher:   { email: "teacher@gmail.com",   pass: "123" },
  librarian: { email: "librarian@gmail.com", pass: "123" },
  admin:     { email: "admin@gmail.com",     pass: "123" }
};

function createModal(role, title) {
  return `
  <div class="login-modal" id="${role}Modal">
    <div class="login-box">
      <button class="close-modal" onclick="closeModal()">&times;</button>
      <h2>${title}</h2>
      <p class="login-sub">Enter your credentials to continue</p>

      <div class="error-msg">Invalid email or password</div>

      <div class="field-group">
        <label>Email Address</label>
        <input type="email" class="email" placeholder="you@example.com" required>
      </div>

      <div class="field-group">
        <label>Password</label>
        <input type="password" class="password" placeholder="••••••••" required>
        <i class="fas fa-eye eye-toggle" onclick="togglePassword(this)"></i>
      </div>

      <button class="login-submit" onclick="login('${role}', this)">
        <i class="fas fa-sign-in-alt"></i> Login
      </button>
    </div>
  </div>`;
}

document.body.insertAdjacentHTML('beforeend',
  createModal('student', 'Student Login') +
  createModal('teacher', 'Teacher Login') +
  createModal('librarian', 'Librarian Login') +
  createModal('admin', 'Admin Login')
);

function openModal(id) {
  document.getElementById(id).classList.add('active');
}

function closeModal() {
  document.querySelectorAll('.login-modal').forEach(m => m.classList.remove('active'));
}

// Close on backdrop click
document.querySelectorAll('.login-modal').forEach(modal => {
  modal.addEventListener('click', function(e) {
    if (e.target === this) closeModal();
  });
});

// Close on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

function togglePassword(icon) {
  let input = icon.previousElementSibling;
  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.replace('fa-eye', 'fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.replace('fa-eye-slash', 'fa-eye');
  }
}

function login(role, btn) {
  let box = btn.closest('.login-box');
  let email = box.querySelector('.email').value;
  let pass = box.querySelector('.password').value;
  let error = box.querySelector('.error-msg');

  if (email === credentials[role].email && pass === credentials[role].pass) {
    error.style.display = 'none';
    document.getElementById('welcomeText').innerText =
      'Welcome ' + role.charAt(0).toUpperCase() + role.slice(1) + '...';

    document.getElementById('loader').classList.add('active');

    let bar = document.getElementById('progressBar');
    bar.style.width = '0%';
    setTimeout(() => { bar.style.width = '100%'; }, 50);

    setTimeout(() => {
      window.location.href = role + '_dashboard.html';
    }, 2000);
  } else {
    error.style.display = 'block';
    box.classList.add('shake');
    setTimeout(() => box.classList.remove('shake'), 400);
  }
}