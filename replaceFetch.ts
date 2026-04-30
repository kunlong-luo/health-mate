import fs from 'fs';
import path from 'path';

function walk(dir: string, callback: (path: string) => void) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? 
      walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

const fixImports = (folder: string) => {
  walk(folder, function(filePath) {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      let content = fs.readFileSync(filePath, 'utf8');
      if (content.includes("import { apiFetch }")) {
           content = content.replace(/import\s+\{\s*apiFetch\s*\}\s+from\s+[^;]+;\n/g, '');
           
           // calculate correct relative path
           // e.g. src/components/home/CareReminders.tsx
           // split -> src, components, home, CareReminders.tsx
           // depth = number of folders - 1 
           // length = 4. folders = 3. We need to go up 2 times to reach src: ../../
           const parts = filePath.split(path.sep);
           // parts[0] is src, parts[1] is components or pages, ..., parts[n-1] is filename
           const upCount = parts.length - 2; 
           let relativePath = '';
           if (upCount === 0) relativePath = './lib/api';
           else {
               relativePath = '../'.repeat(upCount) + 'lib/api';
           }
           content = `import { apiFetch } from '${relativePath}';\n` + content;
           fs.writeFileSync(filePath, content);
      }
    }
  });
};

fixImports('./src/pages');
fixImports('./src/components');
fixImports('./src/context');
