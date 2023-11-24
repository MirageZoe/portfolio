const path = require('path');
const { promisify } = require('util');
const glob = promisify(require('glob'));
const Command = require('./Command.js');
const Event = require('./Event.js');
const guildSettings = require('../Models/GuildSettings');
const ms = require('ms')
const ascii = require("ascii-table")
const table = new ascii().setHeading("Slash Commands:", "Status");
const config = require("../../config.json")
const { REST, Routes } = require("discord.js")

module.exports = class Util {

	constructor(client) {
		this.client = client;
	}

	isClass(input) {
		return typeof input === 'function' &&
        typeof input.prototype === 'object' &&
        input.toString().substring(0, 5) === 'class';
	}

	get directory() {
		return `${path.dirname(require.main.filename)}${path.sep}`;
	}

	formatArray(array, type = 'conjunction') {
		return new Intl.ListFormat('en-GB', { style: 'short', type: type }).format(array);
	}

	removeDuplicates(arr) {
		return [...new Set(arr)];
	}

	capitalise(string) {
		return string.split(' ').map(str => str.slice(0, 1).toUpperCase() + str.slice(1)).join(' ');
	}

	checkOwner(target) {
		return this.client.owners.includes(target)
	}

	comparePerms(member, target) {
		return member.roles.highest.position < target.roles.highest.position
	}

	formatBytes(bytes) {
		if (bytes === 0) return '0 Bytes';
		const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
		const i = Math.floor(Math.log(bytes) / Math.log(1024));
		return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
	}

	formatPerms(perm) {
		return perm
			.toLowerCase()
			.replace(/(^|"|_)(\S)/g, (s) => s.toUpperCase())
			.replace(/_/g, ' ')
			.replace(/Guild/g, 'Server')
			.replace(/Use Vad/g, 'Use Voice Activity');
	}

	trimArray(arr, maxLen = 10) {
		if (arr.length > maxLen) {
			const len = arr.length - maxLen;
			arr = arr.slice(0, maxLen);
			arr.push(`${len} more...`);
		}
		return arr;
	}

	getPrefix(id) {
		return this.client.prefixes.get(id)
	}

	
	deleteMsg(msg, time) {
		setTimeout(() => {
			msg.delete()
		}, ms(time));
	}

	/**
	 * 
	 * @param {Number} unixTime The epoch time (in seconds) passed since Jan 01 1970. (UTC).
	 * @param {Boolean} checkNullish Checks if null / undefined. If yes, it will give "Unknown" value
	 */
	 convertTime(unixTime, checkNullish) {
		if (checkNullish == undefined) checkNullish = false//console.log(`CheckNullish parameter wasn't specified! Setting up to false`)
		
		let amORpm;
		let check;
		let a = new Date(unixTime);
		let months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
		let days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
		let year = a.getFullYear();
		let month = months[a.getMonth()];
		let day = days[a.getDay()];
		let date = a.getDate();
		let hour = String(a.getHours()).padStart(1, '0');
		let min = String(a.getMinutes()).padStart(2, '0');
		let sec = String(a.getSeconds()).padStart(2,'0');
		if (hour >= 0 && hour <= 12) {
			amORpm = 'AM';
		} else {
			amORpm = 'PM';
		}

		if (checkNullish == true) {
			day = day ?? "Unknown";
			month = month ?? 'Unknown';
			date = date ?? 'Unknown';
			year = year ?? 'Unknown';
			hour = hour ?? 'Unknown';
			min = min ?? 'Unknown';
			sec = sec ?? 'Unknown';
			// console.log(`day: ${day}\nmonth: ${month}\ndate: ${date}\nyear: ${year}\nhour: ${hour}\nmin: ${min}`)
			if(day == 'Unknown' && month == 'Unknown' && isNaN(date) && isNaN(year) && isNaN(hour) && isNaN(min)) {
				check == 'Unknown'
			} else {
				check = ``
				if (day !== 'Unknown') check += day;
				if (month !== 'Unknown') check +=` `+ month;
				if (!isNaN(date)) check += ` `+date;
				if (!isNaN(year)) check += `, `+year;
				if (!isNaN(hour)) check += ` `+hour;
				if (!isNaN(min)) check += `:`+min + " " + sec + " " + amORpm;
			}
		} else {
			check = `${day}, ${month} ${date}, ${year} at ${hour}:${min}:${sec} ${amORpm}`
		}
		let time = check
		return time
	}

	/**
	 * @description The Message Garbage Collector will try to fetch from cache the message and delete if the "expireDate" is lower than current date.
	 * @param {Number} guildId The id of the guild to search in.
	 * @param {Number} channelId The id of the channel to search through.
	 * @param {Number} messageId The id of the message to get.
	 * @param {Number} expireDate The time to set to expire after.
	 */
	mgoAdd(guildId, channelId,messageId,expireDate) {
		let objToAdd = {
			guildID: guildId,
			channelID: channelId,
			messageID: messageId,
			expireDate: Date.now() + expireDate
		}
		// console.log(`Obj:`,objToAdd)
		// console.log(`time now:`,Date.now())
		// console.log(`expiredate: `,expireDate)
		this.client.msgGarbageCollector.set(messageId,objToAdd);
		return console.log(`[Message-Garbage-Collector::${this.client.utils.convertTime(Date.now(),false)}]: Added a new message to delete!`)
	}

	async loadSlashCommands() {
		const Files = await glob(`${this.directory}CommandsSlash/**/*.js`);
		Files.forEach((file) => delete require.cache[require.resolve(file)]);
		await this.client.slashCommands.clear();
		
		const slashCommandsArray = [];
		// const commandsPath = path.join(__dirname, 'CommandsSlash');
		Files.forEach((file) =>{
			const command = require(file);
			// const filePath = path.join(commandsPath, file);

			// console.log(file)
			// console.log(command)
			if ('data' in command && 'execute' in command) {
				this.client.slashCommands.set(command.data.name, command);
				// console.log(command.data);
				slashCommandsArray.push(command.data.toJSON())
				table.addRow(command.data.name, "✅")
			} else {
				console.log(`[SHARURU-WARNING]: The command at:\n"${file}"\n==> is broken! "data/execution" blocks are missing!!!`)
			}
		})
		const rest = new REST({ version: '10' }).setToken(config.token);

		// and deploy your commands!
		(async () => {
			try {
				console.log(`[SHARURU-INFO]: Started uploading ${slashCommandsArray.length} application (/) commands.`);

				// The put method is used to fully refresh all commands in the guild with the current set
				const data = await rest.put(
					Routes.applicationGuildCommands(config.mainId, config.myGuilds.dev_guild),
					{ body: slashCommandsArray },
				);
				// const data2 = await rest.put(
				// 	Routes.applicationGuildCommands(config.mainId, config.myGuilds.zederyx),
				// 	{ body: slashCommandsArray },
				// );

				console.log(`[SHARURU-INFO]: Successfully uploaded ${data.length} application (/) commands for my guild test.`);
				// console.log(`[SHARURU-INFO]: Successfully uploaded ${data2.length} application (/) commands for Zederyx Server.`);
			} catch (error) {
				// And of course, make sure you catch and log any errors!
				console.error(error);
			}
		})();
		return console.log(table.toString()+"\nCommands loaded!")
	}

	async loadCommands() {
		return glob(`${this.directory}Commands/**/*.js`).then(commands => {
			for (const commandFile of commands) {
				// console.log(commandFile)
				// if (commandFile.includes('slash')) continue;
				delete require.cache[commandFile];
				const { name } = path.parse(commandFile);
				const File = require(commandFile);
				if (!this.isClass(File)) throw new TypeError(`Command ${name} doesn't export a class!`);
				const command = new File(this.client, name.toLowerCase());
				if (!(command instanceof Command)) throw new TypeError(`Command ${name} doesn't belong in commands.`);
				this.client.commands.set(command.name, command);
				if (command.aliases.length) {
					for (const alias of command.aliases) {
						this.client.aliases.set(alias, command.name);
					}
				}
			}
		});
	}

	async loadEvents() {
		return glob(`${this.directory}Events/**/*.js`).then(events => {
			for (const eventFile of events) {
				delete require.cache[eventFile];
				const { name } = path.parse(eventFile);
				const File = require(eventFile);
				if (!this.isClass(File)) throw new TypeError(`Event ${name} doesn't export a class!`);
				const event = new File(this.client, name);
				if (!(event instanceof Event)) throw new TypeError(`Event ${name} doesn't belong in the events directory!`);
				this.client.events.set(event.name, event);
				event.emitter[event.type](name, (...args) => event.run(...args));
			}
		});
	}

};
