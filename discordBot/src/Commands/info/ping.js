const Command = require('../../Structures/Command.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'ping',
			displaying: true,
			description: 'Shows how much time it takes for me to hear you!',
			options: '',
			usage: '',
			example: '',
			category: 'info',
			aliases: ['pong']
		});
	}

	// eslint-disable-next-line no-unused-vars
	async run(message) {
		const msg = await message.channel.send(`Pinging...`);

		const latency = msg.createdTimestamp - message.createdTimestamp;
		const choices = ['Is this really my ping?', 'Is this okay? I can\'t look!', 'Hope it\'s not that bad...'];
		const response = choices[Math.floor(Math.random() * choices.length)];

		msg.edit(`${response}\nLatency: \`${latency}ms\`\nAPI Latency: \`${Math.round(this.client.ws.ping)}ms\``);
	}

};
