const nativewindPreset = require('nativewind/babel');

module.exports = function (api) {
  api.cache(true);
  const nativewindPlugins = nativewindPreset().plugins.filter(
    (plugin) => plugin !== 'react-native-worklets/plugin',
  );
  return {
    presets: ['babel-preset-expo'],
    plugins: [...nativewindPlugins, 'react-native-reanimated/plugin'],
  };
};
