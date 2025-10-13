// Script to run the audit log seeder with Node
import '@babel/register';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import and run the seed function
import './seed-audit-logs.js';