/* eslint-disable no-unused-vars */
const Command = require('../../Structures/Command.js');
const sendError = require('../../Models/Error');
const guildsettings = require("../../Models/GuildSettings")
const SharuruEmbed = require('../../Structures/SharuruEmbed.js');
const emojiDocs = require('../../Models/emojiDocs.js');
const keygenerator = require('keygenerator')
const pms = require("pretty-ms");
const fs = require('fs');
const ms = require('ms');
const probe = require('probe-image-size');
const { PermissionsBitField } = require('discord.js');


module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'emoji',
			displaying: true,
			description: 'Manage who can use emoji and who cannot use them! Reward your members with roles that allow your members to use special emojis!',
			options: `
			- \`add\` => Starts making a new empty Emoji group. You simply have to follow the questions and you\'re done for now!
			- \`edit <id> -<option: name/enabled/everyone/time/members/roles>\` => Edits the emoji group. To edit an emoji, you will have to use \`emoji edit <id of group> emoji <id of emoji> <option: name, link, disabled> <new value to apply>\`. E.g: \`!emoji edit 0000000000 emoji 1 name test\` => this will edit the first emoji (1), changing it's name to "test".
			To add a new empty emoji block in the emoji list, type \`emoji edit <id of group> emoji add\`.
			To delete an emoji block from the emoji list, type \`emoji edit <id of group> emoji del <id of emoji>\`
			- \`remove <id>\` => Delete the emoji group.
			- \`list [id]\` => Gives a list with all available emojis. If you provide the id of a group, you will see it's information instead.`,
			usage: '',
			example: '',
			category: 'moderation',
			userPerms: [PermissionsBitField.Flags.UseExternalEmojis,PermissionsBitField.Flags.ManageEmojisAndStickers],
			SharuruPerms: [PermissionsBitField.Flags.UseExternalEmojis,PermissionsBitField.Flags.ManageEmojisAndStickers],
			args: false,
			guildOnly: true,
			ownerOnly: false,
			aliases: ['em']
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
		const logchannel = message.guild.channels.cache.find(ch => ch.name == 'sharuru-logs')
		const sharuru = this.client;
        let option = args[0];
		let randomID = `${message.guild.id.slice(-3)}${keygenerator.number({length:7})}`;
		let regex = /(http[s]?:\/\/.*\.(?:png|jpg|gif|jpeg))/gi;
		let acceptedTypes = ['jpg','jpeg','png','gif']
		let acceptedBooleans = ['yes','no','0','1','true','false']
		let acceptedTimeLetters = ['s','sec','m','min','h','hours','d','days']
		let questions = [
			`Provide a name for the group:`,
			// `Provide a link to the image (must be under 256kb in size and a direct link!):`,
			`Specify if this group should be enabled to use (yes/no)`,
			`Specify if this group can be used by everyone (yes/no):`,
			`Is the access to this group temporary? (after some time, they can't use the emoji in this group anymore):`,
		]
		let answers = {
			name: null,
			enabled: null,
			everyone: null,
			temp: null
		}

		if(args[0] == 't'){
			// let result = await probe(message.embeds[0]?.url);
			// console.log("size: "+result.length/1000+"KB")
			// if (args[1].match(/^[0-9]*$/gi)) console.log(`numbers`)
			let test = probe(message.embeds[0]?.url)
			console.log((await test).width)
			return;
		}
		let emojiEmbed = new SharuruEmbed()
			.setColor(`RANDOM`)
			.setFooter(`Changes done by ${issuer.tag} (${issuer.id}) at `)
			.setTimestamp()
			.setDescription(`I have made the next changes accordingly to what you provided me:`)
		

		guildsettings.findOne({
			ID: message.guild.id
		},async(errG,resG)=>{
			if (errG) {
				sendError.create({
					Guild_Name: message.guild.name,
					Guild_ID:  message.guild,
					User: issuer.tag,
					UserID: issuer.id,
					Error: errG,
					Time: `${TheDate} || ${clock} ${amORpm}`,
					Command: this.name +` command`,
					Args: args,
				},async (err, res) => {
					if(err) {
						console.log(err)
					}
					if(res) {
						logchannel.send(`An erorr happened while using the emoji command. Please try again later. If this persist, contact my partner and tell this: \`ERROR_#S3\`!`)
						return console.log(`successfully added error to database from mute system!`)    
					}
				})
			}
			if (resG) {
				if (resG.importantData.staffRole == `NOT_SET` || !resG.importantData.staffRole ) return messageReply(`please set up the staff role in \`settings\` command!`)
				if (!message.member.roles.cache.find(role => role.id == resG.importantData.staffRole)) {
					if (!option) {
						let memberEmbed = new SharuruEmbed()
							.setAuthor(`Available Emojis for you:`)
							.setFooter(`Requested by ${issuer.tag} |`)
							.setTimestamp()
							.setColor(`RANDOM`)
						emojiDocs.find({
							guildID: message.guild.id
						},async(err,res)=>{
							if (err) {
								sendError.create({
									Guild_Name: message.guild.name,
									Guild_ID:  message.guild,
									User: issuer.tag,
									UserID: issuer.id,
									Error: err,
									Time: `${TheDate} || ${clock} ${amORpm}`,
									Command: `emoji command - displaying emojis/no role`,
									Args: args,
								},async (err, res) => {
									if(err) {
										console.log(err)
									}
									if(res) {
										logchannel.send(`An erorr happened while using the emoji command. Please try again later. If this persist, contact my partner!`)
										console.log(`successfully added error to database from mute system!`)    
									}
								})
							}
							if (res) {
								if (res.length == 0) {
									return messageReply(`unfortunately there isn't any emoji pack available. Ask moderators/admins to add emoji packs to the server though ${this.client.user.name}!`)
								}
								let searches = 0;
								for(let i=0; i<res.length;i++) {
									let isMember = res[i].members.find(mem => mem.id == issuer.id);
									if (isMember || res[i].enabled == true && res[i].everyone == true) {
										if (res[i].emojiList.length == 0) continue;
										memberEmbed.addField(`Emoji pack "${res[i].name}":`,res[i].emojiList.map(i =>{
											if (i.disabled == false) return `- \`${i.name}\`;\n`;
										}),true);
										searches--;
									}
									searches++;
									if (searches == res.length) memberEmbed.setDescription(`Unfortunately you don't have any emoji pack to use. Ask moderators/admins what to do to get access to emoji packs!`)
								}
								console.log(`s: ${searches}`)
								console.log(`r: ${res.length}`)
								return messageReply(memberEmbed,0,true);
							}
							if (!res || res.length == 0) {
								return messageReply(`unfortunately there isn't any emoji pack available. Ask moderators/admins to add emoji packs to the server though ${this.client.user.name}!`)
							}
						})
					}
				}
				if (!option) return message.channel.send(`${issuer}, do not forget to use an option like: \`add, edit, remove or list\``)

				if (option.toLowerCase() == 'add') {
					let checkLoop = true;
					let a = 0;
					while(checkLoop && a < questions.length) {
						await message.channel.send(questions[a]).then(async (theQuestionSent) =>{
							let filter = m => m.author.id == issuer.id
							await message.channel.awaitMessages({filter,
								max:1,
								time:30000
							}).then(async (answersReceived)=>{
								let userInput = answersReceived.first()
		
								//if we want to exit in middle of the creation
								if (userInput.content == 'cancel' || userInput.content == 'stop') {
									checkLoop = false;
									return message.channel.send(`${issuer}, okay I stopped the creation of a new group. All data created so far was deleted.`)
								}
		
								//name
								if (a==0) {
									console.log(`got the name`)
									if(userInput.content.length < 4 || userInput.content.length > 30) return message.channel.send(`${issuer}, the name cannot be below 4 characters and above 30!`)
									answers.name = userInput.content;
								}
		
								//enabled
								if (a==1) {
									if(!acceptedBooleans.includes(userInput.content)) return message.channel.send(`${issuer}, I accept only \`yes/no\` for this option!`);
									console.log(`got the enabled`)
									answers.enabled = checkForItems(userInput.content,['true','yes','1','false','no','0'],'returnOne')
								}
		
								//everyone
								if (a==2) {
									if(!acceptedBooleans.includes(userInput.content)) return message.channel.send(`${issuer}, I accept only \`yes/no\` for this option!`);
									console.log(`got the everyone`)
									answers.everyone = checkForItems(userInput.content,['true','yes','1','false','no','0'],'returnOne')
								}
		
								//time
								if (a==3) {
									if (userInput.content != '0')
										if (checkForItems(userInput.content,acceptedTimeLetters,'includes') == false) return message.channel.send(`${issuer}, this option accepts only numbers and requires time letters such as: ${acceptedTimeLetters} etc etc.\n\nE.g: 1s,10min,1h,10d etc etc`)
									if (ms(userInput.content) < 0 || ms(userInput.content) > 7889400000 ) return message.channel.send(`${issuer}, you cannot set lower than 0 seconds and more than 90 days!`);
									console.log(`got the time`)
									answers.temp = ms(userInput.content)
								}
								try {
									deleteMsg(answersReceived.first(),30000)
									deleteMsg(theQuestionSent,30000)
								} catch (error) {
									console.log(`error here at deleting`)
									console.log(error)
								}
								a++
							})
						})
					}
					console.log(answers)
					if(checkLoop == false) return;
		
					emojiDocs.create({
						guildName: message.guild.name,
						guildID: message.guild.id,
						name: answers.name,
						id: randomID,
						enabled: answers.enabled,
						everyone: answers.everyone,
						temporary: answers.temp,
					},(err,res)=>{
						if (err) {
							sendError.create({
								Guild_Name: message.guild.name,
								Guild_ID:  message.guild.id,
								User: issuer.tag,
								UserID: issuer.id,
								Error: err,
								Time: `${TheDate} || ${clock} ${amORpm}`,
								Command: `emoji - add create option`,
								Args: args,
							},async (err, res) => {
								if(err) {
									console.log(err)
									return logchannel.send(`Unfortunately an error happened while trying to save error report in db for emoji command, create group section! Please contact my partner!`)
								}
								if(res) {
									console.log(`successfully added error to database from messageReactionAdd event!`)    
								}
							})
							return logchannel.send(`Unfortunately an error appeared while trying to save this group. If this persist please tell my partner about it! Error: ${err.message}`)
						}
						if(res) {
							return message.channel.send(`${issuer}, I have created sucessfully ${answers.name} group! To edit it use ${prefix}emoji edit ${randomID} -<option>:<new value> -<option 2>:<new value 2> etc etc`)
						}
					})
				}
				
				if (option.toLowerCase() == 'edit') {
					//!em edit GROUPID emoji EMOJIID editWhat newValue
					//!em edit 2021998439 emoji 1 name test
					let newEmojiOptions = new Map();
					if(!args[2]) return message.channel.send(`${issuer}, this is how to use the edit command on a group:
					\n\`${prefix}emoji edit <group id> -<option= name/enabled/everyone/time/members/roles: new value here> -<option2= name/enabled/everyone/time/members/roles: new value here 2>\`
					E.g: \`${prefix}emoji edit 000000000 -name: First Group!\` => This will change the name of the emoji group with id 000000000 to "First Group"
					\n\nAnd this is how you edit an emoji of a group:
					\n\`${prefix}emoji edit <group id> emoji <id of emoji> <option: name/link/disabled> <new value>\`
					E.g: \`${prefix}emoji edit 000000123 emoji 123000000 name bestemoji\` => this will change the emoji with id 123000000 from emoji group 000000123 to have the name "bestemoji"!
					\n*P.S: Emoji names cannot contain space.*\n*P.S.2: To get all info about a group and it's emoji, please type \`${prefix}emoji list\`*`)
					let emojiOptions = args.slice(2).join(" ").split('-')
					let changeMsg = ``
					emojiDocs.findOne({
						id: args[1]
					},async(err,res)=>{
						if (err) {
							sendError.create({
								Guild_Name: message.guild.name,
								Guild_ID:  message.guild.id,
								User: issuer.tag,
								UserID: issuer.id,
								Error: err,
								Time: `${TheDate} || ${clock} ${amORpm}`,
								Command: `emoji - edit option`,
								Args: args,
							},async (err, res) => {
								if(err) {
									console.log(err)
									return logchannel.send(`Unfortunately an error happened while trying to save error report in db for emoji command, create group section! Please contact my partner!`)
								}
								if(res) {
									console.log(`successfully added error to database from messageReactionAdd event!`)    
								}
							})
							return logchannel.send(`Unfortunately an error appeared while trying to save this group. If this persist please tell my partner about it! Error: ${err.message}`)
						}
						if(res) {
							for(let groupOption in emojiOptions){
								let element = emojiOptions[groupOption];
								let getIndexDoubleDots = element.indexOf(":")
								let extractName = element.substring(0,getIndexDoubleDots)//.trim()
								let extractValue = element.substring(getIndexDoubleDots+1).trim()
		
								extractName = extractName.replace(/\s/g, '');
								// console.log(`we have=> ${extractName} : ${extractValue}`)
								if (extractName.includes("roles")) {
									extractValue = extractValue.replace(/<@&/gi,'').trim()
									extractValue = extractValue.replace(/>/gi,'').trim()
								}
								if (extractName.includes("members")) {
									extractValue = extractValue.replace(/<@&/gi,'').trim()
									extractValue = extractValue.replace(/>/gi,'').trim()
								}
								newEmojiOptions.set(extractName,extractValue)  
							}
		
							console.log(newEmojiOptions)
							if (args[2] == 'emoji') {
								if (args[3] == 'add') {
									let randomID_emoji = `${args[1].slice(-3)}${keygenerator.number({length:7})}`;
		
									let emojiObject = {
										id: randomID_emoji,
										name: null,
										link: null,
										disabled: false,
									}
									let newEmojiList = res.emojiList;
									newEmojiList.push(emojiObject)
									emojiDocs.updateOne({
										'id': `${args[1]}`
									},{'$set':{ 'emojiList' : newEmojiList}},(erro,reso)=>{
										if (erro) {
											sendError.create({
												Guild_Name: message.guild.name,
												Guild_ID: message.guild.id,
												User: issuer.tag,
												UserID: issuer.id,
												Error: erro,
												Time: `${TheDate} || ${clock} ${amORpm}`,
												Command: this.name + `, emoji edit-add subcommand`,
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
									return message.channel.send(`${issuer}, I have added a new empty emoji in this group. It's id is: ${randomID_emoji}. Use \`${prefix}em edit ${args[1]} emoji ${randomID_emoji}\` to edit the emoji options!`)
								}
								if (args[3] == 'del') {
									let newEmojiList = res.emojiList;
									let findIdexToRemove = newEmojiList.find(item => item.id == args[4])
									if(!findIdexToRemove) return message.channel.send(`I couldn't find this emoji with id \`${args[4]}\`!`)
									let getIndex = newEmojiList.findIndex(r=> r.id === args[4]);
									let emojiINFO = newEmojiList[getIndex];
									newEmojiList.splice(getIndex,1);
									emojiDocs.updateOne({
										'id': `${args[1]}`
									},{'$set':{ 'emojiList' : newEmojiList}},(erro,reso)=>{
										if (erro) {
											sendError.create({
												Guild_Name: message.guild.name,
												Guild_ID: message.guild.id,
												User: issuer.tag,
												UserID: issuer.id,
												Error: erro,
												Time: `${TheDate} || ${clock} ${amORpm}`,
												Command: this.name + `, emoji delete subcommand`,
												Args: args,
											},async (errr, ress) => {
												if(errr) {
													console.log(errr)
													return message.channel.send(`Unfortunately an problem appeared in emoji command - delete option. Please try again later. If this problem persist, contact my partner!`)
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
									return message.channel.send(`${issuer}, I have removed emoji "\`${emojiINFO.name}\`"!`)
								}
		
		
								let findMyEmojiByID = res.emojiList.find(em => em.id == args[3]);
								let getIndexEMID = res.emojiList.findIndex(r=> r.id === args[3]);
								if (findMyEmojiByID == undefined || findMyEmojiByID == null) return message.channel.send(`${issuer}, I couldn't find that emoji in my list!`);
		
								let editWhat = args[4];
								let newValue = args[5];
								console.log(newValue)
								if (!editWhat) return message.channel.send(`${issuer}, didn't you forget to mention what you wanna edit?`)
								if (!newValue) return message.channel.send(`${issuer}, you forgot to say what you will replace ${editWhat} with.`)
								if (editWhat.toLowerCase() == 'name') {
									if (newValue.length < 1 || newValue.length > 32) return message.channel.send(`${issuer}, the name of the emoji cannot have less than 1 character or more than 32 characters!`);
									// findMyEmojiByID.name = newValue;
									message.channel.send(`${issuer}, I have set the name of the emoji!`)
									emojiDocs.updateOne({
										'emojiList.id': `${res.emojiList[getIndexEMID].id}`
									},{'$set':{ 'emojiList.$.name' : newValue}},(erro,reso)=>{
										if (erro) {
											sendError.create({
												Guild_Name: message.guild.name,
												Guild_ID: message.guild.id,
												User: issuer.tag,
												UserID: issuer.id,
												Error: erro,
												Time: `${TheDate} || ${clock} ${amORpm}`,
												Command: this.name + `, emoji edit name subcommand`,
												Args: args,
											},async (errr, ress) => {
												if(errr) {
													console.log(errr)
													return message.channel.send(`Unfortunately an problem appeared in emoji command - edit name sub-option. Please try again later. If this problem persist, contact my partner!`)
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
								if (editWhat.toLowerCase() == 'link') {
									// console.log(message.embeds[0]?.url)
									if (newValue.length < 7 || newValue.length > 100) return message.channel.send(`${issuer}, the link of the emoji cannot have less than 7 character or more than 100 characters!`);
									try {
										if (!message.embeds[0]?.url || !newValue) return message.channel.send(`${issuer}, you didn't provided a link!`)
										let result = await probe(message.embeds[0]?.url || newValue);
										if (sizeMatters(result.length).amount > 256) {
											checkLoop = false;
											return message.channel.send(`${issuer}, your image must be under 256kb! The image you provided has ${sizeMatters(result.length,true)}!`)
										}
										if (!acceptedTypes.includes(result.type)) {
											checkLoop = false;
											return message.channel.send(`${issuer}, your image isn't a supported type! *(I only support: ${acceptedTypes})*`)
										}
										if (result.width > 70 && result.wUnits == 'px' || result.height > 70 && result.hUnits == 'px') {
											return message.channel.send(`${issuer}, your image size is above 70px. resize it to be below that if you want it to be accepted. Ideally it would be 64x64 px.`)
										}

										if (message.embeds[0]?.url != null || message.embeds[0]?.url != undefined) {
											// findMyEmojiByID.link = message.embeds[0]?.url;
											message.channel.send(`${issuer}, I have set the image of the emoji!`)
											emojiDocs.updateOne({
												'emojiList.id': `${res.emojiList[getIndexEMID].id}`
											},{'$set':{ 'emojiList.$.link' : message.embeds[0]?.url}},(erro,reso)=>{
												if (erro) {
													sendError.create({
														Guild_Name: message.guild.name,
														Guild_ID: message.guild.id,
														User: issuer.tag,
														UserID: issuer.id,
														Error: erro,
														Time: `${TheDate} || ${clock} ${amORpm}`,
														Command: this.name + `, emoji edit link subcommand`,
														Args: args,
													},async (errr, ress) => {
														if(errr) {
															console.log(errr)
															return message.channel.send(`Unfortunately an problem appeared in emoji edit link sub-option. Please try again later. If this problem persist, contact my partner!`)
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
										
									} catch (error) {
										console.log(error)
										return message.channel.send(`${issuer}, unfortunately an error appeared while processing your url link. Please try again later. If this persist, please contact my partner!`)
									}
								}
								if (editWhat.toLowerCase() == 'disabled') {
									if(!acceptedBooleans.includes(newValue.toLowerCase())) return message.channel.send(`${issuer}, I accept only \`yes/no\` for this option!`);
									console.log(`got the disabled/enabled of emoji ${findMyEmojiByID.name}`)
									// findMyEmojiByID.disabled = checkForItems(newValue.toLowerCase(),['true','yes','1','false','no','0'],'returnOne')
									message.channel.send(`${issuer}, I have set this emoji to be *${findMyEmojiByID.disabled ? 'enabled' : 'disabled'}*`)
									emojiDocs.updateOne({
										'emojiList.id': `${res.emojiList[getIndexEMID].id}`
									},{'$set':{ 'emojiList.$.disabled' : checkForItems(newValue.toLowerCase(),['true','yes','1','false','no','0'],'returnOne')}},(erro,reso)=>{
										if (erro) {
											sendError.create({
												Guild_Name: message.guild.name,
												Guild_ID: message.guild.id,
												User: issuer.tag,
												UserID: issuer.id,
												Error: erro,
												Time: `${TheDate} || ${clock} ${amORpm}`,
												Command: this.name + `, emoji edit disable sub-option`,
												Args: args,
											},async (errr, ress) => {
												if(errr) {
													console.log(errr)
													return message.channel.send(`Unfortunately an problem appeared in emoji edit disable sub-option. Please try again later. If this problem persist, contact my partner!`)
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
								return console.log(`done editing emoji only`);
							}
		
							if (newEmojiOptions.get('name')) {
								let namae = newEmojiOptions.get('name');
								if (namae.length < 4 || namae.length > 30) return message.channel.send(`${issuer}, the name cannot be below 4 characters and above 30!`)
								res.name = namae;
								changeMsg += `- Changed the name of the group \`${args[1]}\` to "**${namae}**"`
							}
		
							if (newEmojiOptions.get('enabled')) {
								console.log(`found enabled`)
								if (!acceptedBooleans.includes(newEmojiOptions.get('enabled'))) return message.channel.send(`${issuer}, I accept only \`yes/no\` for this option!`);
								res.enabled = checkForItems(newEmojiOptions.get('enabled').toLowerCase(),['true','yes','1','false','no','0'],'returnOne');
								changeMsg += `- Changed the group ID: \`${args[1]}\` to be "**${newEmojiOptions.get('enabled') ? `enabled` : `disabled`}**" to use!`
							}
		
							if (newEmojiOptions.get('everyone')) {
								console.log(`found everyone`)
								if (!acceptedBooleans.includes(newEmojiOptions.get('enabled'))) return message.channel.send(`${issuer}, I accept only \`yes/no\` for this option!`);
								res.everyone = newEmojiOptions.get('everyone');
								changeMsg += `- Changed the group ID: \`${args[1]}\` to be "**${newEmojiOptions.get('enabled') ? `available` : `unavailable`}**" for everyone!`
		
							}
		
							if (newEmojiOptions.get('time')) {
								console.log(`found time`)
								if (newEmojiOptions.get('time') != '0')
									if (checkForItems(newEmojiOptions.get('time'),acceptedTimeLetters,'includes') == false) return message.channel.send(`${issuer}, this option accepts only numbers and requires time letters such as: ${acceptedTimeLetters} etc etc.\n\nE.g: 1s,10min,1h,10d etc etc`)
								if (ms(newEmojiOptions.get('time')) < 0 || ms(newEmojiOptions.get('time')) > 7889400000 ) return message.channel.send(`${issuer}, you cannot set lower than 0 seconds and more than 90 days!`);
								res.temporary = ms(newEmojiOptions.get('time'))
								console.log("time got for temp: "+newEmojiOptions.get('time'))
								changeMsg += `- Changed the group ID: \`${args[1]}\` to remain ${ms(newEmojiOptions.get('time')) > 0 ? `for **${pms(ms(newEmojiOptions.get('time')),{verbose: true})}**` : `**unlimited**`} to people!`
								await message.channel.send(`Do you want to update the existent members and roles to have access for **${pms(ms(newEmojiOptions.get('time')),{verbose: true})}** as well? If you choose no, they will still have the previous amount of time to the emoji group! *(if it was unlimited before, it will still remain unlimited if you choose no.)*`).then(async msg =>{
									let filter = m => m.author.id == issuer.id
									await message.channel.awaitMessages({filter,time: 15000, max: 1}).then(msgAnswer =>{
										let myAnswer = msgAnswer.first().content;
										if (myAnswer.toLowerCase() == 'yes') {
											let newMembers = res.members
											let newRoles = res.roles
											for(let memb of newMembers) {
												memb.time = String(Date.now() + Number(res.temporary))
											}
											for(let role of newRoles) {
												role.time = String(Date.now() + Number(res.temporary))
											}
											console.log(newMembers)
											emojiDocs.updateOne({
												'id': `${args[1]}`
											},{'$set':{ 'members' : newMembers}},(erro,reso)=>{
												if (erro) {
													sendError.create({
														Guild_Name: message.guild.name,
														Guild_ID: message.guild.id,
														User: issuer.tag,
														UserID: issuer.id,
														Error: erro,
														Time: `${TheDate} || ${clock} ${amORpm}`,
														Command: this.name + `, emoji edit time subcommand`,
														Args: args,
													},async (errr, ress) => {
														if(errr) {
															console.log(errr)
															return message.channel.send(`Unfortunately an problem appeared in emoji edit time subcommand. Please try again later. If this problem persist, contact my partner!`)
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
											emojiDocs.updateOne({
												'id': `${args[1]}`
											},{'$set':{ 'roles' : newRoles}},(erro,reso)=>{
												if (erro) {
													sendError.create({
														Guild_Name: message.guild.name,
														Guild_ID: message.guild.id,
														User: issuer.tag,
														UserID: issuer.id,
														Error: erro,
														Time: `${TheDate} || ${clock} ${amORpm}`,
														Command: this.name + `, emoji edit subcommand`,
														Args: args,
													},async (errr, ress) => {
														if(errr) {
															console.log(errr)
															return message.channel.send(`Unfortunately an problem appeared emoji edit time subcommand. Please try again later. If this problem persist, contact my partner!`)
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
											message.channel.send(`Done! I have updated **${res.members.length} members** and **${res.roles.length} roles**. They should lose access on ${this.client.utils.convertTime(Date.now()+Number(res.temporary))}`)
										}
									}).catch(err =>{
										console.log(err)
										message.channel.send(`Either this is an error or you didn't answer in time frame of 15 seconds, I have decided to take it as a 'no'.`)
									})
								})
							}
		
							//to continue: to make the temporary feature, right now edited only when to add members, need tested then continued to remove if temporrary from mute system and also from message event
							if (newEmojiOptions.get('members')) {
								console.log(`found members`)
								let currentMembers = res.members;
								let membersMentioned = message.mentions.users.map(item => item.id);
								let changes = ``
								let changes2 = ``
		
								if (membersMentioned.length == 0) return messageReply(`please mention at least 1 member!! If the member was added already, it will be removed and vice versa!`,issuer,false);
		
								for (const user of membersMentioned) {
									if(!currentMembers.some(r => r.id.includes(user))){
										let uobj = {
											id: user,
											time: "0"
										}
										if (res.temporary > 0) uobj.time = String(Date.now() + Number(res.temporary))
										
										currentMembers.push(uobj)
										changes += `- <@${user}>.\n`
									} else {
										let getIndex = currentMembers.findIndex(index => index.id === user);
										currentMembers.splice(getIndex,1)
										changes2 += `- <@${user}>.\n`
									}
								}
								res.members = currentMembers
								emojiEmbed.addFields([
									{name: `Added the following member(s):`,value: changes.length > 0 ? changes : `No Changes made.`,inline: true},
									{name: `Removed the following member(s):`,value: changes2.length > 0 ? changes2 : `No Changes made.`,inline: true},
									{name: `Current member(s):`,value: currentMembers.length > 0 ? currentMembers.map(item => item = `<@${item.id}>`) : `Currently no member added!`}
								])
							}
		
							if (newEmojiOptions.get('roles')) {
								console.log(`found roles`)
								let currentRoles = res.roles;
								let rolesMentioned = message.mentions.roles.map(item => item.id);
								let changes = ``
								let changes2 = ``
		
								if (rolesMentioned.length == 0) return message.channel.send(`please mention at least 1 role!! If the role was added already, it will be removed and vice versa!`);
		
								for (const role of rolesMentioned) {
									if(!currentRoles.some(r => r.id.includes(role))){
										let robj = {
											id: role,
											time: "0"
										}
										if (res.temporary > 0) robj.time = String(Date.now() + Number(res.temporary));
										
										currentRoles.push(robj);
										changes += `- <@&${role}>.\n`
									} else {
										let getIndex = currentRoles.findIndex(index => index.id === role);
										currentRoles.splice(getIndex,1)
										changes2 += `- <@&${role}>.\n`
									}
								}
								res.roles = currentRoles
								emojiEmbed.addFields([
									{name: `Added the following role(s):`,value: changes.length > 0 ? changes : `No Changes made.`,inline: true},
									{name: `Removed the following role(s):`,value: changes2.length > 0 ? changes2 : `No Changes made.`,inline: true},
									{name: `Current role(s):`,value: currentRoles.length > 0 ? currentRoles.map(item => item = `<@&${item.id}>`) : `Currently no role added!`}
								])
							}
							res.save().catch(err=> console.log(err));
							if(changeMsg.length > 0){
								message.channel.send(`I have done the following(s):\n${changeMsg}`)
							}
							if(newEmojiOptions.get('roles') || newEmojiOptions.get('members')) {
								message.channel.send({embeds: [emojiEmbed] })
							}
							return 
						}
					})
				}
				
				if (option.toLowerCase() == 'remove') {
					if (!args[1]) return messageReply(`you forgot to provide an id of an emoji group!`,issuer)
					emojiDocs.findOneAndDelete({id: args[1]},(err,res)=>{
						if (err) {
							sendError.create({
								Guild_Name: message.guild.name,
								Guild_ID:  message.guild.id,
								User: issuer.tag,
								UserID: issuer.id,
								Error: err,
								Time: `${TheDate} || ${clock} ${amORpm}`,
								Command: `emoji - remove option`,
								Args: args,
							},async (err, res) => {
								if(err) {
									console.log(err)
									return logchannel.send(`Unfortunately an error happened while trying to save error report in db for emoji command, create group section! Please contact my partner!`)
								}
								if(res) {
									console.log(`successfully added error to database from messageReactionAdd event!`)    
								}
							})
							return logchannel.send(`Unfortunately an error appeared while trying to save this group. If this persist please tell my partner about it! Error: ${err.message}`)
						}
						if (!res) {
							return message.channel.send(`I couldn't find that emoji group with id \`${args[1]}\`!`)
						}
						if (res) {
							return message.channel.send(`I have deleted that emoji group with id \`${args[1]}\`!`)
						}
					})
				}
				
				if (option.toLowerCase() == 'list') {
					emojiDocs.find({
						guildID: message.guild.id
					},async(erro,res)=>{
						if (erro) {
							sendError.create({
								Guild_Name: message.guild.name,
								Guild_ID: message.guild.id,
								User: issuer.tag,
								UserID: issuer.id,
								Error: erro,
								Time: `${TheDate} || ${clock} ${amORpm}`,
								Command: this.name + `, emoji list subcommand`,
								Args: args,
							},async (errr, ress) => {
								if(errr) {
									console.log(errr)
									return message.channel.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
								}
								if(ress) {
									console.log(`successfully added error to database!`)
								}
							})
							return;
						}
						if (res) {
							if (args[1]) {
								for(let doc in res) {
									let thisDoc = res[doc];
									if (thisDoc.id == args[1]) {
										let detailedEmbed = new SharuruEmbed()
											.setAuthor(`Detailed Info about "${thisDoc.name}"!`)
											.setFooter(`Requested by ${issuer.tag} (${issuer.id}) at `)
											.setTimestamp()
											.setColor(`RANDOM`)
											.addFields([
												{name: `Is enabled to use?`, value: thisDoc.enabled ? `Yes` : `No`, inline: false},
												{name: `Is available to everyone?`, value: thisDoc.everyone ? `Yes` : `No`, inline: false},
												{name: `Is this group of emojis temporary?`, value: thisDoc.temporary > 0 ? `Yes, it will last for ${pms(Number(thisDoc.temporary))}` : `No`, inline: false},
												{name: `Emojis:`, value: thisDoc.emojiList.length > 0 ? thisDoc.emojiList.map(item => `- **\`ID\`**: ${item.id} | **\`Name\`**: ${item.name} | **\`Disabled?\`**: ${item.disabled ? `Yes`:`No`} | Link: ${item.link ? item.link : "Not set yet."}`).join("\n") : `Nothing to display`, inline: false},
												{name: `Members that can use this group of emojis:`, value: thisDoc.members.length > 0 ? thisDoc.members.map(item => `- <@${item.id}>`).join("\n") : `Nothing to display`, inline: false},
												{name: `Roles that can use this group of emojis:`, value: thisDoc.roles.length > 0 ? thisDoc.roles.map(item => `- <@&${item.id}>`).join("\n") : `Nothing to display`, inline: false},
											])
										await message.channel.send({embeds: [detailedEmbed] })
										return console.log(`found`)
									}
									if (thisDoc.id != args[1] && doc == res.length-1) {
										return message.channel.send(`I couldn't find the Emoji group with the id \`${args[1]}\`!`)
									}
								}
								return console.log(`done with detailed group`);
							}
							let emList = `No Emoji groups created so far!`;
							if(res.length >= 1) {
								emList = ``
								for(let doc of res){
									emList += `- ${doc.name} (${doc.id})\n`
								}
							}
								
							let emEmbed = new SharuruEmbed()
								.setColor(`RANDOM`)
								.setFooter(`Requested by ${issuer.tag} (${issuer.id}) at `,)
								.setTimestamp()
								.setAuthor(`Emoji groups available for ${message.guild.name}`,issuer.displayAvatarURL({dynamic: true}))
								.setDescription(emList)
								
							await message.channel.send({embeds: [emEmbed] })
							return console.log(`done emoji list embed`)
							// to do: make Happy transform what people type from emoji to actual emoji
						}
					})
				}

				if (option.toLowerCase() == '-a') {
					let memberEmbed = new SharuruEmbed()
						.setAuthor(`Available Emojis for you:`)
						.setFooter(`Requested by ${issuer.tag} |`)
						.setTimestamp()
						.setColor(`RANDOM`)
					emojiDocs.find({
						guildID: message.guild.id
					},async(err,res)=>{
						if (err) {
							sendError.create({
								Guild_Name: message.guild.name,
								Guild_ID:  message.guild,
								User: issuer.tag,
								UserID: issuer.id,
								Error: err,
								Time: `${TheDate} || ${clock} ${amORpm}`,
								Command: `emoji command - displaying emojis`,
								Args: args,
							},async (err, res) => {
								if(err) {
									console.log(err)
								}
								if(res) {
									logchannel.send(`An erorr happened while using the emoji command. Please try again later. If this persist, contact my partner!`)
									console.log(`successfully added error to database from mute system!`)    
								}
							})
						}
						if (res) {
							if (res.length == 0) {
								return messageReply(`unfortunately there isn't any emoji pack available. Ask moderators/admins to add emoji packs to the server though ${this.client.user.name}!`)
							}
							let searches = 0;
							for(let i=0; i<res.length;i++) {
								let isMember = res[i].members.find(mem => mem.id == issuer.id);
								if (isMember || res[i].enabled == true && res[i].everyone == true) {
									if (res[i].emojiList.length == 0) continue; 
									memberEmbed.addField(`Emoji pack "${res[i].name}":`,res[i].emojiList.map(i =>{
										if (i.disabled == false) return `- \`${i.name}\`;`;
									}).join("\n"),true);
									searches--;
								}
								searches++;
								if (searches == res.length) memberEmbed.setDescription(`Unfortunately you don't have any emoji pack to use. Ask moderators/admins what to do to get access to emoji packs!`)
							}
							console.log(`s: ${searches}`)
							console.log(`r: ${res.length}`)
							return messageReply(memberEmbed,0,true);
						}
						if (!res || res.length == 0) {
							return messageReply(`unfortunately there isn't any emoji pack available. Ask moderators/admins to add emoji packs to the server though ${this.client.user.name}!`)
						}
					})
				}
		
				if (option.toLowerCase() == 'clear') {
					// ex: !em clear <id> <members/roles/emojis> [-e]
					let clearInvalid = false;
					let clearOption = ['members','roles','emojis']
					if (!args[1]) return messageReply(`you need to specify the emoji group you wanna clear!`)
					if (!args[1].match(/^[0-9]*$/gi)) return messageReply(`I accept only numbers!`);
					if (!args[2]) return messageReply(`you need to specify what you want to clear: \`members, roles or emojis\`!\n\nAlso if you want to clear only members or roles that are not anymore in the server, please add \`-e\` after members/roles option:\n\`${prefix}emoji clear <id> <members/roles> -e\``)
					if (checkForItems(args[2],clearOption,'includes') == false) return messageReply(`you have not specified a valid option from: \`${clearOption.join(', ')}\``)
					
					if (args[3] == '-e' || args[2] == '-E') clearInvalid = true;
					console.log(`invalid?: ${clearInvalid}`)
					if (args[2] == 'members') {
						let invalidMembers = ``;
						emojiDocs.findOne({
							id: args[1]
						},async(err,res)=>{
							if (err) {
								sendError.create({
									Guild_Name: message.guild.name,
									Guild_ID:  message.guild.id,
									User: issuer.tag,
									UserID: issuer.id,
									Error: err,
									Time: `${TheDate} || ${clock} ${amORpm}`,
									Command: `emoji - clear members option`,
									Args: args,
								},async (err, res) => {
									if(err) {
										console.log(err)
										return logchannel.send(`Unfortunately an error happened while trying to save error report in db for emoji command, create group section! Please contact my partner!`)
									}
									if(res) {
										console.log(`successfully added error to database from messageReactionAdd event!`)    
									}
								})
								return logchannel.send(`Unfortunately an error appeared while trying to save this group. If this persist please tell my partner about it! Error: ${err.message}`)
							}
							if (res) {
								if(clearInvalid == true) {
									let modifyData = res.members;
									let i = res.members.length-1;
									if(res.members.length == 0) return messageReply(`there are no members added to this group!`)
									while(i >= 0) {
										if (message.guild.members.cache.get(modifyData[i].id) == undefined) {
											invalidMembers += `- <@${modifyData[i].id}>\n`;
											modifyData.splice(i,1);
										}
										i--;
									}
									res.members = modifyData
									if (invalidMembers.length > 0) messageReply(`I have cleared the following ex-members of the \`${res.name}\` group:\n${invalidMembers}`)
									if (invalidMembers.length == 0) messageReply(`I didn't clear anything since all members are available in the guild.`)
									res.save().catch(err => console.log(err))
									return;
								}
								if(clearInvalid == false) {
									res.members = []
									messageReply(`I have cleared the members list of the \`${res.name}\` group.`)
									res.save().catch(err => console.log(err));
									return;
								}
							}
							if (!res) return messageReply(`sadly there isn't such a group!`)
						})
					}
					if (args[2] == 'roles') {
						let invalidRoles = ``;
						emojiDocs.findOne({
							id: args[1]
						},async(err,res)=>{
							if (err) {
								sendError.create({
									Guild_Name: message.guild.name,
									Guild_ID:  message.guild.id,
									User: issuer.tag,
									UserID: issuer.id,
									Error: err,
									Time: `${TheDate} || ${clock} ${amORpm}`,
									Command: `emoji - clear roles option`,
									Args: args,
								},async (err, res) => {
									if(err) {
										console.log(err)
										return logchannel.send(`Unfortunately an error happened while trying to save error report in db for emoji command, create group section! Please contact my partner!`)
									}
									if(res) {
										console.log(`successfully added error to database from messageReactionAdd event!`)    
									}
								})
								return logchannel.send(`Unfortunately an error appeared while trying to save this group. If this persist please tell my partner about it! Error: ${err.message}`)
							}
							if (res) {
								if(clearInvalid == true) {
									let modifyData = res.roles;
									let i = modifyData.length-1;
									if(modifyData.length == 0) return messageReply(`there are no roles added to this group!`)
									while(i >= 0) {
										if (message.guild.roles.cache.get(modifyData[i].id) == undefined) {
											invalidRoles += `- <@${modifyData[i].id}>\n`;
											modifyData.splice(i,1);
										}
										i--;
									}
									res.roles = modifyData
									if (invalidRoles.length > 0) messageReply(`I have cleared the following ex-roles of the \`${res.name}\` group:\n${invalidRoles}`)
									if (invalidRoles.length == 0) messageReply(`I didn't clear anything since all roles are available in the guild.`)
									res.save().catch(err => console.log(err))
									return;
								}
								if(clearInvalid == false) {
									res.roles = []
									messageReply(`I have cleared the roles list of the \`${res.name}\` group.`)
									res.save().catch(err => console.log(err));
									return;
								}
							}
							if (!res) return messageReply(`sadly there isn't such a group!`)
						})
					}
					if (args[2] == 'emojis') {
						emojiDocs.findOne({
							id: args[1]
						},async(err,res)=>{
							if (err) {
								sendError.create({
									Guild_Name: message.guild.name,
									Guild_ID:  message.guild.id,
									User: issuer.tag,
									UserID: issuer.id,
									Error: err,
									Time: `${TheDate} || ${clock} ${amORpm}`,
									Command: `emoji - clear emojis option`,
									Args: args,
								},async (err, res) => {
									if(err) {
										console.log(err)
										return logchannel.send(`Unfortunately an error happened while trying to save error report in db for emoji command, create group section! Please contact my partner!`)
									}
									if(res) {
										console.log(`successfully added error to database from messageReactionAdd event!`)    
									}
								})
								return logchannel.send(`Unfortunately an error appeared while trying to save this group. If this persist please tell my partner about it! Error: ${err.message}`)
							}
							if (res) {
								res.emojiList = []
								messageReply(`I have cleared the emojis of the \`${res.name}\` group.`)
								res.save().catch(err => console.log(err));
								return;
							}
							if (!res) return messageReply(`sadly there isn't such a group!`)
						})
					}
				}
			}
		})

		function reverseString (str){
			let splitString = str.split("");
			// console.log(splitString)
			let reverseArray = splitString.reverse();
			// console.log(reverseArray)
			let joinArray = reverseArray.join("");
			// console.log(joinArray)
			return joinArray;
		}
		function deleteMsg(msg,timeout) {
			setTimeout(async () => {
				await msg.delete()
			}, timeout);
		}
		/**
		 * 
		 * @param {Number} bytes The size of the file in bytes
		 * @param {Boolean} readable If true, returns a readable string.
		 * @returns An object that contains the unit of the size and it's amount converted to the highest possible value.
		 */
		function sizeMatters(bytes,readable) {
			let kilobytes = bytes/1000;
			let megabytes = kilobytes/1000;
			let gigabytes = megabytes/1000;
			let terabytes = gigabytes/1000;
			let sizeData = {
				amount: kilobytes,
				type: 'Kb (Kilobytes'
			}
			if(kilobytes > 1024) {
				sizeData.amount = megabytes;
				sizeData.type = 'Mb (Megabytes)'
			}
			if(megabytes > 1024) {
				sizeData.amount = gigabytes;
				sizeData.type = 'Gb (Gigabytes)'
			}
			if(gigabytes > 1024) {
				sizeData.amount = terabytes;
				sizeData.type = 'Tb (Terabytes)'
			}
			if(readable == true) return sizeData.amount + sizeData.type;
			return sizeData;
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
		function messageReply(msg,author,embed) {
			if(embed == true) {
				return message.channel.send({embeds: [msg]});
			}
			if(!author) author = issuer;
			message.channel.send(`${author}, ${msg}`)
		}
	}

};
