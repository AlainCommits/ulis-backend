import { body } from 'express-validator';

export const notificationValidation = [
  body('message').trim().notEmpty()
    .withMessage('Notification message is required')
    .isLength({ min: 10 })
    .withMessage('Message must be at least 10 characters long')
];

export const courseValidation = [
  body('title').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  body('category').isIn(['Programmierung', 'Design', 'Business', 'Sprachen', 'Sonstiges']),
  body('status').optional().isIn(['aktiv', 'abgeschlossen', 'abgesagt']),
  body('type').isIn(['live', 'recorded'])
    .withMessage('Course type must be either live or recorded'),
  body('maxParticipants').isInt({ min: 1 })
    .withMessage('Maximum participants must be at least 1'),
  body('youtubeUrl').optional()
    .matches(/^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}$/)
    .withMessage('Invalid YouTube URL format')
];

export const youtubeUpdateValidation = [
  body('youtubeUrl')
    .notEmpty().withMessage('YouTube URL is required')
    .matches(/^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}$/)
    .withMessage('Invalid YouTube URL format')
];

export const profileUpdateValidation = [
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('email').optional().isEmail(),
  body('currentPassword').optional().notEmpty()
    .withMessage('Current password is required when updating password'),
  body('newPassword').optional().isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];
