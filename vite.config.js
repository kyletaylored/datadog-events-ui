import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const SITES = [
  'datadoghq.com',
  'us3.datadoghq.com',
  'us5.datadoghq.com',
  'ap1.datadoghq.com',
  'datadoghq.eu',
  'ddog-gov.com',
];

const proxy = {};

SITES.forEach(site => {
  // API Proxy
  proxy[`/proxy/${site}/api`] = {
    target: `https://api.${site}`,
    changeOrigin: true,
    rewrite: (path) => path.replace(new RegExp(`^/proxy/${site}/api`), '')
  };

  // Intake Proxy
  proxy[`/proxy/${site}/intake`] = {
    target: `https://event-management-intake.${site}`,
    changeOrigin: true,
    rewrite: (path) => path.replace(new RegExp(`^/proxy/${site}/intake`), '')
  };
});

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? '/datadog-events-ui/' : '/',
  server: {
    proxy
  }
}))
