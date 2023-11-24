/* eslint-disable no-unused-vars */
const Command = require('../../Structures/Command.js');
const sendError = require('../../Models/Error');
const { PermissionsBitField } = require('discord.js');
const fs = require('fs');
const ms = require('ms');
const SharuruEmbed = require('../../Structures/SharuruEmbed.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'afk',
			displaying: true,
			description: 'Go afk without worring about pings...',
			options: '\n\`reason\` => let a message after you leave if you want [OPTIONAL]',
			usage: '',
			example: ' going to store',
			category: 'utilities',
			userPerms: [PermissionsBitField.Flags.SendMessages],
			SharuruPerms: [PermissionsBitField.Flags.SendMessages],
			args: false,
			guildOnly: true,
			ownerOnly: false,
			aliases: ['brb']
		});
	}

	async run(message, args) {
		// eslint-disable-next-line id-length

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

		
        if(args[0] == 't'){
            console.log(this.client.afk)
            return
        }
		const issuer = message.author;
        let reason = args.join(" ") ? args.join(" ") : `I'm currently afk, I will reply as soon as possible!`;
        // let mentioned = message.guild.members.cache.get(message.mentions.users.first());
        let checkUser = this.client.afk.get(issuer.id);
        if(!checkUser){
            let obj = {
                id: issuer.id,
                nickname: message.member.nickname || null,
                usertag: issuer.tag,
                pings: [],
                reason: reason
            }
            this.client.afk.set(issuer.id,obj);
            try {
				console.log(`is owner?: ${message.guild.ownerId == issuer.id ? `yes` : `no`}`)
				console.log(`I have higher roles?: ${message.guild.me.roles.highest.position > message.member.roles.highest.position ? `yes` : `no`}`)
				console.log(`has admin perms?: ${message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) ? `yes` : `no`}`)
				console.log(`I have manage nick?: ${message.guild.me.permissions.has(Permissions.FLAGS.MANAGE_NICKNAMES) ? `yes` : `no`}`)
                if(message.guild.ownerId !== issuer.id && message.guild.me.roles.highest.position > message.member.roles.highest.position && !message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) && message.guild.me.permissions.has(Permissions.FLAGS.MANAGE_NICKNAMES)){
                    message.member.setNickname(`[AFK]${issuer.displayName ? issuer.displayName : issuer.username}`,`Member used afk command.`)
                }
				let afkEmbed = new SharuruEmbed()
					.setDescription(`${issuer} okay, I will remember to anyone that mention you to read this message:\n***\`\`\`${reason}\`\`\`***`)
					.setColor(`LUMINOUS_VIVID_PINK`)
                return message.channel.send({embeds: [afkEmbed]}).then(msg => deleteMsg(msg,'3.5s'))
            } catch (error) {
                console.log(error)
				console.log(`I can't change because:\n- No permissions probably.\n- Member has same or higher role.`)
				sendError.create({
					Guild_Name: message.guild.name,
					Guild_ID: message.guild.id,
					User: issuer.tag,
					UserID: issuer.id,
					Error: error,
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
					}
				})
                return message.channel.send(`Unfortunately a problem happened while trying to change nickname. Usually this is because I'm trying to change the nickname of a person of higher hierarchy. If this persist please contact my partner!`)
            }
        }
		function deleteMsg(msg,time) {
			setTimeout(() => {
				msg.delete()
			}, ms(time));
		}
	}

};
