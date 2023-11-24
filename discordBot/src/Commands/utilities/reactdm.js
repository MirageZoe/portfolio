/* eslint-disable no-unused-vars */
const reactMsgDocs = require('../../Models/mattjestic_models/react_to_msg');
const SharuruEmbed = require('../../Structures/SharuruEmbed');
const guildSettings = require("../../Models/GuildSettings")
const Command = require('../../Structures/Command.js');
const sendError = require('../../Models/Error');
const _ = require("lodash")
const fs = require('fs');
const ms = require('ms');
const { PermissionsBitField } = require('discord.js');


module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'reactdm',
			displaying: true,
			cooldown: 3000,
			description: 'Set messages to give details(in dm) when reacting to them!',
			options: `**ATTENTION: THE SLASHES ARE OBLIGATORY!**\n
			- \`switch\` => Switch the system on/off.
			- \`add <messageLink> | emoji:text | emoji: text | ...\` => Add the message where the bot will give text provided in dm when reacted with any emoji (or particular one if provided).
			\n- \`edit <messageLink> <enabled:yes/no> | <emoji: text> | <emoji:del>\` => Edit a message link. The available options: \`enabled(only yes/no), emojis:text & emoji:del\`. **ATTENTION: THIS \`|\` IS OBLIGATORY TO SEPARATE THE OPTIONS!**
			\n- \`rem <messageLink>\` => Removes the message (if exist in database).
			- \`reset\` => Deletes everything (full clean).
			- \`list\` => Shows all message links, enabled option(if can send dm), emojis & text `,
			usage: '',
			example: '',
			category: 'utilities',
			userPerms: [PermissionsBitField.Flags.SendMessages,PermissionsBitField.Flags.EmbedLinks,PermissionsBitField.Flags.AddReactions],
			SharuruPerms: [PermissionsBitField.Flags.SendMessages,PermissionsBitField.Flags.EmbedLinks,PermissionsBitField.Flags.AddReactions],
			args: true,
			guildOnly: true,
			ownerOnly: false,
			staffRoleOnly: false,
			roleDependable: '0', // not 0, either id or name
			allowTesters: false,
			aliases: ['in']
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
		let amORpm;
		if (hrs >= 0 && hrs <= 12) {
			amORpm = 'AM';
		} else {
			amORpm = 'PM';
		}

		const issuer = message.author;
		const tools = this.client.utils;
		const logChannel = message.guild.channels.cache.find(ch => ch.name == "sharuru-logs");
		const prefix = this.client.prefixes.get(message.guild.id);
		const cmdOptions = ['add','rem','reset','list','switch','edit','logs']
		const option = args[0]
		const source = args.join(" ").slice(3).split(/\|/g)

		let listPoints = new SharuruEmbed()
							.setColor(`LUMINOUS_VIVID_PINK`)
							.setAuthor(`React to DM!`)
							.setFooter(`Requested by ${issuer.tag}`)
		
		if (option == 't' && issuer.id == '186533323403689986') {
			let test = [
				{
					emoji: "1️⃣",
					text: "x"
				},
				{
					emoji: "2",
					text: "y"
				},
				{
					emoji: "3",
					text: "z"
				},
			]
			let str = "XYZ 123 ABC 456 ABC 789 ABC 789";
			console.log(str[str.indexOf("X")+1])
			return;
		}

		// wrong option
		if (cmdOptions.indexOf(option) == -1) {
			listPoints.setDescription(`I couldn't find this option. I know only \`${cmdOptions.join(", ")}\`!`)
			return rep(null,listPoints,true,'5.5s')
		}
		// add
		if (cmdOptions.indexOf(option) == 0) {
			let react_data = verificationLink(source)
			reactMsgDocs.findOne({
				mid: source[0].trim(),
				server: message.guild.id
			},async(err,res) =>{
				if (err) {
					sendError.create({
						Guild_Name: message.guild.name,
						Guild_ID: message.guild.id,
						User: issuer.tag,
						UserID: issuer.id,
						Error: err,
						Time: `${TheDate} || ${clock} ${amORpm}`,
						Command: this.name + " command - add option",
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
				// if found in db
				if (res) {
					console.log(`found db`)
					return rep(`this message link is already on my list. Please use the \`edit\` option to change the text and/or emojis!`,null, true, '4.5s');
				}
				// if not found, add
				if (!res) {
					console.log(`didn't found db`)
					reactMsgDocs.create({
						server: message.guild.id,
						mid: source[0].trim(),
						emojis_and_texts: react_data.et,
					},(err2,res2) =>{
						if (err2) {
							return logChannel.send(`[Info-command]: Unfortunately I couldn't process something and broke :(.\nERROR: ${err2.message}\n\`\`\`js\n${err2.stack.length > 1500 ? err2.stack.slice(0,1500) : err2.stack} + more lines...\`\`\``)
						}
						if (res2) {
							message.guild.channels.cache.get(react_data.channel).messages.fetch(react_data.msg).then(msg =>{
								for(const reaction of react_data.et) {
									msg.react(`${reaction.emoji}`)
									console.log(`added ${reaction.emoji}!`)
								}
							})
							listPoints.setDescription(`${issuer}, I have added the link of [this](${source[0]}) message to my list. Now every time they react with one of these emojis:\n- ${oneField(react_data.et,'emoji')}\nI'll dm them with the text!`)
							return rep(null,listPoints,true,'10s')
						}
					})
				}
			})
		}
		// rem
		if (cmdOptions.indexOf(option) == 1) {
			verificationLink(source)
			reactMsgDocs.findOne({
				mid: source[0],
				server: message.guild.id
			},async(err,res) =>{
				if (err) {
					sendError.create({
						Guild_Name: message.guild.name,
						Guild_ID: message.guild.id,
						User: issuer.tag,
						UserID: issuer.id,
						Error: err,
						Time: `${TheDate} || ${clock} ${amORpm}`,
						Command: this.name + " command - remove option",
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
				// if found in db
				if (res) {
					reactMsgDocs.deleteOne({
						mid: source[0],
						server: message.guild.id
					},(err2,res2) =>{
						if (err2) {
							sendError.create({
								Guild_Name: message.guild.name,
								Guild_ID: message.guild.id,
								User: issuer.tag,
								UserID: issuer.id,
								Error: err,
								Time: `${TheDate} || ${clock} ${amORpm}`,
								Command: this.name + " command - remove2 option",
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
						listPoints.setDescription(`I have deleted this message link from my list.`)
						if (res2) return rep(null,listPoints,true, '3.5s')
					})
				}
				if (!res) {//if not
					listPoints.setDescription(`I couldn't find this message link in my list... Please try again later after checking the message list!`)
					return rep(null,listPoints,true,'4.5s')
				}
			})
		}
		// reset
		if (cmdOptions.indexOf(option) == 2) {
			const res = reactMsgDocs.deleteMany({ server: message.guild.id },null,(err,res) => { 
				if (err) {
					console.log(err); 
					return logChannel.send(`[Sharuru-info command]: Unfortunately an error happened while trying to delete:\n${err.stack.length > 1500 ? err.stack.slice(0,1500) : err.stack}`)
				}
				if (res) console.log(res)
			})
			listPoints.setDescription(`I've deleted all message links from my list!`)
			return rep(null,listPoints,true,'5s')
		}
		// list 
		if (cmdOptions.indexOf(option) == 3) {
			if (args[1]) { // if they wanted 1 only
				reactMsgDocs.findOne({
					server: message.guild.id,
					mid: args[1]
				},(err,res) =>{
					if (err) {
						sendError.create({
							Guild_Name: message.guild.name,
							Guild_ID: message.guild.id,
							User: issuer.tag,
							UserID: issuer.id,
							Error: err,
							Time: `${TheDate} || ${clock} ${amORpm}`,
							Command: this.name + " command - list single",
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
						listPoints.setDescription(`**Link:** [Click here](${res.mid})\n**Enabled** *(can send msg)?:* ${res.enabled ? `Yes` : `No`}\n**Log reactions?:** ${res.logs ? `Yes` : `No`}\n**Emojis:**\n- ${oneField(res.emojis_and_texts,'emoji')}!\n**Texts:**\n- \`${oneField(res.emojis_and_texts,'text')}\``)
						message.channel.send({embeds: [listPoints]})
					}
					if (!res) {
						listPoints.setDescription(`There isn't any link message like that...`)
						return rep(null,listPoints,true,'5s')
					}
				})
			}
			if (!args[1]) { // if they wanted all
				reactMsgDocs.find({
					server: message.guild.id
				},async (err,res) =>{
					if (err) {
						sendError.create({
							Guild_Name: message.guild.name,
							Guild_ID: message.guild.id,
							User: issuer.tag,
							UserID: issuer.id,
							Error: err,
							Time: `${TheDate} || ${clock} ${amORpm}`,
							Command: this.name + " command - list",
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
						let page = 1;
						let pages = []
						let rarray = []
						let testCon = true;
						for (let i = 0; i < res.length; i++) {
							const element = res[i];
							if (testCon == true) {
								i++
							}
							if (i % 10 == 0) {
								pages.push(rarray);
								rarray = []
							}
							if (testCon == true) {
								i--
								testCon = false;
							}
							rarray.push(`${i+1})**Link:** [**Message #${i+1}**](${element.mid})\n**Enabled** (can send msg)**?:** ${res.enabled ? `Yes` : `No`}\n**Log reactions?:** ${res.logs ? `Yes` : `No`}\n**Emojis:**\n- ${oneField(element.emojis_and_texts,'emoji')}\n**Texts:**\n- ${oneField(element.emojis_and_texts,'text')}`)
						}
						if (rarray.length > 0) pages.push(rarray);
						let listPoints = new SharuruEmbed()
							.setColor(`LUMINOUS_VIVID_PINK`)
							.setAuthor(`React to DM!`)
							.setFooter(`Page ${page}/${pages.length} | Requested by ${issuer.tag}`)
							.setDescription(pages[page-1]?.length > 0 ? pages[page-1].join("\n") : `No message links added! Add the first one with \`${prefix}info add <messageLink> | emoji: text | emoji: text | ...\``)
						message.channel.send({embeds: [listPoints]}).then(async msg =>{
							if (pages[page-1]?.length > 0) {
								msg.react(`◀️`)
								msg.react("▶️")
								const filter = (reaction, user) => user.id == issuer.id;
								const myCollector = msg.createReactionCollector({filter, time: 60000})

								// start of magic
								await myCollector.on('collect', m =>{
									switch (m._emoji.name) {
										case "◀️":
											msg.reactions.resolve("◀️").users.remove(issuer.id)
											if(page == 1) return console.log(`limit reached`)
											if(page == 0) return console.log(`no member with over 1 point`)
											page--;
											listPoints.setDescription(pages[page-1]?.join("\n"))
											.setFooter(`Page ${page}/${pages.length} | Requested by ${issuer.tag} at `)
											msg.edit({embeds: [listPoints]})
											break;
										case "▶️":
											msg.reactions.resolve("▶️").users.remove(issuer.id)
											if(page == pages.length) return console.log(`limit reached`)
											if(page == 0) return console.log(`no member with over 1 point`)
											page++;
											listPoints.setDescription(pages[page-1]?.join("\n"))
											msg.edit({embeds: [listPoints]})
											break;
									}
								})
								// end of magic 
								myCollector.on('end', m=> msg.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error)))
							} else {
								console.log(`nothing.`)
							}
						})
					}
				})
			}
		}
		// switch
		if (cmdOptions.indexOf(option) == 4) {
			guildSettings.findOne({
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
						Command: this.name + " command - switch ",
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
					// console.log(res.systems.reactMsg.enabled)
					res.systems.reactMsg.enabled = !res.systems.reactMsg.enabled
					// console.log(res.systems.reactMsg.enabled)
					res.save().catch(err2 => console.log(err2))
					listPoints.setDescription(`I have **${res.systems.reactMsg.enabled ? `enabled` : `disabled`}** react message module!`)
					rep(null,listPoints,true,'3.5s')
				}
			})
		}
		// edit
		if (cmdOptions.indexOf(option) == 5) {
			reactMsgDocs.findOne({
				mid: args[1]
			},async (err,res)=>{
				if (err) {
					sendError.create({
						Guild_Name: message.guild.name,
						Guild_ID: message.guild.id,
						User: issuer.tag,
						UserID: issuer.id,
						Error: err,
						Time: `${TheDate} || ${clock} ${amORpm}`,
						Command: this.name + " command - edit ",
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
					let edit_options = {
						enabled: null,
						emojis_and_texts: [],
						logs: null,
						del: ``
					}
					const otherOptions = ['enabled','logs']
					let content = args.slice(2).join(" ").split(/\|/g)
					if (content.includes("")) {
						let index = content.indexOf("")
						content.splice(index,1)
					}
					for(const item of content){
						let element = item.trim();
						if (element.match(/<:.+?:\d+>/)) {
							console.log(`custom emoji`)
							let content2 = splitFromThisPoint(element,nthIndex(item,":",3))
							if (content2[0].match(/<:.+?:\d+>/)) content2[0] = content2[0].match(/\d/g).join("")
							let temp = {
								emoji: content2[0].trim(),
								text: content2[1].trim()
							}
							edit_options.emojis_and_texts.push(temp)
						} else if (otherOptions.includes(element.slice(0,element.indexOf(":")))){
							console.log(`options`)
							console.log(element)
							let getIndexDoubleDots = element.indexOf(":")
							let extractName = element.substring(0,getIndexDoubleDots)
							let extractValue = element.substring(getIndexDoubleDots+1)
							extractName = extractName.replace(/\s/g, '');
							extractValue = extractValue.trim()
				
							if(`${extractValue}`.includes(`no`) || `${extractValue}`.includes(`false`)) extractValue = false
							if(`${extractValue}`.includes(`yes`) || `${extractValue}`.includes(`true`)) extractValue = true
							edit_options[extractName] = extractValue 
						} else {
							console.log(`emoji:text`)
							let content3 = element.split(":")
							let temp = {
								emoji: content3[0].trim(),
								text: content3[1].trim()
							}
							edit_options.emojis_and_texts.push(temp)
						}
					}
					let report = `If everything well smoothly, you should see below changes:\n`
					if (edit_options['enabled'] == true || edit_options['enabled'] == false) {
						res.enabled = edit_options.enabled
						report +=`- Changed the message link to be ${edit_options.enabled ? `**enabled**`:`**disabled**`}.\n`
					}
					if (edit_options['emojis_and_texts']) {
						let old_temp = res.emojis_and_texts
						for(const item of edit_options.emojis_and_texts) {
							if (item.text == 'del') {// if del exist, delete it;
								console.log(`${item.emoji} is preparing for deletion, looking in db`)
								if (old_temp.find(i => i.emoji == item.emoji)) {
									let index = old_temp.findIndex(ob => ob.emoji == item.emoji)
									console.log(`found it!`+index)
									report += `\nRemoved \`${old_temp.find(i => i.emoji == item.emoji).emoji}\` emoji.`
									old_temp.splice(index,1);
								}
							} else if (!old_temp.find(i => i.emoji == item.emoji)) {// if doesn't exist, add
								old_temp.push(item);
								console.log(`added this `+item.emoji)
								report += `\nAdded ${item.emoji} with the text:\n${item.text}`
							} else if (old_temp.find(i => i.emoji == item.emoji)) {// if exist, replace text
								let index = old_temp.findIndex(ob => ob.emoji == item.emoji)
								report += `\nReplaced the text of \`${old_temp.find(i => i.emoji == item.emoji).emoji}\` emoji with:\n${item.text}`
								old_temp[index] = item
							}
						}
						console.log(old_temp)
						let results = await reactMsgDocs.updateOne({ mid: args[1] },{ $set: { emojis_and_texts: old_temp}})
						console.log(`Docs found: ${results.n}\nModified: ${results.nModified}\nOK: ${results.ok}\nUpserts: ${results.upserted}`)
					}
					if (edit_options['logs'] == true || edit_options['logs'] == false) {
						res.logs = edit_options.logs
						report +=`- Now each reaction will ${edit_options['logs'] ? `be` : `not be`} logged in #sharuru-logs!\n`
					}
					res.save().catch(err2 => console.log(err2))
					listPoints.setDescription(report)
					rep(null,listPoints,true,"30s")
				}
			})
		}
		// logs
		if (cmdOptions.indexOf(option) == 6) {
			guildSettings.findOne({
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
						Command: this.name + " command - log ",
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
					if (!res.systems.reactMsg.logs) res.systems.reactMsg.logs = false;
					res.systems.reactMsg.logs = !res.systems.reactMsg.logs
					listPoints.setDescription(`I'll now log each member what they choose and change!`)
					res.save().catch(err=>console.log(err))
					rep(null,listPoints,true,'3.5s')
				}
			})
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

		function oneField(arr,field){
			let temp = []
			if (field == 'text') {
				for (let item of arr) {
					if (item[field].length > 100) item[field] = item[field].slice(0,100)+" +"+item[field].slice(100).length+" more characters..."
					temp.push(item[field])
				}
			} else {
				let nr = ["1️⃣","2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "0️⃣"]
				for (const item of arr) {
					item[field].match(/\d/g) ? nr.includes(item[field]) ? temp.push(item[field]) : temp.push(`${message.guild.emojis.cache.get(item[field])}`) : temp.push(item[field])
				}
			}
			
			return temp.join("\n- ")
		}
		function nthIndex(str, pat, n){
			var L= str.length, i= -1;
			while(n-- && i++<L){
				i= str.indexOf(pat, i);
				if (i < 0) break;
			}
			return i;
		}
		function splitFromThisPoint(text,point) {
			let ret_arr = []
			ret_arr[0] = text.slice(0,point)
			ret_arr[1] = text.slice(point+1)
			return ret_arr	
		}
		function verificationLink(source) {
			//#region Get server data
			let msg_link = source[0].split('/')
			let data_arr = []
			let get_channel;
			let get_msg;
			
			get_channel = msg_link[msg_link.length-2]
			get_msg = msg_link[msg_link.length-1]
			//#endregion

			//#region Set the emoji & text data

			for (const item of source) {
				if (item != (source[0])) {
					let content = item.match(/<:.+?:\d+>/) ? splitFromThisPoint(item,nthIndex(item,":",3)) : item.split(":")
					if (content[0].match(/<:.+?:\d+>/)) content[0] = content[0].match(/\d/g).join("")
					let temp = {
						emoji: content[0].trim(),
						text: content[1].trim()
					}
					data_arr.push(temp)
				}
			}
			//#endregion
			
			//#region Validation Link phase
			if (!source[0].includes(`https://discord.com/channels/${message.guild.id}`)) return rep(`you forgot to mention a message link of this server!`,null,true,'3.5s')
			if (!get_channel) return rep(`your message link doesn't have a channel id!`,null,true,'3.5s')
			if (!get_msg) return rep(`your message link doesn't have a message id!`,null,true,'3.5s')
			if (!message.guild.channels.cache.get(get_channel)) return rep(`your message link is kinda broken... I couldn't find the channel included in your message link. Please try again making sure your channel exist or that I can see at least.`,null,true,'5.5s')
			if (message.guild.channels.cache.get(get_channel).messages.fetch(get_msg).then(msg => {return 200}, err => {console.log(err); return 404}) == 404) return rep(`your message link is kinda broken... I couldn't find the message included in your message link. Please try again.`,null,true,'3.5s')
			//#endregion
			let all_data = {
				channel: get_channel,
				msg: get_msg,
				et: data_arr
			};
			return all_data 
		}
	}

};
