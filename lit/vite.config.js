import { defineConfig } from 'vite';
import fg from 'fast-glob';


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
      name: 'watch-external', // https://stackoverflow.com/questions/63373804/rollup-watch-include-directory/63548394#63548394
      async buildStart(){
        const files = await fg(['src/**/*','public/**/*']);
        for(let file of files){
          this.addWatchFile(file);
        }
      }
    }
  ]
});
