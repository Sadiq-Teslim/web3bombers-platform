// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const username = 'superadmin'; // Change this if you want
  const password = 'web3'; // CHANGE THIS TO A STRONG PASSWORD

  console.log(`Checking for existing admin: ${username}...`);
  const existingAdmin = await prisma.admin.findUnique({
    where: { username },
  });

  if (existingAdmin) {
    console.log('Admin already exists. Skipping seed.');
    return;
  }

  console.log('Admin not found. Creating new admin...');
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.admin.create({
    data: {
      username,
      passwordHash,
      role: 'super_admin',
    },
  });
  console.log(`✅ Admin '${username}' created successfully!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });