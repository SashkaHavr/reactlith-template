import { generateTestUsers } from '@reactlith-template/auth/generate-test-users';
import { migrate } from '@reactlith-template/db/migrate';

console.log('Running database migrations...');
await migrate();
console.log('Database migrations completed successfully');

if (process.env.TEST_AUTH) {
  console.log('Generating test users...');
  await generateTestUsers();
  console.log('Test users were generated successfully');
}

if (process.env.WEBHOOK_URL) {
  console.log('Sending deployment webhook...');
  await fetch(process.env.WEBHOOK_URL);
  console.log('Deployment webhook sent successfully');
}
