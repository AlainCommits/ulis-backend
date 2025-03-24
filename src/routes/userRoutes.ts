import { Router, RequestHandler } from 'express';
import { userController } from '../controllers/userController';
import { auth } from '../middleware/auth';

const router = Router();

// Öffentliche Routen (keine Auth erforderlich)
router.post('/register', userController.register);
router.post('/login', userController.login);

// Geschützte Routen (Auth erforderlich)
router.use(auth as RequestHandler);

// Profil-Management
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);

// Individuelle Benutzerdetails
router.get('/:id', userController.getById);

export default router;