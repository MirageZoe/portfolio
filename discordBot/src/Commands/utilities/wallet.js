/* eslint-disable no-unused-vars */
const Command = require('../../Structures/Command.js');
const sendError = require('../../Models/Error');
const SharuruEmbed = require('../../Structures/SharuruEmbed')
const fs = require('fs');
const ms = require('ms');
const profileSys = require("../../Models/profiles");
require("dotenv").config()
const config = require("../../../config.json")
const missionDATA = require("../../Assets/events/versus/versus_missions.json")
const myNickGen = require("fantasy-name-generator");
const { PermissionsBitField, Colors} = require('discord.js');


module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'wallet',
			displaying: true,
			cooldown: 3000,
			description: 'Your virtual wallet! Shows your money and loan!',
			options: `- <no argument> => Shows your money and loans (if u have).\n- loan <number up to ${process.env.LOAN_LIMIT}> => you can loan up to 4500 with a ${process.env.LOAN_INTEREST}% interest!\n- payloan <number>/ pay <number> => pay your loan! Additional money are returned.\n- \`daily\` => get daily money. Get bonus coins based on day counts up to 14days then resets`,
			usage: 'loan 500 => loan 500 ruru points!',
			example: 'payloan 750 => pay the 500 loan and return the 250!',
			category: 'utilities',
			userPerms: [PermissionsBitField.Flags.SendMessages],
			SharuruPerms: [PermissionsBitField.Flags.SendMessages],
			args: false,
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

		let amORpm;
		if (hrs >= 0 && hrs <= 12) {
			amORpm = 'AM';
		} else {
			amORpm = 'PM';
		}

		let option = args[0]?.toLowerCase();
		let amount = Number(args[1]);
        const myUtils = this.client.utils;

		let walletEmbed = new SharuruEmbed()
		.setTitle(`${issuer.tag}'s wallet`)
		.setColor(Colors.LuminousVividPink)
		.setFooter({text: `Requested by ${issuer.tag}`})
		
		profileSys.findOne({
			userID: issuer.id
		},async(err,res) =>{
			if (err) {
				sendError.create({
					Guild_Name: message.guild.name,
					Guild_ID: message.guild.id,
					User: issuer.tag,
					UserID: issuer.id,
					Error: error,
					Time: `${TheDate} || ${clock} ${amORpm}`,
					Command: this.name,
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
				let userSVData = res.servers_data
				let thisServerData = userSVData.get(message.guild.id)
				console.log(`How it looks like before change:`)
				console.log(thisServerData)
				if (thisServerData == undefined) {
					let nobj = {
						exp: 0,
						money: 1000,
						level: 1,
						loan: 0,
						loanTurns: 0,
						guildName: message.guild.name,
						dailyGroup: {
							isWeekTwo: false,
							daysCollected: 0,
							lastDateCollected: "",
							collectedToday: false
						}
					}
					thisServerData = nobj
					profileSys.updateOne({
						'userID': `${issuer.id}`
					},{'$set':{ 'servers_data' : userSVData}},(erro,reso)=>{
						if (erro) {
							sendError.create({
								Guild_Name: message.guild.name,
								Guild_ID: message.guild.id,
								User: message.user.username,
								UserID: message.user.id,
								Error: erro,
								Time: `${TheDate} || ${clock} ${amORpm}`,
								Command: this.name + `, update undefined server data `,
								Args: args,
							},async (errr, ress) => {
								if(errr) {
									console.log(errr)
									return logChannel.send(`[${this.name}]: Unfortunately an problem appeared while trying to save data of an user.Please try again later. If this problem persist, contact my partner!`)
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
					userSVData.set(message.guild.id,nobj)
				}
				
				// just a check in case they might not exist
				if (thisServerData.loan == undefined || thisServerData.loan == null ||
					thisServerData.loanTurns == undefined || thisServerData.loanTurns == null) {
						thisServerData.loan = 0;
						thisServerData.loanTurns = 0;
					}
				if(option == 'loan'){
					if (!amount) {
						walletEmbed.setDescription(`You have to provide an amount to be able to loan!`)
						return rep({embeds: [walletEmbed]},true,"10s")
					}
					if (isNaN(amount)) {
						walletEmbed.setDescription(`Please provide a number to loan/pay loan!`)
						return rep({embeds: [walletEmbed]},true,"10s")
					}
					if (thisServerData.loan >= process.env.LOAN_LIMIT) {// if the user did reach the limit of loaning
						walletEmbed.setDescription(`You can't loan anymore since you reached the limit of ${process.env.LOAN_LIMIT} rurupoints!`)
						return rep({embeds: [walletEmbed]},true,"10s");
					}
					if (Number(amount) + Number(thisServerData.loan) >= process.env.LOAN_LIMIT) { // if the amount he's requesting is going over the loan
						walletEmbed.setDescription(`Unfortunately you can't loan that much because it would go over the limit!`)
						return rep({embeds: [walletEmbed]},true,"10s");
					}
					let loanText = ``
					thisServerData.money = Number(thisServerData.money) + amount;
					thisServerData.loan += Number(amount);
					thisServerData.loanTurns++
					if(thisServerData.loan > 0)
						if(thisServerData.loanTurns % 3 == 0){
							let CurrentInterestToADD = (Number(process.env.LOAN_INTEREST)/100) * thisServerData.loan * (thisServerData.loanTurns == 0 ? 1 : thisServerData.loanTurns)  
							thisServerData.loan = Math.round(thisServerData.loan + CurrentInterestToADD)
							loanText += `\nThe payback of the loan you took increased by ${process.env.LOAN_INTEREST}% of your current loan! If u don't want your payback to get higher, pay asap  your loan!`
						}

					walletEmbed.setDescription(`You took a loan of ${amount} rurupoints. Currently you're in a debt of ${thisServerData.loan} rurupoints!\n${loanText}`)
					userSVData.set(message.guild.id,thisServerData)
					profileSys.updateOne({
						'userID': `${issuer.id}`
					},{'$set':{ 'servers_data' : userSVData}},(erro,reso)=>{
						if (erro) {
							sendError.create({
								Guild_Name: message.guild.name,
								Guild_ID: message.guildId,
								User: issuer.tag,
								UserID: issuer.id,
								Error: erro,
								Time: `${TheDate} || ${clock} ${amORpm}`,
								Command: this.name + `, user look loan`,
								Args: args,
							},async (errr, ress) => {
								if(errr) {
									console.log(errr)
									return logChannel.send(`[${this.name}]: Unfortunately an problem appeared in taking the loan in the wallet command. Please try again later. If this problem persist, contact my partner!`)
								}
								if(ress) {
									console.log(`successfully added error to database!`)
								}
							})
							return;
						}
						if(reso) {
							console.log(`[${this.name}-payloan]: done ${issuer.id}`)
						}
					});
					console.log("How it looks like after change")
					console.log(thisServerData)
					return rep({embeds: [walletEmbed]},true,"30s")
				}
				if(option == 'payloan' || option == 'pay'){
					if (!amount) {
						walletEmbed.setDescription(`You have to provide an amount to be able to loan!`)
						return rep({embeds: [walletEmbed]},true,"10s")
					}
					if (isNaN(amount)) {
						walletEmbed.setDescription(`Please provide a number to loan/pay loan!`)
						return rep({embeds: [walletEmbed]},true,"10s")
					}
					if (thisServerData.loan == 0) {// if user doesn't have a loan...
						walletEmbed.setDescription(`You are clean so there is no debt to pay!`)
						return rep({embeds: [walletEmbed]},true,"5s")
					}
					if (thisServerData.money < amount) {// if user doesn\'t have enough money to pay the loan
						walletEmbed.setDescription(`You don't own that much points to pay the loan! You have only ${thisServerData.money}!`)
						return rep({embeds: [walletEmbed]},true,"10s")
					}
					let oldLoan = Number(thisServerData.loan)
					let rest = 0;
					if (thisServerData.loan < amount) {// if the user pays an amount larger than the loan, give back the rest of the money
						rest = amount - oldLoan
						thisServerData.money = thisServerData.money - amount + rest;
						thisServerData.loan = 0;
						thisServerData.loanTurns = 0;
						userSVData.set(message.guild.id,thisServerData)
						profileSys.updateOne({
							'userID': `${issuer.id}`
						},{'$set':{ 'servers_data' : userSVData}},(erro,reso)=>{
							if (erro) {
								sendError.create({
									Guild_Name: message.guild.name,
									Guild_ID: message.guildId,
									User: issuer.tag,
									UserID: issuer.id,
									Error: erro,
									Time: `${TheDate} || ${clock} ${amORpm}`,
									Command: this.name + `, restore money bcs user paid more than the loan`,
									Args: args,
								},async (errr, ress) => {
									if(errr) {
										console.log(errr)
										return logChannel.send(`[${this.name}]: Unfortunately an problem appeared in paying the loan in the wallet command. Please try again later. If this problem persist, contact my partner!`)
									}
									if(ress) {
										console.log(`successfully added error to database!`)
									}
								})
								return;
							}
							if(reso) {
								console.log(`[${this.name}-payloan]: done ${issuer.id}`)
							}
						});
						walletEmbed.setDescription(`You paid the entire loan u had! Awesome! Also because you paid more than u had, the remaining rurupoints were returned back! Hope we can make more business in future!`)
						return rep({embeds: [walletEmbed]},true,"10s")
					}
					/** take a % (from loan) to remove also a % from loanturns. 
					 * E.g: you have a loan of 10 and 10 turns
					 * you paid 6 points so that means u have paid about 60% of the total loan
					 * then you will also lose 60% of the loanturns 
					 * */
					thisServerData.loan -= amount; // take the loan
					thisServerData.money -= amount; // take the money
					thisServerData.loanTurns -= Math.round((getPerDiff(oldLoan,thisServerData.loan)/100) * thisServerData.loanTurns)
					userSVData.set(message.guild.id,thisServerData)
					profileSys.updateOne({
						'userID': `${issuer.id}`
					},{'$set':{ 'servers_data' : userSVData}},(erro,reso)=>{
						if (erro) {
							sendError.create({
								Guild_Name: message.guild.name,
								Guild_ID: message.guildId,
								User: issuer.tag,
								UserID: issuer.id,
								Error: erro,
								Time: `${TheDate} || ${clock} ${amORpm}`,
								Command: this.name + `, user paid ${amount} loan from ${oldLoan}`,
								Args: args,
							},async (errr, ress) => {
								if(errr) {
									console.log(errr)
									return logChannel.send(`[${this.name}]: Unfortunately an problem appeared in paying the loan in the wallet command. Please try again later. If this problem persist, contact my partner!`)
								}
								if(ress) {
									console.log(`successfully added error to database!`)
								}
							})
							return;
						}
						if(reso) {
							console.log(`[${this.name}-payloan]: done ${issuer.id}`)
						}
					});
					console.log("How it looks like after change")
					console.log(thisServerData)
					walletEmbed.setDescription(`You paid ${amount} rurupoints and now you're ${thisServerData.loan == 0 ? `no more in debt! Congrats! Hope I can do more business with you in future` : `in debt with ${thisServerData.loan} rurupoints more`}!`)
					return rep ({embeds: [walletEmbed]},true,"10s")
				}
				if(option == "daily") {
					//#region Versus event
					if (res.events.versus.team == "finished") {
						let eventData = res.events.versus;
						let getMissionData = res.events.versus.missions.list.find(item => item.id == 5)
		
						// if the mission is completed already, return
						if (getMissionData.completed != true) {
							// complete the mission & add the damage points to our player
							getMissionData.finished++;
							if (getMissionData.finished >= getMissionData.perDay) getMissionData.completed = true;
							eventData.reward += getMissionData.reward
							for (let i = 0; i < eventData.missions.list.length; i++) {
								if (eventData.missions.list[i].id == 5) {
									eventData.missions.list[i] = getMissionData
								}
							}
							profileSys.updateOne({
								'userID': `${issuer.id}`
							},{'$set':{ 'events.versus' : eventData}},(erro,reso)=>{
								if (erro) {
									sendError.create({
										Guild_Name: message.guild.name,
										Guild_ID: message.guild.id,
										User: issuer.tag,
										UserID: issuer.id,
										Error: erro,
										Time: `${TheDate} || ${clock} ${amORpm}`,
										Command: this.name + `, update vsEV MISSION LIST -daily `,
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
									console.log(`[VersusEvent-Missions]: Successfully Updated ${issuer.tag} (${issuer.id}) mission list (daily).`)
								}
							});
						} else console.log(`[Versus Event-Daily # ${TheDate}-${clock} ${amORpm}]: User ${issuer.tag} (${issuer.id}) completed this mission already!`)
					}
					//#endregion
					let base_money = 100;
					
					// if the object is not found, create it
					if (!thisServerData.dailyGroup) {
						thisServerData.dailyGroup = {
							isWeekTwo: false,
							daysCollected: 1,
							lastDateCollected: new Date(),
							collectedToday: true
						}
						thisServerData.money += base_money;
						userSVData.set(message.guild.id,thisServerData)
						profileSys.updateOne({
							'userID': `${issuer.id}`
						},{'$set':{ 'servers_data' : userSVData}},(erro,reso)=>{
							if (erro) {
								sendError.create({
									Guild_Name: message.guild.name,
									Guild_ID: message.guildId,
									User: issuer.tag,
									UserID: issuer.id,
									Error: erro,
									Time: `${TheDate} || ${clock} ${amORpm}`,
									Command: this.name + `, user daily`,
									Args: args,
								},async (errr, ress) => {
									if(errr) {
										console.log(errr)
										return logChannel.send(`[${this.name}]: Unfortunately an problem appeared in daily subcommand of wallet command. Please try again later. If this problem persist, contact my partner!`)
									}
									if(ress) {
										console.log(`successfully added error to database!`)
									}
								})
								return;
							}
							if(reso) {
								console.log(`[${this.name}-daily]: done ${issuer.id}`)
							}
						});
						console.log(`first timer`)
						walletEmbed.setDescription(`You have collected the daily coins! Collecting consecutively will increase the coins you get, up to 2 weeks!`)
						return rep({embeds: [walletEmbed]},true,"10s")
					}

					// checking if they collected today, if yes, leave it and return
					// if no, turn off collected Today to continue
					let previousCollected = new Date(thisServerData.dailyGroup.lastDateCollected)
					let yesterdayDate = new Date(new Date().getTime() - 24*60*60*1000);
					if (new Date().getDate() != previousCollected.getDate()) thisServerData.dailyGroup.collectedToday = false;

					if (thisServerData.dailyGroup.collectedToday == true) {
						console.log(`this user ${issuer.tag} collected already daily!`)
						walletEmbed.setDescription(`You've collected the daily coins for this day already! Come back tomorrow for more! You're currently been collecting for **${thisServerData.dailyGroup.daysCollected} day(s)**!`)
						return rep({embeds: [walletEmbed]},true,"10s")
					}

					// we check if the player collected yesterday, if yes, continue the streak
					// if player checked 7+ days, week two is on
					// if player checked 15+ week two is off and reset days collected
					let collectedYesterday = false;
					let collectedYesterday2 = false;
					if (yesterdayDate.getDate() == previousCollected.getDate()) collectedYesterday = true;
					if (yesterdayDate.getMonth() == previousCollected.getMonth()) collectedYesterday2 = true;

					if (collectedYesterday && collectedYesterday2) {// if the user collected yesterday
						console.log(`user collected yesterday`)
						thisServerData.dailyGroup.daysCollected++;
						thisServerData.dailyGroup.lastDateCollected = new Date();
						if (thisServerData.dailyGroup.daysCollected > 7)
							thisServerData.dailyGroup.isWeekTwo = true;
					
						if (thisServerData.dailyGroup.daysCollected > 14) {
							thisServerData.dailyGroup.isWeekTwo = false;
							thisServerData.dailyGroup.daysCollected = 2
						}
						let bonusMoney = (thisServerData.dailyGroup.isWeekTwo == true ? 11 : 10) * thisServerData.dailyGroup.daysCollected
						thisServerData.money += base_money + bonusMoney
						console.log(`money gained: ${base_money + bonusMoney}`)
						thisServerData.dailyGroup.collectedToday = true;
					} else { // reset the progression bcs he collected 1 day later than the yesterday
						console.log(`user didn't collect yesterday`)
						thisServerData.dailyGroup.collectedToday = true;
						thisServerData.dailyGroup.daysCollected = 1;
						thisServerData.dailyGroup.lastDateCollected = new Date();
						thisServerData.dailyGroup.isWeekTwo = false;
						thisServerData.money += base_money
					}
					userSVData.set(message.guild.id,thisServerData)
					profileSys.updateOne({
						'userID': `${issuer.id}`
					},{'$set':{ 'servers_data' : userSVData}},(erro,reso)=>{
						if (erro) {
							sendError.create({
								Guild_Name: message.guild.name,
								Guild_ID: message.guildId,
								User: issuer.tag,
								UserID: issuer.id,
								Error: erro,
								Time: `${TheDate} || ${clock} ${amORpm}`,
								Command: this.name + `, user daily`,
								Args: args,
							},async (errr, ress) => {
								if(errr) {
									console.log(errr)
									return logChannel.send(`[${this.name}]: Unfortunately an problem appeared in daily subcommand of wallet command. Please try again later. If this problem persist, contact my partner!`)
								}
								if(ress) {
									console.log(`successfully added error to database!`)
								}
							})
							return;
						}
						if(reso) {
							console.log(`[${this.name}-daily]: done ${issuer.id}`)
						}
					});
					walletEmbed.setDescription(`Awesome, you collected your daily coins! Currently having ${thisServerData.money} ruru points! ${thisServerData.dailyGroup.daysCollected > 1 ? `Currently collecting for **${thisServerData.dailyGroup.daysCollected} days** continuously!`: ""}`)
					return rep({embeds: [walletEmbed]},true,"10s")
				}
				walletEmbed.setThumbnail(`https://media.discordapp.net/attachments/769228052165033994/983303213283409930/wallet.png`)
				.addFields([
					{name: "Ruru points:",value: `${thisServerData.money}`},
					{name: config.extra.emptyField, value:config.extra.emptyField , inline: false},
					{name: `P.S: When you make a loan, you have to be careful because you have an interest rate of ${process.env.LOAN_INTEREST}%!`, value: `You can loan with \`${prefix}wallet loan <money>\` & pay it with \`${prefix}wallet payloan <loan>\`.\nYou can loan up to ${process.env.LOAN_LIMIT}`, inline: false},
				])
				if (thisServerData.loan > 0) 
					walletEmbed.addFields([{name: "Loan:",value:`${thisServerData.loan}`}])
				message.channel.send({embeds:[walletEmbed]})
			}

		})

		/**
		 * Custom function to send a message with features
		 * @param {String} msg the message
		 * @param {SharuruEmbed} embed the embed
		 * @param {Bool} deleteAfter to delete or not after timeout's delay
		 * @param {String} timeout The time which needs to be followed by a time measurement like s,m,h.
		 */
		function rep(options,deleteAfter = false,timeout = 10000) {
			let thismsg;
			thismsg = message.channel.send(options)
			if (deleteAfter) {
				thismsg.then(m => {
					myUtils.mgoAdd(message.guild.id,message.channel.id,m.id,ms(timeout))
				})
			}
		}

		/**
		 * Calculates in percent, the change between 2 numbers.
		 * e.g from 1000 to 500 = 50%
		 * @param {Number} oldNumber The initial value
		 * @param {Number} newNumber The value that changed
		 * @param {Boolean} getPM Whenever the result should be +/- or not.
		 * @returns The difference (in percentage) from old value to the new value
		 */
		function getPerDiff(oldNumber, newNumber, getPM = false){
			let decreaseValue = oldNumber - newNumber;
			let valueChanged = (decreaseValue / oldNumber) * 100;
			if (newNumber < oldNumber && getPM == true) valueChanged  *= -1 
			
			return valueChanged;
		}
	}

};
