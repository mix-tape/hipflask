// --------------------------------------------------------------------------
//
//   Shipit
//     Handles initialisation, deployment, data and assets
//
// --------------------------------------------------------------------------

const log = console.log

module.exports = (shipit) => {

  // --------------------------------------------------------------------------
  //   Dependencies and shipit extensions
  // --------------------------------------------------------------------------

  require('shipit-deploy')(shipit)
  require('shipit-db')(shipit)
  require('shipit-shared')(shipit)
  require('shipit-assets')(shipit)

  var path = require('path2/posix'),
      fs = require('fs'),
      friendlyUrl = require('friendly-url'),
      chalk = require('chalk'),
      inquirer = require('inquirer'),
      replaceInFile = require('replace-in-file'),
      GitHub = require('github-api'),
      Promise = require('bluebird')


  // --------------------------------------------------------------------------
  //   Get project data from secrets, see secrets.json.example
  // --------------------------------------------------------------------------

  var config = require('./secrets.json')


  // --------------------------------------------------------------------------
  //   Set repository
  // --------------------------------------------------------------------------

  if (!config.repository)
    config.repository = `https://github.com/${config.organisation}/${config.project}`


  // --------------------------------------------------------------------------
  //   Github API Authentication
  // --------------------------------------------------------------------------

  if ('CHANGE_ME' == config.github_token)
    return log(chalk.bold.red('Please add your github token to secrets.json'))

  var gh = new GitHub({
    token: config.github_token
  })


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

      composer: {
        remote: false,
        installFlags: ['--no-dev']
      },

      shared: {
        'triggerEvent': 'updated',
        dirs: [
          {
            path:      'assets',
            overwrite: true,
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

    development: {
      servers: 'localhost'
    },


    // --------------------------------------------------------------------------
    //   Staging
    // --------------------------------------------------------------------------

    staging: {
      servers:  config.staging.ssh_user + '@' + config.staging.ssh_host,
      deployTo: config.staging.deploy_path,

      db: {
        local: {
          host     : config.development.db_host,
          username : config.development.db_user,
          password : config.development.db_password,
          database : config.development.db_name,
        },
        remote: {
          host     : config.staging.db_host,
          username : config.staging.db_user,
          password : config.staging.db_password,
          database : config.staging.db_name,
        }
      }
    }

  })


  // --------------------------------------------------------------------------
  //
  //   Tasks
  //
  // --------------------------------------------------------------------------

  // --------------------------------------------------------------------------
  //   Process Order
  // --------------------------------------------------------------------------

  shipit.on('init:confirmed', () => {
    shipit.start('init:replace')
    shipit.start('init:salts')
    shipit.start('init:repository')
  })

  shipit.on('init:repository-created', () => {
    shipit.start('init:theme')
  })

  shipit.on('init:theme-cloned', () => {
    shipit.start('init:provision')
    shipit.start('init:commit')
  })


  // --------------------------------------------------------------------------
  //   Initialise Project
  // --------------------------------------------------------------------------

  shipit.blTask('init', (callback) => {

    // Confirm Intention

    log(chalk.green(`Project Name: `), chalk.blue(config.project))
    log(chalk.green(`Project Organisation: `), chalk.blue(config.organisation))
    log(chalk.green(`Starter Theme: `), chalk.blue(config.starter_theme))

    inquirer.prompt({
      type:    'confirm',
      name:    'initConfirm',
      default: false,
      message: 'Here be dragons! Only run this once on each project. This will initialise git, download the theme and replace / rename several files and directories. Check the details above and confirm?'
    })
    .then( (answer) => {

      if (!answer.initConfirm)
        return callback()

      shipit.emit('init:confirmed')
      return callback()

    })
  })

  // --------------------------------------------------------------------------
  //   Replace Hipflask References
  // --------------------------------------------------------------------------

  shipit.task('init:replace', (callback) => {

    replaceInFile({
      files: [
        'readme.md',
      ],
      replace: 'Hipflask',
      with: config.project
    })
    .then(replaceInFile({
      files: [
        'readme.md',
        'package.json',
        path.join('wp-content/themes', config.project, '*.json'),
      ],
      replace: 'hipflask',
      with: config.project
    }))
    .then(changedFiles => {
      log(chalk.green('Modified files:', changedFiles.join(', ')))
      return callback()
    })

  })


  // --------------------------------------------------------------------------
  //   Create Repository
  // --------------------------------------------------------------------------

  shipit.blTask('init:repository', (callback) => {

    const ghOrganisation = gh.getOrganization(config.organisation)

    ghOrganisation.createRepo({
      name: config.project,
      has_wiki: false,
      has_downloads: false,
      auto_init: false
    },
    (error, response) => {

      if (error) {

        log(chalk.bold.red('Something went wrong. Likely the repo already exists, rename your project to continue'))
        callback(error)

      } else {

        log(chalk.green('Successfully created repo'))

        config.repository = response.ssh_url

        shipit.emit('init:repository-created')
        callback()
      }
    })
  })


  // --------------------------------------------------------------------------
  //   Clone Theme
  // --------------------------------------------------------------------------

  shipit.blTask('init:theme', (callback) => {

    if (fs.existsSync(`${__dirname}/wp-content/themes/${config.project}`)) {
      log(chalk.bold.red(`A theme with your project name: ${config.project} already exists`))
      shipit.emit('init:theme-cloned')
      return callback()
    }

    shipit.local(`git clone ${config.starter_theme} ${config.project}`, { cwd: `${__dirname}/wp-content/themes` }).then( () => {
      shipit.emit('init:theme-cloned')
      callback()
    })

  })


  // --------------------------------------------------------------------------
  //   Initial Commit
  // --------------------------------------------------------------------------

  shipit.blTask('init:commit', (callback) => {

    shipit.local('rm -rf .git/', { cwd: path.join(__dirname, `/wp-content/themes/${config.project}`) })
    .then(shipit.local(`rm -rf .git && git init && git remote add origin git@github.com:${config.organisation}/${config.project}.git && git add -A && git commit -m "Initial Commit" && git push origin master:master`, { cwd: __dirname }))
    .then(callback())

  })


  // --------------------------------------------------------------------------
  //   Salts
  // --------------------------------------------------------------------------

  shipit.blTask('init:salts', (callback) => {

    var path = require('path');
    var crypto = require('crypto');
    var replace = require('replace');

    chalk.bold('Generating Salts');

    var pwd = process.env.PWD;

    var salt = () => crypto.randomBytes(30).toString('hex');

    [
      'AUTH_KEY',
      'SECURE_AUTH_KEY',
      'LOGGED_IN_KEY',
      'NONCE_KEY',
      'AUTH_SALT',
      'SECURE_AUTH_SALT',
      'LOGGED_IN_SALT',
      'NONCE_SALT',
    ].map(define => {
      replace({
        regex: /put your unique phrase here/,
        replacement: salt(),
        paths: [path.join(pwd, 'wp-config.php')],
        recursive: false,
        silent: true
      });
    });

    callback && callback();
  })


  // --------------------------------------------------------------------------
  //   Provision remote server
  // --------------------------------------------------------------------------

  shipit.blTask('init:provision', () => {
    return shipit.remote(`mysql -u${shipit.config.db.remote.username} -p${shipit.config.db.remote.password} -e "CREATE DATABASE IF NOT EXISTS ${shipit.config.db.remote.database}"`)
  })


  // --------------------------------------------------------------------------
  //   Default, runs on shipit deploy <environment>
  // --------------------------------------------------------------------------

  shipit.on('fetched', () => {
    shipit.start('build')
    shipit.start('composer')
  })

  shipit.blTask('build', () => {
    return shipit.local(`cd ${path.join(shipit.config.workspace, 'wp-content/themes', config.project)} && yarn install && bower install && gulp build`)
  })

  shipit.blTask('composer', () => {
    return shipit.local(`cd ${shipit.config.workspace} && composer install`)
  })


  // --------------------------------------------------------------------------
  //   Copy secrets.json to the server when shared directories are created
  // --------------------------------------------------------------------------

  shipit.on('sharedDirsCreated', () => {
    shipit.start('secrets')
  })

  shipit.blTask('secrets', () => {
    return shipit.remoteCopy(path.join(__dirname, 'secrets.json'), path.join(shipit.config.deployTo, 'shared'))
  })

}
