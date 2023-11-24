const cooking_players = require("../../Models/events/cooking/cooking_players");
const guildSettings = require("../../Models/GuildSettings")
const SharuruEmbed = require('../../Structures/SharuruEmbed');
const Event = require('../../Structures/Event');
const keygen = require("keygenerator")
const sendError = require('../../Models/Error');
const gameAccounts = require("../../Models/gameModels/gameAccounts");
const game_charNames = require("../../Assets/game_files/game_data/game_name_tools/names.json")
const banned_word = require("../../Assets/game_files/game_data/game_name_tools/banned_words.json");
const profilesSys = require("../../Models/profiles");
const _interface = require("../../Assets/game_files/game_tools/interface");
const pms = require("pretty-ms")
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, Colors } = require("discord.js");
const giveaways = require("../../Models/giveaways");
require("dotenv").config();
const shopButtons = new ActionRowBuilder().addComponents(
	new ButtonBuilder()
	.setCustomId(`first`)
	.setLabel(`First Item`)
	.setStyle(ButtonStyle.Secondary),
	new ButtonBuilder()
	.setCustomId(`back`)
	.setLabel(`Previous Item`)
	.setStyle(ButtonStyle.Secondary),
	new ButtonBuilder()
	.setCustomId(`buy`)
	.setLabel(`Buy`)
	.setStyle(ButtonStyle.Secondary),
	new ButtonBuilder()
	.setCustomId(`next`)
	.setLabel(`Next Item`)
	.setStyle(ButtonStyle.Secondary),
	new ButtonBuilder()
	.setCustomId(`last`)
	.setLabel(`Last Item`)
	.setStyle(ButtonStyle.Secondary)
)
const buyButtons = new ActionRowBuilder().addComponents(
new ButtonBuilder()
.setCustomId(`yes`)
.setLabel(`Confirm`)
.setStyle(ButtonStyle.Success),
new ButtonBuilder()
.setCustomId(`no`)
.setLabel(`Cancel`)
.setStyle(ButtonStyle.Danger)
)
const raffleButtonLeave = new ActionRowBuilder()
module.exports = class extends Event {

	constructor(...args) {
		super(...args, {
			name: `interactionCreate`,
			event_type: `interaction`
		});
	}

    async run(interaction) {

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
		const prefix = this.client.prefixes.get(interaction.guildId)
        const logChannel = interaction.member.guild.channels.cache.find(ch => ch.name === 'sharuru-logs');
        const myUtils = this.client.utils;
		const issuer = interaction.user ?? "Unknown user";
		const timeoutRequest = 60000;
        const raffleRequest_addRole = `raffleRequest_addRole#${interaction.guildId}`
		// let command = interaction//.data.name.toLowerCase()
		// console.log(interaction)
		//if it's a button!
		let interactionEmbed = new SharuruEmbed()
			.setColor(Colors.LuminousVividPink)

		if (!interaction.isChatInputCommand) return;

		// ping test command
			
		if (interaction.isButton()) {
			console.log(`button works`)
			console.log(interaction.customId)
			let theCH = interaction.member.guild.channels.cache.get(interaction.channelId)
			let msg = theCH.messages.cache.get(interaction.message.id)
			const raffleIdEdit = `currentRaffleEdit#${interaction.guildId}`
			const raffleTemplateRequestData = `raffleTemplateData#${interaction.guildId}`



			//#region Raffle Interaction Add/Remove
			
			// const foundRequestUser = interaction.client.giveawaysQueue.get(issuer.id) || interaction.client.giveawaysQueue.get(raffleRequest_addRole)
			// let useThisIdInstead = foundRequestUser?.giveawayId
			// console.log(`use: ${useThisIdInstead}`)
			let reforgedId = "";
			if (interaction.customId.includes("raffle")) {
				let getIdIndex = interaction.customId.indexOf(":")
				reforgedId = interaction.customId.slice(getIdIndex+1)
			}
			console.log("reforgedID for giveaway: "+reforgedId)
			// if (interaction.customId == "raffle#leave" && useThisIdInstead == null)
			// {
			// 	interactionEmbed.setDescription(`Unfortunately this request has either expired or broke. Please try again later.`)
			// 	if (interaction.client.giveawaysQueue.get(issuer.id))
			// 		interaction.client.giveawaysQueue.delete(issuer.id)
			// 	interaction.reply({embeds: [interactionEmbed], ephemeral: true})
			// 	return;
			// }
			await giveaways.findOne({
					raffleId: interaction.client.giveawaysQueue.get(raffleIdEdit)
				},async (err, res)=>{
					if (err) {
						sendError.create({
							Guild_Name: interaction.member.guild.name,
							Guild_ID:  interaction.guildId,
							User: issuer.tag,
							UserID: issuer.id,
							Error: err,
							Time: `${TheDate} || ${clock} ${amORpm}`,
							Command: `interactionCreate - raffle Join/leave button`,
							Args: `no arguments for this Interaction Type`,
						},async (err, res) => {
							if(err) {
								console.log(err)
							}
							if(res) {
								console.log(`successfully added error to database from interactionCreate-raffle#Join event!`)    
							}
						})
					}

					if (res) {
						let usrObj = {
							name: issuer.username,
							userId: issuer.id,
							time: Date.now(),
							roles: interaction.member.roles.cache
							.sort((a, b) => b.position - a.position)
							.map(role => role.id)
							.slice(0, -1)
						}
						console.log("before checking customId")

						if (interaction.customId.includes("raffle#join")) {
							console.log(usrObj)
							// add player to giveaway if it's not
							if (!res.people_reacted.some(people => people['userId'] === usrObj['userId'])) {
								res.people_reacted.push(usrObj);
								interactionEmbed.setDescription(`You joined the giveaway "*${res.prize}*"!`)
								interaction.reply({embeds: [interactionEmbed], ephemeral: true})
								res.save().catch(err=>console.log(err))
							} else {
							// ask if player wishes to get out from giveaway if it's already in the giveaway 
								interactionEmbed.setDescription(`You're already participating in this giveaway. Do you want to leave?`)
								raffleButtonLeave.addComponents(
									new ButtonBuilder()
									.setCustomId(`raffle#leave:${reforgedId}`)
									.setLabel(`Leave giveaway`)
									.setStyle(ButtonStyle.Danger)
								)
								interaction.reply({embeds: [interactionEmbed], components: [raffleButtonLeave], ephemeral: true})
							}
							return;
						}
						if (interaction.customId.includes("raffle#leave")) {
							console.log(`[Giveaways - ${reforgedId}] User left:`+usrObj.name+` giveaway.`)
							
							let indexUser = res.people_reacted.findIndex(user => user.userId == usrObj.userId)
							res.people_reacted.splice(indexUser,1)
							interactionEmbed.setDescription(`You are no longer participating in this giveaway.`)
							interaction.reply({embeds: [interactionEmbed], ephemeral: true})
							res.save().catch(err=>console.log(err))
						}

						if (interaction.customId.includes("raffle#edit_addrole"))
						{
							const data_obj = interaction.client.giveawaysQueue.get(raffleRequest_addRole)
							console.log(`dataObj:\n`,data_obj)
							if (data_obj?.time > data_obj?.time+timeoutRequest) {
								interactionEmbed.setDescription(`Unfortunately this request has expired. Please try again later.`)
								interaction.client.giveawaysQueue.delete(raffleRequest_addRole)
								interaction.reply({embeds: [interactionEmbed], ephemeral: true})
								return;
							}
							console.log(`[raffle-interactionCreate]: ${issuer.username} applied new things: ${data_obj.bonus_type} = ${data_obj.bonus_value}`)
							
							let findIndexItem = res.modifiedRoleChances.findIndex(item => item.role_id == data_obj.role_id)
							res.modifiedRoleChances[findIndexItem].bonus_type = data_obj.bonus_type
							res.modifiedRoleChances[findIndexItem].bonus_value= data_obj.bonus_value
							interactionEmbed.setDescription(`${issuer}, I've edited the type and value of <@&${data_obj.role_id}>!`)
							interaction.reply({embeds: [interactionEmbed]})
							giveaways.updateOne({
								'raffleId': `${interaction.client.giveawaysQueue.get(raffleIdEdit)}`
							},{'$set':{ 'modifiedRoleChances' : res.modifiedRoleChances}},(erro,reso)=>{
								if (erro) {
									sendError.create({
										Guild_Name: interaction.member.guild.name,
										Guild_ID: interaction.guildId,
										User: interaction.member.user.username,
										UserID: interaction.member.user.id,
										Error: erro,
										Time: `${TheDate} || ${clock} ${amORpm}`,
										Command: this.name + `, tried to update modified for ${data_obj.giveawayId}  `,
										Args: `no args`,
									},async (errr, ress) => {
										if(errr) {
											console.log(errr)
											return logChannel.send(`[${this.name}]: Unfortunately an problem appeared while trying to save data of an user in shop interface of the profile command. Please try again later. If this problem persist, contact my partner!`)
										}
										if(ress) {
											console.log(`successfully added error to database!`)
										}
									})
									return;
								}
								if(reso) {
									console.log(`[raffle-interactionCreate]: Updated modifiedRoleChance of ${interaction.client.giveawaysQueue.get(raffleIdEdit)}`)
								}
							});
						}
						if (interaction.customId.includes("raffle#remove_addrole"))
						{
							console.log(`[raffle-slash]: @${issuer.username} removed ${reforgedId} from giveaway ${interaction.client.giveawaysQueue.get(raffleIdEdit)}`)
							
							let findIndexItem = res.modifiedRoleChances.findIndex(item => item.role_id == reforgedId)
							res.modifiedRoleChances.splice(findIndexItem,1)
							interactionEmbed.setDescription(`${issuer}, I've removed the modifier for <@&${reforgedId}> role from the giveaway with id: ${interaction.client.giveawaysQueue.get(raffleIdEdit)}!`)
							interaction.reply({embeds: [interactionEmbed]})
							giveaways.updateOne({
								'raffleId': `${interaction.client.giveawaysQueue.get(raffleIdEdit)}`
							},{'$set':{ 'modifiedRoleChances' : res.modifiedRoleChances}},(erro,reso)=>{
								if (erro) {
									sendError.create({
										Guild_Name: interaction.member.guild.name,
										Guild_ID: interaction.guildId,
										User: interaction.member.user.username,
										UserID: interaction.member.user.id,
										Error: erro,
										Time: `${TheDate} || ${clock} ${amORpm}`,
										Command: this.name + `, removed role modifier for ${data_obj.giveawayId}  `,
										Args: `no args`,
									},async (errr, ress) => {
										if(errr) {
											console.log(errr)
											return logChannel.send(`[${this.name}]: Unfortunately an problem appeared while trying to save data of an user in shop interface of the profile command. Please try again later. If this problem persist, contact my partner!`)
										}
										if(ress) {
											console.log(`successfully added error to database!`)
										}
									})
									return;
								}
								if(reso) {
									console.log(`[raffle-interactionCreate]: Updated modifiedRoleChance of ${interaction.client.giveawaysQueue.get(raffleIdEdit)}`)
								}
							});
						}
						
						if (interaction.customId.includes("raffle#replaceTemplate"))// either replace or cancel the template
						{
							if (isNaN(reforgedId))// Cancel the request
							{
								interaction.message.delete()
								interactionEmbed.setDescription(`Alright ${issuer}! I'll not replace the template!`)
								interaction.reply({embeds: [interactionEmbed]})
							} else { // replace the template
								let getTemplateData = sharuru.giveawaysQueue.get(raffleTemplateRequestData)
								let templateObj = {
									namae: getTemplateData.namae,
									template_roles: getTemplateData.template_roles
								}
								getTemplateData.current_templates[getTemplateData.indexExistent] = templateObj
								guildSettings.updateOne({
									'ID': `${interaction.guildId}`
								},{'$set':{ 'raffleSettings.templates' : getTemplateData.current_templates}},(erro,reso)=>{
									if (erro) {
										sendError.create({
											Guild_Name: interaction.member.guild.name,
											Guild_ID: interaction.guildId,
											User: interaction.member.user.username,
											UserID: interaction.member.user.id,
											Error: erro,
											Time: `${TheDate} || ${clock} ${amORpm}`,
											Command: this.name + `, tried to update templates for ${interaction.client.giveawaysQueue.get(raffleIdEdit)}  `,
											Args: `no args`,
										},async (errr, ress) => {
											if(errr) {
												console.log(errr)
												return logChannel.send(`[${this.name}]: Unfortunately an problem appeared while trying to save data of an user in shop interface of the profile command. Please try again later. If this problem persist, contact my partner!`)
											}
											if(ress) {
												console.log(`successfully added error to database!`)
											}
										})
										return;
									}
									if(reso) {
										console.log(`[raffle-interactionCreate]: Updated template_data list of ${interaction.guildId}`)
									}
								});
							}
						}
						return;
					}
				})

			//#endregion

			//#region Versus Event
			const redTeamName = `the Red Team`
			const blueTeamName = `the Blue Team`
			let userVersusData = this.client.versusEvent.get(1).confirmations.get(interaction.user.id);
			
				switch (interaction.customId) {
					case "yes":
						if (userVersusData.stage == undefined || userVersusData.stage == null) return;
						if (userVersusData.stage == "chooseTeams") {
							profilesSys.findOne({
								userID: interaction.user.id
							},(err,res) =>{
								if (err) {
									sendError.create({
									Guild_Name: interaction.member.guild.name,
									Guild_ID: interaction.guildId,
									User: interaction.user.username+"#"+interaction.user.discriminator,
									UserID: interaction.user.id,
									Error: err,
									Time: `${TheDate} || ${clock} ${amORpm}`,
									Command: this.name + " versus event option choose team",
									Args: `no args`,
								},async (err, res) => {
									if(err) {
										console.log(err)
										return logChannel.send(`[${this.name}-versus event- select cmd]Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
									}
									if(res) {
										console.log(`successfully added error to database!`)
									}
								})
								}
								if (res) {
									if (!res.events.versus) {
										res.events.versus.team = "none";
										res.events.versus.damage = 0;
										res.events.versus.inventory = {
											weapons: [],
											items: {
												small_bomb: 0,
												medium_bomb: 0,
												large_bomb: 0,
												special_bomb: 0,
											}
										};
										res.events.versus.missions = {
											lastCompletion: {
												day: 0,
												month: 0
											},
											list: [],
											sml: [],
											nickname: "not_set",
											messages: [],
											completedM: 0
										},
										res.events.versus.weaponHold = 0,
										res.events.versus.weaponFruitAdded = 0,
										res.events.versus.tickets = 0
									}
									res.events.versus.team = userVersusData.team;
									res.save().catch(err2=> {
										if (err2) {
											sendError.create({
												Guild_Name: interaction.member.guild.name,
												Guild_ID: interaction.guildId,
												User: interaction.user.username+"#"+interaction.user.discriminator,
												UserID: interaction.user.id,
												Error: err2,
												Time: `${TheDate} || ${clock} ${amORpm}`,
												Command: this.name + " versus event yes",
												Args: `no args`,
											},async (err, res) => {
												if(err) {
													console.log(err)
													return logChannel.send(`[${this.name}-versus event]Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
												}
												if(res) {
													console.log(`successfully added error to database!`)
												}
											})
										}
									})
								}
							})
							interaction.deleteReply();
							interactionEmbed.setDescription(`You joined ${userVersusData.team == "red" ? redTeamName : blueTeamName}!`)
							theCH.send({embeds: [interactionEmbed]}).then(msg =>{
								myUtils.mgoAdd(interaction.guildId,interaction.channelId,msg.id,10000);
							})
							guildSettings.findOne({
								ID: interaction.guildId
							},async(err2,res2)=>{
								if (err2) {
									sendError.create({
									Guild_Name: interaction.member.guild.name,
									Guild_ID: interaction.guildId,
									User: interaction.user.username+"#"+interaction.user.discriminator,
									UserID: interaction.user.id,
									Error: err,
									Time: `${TheDate} || ${clock} ${amORpm}`,
									Command: this.name + " versus event yes option - guild setting",
									Args: `no args`,
								},async (err, res) => {
									if(err) {
										console.log(err)
										return logChannel.send(`[${this.name}-versus event- select cmd]Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
									}
									if(res) {
										console.log(`successfully added error to database!`)
									}
								})
								}
								if (res2) {
									res2.events.versus[userVersusData.team].players.push(`${interaction.user.id}`)
									res2.save().catch(err=> console.log(err))
								}
							})
						}
						if (userVersusData.stage == "switchTeams") {
							guildSettings.findOne({
								ID: interaction.guildId
							},async(err2,res2)=>{
								if (err2) {
									sendError.create({
									Guild_Name: interaction.member.guild.name,
									Guild_ID: interaction.guildId,
									User: interaction.user.username+"#"+interaction.user.discriminator,
									UserID: interaction.user.id,
									Error: err,
									Time: `${TheDate} || ${clock} ${amORpm}`,
									Command: this.name + " versus event yes option - guild setting switch team",
									Args: `no args`,
								},async (err, res) => {
									if(err) {
										console.log(err)
										return logChannel.send(`[${this.name}-versus event- select cmd]Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
									}
									if(res) {
										console.log(`successfully added error to database!`)
									}
								})
								}
								if (res2) {
									// push player in the new team
									let oppositeTeam = userVersusData.team == "red" ? "blue" : "red";
									res2.events.versus[userVersusData.team].players.push(`${interaction.user.id}`)
									// remove player from old team
									let indexPlayer = res2.events.versus[oppositeTeam].players.findIndex(item => item == interaction.user.id)
									res2.events.versus[oppositeTeam].players.splice(indexPlayer,1);

									console.log(`displaying current team dmg: ${res2.events.versus[oppositeTeam].damage}`)
									// retrieve dmg data from user and remove it from their team
									await profilesSys.findOne({
										userID: interaction.user.id
									},async(err,res) =>{
										if (err) {
											sendError.create({
											Guild_Name: interaction.member.guild.name,
											Guild_ID: interaction.guildId,
											User: interaction.user.username+"#"+interaction.user.discriminator,
											UserID: interaction.user.id,
											Error: err,
											Time: `${TheDate} || ${clock} ${amORpm}`,
											Command: this.name + " versus event yes option",
											Args: `no args`,
										},async (err, res) => {
											if(err) {
												console.log(err)
												return logChannel.send(`[${this.name}-versus event- select cmd]Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
											}
											if(res) {
												console.log(`successfully added error to database!`)
											}
										})
										}
										if (res) {
											console.log(`user dmg done: ${res.events.versus.damage}`)
											res.events.versus.team = userVersusData.team;
											res2.events.versus[oppositeTeam].damage -= Number(res.events.versus.damage);
											res.events.versus.damage = 0;
											res.events.versus.inventory = {
												weapons: [],
												items: {
													small_bomb: 0,
													medium_bomb: 0,
													large_bomb: 0,
													special_bomb: 0,
												}
											};
											res.events.versus.weaponHold = 0,
											res.events.versus.weaponFruitAdded = 0,
											res.events.versus.tickets = 0
											res.save().catch(err2=> {
												if (err2) {
													sendError.create({
														Guild_Name: interaction.member.guild.name,
														Guild_ID: interaction.guildId,
														User: interaction.user.username+"#"+interaction.user.discriminator,
														UserID: interaction.user.id,
														Error: err2,
														Time: `${TheDate} || ${clock} ${amORpm}`,
														Command: this.name + " versus event yes - switch teams",
														Args: `no args`,
													},async (err, res) => {
														if(err) {
															console.log(err)
															return logChannel.send(`[${this.name}-versus event-switch teams]Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
														}
														if(res) {
															console.log(`successfully added error to database!`)
														}
													})
												}
											})
											interaction.deleteReply();
											interactionEmbed.setDescription(`You switched the sides and for betraying the comrades from other side, you lost your items and the damage you have done ended up vanishing magically...`)
											theCH.send({embeds: [interactionEmbed]}).then(msg =>{
												myUtils.mgoAdd(interaction.guildId,interaction.channelId,msg.id,10000);
											})
										}
									})
									console.log(`displaying updated dmg: ${res2.events.versus[oppositeTeam].damage}`)
									res2.save().catch(err=> console.log(err))
								}
							})
						}
					break;
					case "no":
						interaction.deleteReply();
					break;
					
					default:
						// console.log(`[VERSUS-EVENT]: THIS INTERACTION WAS NOT HANDLED!`)
						// console.log(interaction.customId)
						break;
				}
			//#endregion

			//#region ProfileShop
			let userProfileData = this.client.profileShopClients.get(interaction.user.id);
			if (userProfileData != undefined && interaction.user.id == userProfileData.user && userProfileData.stage == 'profileShop') {
				if (userProfileData.currentState == "in_category") {
					let shopEmbed = new SharuruEmbed()
						.setTitle(`Profile Background Shop!`)
						.setColor("LUMINOUS_VIVID_PINK")
					let bgRefs = userProfileData.bgsData.get(userProfileData.currentCategory)
					
					switch (interaction.customId) {
						case "first":
							shopEmbed.setDescription(`ID: ${bgRefs[0].bgID}\nPrice: ${bgRefs[0].bgPrice}\nTemporary [[?](https://www.google.com "This is referring to the amount of time the backgrond remains after purchase. After the time passed, the background will expire and you will have to purchase it again!")]: ${checkAvailability(bgRefs[0].bgAvailability)}\nAvailability [[?](http://www.google.com "The time this background will remain available to purchase. After the time is gone, it will magically vanish!")]: ${checkAvailability(bgRefs[0].bgAvailabilityInShop)} `)
							.setImage(bgRefs[0].bgLink)
							.setAuthor(`Browsing through ${this.client.utils.capitalise(userProfileData.currentCategory)} category!`)
							userProfileData.currentPosition = 0;

							checkIfOwned(userProfileData, bgRefs);
							checkInStock(bgRefs, userProfileData);
							
							interaction.deferUpdate()
							this.client.profileShopClients.set(interaction.user.id,userProfileData)
							msg.edit({embeds: [shopEmbed],components: [shopButtons],attachments: []})
						break;
						case "back":
							if (userProfileData.currentPosition == 0) 
								return await interaction.reply({content: "You cannot go more than this!"}).then(m =>{
									setTimeout(() => {
										interaction.deleteReply();
									}, 2000);
								});
							userProfileData.currentPosition--;
							checkIfOwned(userProfileData, bgRefs);
							checkInStock(bgRefs, userProfileData);
							this.client.profileShopClients.set(interaction.user.id,userProfileData)
							shopEmbed.setDescription(`ID: ${bgRefs[userProfileData.currentPosition].bgID}\nPrice: ${bgRefs[userProfileData.currentPosition].bgPrice}\nTemporary [[?](https://www.google.com "This is referring to the amount of time the backgrond remains after purchase. After the time passed, the background will expire and you will have to purchase it again!")]: ${checkAvailability(bgRefs[0].bgAvailability)}\nAvailability [[?](http://www.google.com "The time this background will remain available to purchase. After the time is gone, it will magically vanish!")]: ${checkAvailability(bgRefs[0].bgAvailabilityInShop)}`)
							.setImage(bgRefs[userProfileData.currentPosition].bgLink)
							.setAuthor(`Browsing through ${this.client.utils.capitalise(userProfileData.currentCategory)} category!`)
							interaction.deferUpdate()
							
							msg.edit({embeds: [shopEmbed],components: [shopButtons],attachments: []})
						break;
						case "buy":
							profilesSys.findOne({
								userID: userProfileData.user
							},async(err2,res2)=>{
								if (err2) {
									sendError.create({
									  Guild_Name: interaction.member.guild.name,
									  Guild_ID: interaction.guildId,
									  User: interaction.user.username+"#"+interaction.user.discriminator,
									  UserID: interaction.user.id,
									  Error: err2,
									  Time: `${TheDate} || ${clock} ${amORpm}`,
									  Command: this.name + " interaction profile store command buy",
									  Args: `no args`,
								  },async (err, res) => {
									  if(err) {
										  console.log(err)
										  return logChannel.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
									  }
									  if(res) {
										  console.log(`successfully added error to database!`)
									  }
								  })
								}
								if (res2) {
									shopEmbed.setTitle("Buy this?")
									.setDescription(`Background ID ${bgRefs[userProfileData.currentPosition].bgID} for the price of ***${bgRefs[userProfileData.currentPosition].bgPrice}***? *(you own ${res2.servers_data.get(interaction.guildId).money})*`)
									.setColor("LUMINOUS_VIVID_PINK")
									.setFooter(`This window will last 30s regardless of your choice!`)
									await interaction.reply({embeds: [shopEmbed],components: [buyButtons]}).then(async() =>{
										let msgRef = await interaction.fetchReply();
										// console.log(msgRef)
										myUtils.mgoAdd(interaction.guildId,interaction.channelId,msgRef.id,30000);
										shopButtons.components.find(item => item.customId == "buy").label = "In-transaction..."; 
                            			shopButtons.components.find(item => item.customId == "buy").disabled = true; 
										theCH.messages.cache.get(userProfileData.shopLocation.messageID).edit({components: [shopButtons]})
									})
								}
							})
						break;
						case "next":
							if (userProfileData.currentPosition == bgRefs.length-1) 
								return await interaction.reply({content: "You cannot go more than this!"}).then(m =>{
									setTimeout(() => {
										interaction.deleteReply();
									}, 2000);
								});
							userProfileData.currentPosition++;

							checkIfOwned(userProfileData, bgRefs);
							checkInStock(bgRefs, userProfileData);

							this.client.profileShopClients.set(interaction.user.id,userProfileData)
							shopEmbed.setDescription(`ID: ${bgRefs[userProfileData.currentPosition].bgID}\nPrice: ${bgRefs[userProfileData.currentPosition].bgPrice}\nTemporary [[?](https://www.google.com "This is referring to the amount of time the backgrond remains after purchase. After the time passed, the background will expire and you will have to purchase it again!")]: ${checkAvailability(bgRefs[0].bgAvailability)}\nAvailability [[?](http://www.google.com "The time this background will remain available to purchase. After the time is gone, it will magically vanish!")]: ${checkAvailability(bgRefs[0].bgAvailabilityInShop)}`)
							.setImage(bgRefs[userProfileData.currentPosition].bgLink)
							.setAuthor(`Browsing through ${this.client.utils.capitalise(userProfileData.currentCategory)} category!`)
							interaction.deferUpdate()
							msg.edit({embeds: [shopEmbed],components: [shopButtons],attachments: []})
						break;
						case "last":
							shopEmbed.setDescription(`ID: ${bgRefs[bgRefs.length-1].bgID}\nPrice: ${bgRefs[bgRefs.length-1].bgPrice}\nTemporary [[?](https://www.google.com "This is referring to the amount of time the backgrond remains after purchase. After the time passed, the background will expire and you will have to purchase it again!")]: ${checkAvailability(bgRefs[0].bgAvailability)}\nAvailability [[?](http://www.google.com "The time this background will remain available to purchase. After the time is gone, it will magically vanish!")]: ${checkAvailability(bgRefs[0].bgAvailabilityInShop)}`)
							.setImage(bgRefs[bgRefs.length-1].bgLink)
							.setAuthor(`Browsing through ${this.client.utils.capitalise(userProfileData.currentCategory)} category!`)
							userProfileData.currentPosition = bgRefs.length-1;

							checkIfOwned(userProfileData, bgRefs);
							checkInStock(bgRefs, userProfileData);

							this.client.profileShopClients.set(interaction.user.id,userProfileData)
							interaction.deferUpdate()
							msg.edit({embeds: [shopEmbed],components: [shopButtons],attachments: []})
						break;
						case "yes":
							profilesSys.findOne({
								userID: userProfileData.user
							},async (err2,res2)=>{
								if (err2) {
									sendError.create({
									  Guild_Name: interaction.member.guild.name,
									  Guild_ID: interaction.guildId,
									  User: interaction.user.username+"#"+interaction.user.discriminator,
									  UserID: interaction.user.id,
									  Error: err2,
									  Time: `${TheDate} || ${clock} ${amORpm}`,
									  Command: this.name + " interaction profile store command buy",
									  Args: `no args`,
								  },async (err, res) => {
									  if(err) {
										  console.log(err)
										  return logChannel.send(`Unfortunately an problem appeared while using profile shop command. Please try again later. If this problem persist, contact my partner!`)
									  }
									  if(res) {
										  console.log(`successfully added error to database!`)
									  }
								  })
								}
								if (res2) {
									msg.delete();
									// buy bcs have money
									if (res2.servers_data.get(interaction.guildId).money >= bgRefs[userProfileData.currentPosition].bgPrice) {
										shopEmbed.setTitle("Transaction Successfully Ended!")
											.setDescription(`Congrats! You just bought this background! You can select it by using \`${prefix}profile use ${bgRefs[userProfileData.currentPosition].bgID}\` to set the new background!`)
											.setColor("LUMINOUS_VIVID_PINK")
										await interaction.reply({embeds: [shopEmbed]})
										setTimeout(() => {
											interaction.deleteReply();
										}, process.env.CONFIRM_CANCEL_DELAY);
										//add the bg
										res2.backgroundsOwned.push(bgRefs[userProfileData.currentPosition].bgID)

										//substract the money
										let userSVData = res2.servers_data
										userSVData.get(interaction.guildId).money -= bgRefs[userProfileData.currentPosition].bgPrice
										profilesSys.updateOne({
											'userID': `${userProfileData.user}`
										},{'$set':{ 'servers_data' : userSVData}},(erro,reso)=>{
											if (erro) {
												sendError.create({
													Guild_Name: interaction.member.guild.name,
													Guild_ID: interaction.guildId,
													User: interaction.member.user.username,
													UserID: interaction.member.user.id,
													Error: erro,
													Time: `${TheDate} || ${clock} ${amORpm}`,
													Command: this.name + `, update confirmation buy `,
													Args: `no args`,
												},async (errr, ress) => {
													if(errr) {
														console.log(errr)
														return logChannel.send(`[${this.name}]: Unfortunately an problem appeared while trying to save data of an user in shop interface of the profile command. Please try again later. If this problem persist, contact my partner!`)
													}
													if(ress) {
														console.log(`successfully added error to database!`)
													}
												})
												return;
											}
											if(reso) {
												console.log(reso)
											}
										});

										//update embed to not buy anymore & userprofileData
										shopButtons.components.find(item => item.customId == "buy").label = "Owned"; 
                            			shopButtons.components.find(item => item.customId == "buy").disabled = true; 
										theCH.messages.cache.get(userProfileData.shopLocation.messageID).edit({components: [shopButtons]})
										userProfileData.bgsOwned.push(bgRefs[userProfileData.currentPosition].bgID)
										this.client.profileShopClients.set(userProfileData.user,userProfileData)

										res2.save().catch(err => { console.log(err); logChannel.send(`An error happened unfortunately while an user tried to buy a background: ${err.stack}`)})
									}
									if (res2.servers_data.get(interaction.guildId).money < bgRefs[userProfileData.currentPosition].bgPrice) {
										shopEmbed.setTitle("Transaction Failed!")
											.setDescription(`You can't buy this background because you're lacking ***\`${bgRefs[userProfileData.currentPosition].bgPrice - res2.servers_data.get(interaction.guildId).money}\`*** money! Try again later when u have more!`)
											.setColor("LUMINOUS_VIVID_PINK")
										interaction.reply({embeds: [shopEmbed]})
										setTimeout(() => {
											interaction.deleteReply();
										}, process.env.CONFIRM_CANCEL_DELAY);
									}
								}
							})
						break;
						case "no":
							msg.delete()
							shopButtons.components.find(item => item.customId == "buy").label = "Buy"; 
							shopButtons.components.find(item => item.customId == "buy").disabled = false; 
							theCH.messages.cache.get(userProfileData.shopLocation.messageID).edit({components: [shopButtons]})
							// interaction.deferUpdate()
							// let msgRef = await interaction.fetchReply();
							// let getGuildRef = this.client.guilds.cache.get(interaction.guildId)
							// let getChannelRef = getGuildRef.channels.cache.get(interaction.channelId)
							// let getMessageRef = getChannelRef.messages.cache.get(msgRef.id);
							// if (getMessageRef != undefined || getMessageRef != null)
							// 	getMessageRef.delete()
						break;
						
						default:
							console.log(`Not configured ${interaction.customId}!!!`)
							logChannel.send(`It seems like somehow a button (*\`${interaction.customId}\`*) wasn't configured but used. Please contact my partner and notify about this!`)
							break;
					}
				}

				return// console.log(interaction)
			}
			//#endregion

			//#region Game 1: Alfheim
			let buttonList = ['cancel','confirm','gender','origin','name','add_point','rem_point','select_down','select_up']
			let additionalData = {
				gameName: `Alfheim`,
				gameVersion: `Alpha v0.4.1`
			}
			let playerformData = this.client.game_one.get(interaction.user.id);
			if (playerformData != undefined && interaction.user.id == playerformData.sessionID && playerformData.stage == 'register') {
				console.log(`Alfheim game! BID: ${interaction.customId}`)
				let filter = m => m.author.id == interaction.user.id
				switch (interaction.customId) {
					case 'cancel':
						interaction.deferUpdate()
						this.client.guilds.cache.get(interaction.guildId).channels.cache.get(playerformData.formCh)
						.delete(`GAME: ${additionalData.gameName} | Reason: Session ended by user.`)
						this.client.game_one.delete(interaction.user.id);
					break;
					case 'confirm':
						interaction.deferUpdate()
						let missingFields = `Are you sure you don't want..`
						if (playerformData.stats.name == `*Choose a __name!__*`)  missingFields += `\n- Name your character?`
						if (playerformData.stats.race.type == `*Choose a race!*`) missingFields += `\n- Choose your race?`
						if (playerformData.stats.gender == `*Choose a gender!*`) missingFields += `\n- Choose your gender?`
						if (playerformData.stats.available > 0) missingFields +=`\n- Spend all stat points? You have **${playerformData.stats.available}** left!`;

						missingFields += `\n\n*This is the ${playerformData.questioned == 0 ? `1st time`: playerformData.questioned == 1 ? `2nd time`: playerformData.questioned == 2 ? `last time`: ``} when you're getting warned for this. All of these will be randomized if you don't complete these tasks!*`
						if (missingFields.length > 40 && playerformData.questioned <= 2) {
							interactionEmbed.setAuthor(`${additionalData.gameName}'s Character Creation Question:`)
							.setDescription(missingFields)
							playerformData.questioned++;
							this.client.game_one.set(interaction.user.id,playerformData);
							theCH.send({embeds: [interactionEmbed]}).then(m => setTimeout(() => {
								m.delete()
							}, 5000))
							return;
						}
						let randomizedData = {
							name: false,
							race: false,
							gender: false,
							points: false
						}
						//#region Randomize region
						if (playerformData.stats.name == `*Choose a __name!__*` ||playerformData.stats.name == undefined ) {
							let arrayOfLetters = Object.keys(game_charNames)
							let chosen_letter = arrayOfLetters[Math.floor(Math.random() * arrayOfLetters.length)]
							let chosen_position = Math.floor(Math.random() * game_charNames[chosen_letter].length)
							playerformData.stats.name = game_charNames[chosen_letter][chosen_position]
							randomizedData.name = true;
						}
						if (playerformData.stats.race.type == `*Choose a race!*`)  {
							playerformData.stats.race.type = 1
							randomizedData.race = true;
						}
						if (playerformData.stats.gender == `*Choose a gender!*`) {
							playerformData.stats.gender = Math.floor(Math.random() * 2)
							randomizedData.gender = true;
						}
						if (playerformData.stats.available > 0) { // if there are still points available
							let poolOfStats = ['attack','power','defense','intelligence','endurance','agility']
							for(let i = 0; i < playerformData.stats.available; i++) {
								let randomChoice = poolOfStats[Math.floor(Math.random() * poolOfStats.length)]
								playerformData.stats[randomChoice]++;
								playerformData.pointsSpent[randomChoice]++;
								if (randomChoice == "endurance") playerformData.stats.mana += 25;
								if (randomChoice == "intelligence") playerformData.stats.mana += 15;
								if (randomChoice == "agility") playerformData.stats.mana += 10;
							}
							playerformData.stats.available = 0;
							console.log(`I've randomized user stats,gender & race:`)
							console.log(playerformData)
							randomizedData.points = true
						}
						//#endregion

						if (playerformData.questioned >= 2) {
							interactionEmbed.setDescription(`Because you didn't complete a field or used all points, I've done the following:\n
${randomizedData.name == true ? `- You received the following name: ${playerformData.stats.name}` : ``}
${randomizedData.race == true ? `- Your race has been set as \`Human\`!` : ``}
${randomizedData.gender == true ? `- You gender is: ${playerformData.stats.gender == 0 ? `Male`: `Female`}` : ``}
${randomizedData.points == true ? `- Your remaining points were randomly distributed!` : ``}
`)
							theCH.send({embeds: [interactionEmbed]})
						}

						let uniqueID = `${interaction.user.id.slice(-6)}${keygen.number({length:6})}`;
						gameAccounts.findOne({
							account_id: uniqueID
						},(err3,res3)=>{
							if(err3){
								console.log(err3)
								return logChannel.send(`[Game-${additionalData.gameName}]: Unfortunately a problem appeared while trying to save a new account. If this problem persist, contact my partner and tell them to fix the creation menu character at saving.`)
							}
							if(res3){
								console.log(`Found duplicate ID`)
								uniqueID = `${interaction.user.id.slice(-6)}${keygen.number({length:6})}`;
								create_acc_char(uniqueID, interaction, logChannel, playerformData,additionalData);
								interactionEmbed.setDescription(`Welcome to ${additionalData.gameName}, ${playerformData.stats.name}! Please use again the command.`)
								theCH.send({embeds: [interactionEmbed]})
							} else {
								console.log(`created ${interaction.user.tag} account game`)
								create_acc_char(uniqueID, interaction, logChannel, playerformData,additionalData);
								interactionEmbed.setDescription(`Welcome to ${additionalData.gameName}, ${playerformData.stats.name}! Please use again the command.`)
								theCH.send({embeds: [interactionEmbed]})
								// setTimeout(() => {
								// 	this.client.guilds.cache.get(interaction.guild.id).channels.cache.get(playerformData.formCh).delete(`GAME: ${additionalData.gameName} | Closed the register channel`);
								// }, 30000);
								this.client.game_one.delete(interaction.user.id);
							}
						})
					break;
					case 'gender':
						interaction.deferUpdate()
						let allowedGenders = ['male','female','girl','boy']
						while (!playerformData.menuNavigationState.doneWithGender) {
							interactionEmbed.setDescription(`Please choose your gender by typing in the chat \`boy/girl\`:`)
							if (playerformData.strikes >= 3) {
								playerformData.menuNavigationState.doneWithGender = true
								interactionEmbed.setDescription(`Because you typed wrong 3+ times the gender, this session will end!`)
								msg.send({embeds: [interactionEmbed]})
								setTimeout(() => {
									this.client.guilds.cache.get(interaction.guildId).channels.cache.get(playerformData.form.Ch)
									.delete(`GAME: ${additionalData.gameName} | Reason: Session ended by user.`)
									this.client.game_one.delete(interaction.user.id);
								}, 5000);
								return;
							}
							await theCH.send({embeds: [interactionEmbed]}).then(async m =>{
								await theCH.awaitMessages({filter,time: 30000, max: 1}).then(async collected =>{
									let myName = collected.first().content.toLowerCase();
									await collected.delete()
									if (allowedGenders.includes(myName)){
										m.delete()
										collected.first().delete()
										if(myName == 'girl' || myName == 'female') myName = 1
										if(myName == 'boy' || myName == 'male') myName = 0
										playerformData.menuNavigationState.doneWithGender = true
										playerformData.stats.gender = myName
										theCH.send(`Your gender will be: ${myName == 0 ? `Male`: `Female`}!`).then(m => setTimeout(() => {
											m.delete()
										}, 5000))
										interactionEmbed.setDescription(registerMenuCreationInterface(playerformData.menuNavigationState.statPos,playerformData.stats,playerformData.pointsSpent,additionalData.gameName).description)
										msg.edit({embeds: [interactionEmbed]})
									} else {
										playerformData.strikes++;
										this.client.game_one.set(interaction.user.id,playerformData)
										theCH.send(`That isn't a valid gender! Please try again and make sure you type the gender as specified!\nMultiple fails will end up in ending session!`).then(m => setTimeout(() => {
											m.delete()
										}, 5000))
									}
								}).catch(err =>{
									playerformData.menuNavigationState.doneWithGender = true
									console.log(err)
									console.log(`Error: Timeout session, stage "Registration Gender", for ${interaction.user.tag} in ${interaction.member.guild.name} (${interaction.guildId})`)
									return theCH.send(`It seems like you fell asleep and you couldn't continue the session. This session is now ended and the progress is lost.`)
								})
							})
						}
						playerformData.strikes = 0;
						playerformData.menuNavigationState.doneWithGender = false;
						this.client.game_one.set(interaction.user.id,playerformData)
					break;
					case 'origin':
						let allowedRaces = ['human','dwarf','goblin','orc','ogre','lizardman','giant','pixie','tengu']
						while (!playerformData.menuNavigationState.doneWithRace) {
							interactionEmbed.setDescription(`Please choose your origins by typing it's name below:\n- Human\n- Dwarf\n- Goblin\n- Orc\n- Ogre\n- Lizardman\n- Giant\n- Pixie\n- Tengu`)
							interaction.deferUpdate()
							if (playerformData.strikes >= 3) {
								interactionEmbed.setDescription(`Because you typed wrong 3 times the origin, this session will end!`)
								playerformData.menuNavigationState.doneWithRace = true
								msg.send({embeds: [interactionEmbed]})
								setTimeout(() => {
									this.client.guilds.cache.get(interaction.guildId).channels.cache.get(playerformData.form.Ch)
									.delete(`GAME: ${additionalData.gameName} | Reason: Session ended by user.`)
									this.client.game_one.delete(interaction.user.id);
								}, 5000);
								return;
							}
							await theCH.send({embeds: [interactionEmbed]}).then(async m =>{
								await theCH.awaitMessages({filter,time: 30000, max: 1}).then(async collected =>{
									let myName = collected.first().content;
									await collected.delete()
									if (allowedRaces.includes(myName.toLowerCase())){
										m.delete()
										collected.first().delete()
										playerformData.menuNavigationState.doneWithRace = true
										console.log(playerformData)
										playerformData.stats.race.type = allowedRaces.findIndex(item => item == myName)
										theCH.send(`Your origins will be: ${myName}!`).then(m => setTimeout(() => {
											m.delete()
										}, 5000))
										interactionEmbed.setDescription(registerMenuCreationInterface(playerformData.menuNavigationState.statPos,playerformData.stats,playerformData.pointsSpent,additionalData.gameName).description)
										msg.edit({embeds: [interactionEmbed]})
									} else {
										playerformData.strikes++;
										this.client.game_one.set(interaction.user.id,playerformData)
										theCH.send(`That isn't a valid origin! Please try again and make sure you type the origin as specified!\nMultiple fails will end up in ending session!`).then(m => setTimeout(() => {
											m.delete()
										}, 5000))
									}
								}).catch(err =>{
									console.log(err)
									playerformData.menuNavigationState.doneWithRace = true
									console.log(`Error: Timeout session, stage "Registration Origin", for ${interaction.user.tag} in ${interaction.member.guild.name} (${interaction.guildId})`)
									return theCH.send(`It seems like you fell asleep and you couldn't continue the session. This session is now ended and the progress is lost.`)
								})
							})
						}
						playerformData.strikes = 0;
						playerformData.menuNavigationState.doneWithRace = false;
						this.client.game_one.set(interaction.user.id,playerformData)
					break;
					case 'name':
						interaction.deferUpdate()
						while (!playerformData.menuNavigationState.doneWithName) {
							interactionEmbed.setDescription(`By playing this game, you're agreeing to the ToS & these rules:\n\n- Name must be between 3 & 16 characters;\n- Names can contain only letters from \`A\` to \`z\` & a max of 2 \`-\`!;\n- Names cannot contain vulgar language. If you use a vulgar name, it will be permanently set to something random;\n\nPlease type your name (you have 1min to think):\n`)
							// interaction.deferUpdate()
							if (playerformData.strikes >= 3) {
								interactionEmbed.setDescription(`Because you didn't followed the rules 3 times in a row, this session will end!`)
								theCH.send({embeds: [interactionEmbed]})
								playerformData.menuNavigationState.doneWithName == true;
								setTimeout(() => {
									this.client.guilds.cache.get(interaction.guildId).channels.cache.get(playerformData.formCh)
									.delete(`GAME: ${additionalData.gameName} | Reason: Session ended by user for not following rules.`)
									this.client.game_one.delete(interaction.user.id);
								}, 5000);
								return;
							}
							await theCH.send({embeds: [interactionEmbed]}).then(async m =>{
								await theCH.awaitMessages({filter,time: 60000, max: 1}).then(async collected =>{
									let myName = collected.first().content;
									await collected.delete()
									if (!checkForItems(myName,banned_word.base,0)){
										m.delete()
										collected.first().delete()
										playerformData.menuNavigationState.doneWithName = true
										playerformData.stats.name = myName
										theCH.send(`Your name will be: ${myName}!`).then(m => setTimeout(() => {
											m.delete()
										}, 5000))
										interactionEmbed.setDescription(registerMenuCreationInterface(playerformData.menuNavigationState.statPos,playerformData.stats,playerformData.pointsSpent,additionalData.gameName).description)
										msg.edit({embeds: [interactionEmbed]})
									} else {
										playerformData.strikes++;
										this.client.game_one.set(interaction.user.id,playerformData)
										theCH.send(`That name is breanching the rules! Please follow the rules for name.\nMultiple fails will end up in ending session!`)
									}
								}).catch(err =>{
									console.log(err)
									playerformData.menuNavigationState.doneWithName = true
									console.log(`Error: Timeout session, stage "Registration Name", for ${interaction.user.tag} in ${interaction.member.guild.name} (${interaction.guildId})`)
									return theCH.send(`It seems like you fell asleep and you couldn't continue the session. This session now ended and the progress is lost.`)
								})
							})
						}
						playerformData.strikes = 0;
						playerformData.menuNavigationState.doneWithName = false;
						this.client.game_one.set(interaction.user.id,playerformData)
					break;
					case 'add_point':
						interaction.deferUpdate()
						if(playerformData.menuNavigationState.statPos == 1){
							if(playerformData.stats.available > 0){
								playerformData.pointsSpent.attack++;
								playerformData.stats.spent++;
								playerformData.stats.available--;
							} else return console.log(`[Game-${additionalData.gameName}]: Can't add non-existent available attack points!`)
						}
						if(playerformData.menuNavigationState.statPos == 2){
							if(playerformData.stats.available > 0){
								playerformData.pointsSpent.power++
								playerformData.stats.spent++;
								playerformData.stats.available--;
							} else return console.log(`[Game-${additionalData.gameName}]: Can't add non-existent available power points!`)
							
						}
						if(playerformData.menuNavigationState.statPos == 3){
							if(playerformData.stats.available > 0){
								playerformData.pointsSpent.defense++
								playerformData.stats.spent++;
								playerformData.stats.available--;
							} else return console.log(`[Game-${additionalData.gameName}]: Can't add non-existent available defense points!`)
							
						}
						if(playerformData.menuNavigationState.statPos == 4){
							if(playerformData.stats.available > 0){
								playerformData.pointsSpent.intelligence++
								playerformData.stats.mana += 15
								playerformData.stats.spent++;
								playerformData.stats.available--;
							} else return console.log(`[Game-${additionalData.gameName}]: Can't add non-existent available Intelligence points!`)
							
						}
						if(playerformData.menuNavigationState.statPos == 5){
							if(playerformData.stats.available > 0){
								playerformData.pointsSpent.endurance++
								playerformData.stats.hp += 25
								playerformData.stats.spent++;
								playerformData.stats.available--;
							} else return console.log(`[Game-${additionalData.gameName}]: Can't add non-existent available endurance points!`)
							
						}
						if(playerformData.menuNavigationState.statPos == 6){
							if(playerformData.stats.available > 0){
								playerformData.pointsSpent.agility++;
								playerformData.stats.stamina += 10
								playerformData.stats.spent++;
								playerformData.stats.available--;
							} else return console.log(`[Game-${additionalData.gameName}]: Can't add non-existent available agility points!`)
							
						}
						interactionEmbed.setDescription(registerMenuCreationInterface(playerformData.menuNavigationState.statPos,playerformData.stats,playerformData.pointsSpent,additionalData.gameName).description)
						msg.edit({embeds: [interactionEmbed]})
					break;
					case 'rem_point':
						interaction.deferUpdate()
						if(playerformData.menuNavigationState.statPos == 1){
							if(playerformData.pointsSpent.attack > 0){
								playerformData.pointsSpent.attack--;
								playerformData.stats.spent--;
								playerformData.stats.available++;
							} else {
								return console.log(`[Game-${additionalData.gameName}]: Can't remove non-existent attack points!`)
							}
						}
						if(playerformData.menuNavigationState.statPos == 2){
							if(playerformData.pointsSpent.power > 0){
								playerformData.pointsSpent.power--
								playerformData.stats.spent--;
								playerformData.stats.available++;
							} else {
								return console.log(`[Game-${additionalData.gameName}]: Can't remove non-existent power points!`)
							}
						}
						if(playerformData.menuNavigationState.statPos == 3){
							if(playerformData.pointsSpent.defense > 0){
								playerformData.pointsSpent.defense--
								playerformData.stats.spent--;
								playerformData.stats.available++;
							} else {
								return console.log(`[Game-${additionalData.gameName}]: Can't remove non-existent defense points!`)
							}
						}
						if(playerformData.menuNavigationState.statPos == 4){
							if(playerformData.pointsSpent.intelligence > 0){
								playerformData.pointsSpent.intelligence--
								playerformData.stats.mana -= 15
								playerformData.stats.spent--;
								playerformData.stats.available++;
							} else {
								return console.log(`[Game-${additionalData.gameName}]: Can't remove non-existent intelligence points!`)
							}
						}
						if(playerformData.menuNavigationState.statPos == 5){
							if(playerformData.pointsSpent.endurance > 0){
								playerformData.pointsSpent.endurance--
								playerformData.stats.hp -= 25
								playerformData.stats.spent--;
								playerformData.stats.available++;
							} else {
								return console.log(`[Game-${additionalData.gameName}]: Can't remove non-existent endurance points!`)
							}
						}
						if(playerformData.menuNavigationState.statPos == 6){
							if(playerformData.pointsSpent.agility > 0){
								playerformData.pointsSpent.agility--;
								playerformData.stats.stamina -= 10
								playerformData.stats.spent--;
								playerformData.stats.available++;
							} else {
								return console.log(`[Game-${additionalData.gameName}]: Can't remove non-existent agility points!`)
							}
						}
						interactionEmbed.setDescription(registerMenuCreationInterface(playerformData.menuNavigationState.statPos,playerformData.stats,playerformData.pointsSpent,additionalData.gameName).description)
						msg.edit({embeds: [interactionEmbed]})
					break;
					case 'select_down':
						interaction.deferUpdate()
						if(playerformData.menuNavigationState.statPos == 6) return console.log(`no more stats down`)
						playerformData.menuNavigationState.statPos++;
						interactionEmbed.setDescription(registerMenuCreationInterface(playerformData.menuNavigationState.statPos,playerformData.stats,playerformData.pointsSpent,additionalData.gameName).description)
						msg.edit({embeds: [interactionEmbed]})
					break;
					case 'select_up':
						interaction.deferUpdate()
						if(playerformData.menuNavigationState.statPos == 1) return console.log(`no more stats up`)
						playerformData.menuNavigationState.statPos--;
						interactionEmbed.setDescription(registerMenuCreationInterface(playerformData.menuNavigationState.statPos,playerformData.stats,playerformData.pointsSpent,additionalData.gameName).description)
						msg.edit({embeds: [interactionEmbed]})
					break;
																																									
					default:
						console.log(`[Game-${additionalData.gameName}]: not doing anything bcs I wasn't set up! => game char creation menu`)
						break;
				}
				// interaction.deferUpdate();
				return console.log(`[Game-${additionalData.gameName}]: EOF`)
			}
			//#endregion
			if (playerformData != undefined && interaction.user.id == playerformData.sessionID && playerformData.stage == 'game') {
				console.log(`Alfheim BID: ${interaction.customId}`)
				let theCH = interaction.member.guild.channels.cache.get(interaction.channelId)
				let msg = interaction.member.guild.channels.cache.get(interaction.channelId).messages.cache.get(playerformData.formId)
				let filter = m => m.author.id == interaction.user.id
				switch (interaction.customId) {
					//#region FIGHTING MENU CONTROLS
					case 'fight':
						interaction.deferUpdate()
						//_interface.fight_or_run(playerformData,this.client)
					break;
					//appraise - if higher level
					case 'getEnemyLevel':
						interaction.deferUpdate()
						_interface.getEnemyLevel(playerformData,theCH,msg);
					break;
					case 'run':
						interaction.deferUpdate()
						_interface.run_away(playerformData,this.client,msg,true)
					break;
					//#endregion

					//#region MAIN MENU CONTROLS
					case 'exit':
						interaction.deferUpdate()
						this.client.guilds.cache.get(interaction.guildId).channels.cache.get(playerformData.formCh)
						.delete(`GAME: ${additionalData.gameName} | Reason: Session ended by user.`)
						this.client.game_one.delete(interaction.user.id);
					break;
					case 'back':
						interaction.deferUpdate()
						_interface.moveMap(playerformData, this.client,msg,theCH,null)
					break;
					case "settings":
						interaction.deferUpdate()
						theCH.send({content:`coming soon`})
					break;
					case "mail":
						interaction.deferUpdate()
						theCH.send({content:`to do`})
					break;
					case "news":
						interaction.deferUpdate()
						theCH.send({content:`to do`})
					break;
					//#endregion
					
					//#region MAP CONTROLS
					case "map":
						interaction.deferUpdate()
						_interface.moveMap(playerformData, this.client,msg,theCH,null)
					break;
					case "left":
						interaction.deferUpdate()
						_interface.moveMap(playerformData, this.client,msg,theCH,"left")
					break;
					case "up":
						interaction.deferUpdate()
						_interface.moveMap(playerformData, this.client,msg,theCH,"up")
					break;
					case "right":
						interaction.deferUpdate()
						_interface.moveMap(playerformData, this.client,msg,theCH,"right")
					break;
					case "down":
						interaction.deferUpdate()
						_interface.moveMap(playerformData, this.client,msg,theCH,"down")
					break;
					//#endregion
					default:
						console.log(`[Game-${additionalData.gameName}]: not doing anything bcs I wasn't set up! => game char creation menu`)
						break;
				}
				// interaction.deferUpdate();
				return //console.log(`[Game-${additionalData.gameName}]: EOF`)
			}
			//#region Airdrop interaction
			let userAirData = this.client.airdropClients.get(interaction.message.id)
			if (userAirData != undefined && interaction.user.id == userAirData.owner) { // if they have data
					interactionEmbed.setAuthor(`Cooking Event: Airdrop`)//cooking event
					.setFooter(`Chef ${interaction.user.tag}`,interaction.user.displayAvatarURL())
					//#region Button Handler
					let rowID = interaction.customId >= 0 && interaction.customId <= 4 ? 0 : interaction.customId >= 5 && interaction.customId <= 9 ? 1 : 2
					let newComp = interaction.message.components;
					newComp[rowID].components[newComp[rowID].components.findIndex(item => item.customId == interaction.customId)].setDisabled(true)
					//#endregion

					guildSettings.findOne({
						ID: interaction.guildId
					},(err,res) =>{
						if (err) {
							sendError.create({
								Guild_Name: interaction.member.guild.name,
								Guild_ID: interaction.guildId,
								User: interaction.user.tag,
								UserID: interaction.user.id,
								Error: err,
								Time: `${TheDate} || ${clock} ${amORpm}`,
								Command: this.name+" - airdrop db guild search",
								Args: `no args interaction event`,
							},async (err2, res2) => {
								if(err2) {
									console.log(err2)
									return interaction.channel.send(`[Cooking Event]: Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner! ERR: ${err2.message}`)
								}
								if(res2) {
									console.log(`successfully added error to database!`)
								}
							})
						}
						if (res) {
							cooking_players.findOne({
								userID: interaction.user.id,
								guild: interaction.guildId
							},(err2,res2) =>{
								if (err2) {
									sendError.create({
										Guild_Name: interaction.member.guild.name,
										Guild_ID: interaction.guildId,
										User: interaction.user.tag,
										UserID: interaction.user.id,
										Error: err2,
										Time: `${TheDate} || ${clock} ${amORpm}`,
										Command: this.name+" - airdrop getting 5/3 ing",
										Args: `no args interaction event`,
									},async (err3, res3) => {
										if(err3) {
											console.log(err3)
											return interaction.channel.send(`[Cooking Event]: Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner! ERR: ${err2.message}`)
										}
										if(res3) {
											console.log(`successfully added error to database!`)
										}
									})
								}
								if (res2) {
									let collected_three = userAirData.itemsCollected > res.events.cooking.cooldowns.airdropTries ? true : false
									if (collected_three == false) { // if they didn't collect 3 items

									//#region Ingredient Handler
									userAirData.itemsCollected++; // increment items
									let drop_item = percentageChance(userAirData.containerContent,userAirData.containerContentChances)// get something random
									let amount = 1
									let data_ing = drop_item.split(" ")
									let multipleOrNothing2 = drop_item.includes("3") ? data_ing[1].includes("_") ? data_ing[1].replace("_"," ") : data_ing[1] : drop_item.includes('5') ? data_ing[1].includes("_") ? data_ing[1].replace("_"," ") : data_ing[1] : drop_item.includes("_") ? drop_item.replace("_","") : drop_item;
									if (['water','milk','oil','strawberry_jam','blackberry_jam','chocolate_syrup','mirin','raspberry_jam','soy_sauce','sour_cream'].includes(multipleOrNothing2)) {
										amount = 100;
										if (['milk','oil'].includes(multipleOrNothing2)) amount = 50;
										if (['strawberry_jam','blackberry_jam','chocolate_syrup','raspberry_jam'].includes(multipleOrNothing2)) amount = 25;
										if (['soy_sauce','mirin'].includes(multipleOrNothing2)) amount = 10;
										if (multipleOrNothing2 == 'sour_cream') amount = 15;
										console.log(`Amount for ${multipleOrNothing2}: ${amount}`)
									}
									let multipleOrNothing = drop_item.includes("3") ? data_ing[0] * amount : drop_item.includes("5") ? data_ing[0] * amount : amount

										interactionEmbed.setDescription(`You checked a box and collected \`${multipleOrNothing} ${multipleOrNothing2}\`! You can select ${3-userAirData.itemsCollected} more boxes(s)!`)
									if (drop_item.includes('5') || drop_item.includes('3')) {
										console.log(`[Cooking Event]: ${interaction.user.tag} got ${drop_item}.`)
										interaction.update({embeds: [interactionEmbed], components: newComp})
										res2.inventory.ingredients[data_ing[1]]+= Number(data_ing[0]) * amount;
										if (data_ing[0] == '5') {
											let getIndex = userAirData.containerContent.findIndex(item => item == drop_item)
											userAirData.containerContent.splice(getIndex,1)
											userAirData.containerContentChances.splice(getIndex,1)
											this.client.airdropClients.set(userAirData.containerId,userAirData)
										}
									} else {
										console.log(`[Cooking Event]: ${interaction.user.tag} got ${drop_item}.`)
										interaction.update({embeds: [interactionEmbed], components: newComp})
										res2.inventory.ingredients[drop_item]++;
									}
									if (collected_three == false)
										this.client.airdropClients.delete(userAirData.owner)
									res2.save().catch(err => console.log(err))
									//#endregion
									} else { // if they collected 3 times and maybe try to collect 4th item
										interactionEmbed.setDescription(`You tried to collect again from the container of the request call u made but seems like you heard some ticking noise... luckly your followed your instincts and left the area just to hear later an explosion.
What a nice day to continue living. `)
										if (userAirData != undefined)
											this.client.airdropClients.delete(userAirData.containerId)
										let imgs = [
										`https://cdn.discordapp.com/attachments/769228052165033994/944726695196381255/miyano-jump.gif`,
										`https://cdn.discordapp.com/attachments/769228052165033994/944726695523524679/anime-tears-of-joy.gif`,
										`https://cdn.discordapp.com/attachments/769228052165033994/944726695980720138/atsushi-nakajima-happy-anime-boy.gif`,
										`https://cdn.discordapp.com/attachments/769228052165033994/944726696517582928/black-clover-anime.gif`]
										interactionEmbed.setImage(imgs[Math.floor(Math.random() * imgs.length)])
										interaction.update({embeds: [interactionEmbed],components: []})
									}
								}// end of res2
							})
						}
					})
			}// else interaction.deferUpdate()
			//#endregion

			//#region Some airdrop material for later or vending machine?
			// if (interaction.customId >= '0' && interaction.customId <= '23' || interaction.customId >= '3' && interaction.customId <= '9' ) {
			// 	// await interaction.deferUpdate();
			// 	// let chance_to_drop
			// 	let newComp = interaction.message.components
			// 	let whatRow = 
			// 	interaction.customId >= 20 ? 4 : 
			// 	interaction.customId >= 15 ? 3 : 
			// 	interaction.customId >= 10 ? 2 : 
			// 	interaction.customId >= 5  ? 1 : 0
			// 	console.log(`R: ${whatRow} b:${interaction.customId}`)
			// 	console.log(newComp[whatRow].components.findIndex(item => item.customId == interaction.customId))
			// 	newComp[whatRow].components[newComp[whatRow].components.findIndex(item => item.customId == interaction.customId)].setDisabled(true)
			// 	interaction.update({content: `Airdrop edited ${interaction.customId}`,components: newComp})
			// 	console.log(`Button ${interaction.customId} was pressed!`)
			// }
			// if (interaction.customId == '24') {
			// 	await interaction.deferUpdate();
			// 	// let chance_to_drop
			// 	let newComp = interaction.message.components
			// 	// newComp[0].components[0].setDisabled(false)
			// 	for(let i = 0; i < 5; i++) 
			// 		for(let u = 0; u < 5; u++) {
			// 			console.log(`r: ${i}: b: ${u}`)
			// 			newComp[i].components[u].setDisabled(false)
			// 		}
			// 	interaction.editReply({content: "Airdrop edited",components: newComp})
			// 	console.log(`test 12`)
			// }
			//#endregion
			//#endregion
		}
		if (!interaction.isCommand()) return;

		const command = this.client.slashCommands.get(interaction.commandName);
		if (!command) return interaction.reply({content: "This command is either broken or non-existent!",ephemeral: true})
		command.execute(interaction)

        if (interaction.commandName == 'rolemenu'){
			console.log(`Option: `+interaction.options[0].name)
			let name, mode, desc,roles,gignorerole,grequirerole,temp,min,max,details,multiG = ``;
			name = interaction.options[0].options.find(rm => rm.name == 'name') ? `-name:`+interaction.options[0].options.find(rm => rm.name == 'name').value : ``;
			mode = interaction.options[0].options.find(rm => rm.name == 'mode') ? `-mode:`+interaction.options[0].options.find(rm => rm.name == 'mode').value : ``;
			desc = interaction.options[0].options.find(rm => rm.name == 'description') ? `-desc:`+interaction.options[0].options.find(rm => rm.name == 'description').value : ``; 
			details = interaction.options[0].options.find(rm => rm.name == 'details') ? `-details:`+interaction.options[0].options.find(rm => rm.name == 'details').value : ``;
			roles = interaction.options[0].options.find(rm => rm.name == 'roles') ? `-roles:<@&`+interaction.options[0].options.find(rm => rm.name == 'roles').value+`>` : ``;
			gignorerole = interaction.options[0].options.find(rm => rm.name == 'group_ignore_role') ? `-gignorerole:<@&`+interaction.options[0].options.find(rm => rm.name == 'group_ignore_role').value+`>` : ``;
			grequirerole = interaction.options[0].options.find(rm => rm.name == 'group_require_role') ? `-grequirerole:<@&`+interaction.options[0].options.find(rm => rm.name == 'group_require_role').value+`>` : ``;
			temp = interaction.options[0].options.find(rm => rm.name == 'temporary_roles') ? `-temporaryrole:`+interaction.options[0].options.find(rm => rm.name == 'temporary_roles').value : ``;
			if (interaction.options[0].options.find(rm => rm.name == 'mode').value == 'multi') {
				min = interaction.options[0].options.find(rm => rm.name == 'min').value ? `-min:`+interaction.options[0].options.find(rm => rm.name == 'min').value : ``;
				max = interaction.options[0].options.find(rm => rm.name == 'max').value ? `-max:`+interaction.options[0].options.find(rm => rm.name == 'max').value : ``;
				multiG = min+max
			}
			if (interaction.options[0].name == 'create')
				interaction.reply(`This is your command to create a role menu:\n\n${prefix}rolemenu create ${name} ${mode} ${roles} ${desc} ${gignorerole} ${grequirerole} ${temp} ${details} ${multiG}\n\nIn the \`-roles\` field, you can edit to include more roles than one! (at the moment discord allows only 1 role to mention)`,{ ephemeral: true })
		}
		function checkIfOwned(userProfileData, bgRefs) {
			if (userProfileData.bgsOwned.includes(bgRefs[userProfileData.currentPosition].bgID)) {
				shopButtons.components.find(item => item.customId == "buy").label = "Owned";
				shopButtons.components.find(item => item.customId == "buy").disabled = true;
			} else {
				shopButtons.components.find(item => item.customId == "buy").label = "Buy";
				shopButtons.components.find(item => item.customId == "buy").disabled = false;
			}
		}

		function checkInStock(bgRefs, userProfileData) {
			if (bgRefs[userProfileData.currentPosition].bgAvailabilityInShop == 0) {
				shopButtons.components.find(item => item.customId == "buy").label = "Not Available";
				shopButtons.components.find(item => item.customId == "buy").disabled = true;
			} else {
				shopButtons.components.find(item => item.customId == "buy").label = "Buy";
				shopButtons.components.find(item => item.customId == "buy").disabled = false;
			}
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
		function create_acc_char(uniqueID, interaction, logChannel, playerformData, additionalData) {
			gameAccounts.create({
				account_id: uniqueID,
				account_user: interaction.user.tag,
				account_userID: interaction.user.id,
				account_last_session: `not_logged`,
				account_create_time: playerformData.starting_date,
				name: playerformData.stats.name,
				familyName: 0,
				origin: playerformData.stats.race,
				gender: playerformData.stats.gender,
				// age: String,
				citiesTravalledTo:{
					"1":true,
					"2":false,
					"3":false,
					"4":false,
					"5":false,
					"6":false,
					"7":false,
					"8":false,
					"9":false
				},
				stats: {
					maxHP: playerformData.stats.hp,
					maxMana: playerformData.stats.mana,
					maxStamina: playerformData.stats.stamina,
					hp: playerformData.stats.hp,
					mana: playerformData.stats.mana,
					stamina: playerformData.stats.stamina,

					attack: playerformData.stats.attack,
					power: playerformData.stats.power,
					defense: playerformData.stats.defense,
					intelligence: playerformData.stats.intelligence,
					endurance: playerformData.stats.endurance,
					agility: playerformData.stats.agility,
				}
			}, (err, res) => {
				if (err) {
					logChannel.send(`[Game-${additionalData.gameName}]: An error happened while creating a game Account doc:\n${err.stack.slice(0,1999)}`);
					return console.log(err);
				}
				if (res) {
					console.log(`${interaction.user.tag} created their account! Doc saved successfully!`);
				}
			});
		}
		function registerMenuCreationInterface(statPosition,stats,pointsSpent,additionalData) {
			let raceTypes = ['human','dwarf','goblin','orc','ogre','lizardman','giant','pixie','tengu']
            let name = `**Name**: ${stats.name}`
            let race = `**Origin**: ${raceTypes[stats.race.type] == undefined ? stats.race.type : raceTypes[stats.race.type]}`
            let gender = `**Gender**: ${stats.gender == 0 ? `Male`:`Female`}`

            let attack = `**Attack Damage**: ${stats.attack}`
            let power = `**Attack Power**: ${stats.power}`
            let defense = `**Defense**: ${stats.defense}`
            let intelligence = `**Intelligence**: ${stats.intelligence}`
            let endurance = `**Endurance**: ${stats.endurance}`
            let agility = `**Agility**: ${stats.agility}`
            //attack
            if(statPosition == 1) attack = "❯__"+attack+"__"
            if(pointsSpent.attack > 0) attack = attack+ ` + [${pointsSpent.attack}](http://www.google.com "Your Physical Damage")`
            
            //power
            if(statPosition == 2) power = "❯__"+power+"__"
            if(pointsSpent.power > 0) power = power + ` + [${pointsSpent.power}](http://www.google.com "Your Magical Damage")`
            
            //defense
            if(statPosition == 3) defense = "❯__"+defense+"__"
            if(pointsSpent.defense > 0) defense = defense + ` + [${pointsSpent.defense}](http://www.google.com "Your resistance to physical damage without armor. Simple terms: Makes your skin stronger against physical damage")`
            
            //intelligence
            if(statPosition == 4) intelligence = "❯__"+intelligence+"__"
            if(pointsSpent.intelligence > 0) intelligence = intelligence + ` + [${pointsSpent.intelligence}](http://www.google.com "Increase your Mana & magical power slightly.")`
            
            //endurance
            if(statPosition == 5) endurance = "❯__"+endurance+"__"
            if(pointsSpent.endurance > 0) endurance = endurance + ` + [${pointsSpent.endurance}](http://www.google.com "Increase your Health")`
            
            //agility
            if(statPosition == 6) agility = "❯__"+agility+"__"
            if(pointsSpent.agility > 0) agility = agility + ` + [${pointsSpent.agility}](http://www.google.com "Increase your Stamina & Speed slightly.")`
            
            let embed = new SharuruEmbed()
                .setAuthor(`Welcome to ${additionalData.gameName}'s Character Creation!`)
                .setDescription(`You have \`10\` points available to add in the **Stats Area**!
								Also please choose: Your name, Origin and Gender!
								*__(Failing to do so, would result in randomizing stats)__*

                                **Basic Info:**
                                - ${name}
                                - ${race}
                                - ${gender}

                                **Stats:**
                                - **\`Health: ${stats.hp}\`** [?](http://www.google.com "This stat can't be increased directly!")
                                - **\`Mana: ${stats.mana}\`** [?](http://www.google.com "This stat can't be increased directly!")
                                - **\`Stamina: ${stats.stamina}\`** [?](http://www.google.com "This stat can't be increased directly!")
                                - ${attack}
                                - ${power}
                                - ${defense}
                                - ${intelligence}
                                - ${endurance}
                                - ${agility}
                                
                                
                                Points Available: ${stats.available}
                                
								**Reminder:**
                                -> *The stat that is __underlined__ is the one currently selected!*
                            	`).setFooter(`Ver. ${additionalData.gameVersion}!`)

                return embed
        }
		/**
		 * 
		 * @param {String} userInput The input of the user.
		 * @param {[]} itemsList The items to check, based on condition, what the user input
		 * @param {String} condition The conditions to check for:
		 * 
		 * - 'includes' | id: 0 => checks if the user input is included in one of the following items in the "itemsList" array. Returns true/false
		 * - 'same' | id: 1=> checks if the user input is the same as one of the following items in the 'itemsList' array. Returns true/false
		 * - 'returnOne' | id: 2=> checks if the user input is in the array of items 'itemsList'. If yes, returns that item, otherwise null.
		 * @returns Results based on the condition.
		 */
		 function checkForItems(userInput,itemsList,condition) {
			if (userInput == null) return;
			if(userInput.length == 0 || itemsList.length == 0) return 0
			if(condition == 'includes' || condition == 0) {
				let notContain = false;
				for (const item of itemsList) {
					if(userInput.includes(item)) notContain = true;	
				}
				return notContain
			}
			if(condition == 'same' || condition == 1){
				let sameItem = false;
				sameLoop: for (let i = 0; i < itemsList.length; i++) {
					const item = itemsList[i].toLowerCase();
					if(userInput.toLowerCase() == item) {
						sameItem = true;
						break sameLoop;
					} 
				}
				return sameItem
			}
			if(condition == 'returnOne' || condition == 2) {
				sameLoop: for (let i = 0; i < itemsList.length; i++) {
					const item = itemsList[i];
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
		async function moveOnMap(direction,playerform, theMessage,myChan,msgEmbed) {
			let { x, y } = playerform.mapPosition
			let moveChances = [60,40]
			let playerMap = null;
			theMessage.first().delete()
			if(direction == 'up'){
				if(y >= 5) {
					myChan.send(`Going furthermore isn't good! Better remain here or go back...`)
					return
				}
				y += 1;
				if(x == 3 && y == 1) moveChances = [10,90]//malseade
				if(x == 3 && y == 2) moveChances = [5,95]//bewenwich
				if(x == 2 && y == 2) moveChances = [25,75]//gazion
				if(x == 1 && y == 2) moveChances = [35,65]//Ateshobury
				if(x == 3 && y == 3) moveChances = [20,80]//makinton
				if(x == 5 && y == 4) moveChances = [20,80]//skiptonz
				if(x == 3 && y == 4) moveChances = [20,80]//Bretleton
				if(x == 2 && y == 5) moveChances = [10,90]//oswesbuton
				if(x == 1 && y == 5) moveChances = [10,90]//gabing
				if(x == 3 && y == 5) moveChances = [100,1]//TEST ZONE 100% MOB
				moveChances = [0,100]
				console.log(`right above the thing: ${moveChances} (x:${x}, y:${y})`)
				let chanceToFight = percentageChance(['monster','nothing'],moveChances);
				console.log(chanceToFight)
				if(chanceToFight == 'monster'){
					//fight system
					// playerform.mapPosition.y += 1;
					playerMap = await createMap();
					// myChan.send(`You started your journey and you met a monster! What do you do?`, playerMap)
					
				}
				if(chanceToFight == 'nothing'){
					playerMap = await createMap();
					// myChan.send(``,playerMap)
					msgEmbed.setDescription(`You started your journey and advanced forward a bit. Luckily you didn't met any monsters on the way.`)
                	.setImage(`attachment://map.png`)//`https://media.discordapp.net/attachments/768885595228864513/828563686430867486/orburia.png`
				}
			}
			if(direction == 'down'){
				if(y <= 1) {
					myChan.send(`Going furthermore isn't good! Better remain here or go back...`)
					return
				}
				if(x == 3 && y == 1) moveChances = [10,90]//malseade
				if(x == 3 && y == 2) moveChances = [5,95]//bewenwich
				if(x == 2 && y == 2) moveChances = [25,75]//gazion
				if(x == 1 && y == 2) moveChances = [35,65]//Ateshobury
				if(x == 3 && y == 3) moveChances = [20,80]//makinton
				if(x == 5 && y == 4) moveChances = [20,80]//skiptonz
				if(x == 3 && y == 4) moveChances = [20,80]//Bretleton
				if(x == 2 && y == 5) moveChances = [10,90]//oswesbuton
				if(x == 1 && y == 5) moveChances = [10,90]//gabing
				// to do: movement up
				let chanceToFight = percentageChance(['monster','nothing'],moveChances);
				if(chanceToFight == 'monster'){
					//fight system
					playerform.mapPosition.y -= 1;
					const playerMap = await createMap();
					myChan.send(`You started your journey and you met a monster! What do you do? Your Position is now: x:${x}, y:${playerform.mapPosition.y}`,playerMap)
				}
				if(chanceToFight == 'nothing'){
					playerform.mapPosition.y -= 1;
					const playerMap = await createMap();
					myChan.send(`You started your journey and advanced forward a bit. Luckily you didn't met any monsters on the way. Your Position is now: x:${x}, y:${playerform.mapPosition.y}`,playerMap)
				}
			}
			if(direction == 'left'){
				if(x <= 1) {
					myChan.send(`Going furthermore isn't good! Better remain here or go back...`)
					return
				}
				if(x == 3 && y == 1) moveChances = [10,90]//malseade
				if(x == 3 && y == 2) moveChances = [5,95]//bewenwich
				if(x == 2 && y == 2) moveChances = [25,75]//gazion
				if(x == 1 && y == 2) moveChances = [35,65]//Ateshobury
				if(x == 3 && y == 3) moveChances = [20,80]//makinton
				if(x == 5 && y == 4) moveChances = [20,80]//skiptonz
				if(x == 3 && y == 4) moveChances = [20,80]//Bretleton
				if(x == 2 && y == 5) moveChances = [10,90]//oswesbuton
				if(x == 1 && y == 5) moveChances = [10,90]//gabing
				// to do: movement up
				let chanceToFight = percentageChance(['monster','nothing'],moveChances);
				console.log(chanceToFight)
				if(chanceToFight == 'monster'){
					//fight system
					playerform.mapPosition.x -= 1;
					const playerMap = await createMap();
					myChan.send(`You started your journey and you met a monster! What do you do? Your Position is now: x:${playerform.mapPosition.x}, y:${y}`,playerMap)
				}
				if(chanceToFight == 'nothing'){
					playerform.mapPosition.x -= 1;
					const playerMap = await createMap();
					myChan.send(`You started your journey and advanced forward a bit. Luckily you didn't met any monsters on the way. Your Position is now: x:${playerform.mapPosition.x}, y:${y}`,playerMap)
				}
			}
			if(direction == 'right'){
				if(x >= 5) {
					myChan.send(`Going furthermore isn't good! Better remain here or go back...`)
					return 
				}
				if(x == 3 && y == 1) moveChances = [10,90]//malseade
				if(x == 3 && y == 2) moveChances = [5,95]//bewenwich
				if(x == 2 && y == 2) moveChances = [25,75]//gazion
				if(x == 1 && y == 2) moveChances = [35,65]//Ateshobury
				if(x == 3 && y == 3) moveChances = [20,80]//makinton
				if(x == 5 && y == 4) moveChances = [20,80]//skiptonz
				if(x == 3 && y == 4) moveChances = [20,80]//Bretleton
				if(x == 2 && y == 5) moveChances = [10,90]//oswesbuton
				if(x == 1 && y == 5) moveChances = [10,90]//gabing
				let chanceToFight = percentageChance(['monster','nothing'],moveChances);
				console.log(chanceToFight)
				if(chanceToFight == 'monster'){
					//fight system
					playerform.mapPosition.x += 1;
					const playerMap = await createMap();
					myChan.send(`You started your journey and you met a monster! What do you do? Your Position is now: x:${playerform.mapPosition.x}, y:${y}`, playerMap)
				}
				if(chanceToFight == 'nothing'){
					playerform.mapPosition.x += 1;
					const playerMap = await createMap();
					myChan.send(`You started your journey and advanced forward a bit. Luckily you didn't met any monsters on the way. Your Position is now: x:${playerform.mapPosition.x}, y:${y}`, playerMap)
				}
			}
			// console.log(playerform.mapPosition)
			
                theMSG.edit({embeds: [msgEmbed],components: [mapButtons],files: [{
                    attachment: `${playerMap.url}`,
                    name: 'map.png',
                    description: 'Map of Orboria!'
                  }]
                })
		}
		async function createMap(playerform) {
			let playerGridPosition = {
				x: {
					1: 27,
					2: 150,
					3: 270,
					4: 395,
					5: 520,
				},
				y: {
					1: 525,
					2: 400,
					3: 260,
					4: 135,
					5: 10
				}
			};
			let playerIconPositionsMap = {
				x: playerGridPosition.x[playerform.mapPosition.x],
				y: playerGridPosition.y[playerform.mapPosition.y]
			};
			const canvas = createCanvas(615, 656);
			const ctx = canvas.getContext("2d");

			const background = await loadImage(`./src/Assets/game_files/game_maps/orburia_grid.png`);
			ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

			// playerIconPositionsMap.x = 
			// playerIconPositionsMap.y = 
			console.log(playerIconPositionsMap);
			const playerIcon = await loadImage(`./src/Assets/game_files/game_markers/player2.png`);
			ctx.drawImage(playerIcon, playerIconPositionsMap.x, playerIconPositionsMap.y, 73, 120);

			const playerMap = new MessageAttachment(canvas.toBuffer(), 'map.png');
			return playerMap;
		}
		function checkAvailability(time) {
			if (time == -1 || time == 0) return "Forever"
			// console.log(`nr: ${Number(time)}`)
			// console.log(`with bigint ${BigInt(time)}`)
			time = Number(time) *1000
			if (time > 0) return `${pms(time,{verbose: true})}`
		}
    }
}