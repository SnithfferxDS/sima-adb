import { defineConfig } from 'astro/config';

import db from '@astrojs/db';

import tailwind from '@astrojs/tailwind';

import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  integrations: [db(), tailwind()],
  output: 'server',

  adapter: node({
    mode: 'standalone',
  }),
});