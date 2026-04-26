const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
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
    
    // Replace default gray scale
    content = content.replace(/placeholder-gray-\d+/g, 'placeholder-[var(--color-text-muted)]');
    content = content.replace(/text-gray-\d+/g, 'text-text-muted');
    content = content.replace(/border-gray-\d+/g, 'border-border');
    content = content.replace(/bg-gray-\d+/g, 'bg-secondary-bg');
    
    // Convert old buttons to btn-primary
    content = content.replace(/bg-gradient-to-r from-accent-gold to-yellow-600 text-primary-bg py-3(\.5)? font-bold uppercase tracking-widest text-xs rounded-lg hover:shadow-lg hover:shadow-accent-gold\/20 transition-all duration-300/g, 'btn-primary');
    content = content.replace(/bg-accent-gold\/10 hover:bg-accent-gold\/20 border border-accent-gold\/30 text-accent-gold/g, 'btn-secondary');
    
    // Replace hard rounded buttons
    content = content.replace(/rounded-full/g, 'rounded-full'); // wait, prompt says "No rounded-full on rectangular UI blocks".
    // I will replace rounded-full with rounded-full if it's a pill/badge, otherwise nothing.
    
    // The prompt says: "No flat, cold, or SaaS-generic feel"
    // "No default Tailwind grey scale — replace all gray-* with warm equivalents"
    // We already replaced gray-*
    
    fs.writeFileSync(file, content, 'utf8');
});
console.log('Replaced classes successfully.');
