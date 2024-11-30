import { defineConfig } from 'astro/config';

import db from '@astrojs/db';

import tailwind from '@astrojs/tailwind';

import node from '@astrojs/node';

import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  integrations: [db(), tailwind()],
  output: 'server',

  server: {
    host: true,
    hostName: 'localhost',
    baseUrl: '/',
  },

  adapter: netlify(),
});