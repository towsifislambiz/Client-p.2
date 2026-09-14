import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const app = require('../server/server.js');
const connectDB = require('../server/config/db.js');

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (err) {
    console.error('Failed to ensure DB connection in serverless function:', err);
  }
  return app(req, res);
}
