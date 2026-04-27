// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded');

  // Hamburger menu
  const hamburger = document.getElementById('hamburger');
  const navPill = document.getElementById('navPill');

  if (hamburger && navPill) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navPill.classList.toggle('active');
    });
  }

  // Navigation active state
  const navLinks = document.querySelectorAll('[data-nav]');
  navLinks.forEach(link => {
    link.addEventListener('click', function () {
      navLinks.forEach(l => l.classList.remove('active'));
      this.classList.add('active');
      
      // Close mobile menu when clicking a link
      if (hamburger && navPill) {
        hamburger.classList.remove('active');
        navPill.classList.remove('active');
      }
    });
  });

  // Scroll spy
  const sections = document.querySelectorAll('section');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => {
      const top = s.offsetTop - 150;
      if (scrollY >= top) current = s.getAttribute('id');
    });
    
    // Force contact section to be active if scrolled to very bottom
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 20) {
      current = 'contact';
    }

    navLinks.forEach(l => {
      l.classList.remove('active');
      if (l.getAttribute('href') === '#' + current) l.classList.add('active');
    });
  });

  // Theme toggle
  const toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      document.body.classList.toggle('light');
    });
  }

  // Search functionality
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');

  if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        performSearch();
      }
    });
  }

  // Voice Assistant
  const voiceBtn = document.getElementById('voiceBtn');
  let recognition;

  if (voiceBtn) {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        voiceBtn.classList.add('listening');
        speak('Listening for your command...');
      };

      recognition.onresult = (event) => {
        const command = event.results[0][0].transcript.toLowerCase();
        handleVoiceCommand(command);
      };

      recognition.onend = () => {
        voiceBtn.classList.remove('listening');
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        speak('Sorry, I didn\'t catch that. Please try again.');
        voiceBtn.classList.remove('listening');
      };

      voiceBtn.addEventListener('click', () => {
        if (recognition) {
          recognition.start();
        }
      });
    } else {
      voiceBtn.style.display = 'none';
    }
  }

  loadBooks();
});

function performSearch() {
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) return;
  
  const query = searchInput.value.trim().toLowerCase();
  if (!query) {
    speak('Please enter a search term.');
    return;
  }

  // Filter dynamic book cards
  const bookCards = document.querySelectorAll('.book-card');
  let found = false;

  bookCards.forEach(card => {
    const title = card.dataset.title || card.querySelector('.book-title').textContent.toLowerCase();
    if (title.includes(query)) {
      card.style.display = 'block';
      found = true;
    } else {
      card.style.display = 'none';
    }
  });

  if (found) {
    scrollToSection('books');
    speak(`Found books matching "${query}".`);
  } else {
    speak(`No books found for "${query}".`);
  }
}

function handleVoiceCommand(command) {
  if (command.includes('home') || command.includes('go to home')) {
    scrollToSection('home');
    speak('Going to home section.');
  } else if (command.includes('books') || command.includes('go to books')) {
    scrollToSection('books');
    speak('Showing popular books.');
  } else if (command.includes('services') || command.includes('go to services')) {
    scrollToSection('services');
    speak('Here are our services.');
  } else if (command.includes('contact') || command.includes('go to contact')) {
    scrollToSection('contact');
    speak('Contact information displayed.');
  } else if (command.includes('search') || command.includes('find')) {
    const searchTerm = command.replace(/search|find/gi, '').trim();
    if (searchTerm) {
      const searchInput = document.getElementById('searchInput');
      if (searchInput) {
        searchInput.value = searchTerm;
        performSearch();
      }
    } else {
      speak('What would you like to search for?');
    }
  } else if (command.includes('theme') || command.includes('dark') || command.includes('light')) {
    const toggle = document.getElementById('themeToggle');
    if (toggle) {
      toggle.classList.toggle('active');
      document.body.classList.toggle('light');
      speak('Theme toggled.');
    }
  } else if (command.includes('help')) {
    speak('You can say: go to home, books, services, or contact. Search for books, toggle theme, or ask for help.');
  } else if (command.includes('scroll to top') || command.includes('top')) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    speak('Scrolled to top.');
  } else {
    speak('Sorry, I didn\'t understand that command. Say "help" for available commands.');
  }
}

function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
}

function speak(text) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  }
}

// Fetch and display books from API
async function loadBooks() {
  try {
    const response = await fetch('http://localhost:5001/api/books');
    const books = await response.json();
    
    const booksContainer = document.querySelector('.scroll-track');
    if (booksContainer && books.length > 0) {
      // Keep first 10 books for display, duplicate for seamless loop
      const displayBooks = books.slice(0, 10);
      const allBooks = [...displayBooks, ...displayBooks];
      
      booksContainer.innerHTML = allBooks.map(book => `
        <div class="book-card" data-title="${book.title.toLowerCase()}">
          <img src="${book.imageUrl || 'assets/img/default-book.jpg'}" alt="${book.title}">
          <div class="book-title">${book.title}</div>
        </div>
      `).join('');
    }
  } catch (error) {
    console.error('Error loading books:', error);
    // Fallback to static books if API is not available
  }
}