import { Request, Response, NextFunction } from 'express';
import { User } from '@/models/User';
import { AppError } from './errorHandler';

export const adminAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Admin auth check:', {
      userId: req.user?.userId,
      path: req.path,
      method: req.method
    });

    if (!req.user?.userId) {
      console.error('No user ID in request');
      throw new AppError('Authentication required', 401);
    }

    const user = await User.findById(req.user.userId);
    console.log('Found user:', {
      id: user?._id,
      role: user?.role
    });
    
    if (!user || user.role !== 'admin') {
      console.error('Admin access denied:', {
        userId: req.user.userId,
        foundUser: !!user,
        role: user?.role
      });
      throw new AppError('Admin access required', 403);
    }
    
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    next(error);
  }
};