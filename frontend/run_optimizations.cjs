const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;
    const filename = path.basename(filePath, '.jsx');
    const isPage = filePath.includes(path.join('src', 'pages'));

    // 1. Add loading="lazy" to <img>
    content = content.replace(/<img(?![^>]*\b(loading|fetchpriority)=)[^>]*>/g, (match) => {
        return match.replace('<img ', '<img loading="lazy" ');
    });

    // 2. Add rel="noopener noreferrer" to target="_blank"
    content = content.replace(/<(a|Link)[^>]*target="_blank"[^>]*>/g, (match) => {
        if (!match.includes('rel=')) {
            return match.replace('target="_blank"', 'target="_blank" rel="noopener noreferrer"');
        }
        return match;
    });

    // 3. Ensure alt attribute on <img>
    content = content.replace(/<img(?![^>]*\balt=)[^>]*>/g, (match) => {
        return match.replace('<img ', '<img alt="image" ');
    });

    // 4. Inject SEO to pages
    if (isPage && !content.includes('<SEO')) {
        const importLevel = filePath.includes(path.join('src', 'pages', 'admin')) || filePath.includes(path.join('src', 'pages', 'settings')) ? '../../components/SEO' : '../components/SEO';
        
        // Add import
        if (!content.includes('import SEO from')) {
            const lastImportIndex = content.lastIndexOf('import ');
            if (lastImportIndex !== -1) {
                const endOfLastImport = content.indexOf('\n', lastImportIndex);
                content = content.slice(0, endOfLastImport) + `\nimport SEO from '${importLevel}';` + content.slice(endOfLastImport);
            }
        }

        // Add SEO component
        const title = filename.replace('Page', '').replace(/([A-Z])/g, ' $1').trim();
        const returnMatch = content.match(/return\s*\(\s*(<[a-zA-Z0-9_]+[^>]*>|<>)/);
        if (returnMatch) {
            const insertPos = returnMatch.index + returnMatch[0].length;
            content = content.slice(0, insertPos) + `\n        <SEO title="${title}" />` + content.slice(insertPos);
        }
    }

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Updated ${path.relative(__dirname, filePath)}`);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            processFile(fullPath);
        }
    }
}

walkDir(srcDir);
console.log('Optimization script completed.');
