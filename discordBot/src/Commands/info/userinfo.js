const Command = require('../../Structures/Command.js');
const { Colors, flag } = require('discord.js');
const moment = require('moment');
const SharuruEmbed = require('../../Structures/SharuruEmbed.js');
const flagsOld = {
	DISCORD_EMPLOYEE: 'Discord Employee',
	PARTNERED_SERVER_OWNER: 'Discord Partner',
	BUGHUNTER_LEVEL_1: 'Bug Hunter (Level 1)',
	BUGHUNTER_LEVEL_2: 'Bug Hunter (Level 2)',
	HYPESQUAD_EVENTS: 'HypeSquad Events',
	HOUSE_BRAVERY: 'House of Bravery',
	HOUSE_BRILLIANCE: 'House of Brilliance',
	HOUSE_BALANCE: 'House of Balance',
	EARLY_SUPPORTER: 'Early Supporter',
	TEAM_USER: 'Team User',
	SYSTEM: 'System',
	VERIFIED_BOT: 'Verified Bot',
	EARLY_VERIFIED_BOT_DEVELOPER: 'Early Verified Bot Developer',
	DISCORD_CERTIFIED_MODERATOR: 'Certified Discord Moderator'
};
const flags = {
	STAFF: 'Discord Employee',
	PARTNER: 'Discord Partner',
	HYPESQUAD: "HypeSquad Events Member",
	BUG_HUNTER_LEVEL_1: 'Bug Hunter (Level 1)',
	BUG_HUNTER_LEVEL_2: 'Bug Hunter (Level 2)',
	HYPESQUAD_ONLINE_HOUSE_1: 'House of Bravery',
	HYPESQUAD_ONLINE_HOUSE_2: 'House of Brilliance',
	HYPESQUAD_ONLINE_HOUSE_3: 'House of Balance',
	PREMIUM_EARLY_SUPPORTER: 'Early Nitro Supporter',
	TEAM_PSEUDO_USER: 'User is a team',
	SYSTEM: 'System',
	VERIFIED_BOT: 'Verified Bot',
	VERIFIED_DEVELOPER: 'Early Verified Bot Developer',
	CERTIFIED_MODERATOR: 'Moderator Programs Alumni',
	BOT_HTTP_INTERACTIONS: "Bot uses only HTTP interactions and is shown in the online member list",
	ACTIVE_DEVELOPER: "User is an Active Developer"
};
module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'userinfo',
			displaying: true,
			description: 'Shows info about a member!',
			options: '\n@mention => mention someone to look at their info, otherwise it will show yours!',
			usage: '@mention',
			example: `userinfo @bob`,
			category: 'info',
			aliases: ['ui', 'user']
		});
	}

	// eslint-disable-next-line no-unused-vars
	async run(message, [target]) {
		// console.log(target)
		const member = message.mentions.members.last() || message.guild.members.cache.get(target) || message.member;
		const roles = member.roles.cache
			.sort((a, b) => b.position - a.position)
			.map(role => role.toString())
			.slice(0, -1);
		const userBadges = member.user.flags.toArray();
		const embed = new SharuruEmbed()
			.setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
			.setColor(Colors.LuminousVividPink)
			.addFields(//**❯ Badges:** ${userBadges.length > 0 ? userBadges.map(flag => flags[flag]).join(', ') : 'None'}
				{name:'Individual',value: `
**❯ Discord Name:** ${member.user.username}
**❯ ID:** ${member.id}
**❯ Avatar:** [Click me](${member.user.displayAvatarURL({ dynamic: true })})
**❯ Account Created:** **${moment(member.user.createdTimestamp).format('LL')}** at **${moment(member.user.createdTimestamp).format('LT')}** *(${moment(member.user.createdTimestamp).fromNow()})*
**❯ Status:** ${member.presence.status}
**❯ Game:** ${member.presence.game || 'Not playing at the moment.'}
\u200b`
				},
				{name: `Member`,value:`
**❯ Highest Role:** ${member.roles.highest.id === message.guild.id ? 'None' : member.roles.highest.name}
**❯ Joined Server on:** **${moment(member.joinedAt).format('LL')}** at **${moment(member.joinedAt).format('LT')}**
**❯ Hoist Role [?](https://discordia.me/en/roles):** ${member.roles.hoist ? member.roles.hoist.name : 'None'}
**❯ Roles [${roles.length}]:** ${roles.length < 10 ? roles.join(' | ') : roles.length > 10 ? this.client.utils.trimArray(roles) : 'None'}
\u200b`
			})
		return message.channel.send({embeds: [embed]});
	}

};
