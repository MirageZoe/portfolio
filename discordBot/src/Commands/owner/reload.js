/* eslint-disable no-unused-vars */
const Command = require('../../Structures/Command.js');
const path = require('path');
const { promisify } = require('util');
const glob = promisify(require('glob'));
const { PermissionsBitField, REST, Routes, Colors } = require('discord.js');
const ascii = require("ascii-table");
const table = new ascii().setHeading("Slash Commands","Status")
const config = require("../../../config.json")
const SharuruEmbed = require("../../Structures/SharuruEmbed")


module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'reload',
			displaying: true,
            category: 'owner',
            userPerms: [PermissionsBitField.Flags.SendMessages],
			SharuruPerms: [PermissionsBitField.Flags.SendMessages],
			args: false,
            guildOnly: true,
            ownerOnly: true
		});
	}

	async run(message, args) {

		message.delete();
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

		if (args[0] == "slash") {

			try {
				const Files = await glob(`${process.cwd()}/src/CommandsSlash/**/*.js`);
				console.log(Files)
				Files.forEach((file) => delete require.cache[require.resolve(file)]);
				await this.client.slashCommands.clear();

				table.clear().setHeading("Slash Commands","Status")
				
				
				const slashCommandsArray = [];
				// const commandsPath = path.join(__dirname, 'CommandsSlash');
				Files.forEach((file) =>{
					const command = require(file);
					// const filePath = path.join(commandsPath, file);

					// console.log(file)
					// console.log(command)
					if ('data' in command && 'execute' in command) {
						this.client.slashCommands.set(command.data.name, command);
						slashCommandsArray.push(command.data.toJSON())
						table.addRow(command.data.name, "✅")
					} else {
						table.addRow(command.data.name, "❌")
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

						console.log(`[SHARURU-INFO]: Successfully uploaded ${data.length} application (/) commands.`);
					} catch (error) {
						// And of course, make sure you catch and log any errors!
						console.error(error);
					}
				})();
				console.log(table.toString()+"\nCommands reloaded!")
			} catch (error) {
				console.log(error)
			}
			const reloadEmbed = new SharuruEmbed()
				.setDescription(`I've reloaded all slash commands!`)
				.setColor(Colors.LuminousVividPink)
			message.channel.send({embeds: [reloadEmbed] })
			console.log(`[Sharuru-Info]: Done reloading slashCmds!`)
			return;
		}

		if (args[0] == "pts") {
			let serverToPush = args[1];
			let tryThisGuild = this.client.guilds.cache.get(serverToPush)

			if (!tryThisGuild) {
				console.log(`[Sharuru]: This guild, ${serverToPush}, doesn't exist or I'm not in that guild!`)
				return message.channel.send(`This guild, ${serverToPush}, doesn't exist or I'm not in that guild!`)
			}
			try {
				// checking if it's in that guild
				
				const Files = await glob(`${process.cwd()}/src/CommandsSlash/**/*.js`);
				// console.log(Files)
				Files.forEach((file) => delete require.cache[require.resolve(file)]);
				await this.client.slashCommands.clear();

				table.clear().setHeading("Slash Commands","Status")
				
				
				const slashCommandsArray = [];
				// const commandsPath = path.join(__dirname, 'CommandsSlash');
				Files.forEach((file) =>{
					const command = require(file);
					// const filePath = path.join(commandsPath, file);

					// console.log(file)
					// console.log(command)
					if ('data' in command && 'execute' in command) {
						this.client.slashCommands.set(command.data.name, command);
						slashCommandsArray.push(command.data.toJSON())
						table.addRow(command.data.name, "successfully loaded")
					} else {
						table.addRow(command.data.name, "failed to load")
						console.log(`[SHARURU-WARNING]: The command at:\n"${file}"\n==> is broken! "data/execution" blocks are missing!!!`)
					}
				})
				const rest = new REST({ version: '10' }).setToken(config.token);

				// and deploy your commands!
				(async () => {
					try {
						console.log(`[SHARURU-INFO]: Started uploading ${slashCommandsArray.length} application (/) commands to ${serverToPush}...`);

						// The put method is used to fully refresh all commands in the guild with the current set
						const data = await rest.put(
							Routes.applicationGuildCommands(config.mainId, serverToPush),
							{ body: slashCommandsArray },
						);

						console.log(`[SHARURU-INFO]: Successfully uploaded ${data.length} application (/) commands to ${serverToPush}.`);
					} catch (error) {
						// And of course, make sure you catch and log any errors!
						console.error(error);
					}
				})();
				return console.log(table.toString()+"\nCommands reloaded!")
			} catch (error) {
				console.log(error)
			}
			const reloadEmbed = new SharuruEmbed()
				.setDescription(`I've reloaded all slash commands!`)
				.setColor(Colors.LuminousVividPink)
			message.channel.send({embeds: [reloadEmbed] })
			return console.log(`[Sharuru-Info]: Done reloading slashCmds!`)
		}

        if(args[0] == 'ev'){
			if(!args[1]) return message.reply('please provide an event to reload!');
			const evt = args[1]
			if(!this.client.events.get(evt)) return message.channel.send('That event doesnt exist. Try again.');
			const event = this.client.events.get(evt)
			try {
				delete require.cache[require.resolve(`../../Events/${event.event_type}/${event.name}.js`)]
				this.client.removeAllListeners(event.name)
				const { name } = path.parse(require.resolve(`../../Events/${event.event_type}/${event.name}.js`))
				const File = require(require.resolve(`../../Events/${event.event_type}/${event.name}.js`))
				const nevent = new File(this.client, name);
				this.client.events.set(nevent.name, nevent);
				nevent.emitter[nevent.type](name, (...args) => nevent.run(...args));

				message.channel.send(`I have reloaded \`${event.name}\` event!`).then(m => deleteMsg(m,3500));
				console.log(`\n\nReloaded ${event.name} at ${issuer.tag} request on ${TheDate}\n`)
				return;
			} catch (error) {
				console.log(error)
				message.channel.send(`I couldn't reload \`${evt}\` :(\nLook if the event exist...`)
			}
		}
        if (!args[0]) return message.reply('please provide a command to reload!');

        const cmd = args[0].toLowerCase();
        
        if (!this.client.commands.get(cmd)) return message.channel.send('That command doesnt exist. Try again.');
        
        const command = this.client.commands.get(cmd) || this.client.commands.get(this.client.aliases.get(cmd));
        try {
            delete require.cache[require.resolve(`../${command.category}/${command.name}.js`)];

            const File = require(`../${command.category}/${command.name}.js`);
            const Command = new File(this.client, command.name.toLowerCase());

            this.client.commands.delete(command.name);
            await this.client.commands.set(command.name, Command);
			message.channel.send(`I have reloaded \`${command.name}\`!`).then(m => deleteMsg(m,3500));
			console.log(`\n\nReloaded ${command.name} at ${issuer.tag} request on ${TheDate}\n`)

        } catch (error) {
            console.log(error)
            message.channel.send(`I couldn't reload \`${cmd}\` :(\nLook if the command category is the same with the location or if they name match what you said`)
        }
		function deleteMsg(msg,timeout) {
			setTimeout(() => {
				msg.delete()
			}, timeout);
		}
    }
};
