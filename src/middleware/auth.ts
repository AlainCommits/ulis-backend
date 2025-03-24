import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('Auth middleware:', {
      hasToken: !!token,
      path: req.path,
      method: req.method
    });
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as jwt.JwtPayload;
      req.user = {
        _id: decoded.userId,
        ...decoded
      };
      console.log('Token verified:', { userId: decoded.userId, role: decoded.role });
      next();
    } catch (jwtError) {
      console.error('Token verification failed:', jwtError);
      res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
};