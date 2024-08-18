export function watchDir(directory) {
  return {
    name: 'watch-external',
    async buildStart() {
      // Copy new files added to public/ into dist/
      this.addWatchFile(directory);
    }
  };
}
