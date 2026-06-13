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
      
      // Matches: revalidateTag(something) or revalidateTag(something, 'max')
      // but NOT (revalidateTag as any)(something)
      const regex = /(?<!as any\)\()revalidateTag\(([^,)]+)(?:,\s*['"]max['"])?\)/g;
      
      if (regex.test(content)) {
        console.log(`Fixing file: ${filePath}`);
        // Reset regex index before replace
        regex.lastIndex = 0;
        let updated = content.replace(regex, '(revalidateTag as any)($1)');
        fs.writeFileSync(filePath, updated, 'utf8');
      }
    }
  });
});

console.log('Finished casting revalidateTag.');
