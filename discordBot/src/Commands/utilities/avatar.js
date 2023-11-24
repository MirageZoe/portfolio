/* eslint-disable no-unused-vars */
const Command = require('../../Structures/Command.js');
const sendError = require('../../Models/Error');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const ms = require('ms');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'avatar',
			displaying: true,
			description: 'Get your avatar or someone\'s avatar!',
			options: '\n- \`no option\` => it will get your avatar;\n- \`@mention\` => get the avatar of the mentioned member.',
			usage: '',
			example: ' @bob => get bob\'s avatar ',
			category: 'utilities',
			userPerms: [PermissionsBitField.Flags.SendMessages],
			SharuruPerms: [PermissionsBitField.Flags.SendMessages],
			args: false,
			guildOnly: true,
			ownerOnly: false,
			aliases: ['av']
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

		// sendError.create({
		// 	Guild_Name: message.guild.name,
		// 	Guild_ID: message.guild.id,
		// 	User: issuer.tag,
		// 	UserID: issuer.id,
		// 	Error: error,
		// 	Time: `${TheDate} || ${clock} ${amORpm}`,
		// 	Command: this.name,
		// 	Args: args,
		// },async (err, res) => {
		// 	if(err) {
		// 		console.log(err)
		// 		return message.channel.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
		// 	}
		// 	if(res) {
		// 		console.log(`successfully added error to database!`)
		// 	}
		// })

		let tmentions = message.mentions.users.size;
		const issuer = message.author;

		if (tmentions == 0){
			let userAVT = issuer.displayAvatarURL({dynamic: true, size: 1024})
			if(userAVT){
				let ownAv = new EmbedBuilder()
					.setAuthor({name: `${issuer.tag}'s avatar!`})
					.setImage(userAVT)
					.setColor(`Random`)
					.setFooter({text: `Requested by ${issuer.tag} at `})
					.setTimestamp()
				return message.channel.send({embeds: [ownAv]});
			}else{
				return message.channel.send(`Sadly you don't have any picture as your avatar so I can't send you anything!`);
			}
		} else {//member av
			let userAVT = message.mentions.users.first().displayAvatarURL({dynamic: true, size: 1024});
			if(userAVT){
				let ownAv = new EmbedBuilder()
					.setAuthor({name: `${message.mentions.users.first().username}'s avatar!`})
					.setImage(userAVT)
					.setColor(`Random`)
					.setFooter({text: `Requested by ${issuer.tag} at `})
					.setTimestamp()
				return message.channel.send({embeds: [ownAv]});
			} else {
				return message.channel.send(`Sadly the member you mentioned doesn't have any picture on their profile so I can't send you a anything!`);
			}
		}
	}

};
