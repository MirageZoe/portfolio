/* eslint-disable no-unused-vars */
const SharuruEmbed = require('../../Structures/SharuruEmbed');
const Command = require('../../Structures/Command.js');
const scoreDocs = require('../../Models/systemPoints');
const sendError = require('../../Models/Error');
const { PermissionsBitField, Colors } = require("discord.js")
const _ = require("lodash")
const fs = require('fs');
const ms = require('ms');
const excel = require("exceljs");

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'score',
			displaying: true,
			cooldown: 3000,
			description: 'A simple points system to keep track.',
			options: `
			- \`add <@member> [points: 1-20]\` => Add an amount of points to the said member. Adds 1 point if no points provided. 
			- \`rem <@member> [points: 1-20]\` => Removes an amount of points from the said member. Removes 1 point if no points provided.
			- \`reset\` => Resets the points of everyone to 0.
			- \`list [ex]\` => Shows everyone and their respective points (if they have at least 1).\nThis command has a sub-option: \`ex\` which is optional and will export an excel list to download for later use.`,
			usage: '',
			example: '',
			category: 'utilities',
			userPerms: [PermissionsBitField.Flags.SendMessages],
			SharuruPerms: [PermissionsBitField.Flags.SendMessages],
			args: true,
			guildOnly: true,
			ownerOnly: false,
			staffRoleOnly: true,
			roleDependable: '0', // not 0, either id or name
			allowTesters: false,
			aliases: ['sp','points']
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
		const cmdOptions = ['add','rem','reset','list']
		const option = args[0]
		let pointsToAdd = args[2] ?? 1;
		let memberS = message.mentions.users.length > 0 ? message.mentions.users.first() : args[1] == 'ex' ? `` : args[1];
		if (memberS) memberS = memberS.match(/\d+/g)[0]

		// wrong option
		if (cmdOptions.indexOf(option) == -1) return rep(`I couldn't find this option. I know only \`add, rem, reset & list\`!`)

		// add
		if (cmdOptions.indexOf(option) == 0) {
			console.log(memberS);
			if (memberS == undefined || memberS == null) return rep(`you forgot to mention a member or id!`,null,true,'3.5s')
			scoreDocs.findOne({
				uid: memberS,
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
					try {
						res.points += Number(pointsToAdd);
						res.save().catch(err => console.log(err))
						return rep(`I have successfully added **${pointsToAdd}** points to <@${memberS}>!`,null,true,'3.5s')
					} catch (err2) {
						console.log(err2)
						return logChannel.send(`[Points System]: Unfortunately an error happened while trying to add points to this member [${memberS}] in my database.\nERROR: ${err2.message}\n\`\`\`js\n${err2.stack.length > 1500 ? err2.stack.slice(0,1500) : err2.stack} + more lines...\`\`\``)
					}
				}
				if (!res) {
					console.log(`didn't found db`)
					scoreDocs.create({
						uid: memberS,
						points: pointsToAdd,
						server: message.guild.id
					},(err2,res2) =>{
						if (err2) {
							return logChannel.send(`[Points System]: Unfortunately an error happened while trying to save this member [${memberS}] in my database.\nERROR: ${err2.message}\n\`\`\`js\n${err2.stack.length > 1500 ? err2.stack.slice(0,1500) : err2.stack} + more lines...\`\`\``)
						}
						if (res2) {
							message.channel.send(`${issuer}, I have successfully added **${pointsToAdd}** points to <@${memberS}>!`,null,true,'3.5s')
						}
					})
				}
			})
		}
		// rem
		if (cmdOptions.indexOf(option) == 1) {
			console.log(memberS);
			if (memberS == undefined || memberS == null) return rep(`you forgot to mention a member or id!`,null,true,'3.5s')
			scoreDocs.findOne({
				uid: memberS,
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
				// if found in db
				if (res) {
					try {
						if (res.points > 0) {
							res.points -= pointsToAdd;
							if (res.points < 0) res.points = 0;
							res.save().catch(err => console.log(err))
							return rep(`I have successfully removed **${pointsToAdd}** points from <@${memberS}>!`,null,true,'3.5s')
						}
						return rep(`I can't substract points from this member, <@${memberS}>, because they have 0 points!`,null,true,'3.5s')
					} catch (err2) {
						return logChannel.send(`[Points System]: Unfortunately an error happened while trying to remove points from this member [<@${memberS}>] in my database.\nERROR: ${err2.message}\n\`\`\`js\n${err2.stack.length > 1500 ? err2.stack.slice(0,1500) : err2.stack} + more lines...\`\`\``)
					}
				}
				if (!res) {//if not
					return rep(`this member, <@${memberS}>, doesn't have any points to substract from & they are not yet added in my database!`,null,true,'3.5s')
				}
			})
		}
		// reset
		if (cmdOptions.indexOf(option) == 2) {
			const res = scoreDocs.updateMany({ server: message.guild.id },{ points: 0});
			rep(`I've reset the points of everyone to 0!`)
		}
		// list 
		if (cmdOptions.indexOf(option) == 3) {
			let sub_option = args[1]
			scoreDocs.find({
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
					let test = res.sort((a,b) => b.points - a.points)

					if (sub_option == 'ex') { // if want an excel file
						//#region Setting up the excel file + collumns
						const workbook = new excel.Workbook();
						workbook.creator = "Sharuru/Yue"
						workbook.lastModifiedBy = "Sharuru/Yue"
						workbook.created = new Date()
						workbook.views = [
							{
							x: 0, y: 0, width: 10000, height: 20000,
							firstSheet: 0, activeTab: 1, visibility: 'visible'
							}
						]
						const page_sheet = workbook.addWorksheet("Event Points List",{
							headerFooter:{firstHeader: `Event Points List`, firstFooter: `Server: ${message.guild.name}`}
						});
						page_sheet.columns = [
							{ header: "Member Name", key: 'id', width: 32},
							{ header: "Points", key: "points", width: 10}
						]

						// setting the bold attribute
						page_sheet.getRow(1).getCell(1).font = { bold: true}
						page_sheet.getRow(1).getCell(2).font = { bold: true}

						// alightment of the server
						page_sheet.getRow(1).getCell(3).alignment = {vertical: 'middle', horizontal: 'center'}
						page_sheet.getRow(2).getCell(3).alignment = {vertical: 'middle', horizontal: 'center'}

						// merging for name of the server
						page_sheet.mergeCells("C1:E1")
						page_sheet.mergeCells("C2:E2")

						// setting up the name of the server
						page_sheet.getRow(1).getCell(3).value = `From server:`
						page_sheet.getRow(2).getCell(3).value = message.guild.name

						//#endregion

						//#region Writing the members down & sending
						let nr = 1
						for (let i = 0; i < test.length; i++) {
							page_sheet.getRow(nr+1).getCell(1).value = message.guild.members.cache.get(test[i].uid).user.username
							page_sheet.getRow(nr+1).getCell(2).value = test[i].points;
							nr++;
						}
						await workbook.xlsx.writeFile(`src/Assets/temp/${message.guild.name} - psl.xlsx`)
						let excelList = new SharuruEmbed()
							.setColor(Colors.LuminousVividPink)
							.setAuthor({name: `Points System: List of members (excel mode)!`})
							.setFooter({text: ` Requested by ${issuer.tag}`})
							.setDescription(`Above you will have an excel file to download where you can view all members that are available in database.`)
						console.log("done")
						await message.channel.send({embeds: [excelList], files: [{attachment: `./src/Assets/temp/${message.guild.name} - psl.xlsx`}]})
						//#endregion
						
					} else { // if want to see on discord
						let page = 1;
						let pages = []
						let rarray = []
						let testCon = true;
						for (let i = 0; i < test.length; i++) {
							const element = test[i];
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
							if (element?.points > 0) rarray.push(`${i+1}) <@${element.uid}> : **${element.points}**`)
						}
						if (rarray.length > 0) pages.push(rarray);
						let listPoints = new SharuruEmbed()
							.setColor(Colors.LuminousVividPink)
							.setAuthor({name: `Points System: List of members with at least 1 point!`})
							.setFooter({text: `Page ${page}/${pages.length} | Requested by ${issuer.tag}`})
							.setDescription(pages[page-1]?.length > 0 ? pages[page-1].join("\n") : "No member has over 1 point!")
						message.channel.send({embeds: [listPoints]}).then(async msg =>{
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
										.setFooter({text: `Page ${page}/${pages.length} | Requested by ${issuer.tag} at `})
										msg.edit({embeds: [listPoints]})
										break;
									case "▶️":
										msg.reactions.resolve("▶️").users.remove(issuer.id)
										if(page == pages.length) return console.log(`limit reached`)
										if(page == 0) return console.log(`no member with over 1 point`)
										page++;
										listPoints.setDescription(pages[page-1]?.join("\n"))
										.setFooter({text: `Page ${page}/${pages.length} | Requested by ${issuer.tag} at `})
										msg.edit({embeds: [listPoints]})
										break;
								}
							})
							// end of magic 
							myCollector.on('end', m=> msg.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error)))
						})
					}
				}
			})
		}

		// excel cmd
		// if (cmdOptions.indexOf(option) == 4) {
			
		// }
		
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
	}

};
