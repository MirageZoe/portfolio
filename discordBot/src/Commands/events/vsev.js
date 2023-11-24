/* eslint-disable no-unused-vars */
const Command = require('../../Structures/Command.js');
const sendError = require('../../Models/Error');
const SharuruEmbed = require('../../Structures/SharuruEmbed')
const profileSys = require("../../Models/profiles")
const guildSettings = require("../../Models/GuildSettings")
const fs = require('fs');
const ms = require('ms');
const pms = require("pretty-ms")
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
const myNickGen = require("fantasy-name-generator");
const config = require("../../../config.json")
const _ = require("lodash")
const weaponsData = require("../../Assets/farmingShop/products.json");
const { sortBy } = require('lodash');

let confirmButtons = new ActionRowBuilder().addComponents(
	new ButtonBuilder()
	.setCustomId(`yes`)
	.setLabel(`CONFIRM`)
	.setStyle(ButtonStyle.Success),

	new ButtonBuilder()
	.setCustomId(`no`)
	.setLabel(`CANCEL`)
	.setStyle(ButtonStyle.Danger)
)

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'vsev',
			displaying: true,
			cooldown: 5000,
			description: 'versus event!',
			options: '~',
			usage: '~',
			example: '~',
			category: 'events',
			userPerms: [PermissionsBitField.Flags.SendMessages],
			SharuruPerms: [PermissionsBitField.Flags.SendMessages],
			args: false,
			guildOnly: true,
			staffRoleOnly: false,
			ownerOnly: false,
			roleDependable: '0', // not 0, either id or name
			allowTesters: false,
			aliases: ['versusevent','versusev','vsevent','versus','vs']
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
		const versusEventMap = this.client.versusEvent.get(1);
        const myUtils = this.client.utils;

		let amORpm;
		if (hrs >= 0 && hrs <= 12) {
			amORpm = 'AM';
		} else {
			amORpm = 'PM';
		}

		const redTeamName = `the Red Team`
		const blueTeamName = `the Blue Team`

		let eventEmbed = new SharuruEmbed()
			.setTitle(`Versus Event: Choose a side & win together with your team!`)
			.setColor(`LUMINOUS_VIVID_PINK`)
			.setFooter(`Requested by ${issuer.tag}`)

		if (args[0] == "test") {
			// let myperms = message.guild.me.permissions.toArray();
			// console.log(myperms)

			let newUpdate = new SharuruEmbed()
				.setColor("LUMINOUS_VIVID_PINK")
				.setAuthor(`Versus Event Update v1.1`)
				.addField(`[Fixes]`,`- The invasion of **Apples** should have ended by now. New fruits should grow now and allow you to give a higher damage to bosses!
- Now <@751129105348558988> should remember your new nickname and note it down. (in theory, otherwise another fix later.)`)
				.addField(config.extra.emptyField,config.extra.emptyField)
				.addField(`[Small Notice]`,`I've made another small command for you: \`${prefix}vs patchfix\` or \`${prefix}vs fix\`. Run it while u.`)
			console.log("DONE")
			rep({embeds: [newUpdate]})
			return;
		}

		if (!args[0] || args[0] == "help") {
			eventEmbed.setDescription(`You forgot to mention an option. If you're unclear, hover over "More Info" blue text and wait for the box to appear.\n
- select = [[More Info]](https://www.google.com "Allows you to change teams. You can choose only red and blue teams.")
- missions = [[More Info]](https://www.google.com "Shows a list of missions to do in order to receive tickets which allow you to pull one item at lottery!")
- stats = [[More Info]](https://www.google.com "A panel with statistics of you about how you perform so far in the event.")
- lottery = [[More Info]](https://www.google.com "A gacha machine like where u can draw for items to help you a bit in the event. Can draw up to 10 items at once.")
- inventory / inv = [[More Info]](https://www.google.com "Shows the weapons you have crafted at the moment.")
- craft = [[More Info]](https://www.google.com "It allows you to craft weapons using the harvested logs from the "farm" minigame")
- equip = [[More Info]](https://www.google.com "You can equip the weapons crafted to be able to shoot bosses! It allows you to equip as well a fruit to give more damage!")
- shoot = [[More Info]](https://www.google.com "Shoot the boss! :)")
- leaderboard / top = [[More Info]](https://www.google.com "Shows the leaderboard with top 20 people participating in the event!")


P.S: This event is linked with the \`farm\` minigame event so you might want to check that out as well since you're using the logs from there to make weapons in this event!
`)
			return rep({embeds: [eventEmbed]})
		}

		// select a team before using other commands
		if (args[0] == "select") {
			// if user doesn't type a team!
			if (!args[1]) {
				eventEmbed.setDescription(`Please **type** a team: \`red\` or \`blue\`!`)
				.setColor("RED")
				return rep({embeds: [eventEmbed]},"10s");
			}
			
			
			// if user doesn't type a correct team!
			if (!["red","blue"].includes(args[1].toLowerCase())) {
				eventEmbed.setDescription(`Please **choose** a team: \`red\` or \`blue\`!`)
				.setColor("RED")
				return rep({embeds: [eventEmbed]},"10s");
			}
			profileSys.findOne({
				userID: issuer.id
			},async(err,res)=>{
				if (err) {
					sendError.create({
						Guild_Name: message.guild.name,
						Guild_ID: message.guild.id,
						User: issuer.tag,
						UserID: issuer.id,
						Error: error,
						Time: `${TheDate} || ${clock} ${amORpm}`,
						Command: this.name + "- select command",
						Args: args,
					},async (err2, res) => {
						if(err2) {
							console.log(err2)
							logChannel.send(`[${this.name}-event-select-${TheDate}|${clock} ${amORpm}]: ${issuer} tried to use "select" subcommand of ${this.name} but failed:\n${err.stack}`)
							return message.channel.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
						}
						if(res) {
							console.log(`successfully added error to database!`)
						}
					})
				}
				if (res) { // found the guild

					// if player found, ask if they are sure they wanna switch teams
					// this meaning they will lose the damage done and heal back the boss the amount
					// they did & starting anew.
					if (!res.events.versus) {
						res.events.versus.team = "none";
						res.events.versus.damage = 0;
						res.events.versus.inventory = [];
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
						}
					}

					// if the user is in a team
					if (res.events.versus.team != "none") {

						// if the user specify the current team he's in 
						if (res.events.versus.team == args[1]) {
							eventEmbed.setDescription(`You're already in this team!`)
							return rep({embeds: [eventEmbed]},"10s")
						}

						//#region switch the teams
						eventEmbed.setDescription(`I see that you're already in ${res.events.versus.team == 'red' ? redTeamName : blueTeamName}. Are you sure you wanna switch the teams now?
By doing so, it will erase the progress you made so far, remove items (that you achieved so far) and possibly heal back the boss equal to the amount of damage you've done!`)
						.setFooter(`Requested by ${issuer.tag} | You have 1 min to answer this!`)
						let obj = {
							user: issuer.id,
							stage: "switchTeams",
							team: args[1].toLowerCase()
						}
						versusEventMap.confirmations.set(issuer.id,obj);
						// this.client.versusEvent.set(1,versusEventMap)
						return rep({embeds: [eventEmbed], components: [confirmButtons]},"60s")
						//#endregion
					}

					//#region if the player joins for the first time
					eventEmbed.setDescription(`Are you sure you wanna join ${args[1] == "red" ? redTeamName : blueTeamName}?\nEven after choosing now, you can still change teams later but you will face consequences for betraying your team!`)
					.setFooter(`Requested by ${issuer.tag} | You have 1 minute to choose!`)
					let obj = {
						user: issuer.id,
						stage: "chooseTeams",
						team: args[1].toLowerCase()
					}
					versusEventMap.confirmations.set(issuer.id,obj);
					// this.client.versusEvent.set(1,versusEventMap)
					return rep({embeds: [eventEmbed], components: [confirmButtons]},"60s")
					//#endregion
				}
			})
			return;
		}
		const eventSettings = {
			intervals: {
				bigBoss: [
					{
						starting: "11:30:00",
						ending: "12:30:00"
					},
					{
						starting: "23:30:00",
						ending: "00:30:00"
					},
				],
				miniBoss: [
					{
						starting: "03:30:00",
						ending: "04:30:00"
					},
					{
						starting: "09:30:00",
						ending: "10:30:00"
					},
					{
						starting: "15:30:00",
						ending: "16:30:00"
					},
					{
						starting: "21:30:00",
						ending: "22:30:00"
					},
				]
			},
			durations: {
				bigBoss : {
					min: 240,
					max: 480
				},
				miniBoss: {
					min: 120,
					max: 300
				}
			},
			chances: {
				bigBoss: 10,
				miniBoss: 25,
				increaseBy: 3
			}
		}
		//#region Embed Msgs
		let smallBossMessage = new SharuruEmbed()
		.setAuthor(`Versus Event: Choose a side & win together with your team!`)
		.setColor("LUMINOUS_VIVID_PINK")
		.setFooter(`Requested by ${issuer.tag}`)
		.setDescription(`Oh no! A Boss appeared out of nowhere! Quick, shoot the boss with your weapons and defend the channel!`)
		.setImage(`https://cdn.discordapp.com/attachments/769228052165033994/1010532759485292745/unknown.png`)

		let bigBossMessage = new SharuruEmbed()
			.setAuthor(`Versus Event: Choose a side & win together with your team!`)
			.setColor("LUMINOUS_VIVID_PINK")
			.setFooter(`Requested by ${issuer.tag}`)
			.setDescription(`Oh no! A Giant Boss appeared out of nowhere! Quick, shoot the boss with your weapons and defend the channel!`)
			.setImage(`https://cdn.discordapp.com/attachments/769228052165033994/1010199450007908515/unknown.png`)
		//#endregion
		// make sure player cannot play until they chose a side
		await profileSys.findOne({
			userID: issuer.id
		},async(err,res)=>{
			if (err) {
				sendError.create({
					Guild_Name: message.guild.name,
					Guild_ID: message.guild.id,
					User: issuer.tag,
					UserID: issuer.id,
					Error: error,
					Time: `${TheDate} || ${clock} ${amORpm}`,
					Command: this.name + "- checker VSEVENT if has team",
					Args: args,
				},async (err2, res) => {
					if(err2) {
						console.log(err2)
						logChannel.send(`[${this.name}-event-checker-${TheDate}|${clock} ${amORpm}]: I've tried to check if user (${issuer}) has a team selected before playing and got an error in \`${this.name}\`:\n${err.stack}`)
						return message.channel.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
					}
					if(res) {
						console.log(`successfully added error to database!`)
					}
				})
			}
			if (res) { // found the guild

				// if this event isn't set up properly in db
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

				// check if user has a team, otherwise don't allow to participate
				if (res.events.versus.team == "none") {
					eventEmbed.setDescription(`Hello,\n\nI see that you are trying to participate in the event but you didn't choose a single team yet!
Please choose a side by using the next command \`${prefix}vs select blue/red\` option!`)
					return rep({embeds: [eventEmbed]},"20s")
				}

				if (args[0] == "patchfix" || args[0] == "fix") {
					if (!res.events.versus.patchfix) {
						eventEmbed.setDescription(`There you go! I've delivered you about 1500 coins and 5 fruits for each type! Sowwy for the bugs!`)
						res.events.versus.patchfix = true;
						let userSVData = res.servers_data;
						let getThisServerData = userSVData.get(message.guild.id)
						getThisServerData.money += 1500;
						userSVData.set(message.guild.id,getThisServerData)
						res.servers_data = userSVData
						
						for (const [key, value] of Object.entries(res.farm.fruits)) {
							// console.log(`${key}: ${value.harvested + 5}`);
							value.harvested += 5;
						}
						res.save().catch(err2 => console.log(err2))
						logChannel.send(`${issuer} received their rewards!`)
						return rep({embeds: [eventEmbed]},"10s");
					} else {
						eventEmbed.setDescription(`You already collected the rewards for the bugs! Come back later if other major bugs were found! (not that will be, hopefully..)`)
						return rep({embeds: [eventEmbed]},"10s");
					}
				}

				if (args[0] == "missions" || args[0] == 'mission') {
					let races = ["cavePerson","dwarf","elf","human"]
					let getRandomNick = myNickGen.nameByRace(races[Math.floor(Math.random() * races.length)],{gender: Math.floor(Math.random() * 2) == 0 ? "male" : "female"})
					let poolMissions = [
						{
							id: 1,
							name: "React Message!",
							description: `React to a random message that I've sent in a channel!`,
							reward: 1,
							perDay: 10,
							completed: false,
							finished: 0
						},
						{
							id: 2,
							name: "Lottery Time!",
							description: `Try your luck in lottery and hope that u win something amazing!`,
							reward: 1,
							perDay: 1,
							completed: false,
							finished: 0
						},
						{
							id: 3,
							name: `New Persona!`,
							description: `Change your Nickname to "`,
							reward: 1,
							perDay: 1,
							completed: false,
							finished: 0
						},
						{
							id: 4,
							name: "Lucky coin!",
							description: `Play Coinflip minigame!`,
							reward: 1,
							perDay: 3,
							completed: false,
							finished: 0
						},
						{
							id: 5,
							name: `Daily income.`,
							description: `Use the command \`${prefix}wallet daily\`!`,
							reward: 5,
							perDay: 1,
							completed: false,
							finished: 0
						},
						{
							id: 6,
							name: `Best intuition??!`,
							description: `Play "Guess the dice!" minigame!`,
							reward: 1,
							perDay: 5,
							completed: false,
							finished: 0
						},
						// {
						// 	id: 7,
						// 	name: "testMission",
						// 	description: `test desc`,
						// 	damage: 1,
						// 	perDay: 1,
						// 	completed: false,
						// 	finished: 0
						// }
					]

					let poolSpecialMissions = [
						{
							id: 30,
							name: `Get them all!`,
							description: `This is the reward for completing all the daily missions! 5 Free tickets to draw!!`,
							reward: 5,
							completed: false,
							finished: 0,
							perDay: poolMissions.length
						}
					]

					profileSys.findOne({
						userID: issuer.id
					},async (err,res) =>{
						if(err){
							sendError.create({
							Guild_Name: message.guild.name,
							Guild_ID: message.guild.id,
							User: issuer.tag,
							UserID: issuer.id,
							Error: err,
							Time: `${TheDate} || ${clock} ${amORpm}`,
							Command: this.name + " - missions",
							Args: args,
						},async (err, res) => {
							if(err) {
								console.log(err)
								return message.channel.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
							}
							if(res) {
								console.log(`successfully added error to database!`)
							}
						})
						}
						if (res) {
							//set up the info if it's non-existing
							if (!res.events.versus.missions) {
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
								}
								console.log(`[VersusEvent-mission]: set the default settings for versus event to ${issuer.tag}`)
							}
							let missionDisplay = `These are the missions to complete and receive free tickets to draw in "Loitte":\n[Hover me](https://www.google.com "1)React to any message you didn't before to complete mission 1. By reacting to the same message after unreacting will not count towards completion!\n2) You don't need to win at minigames to complete mission 4 or 6.\n3) The missions reset the next day at mightnight, server timezone (hosted one)!") for more info!`
							let specialMissionDisplay = ``
							let versusMissionsData = res.events.versus.missions
							let currentDate = new Date();
							let missionsDone = 0;
							// currentDate.setDate(11);
							//#region set mission (and special) if new
							if (versusMissionsData.list.length == 0) {
								//get the mission with nick and set the nickname
								let mod = poolMissions.find(item => item.id == 3)
								const backup = mod.description
								mod.description += `${getRandomNick}"!`
								versusMissionsData.list = poolMissions
								mod.description = backup
								console.log(`setting: ${mod.description}`)
								console.log(`[VersusEvent-mission]: set the missions to ${issuer.tag} bcs it was null LIST`)
							}
							if (versusMissionsData.sml.length == 0) {
								versusMissionsData.sml = poolSpecialMissions
								console.log(`[VersusEvent-mission]: set the special missions to ${issuer.tag} bcs it was null LIST`)
							}
							//#endregion

							// reset missions and nickname if new day
							if (res.events.versus.missions.lastCompletion.day != currentDate.getDate()) {
								console.log(`since the date in db "${res.events.versus.missions.lastCompletion.day}" doesn't match the current day "${currentDate.getDate()}", new nick set! ${getRandomNick}`)
								res.events.versus.missions.nickname = getRandomNick;
								res.events.versus.missions.lastCompletion.day = currentDate.getDate()
								res.events.versus.missions.lastCompletion.month = currentDate.getMonth()

								for (let i = 0; i < versusMissionsData.list.length; i++) {
									let element = versusMissionsData.list[i];
									
									element.completed = false;
									element.finished = 0;
									console.log(`[VersusEvent-mission]: I've reseted "${element.name}" mission for ${issuer.tag}`)
								}
								versusMissionsData.sml[0].completed = false;
							}

							//#region Verify that all missions (normal) are up to date!
							for (let i = 0; i < versusMissionsData.list.length; i++) {

								// defining the checklist; all must be true to continue the command, otherwise rewrite the mission with the updated one
								let nameOK = false;
								let descriptionOK = false;
								let rewardOK = false;
								let perDayOK = false;

								// get reference of the mission from player and compare our pool of misisons
								let missionFromPool = poolMissions.find(item => item.id == versusMissionsData.list[i].id)
								console.log(`[VersusEvent-mission]: Checking item-mission (ID: ${versusMissionsData.list[i].id}) of ${issuer.tag}`)
								
								// if no reference found, delete and continue to the next mission
								if (!missionFromPool) {
									console.log(`[VersusEvent-mission]: No relevant reference, Deleted mission (ID: ${versusMissionsData.list[i].id}) from ${issuer.tag}`)
									versusMissionsData.list.splice(i,1);
									continue;
								}

								if (versusMissionsData.list[i].id == 3) {// if it's the nickname mission, make sure to not modify with the new one until it's completed
									if (versusMissionsData.list[i].name == missionFromPool.name) nameOK = true;
									if (versusMissionsData.list[i].description == missionFromPool.description+`${versusMissionsData.nickname}"!`) descriptionOK = true;
									// console.log(`verifying up:\n1: ${versusMissionsData.list[i].description}\n2: ${missionFromPool.description+`${versusMissionsData.nickname}"!`}`)
									if (versusMissionsData.list[i].reward == missionFromPool.reward) rewardOK = true;
									if (versusMissionsData.list[i].perDay == missionFromPool.perDay) perDayOK = true;

									if (!nameOK || !descriptionOK || !rewardOK || !perDayOK) {
										versusMissionsData.list[i].name = missionFromPool.name;
										versusMissionsData.list[i].description = missionFromPool.description+`${getRandomNick}"!`;
										versusMissionsData.list[i].reward = missionFromPool.reward;
										versusMissionsData.list[i].perDay = missionFromPool.perDay;
										// console.log(`[VersusEvent-mission]: updated a mission nick (ID: ${missionFromPool.id}) to ${issuer.tag} (nameok: ${nameOK} | desc: ${descriptionOK} | reward: ${rewardOK} | perday: ${perDayOK})`)//\nData:\n\nn:${nameOK}\nd:${descriptionOK}\ndmg:${rewardOK}\nperday: ${perDayOK}
									}
									// verify if all missions are done for final mission:
									if (versusMissionsData.list[i].completed == true) 
										missionsDone ++;
									// console.log(`MISSION ${versusMissionsData.list[i].id}: ${versusMissionsData.list[i].completed}`)
									versusMissionsData.sml[0].finished = missionsDone;
									// if all missions done, check the final mission!
									if (missionsDone == poolMissions.length)
										versusMissionsData.sml[0].completed = true
									continue;
								}

								// verify the integrity of the mission
								if (versusMissionsData.list[i].name == missionFromPool.name) nameOK = true;
								if (versusMissionsData.list[i].description == missionFromPool.description) descriptionOK = true;
								if (versusMissionsData.list[i].reward == missionFromPool.reward) rewardOK = true;
								if (versusMissionsData.list[i].perDay == missionFromPool.perDay) perDayOK = true;


								// if the integrity doesn't match, we update
								if (!nameOK || !descriptionOK || !rewardOK || !perDayOK) {
									versusMissionsData.list[i].name = missionFromPool.name;
									versusMissionsData.list[i].description = missionFromPool.description;
									versusMissionsData.list[i].reward = missionFromPool.reward;
									versusMissionsData.list[i].perDay = missionFromPool.perDay;
									console.log(`[VersusEvent-mission]: updated a mission (ID: ${missionFromPool.id}) to ${issuer.tag}`)//\nData:\n\nn:${nameOK}\nd:${descriptionOK}\ndmg:${rewardOK}\nperday: ${perDayOK}
								}
								
								// verify if all missions are done for final mission:
								if (versusMissionsData.list[i].completed == true) 
									missionsDone ++;
									// console.log(`MISSION ${versusMissionsData.list[i].id}: ${versusMissionsData.list[i].completed}`)
								versusMissionsData.sml[0].finished = missionsDone;
								
							}
							// console.log(`Special missions completed: ${missionsDone}`)
							
							// if all missions done, give reward and end this
							if (missionsDone == poolMissions.length) {
								versusMissionsData.sml[0].completed = true
								res.events.versus.tickets += versusMissionsData.sml[0].reward;
								console.log(`[VersusEvent-mission]: ${issuer.tag} completed all missions, giving ${versusMissionsData.sml[0].reward} tickets reward`)
							}

							//#region if there are new missions in our pool and  not at the player, add them
							let poolMissionsIds= poolMissions.map(item => item.id)
							let playerMissionsIds= versusMissionsData.list.map(item => item.id)
							let diff = poolMissionsIds.filter(x => !playerMissionsIds.includes(x))
							// console.log(versusMissionsData.list.map(it => it.id))

							if (diff.length > 0) 
								for (let j = 0; j < diff.length; j++) {
									let getNewMission = poolMissions.find(item => item.id == diff[j])
									versusMissionsData.list.push(getNewMission)
									console.log(`[VersusEvent-mission]: Added a new mission (ID: ${diff[j]}) to ${issuer.tag}`)
								}
								// console.log(versusMissionsData.list.map(it => it.id))
							//#endregion
							
							//#region special missions verifying system
							for (let i = 0; i < versusMissionsData.sml.length; i++) {
								let nameOK = false;
								let descriptionOK = false;
								let rewardOK = false;
								let todo = false;
								let missionFromPool = poolSpecialMissions.find(item => item.id == versusMissionsData.sml[i].id)
								console.log(`[VersusEvent-mission]: Checking item-mission-special (ID: ${versusMissionsData.sml[i].id}) of ${issuer.tag}`)
								if (!missionFromPool) {
									versusMissionsData.sml.splice(i,1);
									console.log(`[VersusEvent-mission]: deleted a special mission (ID: ${versusMissionsData.sml[i].id}) from ${issuer.tag}`)
									continue;
								}
								if (versusMissionsData.sml[i].name == missionFromPool.name) nameOK = true;
								if (versusMissionsData.sml[i].description == missionFromPool.description) descriptionOK = true;
								if (versusMissionsData.sml[i].reward == missionFromPool.reward) rewardOK = true;
								if (versusMissionsData.sml[i].todo == missionFromPool.todo) todo = true;

								if (!nameOK || !descriptionOK || !rewardOK || !todo) {
									versusMissionsData.sml[i].name = missionFromPool.name;
									versusMissionsData.sml[i].description = missionFromPool.description;
									versusMissionsData.sml[i].reward = missionFromPool.reward;
									versusMissionsData.sml[i].todo = missionFromPool.todo;
									console.log(`[VersusEvent-mission]: updated a special mission (ID: ${missionFromPool.id}) to ${issuer.tag}`)//\nData:\n\nn:${nameOK}\nd:${descriptionOK}\ndmg:${rewardOK}\ntodo: ${todo}
								}
							}
							// if there are new special missions in our pool and  not at the player, add them
							let specialMissionsIds= poolSpecialMissions.map(item => item.id)
							let playerSpecialMissionsIds= versusMissionsData.sml.map(item => item.id)
							let diff2 = playerSpecialMissionsIds.filter(x => !specialMissionsIds.includes(x))

							if (diff2.length > 0) 
								for (let j = 0; j < diff2.length; j++) {
									let getNewMission = poolSpecialMissions.find(item => item.id == diff[j])
									versusMissionsData.sml.push(getNewMission)
									console.log(`[VersusEvent-mission]: Added a new special mission (ID: ${diff[j]}) to ${issuer.tag}`)
								}
							//#endregion
							//#endregion
							
							profileSys.updateOne({
								'userID': `${issuer.id}`
							},{'$set':{ 'events.versus.missions' : versusMissionsData}},(erro,reso)=>{
								if (erro) {
									sendError.create({
										Guild_Name: message.guild.name,
										Guild_ID: message.guild.id,
										User: message.user.username,
										UserID: message.user.id,
										Error: erro,
										Time: `${TheDate} || ${clock} ${amORpm}`,
										Command: this.name + `, update vsEV MISSION LIST `,
										Args: args,
									},async (errr, ress) => {
										if(errr) {
											console.log(errr)
											return logChannel.send(`[${this.name}]: Unfortunately an problem appeared while trying to save data of an user in VERSUS EVENT COMMMAND- MISSIONS. Please try again later. If this problem persist, contact my partner!`)
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
							res.save().catch(err => console.log(err))
							for (let i = 0; i < versusMissionsData.list.length; i++) {
								missionDisplay += `
		\n**${i+1}) *${versusMissionsData.list[i].name}***\n**Objective:** *${versusMissionsData.list[i].description}*\n**Times left:** ${versusMissionsData.list[i].completed == true ? `__***[Completed!](https://www.google.com " Congrats, you have completed this mission!")***__` : `**\`${versusMissionsData.list[i].finished}/${versusMissionsData.list[i].perDay}\`**`}`
							}
							for (let i = 0; i < versusMissionsData.sml.length; i++) {
								specialMissionDisplay += `
		\n**${i+1}) *${versusMissionsData.sml[i].name}***\n**Objective:** *${versusMissionsData.sml[i].description}*\n**Times left:** ${versusMissionsData.sml[i].completed == true ? `__***[Completed!](https://www.google.com " Congrats, you have completed this mission!")***__` : `**\`${versusMissionsData.sml[i].finished}/${versusMissionsData.sml[i].perDay}\`**`}`
							}
							eventEmbed.setDescription(missionDisplay)
							.addFields([
								{name: config.extra.emptyField,value: config.extra.emptyField ,inline: false},
								{name: `Complete all the missions above and you will be able to complete the special mission below:`,
								value: specialMissionDisplay,inline: false},
							])

							return rep({embeds: [eventEmbed]})
						}
					})
					return;
				}

				if (args[0] == "stats") {
					profileSys.findOne({
						userID: issuer.id
					},async (err,res) =>{
						if(err){
							sendError.create({
							Guild_Name: message.guild.name,
							Guild_ID: message.guild.id,
							User: issuer.tag,
							UserID: issuer.id,
							Error: err,
							Time: `${TheDate} || ${clock} ${amORpm}`,
							Command: this.name + " - missions",
							Args: args,
						},async (err, res) => {
							if(err) {
								console.log(err)
								return message.channel.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
							}
							if(res) {
								console.log(`successfully added error to database!`)
							}
						})
						}

						if (res) {
							// console.log(`dur base: ${weaponsData.trees.find(item => item.id == res.events.versus.weaponHold).durability}`)
							// console.log(weaponCondition(res.events.versus.weaponDurability,weaponsData.trees.find(item => item.id == res.events.versus.weaponHold).durability))
							let weaponHoldDATA = res.events.versus.inventory.weapons.find(item => item.id == res.events.versus.weaponHold) ?? 0
							let weaponFruitDATA = weaponsData.fruits.find(item => item.id == res.events.versus.weaponFruitAdded) ?? 0
							eventEmbed.setDescription(`Below are all info about you in this event:`)
							.addFields([
								{name: `Your team:`,value: `${res.events.versus.team}`, inline: true},
								{name: `Your damage:`,value: `${res.events.versus.damage}`, inline: true},
								{name: `Your inventory:`,value: `- Small/Medium/Large/Special bombs [[Info]](https://www.google.com "Showing only bombs won from lottery. If u wanna see the weapons you own, please use ${prefix}vs inventory"): ${res.events.versus.inventory.items.small_bomb}/${res.events.versus.inventory.items.medium_bomb}/${res.events.versus.inventory.items.large_bomb}/${res.events.versus.inventory.items.special_bomb}`, inline: false},
								{name: `Missions completed so far:`,value: `${res.events.versus.missions.completedM}`, inline: false},
								{name: config.extra.emptyField,value:config.extra.emptyField,inline:false},
								{name: `Equipped Weapon:`,value: `${res.events.versus.weaponHold == 0 ? `None` : weaponsData.trees.find(item => item.id == res.events.versus.weaponHold).weaponHoldName}`,inline: true},
								{name: `Equipped Weapon Condition:`,value: res.events.versus.weaponHold == 0 ? `Please select a weapon first!` : `\n${weaponCondition(weaponHoldDATA.durability,weaponHoldDATA.baseDurability)}`,inline: true},
								{name: `Does it have added fruits?`,value: `${res.events.versus.weaponFruitAdded == 0 ? `No` : `Yes, a(n) *__${weaponFruitDATA.name}__* was added${res.farm.fruits[weaponFruitDATA.nameId].harvested > 0 ? "!" : ` last time but you ran out of them! Switch to a new fruit!`}`}`}
							])
							return rep({embeds: [eventEmbed]})
						}
					})
					
				}

				if (args[0] == "lottery" || args[0] == "pull") {
					let items_Pool = [
						{
							id: 500,
							name: "Small Bomb",
							damage: 500,
							description: "A safe and lightweight bomb! Easy to throw!",
							hitChance: 100,
							dropChance: 25
						},
						{
							id: 501,
							name: "Medium Bomb",
							damage: 1250,
							description: "A larger bomb than the small bomb & packs more damage! While it's also packing more damage, it also requires more time to aim and hit.",
							hitChance: 75,
							dropChance: 15
						},
						{
							id: 502,
							name: "Large Bomb",
							damage: 1975,
							description: "A very large and heavy bomb! ",
							hitChance: 40,
							dropChance: 5
						},
						{
							id: 503,
							name: "Special Bomb!",
							damage: 5000,
							description: "A special and very unstable, heavy bomb! It's heavy as hell and can possibly even explode in your hand but if u manage to hit it, it will be a blaaaast!!",
							hitChance: 10,
							dropChance: 0.689
						},
						{
							id: 504,
							name: "Nothing! Thank you for participation!",
							damage: 0,
							description: "Thank you for participation!",
							hitChance: 0,
							dropChance: 40
						},
						{
							id: 505,
							name: "Bundle: Random Fruits Pack #1",
							damage: 0,
							description: "Congrats! You won a pack of random fruits!",
							hitChance: 0,
							dropChance: 20
						},
						{
							id: 506,
							name: "Bundle: Random Fruits Pack #2",
							damage: 0,
							description: "Congrats! You won a pack of random fruits!",
							hitChance: 0,
							dropChance: 20
						},
						{
							id: 507,
							name: "Bundle: faster, Faster, FASTER!!!",
							damage: 0,
							description: "Congrats! You won a bundle of solutions that help your farm grow faster!",
							hitChance: 0,
							dropChance: 10
						}
					]
					let itemsID = []
					let itemChances = []
					let itemsPulled = []
					

					profileSys.findOne({
						userID: issuer.id
					},(err,res) => {
						if (err) {
							sendError.create({
								Guild_Name: message.guild.name,
								Guild_ID: message.guild.id,
								User: issuer.tag,
								UserID: issuer.id,
								Error: err,
								Time: `${TheDate} || ${clock} ${amORpm}`,
								Command: this.name + "- lottery option",
								Args: args,
							},async (err2, res) => {
								if(err2) {
									console.log(err2)
									logChannel.send(`[${this.name}-PLAYER-LOTTERY-${TheDate}|${clock} ${amORpm}]: I've tried to pull for items at (${issuer}) request but got an error in \`${this.name}\`:\n${err.stack}`)
									return message.channel.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
								}
								if(res) {
									console.log(`successfully added error to database!`)
								}
							})
						}
						if (res) {

							//#region pull process
							let embedItem = new SharuruEmbed()
								.setColor(`LUMINOUS_VIVID_PINK`)
								.setAuthor(`Requested by ${issuer.tag}`)

							// multiple draws
							if (!args[1]) args[1] = 1
							// make sure to type a valid number
							if (isNaN(args[1])) {
								embedItem.setDescription(`Please type a number!`)
								return rep({embeds: [embedItem]},"5s")
							}
							let numberUser = Number(args[1])

							// make sure it's above 0
							if (numberUser <= 0) {
								embedItem.setDescription(`Please type a number that's equal or higher than 1 for multiple draws.`)
								return rep({embeds: [embedItem]},"5s")
							}
							
							// check if user has enough tickets to run this
							if (res.events.versus.tickets < numberUser) {
								embedItem.setDescription(`You do not own enough tickets to draw! You need about **${numberUser - res.events.versus.tickets}** more tickets to draw **${numberUser}** times!.`)
								return rep({embeds: [embedItem]},"8s")
							}
							
							// limit user to 10 draws at once
							if (numberUser > 10) {
								embedItem.setDescription(`You can draw up to 10 times at once!`)
								return rep({embeds: [embedItem]},"5s")
							}

							res.events.versus.tickets -= numberUser

							for (let i = 0; i < items_Pool.length; i++) {
								const element = items_Pool[i];
								itemsID.push(element.id)
								itemChances.push(element.dropChance)
							}
							for (let i = 0; i < numberUser; i++) {
								let randomDraw = percentageChance(itemsID,itemChances)
								let getItemData = items_Pool.find(item => item.id == randomDraw)
								itemsPulled.push(getItemData)
							}
							//#endregion

							// PROCESS THE PULLS
							for (let i = 0; i < itemsPulled.length; i++) {
								const element = itemsPulled[i];
								console.log(`trying to execute for id ${element.id}`)

								// if they get small/medium/large/special bomb
								if (element.id == 500) res.events.versus.inventory.items.small_bomb++
								if (element.id == 501) res.events.versus.inventory.items.medium_bomb++
								if (element.id == 502) res.events.versus.inventory.items.large_bomb++
								if (element.id == 503) res.events.versus.inventory.items.special_bomb++

								// bundle fruits 1
								if (element.id == 505) {
									let fruits = ['apple','orange','banana','cherries']
									let randomAmount =getRandomInt(2,5)
									for (let i = 0; i < randomAmount; i++) {
										let randomFruit = percentageChance(fruits,[45,35,30,25])
										console.log(`505: dropped ${randomFruit}`)
										res.farm.fruits[randomFruit].seeds++
									}
								}

								// bundle fruits 2
								if (element.id == 506) {
									let fruits = ['grapes','kiwi','lemon','peach']
									let randomAmount =getRandomInt(1,3)
									for (let i = 0; i < randomAmount; i++) {
										let randomFruit = percentageChance(fruits,[15,10,5,2.5])
										console.log(`506: dropped ${randomFruit}`)
										res.farm.fruits[randomFruit].seeds++
									}
								}

								// solutions for faster grow
								if (element.id == 507) {
									res.farm.tools.solution30++
									res.farm.tools.solution60++
									res.farm.tools.solution90++
								}
							}

							//#region give ticket

							let eventData = res.events.versus;
							let getMissionData = eventData.missions.list.find(item => item.id == 2) // lottery mission

							if (getMissionData.completed == true) return console.log(`[Versus Event-Play Lottery # ${TheDate}-${clock} ${amORpm}]: User ${issuer.username} (${issuer.id}) has completed this mission already!`)

							getMissionData.finished++;// add +1 to finished
							eventData.tickets += getMissionData.reward
							console.log(`[Versus Event-Play Lottery # ${TheDate}-${clock} ${amORpm}]: User ${issuer.username} (${issuer.id}) played lottery ${getMissionData.finished}/${getMissionData.perDay}`)
							if (getMissionData.finished >= getMissionData.perDay) getMissionData.completed = true;

							// replace data
							for (let i = 0; i < eventData.missions.list.length; i++) {
								if (eventData.missions.list[i].id == 2)
								eventData.missions.list[i] = getMissionData
							}
							res.events.versus = eventData
							//#endregion

							res.save().catch(err => console.log(err))
							eventEmbed.setDescription(`Congrats! You have got the following item(s):\n-${itemsPulled.map(item => item.name).join(";\n -")}`)
							return rep({embeds: [eventEmbed]},"25s")
						}
					})
				}

				//#region not a command
				if (args[0] == "ev") {

					/** IDEA:
					 * 
					 * There will be a timer that will check every 1 minute if the current time is within the range of bosses time
					 * if time is right, select 1 of the channels from the array and send a message which the boss appeared
					 * then players will be able to use the command "shoot" to hit the boss. It will affect only the one that has been spawned
					 * in that channel.
					 * 
					 * Notice: 
					 * 
					 * - The bosses cannot spawn over others, once a channel is taken, it will choose the next one. if there isn't  any free
					 * channels, it will wait until the next check to spawn the next one.
					 * 
					 * - If the boss wasn't killed, it will disappear and update the limit of the boss
					 * 
					 * - if the boss was killed, reset his hp and free the channel for the next update
					 */

					//#region Event Settings 
					
					let crtDate = new Date()
					console.log(`Current date: ${crtDate.getHours()}:${crtDate.getMinutes()}`)
					//#endregion
					
					

					//=====================================================================
					//=====================================================================
					// to fix: stop spawning in the same damn fricking channel ==== DONE PROBABLY
					// TO DO: TEST THIS SHIT
					//=====================================================================
					//=====================================================================


					guildSettings.find({},async(err,res) =>{
						if (err) {
							sendError.create({
								Guild_Name: `Can't retrieve guildName because it's in error  from the event.`,
								Guild_ID:  `Can't retrieve guildID because it's in error  from the event.`,
								User: `Can't retrieve user because it's in error  from the event.`,
								UserID: `Can't retrieve userid because it's in error  from the event.`,
								Error: err,
								Time: `${TheDate} || ${clock} ${amORpm}`,
								Command: `multi system => one time startup system- VSEVENT`,
								Args: `Can't retrieve args because it's in error  from the event.`,
							},async (err, res) => {
								if(err) {
									console.log(err)
								}
								if(res) {
									console.log(`successfully added error to database from multi system!`)    
								}
							})
						}
						if (Date.now() > config.event_dates.vs_end) return console.log(`[VSEVENT-event]: The event is over! Not setting up anymore the spawners! (multisystem.js)!`)

						for (const guildDOC of res) {
							//if settings isn't set up
							if (!guildDOC.events.versus.settings) {
								guildDOC.events.versus.settings = eventSettings
								console.log(`[VSEVENT - multisystem.jsb]: Set up guild ${guildDOC.Guild_Name} (${guildDOC.ID}) the versus settings! Skipping to next`)
								guildDOC.save().catch(err => console.log(err))
								return;
							}

							if (guildDOC.events.versus.enabled == false) {
								console.log(`[VSEVENT-multisystem.js]: Event on server ${guildDOC.Guild_Name} (${guildDOC.ID}) is disabled!`)
								continue;
							}
							console.log(`[VSEVENT]: Enabling VS Event for "${guildDOC.Guild_Name}"" server.`)
							let timerEvent = setInterval(async () => {
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
								
								// for searching each date set 
								for (const timeObj of guildDOC.events.versus.settings.intervals.bigBoss) {
									let temptime = new Date(2022,7,23,11,30,"00")
									let dt = new Date();//current Date that gives us current Time also
					
									let s =  timeObj.starting.split(':');
									let dt1 = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), parseInt(s[0]), parseInt(s[1]), parseInt(s[2]));
					
									let e =  timeObj.ending.split(':');
									let dt2 = new Date(dt.getFullYear(), dt.getMonth(),	dt.getDate(), parseInt(e[0]), parseInt(e[1]), parseInt(e[2]));
					
									if (dt >= dt1 && dt <= dt2) // if it's 
										console.log('[VSEV-EVENT]: Time to spawn a boss...',timeObj)
									else {
										console.log(`[VSEV-EVENT]: Can't spawn a boss bcs not right time `,timeObj)
										continue;
									}
									
									// creating channel variables
									let channelsToSpawn = guildDOC.events.versus.channels
									let freeChannels = []
			
									// console.log(`channels in DB:`,channelsToSpawn)
			
									// generating chances to spawn and checking with the current amount
									let getDataFromMaps = versusEventMap.chances.get(guildDOC.ID)
									if (!getDataFromMaps) getDataFromMaps = 0
									let chanceToSpawn = percentageChance(["yes","no"],[guildDOC.events.versus.settings.chances.bigBoss+getDataFromMaps,100-(guildDOC.events.versus.settings.chances.bigBoss+getDataFromMaps)])
			
									// if we spawn, we reset the bonus chance to spawn to 0 in chances and spawn the boss in a random channel. otherwise increase chance
									if (chanceToSpawn == "no") {
										getDataFromMaps += guildDOC.events.versus.settings.chances.increaseBy
										versusEventMap.chances.set(guildDOC.ID,getDataFromMaps)
										return console.log(`[VSEVENT-SPAWN MACHINE]: not spawning, increased chance to ${getDataFromMaps}% (${guildDOC.events.versus.settings.chances.bigBoss+getDataFromMaps}% total)`)
									}
									if (chanceToSpawn == "yes") {
										getDataFromMaps = 0
										console.log(`[VSEVENT]: This should be resetted but left for debugging!!! DO NOT FORGET TO SET THE CHANCE TO 0 AFTER GETTING GREENLIGHT\n`)
										versusEventMap.chances.set(guildDOC.ID,getDataFromMaps) // maybe it saves or not
										// this.client.versusEvent.set(1,versusEventMap)
									}
			
									//#region check if there is already a boss spawned. This way we do not spawn big bosses/more minibosses than require (1 bigboss, 4 mini)
									let maxAllowed = 1
									let maxFound = 0
									let maxAllowedHIT = false;
									for(let [key, value] of versusEventMap.spawns) {
										if (value.bossType == "bigBoss") {
											maxFound++;
											console.log(`[VSEVENT]: Found a big boss type spawned in ${key} channel!`)
										}
										if (maxFound == maxAllowed) {
											maxAllowedHIT = true;
											break;
										}
									}
			
									if (maxAllowedHIT == true) {
										console.log(`[VSEVENT]: MaxAllowedHIT is on, not spawning anymore! Next!\n`)
										continue;
									};
									//#endregion

									// if we have 1 ch only, use that and get to the chances
									if (channelsToSpawn.length == 1) {
										//  if the channel is in use, return; Continue otherwise.		
										if (versusEventMap.spawns.get(channelsToSpawn[0]) != undefined) return;
										let objBoss = {
											bossType: "bigBoss",
											start_time: Date.now(),
											end_time: Date.now() + randomEndTime * 1000,
											red: 0,
											blue: 0
										}
										versusEventMap.spawns.set(channelsToSpawn[0],objBoss)
										this.client.versusEvent.set(1,versusEventMap)
										let msgSent = await this.client.guilds.cache.get(guildDOC.ID).channels.cache.get(channelsToSpawn[0]).send({embeds: [bigBossMessage]})
										console.log(`found a single channel`)
										setTimeout(() => {
										
											// what we do here:
											// save the data in the server doc and end the boss spawn.
											let getBossData = versusEventMap.spawns.get(randomSelectedChannel)
				
											guildDOC.events.versus.red.damage.total += getBossData.red
											guildDOC.events.versus.blue.damage.total += getBossData.blue
				
											versusEventMap.spawns.delete(channelsToSpawn[0])
											console.log(`[VSEVENT]: Deleted Bigboss for channel ${channelsToSpawn[0]}`)
											guildDOC.save().catch(err => console.log(err))
											msgSent.delete()
			
										}, randomEndTime* 1000);
										return;
									}
			
									// if more than 1, add the free ones in the new array "freeChannels"
									for (let i = 0; i < channelsToSpawn.length; i++) {
										if (versusEventMap.spawns.get(channelsToSpawn[i]) == undefined) {
											freeChannels.push(channelsToSpawn[i])
											console.log(`found free channel: ${channelsToSpawn[i]}`)
										}
									}
									
									// if there is no channel left, return
									if (freeChannels.length == 0) {
										console.log(`[VSEV-EVENT]: Can't find free channels to spawn.`)
										return;
									};
									console.log(`found multiple channels`)
									// let randomSelectedChannel = freeChannels[0]
									// if (freeChannels.length > 1)
									let randomSelectedChannel = freeChannels[Math.floor(Math.random() * freeChannels.length)];
									let randomEndTime = getRandomInt(guildDOC.events.versus.settings.durations.bigBoss.min,guildDOC.events.versus.settings.durations.bigBoss.max)
									let objBoss = {
										bossType: "bigBoss",
										start_time: Date.now(),
										end_time: Date.now() + randomEndTime * 1000,
										red: 0,
										blue: 0
									}
									versusEventMap.spawns.set(randomSelectedChannel,objBoss)
									console.log(`[VSEVENT-SPAWNMACHINE]: Spawned a big boss that last ${pms(randomEndTime*1000)} in channel ${randomSelectedChannel}`)
									//this.client.versusEvent.set(1,versusEventMap)
									let msgSent = await this.client.guilds.cache.get(guildDOC.ID).channels.cache.get(randomSelectedChannel).send({embeds: [bigBossMessage]})
									setTimeout(() => {
										
										// what we do here:
										// save the data in the server doc and end the boss spawn.
										let getBossData = versusEventMap.spawns.get(randomSelectedChannel)
			
										guildDOC.events.versus.red.damage.total += getBossData.red
										guildDOC.events.versus.blue.damage.bigBoss += getBossData.red
										guildDOC.events.versus.blue.damage.total += getBossData.blue
										guildDOC.events.versus.blue.damage.bigBoss += getBossData.blue
			
										versusEventMap.spawns.delete(randomSelectedChannel)
										console.log(`[VSEVENT]: Deleted Bigboss for channel ${randomSelectedChannel}`)
										guildDOC.save().catch(err => console.log(err))
										msgSent.delete()
									}, randomEndTime* 1000);
								}

							}, 60000);
							// this.client.???.set(guildDOC.ID,timerEvent)
						}

						for (const guildDOC of res) {
							//if settings isn't set up
							if (!guildDOC.events.versus.settings) {
								guildDOC.events.versus.settings = eventSettings
								console.log(`[VSEV - EVENT- multisystem.js]: Set up guild ${guildDOC.Guild_Name} (${guildDOC.ID}) the versus settings! Skipping to next`)
								guildDOC.save().catch(err => console.log(err))
								continue;
							}
							if (guildDOC.events.versus.enabled == false) {
								console.log(`[VSEVENT-multisystem.js]: Event on server ${guildDOC.Guild_Name} (${guildDOC.ID}) is disabled!`)
								continue;
							}
							// for searching each date set 
							for (const timeObj of guildDOC.events.versus.settings.intervals.bigBoss) {
								let temptime = new Date()
								let dt = new Date(2022,7,23,11,30,"00");//current Date that gives us current Time also
				
								let s =  timeObj.starting.split(':');
								let dt1 = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), parseInt(s[0]), parseInt(s[1]), parseInt(s[2]));
				
								let e =  timeObj.ending.split(':');
								let dt2 = new Date(dt.getFullYear(), dt.getMonth(),	dt.getDate(), parseInt(e[0]), parseInt(e[1]), parseInt(e[2]));
				
								if (dt >= dt1 && dt <= dt2) // if it's 
									console.log('[VSEV-EVENT]: Time to spawn a boss...',timeObj)
								else {
									console.log(`[VSEV-EVENT]: Can't spawn a boss bcs not right time `,timeObj)
									continue;
								}
								/**
								 * Function Rough Idea:
								 * 1) Check the channels: if 1, use that; otherwise random choose 1 ch for that interval of time until boss gets defeated/leaves. When def/left, randomize again
								 * 2) Check the chances to spawn
								 * 3) Spawn
								 * 4) Rinse and repeat
								 */
								
								// creating channel variables
								let channelsToSpawn = guildDOC.events.versus.channels
								let freeChannels = []

								console.log(`channels in DB:`,channelsToSpawn)

								// generating chances to spawn and checking with the current amount
								let getDataFromMaps = versusEventMap.chances.get(guildDOC.ID)
								if (!getDataFromMaps) getDataFromMaps = 0
								let chanceToSpawn = percentageChance(["yes","no"],[guildDOC.events.versus.settings.chances.bigBoss+getDataFromMaps,100-(guildDOC.events.versus.settings.chances.bigBoss+getDataFromMaps)])

								// if we spawn, we reset the bonus chance to spawn to 0 in chances and spawn the boss in a random channel. otherwise increase chance
								if (chanceToSpawn == "no") {
									getDataFromMaps += guildDOC.events.versus.settings.chances.increaseBy
									versusEventMap.chances.set(guildDOC.ID,getDataFromMaps)
									return console.log(`[VSEVENT-SPAWN MACHINE]: not spawning, increased chance to ${getDataFromMaps}% (${guildDOC.events.versus.settings.chances.bigBoss+getDataFromMaps}% total)`)
								}
								if (chanceToSpawn == "yes") {
									// getDataFromMaps = 0
									console.log(`[VSEVENT]: This should be resetted but left for debugging!!! DO NOT FORGET TO SET THE CHANCE TO 0 AFTER GETTING GREENLIGHT\n`)
									versusEventMap.chances.set(guildDOC.ID,getDataFromMaps) // maybe it saves or not
									// this.client.versusEvent.set(1,versusEventMap)
								}

								// check if there is already a boss spawned. This way we do not spawn big bosses/more minibosses than require (1 bigboss, 4 mini)
								let maxAllowed = 2
								let maxFound = 0
								let maxAllowedHIT = false;
								for(let [key, value] of versusEventMap.spawns) {
									if (value.bossType == "bigBoss") {
										maxFound++;
										console.log(`[VSEVENT]: Found a big boss type spawned in ${key} channel!`)
									}
									if (maxFound == maxAllowed) {
										maxAllowedHIT = true;
										break;
									}
								}

								if (maxAllowedHIT == true) {
									console.log(`[VSEVENT]: MaxAllowedHIT is on, not spawning anymore! Next!\n`)
									continue;
								};

								// if we have 1 ch only, use that and get to the chances
								if (channelsToSpawn.length == 1) {
									//  if the channel is in use, return; Continue otherwise.		
									if (versusEventMap.spawns.get(channelsToSpawn[0]) != undefined) return;
									let objBoss = {
										bossType: "bigBoss",
										start_time: Date.now(),
										end_time: Date.now() + randomEndTime * 1000,
										red: 0,
										blue: 0
									}
									versusEventMap.spawns.set(channelsToSpawn[0],objBoss)
									this.client.versusEvent.set(1,versusEventMap)
									let msgSent = await this.client.guilds.cache.get(guildDOC.ID).channels.cache.get(channelsToSpawn[0]).send({embeds: [bigBossMessage]})
									console.log(`found a single channel`)
									setTimeout(() => {
									
										// what we do here:
										// save the data in the server doc and end the boss spawn.
										let getBossData = versusEventMap.spawns.get(randomSelectedChannel)
			
										guildDOC.events.versus.red.damage.total += getBossData.red
										guildDOC.events.versus.blue.damage.total += getBossData.blue
										guildDOC.events.versus.red.damage.bigBoss += getBossData.red
										guildDOC.events.versus.blue.damage.bigBoss += getBossData.blue
			
										versusEventMap.spawns.delete(channelsToSpawn[0])
										console.log(`[VSEVENT]: Deleted Bigboss for channel ${channelsToSpawn[0]}`)
										guildDOC.save().catch(err => console.log(err))
										msgSent.delete()

									}, randomEndTime* 1000);
									return;
								}

								// if more than 1, add the free ones in the new array "freeChannels"
								for (let i = 0; i < channelsToSpawn.length; i++) {
									if (versusEventMap.spawns.get(channelsToSpawn[i]) == undefined) {
										freeChannels.push(channelsToSpawn[i])
										console.log(`found free channel: ${channelsToSpawn[i]}`)
									}
								}
								
								// if there is no channel left, return
								if (freeChannels.length == 0) {
									console.log(`[VSEV-EVENT]: Can't find free channels to spawn.`)
									return;
								};
								console.log(`found multiple channels`)
								// let randomSelectedChannel = freeChannels[0]
								// if (freeChannels.length > 1)
								let randomSelectedChannel = freeChannels[Math.floor(Math.random() * freeChannels.length)];
								let randomEndTime = getRandomInt(guildDOC.events.versus.settings.durations.bigBoss.min,guildDOC.events.versus.settings.durations.bigBoss.max)
								let objBoss = {
									bossType: "bigBoss",
									start_time: Date.now(),
									end_time: Date.now() + randomEndTime * 1000,
									red: 0,
									blue: 0
								}
								versusEventMap.spawns.set(randomSelectedChannel,objBoss)
								console.log(`[VSEVENT-SPAWNMACHINE]: Spawned a big boss that last ${pms(randomEndTime*1000)} in channel ${randomSelectedChannel}`)
								//this.client.versusEvent.set(1,versusEventMap)
								let msgSent = await this.client.guilds.cache.get(guildDOC.ID).channels.cache.get(randomSelectedChannel).send({embeds: [bigBossMessage]})
								setTimeout(() => {
									
									// what we do here:
									// save the data in the server doc and end the boss spawn.
									let getBossData = versusEventMap.spawns.get(randomSelectedChannel)

									guildDOC.events.versus.red.damage.total += getBossData.red
									guildDOC.events.versus.blue.damage.bigBoss += getBossData.red
									guildDOC.events.versus.blue.damage.total += getBossData.blue
									guildDOC.events.versus.blue.damage.bigBoss += getBossData.blue

									versusEventMap.spawns.delete(randomSelectedChannel)
									console.log(`[VSEVENT]: Deleted Bigboss for channel ${randomSelectedChannel}`)
									guildDOC.save().catch(err => console.log(err))
									msgSent.delete()
								}, randomEndTime* 1000);
							}
						}
					})
					return
				}

				if (args[0] == "sh") {
					// console.log(this.client.versusEvent.spawns)
					console.log(this.client.versusEvent.get(1))
					console.log(this.client.versusEvent.get(2))
					// console.log(this.client.versusEvent.get(1))
					// this.client.guilds.cache.get("703352577705902202").channels.cache.find(item => item.name == "sharuru-logs").send(`test`)
					
				}
				//#endregion

				if (args[0] == "shoot") {
					
					profileSys.findOne({
						userID: issuer.id
					},(err,res) => {
						if (err) {
							sendError.create({
								Guild_Name: message.guild.name,
								Guild_ID: message.guild.id,
								User: issuer.tag,
								UserID: issuer.id,
								Error: err,
								Time: `${TheDate} || ${clock} ${amORpm}`,
								Command: this.name + "- shoot option",
								Args: args,
							},async (err2, res) => {
								if(err2) {
									console.log(err2)
									logChannel.send(`[${this.name}-PLAYER_SHOOT_BOSS-${TheDate}|${clock} ${amORpm}]: I've tried to perform an action at (${issuer}) a player request but got an error in \`${this.name}\`:\n${err.stack}`)
									return message.channel.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
								}
								if(res) {
									console.log(`successfully added error to database!`)
								}
							})
						}
						if (res) {
							/**
							 * how it works:
							 * 1) check if there is a weapon to use
							 * 2) check if there is a boss in the channel
							 * 3) shoot and take 1 durability from the weapon (including the fruit); increase dmg to the user; save dmg to bossDATA
							 * 4) if the weapon durability is 0, destroy the obj
							 * 5) send msg to the user and 
							 */

							// 1)
							if (res.events.versus.weaponHold == 0) {
								eventEmbed.setDescription(`Please equip a weapon to shoot! You can do that by using \`${prefix}vs equip weapon <id>\`!
To view the weapons you currently have and their ids, please use \`${prefix}vs inventory\`!`)
								return rep({embeds: [eventEmbed]},"15s")
							}
							// 2)
							if (versusEventMap.spawns.get(message.channel.id) == undefined) {
								eventEmbed.setDescription(`Unfortunately there is no existing threat around here!`)
								return rep({embeds: [eventEmbed]},"5s")
							}

							// 3)
							let entireInventory = res.events.versus.inventory.weapons
							let weaponDataShoot = entireInventory.find(item => item.id == res.events.versus.weaponHold)
							let verificationFruitID = res.events.versus.weaponFruitAdded ?? 1;
							let fruitData = weaponsData.fruits.find(item => item.id == verificationFruitID)
							console.log(fruitData);
							console.log(`checking if we have enough ${fruitData.name} to use: ${res.farm.fruits[fruitData.nameId].harvested}`)
							let isDestroyed = false;
							let userLastFruit = false;
							let bossData = versusEventMap.spawns.get(message.channel.id)
							res.events.versus.damage = Number(res.events.versus.damage) + weaponDataShoot.baseDamage
							bossData[res.events.versus.team] += weaponDataShoot.baseDamage
							if (res.events.versus.weaponFruitAdded != 0 && res.farm.fruits[fruitData.nameId].harvested > 0) {
								userLastFruit = true;
								res.farm.fruits[fruitData.nameId].harvested--;
								res.events.versus.damage = Number(res.events.versus.damage) + fruitData.damage
								bossData[res.events.versus.team] += fruitData.damage
							}
							weaponDataShoot.durability--;
							
							// update the inventory back
							let indexWP = entireInventory.findIndex(item => item.id == weaponDataShoot.id)
							entireInventory[indexWP] = weaponDataShoot

							profileSys.updateOne({
									'userID': `${issuer.id}`
								},{'$set':{ 'events.versus.inventory.weapons' : entireInventory}},(erro,reso)=>{
									if (erro) {
										sendError.create({
											Guild_Name: message.guild.name,
											Guild_ID: message.guild.id,
											User: issuer.tag,
											UserID: issuer.id,
											Error: erro,
											Time: `${TheDate} || ${clock} ${amORpm}`,
											Command: this.name + `, update VSEV USER INVENTORY WEAPONS `,
											Args: args,
										},async (errr, ress) => {
											if(errr) {
												console.log(errr)
												return logChannel.send(`[${this.name}]: Unfortunately an problem appeared while trying to save data of an user in VERSUS EVENT COMMMAND- WEAPONDATA. Please try again later. If this problem persist, contact my partner!`)
											}
											if(ress) {
												console.log(`successfully added error to database!`)
											}
										})
										return;
									}
									if(reso) {
										// console.log(reso)
										console.log(`[VersusEvent-shoot]: Successfully Updated ${issuer.tag} (${issuer.id}) weapon list.`)
									}
							});


							// 4/5) // delete weapon, reset weaponHold variable an tell user the weapon is gone
							if (weaponDataShoot.durability <= 0) {
								entireInventory.splice(entireInventory.findIndex(item => item.id == res.events.versus.weaponHold),1);
								isDestroyed = true
								res.events.versus.weaponHold = 0;
							}

							res.save().catch(err => console.log(err))
							eventEmbed.setDescription(`You have inflicted about ***${weaponDataShoot.baseDamage}*** damage to the ${bossData.bossType == "miniBoss" ? `mini-boss` : `boss`}! ${res.events.versus.weaponFruitAdded == 0 ? `` : res.farm.fruits[fruitData.nameId].harvested > 0 ? `You've also loaded the weapon with a *${fruitData.name}* for extra damage!` : userLastFruit == true ? `You've had exactly 1 last *${fruitData.name}* and you got a bit of extra damage against the boss! ` :  `You've used last time a *${fruitData.name}* but sadly that was the last one so there's no extra damage this time...`}${isDestroyed == true ? `\nSadly your weapon couldn't bear anymore and became now a pile of ashes in your hands. Luckily you didn't get hurt but now you have no weapon...` : ""}`)
							return rep({embeds: [eventEmbed]},"25s")
						}
					})
				}

				if (args[0] == "craft") {
					let availableWeaponIds = [200,201,202,203,204,205,206,207]
					let availableTreesIds = ["wood","palm","rich","boreal","ebon","shade","pearl","dynasty"]
					if (!args[1]) {
						eventEmbed.setDescription(`Please specify the id of the said weapon you wish to craft! Also you must mnake sure you're having enough ingredients to craft it!\n\nCurrently, these are the available weapon id's to craft:\n- ${availableWeaponIds.join("\n- ")}`)
						return rep({embeds: [eventEmbed]},"15s")
					}
					if (isNaN(args[1])) {
						eventEmbed.setDescription(`Please provide a number!`)
						return rep({embeds: [eventEmbed]},"5s")
					}
					if (!availableWeaponIds.includes(Number(args[1]))) {
						eventEmbed.setDescription(`I'm sorry but this isn't an existent id!!\nCurrently, these are the available weapon id's to craft:\n- ${availableWeaponIds.join("\n- ")}`)
						return rep({embeds: [eventEmbed]},"15s")
					}

					profileSys.findOne({
						userID: issuer.id
					},async(err,res) =>{
						if(err){
							sendError.create({
							Guild_Name: message.guild.name,
							Guild_ID: message.guild.id,
							User: issuer.tag,
							UserID: issuer.id,
							Error: err,
							Time: `${TheDate} || ${clock} ${amORpm}`,
							Command: this.name + " - event craft",
							Args: args,
						},async (err, res) => {
							if(err) {
								console.log(err)
								return message.channel.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
							}
							if(res) {
								console.log(`successfully added error to database!`)
							}
						})
						}
						if (res) {
							let wpDATA = weaponsData.trees.find(item => item.id == args[1])

							if (res.events.versus.inventory.weapons.find(item => item.id == args[1])) {
								eventEmbed.setDescription(`You own already a type of this weapon in your inventory! Please use it completely and after craft more!`)
								return rep({embeds: [eventEmbed]},"10s")
							}

							// if the user has enough or more required material, allow craft
							if (res.farm.trees[availableTreesIds[availableWeaponIds.findIndex(item => item == args[1])]].harvested >= wpDATA.requireCraft) {
								eventEmbed.setDescription(`Congrats! You have used **${wpDATA.requireCraft} ${wpDATA.nameId} wood** and crafted "**${wpDATA.weaponHoldName}**"!\nIt will be available in the inventory with the id \`${wpDATA.id}\`.\n\n*Note: You can equip a weapon with *\`${prefix}vs equip weapon ${wpDATA.id}\`*!`)
								// remove ingredients:
								res.farm.trees[availableTreesIds[availableWeaponIds.findIndex(item => item == args[1])]].harvested -= wpDATA.requireCraft
								// create item:
								let wpOBJ = {
									id: wpDATA.id,
									name: wpDATA.weaponHoldName,
									durability: wpDATA.durability,
									baseDurability: wpDATA.durability,
									baseDamage: wpDATA.baseDamage
								}
								res.events.versus.inventory.weapons.push(wpOBJ)
								// save all
								res.save().catch(err => console.log(err))
								return rep({embeds: [eventEmbed]},"25s")
							} else {
								eventEmbed.setDescription(`Unfortunately you do not own enough materials to craft this weapon! You need __*${wpDATA.requireCraft} more*__  pieces to craft **${wpDATA.weaponHoldName}**!`)
								return rep({embeds: [eventEmbed]},"15s")
							}
						}
					})


				}

				if (args[0] == "equip") {
					// if user doens't provide what they wanna equip
					if (!args[1]) {
						eventEmbed.setDescription(`Please specify what you want to equip: \`weapon\` or \`fruit\`!`)
						return rep({embeds: [eventEmbed]},"10s")
					}

					if (args[1] == "weapon") {
						profileSys.findOne({
						userID: issuer.id
					},(err,res) =>{
						if(err){
							sendError.create({
							Guild_Name: message.guild.name,
							Guild_ID: message.guild.id,
							User: issuer.tag,
							UserID: issuer.id,
							Error: err,
							Time: `${TheDate} || ${clock} ${amORpm}`,
							Command: this.name + " - event equip",
							Args: args,
						},async (err, res) => {
							if(err) {
								console.log(err)
								return message.channel.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
							}
							if(res) {
								console.log(`successfully added error to database!`)
							}
						})
						}
						if (res) {
							// if the item doesn't exist in their inventory, return
							if (!res.events.versus.inventory.weapons.find(item => item.id == args[2] ?? 0)) {
								eventEmbed.setDescription(`I couldn't find the weapon with id \`${args[2] ?? 0}\``)
								return rep({embeds: [eventEmbed]},"10s")
							}

							// if the item exist, put into the weaponHold slot
							res.events.versus.weaponHold = Number(args[2])
							let wpData = res.events.versus.inventory.weapons.find(item => item.id == args[2])
							eventEmbed.setDescription(`You have equipped "*__${wpData.name}__*"`)
							res.save().catch(err => console.log(err))
							return rep({embeds: [eventEmbed]},"10s")
						}
						})
					}
					if (args[1] == "fruit") {
						profileSys.findOne({
							userID: issuer.id
						},(err,res) =>{
							if(err){
								sendError.create({
								Guild_Name: message.guild.name,
								Guild_ID: message.guild.id,
								User: issuer.tag,
								UserID: issuer.id,
								Error: err,
								Time: `${TheDate} || ${clock} ${amORpm}`,
								Command: this.name + " - event equip fruit",
								Args: args,
							},async (err, res) => {
								if(err) {
									console.log(err)
									return message.channel.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
								}
								if(res) {
									console.log(`successfully added error to database!`)
								}
							})
							}
							if (res) {
								// if the item doesn't exist in their inventory, return
								if (!weaponsData.fruits.find(item => item.id == args[2] ?? 0)) {
									eventEmbed.setDescription(`I couldn't find the fruit with id \`${args[2] ?? 0}\``)
									return rep({embeds: [eventEmbed]},"10s")
								}
			
								// if the user has enough fruits of that type, add to the slot to use that fruit when they are shooting!
								res.events.versus.weaponFruitAdded = Number(args[2])
								let wpData = weaponsData.fruits.find(item => item.id == args[2])
								let moreInfo = ``
								if (res.farm.fruits[wpData.nameId].harvested == 0) 
									moreInfo +=`\n\nNote: Unfortunately you don't have at least 1 fruit of "__*${wpData.name}*__" so when you will try to shoot, it will not do anything this change!`
								eventEmbed.setDescription(`You have equipped "*__${wpData.name}__*" for additional damage!${moreInfo}`)
								res.save().catch(err => console.log(err))
								return rep({embeds: [eventEmbed]},"10s")
							}
						})
					}
				}

				if (args[0] == "inventory" || args[0] == "inv") {
					let stringToDisplay = `*Legend*:\n💎 - *represents the condition of the weapon*\n🔥 - *represents the damage of the weapon\n\n\n`;
					
					if (res.events.versus.inventory.weapons.length != 0) {
						for (let i = 0; i < res.events.versus.inventory.weapons.length; i++) {
							const element = res.events.versus.inventory.weapons[i];
							stringToDisplay += `**${element.id}) ${element.name}** *💎(${weaponCondition(element.durability,element.baseDurability)})* 🔥 ${element.baseDamage}\n`
						}
						eventEmbed.setDescription(stringToDisplay);
						return rep({embeds:[eventEmbed]})
					}

					eventEmbed.setDescription(`You currently have no weapons crafted. Get some logs from the farm minigame and after harvesting at least 2 logs for beginners, you can use \`${prefix}vs craft\` to make one and it will appear here!!`)
					return rep({embeds:[eventEmbed]},"15s")
				}

				if (args[0] == "leaderboard" || args[0] == "top") {
					profileSys.find({},async (err2,res2)=>{
						if (err2) {
							sendError.create({
								Guild_Name: message.guild.name,
								Guild_ID: message.guild.id,
								User: issuer.tag,
								UserID: issuer.id,
								Error: err2,
								Time: `${TheDate} || ${clock} ${amORpm}`,
								Command: this.name + "- checker VSEVENT if has team",
								Args: args,
							},async (err3, res) => {
								if(err3) {
									console.log(err3)
									logChannel.send(`[${this.name}-event-checker-${TheDate}|${clock} ${amORpm}]: I've tried to check if user (${issuer}) has a team selected before playing and got an error in \`${this.name}\`:\n${err2.stack}`)
									return message.channel.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
								}
								if(res) {
									console.log(`successfully added error to database!`)
								}
							})
						}
						if (res2) {
							let peopleRanked = `Here are the top 20 people participanting in this event:\n\n`
							let myResults = sortBy(res2,(obj) =>{return -obj.events.versus.damage})
							for (let i = 0; i < myResults.length && i < 20; i++) {
								const element = myResults[i];
								// console.log(element.userID)
								let findServer = element.servers_data.get(message.guild.id)
								if (findServer == undefined || findServer == null) continue; 
								console.log(element.userID+"::"+element.events.versus.damage)
								peopleRanked += `**${i+1})** <@${element.userID}> from team **${element.events.versus.team.toUpperCase()}:** **${element.events.versus.damage}**\n`
							}
							// console.log(peopleRanked)
							if (peopleRanked.length == 58) peopleRanked +=`*It seems like nobody got any score yet...*`
							eventEmbed.setDescription(peopleRanked)
							return rep({embeds: [eventEmbed]})
						}
					})
					
				}
			}
		})
		if (args[0] == "admin") {
			guildSettings.findOne({
				ID: message.guild.id
			},async(err,res) => {
				if (err) console.log(err)
				if (res) {
					// check, make sure staff members can use
					if (!message.member.roles.cache.find(r => r.id === res.staffRole)){
						console.log(`[VersusEvent-admin cmds]: This user, ${issuer.tag} (${issuer.id}) tried to use an admin command without staffrole!`)
						return;
					}

					// help
					if (!args[1] || args[1] == `help`) {
						eventEmbed.setDescription(`
!vs admin switch => it will switch the event from on to off and vice versa.
!vs admin settings => shows the current settings of the event in the server
!vs admin channels add <#channelName> => add a channel to spawn bosses. 
!vs admin channels remove <#channelName> => removes a channel from spawning bosses

!vs admin chances big <percentageNumber> => changes the starting chance of big bosses to spawn
!vs admin chances mini <percentageNumber> => changes the starting chance of mini bosses to spawn
!vs admin chances inc <percentageNumber> => changes the increasing % chance to add to the starting chance of spawning bosses.

!vs admin duration mini min <Number> => chances the minimum duration of mini bosses
!vs admin duration big min <Number> => chances the minimum duration of big bosses
!vs admin duration mini max <Number> => chances the maximum duration of mini bosses
!vs admin duration big max <Number> => chances the maximum duration of big bosses

!vs admin intervals add <startingTime> <endingTime> => adds an interval where the bosses can spawn between. To add, you need to provide an interval in the 24 time format like this: 00:00:00 00:30:00.
e.g: !vs admin intervals add 00:00:00 00:30:00
!vs admin intervals remove <#position> => removes the interval based on the position in the database
						`)
						return rep({embeds:[eventEmbed]})
					}

					// add or remove a channel
					if (args[1] == "channels") {
						if (!args[2]) {
							eventEmbed.setDescription(`Please select one of the 2: \`add or remove\``)
							return rep({embeds: [eventEmbed]},"7s")
						}
						if (args[2] == "add") {
							// verify if they mentioned a correct channel
							if (!message.mentions.channels.first()) {
								eventEmbed.setDescription(`Are you sure you mentioned a channel?`)
								return rep({embeds:[eventEmbed]},"10s")
							}
							if (res.events.versus.channels.includes(message.mentions.channels.first().id)) {
								eventEmbed.setDescription(`The channel, ${message.mentions.channels.first()}, is already in the list!`)
								return rep({embeds:[eventEmbed]},"10s")
							}
							if (!res.events.versus.channels) res.events.versus.channels = []
							res.events.versus.channels.push(message.mentions.channels.first().id)
							res.save().catch(err=> console.log(err))
							eventEmbed.setDescription(`The channel, ${message.mentions.channels.first()}, was added to my list of channels to spawn bosses in!\nPlease **restart the event** by disabling the spawning and enabling it again in order for the change to apply.\n\nCommand: \`${prefix}vs admin switch\``)
							return rep({embeds:[eventEmbed]},"10s")
						}
	
						if (args[2] == "delete" || args[2] == "remove") {
	
							// verify if they mentioned a correct channel
							if (!message.mentions.channels.first()) {
								eventEmbed.setDescription(`Are you sure you mentioned a channel?`)
								return rep({embeds:[eventEmbed]},"10s")
							}
	
							// if there'\s no channel like that added, return
							if (!res.events.versus.channels.includes(message.mentions.channels.first().id)) {
								eventEmbed.setDescription(`I couldn't find ${message.mentions.channels.first()} channel in my list! Are you sure that channel was added?`)
								return rep({embeds:[eventEmbed]},"10s")
							}
	
							// get index and remove
							let getChannelIndex = res.events.versus.channels.findIndex(item => item == message.mentions.channels.first().id)
							res.events.versus.channels.splice(getChannelIndex,1);
							res.save().catch(err=> console.log(err))
							eventEmbed.setDescription(`The channel, ${message.mentions.channels.first()}, was removed! No more bosses spawning there! \nPlease **restart the event** by disabling the spawning and enabling it again in order for the change to apply.\n\nCommand: \`${prefix}vs admin switch\``)
							return rep({embeds:[eventEmbed]},"10s")
						}
					} 
					

					if (args[1] == "switch") {
						// if it's not enabled, enable it
						if (!res.events.versus.enabled) {
							res.events.versus.enabled = true;

							//#region enable miniboss
							// if settings isn't set up
							 if (!res.events.versus.settings) {
								res.events.versus.settings = eventSettings
								console.log(`[VSEVENT-multisystem]: Set up guild ${res.Guild_Name} (${res.ID}) the versus settings! Skipping to next`)
								res.save().catch(err => console.log(err))
								return;
							}
							console.log(`[VSEVENT]: Enabling VS Event (miniboss edition) for "${res.Guild_Name}"" server.`)
							let timerEvent = setInterval(async() => {
								// for searching each date set 
								for (const timeObj of res.events.versus.settings.intervals.miniBoss) {
									let temptime = new Date(2022,7,23,11,30,"00")
									let dt = new Date();//current Date that gives us current Time also
					
									let s =  timeObj.starting.split(':');
									let dt1 = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), parseInt(s[0]), parseInt(s[1]), parseInt(s[2]));
					
									let e =  timeObj.ending.split(':');
									let dt2 = new Date(dt.getFullYear(), dt.getMonth(),	dt.getDate(), parseInt(e[0]), parseInt(e[1]), parseInt(e[2]));
					
									if (dt >= dt1 && dt <= dt2) // if it's 
										console.log(`[VSEVENT-${res.ID}]: Time to spawn a miniboss...`,timeObj)
									else {
										// console.log(`[VSEV-EVENT-${res.ID}]: Can't spawn a miniboss bcs not right time `,timeObj)
										continue;
									}
									
									// creating channel variables
									let channelsToSpawn = res.events.versus.channels
									let freeChannels = []
			
									// console.log(`channels in DB:`,channelsToSpawn)
			
									// generating chances to spawn and checking with the current amount
									let getDataFromMaps = versusEventMap.chances.get(res.ID)
									if (!getDataFromMaps) getDataFromMaps = 0
									let chanceToSpawn = percentageChance(["yes","no"],[res.events.versus.settings.chances.miniBoss+getDataFromMaps,100-(res.events.versus.settings.chances.miniBoss+getDataFromMaps)])
			
									// if we spawn, we reset the bonus chance to spawn to 0 in chances and spawn the boss in a random channel. otherwise increase chance
									if (chanceToSpawn == "no") {
										getDataFromMaps += res.events.versus.settings.chances.increaseBy
										versusEventMap.chances.set(res.ID,getDataFromMaps)
										return console.log(`[VSEVENT-SPAWN-MINIBOSS-${res.ID}]: not spawning, increased chance to ${getDataFromMaps}% (${res.events.versus.settings.chances.miniBoss+getDataFromMaps}% total)`)
									}
									if (chanceToSpawn == "yes") {
										getDataFromMaps = 0
										// console.log(`[VSEVENT]: This should be resetted but left for debugging!!! DO NOT FORGET TO SET THE CHANCE TO 0 AFTER GETTING GREENLIGHT\n`)
										versusEventMap.chances.set(res.ID,getDataFromMaps) // maybe it saves or not
										// this.client.versusEvent.set(1,versusEventMap)
									}
			
									//#region check if there is already a boss spawned. This way we do not spawn big bosses/more minibosses than require (1 bigboss, 4 mini)
									let maxAllowed = 4
									let maxFound = 0
									let maxAllowedHIT = false;
									for(let [key, value] of versusEventMap.spawns) {
										if (value.bossType == "miniBoss") {
											maxFound++;
											console.log(`[VSEVENT-${res.ID}]: Found a mini boss type spawned in ${key} channel!`)
										}
										if (maxFound == maxAllowed) {
											maxAllowedHIT = true;
											break;
										}
									}
			
									if (maxAllowedHIT == true) {
										console.log(`[VSEVENT-${res.ID}]: MaxAllowedHIT is on, not spawning anymore the miniboss! Next!\n`)
										continue;
									};
									//#endregion
			
									// if we have 1 ch only, use that and get to the chances
									if (channelsToSpawn.length == 1) {
										let randomEndTime = getRandomInt(res.events.versus.settings.durations.miniBoss.min,res.events.versus.settings.durations.miniBoss.max)
										//  if the channel is in use, return; Continue otherwise.		
										if (versusEventMap.spawns.get(channelsToSpawn[0]) != undefined) return;
										let objBoss = {
											bossType: "miniBoss",
											start_time: Date.now(),
											end_time: Date.now() + randomEndTime * 1000,
											red: 0,
											blue: 0
										}
										versusEventMap.spawns.set(channelsToSpawn[0],objBoss)
										this.client.versusEvent.set(1,versusEventMap)
										let msgSent = await this.client.guilds.cache.get(res.ID).channels.cache.get(channelsToSpawn[0]).send({embeds: [smallBossMessage]})
										this.client.guilds.cache.get(res.ID).channels.cache.find(item => item.name == "sharuru-logs").send(`[VSEVENT]: I've spawned a mini boss in <#${channelsToSpawn[0]}>! Duration: ${pms(randomEndTime*1000)}`)
										console.log(`[VSEVENT-SPAWN-MINIBOSS-${res.ID}]: Spawned on the only channel available the miniboss in ${res.Guild_Name} (${res.ID})`)
										setTimeout(() => {
										
											// what we do here:
											// save the data in the server doc and end the boss spawn.
											let getBossData = versusEventMap.spawns.get(channelsToSpawn[0])
				
											if (getBossData == undefined || getBossData == null) return;

											// red team
											res.events.versus.red.damage += getBossData.red
			
											// blue team
											res.events.versus.blue.damage += getBossData.blue
				
											versusEventMap.spawns.delete(channelsToSpawn[0])
											console.log(`[VSEVENT-${res.ID}]: Deleted miniBoss for channel ${channelsToSpawn[0]}`)
											res.save().catch(err => console.log(err))
											msgSent.delete()
			
										}, randomEndTime* 1000);
										return;
									}
			
									// if more than 1, add the free ones in the new array "freeChannels"
									for (let i = 0; i < channelsToSpawn.length; i++) {
										if (versusEventMap.spawns.get(channelsToSpawn[i]) == undefined) {
											freeChannels.push(channelsToSpawn[i])
											// console.log(`[VSEVENT]: Found free channel: ${channelsToSpawn[i]}`)
										}
									}
									
									// if there is no channel left, return
									if (freeChannels.length == 0) {
										console.log(`[VSEVENT-${res.ID}]: Can't find free channels to spawn miniboss.`)
										return;
									};
									// console.log(`found multiple channels`)
									// let randomSelectedChannel = freeChannels[0]
									// if (freeChannels.length > 1)
									let randomSelectedChannel = freeChannels[Math.floor(Math.random() * freeChannels.length)];
									let randomEndTime = getRandomInt(res.events.versus.settings.durations.miniBoss.min,res.events.versus.settings.durations.miniBoss.max)
									let objBoss = {
										bossType: "miniBoss",
										start_time: Date.now(),
										end_time: Date.now() + randomEndTime * 1000,
										red: 0,
										blue: 0
									}
									versusEventMap.spawns.set(randomSelectedChannel,objBoss)
									console.log(`[VSEVENT-SPAWN-MINIBOSS-${res.ID}]: Spawned a mini boss that last ${pms(randomEndTime*1000)} in channel ${randomSelectedChannel}`)
									//this.client.versusEvent.set(1,versusEventMap)
									let msgSent = await this.client.guilds.cache.get(res.ID).channels.cache.get(randomSelectedChannel).send({embeds: [smallBossMessage]})
									this.client.guilds.cache.get(res.ID).channels.cache.find(item => item.name == "sharuru-logs").send(`[VSEVENT]: I've spawned a mini boss in <#${randomSelectedChannel}>! Duration: ${pms(randomEndTime*1000)}`)
									setTimeout(() => {
										
										// what we do here:
										// save the data in the server doc and end the boss spawn.
										let getBossData = versusEventMap.spawns.get(randomSelectedChannel)

										if (getBossData == undefined || getBossData == null) return;
			
										// red team
										res.events.versus.red.damage += getBossData.red
			
										// blue team
										res.events.versus.blue.damage += getBossData.blue
			
										versusEventMap.spawns.delete(randomSelectedChannel)
										console.log(`[VSEVENT-SPAWN-MINIBOSS-${res.ID}]: Deleted miniboss for channel ${randomSelectedChannel}`)
										res.save().catch(err => console.log(err))
										msgSent.delete()
									}, randomEndTime* 1000);
								}
			
							}, 20000);
							this.client.versusEvent.get(2).miniboss.set(res.ID,timerEvent)
							//#endregion
						
							//#region enable bigboss
							console.log(`[VSEVENT]: Enabling VS Event (bigboss edition) for "${res.Guild_Name}"" server.`)
							let timerEvent2 = setInterval(async() => {
								// for searching each date set 
								for (const timeObj of res.events.versus.settings.intervals.bigBoss) {
									let temptime = new Date(2022,7,23,11,30,"00")
									let dt = new Date();//current Date that gives us current Time also
					
									let s =  timeObj.starting.split(':');
									let dt1 = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), parseInt(s[0]), parseInt(s[1]), parseInt(s[2]));
					
									let e =  timeObj.ending.split(':');
									let dt2 = new Date(dt.getFullYear(), dt.getMonth(),	dt.getDate(), parseInt(e[0]), parseInt(e[1]), parseInt(e[2]));
					
									if (dt >= dt1 && dt <= dt2) // if it's 
										console.log(`[VSEVENT-${res.ID}]: Time to spawn a boss...`,timeObj)
									else {
										// console.log(`[VSEV-EVENT-${res.ID}]: Can't spawn a boss bcs not right time `,timeObj)
										continue;
									}
									
									// creating channel variables
									let channelsToSpawn = res.events.versus.channels
									let freeChannels = []

									// console.log(`channels in DB:`,channelsToSpawn)

									// generating chances to spawn and checking with the current amount
									let getDataFromMaps = versusEventMap.chances.get(res.ID)
									if (!getDataFromMaps) getDataFromMaps = 0
									let chanceToSpawn = percentageChance(["yes","no"],[res.events.versus.settings.chances.bigBoss+getDataFromMaps,100-(res.events.versus.settings.chances.bigBoss+getDataFromMaps)])

									// if we spawn, we reset the bonus chance to spawn to 0 in chances and spawn the boss in a random channel. otherwise increase chance
									if (chanceToSpawn == "no") {
										getDataFromMaps += res.events.versus.settings.chances.increaseBy
										versusEventMap.chances.set(res.ID,getDataFromMaps)
										return console.log(`[VSEVENT-SPAWN-${res.ID}]: Spawn failed, increased chance to ${getDataFromMaps}% (${res.events.versus.settings.chances.bigBoss+getDataFromMaps}% total)`)
									}
									if (chanceToSpawn == "yes") {
										getDataFromMaps = 0
										// console.log(`[VSEVENT]: This should be resetted but left for debugging!!! DO NOT FORGET TO SET THE CHANCE TO 0 AFTER GETTING GREENLIGHT\n`)
										versusEventMap.chances.set(res.ID,getDataFromMaps) // maybe it saves or not
										// this.client.versusEvent.set(1,versusEventMap)
									}

									//#region check if there is already a boss spawned. This way we do not spawn big bosses/more minibosses than require (1 bigboss, 4 mini)
									let maxAllowed = 1
									let maxFound = 0
									let maxAllowedHIT = false;
									for(let [key, value] of versusEventMap.spawns) {
										if (value.bossType == "bigBoss") {
											maxFound++;
											console.log(`[VSEVENT-${res.ID}]: Found a big boss type spawned in ${key} channel!`)
										}
										if (maxFound == maxAllowed) {
											maxAllowedHIT = true;
											break;
										}
									}

									if (maxAllowedHIT == true) {
										console.log(`[VSEVENT-${res.ID}]: MaxAllowedHIT is on, not spawning anymore! Next!\n`)
										continue;
									};
									//#endregion

									// if we have 1 ch only, use that and get to the chances
									if (channelsToSpawn.length == 1) {
										let randomEndTime = getRandomInt(res.events.versus.settings.durations.bigBoss.min,res.events.versus.settings.durations.bigBoss.max)
										//  if the channel is in use, return; Continue otherwise.		
										if (versusEventMap.spawns.get(channelsToSpawn[0]) != undefined) return;
										let objBoss = {
											bossType: "bigBoss",
											start_time: Date.now(),
											end_time: Date.now() + randomEndTime * 1000,
											red: 0,
											blue: 0
										}
										versusEventMap.spawns.set(channelsToSpawn[0],objBoss)
										this.client.versusEvent.set(1,versusEventMap)
										let msgSent = await this.client.guilds.cache.get(res.ID).channels.cache.get(channelsToSpawn[0]).send({embeds: [bigBossMessage]})
										this.client.guilds.cache.get(res.ID).channels.cache.find(item => item.name == "sharuru-logs").send(`[VSEVENT]: I've spawned a big boss in <#${channelsToSpawn[0]}>!Duration: ${pms(randomEndTime*1000)}`)
										// console.log(`found a single channel`)
										setTimeout(() => {
										
											// what we do here:
											// save the data in the server doc and end the boss spawn.
											let getBossData = versusEventMap.spawns.get(channelsToSpawn[0])

											if (getBossData == undefined || getBossData == null) return;
				
											// red team
											res.events.versus.red.damage += getBossData.red
											// blue team
											res.events.versus.blue.damage += getBossData.blue
				
											versusEventMap.spawns.delete(channelsToSpawn[0])
											console.log(`[VSEVENT-${res.ID}]: Deleted Bigboss for channel ${channelsToSpawn[0]}`)
											res.save().catch(err => console.log(err))
											msgSent.delete()

										}, randomEndTime* 1000);
										return;
									}

									// if more than 1, add the free ones in the new array "freeChannels"
									for (let i = 0; i < channelsToSpawn.length; i++) {
										if (versusEventMap.spawns.get(channelsToSpawn[i]) == undefined) {
											freeChannels.push(channelsToSpawn[i])
											// console.log(`found free channel: ${channelsToSpawn[i]}`)
										}
									}
									
									// if there is no channel left, return
									if (freeChannels.length == 0) {
										console.log(`[VSEVENT-${res.ID}]: Can't find free channels to spawn.`)
										return;
									};
									// console.log(`found multiple channels`)
									// let randomSelectedChannel = freeChannels[0]
									// if (freeChannels.length > 1)
									let randomSelectedChannel = freeChannels[Math.floor(Math.random() * freeChannels.length)];
									let randomEndTime = getRandomInt(res.events.versus.settings.durations.bigBoss.min,res.events.versus.settings.durations.bigBoss.max)
									let objBoss = {
										bossType: "bigBoss",
										start_time: Date.now(),
										end_time: Date.now() + randomEndTime * 1000,
										red: 0,
										blue: 0
									}
									versusEventMap.spawns.set(randomSelectedChannel,objBoss)
									console.log(`[VSEVENT-SPAWN-${res.ID}]: Spawned a big boss that last ${pms(randomEndTime*1000)} in channel ${randomSelectedChannel}`)
									//this.client.versusEvent.set(1,versusEventMap)
									let msgSent = await this.client.guilds.cache.get(res.ID).channels.cache.get(randomSelectedChannel).send({embeds: [bigBossMessage]})
									this.client.guilds.cache.get(res.ID).channels.cache.find(item => item.name == "sharuru-logs").send(`[VSEVENT]: I've spawned a big boss in <#${randomSelectedChannel}>!Duration: ${pms(randomEndTime*1000)}`)
									setTimeout(() => {
										
										// what we do here:
										// save the data in the server doc and end the boss spawn.
										let getBossData = versusEventMap.spawns.get(randomSelectedChannel)

										if (getBossData == undefined || getBossData == null) return;

										// red team
										res.events.versus.red.damage += getBossData.red
										// blue team
										res.events.versus.blue.damage += getBossData.blue

										versusEventMap.spawns.delete(randomSelectedChannel)
										console.log(`[VSEVENT-${res.ID}]: Deleted Bigboss for channel ${randomSelectedChannel}`)
										res.save().catch(err => console.log(err))
										msgSent.delete()
									}, randomEndTime* 1000);
								}

							}, 120000);
							
							this.client.versusEvent.get(2).bigboss.set(res.ID,timerEvent2)
							//#endregion

							eventEmbed.setDescription(`I have enabled the vs event.`)
							res.save().catch(err2 => console.log(err2))
							return rep({embeds:[eventEmbed]},"20s")
						}	
						// if it's enabled, disable it
						if (res.events.versus.enabled) {
							res.events.versus.enabled = false;
							let thisBigBossInterval = this.client.versusEvent.get(2).bigboss.get(message.guild.id)
							let thisMiniBossInterval = this.client.versusEvent.get(2).miniboss.get(message.guild.id)
							clearInterval(thisBigBossInterval)
							clearInterval(thisMiniBossInterval)
							this.client.versusEvent.get(2).bigboss.delete(message.guild.id)
							this.client.versusEvent.get(2).miniboss.delete(message.guild.id)
							// clear the remaining bosses if exist
							for (let i = 0; i < res.events.versus.channels.length; i++) {
								let bossChannel = res.events.versus.channels[i];
								if (versusEventMap.spawns.get(bossChannel) != undefined || versusEventMap.spawns.get(bossChannel) != null) {
									console.log(`[VSEVENT-${message.guild.id}]: Removed a boss from channel ${bossChannel} of guild ${message.guild.name} (${message.guild.id})!`)
									versusEventMap.spawns.delete(bossChannel);
								}
							}
							eventEmbed.setDescription(`I have disabled the event. In case 1-2 more bosses appear, that's because of the timer still in effect. you can delete those & the bosses that appeared before executing this command.`)
							res.save().catch(err2 => console.log(err2))
							return rep({embeds:[eventEmbed]},"20s")
						} 
					}

					if (args[1] == "chances") {
						if (!args[2]) {
							eventEmbed.setDescription(`Please select one of the 3: \`big, mini or increase/inc\``)
							return rep({embeds: [eventEmbed]},"7s")
						}
						if (args[2] == "big") {

							// verify if user added something, it's a number and it's between 1 and 99
							if (!args[3]) {
								eventEmbed.setDescription(`Please add a number to set the starting percentage chance of spawning big boss! It has to start from 1 and up to 99!`)
								return rep({embeds:[eventEmbed]},"10s")
							}
							if (isNaN(Number(args[3]))) {
								eventEmbed.setDescription(`Please add a valid number! It has to start from 1 and up to 99!`)
								return rep({embeds:[eventEmbed]},"10s")
							}
							if (Number(args[3]) < 1 || Number(args[3]) > 99) {
								eventEmbed.setDescription(`Please add a number that start from 1 and up to 99!`)
								return rep({embeds:[eventEmbed]},"10s")
							} 
							res.events.versus.settings.chances.bigBoss = Number(args[3])
							eventEmbed.setDescription(`I've set the starting chance for the big boss to be: **${args[3]}%**!\n\nPlease restart the event (disable and enable again) to apply the new settings:\n\`${prefix}vs admin switch\``)
						}

						if (args[2] == "mini") {
							if (!args[3]) {
								eventEmbed.setDescription(`Please add a number to set the starting percentage chance of spawning mini boss! It has to start from 1 and up to 99!`)
								return rep({embeds:[eventEmbed]},"10s")
							}
							if (isNaN(Number(args[3]))) {
								eventEmbed.setDescription(`Please add a valid number! It has to start from 1 and up to 99!`)
								return rep({embeds:[eventEmbed]},"10s")
							}
							if (Number(args[3]) < 1 || Number(args[3]) > 99) {
								eventEmbed.setDescription(`Please add a number that start from 1 and up to 99!`)
								return rep({embeds:[eventEmbed]},"10s")
							} 
							res.events.versus.settings.chances.miniBoss = Number(args[3])
							eventEmbed.setDescription(`I've set the starting chance for the mini boss to be: **${args[3]}%**!\n\nPlease restart the event (disable and enable again) to apply the new settings:\n\`${prefix}vs admin switch\``)
						}

						if (args[2] == "inc" || args[2] == "increase") {
							if (!args[3]) {
								eventEmbed.setDescription(`Please add a number to set as the % increase chance of spawning bosses! It has to start from 1 and up to 99!`)
								return rep({embeds:[eventEmbed]},"10s")
							}
							if (isNaN(Number(args[3]))) {
								eventEmbed.setDescription(`Please add a valid number! It has to start from 1 and up to 99!`)
								return rep({embeds:[eventEmbed]},"10s")
							}
							if (Number(args[3]) < 1 || Number(args[3]) > 99) {
								eventEmbed.setDescription(`Please add a number that start from 1 and up to 99!`)
								return rep({embeds:[eventEmbed]},"10s")
							} 
							res.events.versus.settings.chances.increaseBy = Number(args[3])
							eventEmbed.setDescription(`I've set the percentage chance increase that will be added to the bosses when it fails: **${args[3]}%**!\n\nPlease restart the event (disable and enable again) to apply the new settings:\n\`${prefix}vs admin switch\``)
						}
						res.save().catch(err => console.log(err))
						return rep({embeds:[eventEmbed]},"20s")
					}

					if (args[1] == "duration") {
						if (!args[2]) {
							eventEmbed.setDescription(`Please select one of the 2: \`big or mini\``)
							return rep({embeds: [eventEmbed]},"7s")
						}
						if (args[2] == "big") {
							if (!args[3]) {
								eventEmbed.setDescription(`Please select one of the 2: \`min or max\``)
								return rep({embeds: [eventEmbed]},"7s")
							}
							if (args[3] == "min") {
								// verify if user added something, it's a number and it's between 1 and 99
								if (!args[4]) {
									eventEmbed.setDescription(`Please add a number (that's going to be represented as seconds) to set the time that big boss remains in a channel once spawned! It has to start from 30 and up to 999!`)
									return rep({embeds:[eventEmbed]},"10s")
								}
								if (isNaN(Number(args[4]))) {
									eventEmbed.setDescription(`Please add a valid number represented in seconds! It has to start from 30 and up to 999!`)
									return rep({embeds:[eventEmbed]},"10s")
								}
								if (Number(args[4]) < 30 || Number(args[4]) > 999) {
									eventEmbed.setDescription(`Please add a number that start from 30 and up to 999, that's going to be represented in seconds!`)
									return rep({embeds:[eventEmbed]},"10s")
								}

								res.events.versus.settings.durations.bigBoss.min = Number(args[4])
								eventEmbed.setDescription(`I've set the minimum duration of big bosses to be: **${args[4]}sec**!\n\nPlease restart the event (disable and enable again) to apply the new settings:\n\`${prefix}vs admin switch\``)
							}
							
							if (args[3] == "max") {
								// verify if user added something, it's a number and it's between 1 and 99
								if (!args[4]) {
									eventEmbed.setDescription(`Please add a number (that's going to be represented as seconds) to set the time that big boss remains in a channel once spawned! It has to start from 30 and up to 999!`)
									return rep({embeds:[eventEmbed]},"10s")
								}
								if (isNaN(Number(args[4]))) {
									eventEmbed.setDescription(`Please add a valid number represented in seconds! It has to start from 30 and up to 999!`)
									return rep({embeds:[eventEmbed]},"10s")
								}
								if (Number(args[4]) < 30 || Number(args[4]) > 999) {
									eventEmbed.setDescription(`Please add a number that start from 30 and up to 999, that's going to be represented in seconds!`)
									return rep({embeds:[eventEmbed]},"10s")
								}
								
								res.events.versus.settings.durations.bigBoss.max = Number(args[4])
								eventEmbed.setDescription(`I've set the maximum duration of big bosses to be: **${args[4]}sec**!\n\nPlease restart the event (disable and enable again) to apply the new settings:\n\`${prefix}vs admin switch\``)
							}
							res.save().catch(err => console.log(err))
							return rep({embeds:[eventEmbed]},"20s")
						}

						if (args[2] == "mini") {
							if (!args[3]) {
								eventEmbed.setDescription(`Please select one of the 2: \`min or max\``)
								return rep({embeds: [eventEmbed]},"7s")
							}
							if (args[3] == "min") {
								// verify if user added something, it's a number and it's between 1 and 99
								if (!args[4]) {
									eventEmbed.setDescription(`Please add a number (that's going to be represented as seconds) to set the time that mini boss remains in a channel once spawned! It has to start from 30 and up to 999!`)
									return rep({embeds:[eventEmbed]},"10s")
								}
								if (isNaN(Number(args[4]))) {
									eventEmbed.setDescription(`Please add a valid number represented in seconds! It has to start from 30 and up to 999!`)
									return rep({embeds:[eventEmbed]},"10s")
								}
								if (Number(args[4]) < 30 || Number(args[4]) > 999) {
									eventEmbed.setDescription(`Please add a number that start from 30 and up to 999, that's going to be represented in seconds!`)
									return rep({embeds:[eventEmbed]},"10s")
								}
								
								res.events.versus.settings.durations.miniBoss.min = Number(args[4])
								eventEmbed.setDescription(`I've set the minimum duration of mini bosses to be: **${args[4]}sec**!\n\nPlease restart the event (disable and enable again) to apply the new settings:\n\`${prefix}vs admin switch\``)
							}
							
							if (args[3] == "max") {
								// verify if user added something, it's a number and it's between 1 and 99
								if (!args[4]) {
									eventEmbed.setDescription(`Please add a number (that's going to be represented as seconds) to set the time that mini boss remains in a channel once spawned! It has to start from 30 and up to 999!`)
									return rep({embeds:[eventEmbed]},"10s")
								}
								if (isNaN(Number(args[4]))) {
									eventEmbed.setDescription(`Please add a valid number represented in seconds! It has to start from 30 and up to 999!`)
									return rep({embeds:[eventEmbed]},"10s")
								}
								if (Number(args[4]) < 30 || Number(args[4]) > 999) {
									eventEmbed.setDescription(`Please add a number that start from 30 and up to 999, that's going to be represented in seconds!`)
									return rep({embeds:[eventEmbed]},"10s")
								}
								
								res.events.versus.settings.durations.miniBoss.max = Number(args[4])
								eventEmbed.setDescription(`I've set the maximum duration of mini bosses to be: **${args[4]}sec**!\n\nPlease restart the event (disable and enable again) to apply the new settings:\n\`${prefix}vs admin switch\``)
							}
							res.save().catch(err => console.log(err))
							return rep({embeds:[eventEmbed]},"20s")
						}
					}

					if (args[1] == "intervals") {
						if (!args[2]) {
							eventEmbed.setDescription(`Please select one of the 2: \`big or mini\``)
							return rep({embeds: [eventEmbed]},"7s")
						}
						if (args[2] == "big") {
							if (!args[3]) {
								eventEmbed.setDescription(`Please select one of the 2: \`add or remove\``)
								return rep({embeds: [eventEmbed]},"7s")
							}
							if (args[3] == "add") {
								// verify if user added something, it's a format accepted & it's between 00 and 23
								if (!args[4] || !args[5]) {
									eventEmbed.setDescription(`Please add an interval of time in this format starting from \`00:00:00\` up to \`23:59:59\``)
									return rep({embeds:[eventEmbed]},"10s")
								}
								if (!args[4].match(/(0[0-9]|1[0-9]|2[0-3]):(0?[0-9]|[1-5][0-9]):(0[0-9]|[1-5][0-9])/g) || !args[5].match(/(0[0-9]|1[0-9]|2[0-3]):(0?[0-9]|[1-5][0-9]):(0[0-9]|[1-5][0-9])/g)) {
									eventEmbed.setDescription(`Please add a valid format like this starting from \`00:00:00\` up to \`23:59:59\`!`)
									return rep({embeds:[eventEmbed]},"10s")
								}

								let newObj = {
									starting: args[4],
									ending: args[5]
								}
								res.events.versus.settings.intervals.bigBoss.push(newObj);
								eventEmbed.setDescription(`I have added a new interval! From now on whenever the time is between \`${args[4]}\` - \`${args[5]}\`, I'll try to spawn a boss!`)
							}

							if (args[3] == "remove" || args[3] == "del"|| args[3] == "rem") {
								if (!args[4]) {
									eventEmbed.setDescription(`Please add a number corresponding to the position of the interval you wish to delete! To show intervals, please consult \`${prefix}vs admin settings\`!`)
									return rep({embeds:[eventEmbed]},"10s")
								}
								if (isNaN(Number(args[4]))) {
									eventEmbed.setDescription(`Please add a valid number!`)
									return rep({embeds:[eventEmbed]},"10s")
								}
								if (Number(args[4]) < 1 || Number(args[4]) > res.events.versus.settings.intervals.bigBoss.length) {
									eventEmbed.setDescription(`Please add a number that start from 1 and up to ${res.events.versus.settings.intervals.bigboss.length}!`)
									return rep({embeds:[eventEmbed]},"10s")
								}

								res.events.versus.settings.intervals.bigBoss.splice(Number(args[4])-1,1)
								eventEmbed.setDescription(`Done! I've deleted the interval that was on position **#${args[4]}**!`)
							}
							res.save().catch(err => console.log(err))
							return rep({embeds:[eventEmbed]},"25s")
						}

						if (args[2] == "mini") {
							if (!args[3]) {
								eventEmbed.setDescription(`Please select one of the 2: \`add or remove\``)
								return rep({embeds: [eventEmbed]},"7s")
							}
							if (args[3] == "add") {
								// verify if user added something, it's a format accepted & it's between 00 and 23
								if (!args[4] || !args[5]) {
									eventEmbed.setDescription(`Please add an interval of time in this format starting from \`00:00:00\` up to \`23:59:59\``)
									return rep({embeds:[eventEmbed]},"10s")
								}
								if (!args[4].match(/(0[0-9]|1[0-9]|2[0-3]):(0?[0-9]|[1-5][0-9]):(0[0-9]|[1-5][0-9])/g) || !args[5].match(/(0[0-9]|1[0-9]|2[0-3]):(0?[0-9]|[1-5][0-9]):(0[0-9]|[1-5][0-9])/g)) {
									eventEmbed.setDescription(`Please add a valid format like this starting from \`00:00:00\` up to \`23:59:59\`!`)
									return rep({embeds:[eventEmbed]},"10s")
								}

								let newObj = {
									starting: args[4],
									ending: args[5]
								}
								res.events.versus.settings.intervals.miniBoss.push(newObj);
								eventEmbed.setDescription(`I have added a new interval! From now on whenever the time is between \`${args[4]}\` - \`${args[5]}\`, I'll try to spawn a boss!`)
							}

							if (args[3] == "remove" || args[3] == "del"|| args[3] == "rem") {
								if (!args[4]) {
									eventEmbed.setDescription(`Please add a number corresponding to the position of the interval you wish to delete! To show intervals, please consult \`${prefix}vs admin settings\`!`)
									return rep({embeds:[eventEmbed]},"10s")
								}
								if (isNaN(Number(args[4]))) {
									eventEmbed.setDescription(`Please add a valid number!`)
									return rep({embeds:[eventEmbed]},"10s")
								}
								if (Number(args[4]) < 1 || Number(args[4]) > res.events.versus.settings.intervals.miniBoss.length) {
									eventEmbed.setDescription(`Please add a number that start from 1 and up to ${res.events.versus.settings.intervals.bigboss.length}!`)
									return rep({embeds:[eventEmbed]},"10s")
								}

								res.events.versus.settings.intervals.miniBoss.splice(Number(args[4])-1,1)
								eventEmbed.setDescription(`Done! I've deleted the interval that was on position **#${args[4]}**!`)
							}
							res.save().catch(err => console.log(err))
							return rep({embeds:[eventEmbed]},"25s")
						}
					}

					if (args[1] == "settings" || args[1] == "status" || args[1] == "stats") {
						eventEmbed.setTitle(`These are the following settings of this guild:`)
						eventEmbed.setDescription(`
• It's enabled?: ${res.events.versus.enabled ? "Yes" : "No"}

• Starting Chances for Bosses [[More info]](https://www.google.com "This is the starting chance where every boss will start with. If it fails to spawn with that chance, will be increased gradually\n with the 'increase starting chance' value."):
==> Big Boss: ${res.events.versus.settings.chances.bigBoss}%
==> Mini Boss : ${res.events.versus.settings.chances.miniBoss}%
==> Increase Starting Chance by: ${res.events.versus.settings.chances.increaseBy}%

• Duration of Big Boss: 
==> Minimum: ${res.events.versus.settings.durations.bigBoss.min} seconds (${(res.events.versus.settings.durations.bigBoss.min/60).toFixed(2)} min)
==> Maximum: ${res.events.versus.settings.durations.bigBoss.max} seconds (${(res.events.versus.settings.durations.bigBoss.max/60).toFixed(2)} min)

• Duration of Mini Boss: 
==> Minimum: ${res.events.versus.settings.durations.miniBoss.min} seconds (${(res.events.versus.settings.durations.miniBoss.min/60).toFixed(2)} min)
==> Maximum: ${res.events.versus.settings.durations.miniBoss.max} seconds (${(res.events.versus.settings.durations.miniBoss.max/60).toFixed(2)} min)

• Channels where bosses can spawn:
${res.events.versus.channels.length > 0 ? `${res.events.versus.channels.map(item => item = `- <#${item}>`).join(";\n")}` : `No channels available to spawn. Please add them using \`${prefix}vs admin channels add <#channelName>\``}
`)
						let intervalString_bigBoss = ``
						let intervalString_miniBoss = ``
						for(let i = 0; i < res.events.versus.settings.intervals.bigBoss.length; i++) {
							const timeobj = res.events.versus.settings.intervals.bigBoss[i]
							intervalString_bigBoss += `${i+1}) Interval: \`${timeobj.starting} - ${timeobj.ending}\`\n`
						}
						for(let i = 0; i < res.events.versus.settings.intervals.miniBoss.length; i++) {
							const timeobj = res.events.versus.settings.intervals.miniBoss[i]
							intervalString_miniBoss += `${i+1}) Interval: \`${timeobj.starting} - ${timeobj.ending}\`\n`
						}
						eventEmbed.addField(`Big Boss appearance intervals:`,intervalString_bigBoss);
						eventEmbed.addField(`Mini Boss appearance intervals:`,intervalString_miniBoss);
						return rep({embeds:[eventEmbed]})
					}
				}
			})
		}

		function dec2bin(dec) {
			return (dec >>> 0).toString(2);
		}
		/**
         * 
         * @param {Object} msg The object option that can contain: contents (string msg only) or embeds
         * @param {String} deleteAfter Leave 0 to not be deleted after or specify a time in seconds in string format
         */
		function rep(options,deleteAfter = "0s") {
			let thismsg;
			thismsg = message.channel.send(options)
			if (deleteAfter != "0s") {
				thismsg.then(m => {
					myUtils.mgoAdd(message.guild.id,message.channel.id,m.id,ms(deleteAfter))
				})
			}
		}
		function weaponCondition(current, base) {
			let percentage = (current / base) * 100;
			console.log(`wp hp percentage: ${percentage}%`)

			if (percentage == 0) return `This weapon is broken! Replace it with something else!`
			if (percentage < 5) return `It's close to break!!!`
			if (percentage < 20) return `Feels like it's starting to feel weak...`
			if (percentage < 40) return `Now that's what I call "**used**".`
			if (percentage < 60) return `Could have seen better days...`
			if (percentage < 80) return `A lil' bit worn off.`
			if (percentage <= 100) return `Feels like it's new!`

			// // ✅ Round to 2 decimals
			// console.log(isWhatPercentOf(20, 75).toFixed(2)); // 👉️ "26.67"

			// // ✅ Get percentage Increase / Decrease
			// function getPercentageIncrease(numA, numB) {
			// return ((numA - numB) / numB) * 100;
			// }
		}

		function getRandomInt(min, max) {
			min = Math.ceil(min);
			max = Math.floor(max);
			return Math.floor(Math.random() * (max - min + 1)) + min;
		}

		function arrayShuffle(array) {
			for ( let i = 0, length = array.length, swap = 0, temp = ''; i < length; i++ ) {
			swap        = Math.floor(Math.random() * (i + 1));
			temp        = array[swap];
			array[swap] = array[i];
			array[i]    = temp;
			}
			return array;
		}
		function percentageChance(values, chances) {
			for ( var i = 0, pool = []; i < chances.length; i++ ) {
			for ( let i2 = 0; i2 < chances[i]; i2++ ) {
				pool.push(i);
			}
			}
			return values[arrayShuffle(pool)['0']];
		}
	
	}

};
