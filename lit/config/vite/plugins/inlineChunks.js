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
          chunks[key] = chunk.code;
        }
      }

      console.log("CHUNKS", chunks)

      // Intégrer le code des chunks dans les fichiers qui les importent
      for (const [key, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'chunk') {
          const s = new MagicString(chunk.code);
          for (const imp of chunk.imports) {
            const importCode = chunks[imp];
            if (importCode) {
              // Remplacer les imports par le code du chunk
              const importIndex = s.original.indexOf(`import "${imp}"`);
              if (importIndex !== -1) {
                s.overwrite(importIndex, importIndex + `import "${imp}"`.length, importCode);
              }
            }
          }
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
