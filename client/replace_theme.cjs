const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const replacements = [
  { regex: /var\(--color-neon-blue\)/g, replacement: 'var(--color-primary-bright)' },
  { regex: /var\(--color-neon-purple\)/g, replacement: 'var(--color-primary-muted)' },
  { regex: /bg-\[#0f0c29\]/g, replacement: 'bg-[var(--color-bg-light)]' },
  { regex: /bg-\[#1a1625\]/g, replacement: 'bg-white' },
  { regex: /bg-\[#1a1a2e\]/g, replacement: 'bg-white' },
  { regex: /text-gray-300/g, replacement: 'text-gray-700' },
  { regex: /text-gray-400/g, replacement: 'text-gray-600' },
  // Careful with text-white, we might want to change it mostly to text-[var(--color-text-dark)]
  // but only outside of buttons or specific colored backgrounds.
  // Actually, replacing text-white with text-[var(--color-text-dark)] might be safe enough for most places
  // since neon-button usually explicitly sets text-white or uses a separate mechanism. Let's try it.
  { regex: /text-white/g, replacement: 'text-[var(--color-text-dark)]' },
  // Fix text-white inside neon-button if it got replaced
  { regex: /neon-button(.*?)text-\[var\(--color-text-dark\)\]/g, replacement: 'neon-button$1text-white' },
  // Other dark borders and backgrounds
  { regex: /border-white\/10/g, replacement: 'border-[var(--color-primary-muted)]/30' },
  { regex: /border-white\/20/g, replacement: 'border-[var(--color-primary-muted)]/30' },
  { regex: /border-white\/5/g, replacement: 'border-[var(--color-primary-muted)]/20' },
  { regex: /bg-white\/5/g, replacement: 'bg-[var(--color-primary-muted)]/5' },
  { regex: /bg-white\/10/g, replacement: 'bg-[var(--color-primary-muted)]/10' },
  { regex: /bg-white\/20/g, replacement: 'bg-[var(--color-primary-muted)]/20' },
  { regex: /bg-black\/80/g, replacement: 'bg-white/90' },
  { regex: /bg-black\/50/g, replacement: 'bg-white/50' },
];

function processDirectory(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx') && 
               !fullPath.includes('Home.jsx') && 
               !fullPath.includes('Navbar.jsx') && 
               !fullPath.includes('Footer.jsx') && 
               !fullPath.includes('AdminLayout.jsx') && 
               !fullPath.includes('AdminDashboard.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      replacements.forEach(({ regex, replacement }) => {
        content = content.replace(regex, replacement);
      });

      // Special case for neon-text which needs text-[var(--color-primary-bright)] instead of just shadow
      content = content.replace(/neon-text/g, 'neon-text text-[var(--color-primary-bright)]');
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  });
}

processDirectory(directoryPath);
console.log('Done replacing theme classes.');
