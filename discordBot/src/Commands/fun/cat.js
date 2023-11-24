/* eslint-disable no-unused-vars */
const Command = require('../../Structures/Command.js');
const sendError = require('../../Models/Error');
const { PermissionsBitField } = require('discord.js');
const fetch = require('node-fetch')
const fs = require('fs');
const ms = require('ms');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'cat',
			displaying: true,
			description: 'Cute kitties ^^!',
			// options: '',
			// usage: '',
			// example: ' @bob => get bob\'s avatar ',
			category: 'fun',
			userPerms: [PermissionsBitField.Flags.SendMessages],
			SharuruPerms: [PermissionsBitField.Flags.SendMessages],
			args: false,
			guildOnly: true,
			ownerOnly: false,
			aliases: ['kitty']
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
		const issuer = message.author;
		message.delete()

		try {
			fetch(`https://api.thecatapi.com/v1/images/search`)
			.then(res => res.json()).then(body => {
				if(!body[0]) return message.reply("whoops! I've broke, try again!")
				let cEmbed = new MessageEmbed()
				.setColor(`RANDOM`)
				.setAuthor(`There you go: Kitties!`, message.guild.iconURL({dynamic: true}))
				.setImage(body[0].url)
				.setTimestamp()
				.setFooter(`Requested by ${issuer.tag} at `,issuer.displayAvatarURL({dynamic: true}))

		
					message.channel.send({embeds: [cEmbed]});
				})
		} catch (error) {
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
					console.log(error)
					console.log(`successfully added error to database!`)
					return message.channel.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
				}
			})
		}
		
	}	

};
