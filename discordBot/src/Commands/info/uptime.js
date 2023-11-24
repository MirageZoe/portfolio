const Command = require('../../Structures/Command.js');
const ms = require('ms');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'uptime',
			displaying: true,
			description: 'Shows how much I have been online!',
			options: '~',
			usage: ``,
			example: '',
			category: 'info'
			// aliases: ['']
		});
	}

	// eslint-disable-next-line no-unused-vars
	async run(message, args) {
		message.channel.send(`I have been online for about \`${ms(this.client.uptime, { long: true })}\`!`);
	}

};
