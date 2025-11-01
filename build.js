
const esbuild = require('esbuild');

// The API key is now expected to be available in the runtime environment
// as `process.env.API_KEY`, so we no longer need to inject it at build time.
// This aligns with standard practices for handling secrets.

esbuild.build({
  entryPoints: ['index.tsx'],
  bundle: true,
  outfile: 'main.js',
  jsx: 'automatic',
}).catch((err) => {
    console.error("Build failed:", err);
    process.exit(1)
});