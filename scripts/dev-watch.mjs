import chokidar from 'chokidar';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';

function usage() {
  console.log('Usage: npm run dev -- <path/to/config.json>');
  console.log('Example: npm run dev -- configs/cv-config.example.json');
}

function getNpmCommand() {
  return process.platform === 'win32' ? 'npm.cmd' : 'npm';
}

const argv = process.argv.slice(2);
if (argv.length === 0) {
  usage();
  process.exit(1);
}

// Accept either: `npm run dev -- path.json` or `npm run dev -- --config path.json`
let configPathArg = argv[0];
if (argv[0] === '--config' && argv[1]) configPathArg = argv[1];

const configPath = resolve(process.cwd(), configPathArg);
if (!existsSync(configPath)) {
  console.error(`Config file not found: ${configPath}`);
  usage();
  process.exit(1);
}

let child = null;
let running = false;
let queued = false;
let debounceTimer = null;

function trigger(reason) {
  if (running && !queued) {
    console.log(`[dev] Change detected (${reason}) while cv is running; will re-run after it finishes.`);
  }
  queued = true;
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    runIfNeeded(reason);
  }, 200);
}

function runIfNeeded(reason) {
  if (!queued) return;
  if (running) return;

  queued = false;
  running = true;

  console.log(`\n[dev] Detected change (${reason}). Running: npm run cv -- --config "${configPathArg}"`);

  const npmCmd = getNpmCommand();
  child = spawn(npmCmd, ['run', 'cv', '--', '--config', configPathArg], {
    stdio: 'inherit',
    shell: false,
    env: process.env,
  });

  child.on('exit', (code, signal) => {
    running = false;
    child = null;

    if (signal) {
      console.log(`[dev] cv process exited due to signal: ${signal}`);
    } else if (code === 0) {
      console.log('[dev] cv finished successfully.');
    } else {
      console.log(`[dev] cv exited with code ${code}.`);
    }

    // If changes happened while we were running, run once more.
    if (queued) runIfNeeded('queued change while running');
  });
}

console.log(`[dev] Watching JSON config: ${configPath}`);
console.log('[dev] Press Ctrl+C to stop.');

// Important: keep watch targets relative, with an explicit cwd.
// This avoids edge cases with mixed absolute + glob patterns.
// Prefer watching directories (more robust than globs across editors/atomic saves).
const watchTargets = [configPathArg, 'src', 'tailwind.config.js'];

console.log(`[dev] Also watching code paths: ${watchTargets.slice(1).join(', ')}`);

const debug = process.env.CV_DEV_WATCH_DEBUG === '1';
const usePolling = process.env.CV_DEV_WATCH_POLL === '1';

if (usePolling) {
  console.log('[dev] Polling enabled (CV_DEV_WATCH_POLL=1).');
}
if (debug) {
  console.log('[dev] Debug logging enabled (CV_DEV_WATCH_DEBUG=1).');
}

const watcher = chokidar.watch(watchTargets, {
  ignoreInitial: true,
  cwd: process.cwd(),
  usePolling,
  ignored: [
    '**/node_modules/**',
    '**/.browsers/**',
    'dist/**',
    // Generated artefacts (avoid rebuild loops)
    'src/render/tailwind.css',
    '**/*.pdf',
  ],
  awaitWriteFinish: { stabilityThreshold: 250, pollInterval: 50 },
});

watcher.on('ready', () => {
  console.log('[dev] Watcher ready.');
});

watcher.on('all', (event, changedPath) => {
  if (debug) console.log(`[dev][event] ${event}: ${changedPath}`);

  // When the config is removed, don't run cv (it will just error).
  if ((event === 'unlink' || event === 'unlinkDir') && changedPath === configPathArg) {
    console.log(`[dev] Config file was deleted: ${configPath}`);
    console.log('[dev] Waiting for it to be recreated...');
    return;
  }

  // Covers atomic saves (often show up as unlink+add), plus normal changes.
  if (event === 'add' || event === 'change' || event === 'unlink' || event === 'addDir' || event === 'unlinkDir') {
    trigger(`${event}: ${changedPath}`);
  }
});
watcher.on('error', (err) => {
  console.error('[dev] Watcher error:', err);
});

// Run once at startup so dev mode is useful immediately.
trigger('initial run');

function shutdown() {
  console.log('\n[dev] Shutting down...');
  watcher.close().catch(() => {});
  if (child) child.kill('SIGTERM');
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
