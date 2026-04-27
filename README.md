# Smart Library Management System

A modern, responsive library management system with voice assistant, built for academic excellence.

## Features

- **Fully Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Voice Assistant**: Control the website with voice commands
- **Dark/Light Theme Toggle**: User-friendly theme switching
- **Real-time Search**: Search books instantly
- **Modern UI/UX**: Beautiful animations and smooth interactions
- **Backend API**: Full-stack application with MongoDB
- **Role-based Access**: Student, Teacher, Librarian, and Admin roles
- **Book Management**: Add, update, delete, and reserve books
- **User Management**: Profile management and borrowing history

## Tech Stack

### Frontend
- HTML5
- CSS3 (Custom properties, Flexbox, Grid)
- JavaScript (ES6+, Web Speech API)
- Font Awesome Icons

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- bcryptjs for password hashing

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory:
   ```
   MONGODB_URI=mongodb://localhost:27017/smartlibrary
   JWT_SECRET=your_super_secret_jwt_key_here
   PORT=5000
   ```

4. Start MongoDB service

5. Start the backend server:
   ```bash
   npm start
   ```

### Frontend Setup
The frontend is static and ready to use. Open `index.html` in your browser.

For development, you can use a local server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Books
- `GET /api/books` - Get all books
- `GET /api/books/:id` - Get book by ID
- `POST /api/books` - Add new book (Admin/Librarian)
- `PUT /api/books/:id` - Update book (Admin/Librarian)
- `DELETE /api/books/:id` - Delete book (Admin/Librarian)
- `POST /api/books/:id/reserve` - Reserve a book

### Users
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/borrow/:bookId` - Borrow a book
- `POST /api/users/return/:bookId` - Return a book

## Voice Commands

The voice assistant supports the following commands:
- "Go to home" - Navigate to home section
- "Go to books" - Navigate to books section
- "Go to services" - Navigate to services section
- "Go to contact" - Navigate to contact section
- "Search [term]" - Search for books
- "Help" - Show available commands

## Project Structure

```
smart-library-management-system/
├── index.html                    # Main landing page
├── assets/
│   ├── css/
│   │   ├── index.css            # Main styles
│   │   └── global.css           # Global styles and variables
│   ├── js/
│   │   └── index.js             # Main JavaScript
│   ├── img/                     # Images
│   └── videos/                  # Background videos
├── backend/
│   ├── server.js                # Express server
│   ├── models/
│   │   ├── User.js              # User model
│   │   └── Book.js              # Book model
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── books.js             # Book management routes
│   │   └── users.js             # User management routes
│   ├── middleware/
│   │   └── auth.js              # JWT authentication middleware
│   ├── package.json
│   └── .env                     # Environment variables
├── admin_dashboard.html         # Admin dashboard
├── librarian_dashboard.html     # Librarian dashboard
├── student_dashboard.html       # Student dashboard
├── teacher_dashboard.html       # Teacher dashboard
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Academic Project Note

This project was developed as part of an academic assignment to demonstrate modern web development skills, including responsive design, voice interaction, and full-stack development with database integration.