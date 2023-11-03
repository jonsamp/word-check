const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const defaultConfig = getDefaultConfig(__dirname, { isCSSEnabled: true });

defaultConfig.resolver.assetExts.push('db');
defaultConfig.resolver.assetExts.push('sqlite');
defaultConfig.transformer.unstable_allowRequireContext = true;

module.exports = withNativeWind(defaultConfig, {
  input: './global.css',
});
