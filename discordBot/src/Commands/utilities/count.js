/* eslint-disable no-unused-vars */
const Command = require('../../Structures/Command.js');
const sendError = require('../../Models/Error');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const ms = require('ms');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'count',
			displaying: true,
			description: 'Counts the number of characters your text has!',
			options: '~',
			usage: '',
			example: '',
			category: 'utilities',
			userPerms: [PermissionsBitField.Flags.SendMessages],
			SharuruPerms: [PermissionsBitField.Flags.SendMessages],
			args: false,
			guildOnly: true,
			ownerOnly: false,
			aliases: ['cc']
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
		
		try {
			let content = args.splice(0).join(" ")
			console.log(content.length)
			let spaces = content.match(/\s/g)
            let words = content.split(" ")
            let chCount = words.join("")
            let waitingTime = 1000
            // if(words.length > 275) {
            //     waitingTime += 1500
            // }

            for(let i = 0; i < words.length; i++) {
                if(words[i].length < 2) words.splice(i,1)
            }
            
            // setTimeout(() => {
            await message.channel.send(`Content:\n\`\`\`diff\n${content.slice(0,100)}\n+ ${content.length-100} more characters...\n\`\`\`\nLetter Count: ${chCount.length}\nWords: ${words.length}\nSpaces: ${spaces?.length ?? '0'}\nTotal Characters: ${content.length}`)
            // }, waitingTime);
        } catch (error) {
            console.log(error)
        }
	}

};
