
const esbuild = require('esbuild');

// This script is run by the deployment service (e.g., Render)
// which populates process.env from the service's environment variables.
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  // We don't throw an error here to allow for local development setups
  // where the key might not be set, but we log a warning.
  // The runtime check in geminiService will still catch it if a user
  // tries to make an API call without a key.
  console.warn(`
    *******************************************************
    ** WARNING: GEMINI_API_KEY is not set at build time. **
    ** The application will fail if it tries to call the **
    ** Gemini API. Make sure this is set in your        **
    ** deployment environment.                           **
    *******************************************************
  `);
}

esbuild.build({
  entryPoints: ['index.tsx'],
  bundle: true,
  outfile: 'main.js',
  jsx: 'automatic',
  // Define will replace any instance of process.env.GEMINI_API_KEY in the code
  // with the actual string value of the key from the environment.
  // JSON.stringify is used to ensure the value is correctly quoted as a string literal.
  define: {
    'process.env.GEMINI_API_KEY': JSON.stringify(apiKey)
  },
}).catch((err) => {
    console.error("Build failed:", err);
    process.exit(1)
});
