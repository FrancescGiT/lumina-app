import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carga las variables de entorno desde el archivo .env
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    base: './', // Ruta relativa para que funcione en cualquier hosting (Vercel o GitHub Pages)
    define: {
      // Esto hace que process.env.API_KEY funcione en el navegador
      // mapeándolo a la variable VITE_API_KEY de tu archivo .env
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY),
    },
  };
});