const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const defaultConfig = getDefaultConfig(__dirname, { isCSSEnabled: true });

module.exports = withNativeWind(defaultConfig, {
  input: './global.css',
});
