import MagicString from 'magic-string';

export default function inlineChunksPlugin() {
  return {
    name: 'inline-chunks', // Nom du plugin
    // apply: 'build', // Appliquer uniquement lors du build
    generateBundle(options, bundle) {
      const chunks = {};

      // Collecter le code de tous les chunks
      for (const [key, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'chunk') {
          chunks[key] = chunk;
        }
      }

      // Intégrer le code des chunks dans les fichiers qui les importent
      for (const [key, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'chunk') {
          const s = new MagicString(chunk.code);
          chunk.imports.forEach(imp => {
            const importChunk = chunks[imp];
            if (importChunk) {
              // Trouver et remplacer les imports par le code du chunk
              const importRegex = new RegExp(`import\\s.*?['"]${importChunk.fileName}['"];`, 'g');
              s.replace(importRegex, importChunk.code);
            }
          });
          chunk.code = s.toString();
          // Supprimer les fichiers de chunk qui ont été intégrés
          chunk.imports.forEach(imp => {
            delete bundle[imp];
          });
        }
      }
    },
  };
}
