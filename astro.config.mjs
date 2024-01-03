import { defineConfig } from 'astro/config';
import solidJs from "@astrojs/solid-js";
import vercel from "@astrojs/vercel/serverless";
import tailwind from "@astrojs/tailwind";

import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  integrations: [solidJs(), tailwind(), icon()],
  output: "server",
  adapter: vercel({
    includeFiles: ['./src/data/busStopData.json']
  })
});