// src/api/admin/admin.service.ts
import { prisma } from '../../prisma';
import bcrypt from 'bcryptjs';
import { generateMatricNumber } from '../../utils/matricNumber';
import jwt from 'jsonwebtoken'

// ... (Admin registration, login, etc. will go here)

export const createCohort = async (cohortNumber: number, name?: string) => {
  return prisma.cohort.create({
    data: {
      cohortNumber,
      name,
    },
  });
};

export const addUsersToCohort = async (cohortId: string, users: { username: string; password: string }[]) => {
  const cohort = await prisma.cohort.findUnique({ where: { id: cohortId }, include: { _count: { select: { users: true } } } });

  if (!cohort) {
    throw new Error('Cohort not found');
  }

  let userIndex = cohort._count.users + 1;
  const createdUsers = [];

  for (const userData of users) {
    const passwordHash = await bcrypt.hash(userData.password, 10);
    const matricNumber = generateMatricNumber(cohort.cohortNumber, userIndex);

    const newUser = await prisma.user.create({
      data: {
        username: userData.username,
        passwordHash,
        matricNumber,
        cohortId: cohort.id,
      },
    });
    createdUsers.push(newUser);
    userIndex++;
  }

  return createdUsers;
};

export const loginAdmin = async (username: string, password: string): Promise<string | null> => {
  const admin = await prisma.admin.findUnique({ where: { username } });
  if (!admin) {
    return null; // Admin not found
  }

  const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
  if (!isPasswordValid) {
    return null; // Invalid password
  }

  const token = jwt.sign(
    { id: admin.id, username: admin.username, role: admin.role },
    process.env.JWT_SECRET as string,
    { expiresIn: '8h' } // Token is valid for 8 hours
  );

  return token;
};

export const getAllCohorts = async () => {
  return prisma.cohort.findMany({
    orderBy: {
      cohortNumber: 'asc',
    },
    include: {
      _count: {
        select: { users: true },
      },
    },
  });
};

export const getCohortById = async (cohortId: string) => {
  return prisma.cohort.findUnique({
    where: { id: cohortId },
    include: {
      users: { // Include all users related to this cohort
        orderBy: {
          matricNumber: 'asc',
        },
      },
    },
  });
};

export const createCheckpoint = async (data: { title: string; description?: string; deadline: Date; points: number }) => {
  return prisma.checkpoint.create({
    data,
  });
};

export const getAllCheckpoints = async () => {
  return prisma.checkpoint.findMany({
    orderBy: {
      deadline: 'asc', // Show the nearest deadline first
    },
  });
};

export const getPendingSubmissions = async () => {
  return prisma.submission.findMany({
    where: { status: 'pending' },
    include: {
      user: { // Include user info
        select: { username: true, matricNumber: true },
      },
      checkpoint: { // Include checkpoint info
        select: { title: true, points: true },
      },
    },
    orderBy: {
      createdAt: 'asc', // Show oldest first
    },
  });
};

export const reviewSubmission = async (submissionId: string, newStatus: 'approved' | 'rejected') => {
  // Use a transaction to ensure data integrity
  return prisma.$transaction(async (tx) => {
    // 1. Find the submission to get user ID and points
    const submission = await tx.submission.findUnique({
      where: { id: submissionId },
      include: { checkpoint: true },
    });

    if (!submission) {
      throw new Error('Submission not found');
    }

    // 2. Update the submission's status
    const updatedSubmission = await tx.submission.update({
      where: { id: submissionId },
      data: {
        status: newStatus,
        reviewedAt: new Date(),
      },
    });

    // 3. If approved, award points to the user
    if (newStatus === 'approved') {
      await tx.user.update({
        where: { id: submission.userId },
        data: {
          points: {
            increment: submission.checkpoint.points, // Add points from the checkpoint
          },
        },
      });
    }

    return updatedSubmission;
  });
};

