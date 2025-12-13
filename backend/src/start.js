import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting application...');

try {
  // Ensure Prisma Client is generated
  console.log('📦 Generating Prisma Client...');
  execSync('npx prisma generate', { 
    stdio: 'inherit',
    cwd: join(__dirname, '..')
  });

  // Run migrations
  console.log('🔄 Running database migrations...');
  execSync('npx prisma migrate deploy', { 
    stdio: 'inherit',
    cwd: join(__dirname, '..')
  });

  console.log('✅ Migrations completed successfully!');
  console.log('🌐 Starting server...');
  
  // Start the server
  import('./server.js');
} catch (error) {
  console.error('❌ Error during startup:', error.message);
  process.exit(1);
}

