import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { Course } from '../models/Course';
import { AppError } from '../middleware/errorHandler';

export const userController = {
  // Auth functions
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, firstName, lastName } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new AppError('Email already in use', 400);
      }

      const user = new User({
        email,
        password,
        firstName,
        lastName,
        role: 'user'
      });

      await user.save();

      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET!,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        status: 'success',
        data: {
          user: {
            _id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
          },
          token
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        throw new AppError('Invalid email or password', 401);
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new AppError('Invalid email or password', 401);
      }

      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET!,
        { expiresIn: '24h' }
      );

      res.json({
        status: 'success',
        data: {
          user: {
            _id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
          },
          token
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // User list function (für Teilnehmerliste)
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await User.find().select('-password');
      res.json({
        status: 'success',
        data: { users }
      });
    } catch (error) {
      next(error);
    }
  },

  // Admin functions
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await User.find().select('-password');
      res.json({
        status: 'success',
        data: { users }
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      
      if (!user) {
        throw new AppError('User not found', 404);
      }

      res.json({
        status: 'success',
        data: null
      });
    } catch (error) {
      next(error);
    }
  },

  async updateUserRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { role } = req.body;
      if (!['user', 'admin'].includes(role)) {
        throw new AppError('Invalid role', 400);
      }

      const user = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        throw new AppError('User not found', 404);
      }

      res.json({
        status: 'success',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  },

  // Profile functions
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await User.findById(req.user!.userId).select('-password');
      
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const courses = await Course.find({ participants: user._id });

      res.json({
        status: 'success',
        data: { 
          user,
          courses 
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { firstName, lastName, email, currentPassword, newPassword } = req.body;
      const userId = req.user!.userId;

      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      if (email && email !== user.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          throw new AppError('Email already in use', 400);
        }
        user.email = email;
      }

      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;

      if (currentPassword && newPassword) {
        const isPasswordValid = await user.comparePassword(currentPassword);
        if (!isPasswordValid) {
          throw new AppError('Current password is incorrect', 401);
        }
        user.password = newPassword;
      }

      await user.save();
      const updatedUser = await User.findById(userId).select('-password');

      res.json({
        status: 'success',
        data: { user: updatedUser }
      });
    } catch (error) {
      next(error);
    }
  },

  // Individual user details
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await User.findById(req.params.id).select('-password');
      
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const courses = await Course.find({ participants: user._id });

      res.json({
        status: 'success',
        data: { 
          user,
          courses 
        }
      });
    } catch (error) {
      next(error);
    }
  }
};