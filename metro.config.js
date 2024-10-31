const { getDefaultConfig } = require('metro-config');

module.exports = (async () => {
  const {
    resolver: { sourceExts, assetExts }
  } = await getDefaultConfig();
  
  return {
    transformer: {
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: false,
        },
      }),
    },
    resolver: {
      sourceExts,
      assetExts,
    },
    watchFolders: [__dirname],
    watchIgnorePatterns: [
      /node_modules[/\\](?!@react-native)/,
      /\.git\//,
      /\.hg\//,
    ],
    maxWorkers: 2
  };
})();
