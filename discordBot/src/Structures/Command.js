const { PermissionsBitField } = require('discord.js');

module.exports = class Command {

	constructor(client, name, options = {}) {
		this.client = client;
		this.name = options.name || name;
		this.displaying = options.displaying;
		this.cooldown = options.cooldown;
		this.description = options.description || `No description provided.`;
		this.options = options.options || 'No options available.';
		this.usage = `${this.client.prefix}${this.name} ${options.usage || ''}`.trim();
		this.example = options.example ? `${this.client.prefix}${this.name}${options.example}` : 'No example provided.';
		this.category = options.category || 'Miscellaneous';
		this.aliases = options.aliases || [];
		this.userPerms = new PermissionsBitField(options.userPerms).freeze();
		this.SharuruPerms = new PermissionsBitField(options.SharuruPerms).freeze();
		this.args = options.args || false;
		this.guildOnly = options.guildOnly || false;
		this.staffRoleOnly = options.staffRoleOnly || false;
		this.ownerOnly = options.ownerOnly || false;
		this.roleDependable = options.roleDependable || false;
		this.allowTesters = options.allowTesters || false;
	}

	// eslint-disable-next-line no-unused-vars
	async run(message, args) {
		throw new Error(`Command ${this.name} doesn't provide a run method!`);
	}

};
