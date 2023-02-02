const { getDefaultConfig } = require('expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.assetExts.push('db');
defaultConfig.resolver.assetExts.push('sqlite');
defaultConfig.transformer.unstable_allowRequireContext = true;

module.exports = defaultConfig;
