# Hipflask - Wordpress Development Environment

Wordpress development environment.

## What does this do?

Downloads, configures and starts up a virtual machine, configures the hosts file and provides several tools for rapid development.

## Dependencies

Based on the [Scotch Box](https://box.scotch.io/)

* Download and Install [Vagrant](https://www.vagrantup.com/downloads.html)
* Download and Install [VirtualBox](https://www.virtualbox.org/wiki/Downloads)
* Install Vagrant hostmanager `vagrant plugin install vagrant-hostmanager`
* Install Vagrant triggers `vagrant plugin install vagrant-triggers`

* [Composer](https://getcomposer.org/)
* [NodeJS](https://nodejs.org/en/)
* [shipit](https://github.com/shipitjs/shipit)

### Make mysqldump available to your shell

If required make mysqldump available to your shell (run `which mysqldump` to test if needed).

* [MySQL Workbench](https://dev.mysql.com/downloads/workbench/)
* `ln -s /Applications/MySQLWorkbench.app/Contents/Resources/mysqldump /usr/bin/mysqldump`

## Installation

### Secrets

Copy a new secrets.json from the example file, fill in the github_token, generic details and staging and production server details

`cp secrets.json.example secrets.json`

### Installing dependencies

Dependencies are handled with `composer` and `npm`

* `composer install`
* `npm install`


### Initialising a project

A task called init has been created to automate the start of a project. It should only be run once per project. Features include:

* Creating a remote repo
* Cloning the starter theme
* Making the first commit
* Pushing the first commit to the remote repo

Run `shipit development init` to start setting up a project then follow the prompts

### Starting the server

If using Vagrant:
* Run `vagrant up`

## Basic Vagrant Commands

### Start or resume your server
```bash
vagrant up
```

### Pause your server
```bash
vagrant suspend
```

### Delete your server
```bash
vagrant destroy
```

### SSH into your server
```bash
vagrant ssh
```

## Database Access

- Hostname: scotchbox
- Username: root
- Password: root
- Database: scotchbox


## SSH Access

- Hostname: `127.0.0.1:2222`
- Username: vagrant
- Password: vagrant

## Mailcatcher

Just do:

```
vagrant ssh
mailcatcher --http-ip=0.0.0.0
```

Then visit:

```
http://192.168.33.10:1080
```

