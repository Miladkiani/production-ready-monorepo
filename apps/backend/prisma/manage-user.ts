#!/usr/bin/env ts-node
/**
 * User Management CLI Script
 *
 * A secure CLI tool for managing user accounts in production environments.
 * This script bypasses the application layer to directly interact with the database,
 * which is useful for administrative tasks like password resets.
 *
 * Security Features:
 * - Uses bcrypt with cost factor 12 for password hashing
 * - Validates input before processing
 * - Supports environment variable configuration
 * - Logs operations for audit purposes
 * - No password exposure in logs
 *
 * Usage:
 *   # Update password (interactive)
 *   ts-node prisma/manage-user.ts update-password
 *
 *   # Update password (non-interactive)
 *   ts-node prisma/manage-user.ts update-password --email=admin@example.com --password=NewSecure123!
 *
 *   # List all users
 *   ts-node prisma/manage-user.ts list-users
 *
 *   # Create new user
 *   ts-node prisma/manage-user.ts create-user --email=new@example.com --password=SecurePass123! --role=ADMIN
 *
 *   # Clear failed login attempts (unlock account)
 *   ts-node prisma/manage-user.ts unlock-account --email=user@example.com
 *
 *   # Delete user
 *   ts-node prisma/manage-user.ts delete-user --email=user@example.com
 *
 * Environment Variables:
 *   DATABASE_URL - Database connection string (default: file:./dev.db)
 *
 * @author Your Name
 * @version 1.0.0
 */

import { PrismaClient, Role } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import bcrypt from 'bcrypt';
import * as readline from 'readline';
import 'dotenv/config';

// ============================================================================
// Configuration
// ============================================================================

const BCRYPT_SALT_ROUNDS = 12; // OWASP recommended minimum is 10
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;

// Password validation regex (at least one uppercase, lowercase, number, special char)
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// ============================================================================
// Initialize Prisma Client
// ============================================================================

/**
 * Determines the correct database URL based on environment.
 * Priority:
 *   1. DATABASE_URL environment variable (explicit configuration)
 *   2. Production default if running in Docker (/data/production.db)
 *   3. Development default (./dev.db)
 *
 * Security: Never hardcode credentials. Use environment variables.
 */
function getDatabaseUrl(): string {
  // First priority: explicit environment variable
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  // Detect production environment (Docker container)
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    // Check if we're in the Docker container structure
    process.cwd().startsWith('/app');

  if (isProduction) {
    // Production default: mounted volume path
    return 'file:/data/production.db';
  }

  // Development default: local prisma folder
  return 'file:./dev.db';
}

const databaseUrl = getDatabaseUrl();
const adapter = new PrismaBetterSqlite3({
  url: databaseUrl,
});

const prisma = new PrismaClient({ adapter });

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Creates a readline interface for interactive prompts
 */
function createReadlineInterface(): readline.Interface {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

/**
 * Prompts the user for input
 */
function prompt(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

/**
 * Prompts for password (note: in terminal, password will be visible)
 * For true hidden input, use a library like 'readline-sync' with { hideEchoBack: true }
 */
function promptPassword(
  rl: readline.Interface,
  question: string,
): Promise<string> {
  return new Promise((resolve) => {
    process.stdout.write(question);
    rl.question('', (answer) => {
      resolve(answer);
    });
  });
}

/**
 * Validates password strength
 */
function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
  }

  if (password.length > PASSWORD_MAX_LENGTH) {
    errors.push(`Password must be at most ${PASSWORD_MAX_LENGTH} characters`);
  }

  if (!PASSWORD_REGEX.test(password)) {
    errors.push(
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates email format
 */
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Logs operation with timestamp (without sensitive data)
 */
function logOperation(operation: string, details: string): void {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${operation}: ${details}`);
}

/**
 * Parses command line arguments
 */
function parseArgs(): Map<string, string> {
  const args = new Map<string, string>();
  process.argv.slice(3).forEach((arg) => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      if (key && value) {
        args.set(key, value);
      }
    }
  });
  return args;
}

// ============================================================================
// Command Handlers
// ============================================================================

/**
 * Updates a user's password
 */
async function updatePassword(args: Map<string, string>): Promise<void> {
  console.log('\n🔐 Update User Password\n');

  let email = args.get('email');
  let password = args.get('password');

  const rl = createReadlineInterface();

  try {
    // Get email if not provided
    if (!email) {
      email = await prompt(rl, 'Enter user email: ');
    }

    // Validate email
    if (!email || !validateEmail(email)) {
      console.error('❌ Invalid email format');
      process.exit(1);
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      process.exit(1);
    }

    console.log(`\n📧 User found: ${user.email} (Role: ${user.role})\n`);

    // Get password if not provided
    if (!password) {
      console.log('Password requirements:');
      console.log(`  - Minimum ${PASSWORD_MIN_LENGTH} characters`);
      console.log(
        '  - At least one uppercase letter, one lowercase letter, one number',
      );
      console.log('  - At least one special character (@$!%*?&)\n');

      password = await promptPassword(rl, 'Enter new password: ');
      const confirmPassword = await promptPassword(
        rl,
        'Confirm new password: ',
      );

      if (password !== confirmPassword) {
        console.error('\n❌ Passwords do not match');
        process.exit(1);
      }
    }

    // Validate password
    const validation = validatePassword(password);
    if (!validation.valid) {
      console.error('\n❌ Password validation failed:');
      validation.errors.forEach((err) => console.error(`   - ${err}`));
      process.exit(1);
    }

    // Hash the new password
    console.log('\n⏳ Hashing password...');
    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    // Update the user
    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: {
        passwordHash: hashedPassword,
        currentHashedRefreshToken: null, // Invalidate existing sessions
      },
    });

    logOperation(
      'PASSWORD_UPDATE',
      `Successfully updated password for ${email}`,
    );
    console.log('\n✅ Password updated successfully!');
    console.log('   All existing sessions have been invalidated.');
  } finally {
    rl.close();
  }
}

/**
 * Lists all users (without sensitive data)
 */
async function listUsers(): Promise<void> {
  console.log('\n👥 User List\n');

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isEmailVerified: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          sessions: true,
          loginAttempts: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  if (users.length === 0) {
    console.log('No users found.');
    return;
  }

  console.log(`Found ${users.length} user(s):\n`);
  console.log('-'.repeat(80));

  users.forEach((user, index) => {
    console.log(`\n${index + 1}. ${user.email}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Name: ${user.name || '(not set)'}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Email Verified: ${user.isEmailVerified ? 'Yes' : 'No'}`);
    console.log(`   Active Sessions: ${user._count.sessions}`);
    console.log(`   Login Attempts (total): ${user._count.loginAttempts}`);
    console.log(`   Created: ${user.createdAt.toISOString()}`);
    console.log(`   Updated: ${user.updatedAt.toISOString()}`);
  });

  console.log('\n' + '-'.repeat(80));
}

/**
 * Creates a new user
 */
async function createUser(args: Map<string, string>): Promise<void> {
  console.log('\n➕ Create New User\n');

  let email = args.get('email');
  let password = args.get('password');
  let roleStr = args.get('role');
  let name = args.get('name');

  const rl = createReadlineInterface();

  try {
    // Get email if not provided
    if (!email) {
      email = await prompt(rl, 'Enter user email: ');
    }

    // Validate email
    if (!email || !validateEmail(email)) {
      console.error('❌ Invalid email format');
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      console.error(`❌ User already exists: ${email}`);
      process.exit(1);
    }

    // Get name if not provided
    if (!name) {
      name = await prompt(
        rl,
        'Enter user name (optional, press Enter to skip): ',
      );
    }

    // Get role if not provided
    if (!roleStr) {
      console.log('\nAvailable roles: ADMIN, EDITOR');
      roleStr = await prompt(rl, 'Enter role (default: ADMIN): ');
    }

    const role = (roleStr?.toUpperCase() as Role) || Role.ADMIN;
    if (!Object.values(Role).includes(role)) {
      console.error(`❌ Invalid role: ${roleStr}. Must be ADMIN or EDITOR`);
      process.exit(1);
    }

    // Get password if not provided
    if (!password) {
      console.log('\nPassword requirements:');
      console.log(`  - Minimum ${PASSWORD_MIN_LENGTH} characters`);
      console.log(
        '  - At least one uppercase letter, one lowercase letter, one number',
      );
      console.log('  - At least one special character (@$!%*?&)\n');

      password = await promptPassword(rl, 'Enter password: ');
      const confirmPassword = await promptPassword(rl, 'Confirm password: ');

      if (password !== confirmPassword) {
        console.error('\n❌ Passwords do not match');
        process.exit(1);
      }
    }

    // Validate password
    const validation = validatePassword(password);
    if (!validation.valid) {
      console.error('\n❌ Password validation failed:');
      validation.errors.forEach((err) => console.error(`   - ${err}`));
      process.exit(1);
    }

    // Hash the password
    console.log('\n⏳ Creating user...');
    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    // Create the user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name: name || null,
        passwordHash: hashedPassword,
        role: role,
        isEmailVerified: false,
      },
    });

    logOperation('USER_CREATE', `Created user ${email} with role ${role}`);
    console.log('\n✅ User created successfully!');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
  } finally {
    rl.close();
  }
}

/**
 * Clears failed login attempts for a user (unlocks account)
 */
async function unlockAccount(args: Map<string, string>): Promise<void> {
  console.log('\n🔓 Unlock User Account\n');

  let email = args.get('email');

  const rl = createReadlineInterface();

  try {
    // Get email if not provided
    if (!email) {
      email = await prompt(rl, 'Enter user email: ');
    }

    // Validate email
    if (!email || !validateEmail(email)) {
      console.error('❌ Invalid email format');
      process.exit(1);
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      process.exit(1);
    }

    // Count existing failed attempts
    const failedAttempts = await prisma.loginAttempt.count({
      where: {
        email: email.toLowerCase(),
        successful: false,
      },
    });

    console.log(`\n📊 Found ${failedAttempts} failed login attempt(s)`);

    // Delete failed login attempts
    const deleted = await prisma.loginAttempt.deleteMany({
      where: {
        email: email.toLowerCase(),
        successful: false,
      },
    });

    logOperation(
      'ACCOUNT_UNLOCK',
      `Cleared ${deleted.count} failed attempts for ${email}`,
    );
    console.log(`\n✅ Account unlocked successfully!`);
    console.log(`   Cleared ${deleted.count} failed login attempt(s)`);
  } finally {
    rl.close();
  }
}

/**
 * Deletes a user
 */
async function deleteUser(args: Map<string, string>): Promise<void> {
  console.log('\n🗑️  Delete User\n');

  let email = args.get('email');

  const rl = createReadlineInterface();

  try {
    // Get email if not provided
    if (!email) {
      email = await prompt(rl, 'Enter user email: ');
    }

    // Validate email
    if (!email || !validateEmail(email)) {
      console.error('❌ Invalid email format');
      process.exit(1);
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        _count: {
          select: {
            sessions: true,
            loginAttempts: true,
          },
        },
      },
    });

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      process.exit(1);
    }

    console.log(`\n⚠️  About to delete user:`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Sessions: ${user._count.sessions}`);
    console.log(`   Login Attempts: ${user._count.loginAttempts}`);

    const confirm = await prompt(rl, '\nType "DELETE" to confirm: ');

    if (confirm !== 'DELETE') {
      console.log('\n❌ Deletion cancelled');
      return;
    }

    // Delete the user (cascade will handle related records)
    await prisma.user.delete({
      where: { email: email.toLowerCase() },
    });

    logOperation('USER_DELETE', `Deleted user ${email}`);
    console.log('\n✅ User deleted successfully!');
  } finally {
    rl.close();
  }
}

/**
 * Shows help information
 */
function showHelp(): void {
  console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                     User Management CLI - Help                               ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  A secure CLI tool for managing user accounts in production environments.    ║
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  USAGE:                                                                      ║
║    ts-node prisma/manage-user.ts <command> [options]                         ║
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  COMMANDS:                                                                   ║
║                                                                              ║
║    update-password   Update a user's password                                ║
║                      Options:                                                ║
║                        --email=<email>       User email                      ║
║                        --password=<password> New password                    ║
║                                                                              ║
║    list-users        List all users (no sensitive data)                      ║
║                                                                              ║
║    create-user       Create a new user                                       ║
║                      Options:                                                ║
║                        --email=<email>       User email (required)           ║
║                        --password=<password> User password (required)        ║
║                        --role=<role>         ADMIN or EDITOR (default: ADMIN)║
║                        --name=<name>         User name (optional)            ║
║                                                                              ║
║    unlock-account    Clear failed login attempts (unlock account)            ║
║                      Options:                                                ║
║                        --email=<email>       User email                      ║
║                                                                              ║
║    delete-user       Delete a user                                           ║
║                      Options:                                                ║
║                        --email=<email>       User email                      ║
║                                                                              ║
║    help              Show this help message                                  ║
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  EXAMPLES:                                                                   ║
║                                                                              ║
║    # Interactive password update                                             ║
║    ts-node prisma/manage-user.ts update-password                             ║
║                                                                              ║
║    # Non-interactive password update                                         ║
║    ts-node prisma/manage-user.ts update-password \\                          ║
║      --email=admin@example.com \\                                            ║
║      --password=NewSecure123!                                                ║
║                                                                              ║
║    # List all users                                                          ║
║    ts-node prisma/manage-user.ts list-users                                  ║
║                                                                              ║
║    # Create a new admin user                                                 ║
║    ts-node prisma/manage-user.ts create-user \\                              ║
║      --email=newadmin@example.com \\                                         ║
║      --password=SecurePass123! \\                                            ║
║      --role=ADMIN                                                            ║
║                                                                              ║
║    # Unlock a locked account                                                 ║
║    ts-node prisma/manage-user.ts unlock-account --email=user@example.com     ║
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  ENVIRONMENT:                                                                ║
║                                                                              ║
║    DATABASE_URL      Database connection string                              ║
║                      Default: file:./dev.db                                  ║
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  SECURITY NOTES:                                                             ║
║                                                                              ║
║    • Passwords are hashed using bcrypt with cost factor 12                   ║
║    • Password must meet complexity requirements                              ║
║    • Changing password invalidates all existing sessions                     ║
║    • All operations are logged for audit purposes                            ║
║    • Never share passwords in command history (use interactive mode)         ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
`);
}

// ============================================================================
// Main Entry Point
// ============================================================================

async function main(): Promise<void> {
  const command = process.argv[2];
  const args = parseArgs();

  console.log('═'.repeat(60));
  console.log('  User Management CLI - My Career Portfolio');
  console.log('═'.repeat(60));

  // Show database info (masked for security)
  const dbDisplay = databaseUrl.includes('production')
    ? '🔒 Production database (/data/production.db)'
    : databaseUrl.includes('dev')
      ? '🛠️  Development database (./dev.db)'
      : '📁 Custom database';
  console.log(`  ${dbDisplay}`);
  console.log('═'.repeat(60));

  if (
    !command ||
    command === 'help' ||
    command === '--help' ||
    command === '-h'
  ) {
    showHelp();
    return;
  }

  try {
    switch (command) {
      case 'update-password':
        await updatePassword(args);
        break;
      case 'list-users':
        await listUsers();
        break;
      case 'create-user':
        await createUser(args);
        break;
      case 'unlock-account':
        await unlockAccount(args);
        break;
      case 'delete-user':
        await deleteUser(args);
        break;
      default:
        console.error(`\n❌ Unknown command: ${command}`);
        console.log('   Run with "help" to see available commands.\n');
        process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Operation failed:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('❌ Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
