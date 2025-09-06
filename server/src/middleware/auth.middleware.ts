// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: { id: string }; // Define the user property
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
        (req as AuthRequest).user = { id: decoded.id }; // <-- ATTACH THE USER ID TO THE REQUEST
        next();
    } catch (error) { // Token is invalid
        return res.status(403).json({ message: 'Forbidden: Invalid token' });
    }
};