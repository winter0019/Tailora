
const esbuild = require('esbuild');

// The API key must be injected at build time to be available in the browser.
// We use esbuild's `define` feature to replace `process.env.API_KEY` in the code
// with the actual value from the build environment. This resolves the runtime
// "process is not defined" error in the browser.
esbuild.build({
  entryPoints: ['index.tsx'],
  bundle: true,
  outfile: 'main.js',
  jsx: 'automatic',
  define: {
    // JSON.stringify is used to ensure the value is a string literal in the bundle.
    // Default to an empty string if the API_KEY is not set. This allows the build
    // to succeed, and the application's runtime checks will handle the missing key.
    'process.env.API_KEY': JSON.stringify(process.env.GEMINI_API_KEY || '')
  },
}).catch((err) => {
    console.error("Build failed:", err);
    process.exit(1)
});