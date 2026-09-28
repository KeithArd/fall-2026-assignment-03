import { Request, Response, NextFunction } from 'express';

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // get header
  const header = req.header('X-User-Id');

  // if header does not exist return 401 unauthorized error.
  if (!header) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  // header exists, convert to number and store in userId
  const userId = Number(header);

  // check that userId is a valid number (positive integer)
  // if not valid return 401 unauthorized error.
  if (!Number.isInteger(userId) || userId <= 0) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  // Store the authenticated userId on res.locals.userId
  res.locals.userId = userId;

  next();
}

export default authMiddleware;
