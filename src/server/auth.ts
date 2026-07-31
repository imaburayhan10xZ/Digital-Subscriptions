import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types/index.js';
import { adminAuth } from '../lib/firebase-admin.js';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    console.log('Token verified for user:', decodedToken.uid);
    
    // In a real app, you'd fetch the user's role from Firestore here.
    // For now, let's keep it simple as per instructions.
    req.user = {
      id: decodedToken.uid,
      email: decodedToken.email || '',
      role: decodedToken.email === 'aburayhan10x@gmail.com' ? 'ADMIN' : 'CUSTOMER',
      name: decodedToken.name || '',
    };
    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
}

export function adminMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  next();
}
