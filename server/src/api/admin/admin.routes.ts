// src/api/admin/admin.routes.ts
import { Router } from 'express';
import * as AdminController from './admin.controller';
import { authMiddleware } from '../../middleware/auth.middleware'; // <-- Import

const router = Router();

router.post('/login', AdminController.loginAdminHandler);

// Apply the middleware to all routes below this line
router.post('/cohorts', authMiddleware, AdminController.createCohortHandler);
router.post('/cohorts/:cohortId/users', authMiddleware, AdminController.addUsersToCohortHandler);
router.get('/cohorts', authMiddleware, AdminController.getAllCohortsHandler);
router.get('/cohorts/:id', authMiddleware, AdminController.getCohortByIdHandler);
router.post('/checkpoints', authMiddleware, AdminController.createCheckpointHandler);
router.get('/checkpoints', authMiddleware, AdminController.getAllCheckpointsHandler);
router.get('/submissions/pending', authMiddleware, AdminController.getPendingSubmissionsHandler);
router.patch('/submissions/:submissionId/review', authMiddleware, AdminController.reviewSubmissionHandler);

export default router;