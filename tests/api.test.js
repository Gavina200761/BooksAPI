// Supertest provides a fluent HTTP assertion API for testing Express apps
const request = require('supertest');
// Import the Express app exported from server.js so Supertest can call it directly
const app = require('../server');

// Test suite for Books API endpoints
describe('Books API', () => {
  // Will hold the id created by the POST test so later tests can act on the same resource
  let createdId;

  // GET /api/books — should return JSON array containing seeded books
  test('GET /api/books - returns all books (200)', async () => {
    const res = await request(app)
      .get('/api/books')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(3);
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 1, title: 'The Great Gatsby' }),
        expect.objectContaining({ id: 2, title: 'To Kill a Mockingbird' }),
        expect.objectContaining({ id: 3, title: '1984' })
      ])
    );
  });

  // GET single book by id — validates shape and expected field values
  test('GET /api/books/:id - returns a single book (200)', async () => {
    const res = await request(app)
      .get('/api/books/1')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body).toHaveProperty('id', 1);
    expect(res.body).toHaveProperty('title', 'The Great Gatsby');
    expect(res.body).toHaveProperty('author', 'F. Scott Fitzgerald');
  });

  // GET with unknown id should return 404 Not Found
  test('GET /api/books/:id - non-existent id returns 404', async () => {
    await request(app).get('/api/books/999').expect(404);
  });

  // POST creates a new book and returns it with a generated id (201 Created)
  test('POST /api/books - creates a new book (201)', async () => {
    const newBook = {
      title: 'New Book Title',
      author: 'Test Author',
      genre: 'Nonfiction',
      copiesAvailable: 10
    };

    const res = await request(app)
      .post('/api/books')
      .send(newBook)
      .expect('Content-Type', /json/)
      .expect(201);

    expect(res.body).toMatchObject(newBook);
    expect(res.body).toHaveProperty('id');
    createdId = res.body.id; // will be used by subsequent tests

    // verify the book appears in the collection
    const all = await request(app).get('/api/books').expect(200);
    expect(all.body).toEqual(expect.arrayContaining([expect.objectContaining({ id: createdId })]));
  });

  // PUT updates an existing book's fields and returns the updated object
  test('PUT /api/books/:id - updates an existing book (200)', async () => {
    const updates = { title: 'Updated Title', copiesAvailable: 12 };

    const res = await request(app)
      .put(`/api/books/${createdId}`)
      .send(updates)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body).toHaveProperty('id', createdId);
    expect(res.body).toMatchObject(updates);

    // verify persisted
    const getRes = await request(app).get(`/api/books/${createdId}`).expect(200);
    expect(getRes.body).toMatchObject(updates);
  });

  // DELETE removes the resource and subsequent GET should return 404
  test('DELETE /api/books/:id - removes a book (204)', async () => {
    await request(app).delete(`/api/books/${createdId}`).expect(204);

    // deleted resource should return 404
    await request(app).get(`/api/books/${createdId}`).expect(404);

    // collection length should be back to initial (or at least not contain the deleted id)
    const all = await request(app).get('/api/books').expect(200);
    expect(all.body).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: createdId })]));
  });

  // PUT on missing id should return 404
  test('PUT /api/books/:id - non-existent id returns 404', async () => {
    await request(app).put('/api/books/9999').send({ title: 'x' }).expect(404);
  });

  // DELETE on missing id should return 404
  test('DELETE /api/books/:id - non-existent id returns 404', async () => {
    await request(app).delete('/api/books/9999').expect(404);
  });
});
