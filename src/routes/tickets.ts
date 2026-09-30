import { Router } from 'express';
import {
  getAllTickets,
  getTicketById,
  createTicket,
  updateTicketStatus,
  GetAllTicketsOptions,
} from '../dal/tickets.js';
import { authMiddleware } from '../middleware/auth.js';

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

  // if no ticket found, repond 404 and return
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

  // create new ticket iwth title, description, and creator_id
  const newTicket = await createTicket({
    title,
    description,
    creator_id: creatorId,
  });

  // respond with new ticket as json, status 201
  res.status(201).json(newTicket);
});

// PATCH /tickets:id/status
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

// TODO: Student implementation - Part 2: Time Log Routes
// POST /tickets/:id/time
// GET /tickets/:id/time

export default router;
