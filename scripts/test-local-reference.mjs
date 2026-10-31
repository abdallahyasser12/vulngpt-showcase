import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { repositoryRootFromScript, resolveLocalPath } from './lib/local-reference.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const originalCwd = process.cwd();
try {
  process.chdir(path.parse(root).root);
  assert.equal(
    repositoryRootFromScript(new URL('./validate-public-repo.mjs', import.meta.url)),
    root,
    'repository root is independent of the process working directory',
  );
} finally {
  process.chdir(originalCwd);
}

const cases = [
  ['/script.js', 'index.html', 'script.js'],
  ['/assets/bola%20finding.png', 'index.html', 'assets/bola finding.png'],
  ['../README.md', 'docs/README.md', 'README.md'],
  ['/script.js?v=1#app', 'index.html', 'script.js'],
];
for (const [target, fromFile, expected] of cases) {
  const result = resolveLocalPath(root, fromFile, target);
  assert.equal(result.error, null, target + ' should parse');
  assert.equal(result.insideRoot, true, target + ' should remain in the repository');
  assert.equal(path.relative(root, result.path).split(path.sep).join('/'), expected);
}

for (const target of ['/%', '/%ZZ', '/%E0%A4%A']) {
  assert.doesNotThrow(() => resolveLocalPath(root, 'index.html', target));
  const result = resolveLocalPath(root, 'index.html', target);
  assert.match(result.error ?? '', /invalid percent-encoding/);
  assert.equal(result.path, null);
}

for (const target of ['/../../outside.txt', '/%2e%2e/%2e%2e/outside.txt']) {
  const result = resolveLocalPath(root, 'index.html', target);
  assert.equal(result.error, null);
  assert.equal(result.insideRoot, false, target + ' must not escape the repository');
}

const nul = resolveLocalPath(root, 'index.html', '/bad%00name');
assert.equal(nul.path, null);
assert.match(nul.error ?? '', /NUL/);

console.log('Local reference resolver tests: PASSED.');
