import { Request, Response } from 'express';
import { Course, CourseDocument } from '../models/Course';

export const courseController = {
  // Get all courses (public)
  getAll: async (req: Request, res: Response): Promise<void> => {
    try {
      const courses = await Course.find().lean();
      
      // Update status for each course
      const now = new Date();
      const updatedCourses = courses.map(course => {
        if (course.status === 'abgesagt') return course;

        const startDate = new Date(course.startDate);
        const endDate = new Date(course.endDate);

        if (endDate < now) {
          return { ...course, status: 'beendet' };
        } else if (startDate > now) {
          return { ...course, status: 'geplant' };
        } else {
          return { ...course, status: 'aktiv' };
        }
      });

      res.json({
        status: 'success',
        data: { courses: updatedCourses }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Fehler beim Laden der Kurse'
      });
    }
  },

  // Get all courses (admin version - same as getAll for now)
  getAllCourses: async (req: Request, res: Response): Promise<void> => {
    try {
      const courses = await Course.find().lean();
      
      const now = new Date();
      const updatedCourses = courses.map(course => {
        if (course.status === 'abgesagt') return course;

        const startDate = new Date(course.startDate);
        const endDate = new Date(course.endDate);

        if (endDate < now) {
          return { ...course, status: 'beendet' };
        } else if (startDate > now) {
          return { ...course, status: 'geplant' };
        } else {
          return { ...course, status: 'aktiv' };
        }
      });

      res.json({
        status: 'success',
        data: { courses: updatedCourses }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Fehler beim Laden der Kurse'
      });
    }
  },

  // Get user's courses
  getUserCourses: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?._id;
      const courses = await Course.find({ participants: userId }).lean();
      
      const now = new Date();
      const updatedCourses = courses.map(course => {
        if (course.status === 'abgesagt') return course;

        const startDate = new Date(course.startDate);
        const endDate = new Date(course.endDate);

        if (endDate < now) {
          return { ...course, status: 'beendet' };
        } else if (startDate > now) {
          return { ...course, status: 'geplant' };
        } else {
          return { ...course, status: 'aktiv' };
        }
      });

      res.json({
        status: 'success',
        data: { courses: updatedCourses }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Fehler beim Laden der Kurse'
      });
    }
  },

  // Get course by ID (public)
  getById: async (req: Request, res: Response): Promise<void> => {
    try {
      const course = await Course.findById(req.params.id)
        .populate('participants', 'firstName lastName')
        .lean();
      
      if (!course) {
        res.status(404).json({
          status: 'error',
          message: 'Kurs nicht gefunden'
        });
        return;
      }

      // Update status based on dates
      const now = new Date();
      const startDate = new Date(course.startDate);
      const endDate = new Date(course.endDate);

      let status = course.status;
      if (status !== 'abgesagt') {
        if (endDate < now) {
          status = 'beendet';
        } else if (startDate > now) {
          status = 'geplant';
        } else {
          status = 'aktiv';
        }
      }

      const updatedCourse = { ...course, status };

      res.json({
        status: 'success',
        data: { course: updatedCourse }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Fehler beim Laden des Kurses'
      });
    }
  },

  // Create new course (admin only)
  create: async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user?.userId) {
        res.status(401).json({
          status: 'error',
          message: 'Nicht authentifiziert'
        });
        return;
      }

      // Set type based on category
      const type = req.body.category === 'onlinekurs' ? 'recorded' : 'live';
      
      const courseData = {
        ...req.body,
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate || req.body.startDate), // Use startDate if endDate is not provided
        type,
        createdBy: req.user.userId,
        participantCount: 0,
        topics: req.body.topics || [], // Ensure topics is defined
        participants: [] // Ensure participants is defined
      };

      console.log('Creating course with data:', courseData);

      const course = await Course.create(courseData);

      res.status(201).json({
        status: 'success',
        data: { course }
      });
    } catch (error: any) {
      console.error('Error creating course:', error);
      res.status(500).json({
        status: 'error',
        message: 'Fehler beim Erstellen des Kurses',
        details: error.message || 'No error details'
      });
    }
  },

  // Update course (admin only)
  update: async (req: Request, res: Response): Promise<void> => {
    try {
      // Set type based on category if category is being updated
      const updates = { ...req.body };
      if (updates.category) {
        updates.type = updates.category === 'onlinekurs' ? 'recorded' : 'live';
      }

      const course = await Course.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
      ).lean();

      if (!course) {
        res.status(404).json({
          status: 'error',
          message: 'Kurs nicht gefunden'
        });
        return;
      }

      res.json({
        status: 'success',
        data: { course }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Fehler beim Aktualisieren des Kurses'
      });
    }
  },

  // Delete course (admin only)
  delete: async (req: Request, res: Response): Promise<void> => {
    try {
      const course = await Course.findByIdAndDelete(req.params.id);

      if (!course) {
        res.status(404).json({
          status: 'error',
          message: 'Kurs nicht gefunden'
        });
        return;
      }

      res.json({
        status: 'success',
        message: 'Kurs erfolgreich gelöscht'
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Fehler beim Löschen des Kurses'
      });
    }
  },

  // Update YouTube info (admin only)
  updateYoutubeInfo: async (req: Request, res: Response): Promise<void> => {
    try {
      const { youtubeUrl, youtubeDescription } = req.body;

      const course = await Course.findByIdAndUpdate(
        req.params.id,
        { youtubeUrl, youtubeDescription },
        { new: true, runValidators: true }
      ).lean();

      if (!course) {
        res.status(404).json({
          status: 'error',
          message: 'Kurs nicht gefunden'
        });
        return;
      }

      res.json({
        status: 'success',
        data: { course }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Fehler beim Aktualisieren der YouTube-Informationen'
      });
    }
  },

  // Join course
  join: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({
          status: 'error',
          message: 'Nicht authentifiziert'
        });
        return;
      }

      const course = await Course.findById(req.params.id)
        .populate('participants', 'firstName lastName');

      if (!course) {
        res.status(404).json({
          status: 'error',
          message: 'Kurs nicht gefunden'
        });
        return;
      }

      // Check if user is already enrolled using MongoDB's ObjectId comparisons
      if (course.participants.some((participant: any) => participant._id.toString() === userId.toString())) {
        res.status(400).json({
          status: 'error',
          message: 'Sie sind bereits für diesen Kurs eingeschrieben'
        });
        return;
      }

      // Update course status before checking if it can be joined
      const now = new Date();
      if (course.status !== 'abgesagt') {
        if (course.endDate < now) {
          course.status = 'beendet';
        } else if (course.startDate > now) {
          course.status = 'geplant';
        } else {
          course.status = 'aktiv';
        }
      }

      // Check if course can be joined
      if (course.status === 'beendet' || course.status === 'abgesagt') {
        res.status(400).json({
          status: 'error',
          message: 'Dieser Kurs kann nicht mehr beigetreten werden'
        });
        return;
      }

      // Check if course is full
      if (course.participants.length >= course.maxParticipants) {
        res.status(400).json({
          status: 'error',
          message: 'Dieser Kurs ist bereits voll'
        });
        return;
      }

      course.participants.push(userId);
      await course.save();

      res.json({
        status: 'success',
        message: 'Erfolgreich dem Kurs beigetreten'
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Fehler beim Beitreten des Kurses'
      });
    }
  },

  // Leave course
  leave: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({
          status: 'error',
          message: 'Nicht authentifiziert'
        });
        return;
      }

      const course = await Course.findById(req.params.id)
        .populate('participants', 'firstName lastName');

      if (!course) {
        res.status(404).json({
          status: 'error',
          message: 'Kurs nicht gefunden'
        });
        return;
      }

      // Check if user is enrolled using MongoDB's ObjectId comparisons
      if (!course.participants.some((participant: any) => participant._id.toString() === userId.toString())) {
        res.status(400).json({
          status: 'error',
          message: 'Sie sind nicht für diesen Kurs eingeschrieben'
        });
        return;
      }

      course.participants = course.participants.filter((participant: any) => participant._id.toString() !== userId.toString());
      await course.save();

      res.json({
        status: 'success',
        message: 'Erfolgreich aus dem Kurs ausgetreten'
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Fehler beim Verlassen des Kurses'
      });
    }
  }
};
