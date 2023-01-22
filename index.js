var nodemon = require('nodemon');
nodemon({
  script: 'load.js',
  ext: 'js json'
});

nodemon.on('start', function () {
  console.log('App iniciado com sucesso');
}).on('quit', function () {
  console.log('App finalizou tarefas');
  process.exit();
}).on('restart', function (files) {
  console.log('App reiniciado: ', files);
});