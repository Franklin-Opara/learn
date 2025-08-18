// copy-static-html.js
// Copies all HTML files from src/html to dist after build

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'html');
const distDir = path.join(__dirname, 'dist');

function copyHtmlFiles(src, dest) {
  if (!fs.existsSync(src)) return;
  const files = fs.readdirSync(src);
  files.forEach(file => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    if (fs.statSync(srcPath).isDirectory()) {
      if (!fs.existsSync(destPath)) fs.mkdirSync(destPath);
      copyHtmlFiles(srcPath, destPath);
    } else if (file.endsWith('.html')) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied: ${srcPath} -> ${destPath}`);
    }
  });
}

copyHtmlFiles(srcDir, distDir);
