import { defineConfig } from 'vite';

export default defineConfig({
  root: '', // Define the new root folder
  build: {
    outDir: './dist', // Exit path (relative to new root)
    rollupOptions: {
      input: {
        main: './src/pages/index.html',
        // You can add other HTML files here if needed
      }
    }
  },
  plugins: [
    {
      name: 'watch-external',
      async buildStart(){
        // Copy new files added to public/ into dist/
        this.addWatchFile('public');
      }
    }
  ]
});
