const Command = require('../../Structures/Command.js');
const SharuruEmbed = require('../../Structures/SharuruEmbed');
const GuildSettings = require('../../Models/GuildSettings');
const { Colors } = require("discord.js")

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'help',
			displaying: true,
			description: 'Shows info about a command!',
			options: '',
			usage: ` ping`,
			example: '',
			category: 'info',
			aliases: ['']
		});
	}

	// eslint-disable-next-line no-unused-vars
	async run(message, [command]) {
		const issuer = message.author;
		const prefix = this.client.prefixes.get(message.guild.id)
		const embed = new SharuruEmbed()
			.setColor(Colors.LuminousVividPink)
			.setAuthor({name: `${message.guild.name} Helper`})
			.setThumbnail(this.client.user.displayAvatarURL())
			.setFooter({text: `Requested by ${issuer.tag} at `,iconURL:issuer.displayAvatarURL({ dynamic: true })})
			.setTimestamp();

		if (command) {
			const cmd = this.client.commands.get(command) || this.client.commands.get(this.client.aliases.get(command));

			if (!cmd) return message.reply(`i'm sorry but I couldn't find what you would call \`${command}\``);

			embed.setAuthor({name: `Help for "${this.client.utils.capitalise(cmd.name)}"`,iconURL: this.client.user.displayAvatarURL()})
				.setDescription(
					`**❯ Aliases:** ${cmd.aliases.length ? cmd.aliases.map(alias => `\`${alias}\``).join(' ') : 'No Aliases'}
					**❯ Description:** ${cmd.description}
					**❯ Options:** ${cmd.options}
					**❯ Category:** ${cmd.category}
					**❯ Usage:** *${cmd.usage ? cmd.usage : 'No usage format'}*
					**❯ Example:** ${cmd.example ? cmd.example : 'No example format'}`
				);

			return message.channel.send({embeds:[embed]});
		} else {
			embed.setDescription(//// this.client.prefix to use local file prefix
				`These are my available commands
				And here my prefix is: **\`${prefix}\`** 
				If any option contains: 
					- \`<>\` => means it's required
					- \`[]\` => means it's optional`
			);
			let categories;
			if (!this.client.owners.includes(message.author.id)) {
				categories = this.client.utils.removeDuplicates(this.client.commands.filter(cmd => cmd.category !== 'Owner').map(cmd => cmd.category));
			} else {
				categories = this.client.utils.removeDuplicates(this.client.commands.map(cmd => cmd.category));
			}
			let embedFields = [];
			for (const category of categories) {
				//`**${this.client.utils.capitalise(category)}**`, this.client.commands.filter(cmd =>
					// cmd.category === category).map(cmd => `\`${cmd.name}\``).join(' ')
				embedFields.push({name: `**${this.client.utils.capitalise(category)}**`, value:this.client.commands.filter(cmd =>
					cmd.category === category).map(cmd => `\`${cmd.name}\``).join(' ') })
			}
			embed.addFields(embedFields)

			return message.channel.send({embeds:[embed]});
		}
	}

};
