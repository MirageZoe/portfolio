const fs = require('fs');
const path = require('path');
const toml = require('toml');
const ms = require("ms")
const pms = require("pretty-ms");
const mongoose = require("mongoose");
const { createCanvas, Image } = require("canvas")
const concat = require('concat-stream');
const cfg = require("../../../config.json");
const sendError = require("../../Models/Error");
const Event = require('../../Structures/Event');
const warnSystem = require('../../Models/warns');
const profileSys = require("../../Models/profiles");
const GuildSettings = require('../../Models/GuildSettings');
const SharuruEmbed = require("../../Structures/SharuruEmbed");
const { PermissionsBitField, Colors, AttachmentBuilder } = require('discord.js');
const emojiDocs = require('../../Models/emojiDocs');
const config = require('../../../config.json');
const halloweenDoc = require('../../Models/events/halloween/halloween_queue');
const halloween_players = require('../../Models/events/halloween/halloween_players');
const imgProcessing = require("probe-image-size")
mongoose.connect("mongodb://127.0.0.1:27017/myDatabase",{
    //"auth": the_db,
    //"user": "user",
    //"pass": "pass", 
    useNewUrlParser: true,
    useUnifiedTopology: true
},(err) =>{
	if (err) console.log(`\n\n[Sharuru]: AN ERROR HAPPENED WHILE TRYING TO CONNECT TO THE SERVER!!!\N${err}\n\n`)
	else console.log(`[Sharuru]: I've successfully connected to the database server!`)
})

module.exports = class extends Event {

	async run(message) {
		
		let clock = new Date();
		let ss = String(clock.getSeconds()).padStart(2, '0');
		let min = String(clock.getMinutes()).padStart(2, '0');
		let hrs = String(clock.getHours()).padStart(1, '0');
		clock = `${hrs}:${min}:${ss}`;

		let TheDate = new Date();
		let zilelesaptamanii = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
		let weekday = zilelesaptamanii[TheDate.getDay()];
		let dd = String(TheDate.getDate()).padStart(2, '0');
		let mon = String(TheDate.getMonth() + 1);
		let year = String(TheDate.getFullYear()).padStart(4, '00');
		TheDate = `${weekday}, ${mon}/${dd}/${year}`;
		let amORpm;
		if (hrs >= 0 && hrs <= 12) {
			amORpm = 'AM';
		} else {
			amORpm = 'PM';
        }

		if(message.guild.id == '747572401344217241') return 
		if(message.guild.id == '139817651391299584') return 
		function SimpleJsonToToml(object) {
            let toString = JSON.stringify(object);
            toString = toString.replace(/(^\{+|\}+$)/gi,'')
            // toString = toString.replace(/"/gi,'')
            toString = toString.replace(/:/gi,' = ')
            toString = toString.replace(/,/gi,'\n')
            // console.log(`done:`)
            // console.log(toString)
            return toString
        }
		function randomIntervalGenerator(min, max) { // min and max included 
			return Math.floor(Math.random() * (max - min + 1) + min);
		};
		function range(low,hi){
			function rangeRec(low, hi, vals) {
			   if(low > hi) return vals;
			   vals.push(low);
			   return rangeRec(low+1,hi,vals);
			}
			return rangeRec(low,hi,[]);
		};
		function shuffle(o) {
			for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
			return o;
		};
        // console.log(`\n\nTHIS IS A POSSIBLE MISS-EVENT!!!\n\n`)
		// console.log(message.content)
        // console.log(`\n\nTHIS IS A POSSIBLE MISS-EVENT!!!\n\n`)
        if (message.channel.type == 'DM') return console.log(`No dm events accepted for now! Possible triggered by roleMenu event (min/max roles multi mode)\nChannel Recipient: ${message.channel.recipient.username} (${message.channel.recipient.id})\nAuthor: ${message.author.username} (${message.author.id})\nContent: ${message.content}`)
		
		const logs = message.guild.channels.cache.find(ch=> ch.name === "sharuru-logs");
		const svlog = this.client.guilds.cache.get(`437201749246476290`).channels.cache.find(ch => ch.name === 'sharuru-logs');
		let cmdObJ = null
		let globalCooldown = 5000
		const issuer = message.author;
		let mypath = path.join(__dirname,'../../Assets/minData.toml');
		let minDataOBJ = null;
		const tools = this.client.utils
		const sharuru = this.client;
		const dateAndHour = TheDate + " | " + clock + " " + amORpm;

		fs.createReadStream(mypath,'utf8').pipe(concat((data)=>{
			minDataOBJ = toml.parse(data);
		}));
		// setTimeout(() => {
			await GuildSettings.findOne({
				ID: message.guild.id
			},async (err,res)=>{
				if (err) {
					sendError.create({
						Guild_Name: message.guild.name,
						Guild_ID: message.guild.id,
						User: issuer.tag,
						UserID: issuer.id,
						Error: err,
						Time: `${TheDate} || ${clock} ${amORpm}`,
						Command: this.name,
						Args: message.content,
					},async (err, ress) => {
						if(err) {
							console.log(err)
							return message.channel.send(`Unfortunately an problem appeared while processing a message from chat. Please try again later. If this problem persist, contact my partner!`)
						}
						if(ress) {
							console.log(`successfully added error to database!`)
						}
					})
				}

				const mentionRegex = RegExp(`^<@!?${this.client.user.id}>$`);
				const mentionRegexPrefix = RegExp(`^<@!?${this.client.user.id}> `);

				if (message.author.bot) return; // !message.guild  ||
				if (message.content.match(mentionRegex)) message.channel.send(`My prefix is \`${res.prefix}\`.`); //this.client.prefix instead of 
				if (res) {
					const prefix = message.content.match(mentionRegexPrefix) ? message.content.match(mentionRegexPrefix)[0] : res.prefix;

					//events - Halloween
					if (res.events.halloween.enabled == true) {
						let favo = message.content.slice(prefix.length,message.content.indexOf(" "))
						let [cmnam, ...myArgs] = message.content.slice(prefix.length).trim().split(/ +/g);
						const cardCode = myArgs.slice(0).join(" "); 
						console.log(`[Halloween event]\nfav: ${cmnam}\nthe args:`,myArgs)
						halloweenDoc.findOneAndDelete({//andDelete
							server: message.guild.id,
							code: cardCode,
							fav: favo
						},async(err2,res2)=>{
							if (err2) {
								sendError.create({
									Guild_Name: message.guild.name,
									Guild_ID: message.guild.id,
									User: issuer.tag,
									UserID: issuer.id,
									Error: err2,
									Time: `${TheDate} || ${clock} ${amORpm}`,
									Command: this.name + ' halloween event',
									Args: message.content,
								},async (err, ress) => {
									if(err) {
										console.log(err)
										return message.channel.send(`Unfortunately an problem appeared while processing a message from chat. Please try again later. If this problem persist, contact my partner!`)
									}
									if(ress) {
										console.log(`successfully added error to database!`)
									}
								})
							}
							if (res2) {
								if (res2.expireAt < Date.now())
								{
									const expiredEmbed = new SharuruEmbed()
										.setColor(Colors.Orange)
										.setAuthor({name: `Happy Halloween!`})
										.setDescription(`Sadly this soul left a while ago but a mirage of their appearance remained behind! Think of greeting them faster next time! The older, the less patient is the soul!`)
									message.channel.send({embeds: [expiredEmbed]})
									let testm = await message.channel.messages.fetch(res2.message.id)
									testm.delete()
									return;
								}
								let linkToMsg = res2.message.link.split(/\//gi)
								message.guild.channels.cache.get(linkToMsg[linkToMsg.length-2]).messages.fetch(linkToMsg[linkToMsg.length-1]).then(msg =>{

									
									// console.log(msg)	
									// return console.log(msg.embeds[0])
									// msg.embeds[0].description = `As a thank you for your kindness, ${issuer} received **${res2.points} candies!** **Also they received: ${res2.name}**!`
									// msg.embeds[0].author.name = `Happy Halloween`
									// msg.embeds[0].footer.text = `This was a(n) ${res2.points == 1 ? "common" : res2.points == 2 ? 'uncommon' : res2.points == 3 ? 'rare' : 'collection'} soul! Credits to the Artist: ${res2.artist}`
									let newEmbed = new SharuruEmbed()
										.setFooter({text: `This was a(n) ${res2.points == 1 || res2.points == -1 ? "common" : res2.points == 2 || res2.points == -2 ? 'uncommon' : res2.points == 3 || res2.points == -3 ? 'rare' : 'collection'} soul! Credits to the Artist: ${res2.artist}`})
										.setAuthor({name: `Happy Halloween!`})
										.setColor(msg.embeds[0].color)
									if (res2.points > 0)//it's a good soul so give and tell them
									{
										const originalPic = fs.readFileSync(path.join(__dirname+`../../../Assets/events/halloween/${res2.cardDisplayDataPath.rarity}/${res2.cardDisplayDataPath.fullname}`))
                						const originalPicAttachment = new AttachmentBuilder(originalPic,{name: "image.png"})
										newEmbed.setDescription(`As a thank you for your kindness, ${issuer} received **${res2.points} candies!** **Also they received: ${res2.name}**!`)
										.setImage(`attachment://image.png`)
										msg.edit({embeds: [newEmbed],files: [originalPicAttachment]})

									} 
									else // bad soul
									{
										newEmbed.setDescription(`Awch, seems like that was a bad soul that likes to trick people to greet them and steal their candies! ${issuer} lost **${res2.points*-1} candies!**`)

										// first check if it exist the 'evil" version, otherwise create it and save
										const searchInverted = fs.existsSync(path.join(__dirname+`../../../Assets/events/halloween/evil/${res2.cardDisplayDataPath.rarity}/${res2.cardDisplayDataPath.fullname}`)) 
										if (!searchInverted)
										{
											console.log(`[Halloween Event | ${TheDate} | ${clock} ${amORpm}]: Creating a new 'evil' version of ${res2.cardDisplayDataPath.fullname} & saving on disk...`)
											
											const tempImg = fs.readFileSync(path.join(__dirname+`../../../Assets/events/halloween/${res2.cardDisplayDataPath.rarity}/${res2.cardDisplayDataPath.fullname}`)) 
											const tempImgData = imgProcessing.sync(tempImg)

											const imgObjectHolder = new Image()
											imgObjectHolder.src = tempImg
											
											const canvasInverted = createCanvas(tempImgData.width,tempImgData.height)
											const ctx = canvasInverted.getContext("2d");
											
											ctx.drawImage(imgObjectHolder,0,0)
											const imgData = ctx.getImageData(0,0,tempImgData.width,tempImgData.height)
											
											for(let i = 0; i < imgData.data.length; i += 4)
											{
												imgData.data[i] = 255-imgData.data[i];
												imgData.data[i+1] = 255-imgData.data[i+1];
												imgData.data[i+2] = 255-imgData.data[i+2];
												imgData.data[i+3] = 255;
											}
											ctx.putImageData(imgData,0,0)

											// Write the image to file & upload as attachment for discord
											const buffer = canvasInverted.toBuffer("image/png");
											fs.writeFileSync(path.join(__dirname+`../../../Assets/events/halloween/evil/${res2.cardDisplayDataPath.rarity}/${res2.cardDisplayDataPath.fullname}`), buffer);
											const invertedImg = new AttachmentBuilder(buffer,{name: "image.png"})
											newEmbed.setImage(`attachment://image.png`)
											msg.edit({embeds: [newEmbed],files: [invertedImg]})
										} else {// if the evil version exists already, upload.
											console.log(`[Halloween Event | ${TheDate} | ${clock} ${amORpm}]: Evil soul already existing, using this instance...`)
											const loadEvilSoulImg = fs.readFileSync(path.join(__dirname+`../../../Assets/events/halloween/evil/${res2.cardDisplayDataPath.rarity}/${res2.cardDisplayDataPath.fullname}`))
											const evilSoulAttachment = new AttachmentBuilder(loadEvilSoulImg,{name: "image.png"})
											newEmbed.setImage(`attachment://image.png`)
											msg.edit({embeds: [newEmbed],files: [evilSoulAttachment]})
										}
									}
										// msg.removeAttachments()
										// console.log(`[Halloween Event]: after edit:`)
										// console.log(newEmbed)
									halloween_players.findOne({
										userID: issuer.id,
										guild: message.guild.id
									},async (err3,res3)=>{
										if (err3) {
											sendError.create({
												Guild_Name: message.guild.name,
												Guild_ID: message.guild.id,
												User: issuer.tag,
												UserID: issuer.id,
												Error: err3,
												Time: `${TheDate} || ${clock} ${amORpm}`,
												Command: this.name + ' halloween event - haloplayers',
												Args: message.content,
											},async (err, ress) => {
												if(err) {
													console.log(err)
													return message.channel.send(`Unfortunately an problem appeared while processing a message from chat. Please try again later. If this problem persist, contact my partner!`)
												}
												if(ress) {
													console.log(`successfully added error to database!`)
												}
											})
										}
										if (res3) {
											// res3.points += res2.points;
											let old_inv = res3.inventory
											if (res2.points > 0)
											{
												let findThisItem = old_inv.find(item => item.name.trim() == res2.name.trim())
												if(findThisItem) {
													findThisItem.amount++;
													console.log(`[Halloween Event | ${TheDate} | ${clock} ${amORpm}]: Found @${issuer.username} inventory & updated bcs they owned "${res2.name}" already!`)
												}
												else {
													console.log(`[Halloween Event | ${TheDate} | ${clock} ${amORpm}]: Found @${issuer.username} inventory & they got a new card: "${res2.name}"`)
													let newSoul = {
														name: res2.name.trim(),
														amount: 1,
														rarity: res2.points == 1 ? "common" : res2.points == 2 ? 'uncommon' : res2.points == 3 ? 'rare' : 'collection'
													}
													old_inv.push(newSoul)
												}
											}
											await halloween_players.updateOne({ userID: issuer.id, guild: message.guild.id },{ $set: { inventory: old_inv}, $inc: { points: res2.points }})
											console.log(`[Halloween Event | ${TheDate} | ${clock} ${amORpm}]: Updated entry for @${issuer.username} in ${message.guild.name} (${message.guild.id}) with "${res2.name.trim()}" ${res2.points}`)
										} else {
											console.log(`[Halloween Event | ${TheDate} | ${clock} ${amORpm}]: Created profile as it's their first time playing for @${issuer.username} in ${message.guild.name} (${message.guild.id}) with "${res2.name}" ${res2.points}`)
											halloween_players.create({
												userName:   issuer.username,
												userID:     issuer.id,
												guild:      message.guild.id,
												points:     res2.points,
												inventory:  [{name: res2.name, amount: res2.points > 0 ? 1 : -1}],
											})
										}
										const responseHallo = new SharuruEmbed()
												.setAuthor({name: `Halloween Event!`})
												.setColor(Colors.Orange)
												.setDescription(`Congratulations to ${issuer}! They greeted first the soul: **${res2.name.trim()}**!`)
											rep(responseHallo,'15s')
									})
								})
							}
						})
					}

					//blacklist system
					if (res.systems.blacklistWord.mode == true){
						let badWord = false;
						let protectedWord = false;
						let isUserProtected = res.systems.blacklistWord.protected.people.includes(issuer.id) ? true : false;
						let isUserRoleProtected = message.member.roles.cache.some(r => res.systems.blacklistWord.protected.roles.includes(r.id)) ? true : false;
						let bannedWordList = [];
						let protectedWordList = [];
						let wordsToRemove = [];

						//#region check if the word is banned/protected
						for (let i in res.systems.blacklistWord.words){
							if(message.content.toLowerCase().includes(res.systems.blacklistWord.words[i]) && !bannedWordList.includes(res.systems.blacklistWord.words[i])){
								badWord = true;
								bannedWordList.push(res.systems.blacklistWord.words[i]);
							}
						}
						for (let i in res.systems.blacklistWord.protected.words) {
							if(message.content.toLowerCase().includes(res.systems.blacklistWord.protected.words[i]) && !protectedWordList.includes(res.systems.blacklistWord.protected.words[i])){
								protectedWord = true;
								protectedWordList.push(res.systems.blacklistWord.protected.words[i]);
							}
						}
						//#endregion
						
						//#region if it's me, don't remove it :P 
						if(cfg.owners.includes(issuer.id) || message.member.permissions.has(PermissionsBitField.Flags.Administrator))
							// console.log(`${issuer.tag} (${issuer.id}) is my master. No one tell my master what to do!`)
							badWord = false;
						//#endregion

						// if user has bad words and it's not protected (the user itself or the role owned).
						if(badWord && !(isUserRoleProtected || isUserProtected)){
							let diffBannedWords = false;

							// this regex gets the whole word that either starts, contains or ends with the group of "theWord"
							//let theReg = new RegExp(`\\S+${theWord}|(\\S+${theWord}+\\S+)|${theWord}\\S+|${theWord}`,"g")
							
							
							// if there is at least 1 protected word
							if (protectedWord) {
								// compare if the length of bad words are exactly the same as protected words
								console.log(`[Sharuru-word System]: user used protected words.\nBW: "${bannedWordList.join(", ")}"\nPW: "${protectedWordList.join(", ")}"`)

								// check if the user used protected version of banned words to hide the banned words used
								let protectedWordsUsed = protectedWordList.join(" "); 
								for (let i = 0; i < bannedWordList.length; i++) {
									// console.log(`checking ${bannedWordList[i]}`)
									if (!protectedWordsUsed.includes(bannedWordList[i])) {
										diffBannedWords = true;
									} else {
										wordsToRemove.push(bannedWordList[i])
									}
								}
							} else diffBannedWords = true
							// console.log(diffBannedWords,bannedWordList,wordsToRemove)
							if (!diffBannedWords) return;

							for (let i = 0; i < protectedWordList.length; i++) {
								let indexEl = bannedWordList.findIndex(item => item == wordsToRemove[i])
								console.log(`Index of ${wordsToRemove[i]} is ${indexEl}`)
								if (indexEl != -1)
									bannedWordList.splice(indexEl,1)
							}
							
							//#region delete message and send notification in logs channel
							let WordFilterEmbed = new SharuruEmbed()   
								.setAuthor(`[Word System] Deleted a message!`,this.client.user.displayAvatarURL())
								.setThumbnail(message.author.displayAvatarURL())
								// .setDescription(`
								// Member:\n**${issuer.tag}**\n\n
								// Banned words:\n**${bannedWordList.join(" | ")}**\n\n
								// Protected words:
								// In channel:\n${message.channel}\n\n
								// Message:\n\n***${message.content}***`)
								.addFields([
									{name: `Member:`,value: `${issuer}\n(${issuer.tag} | ${issuer.id})`},
									{name: `Banned words used:`,value: `${bannedWordList.length > 0 ? bannedWordList.join(" | ") : "None"}`},
									{name: `Protected words used:`,value: `${protectedWordList.length > 0 ? protectedWordList.join(" | ") : "None"}`},
									{name: `Channel:`,value: `${message.channel}`},
									{name: `Original Message:`,value: `***${message.content}***`},									
								])
								.setTimestamp()
								.setColor(`Random`)
								.setFooter(`Word System`)
							logs.send({embeds: [WordFilterEmbed] })
							message.delete();
							//#endregion

							//#region warn user if the admins enabled this module
							if(res.systems.blacklistWord.behaviour.mode == true){
								// message.channel.send(`Sowwy but you can't say that here! Because of that you got 1 **${res.systems.blacklistWord.behaviour.type}** warn!`).then(m => m.delete({timeout: 5500}));
								warnSystem.create({
									caseID: minDataOBJ.cases,
									caseType: res.systems.blacklistWord.behaviour.type,
									userCase: issuer.tag,
									userID: issuer.id,
									fromGuildID: message.guild.id,
									guildName: message.guild.name,
									authorCase: `Sharuru`,
									authorID: `-`,
									reason: `This member typed a banned word: ${bannedWordList.join(" | ")}`,
									date: dateAndHour,
								},(erru,resu)=>{
									if (erru) {
										sendError.create({
											Guild_Name: message.guild.name,
											Guild_ID: message.guild.id,
											User: issuer.tag,
											UserID: issuer.id,
											Error: erru,
											Time: `${TheDate} || ${clock} ${amORpm}`,
											Command: this.name + `, word system - warning mode`,
											Args: args,
										},async (erru2, ress) => {
											if(erru2) {
												console.log(erru2)
												return message.channel.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
											}
											if(ress) {
												console.log(`successfully added error to database!`)
											}
										})
									}
									if (resu) {
										let warnOptions = {
											wtype: res.systems.blacklistWord.behaviour.type,
											uID: issuer.id,
											gID: message.guild.id,
											gName: message.guild.name,
											author: `Sharuru`,
										}
										sharuru.emit(`warnSystem`,warnOptions)
										console.log(`[Word System] Warned ${issuer.tag} (${issuer.id}) from ${message.guild.name}. Type: ${res.systems.blacklistWord.behaviour.type}`)
										minDataOBJ.cases++;
										let newData = SimpleJsonToToml(minDataOBJ);
										// console.log(newData)
										fs.writeFile(mypath,newData,(err,res)=>{
											if(err) return console.log(err)
											if(res) console.log(res)
											console.log(`Done writing!`)
										})
									}
								})
							}
							message.channel.send(`Sowwy but you can't say that here!`).then(m => tools.deleteMsg(m,'2.5s'));
						}
					}

					//afk system
					let mentioned = message.mentions.users.first();
					let authorExists = this.client.afk.has(issuer.id);
					
					if (authorExists){
						let status = this.client.afk.get(issuer.id);
						let thisMember = message.guild.members.cache.get(status.id)
						if(!status.nickname == null && !thisMember.permissions.has(Permissions.FLAGS.ADMINISTRATOR)){
							thisMember.setNickname(status.nickname,`They came back from being afk.`);
						} else if (status.nickname == null && !thisMember.permissions.has(Permissions.FLAGS.ADMINISTRATOR)){
							thisMember.setNickname(null,`They came back from being afk.`);
						}
						this.client.afk.delete(issuer.id);
						message.channel.send(`Okay now that you're back you're not anymore afk.\n${status.pings.length > 0 ? `Oh yes, this/these people pinged you while you were away:\n\n${status.pings.join(',\n')}`: ``}`).then(msg => tools.deleteMsg(msg,'15s')).catch(console.error)
					}
					if (mentioned){
						let getAuthorAFK = this.client.afk.has(mentioned.id);
						if(getAuthorAFK){
							let status = this.client.afk.get(mentioned.id);
							if(!status.pings.includes(issuer.tag)){
								status.pings.push(issuer.tag)
								this.client.afk.set(mentioned.id,status)
							}
							return message.channel.send(`Sorry **${message.author}**, but **${status.nickname ? status.nickname : status.usertag}** is currently afk and they wrote a letter after they left:\n **\`${status.reason}\`**`).then(msg => tools.deleteMsg(msg,'15s'));
						}
					}

					// media Channel
					if (res.systems.mediaChannel.enabled == true) {
						if (res.systems.mediaChannel.role != '0') {
							//console.log(`[Media Channel]: custom role`)
							let mediaMembers = message.guild.roles.cache.get(res.systems.mediaChannel.role).members.map(i => i.user.id)
							let mediaObj = sharuru.mediaChannelPause.get(message.guild.id)
							if (mediaMembers.length > 0) {
								//console.log(`[Media Channel]: members with role: ${mediaMembers.length}`)
								for (let i = 0; i < mediaMembers.length; i++) {
									if (!mediaObj) mediaObj = []
									let memberP = mediaObj?.find(mobj => mobj.id == mediaMembers[i])
									//console.log(`[Media Channel]: does pause include this member?: `+memberP?.id)
									if (!memberP) {
										console.log(`[MediaChannel]: Removed ${mediaMembers[i]} role because they were not found in my pool.`)
										let getMember = message.guild.members.cache.get(mediaMembers[i]);
										getMember.roles.remove(res.systems.mediaChannel.role)
									} //else console.log(`[Media Channel]: Member ${mediaMembers[i]} exist in my db`)
								}
							}
						}
						const nrStrikes = res.systems.mediaChannel.strikes
						const timeoutPunish = res.systems.mediaChannel.timeout
						let del = true;
						if (message.content.includes("http"))
							del = false;
						if (message.content.includes("ftp"))
							del = false;
						if (message.attachments?.size > 0)
							del = false;
						if (res.systems.mediaChannel.channels.includes(message.channel.id) && del == true) {
							// check if issuer is my partner, admin or with a role above!
							if (config.owners.includes(issuer.id) ||
								message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) ||
								message.member.roles.highest.position > message.guild.me.roles.highest.position || message.member.roles.cache.find(role => role.id === res.importantData.staffRole)) {
									// console.log(`My partner or admin/higher role posted.`)
								} else { // do not allow others to type
									let Uobj = {
										id: issuer.id,
										guild: message.guild.id,
										role: res.systems.mediaChannel.role,
										strikes: 1,
										time: Number(Date.now() + Number(res.systems.mediaChannel.timeout))
									}
									let mediaGuildMap = sharuru.mediaChannelPause.get(message.guild.id)
									if (!mediaGuildMap) mediaGuildMap = []
									if (!mediaGuildMap.find(i => i.id == Uobj.id)) {// if user isn't in the map first try
										message.delete()
										mediaGuildMap.push(Uobj)
										sharuru.mediaChannelPause.set(message.guild.id, mediaGuildMap)
										console.log(`[Media Channel]: Added ${issuer.tag} (${issuer.id}) in Media Map: ${message.channel.name} (g:${message.guild.id})`)
									} else { //if user is in the map
										let userObjPause = mediaGuildMap.find(i => i.id == Uobj.id)
										if (userObjPause.strikes < nrStrikes) { // if less, ++ the strikes
											message.delete()
											userObjPause.strikes++;
											if (userObjPause.role == '0')
												if (res.systems.mediaChannel.role != '0') userObjPause.role = res.systems.mediaChannel.role
											if (userObjPause.strikes == nrStrikes-1) message.channel.send(`${issuer}, if you post again nothing else but messages here, you will be punished! Punishment: No posts for **${pms(Number(timeoutPunish))}**!`).then(m => sharuru.utils.deleteMsg(m,'6s'))
											userObjPause.time = Number(Date.now() + Number(timeoutPunish))
											let indexID = mediaGuildMap.findIndex(item => item.id == userObjPause.id)
											mediaGuildMap[indexID] = userObjPause;
											console.log(`[Media Channel]: "${message.guild.id}" ${issuer.tag} (${issuer.id}) strikes: ${userObjPause.strikes}`)
											sharuru.mediaChannelPause.set(message.guild.id, mediaGuildMap)
										}
										if (userObjPause.strikes >= nrStrikes) { // posted equal or more than needed
											try {
												let mediaRole = message.guild.roles.cache.find(r=> r.id == res.systems.mediaChannel.role)
												if (mediaRole) { // if the role is still existent
													if (mediaRole.position < message.guild.me.roles.highest.position) { // if role is below Sharuru's highest role
														message.member.roles.add(mediaRole.id)
														// let indexID = mediaGuildMap.findIndex(item => item.id == userObjPause.id)
														// mediaGuildMap.splice(indexID,1)
														// sharuru.mediaChannelPause.set(message.guild.id, mediaGuildMap)
														logs.send(`[Media Channel]: I have punished **${issuer}** for **${pms(Number(timeoutPunish))}** because they tried to post more than **${nrStrikes} messages** without an attachment or link in ${message.channel}.`)
													} else {
														logs.send(`[Media Channel]: The media channel role is above me so I couldn't add ${mediaRole} to ${issuer} as a punishment for posting more ${nrStrikes} times messages without pictures!`)
													}
												}
												if (!mediaRole) logs.send(`[Media Channel]: I couldn't find the media role. Please specify an existent role that is below me!`)										
											} catch (error) {
												console.log(error)
												message.guild.systemChannel.send(`[Media Channel]: It seems like a problem happened while searching for media channel role. Either it's above me or something else it's wrong...\nERROR:${error.message}`)
											}
										}
										
									}
								}
						}
					}
					//if msg doesn't start with prefix, add exp and coins
					if (!message.content.startsWith(prefix)) {

						let emojiEmbed = new SharuruEmbed()
							.setAuthor({name: `${issuer.nickname != undefined ? issuer.nickname : issuer.username}:`})
							.setColor(Colors.LuminousVividPink)

						// if emojiPack is enabled
						if (res.systems.emojiPack == true) {
							emojiDocs.find({
								guildID: message.guild.id
							},async(err2,res2)=>{
								if (err2) {
									sendError.create({
										Guild_Name: message.guild.name,
										Guild_ID: message.guild.id,
										User: issuer.tag,
										UserID: issuer.id,
										Error: err2,
										Time: `${TheDate} || ${clock} ${amORpm}`,
										Command: this.name + " message - emojipack Section",
										Args: args,
									},async (err3, ress) => {
										if(err3) {
											console.log(err3)
											return message.channel.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
										}
										if(ress) {
											console.log(`successfully added error to database!`)
										}
									})
								}
								if (res2) {
									for(let i = 0; i<res2.length; i++) {
										if (res2[i].enabled == true) {// if it's enabled the em group
											if (res2[i].everyone == true){ // if everyone can use it
												for(let emoji of res2[i].emojiList){
													if (emoji.disabled == false) {
														if (message.content?.toLowerCase() == emoji.name?.toLowerCase()) {
															emojiEmbed.setImage(emoji.link)
															message.delete()
															return message.channel.send({embeds: [emojiEmbed]})
														}

													}
												}
											}
											if (res2[i].everyone == false && res2[i].members.includes(issuer.id)) {
												// console.log(`${issuer.tag} (${issuer.id}) is included in ${res2[i].name} members!`)
												for(let emoji of res2[i].emojiList){
													if (emoji.disabled == false) {
														if (message.content.toLowerCase() == emoji.name) {
															emojiEmbed.setImage(emoji.link)
															message.delete()
															return message.channel.send({embeds: [emojiEmbed]})
														}

													}
												}
											}
											let member = message.guild.members.cache.get(issuer.id) 
											if (res2[i].everyone == false && member.roles.cache.some((r) => res2[i].roles.includes(r))) {
												// console.log(`${issuer.tag} (${issuer.id}) is included in ${res2[i].name} roles!`)
												for(let emoji of res2[i].emojiList){
													if (emoji.disabled == false) {
														if (message.content.toLowerCase() == emoji.name) {
															emojiEmbed.setImage(emoji.link)
															message.delete()
															message.channel.send({embeds: [emojiEmbed]})
														}

													}
												}
											}
										}
									}
								}
							})
						}

						//systems.antispam system
						if(res.systems.antispam.enabled == true){
							let AntispamGuildCache = sharuru.antispamCache.get(message.guild.id);
							if(!AntispamGuildCache) {
								let guildMapCache = {
									messages: [],
									warnedUsers: [],
									kickedUsers: [],
									mutedUsers: [],
									bannedUsers: [],
									recycler: false,
									guildList: []
								}
								console.log(`Added ${message.guild.name} (${message.guild.id}) to the map of systems.antispam system!`)
								return sharuru.antispamCache.set(message.guild.id,guildMapCache)
							}
							function format (string, message) {
								return string
									.replace(/{member}/g, message.author.toString())
									.replace(/{member_tag}/g, message.author.tag)
									.replace(/{server_name}/g, message.guild.name)
							}
							function log (msg, message) {
								if (res.systems.antispam.modLogsEnabled) {
									let modLogChannel = sharuru.channels.cache.get(res.systems.antispam.modLogsChannelName) ||
									msg.guild.channels.cache.find((channel) => channel.name === res.systems.antispam.modLogsChannelName && channel.type === 'GUILD_TEXT')
									if (modLogChannel) {
										modLogChannel.send({embeds: [message]})
									} else {
										modLogChannel = sharuru.channels.cache.find(ch => ch.name == 'sharuru-logs')
										if(modLogChannel){
											modLogChannel.send(`I have sent this message because I couldn't find the channel set up in settings. Please check up and make sure if you wanna set another channel other than my log channel, make sure you mention an existent channel.\nBelow is the logs of what I did (since they are on):\n${message}`)
										}
									}
								}
							}
							async function clearSpamMessages (messagesp,chID) {
								try {
									const channel = message.guild.channels.cache.find(ch => ch.id == chID);
									channel.messages.fetch({
										limit: messagesp.length*2
									}).then(async (messages) =>{
										messages = messages.filter(m => m.author.id === issuer.id).array().slice(0,messagesp.length);
										message.channel.bulkDelete(messages).catch(err => console.log(err.stack));
									})
								} catch (error) {
									console.log(error)
									console.log(`[Anti-Spam System || ${TheDate} ${clock} ${amORpm}]: The message(s) couldn't be deleted! ErrorCode: clearSpamMessages`);
								}
							}

							async function clearBotMessages(message){
								if(res.systems.antispam.removeBotMessages == false) return;
								try {
									setTimeout(function(){message.delete() }, res.systems.antispam.removeBotMessagesAfter);
								} catch(e){
									console.log(`[Anti-Spam System || ${TheDate} ${clock} ${amORpm}]: The bot message(s) couldn't be deleted! ErrorCode: clearBotmMessages`);
								}
							}

							async function banUser (message, member, spamMessages) {
								if (res.systems.antispam.removeMessages && spamMessages) {
									clearSpamMessages(spamMessages,message.channel.id)
								}
								AntispamGuildCache.messages = AntispamGuildCache.messages.filter((u) => u.authorID !== message.author.id)
								AntispamGuildCache.bannedUsers.push(message.author.id)
								if (!member.bannable) {
										console.log(`[Anti-Spam System || ${TheDate} ${clock} ${amORpm}]: ${message.author.tag} (ID: ${message.author.id}) could not be banned, insufficient permissions! ErrorCode: userNotBannable`);
									if (res.systems.antispam.errorMessages) {
										message.channel.send(format(res.systems.antispam.banErrorMessage, message)).catch((e) => {
												console.error(`[Anti-Spam System || ${TheDate} ${clock} ${amORpm}]: I'm missing permissions to send message! ErrorCode: sendMissingPermMessage`);
										}).then(msg => {
											return clearBotMessages(msg)
										})
									}
									return false
								} else {
									await message.member.ban({
										reason: 'Anti-Spam system banned this member for spamming even after the warnings, mute and kick!',
										days: res.systems.antispam.deleteMessagesAfterBanForPastDays
									}).catch(e => {
									if (res.systems.antispam.errorMessages) {
									message.channel.send(format(res.systems.antispam.banErrorMessage, message)).catch((e) => {
										console.error(`[Anti-Spam System || ${TheDate} ${clock} ${amORpm}]: ${e.message} ! ErrorCode: sendSuccessMessage`);
									}).then(msg => {
										return clearBotMessages(msg)
									})
									}
									})
									if(res.systems.antispam.banMessage){
									await message.channel.send(format(res.systems.antispam.banMessage, message)).catch(e => {
										console.log(`[Anti-Spam System || ${TheDate} ${clock} ${amORpm}]: I have tried sent a proper message that I have banned successfully but I can't send message for some reasons: ${e.message}! ErrorCode: ban#sendSuccessMessage`);
										}).then(msg => {
											return clearBotMessages(msg)
										})
									}
									if (res.systems.antispam.modLogsEnabled) {
										log(message, `Anti-Spam System: I have banned ${message.author} for spamming`)
									}
									return true
								}
							}

							async function muteUser (message, spamMessages,dupsOrNot) {
								if (res.systems.antispam.removeMessages && spamMessages) {
									clearSpamMessages(spamMessages,message.channel.id)
								}
								AntispamGuildCache.messages = AntispamGuildCache.messages.filter((u) => u.authorID !== message.author.id)
								let mutedObj = {
									id: message.author.id,
									gid: message.guild.id
								}
								AntispamGuildCache.mutedUsers.push(mutedObj)
								const role = message.guild.roles.cache.find(role => role.name === res.systems.antispam.muteRole)
								const userCanBeMuted = role && message.guild.me.permissions.has(Permissions.FLAGS.MANAGE_ROLES) && (message.guild.me.roles.highest.position > message.member.roles.highest.position)
								if (!userCanBeMuted) {
									console.log(`[Anti-Spam System || ${TheDate} ${clock} ${amORpm}]:${message.author.tag} (ID: ${message.author.id}) can't be muted, no permissions or the mute role couldn't be found! ErrorCode: userNotMutable`);
									if (res.systems.antispam.errorMessages) {
										await message.channel
											.send(format(res.systems.antispam.muteErrorMessage, message))
											.catch((e) => {
												console.log(`[Anti-Spam System || ${TheDate} ${clock} ${amORpm}]: I have tried sent a proper message with the reason of why I can't mute but I failed for some reasons: ${e.message}! ErrorCode: sendMissingPermMessage`);
											})
									}
									return false
								}
								if (message.member.roles.cache.has(role.id)) return true
								await message.member.roles.add(role, 'Anti-Spam System added muted role for spamming')
								removeUnmutedUsers()
								//removing as well from the warnedUsers
								let getIndexWarned = AntispamGuildCache.warnedUsers.findIndex(u => u === message.author.id); // getting index in the kickedUsers Array
								AntispamGuildCache.warnedUsers.splice(getIndexWarned,1)
								console.log(`[AntiSpam System || ${TheDate} at ${clock} ${amORpm}]: Cleared ${message.author.tag} (${message.author.id}) from warnedUsers cache because it was muted in ${message.guild.name} (${message.guild.id})!`)
								if (res.systems.antispam.muteMessage) {
									await message.channel.send(format(res.systems.antispam.muteMessage, message)).catch(e => {
										console.log(`[Anti-Spam System || ${TheDate} ${clock} ${amORpm}]: I have tried sent a proper message that I have muted successfully but I can't send message for some reasons: ${e.message}! ErrorCode: Kick#sendSuccessMessage`);
									}).then(msg => {
										return clearBotMessages(msg)
									})
								}
								if (res.systems.antispam.modLogsEnabled) {
									if(dupsOrNot == false)	log(message, `AntiSpam System: ${message.author} got **muted** in **${message.channel}** for spamming.`);
									if(dupsOrNot == true)	log(message, `AntiSpam System: ${message.author} got **muted** in **${message.channel}** for spamming duplicate messages.`);
								}
								return true
							}
							
							async function kickUser (message, member, spamMessages) {
								if (res.systems.antispam.removeMessages && spamMessages) {
									clearSpamMessages(spamMessages,message.channel.id)
								}
								AntispamGuildCache.messages = AntispamGuildCache.messages.filter((u) => u.authorID !== message.author.id)
								AntispamGuildCache.kickedUsers.push(message.author.id)
								if (!member.kickable) {
										console.log(`[AntiSpam System || ${TheDate} at ${clock} ${amORpm}]: ${message.author.tag} (ID: ${message.author.id}) can't be kicked, no perms or can't be found. ErrorCode: kick#userNotKickable`)
									if (res.systems.antispam.errorMessages) {
										message.channel.send(format(this.options.kickErrorMessage, message)).catch((e) => {
												console.log(`[AntiSpam System || ${TheDate} at ${clock} ${amORpm}]: Can't send message to say that member isn't kickable. ErrorCode: kick#sendMissingPermMessage`)
										}).then(msg => {
											return clearBotMessages(msg)
										})
									}
									return false
								} else {
									await message.member.kick('Anti-Spam System kicked this member for not stopping from spamming after mute!')	
						
									//removing as well from the warnedUsers
									let getIndexWarned = AntispamGuildCache.warnedUsers.findIndex(u => u === message.author.id); // getting index in the kickedUsers Array
									AntispamGuildCache.warnedUsers.splice(getIndexWarned,1)
									console.log(`[AntiSpam System || ${TheDate} at ${clock} ${amORpm}]: Cleared ${message.author.tag} (${message.author.id}) from warnedUsers cache because it was kicked from ${message.guild.name} (${message.guild.id})!`)
						
									//removing as well from the mutedUsers
									let getIndexMuted = AntispamGuildCache.mutedUsers.findIndex(u => u.id === message.author.id); // getting index in the kickedUsers Array
									AntispamGuildCache.mutedUsers.splice(getIndexMuted,1)
									console.log(`[AntiSpam System || ${TheDate} at ${clock} ${amORpm}]: Cleared ${message.author.tag} (${message.author.id}) from muted cache because it was kicked from ${message.guild.name} (${message.guild.id})!`)
									//end of options added
									if (res.systems.antispam.kickMessage) {
										message.channel.send(format(res.systems.antispam.kickMessage, message)).catch((e) => {
												console.log(`[AntiSpam System || ${TheDate} at ${clock} ${amORpm}]: Can't send success message of the kick event ${e.message}. ErrorCode: kick#sendSuccessMessage`)
										}).then(msg => {
											return clearBotMessages(msg)
										})
									}
									if (res.systems.antispam.modLogsEnabled) {
										log(message, `AntiSpam System: ${message.author} got **kicked** for spamming in **"${message.channel}"**`)
									}
									return true
								}
							}
							async function warnUser (message, spamMessages) {
								if (res.systems.antispam.removeMessages && spamMessages) {
									clearSpamMessages(spamMessages,message.channel.id)
								}
								AntispamGuildCache.warnedUsers.push(message.author.id)
								removeUnmutedUsers()
								log(message, `AntiSpam System: ${message.author} got **warned** in **${message.channel}**`)
								if (res.systems.antispam.warnMessage) {
									message.channel.send(format(res.systems.antispam.warnMessage, message)).catch((e) => {
											console.log(`[AntiSpam System || ${TheDate} at ${clock} ${amORpm}]: Can't send message to say that member was warned ${e.message}. ErrorCode: warn#sendSuccessMessage`)
									}).then(msg => {
										return clearBotMessages(msg)
									})
								}
								return true
							}

							function antispam_reset () {
								AntispamGuildCache = {
									messages: [],
									warnedUsers: [],
									kickedUsers: [],
									mutedUsers: [],
									bannedUsers: [],
									recycler: false,
									guildList: []
								}
							}

							function antispam_showCache (guild_id,cacheSector) {
								if(guild_id) AntispamGuildCache = sharuru.antispamCache.get(guild_id)
								if(!cacheSector && !guild_id){
									console.log(`Showing Entire Cache of the Anti-Spam System:`)
									console.log(sharuru.antispamCache);
								}
								if(!cacheSector && guild_id){
									console.log(`Showing Entire Cache of the ${guild_id} systems.antispam system:`)
									console.log(AntispamGuildCache);
								}
								if(cacheSector == 'messages' && guild_id){
									console.log(`Showing Messages Cache of the ${guild_id} Anti-Spam System:`)
									console.log(AntispamGuildCache.messages);
								}
								if(cacheSector == 'warnedUsers' && guild_id){
									console.log(`Showing warnedUsers Cache of the ${guild_id} Anti-Spam System:`)
									console.log(AntispamGuildCache.warnedUsers);
								}
								if(cacheSector == 'kickedUsers' && guild_id){
									console.log(`Showing kickedUsers Cache of the ${guild_id} Anti-Spam System:`)
									console.log(AntispamGuildCache.kickedUsers);
								}
								if(cacheSector == 'mutedUsers' && guild_id){
									console.log(`Showing mutedUsers Cache of the ${guild_id} Anti-Spam System:`)
									console.log(AntispamGuildCache.mutedUsers);
								}
								if(cacheSector == 'bannedUsers' && guild_id){
									console.log(`Showing bannedUsers Cache of the ${guild_id} Anti-Spam System:`)
									console.log(AntispamGuildCache.bannedUsers);
								}
							}

							function antispam_clearUser (user, sector, issuer){
								// console.log(`[AntiSpam System || ${TheDate} at ${clock} ${amORpm}]: Cleared ${user.tag} (${user.id}) from the messages cache as requested by ${issuer.tag} (${issuer.id})!`)
						
								if(!user) return console.error(`No user provided. Please provide an user to clear the cache!`)
								if(user && !sector){
									let confirmation = ``;
									let getIndexWarned = AntispamGuildCache.warnedUsers.findIndex(index => index === user.id);
									let getIndexKicked = AntispamGuildCache.kickedUsers.findIndex(index => index === user.id);
									let getIndexMuted = AntispamGuildCache.mutedUsers.findIndex(index => index.id === user.id);
									let getIndexBanned = AntispamGuildCache.bannedUsers.findIndex(index => index === user.id);
						
									if(AntispamGuildCache.messages.find(userm => userm.authorID == user.id) != undefined) {
										AntispamGuildCache.messages = AntispamGuildCache.messages.reduce((p,c) => (c.authorID !== user.id && p.push(c),p),[]);
										confirmation += `- messages;\n`;
									}
									if(getIndexWarned != -1){
										AntispamGuildCache.warnedUsers.splice(getIndexWarned,1);
										confirmation += `- warnedUsers;\n`;
									}
									if(getIndexKicked != -1){
										AntispamGuildCache.kickedUsers.splice(getIndexKicked,1);
										confirmation += '- kickedUsers;\n';
									} 
									if(getIndexMuted != -1){
										AntispamGuildCache.mutedUsers.splice(getIndexMuted,1);
										confirmation += '- mutedUsers;\n';
									}
									if(getIndexBanned != -1){
										AntispamGuildCache.bannedUsers.splice(getIndexBanned,1);
										confirmation += '- bannedUsers;\n';
									}
									console.log(`[AntiSpam System || ${TheDate} at ${clock} ${amORpm}]: Cleared ${user} from:\n${confirmation} as requested by ${issuer.tag} (${issuer.id})!`)
								}
								if(user && sector){
									if(sector != 'messages' || sector != 'mutedUsers' ){
										let getIndexCache = AntispamGuildCache[sector].findIndex(index => index === user.id);
						
									if(getIndexCache != -1) AntispamGuildCache[sector].splice(getIndexCache,1)
									console.log(`[AntiSpam System || ${TheDate} at ${clock} ${amORpm}]: Cleared ${user.tag} (${user.id}) from the ${sector} cache as requested by ${issuer.tag} (${issuer.id})!`)
									}
									if(sector == 'messages'){
										if(AntispamGuildCache.messages.find(userm => userm.authorID == user.id) != undefined) {
											AntispamGuildCache.messages = AntispamGuildCache.messages.reduce((p,c) => (c.authorID !== user.id && p.push(c),p),[]);
											console.log(`[AntiSpam System || ${TheDate} at ${clock} ${amORpm}]: Cleared ${user.tag} (${user.id}) from the messages cache as requested by ${issuer.tag} (${issuer.id})!`)
										}
									}
									if(sector == 'mutedUsers'){
										if(AntispamGuildCache.mutedUsers.find(userm => userm.id == user.id) != undefined) {
											AntispamGuildCache.mutedUsers = AntispamGuildCache.mutedUsers.reduce((p,c) => (c.id !== user.id && p.push(c),p),[]);
											console.log(`[AntiSpam System || ${TheDate} at ${clock} ${amORpm}]: Cleared ${user.tag} (${user.id}) from the mutedUsers cache as requested by ${issuer.tag} (${issuer.id})!`)
										}
									}
								}
							}

							function removeUnmutedUsers(){
								if(AntispamGuildCache.recycler == false){
									if(AntispamGuildCache.guildList.length > 0){
										let mutedUsers2 = AntispamGuildCache.mutedUsers
										setInterval(() => {
											let clock = new Date();
											let ss = String(clock.getSeconds()).padStart(2, '0');
											let min = String(clock.getMinutes()).padStart(2, '0');
											let hrs = String(clock.getHours()).padStart(1, '0');
											clock = `${hrs}:${min}:${ss}`;

											let TheDate = new Date();
											let zilelesaptamanii = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
											let weekday = zilelesaptamanii[TheDate.getDay()];
											let dd = String(TheDate.getDate()).padStart(2, '0');
											let mon = String(TheDate.getMonth() + 1);
											let year = String(TheDate.getFullYear()).padStart(4, '00');
											TheDate = `${weekday}, ${mon}/${dd}/${year}`;
											let amORpm;
											if (hrs >= 0 && hrs <= 12) {
												amORpm = 'AM';
											} else {
												amORpm = 'PM';
											}
											console.log(`[AntiSpam System || ${TheDate} at ${clock} ${amORpm}]: Checking the mutedUsers people if they still have the role...`)
											if(mutedUsers2.length > 0){
												for(let user in mutedUsers2){
													let getUserObj = mutedUsers2.find(uObj => uObj.id == mutedUsers2[user].id)
													let getGuildObj = AntispamGuildCache.guildList.find(gid => gid.id === getUserObj.gid)
													if(getGuildObj.member(getUserObj.id).roles.cache.find(role => role.name == res.systems.antispam.muteRole) == undefined){
														let getIndex = mutedUsers2.findIndex(u => u.id == getUserObj.id)
														AntispamGuildCache.mutedUsers.splice(getIndex,1);
														console.log(`[AntiSpam System || ${TheDate} at ${clock} ${amORpm}]: Deleted ${getUserObj.id} from MutedUsers cache since they didn't have the muted role anymore!`)
													}
													if(getGuildObj.member(getUserObj.id).roles.cache.find(role => role.name == res.systems.antispam.muteRole) != undefined){
														console.log(`This ${getUserObj.id} still has the role, skipping...`)
													}
												}
											}
										}, res.systems.antispam.checkForMutedRoleInterval );
									}
									AntispamGuildCache.recycler = true;
								}
							}
							let customArgs = message.content.split(/ +/gi)

							if(customArgs[0] == 'rr' && issuer.id == '186533323403689986'){
								antispam_reset()
								console.log(`cache reseted!`)
							}
							if(customArgs[0] == 'sh' && issuer.id == '186533323403689986'){
								if(customArgs[1]) antispam_showCache(customArgs[1],customArgs[2])
								if(!customArgs[1]) antispam_showCache()
							}
							if(customArgs[0] == 'cu' && issuer.id == '186533323403689986'){
									// return console.log()
									if(customArgs[1]) antispam_clearUser(message.guild.members.cache.get(message.mentions.users.first().id).user,customArgs[2],issuer)
									if(!customArgs[1]) antispam_clearUser(customArgs[1])
								
								}
								// arrayIncludesInObj(array where to search, the field to search after, the value to search after)
								const arrayIncludesInObj = (arr, key, valueToCheck) => {
									return arr.some(value => value[key] === valueToCheck);
								}
								const options = res.systems.antispam
								if (
									!message.guild ||
									message.author.id === message.client.user.id ||
									(message.guild.ownerId === message.author.id) ||
									(options.ignoreBots && message.author.bot)
								) {
									return false
								}
								if(message.author.id == '186533323403689986') return false
						
								const isMemberIgnored = typeof options.ignoredMembers === 'function' ? options.ignoredMembers(message.member) : options.ignoredMembers.includes(message.author.id)
								if (isMemberIgnored) return false
						
								const isChannelIgnored = typeof options.ignoredChannels === 'function' ? options.ignoredChannels(message.channel) : options.ignoredChannels.includes(message.channel.id)
								if (isChannelIgnored) return false
						
								const member = message.member || await message.guild.members.fetch(message.author)
						
								const memberHasIgnoredRoles = typeof options.ignoredRoles === 'function'
									? options.ignoredRoles(member.roles.cache)
									: options.ignoredRoles.some((r) => member.roles.cache.has(r))
								if (memberHasIgnoredRoles) return false
						
								//.permissions.has(permission)
								const memberPermissions = new Permissions(member.roles.cache.map(role => role.permissions));
								if (options.ignoredPermissions.some((permission) => memberPermissions.has(permission))) return false
								// if (permissions.has(member, ))
						
								const currentMessage = {
									messageID: message.id,
									guildID: message.guild.id,
									authorID: message.author.id,
									channelID: message.channel.id,
									content: message.content,
									sentTimestamp: message.createdTimestamp
								}
								AntispamGuildCache.messages.push(currentMessage)
						
								//added by mirage zoe
								if(AntispamGuildCache.guildList.find(gid => gid.id == message.guild.id) == undefined) AntispamGuildCache.guildList.push(message.guild);
								let thisguild = AntispamGuildCache.guildList.find(gid => gid.id == message.guild.id);
								if(thisguild.members.cache.size >= thisguild.members.cache.size + 1) {
									let indexGuild = AntispamGuildCache.guildList.findIndex(gid => gid.id === message.guild.id);
									if(indexGuild !== -1) AntispamGuildCache.guildList[indexGuild] = message.guild;
									console.log(`[AntiSpam System || ${TheDate} at ${clock} ${amORpm}]: Replaced ${message.guild.name} (${message.guild.id}) in the guildList with newer info about it's members.`)
								}
								//end of add
						
								const cachedMessages = AntispamGuildCache.messages.filter((m) => m.authorID === message.author.id && m.guildID === message.guild.id)
						
								const duplicateMatches = cachedMessages.filter((m) => m.content === message.content && (m.sentTimestamp > (currentMessage.sentTimestamp - options.maxDuplicatesInterval)))
						
						
								/**
								 * Duplicate messages sent before the threshold is triggered
								 * @type {CachedMessage[]}
								 */
								const spamOtherDuplicates = []
								if (duplicateMatches.length > 0) {
									let rowBroken = false
									cachedMessages.sort((a, b) => b.sentTimestamp - a.sentTimestamp).forEach(element => {
										if (rowBroken) return
										if (element.content !== duplicateMatches[0].content) rowBroken = true
										else spamOtherDuplicates.push(element)
									})
								}
								const spamMatches = cachedMessages.filter((m) => m.sentTimestamp > (Date.now() - options.maxInterval))
						
								let sanctioned = false
						
								const userCanBeBanned = options.banEnabled && !AntispamGuildCache.bannedUsers.includes(message.author.id) && !sanctioned
								if (userCanBeBanned && (spamMatches.length >= options.banThreshold)) {
									banUser(message, member, spamMatches)
									sanctioned = true
								} else if (userCanBeBanned && (duplicateMatches.length >= options.maxDuplicatesBan)) {
									banUser(message, member, [...duplicateMatches, ...spamOtherDuplicates])
									sanctioned = true
								}
						
								//!AntispamGuildCache.mutedUsers.includes(message.author.id)
								//!arrayIncludesInObj(AntispamGuildCache.mutedUsers,'id',message.author.id)
								
								const userCanBeMuted = options.muteEnabled && !arrayIncludesInObj(AntispamGuildCache.mutedUsers,'id',message.author.id) && !sanctioned
								// console.log(spamMatches)
								// console.log(options.maxInterval)
								if (userCanBeMuted && (spamMatches.length >= options.muteThreshold)) {
									muteUser(message, spamMatches,false)
									sanctioned = true
								} else if (userCanBeMuted && (duplicateMatches.length >= options.maxDuplicatesMute)) {
									muteUser(message, [...duplicateMatches, ...spamOtherDuplicates],true)
									sanctioned = true
								}
						
								const userCanBeKicked = options.kickEnabled && !AntispamGuildCache.kickedUsers.includes(message.author.id) && !sanctioned
								if (userCanBeKicked && (spamMatches.length >= options.kickThreshold)) {
									kickUser(message, member, spamMatches)
									sanctioned = true
								} else if (userCanBeKicked && (duplicateMatches.length >= options.maxDuplicatesKick)) {
									kickUser(message, member, [...duplicateMatches, ...spamOtherDuplicates])
									sanctioned = true
								}
						
								const userCanBeWarned = options.warnEnabled && !AntispamGuildCache.warnedUsers.includes(message.author.id) && !sanctioned
								if (userCanBeWarned && (spamMatches.length >= options.warnThreshold)) {
									warnUser(message, spamMatches)
									sanctioned = true
								} else if (userCanBeWarned && (duplicateMatches.length >= options.maxDuplicatesWarn)) {
									warnUser(message, [...duplicateMatches, ...spamOtherDuplicates])
									sanctioned = true
								}
								// console.log(sanctioned)

						}//end of systems.antispam system

						// check if they are in the memberlist in case the xp system is off
						if (res.systems.exp.enabled && !res.members.includes(issuer.id)) {// before it was checking if the xp system was disabled as well
							console.log(`[Sharuru-memberLog]: This member, ${issuer.tag} (${issuer.id}), isn't logged and exp system is off. I'll log them now...`)
							let newMap = new Map()
							let newobj = {
							exp: 0,
							money: 1000,
							level: 1,
							loan: 0,
							loanTurns: 0,
							guildName: message.guild.name
							}
							newMap.set(message.guild.id,newobj)

							// verify if they don't have already a profile. if they do, just add to the members array.
							// Otherwise add to the members array & create profile
							profileSys.findOne({
								userID: issuer.id
							},(err2,res2) =>{
								if (err2) {
									sendError.create({
										Guild_Name: message.guild.name,
										Guild_ID: message.guild.id,
										User: issuer.tag,
										UserID: issuer.id,
										Error: err2,
										Time: `${TheDate} || ${clock} ${amORpm}`,
										Command: this.name,
										Args: message.content,
									},async (err, ress) => {
										if(err) {
											console.log(err)
											return message.channel.send(`Unfortunately an problem appeared while processing a message from chat. Please try again later. If this problem persist, contact my partner!`)
										}
										if(ress) {
											console.log(`successfully added error to database!`)
										}
									})
								}
								if (res2) {
									console.log(`[Sharuru-memberLog]: ${issuer.tag} (${issuer.id}) has a profile already. Just added them to the members array.`)
									if (!res.members) res.members = []
									res.members.push(issuer.id)
									res.save().catch(err=> console.log(err))
								} else {
									console.log(`[Sharuru-memberLog]: ${issuer.tag} (${issuer.id}) - created a profile & added to members array.`)
									profileSys.create({
										username: issuer.tag,
										userID: issuer.id,
										guildID: message.guild.id,
										guildName: message.guild.name,
										backgroundsOwned: [`13`],
										backgroundSelected: `https://cdn.discordapp.com/attachments/768885615759982634/799379961483231272/na_1.jpg`,
										servers_data: newMap
									},(err,res)=>{
										if(err) {
											console.log(`[Sharuru-memberLog]: An error happened while trying to log this member...`)
											console.log(err)
										}
										if(res){
											console.log(`[Sharuru-memberLog]: Done! I've logged this member now.`)
										}
									})
									if (!res.members) res.members = []
									res.members.push(issuer.id)
									res.save().catch(err=> console.log(err))
								}
							})
						}

						if(res.systems.exp.enabled == false) return// console.log(`Not enabled`)
						//ignore channels with no xp
						if(res.systems.exp.ignoredChannels !== null || res.systems.exp.ignoredChannels !== undefined){
							if(res.systems.exp.ignoredChannels.includes(message.channel.id)){
								return console.log(`[Sys]${issuer.tag}, this channel, ${message.channel.name}, is in ignored list!`)
							}
						}

						let CoinMin = res.systems.exp.coin_drop.min;
						let CoinMax = res.systems.exp.coin_drop.max
						let xpMin = res.systems.exp.xp_per_message.min;
						let xpMax = res.systems.exp.xp_per_message.max;
						let cooldownPerMessage = res.systems.exp.cooldownMsg;
						let xpRate = res.systems.exp.xp_rate;

						let last_xp_date = this.client.xp_cooldown_map.get(issuer.id);
						if(last_xp_date !== null && cooldownPerMessage - (Date.now() - last_xp_date) >0) {//you can study this line to figure out what it does
							let timeOjb = pms(cooldownPerMessage - (Date.now() - last_xp_date),{verbose: true}); //now we can use the pretty pms module to get the remaining time.
							//this part will run if they already colleted their balance in the last 24 hours
							console.log(`${message.author.tag}, cooldown for next message ${timeOjb}`)
							return;
						}
						let shuffleXP = shuffle(range(xpMin,xpMax))
						let xpGained = shuffleXP[Math.floor(Math.random() * shuffleXP.length)];
						this.client.xp_cooldown_map.set(issuer.id,Date.now());

						profileSys.findOne({
							userID: issuer.id
						},(err,res2)=>{
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
								},async (err, ress) => {
									if(err) {
										console.log(err)
										return message.channel.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
									}
									if(ress) {
										console.log(`successfully added error to database!`)
									}
								})
							}
							if(res2){//if they have a profile, add coins (if) and exp
								//coins drop to continue to make
								if(res.economy == 1){
									let coinsToAdd = randomIntervalGenerator(CoinMin,CoinMax);
									console.log(`Coins dropped for ${issuer.tag}: ${coinsToAdd}`)
									res2.money = Number(res2.money) + coinsToAdd
								}
								let getUserXP = res2.exp;
								let getUserLimit = res2.expLimit;
								let getUserLevel = res2.level;
								let xpGainedNow = Number(getUserXP) + Number(xpGained * xpRate);
								if (xpGainedNow < getUserLimit){
									res2.exp = xpGainedNow;
									// console.log(`[XP System] ${message.guild.name}:\nMin xp: ${xpMin}\nMax xp: ${xpMax}\nRate: x${xpRate}\nCalculation: ${xpGained}`)
									console.log(`${issuer.tag} from ${message.guild.name}(${message.guild.id}) got ${xpGainedNow} (had: ${getUserXP})`)
								} else {
									res2.level += 1;
									res2.exp = xpGainedNow - 1000;
									console.log(`${issuer.tag} just leveled up ${getUserLevel+1}! Had ${getUserXP} and got ${xpGained} = ${xpGainedNow} => ${xpGainedNow-1000} and level up!`)
									let embed = new SharuruEmbed()
										.setAuthor(`Level up!`)
										.setColor(`Random`)
										.setThumbnail(`https://cdn.discordapp.com/attachments/768885595228864513/810530327763746856/Level-Up-Final-02-copy-1.png`)
										.setDescription(`${issuer.tag} got level ${getUserLevel+1}! Check out \`${prefix}iam\` to see what u can claim!`)
									message.channel.send({embeds: [embed]})
								}
								res2.save().catch(err=> console.log(err));
							} else { //if they don't have a profile
								console.log(`\nthis should work`)
								let newMap = new Map()
								let newobj = {
								exp: 0,
								money: 1000,
								level: 1,
								loan: 0,
								loanTurns: 0,
								guildName: message.guild.name
								}
								newMap.set(message.guild.id,newobj)
								profileSys.create({
									username: issuer.tag,
									userID: issuer.id,
									guildID: message.guild.id,
									guildName: message.guild.name,
									backgroundsOwned: [`13`],
									backgroundSelected: `https://cdn.discordapp.com/attachments/768885615759982634/799379961483231272/na_1.jpg`,
									servers_data: newMap
								},(err,res)=>{
									if(err) console.log(err)
									if(res){
									console.log(res)
									console.log(`done!`)
									}
								})
							}
						})
					}
					if (!message.content.startsWith(prefix)) return;
					// eslint-disable-next-line no-unused-vars
					const cooldownSystem = this.client.cooldownCMDS;
					const [cmd, ...args] = message.content.slice(prefix.length).trim().split(/ +/g);
					const command = this.client.commands.get(cmd.toLowerCase()) || this.client.commands.get(this.client.aliases.get(cmd.toLowerCase()));
					cmdObJ = command
					
					if (command) {
						if(command.ownerOnly && !this.client.utils.checkOwner(message.author.id)){
							return message.reply('sorry but this command can be only used by my partner!');
						}

						if (res.systems.disabledCommands.includes(command.name)) return console.log(`[Sharuru]: This command is disabled! ${issuer.tag} Tried to use it!`);

						if (command.staffRoleOnly) {
							// if staffrole is set
							if (res.importantData.staffRole != 'NOT_SET') {
								if(!message.member.roles.cache.find(r => r.name === res.importantData.staffRole) && !cfg.owners.includes(issuer.id)) {
									console.log(`[Sharuru - StaffRole Only CHeck]: No staff role found found for ${issuer.tag} AT`)
									return message.channel.send(`${issuer}, unfortunately I can't let you use this command! This is an exclusive command for staff only!`)
								}
							}
							if (res.importantData.staffRole == 'NOT_SET' && !cfg.owners.includes(issuer.id)) // else do not let them use the command
								return message.channel.send(`${issuer}, unfortunately I can't run this command without the staff role set up. Please ask a staff member to set the staff role.`)
						}
						if (!command.staffRoleOnly)
							if(command.roleDependable != "0" || command.roleDependable != false) {
								let checkNameOrId = parseInt(command.roleDependable);
								if (!isNaN(checkNameOrId)) { // it's an id
									if(!message.member.roles.cache.find(r => r.id == checkNameOrId) && !cfg.owners.includes(issuer.id)) {
										message.channel.send(`${issuer}, this command requires <@&${command.roleDependable}> to work!`)
										return console.log(`[Sharuru]: ${issuer.tag} doens't have the required role: ${command.roleDependable} RD ID`)
									}
									console.log(`[Sharuru]: Allowed tester ${issuer.tag} to use ${command.name}. RD`)
								} else { // it's a name
									if(!message.member.roles.cache.find(r => r.name == command.roleDependable) && !cfg.owners.includes(issuer.id)) {
										message.channel.send(`${issuer}, this command requires ${message.guild.roles.cache.find(r => r.name == command.roleDependable)} to work!`)
										return console.log(`[Sharuru]: ${issuer.tag} doens't have the required role name: ${command.roleDependable} RD NAME`)
									}
									console.log(`[Sharuru]: Allowed tester ${issuer.tag} to use ${command.name}. RD`)
								}
							}
						if(command.allowTesters) {
							if(!message.member.roles.cache.find(r => r.name === "Testers") && !cfg.owners.includes(issuer.id)) return console.log(`[Sharuru-Tester Check]: No "Tester" role found for ${issuer.tag} AT`)
							console.log(`[Sharuru]: Allowed tester ${issuer.tag} to use ${command.name}. AT`)
						}
						if(command.guildOnly && !message.guild) {
							return message.reply('Sorry but this command can be used only in a server!');
						}
						if(command.args && !args.length) {
							return message.reply(`Sorry but you forgot to provide the arguments for this command to work.\n\nUsage: ${command.usage ? command.usage : `This command doesn't have a usage format`}.\nOptions: ${command.options ? command.options : `This command doesn't have options`}`);
						}
						
						if (message.guild) {
							const UserPermCheck = command.userPerms ? this.client.defaultPerms.add(command.userPerms) : this.defaultPerms;
						if (UserPermCheck) {
							const missing = message.channel.permissionsFor(message.member).missing(UserPermCheck);
							if (missing.length) { // 
								if(res.importantData.staffRole !== 'NOT_SET'){
									if(message.member.roles.cache.find(r=> r.id == res.importantData.staffRole)) console.log(`staff, continue.`)
										else
									return message.reply(`You are missing ${this.client.utils.formatArray(missing.map(this.client.utils.formatPerms))} permission(s) which are used to run the command.\nPlease try again when you have the permissions.`);
								} else{
									console.log(`StaffRole not set`)
									return message.reply(`You are missing ${this.client.utils.formatArray(missing.map(this.client.utils.formatPerms))} permission(s) which are used to run the command.\nPlease try again when you have the permissions.`);
								}
								// eslint-disable-next-line max-len
							}
						}

						const SharuruPermCheck = command.SharuruPerms ? this.client.defaultPerms.add(command.SharuruPerms) : this.defaultPerms;
						if (SharuruPermCheck) {
							const missing = message.channel.permissionsFor(this.client.user).missing(SharuruPermCheck);
							if (missing.length) {
								// eslint-disable-next-line max-len
								return message.reply(`I am missing \`${this.client.utils.formatArray(missing.map(this.client.utils.formatPerms))}\` permission(s) which are used in the command.\nPlease tell the owner or another admin to give me necessary permissions and try again after.`);
							}
						}
						}
						let cmdUsedByUser = cooldownSystem.get(issuer.id);
						//if not owner and others, add cooldown
						if(!cfg.owners.includes(issuer.id)){
							if(res.importantData.staffRole !== `NOT_SET` && message.member.roles.cache.find(r=> r.id == res.importantData.staffRole)){
								// console.log(`staff member used command, no cooldown applied`)
								// if(issuer.id !== `186533323403689986`) svlog.send(`${issuer.tag} (${issuer.id}) used:\nCommand name: "**${command.name}**"\nIn Channel: **"${message.channel.name}"**\nMessage content: ${message.content}`)
								return command.run(message, args);
							} else {
								if(cmdUsedByUser){
									console.log(`${issuer.tag} used "${command.name}" at ${this.client.utils.convertTime(Date.now())} but it was on cooldown (cooldown ${command.cooldown ? command.cooldown/1000 : `no cooldown set`} s).`)
									if(cmdUsedByUser[`${command.name}#cooldown`]){
										if(cmdUsedByUser[`${command.name}#cooldown`] - (Date.now() - cmdUsedByUser[command.name]) > 0){
											console.log(`Command had own cooldown, so need for global cooldown!`)
											return message.reply(`You have to wait ${pms(command.cooldown - (Date.now() - cmdUsedByUser[command.name]),{verbose: true})} before using this command again!`);
										}
										let obj = cmdUsedByUser
										obj[command.name] = Date.now()
										obj[`${command.name}#cooldown`] = command.cooldown
										cooldownSystem.set(issuer.id,obj)
										setTimeout(() => {
											delete obj[`${command.name}`]
											delete obj[`${command.name}#cooldown`]
											cooldownSystem.set(issuer.id,obj)
										}, command.cooldown);
									} else {
										if(globalCooldown - (Date.now() - cmdUsedByUser[command.name]) > 0) return message.reply(`You have to wait ${pms(globalCooldown - (Date.now() - cmdUsedByUser[command.name]),{verbose: true})} before using this command again!`)
										let obj = cmdUsedByUser
										obj[command.name] = Date.now()
										cooldownSystem.set(issuer.id,obj)
										setTimeout(() => {
											delete obj[command.name]
											cooldownSystem.set(issuer.id,obj)
										}, globalCooldown);
									}
								} else {
									let obj = {}
									if(command.cooldown || command.cooldown !== undefined || command.cooldown !== null){
										obj[`${command.name}`] = Date.now();
										obj[`${command.name}#cooldown`] = command.cooldown;
										cooldownSystem.set(issuer.id,obj)
										setTimeout(() => {
											delete obj[`${command.name}`]
											delete obj[`${command.name}#cooldown`]
											cooldownSystem.set(issuer.id,obj)
										}, command.cooldown);
									}else{
										obj[`${command.name}`] = Date.now()
										cooldownSystem.set(issuer.id,obj)
										setTimeout(() => {
											delete obj[`${command.name}`]
											cooldownSystem.set(issuer.id, obj)
										}, globalCooldown);
									}
								}
								// console.log(`cooldown applied to ${issuer.tag}`)
							}
						}
						command.run(message, args);
						if(issuer.id !== `186533323403689986` && message.guild.id == "747572401344217241") svlog.send(`${issuer.tag} (${issuer.id}) used:\nCommand name: "**${command.name}**"\nIn Channel: **"${message.channel.name}"**\nMessage content: ${message.content}`)
					}
				}
			})
	// }, 300);
	function rep(myMessage,deleteAfterTimeout = null,setEphemeral = false) {
		let tempMessageForTimeoutDelete;

		if (typeof(myMessage) == "string") 
		{
			if (deleteAfterTimeout != null)
			{
				tempMessageForTimeoutDelete = message.channel.send({content: myMessage, ephemeral: setEphemeral})
				setTimeout(() => { tempMessageForTimeoutDelete.then(m =>m.delete()) }, ms(deleteAfterTimeout));
			} else message.channel.send({content: myMessage, ephemeral: setEphemeral})
		} else if (typeof(myMessage) == "object") {
			let tempArr = myMessage;

			if (!Array.isArray(myMessage)) tempArr = [myMessage]
			
			if (deleteAfterTimeout != null)
			{
				tempMessageForTimeoutDelete = message.channel.send({embeds: tempArr, ephemeral: setEphemeral})
				setTimeout(() => { tempMessageForTimeoutDelete.then(m =>m.delete()) }, ms(deleteAfterTimeout));
			} else message.channel.send({embeds: tempArr, ephemeral: setEphemeral})
		}
	}
	}

};
