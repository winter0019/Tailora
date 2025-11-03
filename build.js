const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['index.tsx'],
  bundle: true,
  outfile: 'main.js',
  jsx: 'automatic',
  define: {
    // ✅ Replace GEMINI_API_KEY directly, not API_KEY
    'process.env.GEMINI_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY || ''),
  },
}).catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
