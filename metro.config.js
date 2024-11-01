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
      blockList: [
        /node_modules\/(?!(@react-native|react-native|@react-navigation|react-native-reanimated|react-native-gesture-handler|react-native-safe-area-context|react-native-screens|@react-native-voice)\/).*/,
      ],
    },
    watchFolders: [__dirname],
    maxWorkers: 1,
    resetCache: true,
    watchIgnorePatterns: [
      /node_modules\/(?!(@react-native|react-native|@react-navigation|react-native-reanimated|react-native-gesture-handler|react-native-safe-area-context|react-native-screens|@react-native-voice)\/).*/,
      /\.git\//,
      /\.hg\//,
    ],
  };
})();
