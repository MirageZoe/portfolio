/* eslint-disable no-unused-vars */
const halloweenCardsDB = require("../../Models/events/halloween/halloween_queue");
const halloween_players = require("../../Models/events/halloween/halloween_players")
const SharuruEmbed = require('../../Structures/SharuruEmbed');
const guildSettings = require('../../Models/GuildSettings');
const Command = require('../../Structures/Command.js');
const sendError = require('../../Models/Error');
const path = require("path");
const fs = require('fs');
const ms = require('ms');
const pms = require('pretty-ms');
const config = require("../../../config.json");
const { Colors, PermissionsBitField } = require("discord.js");
const redCrossEmoji = `❌`

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'halloween',
			displaying: true,
			cooldown: 3000,
			description: 'The Halloween event!',
			options: '-',
			usage: '-',
			example: '-',
			category: 'events',
			userPerms: [PermissionsBitField.Flags.SendMessages],
			SharuruPerms: [PermissionsBitField.Flags.SendMessages],
			args: false,
			guildOnly: true,
			serverOnly: false,
			staffRoleOnly: false,
			ownerOnly: false,
			roleDependable: '0', // not 0, either id or name
			allowTesters: false,
			aliases: ['hal','h']
		});
	}

	async run(message, args) {
		// eslint-disable-next-line id-length
		
		//#region timeVars
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
		//#endregion
		
		const issuer = message.author;
		const tools = this.client.utils;
		const sharuru = this.client;
		const logChannel = sharuru.guilds.cache.get(config.myGuilds.dev_guild).channels.cache.find(ch => ch.name == "sharuru-logs");
		const prefix = this.client.prefixes.get(message.guild.id);
		const eventOptionsString = ['welcome','switch','settings','lock','inventory','leaderboard','submit','spawn','claim']
		const eventOptions = {
			welcome: 0,
			switch: 1,
			settings: 2,
			lock: 3,
			inventory: 4,
			leaderboard: 5,
			submit: 6,
			spawn: 7,
			claim: 8
		}
		const eventOptionsAliases = {
			inv: 4,
			top: 5
		}
		const userOption = args[0]?.toLowerCase();
		
		if (userOption == 't' && issuer.id == '186533323403689986') {
			console.log(this.client.halloweenEvent)
			return console.log(`done`)
		}
		if (userOption == 'r'&& issuer.id == '186533323403689986') {
			let gimme = this.client.halloweenEvent.get(message.guild.id)
			clearInterval(gimme)
			return console.log(`done`)
		}
		if (userOption == 's'&& issuer.id == '186533323403689986'){
			// let timertest = setInterval(() => {
			// 	console.log(`Test Interval in map`)
			// 	test.val += 10
			// }, 10000);
			// this.client.test.set(message.guild.id,timertest);
			// let options = {
			// 	guild: message.guild.id,
			// 	channels: [message.channel.id],
			// 	prefix: prefix
			// }
			// this.client.emit('halloween',options)
			let ev = new SharuruEmbed()
				.setColor(`LUMINOUS_VIVID_PINK`)
				.setAuthor(`Third Event: Item Hunt`)
				.setDescription(`Welcome to the third November Event, **Genshin Item Hunt**! All you have to do is submit a video of you collecting all items in your chosen bundle--the quickest time wins!`)
				.addFields([
					{name: `Schedule:`,value:`Video Submission is on (timestamp)\nDeliberation is on (timestamp)\nAnnouncement of Winners on (timestamp)`},
					{name: `Mechanics:`,value:`There are three bundles to choose from:\n<:Anemo:765647390103175198>	- Mondstadt;\n<:Geo:765647488685310053> - Liyue;\n<:Electro:765647465239019520> - Inazuma.\n\nPick from any of the three signs below and get to recording!`},
					{name: `Rules:`,value: `**[1]** You can only have either (1) one character that reduces stamina (e.g. Kaeya, Rosaria) or (2) two anemo members (except for Sayu) in your roster.
**[2]** You can select only 1 Waypoint to teleport as starting point for each nation. From there, no teleporting is allowed.
**[3]** Running, dashing, gliding are allowed. 
**[4]** Eating stamina-related food is not allowed. 
**[5]** Each bundle will have a minimum of three participants and should be equal, we’ll transfer some of you if the numbers aren’t equal.
**[6]** We’ll be posting a list of participants and which bundle they chose after 24 hours.
					`},
					{name: `Important Notes!`,value: `**[1]** Make sure to respect the format of the file (DiscordID_GenshinUID)! E.g: ***423411443438714881_601813554.mov***
If you don't know from where you get your Discord ID, [follow this guide](https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-) or ask an Event Staff member for help.
					**[2]** Any type of editing will result in an ***automatic disqualification***!
					**[3]** You cannot put pins on your map.
					**[4]** The timer starts as soon as your character moves.
					**[5]** ***Any act*** of glitches (e.g. bench - teleport glitch) will result to a ***disqualification***.
					`},
					{name: `Prize:`,value: `The winner (from each bundle) gets a Blessing of the Welkin Moon!`},
					{name: `Link for submission:`,value:`[Click me!](https://bit.ly/ItemHunt)`}
				])
				.setImage(`https://cdn.discordapp.com/attachments/769228032283115550/901852554315563008/itemhuntlogoFinished.jpg`)
			message.channel.send({embeds: [ev]})
			return console.log(`done`)
		}

		const halloweenEmbed = new SharuruEmbed()
			.setAuthor({name:`Halloween Event!`})
			.setColor(Colors.LuminousVividPink)
		guildSettings.findOne({
			ID: message.guild.id
		},async (err,res)=>{
			if (err) {
				sendError.create({
					Guild_Name: message.guild.name,
					Guild_ID: message.guild.id,
					User: issuer.tag,
					UserID: issuer.id,
					Error: err,
					Time: `${TheDate} || ${clock} ${amORpm}`,
					Command: this.name+" looking in guild db",
					Args: args,
				},async (err, res) => {
					if(err) {
						console.log(err)
						return message.channel.send(`[Halloween-Event]: Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
					}
					if(res) {
						console.log(`successfully added error to database!`)
					}
				})
			}
			if (res) {
				
				// checking whenever they used an alias

				const missingOrWrongOption = eventOptionsString.indexOf(userOption) == -1
				const missingOrWrongOption2 = Object.keys(eventOptionsAliases).includes(userOption) == false

				console.log(`[Halloween Event | ${TheDate} | ${clock} ${amORpm}]:\nfail1: ${missingOrWrongOption}\nfail2: ${missingOrWrongOption2}\nuseroption: "${userOption}"`)

				if (missingOrWrongOption && missingOrWrongOption2) {
					
					if (message.member.roles.cache.find(r => r.id == res.importantData.staffRole))
					{
						halloweenEmbed.setDescription(`Hello there moderator ${issuer}! These are all commands configured for this event:\n- **${eventOptionsString.join("**;\n- **")}**`)
						return rep(halloweenEmbed)
					}
					halloweenEmbed.setDescription(`Hello there ${issuer}! For this event, I have the following commands: \`${eventOptionsString.slice(4)}\``)
					return rep(halloweenEmbed)
				}
				// inventory
				if (eventOptionsString.indexOf(userOption) == eventOptions.inventory || (Object.keys(eventOptionsAliases).includes(userOption) && userOption == "inv")) {
					if (res.events.halloween.limitedChannels.length > 0 && !res.events.halloween.limitedChannels.includes(message.channel.id)) {
						halloweenEmbed
							.setDescription(`${issuer}, this command can be used only in:\n- ${res.events.halloween.limitedChannels.map(item => `<#${item}>`).join("\n- ")}`)
							.setColor(Colors.Orange)
						return rep(halloweenEmbed,"5s")
					}
					let rarities = ['common','uncommon','rare','collection'];
					let Pages = []
					let page = 1

					halloween_players.findOne({
						userID: issuer.id,
						guild: message.guild.id
					},(err2,resu)=>{
						if (err2) {
							sendError.create({
								Guild_Name: message.guild.name,
								Guild_ID: message.guild.id,
								User: issuer.tag,
								UserID: issuer.id,
								Error: err2,
								Time: `${TheDate} || ${clock} ${amORpm}`,
								Command: this.name+" inventory",
								Args: args,
							},async (err, res) => {
								if(err) {
									console.log(err)
									return message.channel.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
								}
								if(res) {
									console.log(`successfully added error to database!`)
									logChannel.send(`[Halloween Event]: An error was registered in db. Please tell that to my partner!`)
								}
							})
						}
						if(resu){
							let displayRarity = []
							// console.log(resu.inventory.length)
							for(let j = 0; j < rarities.length; j++) {
								let Rarray = [];
								let h = 0
								for(let i = 0; i < resu.inventory.length; i++){
									if(resu.inventory[i].rarity == rarities[j]){
										Rarray.push(`${h+1})**[${resu.inventory[i].name}]** x${resu.inventory[i].amount}`)
										h++;
										if(h % 10 == 0){
											Pages.push(Rarray)
											Rarray = []
										}
										// h--;
									}
								}
								if(Rarray.length > 0){
									Pages.push(Rarray)
								}
								if(h > 0) {
									displayRarity.push(rarities[j])
									// Rarray.push(`1) Unfortunately you don't have anything here to display :( `)
									// Pages.push(Rarray)
								}
							}
		
							let index = 0
							console.log(Pages[page-1])
							let sendInventoryList = new SharuruEmbed()
								.setAuthor({name: `${issuer.tag} inventory | Rarity: ${displayRarity[index]} `})
								.setColor(Colors.Orange)
								.setFooter({text: `Page ${page}/${Pages.length} | Requested by ${issuer.tag} at`})
								.setDescription(Pages[page-1].join("\n"))
							
							message.channel.send({embeds: [sendInventoryList]}).then(msg =>{
								msg.react(`◀️`)
								msg.react(`▶️`).then(r =>{
		
									const CollectingReactions = (reaction, user) => user.id === message.author.id;
									const gimmeReactions = msg.createReactionCollector({CollectingReactions,time: 60000})
								
									gimmeReactions.on('collect', r=>{
										let the_emoji = r._emoji.name;
		
										switch (the_emoji) {
											case `◀️`:
												if (issuer.bot == false)
													msg.reactions.resolve(`◀️`).users.remove(message.author.id);
												if(page === 1) return;
												page--;
												sendInventoryList.setDescription(Pages[page-1].join("\n"))
												.setFooter({text: `Page ${page}/${Pages.length} | Requested by ${issuer.username} at `})
												.setTimestamp()
												if(Number(Pages[page-1][0].slice(0,Pages[page-1][0].indexOf(`)`))) >= Number(Pages[page][0].slice(0,Pages[page][0].indexOf(`)`)))) {
													index--;
												}
												sendInventoryList.setAuthor({name: `${issuer.tag} inventory | Rarity: ${displayRarity[index]} `})
												msg.edit({embeds:[sendInventoryList]})
												break;
										
											case `▶️`:
												// console.log(r.users.cache);
												if (issuer.bot == false)
													msg.reactions.resolve(`▶️`).users.remove(message.author.id);
												if(page === Pages.length) return;
												page++;
												sendInventoryList.setDescription(Pages[page-1].join("\n"))
												.setFooter({text: `Page ${page}/${Pages.length} | Requested by ${issuer.username} at `})
												.setTimestamp()
												if(Number(Pages[page-1][0].slice(0,Pages[page-1][0].indexOf(`)`))) <= Number(Pages[page-2][0].slice(0,Pages[page-2][0].indexOf(`)`)))) {
													index++;
												}
												sendInventoryList.setAuthor({name: `${issuer.tag} inventory | Rarity:  ${displayRarity[index]} `})
												msg.edit({embeds:[sendInventoryList]})
												break;
											default:
												message.channel.send(`To navigate through the list, use react with the arrows already there!`)
												break;
										}
									})

									gimmeReactions.on("end", r =>{
										msg.reactions.removeAll()
										console.log(`[Halloween event]: Removed all emojis from ${issuer.id} inv msg`)
									})
								})
							})//end of reacting and colleting
						}else{
							return message.channel.send(`You haven't played yet, take a look in the channel where I send souls and guide one. After that, you will be able to see it here!`)
						}
					})
				}
				// leaderboard
				if (eventOptionsString.indexOf(userOption) == eventOptions.leaderboard || (Object.keys(eventOptionsAliases).includes(userOption) && userOption == "top")) {
					if (res.events.halloween.limitedChannels.length > 0 && !res.events.halloween.limitedChannels.includes(message.channel.id)) {
						halloweenEmbed
							.setDescription(`${issuer}, this command can be used only in:\n- ${res.events.halloween.limitedChannels.map(item => `<#${item}>`).join("\n- ")}`)
							.setColor(Colors.Orange)
						return rep(halloweenEmbed,"5s")
					}
					halloween_players.find({guild: message.guild.id}).sort({ points: -1}).exec(function(err2, docs) {
						let Pages = [];
						let page = 1;
						if (err2) {
							sendError.create({
								Guild_Name: message.guild.name,
								Guild_ID: message.guild.id,
								User: issuer.tag,
								UserID: issuer.id,
								Error: err2,
								Time: `${TheDate} || ${clock} ${amORpm}`,
								Command: this.name+" leaderboard",
								Args: args,
							},async (err, res) => {
								if(err) {
									console.log(err)
									return message.channel.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
								}
								if(res) {
									console.log(`successfully added error to database!`)
									logChannel.send(`[Halloween Event]: An error was registered in db. Please tell that to my partner!`)
								}
							})
						}
						if(docs.length >= 1){
							let Rarray = [];
							for(let i = 0; i < docs.length; i++){
								Rarray.push(`${i+1 < 10 ? `   ${i+1}` : i+1 < 100 ? `  ${i+1}` : `${i+1}` }. |${docs[i].points < 10 ? `       ${docs[i].points}`: docs[i].points < 100 ? `      ${docs[i].points}` : `     ${docs[i].points}`} | ${isExistingInGuild(docs[i].userID,message.guild.id,sharuru)}\n`);
								i++;
								if(i % 10 == 0) {
									Pages.push(Rarray);
									Rarray = []
								}
								i--;
							}
							if(Rarray.length > 0) {
								Pages.push(Rarray)
							}
							// console.log(Pages)
							let embed = new SharuruEmbed()
								.setAuthor({name: `Halloween Event | Leaderboard | ${message.guild.name}:`})
								.setThumbnail(`https://upload.wikimedia.org/wikipedia/commons/a/a2/Jack-o%27-Lantern_2003-10-31.jpg`)
								.setFooter({text: `Page ${page}/${Pages.length} | Requested by ${issuer.tag}`,iconURL: issuer.displayAvatarURL()})
								.setDescription(`\`\`\`md\nRank. | Candies | Member\n================================\n${Pages[page-1].join("\n")}\`\`\``)
								.setColor(Colors.Orange)
								message.channel.send({embeds: [embed]}).then(msg =>{
								msg.react(`◀️`)
								msg.react(`▶️`).then(r => {
			
									const CollectingReactions = (reaction, user) => user.id === message.author.id;
									const gimmeReactions = msg.createReactionCollector({CollectingReactions,time: 60000})
			
									gimmeReactions.on('collect', r=>{
										let user_emoji = r._emoji.name;
			
										switch(user_emoji){
											case `◀️`:
												if (issuer.bot == false)
													msg.reactions.resolve(`◀️`).users.remove(message.author.id);
												if(page === 1) return;
												page--;
												embed.setDescription(`\`\`\`md\nRank. | Candies | User\n================================\n${Pages[page-1].join("\n")}\`\`\``)
												.setFooter({text: `Page ${page}/${Pages.length} | Requested by ${issuer.username} at `})
												msg.edit({embeds: [embed]})
												break;
											
											case `▶️`:
												if (issuer.bot == false)
													msg.reactions.resolve(`▶️`).users.remove(message.author.id);
												if(page === Pages.length) return;
												page++;
												embed.setDescription(`\`\`\`md\nRank. | Candies | User\n================================\n${Pages[page-1].join("\n")}\`\`\``)
												.setFooter({text: `Page ${page}/${Pages.length} | Requested by ${issuer.username} at `})
												msg.edit({embeds: [embed]})
												break;
										}
									})

									gimmeReactions.on('end', r=>{
										msg.reactions.removeAll()
										console.log(`[Halloween event]: Removed all emojis from ${issuer.id} leader msg`)
									})
								})//end of react from message.react
							})//end of first then from message.send
						} else {
							console.log(`no players played`)
							return message.channel.send(`Right now nobody started playing this event or either it's not enabled on this server. Ask the admins if they enabled it!`)
						}
					})
				}
				// submit
				if (eventOptionsString.indexOf(userOption) == eventOptions.submit) {
					if (res.events.halloween.limitedChannels.length > 0 && !res.events.halloween.limitedChannels.includes(message.channel.id)) {
						halloweenEmbed
							.setDescription(`${issuer}, this command can be used only in:\n- ${res.events.halloween.limitedChannels.map(item => `<#${item}>`).join("\n- ")}`)
							.setColor(Colors.Orange)
						return rep(halloweenEmbed,"10s")
					}
					if (!args[1]) {
						halloweenEmbed.setDescription(`${issuer}, please provide a link to a picture/ a picture(upload) to submit!`)
						return rep(halloweenEmbed,'10s')
					}
					let hasPic = false;
					let itsHTML = false;
					let hasAuthor = false;
					if (message.attachments.size > 0) {
						if (message.attachments.first().contentType.includes("image")){
							hasPic = true;
							itsHTML = true
						}
					}
					for(let i = 0; i < args.length; i++){
						if (args[i].includes('http')) itsHTML = true
						if (args[i].includes('https'))itsHTML = true
						if (args[i].includes('png')) hasPic = true
						if (args[i].includes('jpg')) hasPic = true
						if (args[i].includes('jpeg')) hasPic = true
						if (args[i].includes('bmp')) hasPic = true
						if (args[i].includes('svg')) hasPic = true
					}
					if (message.content.includes("author:")) hasAuthor = true
					if (!hasPic || !itsHTML || !hasAuthor) 
					{
						halloweenEmbed.setDescription(`${issuer}, please make sure you have met the following conditions:
- it's a picture (not gif!) ${ message.attachments.size > 0 ? hasPic == true ? "✅" : redCrossEmoji : itsHTML == true ? "✅" : redCrossEmoji } 
- it has an author ${hasAuthor == true ? "✅" : `${redCrossEmoji}`}
`)
						return rep(halloweenEmbed,'10s')
					}
					let sub = new SharuruEmbed()
						.setAuthor({name: `Someone Submited a possible picture for Halloween Event!`,iconURL: issuer.displayAvatarURL()})
						.addFields(
							{name:`Author submission: ${issuer.tag} (${issuer.id})`,value: args.slice(1).join(" ")}
						)
						.setColor(Colors.LuminousVividPink)
						if (message.attachments.size > 0) {
							sub.setImage(message.attachments.first().url)
							logChannel.send({embeds: [sub]})
						} else
							logChannel.send({embeds: [sub]})
							halloweenEmbed.setDescription(`Thank you for submitting!`)
					rep(halloweenEmbed,'5s')
				}

				// claim
				if (eventOptionsString.indexOf(userOption) == eventOptions.claim) {
					if (res.events.halloween.limitedChannels.length > 0 && !res.events.halloween.limitedChannels.includes(message.channel.id)) {
						halloweenEmbed
							.setDescription(`${issuer}, this command can be used only in:\n- ${res.events.halloween.limitedChannels.map(item => `<#${item}>`).join("\n- ")}`)
							.setColor(Colors.Orange)
						return rep(halloweenEmbed,"5s")
					}
					const rEmbed = new SharuruEmbed()
							.setAuthor({name: `Halloween Event | Claim your rewards!`})
							.setThumbnail(`https://upload.wikimedia.org/wikipedia/commons/a/a2/Jack-o%27-Lantern_2003-10-31.jpg`)
							.setFooter({text: `Requested by @${issuer.username}`,iconURL: issuer.displayAvatarURL()})
							.setColor(Colors.Gold)
					halloween_players.findOne({
						userID: issuer.id
					}, (err2, res2)=> {
						if (err2) {
							sendError.create({
								Guild_Name: message.guild.name,
								Guild_ID: message.guild.id,
								User: issuer.tag,
								UserID: issuer.id,
								Error: err2,
								Time: `${TheDate} || ${clock} ${amORpm}`,
								Command: this.name+" claim",
								Args: args,
							},async (err, res) => {
								if(err) {
									console.log(err)
									return message.channel.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
								}
								if(res) {
									console.log(`successfully added error to database!`)
									logChannel.send(`[Halloween Event]: An error was registered in db. Please tell that to my partner!`)
								}
							})
						}
						// console.log("what we got:\n",res2)
						if (res2){
							if (message.guild.id == "953434041401606225") {
								const doesRoleStillExist = message.guild.roles.cache.find(role => role.id == "1161759033561190410")
								const doesRoleStillExist2 = message.guild.roles.cache.find(role => role.id == "1155444770991263834")
									// check if the role still exists
									if (doesRoleStillExist == undefined || doesRoleStillExist == null) {
										console.log(`[Halloween Event/ ${TheDate} | ${clock} ${amORpm}]: couldn't assign the role to @${issuer.username} because the role may be... non-existent?!`)
										rEmbed.setDescription(`${issuer}, it seems like I couldn't find the role that was supposed to be assigned to you. Please contact moderators to check this out!`)
										return message.channel.send({embeds: [rEmbed]})
									}
									
									// we need to update our important data if a day passed
									if ((parseInt(res.importantData.highestRole.lastUpdate)+86400000) < Date.now())
									{
										let highestRoleOrder = 0
										let highestRole = null;
										const roleKeys = [...message.guild.members.me.roles.cache.keys()]
										console.log(`[Halloween Event/ ---]: Time to update our database with importantData: ${message.guild.members.me.roles.cache.size} roles found on myself`)
										for(let i = 0; i < message.guild.members.me.roles.cache.size; i++){
											let getRoleData = message.guild.roles.cache.get(roleKeys[i])
											if (getRoleData.position > highestRoleOrder) {
												highestRoleOrder = getRoleData.position;
												highestRole = getRoleData
											}
										}

										res.importantData.highestRole.id = highestRole.id;
										res.importantData.highestRole.namae = highestRole.name;
										res.importantData.highestRole.position = highestRoleOrder;
										res.importantData.highestRole.permissions = highestRole.permissions.toArray();
										res.importantData.highestRole.lastUpdate = Date.now();
										// res.save().catch(err3 =>{
										// 	console.log(err3)
										// 	rep("[halloween-assign_role_on_claim]: Unfortunately an error happened while trying to save to db. If this happens often, please contact my partner!",null,false)
										// })
									}

									// check if my hierarchy is higher than the role to be assigned
									if (res.importantData.highestRole.position < doesRoleStillExist.position)
									{
										console.log(`[Halloween Event/ ${TheDate} | ${clock} ${amORpm}]: Currently my role pos: ${res.importantData.highestRole.position}\nthe assigned position: ${doesRoleStillExist.position}`)
										console.log(`[Halloween Event/ ${TheDate} | ${clock} ${amORpm}]: couldn't assign the role to @${issuer.username} because my role position might be beneath the assgined role!`)
										rEmbed.setDescription(`${issuer}, it seems like the role that should have been assigned is a bit higher than the highest role of mine so I couldn't give you the role. Please contact moderators to check this out!`)
										return message.channel.send({embeds: [rEmbed]})
									}
									
									// check if I have permission to assign role
									if (!message.guild.members.me.permissions.has("ManageRoles"))
									{
										console.log(`[Halloween Event/ ${TheDate} | ${clock} ${amORpm}]: couldn't assign the role to @${issuer.username} because I may lack permissions to assign roles!`)
										rEmbed.setDescription(`${issuer}, it seems like I don't have permissions to give you a role. Please contact moderators to check this out`)
										return message.channel.send({embeds: [rEmbed]})
									}

									
								if (issuer.id == "1021090706053410917") // if it's #1, give 2
								{
									// check if the member doesn't have the role already
									if (message.member.roles.cache.find(role => role.id == doesRoleStillExist.id))
									{
										console.log(`[Halloween Event/ ${TheDate} | ${clock} ${amORpm}]: couldn't assign the role to @${issuer.username} because they already have it!`)
										rEmbed.setDescription(`${issuer}, it seems like you have this role already so there's nothing left to do :)`)
										return message.channel.send({embeds: [rEmbed]})
									}
									//if all checks pass, assign the role
									message.member.roles.add(doesRoleStillExist)
									rEmbed.setDescription(`Congrats for reaching first place & thanks for playing the Halloween Event! Your reward is: ${doesRoleStillExist}`)
									message.channel.send({embeds: [rEmbed]})
								} else {// or 1
									// check if the member doesn't have the role already
									if (message.member.roles.cache.find(role => role.id == doesRoleStillExist2.id))
									{
										console.log(`[Halloween Event/ ${TheDate} | ${clock} ${amORpm}]: couldn't assign the role to @${issuer.username} because they already have it!`)
										rEmbed.setDescription(`${issuer}, it seems like you have this role already so there's nothing left to do :)`)
										return message.channel.send({embeds: [rEmbed]})
									}
									message.member.roles.add(doesRoleStillExist2)
									rEmbed.setDescription(`Thanks for playing the Halloween Event! Your reward is: ${doesRoleStillExist2}`)
									message.channel.send({embeds: [rEmbed]})
								}
							}
						} else {
							rEmbed.setDescription(`Sadly you didn't participate in this event so you cannot claim the rewards! Please participate next year to claim the rewards!`)
							message.channel.send({embeds: [rEmbed]})
						}
					})
				}
				
				if (!message.member.roles.cache.find(r => r.id == res.importantData.staffRole) && 
					(eventOptionsString.indexOf(userOption) == eventOptions.welcome || 
					eventOptionsString.indexOf(userOption) == eventOptions.switch ||
					eventOptionsString.indexOf(userOption) == eventOptions.settings ||
					eventOptionsString.indexOf(userOption) == eventOptions.submit) ) 
				{
					halloweenEmbed.setDescription(`Heya ${issuer}, the following command is not available to the public! Please try only the commands available:\n- **${eventOptionsString.slice(4).join("**;\n- **")}**`)
					return rep(halloweenEmbed,"10s");
				}

				// welcome
				if (eventOptionsString.indexOf(userOption) == eventOptions.welcome) {
					// get date for EU, NA & AS. Credits Lucy
					
					let halEmbed = new SharuruEmbed()
						.setColor(Colors.Orange) // some kind of orange
						.setTitle(`Halloween Event:`)
						.setDescription(`Trick-or-treaters will appear and you'll have the chance to greet them.
Use the right command + code and they'll leave you something for your kindness. Collect everything and become ${message.guild.name} Champion of Halloween!`)
						.addFields([
							{name: `Commands:`,value:`
\`${prefix}trick <code>\` => Greet the soul! Note: Available only when a soul is available;
\`${prefix}treat <code>\` => Greet the soul! Note: Available only when a soul is available;
\`${prefix}halloween leaderboard/top\` => Who has the most candies?
\`${prefix}halloween inventory/inv\` => A catalogue of the souls greeted!
\`${prefix}halloween submit <link+author>\` => Submit your favorite picture for the event & it might be added to the pool! P.S: Provide the author as well, otherwise rejected.`},
							{name: `Event Time:`,value:`Start: <t:1697061600> (<t:1697061600:R>)\nEnd: <t:1698746400> (<t:1698746400:R>)`},
							{name: `Prize:`,value: `
- <@&1161759033561190410>
 - Gives +2 tickets bonus for future giveaways until end of the year (2023). It's given to #1 person with the most candies!
- <@&1155444770991263834>
 - Gives +1 ticket bonus for future giveaways until end of the year (2023). Everyone that participated in **Halloween 2023** will receive this!`},
							{name: `Reminder:`,value:`Each soul comes in different forms & mentality and thus they will grant & act different from each other!`}
						])
						.setImage(`https://cdn.discordapp.com/attachments/769228032283115550/900770585443962940/unknown.png`)
						return rep(halEmbed);
				}

				// switch
				if (eventOptionsString.indexOf(userOption) == eventOptions.switch) {

					if (res.events.halloween.channels.length == 0)
					{
						halloweenEmbed.setDescription(`${issuer}, please add at least 1 channel where I can spawn the cards before switching the event on!`)
						return rep(halloweenEmbed)
					}
					if (!res.events.halloween.enabled) res.events.halloween.enabled = false;
					res.events.halloween.enabled = !res.events.halloween.enabled
					if (res.events.halloween.enabled == true ) {//&& Date.now() < config.event_dates.halloweenEnd
						let timer = setInterval(() => {
							guildSettings.findOne({
								ID: res.ID
							},(err2,res2)=>{
								if (err2) {
									sendError.create({
										Guild_Name: message.guild.name,
										Guild_ID:  message.guild.id,
										User: issuer.username,
										UserID: issuer.id,
										Error: err2,
										Time: `${TheDate} || ${clock} ${amORpm}`,
										Command: this.name + ` switch`,
										Args: args,
									},async (err3, res3) => {
										if(err3) {
											console.log(err3)
										}
										if(res3) {
											console.log(`successfully added error to database from multi system!`)    
										}
									})
								}
								if (res2) {
									//#region timeVars
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
									//#endregion
									let options = {
										guild: res2.ID,
										channels: res2.events.halloween.channels,
										prefix: res2.prefix
									}
									if (res2.events.halloween.currentChance == 1 && res2.events.halloween.startChance == 10)
									res2.events.halloween.currentChance = res2.events.halloween.startChance

									if (res2.events.halloween.cooldown.recentSpawn > Date.now())
									{
										console.log(`[Halloween Event | ${TheDate} | ${clock} ${amORpm}]: Waiting for at least ${res2.events.halloween.cooldown.amount}min before trying to spawn a card again on ${res2.ID} (${res2.Guild_Name}).`)
										return;
									}
			
									let chanceToDrop = percentageChance(['spawn','dontspawn'],[res2.events.halloween.currentChance,100-res2.events.halloween.currentChance])
								
									if (chanceToDrop == "spawn"){
										this.client.emit('halloween',options)
										console.log(`[Halloween Event | ${TheDate} | ${clock} ${amORpm}]: Spawned a card in ${res2.ID} (${res2.Guild_Name}) at ${res2.events.halloween.currentChance}%`)
										res2.events.halloween.currentChance = res2.events.halloween.startChance
										res2.events.halloween.cooldown.recentSpawn = Date.now() + Number(res2.events.halloween.cooldown.amount)
									} else {
										res2.events.halloween.currentChance += res2.events.halloween.increaseBy
										console.log(`[Halloween Event | ${TheDate} | ${clock} ${amORpm}]: increased chance for ${res2.ID} (${res2.Guild_Name}) by ${res2.events.halloween.increaseBy} every ${res2.events.halloween.every}ms. Total ${res2.events.halloween.currentChance}`)
									}
									res2.save().catch(err =>console.log(err))
								}
							})
						}, res.events.halloween.every);//
						let timerToExpire = setInterval(() => {
							halloweenCardsDB.find({},async (err2,res2)=>{
								//#region time var
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
								//#endregion
								let allMsgsPendingDelete = []
								let finalMsg = `\n\n[Halloween-Event | ${TheDate} - ${clock} ${amORpm}]: -`
								if (err2) {
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
									sendError.create({
										Guild_Name: `Can't retrieve guildName because it's in error  from the event.`,
										Guild_ID:  `Can't retrieve guildID because it's in error  from the event.`,
										User: `Can't retrieve user because it's in error  from the event.`,
										UserID: `Can't retrieve userid because it's in error  from the event.`,
										Error: err2,
										Time: `${TheDate} || ${clock} ${amORpm}`,
										Command: `multi system => one time startup system- halloweenCardsDB`,
										Args: `Can't retrieve args because it's in error  from the event.`,
									},async (err3, res3) => {
										if(err3) {
											console.log(err3)
										}
										if(res3) {
											console.log(`successfully added error to database from multi system!`)    
										}
									})
								}
								if (res2) {
									console.log(`\n\n[Halloween-Event | ${TheDate} - ${clock} ${amORpm}]: Starting to delete expired cards... about ${res2.length} found in total!`)
	
									for(const card of res2) {
										if (card.expireAt < Date.now())
										{// if the msg is old, fetch and delete it
											try {
												const msgFetched = await this.client.guilds.cache.get(card.server).channels.cache.get(card.message.channel).messages.fetch(card.message.id)
												if (msgFetched)
												{
													console.log(`\n\n[Halloween-Event | ${TheDate} - ${clock} ${amORpm}]: I've fetched the soul msg of [${card.name} by ${card.artist}] and now deleting it from DB...`)
													// finalMsg =+ `I've fetched the soul msg of [${card.name} by ${card.artist}] & `
													// this.client.utils.deleteMsg(msgFetched,'1s')
													allMsgsPendingDelete.push(msgFetched)
													halloweenCardsDB.findOneAndRemove({
														server: card.server,
														code: card.code,
														name: card.name
													},(err3,res3)=>{
														if (err3) {
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
															sendError.create({
																Guild_Name: `Can't retrieve guildName because it's in error  from the event.`,
																Guild_ID:  `Can't retrieve guildID because it's in error  from the event.`,
																User: `Can't retrieve user because it's in error  from the event.`,
																UserID: `Can't retrieve userid because it's in error  from the event.`,
																Error: err3,
																Time: `${TheDate} || ${clock} ${amORpm}`,
																Command: `multi system => one time startup system- halloweenCardsDB`,
																Args: `Can't retrieve args because it's in error  from the event.`,
															},async (err4, res4) => {
																if(err4) {
																	console.log(err4)
																}
																if(res4) {
																	console.log(`successfully added error to database from multi system!`)    
																}
															})
														}
														if (res3) {
															finalMsg += `successfully deleted from DB`
															// console.log(`\n\n[Halloween-Event | ${TheDate} - ${clock} ${amORpm}]: The soul msg of [${card.name} by ${card.artist}] has been deleted successfully from DB! `)
														}
													})
													// console.log(`\n\n[Halloween-Event | ${TheDate} - ${clock} ${amORpm}]: The soul msg of [${card.name} by ${card.artist}] has been deleted successfully from channel! `)
												} else {
													finalMsg+=`I tried to fetch the soul msg of [${card.name} by ${card.artist}] and the response was not found. Did the message got deleted or channel hidden from me? I'll delete anyway the entry in DB...`
													// console.log(`\n\n[Halloween-Event | ${TheDate} - ${clock} ${amORpm}]: I tried to fetch the soul msg of [${card.name} by ${card.artist}] and the response was not found. Did the message got deleted or channel hidden from me? I'll delete anyway the entry in DB... `)
													halloweenCardsDB.findOneAndRemove({
														server: card.server,
														code: card.code,
														name: card.name
													},(err3,res3)=>{
														if (err3) {
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
															sendError.create({
																Guild_Name: `Can't retrieve guildName because it's in error  from the event.`,
																Guild_ID:  `Can't retrieve guildID because it's in error  from the event.`,
																User: `Can't retrieve user because it's in error  from the event.`,
																UserID: `Can't retrieve userid because it's in error  from the event.`,
																Error: err3,
																Time: `${TheDate} || ${clock} ${amORpm}`,
																Command: `multi system => one time startup system- halloweenCardsDB`,
																Args: `Can't retrieve args because it's in error  from the event.`,
															},async (err4, res4) => {
																if(err4) {
																	console.log(err4)
																}
																if(res4) {
																	console.log(`successfully added error to database from multi system!`)    
																}
															})
														}
														if (res3) {
															finalMsg += `successfully deleted from DB`
															// console.log(`\n\n[Halloween-Event | ${TheDate} - ${clock} ${amORpm}]: The soul msg of [${card.name} by ${card.artist}] has been deleted successfully from DB! `)
														}
													})
												}
												
											} catch (error) {
												console.log(`\n\n[Halloween-Event | ${TheDate} - ${clock} ${amORpm}]: I've got an error while trying to delete [${card.name} by ${card.artist}]:`)
												console.log(error)
											}
										}
									}
									setTimeout(() => {
										try {
											if (allMsgsPendingDelete.length > 5)
											{
												this.client.guilds.cache.get(card.server).channels.cache.get(card.message.channel).bulkDelete(allMsgsPendingDelete)
												finalMsg+= ` deleted from discord channel in bulk ${allMsgsPendingDelete.length} msgs!`
											} 
											else
											{
												for (let i = 0; i < allMsgsPendingDelete.length; i++) {
													const element = allMsgsPendingDelete[i];
													
													element.delete()
												}
												finalMsg+= ` deleted from discord channel ${allMsgsPendingDelete.length} msg individually!`
											}
											if (allMsgsPendingDelete.length != 0)
												console.log(`\n\n[Halloween-Event | ${TheDate} - ${clock} ${amORpm}]: ${finalMsg}`)
										} catch (error) {
											console.log(error)
										}
									}, 1000);
									
								}
							})
						}, 300 * 1000);
						if (this.client.halloweenEvent.get("halloweenCardGarbageCollector") == null || this.client.halloweenEvent.get("halloweenCardGarbageCollector") == undefined )
						{
							this.client.halloweenEvent.set(`halloweenCardGarbageCollector`, timerToExpire)
							console.log(`\n\n[Halloween Event | ${TheDate} | ${clock} ${amORpm}]: Halloween Card Garbage Collector was established!`)
						} else console.log(`\n\n[Halloween Event | ${TheDate} | ${clock} ${amORpm}]: Halloween Card Garbage Collector is already running and will not be reinitialized again!`)
						this.client.halloweenEvent.set(res.ID, timer)
					} else {
						let halloEventTimer = this.client.halloweenEvent.get(message.guild.id)
						clearInterval(halloEventTimer)
					}
					// if (Date.now() > config.event_dates.halloweenEnd)
					// 	halloweenEmbed.setDescription(`I have turned **${res.events.halloween.enabled ? `on` : "off"}** the halloween event but you know that the halloween is over? This wouldn't change too much since it won't work anyway until next halloween...`)
					// else
						halloweenEmbed.setDescription(`I have turned **${res.events.halloween.enabled ? `on` : "off"}** the halloween event.`)
					rep(halloweenEmbed)
					// to do: verify if can't switch unless set the announce channel and check if announce channel works, just test
				}

				if (eventOptionsString.indexOf(userOption) == eventOptions.spawn)// spawn forcibly a soul
				{
					
				}

				// settings
				if (eventOptionsString.indexOf(userOption) == eventOptions.settings) {
					halloweenEmbed
							.setTitle(`Halloween Event Settings:`)
					const subOption = args[1]?.toLowerCase()
					const subOptionAnswer = args[2]?.toLowerCase();
					const subOptionsAllowedString = ['start_chance','increase_every','increase_by','cooldown','channels','lock','ebs']
					const subOptionsAllowed = {
						start_chance: 0,
						increase_every: 1,
						increase_by: 2,
						cooldown: 3,
						channels: 4,
						lock: 5,
						ebs: 6
					}
					
					if (!subOption) {
						// if (!res.events.halloween.enabled || !res.events.halloween.startChance || !res.events.halloween.every || 
						// 	!res.events.halloween.increaseBy || !res.events.halloween.channels || !res.events.halloween.cooldown.recentSpawn ||
						// 	!res.events.halloween.cooldown.amount || !res.events.halloween.currentChance)
						// {
						// 	res.events.halloween = {
						// 		enabled: false,
						// 		channels: [],
						// 		startChance: 10,
						// 		every: 300000,
						// 		increaseBy: 2,
						// 		cooldown: {
						// 			recentSpawn: "0",
						// 			amount: "0"
						// 		},
						// 		currentChance: 1,
						// 		limitedChannels: [],
						// 	}
						// 	res.save().catch(err => console.log(err))
						// }
						const stats = {
							start: res.events.halloween.startChance,
							interval: (res.events.halloween.every/1000)/60,
							increaseBy: res.events.halloween.increaseBy,
							cooldown: (res.events.halloween.cooldown.amount/1000)/60
						}
						const baseRule = (60/stats.interval) * stats.increaseBy// how many per hour
						let averageHours = 0.00;
						let maxHours = 0.00;
						let when_100p = 0;
						let when_50p = 0;
						let done = false;
						while(!done){
							when_100p = stats.start + baseRule * maxHours;
							when_50p = stats.start + baseRule * averageHours;
							if (when_50p < 50) averageHours += 0.01;
							maxHours += 0.01;
							if (when_100p > 100.00) done = true;
						}
						
						maxHours = Number(maxHours.toPrecision(4))
						averageHours = Number(averageHours.toPrecision(4))
						// convert the result in min
						// we are taking the integral part of the number and transform in min
						let mainAverage_minutes = 60 * Math.trunc(averageHours); // transformed them in minutes
						let mainMax_minutes = 60 * Math.trunc(maxHours);

						// we are taking the decimal part and make it minutes;
						let decimalAverage_minutes = (averageHours - Math.trunc(averageHours)) * (60/1) // multiply decimal part with 60min/1h
						let decimalMax_minutes = (maxHours - Math.trunc(maxHours)) * (60/1) // multiply decimal part with 60min/1h

						let inter_average = 1440 - (stats.cooldown == 0 ? 1 : stats.cooldown * 24);
						let inter_max = 1440 - (stats.cooldown == 0 ? 1 : stats.cooldown * 24);

						// sum overal minutes and get adverage and max per day
						let averageCards = roundPrecised(inter_average / (mainAverage_minutes + Number(roundPrecised(decimalAverage_minutes,0))),2);
						let maxCards = roundPrecised(inter_max / (mainMax_minutes + Number(roundPrecised(decimalMax_minutes,0))),2);
						console.log(`MainPart:\n- ${mainMax_minutes}\n- ${mainAverage_minutes}\n\nDecimal\n- ${roundPrecised(decimalMax_minutes,0)}\n- ${roundPrecised(decimalAverage_minutes,0)}\n\n
Det:\n- Inter-average: ${inter_average}\n- interMax: ${inter_max}
- cooldown: ${(stats.cooldown == 0 ? 1 : stats.cooldown * 24)}
`)

						halloweenEmbed.addFields([
								{name: `Is Enabled?:`,value: res.events.halloween.enabled ? `Yes` : `No`,inline: false},
								{name: `Chance Modifiers:`,value: `
- **Starting**: ${res.events.halloween.startChance}% **[[INFO]](https://www.google.com "The chance to start with after spawning a card. To change this, please use 'start_chance'!")**
- **Current**: **\`${res.events.halloween.currentChance}%\`** **[[INFO]](https://www.google.com "This is the current chance. THIS IS UNCHANGEABLE!")**
- **Interval**: ${pms(res.events.halloween.every,{verbose: true})} **[[INFO]](https://www.google.com "This is the interval at which the current chance is increased by 'additional' chance. To change this, please use 'increase_every'!")**
- **Additional**: ${res.events.halloween.increaseBy}% **[[INFO]](https://www.google.com "This is the bonus chance that is summed with current chance & decides whenever to spawn after. To change this, please use 'increase_by'!")**
- **Cooldown**: ${res.events.halloween.cooldown.amount == 0 ? `No cooldown set!` : pms(res.events.halloween.cooldown.amount,{verbose: true})} **[[INFO]](https://www.google.com "This is the cooldown that will be applied after successfully spawning a card. To change this, please use 'cooldown'!")**
 - *Most recent successful spawn:* ${res.events.halloween.cooldown.recentSpawn == "0" ? "The first spawn need to happen first!": `<t:${Math.trunc(Number(res.events.halloween.cooldown.recentSpawn)/1000)}:R>`}
								`,inline: false},
								{name: `Spawn bad souls: `,value: `${res.events.halloween.enableEvilSouls == false ? "No": "Yes"}\n**[[INFO]](https://www.google.com "Turn this feature on to allow evil souls to appear which will steal the candies if they are greet by members! This has a 50/50 chance. To turn it off/on, use 'ebs' option in the settings!")**`},
								{name: `Spawning in the following channels (channels):`,value: res.events.halloween.channels.length > 0 ? "\n- "+res.events.halloween.channels.map(i => `<#${i}>`).join("\n- ") : `No channels added yet;`,inline: false},
								{name: `Lock data commands in (lock):`,value: `**[[Info!]](https://www.google.com "The following commands are affected: inventory, leaderboard,submit! If they are not sent in the respective channels, they are ignored!")**\n\n${res.events.halloween.limitedChannels.length > 0 ? res.events.halloween.limitedChannels.map(item => `- <#${item}>`).join(";\n"): `Not set up yet! All commands are available everywhere!`}`},
								// {name: `Announcement Channel (where I announce top 5 at the end of event!):`, value: res.events.halloween.announceChannel == '0' ? `Not set yet!` : `<#${res.events.halloween.announceChannel}>`},
								{name: '\u200B', value: '\u200B'},
								{name: `Some Details`,value:`In theory, based on the current settings (excluding cooldown applied), monster cards should spawn:\n- On average (if spawn happens at 50%), ${averageCards} per day;\n- at max (if spawn at 100%), ${maxCards} per day;\n- If you wish to change a parameter, please use: \n\`${prefix}halloween settings <name_of_parameter> <value_of_parameter>\`. \nThe name of the parameter is written in paranthesis after the name of each parameter;` ,inline: false},
							])
						return rep(halloweenEmbed)
					}
					if (subOptionsAllowedString.indexOf(subOption) == -1 ) 
					{
						halloweenEmbed.setDescription(`Hello ${issuer}, it seems like you probably typed wrong an option (or typed one that doesn't exist?). These are the available options:\n- **${subOptionsAllowedString.join("**;\n- **")}**`)
						return rep(halloweenEmbed)
					}
				
					// start chance
					if (subOptionsAllowedString.indexOf(subOption) == subOptionsAllowed.start_chance) {
						if (!subOptionAnswer) {
							halloweenEmbed.setDescription(`${issuer}, I need a value to be able to set the starting chance!`)
							return rep(halloweenEmbed,"10s")
						}
						if (isNaN(subOptionAnswer)) {
							halloweenEmbed.setDescription(`I need a number from 5 to 50! That number will be represented as %!`)
							return rep(halloweenEmbed,"10s");
						}
						if (subOptionAnswer < 5 || subOptionAnswer > 50) {
							halloweenEmbed.setDescription(`You cannot set the starting chance lower than 5% or higher than 50%!`)
							return rep(halloweenEmbed,"10s");
						}

						res.events.halloween.startChance = Number(subOptionAnswer);
						halloweenEmbed.setDescription(`${issuer}, I have set up the **\`Starting Chance\`** to **${subOptionAnswer}**%!`)
						rep(halloweenEmbed);
					}

					// increase every
					if (subOptionsAllowedString.indexOf(subOption) == subOptionsAllowed.increase_every) {
						if (!subOptionAnswer) {
							halloweenEmbed.setDescription(`I need a value to be able to set!`)
							return rep(halloweenEmbed,"10s")
						}
						if (isNaN(subOptionAnswer)) {
							halloweenEmbed.setDescription(`I need a valid number from 5 to 30! That number will be represented in minutes!`)
							return rep(halloweenEmbed,"10s");
						}
						if (subOptionAnswer < 5 || subOptionAnswer > 30) {
							halloweenEmbed.setDescription(`You cannot set the \`interval\` lower than 5min or higher than 30min!`)
							return rep(halloweenEmbed,"10s");
						}

						res.events.halloween.every = ms(subOptionAnswer+"m");
						halloweenEmbed.setDescription(`${issuer}, I have set up the **\`increase_every\`** to ${subOptionAnswer}min! Now the chance will increase every **\`${subOptionAnswer}min\`**!`)
						rep(halloweenEmbed);
					}

					// increase by
					if (subOptionsAllowedString.indexOf(subOption) == subOptionsAllowed.increase_by) {
						if (!subOptionAnswer) {
							halloweenEmbed.setDescription(`I need a value to be able to set!`)
							return rep(halloweenEmbed,"7.5s")
						}
						if (isNaN(subOptionAnswer)) {
							halloweenEmbed.setDescription(`I need a number from 1 to 15! That number will be represented as %!`)
							return rep(halloweenEmbed,"10s");
						}
						if (subOptionAnswer < 1 || subOptionAnswer > 15) {
							halloweenEmbed.setDescription(`You cannot set the \`increase chance\` lower than 1% or higher than 15%!`)
							return rep(halloweenEmbed,"10s");
						}

						res.events.halloween.increaseBy = Number(subOptionAnswer);
						halloweenEmbed.setDescription(`${issuer}, I have set up the **\`${subOptionsAllowedString[subOptionsAllowed.increase_by]}\`** to ${subOptionAnswer}%! Now every time, the chance to spawn will be increased by ${subOptionAnswer}%!`)
						rep(halloweenEmbed);
					}

					// cooldown
					if (subOptionsAllowedString.indexOf(subOption) == subOptionsAllowed.cooldown) {
						if (!subOptionAnswer) {
							halloweenEmbed.setDescription(`I need a value to be able to set!`)
							return rep(halloweenEmbed,"7.5s")
						}
						if (isNaN(subOptionAnswer)) {
							halloweenEmbed.setDescription(`I need a valid number from 5 to 30! That number will be represented in minutes!`)
							return rep(halloweenEmbed,"10s");
						}
						if (subOptionAnswer != 0) {
							if (subOptionAnswer < 5 || subOptionAnswer > 30) {
								halloweenEmbed.setDescription(`You cannot set the \`cooldown\` lower than 5min or higher than 30min!`)
								return rep(halloweenEmbed,"10s");
							}
						}

						res.events.halloween.cooldown.amount = subOptionAnswer == 0 ? subOptionAnswer : ms(subOptionAnswer+'m');
						halloweenEmbed.setDescription(`${issuer}, I have set up the **\`cooldown\`** to ${subOptionAnswer}min! Now after spawning a monster card, it will enter in a cooldown period of **\`${subOptionAnswer}min\`**!\nAfter ${subOptionAnswer}min, it will start again to spawn from the starting chance set!`)
						rep(halloweenEmbed);
					}

					// channels
					if (subOptionsAllowedString.indexOf(subOption) == subOptionsAllowed.channels) {
						let halloweenChannels = res.events.halloween.channels;
						let channelsMentioned = message.mentions.channels.map(item => item.id);
						let changes = ``
						let changes2 = ``

						if (channelsMentioned.length == 0) {
							halloweenEmbed.setDescription(`please mention at least 1 channel! If the channel was added already, it will be removed and vice versa!`)
							return rep(halloweenEmbed,'15s');						
						}
						for (const channel of channelsMentioned) {
							if(!halloweenChannels.includes(channel)){
								halloweenChannels.push(channel)
								changes += `- Added <#${channel}>.\n`
							} else {
								let getIndex = halloweenChannels.findIndex(index => index === channel);
								halloweenChannels.splice(getIndex,1)
								changes2 += `- Removed <#${channel}>.\n`
							}
						}
						res.events.halloween.channels = halloweenChannels
						console.log(`Ch: "${changes}"\nCh2: "${changes2}"\nCH: ${halloweenChannels}`)
						halloweenEmbed.addFields([
							{name: `The following channel(s) will not spawn monster cards:`,value: changes.length > 0 ? changes : `No Changes made.`,inline: true},
							{name: `The following channel(s) will spawn monster cards:`,value: changes2.length > 0 ? changes2 : `No Changes made.`,inline: true},
							{name: `Now spawning in the following channels channel(s):`,value: halloweenChannels.length > 0 ? halloweenChannels.map(item => item = `<#${item}>`).join("\n") : `No channel is spawning monster cards!`}
						])
						rep(halloweenEmbed);
					}

					// lock
					if (subOptionsAllowedString.indexOf(subOption) == subOptionsAllowed.lock) {
						let halloweenChannelsLimited = res.events.halloween.limitedChannels;
						let channelsMentioned = message.mentions.channels.map(item => item.id);
						let changes = ``
						let changes2 = ``

						if (channelsMentioned.length == 0) {
							halloweenEmbed.setDescription(`${issuer}, please mention at least 1 channel! If the channel was added already, it will be removed and vice versa!`)
							return rep(halloweenEmbed,'10s');						
						}
						for (const channel of channelsMentioned) {
							if(!halloweenChannelsLimited.includes(channel)){
								halloweenChannelsLimited.push(channel)
								changes += `- Added <#${channel}>.\n`
							} else {
								let getIndex = halloweenChannelsLimited.findIndex(index => index === channel);
								halloweenChannelsLimited.splice(getIndex,1)
								changes2 += `- Removed <#${channel}>.\n`
							}
						}
						res.events.halloween.limitedChannels = halloweenChannelsLimited
						console.log(`Ch: "${changes}"\nCh2: "${changes2}"\nCH: ${halloweenChannelsLimited}`)
						halloweenEmbed.addFields([
							{name: `The following channel(s) will respond to members when they use event commands:`,value: changes.length > 0 ? changes : `No Changes made.`,inline: true},
							{name: `The following channel(s) will not respond anymore when they use event commands:`,value: changes2.length > 0 ? changes2 : `No Changes made.`,inline: true},
							{name: `Members need to type in these channels to respond to their command(s):`,value: halloweenChannelsLimited.length > 0 ? halloweenChannelsLimited.map(item => item = `<#${item}>`).join("\n") : `No channel is spawning monster cards!`}
						])
						rep(halloweenEmbed);
					}

					// enable second part
					if (subOptionsAllowedString.indexOf(subOption) == subOptionsAllowed.ebs)
					{
						if (!res.events.halloween.enableEvilSouls) res.events.halloween.enableEvilSouls = false;
						res.events.halloween.enableEvilSouls = !res.events.halloween.enableEvilSouls
						halloweenEmbed.setDescription(`The spawn of bad souls is ${res.events.halloween.enableEvilSouls == false ? "disabled": "enabled"}! If enabled, there is a 50/50 chance to appear bad/good souls! Good souls will function as previously and bad souls will take away candies!`)
						rep(halloweenEmbed,'10s');						
					}
				}
				// console.log(`it should save now channels `)
				res.save().catch(err2 => console.log(err2))
			}
		})
		
		// function rep(msg,mentionAuthor = false,embed,deleteAfter,timeout) {
		// 	let thismsg;
		// 	if (embed) {
		// 		if (mentionAuthor) embed.description = `${issuer}, `+embed.description;
		// 		thismsg = message.channel.send({embeds: [embed]})
		// 	} else {
		// 		if (mentionAuthor)
		// 	  		thismsg = message.channel.send(`<@${issuer.id}>, `+msg)
		// 		else
		// 			thismsg = message.channel.send(msg)
		// 	}
		// 	if (deleteAfter) {
		// 	  setTimeout(() => {
		// 		thismsg.then(m =>m.delete())
		// 	  }, ms(timeout));
		// 	}
		// }
		/**
		 * 
		 * @param {Object} myMessage The message to send. Can be a string or Embed 
		 * @param {String} deleteAfterTimeout The time after which the message will be deleted
		 * @param {Boolean} onlyUser Whenever you want to send an ephemeral message (only available to the user who interacted with).
		 */
		function rep(myMessage,deleteAfterTimeout = null,setEphemeral = false) {
			let tempMessageForTimeoutDelete;

			if (typeof(myMessage) == "string") 
			{
				if (deleteAfterTimeout != null)
				{
					tempMessageForTimeoutDelete = message.channel.send({content: myMessage, ephemeral: setEphemeral})
					setTimeout(() => { tempMessageForTimeoutDelete.then(m =>m.delete()) }, ms(deleteAfterTimeout));
				} else message.channel.send({content: myMessage, ephemeral: setEphemeral})
			} else if (typeof(myMessage) == "object") {
				let tempArr = myMessage;

				if (!Array.isArray(myMessage)) tempArr = [myMessage]
				
				if (deleteAfterTimeout != null)
				{
					tempMessageForTimeoutDelete = message.channel.send({embeds: tempArr, ephemeral: setEphemeral})
					setTimeout(() => { tempMessageForTimeoutDelete.then(m =>m.delete()) }, ms(deleteAfterTimeout));
				} else message.channel.send({embeds: tempArr, ephemeral: setEphemeral})
			}
		}
		
		function roundPrecised(value, decimals) {
			return Number(Math.round(value +'e'+ decimals) +'e-'+ decimals).toFixed(decimals);
		}
		function arrayShuffle(array) {
			for ( let i = 0, length = array.length, swap = 0, temp = ''; i < length; i++ ) {
			swap        = Math.floor(Math.random() * (i + 1));
			temp        = array[swap];
			array[swap] = array[i];
			array[i]    = temp;
			}
			return array;
		};
		function percentageChance(values, chances) {
			for ( var i = 0, pool = []; i < chances.length; i++ ) {
			for ( let i2 = 0; i2 < chances[i]; i2++ ) {
				pool.push(i);
			}
			}
			return values[arrayShuffle(pool)['0']];
		};
		function isExistingInGuild(id,guildID,cl) {
			let giveBackUsername = ``;
			let checkMember = cl.guilds.cache.get(guildID).members.cache.get(id)
				if(checkMember){
					let guildUser = cl.users.cache.get(id)
					// console.log(guildUser.tag)
					if(issuer.id == id){
						giveBackUsername = `You (${guildUser.username})`
					}else{
						giveBackUsername = `${guildUser.username}`
					}
				}else{
					giveBackUsername = ` Ghost (Member Left)`
					console.log(`This member (${id}) doesn't exist, going next!`)
				}
				return giveBackUsername;
		}
	}
	
};
