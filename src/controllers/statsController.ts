import { Request, Response, NextFunction } from 'express';
import { Course } from '../models/Course';
import { AppError } from '../middleware/errorHandler';

export const statsController = {
  async getCourseStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await Course.aggregate([
        {
          $facet: {
            totalParticipants: [
              { $unwind: "$participants" },
              { $count: "count" }
            ],
            coursesByCategory: [
              { $group: { _id: "$category", count: { $sum: 1 } } }
            ],
            coursesByStatus: [
              { $group: { _id: "$status", count: { $sum: 1 } } }
            ],
            averageParticipants: [
              { $project: { participantCount: { $size: "$participants" } } },
              { $group: { _id: null, avg: { $avg: "$participantCount" } } }
            ]
          }
        }
      ]);

      const activeCoursesCount = await Course.countDocuments({ status: 'aktiv' });
      const finishedCoursesCount = await Course.countDocuments({ status: 'abgeschlossen' });

      res.json({
        status: 'success',
        data: {
          stats: stats[0],
          activeCourses: activeCoursesCount,
          finishedCourses: finishedCoursesCount
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async getPopularCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await Course.aggregate([
        { $unwind: "$participants" },
        { $group: { 
          _id: "$category",
          totalParticipants: { $sum: 1 },
          courses: { $addToSet: "$_id" }
        }},
        { $project: {
          category: "$_id",
          totalParticipants: 1,
          courseCount: { $size: "$courses" },
          averageParticipants: { $divide: ["$totalParticipants", { $size: "$courses" }] }
        }},
        { $sort: { totalParticipants: -1 } }
      ]);

      res.json({
        status: 'success',
        data: { categories }
      });
    } catch (error) {
      next(error);
    }
  }
};
