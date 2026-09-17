const fs = require('fs');
const path = require('path');

function findJsxFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findJsxFiles(filePath, fileList);
    } else if (filePath.endsWith('.jsx')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const allFiles = findJsxFiles(path.join(__dirname, 'src'));
const libs = ['react-hot-toast', 'sonner', 'react-hot-toast'];

for (const file of allFiles) {
  if (file.includes('App.jsx') || file.includes('Register.jsx') || file.includes('main.jsx')) {
    continue;
  }
  
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes("import { toast } from 'react-toastify'") || content.includes('import { toast } from "react-toastify"')) {
    const lib = libs[Math.floor(Math.random() * libs.length)];
    content = content.replace(/import\s+{\s*toast\s*}\s+from\s+['"]react-toastify['"];?/g, `import { toast } from "${lib}";`);
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Replaced in ${file} with ${lib}`);
  }
}
