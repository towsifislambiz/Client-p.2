import { spawn } from 'child_process';

console.log('🚀 Starting Gift Vibes Backend (Port 5001)...');
const backend = spawn('node', ['server/server.js'], { stdio: 'inherit', shell: true });

console.log('⚡ Starting Vite Frontend (Port 5173)...');
const frontend = spawn('npx', ['vite', '--port', '5173'], { stdio: 'inherit', shell: true });

process.on('SIGINT', () => {
  backend.kill();
  frontend.kill();
  process.exit();
});
