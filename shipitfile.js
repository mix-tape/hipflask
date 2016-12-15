// --------------------------------------------------------------------------
//
//   Shipit
//     Handles initialisation, deployment, data and assets
//
// --------------------------------------------------------------------------

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
      inquirer = require('inquirer'),
      replaceInFile = require('replace-in-file')
      GitHub = require('github-api')


  // --------------------------------------------------------------------------
  //   Get project data from secrets, see secrets.json.example
  // --------------------------------------------------------------------------

  var config = require('./secrets.json')


  // --------------------------------------------------------------------------
  //   Github API Authentication
  // --------------------------------------------------------------------------

  if ('CHANGE_ME' == config.github_token)
    return console.log("Please add your github token to secrets.json")

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
  //   Initialise Project
  // --------------------------------------------------------------------------

  shipit.blTask('init', (callback) => {

    // Confirm Intention

    inquirer.prompt({
      type:    'confirm',
      name:    'initConfirm',
      default: false,
      message: 'Here be dragons! Only run this once on each project. This will initialise git, download the theme and replace / rename several files and directories. Are you sure?'
    })
    .then( (answer) => {

      if (!answer.initConfirm)
        return callback()

      // Request Project Name

      inquirer.prompt([
        {
          type:    'input',
          name:    'projectName',
          message: `What's the project name?`
        },
      ])
      .then( (answers) => {

        var projectName = answers.projectName,
            projectSlug = friendlyUrl(projectName)

        // Update secrets with project name

        config.project = projectSlug
        fs.writeFileSync("./secrets.json", JSON.stringify(config, null, 2))

        // Replace Hipflask references

        replaceInFile({
          files: [
            'readme.md',
          ],
          replace: 'Hipflask',
          with: projectName
        })

        // Create a github repo, push initial commit

        var ghOrganisation = gh.getOrganization(config.organisation)

        ghOrganisation.createRepo({
          name: projectSlug,
          has_wiki: false,
          has_downloads: false,
          auto_init: false
        }, (error, response) => {

          if (error) {

            console.log('Warning')
            console.log(error.response.data.message)

            repo = gh.getRepo(config.organisation, projectSlug)
            repo.getDetails((error, response) => {

              if (error)
                callback('Error retrieving repo detail')

              remoteUrl = response.ssh_url

              cloneTheme(remoteUrl)

            })

          } else {

            console.log('Successfully created repo')

            remoteUrl = response.ssh_url

            cloneTheme(remoteUrl)
          }
        })


        // Clone theme repo

        function cloneTheme(remoteUrl) {

          // Update secrets with repo url

          config.repository = remoteUrl
          fs.writeFileSync("./secrets.json", JSON.stringify(config, null, 2))

          if (fs.existsSync(`${__dirname}/wp-content/themes/${projectSlug}`))
            return callback("A theme with your project name already exists")

          shipit.local(`git clone ${config.starter_theme} ${projectSlug}`, { cwd: `${__dirname}/wp-content/themes` }).then( (res) => {

            // Remove theme git repo

            shipit.local('rm -rf .git', { cwd: path.join(__dirname, `/wp-content/themes/${projectSlug}`) })
            shipit.local('rm -rf .git', { cwd: __dirname } ).then( () => {

              // Initial commit

              shipit.local(`git init && git remote add origin ${remoteUrl} && git add -A && git commit -m "Initial Commit" && git push origin master:master`, { cwd: __dirname }).then(callback())

            })
          })
        }
      })
    })
  })


  // --------------------------------------------------------------------------
  //   Provision remote server
  // --------------------------------------------------------------------------

  shipit.blTask('provision', () => {
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
