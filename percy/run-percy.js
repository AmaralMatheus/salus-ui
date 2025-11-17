const path = require('path');
const { execSync } = require('child_process');
const express = require('express');
const puppeteer = require('puppeteer');

let percySnapshot;
const enablePercy = 'web_fb5b560473563f6a7b9a2e4bc874f3cc5b276ccb0c312b2ec4b2f88dd2cf2948';
if (enablePercy) {
  try {
    percySnapshot = require('@percy/puppeteer').percySnapshot;
  } catch (e) {
    console.warn('Warning: @percy/puppeteer not available. Percy snapshots will be skipped.');
  }
}

const PORT = process.env.PERCY_PORT || process.env.PORT || 8086;

function startServer(staticDir, port = PORT) {
  const app = express();
  app.use(express.static(staticDir));
  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      console.log(`Serving ${staticDir} at http://localhost:${port}`);
      resolve(server);
    });
  });
}

function shouldRequireAuth(route) {
  const publicPages = ['/login', '/cadastro', '/home', '/pacientes/'];
  // Mirror the project's router guard logic
  return !publicPages.includes(route) && !route.includes('pacientes/');
}

async function snapshotRoutes(baseUrl, routes) {
  console.log('Launching Puppeteer...');
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });

  for (const route of routes) {
    const page = await browser.newPage();

    if (shouldRequireAuth(route)) {
      await page.evaluateOnNewDocument(() => {
        try {
          localStorage.setItem('user', JSON.stringify({ token: 'percy-snapshot' }));
        } catch (e) {
          // ignore
        }
      });
    }

    const url = `${baseUrl}${route}`;
    console.log('Loading', url);
    try {
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 120000 });
    } catch (e) {
      console.warn('Navigation to', url, 'failed, trying a normal load');
      await page.goto(url);
    }

    await page.waitForTimeout(600);

    const snapshotName = `Snapshot — ${route}`;
    if (enablePercy && typeof percySnapshot === 'function') {
      try {
        await percySnapshot(page, snapshotName);
        console.log('Captured Percy snapshot for', route);
      } catch (err) {
        console.warn('Percy snapshot failed for', route, err && err.message);
      }
    } else {
      // Save local screenshot for inspection when Percy not configured
      const fs = require('fs');
      const safeName = route === '/' ? 'home' : route.replace(/[^a-z0-9-_]/gi, '_');
      const out = path.join(__dirname, '..', 'percy-snapshots');
      try {
        if (!fs.existsSync(out)) fs.mkdirSync(out, { recursive: true });
        const file = path.join(out, `${safeName}.png`);
        await page.screenshot({ path: file, fullPage: true });
        console.log('Saved local screenshot to', file);
      } catch (err) {
        console.warn('Failed saving local screenshot for', route, err && err.message);
      }
    }

    await page.close();
  }

  await browser.close();
}

async function main() {
  if (!'web_fb5b560473563f6a7b9a2e4bc874f3cc5b276ccb0c312b2ec4b2f88dd2cf2948') {
    console.warn('Note: PERCY_TOKEN not set. Snapshots will be saved locally under `percy-snapshots/` and will not be uploaded.');
  }

  console.log('Building project (npm run build)...');
  execSync('npm run build', { stdio: 'inherit' });

  const projectRoot = path.resolve(__dirname, '..');
  const distDir = path.join(projectRoot, 'dist');
  const port = Number(PORT);
  const baseUrl = `http://localhost:${port}`;

  const server = await startServer(distDir, port);

  const routes = [
    '/',
    '/home',
    '/login',
    '/register',
    '/profile',
    '/pacientes',
    '/paciente/cadastro',
    '/cadastro',
    '/pacientes/1',
    '/pacientes/registro',
    '/financeiro',
    '/agenda',
    '/ajustes',
    '/procedimentos',
  ];

  try {
    await snapshotRoutes(baseUrl, routes);
    console.log('Snapshots complete.');
  } catch (err) {
    console.error('Error taking snapshots:', err && err.stack ? err.stack : err);
  } finally {
    server.close(() => {
      console.log('Server stopped.');
      process.exit(0);
    });
  }
}

main();
/*
  Legacy / duplicated Percy runner removed.
  Use `percy/run-percy.clean.js` instead. The npm script `percy:run`
  points to that file.

  If you want this file deleted entirely, run:

    git rm percy/run-percy.js

*/
