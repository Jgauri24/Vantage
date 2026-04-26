const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        if (fs.statSync(file).isDirectory()) { 
            results = results.concat(walk(file));
        } else if (file.endsWith('.jsx')) { 
            results.push(file);
        }
    });
    return results;
}

const files = walk('./src');
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace text-accent-gold (too light) with the deeper hover variant
    content = content.replace(/text-accent-gold/g, 'text-[var(--color-accent-gold-hover)]');
    
    // Replace hover:text-white (invisible on light bg) with dark text
    content = content.replace(/hover:text-white/g, 'hover:text-[var(--color-text-main)]');
    
    // Replace gradient text in Dashboard that uses white
    content = content.replace(/from-white to-\[var\(--color-text-muted\)]/g, 'from-[var(--color-accent-gold-hover)] to-[var(--color-text-main)]');
    content = content.replace(/from-white to-gray-400/g, 'from-[var(--color-accent-gold-hover)] to-[var(--color-text-main)]');
    content = content.replace(/from-white to-text-muted/g, 'from-[var(--color-accent-gold-hover)] to-[var(--color-text-main)]');

    // Make Login/Register cards stand out by replacing the transparent class with the solid premium card
    content = content.replace(/bg-secondary-bg\/50 backdrop-blur-xl border border-border p-8 rounded-2xl shadow-2xl/g, 'card-premium max-w-[400px] w-full mx-auto');

    fs.writeFileSync(file, content, 'utf8');
});
console.log('Contrast fixed.');
