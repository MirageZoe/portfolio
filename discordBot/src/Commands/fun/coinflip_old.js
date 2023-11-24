/* eslint-disable no-unused-vars */
const SharuruEmbed = require('../../Structures/SharuruEmbed');
const Command = require('../../Structures/Command.js');
const profileSys = require("../../Models/profiles");
const sendError = require('../../Models/Error');
const coinBuffs = ['doubleWin','noLose','noPay','moreMoney'];
const coinDebuffs = ['doubleLose','noWin','doublePay','lessMoney'];
const sidesM = [`cats`,`tails`,'claws'];
const sides = [`cats`,`tails`];
const fs = require('fs');
const ms = require('ms');
const { PermissionsBitField } = require('discord.js')

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'coinflip_old',
            displaying: true,
            cooldown: 3000,
			description: 'What\'s going to be? Cats? Tails? or maybe the most rate thing, Claws? Bet and win *(if the luck in on your side obviously...)*',
			options: '\n- \`no option\` => Simply toss a coin & wait to see what\'s coming, Cats or Tails!.\n- \`<side: cats/tails/claws> [amount of coins]\`=> bet an amount of coins on a side! If you win with a cats or tails, you get double coins, if you bet on claws, you get 350% more than what you bet.',
			usage: '',
			example: 'coinflip tails 10 => if the coin lands on tails, you get 20 coins back!',
			category: 'fun',
			userPerms: [PermissionsBitField.Flags.SendMessages],
			SharuruPerms: [PermissionsBitField.Flags.SendMessages],
			args: false,
			guildOnly: true,
			ownerOnly: false,
			aliases: []
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

		let amORpm;
		if (hrs >= 0 && hrs <= 12) {
			amORpm = 'AM';
		} else {
			amORpm = 'PM';
		}

		let arrayShuffle = function(array) {
            for ( let i = 0, length = array.length, swap = 0, temp = ''; i < length; i++ ) {
            swap        = Math.floor(Math.random() * (i + 1));
            temp        = array[swap];
            array[swap] = array[i];
            array[i]    = temp;
            }
            return array;
        };
        let percentageChance = function(values, chances) {
            for ( var i = 0, pool = []; i < chances.length; i++ ) {
            for ( let i2 = 0; i2 < chances[i]; i2++ ) {
                pool.push(i);
            }
            }
            return values[arrayShuffle(pool)['0']];
		};
		function roundNumber(num, scale) {
			if(!("" + num).includes("e")) {
			  return +(Math.round(num + "e+" + scale)  + "e-" + scale);
			} else {
			  var arr = ("" + num).split("e");
			  var sig = ""
			  if(+arr[1] + scale > 0) {
				sig = "+";
			  }
			  return +(Math.round(+arr[0] + "e" + sig + (+arr[1] + scale)) + "e-" + scale);
			}
		}
		function rep(msg,embed,deleteAfter,timeout) {
			let thismsg;
			if (embed) {
				thismsg = message.channel.send({embeds: [embed]})
			} else {
				thismsg = message.channel.send(`<@${issuer.id}>, `+msg)
			}
			if (deleteAfter) {
				setTimeout(() => {
					thismsg.then(m =>m.delete())
				}, ms(timeout));
			}
		}
        let option = args[0];
		let amount = Number(args[1]);
		if(option == `add` && issuer.id == `186533323403689986`){
			message.delete()
			profileSys.findOne({
				userID: message.mentions.users.first().id || args[1]
			},(err,res)=>{
				if(err)console.log(err)
				if(res) {
					res.money = Number(res.money)+ Number(args[2])
					console.log(`done`)
					res.save()
				}
			})
			return
		}
        if(option){
			option = option.toLowerCase().replace(/\s/g,"")
            if(!sidesM.includes(option)) return rep(`please type first one of **\`${sidesM}\`** followed by a number between 1 and your current amount of money!`)
			if(!amount || isNaN(amount)) return rep(`Please type a number between 1 and 1000000000!`)
			if(amount < 1 || amount > 1000000000 ) return rep(`You can bet between 1 and 1000000000 only!`)
			profileSys.findOne({
				userID: issuer.id
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
				if(res){
					let userSVData = res.servers_data
					let balance = userSVData.get(message.guild.id).money;
					if(amount > balance) return rep(`you're too poor to bet **${amount}** rurupoints! You have **${balance}** rurupoints.`)
					let coinDropped = percentageChance(['cats','claws','tails'], [46.5, 77, 46.5]);
					let theirLuckOrUnluck = percentageChance(['lucky','unlucky','nothing'], [15,15,70]);
					let imageMe = ``
					let myDescription = ``
					// console.log(theirLuckOrUnluck)
					if(coinDropped == 'cats'){
						imageMe = `https://cdn.discordapp.com/attachments/768885595228864513/809106856417034260/cat_coin_face2.gif`
					} else if(coinDropped == 'tails'){
						imageMe = `https://cdn.discordapp.com/attachments/768885595228864513/809106874334183484/cat_coin_tail.gif`
					} else{
						imageMe = `https://cdn.discordapp.com/attachments/768885595228864513/809156327435534445/cat_coin_claw.gif`
					}
					let embed = new SharuruEmbed()
					.setTitle(`The coin was thrown...`)
					.setTimestamp()
					.setThumbnail(imageMe)
					.setFooter(`Requested by ${issuer.tag} at`)
					//if player guessed right side
					if(coinDropped == option){
						embed.setColor(`GREEN`)
						if(coinDropped == "claws"){
							embed.setColor(`GOLD`)
							let bonus = 11.5
							let newBalance = Number(balance) + (amount*bonus)
							console.log(`\n\nIt dropped ${coinDropped}! User chose ${option} so it won 50% !\nOld balance: ${balance}\nNew Balance: ${newBalance} (${balance} + ${amount*bonus})`)
							userSVData.get(message.guild.id).money = newBalance
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
                                        Command: this.name + `, update coins for claw winning `,
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
							myDescription += `\nIt's **${coinDropped}**! Congratulation to lucky winner ${issuer}! They won __***${bonus}x***__ more than the amount they bet: **${amount*bonus}** coins! New balance: ${newBalance}`
							embed.setDescription(myDescription)
							return message.channel.send({embeds: [embed]})
						}
						let newBalance = Number(balance) + amount
						myDescription += `It's **${coinDropped}**! ${issuer} won **${amount}** coins!`//===========================================\n
						if(res.coinDebuffs.doubleLose > 0){
							res.coinDebuffs.doubleLose -= 1;
						}
						if(res.coinBuffs.doubleWin > 0 ){
							newBalance += Math.floor((amount/2))*2
							res.coinBuffs.doubleWin -=1;
							myDescription += `\n\nBuff applied: *\`Double Cherry\`*! *(double winning)*\nNew Balance: ${newBalance}`
						}
						if(res.coinBuffs.noPay > 0 ){
							newBalance = Number(balance) + Number(res.lastBet)
							res.coinBuffs.noPay -= 1;
							if(res.coinBuffs.noPay < 1) res.lastBet = 0
							myDescription += `\n\nBuff applied: *\`Government's Promise\`*! *(doesn't pay to bet)*\nNew Balance: ${newBalance} *(using last bet before buff: ${res.lastBet})*`
						}
						if(res.coinBuffs.moreMoney.charges > 0){
							newBalance += res.coinBuffs.moreMoney.amount;
							res.coinBuffs.moreMoney.charges -= 1;
							myDescription += `\n\nBuff applied: *\`Peasent's Luck\`*! *(more money if win: +${res.coinBuffs.moreMoney.amount})*\nNew Balance: ${newBalance}`
						}
						if(res.coinDebuffs.noWin > 0 ){//&& res.coinBuffs.noLose == 0
							newBalance -= amount
							res.coinDebuffs.noWin -= 1;
							myDescription += `\n\nDebuff applied: *\`Debts, worst enemy..\`* *(no winnings gained)*\nNew balance ${newBalance}`
						}
						if(res.coinBuffs.noLose > 0 ){
							res.coinBuffs.noLose -= 1;
						}
						if(res.coinDebuffs.doublePay > 0 ){//&& res.coinBuffs.doubleLose == 0
							newBalance -= amount;
							res.coinDebuffs.doublePay -= 1;
							myDescription += `\n\nDebuff applied: *\`Government NEED money\`* *(double the amount bet!)*\nNew balance ${newBalance}`
						}
						if(res.coinDebuffs.lessMoney.charges > 0 ){//&& res.coinBuffs.moreMoney.charges == 0
							res.coinDebuffs.lessMoney.charges -= 1;
						}
						
						console.log(`\n\nIt dropped ${coinDropped}! User chose ${option} so it won!\nOld balance: ${balance}\nNew Balance: ${newBalance} (${balance} + ${amount} + (moreMoney: ${res.coinBuffs.moreMoney.charges}, ${res.coinBuffs.moreMoney.amount}))`)
						userSVData.get(message.guild.id).money = newBalance
						res.servers_data = userSVData
						embed.setDescription(myDescription)
						message.channel.send({embeds: [embed]})
					}else{ // if player didn't guess the right side
						if(coinDropped == 'claws'){
							if(res.coinBuffs.doubleWin > 0) {
								console.log(`If they would have said "claw", they would have won: ${(amount * 11.5)*2}`)	
							}
						}
						embed.setColor(`RED`)
						let newBalance = Number(balance) - amount
						myDescription += `It's **${coinDropped}**! ${issuer} bet was on **${option}** and lost **${amount}** coins!`//===========================================\n
						if(res.coinBuffs.doubleWin > 0 ){
							res.coinBuffs.doubleWin -=1;
						}
						if(res.coinDebuffs.noWin > 0){
							res.coinDebuffs.noWin -= 1;
						}
						if(res.coinBuffs.noPay > 0 ){
							newBalance += Number(amount)
							res.coinBuffs.noPay -= 1;
							if(res.coinBuffs.noPay < 1) res.lastBet = 0
							myDescription += `\n\nBuff applied: *\`Government's Promise\`*!*(doesn't pay to bet)*\nNew Balance: ${newBalance}`
						}
						if(res.coinBuffs.noLose > 0 ){
							newBalance += amount
							res.coinBuffs.noLose -= 1;
							myDescription += `\n\nBuff applied: *\`Not Today\`*! *(won't lose money when bet is opposite)*\nNew balance: ${newBalance}`
						}
						if(res.coinDebuffs.doubleLose > 0 ){//&& res.coinBuffs.doubleWin == 0
							newBalance -= amount
							if(newBalance < -2500) newBalance = -2000
							res.coinDebuffs.doubleLose -= 1;
							myDescription += `\n\nDebuff applied: *\`Greedy Bills\`* *(double the loses!)*\nNew balance ${newBalance}`
						}
						if(res.coinBuffs.moreMoney.charges > 0){
							res.coinBuffs.moreMoney.charges -= 1;
						}
						if(res.coinDebuffs.lessMoney.charges > 0 ){//&& res.coinBuffs.moreMoney.charges == 0
							newBalance -= res.coinDebuffs.lessMoney.amount;
							res.coinDebuffs.lessMoney.charges -= 1;
							myDescription += `\n\nDebuff applied: *\`Hole in the bag\`* *(lose additional money!)*\nNew balance ${newBalance}`
						}
						if(res.coinDebuffs.doublePay > 0 ){//&& res.coinBuffs.noPay == 0
							newBalance -= amount;
							res.coinDebuffs.doublePay -= 1;
							myDescription += `\n\nDebuff applied: *\`Government NEED money\`* *(double the amount bet!)*\nNew balance ${newBalance}`
						}
						
						console.log(`\n\nIt dropped ${coinDropped}! User chose ${option} so it LOST!\nOld balance: ${balance}\nNew Balance: ${newBalance} (${balance} - ${amount})`)
						userSVData.get(message.guild.id).money = newBalance
						res.servers_data = userSVData
						embed.setDescription(myDescription)
						message.channel.send({embeds: [embed]})
					}
					if(theirLuckOrUnluck == `lucky`){
						let randomBuff = percentageChance(coinBuffs, [10, 40, 20, 30]);
						console.log(randomBuff)
						if(res.coinBuffs.doubleWin > 0) {
							res.save().catch(err=> console.log(err));
							return console.log(`Buff already active!`)
						}
						if(res.coinBuffs.noLose > 0){
							res.save().catch(err=> console.log(err));
							return console.log(`Buff already active!`)
						} 
						if(res.coinBuffs.noPay > 0) {
							res.save().catch(err=> console.log(err));
							return console.log(`Buff already active!`)
						}
						if(res.coinBuffs.moreMoney.charges > 0){
							res.save().catch(err=> console.log(err));
							return console.log(`Buff already active!`)
						}
						let embed = new SharuruEmbed()
							.setTitle(`Lucky!`)
							.setColor(`GREEN`)
							.setTimestamp()
							.setImage(`https://media.discordapp.net/attachments/768885595228864513/809161487045099540/ab9a1e39d41f6411c259043fe5993fd9.png?width=720&height=362`)
							.setFooter(`Requested by ${issuer.tag} at`)
						if(randomBuff == `doubleWin`){
							let randomCharges = percentageChance([`3`,`5`,`7`], [65, 25, 10]);
							res.coinBuffs.doubleWin = Number(randomCharges);
							res.save().catch(err=> console.log(err));
							embed.setDescription(`Congrats ${issuer}, the luck smiled on your fate and you claimed: **\`Double Cherry\`** buff! The next ${randomCharges} coin flips will give you double the amount if you win!`)
							return message.channel.send({embeds: [embed]})
						} else if(randomBuff == `noLose`){
							let randomCharges = percentageChance([`1`,`2`], [90, 10]);
							res.coinBuffs.noLose = Number(randomCharges);
							res.save().catch(err=> console.log(err));
							embed.setDescription(`Congrats ${issuer}, the luck smiled on your fate and you claimed: **\`Not Today\`** buff! The next ${randomCharges} coin flips, you won't be charged if the bet is on the wrong side!`)
							return message.channel.send({embeds: [embed]})
						} else if(randomBuff == `noPay`){
							let randomCharges = percentageChance([`3`,`5`,`7`], [65, 25, 10]);
							res.coinBuffs.noPay = Number(randomCharges);
							res.lastBet = amount
							res.save().catch(err=> console.log(err));
							embed.setDescription(`Congrats ${issuer}, the luck smiled on your fate and you claimed: **\`Government's Promise\`** buff! The next ${randomCharges} coin flips, you will not pay anything!\n\n*Note: It's going to use the last amount bet until buff expires.*`)
							return message.channel.send({embeds: [embed]})
						} else if(randomBuff == `moreMoney`){
							let randomCharges = percentageChance([`3`,`5`,`7`], [65, 25, 10]);
							let randomCharges2 = percentageChance([`250`,`500`,`1200`], [65, 25, 10]);
							res.coinBuffs.moreMoney.charges = Number(randomCharges);
							res.coinBuffs.moreMoney.amount = Number(randomCharges2);
							res.save().catch(err=> console.log(err));
							embed.setDescription(`Congrats ${issuer}, the luck smiled on your fate and you claimed: **\`Peasent's Luck\`** buff! The next ${randomCharges} coin flips, you will receive additional money if you win!!*`)
							return message.channel.send({embeds: [embed]})
						}
					} else if(theirLuckOrUnluck == 'unlucky'){
						let randomBuff = percentageChance(coinDebuffs, [10, 40, 20, 30]);
						console.log(randomBuff)
						let embed = new SharuruEmbed()
							.setTitle(`Unlucky...`)
							.setTimestamp()
							.setImage(`https://media.discordapp.net/attachments/768885595228864513/809160123532181544/unlucky-cover-.png`)
							.setFooter(`Requested by ${issuer.tag} at`)
						embed.setColor(`RED`)
						if(res.coinDebuffs.doubleLose > 0) {
							res.save().catch(err=> console.log(err));
							return console.log(`deBuff already active!`)
						}
						if(res.coinDebuffs.noWin > 0) {
							res.save().catch(err=> console.log(err));
							return console.log(`deBuff already active!`)
						}
						if(res.coinDebuffs.doublePay > 0) {
							res.save().catch(err=> console.log(err));
							return console.log(`deBuff already active!`)
						}
						if(res.coinDebuffs.lessMoney.charges > 0) {
							res.save().catch(err=> console.log(err));
							return console.log(`deBuff already active!`)
						}
						if(randomBuff == `doubleLose`){
							let randomCharges = percentageChance([`2`,`3`,`4`], [65, 25, 10]);
							res.coinDebuffs.doubleLose = Number(randomCharges);
							res.save().catch(err=> console.log(err));
							embed.setDescription(`Sadly... ${issuer}, the luck isn't on your side so... you received **\`Greedy Bills\`** debuff! For the next ${randomCharges} coin flips, if you lose, you lose double the amount you bet!\n\n *Note: If you don't have money, the next time you will win, you will get 0 money.*`)
							return message.channel.send({embeds: [embed]})
						} else if(randomBuff == `noWin`){
							let randomCharges = percentageChance([`1`,`2`], [90, 10]);
							res.coinDebuffs.noWin = Number(randomCharges);
							res.save().catch(err=> console.log(err));
							embed.setDescription(`Sadly... ${issuer}, the luck isn't on your side so... you received **\`Debts, worst enemy..\`** debuff! For the next coin flips, if you win, you won't receive any money (x${randomCharges})!`)
							return message.channel.send({embeds: [embed]})
						} else if(randomBuff == `doublePay`){
							let randomCharges = percentageChance([`2`,`4`], [80, 20]);
							res.coinDebuffs.doublePay = Number(randomCharges);
							res.save().catch(err=> console.log(err));
							embed.setDescription(`Sadly... ${issuer}, the luck isn't on your side so... you received **\`Government NEED money\`** debuff! For the next ${randomCharges} coin flips, you will pay double than the normal amount!\n\n *Note: If you don't have money, the next time you will win, you will get 0 money.*`)
							return message.channel.send({embeds: [embed]})
						} else if(randomBuff == `lessMoney`){
							let randomCharges = percentageChance([`2`,`3`,`6`], [65, 25, 10]);
							let randomCharges2 = percentageChance([`250`,`750`,`1000`], [65, 25, 10]);
							res.coinDebuffs.lessMoney.charges = Number(randomCharges);
							res.coinDebuffs.lessMoney.amount = Number(randomCharges2);
							res.save().catch(err=> console.log(err));
							embed.setDescription(`Sadly... ${issuer}, the luck isn't on your side so... you received **\`Hole in the bag\`** debuff! For the next ${randomCharges} coin flips, you will lose an additional ${randomCharges2} coins if you lose!\n\n *Note: If you don't have money, the next time you will win, you will get 0 money.*`)
							return message.channel.send({embeds: [embed]})
						}
					}
					res.save().catch(err=>console.log(err))
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
								Command: this.name + `, update profile user coinflip `,
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
							console.log(`[Coinflip]: Done! Updated player profile with money`)
						}
					});
					// versus event:
					let eventData = res.events.versus
					let getMissionData = eventData.missions.list.find(item => item.id == 4)
					if (getMissionData) { // if the mission is found
						if (getMissionData.completed == true) return console.log(`[Verus Event - Coinflip minigame# ${TheDate}, ${clock} ${amORpm}]: ${issuer.tag} (${issuer.id}) completed the mission already.`)					
					
						getMissionData.finished++;
						if (getMissionData.finished >= getMissionData.perDay) getMissionData.completed = true;
						eventData.reward += getMissionData.reward
						for (let i = 0; i < eventData.missions.list.length; i++) {
							if (eventData.missions.list[i].id == 4) {
								eventData.missions.list[i] = getMissionData
							}
						}
						console.log(`[Verus Event - Coinflip minigame# ${TheDate}, ${clock} ${amORpm}]: ${issuer.tag} (${issuer.id}) played game (${getMissionData.finished}/${getMissionData.perDay}).`)
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
									Command: this.name + `, update vsEV MISSION LIST -coinflip `,
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
								console.log(`[VersusEvent-Missions]: Successfully Updated ${issuer.tag} (${issuer.id}) mission list (coinflip minigame).`)
							}
						});
					}
				}
			})
        } else message.channel.send(`${issuer} tossed a coin and it landed on **${sides[Math.floor(Math.random() * sides.length)]}**!`)
	}

};
