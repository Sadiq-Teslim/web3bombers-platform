// src/api/users/users.controller.ts
import { Request, Response } from 'express';
import * as UserService from './users.sevice';
import { AuthRequest } from '../../middleware/auth.middleware';

export const loginUserHandler = async (req: Request, res: Response) => {
  try {
    const { matricNumber, password } = req.body;
    const token = await UserService.loginUser(matricNumber, password);

    if (!token) {
      return res.status(401).json({ message: 'Invalid credentials or inactive account' });
    }

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getCheckpointsHandler = async (req: Request, res: Response) => {
  try {
    const checkpoints = await UserService.getActiveCheckpoints();
    res.status(200).json(checkpoints);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching checkpoints' });
  }
};

export const createSubmissionHandler = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { checkpointId } = req.body;
    // req.files is an object where keys are the field names
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!userId || !checkpointId || !files.certificateFile || !files.socialProofFile) {
      return res.status(400).json({ message: 'Missing required fields or files' });
    }

    const certificateFile = files.certificateFile[0];
    const socialProofFile = files.socialProofFile[0];

    const certificateUrl = `${req.protocol}://${req.get('host')}/${certificateFile.path}`;
    const socialProofUrl = `${req.protocol}://${req.get('host')}/${socialProofFile.path}`;

    const submission = await UserService.createSubmission(userId, checkpointId, certificateUrl, socialProofUrl); // We'll update the service next
    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ message: 'Error creating submission' });
  }
};