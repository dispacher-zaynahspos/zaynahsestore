const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      callback(dirPath);
    }
  });
}

const libDir = '/Users/shoaib/Desktop/Zaynahs e-store/lib';
const appDir = '/Users/shoaib/Desktop/Zaynahs e-store/app';

[libDir, appDir].forEach(targetDir => {
  walkDir(targetDir, filePath => {
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      let content = fs.readFileSync(filePath, 'utf8');
      const regex = /revalidateTag\(([^,)]+),\s*['"]max['"]\)/g;
      
      if (regex.test(content)) {
        console.log(`Fixing file: ${filePath}`);
        let updated = content.replace(regex, 'revalidateTag($1)');
        fs.writeFileSync(filePath, updated, 'utf8');
      }
    }
  });
});

console.log('Finished removing max argument in lib and app.');
