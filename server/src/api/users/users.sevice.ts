// src/api/users/users.service.ts
import { prisma } from '../../prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const loginUser = async (matricNumber: string, password: string): Promise<string | null> => {
  const user = await prisma.user.findUnique({ where: { matricNumber } });
  if (!user) {
    return null; // User not found
  }

  // We only allow active users to log in
  if (user.status !== 'active') {
    return null; // User is suspended or eliminated
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    return null; // Invalid password
  }

  const token = jwt.sign(
    { id: user.id, matricNumber: user.matricNumber, cohortId: user.cohortId },
    process.env.JWT_SECRET as string,
    { expiresIn: '8h' }
  );

  return token;
};

export const getActiveCheckpoints = async () => {
  // For now, all users see all checkpoints.
  // Later, this could be customized per cohort.
  return prisma.checkpoint.findMany({
    where: {
      deadline: {
        gte: new Date(), // Only show checkpoints whose deadline hasn't passed
      },
    },
    orderBy: {
      deadline: 'asc',
    },
  });
};

export const createSubmission = async (userId: string, checkpointId: string, certificateUrl: string, socialProofUrl: string) => {
  const existingSubmission = await prisma.submission.findFirst({
    where: { userId, checkpointId },
  });

  const data = {
    fileUrl: certificateUrl,
    socialProofUrl: socialProofUrl,
    status: 'pending' as const,
  };

  if (existingSubmission) {
    return prisma.submission.update({
      where: { id: existingSubmission.id },
      data,
    });
  } else {
    return prisma.submission.create({
      data: {
        userId,
        checkpointId,
        ...data,
      },
    });
  }
};