module.exports = function (shipit) {

  require('shipit-deploy')(shipit);
  require('shipit-db')(shipit);
  require('shipit-shared')(shipit);
  require('shipit-assets')(shipit);
  var path = require('path2/posix');

  var config = require('./secrets.json');

  shipit.initConfig({

    default: {
      workspace: '/tmp/shipit/workspace',
      repositoryUrl: config.repository,
      ignores: ['.git', 'node_modules', 'wp-content/vendor'],
      keepReleases: 2,
      deleteOnRollback: false,
      shallowClone: true,

      db: {
        local: {
          host     : config.development.url,
          username : config.development.db_user,
          password : config.development.db_password,
          database : config.development.db_name,
        },
      },

      composer: {
        remote: false,
        installFlags: ['--no-dev']
      },

      shared: {
        overwrite: true,
        dirs: [
          'assets',
          {
            path: 'assets',
            overwrite: false,
            chmod: '-R 755',
          }
        ],
        files: [
          'secrets.json',
          {
            path: 'secrets.json',
            overwrite: false,
            chmod: '755',
          }
        ],
      },

      assets: {
        paths: [
          'assets',
        ],
      },
    },

    staging: {
      servers: config.staging.ssh_user + '@' + config.staging.ssh_host,
      deployTo: config.staging.deploy_path,
      branch: 'test',
      db: {
        remote: {
          host     : config.staging.db_host,
          username : config.staging.db_user,
          password : config.staging.db_password,
          database : config.staging.db_name,
        }
      }
    }

  });

  shipit.on('fetched', function () {
    shipit.start('build');
    shipit.start('composer');
  });

  shipit.blTask('build', function () {
    return shipit.local('cd ' + path.join(shipit.config.workspace, 'wp-content/themes', config.theme) + ' && yarn install && bower install && gulp build');
  });

  shipit.blTask('composer', function () {
    return shipit.local('cd ' + shipit.config.workspace + ' && php /usr/local/bin/composer.phar install');
  });

  shipit.on('sharedDirsCreated', function () {
    shipit.start('secrets');
  });

  shipit.blTask('secrets', function () {
    return shipit.remoteCopy('./secrets.json', path.join(shipit.config.deployTo, 'shared'));
  });

};
