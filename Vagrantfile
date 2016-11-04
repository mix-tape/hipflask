# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|

    config.vm.box = "scotch/box"
    config.vm.network "private_network", ip: "192.168.33.11", type: "dhcp", auto_config: false
    config.vm.network :forwarded_port, guest: 3306, host: 3306
    config.vm.hostname = "scotchbox"
    config.vm.synced_folder ".", "/var/www/public", :mount_options => ["dmode=777", "fmode=666"]

    # Hosts Manager
    config.vm.provision :hostmanager
    config.hostmanager.enabled = true
    config.hostmanager.manage_host = true
    config.hostmanager.manage_guest = true
    config.hostmanager.ignore_private_ip = false
    config.hostmanager.include_offline = true

    config.hostmanager.aliases = %w(hipflask.dev)

end
