const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const buttonRegex = /<button[^>]*>([\s\S]*?)<\/button>/gi;
const ariaLabelRegex = /aria-label=/i;
const hasTextRegex = /[a-zA-Z0-9]+/;

let found = 0;

walkDir('c:/Users/user/Documents/Internships/Circle Orange Internship/axion-circle/frontend/src', function(filePath) {
  if (filePath.endsWith('.jsx')) {
    const content = fs.readFileSync(filePath, 'utf8');
    let match;
    const lines = content.split('\n');
    
    // We will just find <button manually to track line numbers
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      if (line.includes('<button') && !line.includes('aria-label')) {
         // Check if it has text on the same line or if we need to look ahead
         // It's a rough heuristic but will give us a good list
         let hasText = false;
         let closeTagLine = i;
         let btnContent = '';
         for (let j = i; j < Math.min(i + 15, lines.length); j++) {
            btnContent += lines[j];
            if (lines[j].includes('</button>')) {
               closeTagLine = j;
               break;
            }
         }
         
         // strip tags from btnContent
         const textOnly = btnContent.replace(/<[^>]*>/g, '').trim();
         
         // if there is no alphanumeric text inside, it's an icon button
         if (textOnly.length === 0 || textOnly.match(/^[{} \n\t]+$/) || (textOnly.includes('{') && !textOnly.match(/[a-zA-Z]/))) {
             if (btnContent.includes('<button') && !btnContent.includes('aria-label')) {
                 console.log(`${filePath}:${i+1}`);
                 console.log(`Content: ${textOnly}`);
                 found++;
             }
         }
      }
    }
  }
});
console.log(`Found ${found} potential icon-only buttons without aria-label.`);
