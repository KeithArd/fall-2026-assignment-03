import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';

describe('Part 1: API Integration Tests', () => {
  // Test user creation (POST /users)
  it('creates a user', async () => {
    // send a POST request with a new user in body
    const res = await request(app)
      .post('/users')
      .send({ name: 'test user', email: 'test@email.com' });

    // check status code, should be 201
    expect(res.status).toBe(201);

    // check response, should have name, email, and id
    expect(res.body.name).toBe('test user');
    expect(res.body.email).toBe('test@email.com');
    expect(res.body.id).toBeDefined();
  });

  // Test ticket creation (POST /tickets)
  it('creates a ticket', async () => {
    // create user to be used to make valid ticket
    const userRes = await request(app)
      .post('/users')
      .send({ name: 'test user', email: 'test@email.com' });

    // get user id as string from response
    const userId = userRes.body.id;

    // create a ticket using test user for X-User-Id
    const res = await request(app)
      .post('/tickets')
      .set('X-User-Id', String(userId)) // set header as user id
      .send({ title: 'test title', description: 'test description' });

    // check status, should be 201 (success)
    expect(res.status).toBe(201);

    // check response, title and creator id match
    expect(res.body.title).toBe('test title');
    expect(res.body.creator_id).toBe(userId);
  });

  // Test auth middleware rejection (401 when X-User-Id is missing or invalid)
  it('rejects missing X-User-Id', async () => {
    // send post request with ticket body but no X-User-Id header
    const res = await request(app)
      .post('/tickets')
      .send({ title: 'test title', description: 'test description' });

    // check status code, should be 401
    expect(res.status).toBe(401);

    // check response, should be an error (Unauthorized)
    expect(res.body.error).toBeDefined();
    expect(res.body.error).toBe('Unauthorized');
  });

  // Test 404 responses for non-existent users and tickets
  it('gives 404 not found response for non-existent users', async () => {
    const res = await request(app).get('/users/99999');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Not Found');
  });

  it('gives 404 not found response for non-existent tickets', async () => {
    const res = await request(app).get('/tickets/99999');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Not Found');
  });

  // Test pagination GET /tickets
  it('paginates tickets with limit and offset', async () => {
    // create user to make valid tickets
    const userRes = await request(app)
      .post('/users')
      .send({ name: 'test user', email: 'test@email.com' });
    const userId = String(userRes.body.id);

    // create 3 tickets
    for (let i = 1; i <= 3; i++) {
      await request(app)
        .post('/tickets')
        .set('X-User-Id', userId)
        .send({ title: 'ticket ' + i });
    }

    // request first page with limit 2
    const firstPage = await request(app).get('/tickets?limit=2');

    // check status 200, and only two tickets
    expect(firstPage.status).toBe(200);
    expect(firstPage.body).toHaveLength(2);

    // request second page with offset 2
    const secondPage = await request(app).get('/tickets?limit=2&offset=2');

    // check status 200, and ticket 3 only
    expect(secondPage.status).toBe(200);
    expect(secondPage.body).toHaveLength(1);
    expect(secondPage.body[0].title).toBe('ticket 3');
  });
});
