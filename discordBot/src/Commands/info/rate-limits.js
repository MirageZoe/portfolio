/* eslint-disable no-unused-vars */
const Command = require('../../Structures/Command.js');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const ms = require('ms');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'rate-limits',
			displaying: true,
			description: 'Shows info about discord js limits!',
			category: 'info',
			aliases: ['discord-limits','ratelimit','ratelimits','dl']
		});
	}

	async run(message, args) {
		// eslint-disable-next-line id-length
		// if (!message.member.roles.cache.find(r => r.name === 'Disciplinary Committee')) return message.channel.send(`Command locked or it's in development`);

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

		const rateLimits = `\`\`\`REST:
		POST Message |  5/5s    | per-channel
	  DELETE Message |  5/1s    | per-channel
 PUT/DELETE Reaction |  1/0.25s | per-channel
		PATCH Member |  10/10s  | per-guild
   PATCH Member Nick |  1/1s    | per-guild
	  PATCH Username |  2/3600s | per-account
	  |All Requests| |  50/1s   | per-account

WS:
	 Gateway Connect |   1/5s   | per-account
	 Presence Update |   5/60s  | per-session
 |All Sent Messages| | 120/60s  | per-session
            \`\`\``;

		return message.channel.send({ content: rateLimits});
	}

};
