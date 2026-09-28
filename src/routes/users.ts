import { Router } from 'express';
import { createUser, getAllUsers, getUserById } from '../dal/users.js';

const router = Router();

// GET /users
router.get('/', async (req, res) => {
  // get list of all users
  const users = await getAllUsers();

  // respond user list as json
  res.json(users);
});

// GET /users/:id
router.get('/:id', async (req, res) => {
  // convert request id parameter to Number
  const id = Number(req.params.id);
  // get user
  const user = await getUserById(id);

  // if no user found, respond 404 and return
  if (!user) {
    res.status(404).json({ error: 'Not Found' });
    return;
  }

  // respond user as json
  res.json(user);
});

// POST /users
router.post('/', async (req, res) => {
  // get name and email from body
  const { name, email } = req.body;

  // create new user using name and email from body
  const newUser = await createUser({ name, email });

  // respond with created user as json, with 201 status
  res.status(201).json(newUser);
});

export default router;
