module.exports = function(api) {
  api.cache(true);
  
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Plugin para habilitar importações com alias
      [
        'module-resolver',
        {
          root: ['./'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@': './',
            '@components': './components',
            '@hooks': './hooks',
            '@types': './types',
          },
        },
      ],
      
      // Habilita sintaxe de Exportações Require
      '@babel/plugin-proposal-export-namespace-from',
      
      // Suporte para decorators 
      // IMPORTANTE: Removido o plugin duplicado
      'react-native-reanimated/plugin',
      
      // Suporte para expo-router
      'expo-router/babel',
    ],
  };
};