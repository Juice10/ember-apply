import fs from 'fs/promises';
import path, { dirname } from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { execa } from 'execa';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function newTmpDir() {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), `ember-apply-${Date.now()}-`));

  return tmpDir;
}

export async function newEmberApp() {
  let dir = await newTmpDir();

  await execa('ember', ['new', 'test-app', '--skip-npm'], {
    cwd: dir,
  });

  return path.join(dir, 'test-app');
}

export async function newEmberAddon() {
  let dir = await newTmpDir();

  await execa('ember', ['addon', 'test-addon', '--skip-npm'], {
    cwd: dir,
  });

  return path.join(dir, 'test-addon');
}

/**
 * @param {string} appPath the app to apply the applyable to
 * @param {string} applyablePath the path to the applyable
 */
export async function apply(appPath, applyablePath) {
  let cli = path.join(__dirname, 'cli/index.js');
  let target = applyablePath.startsWith('@') ? applyablePath : path.resolve(applyablePath);

  await execa('node', [cli, '--verbose', target], {
    cwd: appPath,
    stdio: process.env.DEBUG ? 'inherit' : undefined,
  });
}

/**
 * @param {string} appPath the path to git diff
 */
export async function diffSummary(appPath) {
  let { stdout } = await execa('git', ['diff', '--compact-summary'], {
    cwd: appPath,
  });

  return stdout;
}

/**
 * @param {string} appPath the path to git diff
 */
export async function diff(appPath) {
  let { stdout } = await execa('git', ['diff'], {
    cwd: appPath,
  });

  return stdout;
}