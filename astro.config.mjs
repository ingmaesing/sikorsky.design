import { defineConfig } from 'astro/config';
import { themeIntegration } from '@sikorsky/site';
import themeConfig from './theme.config';
import { localTheme } from './scripts/local-theme.mjs';

const local = await localTheme();
export default defineConfig({
  integrations: [(local?.themeIntegration ?? themeIntegration)({ config: themeConfig })],
  vite: {
    ...local?.vite,
    ssr: { noExternal: ['firebase'] },
  },
});
