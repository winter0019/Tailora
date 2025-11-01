
const esbuild = require('esbuild');

// We've removed the `define` option for `process.env.API_KEY`.
// The previous implementation statically injected the API key at build time,
// which is incompatible with the application's runtime key selection feature
// (`window.aistudio.openSelectKey()`). By removing the `define`, we allow the
// execution environment (e.g., Google AI Studio) to provide the `process.env.API_KEY`
// variable dynamically at runtime, ensuring that the user-selected key is always used.
esbuild.build({
  entryPoints: ['index.tsx'],
  bundle: true,
  outfile: 'main.js',
  jsx: 'automatic',
}).catch((err) => {
    console.error("Build failed:", err);
    process.exit(1)
});