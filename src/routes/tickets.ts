import { Router } from 'express';
import {
  getAllTickets,
  getTicketById,
  createTicket,
  updateTicketStatus,
  GetAllTicketsOptions,
} from '../dal/tickets.js';
import { authMiddleware } from '../middleware/auth.js';
import { insertTimeLog, getTotalHoursForTicket } from '../dal/timeLogs.js';

const router = Router();

// GET /tickets
router.get('/', async (req, res) => {
  const { limit, offset, status } = req.query;

  const options: GetAllTicketsOptions = {};

  // for each query param provided, add it to the options object
  if (limit) options.limit = Number(limit);
  if (offset) options.offset = Number(offset);
  if (status) options.status = status as string;

  // fetch tickets using options
  const tickets = await getAllTickets(options);

  // respond with tickets as json
  res.json(tickets);
});

// GET /tickets/:id
router.get('/:id', async (req, res) => {
  // get id param
  const id = Number(req.params.id);

  // get ticket
  const ticket = await getTicketById(id);

  // if no ticket found, respond 404 and return
  if (!ticket) {
    res.status(404).json({ error: 'Not Found' });
    return;
  }

  // respond ticket as json
  res.json(ticket);
});

// POST /tickets
router.post('/', authMiddleware, async (req, res) => {
  // get title and description from body
  const { title, description } = req.body;

  // get creator id from res.locals (set by authMiddleware)
  const creatorId = res.locals.userId;

  // create new ticket with title, description, and creator_id
  const newTicket = await createTicket({
    title,
    description,
    creator_id: creatorId,
  });

  // respond with new ticket as json, status 201
  res.status(201).json(newTicket);
});

// PATCH /tickets/:id/status
router.patch('/:id/status', authMiddleware, async (req, res) => {
  // get id param
  const id = Number(req.params.id);

  // get new status from body
  const { status } = req.body;

  // update the ticket's status
  const updatedTicket = await updateTicketStatus(id, status);

  // if no ticket found, respond 404 and return
  if (!updatedTicket) {
    res.status(404).json({ error: 'Not Found' });
    return;
  }

  // respond with updated ticket as json
  res.json(updatedTicket);
});

// POST /tickets/:id/time
router.post('/:id/time', authMiddleware, async (req, res) => {
  // get ticket id param
  const ticketId = Number(req.params.id);

  // get hours from body
  const { hours } = req.body;

  // get user id from res.locals (set by auth middleware)
  const userId = res.locals.userId;

  // if ticket doesn't exist, respond 404 and return
  const ticket = await getTicketById(ticketId);
  if (!ticket) {
    res.status(404).json({ error: 'Not Found' });
    return;
  }

  // create time log
  const timeLog = await insertTimeLog(ticketId, userId, hours);

  // respond with created time log as json, status 201
  res.status(201).json(timeLog);
});

// GET /tickets/:id/time
router.get('/:id/time', async (req, res) => {
  // get ticket id param
  const ticketId = Number(req.params.id);

  // if ticket doesn't exist, respond 404 and return
  const ticket = await getTicketById(ticketId);
  if (!ticket) {
    res.status(404).json({ error: 'Not Found' });
    return;
  }

  // get total hours
  const totalHours = await getTotalHoursForTicket(ticketId);

  // respond with ticket id and total hours
  res.json({ ticket_id: ticketId, total_hours: totalHours });
});

export default router;
