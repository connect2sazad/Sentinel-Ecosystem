import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve('sentinel-auth/frontend/src');
const specs = [
 ['context/AuthContext.jsx', 'AuthContext', 'useAuth', 'auth-context.js'],
 ['theme/ThemeProvider.jsx', 'ThemeContext', 'useTheme', 'theme-context.js'],
 ['celebrations/CelebrationProvider.jsx', 'CelebrationContext', 'useCelebration', 'celebration-context.js']
];
for (const [relative, context, hook, target] of specs) {
 const file = path.join(root, relative);
 let source = fs.readFileSync(file, 'utf8').replaceAll('\r\n', '\n');
 const hookStart = source.indexOf(`export const ${hook} =`);
 const hookSource = source.slice(hookStart);
 source = source.slice(0, hookStart).replace(/    createContext,\n/, '').replace(/    useContext,\n/, '');
 source = source.replace(`const ${context} =\n    createContext(null);`, `import { ${context} } from "./${target}";`);
 fs.writeFileSync(file, source);
 fs.writeFileSync(path.join(path.dirname(file), target), `import { createContext, useContext } from "react";\n\nexport const ${context} = createContext(null);\n\n${hookSource}`);
 function visit(dir) {
  for (const entry of fs.readdirSync(dir, {withFileTypes:true})) {
   const current = path.join(dir, entry.name);
   if (entry.isDirectory()) visit(current);
   else if (current.endsWith('.jsx') && current !== file) {
    let text = fs.readFileSync(current, 'utf8');
    if (text.includes(hook)) {
     text = text.replaceAll(path.basename(relative), target);
     fs.writeFileSync(current, text);
    }
   }
  }
 }
 visit(root);
}
