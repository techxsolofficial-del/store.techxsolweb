const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

async function build() {
  const distDir = path.join(__dirname, 'dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  const commonConfig = {
    entryPoints: [path.join(__dirname, 'src', 'server.ts')],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    footer: {
      js: 'module.exports = server_default; module.exports.default = server_default;',
    },
    external: ['pg-native'],
  };

  const targets = [
    path.join(distDir, 'server.js'),
    path.join(distDir, 'app.js'),
    path.join(distDir, 'index.js'),
    path.join(__dirname, 'index.js'),
  ];

  for (const outfile of targets) {
    await esbuild.build({ ...commonConfig, outfile });
  }

  console.log('[api-build] Successfully compiled and bundled API targets (CommonJS)');
}

build().catch((err) => {
  console.error('[api-build] Build failed:', err);
  process.exit(1);
});

