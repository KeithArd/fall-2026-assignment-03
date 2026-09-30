import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';

// helper function to create test user and ticket
async function createTestUserAndTicket() {
  // create user to make valid ticket
  const userRes = await request(app)
    .post('/users')
    .send({ name: 'test user', email: 'test@email.com' });
  const userId = userRes.body.id;

  // create a ticket
  const ticketRes = await request(app)
    .post('/tickets')
    .set('X-User-Id', String(userId)) // set header as user id
    .send({ title: 'test title', description: 'test description' });
  const ticketId = ticketRes.body.id;

  return { userId, ticketId };
}

describe('Part 2: Time Logs Tests', () => {
  // test logging hours on ticket
  it('log hours for a ticket', async () => {
    const { userId, ticketId } = await createTestUserAndTicket();

    // log 10 hours on ticket
    const res = await request(app)
      .post('/tickets/' + ticketId + '/time')
      .set('X-User-Id', String(userId))
      .send({ hours: 10 });

    // check status, should be 201
    expect(res.status).toBe(201);

    // check response: ticket_id, user_id, hours logged
    expect(res.body.ticket_id).toBe(ticketId);
    expect(res.body.user_id).toBe(userId);
    expect(res.body.hours).toBe(10);
    expect(res.body.id).toBeDefined();
    expect(res.body.logged_at).toBeDefined();
  });

  // test multiple logged hours summation
  it('sums total hours from multiple time logs', async () => {
    const { userId, ticketId } = await createTestUserAndTicket();

    const hoursToLog = [1, 2, 3];
    const expectedTotal = 6;

    // log multiple time log entries
    for (const hours of hoursToLog) {
      await request(app)
        .post('/tickets/' + ticketId + '/time')
        .set('X-User-Id', String(userId))
        .send({ hours });
    }

    // get total hours for this ticket
    const res = await request(app).get('/tickets/' + ticketId + '/time');

    // check response: status 200, correct ticket id, sum is correct
    expect(res.status).toBe(200);
    expect(res.body.ticket_id).toBe(ticketId);
    expect(res.body.total_hours).toBe(expectedTotal);
  });

  // test that no logs returns 0 hours
  it('returns 0 hours for ticket with no logged hours', async () => {
    const { ticketId } = await createTestUserAndTicket();

    // get total hours for this ticket
    const res = await request(app).get('/tickets/' + ticketId + '/time');

    // check response, no logged hours, total should be 0
    expect(res.status).toBe(200);
    expect(res.body.total_hours).toBe(0);
  });
});
