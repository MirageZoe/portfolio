/* eslint-disable no-unused-vars */
const Command = require('../../Structures/Command.js');
const sendError = require('../../Models/Error');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const ms = require('ms');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'slash',
			displaying: true,
			description: 'Main Slash Command',
			options: '',
			usage: '',
			example: '',
			category: 'owner',
			userPerms: [PermissionsBitField.Flags.SendMessages],
			SharuruPerms: [PermissionsBitField.Flags.SendMessages],
			args: false,
			guildOnly: true,
			ownerOnly: true,
			// aliases: []
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

		const getSlashData = async (guildID) => {
			if (!this.client.application?.owner) await this.client.application?.fetch();
			// let app = this.client.api.applications(this.client.user.id)
			let app = this.client.application?.commands
			if (guildID) {
				// app.guilds(guildID)
				app = this.client.guilds.cache.get(guildID)?.commands
			}
			return app
		}

		const issuer = message.author;
        if (args[0] == 'create') {
			const data = {
				name: 'rolemenu',
				description: 'A helpful command in creating Role Menus!'
			}
			await this.client.guilds.cache.get(message.guild.id)?.commands.create(data)
			return console.log(`done`)
        }        
        
        if (args[0] == 'update') {
			let data = {
				name: 'rolemenu',
				description: 'A helpful command in creating Role Menus ONLY! Not the real command!',
				options: [
					{
						name: 'create',
						description: 'Create a new role menu...',
						type: 1,
						options:[
							{
								name: 'name',
								description: 'Give a name to the new Role Menu. Min: 4, Max: 40 characters!',
								type: 3,
								required: true
							},
							{
								name: 'mode',
								description: 'There are 3 modes: "standard", "unique" and "multi"!',
								type: 3,
								required: true
							},
							{
								name: 'roles',
								description: 'Provide the roles to be attached to the Role Menu. Min: 2, Max: 20 roles!',
								type: 8,
								required: true
							},
							{
								name: 'description',
								description: 'Give a description to the new Role Menu. Min: 6, Max: 100 characters!',
								type: 3,
								required: false
							},
							{
								name: 'group_ignore_role',
								description: 'Mention the role that is going to be ignored from interacting with this role menu!',
								type: 8,
								required: false
							},
							{
								name: 'group_require_role',
								description: 'Mention the role that is going to be required to interact with this role menu!',
								type: 8,
								required: false
							},
							{
								name: 'temporary_roles',
								description: 'Set time remaining for role!Values: 0 (permanent), 5min, 35min, 1h, 1d, up to 30d!',
								type: 3,
								required: false
							},
							{
								name: 'details',
								description: 'Show or not Required/Ignored role. yes/true/1 or no/false/0 values accepted!',
								type: 3,
								required: false
							}
						]
					},
					{
						name: 'edit',
						description: 'Edit an existent role menu...',
						type: 1,
						options:[
							{
								name: 'id',
								description: `The ID of the role menu.`,
								type: 4,
								required: true
							},
							{
								name: 'name',
								description: `Edit the name of a role menu. Min: 4, Max: 40 characters!`,
								type: 3,
								required: false
							},
							{
								name: 'description',
								description: `Edit the description of a role menu. Min: 6, Max: 100 characters!`,
								type: 3,
								required: false
							},
							{
								name: 'mode',
								description: `Edit the mode of a role menu. Available Modes: standard, unique, multi!`,
								type: 3,
								required: false
							},
							{
								name: 'group_ignore_role',
								description: `Edit the role that will be ignored from interacting with the role menu.`,
								type: 8,
								required: false
							},
							{
								name: 'group_require_role',
								description: `Edit the role that will be required to interact with the role menu.`,
								type: 8,
								required: false
							},
							{
								name: 'temporary_role',
								description: `Set time remaining for role!Values: 0 (permanent), 5min, 35min, 1h, 1d, up to 30d!`,
								type: 4,
								required: false
							},
							{
								name: 'min',
								description: `Edit Minimum roles needed! From 0 to 20! Cannot be higher or equal to "Max"`,
								type: 4,
								required: false
							},
							{
								name: 'max',
								description: `Edit maximum roles allowed! From 0 to 20! Cannot be lower or equal to "Min"`,
								type: 4,
								required: false
							},
							{
								name: 'details',
								description: `Show or not the Required/Ignored roles. yes/true/1 or no/false/0 values accepted!`,
								type: 3,
								required: false
							}
						]
					},
					{
						name: 'remove',
						description: 'Remove an existent role menu...',
						type: 1,
						options:[
							{
								name: `id`,
								description: `The id of the role menu that you want to delete!`,
								type: 4,
								required: true
							}
						]
					},
					{
						name: 'send',
						description: `Send a role menu created to a channel!`,
						type: 1,
						options:[
							{
								name: 'id',
								description: 'The ID of the role menu created!',
								type: 4,
								required: true
							},
							{
								name: "channel",
								description: 'The mention of the channel where the role menu will be sent!',
								type: 8,
								required: true
							},
							{
								name: "emojis",
								description: 'Emojis used to react for role. The number of emojis are directly proportional with number of roles',
								type: 3,
								required: true
							},
						]
					}
				]
			}
			// return console.log(data.options[0].options[0].options[4])
			if (this.client.application?.owner) await this.client.application?.fetch();
			const command = await this.client.guilds.cache.get(message.guild.id)?.commands.create(data);
			return console.log(command)
        }
        
        if (args[0] == 'delete') {
            await getSlashData(message.guild.id).commands('842487998271586385').delete()
			return console.log(`done`)
        }

		if (args[0] == 'list') {
            const commands = await getSlashData(message.guild.id).then(cmd =>{
				console.log(`${message.guild.name} commands:`)
				console.log(cmd.cache)
				
			})
			const commands2 = await getSlashData().then(cmd =>{
				console.log(`Global Commands:`)
				return console.log(cmd.cache)
			})
			// console.log(this.client.events.get(`interaction_create`))
        }
	}

};
