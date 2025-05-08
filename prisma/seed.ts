import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user1 = await prisma.user.create({
    data: {
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      password: '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', // password: 'password'
      role: Role.CONSULTANT,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      fullName: 'Jane Smith',
      email: 'jane.smith@example.com',
      password: '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', // password: 'password'
      role: Role.CONSULTANT,
    },
  });

  const consultant1 = await prisma.consultant.create({
    data: {
      fullName: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      location: 'New York',
      role: Role.CONSULTANT,
    },
  });

  const consultant2 = await prisma.consultant.create({
    data: {
      fullName: 'Sarah Williams',
      email: 'sarah.williams@example.com',
      location: 'Los Angeles',
      role: Role.CONSULTANT,
    },
  });

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 