/* eslint-disable no-unused-vars */
const Command = require('../../Structures/Command.js');
const sendError = require('../../Models/Error');
const { PermissionsBitField, Colors } = require('discord.js');
const guildsettings = require("../../Models/GuildSettings")
const fs = require('fs');
const ms = require('ms');
const pms = require("pretty-ms");
const SharuruEmbed = require('../../Structures/SharuruEmbed.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'settings',
			displaying: true,
			description: 'Display the settings applied to this server! Available for the members that possess manage server & kick members at least!',
			options: '',
			usage: '',
			example: '',
			category: 'moderation',
			userPerms: [PermissionsBitField.Flags.SendMessages],
			SharuruPerms: [PermissionsBitField.Flags.SendMessages],
			args: false,
			guildOnly: true,
			ownerOnly: false,
			aliases: ['st']
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
		const tools = this.client.utils
		const logchannel = message.guild.channels.cache.find(ch => ch.name == 'sharuru-logs')
		let getPrefixMap = this.client.prefixes;
		const hexToDecimal = hex => parseInt(hex,16);
		const xpHardLimits = {
			experience: {
				min: 1,
				max: 256
			},
			rate: 20,
			cooldown: {
				min: 1,
				max: 32400000 //32 400 000 => 9 hours
			},
			coins: {
				min: 1,
				max: 256,
			}
		}

		const settingsEmbed = new SharuruEmbed()
			.setColor(Colors.LuminousVividPink)
			.setFooter({text:`Requested by ${issuer.tag}`})

		if(args[0] == 't'){
			message.channel.messages.fetch(`843235386046152714`).then(msg =>{
				console.log(msg.embeds)
			})
			return;
		}
		function showIgnoredChannels(channels) {
			if(channels.length == 0){
				return `No channels ignored, every channel gives coins and experience!`
			}
			let mychannels = []
			for(let ch in channels){
				mychannels.push(`<#${channels[ch]}>`)
			}
			return mychannels.join(" | ")
		}
		/**
		 * 
		 * @param {String} userInput The input of the user.
		 * @param {[]} checkfor The items to check, based on condition, what the user input
		 * @param {String} condition The conditions to check for:
		 * 
		 * - 'includes' => checks if the user input is included in one of the following items in the "checkfor" array. Returns true/false
		 * - 'same' => checks if the user input is the same as one of the following items in the 'checkfor' array. Returns true/false
		 * - 'returnOne' => checks if the user input is in the array of items 'checkfor'. If yes, returns that item, otherwise null.
		 * @returns Results based on the condition.
		 */
		function checkForItems(userInput,checkfor,condition) {
			if(userInput.length == 0 || checkfor.length == 0) return 0
			if(condition == 'includes') {
				let notContain = false;
				for (const item of checkfor) {
					if(userInput.includes(item)) notContain = true;	
				}
				return notContain
			}
			if(condition == 'same'){
				let sameItem = false;
				sameLoop: for (let i = 0; i < checkfor.length; i++) {
					const item = checkfor[i].toLowerCase();
					if(userInput.toLowerCase() == item) {
						sameItem = true;
						break sameLoop;
					} 
				}
				return sameItem
			}
			if(condition == 'returnOne') {
				sameLoop: for (let i = 0; i < checkfor.length; i++) {
					const item = checkfor[i];
					if(userInput == item) {
						console.log(`found: ${item}`)
						if (item == 'true' || item == 'yes' || item == '1') return true;
						if (item == 'false' || item == 'no' || item == '0') return false;
						return item;
					} 
				}
				return null
			}
		}
		
		let page = 1
        guildsettings.findOne({
            ID: message.guild.id
        },async(err,res)=>{
            if(err){
                sendError.create({
                    Guild_Name: message.guild.name,
                    Guild_ID: message.guild.id,
                    User: issuer.tag,
                    UserID: issuer.id,
                    Error: err,
                    Time: `${TheDate} || ${clock} ${amORpm}`,
                    Command: this.name,
                    Args: args,
                },async (err2, res2) => {
                    if(err2) {
                        console.log(err2)
                        return message.channel.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                    }
                    if(res2) {
                        console.log(`successfully added error to database!`)
                    }
                })
            }
            if(res){
			let settingsPage1 = [
					{name: `Autorole:`,value: `${res.systems.autorole.enabled ? `🟢` : `🔴`}\nRole: ${res.systems.autorole.role != 0 ? `<@&${res.systems.autorole.role}>` : `Not selected yet.`}\n[help](https://www.google.com "This module allows you to add a role to a new member that joins the server!")`,inline: true},
					// {name: `Economy:`,value: "rework",inline: true},//res.systems.economy // [help](https://www.google.com "this")
					{name: `Invites:`,value: `${res.systems.inviteTracker.enabled ? `🟢` : `🔴`}\n`,inline: true},
					{name: `Staff Role :`,value: res.importantData.staffRole != 'NOT_SET' ? `<@&${res.importantData.staffRole}>` : `Not set up`,inline: true},
					{name: `Custom Warns:`,value: res.systems.customWarns.enabled ? `🟢`: `🔴`,inline: true},
					{name: `Emoji Pack:`, value: res.systems.emojiPack ? `🟢` : `🔴`,inline: true },
					{name: `Word Filter:`,value:`
- State: ${res.systems.blacklistWord.mode ? `🟢` : `🔴`}
- Auto-warn [help](https://www.google.com "Whenever to automatically warn the member after removing their message."): ${res.systems.blacklistWord.behaviour.mode ? `🟢` : `🔴`}
- Type [help](https://www.google.com "Set the type of auto-warning: shard, frostfang, blackice."):  ${res.systems.blacklistWord.behaviour.type}`,inline: true},
					{name: `Logs:`,value: `
- Role [help](https://www.google.com "Receive logs about roles that get Created/Updated/Deleted."): ${res.logs.role ? `🟢` : `🔴`}
- Message [help](https://www.google.com "Receive logs about messages that get Updated/Deleted."): ${res.logs.message ? `🟢` : `🔴`}
- Channel [help](https://www.google.com "Receive logs about channels that get Created/Updated/Deleted."): ${res.logs.channel ? `🟢` : `🔴`}
- Voice [help](https://www.google.com "Receive logs about people Joining/Changing/Leaving voice channels."): ${res.logs.voice ? `🟢` : `🔴`}
- Emoji [help](https://www.google.com "Receive logs about emojis being Added/Changed/Deleted."): ${res.logs.emoji ? `🟢` : `🔴`}
- Server [help](https://www.google.com "Receive logs about general changes made to the server settings."): ${res.logs.guild ? `🟢` : `🔴`} (in developing)
- Moderation [help](https://www.google.com "Receive logs whenever a moderation command is issued!"): ${res.logs.moderation ? `🟢` : `🔴`} (in developing)
`,inline: true},
					{name: `Livestream:`, value: `--**Youtube:** ${res.systems.livestream.enableYT ? `🟢` : `🔴`}\n--**Twitch:** ${res.systems.livestream.enableTW ? `🟢` : `🔴`}\n--**Channel:** ${res.systems.livestream.channel !== '0' ? `<#${res.systems.livestream.channel}>`:`Not set up`}`, inline: true},
					{name: `Starboard: `, value: `--**State:** ${res.systems.starboard.enabled ? `🟢` : `🔴`}
					--**Channel:** ${res.systems.starboard.channel !== 'none' ? "<#"+res.systems.starboard.channel+">" : 'Not set up'}
					--**Stars Needed:** ${res.systems.starboard.count}`, inline: false},
					{name: `Media Channel:`, value: `**State**: ${res.systems.mediaChannel.enabled ? `🟢` : `🔴`}
					**Channels**:
					${res.systems.mediaChannel.channels.length <= 3 ? 
						res.systems.mediaChannel.channels.map(i => `<#${i}>`).join(`\n`) : 
						res.systems.mediaChannel.channels.length > 3 ? 
						this.client.utils.trimArray(res.systems.mediaChannel.channels.map(i => `<#${i}>`).join(`\n`),3).join("\n") : "None. Add to see!"}`, inline: true},
					{name: `Level System:`,value:`--**State:** ${res.systems.exp.enabled ? `🟢`: `🔴`}
					--**Minimum xp:** ${res.systems.exp.xp_per_message.min}
					--**Maximum xp:** ${res.systems.exp.xp_per_message.max}
					--**XP Rate:** x${res.systems.exp.xp_rate}
					--**Cooldown per Message:** ${res.systems.exp.cooldownMsg}
					--**Channels where xp & coins don't drop:**\n${showIgnoredChannels(res.systems.exp.ignoredChannels)}`},
					
			];
			let settingsPage2 = [
				{name: `React to DM:`, value: `Enabled: ${res.systems.reactMsg.enabled ? `Yes` : `No`}\nLog reactions? (if enabled on each msg): ${res.systems.reactMsg.logs ? `Yes` : `No`}`},
				{name: `Halloween Event:`,value: `Enabled: ${res.events.halloween.enabled ? `Yes`:`No`}\nChannels: ${res.events.halloween.channels.length > 0 ? res.events.halloween.channels.map(i => `<#${i}>`).join("\n") : `No channel set yet`}\nCooldown after spawn: ${pms(res.events.halloween.cooldownSpawn,{verbose: true})} (0 = disabled)\nIncrease % by: ${res.events.halloween.increaseBy}%\nInterval for increasing the %: ${pms(res.events.halloween.every,{verbose: true})}\nStarting Chance (after spawn, resets to this!): ${res.events.halloween.startChance}`}
			]
			let settingsPage3 = `Anti-Spam System:
					--**Enabled:**: ${res.systems.antispam.enabled ? `Yes` : "No"}\n
					--**Warn duplicates threshold**: ${res.systems.antispam.maxDuplicatesWarn}
					--**Mute duplicates threshold**: ${res.systems.antispam.maxDuplicatesMute}
					--**Kick duplicates threshold**: ${res.systems.antispam.maxDuplicatesKick}
					--**Ban duplicates threshold**: ${res.systems.antispam.maxDuplicatesBan}
					--**Warn Threshold**: ${res.systems.antispam.warnThreshold}
					--**Mute Threshold**: ${res.systems.antispam.muteThreshold}
					--**Kick Threshold**: ${res.systems.antispam.kickThreshold}
					--**Ban Threshold**: ${res.systems.antispam.banThreshold}

					--**Spam time**: ${pms(res.systems.antispam.maxInterval)}
					--**Duplicate spam time**: ${pms(res.systems.antispam.maxDuplicatesInterval)}
					--**Log the actions?**: ${res.systems.antispam.modLogsEnabled ? "Yes" : "No"}
					--**Log channel for reports**: ${res.systems.antispam.modLogsChannelName}
					--**Warn message**: ${res.systems.antispam.warnMessage}
					--**Mute message**: ${res.systems.antispam.muteMessage}
					--**Kick message**: ${res.systems.antispam.kickMessage}
					--**Ban message**: ${res.systems.antispam.banMessage}

					--**Mute role given**: ${res.systems.antispam.muteRole}
					--**Members Ignored**: ${res.systems.antispam.ignoredMembers.length > 0 ? res.systems.antispam.ignoredMembers.map(item => item = `<@${item}>`) : `None ignored so far.`}
					--**Roles Ignored**: ${res.systems.antispam.ignoredRoles.length > 0 ? res.systems.antispam.ignoredRoles.map(item => item = `<@&${item}>`) : `None ignored so far.`}
					--**Channels Ignored**: ${res.systems.antispam.ignoredChannels.length > 0 ? res.systems.antispam.ignoredChannels.map(item => item = `<#${item}>`) : `None ignored so far.`}
					--**Permissions ignored**: ${res.systems.antispam.ignoredPermissions.length > 0 ? res.systems.antispam.ignoredPermissions : `None ignored so far.`}
					--**Ignore bots**: ${res.systems.antispam.ignoreBots ? `Yes`: `No`}

					--**You want me to warn members?**: ${res.systems.antispam.warnEnabled ? `Yes` : `No`}
					--**You want me to mute members?**: ${res.systems.antispam.muteEnabled ? `Yes` : `No`}
					--**You want me to kick members?**: ${res.systems.antispam.kickEnabled ? `Yes` : `No`}
					--**You want me to ban members?**: ${res.systems.antispam.banEnabled ? `Yes` : `No`}
					--**Delete messages after ban for past:**: ${res.systems.antispam.deleteMessagesAfterBanForPastDays} Day(s)
					--**Delete messages after spam?**: ${res.systems.antispam.removeMessages ? `Yes` : `No`}
					--**Delete bot messages?**: ${res.systems.antispam.removeBotMessages ? `Yes` : `No`}
					`
			let convertPermsToHuman ={
				CREATE_INSTANT_INVITE: `Create Invite`,
				KICK_MEMBERS: `Kick Members`,
				BAN_MEMBERS: `Ban Members`,
				VIEW_AUDIT_LOG: 'View Server Log (Audit Log)',
				MANAGE_MESSAGES: `Manage Messages`,
				MANAGE_CHANNELS: `Manage Channel`,//(edit and reorder channels)
				MANAGE_NICKNAMES: `Manage Nicknames`,
				MANAGE_ROLES: `Manage Roles`,
				MANAGE_WEBHOOKS:`Manage Webhooks`,
				MANAGE_EMOJIS_AND_STICKERS: `Manage Emojis & Stickers`,
				MANAGE_GUILD: 'Manage Server',
				ADD_REACTIONS: `Add Reactions`,// (add new reactions to messages)
				PRIORITY_SPEAKER: `Priority Speaker`,
				STREAM: `Stream Video`,
				VIEW_CHANNEL: `View Channel`,
				SEND_MESSAGES: `Send Messages`,
				SEND_TTS_MESSAGES: `Send TTS Messages`,
				EMBED_LINKS: `Embed Links`,//(links posted will have a preview embedded)
				ATTACH_FILES: `Attach Files`,
				READ_MESSAGE_HISTORY: `Read Message History`,
				MENTION_EVERYONE: `Mention @everyone, @here and All Roles`,
				USE_EXTERNAL_EMOJIS: `Use External Emoji`,
				VIEW_GUILD_INSIGHTS: `View Server Insights`,
				CONNECT: `Connect To Voice`,
				SPEAK: `Speak in Voice`,
				MUTE_MEMBERS: `Mute Members`,
				DEAFEN_MEMBERS: `Deafen Members`,//(deafen members across all voice channels)
				MOVE_MEMBERS: `Move Members`,//(move members between voice channels)
				USE_VAD: `Use Voice Activity`,//(use voice activity detection)
				CHANGE_NICKNAME: `Change Own Nickname`,
			}
			let answer = args[2]

				if(!args[0]){
					let infoLink = '[click me](coming soon)'
					let EmbedSettings = new SharuruEmbed()
					.setAuthor({name: `${message.guild.name}'s Settings`})
					.setTimestamp()
					.setFooter({text: `Page ${page}/3 | Requested by ${issuer.tag} at `})
					.setColor(Colors.LuminousVividPink)
					.addFields(settingsPage1)
					.setDescription(`**Prefix**: ${res.prefix}\nFor Detailed Info, visit [this link](http://www.sharurubins.ddns.net/settingshelp)\n**Tip**: About the states of modules:\n---🟢=> it's enabled!\n---🔴=> it's disabled!\n**Tip 2**: Hover over "help" part of each module to know what it does.`)  
					
					
					return message.channel.send({embeds: [EmbedSettings] }).then(async msg =>{
						msg.react('1️⃣');
						msg.react('2️⃣');
						msg.react('3️⃣').then(async ()=>{
							const CollectingReactions = (reaction, user) => user.id === message.author.id;
							let myCollector = await msg.createReactionCollector({CollectingReactions, time: 60000})
	
							myCollector.on('collect', m=>{
								switch (m._emoji.name) {
									case "1ï¸âƒ£":
										if (issuer.bot == false)
											msg.reactions.resolve("1ï¸âƒ£")?.users?.remove(issuer.id)
										if(page == 1) return console.log(`already on page 1`)
										page=1;
										EmbedSettings.fields = settingsPage1
										EmbedSettings.setFooter({text: `Page ${page}/3 | Requested by ${issuer.tag} at `})
										.setDescription(`Please visit ${infoLink} for more info on how to use the commands!`)  
										msg.edit({embeds: [EmbedSettings] })
										break;
									case "2ï¸âƒ£":
										if (issuer.bot == false)
											msg.reactions.resolve("2ï¸âƒ£")?.users?.remove(issuer.id)
										if(page == 2) return console.log(`already on page 2`)
										page=2;
										EmbedSettings.fields = settingsPage2
										EmbedSettings.setFooter({text: `Page ${page}/3 | Requested by ${issuer.tag} at `})
										.setDescription("")
										msg.edit({embeds: [EmbedSettings] })
										break;
									case "3ï¸âƒ£":
										if (issuer.bot == false)
											msg.reactions.resolve("3ï¸âƒ£")?.users?.remove(issuer.id)
										if(page == 3) return console.log(`already on page 3`)
										page=3;
										EmbedSettings.fields = []
										EmbedSettings.setFooter({text: `Page ${page}/3 | Requested by ${issuer.tag} at `})
										.setDescription(settingsPage3)  
										msg.edit({embeds: [EmbedSettings] })
										break;
								}
							})
							myCollector.on('end', m=>{
								msg.reactions.removeAll()
							})
						})
					});
				}
				args[0] = args[0].toLowerCase();
				args[1] = args[1].toLowerCase();
				args[2] = args[2].toLowerCase();

				if (args[0] == "cmd") {
					if (!args[1]) {
						settingsEmbed.setDescription(`Please choose an option: \`enable\` / \`disable\`!`)
						return message.channel.send({embeds: [settingsEmbed]})
					}
					args[1] = args[1].toLowerCase()
					if (args[1] == "enable") {
						if (!args[2]) {
							settingsEmbed.setDescription(`Please specify a command name to enable!!`)
							return message.channel.send({embeds: [settingsEmbed]})
						}

						// checking if the cmd is already disabled
						if (!res.systems.disabledCommands.includes(args[2].toLowerCase())) {
							settingsEmbed.setDescription(`This command, ${args[2]}, is not disabled!`)
							return message.channel.send({embeds: [settingsEmbed]})
						}

						// check if it exists
						if (!this.client.commands.get(args[2].toLowerCase())) {
							settingsEmbed.setDescription(`This command, ${args[2]}, doesn't exist!`)
							return message.channel.send({embeds: [settingsEmbed]})
						}

						let indexCMD = res.systems.disabledCommands.findIndex(item => item == args[2].toLowerCase())
						res.systems.disabledCommands.splice(indexCMD,1);
						settingsEmbed.setDescription(`I have enabled ${args[2]} command!`)
						message.channel.send({embeds: [settingsEmbed]})
					} 

					if (args[1] == "disable") {
						if (!args[2]) {
							settingsEmbed.setDescription(`Please specify a command name to disable!!`)
							return message.channel.send({embeds: [settingsEmbed]})
						}

						// checking if the cmd is not disabled
						if (res.systems.disabledCommands.includes(args[2].toLowerCase())) {
							settingsEmbed.setDescription(`This command, ${args[2]}, is already disabled!`)
							return message.channel.send({embeds: [settingsEmbed]})
						}

						// check if it exists
						if (!this.client.commands.get(args[2].toLowerCase())) {
							settingsEmbed.setDescription(`This command, ${args[2]}, doesn't exist!`)
							return message.channel.send({embeds: [settingsEmbed]})
						}

						res.systems.disabledCommands.push(args[2].toLowerCase());
						settingsEmbed.setDescription(`I have disabled ${args[2]} command!`)
						message.channel.send({embeds: [settingsEmbed]})
					}
				}

				if (args[0] == `autorole` || args[0] == '') {
					const chosenOption = args[1]
					const options = ["switch","select","view"]
					if(options.indexOf(chosenOption) == -1) {
						return message.channel.send(`Sorry but you either didn't specify an option or you typed it wrong! The available options are:
- \`switch\` => enable/disable the module
- \`select @role\` => select a role to be given to new members on joining the server
- \`view\` => show role selected to assgin to new members
						\nCurrently, the autorole is **\`${res.systems.autorole.enabled ? `Enabled ${res.systems.autorole.role != `0` ? `& the role selected is: <@&${res.systems.autorole.role}>` : `& no role is selected yet`}`: `Disabled`}\`**`)
					}

					// switch
					if (options.indexOf(chosenOption) == 0) {
						if(res.systems.autorole.enabled == true){
							res.systems.autorole.enabled = false;
							message.channel.send(`${issuer}, I have turned off autorole module!`)
						} else {
							res.systems.autorole.enabled = true
							message.channel.send(`${issuer}, I have turned on the autorole module! ${res.systems.autorole.role == '0' ? `Please select a role to be given by using \`${prefix}settings autorole select @role\`!` : `Currently the role given to new members is: <@&${res.systems.autorole.role}>`}`)
						}
					}

					// select role
					if (options.indexOf(chosenOption) == 1) {
						if (res.systems.autorole.enabled == true){
							let getRole = undefined;
							let isMentioned = message.mentions.roles.first()
							if (isMentioned) getRole = message.mentions.roles.first().id
							else getRole = args[2]
							try {
								let role = message.guild.roles.cache.get(getRole)
								if (!role) return message.channel.send(`${issuer}, sadly I couldn't find that role!`)
								if (role.position >= message.guild.me.roles.highest.position) return message.channel.send(`${issuer}, this role is equal or higher than my highest role so I can't assign this to any member!\nSelect a role that is lower than mine please!`)
								res.systems.autorole.role = role.id
								message.channel.send(`${issuer}, from now on every new member will receive ${role} when they join the server!`);
							} catch (error) {
								sendError.create({
									Guild_Name: message.guild.name,
									Guild_ID: message.guild.id,
									User: issuer.tag,
									UserID: issuer.id,
									Error: error,
									Time: `${TheDate} || ${clock} ${amORpm}`,
									Command: this.name + " auto role option",
									Args: args,
								},async (err, res) => {
									if(err) {
										console.log(err)
										return message.channel.send(`Unfortunately a problem appeared so please try again later!`)
									}
									if(res) {
										console.log(`successfully added error to database!`)
										return message.channel.send(`An internal error occurred! If it happens for you to see this, firstly check if you mentioned a correct role or you provided a valid role ID. If you checked those 2 things are correct and the problem still persist, please contact my partner and tell this message appeared!`)
									}
								})
							}
						} else return message.channel.send("The autorole module isn't enabled, please enable it first before selecting a role to be given to new members!")
					}

					// view role
					if (options.indexOf(chosenOption) == 2){
						return message.channel.send(`${issuer}, the current role that will be auto-assigned to new members is:\n${res.systems.autorole.role !== '0' ? `<@&${res.systems.autorole.role}>` : "No role selected yet"}`)
					}
				}
				if (args[0] == `customwarns`) {
					if (!args[1]) return message.channel.send(`${issuer}, in settings panel, only this option is available:
- \`switch\` => enable/disable the custom warn system.

For more info about command and options, please use the main command: \`${prefix}help warn\`
					`)
					if (args[1] == 'switch') {
						if (res.systems.customWarns.enabled === false){
							res.systems.customWarns.enabled = true
							message.channel.send(`${issuer}, custom Warns system has been enabled! Please type \`${prefix}warns\` to learn how to set up custom warns!`);
						} else {
							res.systems.customWarns.enabled = false
							message.channel.send(`I have disabled the custom warn system at ${issuer} request!`)
						}
					}
				}
				if (args[0] == `economy`){ // to set
					return message.channel.send(`${issuer}, coming soon`)
					if(args[1] == `enable`){

					}
					if(args[1] == `disable`){
						
					}
				}
				if (args[0] == `invites`){
					let invOption = args[1]
					let subOption = args[2]
					if(!invOption) return message.channel.send(`${issuer}, Select one of:
- \`switch\` => enable/disable the invite system!
- \`switch display\` => shows only if the invites system is enabled or not.
- \`channel #channelMention\` => select the channel where to send invite cards.
- \`channel view\` => view the selected channel.`)
					if (invOption == 'channel') {
						if (subOption !== 'view') {
							try {
								if (!subOption) return message.channel.send(`${issuer}, please mention a channel!`)
								let providedChannel = message.guild.channels.cache.find(r => r.id = message.mentions.channels.first().id)
								if (providedChannel){
									console.log(`found the channel!`)
									res.systems.inviteTracker.channel = providedChannel.id
									message.channel.send(`Done ${issuer}! I have found the channel now what's left is for someone to join!`)
								}
							} catch (error) {
								sendError.create({
									Guild_Name: message.guild.name,
									Guild_ID: message.guild.id,
									User: issuer.tag,
									UserID: issuer.id,
									Error: error,
									Time: `${TheDate} || ${clock} ${amORpm}`,
									Command: this.name + ' channel - select',
									Args: args,
								},async (err, res) => {
									if(err) {
										console.log(err)
										return message.channel.send(`Unfortunately a problem appeared while selecting a channel in the invite channel so please try again later! If problem persist, please contact my partner!`)
									}
									if(res) {
										console.log(`successfully added error to database!`)
										return message.channel.send(`Unfortunately I couldn't find ${args[1] ? `${args[1]} channel` : "the channel because you didn't wrote anything"} , please make sure you're mentioning a channel `).then(m => m.delete({timeout: 5500}))
									}
								})
							}
						} else {
							return message.channel.send(`The channel where tracker will send messages is: <#${res.systems.inviteTracker.channel}>.\nTo change the channel, you will have to use \`${prefix}settings invites channel #channel\``)
						}
					}
					if (invOption == 'switch') {
						if (subOption == 'display') return message.channel.send(`${issuer}, currently the invite system is: ${res.systems.inviteTracker.enabled ? `Enabled! ${res.systems.inviteTracker.channel !=='0' ? `Selected channel is: ${res.systems.inviteTracker.channel}` : `No channel selected`}` : `Disabled`}`)
						if (res.systems.inviteTracker.channel == '0'){
							return message.channel.send(`Before enabling the Invite system, please select a channel by using the next command:\n\n-\`${prefix}invites channel select #channelName\``)
						}
						if (res.systems.inviteTracker.enabled === false){
							res.systems.inviteTracker.enabled = true
							message.channel.send(`I have enabled the invite system at ${issuer} request!`)
						} else {
							res.systems.inviteTracker.enabled = false
							message.channel.send(`I have disabled the invite system at ${issuer} request!`)
						}
					}
					
				}
				if (args[0] == `staffrole`){

					// check whenever it's an administrator
					console.log(message.member.permissions.has(PermissionsBitField.Flags.Administrator))
					if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) 
					{
						settingsEmbed.setDescription(`${issuer}, this is a command available only to ***\`Administrators\`*** of the server!`)
						return message.channel.send({embeds: [settingsEmbed]})
					}

					let role = message.mentions.roles.first()
					if(!args[1]) return message.channel.send(`${issuer}, Select one of:\n- @role\n-disable!`)
					if(args[1] == 'disable') {
						res.importantData.staffRole = `disabled`
						// res.save().catch(err=>console.log(err))
						message.channel.send(`${issuer}, I have removed the role from ignoring the cooldowns. Now everyone is subject to cooldowns!`)
					} else {
						try {
							let isExisting = message.guild.roles.cache.find(r => r.id == role.id);
							if(isExisting){
								res.importantData.staffRole = role.id;
								message.channel.send(`The staff role has been selected! Everyone with ${role} will be ignored from majority of cooldowns & they will be recognized as legitimate staff members to use moderation features!`)
							}
						} catch (error) {
							console.log(error)
							return message.channel.send(`${issuer}, I couldn't find the role. Are you sure you mentioned the correct role?`)
						}
					}
				}
				if (args[0] == `prefix`){
					if(!args[1] || args[1].length > 3){
						return message.channel.send(`${issuer}, The prefix should be between 1 and 3 characters.`)
					}
					res.prefix = args[1];
					getPrefixMap.set(message.guild.id,args[1])
					message.channel.send(`The prefix has been set to: **\`${args[1]}\`**`)
				}
				if (args[0] == `wordfilter`) {
					if(!args[1]) return message.channel.send(`${issuer}, Select one of:\n-enable\n-disable!`)
					if(args[1] == `enable`){
						res.systems.blacklistWord.mode = true
						message.channel.send(`Word Filter module has been enabled! Please see \`${prefix}help word\` to change how it works`);
					}
					if(args[1] == `disable`){
						res.systems.blacklistWord.mode = false
						message.channel.send(`Word Filter module has been disabled!`)
					}
				}
				if (args[0] == 'autowarn'){
					if(!args[1]) return message.channel.send(`${issuer}, you have only 2 options here:\n- switch (to turn on)\n- <type: shard/frostfang/blackice> (to set the type of warn ${this.client.user} will give) `)
					if(args[1] == 'switch'){
						if(!res.systems.blacklistWord.behaviour?.mode) res.systems.blacklistWord.behaviour.mode = false
						if(res.systems.blacklistWord.behaviour.mode == true){
							res.systems.blacklistWord.behaviour.mode = false;
							settingsEmbed.setDescription(`The auto-warn feature is now disabled!`)
							message.channel.send({embeds: [settingsEmbed] });
						} else {
							res.systems.blacklistWord.behaviour.mode = true;
							settingsEmbed.setDescription(`The auto-warn feature is now enabled! Please specify what type of warning you want ${this.client.user} to give when a member write a banned word!`)
							.addField("You can do that by typing:",`\`${prefix}word autowarn <shard/frostfang/blackice>\``)
							message.channel.send({embeds: [settingsEmbed] });
						}
					}
					let allowedCases = ['shard','frostfang','blackice']
					if(args[1] == 'type'){
						if(!args[2]) return message.channel.send(`${issuer}, Please provide a type of warn!`)
						if(!allowedCases.includes(args[2])) return message.channel.send(`${issuer}, I don't recognize those type of warns. Available warnings: \`${allowedCases.join(", ")}\` `);
						res.systems.blacklistWord.behaviour.type = args[2].toUpperCase();
						settingsEmbed.setDescription(`Done! I set up so whenever someone type a banned word, they will be given a warn of that type: **${args[2]}**`)
						message.channel.send({embeds: [settingsEmbed] });
					}
				}
				if (args[0] == 'logs'){
					if (!args[1])
						return message.channel.send(`Please mention one of the followings: \`channel/emoji/server/message/role/moderation/voice\``)
					
					if (args[1] == `channel`){
						if(!args[2]) return message.channel.send(`${issuer}, Select one of:\n-enable\n-disable!`)
						if(args[2] == `enable`){
							res.logs.channel = true
							message.channel.send(`Channel Logs module has been enabled!`);
						}
						if(args[2] == `disable`){
							res.logs.channel = false
							message.channel.send(`Channel Logs module has been disabled!`)
						}
					}
					if (args[1] == `emoji`){
						if(!args[2]) return message.channel.send(`${issuer}, Select one of:\n-enable\n-disable!`)
						if(args[2] == `enable`){
							res.logs.emoji = true
							message.channel.send(`Emoji Logs module has been enabled!`);
						}
						if(args[2] == `disable`){
							res.logs.emoji = false
							message.channel.send(`Emoji Logs module has been disabled!`)
						}
					}
					if (args[1] == `server`){
						if(!args[2]) return message.channel.send(`${issuer}, Select one of:\n-enable\n-disable!`)
						if(args[2] == `enable`){
							res.logs.guild = true
							message.channel.send(`Server logs module has been enabled!`);
						}
						if(args[2] == `disable`){
							res.logs.guild = false
							message.channel.send(`Server logs module has been disabled!`)
						}
					}
					if (args[1] == `message`){
						if(!args[2]) return message.channel.send(`${issuer}, Select one of:\n-enable\n-disable!`)
						if(args[2] == `enable`){
							res.logs.message = true
							message.channel.send(`Message logs module has been enabled!`);
						}
						if(args[2] == `disable`){
							res.logs.message = false
							message.channel.send(`Message logs module has been disabled!`)
						}
					}
					if (args[1] == `role`){
						if(!args[2]) return message.channel.send(`${issuer}, Select one of:\n-enable\n-disable!`)
						if(args[2] == `enable`){
							res.logs.role = true
							message.channel.send(`Role logs module has been enabled!`);
						}
						if(args[2] == `disable`){
							res.logs.role = false
							message.channel.send(`Role logs module has been disabled!`)
						}
					}
					if (args[1] == `moderation`){
						return message.channel.send(`${issuer}, coming in future`)
						if(!args[1]) return message.channel.send(`${issuer}, Select one of:\n-enable\n-disable!`)
						if(args[1] == `enable`){
							res.moderationLogs = true
							message.channel.send(`Moderation logs module has been enabled!`);
						}
						if(args[1] == `disable`){
							res.moderationLogs = false
							message.channel.send(`Moderation logs module has been disabled!`)
						}
						res.save().catch(err=>console.log(err))
						return;
					}
					if (args[1] == 'voice')
					{
						if(!args[2]) return message.channel.send(`${issuer}, Select one of:\n-enable\n-disable!`)
						if(args[2] == `enable`){
							res.logs.voice = true
							message.channel.send(`Voice Logs module has been enabled!`);
						}
						if(args[2] == `disable`){
							res.logs.voice = false
							message.channel.send(`Voice Logs module has been disabled!`)
						}
					}
				}				
				if (args[0] == `streaming` || args[0] == "livestream"){
					if (!args[1]) return message.channel.send(`${issuer}, in settings panel, only this option is available:
- \`switch\` => enable/disable livestream module for both YT and TW.
\nFor more info and options, please use the main command: \`${prefix}livestream\`!`)
					
					if (args[1] == 'switch') {
						if(res.systems.livestream.all == true){
							res.systems.livestream.enableYT = false;
							res.systems.livestream.enableTW = false;
							res.systems.livestream.all = false
							message.channel.send(`${issuer}, I have turned off twitch & youtube feature. Twitch & youtube streamers won't be announced when they go online!`)
						} else {
							res.systems.livestream.all = true
							res.systems.livestream.enableYT = true;
							res.systems.livestream.enableTW = true;
							message.channel.send(`${issuer}, I have turned on twitch & youtube feature. Twitch & youtube streamers will be announced when they go online!.`)
						}
					}
				}
				if (args[0] == 'xp'){
					settingsEmbed.setDescription(`${issuer}, Select one of:\n- enable/disable => enable/disable the xp and coin system.\n- min <number: 0-100>\n- max <number: 0-100>\n- rate <number: 1-20>\n- cooldown <time: 1s-6h>\n- ignore <#channel>\n- coin <min/max> <number: 1-99>\n\nNote: trying to ignore again an ignored channel will delete it from the list of ignored channels!`)
					if(!args[1]) return message.channel.send({embeds: [settingsEmbed]})
					
					if(args[1] == 'min'){
						if (isNaN(args[2]) || Number(args[2]) < 0 || Number(args[2]) > xpHardLimits.experience.min) {
							settingsEmbed.setDescription(`Please make sure the parameter is meeting the following conditions:
- The provided parameter is a number;
- The provided parameter is not negative;
- The provided parameter is not above ${xpHardLimits.experience.min};`)
						return message.channel.send({embeds: [settingsEmbed]})
						}
						res.systems.exp.xp_per_message.min = Number(args[2])
						settingsEmbed.setDescription(`${issuer}, I have set the minimum experience gained to be **\`${args[2]}\`**`)
						message.channel.send({embeds: [settingsEmbed]})
					}
					if(args[1] == 'max'){
						if (isNaN(args[2]) || Number(args[2]) < 0 || Number(args[2]) > xpHardLimits.experience.max) {
							settingsEmbed.setDescription(`Please make sure the parameter is meeting the following conditions:
- The provided parameter is a number;
- The provided parameter is not negative;
- The provided parameter is not above ${xpHardLimits.experience.max};`)
						return message.channel.send({embeds: [settingsEmbed]})
						}
						res.systems.exp.xp_per_message.max = args[2]
						settingsEmbed.setDescription(`${issuer}, I have set the maximum experience gained to be **\`${args[2]}\`**`)
						message.channel.send({embeds: [settingsEmbed]})
					}
					if(args[1] == 'rate'){
						if (isNaN(args[2]) || Number(args[2]) < 0 || Number(args[2]) > xpHardLimits.rate) {
							settingsEmbed.setDescription(`Please make sure the parameter is meeting the following conditions:
- The provided parameter is a number;
- The provided parameter is not negative;
- The provided parameter is not above ${xpHardLimits.rate};`)
						return message.channel.send({embeds: [settingsEmbed]})
						}
						res.systems.exp.xp_rate = args[2]
						settingsEmbed.setDescription(`${issuer}, I have set the xp rate to be **\`${args[2]}\`**`)
						message.channel.send({embeds: [settingsEmbed]})
					}
					if(args[1] == 'cooldown'){
						try {
							const acceptedTimeLetters = ['s','sec','seconds','m','min','h','hours']
							if (!checkForItems(args[2],acceptedTimeLetters,"includes") || ms(args[2]) < xpHardLimits.cooldown.min || ms(args[2]) > xpHardLimits.cooldown.max) {
								settingsEmbed.setDescription(`Please make sure the parameter is meeting the following conditions:
	- The provided parameter is a time format (e.g: 1s, 11sec, 1m, 11min, 1h, 2hours, etc);
	- The provided parameter is not negative;
	- The provided parameter is not above ${pms(xpHardLimits.cooldown.max)};`)
							return message.channel.send({embeds: [settingsEmbed]})
							}
							// if(convertedTime < 0) convertedTime = convertedTime * (-1)
							res.systems.exp.cooldownMsg = ms(args[2])
							settingsEmbed.setDescription(`${issuer}, I have set the cooldown to be **\`${pms(res.systems.exp.cooldownMsg,{verbose: true})}\`**`)
							message.channel.send({embeds: [settingsEmbed]})
						} catch (error) {
							return message.channel.send(`${issuer}, Please type a time as followed:\nIn seconds => 5s, 15sec, 25seconds\nIn minutes => 1m, 2min, 3minutes\nIn hours => 1h, 2hours`)
						}
					}
					if(args[1] == 'coin'){
						settingsEmbed.setDescription(`${issuer}, set the minimum (\`min\`) or maximum (\`max\`) amount of coins to earn. After min/max, add a number!`)
						if(!args[2]) return message.channel.send({embeds: [settingsEmbed]})
						if(args[2] == `min`){
							if (isNaN(args[3]) || Number(args[3]) < 0 || Number(args[3]) < xpHardLimits.coins.min || Number(args[3]) >= res.systems.exp.coin_drop.max) {
								settingsEmbed.setDescription(`Please make sure the parameter is meeting the following conditions:
	- The provided parameter is a number;
	- The provided parameter is not negative or below ${xpHardLimits.coins.min};
	- The provided parameter is not equal or above ${res.systems.exp.coin_drop.max}`)
							return message.channel.send({embeds: [settingsEmbed]})
							}
							res.systems.exp.coin_drop.min = Number(args[3])
							settingsEmbed.setDescription(`${issuer}, I have set the minimum coin drop to be **\`${args[3]}\`**`)
						message.channel.send({embeds: [settingsEmbed]})
						}
						if(args[2] == `max`){
							if (isNaN(args[3]) || Number(args[3]) < 0 || Number(args[3]) > xpHardLimits.coins.max || Number(args[3]) <= res.systems.exp.coin_drop.min) {
								settingsEmbed.setDescription(`Please make sure the parameter is meeting the following conditions:
	- The provided parameter is a number;
	- The provided parameter is not negative or above ${xpHardLimits.coins.max};
	- The provided parameter is not equal or below ${res.systems.exp.coin_drop.min}`)
							return message.channel.send({embeds: [settingsEmbed]})
							}
							res.systems.exp.coin_drop.max = Number(args[3])
							settingsEmbed.setDescription(`${issuer}, I have set the maximum coin drop to be **\`${args[3]}\`**`)
						message.channel.send({embeds: [settingsEmbed]})
						}
					}
					if(args[1] == 'ignore'){
						let currentChannelsIgnored = res.systems.exp.ignoredChannels;
						let channelsMentioned = message.mentions.channels.map(item => item.id);
						let changes = ``
						let changes2 = ``

						settingsEmbed.setDescription(`${issuer}, please mention at least 1 channel! If the channel was added already, it will be removed and vice versa!`)
						if (channelsMentioned.length == 0) return message.channel.send({embeds: [settingsEmbed]});

						for (const channel of channelsMentioned) {
							if(!currentChannelsIgnored.includes(channel)){
								currentChannelsIgnored.push(channel)
								changes += `- Added <#${channel}>.\n`
							} else {
								let getIndex = currentChannelsIgnored.findIndex(index => index === channel);
								currentChannelsIgnored.splice(getIndex,1)
								changes2 += `- Removed <#${channel}>.\n`
							}
						}
						res.systems.exp.ignoredChannels = currentChannelsIgnored
						settingsEmbed.setDescription(`.`)
						settingsEmbed.addFields([
							{name: `The following channel(s) will not give XP to members:`,value: changes.length > 0 ? `${changes}` : `No Changes made.`,inline: true},
							{name: `The following channel(s) will give XP to members:`,value: changes2.length > 0 ? `${changes2}` : `No Changes made.`,inline: true},
							{name: `Now ignoring next channel(s):`,value: currentChannelsIgnored.length > 0 ? Array.from(currentChannelsIgnored.map(item => item = `<#${item}> `).values()).join(`,\n`) : `No channel is ignored from XP System!`}
						])
						message.channel.send({embeds: [settingsEmbed] })
					}
					if(args[1] == `enable`){
						res.systems.exp.enabled = true
						settingsEmbed.setDescription(`Leveling system has been enabled!`)
						message.channel.send({embeds: [settingsEmbed]});
					}
					if(args[1] == `disable`){
						res.systems.exp.enabled = false
						settingsEmbed.setDescription(`Leveling system has been disabled!`)
						message.channel.send({embeds: [settingsEmbed]});
					}
				}
				if (args[0] == 'antispam'){
					let antispamEmbed = new SharuruEmbed()
						.setColor(Colors.LuminousVividPink)
						.setFooter({text: `Changes done by ${issuer.tag} (${issuer.id}) at `})
						.setTimestamp()
						.setDescription(`I have made the next changes accordingly to what you provided me:`)
						settingsEmbed.setDescription(`${issuer}, Select one of:\n- enable/disable => enable/disable the Anti-Spam System;
						- warnlimit \`<Number: 1-20>\`;
						- mutelimit \`<Number: 1-20>\`;
						- kicklimit \`<Number: 1-20>\`;
						- banlimit \`<Number: 1-20>\`;
						- warnduplimit \`<Number: 1-20>\`;
						- muteduplimit \`<Number: 1-20>\`;
						- kickduplimit \`<Number: 1-20>\`;
						- banduplimit \`<Number: 1-20>\`;
						- spamtime \`<time: 2s-15s>\`;
						- spamduptime \`<time: 2s-15s>\`;
						- log-actions \`<yes/no>\`;					
						- log-channel \`<channelMention: #channel>\`;
						- warn-message \`<text>\`;
						- mute-message \`<text>\`;
						- kick-message \`<text>\`;
						- ban-message \`<text>\`;
						- mute-role \`<roleMention: @role>\`;
						- ignore-members \`<memberMentions: @member1 @member2 @member3>\`;
						- ignore-roles \`<roleMentions: @role1 @role2 @role3>\`;
						- ignore-channels \`<memberMentions: #channel1 #channel2 #channel3>\`;
						- ignore-permisisons \`<permissionName: perm1 perm2 perm3>\`;
						- ignore-bots \`<yes/no>\`;
						- enable-warn \`<yes/no>\`;
						- enable-mute \`<yes/no>\`;
						- enable-kick \`<yes/no>\`;
						- enable-ban \`<yes/no>\`;
						- delete-msg-ban \`<Number: 1-7>\`;
						- delete-msg-spam \`<yes/no>\`;
						- delete-msg-bot \`<yes/no>\`;
						`)
					if(!args[1]) return message.channel.send({embeds: [settingsEmbed]})

					if(args[1] == 'enable'){
						if(res.systems.antispam.enabled == true) {
							settingsEmbed.setDescription(`${issuer}, the Anti-Spam System is already \`enabled\``)	
							return message.channel.send({embeds: [settingsEmbed]})
						}
						res.systems.antispam.enabled = true;
						settingsEmbed.setDescription(`${issuer}, I have enabled the Anti-Spam System!`)	
						message.channel.send({embeds: [settingsEmbed]})
					}
					
					if(args[1] == 'disable') {
						if(res.systems.antispam.enabled == false) {
							settingsEmbed.setDescription(`${issuer}, the Anti-Spam System is already \`disabled\``)	
							return message.channel.send({embeds: [settingsEmbed]})
						}
						res.systems.antispam.enabled = false;
						settingsEmbed.setDescription(`${issuer}, I have disabled the Anti-Spam System!`)	
						message.channel.send({embeds: [settingsEmbed]})
					}

					if(args[1] == 'warnlimit'){
						if(!answer) {
							settingsEmbed.setDescription(`${issuer}, You need to provide a number between \`3\` and \`20\`!`)
							return message.channel.send({embeds: [settingsEmbed]});
						}
						if(isNaN(answer)) {
							settingsEmbed.setDescription(`${issuer}, please provide a number!`)
							return message.channel.send({embeds: [settingsEmbed]});
						}
						if(answer >= 3 && answer <= 20){
							res.systems.antispam.warnThreshold = answer;
							settingsEmbed.setDescription(`${issuer}, the threshold of warnings will be ${answer} messages. If they send ${answer} or more within ${pms(res.systems.antispam.maxInterval)}, they will get warned!`)
							message.channel.send({embeds: [settingsEmbed]})
						} else {
							settingsEmbed.setDescription(`${issuer}, the threshold of warnings punishment has a minimum of at least 3 and maximum is 20!`)
							return message.channel.send({embeds: [settingsEmbed]});
						}
					}

					if(args[1] == 'mutelimit'){
						if(!answer) {
							settingsEmbed.setDescription(`${issuer}, You need to provide a number between \`3\` and \`20\`!`)
							return message.channel.send({embeds: [settingsEmbed]});
						}
						if(isNaN(answer)) {
							settingsEmbed.setDescription(`${issuer}, please provide a number!`)
							return message.channel.send({embeds: [settingsEmbed]});
						}
						if(answer >= 3 && answer <= 20){
							res.systems.antispam.muteThreshold = Number(answer);
							settingsEmbed.setDescription(`${issuer}, the threshold of mute will be ${answer} messages. If they send ${answer} or more within ${pms(res.systems.antispam.maxInterval)}, they will get muted!`)
							message.channel.send({embeds: [settingsEmbed]})
						} else {
							settingsEmbed.setDescription(`${issuer}, the threshold of mute punishment has a minimum of at least 3 and maximum is 20!`)
							return message.channel.send({embeds: [settingsEmbed]});
						}
					}

					if(args[1] == 'kicklimit'){
						if(!answer) {
							settingsEmbed.setDescription(`${issuer}, You need to provide a number between \`3\` and \`20\`!`)
							return message.channel.send({embeds: [settingsEmbed]});
						}
						if(isNaN(answer)) {
							settingsEmbed.setDescription(`${issuer}, please provide a number!`)
							return message.channel.send({embeds: [settingsEmbed]});
						}
						if(answer >= 3 && answer <= 20){
							res.systems.antispam.kickThreshold = Number(answer);
							settingsEmbed.setDescription(`${issuer}, the threshold of kick punishment will be ${answer} messages. If they send ${answer} or more within ${pms(res.systems.antispam.maxInterval)}, they will get kicked!`)
							message.channel.send({embeds: [settingsEmbed]})
						} else {
							settingsEmbed.setDescription(`${issuer}, the threshold of kick punishment has a minimum of at least 3 and maximum is 20!`)
							return message.channel.send({embeds: [settingsEmbed]});
						}
					}

					if(args[1] == 'banlimit'){
						if(!answer) {
							settingsEmbed.setDescription(`${issuer}, You need to provide a number between \`3\` and \`20\`!`)
							return message.channel.send({embeds: [settingsEmbed]});
						}
						if(isNaN(answer)) {
							settingsEmbed.setDescription(`${issuer}, please provide a number!`)
							return message.channel.send({embeds: [settingsEmbed]});
						}
						if(answer >= 3 && answer <= 20){
							res.systems.antispam.banThreshold = Number(answer);
							settingsEmbed.setDescription(`${issuer}, the threshold of ban punishment will be ${answer} messages. If they send ${answer} or more within ${pms(res.systems.antispam.maxInterval)}, they will get banned!`)
							message.channel.send({embeds: [settingsEmbed]})
						} else {
							settingsEmbed.setDescription(`${issuer}, the threshold of ban punishment has a minimum of at least 3 and maximum is 20!`)
							return message.channel.send({embeds: [settingsEmbed]});
						}
					}

					if(args[1] == 'warnduplimit'){
						if(!answer || isNaN(answer)) {
							settingsEmbed.setDescription(`${issuer}, You need to provide a number between \`5\` and \`20\`!`)
							return message.channel.send({embeds: [settingsEmbed]});
						}
						if(answer >= 5 && answer <= 20){
							res.systems.antispam.maxDuplicatesWarn = Number(answer);
							settingsEmbed.setDescription(`${issuer}, the threshold of warnings for duplicate messages will be ${answer}. If they send ${answer} or more within ${pms(res.systems.antispam.maxInterval)}, they will get warned!`)
							message.channel.send({embeds: [settingsEmbed]})
						} else {
							settingsEmbed.setDescription(`${issuer}, the threshold of warnings for duplicate messages has a minimum of at least 5 and maximum is 20!`)
							return message.channel.send({embeds: [settingsEmbed]});
						}
					}

					if(args[1] == 'muteduplimit'){
						if(!answer || isNaN(answer)) {
							settingsEmbed.setDescription(`${issuer}, You need to provide a number between \`5\` and \`20\`!`)
							return message.channel.send({embeds: [settingsEmbed]});
						}
						if(answer >= 5 && answer <= 20){
							res.systems.antispam.maxDuplicatesMute = Number(answer);
							settingsEmbed.setDescription(`${issuer}, the threshold of mute for duplicate messages will be ${answer}. If they send ${answer} or more within ${pms(res.systems.antispam.maxInterval)}, they will get muted!`)
							message.channel.send({embeds: [settingsEmbed]})
						} else {
							settingsEmbed.setDescription(`${issuer}, the threshold of mute for duplicate messages has a minimum of at least 5 and maximum is 20!`)
							return message.channel.send({embeds: [settingsEmbed]});
						}
					}

					if(args[1] == 'kickduplimit'){
						if(!answer || isNaN(answer)) {
							settingsEmbed.setDescription(`${issuer}, You need to provide a number between \`5\` and \`20\`!`)
							return message.channel.send({embeds: [settingsEmbed]});
						}
						if(answer >= 5 && answer <= 20){
							res.systems.antispam.maxDuplicatesKick = Number(answer);
							settingsEmbed.setDescription(`${issuer}, the threshold of kick for duplicate messages will be ${answer}. If they send ${answer} or more within ${pms(res.systems.antispam.maxInterval)}, they will get kicked!`)
							message.channel.send({embeds: [settingsEmbed]})
						} else {
							settingsEmbed.setDescription(`${issuer}, the threshold of kick for duplicate messages has a minimum of at least 5 and maximum is 20!`)
							return message.channel.send({embeds: [settingsEmbed]});
						}
					}

					if(args[1] == 'banduplimit'){
						if(!answer || isNaN(answer)) {
							settingsEmbed.setDescription(`${issuer}, You need to provide a number between \`5\` and \`20\`!`)
							return message.channel.send({embeds: [settingsEmbed]});
						}
						if(answer >= 5 && answer <= 20){
							res.systems.antispam.maxDuplicatesBan = Number(answer);
							settingsEmbed.setDescription(`${issuer}, the threshold of ban for duplicate messages will be ${answer}. If they send ${answer} or more within ${pms(res.systems.antispam.maxInterval)}, they will get banned!`)
							message.channel.send({embeds: [settingsEmbed]})
						} else {
							settingsEmbed.setDescription(`${issuer}, the threshold of ban for duplicate messages has a minimum of at least 5 and maximum is 20!`)
							return message.channel.send({embeds: [settingsEmbed]});
						}
					}

					if(args[1] == 'spamtime'){
						if(!answer || isNaN(answer)) {
							settingsEmbed.setDescription(`${issuer}, You need to provide a number between \`5\` and \`20\`!`)
							return message.channel.send({embeds: [settingsEmbed]});
						}
						if(answer >= 5 && answer <= 20){
							res.systems.antispam.maxDuplicatesBan = Number(answer);
							settingsEmbed.setDescription(`${issuer}, the threshold of ban for duplicate messages will be ${answer}. If they send ${answer} or more within ${pms(res.systems.antispam.maxInterval)}, they will get banned!`)
							message.channel.send({embeds: [settingsEmbed]})
						} else {
							settingsEmbed.setDescription(`${issuer}, the threshold of ban for duplicate messages has a minimum of at least 5 and maximum is 20!`)
							return message.channel.send({embeds: [settingsEmbed]});
						}

						if(!answer) return message.channel.send(`${issuer}, you need to provide a time amount between \`2s\` and \`10s\`!`);
						if(!answer.includes('s')) return message.channel.send(`${issuer}, please provide a time between \`2s\` and \`6s\`. Do not forget to type in this format: \`2s, 4s, 6s, 9s etc\``)
						if(ms(answer) >= 2000 && ms(answer) <= 10000){
							res.systems.antispam.maxInterval = ms(answer);
							message.channel.send(`${issuer}, the time frame where if people spam messages will be ${answer} from now on! If they type ${res.systems.antispam.warnThreshold} messages within ${answer}, they will start to get punished!`)
						} else {
							message.channel.send(`${issuer}, you need to provide a time amount between \`2s\` and \`10s\`!`);
						}
					}

					if(args[1] == 'spamduptime'){
						if(!answer) return message.channel.send(`${issuer}, You need to provide a time amount between \`3s\` and \`15s\`!`);
						if(!answer.includes('s')) return message.channel.send(`${issuer}, please provide a time between \`3s\` and \`15s\`. Do not forget to type in this format: \`3s, 5s, 7s, 10s, 13.5s etc\``)
						if(ms(answer) >= 3000 && ms(answer) <= 15000){
							res.systems.antispam.maxDuplicatesInterval = ms(answer);
							message.channel.send(`${issuer}, the time frame where if people spam identical message will be ${answer} from now on! If they will spam more than  ${res.systems.antispam.maxDuplicatesWarn} messages within ${answer}, they will start to get punished!`)
						}
					}

					if(args[1] == 'log-actions'){
						if(!answer) return message.channel.send(`${issuer}, You need to provide \`yes\` or \`no\``);
						if(res.systems.antispam.enabled == answer) return message.channel.send(`${issuer}, this feature is already \`${res.systems.antispam.enabled ? `enabled` : `disabled`}\``)
						if(answer == 'yes'){
							res.systems.antispam.modLogsEnabled = true;
							message.channel.send(`${issuer}, I'll log any action I take in #${res.systems.antispam.modLogsChannelName} channel!`)
						}
						if(answer == 'no'){
							res.systems.antispam.modLogsEnabled = false;
							message.channel.send(`${issuer}, I'll not log anything anymore!`)
						}
					}

					if(args[1] == 'log-channel'){
						if(!answer) return message.channel.send(`${issuer}, You need to provide a channel mention!`);
						let findCh = message.guild.channels.cache.find(ch => ch.id == message.mentions.channels.first()?.id)
						if(findCh){
							res.systems.antispam.modLogsChannelName = findCh.id
							message.channel.send(`${issuer}, the log channel for the future Anti-Spam actions will be ${findCh}!`)
						}
						if(!findCh){
							return message.channel.send(`${issuer}, I coudn't find this channel that you mentioned. Either it doesn't exist, either I can't see it. Please make sure I can see it!`)
						}
					}

					if(args[1] == 'warn-message'){
						if(!answer) return message.channel.send(`${issuer}, please provide a message between 10 and 120 characters for when they get warned! You can use these formats:\n- \`{member}\` => mention the member\n- \`{member_tag}\` => doesn't mention the member\n\n**Current Message**: *${res.systems.antispam.warnMessage}*`)
						if(answer.length < 10 && answer.length > 120){
							res.systems.antispam.warnMessage = answer
							message.channel.send(`${issuer}, this will be the warn message from now on: \`${answer}\` `)
						}
					}

					if(args[1] == 'mute-message'){
						if(!answer) return message.channel.send(`${issuer}, please provide a message between 10 and 120 characters for when they get muted! You can use these formats:\n- \`{member}\` => mention the member\n- \`{member_tag}\` => doesn't mention the member\n\n**Current Message**: *${res.systems.antispam.muteMessage}*`)
						if(answer.length < 10 && answer.length > 120){
							res.systems.antispam.muteMessage = answer
							message.channel.send(`${issuer}, this will be the mute message from now on: \`${answer}\` `)

						}
					}

					if(args[1] == 'kick-message'){
						if(!answer) return message.channel.send(`${issuer}, please provide a message between 10 and 120 characters for when they get kicked!You can use this format \`{member_tag}\` to say their name!\n\n**Current Message**: *${res.systems.antispam.kickMessage}*`)
						if(answer.length < 10 && answer.length > 120){
							res.systems.antispam.kickMessage = answer
							message.channel.send(`${issuer}, this will be the kick message from now on: \`${answer}\` `)

						}
					}

					if(args[1] == 'ban-message'){
						if(!answer) return message.channel.send(`${issuer}, please provide a message between 10 and 120 characters for when they get banned! You can use this format \`{member_tag}\` to say their name!\n\n**Current Message**: *${res.systems.antispam.banMessage}*`)
						if(answer.length < 10 && answer.length > 120){
							res.systems.antispam.banMessage = answer
							message.channel.send(`${issuer}, this will be the ban message from now on: \`${answer}\` `)

						}
					}

					if(args[1] == 'mute-role'){
						if(!answer) return message.channel.send(`${issuer}, You need to provide a role mention! Currently the mute role selected is: <@&${res.systems.antispam.muteRole}>`);
						let findRole = message.guild.roles.cache.find(ch => ch.id == message.mentions.roles.first()?.id)
						if(findRole){
							res.systems.antispam.modLogsChannelName = findRole.id
							message.channel.send(`${issuer}, from now on, when the mute punishment is applied, the ${findRole} will be given!`)
						}
						if(!findRole){
							return message.channel.send(`${issuer}, I coudn't find this role that you mentioned. It can be possible because of 3 causes that I know:\n\n- it doesn't exist (this could be mostly since I couldn't find it)\n- I can't handle it because it's above my role\n- I don't have permissions to manage roles!\n\nAfter you checked these 3 things, try again!`)
						}
					}

					if(args[1] == 'ignore-members'){
						let currentMembersIgnored = res.systems.antispam.ignoredMembers;
						let membersMentioned = message.mentions.users.map(item => item.id);
						// console.log(membersMentioned)
						let changes = ``
						let changes2 = ``

						if (membersMentioned.length == 0) return message.channel.send(`${issuer}, please mention at least 1 member!! If the member was added already, it will be removed and vice versa!`);

						for (const user of membersMentioned) {
							if(!currentMembersIgnored.includes(user)){
								currentMembersIgnored.push(user)
								changes += `- Added <@${user}>.\n`
							} else {
								let getIndex = currentMembersIgnored.findIndex(index => index === user);
								currentMembersIgnored.splice(getIndex,1)
								changes2 += `- Removed <@${user}>.\n`
							}
						}
						res.systems.antispam.ignoredMembers = currentMembersIgnored
						antispamEmbed.addFields([
							{name: `From now on, they will be ignored from the Anti-Spam System:`,value: changes.length > 0 ? changes : `No Changes made.`,inline: true},
							{name: `From now on, they will not be ignored anymore from the Anti-Spam System!:`,value: changes2.length > 0 ? changes2 : `No Changes made.`,inline: true},
							{name: `Now ignoring next member(s):`,value: currentMembersIgnored.length > 0 ? currentMembersIgnored.map(item => item = `<@${item}>`) : `No one is ignored from Anti-Spam System!`}

						])
						message.channel.send({embeds: [antispamEmbed] })
					}

					if(args[1] == 'ignore-roles'){
						let currentRolesIgnored = res.systems.antispam.ignoredRoles;
						let rolesMentioned = message.mentions.roles.map(item => item.id);
						let changes = ``
						let changes2 = ``

						if (rolesMentioned.length == 0) return message.channel.send(`${issuer}, please mention at least 1 role! If the role was added already, it will be removed and vice versa!`);

						for (const role of rolesMentioned) {
							if(!currentRolesIgnored.includes(role)){
								currentRolesIgnored.push(role)
								changes += `- Added <@&${role}>.\n`
							} else {
								let getIndex = currentRolesIgnored.findIndex(index => index === role);
								currentRolesIgnored.splice(getIndex,1)
								changes2 += `- Removed <@&${role}>.\n`
							}
						}
						res.systems.antispam.ignoredRoles = currentRolesIgnored
						antispamEmbed.addFields([
							{name: `From now on, any member with this role will be ignored from the Anti-Spam System:`,value: changes.length > 0 ? changes : `No Changes made.`,inline: true},
							{name: `From now on, any member with this role will be no longer ignored from the Anti-Spam System:`,value: changes2.length > 0 ? changes2 : `No Changes made.`,inline: true},
							{name: `Now ignoring next role(s):`,value: currentRolesIgnored.length > 0 ? currentRolesIgnored.map(item => item = `<@&${item}>`) : `No role is ignored from Anti-Spam System!`}
						])
						message.channel.send({embeds: [antispamEmbed] })
					}

					if(args[1] == 'ignore-channels'){
						let currentChannelsIgnored = res.systems.antispam.ignoredChannels;
						let channelsMentioned = message.mentions.channels.map(item => item.id);
						let changes = ``
						let changes2 = ``

						if (channelsMentioned.length == 0) return message.channel.send(`${issuer}, please mention at least 1 channel! If the channel was added already, it will be removed and vice versa!`);

						for (const channel of channelsMentioned) {
							if(!currentChannelsIgnored.includes(channel)){
								currentChannelsIgnored.push(channel)
								changes += `- Added <#${channel}>.\n`
							} else {
								let getIndex = currentChannelsIgnored.findIndex(index => index === channel);
								currentChannelsIgnored.splice(getIndex,1)
								changes2 += `- Removed <#${channel}>.\n`
							}
						}
						res.systems.antispam.ignoredChannels = currentChannelsIgnored
						antispamEmbed.addFields([
							{name: `From now on, this channel will be ignored from the Anti-Spam System:`,value: changes.length > 0 ? changes : `No Changes made.`,inline: true},
							{name: `From now on, this channel will be no longer ignored from the Anti-Spam System:`,value: changes2.length > 0 ? changes2 : `No Changes made.`,inline: true},
							{name: `Now ignoring next channel(s):`,value: currentChannelsIgnored.length > 0 ? currentChannelsIgnored.map(item => item = `<#${item}>`) : `No channel is ignored from Anti-Spam System!`}
						])
						message.channel.send({embeds: [antispamEmbed] })
					}

					if(args[1] == 'ignore-permissions'){
						let permissionExistent = [
							{
								abbr: 'inv',
								name: `invite`,
								perm: 'CREATE_INSTANT_INVITE'
							},
							{
								abbr: 'kic',
								name: `kick`,
								perm: 'KICK_MEMBERS'
							},
							{
								abbr: 'ba',
								name: `ban`,
								perm: 'BAN_MEMBERS'
							},
							{
								abbr: 'message',
								name: `managemessages`,
								perm: 'MANAGE_MESSAGES'
							},
							{
								abbr: `channel`,
								name: `managechannels`,
								perm: 'MANAGE_CHANNELS'
							},
							{
								abbr: `server`,
								name: `manageserver`,
								perm: 'MANAGE_GUILD'
							},
							{
								abbr: `nickname`,
								name: `changenickname`,
								perm: 'CHANGE_NICKNAME'
							},
							{
								abbr: `nickname`,
								name: `managenicknames`,
								perm: 'MANAGE_NICKNAME'
							},
							{
								abbr: `role`,
								name: `manageroles`,
								perm: 'MANAGE_ROLES'
							},
							{
								abbr: `webhook`,
								name: `managewebhooks`,
								perm: 'MANAGE_WEBHOOKS'
							},
							{
								abbr: `reaction`,
								name: `addreactions`,
								perm: 'ADD_REACTIONS'
							},
							{
								abbr: `view`,
								name: `viewauditlog`,
								perm: 'VIEW_AUDIT_LOG'
							},
							{
								abbr: `speaker`,
								name: `priorityspeaker`,
								perm: 'PRIORITY_SPEAKER'
							},
							{
								abbr: `stream`,
								name: `video`,
								perm: 'STREAM'
							},
							{
								abbr: `view`,
								name: `viewchannel`,
								perm: 'VIEW_CHANNEL'
							},
							{
								abbr: `message`,
								name: `sendmessages`,
								perm: PermissionsBitField.Flags.SendMessages
							},
							{
								abbr: `tts`,
								name: `sendtts`,
								perm: 'SEND_TTS_MESSAGES'
							},
							{
								abbr: `link`,
								name: `embedlinks`,
								perm: 'EMBED_LINKS'
							},
							{
								abbr: `upload`,
								name: `attachfiles`,
								perm: 'ATTACH_FILES'
							},
							{
								abbr: `history`,
								name: `seehistory`,
								perm: 'READ_MESSAGE_HISTORY'
							},
							{
								abbr: `everyone`,
								name: `mentioneveryone`,
								perm: 'MENTION_EVERYONE'
							},
							{
								abbr: `emoji`,
								name: `moreemoji`,
								perm: 'USE_EXTERNAL_EMOJIS'
							},
							{
								abbr: `emoji`,
								name: `manageemoji&stickers`,
								perm: 'MANAGE_EMOJIS_AND_STICKERS'
							},
							{
								abbr: `insights`,
								name: `insights`,
								perm: 'VIEW_GUILD_INSIGHTS'
							},
							{
								abbr: `connect`,
								name: `connect`,
								perm: 'CONNECT'
							},
							{
								abbr: `speak`,
								name: `speak`,
								perm: 'SPEAK'
							},
							{
								abbr: `mute`,
								name: `muteothers`,
								perm: 'MUTE_MEMBERS'
							},
							{
								abbr: `deafen`,
								name: `deafenothers`,
								perm: 'DEAFEN_MEMBERS'
							},
							{
								abbr: `move`,
								name: `moveothers`,
								perm: 'MOVE_MEMBERS'
							},
							{
								abbr: `voice`,
								name: `voicedetect`,
								perm: 'USE_VAD'
							},
						]
						let currentPermissionsIgnored = res.systems.antispam.ignoredPermissions;
						let permissionMentioned = args.slice(2).join(" ").split(",");
						let permissionTranslated = [];
						let changes = ``;
						let changes2 = ``;
						let notRecognizedPerms = ``
						let suggestedPerms = ``

						if (permissionMentioned.length == 0) return message.channel.send(`${issuer}, please mention at least 1 permission! If the channel was added already, it will be removed and vice versa!\n\n***ATTENTION***! To add multiple permissions, please type the name of the permission + **comma** after each permission!E.g: \`!settings systems.antispam ignore-permissions admin, invite, view-channel\`!`);
						for (let i = 0; i < permissionMentioned.length; i++) {
							let perm = permissionMentioned[i];
							perm = perm.replace(/\s/g, '');
							if(perm == (`invite`)) perm = `CREATE_INSTANT_INVITE`;
							if(perm == (`kick`)) perm = `KICK_MEMBERS`;
							if(perm == (`ban`)) perm = `BAN_MEMBERS`;
							if(perm == (`managemessages`)) perm = `MANAGE_MESSAGES`;
							if(perm == (`managechannels`)) perm = `MANAGE_CHANNELS`;
							if(perm == (`manageserver`)) perm = `MANAGE_GUILD`;
							if(perm == (`changenickname`)) perm = `CHANGE_NICKNAME`;
							if(perm == (`managenicknames`) || perm == (`managenickname`)) perm = `MANAGE_NICKNAMES`;
							if(perm == (`manageroles`)) perm = `MANAGE_ROLES`;
							if(perm == (`managewebhooks`)) perm = `MANAGE_WEBHOOKS`;
							if(perm == (`manageemojis&stickers`)) perm = `MANAGE_EMOJIS_AND_STICKERS`;
							if(perm == (`addreactions`)) perm = `ADD_REACTIONS`;
							if(perm == (`viewauditlog`)) perm = `VIEW_AUDIT_LOG`;
							if(perm == (`priorityspeaker`)) perm = `PRIORITY_SPEAKER`;
							if(perm == (`video`)) perm = `STREAM`;
							if(perm == (`viewchannel`)) perm = `VIEW_CHANNEL`;
							if(perm == (`sendmessages`)) perm = PermissionsBitField.Flags.SendMessages;
							if(perm == (`sendtts`)) perm = `SEND_TTS_MESSAGES`;
							if(perm == (`embedlinks`)) perm = `EMBED_LINKS`;
							if(perm == (`upload`)) perm = `ATTACH_FILES`;
							if(perm == (`seehistory`)) perm = `READ_MESSAGE_HISTORY`;
							if(perm == (`mentioneveryone`)) perm = `MENTION_EVERYONE`;
							if(perm == (`moreemoji`)) perm = `USE_EXTERNAL_EMOJIS`;
							if(perm == (`insights`)) perm = `VIEW_GUILD_INSIGHTS`;
							if(perm == (`connect`)) perm = `CONNECT`;
							if(perm == (`speak`)) perm = `SPEAK`;
							if(perm == (`muteothers`)) perm = `MUTE_MEMBERS`;
							if(perm == (`deafenothers`)) perm = `DEAFEN_MEMBERS`;
							if(perm == (`moveothers`)) perm = `MOVE_MEMBERS`;
							if(perm == (`voicedetect`)) perm = `USE_VAD`;
				
							permissionTranslated.push(perm)
							let matches = permissionExistent.filter(thisperm =>{
								const regex = new RegExp(`^${perm.toLowerCase()}`, 'gi');
								return thisperm.name.toLowerCase().match(regex) || thisperm.abbr.toLowerCase().match(regex);
							})
							// console.log(matches)
							matches.map(match =>{
								if(match.name.toLowerCase().match(perm.toLowerCase()) && !permissionTranslated.includes(match.perm)) {
									suggestedPerms += `- **${match.name}** *(because you typed: "${match.abbr}")*\n`
									let getindex = permissionTranslated.findIndex(item => item === perm)
									permissionTranslated.splice(getindex,1)
								}
							})
							
						}
						for(let perm of permissionTranslated){
							if(perm !== perm.toUpperCase()){
								notRecognizedPerms += `- **${perm}**\n`
							}
						}
						let validPerms = []
						permissionTranslated.filter(ifExist =>{
							permissionExistent.filter(existPerm =>{
								if(existPerm.perm == ifExist) validPerms.push(ifExist)
							})
						})
						permissionTranslated = validPerms

						for (const permission of permissionTranslated) {
							if(!currentPermissionsIgnored.includes(permission)){
								currentPermissionsIgnored.push(permission)
								changes += `- Added **${convertPermsToHuman[permission]}** permission. \n`
							} else {
								let getIndex = currentPermissionsIgnored.findIndex(index => index === permission);
								currentPermissionsIgnored.splice(getIndex,1)
								changes2 += `- Removed **${convertPermsToHuman[permission]}** permission.\n`
							}
						}
						res.systems.antispam.ignoredPermissions = currentPermissionsIgnored
						let convertedPerms = []
						for(let perm of currentPermissionsIgnored){
							if(convertPermsToHuman.hasOwnProperty(perm)){
								convertedPerms.push(convertPermsToHuman[perm])
							}
						}
						antispamEmbed.addFields([
							{name: `From now on, anyone with this permission will be ignored from the Anti-Spam System:`,value: changes.length > 0 ? changes : `No Changes made.`,inline: true},
							{name: `From now on, anyone with this permission will be no longer ignored from the Anti-Spam System:`,value: changes2.length > 0 ? changes2 : `No Changes made.`,inline: true},
							{name: `Now ignoring next permission(s):`,value: convertedPerms.length > 0 ? convertedPerms : `No permission is ignored from Anti-Spam System!`},
							{name: '\u200B', value: '\u200B' },
							{name: `Suggested permissions:`, value: suggestedPerms.length > 0 ? suggestedPerms : `No permissions to suggest.`},
							{name: `Not recognized permissions:`, value: notRecognizedPerms.length > 0 ? notRecognizedPerms : `No unknown permission was present.`}
						])
						message.channel.send({embeds: [antispamEmbed] })
					}

					if(args[1] == 'ignore-bots'){
						if(!answer) return message.channel.send(`${issuer}, You need to provide \`yes\` or \`no\``);
						if(res.systems.antispam.enabled == answer) return message.channel.send(`${issuer}, this feature is already \`${res.systems.antispam.enabled ? `enabled` : `disabled`}\``)
						if(answer == 'yes'){
							res.systems.antispam.ignoreBots = true;
							message.channel.send(`${issuer}, I'll ignore bots from now on!`)
						}
						if(answer == 'no'){
							res.systems.antispam.ignoreBots = false;
							message.channel.send(`${issuer}, I'll not ignore bots from now on!`)
						}
					}

					if(args[1] == 'enable-warn'){
						if(!answer) return message.channel.send(`${issuer}, You need to provide \`yes\` either \`no\``);
						if(res.systems.antispam.enabled == answer) return message.channel.send(`${issuer}, this feature is already \`${res.systems.antispam.enabled ? `enabled` : `disabled`}\``)
						if(answer == 'yes'){
							res.systems.antispam.warnEnabled = true;
							message.channel.send(`${issuer}, I'll warn them from now on!`)
						}
						if(answer == 'no'){
							res.systems.antispam.warnEnabled = false;
							message.channel.send(`${issuer}, I'll not warn them from now on!`)
						}
					}

					if(args[1] == 'enable-mute'){
						if(!answer) return message.channel.send(`${issuer}, You need to provide \`yes\` either \`no\``);
						if(res.systems.antispam.enabled == answer) return message.channel.send(`${issuer}, this feature is already \`${res.systems.antispam.enabled ? `enabled` : `disabled`}\``)
						if(answer == 'yes'){
							res.systems.antispam.muteEnabled = true;
							// logchannel.send(`I have enabled the Anti-Spam System at ${issuer.tag} request`)
							message.channel.send(`${issuer}, I'll mute them from now on!`)
						}
						if(answer == 'no'){
							res.systems.antispam.muteEnabled = false;
							message.channel.send(`${issuer}, I'll not mute them from now on!`)
						}
					}

					if(args[1] == 'enable-kick'){
						if(!answer) return message.channel.send(`${issuer}, You need to provide \`yes\` either \`no\``);
						if(res.systems.antispam.enabled == answer) return message.channel.send(`${issuer}, this feature is already \`${res.systems.antispam.enabled ? `enabled` : `disabled`}\``)
						if(answer == 'yes'){
							res.systems.antispam.kickEnabled = true;
							// logchannel.send(`I have enabled the Anti-Spam System at ${issuer.tag} request`)
							message.channel.send(`${issuer}, I'll kick them from now on!`)
						}
						if(answer == 'no'){
							res.systems.antispam.kickEnabled = false;
							message.channel.send(`${issuer}, I'll not kick them from now on!`)
						}
					}

					if(args[1] == 'enable-ban'){
						if(!answer) return message.channel.send(`${issuer}, You need to provide \`yes\` either \`no\``);
						if(res.systems.antispam.enabled == answer) return message.channel.send(`${issuer}, this feature is already \`${res.systems.antispam.enabled ? `enabled` : `disabled`}\``)
						if(answer == 'yes'){
							res.systems.antispam.banEnabled = true;
							// logchannel.send(`I have enabled the Anti-Spam System at ${issuer.tag} request`)
							message.channel.send(`${issuer}, I'll ban them from now on!`)
						}
						if(answer == 'no'){
							res.systems.antispam.banEnabled = false;
							message.channel.send(`${issuer}, I'll not ban them from now on!`)
						}
					}

					if(args[1] == 'delete-msg-ban'){
						if(!answer) return message.channel.send(`${issuer}, You need to provide a number between \`1\` and \`7\`!`);
						if(isNaN(answer)) return message.channel.send(`${issuer}, This is not a number!`)
						if(answer >= 1 && answer <= 7){
							res.systems.antispam.deleteMessagesAfterBanForPastDays = answer;
							message.channel.send(`${issuer}, the period of message history that will be deleted for the banned users will be ${answer} day(s).`)
						}
					}

					if(args[1] == 'delete-msg-spam'){
						if(!answer) return message.channel.send(`${issuer}, You need to provide \`yes\` either \`no\``);
						if(res.systems.antispam.enabled == answer) return message.channel.send(`${issuer}, this feature is already \`${res.systems.antispam.enabled ? `enabled` : `disabled`}\``)
						if(answer == 'yes'){
							res.systems.antispam.removeMessages = true;
							// logchannel.send(`I have enabled the Anti-Spam System at ${issuer.tag} request`)
							message.channel.send(`${issuer}, I'll remove spam messages from now on!`)
						}
						if(answer == 'no'){
							res.systems.antispam.removeMessages = false;
							message.channel.send(`${issuer}, I'll not remove spam messages from now on!`)
						}
					}

					if(args[1] == 'delete-msg-bot'){
						if(!answer) return message.channel.send(`${issuer}, You need to provide \`yes\` either \`no\``);
						if(res.systems.antispam.enabled == answer) return message.channel.send(`${issuer}, this feature is already \`${res.systems.antispam.enabled ? `enabled` : `disabled`}\``)
						if(answer == 'yes'){
							res.systems.antispam.removeBotMessages = true;
							// logchannel.send(`I have enabled the Anti-Spam System at ${issuer.tag} request`)
							message.channel.send(`${issuer}, I'll remove the spam messages coming from bots from now on!`)
						}
						if(answer == 'no'){
							res.systems.antispam.removeBotMessages = false;
							message.channel.send(`${issuer}, I'll not remove the spam messages coming from bots from now on!`)
						}
					}

				}
				if (args[0] == 'starboard'){
					let option = args[1]
					if(!option) return message.channel.send(`Please select one of:\n- enable/disable\n- channel <#channelMention> => select the channel for systems.starboard to send\n- stars`)
					if(res.systems.starboard.enabled == option) return message.channel.send(`Starboard is already ${res.systems.starboard.enabled ? `enabled` : `disabled`}!`)
					if(option == 'enable'){
						res.systems.starboard.enabled = true
						message.channel.send(`${issuer}, I have enabled the systems.starboard feature!`)
					}
					if(option == 'disable') {
						res.systems.starboard.enabled = false
						message.channel.send(`${issuer}, I have disabled the systems.starboard feature!`)
					}

					if(option == 'channel'){
						let starChannel = message.guild.channels.cache.get(message.mentions.channels.first()?.id || args[2])
						if (!starChannel) return message.channel.send(`${issuer}, I cannot find the channel you tried to set as systems.starboard! Please mention, give the id of the channel or type it's name correctly!`)
						res.systems.starboard.channel = starChannel.id
						message.channel.send(`${issuer}, I have set the systems.starboard channel to be ${starChannel}!`)
					}
					if(option == 'stars'){
						let howManyStars = args[2]
						if (isNaN(howManyStars)) return message.channel.send(`${issuer}, The amount of stars to pin on Starboard Channel must be a number!`)
						if (howManyStars < 1 || howManyStars > 50) return message.channel.send(`${issuer}, The minimum stars needed cannot be below 1 or higher than 50!`)
						res.systems.starboard.count = parseInt(howManyStars)
						message.channel.send(`${issuer}, I have set the amount of stars needed for a message to ${howManyStars} to be pinned in the <#${res.systems.starboard.channel}>!`)
					}
				}
				if (args[0] == 'emojipack'){
					if(!args[1]) return message.channel.send(`${issuer}, Select one of:\n-enable\n-disable!`)
					if(args[1] == `enable`){
						res.systems.emojiPack = true
						message.channel.send(`Emoji Pack module has been enabled!`);
					}
					if(args[1] == `disable`){
						res.systems.emojiPack = false
						message.channel.send(`Emoji Pack module has been disabled!`)
					}
				} 
				if (args[0] == 'media') {
					const options = ['switch','add','remove','list','role','strikes','timeout','setup']
					let mediaEmbed = new SharuruEmbed()
						.setAuthor(`Media Channel Feature!`,this.client.user.displayAvatarURL({dynamic: true}))
						.setColor(Colors.LuminousVividPink)
						.setTimestamp()
						.setFooter({text: `Requested by ${issuer.tag} at`,iconURL: issuer.displayAvatarURL()})

					// help?
					if (options.indexOf(args[1]) == -1) {
						
						mediaEmbed.setDescription(`${issuer}, the available options are:\n
- \`switch\` => turns on media channel feature;
- \`add #channel1 #channel2 #channel3 ...\` => add channels;
- \`remove #channel1 #channel2 #channel3 ...\` => removes channel;
- \`list\` => shows a list of channels added;
- \`role\` => selects the role that will be granted when punished;
- \`strikes\` => selects the number of messages to count before applying the role 
- \`timeout\` => selects how long the punishment to be. Min 5 min, max 12h
- \`setup\` => a helper in assisting to set up a role for punished members that type in media channel useless messages.

The current settings are as:
Media Channel feature: ${res.systems.mediaChannel.enabled ? `Enabled` : `Disabled`}
Timeout: ${pms(Number(res.systems.mediaChannel.timeout))}
Strikes: ${res.systems.mediaChannel.strikes}
Channels: ${res.systems.mediaChannel.channels.length == 0 ? `No channel added.` : `${res.systems.mediaChannel.channels.map(i => `<#${i}>`).join(", ")}`}
Role: ${res.systems.mediaChannel.role == '0' ? `No role selected as punishment.` : `<@&${res.systems.mediaChannel.role}>`}
`)
						return message.channel.send({embeds: [mediaEmbed]})
					}

					// switch
					if (options.indexOf(args[1]) == 0) {
						if(res.systems.mediaChannel.enabled == true){
							res.systems.mediaChannel.enabled = false;
							mediaEmbed.setDescription(`${issuer}, I have turned off the media channel system. They will be able to post anything now.`)
							message.channel.send({embeds: [mediaEmbed]})
						} else {
							res.systems.mediaChannel.enabled = true
							mediaEmbed.setDescription(`${issuer}, I have turned on the media channel system. They will be able to post only messages with attachments (videos/pictures/links) now.`)
							if (res.systems.mediaChannel.channels.length == 0) mediaEmbed.addField(`To add a channel to media channel list, please use:`,`\`${prefix}settings media add #channel1 #channel2 #channel3...\``)
							if (res.systems.mediaChannel.role == '0') mediaEmbed.addField(`Do not forget to select a role to be given as punishment for those who post multiple messages in media channel only without any picture/video/link!`,`You can either select one by doing \`${prefix}settings media role @role\` or you can allow me to set up a new role called "no media channel" and I'll also set up permission only for the available media channels added by selecting the \`setup\` option!`)
							message.channel.send({embeds: [mediaEmbed]})
						}
					}

					// add
					if (options.indexOf(args[1]) == 1) {
						if (!args[2]) return message.channel.send(`You didn't provide a mention channel!`).then(m => tools.deleteMsg(m,'3.5s'))
						let userChannels = [...message.mentions.channels.keys()]
						try {
							if (userChannels.length > 1) {
								let addedReport = ``;
								let didntReport = ``;
								for(let i = 0; i<userChannels.length; i++) {
									let tryThisChannel = message.guild.channels.cache.find(ch => ch.id == userChannels[i])
									if (tryThisChannel) {
										if (res.systems.mediaChannel.channels.find(i => i == tryThisChannel.id)) {
											didntReport += `- ${tryThisChannel}\n`
										} else {
											res.systems.mediaChannel.channels.push(tryThisChannel.id)
											addedReport += `- ${tryThisChannel}\n`
										}
									}
								}
								mediaEmbed.addField(`I have added the following channels:`,addedReport)
								mediaEmbed.addField(`These channels are already in my list:`,didntReport)
								message.channel.send({embeds: [mediaEmbed]})
							}
							if (userChannels.length == 1) {
								let tryThisChannel = message.guild.channels.cache.find(ch => ch.id == userChannels[0])
									if (tryThisChannel) {
										if (res.systems.mediaChannel.channels.find(i => i == tryThisChannel.id)) {
											mediaEmbed.setDescription(`${issuer}, this channel, ${tryThisChannel}, is already in media channel list!`)
											return message.channel.send({embeds: [mediaEmbed]})
										}
										res.systems.mediaChannel.channels.push(tryThisChannel.id)
										mediaEmbed.setDescription(`I have added ${tryThisChannel} to media channel list!`)
										message.channel.send({embeds: [mediaEmbed]})
									}
							}
						} catch (error) {
							console.log(error)
							message.channel.send(`${issuer}, it seems like this channel or ID provided, "${userChannels[i]}", I can't seem to find it. Do I even have perms to see it? or you provided the correct mention/id?`)
						}
					}

					// remove
					if (options.indexOf(args[1]) == 2) {
						if (!args[2]) return message.channel.send(`You didn't provide a channel/id!`).then(m => tools.deleteMsg(m,'3.5s'))
						let userChannels = [...message.mentions.channels.keys()]
						try {
							if (userChannels.length > 1) {
								let removedReport = ``
								let didntReport = ``
								for(let i = 0; i<userChannels.length; i++) {
									let tryThisChannel = message.guild.channels.cache.find(ch => ch.id == userChannels[i])
									if (tryThisChannel) {
										if (!res.systems.mediaChannel.channels.find(i => i == tryThisChannel.id)) {
											didntReport += `- ${tryThisChannel}\n`
										} else {
											let indexCH = res.systems.mediaChannel.channels.findIndex(i => i == tryThisChannel.id)
											res.systems.mediaChannel.channels.splice(indexCH,1)
											removedReport += `- ${tryThisChannel}\n`
										}
									}
								}//
								mediaEmbed.addField(`I have removed the following channels:`,removedReport)
								mediaEmbed.addField(`I couldn't remove the following channels because they are not in my list:`,didntReport)
								message.channel.send({embeds: [mediaEmbed]})
							}
							if (userChannels.length == 1) {
								let tryThisChannel = message.guild.channels.cache.find(ch => ch.id == userChannels[0])
									if (tryThisChannel) {
										if (!res.systems.mediaChannel.channels.find(i => i == tryThisChannel.id)) {
											mediaEmbed.setDescription(`${issuer}, this channel, ${tryThisChannel}, isn't in media channel list!`)
											return message.channel.send({embeds: [mediaEmbed]})
										}
										let indexCH = res.systems.mediaChannel.channels.findIndex(i => i == tryThisChannel.id)
										res.systems.mediaChannel.channels.splice(indexCH,1)
										mediaEmbed.setDescription(`I have removed ${tryThisChannel} from media channel list!`)
										message.channel.send({embeds: [mediaEmbed]})
									}
							}
						} catch (error) {
							console.log(error)
							message.channel.send(`${issuer}, it seems like this channel or ID provided, "${userChannels[i]}", I can't seem to find it. Do I even have perms to see it? or you provided the correct mention/id?`)
						}
					}

					// list
					if (options.indexOf(args[1]) == 3) {
						let chList = null
						if (res.systems.mediaChannel.channels.length == 0) chList = `This list is pretty empty...`
						if (res.systems.mediaChannel.channels.length > 0) chList = [...res.systems.mediaChannel.channels.map(i => `- <#${i}>`).values()].join("\n");
						let channelList = new SharuruEmbed()
							.setAuthor(`Media Channel Feature:`,message.guild.iconURL())
							.setTitle(`Messages will be allowed in following channels only if they contain a picture!`)
							.setColor(Colors.LuminousVividPink)
							.setFooter({text: `Requested by ${issuer.tag} at`,iconURL: issuer.displayAvatarURL({dynamic:true})})
							.setTimestamp()
							.setDescription(chList)
						return message.channel.send({embeds: [channelList]})
					}

					// role
					if (options.indexOf(args[1]) == 4) {
						if(!args[2]) return message.channel.send(`${issuer}, You need to provide a role mention or id!`);
						let roleProvided = message.mentions.roles.first()?.id || args[2]
						let findRole = message.guild.roles.cache.find(ch => ch.id == roleProvided)
						if(findRole){
							res.systems.mediaChannel.role = findRole.id
							mediaEmbed.setDescription(`${issuer}, I have set the ${findRole} as punishment for people spamming messages only in media channels!`)
							message.channel.send({embeds: [mediaEmbed]})
						}
						if(!findRole){
							mediaEmbed.setDescription(`${issuer}, i'm sorry but I couldn't find the role you mentioned or the id you provided... try again after making sure it exist and I can manage it!`)
							return message.channel.send({embeds: [mediaEmbed]})
						}
					}
					
					// strikes
					if (options.indexOf(args[1]) == 5) {
						if (!args[2] || isNaN(args[2])) return message.channel.send(`${issuer}, you need to provide a number!`);
						if (args[2] < 3 || args[2] > 20) return message.channel.send(`${issuer}, you need to provide a number between 3 and 20, both inclusive!`);
						res.systems.mediaChannel.strikes = args[2]
						mediaEmbed.setDescription(`${issuer}, the number of strikes is set to **${args[2]}**!`)
						message.channel.send({embeds: [mediaEmbed]});
					}
					
					// timeout
					if (options.indexOf(args[1]) == 6) {
						if (!args[2]) return message.channel.send(`${issuer}, you need to provide a time!`);
						let time = ms(args[2])
						if (time < 300000 || time > 43200000) return message.channel.send(`${issuer}, you need to provide a time between 5min and 12h, both inclusive!`);
						res.systems.mediaChannel.timeout = time
						mediaEmbed.setDescription(`${issuer}, when punishing people, I'll timeout them for **${args[2]}** from posting in media channels!`)
						message.channel.send({embeds: [mediaEmbed]});
					}

					// role setup
					if (options.indexOf(args[1]) == 7) {
						let filter = m => m.author.id == message.author.id
						let mediaRole = message.guild.roles.cache.find(rl => rl.name == 'no media channel')
						let channelsMedia = res.systems.mediaChannel.channels;

						if (mediaRole && channelsMedia.length == 0) {// if role exist already and no media channels... do nothing
							mediaEmbed.setDescription(`${issuer}, please add channels to my list in order to use this option!`)
							return message.channel.send({embeds: [mediaEmbed]})
						}

						if (mediaRole && channelsMedia.length > 0) {// if role exist and media channels exist, use that role? Y/N
							message.channel.send(`${issuer}, it seems like there is already a role called "no media channel" existent on the server but I don't know for what's used.
							Would be alright to use that instead to set up each media channel with permissions? Answer with \`yes/no\` within 30 seconds.`).then(m => tools.deleteMsg(m,'31s'))
							await message.channel.awaitMessages({filter,max:1,time:30000}).then(async ans =>{
								let makeRoleAnswer = ans.first().content
								
								if(makeRoleAnswer?.toLowerCase() == 'yes') {
									try {
										for (let i = 0; i < channelsMedia.length; i++) {
											let mediaChannel = message.guild.channels.cache.get(channelsMedia[i])
											if (mediaChannel) {
												mediaChannel.permissionOverwrites.edit(mediaRole.id, {
													CREATE_INSTANT_INVITE: false,
													SEND_MESSAGES: false,
													ADD_REACTIONS: false,
													SEND_TTS_MESSAGES: false,
													ATTACH_FILES: false,
													SPEAK: false,
													CHANGE_NICKNAME: false,
													USE_EXTERNAL_STICKERS: false
												})
												console.log(`done for "${mediaChannel.name}" for ${mediaRole.name}`)
											}
										}
										mediaEmbed.setDescription(`I have assigned as media role ${mediaRole} in my settings panel & tried to set up permissions in the following channels:\n${channelsMedia.map(i => `<#${i}>`).join("\n")}`)
										await message.channel.send({embeds: [mediaEmbed]})
										res.systems.mediaChannel.role = mediaRole.id
									} catch (e) {
										console.log(e.stack);
										return logchannel.send(`[Media Channel]: Unfortunately an error happened while trying to set up permissions for each media channel for the role. If this persist ,please contact my partner and tell them this error:\n\n\`${e.message}\``)
									}
								}

								if(makeRoleAnswer?.toLowerCase() !== 'yes') {
									message.channel.send(`I guess this is a no. The only way is either remove the role and let me create it and set it up for the media channels added to my list, or just let me use that role instead.`).then(m => tools.deleteMsg(m,'13s'))
								}

							}).catch(err =>{
								console.log(err)
								message.channel.send(`It seems like you didn't answer in time (30s). I'll take "no" as an answer.`).then(m => tools.deleteMsg(m,'13s'))
							})
						}

						if (!mediaRole && channelsMedia.length == 0) {// if role doesn't exist and no media channels... do nothing
							mediaEmbed.setDescription(`${issuer}, please add channels to my list in order to use this option!`)
							return message.channel.send({embeds: [mediaEmbed]})
						}

						if (!mediaRole && channelsMedia.length > 0) { // if the role doens't exist and there are media channels added
							message.channel.send(`Do you want me to create a role called "no media channel" that will not allow the user to speak in media channels? It's going to be set up in media channels only! Answer with \`yes/no\` only.`).then(m => tools.deleteMsg(m,'31s'))
							await message.channel.awaitMessages({filter,max:1,time:30000}).then(async ans2 =>{
								let makeRoleAnswer = ans2.first().content
								
								if(makeRoleAnswer?.toLowerCase() == 'yes') {
									try {
										mediaRole = await message.guild.roles.create({
												name: "no media channel",
												color: "#000000",
												permissions: [],
												reason: `Created "no media channel" role at ${issuer.tag} request!`
										})
										for (let i = 0; i < channelsMedia.length; i++) {
											let mediaChannel = message.guild.channels.cache.get(channelsMedia[i])
											if (mediaChannel) {
												mediaChannel.permissionOverwrites.edit(mediaRole.id, {
													CREATE_INSTANT_INVITE: false,
													SEND_MESSAGES: false,
													ADD_REACTIONS: false,
													SEND_TTS_MESSAGES: false,
													ATTACH_FILES: false,
													SPEAK: false,
													CHANGE_NICKNAME: false,
													USE_EXTERNAL_STICKERS: false
												})
												console.log(`done for "${mediaChannel.name}" for ${mediaRole.name}`)
											}
										}
										mediaEmbed.setDescription(`I have created & assigned as media role ${mediaRole} in my settings panel & tried to set up permissions in the following channels:\n${channelsMedia.map(i => `<#${i}>`).join("\n")}`)
										await message.channel.send({embeds: [mediaEmbed]})
										res.systems.mediaChannel.role = mediaRole.id

									} catch (e) {
										console.log(e.stack);
										return logchannel.send(`[Media Channel]: Unfortunately an error happened either while trying to create \`no media channel\` or while trying to set up permissions for each media channel for the role. If the role was created by any chance, it might not have the permissions set up. If this persist ,please contact my partner and tell them this error:\n\n\`${e.message}\``)
									}
								}

								if(makeRoleAnswer?.toLowerCase() !== 'yes') {
									return message.channel.send(`I'll take this as a no.`).then(m => tools.deleteMsg(m,'3s'))
								}
								
							}).catch(err =>{
								console.log(err)
								message.channel.send(`It seems like you didn't answer in time (30s). I'll take "no" as an answer.`)
							})
						}
					}
				}
				if (args[0] == 'infoEmbed') {
					const options = ['switch']
					let ie = new SharuruEmbed()
						.setAuthor(`Info Embed Feature!`,this.client.user.displayAvatarURL({dynamic: true}))
						.setColor(Colors.LuminousVividPink)
						.setTimestamp()
						.setFooter({text: `Requested by ${issuer.tag} at`,iconURL: issuer.displayAvatarURL()})
					if (options.indexOf(args[1]) == -1) {
						ie.setDescription(`For this feature, you can only switch it on/off! For full control over the feature, please use the command itself.`)
						return message.channel.send({embeds: [ie]})
					}
					if (options.indexOf(args[1]) == 0) {
						res.systems.reactMsg.enabled = !res.systems.reactMsg.enabled
						ie.setDescription(`I have ${res.systems.reactMsg.enabled == true ? `enabled` : `disabled`} the info embed feature!`)
						message.channel.send({embeds: [ie]})
					}
				}
				res.save().catch(err =>console.log(err))
            }
        })
        
	}

};
