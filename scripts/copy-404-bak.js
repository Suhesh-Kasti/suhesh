const fs = require('fs');
const path = require('path');

// Paths
const source = path.join(__dirname, '..', 'custom-404.html');
const destination = path.join(__dirname, '..', 'public', '404.html');

// Check if source file exists
if (!fs.existsSync(source)) {
  console.error('❌ Error: custom-404.html not found!');
  process.exit(1);
}

// Check if public directory exists
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  console.error('❌ Error: public directory not found! Run hugo build first.');
  process.exit(1);
}

// Copy the file
try {
  fs.copyFileSync(source, destination);
  console.log('✅ Custom 404 page copied successfully!');
} catch (error) {
  console.error('❌ Error copying 404 page:', error.message);
  process.exit(1);
}

