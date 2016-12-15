# -*- mode: ruby -*-
# vi: set ft=ruby :

require 'json'

Vagrant.configure("2") do |config|

    # Load Secrets.json
    secretsFile = File.read( File.join( __dir__, 'secrets.json' ))
    secrets = JSON.parse(secretsFile)

    # Box to load
    config.vm.box = "scotch/box"

    # Networking
    config.vm.network "private_network", ip: "192.168.33.10"
    config.vm.network :forwarded_port, guest: 3306, host: 3306
    config.vm.hostname = "scotchbox"

    # Set the box name in VirtualBox to match the working directory.
    config.vm.provider :virtualbox do |v|
        v_pwd = Dir.pwd
        v.name = File.basename(v_pwd)
    end

    # Shared folder
    config.vm.synced_folder ".", "/var/www/public", :mount_options => ["dmode=777", "fmode=666"]

    # Export/backup the db before halt
    if Vagrant.has_plugin? 'vagrant-triggers'
        config.trigger.before :halt, :stdout => true, :force => true do
            info "Exporting DB"
            run "vagrant ssh -c 'cd /var/www/public && wp db export db/" + Time.now.strftime("%d%m%Y-%H:%M:%S") + ".sql'";
        end
    else
        puts 'vagrant-triggers missing, please install the plugin:'
        puts 'vagrant plugin install vagrant-triggers'
    end

    # Hosts Manager
    if Vagrant.has_plugin? 'hostmanager'

        config.vm.provision :hostmanager
        config.hostmanager.enabled = true
        config.hostmanager.manage_host = true
        config.hostmanager.manage_guest = true
        config.hostmanager.ignore_private_ip = false
        config.hostmanager.include_offline = true

        config.hostmanager.aliases =  [secrets['development']['url']]
    end

    # Enable shipit/mysqldump to connect to the mysql server within vagrant
    config.vm.provision "shell", inline: <<-SHELL
        mysql -uroot -proot -e "GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' IDENTIFIED BY 'root';"
        mysql -uroot -proot -e "GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' IDENTIFIED BY 'root';"
        sed -i 's/^bind-address/#bind-address/' /etc/mysql/my.cnf
        sed -i 's/^skip-external-locking/#skip-external-locking/' /etc/mysql/my.cnf
        sudo service mysql restart
        echo "Vagrant provisioned. Access at http://#{secrets['development']['url']}"
    SHELL

end
