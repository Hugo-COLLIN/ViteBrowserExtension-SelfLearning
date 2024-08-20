import path from 'path';

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

      console.log('nonEntryCodeMap:', nonEntryCodeMap)

      // Injecter le code des non-entry chunks dans les chunks d'entrée
      entryChunks.forEach(chunk => {
        Object.entries(nonEntryCodeMap).forEach(([fileName, code]) => {
          console.log('---' +
            'CODE' +
            '---', code)
          const importRegex = new RegExp(
            `import\\s+\\{.*?\\}\\s+from\\s+['"\`]${fileName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}['"\`];?`,
            'g'
          );
          console.log('importRegex:', importRegex.test(chunk.code))
          if (importRegex.test(chunk.code)) {
            chunk.code = chunk.code.replace(importRegex, code);
          }
        });
      });
    }
  };
};
