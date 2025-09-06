// src/api/users/users.routes.ts
import { Router } from 'express';
import * as UserController from './users.controller';
import { authMiddleware } from '../../middleware/auth.middleware'; // <-- Import middleware
import {upload} from '../../middleware/upload.middleware';

const router = Router();

router.post('/login', UserController.loginUserHandler);

// Get active checkpoints for the logged-in user
router.get('/checkpoints', authMiddleware, UserController.getCheckpointsHandler);

router.post(
  '/submissions',
  authMiddleware,
  upload.fields([
    { name: 'certificateFile', maxCount: 1 },
    { name: 'socialProofFile', maxCount: 1 }
  ]),
  UserController.createSubmissionHandler
);

export default router;