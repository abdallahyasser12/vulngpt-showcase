import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Resolve the repository root from a script stored directly under scripts/. */
export function repositoryRootFromScript(scriptUrl) {
  return path.resolve(path.dirname(fileURLToPath(scriptUrl)), '..');
}

/**
 * Resolve a local URL reference without allowing malformed URL encoding or
 * path traversal to crash the caller or escape the repository root.
 *
 * `fromFile` is a repository-relative file path using `/` separators.
 * The result is `{ path, insideRoot, error }`; callers decide whether a
 * missing in-root path is an error for their particular check.
 */
export function resolveLocalPath(root, fromFile, rawTarget) {
  if (typeof rawTarget !== 'string') {
    return { path: null, insideRoot: false, error: 'reference must be a string' };
  }

  const encodedPath = rawTarget.split(/[?#]/, 1)[0];
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(encodedPath);
  } catch (error) {
    return {
      path: null,
      insideRoot: false,
      error: 'invalid percent-encoding (' + (error instanceof Error ? error.message : String(error)) + ')',
    };
  }

  if (decodedPath.includes('\0')) {
    return { path: null, insideRoot: false, error: 'reference contains a NUL byte' };
  }

  const absoluteRoot = path.resolve(root);
  let resolvedPath;
  try {
    resolvedPath = decodedPath.startsWith('/')
      ? path.resolve(absoluteRoot, '.' + decodedPath)
      : path.resolve(absoluteRoot, path.dirname(fromFile), decodedPath);
  } catch (error) {
    return {
      path: null,
      insideRoot: false,
      error: 'could not resolve path (' + (error instanceof Error ? error.message : String(error)) + ')',
    };
  }

  const relativePath = path.relative(absoluteRoot, resolvedPath);
  const insideRoot = relativePath === '' || (
    relativePath !== '..' &&
    !relativePath.startsWith('..' + path.sep) &&
    !path.isAbsolute(relativePath)
  );

  return { path: resolvedPath, insideRoot, error: null };
}
