import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://leaguehub.eeracing.com/',
  output: 'static',
  trailingSlash: 'never',
  integrations: [sitemap()],
});
