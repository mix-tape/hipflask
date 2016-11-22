// --------------------------------------------------------------------------
//
//   Shipit
//     Handles initialisation, deployment, data and assets
//
// --------------------------------------------------------------------------

module.exports = function (shipit) {

  // --------------------------------------------------------------------------
  //   Dependencies and shipit extensions
  // --------------------------------------------------------------------------

  require('shipit-deploy')(shipit);
  require('shipit-db')(shipit);
  require('shipit-shared')(shipit);
  require('shipit-assets')(shipit);
  var path = require('path2/posix');
  var friendlyUrl = require('friendly-url');
  var inquirer = require('inquirer');


  // --------------------------------------------------------------------------
  //   Get project data from secrets, see secrets.json.example
  // --------------------------------------------------------------------------

  var config = require('./secrets.json');


  // --------------------------------------------------------------------------
  //   Configure shipit
  // --------------------------------------------------------------------------

  shipit.initConfig({

    // --------------------------------------------------------------------------
    //   Defaults
    // --------------------------------------------------------------------------

    default: {
      workspace:        '/tmp/shipit/workspace',
      repositoryUrl:    config.repository,
      ignores:          ['.git', 'node_modules', 'wp-content/vendor'],
      keepReleases:     2,
      deleteOnRollback: false,
      shallowClone:     true,

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

        dirs: [
          'assets',
          {
            path:      'assets',
            overwrite: false,
            chmod:     '-R 755',
          }
        ],
      },

      assets: {
        paths: [
          'assets',
        ],
      },
    },

    // --------------------------------------------------------------------------
    //   Local
    // --------------------------------------------------------------------------

    local: {
      servers: 'localhost'
    },


    // --------------------------------------------------------------------------
    //   Staging
    // --------------------------------------------------------------------------

    staging: {
      servers:  config.staging.ssh_user + '@' + config.staging.ssh_host,
      deployTo: config.staging.deploy_path,
      branch:   'test', // TEMP for testing, don't commit

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

  // --------------------------------------------------------------------------
  //
  //   Tasks
  //
  // --------------------------------------------------------------------------

  // --------------------------------------------------------------------------
  //   Initialise Project
  // --------------------------------------------------------------------------

  shipit.blTask('init', function (callback) {

    // --------------------------------------------------------------------------
    //   Confirm Intention
    // --------------------------------------------------------------------------

    inquirer.prompt({
      type:    'confirm',
      name:    'initConfirm',
      default: false,
      message: 'Here be dragons! Only run this once on each project. This will download the theme and replace / rename several files and directories. Are you sure?'
    })
    .then( function (answer) {

      if (!answer.initConfirm)
        return callback();

      inquirer.prompt([
        {
          type:    'input',
          name:    'projectName',
          message: 'What\'s your project name (url safe)'
        },
      ])
      .then(function (answers) {

        projectName = friendlyUrl(answers.projectName);

        // Clone theme repo and remove .git

        shipit.local('git clone git@github.com:birdbrain/hibiki_new.git ' + projectName, { cwd: __dirname + '/wp-content/themes' }).then(function (res) {

          shipit.local('rm -rf .git', { cwd: __dirname + '/wp-content/themes/' + projectName })

          // shipit.local('curl -H "Authorization: token ' + config.github_token + '" https://api.github.com/orgs/birdbrain/repos -d \'{ "name":"' + projectName + '","description":""\'}').then(function () {
          shipit.local('curl -H "Authorization: token ' + config.github_token + '" https://api.github.com/orgs/mix-tape/repos -d \'{ "name":"' + projectName + '","description":""\'}').then(function () {

            shipit.local('git add -A && git commit -m "Initial Commit"')
          })

        })

      })
    })
  });

  // --------------------------------------------------------------------------
  //   Provision remote server
  // --------------------------------------------------------------------------

  shipit.blTask('provision', function () {
    return shipit.remote('mysql -u' + shipit.config.db.remote.username + ' -p' + shipit.config.db.remote.password + ' -e "CREATE DATABASE IF NOT EXISTS ' + shipit.config.db.remote.database + '"');
  });


  // --------------------------------------------------------------------------
  //   Default, runs on shipit deploy <environment>
  // --------------------------------------------------------------------------

  shipit.on('fetched', function () {
    shipit.start('build');
    shipit.start('composer');
  });

  shipit.blTask('build', function () {
    return shipit.local('cd ' + path.join(shipit.config.workspace, 'wp-content/themes', config.project) + ' && yarn install && bower install && gulp build');
  });

  shipit.blTask('composer', function () {
    return shipit.local('cd ' + shipit.config.workspace + ' && php /usr/local/bin/composer.phar install');
  });


  // --------------------------------------------------------------------------
  //   Copy secrets.json to the server when shared directories are created
  // --------------------------------------------------------------------------

  shipit.on('sharedDirsCreated', function () {
    shipit.start('secrets');
  });

  shipit.blTask('secrets', function () {
    return shipit.remoteCopy(__dirname + '/secrets.json', path.join(shipit.config.deployTo, 'shared'));
  });

};
