const { Colors } = require('discord.js');
const Command = require('../../Structures/Command.js');
const SharuruEmbed = require("../../Structures/SharuruEmbed.js");
const moment = require('moment');

const regions = {
	brazil: 'Brazil',
	europe: 'Europe',
	hongkong: 'Hong Kong',
	india: 'India',
	japan: 'Japan',
	russia: 'Russia',
	singapore: 'Singapore',
	southafrica: 'South Africa',
	sydney: 'Sydney',
	'us-central': 'US Central',
	'us-east': 'US East',
	'us-west': 'US West',
	'us-south': 'US South'
};

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'serverinfo',
			displaying: true,
			description: 'Shows info about the server!',
			options: '',
			usage: `serverinfo => An embed will appear magically with info of the server!`,
			example: '',
			category: 'info',
			aliases: ['si', 'guildinfo']
		});
	}

	// eslint-disable-next-line no-unused-vars
	async run(message, args) {
		const roles = message.guild.roles.cache.sort((a, b) => b.position - a.position).map(role => role.toString());
		const members = message.guild.members.cache;
		const channels = message.guild.channels.cache;
		const emojis = message.guild.emojis.cache;
		// console.log(roles.length < 10 ? roles.join(', ') : roles.length > 10 ? this.client.utils.trimArray(roles).toString() : 'None')
		// **🌍❯ Region:** ${regions[message.guild.region]} >>> DEPRECATED SINCE EACH VC SUPPORTS DIFF REGION, THE SERVER DOESN'T NEED A REGION ANYMORE
		const boost_tiers = {
			null: 'No boosters in this server :((',
			NONE: 'No boosters in this server :(',
			TIER_1: 'At least 2 awesome nitro boosters here for a level 1 boost!',
			TIER_2: 'We have 15+ awesome people here boosting up to level 2!',
			TIER_3: 'Wow, congrats to these amazing 30+ people for the awesome boosts to level 3!',
		}
		const issuer = message.author;
		const SIembed = new SharuruEmbed()
			.setDescription(`**Info about __${message.guild.name}__**`)
			.setColor(Colors.LuminousVividPink)
			.setThumbnail(message.guild.iconURL({ dynamic: true }))
			.addFields(
				{name: 'General',value:`
**❯ Name:** ${message.guild.name}
**❯ ID:** ${message.guild.id}
**👑❯ Owner:** <@${message.guild.ownerId}> (${message.guild.ownerId})
**💎❯ Boost Tier [#${message.guild.premiumSubscriptionCount || '0'}]:** ${boost_tiers[message.guild?.premiumTier]}
**📅❯ Time Created:** on **${moment(message.guild.createdTimestamp).format('LL')}** at **${moment(message.guild.createdTimestamp).format('LT')}** (${moment(message.guild.createdTimestamp).fromNow()})
\u200b`},
				{name:"More Numbers!" ,value:
`**🔢❯ Role Count:** ${roles.length}
**🔢❯ Emoji Count:** ${emojis.size}
**🔢❯ Plain-Normal Emojis Count:** ${emojis.filter(emoji => !emoji.animated).size}
**🔢❯ Animated Emojis Count:** ${emojis.filter(emoji => emoji.animated).size}
**🔢❯ Members Count:** ${message.guild.memberCount}
**🧍❯  Humans:** ${members.filter(member => !member.user.bot).size}
**💻❯ Bots:** ${members.filter(member => member.user.bot).size}
**✏️❯ Text Channels:** ${channels.filter(channel => channel.type === 'GUILD_TEXT').size}
**🔈❯  Voice Channels:** ${channels.filter(channel => channel.type === 'GUILD_VOICE').size}
**🎙️❯ Stage Channels:** ${channels.filter(channel => channel.type === 'GUILD_STAGE_VOICE').size}
\u200b`},
{name: "Presence",value: `**💚❯ Online:** ${members.filter(member => member.presence?.status === 'online').size}
**💛❯ Idle:** ${members.filter(member => member.presence?.status === 'idle').size}
**❤️❯ Do Not Disturb:** ${members.filter(member => member.presence?.status === 'dnd').size}
**🖤❯ Offline:** ${members.filter(member => member.presence === null).size}
\u200b`},
{name: `Roles [${roles.length - 1}]`,value: roles.length < 10 ? roles.join(', ') : roles.length > 10 ? this.client.utils.trimArray(roles).join(", ") : 'None'}
			)
			.setFooter({text:`Requested by @${issuer.username} at `,iconURL: issuer.displayAvatarURL({dynamic: true})})
		message.channel.send({embeds: [SIembed]});
		// let thisObject = message.guild.members.fetch().then(i => thisObject = i)

        //     setTimeout(() => {
        //         let gm_online = thisObject.map(i => i.presence?.status == 'online').filter(Boolean).length
        //         let gm_idle = thisObject.map(i => i.presence?.status == 'idle').filter(Boolean).length
        //         let gm_dnd = thisObject.map(i => i.presence?.status == 'dnd').filter(Boolean).length
        //         let gm_offline = thisObject.map(i => i.presence === null).filter(Boolean).length

        //         let test = message.guild.members.cache
        //         console.log(test.filter(i => i.presence?.status == 'online').size)
        //         console.log(test.filter(i => i.presence?.status == 'idle').size)
        //         console.log(test.filter(i => i.presence?.status == 'dnd').size)
        //         console.log(test.filter(i => i.presence === null).size)
        //         console.log(`online: ${gm_online}\nidle: ${gm_idle}\ndnd: ${gm_dnd}\noffline: ${gm_offline}`)
        //     }, 250);
	}

};
