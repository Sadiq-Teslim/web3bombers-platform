// src/api/admin/admin.controller.ts
import { Request, Response } from 'express';
import * as AdminService from './admin.service';

export const createCohortHandler = async (req: Request, res: Response) => {
  try {
    const { cohortNumber, name } = req.body;
    if (!cohortNumber) {
      return res.status(400).json({ message: 'Cohort number is required' });
    }
    const newCohort = await AdminService.createCohort(cohortNumber, name);
    res.status(201).json(newCohort);
  } catch (error) {
    res.status(500).json({ message: 'Error creating cohort', error });
  }
};

export const addUsersToCohortHandler = async (req: Request, res: Response) => {
  try {
    const { cohortId } = req.params;
    const { users } = req.body;

    if (!users || !Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ message: 'Users array is required' });
    }

    const createdUsers = await AdminService.addUsersToCohort(cohortId, users);
    res.status(201).json(createdUsers);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error adding users' });
  }
};

export const loginAdminHandler = async (req: Request, res: Response) => {
  try {
    console.log('Login attempt with body:', req.body); 
    const { username, password } = req.body;
    const token = await AdminService.loginAdmin(username, password);

    if (!token) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllCohortsHandler = async (req: Request, res: Response) => {
  try {
    const cohorts = await AdminService.getAllCohorts();
    res.status(200).json(cohorts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cohorts' });
  }
};

export const getCohortByIdHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const cohort = await AdminService.getCohortById(id);
    if (!cohort) {
      return res.status(404).json({ message: 'Cohort not found' });
    }
    res.status(200).json(cohort);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cohort details' });
  }
};

export const createCheckpointHandler = async (req: Request, res: Response) => {
  try {
    const { title, description, deadline, points } = req.body;
    // Basic validation
    if (!title || !deadline || !points) {
      return res.status(400).json({ message: 'Title, deadline, and points are required' });
    }
    const newCheckpoint = await AdminService.createCheckpoint({
      title,
      description,
      deadline: new Date(deadline), // Convert string date to Date object
      points: parseInt(points, 10),
    });
    res.status(201).json(newCheckpoint);
  } catch (error) {
    res.status(500).json({ message: 'Error creating checkpoint' });
  }
};

export const getAllCheckpointsHandler = async (req: Request, res: Response) => {
  try {
    const checkpoints = await AdminService.getAllCheckpoints();
    res.status(200).json(checkpoints);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching checkpoints' });
  }
};

export const getPendingSubmissionsHandler = async (req: Request, res: Response) => {
  try {
    const submissions = await AdminService.getPendingSubmissions();
    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending submissions' });
  }
};

export const reviewSubmissionHandler = async (req: Request, res: Response) => {
  try {
    const { submissionId } = req.params;
    const { status } = req.body; // Expecting 'approved' or 'rejected'

    if (status !== 'approved' && status !== 'rejected') {
      return res.status(400).json({ message: 'Invalid status' });
    }

    await AdminService.reviewSubmission(submissionId, status);
    res.status(200).json({ message: `Submission ${status}` });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error reviewing submission' });
  }
};
