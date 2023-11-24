/* eslint-disable no-unused-vars */
const Command = require('../../Structures/Command.js');
const sendError = require('../../Models/Error');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const math = require('mathjs')
const fs = require('fs');
const ms = require('ms');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'math',
			displaying: true,
			description: 'Calculator for use.',
			// options: '',
			// usage: '',
			// example: '',
			category: 'utilities',
			userPerms: [PermissionsBitField.Flags.SendMessages],
			SharuruPerms: [PermissionsBitField.Flags.SendMessages],
			args: false,
			guildOnly: true,
			ownerOnly: false,
			// aliases: ['']
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

		if(!args[0]) return message.channel.send(`You forgot to add something! Try 1+1 to see what it does :)`)

        let resp;
        try{
            resp = math.evaluate(args.join(" "));
        }catch(err){
            console.log(err)
            return message.channel.send(`Add something that can be calculated!!!\nYou cannot make this because: ${err.message}`)
        }

        const embed = new EmbedBuilder()
            .setColor(`RANDOM`)
            .setTitle("Maths...")
            .addField(`What had to be calculated:`,`\`\`\`js\n${args.join("")}\`\`\``)
            .addField(`Result:`,`\`\`\`js\n${resp}\`\`\``)

        return message.channel.send({embeds: [embed]})

	}

};
