// Reports Page - Full Backend Integration
document.addEventListener('DOMContentLoaded', async function () {
  try {
    const booksRes = await apiFetch('/api/books');
    if (booksRes.ok) {
      const books = await booksRes.json();
      const totalBooks = books.reduce((s, b) => s + b.totalCopies, 0);
      const issued = books.reduce((s, b) => s + (b.totalCopies - b.availableCopies), 0);
      const avail = totalBooks - issued;

      document.getElementById('repInv').innerText = totalBooks;
      document.getElementById('repIss').innerText = issued;
      document.getElementById('repAvail').innerText = avail;
      document.getElementById('donutTotal').innerText = totalBooks;
    }
  } catch (e) {
    console.error('Error loading book stats:', e);
  }

  try {
    // Try fetching users (requires admin token)
    const usersRes = await apiFetch('/api/users');
    if (usersRes.ok) {
      const users = await usersRes.json();
      document.getElementById('repUsers').innerText = users.length;
    }
  } catch (e) {
    console.error('Error loading user stats:', e);
  }
});