import path from 'path';

export const disableChunks = (targets = []) => {
  const plugin = {
    name: 'disable-chunks',
    resolveId(source, importer, options) {
      return this.resolve(source, importer, { skipSelf: true }).then(resolved => {
        if (resolved && targets.some(file => resolved.id.includes(file))) {
          return { id: `${resolved.id}?unique=${Math.random()}`, moduleSideEffects: 'no-treeshake' };
        }
        return resolved;
      });
    },
    load(id) {
      const regex = /(\?unique=.*)$/;
      if (regex.test(id)) {
        return this.load(id.replace(regex, ''), { skipSelf: true });
      }
    },
    generateBundle(options, bundle) {
      Object.values(bundle).forEach(chunk => {
        if (!chunk.isEntry) {
          delete bundle[chunk.fileName];
        }
      });
    }
  };
  return plugin;
};
