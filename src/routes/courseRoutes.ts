import { Router, RequestHandler } from 'express';
import { courseController } from '../controllers/courseController';
import { auth } from '../middleware/auth';
import { adminAuth } from '../middleware/adminAuth';
import { validate } from '../middleware/validate';
import { courseValidation, youtubeUpdateValidation } from '../validations/courseValidations';

const router = Router();

// Public routes with pagination and filtering
router.route('/')
  .get(courseController.getAll);

router.route('/:id')
  .get(courseController.getById);

// Protected routes
router.use(auth as RequestHandler);

// User-specific routes
router.route('/user/courses')
  .get(courseController.getUserCourses);

router.route('/:id/join')
  .post(courseController.join);

router.route('/:id/leave')
  .post(courseController.leave);

// Admin routes
router.use(adminAuth as RequestHandler);

router.route('/admin/all')
  .get(courseController.getAllCourses);

router.route('/')
  .post(validate(courseValidation), courseController.create);

router.route('/:id')
  .patch(validate(courseValidation), courseController.update)
  .delete(courseController.delete);

router.route('/:id/youtube')
  .patch(validate(youtubeUpdateValidation), courseController.updateYoutubeInfo);

export default router;