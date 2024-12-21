import { defineConfig } from 'astro/config';

import db from '@astrojs/db';

import tailwind from '@astrojs/tailwind';

import node from '@astrojs/node';

import netlify from '@astrojs/netlify';
import { options } from '@astrojs/check/dist/options';

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

  // experimental: {
  //   responsiveImages: true,
  //   adapter: netlify(),
  //   session: {
  //     driver: "netlify-blobs",
  //     options: {
  //       name: 'astro-session',
  //       consistency: 'strong',
  //       deployScoped: true,
  //     }
  //     // Required: the name of the Unstorage driver
  //     //driver: "fs",
  //   },
  // },
});