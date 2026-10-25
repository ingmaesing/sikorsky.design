import { readFile, mkdir, lstat, readlink, symlink, unlink } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { loadConfigFromFile, searchForWorkspaceRoot } from 'vite';

export async function localTheme() {
  const directory = process.env.SIKORSKY_THEME_DIR;
  if (!directory) return null;
  if (process.env.CI || process.env.NODE_ENV === 'production') {
    throw new Error('SIKORSKY_THEME_DIR is development-only; unset it for production builds and CI.');
  }
  const root = resolve(directory);
  const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
  if (pkg.name !== '@sikorsky/site') throw new Error(`Expected @sikorsky/site at ${root}`);
  const loaded = await loadConfigFromFile({ command: 'serve', mode: 'development' }, join(root, 'dev.config.ts'));
  if (typeof loaded?.config.themeIntegration !== 'function') throw new Error(`Missing local theme integration at ${root}`);
  // Keep Astro 4's virtual component IDs under the site root. The link lives
  // in Astro's ignored cache, never in node_modules or a dependency manifest.
  const cache = resolve('.astro');
  const linked = join(cache, 'local-theme');
  await mkdir(cache, { recursive: true });
  let existing;
  try { existing = await lstat(linked); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (existing && !existing.isSymbolicLink()) throw new Error(`Refusing to replace non-symlink ${linked}`);
  if (existing && await readlink(linked) !== root) { await unlink(linked); existing = null; }
  if (!existing) await symlink(root, linked, 'dir');
  return {
    themeIntegration: loaded.config.themeIntegration,
    vite: {
      resolve: {
        preserveSymlinks: true,
        alias: [
          { find: '@sikorsky/site/styles', replacement: join(linked, 'src/styles/global.css') },
          { find: '@sikorsky/site/fonts', replacement: join(linked, 'src/fonts/Inter/inter.css') },
          { find: /^@sikorsky\/site\/(components|utils|lib)\/(.*)$/, replacement: `${linked}/src/$1/$2` },
          { find: /^@sikorsky\/site$/, replacement: join(linked, 'src/index.ts') },
        ],
        dedupe: ['astro', 'firebase'],
      },
      server: { strictPort: true, fs: { allow: [searchForWorkspaceRoot(process.cwd()), root] } },
    },
  };
}
