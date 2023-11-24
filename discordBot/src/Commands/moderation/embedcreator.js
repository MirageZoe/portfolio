/* eslint-disable no-unused-vars */
const Command = require('../../Structures/Command.js');
const sendError = require('../../Models/Error');
const { PermissionsBitField } = require('discord.js');
const guildsettings = require("../../Models/GuildSettings")
const fs = require('fs');
const ms = require('ms');
const pms = require("pretty-ms");
const SharuruEmbed = require('../../Structures/SharuruEmbed.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'embedcreator',
			displaying: true,
			description: 'Embed creator!',
			options: '',
			usage: '',
			example: '',
			category: 'moderation',
			userPerms: [PermissionsBitField.Flags.SendMessages,PermissionsBitField.Flags.EmbedLinks,PermissionsBitField.Flags.AttachFiles],
			SharuruPerms: [PermissionsBitField.Flags.SendMessages,PermissionsBitField.Flags.EmbedLinks,PermissionsBitField.Flags.AttachFiles],
			args: false,
			guildOnly: true,
			ownerOnly: false,
			aliases: ['ec']
		});
	}

	async run(message, args) {
		// eslint-disable-next-line id-length
		// if (!message.member.roles.cache.find(r => r.name === 'Disciplinary Committee')) return message.channel.send(`Command locked or it's in development`);
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
		const issuer = message.author;

		let amORpm;
		if (hrs >= 0 && hrs <= 12) {
			amORpm = 'AM';
		} else {
			amORpm = 'PM';
		}
		const prefix = this.client.prefixes.get(message.guild.id)
		const logchannel = message.guild.channels.cache.find(ch => ch.name == 'sharuru-logs')
		let getPrefixMap = this.client.prefixes;

		if(args[0] == 't'){
			message.channel.messages.fetch(`843235386046152714`).then(msg =>{
				console.log(msg.embeds)
			})
			return;
		}
		
        let emed = new SharuruEmbed()
            .setAuthor(`New Feature: Starbaord!`,message.guild.iconURL())
            .setColor(`RANDOM`)
            .setTimestamp()
            .setDescription(`This new feature lets you add messages, funny, stupid or both (huh?), in <#843789066712907806> by reacting with ⭐ to any message/image in the server. In order to send a message in  <#843789066712907806>, the message must have **5 or more** ⭐ reactions. The count may be adjusted in the future.
            Have fun with this new feature!`)
        message.channel.send(emed)
	}

};
