/* eslint-disable no-unused-vars */
const Command = require('../../Structures/Command.js');
const sendError = require('../../Models/Error');
const SharuruEmbed = require('../../Structures/SharuruEmbed')
const fs = require('fs');
const ms = require('ms');
const { PermissionsBitField, Colors } = require('discord.js');


module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'timestamp',
			displaying: true,
			cooldown: 2000,
			description: 'Convert from your time to timezone time! Also provides unix time if needed',
			options: '- \`tw\` => Use this option after the hour mentioned in case of living in an asian country. E.g: \`!timestamp 30oct2021 2pm tw, 25dec2021 5pm tw, etc\`',
			usage: ' <ddMMMyyyy> <HH:mm:ss/HHam/HHpm/HH:mmAM/HH:mmPM>',
			example: ' 30nov2021 9pm / 01Oct2021 6:59am / 09dec2021 11:59pm',
			category: 'utilities',
			userPerms: [PermissionsBitField.Flags.SendMessages],
			SharuruPerms: [PermissionsBitField.Flags.SendMessages],
			args: true,
			guildOnly: true,
			ownerOnly: false,
			roleDependable: '0', // not 0, either id or name
			allowTesters: false,
			aliases: ['tm']
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
		const logChannel = message.guild.channels.cache.find(ch => ch.name == "sharuru-logs");
		const prefix = this.client.prefixes.get(message.guild.id);

		let amORpm;
		if (hrs >= 0 && hrs <= 12) {
			amORpm = 'AM';
		} else {
			amORpm = 'PM';
		}

		const text_to_numbers_Months = {
			jan: 0,
			feb: 1,
			mar: 2,
			apr: 3,
			may: 4,
			jun: 5,
			jul: 6,
			aug: 7,
			sep: 8,
			oct: 9,
			nov: 10,
			dec: 11,
		}
		let entireOrder = args.join(" ").split(",")
		let timesArr = []
		for (let i = 0; i < entireOrder.length; i++) {
			entireOrder[i] = entireOrder[i].trim()
			let date_hour = entireOrder[i].split(" ")
			if (date_hour[1].length == 3 || date_hour[1].length == 4) { // 6pm
				date_hour[3] = parseInt(date_hour[1]); // hour
				date_hour[4] = 0; // min
				date_hour[5] = date_hour[1].slice(-2); // morning or past 12
			}
			if (date_hour[1].length == 5 || date_hour[1].length == 6 || date_hour[1].length == 7) { // 1:50pm
				date_hour[3] = parseInt(date_hour[1].slice(0,date_hour[1].indexOf(":"))); // hour
				date_hour[4] = parseInt(date_hour[1].slice(date_hour[1].indexOf(":")+1,date_hour[1].indexOf("a") || date_hour[1].indexOf("p"))); // min
				date_hour[5] = date_hour[1].slice(-2); // morning or past 12
			}
			let ob = {
				year: parseInt(date_hour[0].length == 8 ? date_hour[0].slice(4,8) : date_hour[0].slice(5,9)),
				month: text_to_numbers_Months[date_hour[0].length == 8 ? date_hour[0].slice(1,4).toLowerCase() : date_hour[0].slice(2,5).toLowerCase()],
				day: parseInt(date_hour[0].slice(0,2)),
				hour: date_hour[3],
				min: date_hour[4],
				early_late: date_hour[5],
				timezone: date_hour[2]
			}
			let newDate = new Date(ob.year, ob.month, ob.day, ob.early_late == "am" ? ob.hour : ob.hour+12,ob.min)
			if (ob.timezone != null) {
				console.log(`set to ${ob.timezone}`)
				newDate = newDate.toUTCString()
				console.log(newDate)
				newDate = new Date(newDate)
				newDate = new Date(newDate.getTime() + (newDate.getTimezoneOffset() * 60 * 1000))
			}
			console.log(ob)
			timesArr.push((Date.parse(newDate)/1000))
		}

		console.log(timesArr)
		let timeEmbed = new SharuruEmbed()
			.setColor(Colors.LuminousVividPink)
			.setFooter({text: `Requested by ${issuer.tag}`})
			.setTitle(`Below it's the time requested in local time format:`)
		
		const timezonesProcessed = []
		for (let i = 0; i < timesArr.length; i++) {
			const element = timesArr[i];

			let processThis = {
				name: `${i+1}) For "${entireOrder[i]}":`,
				value: `Unix timestamp: \`${element}\`
				Local Timezone: <t:${element}> <t:${element}:R>
				Code: \`<t:${element}>\` \`<t:${element}:R>\``
			}
			
			timezonesProcessed.push(processThis)
		}
		timeEmbed.addFields(timezonesProcessed)
		// Unix timestamp: \`${element}\`
		// 	Local Timezone: <t:${element}> <t:${element}:R>
		// 	Code: \`<t:${element}>\` \`<t:${element}:R>\`
		return message.channel.send({embeds: [timeEmbed]});
	}

};
