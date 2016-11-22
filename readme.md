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

Copy a new secrets.json from the example file, fill in the generic details and staging and production server details

`mv secrets.json.example secrets.json`

### Starting the server

In your project root:

* Clone the main project into the `public` directory
* Run `vagrant up`

### Installing dependencies

Dependencies are handled with `composer` and `npm`

* `composer install`
* `npm install`


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

- Hostname: localhost or 127.0.0.1
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

