import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          utils: ['axios']
        }
      }
    },
    sourcemap: false,
    // Use esbuild for faster builds (alternative to Terser)
    minify: 'esbuild',
    // Or if you want to use Terser specifically:
    // minify: 'terser',
    // terserOptions: {
    //   compress: {
    //     drop_console: true,
    //     drop_debugger: true
    //   }
    // }
  },
  server: {
    headers: {
      'Cache-Control': 'no-cache'
    }
  },
  // Ensure dependencies are pre-bundled
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios']
  }
});
