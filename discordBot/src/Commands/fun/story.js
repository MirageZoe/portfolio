/* eslint-disable no-unused-vars */
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const SharuruEmbed = require('../../Structures/SharuruEmbed')
const Command = require('../../Structures/Command.js');
const sendError = require('../../Models/Error');
const { PermissionsBitField } = require('discord.js');
const cfg = require('../../../config.json')
const myTools = require("../../Assets/ouat_game/ouat_tools")
const fs = require('fs');
const ms = require('ms');
const gameHub = require('../../Models/ouat/gameHub');
const GuildSettings = require('../../Models/GuildSettings');
const cardDB = require("../../Assets/ouat_game/database/cards.json")

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'story',
			displaying: true,
			cooldown: 3000,
			description: 'The family friendly game "Once upon a time..."!',
			options: '-',
			usage: '-',
			example: '-',
			category: 'fun',
			userPerms: [PermissionsBitField.Flags.SendMessages],
			SharuruPerms: [PermissionsBitField.Flags.SendMessages],
			args: false,
			guildOnly: true,
			serverOnly: false,
			staffRoleOnly: false,
			ownerOnly: true,
			roleDependable: '0', // not 0, either id or name
			allowTesters: true,
			aliases: ['story']
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

        let participants = []
        let addParticipants = true;

		let phrases = {
			storyTeller: {
				skip: [
					`The storyteller started to sleep... NEXT!`,
					`It seems like the storyteller can barely keep their eyes open...`,
					`Can someone give the storyteller some energy drink? Really!`,
					`Looks lke the storyteller has to hit the sack? Who's next?`
				]
			}
		}

		//#region Embeds
        let participateEmbed = new SharuruEmbed()
			.setColor(`LUMINOUS_VIVID_PINK`)
			.setTitle(`Once upon a time...`)
			.setDescription(`Type **\`play\`** to join!`)
			.addField(`Players:`,`[${participants.length}/6](http://www.google.com)`)
		let gameEmbed = new SharuruEmbed()
			.setColor('LUMINOUS_VIVID_PINK')
			.setTitle(`Once upon a time...`)
		//#endregion

		//#region  Statistics about cards data
// 				console.log(`Statistics [${Object.keys(cartiSortate).length}]:\n
// Story:
// - Characters: ${cartiSortate.stories.Character.length}
// - Events: ${cartiSortate.stories.Event.length}
// - Places: ${cartiSortate.stories.Place.length}
// - Things: ${cartiSortate.stories.Thing.length}
// - Aspects: ${cartiSortate.stories.Aspect.length}

// Interrupt:
// - Characters: ${cartiSortate.interrupts.Character.length}
// - Events: ${cartiSortate.interrupts.Event.length}
// - Places: ${cartiSortate.interrupts.Place.length}
// - Things: ${cartiSortate.interrupts.Thing.length}
// - Aspects: ${cartiSortate.interrupts.Aspect.length}

// Endings: ${cartiSortate.endings.length}`)
				//#endregion
			
		if (args[0] == 't'){
			//#region OLD SORTING FUNCTION
				// let cardsUsed = [];
				// let parti = ['Digi','Brigi','Teemo','Yue']
				// //#region formatSorting
				// // let cartiSortate = {
				// // 	stories: {
				// // 		Character: [],
				// // 		Event: [],
				// // 		Place: [],
				// // 		Thing: [],
				// // 		Aspect: []
				// // 	},
				// // 	interrupts: {
				// // 		Character: [],
				// // 		Event: [],
				// // 		Place: [],
				// // 		Thing: [],
				// // 		Aspect: []
				// // 	},
				// // 	endings: []
				// // }
				// //#endregion
				// let proce = [];
				// let logData = true
				// //#region format from oldDB
				// // for(let i = 0; i < cardDB.length; i ++) {
				// // 	if (cardDB[i].Interrupt == "Y") {
				// // 		if(cardDB[i].Category == "Character") cartiSortate.interrupts.Character.push(cardDB[i]);
				// // 		if(cardDB[i].Category == "Event") cartiSortate.interrupts.Event.push(cardDB[i]);
				// // 		if(cardDB[i].Category == "Place") cartiSortate.interrupts.Place.push(cardDB[i]);
				// // 		if(cardDB[i].Category == "Thing") cartiSortate.interrupts.Thing.push(cardDB[i]);
				// // 		if(cardDB[i].Category == "Aspect") cartiSortate.interrupts.Aspect.push(cardDB[i]);
				// // 	} else {
				// // 		if (cardDB[i].Category != "Ending") {
				// // 			if(cardDB[i].Category == "Character") cartiSortate.stories.Character.push(cardDB[i]);
				// // 			if(cardDB[i].Category == "Event") cartiSortate.stories.Event.push(cardDB[i]);
				// // 			if(cardDB[i].Category == "Place") cartiSortate.stories.Place.push(cardDB[i]);
				// // 			if(cardDB[i].Category == "Thing") cartiSortate.stories.Thing.push(cardDB[i]);
				// // 			if(cardDB[i].Category == "Aspect") cartiSortate.stories.Aspect.push(cardDB[i]);
				// // 		} else cartiSortate.endings.push(cardDB[i]);
				// // 	}
				// // }
				// //#endregion
				// let cartiSortate = require('../../Assets/ouat_game/database/sortedCardsDB.json')
				// for(let i = 0 ; i < parti.length; i++) {
				// 	let myCards = []
				// 	// cardsUsed.push(`Player ${i} cards:`)
				// 	for(let j = 0; j < 11-parti.length; j++) {
				// 		let chosenType = myTools.getRandomInt(0,1) // choose between "story" & "interrupts"
				// 		let getType = Object.keys(cartiSortate)[chosenType] // get the type in string form
				// 		let chosenCategory = myTools.getRandomInt(0,4) // choose between Character/Event/Place/Thing/Aspect
				// 		let getCategory = Object.keys(cartiSortate[getType])[chosenCategory] // get the category in string form 
				// 		let chooseRandomCardNumber = myTools.getRandomInt(0,cartiSortate[getType][getCategory].length-1)
				// 		let getCard = cartiSortate[getType][getCategory][chooseRandomCardNumber];
				// 		// cardsUsed.push(getCard);
				// 		let indexRC = cartiSortate[getType][getCategory].findIndex(i => i.card_name == getCard.card_name)
				// 		cartiSortate[getType][getCategory].splice(indexRC,1);
				// 		myCards.push(getCard)
				// 	}
				// 	let chooseAnEnding = cartiSortate.endings[myTools.getRandomInt(0, cartiSortate.endings.length-1)]
				// 	myCards.push(chooseAnEnding)
				// 	// cardsUsed.push(chooseAnEnding)
				// 	let indexEC = cartiSortate.endings.findIndex(i => i.card_name == chooseAnEnding.card_name);
				// 	cartiSortate.endings.splice(indexEC,1)
				// 	let test = {
				// 		id: parti[i],
				// 		cards: myCards
				// 	}
				// 	proce.push(test)
				// }
				
				// console.log(proce)
				// //#region Log Finals
				// if (logData == true) {
				// 	console.log(proce[1])
				// 	console.log(proce[2])
				// 	console.log(proce[3])
				// 	// console.log(`Cards Removed:`)
				// 	// console.log(cardsUsed)
				// }
				//#endregion
			//#endregion
			
			let test = myTools.removeCardUser(issuer.id,202475,0);
			console.log(test)
			return console.log(`done`)

		}
		return console.log(`donex2`)
        try {
			//#region registering the players
            while (addParticipants && participants.length < 6) {
				participateEmbed.fields[0].value = `[${participants.length}/6](http://www.google.com)`
                await message.channel.send({embeds: [participateEmbed]}).then(async (FirstPhase) => {//`To participate in **"\`Once upon a time...\`"** you have to type **"\`play\`"**! # of Participants: \`${participants.length}/6\``
                    let filter = m => m.content
                    await message.channel.awaitMessages({
                        filter,
                        max: 1,
                        time: 30000
                    }).then(async (SecondPhase) => {
                        if (SecondPhase.first()) {
                            let MemberAnswer = SecondPhase.first().content;
                            let memberJoined = SecondPhase.first().author.id;
                            let hasAdminPerm = message.guild.members.cache.get(memberJoined).permissions.has(Permissions.FLAGS.ADMINISTRATOR);
                            if (MemberAnswer.toLowerCase() == 'stop' && (memberJoined == issuer.id || hasAdminPerm == true || cfg.owners.includes(memberJoined))) {
                                await SecondPhase.first().delete();
                                addParticipants = false;
                            } else {
                                if (MemberAnswer.toLowerCase() === "play") {
                                    // await SecondPhase.first().delete();
                                    if (!participants.includes(memberJoined)) {
										participants.push(memberJoined);
                                    	console.log(`Member joined: ${memberJoined}`)
									}
                                }
                            }
                        } else {
                            addParticipants = false;
							gameEmbed.setDescription(`The game will start now!`)
                            message.channel.send({embeds: [startGameEmbed]})
                        }
                    })
                })
            }
			//#endregion
            
			if (participants.length < 2) return message.channel.send({embeds: [notEnoughPlayersEmbed]}); //`Aw, not enough players to play. Next time gather at least 2 people to play up to 6!`

			let roleMaster = message.member.roles.cache.find(r => r.name === "Ouat Master")
			let hasAdmin = message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)
			let isOwner = cfg.owners.includes(issuer.id)

			//#region commands
			if (args[0] == 'fstop' && (roleMaster || hasAdmin || isOwner)) {
				gameHub.findOne({
					game_id: args[1]
				},(err,res)=>{
					if (err) {
						sendError.create({
							Guild_Name: message.guild.name,
							Guild_ID: message.guild.id,
							User: issuer.tag,
							UserID: issuer.id,
							Error: err,
							Time: `${TheDate} || ${clock} ${amORpm}`,
							Command: this.name + " fstop function",
							Args: args,
						},async (err, res) => {
							if(err) {
								console.log(err)
								return message.channel.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
							}
							if(res) {
								console.log(`successfully added error to database!`)
								logChannel.send(`[ouat-command] Added error to db. Please be kind and announce that to master by using \`!repcmd <command-name> <msg: an error happened using this command at...>\``)
							}
						})
					}
					if (res) {
						if (res.isGameOver == true) {
							gameEmbed.setDescription(`This game is already over!`)
							return message.channel.send({embeds: [gameEmbed]})
						} 
						res.isGameOver = true;
						res.save().catch(err => console.log(err))
						if (message.channel.id == res.gameLobbyId)
							message.channel.send({embeds: [gameEmbed]})
						else {
							message.channel.send(`Done! Ended the game at your request, ${issuer}!`)
							message.guild.channels.get(res.gameLobbyId).send({embeds: [gameEmbed]})
						}
					} else {
						gameEmbed.setDescription(`I didn't find any game with this id!`)
						return message.channel.send({embeds: [gameEmbed]})
					}
				})
			}

			if (args[0] == 'lock' && (roleMaster || hasAdmin || isOwner)) {
				GuildSettings.findOne({
					ID: message.guild.id
				},(err,res)=>{
					if (err) {
						sendError.create({
							Guild_Name: message.guild.name,
							Guild_ID: message.guild.id,
							User: issuer.tag,
							UserID: issuer.id,
							Error: err,
							Time: `${TheDate} || ${clock} ${amORpm}`,
							Command: this.name + " lock function",
							Args: args,
						},async (err, res) => {
							if(err) {
								console.log(err)
								return message.channel.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
							}
							if(res) {
								console.log(`successfully added error to database!`)
								logChannel.send(`[ouat-command] Added error to db. Please be kind and announce that to master by using \`!repcmd <command-name> <msg: an error happened using this command at...>\``)
							}
						})
					}
					if (res) {
						if (res.games.ouat.isLocked == true) {
							gameEmbed.setDescription(`The game module is already locked!`)
							return message.channel.send({embeds: [gameEmbed]})
						} 
						res.games.ouat.isLocked = true;
						res.save().catch(err => console.log(err))
						gameEmbed.setDescription(`I have locked the game module so from now on no more games can be created!`)
						message.channel.send({embeds: [gameEmbed]})
					}
				})
			}

			if (args[0] == 'open' && (roleMaster || hasAdmin || isOwner)) {
				GuildSettings.findOne({
					ID: message.guild.id
				},(err,res)=>{
					if (err) {
						sendError.create({
							Guild_Name: message.guild.name,
							Guild_ID: message.guild.id,
							User: issuer.tag,
							UserID: issuer.id,
							Error: err,
							Time: `${TheDate} || ${clock} ${amORpm}`,
							Command: this.name + " open function",
							Args: args,
						},async (err, res) => {
							if(err) {
								console.log(err)
								return message.channel.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
							}
							if(res) {
								console.log(`successfully added error to database!`)
								logChannel.send(`[ouat-command] Added error to db. Please be kind and announce that to master by using \`!repcmd <command-name> <msg: an error happened using this command at...>\``)
							}
						})
					}
					if (res) {
						if (res.games.ouat.isLocked == false) {
							gameEmbed.setDescription(`The game module is already unlocked!`)
							return message.channel.send({embeds: [gameEmbed]})
						} 
						res.games.ouat.isLocked = false;
						res.save().catch(err => console.log(err))
						gameEmbed.setDescription(`I have unlocked the game module so from now on, games can be created!`)
						message.channel.send({embeds: [gameEmbed]})
					}
				})
			}
			//#endregion

			// checking if we can create more games
			GuildSettings.findOne({
				ID: message.guild.id
			},(err,res)=>{
				if (err) {
					sendError.create({
						Guild_Name: message.guild.name,
						Guild_ID: message.guild.id,
						User: issuer.tag,
						UserID: issuer.id,
						Error: err,
						Time: `${TheDate} || ${clock} ${amORpm}`,
						Command: this.name + " search if locked function",
						Args: args,
					},async (err, res) => {
						if(err) {
							console.log(err)
							return message.channel.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
						}
						if(res) {
							console.log(`successfully added error to database!`)
							logChannel.send(`[ouat-command] Added error to db. Please be kind and announce that to master by using \`!repcmd <command-name> <msg: an error happened using this command at...>\``)
						}
					})
				}
				if (res) {
					gameEmbed.setDescription(`You can't create a game at the moment, please come back later. If you think this is a problem, please contact the staff!`)
					if (res.games.ouat.isLocked == true) return message.channel.send({embeds: [gameEmbed]})
					gameEmbed.setDescription(``);
				}
			})

			//#region Settings
			let cartiSortate = require('../../Assets/ouat_game/database/sortedCardsDB.json')
			let gameID = await myTools.create_gameSessionID(message.guild.id)
			let processedParticipants = []
			let GAMEOVER = false;
			let turn = 0;
			let storyTellerAfk = false;

			//#region Give cards, buttons + save the game record in DB
			for(let i = 0 ; i < participants.length; i++) {
				let myCards = []
				for(let j = 0; j < 11-participants.length; j++) {
					let chosenType = myTools.getRandomInt(0,1) // choose between "story" & "interrupts"
					let getType = Object.keys(cartiSortate)[chosenType] // get the type in string form
					let chosenCategory = myTools.getRandomInt(0,4) // choose between Character/Event/Place/Thing/Aspect
					let getCategory = Object.keys(cartiSortate[getType])[chosenCategory] // get the category in string form 
					let chooseRandomCardNumber = myTools.getRandomInt(0,cartiSortate[getType][getCategory].length-1)
					let getCard = cartiSortate[getType][getCategory][chooseRandomCardNumber];
					let indexRC = cartiSortate[getType][getCategory].findIndex(i => i.card_name == getCard.card_name)
					cartiSortate[getType][getCategory].splice(indexRC,1);
					myCards.push(getCard)
				}
				let chooseAnEnding = cartiSortate.endings[myTools.getRandomInt(0, cartiSortate.endings.length-1)]
				myCards.push(chooseAnEnding)
				let indexEC = cartiSortate.endings.findIndex(i => i.card_name == chooseAnEnding.card_name);
				cartiSortate.endings.splice(indexEC,1)
				let test = {
					id: participants[i],
					cards: myCards
				}
				processedParticipants.push(test)

				//send cards
				let showCards = (await myTools.formatCards(myCards)).toString()
				gameEmbed.setDescription(`**Your hand:**\n\n${showCards}`);
				message.guild.members.cache.get(participants[i]).send({embeds: [gameEmbed]})
				// gameEmbed.fields = []
			}
			gameHub.create({
				guild_name: message.guild.name,
				guild_id: message.guild.id,
				game_id: gameID,
				participants: processedParticipants,
				isGameOver: false,
				gameLobbyId: message.channel.id,
				time: `${TheDate} || ${clock} ${amORpm}`,
			})
			const row = new ActionRowBuilder()
					.addComponents(
						new ButtonBuilder()
						.setCustomId('to do button "bad storyteller!"')
						.setEmoji("📌")
						.setLabel("Bad Storyteller!")
						.setStyle(ButtonStyle.Primary)
					)
			//#endregion
			//#endregion
			
			setTimeout(() => {
				message.channel.send(`First to start will be <@${participants[turn]}>! Anyone else that thinks the storyteller:\n-is rambling for too long;\n- can't come up with next part of story\n- story convolutes & contradicts with previous events;\n- simply doens't make any goddamn sense;\n- plays card that does almost nothing to contribute to the story\n\nPlease press on "Bad Storyteller!" for everyone to vote (majority vote)!`)
			}, 1000);
			setTimeout(() => {
				message.channel.send(`The game starts in less than 3 seconds!`);
			}, 2000);

			setTimeout(() => {
				

			while(!GAMEOVER) {
				//check whenver the game ended.
				gameHub.findOne({
					game_id: gameID
				},async (err,res)=>{
					if (err) {
						sendError.create({
							Guild_Name: message.guild.name,
							Guild_ID: message.guild.id,
							User: issuer.tag,
							UserID: issuer.id,
							Error: err,
							Time: `${TheDate} || ${clock} ${amORpm}`,
							Command: this.name + " main game while function",
							Args: args,
						},async (err, res) => {
							if(err) {
								console.log(err)
								return message.channel.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
							}
							if(res) {
								console.log(`successfully added error to database!`)
								logChannel.send(`[ouat-command] Added error to db. Please be kind and announce that to master by using \`!repcmd <command-name> <msg: an error happened using this command at...>\``)
							}
						})
					}
					if (res){
						GAMEOVER = res.isGameOver;
					}
				})
				gameEmbed.setDescription(`<@${participants[turn]}>, drop the card & develop the story!

\nNote: To drop a card, click on "Drop a card" button and type the number corresponding to the position of the card in your hand.
To keep the Storyteller Title, you must type \`s\` from 2-3 min to 2-3 min, otherwise you will be counted as you're afk and the storyteller title will be given to the next person and u will draw a new card.`)
				// await message.channel.send({embeds: [gameEmbed]}).then(async (FirstTurn) =>{
				// 	let filter2 = m => m.author.id === players[turn];
				// 	await message.channel.awaitMessages({
				// 		filter2,
				// 		max: 1,
				// 		time: 300 * 1000
				// 	}).then(async (SecondTurn) =>{
				// 		if (!SecondTurn.first()) { // user didn't answer in time, afk, go next
				// 			storyTellerAfk = true;
				// 			gameEmbed.setDescription(`${phrases.storyTeller.skip[myTools.getRandomInt(0,phrases.storyTeller.skip.length-1)]} <@${participants[turn+1]}>, you're next. `)
				// 			message.channel.send({embeds: [gameEmbed]})
				// 		} else {
				// 			let response = SecondTurn.first().content.trim();
				// 			// if ()
				// 		}
				// 	})
				// })
			}
			}, 5000);

        } catch (error) {
           console.log(error)
           console.log(`eroare!`) 
        }
		return console.log(`done`)
	}

};
