/* eslint-disable no-unused-vars */
const cooking_players = require("../../Models/events/cooking/cooking_players");
const ingredients_db = require("../../Assets/events/cooking/ingredients.json");
const recipes_db = require('../../Assets/events/cooking/recipes.json');
const SharuruEmbed = require(`../../Structures/SharuruEmbed`);
const guildSettings = require('../../Models/GuildSettings');
const Command = require('../../Structures/Command.js');
const sendError = require('../../Models/Error');
const keygen = require("keygenerator");
const path = require("path");
const _ = require('lodash')
const fs = require('fs');
const ms = require('ms');
const pms = require('pretty-ms');
const config = require(`../../../config.json`);
const { ActionRowBuilder, ButtonBuilder, PermissionsBitField, ButtonStyle } = require("discord.js");

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'cooking',
			displaying: true,
			cooldown: 3000,
			description: 'The Cooking event!',
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
			aliases: ['ck','cook']
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
		
		const issuer = message.author;
		const tools = this.client.utils;
		const sharuru = this.client;
		const logChannel = message.guild.channels.cache.find(ch => ch.name == "sharuru-logs");
		const prefix = this.client.prefixes.get(message.guild.id);
		const userOptionList = ['start','inventory','leaderboard','gather','gift','pair','climb','stats','trade','daily','request']
		const optionList = ['welcome','switch','settings','lock','start','inventory','inv','leaderboard','top','gather','gift','pair','climb','stats','trade','daily','request']
		const userOption = args[0]?.toLowerCase();
		const evranks = ['stranger','acquaintance','friendship','lover','soulmate']
		let info = true
		let event_name = `Cooking Event`
		const cooking_lex = {
			// easy 12
			1: 'cooked_rice',
			2: 'rice_vegetables',
			3: 'fried_eggs',
			4: 'egg_rolls',
			5: 'simple_bread',
			6: 'boiled_eggs',
			7: 'quicke_mug',
			8: 'baked_potatos',
			9: 'chocolate_banana_smoothie',
			10: 'chocolate_covered_strawberry', // friendship
			11: 'red_velvet_cookies',// lover
			12: 'dark_choco_pudding',// soul
			
			// medium 12
			13: 'chicken_soup',
			14: 'mushroom_stew',
			15: 'pb_nd_banana_cake',
			16: 'breakfast_special',
			17: 'hashbrown',
			18: 'chocolate_parfait',
			19: 'minced_fowl_cutlet',
			20: 'minced_pork_cutlet',
			21: 'minced_beef_cutlet',
			22: 'chocolate_truffles_cookies', // friend
			23: 'blackberry_raspberry_jam_tarts', // lover
			24: 'valentine_biscuits', // soul

			// hard 10
			25: 'tokitura_fowl',
			26: 'tokitura_pork',
			27: 'tokitura_beef',
			28: 'fruit_crepes_strawberry',
			29: 'fruit_crepes_blackberry',
			30: 'fruit_crepes_raspberry',
			31: 'golden_garlic_crab',
			32: 'good_morning_pall', // friend
			33: 'omurice', // lover
			34: 'sweetheart_cupcakes', // soul

			// rare 5
			35: 'simmered_shiitake_mushrooms',
			36: 'sashimi_platter',
			37: 'next_level_potatoes', // friend
			38: 'sushi_platter', // lover
			39: 'valentine_night_strawberry', // soul

			//new recipes
			40: 'banana_pancake',
			41: 'fruit_bowls',
			42: 'choco_banana_bites',
			43: 'meaty_platter',
			44: 'feed_gorilla',
			45: 'three_breadeers',
		}
		const ingredients_lex = {
			1:'Banana',
			2:'Carrot',
			3:'Egg',
			4:'Flour',
			5:'Pepper',
			6:'Rice',
			7:'Salt',
			8:'Sugar',
			9:'Water (100ML)',

			100:'Bell Pepper',
			101:'Butter',
			102:'Cabbage',
			103:'Fowl',
			104:'Garlic',
			105:'Milk (50ML)',
			106:'Mushroom',
			107:'Oil (50ML)',
			108:'Onion',
			109:'Strawberry',
			110:'Strawberry Jam (25ML)',
			111:'Tomato',
			
			200:'Bacon',
			201:'Blackberry Jam (25ML)',
			202:'Bread',
			203:'Chocolate',
			204:'Kiwi',
			205:'Lemon',
			206:'Mandarin',
			207:'Pork',
			208:'Potato',

			300:'Beef',
			301:'Chocolate Syrup (25ML)',
			302:'Mint Leaves',
			303:'Mirin (10ML)',
			304:'Raspberry Jam (25ML)',
			305:'Soy Sauce (10ML)',
			
			400:'Crab',
			401:'Fish',
			402:'Pineapple',
			403:'Shiitake Mushroom',
			404:'Shrimp',
			405:'Sour Cream (15ML)',
			406:'Walnut',
		}
		const ingredients_lex_db = {
			1:'banana',
			2:'carrot',
			3:'egg',
			4:'flour',
			5:'pepper',
			6:'rice',
			7:'salt',
			8:'sugar',
			9:'water',

			100:'bell_peppers',
			101:'butter',
			102:'cabbage',
			103:'fowl',
			104:'garlic',
			105:'milk',
			106:'mushroom',
			107:'oil',
			108:'onion',
			109:'strawberry',
			110:'strawberry_jam',
			111:'tomato',
			
			200:'bacon',
			201:'blackberry_jam',
			202:'bread',
			203:'chocolate',
			204:'kiwi',
			205:'lemon',
			206:'mandarin',
			207:'pork',
			208:'potato',

			300:'beef',
			301:'chocolate_syrup',
			302:'mint_leaves',
			303:'mirin',
			304:'raspberry_jam',
			305:'soy_sauce',
			
			400:'crab',
			401:'fish',
			402:'pineapple',
			403:'shiitake_mushrooms',
			404:'shrimp',
			405:'sour_cream',
			406:'walnut',
		}
		
		if (userOption == 't' && issuer.id == '186533323403689986') {
			// let test = message.guild.channels.cache.get(args[1]).messages.cache.get(args[2])//.delete()
			console.log(this.client.airdropClients)
			
			return console.log(`done`)
		}
		if (userOption == 'r'&& issuer.id == '186533323403689986') {
			let gimme = this.client.myEvents.get(message.guild.id)
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

		let eventEmbed = new SharuruEmbed()
			.setColor(`LUMINOUS_VIVID_PINK`)
			.setAuthor(`${event_name}`)//cooking event
			.setFooter(`Chef ${issuer.tag}`,issuer.displayAvatarURL())

		if (optionList.indexOf(userOption) == -1) {
			eventEmbed.setDescription(`I don't have any option like that. I know only:\n\`- ${userOptionList.join(",\n- ")}\``)
			return rep(null,null,eventEmbed,true,'30s');
		} 
		// console.log(`it's working, the file works.`)
		guildSettings.findOne({
			ID: message.guild.id
		},async (err,res) =>{
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
						return message.channel.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
					}
					if(res) {
						console.log(`successfully added error to database!`)
					}
				})
			}
			if (res) {

				if (res.events.cooking.enabled == false && !message.guild.members.cache.get(issuer.id).roles.cache.has(res.staffRole)) {
					eventEmbed.setDescription(`Sowwy but this event isn't enabled either because it's not the time yet, it's over or technical difficulties. If later case, notice a mod/admin about this!`)
					return rep(null,null,eventEmbed)
				}
				// start
				if (optionList.indexOf(userOption) == 4) {
					if (res.events.cooking.statsLockChannel != '0' && message.channel.id != res.events.cooking.statsLockChannel) {
							eventEmbed.setDescription(`${issuer}, you cannot use this command here! Head over to <#${res.events.cooking.statsLockChannel}> to use it!`)
						return rep(null,null,eventEmbed,true,'10s')
					}
					let recipe_chosen = args[1]

					// if not in cooking hall then don't cook
					if (message.channel.id != res.events.cooking.cookingHall) {
						eventEmbed.setDescription(`This isn't your desk with all the cooking utensils! Go back to the <#${res.events.cooking.cookingHall}>!`)
						return rep(null,null,eventEmbed)
					}
					let get_recipe = recipes_db[cooking_lex[recipe_chosen]]
					let dish_made = {
						id: `${recipe_chosen}${keygen.number({length:4})}`,
						name: `NOT MADE YET`,
						type: get_recipe.type ?? null ,
						quality: `normal`,
						points: 0
					}

					// cook recipe info
					if (get_recipe != undefined) {
						if (info) console.log(`[${event_name}]: Recipe with id "${recipe_chosen}":`,get_recipe)
					} else  {
						eventEmbed.setDescription(`Sadly I don't know this recipe... Are you sure this recipe exist at all?`)
						console.log(`[${event_name}]: There isn't a recipe with id "${recipe_chosen}"!`)
						return rep(null,null,eventEmbed)
					}

					//search in db for player
					cooking_players.findOne({
						userID: issuer.id,
						guild: message.guild.id
					},async(err2,res2) =>{
						if (err2) {
							sendError.create({
								Guild_Name: message.guild.name,
								Guild_ID: message.guild.id,
								User: issuer.tag,
								UserID: issuer.id,
								Error: error,
								Time: `${TheDate} || ${clock} ${amORpm}`,
								Command: this.name+" looking in cooking players db",
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
						if (res2) {// if it's in db
							let isMissingSmth = false;
							let whatNeed = ``

							if (res2.cooldowns.cook > Date.now()) {
								eventEmbed.setDescription(`Aw, sadly the cooking utensils are not washed yet entirely. You still need a bit of time before cooking another masterpiece! I would say to come back in about ${pms(Number(res2.cooldowns.cook - Date.now()))}... `)
								return rep(null,null,eventEmbed)
							}

							// check if u have ingredients;
							console.log(`${issuer.tag} ingredients for recipe id ${recipe_chosen}:`)
							for(let item of Object.entries(get_recipe.ingredients)) {
								console.log(`${item[0]}: ${res2.inventory.ingredients[item[0]]} ${res2.inventory.ingredients[item[0]] < item[1] ? `(needs ${item[1]-res2.inventory.ingredients[item[0]]} more)` : ``}`)
								if (res2.inventory.ingredients[item[0]] < item[1]) {
									isMissingSmth = true;
									whatNeed += `- ${item[1]-res2.inventory.ingredients[item[0]]} more \`${item[0].replace("_"," ")}\`\n`
								}
							}
							
							if (isMissingSmth) {
								eventEmbed.setDescription(`Sadly you do not own enough ingredients to make \`${get_recipe.name}\`. You need:\n${whatNeed}`)
								return rep(null,null,eventEmbed)
							}

							res2.cooldowns.cook = Date.now() + (get_recipe.cooldown * 1000)
							//#region calculate dish type (sus,nor,del) and give specific points
							let cook_chance = percentageChance(['suspicious','normal','delicious'],[res.events.cooking.dish_chances.suspicious,res.events.cooking.dish_chances.normal,res.events.cooking.dish_chances.delicious])
							if (cook_chance == 'suspicious') {
								eventEmbed.setDescription(`Congratulations! You got... emm... something at least! You got a **Suspicious ${get_recipe.name}**! The id of the dish is: **${dish_made.id}**`)//${['friendship','love','soulmate'].includes(get_recipe.type) ? ` You will get bonus points when giving this dish to someone!` : ``}
								dish_made.points = get_recipe.points*0.8;
								dish_made.name ="Suspicious " + get_recipe.name
								dish_made.quality = 'suspicious'
							}
							if (cook_chance == 'normal') {
								eventEmbed.setDescription(`Congratulations! You got **${get_recipe.name}**! The id of the dish is: **${dish_made.id}**`)//
								dish_made.points = get_recipe.points;
								dish_made.name = get_recipe.name
							}
							if (cook_chance == 'delicious') {
								eventEmbed.setDescription(`Congratulations! You got a **Delicious ${get_recipe.name}**!!${['friendship','love','soulmate'].includes(get_recipe.type) ? ` You will get bonus points when gifting this dish to someone special **at the right time**!` : ``}  The id of the dish is: **${dish_made.id}**`)//
								dish_made.points = get_recipe.points*1.2
								dish_made.name = "Delicious " +get_recipe.name
								dish_made.quality = 'delicious'
								if (['friendship','love','soulmate'].includes(get_recipe.type)) dish_made.type = get_recipe.type
							}

							// remove the ingredients used
							for(let item of Object.entries(get_recipe.ingredients)) {
								res2.inventory.ingredients[item[0]] -= item[1];
								if (info) console.log(`[${event_name}]: Removed ${item[1]} ${item[0]} from ${issuer.tag} inv.`)
							}

							// send the dish into our inv
							res2.inventory.dishes.push(dish_made);
							res2.save().catch(err3 => console.log(err3))
							return rep(null,null,eventEmbed)
						} else create_new_uevent(`Because u were new here, you will have to try this command again to cook!`)// else create new entry
					})
				}
				
				// inventory
				if (optionList.indexOf(userOption) == 5 || optionList.indexOf(userOption) == 6) {
					if (res.events.cooking.statsLockChannel != '0' && message.channel.id != res.events.cooking.statsLockChannel) {
						eventEmbed.setDescription(`${issuer}, you cannot use this command here! Head over to <#${res.events.cooking.statsLockChannel}> to use it!`)
					return rep(null,null,eventEmbed,true,'10s')
				}
					let dishesInv = args[1]
					cooking_players.findOne({
						userID: issuer.id,
						guild: message.guild.id
					},(err2,res2) =>{
						if (err2) {
							sendError.create({
								Guild_Name: message.guild.name,
								Guild_ID: message.guild.id,
								User: issuer.tag,
								UserID: issuer.id,
								Error: err2,
								Time: `${TheDate} || ${clock} ${amORpm}`,
								Command: this.name+" looking in cooking_palyers db",
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
						if (res2) {
							let dishes = res2.inventory.dishes;
							if (dishesInv == 'd' || dishesInv == 'dishes' || dishesInv == 'dish') {
								eventEmbed.setTitle(`\`Below you have the following dishes done (only first 5 are visible if there's more than 5 dishes)\``)
								let thisMuch = dishes.length > 5 ? 5 : dishes.length
								if (dishes.length > 0)
									for(let i = 0; i< thisMuch ;i++) 
										eventEmbed.addField(`${i+1}) ID: ${dishes[i].id}`,`**${dishes[i].name}** (${roundPrecised(dishes[i].points,1)} points)`)
								else
									eventEmbed.setDescription(`There's no dish to taste! Make more delicious dishes!`)
							} else { // show inventory of ingredients
							let user_ingredients = res2.inventory.ingredients;
								eventEmbed.setDescription(`Below you have the following ingredients at your disposal:`)
								.addFields([
									{name: `Basic Ingredients:`,value:`
- :banana: (${user_ingredients.banana}) - :carrot: (${user_ingredients.carrot})
- :egg: (${user_ingredients.egg}) - <:flour:939233358687383592> (${user_ingredients.flour})
- <:pepper:939233357185835039> (${user_ingredients.pepper})	- :rice: (${user_ingredients.rice})
- :salt: (${user_ingredients.salt})	- <:sugar:939233357391351859> (${user_ingredients.sugar})
- :droplet: (${user_ingredients.water} ML)`},

{name: `Zone 1 Ingredients:`,value:`- :bell_pepper: (${user_ingredients.bell_peppers})		- :butter: (${user_ingredients.butter})
- :leafy_green: (${user_ingredients.cabbage})		- :poultry_leg: (${user_ingredients.fowl})
- :garlic: (${user_ingredients.garlic})	- :milk: (${user_ingredients.milk} ML)
- :mushroom: (${user_ingredients.mushroom})	- :oil: (${user_ingredients.oil} ML)
- :onion: (${user_ingredients.onion})		- :strawberry: ${user_ingredients.strawberry}
- <:strawberry_jam:939233357739479132> (${user_ingredients.strawberry_jam} ML)	- :tomato: (${user_ingredients.tomato})`},

{name:`Zone 2 Ingredients:`,value:`
- :bacon: (${user_ingredients.bacon})	- <:blackberry_jam:939233357563306054> (${user_ingredients.blackberry_jam} ML)
- :bread: (${user_ingredients.bread})	- :chocolate_bar: (${user_ingredients.chocolate})
- :kiwi: (${user_ingredients.kiwi})	- :lemon: (${user_ingredients.lemon})
- :tangerine: (${user_ingredients.mandarin})	- :meat_on_bone: (${user_ingredients.pork})
- :potato: (${user_ingredients.potato})
`},

{name:`Zone 3 Ingredients:`,value:`- :cut_of_meat: (${user_ingredients.beef})	- <:chocolate_syrup:939233357747863672> (${user_ingredients.chocolate_syrup} ML)
- :herb: (${user_ingredients.mint_leaves})		- <:mirin:939233357789794324> (${user_ingredients.mirin} ML)
- <:soy_sauce:939233357915627560> (${user_ingredients.soy_sauce})	- <:raspberry_jam:939233357370376204> (${user_ingredients.raspberry_jam} ML)`},

{name:`Zone 4 Ingredients:`,value:`- :crab: (${user_ingredients.crab})	- :tropical_fish: (${user_ingredients.fish})
- :pineapple: (${user_ingredients.pineapple})	- <:shiitake_mushroom:939233357676572713> (${user_ingredients.shiitake_mushrooms})
- :shrimp: (${user_ingredients.shrimp})	- <:sour_cream:939233357957570591> (${user_ingredients.sour_cream})
- <:walnut:941727076820586566> (${user_ingredients.walnut})`}])
							}
							return rep(null,false,eventEmbed);

						} else {
							return create_new_uevent(`Because you're a new chef entering the stage, we made a little space for you to lay your ingredients/dishes and share with everyone! Retry this command!`)
						}
					})
				}

				// leaderboard
				if (optionList.indexOf(userOption) == 7 || optionList.indexOf(userOption) == 8 ) {
					// if (res.events.cooking.statsLockChannel != '0' && message.channel.id != res.events.cooking.statsLockChannel) {
					// 	eventEmbed.setDescription(`${issuer}, you cannot use this command here! Head over to <#${res.events.cooking.statsLockChannel}> to use it!`)
					// return rep(null,null,eventEmbed,true,'10s')
					// }
					let whatRank = args[1]
					cooking_players.findOne({
						userID: issuer.id,
						guild: message.guild.id
					},async(err2,res2) =>{
						if (err2) {
							sendError.create({
								Guild_Name: message.guild.name,
								Guild_ID: message.guild.id,
								User: issuer.tag,
								UserID: issuer.id,
								Error: err2,
								Time: `${TheDate} || ${clock} ${amORpm}`,
								Command: this.name+" looking in guild db- top player",
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
						if (res2) {
							if (res2.cooldowns.top > Date.now()) {
								eventEmbed.setDescription(`Sadly you can't use this yet! You can reuse this over ${pms(Number(res2.cooldowns.top-Date.now()))}!`)
								return rep(null,null,eventEmbed, true, '15s')
							}
							cooking_players.find({guild: message.guild.id},async(err2,res2) =>{
								if (err2) {
									sendError.create({
										Guild_Name: message.guild.name,
										Guild_ID: message.guild.id,
										User: issuer.tag,
										UserID: issuer.id,
										Error: err2,
										Time: `${TheDate} || ${clock} ${amORpm}`,
										Command: this.name+" looking in guild db- top",
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
								if (res2) {
									switch (whatRank?.toLowerCase()) {
										case `stranger`:
											show_top(res2, whatRank);
										break;
										case `acquaintance`:
											show_top(res2, whatRank);
										break;
										case `friendship`:
											show_top(res2, whatRank);
										break;
										case `lover`:
											show_top(res2, whatRank);
										break;
										case `soulmate`:
											show_top(res2, whatRank);
										break;
										default:
											eventEmbed.setDescription(`Please specify a category between \`stranger\`, \`acquaintance\`, \`friendship\`, \`lover\` & \`soulmate\`.`)
											rep(null,null,eventEmbed)
											break;
									}
								}
							})
							res2.cooldowns.top = Date.now() + (res.events.cooking.cooldowns.top * 1000)
							res2.save().catch(err => console.log(err))
						} else {
							return create_new_uevent(`Because you're a new chef entering the stage, we made a little space for you to lay your ingredients/dishes and share with everyone! Retry this command!`)
						}
					})
					
					//return create_new_uevent(`Because you're a new chef entering the stage, we made a little space for you to lay your ingredients/dishes and share with everyone! Retry this command!`)
				}

				// gather
				if (optionList.indexOf(userOption) == 9) {
				// 	if (res.events.cooking.statsLockChannel != '0' && message.channel.id != res.events.cooking.statsLockChannel) {
				// 		eventEmbed.setDescription(`${issuer}, you cannot use this command here! Head over to <#${res.events.cooking.statsLockChannel}> to use it!`)
				// 	return rep(null,null,eventEmbed,true,'10s')
				// }
					let threadList = {
						basic: res.events.cooking.threads.basic,
						zone1: res.events.cooking.threads.zone1,
						zone2: res.events.cooking.threads.zone2,
						zone3: res.events.cooking.threads.zone3,
						zone4: res.events.cooking.threads.zone4,
						// test: undefined
					}

					//safety check
					if (Object.values(threadList).includes(undefined)) {
						eventEmbed.setDescription(`Please make sure to mention to a mod or admin that there is a problem with a gathering (or more)! When this is fixed, it will work.`)
						logChannel.send(`[${event_name}]: It seems like either I can't see a thread channel or they got deleted or can't access it! I need a total of 5: Basic, Zone1,2,3 & 4!`)
						return rep(null,null,eventEmbed)
					}

					let isThisThread = message.channel.isThread()
					let is_threadList = getKeyByValue(threadList,message.channel.id)
					if (isThisThread == false && is_threadList == undefined) {
						let modifiedThreadList = Object.values(threadList).map(i => i = `<#${i}>`)
						console.log(modifiedThreadList)
						eventEmbed.setDescription(`Sadly this isn't a gathering zone so u can't use this here! Head towards ${modifiedThreadList.join(", ")}`)
						return rep(null,null,eventEmbed,true,'30s');
					}
					
					cooking_players.findOne({
						userID: issuer.id,
						guild: message.guild.id
					},async (err2,res2) =>{
						if (err2) {
							sendError.create({
								Guild_Name: message.guild.name,
								Guild_ID: message.guild.id,
								User: issuer.tag,
								UserID: issuer.id,
								Error: err2,
								Time: `${TheDate} || ${clock} ${amORpm}`,
								Command: this.name+" looking in cooking players db - gather",
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
						if (res2) {
							let gathered_ingredients = [];
							let display_gathered_ingredients = []

							if (info) {
								console.log(`comin cooldown`)
								console.log(res2.cooldowns.gather)
								console.log(Date.now())
							}

							if (res2.cooldowns.gather > Date.now()) {
								eventEmbed.setDescription(`Sadly u can't gather again for a while... Take a break and make a dish or gift one to your partner! ${info == true ? `*(INFO: ${pms(res2.cooldowns.gather-Date.now())})*` : ``}`)
								return rep(null,null,eventEmbed,true,'30s')
							}

							// command each zone diff
							switch (is_threadList) {
								case "basic":
									// console.log('basic zone')
									gather_new_ingredients(res2, gathered_ingredients, ingredients_lex_db, display_gathered_ingredients, ingredients_lex, eventEmbed, rep, logChannel, issuer,'basic',info);
								
								break;
								case "zone1":
									// console.log('zone1 zone')
									if (res2.rank < 1) {
										eventEmbed.setDescription(`You need the rank of **\`Acquaintance\`** if you wish to gather here!`)
										return rep(null,null,eventEmbed,true,'15s')
									}
									gather_new_ingredients(res2, gathered_ingredients, ingredients_lex_db, display_gathered_ingredients, ingredients_lex, eventEmbed, rep, logChannel, issuer,'zone1',info);

								break;
								case "zone2":
									// console.log('zone2 zone')
									if (res2.rank < 2) {
										eventEmbed.setDescription(`You need the rank of **\`Friendship\`** if you wish to gather here!`)
										return rep(null,null,eventEmbed,true,'15s')
									}
									gather_new_ingredients(res2, gathered_ingredients, ingredients_lex_db, display_gathered_ingredients, ingredients_lex, eventEmbed, rep, logChannel, issuer,'zone2',info);

								break;
								case "zone3":
									// console.log('zone3 zone')
									if (res2.rank < 3) {
										eventEmbed.setDescription(`You need the rank of **\`Lover\`** if you wish to gather here!`)
										return rep(null,null,eventEmbed,true,'15s')
									}
									gather_new_ingredients(res2, gathered_ingredients, ingredients_lex_db, display_gathered_ingredients, ingredients_lex, eventEmbed, rep, logChannel, issuer,'zone3',info);

								break;
								case "zone4":
									// console.log('zone4 zone')
									if (res2.rank < 4) {
										eventEmbed.setDescription(`You need the rank of **\`Soulmate\`** if you wish to gather here!`)
										return rep(null,null,eventEmbed,true,'15s')
									}
									gather_new_ingredients(res2, gathered_ingredients, ingredients_lex_db, display_gathered_ingredients, ingredients_lex, eventEmbed, rep, logChannel, issuer,'zone4',info);

								break;
								default:
									eventEmbed.setDescription(`Seems like something went wrong... Try again next time! If this problem persist, please tell my master (<@${config.owners[0]}>)!`)
									rep(null,null,eventEmbed,true,"30s")
									break;
							}
						} else
							return create_new_uevent(`Because you're a new chef entering the stage, we made a little space for you to lay your ingredients/dishes and share with everyone! Retry this command!`)
					})
				}

				// gift
				if (optionList.indexOf(userOption) == 10) {
					if (res.events.cooking.statsLockChannel != '0' && message.channel.id != res.events.cooking.statsLockChannel) {
						eventEmbed.setDescription(`${issuer}, you cannot use this command here! Head over to <#${res.events.cooking.statsLockChannel}> to use it!`)
					return rep(null,null,eventEmbed,true,'10s')
				}
					let dishID = args[1];
					if (!dishID){
						eventEmbed.setDescription(`Please specify a dish ID to gift your partner!`)
						return rep(null,null,eventEmbed,true,"15s")
					}
					cooking_players.findOne({
						userID: issuer.id,
						guild: message.guild.id
					},async (err2,res2) =>{
						if (err2) {
							sendError.create({
								Guild_Name: message.guild.name,
								Guild_ID: message.guild.id,
								User: issuer.tag,
								UserID: issuer.id,
								Error: err2,
								Time: `${TheDate} || ${clock} ${amORpm}`,
								Command: this.name+" looking in cooking players db - gift",
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
						if (res2) {
							if (res2.pair == '0' || res2.pair == '1') {
								eventEmbed.setDescription(`Sadly you don't have a partner! Please pair with someone before u send a dish!`)
								return rep(null,null,eventEmbed,true,'15s')
							}
							// if they are at max points
							if (info) console.log(res2.points[evranks[res2.rank]],res.events.cooking.rankLimits[evranks[res2.rank]])
							if (res2.points[evranks[res2.rank]] == res.events.cooking.rankLimits[evranks[res2.rank]]) {
								eventEmbed.setDescription(`Sadly you reached you limit and you can't gift your partner anymore to gain points! You will have to wait for your partner to reach as well the amount of point to climb together higher rank before gifting again dishes!`)
								return rep(null,null,eventEmbed)
							}
							//#region find the dish, add points to issuer, remove dish and update list
							let foundDish = res2.inventory.dishes.findIndex(dish => dish.id == dishID)
							let the_dish = res2.inventory.dishes[foundDish]

							// if we didn't find the dish
							if (foundDish == -1) {
								eventEmbed.setDescription(`Seems like I couldn't find this dish in your inventory. Try again later after making sure you typed the right id!`)
								return rep(null,null,eventEmbed)
							}

							// if the type of dish is corresponding to the rank, double
							if (the_dish.type == evranks[res2.rank] && the_dish.quality == 'delicious') {
								the_dish.points *=2
								if (info) console.log(`[${event_name}]: The dish is doubled!`)
							}
							if (res2.points[evranks[res2.rank]] + Number(roundPrecised(the_dish.points,1)) <= res.events.cooking.rankLimits[evranks[res2.rank]]){
								res2.points[evranks[res2.rank]] += Number(roundPrecised(the_dish.points,1))
								if (info) console.log(`below max, allowed: ${res2.points[evranks[res2.rank]]}`)
								eventEmbed.setDescription(`You sent the gift to your partner (<@${res2.pair}>) successfully **${the_dish.name}**! ${the_dish.type == evranks[res2.rank] && the_dish.quality == 'delicious' ? `Because you timed it right, you received double points, for a total of **${Number(roundPrecised(the_dish.points,1))}**!!` : `You received **${Number(roundPrecised(the_dish.points,1))}** points for that dish!`}`)
							} else {
								res2.points[evranks[res2.rank]] = res.events.cooking.rankLimits[evranks[res2.rank]];
								if (info) console.log(`above max, setted`)
								eventEmbed.setDescription(`You sent the gift to your partner (<@${res2.pair}>) successfully but... you didn't receive all the points due to the fact that you reached the limit of your rank! Rank up with your partner to gather more points!`)

							}
							res2.inventory.dishes.splice(foundDish,1);
							//#endregion
							res2.save().catch(err3 => {
								console.log(err3);
								logChannel.send(`[Cooking]: Sadly an error happened while **${issuer.tag}** (${issuer.id}) tried to gift their partner a dish! Please notify my master!\nERR: ${err3.message}`);
							});
							rep(null,null,eventEmbed)
						} else return create_new_uevent(`Because you're a new chef entering the stage, we made a little space for you to lay your ingredients/dishes and share with everyone! Retry this command!`)
					})
				}

				// pair - 쌍
				if (optionList.indexOf(userOption) == 11) {
					// !ck pair @user
					if (res.events.cooking.statsLockChannel != '0' && message.channel.id != res.events.cooking.statsLockChannel) {
						eventEmbed.setDescription(`${issuer}, you cannot use this command here! Head over to <#${res.events.cooking.statsLockChannel}> to use it!`)
					return rep(null,null,eventEmbed,true,'10s')
				}
					let pairingUser = args[1];
					if (!pairingUser){
						eventEmbed.setDescription(`Please specify a member to pair with (either id or mention)!`)
						return rep(null,null,eventEmbed,true,"15s")
					}
					if (message.mentions.members.size > 0) pairingUser = message.mentions.members.first()?.id
					if (!message.guild.members.cache.find(mem => mem.id == pairingUser)) {
						eventEmbed.setDescription(`Sadly I couldn't find this member in the server! Make sure his id is correct or that the mentioned member is still in the server!`)
						return rep(null,null,eventEmbed,true,"30s")
					}
					cooking_players.findOne({
						userID: issuer.id,
						guild: message.guild.id
					},async (err2,res2) =>{
						if (err2) {
							sendError.create({
								Guild_Name: message.guild.name,
								Guild_ID: message.guild.id,
								User: issuer.tag,
								UserID: issuer.id,
								Error: err2,
								Time: `${TheDate} || ${clock} ${amORpm}`,
								Command: this.name+" looking in cooking players db - pair req",
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
						if (res2) {
							if (res2.cooldowns.pair > Date.now()) {
								eventEmbed.setDescription(`Waaaait! You can't change that fast the partners! Take a small break before u can find another partner!`)
								return rep(null,null,eventEmbed)
							}
							if (res2.pair == pairingUser) {
								eventEmbed.setDescription(`You can't pair with the actual partner! If you want to terminate your business with your partner, mention yourself when using this command! *(P.S: You're the only one that will suffer the penalties!)*`)
								return rep(null,null,eventEmbed,true,'30s')
							}
							res2.cooldowns.pair = (res.events.cooking.cooldowns.pair * 60) + Date.now()
							let baseQuestion = `<@${pairingUser}>, do you accept the request of <@${issuer.id}> to be their partner? Answer with \`yes\` or \`no\``
							let unpairQuestion = `<@${issuer.id}>, do you wish to terminate the partnership with <@${res2.pair}>? Answer with \`yes\` or \`no\``
							eventEmbed.setDescription(`${pairingUser == issuer.id ? unpairQuestion : baseQuestion}\n\n**[Attention!!]\nBy doing this, if both of you have a partner already *(in case of pairing)*, both of you *(or just you if unpairing)* will lose 75% of the actual ingredients and will start from 0 points! If a side doesn't have a partner, only the one with partner will feel the penalties!**`)
							message.channel.send({embeds: [eventEmbed]}).then(async msgPair =>{
								let filter = m => m.author.id == pairingUser
								await message.channel.awaitMessages({filter, time: 30000, max: 1}).then(async collected =>{
									let answerPair = collected.first().content;
									if (answerPair?.toLowerCase() == 'yes') {
										cooking_players.findOne({
											userID: pairingUser,
											guild: message.guild.id
										},async (err3,res3) =>{
											if (err3) {
												sendError.create({
													Guild_Name: message.guild.name,
													Guild_ID: message.guild.id,
													User: issuer.tag,
													UserID: issuer.id,
													Error: err3,
													Time: `${TheDate} || ${clock} ${amORpm}`,
													Command: this.name+" looking in cooking players db - pair receiver",
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
											if (res3) {
												if (pairingUser != issuer.id) {
													//verify if the issuer and receiver are first time
													let is_issuer_partnered = res2.pair == 0 ? false : true;
													let is_receiver_partnered = res3.pair == 0 ? false : true;

													if (info) console.log(`Issuer is ${is_issuer_partnered}\nReceiver is: ${is_receiver_partnered}`)

													//save old pairs
													let oldIssuerPair = res2.pair
													let oldReceiverPair = res3.pair
													
													// setting issuer & receiver
													res2.pair = pairingUser;
													res3.pair = issuer.id;

													// setting as well the partners of issuer & receiver
													cooking_players.findOne({
														userID: oldIssuerPair,
														guild: message.guild.id
													},async (err4,res4) =>{
														//#region err4
														if (err4) {
															sendError.create({
																Guild_Name: message.guild.name,
																Guild_ID: message.guild.id,
																User: issuer.tag,
																UserID: issuer.id,
																Error: err4,
																Time: `${TheDate} || ${clock} ${amORpm}`,
																Command: this.name+" looking in cooking players db - pair issuer old",
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
														//#endregion
														
														//#region res4
														if (res4) {
															res4.pair = '1'
															res4.save().catch(err44 => console.log(err44))
														}
														//#endregion
													})
													cooking_players.findOne({
														userID: oldReceiverPair,
														guild: message.guild.id
													},async (err5,res5) =>{
														//#region err5
														if (err5) {
															sendError.create({
																Guild_Name: message.guild.name,
																Guild_ID: message.guild.id,
																User: issuer.tag,
																UserID: issuer.id,
																Error: err5,
																Time: `${TheDate} || ${clock} ${amORpm}`,
																Command: this.name+" looking in cooking players db - pair receiver old",
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
														//#endregion
														
														//#region res5
														if (res5) {
															res5.pair = '1'
															res5.save().catch(err44 => console.log(err44))
														}
														//#endregion
													})

													//#region apply penalty if they are not first time
													if (is_issuer_partnered) {
														let my_ingrd = Object.keys(res2.inventory.ingredients)
														// remove 75% of dishes/ingredients
														for (let i = 0; i < my_ingrd.length; i++) {
															let remove_sfp = Math.floor(.75 * res2.inventory.ingredients[my_ingrd[i]]);
															if (info)console.log(`[${event_name}]: I'm removing 75% (${remove_sfp}) of ${my_ingrd[i]}`);
															res2.inventory.ingredients[my_ingrd[i]] -= remove_sfp;
														}
														let dishesList = res2.inventory.dishes;
														dishesList.length -= Math.floor(res2.inventory.dishes.length * .75);
														console.log(dishesList)
														cooking_players.updateOne({
															'userID': `${issuer.id}`
														},{'$set':{ 'inventory.dishes' : dishesList}},(erro,reso)=>{
															if (erro) {
																sendError.create({
																	Guild_Name: message.guild.name,
																	Guild_ID: message.guild.id,
																	User: issuer.tag,
																	UserID: issuer.id,
																	Error: erro,
																	Time: `${TheDate} || ${clock} ${amORpm}`,
																	Command: this.name + `, cooking pair -75% dishes`,
																	Args: args,
																},async (errr, ress) => {
																	if(errr) {
																		console.log(errr)
																		return message.channel.send(`Unfortunately an problem appeared in emoji command - add option. Please try again later. If this problem persist, contact my partner!`)
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

														// reset rank & points
														res2.rank = 0;
														res2.points = {
															stranger: 0,
															acquaintance: 0,
															friendship: 0,
															love: 0,
															soulmate: 0
														};
														
													}
													if (is_receiver_partnered) {
														console.log(`works2`)
														let my_ingrd = Object.keys(res3.inventory.ingredients)
														// remove 75% of dishes/ingredients
														for (let i = 0; i < my_ingrd.length; i++) {
															let remove_sfp = Math.floor(.75 * res3.inventory.ingredients[my_ingrd[i]]);
															if (info) console.log(`[${event_name}]: I'm removing 75% (${remove_sfp}) of ${my_ingrd[i]}`);
															res3.inventory.ingredients[my_ingrd[i]] -= remove_sfp;
														}
														let dishesList = res3.inventory.dishes;
														dishesList.length -= Math.floor(res3.inventory.dishes.length * .75);
														console.log(dishesList)
														cooking_players.updateOne({
															'userID': `${pairingUser}`
														},{'$set':{ 'inventory.dishes' : dishesList}},(erro,reso)=>{
															if (erro) {
																sendError.create({
																	Guild_Name: message.guild.name,
																	Guild_ID: message.guild.id,
																	User: issuer.tag,
																	UserID: issuer.id,
																	Error: erro,
																	Time: `${TheDate} || ${clock} ${amORpm}`,
																	Command: this.name + `, cooking pair -75% dishes pairinguser`,
																	Args: args,
																},async (errr, ress) => {
																	if(errr) {
																		console.log(errr)
																		return message.channel.send(`Unfortunately an problem appeared in emoji command - add option. Please try again later. If this problem persist, contact my partner!`)
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

														// reset rank & points
														res3.rank = 0;
														res3.points = {
															stranger: 0,
															acquaintance: 0,
															friendship: 0,
															love: 0,
															soulmate: 0
														};
														
													}
													//#endregion
													res2.save().catch(err3 => {
														console.log(err3);
														logChannel.send(`[Cooking]: Sadly an error happened while trying to save the new ingredients gathered for **${issuer.tag}** (${issuer.id}). Please notify my master!\nERR: ${err3.message}`);
													});
													res3.save().catch(err3 => {
														console.log(err3);
														logChannel.send(`[Cooking]: Sadly an error happened while trying to save the new ingredients gathered for **${issuer.tag}** (${issuer.id}). Please notify my master!\nERR: ${err3.message}`);
													});
													eventEmbed.setDescription(`Okay now both of you (<@${issuer.id}> & <@${pairingUser}>) are chef partners!`)
													rep(null,null,eventEmbed)
												} else { // if want to unpair
													if (info) console.log(`[${event_name}]: Starting to unpair ${issuer.id}...`)
													//#region unlink partner of issuer
													cooking_players.findOne({
														userID: res2.pair,
														guild: message.guild.id
													},async (err5,res5) =>{
														//#region err5
														if (err5) {
															sendError.create({
																Guild_Name: message.guild.name,
																Guild_ID: message.guild.id,
																User: issuer.tag,
																UserID: issuer.id,
																Error: err5,
																Time: `${TheDate} || ${clock} ${amORpm}`,
																Command: this.name+" looking in cooking players db - pair issuer old",
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
														//#endregion
														
														//#region res5
														if (res5) {
															res5.pair = '1'
															res5.save().catch(err44 => console.log(err44))
														}
														//#endregion
													})
													res2.pair = '1'
													//#endregion
													//#region remove 75% of dishes/ingredients
													let my_ingrd = Object.keys(res2.inventory.ingredients)
													for (let i = 0; i < my_ingrd.length; i++) {
														let remove_sfp = Math.floor(.75 * res2.inventory.ingredients[my_ingrd[i]]);
														if (info)console.log(`[${event_name}]: I'm removing 75% (${remove_sfp}) of ${my_ingrd[i]}`);
														res2.inventory.ingredients[my_ingrd[i]] -= remove_sfp;
													}
													let dishesList = res2.inventory.dishes;
													dishesList.length = Math.floor(res2.inventory.dishes.length * .75);
													if (info) console.log(dishesList)
													cooking_players.updateOne({
														'userID': `${issuer.id}`
													},{'$set':{ 'inventory.dishes' : dishesList}},(erro,reso)=>{
														if (erro) {
															sendError.create({
																Guild_Name: message.guild.name,
																Guild_ID: message.guild.id,
																User: issuer.tag,
																UserID: issuer.id,
																Error: erro,
																Time: `${TheDate} || ${clock} ${amORpm}`,
																Command: this.name + `, cooking pair -75% dishes`,
																Args: args,
															},async (errr, ress) => {
																if(errr) {
																	console.log(errr)
																	return message.channel.send(`Unfortunately an problem appeared in emoji command - add option. Please try again later. If this problem persist, contact my partner!`)
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
													//#endregion

													//#region reset rank & points
													res2.rank = 0;
													res2.points = {
														stranger: 0,
														acquaintance: 0,
														friendship: 0,
														love: 0,
														soulmate: 0
													};
													//#endregion
													res2.save().catch(err3 => {
														console.log(err3);
														logChannel.send(`[Cooking]: Sadly an error happened while trying to save the new ingredients gathered for **${issuer.tag}** (${issuer.id}). Please notify my master!\nERR: ${err3.message}`);
													});
													eventEmbed.setDescription(`Okay, now you (<@${issuer.id}>) have terminated your business with your old partner. You also suffered the penalties! You can partner with anyone you wish now!`)
													return rep(null,null,eventEmbed)
												}
											} else {
												return create_new_uevent(`Because <@${pairingUser}> wasn't set up a stand to cook and gather ingredients, I made some space now. Please try this again, ${issuer} & <@${pairingUser}>`,pairingUser)
											}
										})
									} else {
										eventEmbed.setDescription(`It seems like <@${pairingUser}> didn't say yes so that means they are not accepting the pair request!`)
										return rep(null,null,eventEmbed,true,'20s')
									}
								})
							}).catch(errNoAnswer =>{
								if (info) console.log(`[${event_name}]: ${issuer.id} tried to pair to ${pairingUser} but didn't respond.`)
								eventEmbed.setDescription(`It seems like <@${pairingUser}> didn't respond in time enough. Try later when they are available as well!`)
								return rep(null,null,eventEmbed)
							})
						} else return create_new_uevent(`Because you're a new chef entering the stage, we made a little space for you to lay your ingredients/dishes and share with everyone! Retry this command!`)

					})
				}

				// climb
				if (optionList.indexOf(userOption) == 12) {
					if (res.events.cooking.statsLockChannel != '0' && message.channel.id != res.events.cooking.statsLockChannel) {
						eventEmbed.setDescription(`${issuer}, you cannot use this command here! Head over to <#${res.events.cooking.statsLockChannel}> to use it!`)
					return rep(null,null,eventEmbed,true,'10s')
				}
					cooking_players.findOne({
						userID: issuer.id,
						guild: message.guild.id
					},async (err2,res2)=>{
						if (err2) {
							sendError.create({
								Guild_Name: message.guild.name,
								Guild_ID: message.guild.id,
								User: issuer.tag,
								UserID: issuer.id,
								Error: err2,
								Time: `${TheDate} || ${clock} ${amORpm}`,
								Command: this.name+" looking in player db - climb",
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
						if (res2) {
							if (['0','1'].includes(res2.pair)) {
								eventEmbed.setDescription(`Please find a partner before trying this!`)
								return rep(null,null,eventEmbed,true,'15s')
							}
							cooking_players.findOne({
								userID: res2.pair,
								guild: message.guild.id
							},async (err3,res3) =>{
								if (err3) {
									sendError.create({
										Guild_Name: message.guild.name,
										Guild_ID: message.guild.id,
										User: issuer.tag,
										UserID: issuer.id,
										Error: err3,
										Time: `${TheDate} || ${clock} ${amORpm}`,
										Command: this.name+" looking in player db - climb pair",
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
								if (res3) {
									console.log(res2.points[evranks[res2.rank]] == res.events.cooking.rankLimits[evranks[res2.rank]],res3.points[evranks[res3.rank]] == res.events.cooking.rankLimits[evranks[res3.rank]])
									if (res2.points[evranks[res2.rank]] == res.events.cooking.rankLimits[evranks[res2.rank]] 
										&& res3.points[evranks[res3.rank]] == res.events.cooking.rankLimits[evranks[res3.rank]])
									{
										if (res2.rank != res3.rank) {
											let whosLesser = res2.rank > res3.rank ? res2.pair : issuer.id;
											if (issuer.id != whosLesser) {
												eventEmbed.setDescription(`To do that, <@${whosLesser}> must climb up back to your rank before you guys can rank up together!`)
												return rep(null,null,eventEmbed,true,"10s")
											}
											if (res2.points[evranks[res2.rank]] == res.events.cooking.rankLimits[evranks[res2.rank]]) {
												eventEmbed.setDescription(`You have successfully climbed back to **${evranks[res2.rank+1]}** league!`)
												res2.rank++;
												res2.points[evranks[res2.rank]] = res2.points[evranks[res2.rank-1]];
												res2.save().catch(err3 => {
													console.log(err3);
													logChannel.send(`[Cooking]: Sadly an error happened while trying to save rank up for **${issuer.tag}** (${issuer.id}). Please notify my master!\nERR: ${err3.message}`);
												});
												return rep (null,null,eventEmbed,true,'5s')
											}
										}
										eventEmbed.setDescription(`<@${res3.userID}>, your partner, ${issuer}, is suggesting to climb the ladder of the master chefs! Do you accept? Please type '\`yes\`' or '\`no\`'`)
										message.channel.send({embeds: [eventEmbed]}).then(async msgPair =>{
											let filter = m => m.author.id == res3.userID
											await message.channel.awaitMessages({filter, time: 30000, max: 1}).then(async collected =>{
												let answerPair = collected.first().content;
												if (answerPair?.toLowerCase() == 'yes') {
													res2.rank++;
													res3.rank++;
													res2.points[evranks[res2.rank]] = res2.points[evranks[res2.rank-1]]
													res3.points[evranks[res3.rank]] = res3.points[evranks[res3.rank-1]] 
													res2.save().catch(err3 => {
														console.log(err3);
														logChannel.send(`[Cooking]: Sadly an error happened while trying to save rank up for **${issuer.tag}** (${issuer.id}). Please notify my master!\nERR: ${err3.message}`);
													});
													res3.save().catch(err3 => {
														console.log(err3);
														logChannel.send(`[Cooking]: Sadly an error happened while trying to save rank up for **${issuer.tag}** (${issuer.id}). Please notify my master!\nERR: ${err3.message}`);
													});
													eventEmbed.setDescription(`Whoaaaray! Now ${issuer} & <@${res3.userID}> evolved through their hard work & talent. Now they reached the following rank: **\`${capital_letter(evranks[res3.rank])}\`**`)
													return rep(null,null,eventEmbed)
												} else {
													eventEmbed.setDescription(`${issuer}, it seems like your partner didn't like the idea too much so you guys won't climb unless both of you are okay with it!`)
													return rep(null,null,eventEmbed)
												}
											}).catch(errNoAnswer =>{
												if (info) console.log(`[${event_name}]: ${issuer.id} tried to rank up  but ${res3.userID} didn't respond.`)
												eventEmbed.setDescription(`It seems like <@${res3.userID}> didn't respond in time enough. Try later when they are available as well!`)
												return rep(null,null,eventEmbed)
											})
										})
									} else {
										eventEmbed.setDescription(`Try again later when you/your partner or both are having the highest amount of points possible!`)
										return rep(null,null,eventEmbed)
									}
								}// res3
							})// 2nd find one
						} else return create_new_uevent(`Because you're a new chef entering the stage, we made a little space for you to lay your ingredients/dishes and share with everyone! Retry this command!`)
					})
				}

				// stats
				if (optionList.indexOf(userOption) == 13) {
					if (res.events.cooking.statsLockChannel != '0' && message.channel.id != res.events.cooking.statsLockChannel) {
						eventEmbed.setDescription(`${issuer}, you cannot use this command here! Head over to <#${res.events.cooking.statsLockChannel}> to use it!`)
					return rep(null,null,eventEmbed,true,'10s')
				}
					cooking_players.findOne({
						userID: issuer.id,
						guild: message.guild.id
					},async (err2,res2)=>{
						if (err2) {
							sendError.create({
								Guild_Name: message.guild.name,
								Guild_ID: message.guild.id,
								User: issuer.tag,
								UserID: issuer.id,
								Error: err2,
								Time: `${TheDate} || ${clock} ${amORpm}`,
								Command: this.name+" looking in player db - stats",
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
						if (res2) {
							
							let issuerRank = null;
							let partnerRank = null;
							cooking_players.find({guild: message.guild.id},async(err3,res3) =>{
								if (err3) {
									sendError.create({
										Guild_Name: message.guild.name,
										Guild_ID: message.guild.id,
										User: issuer.tag,
										UserID: issuer.id,
										Error: err3,
										Time: `${TheDate} || ${clock} ${amORpm}`,
										Command: this.name+" looking in guild db- stats rank",
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
								if (res3) {
									let rankedList = show_top(res3,evranks[res2.rank], true)
									issuerRank = rankedList.findIndex(i => i.id == issuer.id)
									partnerRank = rankedList.findIndex(i => i.id == res2.pair)
									console.log(rankedList,issuerRank,partnerRank)
									eventEmbed.setDescription(`Here's what you did so far in your career as a chef:
- **Current League**: ${capital_letter(evranks[res2.rank])} *(${roundPrecised(res2.points[evranks[res2.rank]],1)}/${res.events.cooking.rankLimits[evranks[res2.rank]]} points)*
- **Ranked #**: ${issuerRank+1}
- **Partner Chef**: <@${res2.pair}>
- **Partner Ranked #**: ${partnerRank+1}
- **Dishes (at the moment)**: ${res2.inventory.dishes.length}
- **Tokens Left**: ${res2.trade.tokens}/${res2.trade.limit}
- **Request Comms. State**: ${res2.cooldowns.lastAirdrop > Date.now() ? `The supplier is waiting for stock to arrive in ${roundPrecised((res2.cooldowns.lastAirdrop - Date.now()) * 2.7777777777778E-7,0) < 1 ? `less than 1 hour...` : `${roundPrecised((res2.cooldowns.lastAirdrop - Date.now()) * 2.7777777777778E-7,0)} hour(s) probably...` }`: `*The supplier is ready to deliver the request!*`}`)
							.setThumbnail(issuer.displayAvatarURL())
return rep(null,null,eventEmbed)
								}
							})		
						} else return create_new_uevent(`Because you're a new chef entering the stage, we made a little space for you to lay your ingredients/dishes and share with everyone! Retry this command!`)
					})
				}
				// trade
				if (optionList.indexOf(userOption) == 14) {
					if (res.events.cooking.statsLockChannel != '0' && message.channel.id != res.events.cooking.statsLockChannel) {
						eventEmbed.setDescription(`${issuer}, you cannot use this command here! Head over to <#${res.events.cooking.statsLockChannel}> to use it!`)
					return rep(null,null,eventEmbed,true,'10s')
					}
					cooking_players.findOne({
						userID: issuer.id,
						guild: message.guild.id
					},async (err2,res2)=>{
						if (err2) {
							sendError.create({
								Guild_Name: message.guild.name,
								Guild_ID: message.guild.id,
								User: issuer.tag,
								UserID: issuer.id,
								Error: err2,
								Time: `${TheDate} || ${clock} ${amORpm}`,
								Command: this.name+" looking in player db - trade",
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
						if (res2) {
							if (res2.trade.tokens < 1) {
								eventEmbed.setDescription(`Sadly you don't own a \`Trade token\` to start a trade!`)
								return rep(null,null,eventEmbed,true,'7s')
							}
							if (this.client.tradeSystem.find(userId => userId == issuer.id) != undefined) {
								eventEmbed.setDescription(`You're already in a trade!`)
								return rep(null,null,eventEmbed,true,'5s')
							}
							this.client.tradeSystem.push(issuer.id)
							let tradeInfo = {
								in_trade: true,
								tries: 3,
								typos: 5,
								customer: null,
								ingredients: [],
								cost_ingredients: 0,
								msgReference: null,
								q_state: 0
							}
							eventEmbed.setAuthor(`${event_name}: Trade with someone!`)
							eventEmbed.setDescription(`Heya there! Please type the id of/mention the person with which you wanna trade:`)
							eventEmbed.setFooter(`Chef ${issuer.tag} | Reminder: To stop trade, type \`cancel/stop\`. To finish adding ingredients, type \`done/trade\`!`)
							message.channel.send({embeds: [eventEmbed]})
							while(tradeInfo.in_trade == true) {
								let filter = m => m.author.id == issuer.id
								await message.channel.awaitMessages({filter,time: 180000, max:1}).then(async msgContent =>{
									let userAnswer = msgContent.first().content;
									// console.log(tradeInfo)
									
									// get user
									if (tradeInfo.q_state == 0) {
										//stop if said these keywords
										if (['cancel','exit','quit','stop'].includes(userAnswer.toLowerCase())) {
											tradeInfo.in_trade = false;
											let findUser = this.client.tradeSystem.findIndex(i => i == issuer.id)
											this.client.tradeSystem.splice(findUser,1)
											eventEmbed.setDescription(`Okay, I've canceled the trade!`)
											return rep(null,null,eventEmbed)
										}
										
										//verifying if mentioned/typed id of member exist in the server
										tradeInfo.customer = userAnswer.trim().replace( /\D+/g, '');
										if (message.mentions.members.size > 0) tradeInfo.customer = message.mentions.members.first()?.id.replace( /\D+/g, '');
										if (message.guild.members.cache.find(mem => mem.id == tradeInfo.customer) == undefined) {
											eventEmbed.setDescription(`Sadly I couldn't find this member by the id/mention. Are you sure this member exist or it's still a member of the server?`)
											tradeInfo.typos++
											return rep(null,null,eventEmbed,true,'5s')
										}
										console.log(tradeInfo.customer)
										eventEmbed.setDescription(`Okay, <@${tradeInfo.customer}> it is! What ingredients do you want to trade?
Please type in this kind of format: \`ingredient_name:amount,ingredient_name:amount\`
E.g: I wanna trade 200 water=> \`water:200\`
\nCurrent ingredients to be traded:\n${tradeInfo.ingredients.map(item => `\`- ${item.name}:${item.amount}\``).join(",\n")}`)
										tradeInfo.q_state++;
										tradeInfo.msgReference = await message.channel.send({embeds:[ eventEmbed]})
										return console.log(`done q0`)
									}

									// get ingredients and process
									if (tradeInfo.q_state == 1) {
											//#region special keywords
											if (['cancel','exit','quit','stop'].includes(userAnswer.toLowerCase())) {
												tradeInfo.in_trade = false;
												let findUser = this.client.tradeSystem.findIndex(i => i == issuer.id)
												this.client.tradeSystem.splice(findUser,1)
												eventEmbed.setDescription(`Okay, I've canceled the trade!`)
												return rep(null,null,eventEmbed)
											}
											// if done with the trading, calculate cost and ask if confirm
											if (['done','trade','accept'].includes(userAnswer.toLowerCase())) {
												eventEmbed.setDescription(`This is the final phase. Are you sure you wanna trade these ingredients with <@${tradeInfo.customer}>?\n${tradeInfo.ingredients.map(item => `\`- ${item.name}:${item.amount}\``).join(",\n")}
\nThese will cost you: ${tradeInfo.cost_ingredients} points from your current rank.\n\nType \`yes\` to confirm and end the trade successfully.`)
												message.guild.channels.cache.get(tradeInfo.msgReference.channel.id).messages.cache.get(tradeInfo.msgReference.id).edit({embeds: [eventEmbed]})
												// if anything goes here 
												tradeInfo.q_state++
												return console.log(`done q1`)
											}
											// if we want another user
											if (userAnswer.toLowerCase() == 'back') {
												eventEmbed.setDescription(`Okay back to select another member? Then please type the id of/mention the person with which you wanna trade:`)
												message.guild.channels.cache.get(tradeInfo.msgReference.channel.id).messages.cache.get(tradeInfo.msgReference.id).edit({embeds: [eventEmbed]})
												// if anything goes here 
												tradeInfo.q_state--
												return console.log(`done q1`)
											}
											
											//#endregion

											//#region check dish and if syntax is correct
											console.log(userAnswer.toLowerCase())
											let existent_dishes = Object.values(ingredients_lex_db)
											if (!userAnswer.toLowerCase().includes(":")) {
												eventEmbed.setDescription(`💠If you want to add an ingredient, please type like this: \`ingredient:amount,ingredient:amount,ingredient:amount\` etc.\n
💠If you want to change the amount or remove entirely, type again the name of ingredient and add at the amount (in front) a + (plus) or - (minus):
--> \`ingredient:+20\` => will add 20 more of that \`ingredient\` 
--> \`ingredient:-20\` => will remove 20 more of that \`ingredient\` (if there are already 20 in trade ofc. Otherwise it will remove the max amount added)`)
											tradeInfo.typos++
return rep(null,null,eventEmbed,true,'30s')
											}

											// preparing the ingredient
											let answerMSG = userAnswer.toLowerCase().trim()
											let ingredient_to_push = {
												name: answerMSG.slice(0,answerMSG.indexOf(":")).trim(),
												state: answerMSG.slice(answerMSG.indexOf(":")+1,answerMSG.indexOf(":")+2).trim() == "+" ? 1 : answerMSG.slice(answerMSG.indexOf(":")+1,answerMSG.indexOf(":")+2).trim() == "-" ? -1 : 1, 
												amount: answerMSG.slice(answerMSG.indexOf(":")+1).trim()
											}
											
											// verify the ingredient name isn't wrong
											if (!existent_dishes.includes(ingredient_to_push.name)) {
												eventEmbed.setDescription(`Sadly I don't recognize this \`${ingredient_to_push.name}\`. Make sure you type the name as it is and if it has spaces, replace them with **underscore** (**_**).
												If you still don't get the ingredient, look below at the existing list of ingredients that I accept:\n\n\`${existent_dishes.join(", ")}\``)
												return rep(null,null,eventEmbed,true,'30s');
											}

											let quantityToMul = 100
											let checkIfmultiplied = null
											console.log(ingredient_to_push)
											if (ingredient_to_push.amount.replace( /\D+/g, '') > res2.inventory.ingredients[ingredient_to_push.name]){
												eventEmbed.setDescription(`You don't have more than \`${res2.inventory.ingredients[ingredient_to_push.name]}\`!`)
												return rep(null,null,eventEmbed,true,"5s")
											}
											if (ingredient_to_push.amount.match(/\+/g)?.length > 1 || ingredient_to_push.amount.match(/\-/g)?.length > 1) {
												eventEmbed.setDescription(`Nice try😜, this won't work. If you try again to outsmart the trade system, you're getting banned from the event.`)
												return rep(null,null,eventEmbed,true,"10s")
											}
											//#region calculating the cost of ingredient and accept only multiplication of that number
											switch (ingredient_to_push.name) {
												case "water":
													checkIfmultiplied = ingredient_to_push.amount.replace( /\D+/g, '')/quantityToMul
													if (Number.isInteger(checkIfmultiplied) == false) {
														eventEmbed.setDescription(`If u wanna trade \`${ingredient_to_push.name}\` it must be a multiplication of ${quantityToMul}!`)
														return rep(null,null,eventEmbed,true,'5s')
													}
													tradeInfo.cost_ingredients += res.events.cooking.trade.liquid_cost * Number(ingredient_to_push.amount.replace( /\D+/g, '')/quantityToMul) * ingredient_to_push.state;
													// console.log(`check if multiplied: ${checkIfmultiplied}`)
													// console.log(`cost ingredients total: ${tradeInfo.cost_ingredients}`)
													// console.log(`cost ingredients input earlier: ${res.events.cooking.trade.liquid_cost * Number(ingredient_to_push.amount.replace( /\D+/g, '')/quantityToMul)}`)
													break;
												case "milk":
													quantityToMul = 50
													checkIfmultiplied = ingredient_to_push.amount.replace( /\D+/g, '')/quantityToMul
													if (Number.isInteger(checkIfmultiplied) == false) {
														eventEmbed.setDescription(`If u wanna trade \`${ingredient_to_push.name}\` it must be a multiplication of ${quantityToMul}!`)
														return rep(null,null,eventEmbed,true,'5s')
													}
													tradeInfo.cost_ingredients += res.events.cooking.trade.liquid_cost * Number(ingredient_to_push.amount.replace( /\D+/g, '')/quantityToMul) * ingredient_to_push.state;
													break;
												case "oil":
													quantityToMul = 50
													checkIfmultiplied = ingredient_to_push.amount.replace( /\D+/g, '')/quantityToMul
													if (Number.isInteger(checkIfmultiplied) == false) {
														eventEmbed.setDescription(`If u wanna trade \`${ingredient_to_push.name}\` it must be a multiplication of ${quantityToMul}!`)
														return rep(null,null,eventEmbed,true,'5s')
													}
													tradeInfo.cost_ingredients += res.events.cooking.trade.liquid_cost * Number(ingredient_to_push.amount.replace( /\D+/g, '')/quantityToMul) * ingredient_to_push.state;
													break;
												case 'strawberry_jam':
													quantityToMul = 25
													checkIfmultiplied = ingredient_to_push.amount.replace( /\D+/g, '')/quantityToMul
													if (Number.isInteger(checkIfmultiplied) == false) {
														eventEmbed.setDescription(`If u wanna trade \`${ingredient_to_push.name}\` it must be a multiplication of ${quantityToMul}!`)
														return rep(null,null,eventEmbed,true,'5s')
													}
													tradeInfo.cost_ingredients += res.events.cooking.trade.liquid_cost * Number(ingredient_to_push.amount.replace( /\D+/g, '')/quantityToMul) * ingredient_to_push.state;
													break;
												case 'blackberry_jam':
													quantityToMul = 25
													checkIfmultiplied = ingredient_to_push.amount.replace( /\D+/g, '')/quantityToMul
													if (Number.isInteger(checkIfmultiplied) == false) {
														eventEmbed.setDescription(`If u wanna trade \`${ingredient_to_push.name}\` it must be a multiplication of ${quantityToMul}!`)
														return rep(null,null,eventEmbed,true,'5s')
													}
													tradeInfo.cost_ingredients += res.events.cooking.trade.liquid_cost * Number(ingredient_to_push.amount.replace( /\D+/g, '')/quantityToMul) * ingredient_to_push.state;
													break;
												case 'chocolate_syrup':
													quantityToMul = 25
													checkIfmultiplied = ingredient_to_push.amount.replace( /\D+/g, '')/quantityToMul
													if (Number.isInteger(checkIfmultiplied) == false) {
														eventEmbed.setDescription(`If u wanna trade \`${ingredient_to_push.name}\` it must be a multiplication of ${quantityToMul}!`)
														return rep(null,null,eventEmbed,true,'5s')
													}
													tradeInfo.cost_ingredients += res.events.cooking.trade.liquid_cost * Number(ingredient_to_push.amount.replace( /\D+/g, '')/quantityToMul) * ingredient_to_push.state;
													break;
												case 'mirin':
													quantityToMul = 10
													checkIfmultiplied = ingredient_to_push.amount.replace( /\D+/g, '')/quantityToMul
													if (Number.isInteger(checkIfmultiplied) == false) {
														eventEmbed.setDescription(`If u wanna trade \`${ingredient_to_push.name}\` it must be a multiplication of ${quantityToMul}!`)
														return rep(null,null,eventEmbed,true,'5s')
													}
													tradeInfo.cost_ingredients += res.events.cooking.trade.liquid_cost * Number(ingredient_to_push.amount.replace( /\D+/g, '')/quantityToMul) * ingredient_to_push.state;
													break;
												case 'raspberry_jam':
													quantityToMul = 25
													checkIfmultiplied = ingredient_to_push.amount.replace( /\D+/g, '')/quantityToMul
													if (Number.isInteger(checkIfmultiplied) == false) {
														eventEmbed.setDescription(`If u wanna trade \`${ingredient_to_push.name}\` it must be a multiplication of ${quantityToMul}!`)
														return rep(null,null,eventEmbed,true,'5s')
													}
													tradeInfo.cost_ingredients += res.events.cooking.trade.liquid_cost * Number(ingredient_to_push.amount.replace( /\D+/g, '')/quantityToMul) * ingredient_to_push.state;
													break;
												case 'soy_sauce':
													quantityToMul = 10
													checkIfmultiplied = ingredient_to_push.amount.replace( /\D+/g, '')/quantityToMul
													if (Number.isInteger(checkIfmultiplied) == false) {
														eventEmbed.setDescription(`If u wanna trade \`${ingredient_to_push.name}\` it must be a multiplication of ${quantityToMul}!`)
														return rep(null,null,eventEmbed,true,'5s')
													}
													tradeInfo.cost_ingredients += res.events.cooking.trade.liquid_cost * Number(ingredient_to_push.amount.replace( /\D+/g, '')/quantityToMul) * ingredient_to_push.state;
													break;
												case 'sour_cream':
													quantityToMul = 15
													checkIfmultiplied = ingredient_to_push.amount.replace( /\D+/g, '')/quantityToMul
													if (Number.isInteger(checkIfmultiplied) == false) {
														eventEmbed.setDescription(`If u wanna trade \`${ingredient_to_push.name}\` it must be a multiplication of ${quantityToMul}!`)
														return rep(null,null,eventEmbed,true,'5s')
													}
													tradeInfo.cost_ingredients += res.events.cooking.trade.liquid_cost * Number(ingredient_to_push.amount.replace( /\D+/g, '')/quantityToMul) * ingredient_to_push.state;
													break;																																			
												default:
													tradeInfo.cost_ingredients += res.events.cooking.trade.normal_cost * Number(ingredient_to_push.amount.replace( /\D+/g, '')) * ingredient_to_push.state
												break;
											}
											//#endregion
											
											//#region checking if exist, if yes replace, add or remove
											let foundIndex = tradeInfo.ingredients.findIndex(item => item.name == ingredient_to_push.name)
											if (foundIndex != -1) {// if exist already
												
												// check if player has the amount entered otherwise tell that he put all he has
												console.log(`me: ${res2.inventory.ingredients[ingredient_to_push.name]} < ${tradeInfo.ingredients[foundIndex].amount + Number(ingredient_to_push.amount.replace(/\D+/g, ''))}`)
												if ((res2.inventory.ingredients[ingredient_to_push.name] < tradeInfo.ingredients[foundIndex].amount + Number(ingredient_to_push.amount.replace(/\D+/g, ''))) && ingredient_to_push.state == 1) {//
													eventEmbed.setDescription(`You have only \`${res2.inventory.ingredients[ingredient_to_push.name]} ${ingredient_to_push.name}\`!`)
													return rep(null,null,eventEmbed,true,'5s')
												}
												// first check: if they have +
												if (ingredient_to_push.amount.includes("+")) {
													if (tradeInfo.ingredients[foundIndex].amount < res2.inventory.ingredients[tradeInfo.ingredients[foundIndex].name])
														tradeInfo.ingredients[foundIndex].amount+= Number(ingredient_to_push.amount.replace( /\D+/g, ''));
													else
														tradeInfo.ingredients[foundIndex].amount+= Number(res2.inventory.ingredients[tradeInfo.ingredients[foundIndex].name]);
												}
												if (ingredient_to_push.amount.includes("-")) {
													if (ingredient_to_push.amount.replace( /\D+/g, '') < tradeInfo.ingredients[foundIndex].amount)
														tradeInfo.ingredients[foundIndex].amount-= Number(ingredient_to_push.amount.replace( /\D+/g, ''));
													else
														tradeInfo.ingredients.splice(foundIndex,1)
												}
											}
											if (foundIndex == -1) {
												// check if player has the amount entered otherwise tell that he put all he has
												if ((res2.inventory.ingredients[ingredient_to_push.name] < ingredient_to_push.amount.replace(/\D+/g, '')) && ingredient_to_push.state == 1) {//
													eventEmbed.setDescription(`You have only \`${res2.inventory.ingredients[ingredient_to_push.name]} ${ingredient_to_push.name}\`!`)
													return rep(null,null,eventEmbed,true,'5s')
												}
												ingredient_to_push.amount = Number(ingredient_to_push.amount.replace( /\D+/g, ''));
												tradeInfo.ingredients.push(ingredient_to_push);
											}
											//#endregion
											eventEmbed.setDescription(`<@${tradeInfo.customer}> it is! What ingredients do you want to trade?
Please type in this kind of format: \`ingredient_name:amount,ingredient_name:amount\`
E.g: I wanna trade 5 bell peppers, 200 water & 25 strawberry jam => \`bell_peppers:5,water:200,strawberry_jam:25\`
\nCurrent ingredients to be traded:\n${tradeInfo.ingredients.map(item => `\`- ${item.name}:${item.amount}\``).join(",\n")}`)
											message.guild.channels.cache.get(tradeInfo.msgReference.channel.id).messages.cache.get(tradeInfo.msgReference.id).edit({embeds: [eventEmbed]})
											//#endregion
											console.log(tradeInfo)
											return console.log(`done q1`)
									}

									// confirmation + finishing process
									if (tradeInfo.q_state == 2) {
										if (userAnswer.toLowerCase() == 'back') {
											eventEmbed.setDescription(`Okay back to modify the list of ingredients? Let's see what you have so far:\n
Current ingredients to be traded:\n${tradeInfo.ingredients.map(item => `\`- ${item.name}:${item.amount}\``).join(",\n")}`)
											message.guild.channels.cache.get(tradeInfo.msgReference.channel.id).messages.cache.get(tradeInfo.msgReference.id).edit({embeds: [eventEmbed]})
											// if anything goes here 
											tradeInfo.q_state--
											return console.log(`done q1`)
										}
										if (userAnswer.toLowerCase() == 'yes') {
											let totalPoints = res2.points.stranger + res2.points.acquaintance + res2.points.friendship + res2.points.lover + res2.points.soulmate;
											if (totalPoints < tradeInfo.cost_ingredients) {
												eventEmbed.setDescription(`You don't have enough points to make this trade! You need \`${tradeInfo.cost_ingredients - totalPoints}\` more!
Either:
- remove some ingredients;
- gain some points;
- cancel the trade;`)
												return rep(null,null,eventEmbed,true,"10s")
											}
											eventEmbed.setDescription(`Trade Confirmed under the watch of the almighthy <@${this.client.user.id}>! A trade token was subtracted from ${issuer}!`)
											// message.guild.channels.cache.get(tradeInfo.msgReference.channel.id).messages.cache.get(tradeInfo.msgReference.id).edit({embeds: [eventEmbed]})
											
											//#region remove ingredients, token & points from actual rank & give ingredients to customer
											cooking_players.findOne({
												userID: tradeInfo.customer,
												guild: message.guild.id
											},async (err3,res3) =>{
												if (err3) {
													sendError.create({
														Guild_Name: message.guild.name,
														Guild_ID: message.guild.id,
														User: issuer.tag,
														UserID: issuer.id,
														Error: err3,
														Time: `${TheDate} || ${clock} ${amORpm}`,
														Command: this.name+" looking in player db - trade to customer",
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
												if (res3) {
													for(let i = 0; i < tradeInfo.ingredients.length; i++) {
														// addin ingredients to customer+ removing from issuer
														res3.inventory.ingredients[tradeInfo.ingredients[i].name]+= tradeInfo.ingredients[i].amount
														res2.inventory.ingredients[tradeInfo.ingredients[i].name]-= tradeInfo.ingredients[i].amount
													}
													res2.trade.tokens--;
													removePoints(tradeInfo, res2);
													res3.save().catch(err => console.log(err))
													res2.save().catch(err => console.log(err))
												}
											})
											//#endregion
											let findUser = this.client.tradeSystem.findIndex(i => i == issuer.id)
											this.client.tradeSystem.splice(findUser,1)
											tradeInfo.in_trade = false;
											return rep(null,null,eventEmbed)
										}
										if (userAnswer.toLowerCase() != 'yes') {
											eventEmbed.setDescription(`It seems like there wasn't any confirmation so this trade was canceled!`)
											let findUser = this.client.tradeSystem.findIndex(i => i == issuer.id)
											this.client.tradeSystem.splice(findUser,1)
											tradeInfo.in_trade = false;
											return rep(null,null,eventEmbed)
										}
									}
								}).catch(err3 => {
									console.log(err3)
									if (tradeInfo.tries > 0) {
										eventEmbed.setDescription(`${issuer}, are you still there? You didn't finish the trade. I'll ask again for ${tradeInfo.tries} ${tradeInfo.tries > 1 ? `times` : `more time`}.
If you still don't answer, the trade session will be closed!`)
										tradeInfo.tries--;
										return rep(null,null,eventEmbed,true,"30s");
									} else {
										eventEmbed.setDescription(`${issuer}, since you didn't answer in time for 3 times, this session was canceled!`)
										rep(null,null,eventEmbed)									
										eventEmbed.setDescription(`${issuer} trade session closed for not answering for more than 3 times in a row.`)
										logChannel.send({embeds: [eventEmbed]})
										let findUser = this.client.tradeSystem.findIndex(i => i == issuer.id)
										this.client.tradeSystem.splice(findUser,1)
										tradeInfo.in_trade = false;									
									}
								})
								// TO DO: FRICKING TRADE SYSTEM
							}
						} else return create_new_uevent(`Because you're a new chef entering the stage, we made a little space for you to lay your ingredients/dishes and share with everyone! Retry this command!`)
					})
				}

				// daily
				if (optionList.indexOf(userOption) == 15) {
					cooking_players.findOne({
						userID: issuer.id,
						guild: message.guild.id
					},async(err2,res2) =>{
						if (err2) {
							sendError.create({
								Guild_Name: message.guild.name,
								Guild_ID: message.guild.id,
								User: issuer.tag,
								UserID: issuer.id,
								Error: err2,
								Time: `${TheDate} || ${clock} ${amORpm}`,
								Command: this.name+" looking in player db - daily",
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
						if (res2) { // A DAY = 86 400 000
							if (Date.now() > res2.trade.lastPick) {
								if (res2.trade.tokens == res2.trade.limit) {
									eventEmbed.setDescription(`You have already the max number of tokens you can on you!`)
									return rep(null,null,eventEmbed,true,"10s")
								}
								if (res2.rank >= 2) res2.trade.limit = 3;
								if (res2.rank >= 4) res2.trade.limit = 4;
								if (res2.rank < 4) res2.trade.limit = 3;
								if (res2.rank < 2) res2.trade.limit = 2;
								res2.trade.tokens = res2.trade.limit
								res2.trade.lastPick = Date.now() + 43200000
								res2.save().catch(err => console.log(err))
								eventEmbed.setDescription(`Done! I gave you the tokens for today. Come back after some time for another refil!`)
								return rep(null,null,eventEmbed,true,'10s')
							} else {
								eventEmbed.setDescription(`Come back another time to get more tokens!`)//${pms(res2.trade.lastPick - Date.now())}
								return rep(null,null,eventEmbed,true,'10s')
							}
						}
					})
				}

				// request
				if (optionList.indexOf(userOption) == 16) {
					cooking_players.findOne({
						userID: issuer.id,
						guild: message.guild.id
					},async(err2,res2) =>{
						if (err2) {
							sendError.create({
								Guild_Name: message.guild.name,
								Guild_ID: message.guild.id,
								User: issuer.tag,
								UserID: issuer.id,
								Error: err2,
								Time: `${TheDate} || ${clock} ${amORpm}`,
								Command: this.name+" looking in player db - request",
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
						if (res2) { // 
							if (Date.now() > res2.cooldowns.lastAirdrop) {

								if (res2.points[evranks[res2.rank]] > 5 * res2.rank) {
									eventEmbed.setDescription(`You don't have at least ${5*res2.rank} points to make a request`)
								}



								let threadList = {
									basic: res.events.cooking.threads.basic,
									zone1: res.events.cooking.threads.zone1,
									zone2: res.events.cooking.threads.zone2,
									zone3: res.events.cooking.threads.zone3,
									zone4: res.events.cooking.threads.zone4,
									// test: undefined
								}
								// let amount_ing = args[2]
								let ingredient1 = args[1] ?? 11
								let ingredient2 = args[2] ?? 11

								let existent_dishes = Object.values(ingredients_lex_db)
								if (ingredient1 != 11)
									if (!existent_dishes.includes(ingredient1)) {
										eventEmbed.setDescription(`Sadly I don't recognize this \`${ingredient1}\`. Make sure you type the name as it is and if it has spaces, replace them with **underscore** (**_**).
										If you still don't get the ingredient, look below at the existing list of ingredients that I accept:\n\n\`${existent_dishes.join(", ")}\``)
										return rep(null,null,eventEmbed,true,'30s');
									}
								if (ingredient2 != 11)
									if (!existent_dishes.includes(ingredient2)) {
										eventEmbed.setDescription(`Sadly I don't recognize this \`${ingredient2}\`. Make sure you type the name as it is and if it has spaces, replace them with **underscore** (**_**).
										If you still don't get the ingredient, look below at the existing list of ingredients that I accept:\n\n\`${existent_dishes.join(", ")}\``)
										return rep(null,null,eventEmbed,true,'30s');
									}
								let airdrops = []
								let is_threadList = getKeyByValue(threadList,message.channel.id)
								if (message.channel.isThread() == false && is_threadList == undefined) {
									let modifiedThreadList = Object.values(threadList).map(i => i = `<#${i}>`)
									eventEmbed.setDescription(`You can't call a request from here! Head towards ${modifiedThreadList.join(", ")}`)
									return rep(null,null,eventEmbed,true,'10s');
								}
								let zone_ing_ids = ingredients_db[is_threadList]
								let zone_ing_chances = []
								for(let i = 0; i < ingredients_db[is_threadList].length; i++) {
									let drop = 100/ingredients_db[is_threadList].length
									if (zone_ing_ids[i] == getKeyByValue(ingredients_lex_db,ingredient1) && ingredient1 != 11)
										drop += 10							
									if (zone_ing_ids[i] == getKeyByValue(ingredients_lex_db,ingredient2) && ingredient2 != 11)
										drop += 10
									zone_ing_chances.push(drop)
								}
								for(let i = 0; i < 5; i++) {
									let dropThis = percentageChance(zone_ing_ids,zone_ing_chances)
									airdrops.push(dropThis)
								}
								let visualdrop = visualPLZ(airdrops)
								// console.log(`visual drop 5:`,visualdrop,getDupsLength(visualdrop))
								// rep(`drops: ${visualdrop}`)
								let specificCooldown = (res.events.cooking.cooldowns.airdrop * 60 * 1000 + (1800000*res2.rank))
								res2.cooldowns.lastAirdrop = Date.now() + specificCooldown
								res2.save().catch(err => console.log(err))
								let funnyTextEmojis = [`( ͡° ͜ʖ ͡°)`,'¯\\_(ツ)_/¯','ʕ•ᴥ•ʔ','(ง ͠° ͟ل͜ ͡°)ง','༼ つ ◕_◕ ༽つ','(▀̿Ĺ̯▀̿ ̿)','ಠ_ಠ','(づ｡◕‿‿◕｡)づ','(ᵔᴥᵔ)','(ಥ﹏ಥ)','|(• ◡•)| (❍ᴥ❍ʋ)']
								const row5_1 = new ActionRowBuilder()
								const row5_2 = new ActionRowBuilder()
								const row1 = new ActionRowBuilder()
								let containerChances = [9.09,9.09,9.09,9.09,9.09]
								//#region make buttons & handle the other 5 ingredients
								for (let i = 0; i < 11; i++) {
									if (i >=0 && i <= 4) {
										let selectRandomEmoji = funnyTextEmojis[Math.floor(Math.random() * funnyTextEmojis.length)]
										row5_1.addComponents(
											new ButtonBuilder()
											.setCustomId(`${i}`)
											.setLabel(`${selectRandomEmoji}`)
											.setStyle(ButtonStyle.Primary)
										)
										funnyTextEmojis.splice(funnyTextEmojis.findIndex(item => item == selectRandomEmoji),1)
									}
									if (i >=5 && i <= 9) {
										let selectRandomEmoji = funnyTextEmojis[Math.floor(Math.random() * funnyTextEmojis.length)]
										row5_2.addComponents(
											new ButtonBuilder()
											.setCustomId(`${i}`)
											.setLabel(`${selectRandomEmoji}`)
											.setStyle(ButtonStyle.Primary)
										)
										funnyTextEmojis.splice(funnyTextEmojis.findIndex(item => item == selectRandomEmoji),1)
									}
									if (i == 10){
										row1.addComponents(
											new ButtonBuilder()
											.setCustomId(`${i}`)
											.setLabel(`${funnyTextEmojis[0]}`)
											.setStyle(ButtonStyle.Primary)
										)
									}
								}
								if ((ingredient1 != 11 && ingredient2 != 11) && ingredient1 != ingredient2) {// if they chose 2 diff ingredients
									// console.log(`diff ingredients`)
									visualdrop.push(`5 ${ingredient1}`)
									visualdrop.push(`3 ${ingredient2}`)
									visualdrop.push(ingredient1)
									visualdrop.push(ingredient2)
									visualdrop.push(ingredient1)
									visualdrop.push(ingredient2)
									containerChances.push(19.09)
									containerChances.push(19.09)
									containerChances.push(14.09)
									containerChances.push(14.09)
									containerChances.push(12.09)
									containerChances.push(12.09)
								} else if ((ingredient1 != 11 && ingredient2 != 11) && ingredient1 == ingredient2) { // if improved 1 ingredient twice
									// console.log(`same ingredients`)
									visualdrop.push(`5 ${ingredient1}`)
									visualdrop.push(`3 ${ingredient1}`)
									visualdrop.push(ingredient1)
									visualdrop.push(ingredient1)
									visualdrop.push(ingredient1)
									visualdrop.push(ingredient1)
									containerChances.push(19.09)
									containerChances.push(19.09)
									containerChances.push(14.09)
									containerChances.push(14.09)
									containerChances.push(12.09)
									containerChances.push(12.09)
								} else if (ingredient1 != 11 && ingredient2 == 11) { // if didn't provide 2nd ingredient
									// console.log(`no 2nd ing`)
									visualdrop.push(`5 ${ingredient1}`)
									visualdrop.push(`3 ${ingredient1}`)
									visualdrop.push(ingredient1)
									visualdrop.push(ingredient1)
									visualdrop.push(ingredient1)
									containerChances.push(29.09)
									containerChances.push(19.09)
									containerChances.push(15.09)
									containerChances.push(15.09)
									containerChances.push(15.09)
									containerChances.push(9.09)
									let gimmeplz = ingredients_lex_db[percentageChance(zone_ing_ids,zone_ing_chances)]
									visualdrop.push(gimmeplz)
								} else {// if didn't provide any ingredient
									// console.log(`No ingredients`)
									for(let i = 0; i < 6; i++) {
										let dropThis = percentageChance(zone_ing_ids,zone_ing_chances)
										// console.log(dropThis)
										visualdrop.push(ingredients_lex_db[dropThis])
										containerChances.push(9.09)
									}
								}
								//#endregion
								// console.log(`visual drop all`,visualdrop,'visual drop chances',containerChances)
								eventEmbed.setDescription(`A request with goods just arrived! You can gather 3 items only!`)
								return message.channel.send({embeds: [eventEmbed],components: [row5_1,row5_2,row1]}).then(msg =>{
									let airdropData = {
										owner: issuer.id,
										containerId: msg.id,
										containerContent: visualdrop,
										containerContentChances: containerChances,
										itemsCollected: 0,
										ing_boosted: [ingredient1,ingredient2]
									}
									this.client.airdropClients.set(msg.id,airdropData);
								})
							} else {
								eventEmbed.setDescription(`You cannot make a request for a while! Come back later.`)//${pms(res2.trade.lastPick - Date.now())}
								return rep(null,null,eventEmbed,true,'10s')
							}
						}
					})
				}
				
				if (!message.member.roles.cache.find(r => r.id === res.staffRole) && ['welcome','switch','settings','lock'].includes(userOption)) return rep(`you can't use this!`,true,null,true,'3.5s');

				// welcome - to do
				if (optionList.indexOf(userOption) == 0) {
					// get date for EU, NA & AS. Credits Lucy
					
					let halEmbed = new SharuruEmbed()
						.setColor(`LUMINOUS_VIVID_PINK`) // some kind of orange
						.setTitle(`${event_name}`)
						.setDescription(`Heewwoo there, Yue is back with a new event together with <@192290120546648065>! This time we have an event for valentine's day where your goal would be: \`Top chefs of Valentine's\`!
You will start making recipes and gift your dishes to your partner to gain points! Once u get enough points, you would be able to enter a higher league of chefs which expands your horizons! Goodluck everyone!`)
						.addFields([
							{name: `Commands:`,value:`
\`${prefix}cooking pair <@member>\` => Choose your partner chef to build together a career! 
\`${prefix}cooking gather\` => Start gathering some ingredients! It scales with your rank!
\`${prefix}cooking inventory [dishes]\` => This will give you the ability to see what ingredients you have at the moment. If you specify as well optional word "dishes", it will show the available dishes made by your so far. 
\`${prefix}cooking start <recipe id>\` => E.g: \`cooking start 1\`, you will start to cook the recipe with id 1: \`Cooked Rice\`!
\`${prefix}cooking gift\` => After making a dish, share your delicacy with your partner! This way everyone enjoys amazing dishes! 
\`${prefix}cooking climb\` => Once you've been through a lot of hard work and dishes and your partner have done the same, you will have the option to get examinated and enter in a higher league of chefs to compete!
\`${prefix}cooking stats\` => Shows some info about yourself in this competition!
\`${prefix}cooking leaderboard <friendship/lover/soulmate>\` => Shows the ranks of people according to the category you chose! Alias: \`top\`;  
`},
							{name: `Event Time:`,value:`Start: <t:1644751800>\nEnd: <t:1645700400>`},
							{name: `Prize:`,value: `- Top group in Soulmate league receives Blessing of the Welkin\n- Top groups in Friendship & Lover Leagues receives special roles`},
							{name: `Reminder:`,value:`- When refering to "\`groups\`", this is meaning the group that is on the first place composed of 2 users that paired together.`}
						])
						.setImage(`https://cdn.discordapp.com/attachments/769228052165033994/942387029025644574/genshin-impact-food-recipes.jpg`)
						return rep(null,null,halEmbed);
				}

				// switch
				if (optionList.indexOf(userOption) == 1) {
					if (!res.events.cooking.enabled) res.events.cooking.enabled = false;
					res.events.cooking.enabled = !res.events.cooking.enabled
					if (Date.now() > config.event_dates.cookingEnd)
					eventEmbed.setDescription(`I have turned **${res.events.cooking.enabled ? `on` : "off"}** the cooking event but you know that the cooking is over? This wouldn't change too much since it won't work anyway until next cooking event...`)
					else
					eventEmbed.setDescription(`I have turned **${res.events.cooking.enabled ? `on` : "off"}** the cooking event.`)
					rep(null,false,eventEmbed,true,'10s')
				}
				
				// settings- TO DO
				if (optionList.indexOf(userOption) == 2) {
					let cookingControlEmbed = new SharuruEmbed()
							.setColor("LUMINOUS_VIVID_PINK")
							.setFooter(`Requested by ${issuer.tag}`)
							.setTitle(`${event_name} Settings:`)
					let subOption = args[1]
					let subOptionAnswer = args[2];
					let subOptionsAllowed = ['cookinghall','threads','ranklimits','lockto','rates','giveing','update','trade','rgs']
					if (!subOption) {
						cookingControlEmbed.addFields([
								{name: `Is Enabled?:`,value: res.events.cooking.enabled ? `Yes` : `No`,inline: false},
								{name: `Main Channel for cooking:`,value: res.events.cooking.mChannel != 'Not set' ? `<#${res.events.cooking.cookingHall}>` : `Not set`,inline: false},
								{name: `Threads to gather ingredients:`,value: `- Basic: <#${res.events.cooking.threads.basic}>\n- Zone 1: <#${res.events.cooking.threads.zone1}>\n- Zone 2: <#${res.events.cooking.threads.zone2}>\n- Zone 3: <#${res.events.cooking.threads.zone3}>\n- Zone 4: <#${res.events.cooking.threads.zone4}>`,inline: false},
								{name: `Rank Limits:`,value: `Stranger: ${res.events.cooking.rankLimits.stranger}\nAcquaintance: ${res.events.cooking.rankLimits.acquaintance}\nFriendship: ${res.events.cooking.rankLimits.friendship}\nLove: ${res.events.cooking.rankLimits.lover}\nSoulmate: ${res.events.cooking.rankLimits.soulmate}\n`},
								{name: `Rates for dishes:`,value: `Suspicious: ${res.events.cooking.dish_chances.suspicious}\nNormal: ${res.events.cooking.dish_chances.normal}\nDelicious: ${res.events.cooking.dish_chances.delicious}`},
								{name: `Trade Costs:`,value: `Normal: ${res.events.cooking.trade.normal_cost}\nLiquids: ${res.events.cooking.trade.liquid_cost}`},
								{name: `Cooldowns:`,value: `Pairing: ${res.events.cooking.cooldowns.pair}m\nLeaderboard: ${res.events.cooking.cooldowns.top}\nRequest: ${res.events.cooking.cooldowns.airdrop}m\nRequest items to collect: ${res.events.cooking.cooldowns.airdropTries+1}`},
								
								{name: `Commands locked to:`,value: `${res.events.cooking.statsLockChannel != '0' ? `<#${res.events.cooking.statsLockChannel}>`: `Not set up yet! All commands are available everywhere!`}`},
								{name: 'Available admin commands:', value: `\`- ${subOptionsAllowed.join(",\n- ")}\``},
								{name: '\u200B', value: '\u200B'},
							])
						return rep(null,false,cookingControlEmbed)
					}
					if (subOptionsAllowed.indexOf(subOption) == -1 ) return rep(`I don't know that sub-option! I only know \`${subOptionsAllowed}\``,true,null,true,'15s');
				

					// cookinghall
					if (subOptionsAllowed.indexOf(subOption) == 0 ) {
						if (!subOptionAnswer) {
							cookingControlEmbed.setDescription(`I need a channel id or mention to be able to set!`)
							return rep(null,true,cookingControlEmbed,true,"7.5s")
						} // `!ck settings mc <ID/MENTION>`
						if (message.mentions.channels.size > 0) subOptionAnswer = message.mentions.channels.first()?.id;

						res.events.cooking.cookingHall = subOptionAnswer;
						cookingControlEmbed.setDescription(`I have set up the **\`Cooking Hall\`** to <#${subOptionAnswer}>!`)
						rep(null,true,cookingControlEmbed,true,"10s");
					}

					// threads
					if (subOptionsAllowed.indexOf(subOption) == 1) {
						let filter = m => m.author.id == issuer.id
						cookingControlEmbed.setDescription(`Now I'll start setting up the threads, did you set up **\`Cooking Hall\`** first? Answer with \`yes\` or \`no\``)
						message.channel.send({embeds: [cookingControlEmbed]}).then(async (msgConf) =>{
							await message.channel.awaitMessages({filter, time: 30000, max: 1}).then(async collected =>{
								let msgContent = collected.first().content;
								// await collected.delete()
								if (msgContent?.toLowerCase() == 'yes') {
									let notSet = false;
									let notFound = false;
									if (res.events.cooking.cookingHall == "Not set") {
										notSet = true;
										if (info) console.log(`[${event_name}]: The cooking hall was not set up!`)
									}
									if (!message.guild.channels.cache.find(ch => ch.id == res.events.cooking.cookingHall)) {
										notFound = true;
										if (info) console.log(`[${event_name}]: The channel id was not found!!`)
									}
									if (notSet == true && notFound == true || notSet == false && notFound == true || notSet == true && notFound == false) {
										cookingControlEmbed.setDescription(`I checked and sadly the **\`Cooking Hall\`** wasn't set up or I couldn't find the channel itself! `)
										return rep(null,null,cookingControlEmbed,true,"30s")
									} else console.log(`[${event_name}]: I found the cooking hall!`)
									let cookingHallRef = message.guild.channels.cache.find(ch => ch.id == res.events.cooking.cookingHall);

									if(!message.guild.me.permissions.has("MANAGE_THREADS")) {
										cookingControlEmbed.setDescription(`I'm sorry but I miss the \`MANAGE_THREADS\` permission which I need to make the 5 threads necessary for event! Please give me that permission and try again this command`)
										return rep(null,null,cookingControlEmbed)
									} else console.log(`[${event_name}]: Yes! I have MANAGE_THREADS permission!`)
									
									//#region create zone4
									const cooking_zone4 = await cookingHallRef.threads.create({
										name: 'Zone 4',
										autoArchiveDuration: 'MAX',
										reason: 'This is the last level, Zone 4, used for Veteran chiefs! You can gather all ingredients from the previous levels including this one as well!',
									}).then(cth => res.events.cooking.threads.zone4 = cth.id);
									console.log(`Created thread: ${cooking_zone4.name} in ${message.guild.name} (${message.guild.id})`);
									if (cooking_zone4.joinable) await cooking_zone4.join();
									//#endregion
									
									//#region create zone3
									const cooking_zone3 = await cookingHallRef.threads.create({
										name: 'Zone 3',
										autoArchiveDuration: 'MAX',
										reason: 'This is Zone 3 thread used for advanced chiefs! You can gather ingredients here from the previous levels up to this one (Basic, Zone 1, Zone 2 and this one)!',
									}).then(cth => res.events.cooking.threads.zone3 = cth.id);
									console.log(`Created thread: ${cooking_zone3.name} in ${message.guild.name} (${message.guild.id})`);
									if (cooking_zone3.joinable) await cooking_zone3.join();
									//#endregion

									//#region create zone2
									const cooking_zone2 = await cookingHallRef.threads.create({
										name: 'Zone 2',
										autoArchiveDuration: 'MAX',
										reason: 'This is Zone 2 thread used for regular chiefs! You can gather ingredients here from the previous levels up to this one (Basic, Zone 1 & this one!)!',
									}).then(cth => res.events.cooking.threads.zone2 = cth.id);
									console.log(`Created thread: ${cooking_zone2.name} in ${message.guild.name} (${message.guild.id})`);
									if (cooking_zone2.joinable) await cooking_zone2.join();
									//#endregion

									//#region create zone1
									const cooking_zone1 = await cookingHallRef.threads.create({
										name: 'Zone 1',
										autoArchiveDuration: 'MAX',
										reason: 'This is Zone 1 thread used for accommodated chiefs! You can gather basic and this level ingredients here!',
									}).then(cth => res.events.cooking.threads.zone1 = cth.id);
									console.log(`Created thread: ${cooking_zone1.name} in ${message.guild.name} (${message.guild.id})`);
									if (cooking_zone1.joinable) await cooking_zone1.join();
									//#endregion
									
									//#region create basic
									const cooking_basic = await cookingHallRef.threads.create({
										name: 'Basic',
										autoArchiveDuration: 'MAX',
										reason: 'This is the basic channel used for new chiefs! You can gather basic ingredients here!',
									}).then(cth => res.events.cooking.threads.basic = cth.id);
									console.log(`Created thread: ${cooking_basic.name} in ${message.guild.name} (${message.guild.id})`);
									if (cooking_basic.joinable) await cooking_basic.join();
									//#endregion
																		
									cookingControlEmbed.setDescription(`I've finished my job and if everything went smoothly, I should have made 5 threads under <#${res.events.cooking.cookingHall}>! `)
									console.log(`at this point it should save`)
									await res.save().catch(err3 => console.log(err3))
									return rep(null,null,cookingControlEmbed)
								} else {
									cookingControlEmbed.setDescription(`Any other answer than 'yes' would be considered as 'no'. Please set up the Cooking hall before using this command!`);
									return rep(null,null,cookingControlEmbed,true,'30s');
								}
							}).catch(err =>{
								if (info) console.log(`[${event_name}]: ERROR AT:\n${err.message}`)
								console.log(err)
								return message.channel.send(`Sadly I couldn't fulfill the purpose given and just got an error >.<; Please tell my master about this error and how it happened + this: ${err.message}`)
							})
						})
					}
					
					// rankLimits
					if (subOptionsAllowed.indexOf(subOption) == 2) {
						let rankList = ['stranger','acquaintance','friendship','love','soulmate']
						if (!subOptionAnswer || !args[3]) {
							cookingControlEmbed.setDescription(`Please specify after \`rankLimit\` a number from \`0\` to \`4\` which represents the ranks from \`stranger\` to soulmate and an amount after (above 100, under 999999)!`)
							return rep(null,null,cookingControlEmbed)
						}
						if (isNaN(subOptionAnswer) || isNaN(args[3])){
							cookingControlEmbed.setDescription(`I accept only numbers for rank and the amount!`)
							return rep(null,null,cookingControlEmbed)
						}
						if (args[3] < 100 || args[3] > 999999) {
							cookingControlEmbed.setDescription(`I can't put the amount below 100 and above 999999!`)
							return rep(null,null,cookingControlEmbed)
						}
						if (subOptionAnswer < 0 || subOptionAnswer > 4) {
							cookingControlEmbed.setDescription(`I don't know that kind of rank... I only know from \`stranger\` to \`soulmate\` represented in numbers from \`0\` to \`4\` (aka 0 = stranger, 1 = acquaintance, etc 4 = soulmate).`)
							return rep(null,null,cookingControlEmbed)
						}
						res.events.cooking.rankLimits[rankList[subOptionAnswer]] = args[3]
						cookingControlEmbed.setDescription(`Done! I've set the limit of \`${rankList[subOptionAnswer]}\` to be \`${args[3]}\`!`)
						rep(null,null,cookingControlEmbed)
					}

					// lockto
					if (subOptionsAllowed.indexOf(subOption) == 3) {
						if (!subOptionAnswer) {
							cookingControlEmbed.setDescription(`Please specify a channel id/ mention to lock the majority of event commands (such as \`inv, top, gift, pair, climb, stats\`)!`)
							return rep(null,null,cookingControlEmbed)
						}
						if (message.mentions.channels.size > 0) subOptionAnswer = message.mentions.channels.first()?.id;

						res.events.cooking.statsLockChannel = subOptionAnswer
						cookingControlEmbed.setDescription(`I have set up the majority of commands to be locked to **<#${subOptionAnswer}>**!`)
						rep(null,null,cookingControlEmbed)
					}

					// rates
					if (subOptionsAllowed.indexOf(subOption) == 4) {
						if (!subOptionAnswer || !args[3]) {
							cookingControlEmbed.setDescription(`Please specify the type of rarity and a number from \`0\` to \`100\`!`)
							return rep(null,null,cookingControlEmbed)
						}
						if (args[3] < 0 || args[3] > 100) {
							cookingControlEmbed.setDescription(`I can't put the amount below 0 and above 100!`)
							return rep(null,null,cookingControlEmbed)
						}
						if (!['suspicious','normal','delicious','sus','nor','del'].includes(subOptionAnswer.toLowerCase())) {
							cookingControlEmbed.setDescription(`I don't know that kind of rarity... I only know \`suspicious,normal & delicious\`!`)
							return rep(null,null,cookingControlEmbed)
						}
						if (subOptionAnswer.toLowerCase() == 'del') subOptionAnswer = `delicious`
						if (subOptionAnswer.toLowerCase() == 'nor') subOptionAnswer = `normal`
						if (subOptionAnswer.toLowerCase() == 'sus') subOptionAnswer = `suspicious`
						res.events.cooking.dish_chances[subOptionAnswer]= args[3]
						cookingControlEmbed.setDescription(`Done! I've set the chance of \`${subOptionAnswer}\` spawning to be \`${args[3]}\`!`)
						rep(null,null,cookingControlEmbed)
					}

					// giveing
					if (subOptionsAllowed.indexOf(subOption) == 5) {
						message.delete()
						let amount = args[3]
						if (!subOptionAnswer || !amount) {
							cookingControlEmbed.setDescription(`Please specify the ingredient and the number of it (min 1, max 25)!`)
							return rep(null,null,cookingControlEmbed)
						}
						// if ingredient exist
						let existent_ingredients = Object.values(ingredients_lex_db)
						if (!existent_ingredients.includes(subOptionAnswer.toLowerCase())) {
							cookingControlEmbed.setDescription(`I don't know this ingredient: \`${subOptionAnswer.toLowerCase()}\`. I only know:\n ${existent_ingredients.join(", ")}`)
							return rep(null,null,cookingControlEmbed)
						}
						cooking_players.find({guild: message.guild.id},async (err2,res2) =>{
							if (err2) {
								sendError.create({
									Guild_Name: message.guild.name,
									Guild_ID: message.guild.id,
									User: issuer.tag,
									UserID: issuer.id,
									Error: err2,
									Time: `${TheDate} || ${clock} ${amORpm}`,
									Command: this.name+" looking in cooking player db- giveingr",
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
							if (res2) {
								// console.log(res2[i].inventory)
								for (let i = 0; i < res2.length; i++) {
									res2[i].inventory.ingredients[subOptionAnswer]+= Number(amount);
									res2[i].save().catch(err => console.log(err))
								}
									cookingControlEmbed.setDescription(`Done! I've updated everyone's inventory with ${args[3]} \`${subOptionAnswer}\`!`)
								rep(null,null,cookingControlEmbed,true, '3s')
							}
						})
					}

					// update
					if (subOptionsAllowed.indexOf(subOption) == 6) {
						let updateChannel = args[2]
						let updateVersion = args[3]
						let updateContent = args.slice(3).join(" ")
						if (!updateChannel || !updateContent) return rep(`please make sure to mention: channel, version and update`)
						if (message.mentions.channels.size > 0) updateChannel = message.mentions.channels.first()?.id;
						let halEmbed = new SharuruEmbed()
						.setColor(`LUMINOUS_VIVID_PINK`) // some kind of orange
						.setTitle(`${event_name} Ended!`)
						.setDescription(updateContent)
						.setImage(`https://cdn.discordapp.com/attachments/769228052165033994/947947313257660476/unknown.png`)
						return message.guild.channels.cache.get(updateChannel).send({embeds: [halEmbed]})

					}

					// trade_cost
					if (subOptionsAllowed.indexOf(subOption) == 7) {
						let trade_goods = ['normal_cost','liquid_cost']
						if (!subOptionAnswer || !args[3]) {
							cookingControlEmbed.setDescription(`Please specify after the \`type\`(0 = normal, 1 = liquids) of good a number from \`1\` to \`20\` which represents the cost!`)
							return rep(null,null,cookingControlEmbed)
						}
						if (isNaN(subOptionAnswer) || isNaN(args[3])){
							cookingControlEmbed.setDescription(`I accept only numbers for cost of the good!`)
							return rep(null,null,cookingControlEmbed)
						}
						if (args[3] < 1 || args[3] > 20) {
							cookingControlEmbed.setDescription(`I can't put the amount below 1 and above 20!`)
							return rep(null,null,cookingControlEmbed)
						}
						if (!trade_goods.includes(trade_goods[subOptionAnswer])) {
							cookingControlEmbed.setDescription(`I don't know that type of good... I only know \`${trade_goods.join(", ")}\` (represented in 0 = normal, 1 = liquids)!`)
							return rep(null,null,cookingControlEmbed)
						}
						res.events.cooking.trade[trade_goods[subOptionAnswer]] = args[3]
						cookingControlEmbed.setDescription(`Done! I've set the trade cost of \`${trade_goods[subOptionAnswer]}\` to be \`${args[3]}\`!`)
						rep(null,null,cookingControlEmbed)
					}

					// resetGlobalScore
					if (subOptionsAllowed.indexOf(subOption) == 8) {
						let resetToZone = args[2];
						let dishesAmount = args[3] ?? null;
						let ingredientsLeftover = args[4] ?? null;
						let msgDone = `Okay, I'll reset everyone score to the level of \`${evranks[resetToZone]}\`!\n\n`
						if (!resetToZone) {
							eventEmbed.setDescription(`Please specify at least the rank to reset to!`)
							return rep(null,null,eventEmbed);
						}
						if (isNaN(resetToZone)) {
							eventEmbed.setDescription(`Please input a number from 0 to 4 (inclusive both). `)
							return rep(null,null,eventEmbed)
						}
						if (dishesAmount)
							msgDone+=`- with a total amount of ${dishesAmount}% from original amount;\n`
						if (ingredientsLeftover)
							msgDone+=`- with ingredients less than ${ingredientsLeftover} for zones higher than ${evranks[resetToZone]}\n`

						cooking_players.find({
							guild: message.guild.id
						},async (err2,res2)=>{
							if (err2) {
								sendError.create({
									Guild_Name: message.guild.name,
									Guild_ID: message.guild.id,
									User: issuer.tag,
									UserID: issuer.id,
									Error: err2,
									Time: `${TheDate} || ${clock} ${amORpm}`,
									Command: this.name+" rgs",
									Args: args,
								},async (err, res) => {
									if(err) {
										console.log(err)
										return message.channel.send(`[cooking event-rgs]: Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
									}
									if(res) {
										console.log(`successfully added error to database!`)
									}
								})
							}
							if (res2) {
								let zoneRank = ['basic','zone1','zone2','zone3','zone4']
								for (let i = 0; i < res2.length; i++) {
									if (res2[i].rank <= resetToZone) continue;
									res2[i].rank = resetToZone;
									if (resetToZone == 0) {
										res2[i].points[evranks[0]] = 0 
										res2[i].points[evranks[1]] = 0 
										res2[i].points[evranks[2]] = 0 
										res2[i].points[evranks[3]] = 0 
										res2[i].points[evranks[4]] = 0
									}
									if (resetToZone == 1) {
										res2[i].points[evranks[1]] = res.events.cooking.rankLimits[evranks[resetToZone-1]]//acq
										res2[i].points[evranks[2]] = 0
										res2[i].points[evranks[3]] = 0
										res2[i].points[evranks[4]] = 0
									}
									if (resetToZone == 2) {
										res2[i].points[evranks[2]] = res.events.cooking.rankLimits[evranks[resetToZone-1]]//friend
										res2[i].points[evranks[3]] = 0
										res2[i].points[evranks[4]] = 0
									}
									if (resetToZone == 3) {
										res2[i].points[evranks[3]] = res.events.cooking.rankLimits[evranks[resetToZone-1]]//lover
										res2[i].points[evranks[4]] = 0
									}
									if (dishesAmount != null || dishesAmount != undefined) {
										if (res2[i].inventory.dishes.length > 5) {
											let per = Math.round((dishesAmount/100) * res2[i].inventory.dishes.length)
											let newDishes = res2[i].inventory.dishes;
											newDishes.length = per
											console.log(`[Cooking Event - RGS]: ${res2[i].userID} initial dishes amount: ${res2[i].inventory.dishes.length}; After: ${per}`)
											cooking_players.updateOne({
												'userID': `${res2[i].userID}`
											},{'$set':{ 'inventory.dishes' : newDishes}},(erro,reso)=>{
												if (erro) {
													sendError.create({
														Guild_Name: message.guild.name,
														Guild_ID: message.guild.id,
														User: issuer.tag,
														UserID: issuer.id,
														Error: erro,
														Time: `${TheDate} || ${clock} ${amORpm}`,
														Command: this.name + `, cooking rgs ${dishesAmount}% dishes`,
														Args: args,
													},async (errr, ress) => {
														if(errr) {
															console.log(errr)
															return message.channel.send(`[Cooking event - rgs]:Unfortunately an problem appeared in emoji command - add option. Please try again later. If this problem persist, contact my partner!`)
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
										}
									}
									if (ingredientsLeftover != null || ingredientsLeftover != undefined) {
										if (resetToZone < 4) {
											let resLimit = visualPLZ(ingredients_db[zoneRank[4]])
											for(let u = 0; u < resLimit.length; u++) {
												if (res2[i].inventory.ingredients[resLimit[u]] > 5) 
												{
													let perc = Math.round((ingredientsLeftover/100) * res2[i].inventory.ingredients[resLimit[u]]);
													console.log(`[Cooking Event - RGS] ${res2[i].userID} ${zoneRank[4]}:Initial ing amount for ${resLimit[u]}: ${res2[i].inventory.ingredients[resLimit[u]]}; Leftover amount: ${perc}`)
													res2[i].inventory.ingredients[resLimit[u]] = perc
												}
											}
										}
										if (resetToZone < 3) {
											let resLimit = visualPLZ(ingredients_db[zoneRank[3]])
											for(let u = 0; u < resLimit.length; u++) {
												if (res2[i].inventory.ingredients[resLimit[u]] > 5) {
													let perc = roundPrecised((ingredientsLeftover/100) * res2[i].inventory.ingredients[resLimit[u]],0);
													console.log(`[Cooking Event - RGS] ${res2[i].userID} ${zoneRank[3]}:Initial ing amount for ${resLimit[u]}: ${res2[i].inventory.ingredients[resLimit[u]]}; Leftover amount: ${perc}`)
													res2[i].inventory.ingredients[resLimit[u]] = perc
												}
											}
										}
										if (resetToZone < 2) {
											let resLimit = visualPLZ(ingredients_db[zoneRank[2]])
											for(let u = 0; u < resLimit.length; u++) {
												if (res2[i].inventory.ingredients[resLimit[u]] > 5) {
													let perc = roundPrecised((ingredientsLeftover/100) * res2[i].inventory.ingredients[resLimit[u]],0);
													console.log(`[Cooking Event - RGS] ${res2[i].userID} ${zoneRank[2]}:Initial ing amount for ${resLimit[u]}: ${res2[i].inventory.ingredients[resLimit[u]]}; Leftover amount: ${perc}`)
													res2[i].inventory.ingredients[resLimit[u]] = perc
												}
											}
										}
										if (resetToZone < 1) {
											let resLimit = visualPLZ(ingredients_db[zoneRank[1]])
											for(let u = 0; u < resLimit.length; u++) {
												if (res2[i].inventory.ingredients[resLimit[u]] > 5){
													let perc = roundPrecised((ingredientsLeftover/100) * res2[i].inventory.ingredients[resLimit[u]],0);
													console.log(`[Cooking Event - RGS] ${res2[i].userID} ${zoneRank[1]}:Initial ing amount for ${resLimit[u]}: ${res2[i].inventory.ingredients[resLimit[u]]}; Leftover amount: ${perc}`)
													res2[i].inventory.ingredients[resLimit[u]] = perc
												}
											}
										}
										if (resetToZone < 0) {
											let resLimit = visualPLZ(ingredients_db[zoneRank[0]])
											for(let u = 0; u < resLimit.length; u++) {
												if (res2[i].inventory.ingredients[resLimit[u]] > 5) {
													let perc = roundPrecised((ingredientsLeftover/100) * res2[i].inventory.ingredients[resLimit[u]],0);
													console.log(`[Cooking Event - RGS] ${res2[i].userID} ${zoneRank[0]}:Initial ing amount for ${resLimit[u]}: ${res2[i].inventory.ingredients[resLimit[u]]}; Leftover amount: ${perc}`)
													res2[i].inventory.ingredients[resLimit[u]] = perc
												}
											}
										}
									}
									res2[i].save().catch(err => console.log(err))
								}
							}
						})
						
						
						cookingControlEmbed.setDescription(msgDone)
						rep(null,null,cookingControlEmbed)
					}
				}
				await res.save().catch(err3 => console.log(err3))
			} else console.log(`Nothing found in db`)
		})

		
		function removePoints(tradeInfo, res2) {// cost: 120 | points: 100
			if (tradeInfo.cost_ingredients > 0){
				if (tradeInfo.cost_ingredients > res2.points[evranks[res2.rank]]) {
						let getDiff = tradeInfo.cost_ingredients - res2.points[evranks[res2.rank]];
						tradeInfo.cost_ingredients = getDiff; 
						res2.points[evranks[res2.rank]] = 0;
						res2.rank--;
					} else {
						res2.points[evranks[res2.rank]] -= tradeInfo.cost_ingredients;
						tradeInfo.cost_ingredients = 0;
					}
				removePoints(tradeInfo,res2)
			}
		}

		function getDupsLength (array) {
			let mapOfDups = new Map()
			if (array.length == 0) return mapOfDups;
			for (let i = 0; i < array.length; i++) {
				const element = array[i];
				let testIfExist = mapOfDups.get(element)
				if (testIfExist == undefined) mapOfDups.set(element,1)
				else {
					let count = mapOfDups.get(element) + 1;
					mapOfDups.set(element,count)
				}
			}
			return mapOfDups
		}

		function visualPLZ(arr) {
			let returnthis = []
			for (let i = 0; i < arr.length; i++) {
				const element = arr[i];
				returnthis.push(ingredients_lex_db[element])
			}
			return returnthis
		}

		function show_top(res2, whatRank, returnRankOnly = false) {
			let listOfPeople = [];
			let Pages = [];
			let page = 1;
			for (let i = 0; i < res2.length; i++) {
				let obj = {
					id: res2[i].userID,
					level: res2[i].points[whatRank]
				};
				listOfPeople.push(obj);
			}

			let sortedRanks = _.orderBy(listOfPeople, 'level', 'desc');
			let Rarray = [];
			if (returnRankOnly == true) return sortedRanks

			for (let i = 0; i < sortedRanks.length; i++) {
				Rarray.push(`**${i + 1}) <@${sortedRanks[i].id}> => ${roundPrecised(sortedRanks[i].level,1)}** `);
				i++;
				if (i % 25 == 0) {
					Pages.push(Rarray);
					Rarray = [];
				}
				i--;
			}
			if (Rarray.length > 0) {
				Pages.push(Rarray);
			}
			eventEmbed.setAuthor(`${event_name} | ${capital_letter(whatRank)} Leaderboard`)
				.setFooter(`Page ${page}/${Pages.length} | Chef ${issuer.tag}`, issuer.displayAvatarURL())
				.setDescription(`${Pages[page - 1].join("\n")}`);
			message.channel.send({ embeds: [eventEmbed] }).then(msg => {
				msg.react(`◀️`);
				msg.react(`▶️`).then(r => {

					const CollectingReactions = (reaction, user) => user.id === message.author.id;
					const gimmeReactions = msg.createReactionCollector({ CollectingReactions, time: 60000 });

					gimmeReactions.on('collect', r => {
						let user_emoji = r._emoji.name;

						switch (user_emoji) {
							case `◀️`:
								if (issuer.bot == false)
									msg.reactions.resolve(`◀️`).users.remove(message.author.id);
								if (page === 1)
									return;
								page--;
								eventEmbed.setDescription(`${Pages[page - 1].join("\n")}`)
									.setFooter(`Page ${page}/${Pages.length} | Chef ${issuer.username} at `);
								msg.edit({ embeds: [eventEmbed] });
								break;

							case `▶️`:
								if (issuer.bot == false)
									msg.reactions.resolve(`▶️`).users.remove(message.author.id);
								if (page === Pages.length)
									return;
								page++;
								eventEmbed.setDescription(`${Pages[page - 1].join("\n")}`)
									.setFooter(`Page ${page}/${Pages.length} | Chef ${issuer.username} at `);
								msg.edit({ embeds: [eventEmbed] });
								break;
						}
					});

					gimmeReactions.on('end', r => {
						msg.reactions.removeAll();
						console.log(`[Cooking event]: Removed all emojis from ${issuer.id} leader msg`);
					});
				});
			});
		}
		function rep(msg,mentionAuthor = false,embed,deleteAfter = false,timeout,delayed = '0') {
			let thismsg;
			if (embed) {
				if (delayed != '0') {
					setTimeout(() => {
						if (mentionAuthor) embed.description = `${issuer}, `+embed.description;
						thismsg = message.channel.send({embeds: [embed]})
					}, ms(delayed));
				  } else {
					  if (mentionAuthor) embed.description = `${issuer}, `+embed.description;
					  thismsg = message.channel.send({embeds: [embed]})
				  }
			} else {
				if (delayed != '0') {
					setTimeout(() => {
						if (mentionAuthor)
							thismsg = message.channel.send(`<@${issuer.id}>, `+msg)
						else
							thismsg = message.channel.send(msg)
					}, ms(delayed));
				  } else { 
					if (mentionAuthor)
						thismsg = message.channel.send(`<@${issuer.id}>, `+msg)
					else
						thismsg = message.channel.send(msg)
				  }
			}
			if (deleteAfter) {
			  setTimeout(() => {
				thismsg.then(m =>m.delete())
			  }, ms(timeout));
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
					console.log(guildUser.tag)
					if(issuer.id == id){
						giveBackUsername = `You (${guildUser.tag})`
					}else{
						giveBackUsername = `${guildUser.tag}`
					}
				}else{
					giveBackUsername = ` Ghost (Member Left)`
					console.log(`This member (${id}) doesn't exist, going next!`)
				}
				return giveBackUsername;
		}
		function create_new_uevent(msg, userID = issuer) {
			let useOther = false
			if (typeof(userID) != 'object') useOther = true
			
			console.log(`====================================\nI couldn't find ${useOther == false ? issuer.username : message.guild.members.cache.get(userID).user.username} (${useOther == false ? issuer.username : message.guild.members.cache.get(userID).user.id}) inventory on ${message.guild.name} (${message.guild.id}) so we create their inventory!\n=====================================`)
			cooking_players.create({
				userName: 	useOther == false ? issuer.username : message.guild.members.cache.get(userID).user.username,
				userID:     useOther == false ? issuer.id : message.guild.members.cache.get(userID).user.id,
				guild:      message.guild.id
			},(err3,res3) =>{
				if (err3) {
					sendError.create({
						Guild_Name: message.guild.name,
						Guild_ID: message.guild.id,
						User: issuer.tag,
						UserID: issuer.id,
						Error: err3,
						Time: `${TheDate} || ${clock} ${amORpm}`,
						Command: this.name+` trying to save new entry of user "${issuer.tag}" when using INV`,
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
				if (res3) 
					eventEmbed.setDescription(msg)
					return rep(null,false,eventEmbed);
			})
		}
		function getKeyByValue(object, value) {
			return Object.keys(object).find(key => object[key] === value);
		}
		function capital_letter(word) {
			return `${word.slice(0,1).toUpperCase()+word.slice(1)}`
		}
	}
	
};

function gather_new_ingredients(res2, gathered_ingredients, ingredients_lex_db, display_gathered_ingredients, ingredients_lex, eventEmbed, rep, logChannel, issuer,gathering_zone,info) {
	for (let i = 0; i < 3 + res2.rank; i++) {
		let ingredient_to_push = ingredients_db[gathering_zone][Math.floor(Math.random() * ingredients_db[gathering_zone].length)]
		// if (info) console.log(`${ingredients_lex_db[ingredient_to_push]}: ${ingredient_to_push}`)
		gathered_ingredients.push(ingredients_lex_db[ingredient_to_push]);
		display_gathered_ingredients.push(ingredients_lex[ingredient_to_push]);
	}

	eventEmbed.setDescription(`Thanks to your rank, you gathered ingredients for a total of **${3 + res2.rank}**:\n\`-\` **\`${display_gathered_ingredients.join(";\n- ")}\`**`);
	rep(null, null, eventEmbed);
	for (let i = 0; i < 3 + res2.rank; i++) {
		if (['water','milk','oil','strawberry_jam','blackberry_jam','chocolate_syrup','mirin','raspberry_jam','soy_sauce','sour_cream'].includes(gathered_ingredients[i])) {
			let amount = 100;
			if (['milk','oil'].includes(gathered_ingredients[i])) amount = 50;
			if (['strawberry_jam','blackberry_jam','chocolate_syrup','raspberry_jam'].includes(gathered_ingredients[i])) amount = 25;
			if (['soy_sauce','mirin'].includes(gathered_ingredients[i])) amount = 10;
			if (gathered_ingredients[i] == 'sour_cream') amount = 15;
			// if (info) console.log(`Amount for ${gathered_ingredients[i]}: ${amount}`)
			res2.inventory.ingredients[gathered_ingredients[i]]+= amount;
		} else res2.inventory.ingredients[gathered_ingredients[i]]++;
	}
	res2.cooldowns.gather = 180000+(res2.rank*60000) + Date.now()
	res2.save().catch(err3 => {
		console.log(err3);
		logChannel.send(`[Cooking]: Sadly an error happened while trying to save the new ingredients gathered for **${issuer.tag}** (${issuer.id}). Please notify my master!\nERR: ${err3.message}`);
	});
}

