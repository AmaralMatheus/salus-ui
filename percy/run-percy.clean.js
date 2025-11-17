const path = require('path');
const { execSync } = require('child_process');
const express = require('express');
const puppeteer = require('puppeteer');

let percySnapshot;
const enablePercy = !!process.env.PERCY_TOKEN;
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
  // helper to save a local screenshot fallback
  const saveLocalScreenshot = async (p, routeName) => {
    const fs = require('fs');
    const safeName = routeName === '/' ? 'home' : routeName.replace(/[^a-z0-9-_]/gi, '_');
    const out = path.join(__dirname, '..', 'percy-snapshots');
    try {
      if (!fs.existsSync(out)) fs.mkdirSync(out, { recursive: true });
      const file = path.join(out, `${safeName}.png`);
      await p.screenshot({ path: file, fullPage: true });
      console.log('Saved local screenshot to', file);
    } catch (err) {
      console.warn('Failed saving local screenshot for', routeName, err && err.message);
    }
  };

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
        // Common failure: Percy agent not injected or incompatible versions
        const msg = err && err.message ? err.message : String(err);
        console.warn('Percy snapshot failed for', route, msg);
        if (/PercyAgent|Percy Agent|PercyAgent is not defined/i.test(msg)) {
          console.warn('It looks like the Percy agent is not available in this process.\n' +
            "Make sure you run the script with 'percy exec -- npm run percy:local' or set PERCY_TOKEN and run 'percy exec -- npm run percy:run'.\n" +
            'Also check that @percy/cli and @percy/puppeteer versions are compatible. Falling back to saving a local screenshot.');
        }
        await saveLocalScreenshot(page, route);
      }
    } else {
      // Percy not enabled: save a local screenshot for inspection
      await saveLocalScreenshot(page, route);
    }

    await page.close();
  }

  await browser.close();
}

async function main() {
  if (!process.env.PERCY_TOKEN) {
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
