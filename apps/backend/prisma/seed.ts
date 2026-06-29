import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import bcrypt from 'bcrypt';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db',
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding started...');

  // --- 1. Validate required env vars ---
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error(
      '❌ Missing ADMIN_EMAIL or ADMIN_PASSWORD in environment variables',
    );
  }

  // --- 2. Hash password ---
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  // --- 3. Upsert admin user ---
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log(`✅ Admin user seeded: ${adminEmail}`);

  // --- 4. Upsert default SecuritySettings record (singleton) ---
  await prisma.securitySettings.upsert({
    where: { id: 'security-settings' },
    update: {},
    create: {
      id: 'security-settings',
      telegramBotToken: null,
      telegramChatId: null,
    },
  });

  console.log('✅ SecuritySettings record seeded');
  console.log('✅ Seeding finished!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
