/* eslint-disable no-unused-vars */
const Command = require('../../Structures/Command.js');
const muteSystem = require("../../Models/mutes")
const sendError = require('../../Models/Error')
const { PermissionsBitField } = require('discord.js');
const fs = require('fs');
const ms = require('ms');
const pms = require('pretty-ms')

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'unmute',
			displaying: true,
			description: 'Unmute Command. Let the member talk again.',
			options: '',
			usage: '<@member> [reason]',
			example: '@Bob for building what I told him to',
			category: 'moderation',
			userPerms: [PermissionsBitField.Flags.ManageChannels,PermissionsBitField.Flags.MuteMembers,PermissionsBitField.Flags.DeafenMembers,PermissionsBitField.Flags.ManageRoles],
			SharuruPerms: [PermissionsBitField.Flags.ManageChannels,PermissionsBitField.Flags.MuteMembers,PermissionsBitField.Flags.DeafenMembers,PermissionsBitField.Flags.ManageRoles],
			args: true,
			guildOnly: true,
			ownerOnly: false,
		});
	}

	async run(message, args) {
		// eslint-disable-next-line id-length

		message.delete()
		var clock = new Date();
		var ss = String(clock.getSeconds()).padStart(2, '0');
		var min = String(clock.getMinutes()).padStart(2, '0');
		var hrs = String(clock.getHours()).padStart(1, '0');
		clock = `${hrs}:${min}:${ss}`;

		var TheDate = new Date();
		var zilelesaptamanii = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
		var weekday = zilelesaptamanii[TheDate.getDay()];
		var dd = String(TheDate.getDate()).padStart(2, '0');
		var mon = String(TheDate.getMonth() + 1);
		var year = String(TheDate.getFullYear()).padStart(4, '00');
		TheDate = `${weekday}, ${mon}/${dd}/${year}`;
		let amORpm;
		if (hrs >= 0 && hrs <= 12) {
			amORpm = 'AM';
		} else {
			amORpm = 'PM';
        }

		const prefix = this.client.prefixes.get(message.guild.id)
        
		if(!args[0] || args[0] == "help"){
            return message.channel.send(`Usage: ${prefix}unmute <user> [reason]`);
        };

		const issuer = message.author;
        const modlog = message.guild.channels.cache.find(channel => channel.name === 'sharuru-logs');
		const toMute = message.guild.members.cache.get(message.mentions.users.first()?.id || args[0]);
		const muterole = message.guild.roles.cache.find(r => r.name === "muted");
		let reason = args.slice(1).join(" ");
		if (!reason) reason = `No reason given at the time.`;

        if (!toMute) return message.channel.send(`${issuer}, Please mention a member!`);

        if (toMute.permissions.has(Permissions.FLAGS.ADMINISTRATOR) || toMute.roles.highest.position >= message.member.roles.highest.position) return message.channel.send(`${issuer}, I can't do that since the member that you tried to unmute has:\n1) Administrator permissions;\n2) Same role (${toMute.roles.highest}) like you or higher.`)
		
		if (toMute.id === issuer.id) return

		if (!toMute.roles.cache.find(muterole => muterole.name === `muted`)) return message.channel.send(`${toMute} is already unmuted, ${issuer}.`)

		if (!muterole) {
			try {
				muterole = await message.guild.roles.create({
						name: "muted",
						color: "#000000",
						permissions: [],
						reason: `muted role wasn't found! Created a new one!`                
				})
				message.guild.channels.cache.forEach(async (thechan, id) => {
					await thechan.permissionOverwrites.edit(muterole, {
						SEND_MESSAGES: false,
						ADD_REACTIONS: false,
						SEND_TTS_MESSAGES: false,
						ATTACH_FILES: false,
						SPEAK: false
					})
				})
			} catch (e) {
				console.log(e.stack);
			}
		}

		muteSystem.findOneAndDelete({
			UserID: toMute.id,
		},async (err, res) => {
			if(err) {
				sendError.create({
					Guild_Name: message.guild.name,
					Guild_ID: message.guild.id,
					User: issuer.tag,
					UserID: issuer.id,
					Error: err,
					Time: `${TheDate} || ${clock} ${amORpm}`,
					Command: this.name,
					Args: args,
				},async (err, res) => {
					if(err) {
						console.log(err)
						return message.channel.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
					}
					if(res) {
						console.log(`successfully added error to database!`)
						return message.channel.send(`Unfortunately a problem appeared while processing your unmute command so please try again later!`).then(m => m.delete({timeout: 5500}))

					}
				})
			}
			if(res) {
				await toMute.roles.remove(muterole)
				message.channel.send(`${toMute} is now unmuted!`)
				const muteembed = new MessageEmbed()
				.setAuthor('Action | Unmute', `https://images-ext-2.discordapp.net/external/Wms63jAyNOxNHtfUpS1EpRAQer2UT0nOsFaWlnDdR3M/https/image.flaticon.com/icons/png/128/148/148757.png`)
				.addField('Moderator: ', `${issuer}`)
				.addField('Member unmuted: ', toMute.toString())
				.addField('Reason: ', `${reason}`)
				.addField(`Unmuted manually at:`,TheDate+ " at "+ clock+" "+amORpm)
				.setColor('#D9D900')
			modlog.send({embeds: [muteembed] })
			} else {
				return message.channel.send(`${issuer}, I don't think this user is muted by me at least, otherwise I would have unmuted him but I don't remember muting him... maybe someone else from staff ?`)
			}
		})
	}
};
