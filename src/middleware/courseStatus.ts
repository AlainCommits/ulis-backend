import { NextFunction, Request, Response } from 'express';
import { Course } from '../models/Course';

/**
 * Middleware to automatically update course statuses based on date
 */
export async function updateCourseStatuses(req: Request, res: Response, next: NextFunction) {
  try {
    const now = new Date();
    
    // Update all courses where endDate has passed to 'beendet'
    await Course.updateMany(
      {
        endDate: { $lt: now },
        status: { $nin: ['beendet', 'abgesagt'] }
      },
      { $set: { status: 'beendet' } }
    );

    // Update all future courses to 'geplant' if they're not active or cancelled
    await Course.updateMany(
      {
        startDate: { $gt: now },
        status: { $nin: ['geplant', 'abgesagt'] }
      },
      { $set: { status: 'geplant' } }
    );

    // Update all current courses to 'aktiv'
    await Course.updateMany(
      {
        startDate: { $lte: now },
        endDate: { $gte: now },
        status: { $nin: ['aktiv', 'abgesagt'] }
      },
      { $set: { status: 'aktiv' } }
    );

    next();
  } catch (error) {
    console.error('Error updating course statuses:', error);
    next();
  }
}

/**
 * Schedule periodic status updates (every hour)
 */
export function scheduleCourseStatusUpdates() {
  setInterval(async () => {
    try {
      const now = new Date();

      // Update completed courses
      await Course.updateMany(
        {
          endDate: { $lt: now },
          status: { $nin: ['beendet', 'abgesagt'] }
        },
        { $set: { status: 'beendet' } }
      );

      // Update planned courses
      await Course.updateMany(
        {
          startDate: { $gt: now },
          status: { $nin: ['geplant', 'abgesagt'] }
        },
        { $set: { status: 'geplant' } }
      );

      // Update active courses
      await Course.updateMany(
        {
          startDate: { $lte: now },
          endDate: { $gte: now },
          status: { $nin: ['aktiv', 'abgesagt'] }
        },
        { $set: { status: 'aktiv' } }
      );

      console.log('Course statuses updated successfully at', new Date().toISOString());
    } catch (error) {
      console.error('Error in scheduled course status update:', error);
    }
  }, 60 * 60 * 1000); // Run every hour
}