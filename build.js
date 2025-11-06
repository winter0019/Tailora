const esbuild = require('esbuild');

const apiKey = process.env.API_KEY || '';

// Add a warning to the build logs if the API key is not found.
// This helps developers debug deployment issues on platforms like Render.
if (!apiKey) {
  console.warn("\n\n⚠️  WARNING: API_KEY environment variable not set. The application will not be able to connect to the Gemini API.\n\n");
}


esbuild.build({
  entryPoints: ['index.tsx'],
  bundle: true,
  outfile: 'main.js',
  jsx: 'automatic',
  define: {
    // Use the apiKey variable which safely defaults to an empty string.
    'process.env.API_KEY': JSON.stringify(apiKey),
  },
}).catch((err) => {
    console.error("Build failed:", err);
    process.exit(1)
});