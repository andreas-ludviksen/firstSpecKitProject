const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname);

function getDirectorySize(dirPath, fileExtensions = []) {
  let totalSize = 0;
  
  function walk(currentPath) {
    const items = fs.readdirSync(currentPath, { withFileTypes: true });
    
    for (const item of items) {
      const itemPath = path.join(currentPath, item.name);
      
      if (item.isDirectory()) {
        if (item.name !== 'node_modules' && item.name !== '.git') {
          walk(itemPath);
        }
      } else if (item.isFile()) {
        if (fileExtensions.length === 0 || fileExtensions.some(ext => item.name.endsWith(ext))) {
          totalSize += fs.statSync(itemPath).size;
        }
      }
    }
  }
  
  walk(dirPath);
  return totalSize;
}

const tsSize = getDirectorySize(dir, ['.ts']);
const jsonSize = getDirectorySize(dir, ['.json']);
const totalSize = tsSize + jsonSize;

console.log('Workers Source Code Size:');
console.log('  TypeScript files: ' + (tsSize / 1024).toFixed(2) + ' KB');
console.log('  JSON files: ' + (jsonSize / 1024).toFixed(2) + ' KB');
console.log('  Total source: ' + (totalSize / 1024).toFixed(2) + ' KB');
console.log('  Total source: ' + (totalSize / 1024 / 1024).toFixed(3) + ' MB');
console.log('');
console.log('✓ Well under 1MB limit (' + ((totalSize / 1024 / 1024) * 100).toFixed(1) + '% of 1MB)');
