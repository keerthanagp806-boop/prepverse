const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'routes');
const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.ts'));

files.forEach(file => {
  const filePath = path.join(routesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix logAction -> addAuditLog
  content = content.replace(/await store\.logAction\(([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+)(?:,\s*([^)]+))?\);/g, 
    "await store.addAuditLog({ userId: $1, userName: $2, role: $3, action: $4, resourceType: $5, resourceId: $6, details: $7 });"
  );
  
  content = content.replace(/await store\.logAction\(([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^)]+)\);/g, 
    "await store.addAuditLog({ userId: $1, userName: $2, role: $3, action: $4, resourceType: $5 });"
  );

  // Fix implicit any
  content = content.replace(/q =>/g, '(q: any) =>');
  content = content.replace(/tc =>/g, '(tc: any) =>');
  content = content.replace(/s =>/g, '(s: any) =>');
  content = content.replace(/rs =>/g, '(rs: any) =>');
  
  // Fix arguments for startAssessmentAttempt and submitAttempt
  content = content.replace(/store\.startAssessmentAttempt\(([^,]+),\s*([^)]+)\)/g, "store.startAssessmentAttempt($2)");

  fs.writeFileSync(filePath, content);
  console.log(`Fixed logAction and implicit any in ${file}`);
});
