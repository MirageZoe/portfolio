/* eslint-disable no-unused-vars */
const Command = require('../../Structures/Command.js');
const sendError = require('../../Models/Error');
const SharuruEmbed = require('../../Structures/SharuruEmbed')
const fs = require('fs');
const ms = require('ms');
const config = require("../../../config.json");
const profiles = require('../../Models/profiles.js');
const { PermissionsBitField } = require('discord.js')


module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'dice',
			displaying: true,
			cooldown: 3000,
			description: `Guess each dice and win coins! In this game, you will have to guess what number each dice will drop. The position matters, which means that if you try to guess 2 dices: "1 3 5", if you say "3 5 1", you didn\'t win anything. Each guess will win you the exact amount of coins that the number dropped: if u got a 6 right, u got 6 coins, if 1, u get 1 coin.`,
			options: 'N/A',
			usage: '1 6',
			example: ' 1 6',
			category: 'fun',
			userPerms: [PermissionsBitField.Flags.SendMessages],
			SharuruPerms: [PermissionsBitField.Flags.SendMessages],
			args: true,
			guildOnly: true,
			staffRoleOnly: false,
			ownerOnly: false,
			roleDependable: '0', // not 0, either id or name
			allowTesters: false,
			aliases: ['']
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
        const myUtils = this.client.utils;

		let amORpm;
		if (hrs >= 0 && hrs <= 12) {
			amORpm = 'AM';
		} else {
			amORpm = 'PM';
		}

		//#region error form
		// sendError.create({
		// 	Guild_Name: message.guild.name,
		// 	Guild_ID: message.guild.id,
		// 	User: issuer.tag,
		// 	UserID: issuer.id,
		// 	Error: error,
		// 	Time: `${TheDate} || ${clock} ${amORpm}`,
		// 	Command: this.name,
		// 	Args: args,
		// },async (err, res) => {
		// 	if(err) {
		// 		console.log(err)
		// 		return message.channel.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
		// 	}
		// 	if(res) {
		// 		console.log(`successfully added error to database!`)
		// 	}
		// })
		//#endregion

		/**
		 * Guess the dice:
		- guess what's the number the dice will drop on (1-6)
		- can guess more dices if u want (max 10)
		- you get up to 6 coins depending on the number you guessed
		- if u guessed more dices, the amount will be calculated this way: 	1st * 2nd + 3rd * 4th + 5th * 6th + ....
		- if you guess 1/2 dices, you don't pay any coins.
		- if u guess more than 2 dices, you will pay an amount of coins based on the number of the dices u wanted to guess
		 */

		if (args[0] == "t") {

			let test = [1,5,3,6,0,3,0,0,2]
			console.log(test.filter(item => item > 0))
			return;
		}

		let diceEmbed = new SharuruEmbed()
			.setColor(`LUMINOUS_VIVID_PINK`)
			.setFooter(`Requested by ${issuer.tag}`)

		let diceNumbers = [1,2,3,4,5,6]
		let dicesThrownBySharuru = []
		let dicesGuessedByUser = []

		if (args.length == 0 || args.length > 10) {
			diceEmbed.setDescription(`You need to specify at least 1 dice and no more than 10 dices!`)
			return rep({embeds: [diceEmbed]},"10s")
		}

		// calculate the amount of coins needed if more than 2
		
		await profiles.findOne({
			userID: issuer.id
		},(err,res) =>{
			if (err) console.log(err)
			if (res) {
				let servers_Data = res.servers_data
				let serverStats = servers_Data.get(message.guild.id)

				// if the user tries to guess more than 2 dices, check if they have the coins required. reject otherwise.
				if (args.length > 2) {
					if (3 * (args.length - 2) > serverStats.money) {
						diceEmbed.setDescription(`You need more coins to be able to guess more dices!`)
						return rep({embeds: [diceEmbed]},"10s")
					}
					serverStats.money -= 3 * (args.length - 2)
				}
				
				// generate some dices
				for(let i = 0; i < args.length; i++) {
					let generateDice = percentageChance(diceNumbers,[1,1,1,1,1,1])
					dicesThrownBySharuru.push(generateDice)
				}

				// compare the dices
				for (let i = 0; i < dicesThrownBySharuru.length; i++) {

					// first verify that the user sent a number bcs someetimes it can be dumb.
					if (isNaN(args[i])) {
						diceEmbed.setDescription(`Please next time specify a number instead of anything else. You have said "${args[i]}" as #${i+1} dice.`)
						return rep({embeds: [diceEmbed]})
					}

					// verify if it's not a zecimal but it might not be needed
					if (!Number.isInteger(Number(args[i]))) {
						diceEmbed.setDescription(`Please next time specify an integer and not zecimal! You have said "${args[i]}" as #${i+1} dice.`)
						return rep({embeds: [diceEmbed]})
					}
				
					// verify if user gave numbers between 1 and 6
					if (!diceNumbers.includes(Number(args[i]))) {
						diceEmbed.setDescription(`This number isn't valid! My dices are numbered from 1 to 6!`)
						return rep({embeds: [diceEmbed]},"10s")
					}
					
					// if dice in "i" place from dices thrown by sharuru is == to dices said by user, place 1, otherwise 0
					if (dicesThrownBySharuru[i] == args[i]) 
						dicesGuessedByUser.push(dicesThrownBySharuru[i])
					else 
						dicesGuessedByUser.push(0)
				}

				console.log(`Dices told by user: """"""${args.join(", ")}"`)
				console.log(`Dices thrown by Sharuru: "${dicesThrownBySharuru.join(", ")}"`)
				console.log(`Dices guessed by user: """${dicesGuessedByUser.join(", ")}"`)

				let coinsGained = 0;
				let lastIndex = -1
				let multipliedLastIndex = -1

				for (let i = 0; i < dicesGuessedByUser.length; i++) {
					
					let currentDice = dicesGuessedByUser[i]
					let futureDice = dicesGuessedByUser[i+1] 

					// if the current dice and future dice are guessed right, multiply them and next
					if (currentDice != 0 && (futureDice != 0 && futureDice != undefined) && multipliedLastIndex != i) {
						// make sure it's not counting the future one to be added as well after multiplying
						if (lastIndex == i) continue;
						coinsGained += currentDice * futureDice
						lastIndex = i+1;
						multipliedLastIndex = i+2
						console.log(`[dice]: This coin (v:${currentDice}/pos:${i}) was multiplied with future one (v:${futureDice}/pos:${i+1}) bcs it was guessed right! set lastIndex ${lastIndex}`)
					} else {
						if (lastIndex == i) continue;
						coinsGained += currentDice;
						console.log(`[dice]: This coin (v:${currentDice}/pos:${i}) was added as result of not guessing the future coin`)
					}
					console.log(`[dice-report]: total gain: ${coinsGained} | lastIndex: ${lastIndex} | i:${i}`)
				}
				//console.log(`[dice-FINAL]: Total coins gained: ${coinsGained}. Total coins paid for multiple draws: ${3 * (args.length - 2)}`)

				diceEmbed.setDescription(`Okay, let's see what we got here:`)
				.addFields([
					{name: `Dices thrown:`,value: `***${dicesThrownBySharuru.join(", ")}***`, inline: true},
					{name: `Dices told by you:`,value: `***${args.join(", ")}***`, inline: true},
					{name: `So far:`,value: `
		- ${dicesGuessedByUser.filter(item => item > 0).length > 0 ? `you have guessed about ${dicesGuessedByUser.filter(i => i > 0).length} dice(s) *(${dicesGuessedByUser.filter(i => i > 0 && dicesThrownBySharuru.includes(i))})*` : `you didn't guess any dice sadly...`};
		- you have won a total of **${coinsGained} coin(s)** from this round;
		${args.length > 2 ? `- because you throwed more than 2 dices (about ${args.length}), you have paid an additional **${3 * (args.length-2)}** coins;\n- goodluck next time!` : `- goodluck next time!`}
		`, inline: false},
				])
				serverStats.money += coinsGained
				servers_Data.set(message.guild.id,serverStats)
				rep({embeds: [diceEmbed]})
				profiles.updateOne({
					'userID': `${issuer.id}`
				},{'$set':{ 'servers_data' : servers_Data}},(erro,reso)=>{
					if (erro) {
						sendError.create({
							Guild_Name: message.guild.name,
							Guild_ID: message.guild.id,
							User: issuer.username,
							UserID: issuer.id,
							Error: erro,
							Time: `${TheDate} || ${clock} ${amORpm}`,
							Command: this.name + `- tried to update the coins paid `,
							Args: args,
						},async (errr, ress) => {
							if(errr) {
								console.log(errr)
								return logChannel.send(`[${this.name}]: Unfortunately an problem appeared while trying to take the payment from ${issuer.tag} user. Please try again later. If this problem persist, contact my partner!`)
							}
							if(ress) {
								console.log(`successfully added error to database!`)
							}
						})
						return;
					}
					if(reso) {
						// console.log(reso)
						console.log(`[Dice minigame]: Successfully updated ${issuer.username} (${issuer.id}) wallet for additional dices if possible`)
					}
				});
				//console.log(`inside the profiles query and passed the requirement of ${3*(args.length-2)} coins`)

				// check event
				let eventData = res.events.versus;
                let getMissionData = eventData.missions.list.find(item => item.id == 6)

				// if the mission is completed already, return
                if (getMissionData.completed == true) return console.log(`[Versus Event-Dice minigame # ${TheDate}-${clock} ${amORpm}]: User ${issuer.username} (${issuer.id}) completed this mission already for today! No more.`)

				// complete the mission & add the reward points to our player
                getMissionData.finished++;
                if (getMissionData.finished >= getMissionData.perDay) getMissionData.completed = true;
                eventData.reward += getMissionData.reward
                for (let i = 0; i < eventData.missions.list.length; i++) {
                    if (eventData.missions.list[i].id == 6)
                        eventData.missions.list[i] = getMissionData
                }

                console.log(`[Versus Event-Dice minigame # ${TheDate}-${clock} ${amORpm}]: User ${issuer.username} (${issuer.id}) completed a dice minigame mission (${getMissionData.finished}/${getMissionData.perDay})!`)
                profiles.updateOne({
                    'userID': `${issuer.id}`
                },{'$set':{ 'events.versus' : eventData}},(erro,reso)=>{
                    if (erro) {
                        sendError.create({
                            Guild_Name: message.guild.name,
                            Guild_ID: message.guild.id,
                            User: issuer.username,
                            UserID: issuer.id,
                            Error: erro,
                            Time: `${TheDate} || ${clock} ${amORpm}`,
                            Command: this.name + `, update VSEV MISSION LIST -dice minigame `,
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
                        // console.log(reso)
                        console.log(`[VersusEvent-Missions]: Successfully Updated ${issuer.username} (${issuer.id}) mission list (dice).`)
                    }
                });
			}
		})


		/**
         * 
         * @param {Object} options The object containing possible "content(msg)/embeds/components/files etc".
         * @param {String} deleteAfter the time after which to delete. If null/0, it will not execute.
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
