const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['index.tsx'],
  bundle: true,
  outfile: 'main.js',
  jsx: 'automatic',
}).catch((err) => {
    console.error("Build failed:", err);
    process.exit(1)
});