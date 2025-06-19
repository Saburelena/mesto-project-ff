const presets = [
    ['@babel/preset-env', {
      targets: { // какие версии браузеров поддерживать
        edge: '17',
        ie: '11',
        firefox: '50',
        chrome: '64',
        safari: '11.1'
      },
  
      // использовать полифилы для браузеров из свойства target
      // по умолчанию babel использует полифилы библиотеки core-js
      useBuiltIns: "entry",
      corejs: '3.41.0' // Указываем версию core-js из package.json
    }]
  ];
  
  module.exports = { presets };