// Books for bookstore API
let books = [
    {
        id: 1,
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        genre: "Fiction",
        copiesAvailable: 5
    },
    {
        id: 2,
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        genre: "Fiction",
        copiesAvailable: 3
    },
    {
        id: 3,
        title: "1984",
        author: "George Orwell",
        genre: "Dystopian Fiction",
        copiesAvailable: 7
    }
];

// Create your REST API here with the following endpoints:


const express = require('express');
const app = express();

// this piece parses JSON bodies
app.use(express.json());

// GET /api/books - Retrieve all books
app.get('/api/books', (req, res) => {
  res.json(books);
});

// GET /api/books/:id - Retrieve a specific book by ID
app.get('/api/books/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const book = books.find(b => b.id === id);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  res.json(book);
});

// POST /api/books - Add a new book
app.post('/api/books', (req, res) => {
  const { title, author, genre, copiesAvailable } = req.body;
  const id = books.length + 1;
  const newBook = { id, title, author, genre: genre || '', copiesAvailable: copiesAvailable ?? 0 };
  books.push(newBook);
  res.status(201).json(newBook);
});

// PUT /api/books/:id - Update an existing book
app.put('/api/books/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const book = books.find(b => b.id === id);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  const { title, author, genre, copiesAvailable } = req.body;
  if (title !== undefined) book.title = title;
  if (author !== undefined) book.author = author;
  if (genre !== undefined) book.genre = genre;
  if (copiesAvailable !== undefined) book.copiesAvailable = copiesAvailable;
  res.json(book);
});

// DELETE /api/books/:id - Remove a book
app.delete('/api/books/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = books.findIndex(b => b.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Book not found' });
  books.splice(idx, 1);
  res.status(204).end();
});

// this is the basic root route
app.get('/', (req, res) => res.send('Books API'));

// this starts the server on port 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

module.exports = app;








