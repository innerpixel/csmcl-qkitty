import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory (equivalent to __dirname in CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure dist directory exists
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy 404.html to dist directory
const source404 = path.join(__dirname, '404.html');
const target404 = path.join(distDir, '404.html');

try {
  const content = fs.readFileSync(source404, 'utf8');
  fs.writeFileSync(target404, content, 'utf8');
  console.log('Successfully copied 404.html to dist directory');
} catch (err) {
  console.error('Error copying 404.html:', err);
}

// Copy 404-particles.js to dist directory
const sourceJS = path.join(__dirname, 'src', '404-particles.js');
const targetJS = path.join(distDir, '404-particles.js');

try {
  const jsContent = fs.readFileSync(sourceJS, 'utf8');
  fs.writeFileSync(targetJS, jsContent, 'utf8');
  console.log('Successfully copied 404-particles.js to dist directory');
} catch (err) {
  console.error('Error copying 404-particles.js:', err);
}
