# salus-ui

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## Percy visual testing

This project includes a simple Percy runner that builds the app, serves the production `dist` folder and takes visual snapshots using Puppeteer + @percy/puppeteer.

Setup

1. Install dev dependencies:

```
npm install
```

2. Set your Percy token in the environment:

Windows PowerShell:

```
$env:PERCY_TOKEN = "<your-percy-token>"
```

3. Run the Percy runner:

```
npm run percy:run
```

Notes:
- The runner snapshots a small set of routes defined in `percy/run-percy.clean.js` (the script invoked by `npm run percy:run`). Adjust as needed.

CI / GitHub Actions
-------------------

You can run Percy automatically on pull requests by adding your Percy token to the repository secrets (Settings → Secrets → Actions → New repository secret) as `PERCY_TOKEN`.

This repository includes a sample workflow at `.github/workflows/percy.yml` which will run `npm run percy:run` on PRs. Make sure the `PERCY_TOKEN` secret is set for the workflow to upload snapshots to your Percy project. If the secret is not set the workflow will still attempt to create snapshots but they won't be uploaded.

