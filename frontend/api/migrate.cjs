const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'routes');
const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.ts'));

files.forEach(file => {
  const filePath = path.join(routesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace import
  content = content.replace(/from '\.\.\/db\/store';/g, "from '../_lib/store_mongo';");

  // Make all route handlers async
  content = content.replace(/router\.(get|post|put|delete)\('([^']+)',\s*(authenticate,)?\s*(authorize\([^)]+\),\s*)?(async\s+)?\(req/g, 
    (match, method, route, auth, authz, isAsync) => {
      if (isAsync) return match;
      return match.replace('(req', 'async (req');
    });

  // Replace store.METHOD() with await store.METHOD() if not already awaited
  content = content.replace(/([^a-zA-Z0-9_])store\./g, (match, prefix) => {
    if (prefix === 't') return match; // in case of 'await store.'
    return prefix + 'await store.';
  });
  
  // Fix cases where it double await like `await await store.`
  content = content.replace(/await\s+await\s+store/g, 'await store');

  fs.writeFileSync(filePath, content);
  console.log(`Migrated ${file}`);
});
