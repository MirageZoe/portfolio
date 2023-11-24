/* eslint-disable no-unused-vars */
const Command = require('../../Structures/Command.js');
const sendError = require('../../Models/Error');
const SharuruEmbed = require("../../Structures/SharuruEmbed")
const profileSys = require("../../Models/profiles");
const _ = require('lodash')
const math = require('mathjs')
const fs = require('fs');
const ms = require('ms');
const { all } = require('mathjs');
const { PermissionsBitField } = require('discord.js');


module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'report',
			displaying: true,
			description: 'Report someone that is behaving bad in the server!',
			// options: '',
			usage: ' @mention is mean with me!',
			example: ' @bob because he told me that I\'m ugly',
			category: 'utilities',
			userPerms: [PermissionsBitField.Flags.SendMessages],
			SharuruPerms: [PermissionsBitField.Flags.SendMessages],
			args: false,
			guildOnly: true,
			ownerOnly: false,
			aliases: ['rep']
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
		const issuer = message.author;

		let amORpm;
		if (hrs >= 0 && hrs <= 12) {
			amORpm = 'AM';
		} else {
			amORpm = 'PM';
        }
        const logs = message.guild.channels.cache.find(ch => ch.name === 'sharuru-logs')
        const reportedMember = message.mentions.users.first()
        if(!reportedMember) return message.reply(`You need to mention a member to report them!`)
        let embed = new SharuruEmbed()
            .setAuthor(`${issuer.tag} reported ${reportedMember.tag}`,issuer.displayAvatarURL())
            .setDescription(args.slice(1).join(" "))
            .setColor(`RANDOM`)
            .setThumbnail(reportedMember.displayAvatarURL({dynamic: true}))
            .setTimestamp()
            .setFooter(`Reported at`)
        logs.send({embeds: [embed]})

        // return message.channel.send(embed)

	}

};
