/* eslint-disable no-unused-vars */
const Command = require('../../Structures/Command.js');
const muteSystem = require("../../Models/mutes");
const sendError = require('../../Models/Error');
const { PermissionsBitField } = require('discord.js');
const fs = require('fs');
const ms = require('ms');
const pms = require('pretty-ms');
const SharuruEmbed = require('../../Structures/SharuruEmbed.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'mute',
			displaying: true,
			description: 'Mute Command. Silence someone that isn\'t quite nice.',
			options: '- \`list\` => shows a list of members that are currently muted!',
			usage: '<@member> <time: 1min,1h,1d> [reason]',
			example: '@Bob 5min for not building what I told him to',
			category: 'moderation',
			userPerms: [PermissionsBitField.Flags.ManageChannels,PermissionsBitField.Flags.MuteMembers,PermissionsBitField.Flags.DeafenMembers,PermissionsBitField.Flags.ManageRoles],
			SharuruPerms: [PermissionsBitField.Flags.ManageChannels,PermissionsBitField.Flags.MuteMembers,PermissionsBitField.Flags.DeafenMembers,PermissionsBitField.Flags.ManageRoles],
			args: true,
			guildOnly: true,
			ownerOnly: false,
			aliases: ['stop','silence']
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
		const issuer = message.author;
		if(!args[0] || args[0] == "help"){
            return message.channel.send(`${issuer}, Usage: \`${prefix}mute <user> <time: 1min,2min,1h,2h> [reason]\``);
        };

		let systemMuted = {};
		let mutedPeople_server = null;
        const modlog = message.guild.channels.cache.find(channel => channel.name === 'sharuru-logs');
		const toMute = message.guild.members.cache.get(message.mentions.users.first() ? message.mentions.users.first().id : message.guild.members.cache.get(args[0]));
		let muterole = message.guild.roles.cache.find(r => r.name === "muted");
		if(args[0] == 'list'){
			let mutedPeople_db = []
			let mutedPeople_db_2 = []
			muteSystem.find({
				Guild_ID: message.guild.id
			},async(err,res)=>{
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
							return message.channel.send(`Unfortunately a problem appeared so please try again later!`).then(m => deleteMsg(m,'5.5s'))
	
						}
					})
				}
				if(res){
					for(let i = 0; i < res.length; i++)	{
						mutedPeople_db.push(res[i].UserID)
					}
				}
			})
			mutedPeople_server = message.guild.roles.cache.get(muterole.id).members.map(m => m.user.id)//.join("\n");
			setTimeout(() => {

				//setting up the people muted by system/command
				mutedPeople_db_2 = mutedPeople_db;
				if(mutedPeople_db.length > 1){
					for(let i = 0; i < mutedPeople_db.length; i++){
						mutedPeople_db[i] = `- <@${mutedPeople_db[i]}>`
					}
				}
				if(mutedPeople_db.length == 0) mutedPeople_db = `No one is currently muted by system/command.`
				
				//setting up the people muted manually by mods+
				if(mutedPeople_server.length > 0){
					mutedPeople_server = mutedPeople_server.filter(val => !mutedPeople_db_2.includes(val));
					for(let i = 0; i < mutedPeople_server.length; i++){
						mutedPeople_server[i] = `- <@${mutedPeople_server[i]}>`
					}
				}
				if(mutedPeople_server.length == 0) mutedPeople_server = `No one is currently muted manually by staff.`
						
				let mutedPeople = new SharuruEmbed()
				.setAuthor(`Currently these are the people muted so far:`,issuer.displayAvatarURL())
				.addFields([
					{name: `Members muted by Warning System/Command:`,value: mutedPeople_db.includes('No') ? mutedPeople_db : mutedPeople_db.join(",\n")},
					{name: `Members muted manually by Staff`,value: mutedPeople_server.includes("No") ? mutedPeople_server : mutedPeople_server.join(",\n")}
				])
				.setColor("RANDOM")
				.setFooter(`Requested by ${issuer.tag} at `)
				.setTimestamp()
				return message.channel.send({ embeds: [mutedPeople] })
			}, 500);
			return console.log(`done`)
		}

		// if (!args[1]) return message.channel.send(`${issuer}, you forgot to specify a time. Please type a time after mentioning the user: 1min, 20min, 1h;`).then(m=> deleteMsg(m,'5.5s'))
		let mutetime = args[1]
		let stopWork = false
		if (!args[1]) mutetime = 3600
		if(isNaN(mutetime) == true) {
			mutetime = ms(mutetime);
			stopWork = true
		}
		if(isNaN(mutetime) == false && stopWork == false) {
			if (mutetime >= 1 && mutetime <= 6) mutetime = mutetime+'h'
			if (mutetime >= 7 && mutetime <= 99) mutetime = mutetime+'min'
			if (mutetime >= 100) mutetime = mutetime+'s'
			message.channel.send(`${issuer}, because there was no measurement time provided, I'll decide in your place how much ${toMute} will be muted: **${mutetime}**`)
			mutetime = ms(mutetime)
		}
		if(issuer.id == this.client.owners){
			console.log(`This is my partner! I'll let my partner put any time she wants!`)
		} else {
			if (mutetime < 300000 || mutetime > 1209600000) return message.channel.send(`${issuer}, You cannot mute people for less than 5 minutes or more than 2 weeks (might as well kick/temp ban them).`).then(m=> deleteMsg(m,'5.5s'))
		}
		let reason = args.slice(2).join(" ");
		if (!reason) reason = `No reason given at the time.`;

        if (!toMute) return message.channel.send(`${issuer}, Please mention a member!`).then(m=> deleteMsg(m,'3.5s'))

		let showDiff;
		let stopThis = false
		if(toMute.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
			showDiff += `- has administrator permission`
			stopThis = true
		}
		if (toMute.roles.highest.position >= message.member.roles.highest.position) {
			stopThis = true
			showDiff += `- same role (${toMute.roles.highest}) or higher.`
		}
		if (stopThis) return message.channel.send(`${issuer}, I can't do that since the member that you tried to mute has:\n${showDiff}.`).then(m=> deleteMsg(m,'15s'))

		if (toMute.id === issuer.id) return // message.channel.send(`${issuer}, you cannot mute yourself.`);

		if (toMute.roles.cache.find(muterole => muterole.name === `muted`)) return message.channel.send(`${toMute} is already muted, ${issuer}.`).then(m=> deleteMsg(m,'3.5s'))

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
						CREATE_INSTANT_INVITE: false,
						SEND_MESSAGES: false,
						ADD_REACTIONS: false,
						SEND_TTS_MESSAGES: false,
						ATTACH_FILES: false,
						SPEAK: false,
						CHANGE_NICKNAME: false,
						USE_EXTERNAL_STICKERS: false
					})
				})
			} catch (e) {
				console.log(e.stack);
				return modlog.send(`Unfortunately an error happened while trying to create \`muted\` role. If the role was created by any chance, it might not have the permissions set up. If this persist ,please contact my partner!`)
			}
		}

		muteSystem.create({
			Guild_Name: message.guild.name,
			Guild_ID: message.guild.id,
			User: toMute.user.username,
			UserID: toMute.id,
			MutedBy: issuer.id,
			Time: Date.now() + mutetime,
			Reason: reason,
			Date: TheDate + " || " + clock + " " + amORpm
		},async (error, res) => {
			if(error) {
				sendError.create({
					Guild_Name: message.guild.name,
					Guild_ID: message.guild.id,
					User: issuer.tag,
					UserID: issuer.id,
					Error: error,
					Time: `${TheDate} || ${clock} ${amORpm}`,
					Command: this.name + ' creating doc for muted person',
					Args: args,
				},async (err, res) => {
					if(err) {
						console.log(err)
						return message.channel.send(`Unfortunately an problem appeared at sending error. Please try again later. If this problem persist, contact my partner!`)
					}
					if(res) {
						console.log(`successfully added error to database!`)
					}
				})
			}
			if(res) {
				await toMute.roles.add(muterole)
				message.channel.send(`${toMute} is now silenced!`).then(m => deleteMsg(m,'3.5s'))
				const muteembed = new MessageEmbed()
				.setAuthor('Action | Mute', `https://images-ext-2.discordapp.net/external/Wms63jAyNOxNHtfUpS1EpRAQer2UT0nOsFaWlnDdR3M/https/image.flaticon.com/icons/png/128/148/148757.png`)
				.addField('Moderator: ', `${issuer}`)
				.addField('Member muted: ', toMute.toString())
				.addField(`Time muted:`,`${pms(mutetime,{verbose: true})}`)
				.addField('Reason: ', `${reason}`)
				.addField(`Muted at:`,TheDate+ " at "+ clock+" "+amORpm)
				.addField(`Unmuted at:`, this.client.utils.convertTime(Date.now()+mutetime,true))
				.setColor('#D9D900')
			modlog.send({ embeds: [muteembed] })
			}
		})

		function deleteMsg(msg,time) {
			setTimeout(() => {
				msg.delete()
			}, ms(time));
		}
	}
};
