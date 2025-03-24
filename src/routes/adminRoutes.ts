import { Router, RequestHandler } from 'express';
import { userController } from '../controllers/userController';
import { courseController } from '../controllers/courseController';
import { auth } from '../middleware/auth';
import { adminAuth } from '../middleware/adminAuth';

const router = Router();

// Alle Admin-Routen erfordern Authentifizierung und Admin-Rolle
router.use(auth as RequestHandler);
router.use(adminAuth as RequestHandler);

// Benutzerverwaltung
router.route('/users')
  .get(userController.getAllUsers);

router.route('/users/:id')
  .delete(userController.deleteUser)
  .put(userController.updateProfile);

router.route('/users/:id/role')
  .put(userController.updateUserRole);

// Kursverwaltung
router.route('/courses')
  .get(courseController.getAll)
  .post(courseController.create);

router.route('/courses/:id')
  .put(courseController.update)
  .delete(courseController.delete);

export default router;
