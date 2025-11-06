const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['index.tsx'],
  bundle: true,
  outfile: 'main.js',
  jsx: 'automatic',
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || ''),
  },
}).catch((err) => {
    console.error("Build failed:", err);
    process.exit(1)
});