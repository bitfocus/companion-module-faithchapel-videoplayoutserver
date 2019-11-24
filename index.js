var instance_skel = require('../../instance_skel');
var tcp = require('../../tcp');
var debug;
var log;

function instance(system, id, config) {
		var self = this;

		// super-constructor
		instance_skel.apply(this, arguments);
		self.actions(); // export actions
		return self;
}

instance.prototype.init = function () {
		var self = this;

		debug = self.debug;
		log = self.log;

		self.status(self.STATUS_UNKNOWN);

		if (self.config.host !== undefined) {
			self.tcp = new tcp(self.config.host, self.config.port);

			self.tcp.on('status_change', function (status, message) {
				self.status(status, message);
			});

			self.tcp.on('error', function () {
				// Ignore
			});
		}
};

instance.prototype.updateConfig = function (config) {
		var self = this;
		self.config = config;

		if (self.tcp !== undefined) {
			self.tcp.destroy();
			delete self.tcp;
		}
		// Listener port 10001
		if (self.config.host !== undefined) {
			self.tcp = new tcp(self.config.host, self.config.port);

			self.tcp.on('status_change', function (status, message) {
				self.status(status, message);
			});

			self.tcp.on('error', function (message) {
				// ignore for now
			});
		}
};

// Return config fields for web config
instance.prototype.config_fields = function () {
		var self = this;
		return [
			{
				type: 'text',
				id: 'info',
				width: 12,
				label: 'Information',
				value: 'This module is for the Faith Chapel Video Playback'
			},{
				type: 'textinput',
				id: 'host',
				label: 'Target IP',
				width: 6,
				regex: self.REGEX_IP
			},{
				type: 'textinput',
				id: 'port',
				label: 'Port number',
				width: 6,
				default: '2322',
				regex: self.REGEX_PORT
			}
		]
};

// When module gets deleted
instance.prototype.destroy = function () {
	var self = this;

		if (self.tcp !== undefined) {
			self.tcp.destroy();
		}
		debug("destroy", self.id);
};

instance.prototype.actions = function (system) {
	var self = this;

	var actions = {
		'rollClip': {
			label: 'Roll Clip',
			options: [ {
				type: 'textinput',
				label: 'Select video channel',
				id: 'channel',
				default: '1',
				regex: self.REGEX_NUMBER
				}
			]
		},
		'stopClip': {
			label: 'Stop Clip',
			options: [ {
				type: 'textinput',
				label: 'Select video channel',
				id: 'channel',
				default: '1',
				choices: self.REGEX_NUMBER
				}
			]
		},
		'pauseClip': {
			label: 'Pause Clip',
			options: [ {
				type: 'textinput',
				label: 'Select video channel',
				id: 'channel',
				default: '1',
				choices: self.REGEX_NUMBER
				}
			]
		},
		'selectPrevClip': {
			label: 'Previous Clip',
			options: [ {
				type: 'textinput',
				label: 'Select video channel',
				id: 'channel',
				default: '1',
				choices: self.REGEX_NUMBER
				}
			]
		},
		'selectNextClip': {
			label: 'Next Clip',
			options: [ {
				type: 'textinput',
				label: 'Select video channel',
				id: 'channel',
				default: '1',
				choices: self.REGEX_NUMBER
				}
			]
		}
	};
		self.setActions(actions);
};


instance.prototype.action = function (action) {
		var self = this;
		var id = action.action;
		var cmd;
		var opt = action.options;

		switch (id) {

			case 'rollClip':
				cmd = 'rollClipCh' + opt.channel;
				break;

			case 'stopClip':
				cmd = 'stopClipCh' + opt.channel;
				break;

			case 'pauseClip':
				cmd = 'pauseClipCh' + opt.channel;
				break;

			case 'selectPrevClip':
				cmd = 'selectPrevClipCh' + opt.channel;
				break;

			case 'selectNextClip':
				cmd = 'selectNextClipCh' + opt.channel;
				break;
		}

		if (cmd !== undefined) {
			if (self.tcp !== undefined) {
				debug('sending ', cmd, "to", self.tcp.host);
				self.tcp.send(cmd);
			}
		}
};

instance_skel.extendedBy(instance);
exports = module.exports = instance;
