export const disableChunks = (targets = []) => {
  return {
    name: 'disable-chunks',

    async resolveId(source, importer, options) {
      const resolved = await this.resolve(source, importer, { skipSelf: true });
      if (resolved && targets.some(file => resolved.id.includes(file))) {
        return { id: `${resolved.id}?unique=${Math.random()}`, moduleSideEffects: 'no-treeshake' };
      }
      return resolved;
    },

    async load(id) {
      const regex = /(\?unique=.*)$/;
      if (regex.test(id)) {
        return this.load(id.replace(regex, ''), { skipSelf: true });
      }
    },

    async generateBundle(options, bundle) {
      const nonEntryChunks = Object.values(bundle).filter(chunk => !chunk.isEntry);
      const entryChunks = Object.values(bundle).filter(chunk => chunk.isEntry);

      // Créer une map pour accéder aux codes des non-entry chunks
      const nonEntryCodeMap = {};
      nonEntryChunks.forEach(chunk => {
        nonEntryCodeMap[chunk.fileName] = chunk.code;
        delete bundle[chunk.fileName]; // Supprime les non-entry chunks du bundle
      });

      // console.log('nonEntryCodeMap:', nonEntryCodeMap)

      // Injecter le code des non-entry chunks dans les chunks d'entrée
      entryChunks.forEach(inputChunk => {
        Object.entries(nonEntryCodeMap).forEach(([fileName, code]) => {
          const importRegex = new RegExp(
            `import \{.*\} from ['"][(\.\.\/)(\.\/)]*${fileName}['"];+`,
            'g'
          );

          // console.log(inputChunk.code.split('\n')[0])
          // console.log(importRegex)

          const test = importRegex.test(inputChunk.code)
          // console.log('importRegex:', test)
          if (test) {
            const exportRegex = /\n*export \{[^}]*\};\n*/g
            // console.log("OK§§§§§", exportRegex.test(code))
            const injectedCode = code.replace(exportRegex, '');
            inputChunk.code = inputChunk.code.replace(importRegex, injectedCode);
            // console.log(inputChunk.code.split('\n')[0])
            // Write the new code back to the bundle
            // bundle[inputChunk.fileName] = inputChunk;
            // fs.writeFileSync(path.resolve(options.dir, inputChunk.fileName), inputChunk.code);
          }
        });
      });
    }
  };
};
