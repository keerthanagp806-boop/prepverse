const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'routes');
const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.ts'));

files.forEach(file => {
  const filePath = path.join(routesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix void -> Promise<void>
  content = content.replace(/async\s+\(req.*?\):\s*void\s*=>/g, (match) => {
    return match.replace('void', 'Promise<void>');
  });

  // Fix req.params.id type errors (adding as string)
  content = content.replace(/req\.params\.[a-zA-Z0-9_]+/g, (match) => {
    return `(${match} as string)`;
  });

  fs.writeFileSync(filePath, content);
  console.log(`Fixed ${file}`);
});
