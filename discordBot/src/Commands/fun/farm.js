/* eslint-disable no-unused-vars */
//https://discord.js.org/#/docs/main/stable/class/Permissions
const Command = require('../../Structures/Command.js');
const sendError = require('../../Models/Error');
const SharuruEmbed = require('../../Structures/SharuruEmbed')
const fs = require('fs');
const ms = require('ms');
const config = require("../../../config.json")
const shopdata = require("../../Assets/farmingShop/products.json");
const profilesSys = require('../../Models/profiles.js');
const { createCanvas, loadImage } = require("canvas");
const { PermissionsBitField } = require('discord.js')

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'farm',
			displaying: true,
			cooldown: 3000,
			description: 'A small farm mini-game!',
			options: '',
			usage: '',
			example: '',
			category: 'fun',
			userPerms: [PermissionsBitField.Flags.SendMessages],
			SharuruPerms: [PermissionsBitField.Flags.SendMessages],
			args: false,
			guildOnly: true,
			serverOnly: false,
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

		const applyText = (canvas, text) => {
            const ctx = canvas.getContext('2d');
        
            // Declare a base size of the font
            let fontSize = 75;
        
            do {
                // Assign the font to the context and decrement it so it can be measured again
                ctx.font = `${fontSize -= 3}px Changa`;
                // Compare pixel width of the text to the canvas minus the approximate avatar size
            } while (ctx.measureText(text).width > canvas.width - 780);
        
            // Return the result to use in the actual canvas
            return ctx.font;
        };

		let userOption = args[0]?.toLowerCase();
		let userOption2 = args[1]?.toLowerCase();
		let farmEmbed = new SharuruEmbed()
			.setAuthor(`Farming game!`)
			.setColor(`LUMINOUS_VIVID_PINK`)
			.setFooter(`Requested by ${issuer.tag} `)

		if (!userOption || userOption == "help") {
			farmEmbed.setDescription(`You forgot to mention an option. If you're unclear, hover over "More Info" blue text and wait for the box to appear.\n
- shop <trees/fruits> = [[More Info]](https://www.google.com "The shop displays a list of items that you can buy: tree or fruit seeds!")
- buy <itemId> [amount] = [[More Info]](https://www.google.com "Buy from the shop the respective item. Need to specify the id of the item and the amount after. By default it would buy 1 if the amount isn't specified. If you write 'planter' instead of a numerical id, it will buy another planter to plant :)")
- inventory / inv = [[More Info]](https://www.google.com "Shows how many seeds you have and what harvest you have done so far.")
- plant <planterId> <seedId> = [[More Info]](https://www.google.com "Plant in the respective planter, the respective seed. Nothing more to say")
- status = [[More Info]](https://www.google.com "It shows how planters are doing. Whenever ready for harvest or not.")
- harvest = [[More Info]](https://www.google.com "It does what it says: Harvest the trees/fruits ready to harvest :)")
`)
			return rep({embeds: [farmEmbed]})
		}

		if (userOption == "shop") {
			let allCategories = Object.keys(shopdata)
			if (!userOption2) {
				farmEmbed.setDescription(`Please choose one of the available categories: ${allCategories.join(", ")}`)
				return rep({embeds: [farmEmbed]})
			}
			if (!allCategories.includes(userOption2)) {
				farmEmbed.setDescription(`You have made either a typo or didn't write the category correct at all so please choose one of the existent categories: ${allCategories.join(", ")}`)
				return rep({embeds: [farmEmbed]})
			}
			let chosenCatProducts = ``
			// return console.log(shopdata[userOption2][0])
			for (let i = 0; i < shopdata[userOption2].length; i++) {
				const chosenCat = shopdata[userOption2][i];
				chosenCatProducts += `${chosenCat.id}) **${chosenCat.name}**
**Growth Time:** ${chosenCat.growth} hour(s)
**Buy Price (*seed*):** ${chosenCat.seedPrice}
**Sell Price (fruit):** ${chosenCat.sellPrice}\n\n`
			}

			farmEmbed.setDescription(chosenCatProducts)
			.addField(config.extra.emptyField,config.extra.emptyField)
			.addField(`To buy something, use this command:`,`\`${prefix}farm buy <id> [amount]\`\n\n*The <id> is the number in front of the name. By default you will buy 1 piece.*`)
			return rep({embeds: [farmEmbed]})
		}

		if (userOption == "buy") {

			if (userOption2 == "planter") {
				profilesSys.findOne({
					userID: issuer.id
				}, async(err,res) =>{
					if (err) {
						sendError.create({
							Guild_Name: message.guild.name,
							Guild_ID: message.guild.id,
							User: issuer.tag,
							UserID: issuer.id,
							Error: error,
							Time: `${TheDate} || ${clock} ${amORpm}`,
							Command: this.name + " buy function",
							Args: args,
						},async (err, res) => {
							if(err) {
								console.log(err)
								return message.channel.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
							}
							if(res) {
								console.log(`successfully added error to database!`)
								logChannel.send(`[FARM-BUY]: an error happened while trying to access an user profile. If this problem persist, contact my partner!\n${err.stack}`)
							}
						})
					}
					if (res) {
						let getUserServerData = res.servers_data
						let getCurrentServerData = getUserServerData.get(message.guild.id)

						// IF USER FIRST TIME
						if (!res.farm) {
							res.farm = {
								fruits: {
									apple: {
										seeds: 0,
										harvested: 0
									},
									orange: {
										seeds: 0,
										harvested: 0
									},
									banana: {
										seeds: 0,
										harvested: 0
									},
									cherries: {
										seeds: 0,
										harvested: 0
									},
									grapes: {
										seeds: 0,
										harvested: 0
									},
									kiwi: {
										seeds: 0,
										harvested: 0
									},
									lemon: {
										seeds: 0,
										harvested: 0
									},
									peach: {
										seeds: 0,
										harvested: 0
									}
								},
								trees: {
									wood: {
										seeds: 0,
										harvested: 0
									},
									palm: {
										seeds: 0,
										harvested: 0
									},
									rich: {
										seeds: 0,
										harvested: 0
									},
									boreal: {
										seeds: 0,
										harvested: 0
									},
									ebon: {
										seeds: 0,
										harvested: 0
									},
									shade: {
										seeds: 0,
										harvested: 0
									},
									pearl: {
										seeds: 0,
										harvested: 0
									},
									dynasty: {
										seeds: 0,
										harvested: 0
									}
								},
								planters: {
									p1: {
										status: "idle",
										seed: 0,
										startTime: "0",
										endTime:  "0",
										unlocked: true
									},
									p2: {
										status: "idle",
										seed: 0,
										startTime: "0",
										endTime:  "0",
										unlocked: false
									},
									p3: {
										status: "idle",
										seed: 0,
										startTime: "0",
										endTime:  "0",
										unlocked: false
									},
									p4: {
										status: "idle",
										seed: 0,
										startTime: "0",
										endTime:  "0",
										unlocked: false
									},
									p5: {
										status: "idle",
										seed: 0,
										startTime: "0",
										endTime:  "0",
										unlocked: false
									},
									p6: {
										status: "idle",
										seed: 0,
										startTime: "0",
										endTime:  "0",
										unlocked: false
									},
									
								}
							}
							res.save().catch(err => console.log(err))
							farmEmbed.setDescription(`I've set up your data so it can be properly used! Please type again the command. Thank you!`)
							return rep({embeds: [farmEmbed]},"10s")
						}

						// calculate how much money user needs to buy additional planter
						let howManyPlantersHas = 1;
						let finalPrice = 1000
						let farmPlanters = Object.keys(res.farm.planters)
						farmPlanters.splice(farmPlanters.findIndex(item => item == "p1"),1)
						for (let i = 0; i < farmPlanters.length; i++) 
							if (res.farm.planters[farmPlanters[i]].unlocked == true) howManyPlantersHas++;
						finalPrice = howManyPlantersHas == 2 ? 2500 : howManyPlantersHas == 3 ? 5000 : howManyPlantersHas == 4 ? 10000 : howManyPlantersHas == 5 ? 20000 : 1000
						
						// if user own all planter boxes
						if (howManyPlantersHas == 6) {
							farmEmbed.setDescription(`Currently this game version is made to support max 6 planter boxes. Maybe in the future this will be expanded so be patient and have a nice day!`)
							return rep({embeds: [farmEmbed]},"10s")
						}

						// if user doesn't have money
						if (getCurrentServerData.money < finalPrice) {
							farmEmbed.setDescription(`Unfortunately you don't own enough points to another planter... You need ${finalPrice - getCurrentServerData.money} to buy!!`)
							return rep({embeds: [farmEmbed]},"10s")
						}
						console.log(`user has ${getCurrentServerData.money}, it cost ${finalPrice}`)
	
						// remove money and give the seed
						getCurrentServerData.money -= finalPrice

						if (howManyPlantersHas == 1) 
							res.farm.planters.p2.unlocked = true;
						if (howManyPlantersHas == 2) 
							res.farm.planters.p3.unlocked = true;
						if (howManyPlantersHas == 3) 
							res.farm.planters.p4.unlocked = true;
						if (howManyPlantersHas == 4) 
							res.farm.planters.p5.unlocked = true;
						if (howManyPlantersHas == 5) 
							res.farm.planters.p6.unlocked = true;
						
						// save
						getUserServerData.set(message.guild.id, getCurrentServerData)
						res.save().catch(err => console.log(err))
						profilesSys.updateOne({
							'userID': `${issuer.id}`
						},{'$set':{ 'servers_data' : getUserServerData}},(erro,reso)=>{
							if (erro) {
								sendError.create({
									Guild_Name: message.guild.name,
									Guild_ID: message.guild.id,
									User: message.user.username,
									UserID: message.user.id,
									Error: erro,
									Time: `${TheDate} || ${clock} ${amORpm}`,
									Command: this.name + `, update profile after buying seed `,
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
						
						farmEmbed.setDescription(`Thank you for your purchase! You own now ${howManyPlantersHas+1} planter boxes!`)
						return rep({embeds: [farmEmbed]},"10s")
					}
				})
				return console.log(`planter`)
			}
			if (!userOption2) {
				farmEmbed.setDescription(`You forgot to specify the id of the item you wanna buy! check \`${prefix}farm shop <trees/fruits (choose one: ${prefix}farm shop trees)>\` to see the ids.`)
				return rep({embeds: [farmEmbed]},"10s")
			}
			let availableItems = []
			let categories = Object.keys(shopdata)
			let currentItemToBuy = null;
			let amountSeed = args[2] ?? 1;
			for (let i = 0; i < categories.length; i++)
				// console.log(shopdata[categories[i]])
				for (let j = 0; j < shopdata[categories[i]].length; j++)
					availableItems.push(shopdata[categories[i]][j])
			
			currentItemToBuy = availableItems.find(item => item.id == Number(userOption2))
			if (currentItemToBuy == undefined) {
				farmEmbed.setDescription(`Unfortunately there isn't such a product with the id **\`${userOption2}\`**! Please check again!`)
				return rep({embeds: [farmEmbed]},"10s")
			}

			if (isNaN(amountSeed)) {
				farmEmbed.setDescription(`Unfortunately you didn't type a valid number!`)
				return rep({embeds: [farmEmbed]},"10s")
			}

			if (amountSeed < 1 || amountSeed > 15) {
				farmEmbed.setDescription(`Unfortunately you typed either a number lower than 1 or higher than 15!`)
				return rep({embeds: [farmEmbed]},"10s")
			}

			profilesSys.findOne({
				userID: issuer.id
			}, async(err,res) =>{
				if (err) {
					sendError.create({
						Guild_Name: message.guild.name,
						Guild_ID: message.guild.id,
						User: issuer.tag,
						UserID: issuer.id,
						Error: error,
						Time: `${TheDate} || ${clock} ${amORpm}`,
						Command: this.name + " buy function",
						Args: args,
					},async (err, res) => {
						if(err) {
							console.log(err)
							return message.channel.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
						}
						if(res) {
							console.log(`successfully added error to database!`)
							logChannel.send(`[FARM-BUY]: an error happened while trying to access an user profile. If this problem persist, contact my partner!\n${err.stack}`)
						}
					})
				}
				if (res) {
					let getUserServerData = res.servers_data
					let getCurrentServerData = getUserServerData.get(message.guild.id)

					// if user doesn't have money
					if (getCurrentServerData.money < currentItemToBuy.seedPrice) {
						farmEmbed.setDescription(`Unfortunately you don't own enough points to buy this!! You need ${currentItemToBuy.seedPrice - getCurrentServerData.money} to buy!!`)
						return rep({embeds: [farmEmbed]},"10s")
					}

					// remove money and give the seed
					getCurrentServerData.money -= currentItemToBuy.seedPrice * Number(amountSeed);

					if (!res.farm) {
						res.farm = {
							fruits: {
								apple: {
									seeds: 0,
									harvested: 0
								},
								orange: {
									seeds: 0,
									harvested: 0
								},
								banana: {
									seeds: 0,
									harvested: 0
								},
								cherries: {
									seeds: 0,
									harvested: 0
								},
								grapes: {
									seeds: 0,
									harvested: 0
								},
								kiwi: {
									seeds: 0,
									harvested: 0
								},
								lemon: {
									seeds: 0,
									harvested: 0
								},
								peach: {
									seeds: 0,
									harvested: 0
								}
							},
							trees: {
								wood: {
									seeds: 0,
									harvested: 0
								},
								palm: {
									seeds: 0,
									harvested: 0
								},
								rich: {
									seeds: 0,
									harvested: 0
								},
								boreal: {
									seeds: 0,
									harvested: 0
								},
								ebon: {
									seeds: 0,
									harvested: 0
								},
								shade: {
									seeds: 0,
									harvested: 0
								},
								pearl: {
									seeds: 0,
									harvested: 0
								},
								dynasty: {
									seeds: 0,
									harvested: 0
								}
							},
							planters: {
								p1: {
									status: "idle",
									seed: 0,
									startTime: "0",
									endTime:  "0",
									unlocked: true
								},
								p2: {
									status: "idle",
									seed: 0,
									startTime: "0",
									endTime:  "0",
									unlocked: false
								},
								p3: {
									status: "idle",
									seed: 0,
									startTime: "0",
									endTime:  "0",
									unlocked: false
								},
								p4: {
									status: "idle",
									seed: 0,
									startTime: "0",
									endTime:  "0",
									unlocked: false
								},
								p5: {
									status: "idle",
									seed: 0,
									startTime: "0",
									endTime:  "0",
									unlocked: false
								},
								p6: {
									status: "idle",
									seed: 0,
									startTime: "0",
									endTime:  "0",
									unlocked: false
								},
								
							}
						}
						res.save().catch(err => console.log(err))
						farmEmbed.setDescription(`I've set up your data so it can be properly used! Please type again the command. Thank you!`)
						return rep({embeds: [farmEmbed]},"10s")
					}
					
					// add to the seed the amount bought
					res.farm[currentItemToBuy.type][currentItemToBuy.nameId].seeds += Number(amountSeed);

					// save
					getUserServerData.set(message.guild.id, getCurrentServerData)
					res.save().catch(err => console.log(err))
					profilesSys.updateOne({
						'userID': `${issuer.id}`
					},{'$set':{ 'servers_data' : getUserServerData}},(erro,reso)=>{
						if (erro) {
							sendError.create({
								Guild_Name: message.guild.name,
								Guild_ID: message.guild.id,
								User: message.user.username,
								UserID: message.user.id,
								Error: erro,
								Time: `${TheDate} || ${clock} ${amORpm}`,
								Command: this.name + `, update profile after buying seed `,
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
					
					farmEmbed.setDescription(`Thank you for your purchase! You have bought **${amountSeed}** seeds of **${currentItemToBuy.name}** for a total of **${currentItemToBuy.seedPrice * amountSeed}** points!!`)
					return rep({embeds: [farmEmbed]},"10s")
				} else {
					farmEmbed.setDescription(`Please use the command \`${prefix}profile\` first before to be able to play!`)
					return rep({embeds: [farmEmbed]},"10s")
				}  
			})

		}

		if (userOption == "inv" || userOption == "inventory") {
			profilesSys.findOne({
				userID: issuer.id
			}, async(err,res) =>{
				if (err) {
					sendError.create({
						Guild_Name: message.guild.name,
						Guild_ID: message.guild.id,
						User: issuer.tag,
						UserID: issuer.id,
						Error: error,
						Time: `${TheDate} || ${clock} ${amORpm}`,
						Command: this.name + " inventory function",
						Args: args,
					},async (err, res) => {
						if(err) {
							console.log(err)
							return message.channel.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
						}
						if(res) {
							console.log(`successfully added error to database!`)
							logChannel.send(`[FARM-BUY]: an error happened while trying to access an user profile. If this problem persist, contact my partner!\n${err.stack}`)
						}
					})
				}
				if (res) {

					if (!res.farm) {
						res.farm = {
							seeds: {
								fruits: {
									apple: 0,
									orange: 0
								},
								trees: {
									mapleWood: 0,
									ozakiWood: 0
								}
							},
							grownUp: {
								fruits: {
									apple: 0,
									orange: 0
								},
								trees: {
									mapleWood: 0,
									ozakiWood: 0
								}
							},
							planters: {
								p1: {
									status: "idle",
									seed: 0,
									startTime: "0",
									endTime:  "0",
									unlocked: true
								},
								p2: {
									status: "idle",
									seed: 0,
									startTime: "0",
									endTime:  "0",
									unlocked: false
								},
								p3: {
									status: "idle",
									seed: 0,
									startTime: "0",
									endTime:  "0",
									unlocked: false
								},
								p4: {
									status: "idle",
									seed: 0,
									startTime: "0",
									endTime:  "0",
									unlocked: false
								},
								p5: {
									status: "idle",
									seed: 0,
									startTime: "0",
									endTime:  "0",
									unlocked: false
								},
								p6: {
									status: "idle",
									seed: 0,
									startTime: "0",
									endTime:  "0",
									unlocked: false
								},
								
							}
						}
					}
					res.save().catch(err => console.log(err))
					farmEmbed.addFields([
						{name: `Fruit seeds:`,value:`
- 🍎 (${res.farm.fruits.apple.seeds})
- 🍊 (${res.farm.fruits.orange.seeds})
- 🍌 (${res.farm.fruits.banana.seeds})
- 🍒 (${res.farm.fruits.cherries.seeds})
- 🍇 (${res.farm.fruits.grapes.seeds})
- 🥝 (${res.farm.fruits.kiwi.seeds})
- 🍋 (${res.farm.fruits.lemon.seeds})
- 🍑 (${res.farm.fruits.peach.seeds})
						`,inline:true},
						{name: `Harvested Fruits:`,value: `
- 🍎 (${res.farm.fruits.apple.harvested})
- 🍊 (${res.farm.fruits.orange.harvested})
- 🍌 (${res.farm.fruits.banana.harvested})
- 🍒 (${res.farm.fruits.cherries.harvested})
- 🍇 (${res.farm.fruits.grapes.harvested})
- 🥝 (${res.farm.fruits.kiwi.harvested})
- 🍋 (${res.farm.fruits.lemon.harvested})
- 🍑 (${res.farm.fruits.peach.harvested})`,inline: true},
						{name: `${config.extra.emptyField}`, value: `${config.extra.emptyField}`, inline: false},
						{name: `Wood seeds:`,value:`
- <:woodW:1005790224137322506> (${res.farm.trees.wood.seeds})
- <:palmWood:1005790218391130132> (${res.farm.trees.palm.seeds})
- <:richWood:1005790221503307796> (${res.farm.trees.rich.seeds})
- <:borealWood:1005790213840306277> (${res.farm.trees.boreal.seeds})
- <:ebonWood:1005790217069924373> (${res.farm.trees.ebon.seeds})
- <:shadeWood:1005790222837100634> (${res.farm.trees.shade.seeds})
- <:pearlWood:1005790219653627915> (${res.farm.trees.pearl.seeds})
- <:dynastyWood:1005790215539011594> (${res.farm.trees.dynasty.seeds})`,inline: true},
						{name: `Harvested Logs:`,value:`
- <:woodW:1005790224137322506> (${res.farm.trees.wood.harvested})
- <:palmWood:1005790218391130132> (${res.farm.trees.palm.harvested})
- <:richWood:1005790221503307796> (${res.farm.trees.rich.harvested})
- <:borealWood:1005790213840306277> (${res.farm.trees.boreal.harvested})
- <:ebonWood:1005790217069924373> (${res.farm.trees.ebon.harvested})
- <:shadeWood:1005790222837100634> (${res.farm.trees.shade.harvested})
- <:pearlWood:1005790219653627915> (${res.farm.trees.pearl.harvested})
- <:dynastyWood:1005790215539011594> (${res.farm.trees.dynasty.harvested})`,inline:true},
					])
					return rep({embeds: [farmEmbed]})
				} else {
					farmEmbed.setDescription(`Please use the command \`${prefix}profile\` first before to be able to play!`)
					return rep({embeds: [farmEmbed]},"10s")
				}  
			})

		}

		if (userOption == "plant") {
			/**
			 * the plant command:
			 * 
			 * how it works: !farm p 
			 * - you need 2 arguments after "plant" option:
			 * --> <field> => which represents the planter id from 1 to 6
			 * --> <seedID> => which represents the seed u wanna plant (fruit or tree)
			 * - now you have to wait for X time for the tree/fruit to harvest
			 * 
			 * Details:
			 * - cannot plant in an occupied planter
			 * - can remove plant but not get anything in return
			 * - can speed up the plant to harvest 1 time?
			 */

			let planterID = userOption2
			let seedID = args[2]?.toLowerCase()

			// make sure user specifies planterID & seedID
			if (!planterID || !seedID) {
				farmEmbed.setDescription(`Seems like you forgot something:\n- the planter you wanna use (1-6);\n- the seed you wanna use;\n\nRetry the command after providing the corresponding ids!`)
				return rep({embeds: [farmEmbed]},"10s")
			}
			// console.log(`user: ${issuer.tag}\nplanterID: ${planterID}\nseed: ${seedID}`)

			// make sure user doesn't go beyond 6 and lower than 1 when specifying planters
			if (planterID < 1 || planterID > 6) {
				farmEmbed.setDescription(`You can have up to 6 planters at any time! So please specify a number between 1 and 6!`)
				return rep({embeds: [farmEmbed]},"10s")
			}

			profilesSys.findOne({
				userID: issuer.id
			}, async(err,res) =>{
				if (err) {
					sendError.create({
						Guild_Name: message.guild.name,
						Guild_ID: message.guild.id,
						User: issuer.tag,
						UserID: issuer.id,
						Error: error,
						Time: `${TheDate} || ${clock} ${amORpm}`,
						Command: this.name + " planting function",
						Args: args,
					},async (err, res) => {
						if(err) {
							console.log(err)
							return message.channel.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
						}
						if(res) {
							console.log(`successfully added error to database!`)
							logChannel.send(`[FARM-BUY]: an error happened while trying to access an user profile. If this problem persist, contact my partner!\n${err.stack}`)
						}
					})
				}
				if (res) {

					// set the default if user doesn't have it
					if (!res.farm) {
						res.farm = {
							fruits: {
								apple: {
									seeds: 0,
									harvested: 0
								},
								orange: {
									seeds: 0,
									harvested: 0
								},
								banana: {
									seeds: 0,
									harvested: 0
								},
								cherries: {
									seeds: 0,
									harvested: 0
								},
								grapes: {
									seeds: 0,
									harvested: 0
								},
								kiwi: {
									seeds: 0,
									harvested: 0
								},
								lemon: {
									seeds: 0,
									harvested: 0
								},
								peach: {
									seeds: 0,
									harvested: 0
								}
							},
							trees: {
								wood: {
									seeds: 0,
									harvested: 0
								},
								palm: {
									seeds: 0,
									harvested: 0
								},
								rich: {
									seeds: 0,
									harvested: 0
								},
								boreal: {
									seeds: 0,
									harvested: 0
								},
								ebon: {
									seeds: 0,
									harvested: 0
								},
								shade: {
									seeds: 0,
									harvested: 0
								},
								pearl: {
									seeds: 0,
									harvested: 0
								},
								dynasty: {
									seeds: 0,
									harvested: 0
								}
							},
							planters: {
								p1: {
									status: "idle",
									seed: 0,
									startTime: "0",
									endTime:  "0",
									unlocked: true
								},
								p2: {
									status: "idle",
									seed: 0,
									startTime: "0",
									endTime:  "0",
									unlocked: false
								},
								p3: {
									status: "idle",
									seed: 0,
									startTime: "0",
									endTime:  "0",
									unlocked: false
								},
								p4: {
									status: "idle",
									seed: 0,
									startTime: "0",
									endTime:  "0",
									unlocked: false
								},
								p5: {
									status: "idle",
									seed: 0,
									startTime: "0",
									endTime:  "0",
									unlocked: false
								},
								p6: {
									status: "idle",
									seed: 0,
									startTime: "0",
									endTime:  "0",
									unlocked: false
								},
								
							}
						}
						res.save().catch(err => console.log(err))
						farmEmbed.setDescription(`I've set up your data so it can be properly used! Please type again the command. Thank you!`)
						return rep({embeds: [farmEmbed]},"10s")
					}

					let selectedPlanter = res.farm.planters["p"+planterID]

					// check if user owns the said planter
					if (selectedPlanter.unlocked == false) {
						farmEmbed.setDescription(`This planter *(${planterID})* is not available due to the fact that you have to buy it!`)
						return rep({embeds: [farmEmbed]},"10s")
					} 

					// check if the said planter is idle (it may be planted seed or ready to harvest)
					if (selectedPlanter.status != "idle") {
						let customStatusReport = ``
						
						// update the status if harvest is done
						if (Number(selectedPlanter.startTime) + Number(selectedPlanter.duration) > Date.now())
							selectedPlanter.status = "harvestable"
						
						if (selectedPlanter.status == "growing") 
							customStatusReport += ` something is growing!`
						if (selectedPlanter.status == "harvestable")
							customStatusReport += ` something is ready to harvest!`
							
						farmEmbed.setDescription(`This planter *(${planterID})* is not available due to the fact that ${customStatusReport}`)
						return rep({embeds: [farmEmbed]},"10s")
					}

					// check if the said seed exist
					let fruitsOrTrees = seedID < 200 ? "fruits" : "trees"
					let getSeedData = shopdata[fruitsOrTrees].find(item => item.id == seedID)

					if (!getSeedData) {
						farmEmbed.setDescription(`This seed *(${seedID})* doesn't exist!`)
						return rep({embeds: [farmEmbed]},"10s")
					}

					// console.log(`[DEBUG]: fruitsorTrees: ${fruitsOrTrees},\ngetSeedData`,getSeedData,res.farm.seeds[fruitsOrTrees][getSeedData.nameId])
					// checking if the user has SEEDS
					if (res.farm[fruitsOrTrees][getSeedData.nameId].seeds <= 0) {
						farmEmbed.setDescription(`You don't have at least 1 seed of ${getSeedData.name}!`)
						return rep({embeds: [farmEmbed]},"10s")
					}
					
					// remove 1 seed
					res.farm[fruitsOrTrees][getSeedData.nameId].seeds--;


					selectedPlanter.status = "growing"
					selectedPlanter.seed = seedID;
					selectedPlanter.startTime = Math.floor(Date.now() / 1000)
					selectedPlanter.duration = getSeedData.growth * 3600 // 1h = 3600s

					selectedPlanter = selectedPlanter
					res.save().catch(err => console.log(err))
					farmEmbed.setDescription(`You have successfully planted a seed of ${getSeedData.name}! You will now have to wait a bit to see some results!`)
					return rep({embeds: [farmEmbed]},"10s")

				} else {
					farmEmbed.setDescription(`Please use the command \`${prefix}profile\` first before to be able to play!`)
					return rep({embeds: [farmEmbed]},"10s")
				}  
			})
			return console.log(`done planting`)
		}

		if (userOption == "status") {

			profilesSys.findOne({
				userID: issuer.id
			}, async(err,res) =>{
				if (err) {
					sendError.create({
						Guild_Name: message.guild.name,
						Guild_ID: message.guild.id,
						User: issuer.tag,
						UserID: issuer.id,
						Error: error,
						Time: `${TheDate} || ${clock} ${amORpm}`,
						Command: this.name + " planting function",
						Args: args,
					},async (err, res) => {
						if(err) {
							console.log(err)
							return message.channel.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
						}
						if(res) {
							console.log(`successfully added error to database!`)
							logChannel.send(`[FARM-BUY]: an error happened while trying to access an user profile. If this problem persist, contact my partner!\n${err.stack}`)
						}
					})
				}
				if (res) {

					// set the default if user doesn't have it
					if (!res.farm) {
						res.farm = {
							fruits: {
								apple: {
									seeds: 0,
									harvested: 0
								},
								orange: {
									seeds: 0,
									harvested: 0
								},
								banana: {
									seeds: 0,
									harvested: 0
								},
								cherries: {
									seeds: 0,
									harvested: 0
								},
								grapes: {
									seeds: 0,
									harvested: 0
								},
								kiwi: {
									seeds: 0,
									harvested: 0
								},
								lemon: {
									seeds: 0,
									harvested: 0
								},
								peach: {
									seeds: 0,
									harvested: 0
								}
							},
							trees: {
								wood: {
									seeds: 0,
									harvested: 0
								},
								palm: {
									seeds: 0,
									harvested: 0
								},
								rich: {
									seeds: 0,
									harvested: 0
								},
								boreal: {
									seeds: 0,
									harvested: 0
								},
								ebon: {
									seeds: 0,
									harvested: 0
								},
								shade: {
									seeds: 0,
									harvested: 0
								},
								pearl: {
									seeds: 0,
									harvested: 0
								},
								dynasty: {
									seeds: 0,
									harvested: 0
								}
							},
							planters: {
								p1: {
									status: "idle",
									seed: 0,
									startTime: "0",
									endTime:  "0",
									unlocked: true
								},
								p2: {
									status: "idle",
									seed: 0,
									startTime: "0",
									endTime:  "0",
									unlocked: false
								},
								p3: {
									status: "idle",
									seed: 0,
									startTime: "0",
									endTime:  "0",
									unlocked: false
								},
								p4: {
									status: "idle",
									seed: 0,
									startTime: "0",
									endTime:  "0",
									unlocked: false
								},
								p5: {
									status: "idle",
									seed: 0,
									startTime: "0",
									endTime:  "0",
									unlocked: false
								},
								p6: {
									status: "idle",
									seed: 0,
									startTime: "0",
									endTime:  "0",
									unlocked: false
								},
								
							}
						}
						res.save().catch(err => console.log(err))
						farmEmbed.setDescription(`I've set up your data so it can be properly used! Please type again the command. Thank you!`)
						return rep({embeds: [farmEmbed]},"10s")
					}
				
					//#region initializing variables for planters
					let p1Data = res.farm.planters.p1;
					let p1SeedData = null;
					
					let p2Data = res.farm.planters.p2;
					let p2SeedData = null;
					
					let p3Data = res.farm.planters.p3;
					let p3SeedData = null;
					
					let p4Data = res.farm.planters.p4;
					let p4SeedData = null;
					
					let p5Data = res.farm.planters.p5;
					let p5SeedData = null;
					
					let p6Data = res.farm.planters.p6;
					let p6SeedData = null;
					//#endregion

					//#region collecting data about seeds
					if (p1Data.seed != 0) {
						let fruitsOrTrees = p1Data.seed < 200 ? "fruits" : "trees"
						p1SeedData = shopdata[fruitsOrTrees].find(item => item.id == p1Data.seed)
					}
					if (p2Data.seed != 0) {
						let fruitsOrTrees = p2Data.seed < 200 ? "fruits" : "trees"
						p2SeedData = shopdata[fruitsOrTrees].find(item => item.id == p2Data.seed)
					}
					if (p3Data.seed != 0) {
						let fruitsOrTrees = p3Data.seed < 200 ? "fruits" : "trees"
						p3SeedData = shopdata[fruitsOrTrees].find(item => item.id == p3Data.seed)
					}
					if (p4Data.seed != 0) {
						let fruitsOrTrees = p4Data.seed < 200 ? "fruits" : "trees"
						p4SeedData = shopdata[fruitsOrTrees].find(item => item.id == p4Data.seed)
					}
					if (p5Data.seed != 0) {
						let fruitsOrTrees = p5Data.seed < 200 ? "fruits" : "trees"
						p5SeedData = shopdata[fruitsOrTrees].find(item => item.id == p5Data.seed)
					}
					if (p6Data.seed != 0) {
						let fruitsOrTrees = p6Data.seed < 200 ? "fruits" : "trees"
						p6SeedData = shopdata[fruitsOrTrees].find(item => item.id == p6Data.seed)
					}
					//#endregion

					//#region settle the data if the harvest is done!
					if (p1Data.status == "growing" && Number(p1Data.startTime) + Number(p1Data.duration) < Number(Date.now()/1000))
					{
						p1Data.status = "harvestable";
						console.log(`set p1 as harvestable`)
					}
					if (p2Data.status == "growing" && Number(p2Data.startTime) + Number(p2Data.duration) < Number(Date.now()/1000))
					{
						p2Data.status = "harvestable";
						console.log(`set p2 as harvestable`)
					}
					if (p3Data.status == "growing" && Number(p3Data.startTime) + Number(p3Data.duration) < Number(Date.now()/1000))
					{
						p3Data.status = "harvestable";
						console.log(`set p3 as harvestable`)
					}

					if (p4Data.status == "growing" && Number(p4Data.startTime) + Number(p4Data.duration) < Number(Date.now()/1000))
					{
						console.log(`set p4 as harvestable`)
						p4Data.status = "harvestable";
					}
					if (p5Data.status == "growing" && Number(p5Data.startTime) + Number(p5Data.duration) < Number(Date.now()/1000))
					{
						console.log(`set p5 as harvestable`)
						p5Data.status = "harvestable";
					}	
					if (p6Data.status == "growing" && Number(p6Data.startTime) + Number(p6Data.duration) < Number(Date.now()/1000))
					{
						console.log(`set p6 as harvestable`)
						p6Data.status = "harvestable";
					}
					
					res.farm.planters.p1 = p1Data
					res.farm.planters.p2 = p2Data
					res.farm.planters.p3 = p3Data
					res.farm.planters.p4 = p4Data
					res.farm.planters.p5 = p5Data
					res.farm.planters.p6 = p6Data

					res.save().catch(err => console.log(err))
					//#endregion

					let statusEmbed = new SharuruEmbed()
						.setAuthor(`Farming game!`)
						.setColor(`LUMINOUS_VIVID_PINK`)
						.setFooter(`Requested by ${issuer.tag} `)
									.addField(`First Planter:`, `**Seed:** *${p1SeedData == null ? `No seed` : p1SeedData.name }*\n**Status:** *${p1Data.status}*\n**Finishing:** *${p1Data.status == "idle" || p1Data.status == "harvestable" ? `\`Ready for next task!\`` : `<t:${Number(p1Data.startTime)+Number(p1Data.duration)}:R>`}*\n`,false)
					
					if (p2Data.unlocked)
						statusEmbed.addField(`Second Planter:`, `**Seed:** *${p2SeedData == null ? `No seed` : p2SeedData.name }*\n**Status:** *${p2Data.status}*\n**Finishing:** *${p2Data.status == "idle" || p2Data.status == "harvestable" ? `\`Ready for next task!\`` : `<t:${Number(p2Data.startTime)+Number(p2Data.duration)}:R>`}*\n`,false)
					
					if (p3Data.unlocked)
						statusEmbed.addField(`Third Planter:`, `**Seed:** *${p3SeedData == null ? `No seed` : p3SeedData.name }*\n**Status:** *${p3Data.status}*\n**Finishing:** *${p3Data.status == "idle" || p3Data.status == "harvestable" ? `\`Ready for next task!\`` : `<t:${Number(p3Data.startTime)+Number(p3Data.duration)}:R>`}*\n`, false)
					
					if (p4Data.unlocked)
						statusEmbed.addField(`Fourth Planter:`, `**Seed:** *${p4SeedData == null ? `No seed` : p4SeedData.name }*\n**Status:** *${p4Data.status}*\n**Finishing:** *${p4Data.status == "idle" || p4Data.status == "harvestable" ? `\`Ready for next task!\`` : `<t:${Number(p4Data.startTime)+Number(p4Data.duration)}:R>`}*\n`, false)
					
					if (p5Data.unlocked)
						statusEmbed.addField(`Fifth Planter:`, `**Seed:** *${p5SeedData == null ? `No seed` : p5SeedData.name }*\n**Status:** *${p5Data.status}*\n**Finishing:** *${p5Data.status == "idle" || p5Data.status == "harvestable" ? `\`Ready for next task!\`` : `<t:${Number(p5Data.startTime)+Number(p5Data.duration)}:R>`}*\n`, false)
					
					if (p6Data.unlocked)
						statusEmbed.addField(`Sixth Planter:`, `**Seed:** *${p6SeedData == null ? `No seed` : p6SeedData.name }*\n**Status:** *${p6Data.status}*\n**Finishing:** *${p6Data.status == "idle" || p6Data.status == "harvestable" ? `\`Ready for next task!\`` : `<t:${Number(p6Data.startTime)+Number(p6Data.duration)}:R>`}*\n`, false)

					return rep({embeds: [statusEmbed]},"120s")
				} else {
					farmEmbed.setDescription(`Please use the command \`${prefix}profile\` first before to be able to play!`)
					return rep({embeds: [farmEmbed]},"10s")
				}  
			})
		}

		if (userOption == "harvest") {
			profilesSys.findOne({
				userID: issuer.id
			}, async(err,res) =>{
				if (err) {
					sendError.create({
						Guild_Name: message.guild.name,
						Guild_ID: message.guild.id,
						User: issuer.tag,
						UserID: issuer.id,
						Error: error,
						Time: `${TheDate} || ${clock} ${amORpm}`,
						Command: this.name + " planting function",
						Args: args,
					},async (err, res) => {
						if(err) {
							console.log(err)
							return message.channel.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
						}
						if(res) {
							console.log(`successfully added error to database!`)
							logChannel.send(`[FARM-BUY]: an error happened while trying to access an user profile. If this problem persist, contact my partner!\n${err.stack}`)
						}
					})
				}
				if (res) {

					// set the default if user doesn't have it
					if (!res.farm) {
						res.farm = {
							fruits: {
								apple: {
									seeds: 0,
									harvested: 0
								},
								orange: {
									seeds: 0,
									harvested: 0
								},
								banana: {
									seeds: 0,
									harvested: 0
								},
								cherries: {
									seeds: 0,
									harvested: 0
								},
								grapes: {
									seeds: 0,
									harvested: 0
								},
								kiwi: {
									seeds: 0,
									harvested: 0
								},
								lemon: {
									seeds: 0,
									harvested: 0
								},
								peach: {
									seeds: 0,
									harvested: 0
								}
							},
							trees: {
								wood: {
									seeds: 0,
									harvested: 0
								},
								palm: {
									seeds: 0,
									harvested: 0
								},
								rich: {
									seeds: 0,
									harvested: 0
								},
								boreal: {
									seeds: 0,
									harvested: 0
								},
								ebon: {
									seeds: 0,
									harvested: 0
								},
								shade: {
									seeds: 0,
									harvested: 0
								},
								pearl: {
									seeds: 0,
									harvested: 0
								},
								dynasty: {
									seeds: 0,
									harvested: 0
								}
							},
							planters: {
								p1: {
									status: "idle",
									seed: 0,
									startTime: "0",
									endTime:  "0",
									unlocked: true
								},
								p2: {
									status: "idle",
									seed: 0,
									startTime: "0",
									endTime:  "0",
									unlocked: false
								},
								p3: {
									status: "idle",
									seed: 0,
									startTime: "0",
									endTime:  "0",
									unlocked: false
								},
								p4: {
									status: "idle",
									seed: 0,
									startTime: "0",
									endTime:  "0",
									unlocked: false
								},
								p5: {
									status: "idle",
									seed: 0,
									startTime: "0",
									endTime:  "0",
									unlocked: false
								},
								p6: {
									status: "idle",
									seed: 0,
									startTime: "0",
									endTime:  "0",
									unlocked: false
								},
								
							}
						}
						res.save().catch(err => console.log(err))
						farmEmbed.setDescription(`I've set up your data so it can be properly used! Please type again the command. Thank you!`)
						return rep({embeds: [farmEmbed]},"10s")
					}
					let plantersCollected = []
					//#region initializing variables for planters
					let p1Data = res.farm.planters.p1;
					let p2Data = res.farm.planters.p2;
					let p3Data = res.farm.planters.p3;
					let p4Data = res.farm.planters.p4;
					let p5Data = res.farm.planters.p5;
					let p6Data = res.farm.planters.p6;
					//#endregion
					
					//#region settle the data if the harvest is done!
					if (p1Data.status == "growing" && Number(p1Data.startTime) + Number(p1Data.duration) < Number(Date.now()/1000))
						p1Data.status = "harvestable";
					if (p2Data.status == "growing" && Number(p2Data.startTime) + Number(p2Data.duration) < Number(Date.now()/1000))
						p2Data.status = "harvestable";
					if (p3Data.status == "growing" && Number(p3Data.startTime) + Number(p3Data.duration) < Number(Date.now()/1000))
						p3Data.status = "harvestable";
					if (p4Data.status == "growing" && Number(p4Data.startTime) + Number(p4Data.duration) < Number(Date.now()/1000))
						p4Data.status = "harvestable";
					if (p5Data.status == "growing" && Number(p5Data.startTime) + Number(p5Data.duration) < Number(Date.now()/1000))
						p5Data.status = "harvestable";
					if (p6Data.status == "growing" && Number(p6Data.startTime) + Number(p6Data.duration) < Number(Date.now()/1000))
						p6Data.status = "harvestable";
					
					res.farm.planters.p1 = p1Data
					res.farm.planters.p2 = p2Data
					res.farm.planters.p3 = p3Data
					res.farm.planters.p4 = p4Data
					res.farm.planters.p5 = p5Data
					res.farm.planters.p6 = p6Data

					//#endregion

					//#region if the planter is "harvestable" then collect it and set idle
					// console.log(p1Data,p2Data,p3Data,p4Data,p5Data,p6Data)
					if (p1Data.status == "harvestable") {
						let fruitsOrTrees = p1Data.seed < 200 ? "fruits" : "trees"
						let getSeedData = shopdata[fruitsOrTrees].find(item => item.id == p1Data.seed)

						// set the planter to idle & seed 0
						p1Data.status = "idle"
						p1Data.seed = 0;

						// add to inventory
						// harvest will result in a random amount of value and 
						// a chance to get seeds 

						// drop rate of harvest and seeds
						let harvestPercentage = percentageChance(["yes","no"],[getSeedData.harvest.result.dropRate,100-getSeedData.harvest.result.dropRate])
						let seedPercentage = percentageChance(["yes","no"],[getSeedData.harvest.seed.dropRate,100-getSeedData.harvest.seed.dropRate])
						console.log(`Seed percentage: ${getSeedData.harvest.seed.dropRate}%/${100-getSeedData.harvest.seed.dropRate}%`)

						// amount dropped
						let randomAmountHarvest = getRandomInt(getSeedData.harvest.result.min,getSeedData.harvest.result.max)
						let randomAmountSeed = getRandomInt(getSeedData.harvest.seed.min,getSeedData.harvest.seed.max)

						// if we get harvest, add to the player. same with the seeds
						if (harvestPercentage == "yes") 
							res.farm[getSeedData.type][getSeedData.nameId].harvested += randomAmountHarvest
						
						if (seedPercentage == "yes") 
							res.farm[getSeedData.type][getSeedData.nameId].seeds += randomAmountSeed

						console.log(`[Farming game-planter 1]: Player got harvest: "${randomAmountHarvest}" (${harvestPercentage}); seeds: "${randomAmountSeed}" (${seedPercentage})`)
						plantersCollected.push(`Planter 1: Harvested about ${randomAmountHarvest} ${getSeedData.name}(s) ${seedPercentage == "yes" ? `& about ${randomAmountSeed} seed(s)` : ``}`)
					}

					if (p2Data.unlocked == true && p2Data.status == "harvestable") {
						let fruitsOrTrees = p2Data.seed < 200 ? "fruits" : "trees"
						let getSeedData = shopdata[fruitsOrTrees].find(item => item.id == p2Data.seed)

						// set the planter to idle & seed 0
						p2Data.status = "idle"
						p2Data.seed = 0;

						// add to inventory
						// harvest will result in a random amount of value and 
						// a chance to get seeds 

						// drop rate of harvest and seeds
						let harvestPercentage = percentageChance(["yes","no"],[getSeedData.harvest.result.dropRate,100-getSeedData.harvest.result.dropRate])
						let seedPercentage = percentageChance(["yes","no"],[getSeedData.harvest.seed.dropRate,100-getSeedData.harvest.seed.dropRate])
						console.log(`Seed percentage: ${getSeedData.harvest.seed.dropRate}%/${100-getSeedData.harvest.seed.dropRate}%`)

						// amount dropped
						let randomAmountHarvest = getRandomInt(getSeedData.harvest.result.min,getSeedData.harvest.result.max)
						let randomAmountSeed = getRandomInt(getSeedData.harvest.seed.min,getSeedData.harvest.seed.max)

						// if we get harvest, add to the player. same with the seeds
						if (harvestPercentage == "yes") 
							res.farm[getSeedData.type][getSeedData.nameId].harvested += randomAmountHarvest
						
						if (seedPercentage == "yes") 
							res.farm[getSeedData.type][getSeedData.nameId].seeds += randomAmountSeed

						console.log(`[Farming game-planter 2]: Player got harvest: "${randomAmountHarvest}" (${harvestPercentage}); seeds: "${randomAmountSeed}" (${seedPercentage})`)
						plantersCollected.push(`Planter 2: Harvested about ${randomAmountHarvest} ${getSeedData.name} ${seedPercentage == "yes" ? `& about ${randomAmountSeed} seeds` : ``}`)
						
					}

					if (p3Data.unlocked == true && p3Data.status == "harvestable") {
						let fruitsOrTrees = p3Data.seed < 200 ? "fruits" : "trees"
						let getSeedData = shopdata[fruitsOrTrees].find(item => item.id == p3Data.seed)

						// set the planter to idle & seed 0
						p3Data.status = "idle"
						p3Data.seed = 0;

						// add to inventory
						// harvest will result in a random amount of value and 
						// a chance to get seeds 

						// drop rate of harvest and seeds
						let harvestPercentage = percentageChance(["yes","no"],[getSeedData.harvest.result.dropRate,100-getSeedData.harvest.result.dropRate])
						let seedPercentage = percentageChance(["yes","no"],[getSeedData.harvest.seed.dropRate,100-getSeedData.harvest.seed.dropRate])
						console.log(`Seed percentage: ${getSeedData.harvest.seed.dropRate}%/${100-getSeedData.harvest.seed.dropRate}%`)

						// amount dropped
						let randomAmountHarvest = getRandomInt(getSeedData.harvest.result.min,getSeedData.harvest.result.max)
						let randomAmountSeed = getRandomInt(getSeedData.harvest.seed.min,getSeedData.harvest.seed.max)

						// if we get harvest, add to the player. same with the seeds
						if (harvestPercentage == "yes") 
							res.farm[getSeedData.type][getSeedData.nameId].harvested += randomAmountHarvest
						
						if (seedPercentage == "yes") 
							res.farm[getSeedData.type][getSeedData.nameId].seeds += randomAmountSeed

						console.log(`[Farming game-planter 3]: Player got harvest: "${randomAmountHarvest}" (${harvestPercentage}); seeds: "${randomAmountSeed}" (${seedPercentage})`)
						plantersCollected.push(`Planter 3: Harvested about ${randomAmountHarvest} ${getSeedData.name} ${seedPercentage == "yes" ? `& about ${randomAmountSeed} seeds` : ``}`)
						
					}

					if (p4Data.unlocked == true && p4Data.status == "harvestable") {
						let fruitsOrTrees = p4Data.seed < 200 ? "fruits" : "trees"
						let getSeedData = shopdata[fruitsOrTrees].find(item => item.id == p4Data.seed)

						// set the planter to idle & seed 0
						p4Data.status = "idle"
						p4Data.seed = 0;

						// add to inventory
						// harvest will result in a random amount of value and 
						// a chance to get seeds 

						// drop rate of harvest and seeds
						let harvestPercentage = percentageChance(["yes","no"],[getSeedData.harvest.result.dropRate,100-getSeedData.harvest.result.dropRate])
						let seedPercentage = percentageChance(["yes","no"],[getSeedData.harvest.seed.dropRate,100-getSeedData.harvest.seed.dropRate])
						console.log(`Seed percentage: ${getSeedData.harvest.seed.dropRate}%/${100-getSeedData.harvest.seed.dropRate}%`)

						// amount dropped
						let randomAmountHarvest = getRandomInt(getSeedData.harvest.result.min,getSeedData.harvest.result.max)
						let randomAmountSeed = getRandomInt(getSeedData.harvest.seed.min,getSeedData.harvest.seed.max)

						// if we get harvest, add to the player. same with the seeds
						if (harvestPercentage == "yes") 
							res.farm[getSeedData.type][getSeedData.nameId].harvested += randomAmountHarvest
						
						if (seedPercentage == "yes") 
							res.farm[getSeedData.type][getSeedData.nameId].seeds += randomAmountSeed

						console.log(`[Farming game-planter 4]: Player got harvest: "${randomAmountHarvest}" (${harvestPercentage}); seeds: "${randomAmountSeed}" (${seedPercentage})`)
						plantersCollected.push(`Planter 4: Harvested about ${randomAmountHarvest} ${getSeedData.name} ${seedPercentage == "yes" ? `& about ${randomAmountSeed} seeds` : ``}`)
						
					}

					if (p5Data.unlocked == true && p5Data.status == "harvestable") {
						let fruitsOrTrees = p5Data.seed < 200 ? "fruits" : "trees"
						let getSeedData = shopdata[fruitsOrTrees].find(item => item.id == p5Data.seed)

						// set the planter to idle & seed 0
						p5Data.status = "idle"
						p5Data.seed = 0;

						// add to inventory
						// harvest will result in a random amount of value and 
						// a chance to get seeds 

						// drop rate of harvest and seeds
						let harvestPercentage = percentageChance(["yes","no"],[getSeedData.harvest.result.dropRate,100-getSeedData.harvest.result.dropRate])
						let seedPercentage = percentageChance(["yes","no"],[getSeedData.harvest.seed.dropRate,100-getSeedData.harvest.seed.dropRate])
						console.log(`Seed percentage: ${getSeedData.harvest.seed.dropRate}%/${100-getSeedData.harvest.seed.dropRate}%`)

						// amount dropped
						let randomAmountHarvest = getRandomInt(getSeedData.harvest.result.min,getSeedData.harvest.result.max)
						let randomAmountSeed = getRandomInt(getSeedData.harvest.seed.min,getSeedData.harvest.seed.max)

						// if we get harvest, add to the player. same with the seeds
						if (harvestPercentage == "yes") 
							res.farm[getSeedData.type][getSeedData.nameId].harvested += randomAmountHarvest
						
						if (seedPercentage == "yes") 
							res.farm[getSeedData.type][getSeedData.nameId].seeds += randomAmountSeed

						console.log(`[Farming game-planter 5]: Player got harvest: "${randomAmountHarvest}" (${harvestPercentage}); seeds: "${randomAmountSeed}" (${seedPercentage})`)
						plantersCollected.push(`Planter 5: Harvested about ${randomAmountHarvest} ${getSeedData.name} ${seedPercentage == "yes" ? `& about ${randomAmountSeed} seeds` : ``}`)
						
					}

					if (p6Data.unlocked == true && p6Data.status == "harvestable") {
						let fruitsOrTrees = p6Data.seed < 200 ? "fruits" : "trees"
						let getSeedData = shopdata[fruitsOrTrees].find(item => item.id == p6Data.seed)

						// set the planter to idle & seed 0
						p6Data.status = "idle"
						p6Data.seed = 0;

						// add to inventory
						// harvest will result in a random amount of value and 
						// a chance to get seeds 

						// drop rate of harvest and seeds
						let harvestPercentage = percentageChance(["yes","no"],[getSeedData.harvest.result.dropRate,100-getSeedData.harvest.result.dropRate])
						let seedPercentage = percentageChance(["yes","no"],[getSeedData.harvest.seed.dropRate,100-getSeedData.harvest.seed.dropRate])
						console.log(`Seed percentage: ${getSeedData.harvest.seed.dropRate}%/${100-getSeedData.harvest.seed.dropRate}%`)

						// amount dropped
						let randomAmountHarvest = getRandomInt(getSeedData.harvest.result.min,getSeedData.harvest.result.max)
						let randomAmountSeed = getRandomInt(getSeedData.harvest.seed.min,getSeedData.harvest.seed.max)

						// if we get harvest, add to the player. same with the seeds
						if (harvestPercentage == "yes") 
							res.farm[getSeedData.type][getSeedData.nameId].harvested += randomAmountHarvest
						
						if (seedPercentage == "yes") 
							res.farm[getSeedData.type][getSeedData.nameId].seeds += randomAmountSeed

						console.log(`[Farming game-planter 6]: Player got harvest: "${randomAmountHarvest}" (${harvestPercentage}); seeds: "${randomAmountSeed}" (${seedPercentage})`)
						plantersCollected.push(`Planter 6: Harvested about ${randomAmountHarvest} ${getSeedData.name} ${seedPercentage == "yes" ? `& about ${randomAmountSeed} seeds` : ``}`)
						
					}

					res.save().catch(err=> console.log(err))
					//#endregion
				
					farmEmbed.setDescription(`You have harvested the following planters:\n${plantersCollected.join(";\n")}`)
					return rep({embeds:[farmEmbed]},"30s")
				} else {
					farmEmbed.setDescription(`Please use the command \`${prefix}profile\` first before to be able to play!`)
					return rep({embeds: [farmEmbed]},"10s")
				}  
			})
		}

		function getRandomInt(min, max) {
			min = Math.ceil(min);
			max = Math.floor(max);
			return Math.floor(Math.random() * (max - min + 1)) + min;
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

		/**
         * 
         * @param {Object} options The object containing possible "content(msg)/embeds/components/files etc".
         * @param {String} timeout the time after which to delete. If null/0, it will not execute
         */
		 function rep(options,timeout = 0) {
			let thismsg;
			thismsg = message.channel.send(options)
			if (timeout != null || timeout != 0) {
				thismsg.then(m => {
					myUtils.mgoAdd(message.guild.id,message.channel.id,m.id,ms(timeout))
				})
			}
		}
	}

};
