'use babel';

const {execFile} = require('child_process');
const VagrantProcessView = require('./vagrant-process-view');

class VagrantPlugin {
  constructor() {
    this.config = {
      bin: {
        title: 'Vagrant path',
        type: 'string',
        'default': '/usr/bin/vagrant'
      },
      provider: {
        title: 'Default provider',
        type: 'string',
        'default': process.env.VAGRANT_DEFAULT_PROVIDER || ''
      }
    };
  }

  activate() {
    const commands = ['init', 'up', 'status', 'provision', 'suspend', 'reload', 'halt'];
    this.commandHandlers = commands.map((command) => {
      return atom.commands.add('atom-workspace', `vagrant:${command}`, this[command].bind(this));
    });
    this.processView = new VagrantProcessView();
  }

  deactivate() {
    this.commandHandlers.forEach((handler) => handler.dispose());
    this.commandHandlers = [];

    this.processView.destroy();
    this.processView = null;

    if (this.statusBarTile) {
      this.statusBarTile.destroy();
      this.statusBarTile = null;
    }
  }

  consumeStatusBar(statusBar) {
    this.statusBarTile = statusBar.addLeftTile({
      item: this.processView,
      priority: 100
    });
  }

  exec(command, params = {}) {
    const bin = atom.config.get('vagrant.bin');
    const cwd = atom.project.getPaths()[0];

    let args = [command];
    Object.keys(params).forEach((name) => {
      args.push(`--${name} ${params[name]}`);
    });

    return new Promise((resolve, reject) => {
      execFile(bin, args, {cwd}, (err, stdout, stderr) => {
        if (err) {
          err.stdout = stdout;
          err.stderr = stderr;
          return reject(err);
        }

        resolve({stdout, stderr});
      });
    }).then(({stdout}) => {
      atom.notifications.addInfo(`Vagrant ${command}`, {
        detail: stdout
      });
    }).catch((e) => {
      atom.notifications.addError(`Vagrant ${command}`, {
        detail: e.stderr
      });
    });
  }

  up() {
    let params = {};

    const provider = atom.config.get('vagrant.provider');
    if (provider) {
      params.provider = provider;
    }

    this.exec('up', params);
  }

  init() {
    this.exec('init');
  }

  provision() {
    this.exec('provision');
  }

  status() {
    this.exec('status');
  }

  halt() {
    this.exec('halt');
  }

  suspend() {
    this.exec('suspend');
  }

  reload() {
    this.exec('reload');
  }
}

module.exports = VagrantPlugin;
