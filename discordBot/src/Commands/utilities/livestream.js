/* eslint-disable no-unused-vars */
const SharuruEmbed = require('../../Structures/SharuruEmbed');
const Command = require('../../Structures/Command.js');
const liveSystem = require('../../Models/liveSystem');
const guildsettings = require('../../Models/GuildSettings')
const sendError = require('../../Models/Error');
const concat = require('concat-stream');
const moment = require("moment");
const toml = require('toml');
const path = require('path');
const fs = require('fs');
const ms = require('ms');
const { ISO_8601 } = require('moment');
const { PermissionsBitField } = require('discord.js');



module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'livestream',
			displaying: true,
			description: 'The Live-Stream system. Set it up to give messages when a streamer from twitch & youtube is going live!',
			options: `First of all, this command allows you to add youtube & twitch streamers. Select first which platform u want and then 
			- \` <platform> switch\` => It will turn on/off the platform featured. You can choose this way which platform to be announced when u want.
			- \` <platform> islive <username of streamer>\` => Checks if a streamer is live or not by using their username (twitch only) or their channel page url (youtube only). The username must be accurate to work.
			- \` <platform> add <Streamer Name>\` => It will add the streamer to a list of people to watch after. When that streamer goes live, a message will be sent in the specified channel.
			- \` <platform> remove <Streamer Name>\` => It will remove the streamer from the list (if it was added).
			- \` channel <mention a #channel>\` => This is the channel where the announcements of streams will be sent. It works for both yt and twitch so no need to specify platform.`,
			usage: ' youtube add https://www.youtube.com/channel/UC-lHJZR3Gqxm24_Vd_AJ5Yw => adds pewdiepie channel to the list. ONLY WORKS WITH CHANNEL LINKS, NO USER LINK! (THEY MUST CONTAIN YOUTUBE.COM/CHANNEL/THEIR_ID!!!!)',
			example: ' twitch add pokimane => this will add `pokimane` in the list of streamers to watch after from **twitch**. When pokimane goes live, a message will be sent in the specified channel.',
			category: 'utilities',
			userPerms: [PermissionsBitField.Flags.SendMessages],
			SharuruPerms: [PermissionsBitField.Flags.SendMessages],
			args: false,
			guildOnly: true,
			ownerOnly: false,
			aliases: ['stream', `live`]
		});
	}
	// - \` <platform> bio <username of streamer>\` => it will show a little info about the streamer on twitch.
	
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
		let prefix = this.client.prefixes.get(message.guild.id)

		function SimpleJsonToToml(object) {
            let toString = JSON.stringify(object);
            toString = toString.replace(/(^\{+|\}+$)/gi,'')
            toString = toString.replace(/"/gi,'')
            toString = toString.replace(/:/gi,' = ')
            toString = toString.replace(/,/gi,'\n')
            // console.log(`done:`)
            // console.log(toString)
            return toString
		}
		function abbreviateNumber(value) {
			let newValue = `${value}`;
			let returnThis = ``
			console.log(newValue)
			if(value > 999999999){
				console.log(`o7`)
				returnThis = newValue.substring(0,1)+" billion";
			}else if(value > 99999999){
				console.log(`o6`)
				returnThis = newValue.substring(0,3)+" million"
			} else if(value > 9999999){
				console.log(`o5`)
				returnThis = newValue.substring(0,2)+"."+newValue.substring(2,3)+" million"
			} else if(value > 999999){ //at like 1m+
				console.log(`o4`)
				returnThis = newValue.substring(0,1)+"."+newValue.substring(1,2)+" million"
			} else if(value > 99999){//above 100k
				console.log(`o3`)
				returnThis = newValue.substring(0,3)+"."+newValue.substring(3,4)+"k"
			} else if(value > 9999) { //above 10k
				returnThis = newValue.substring(0,2)+"."+newValue.substring(2,3)+"k"
				console.log(`o2`)
			} else if(value > 999) { //above 1k
				returnThis = newValue.substring(0,1)+"."+newValue.substring(1,2)+"k"
				console.log(`o1`)
			}else {
				returnThis = value
			}
			return returnThis;
		}
		const getScript = (url) => {
			return new Promise((resolve, reject) => {
				const http      = require('http'),
					  https     = require('https');
		
				let client = http;
		
				if (url.toString().indexOf("https") === 0) {
					client = https;
				}
		
				client.get(url, (resp) => {
					let data = '';
		
					// A chunk of data has been recieved.
					resp.on('data', (chunk) => {
						data += chunk;
					});
		
					// The whole response has been received. Print out the result.
					resp.on('end', () => {
						resolve(data);
					});
		
				}).on("error", (err) => {
					reject(err);
				});
			});
		};
		function reverse(s){
			return s.split("").reverse().join("");
		}
		if(!args[0]) return message.channel.send(`${issuer}, use \`${prefix}help livestream\` to learn how to use this command!`)
		if(args[0] == `channel`){
			let chosenChannel = message.mentions.channels.first()?.id || args[1]//null
			// if(message.mentions.channels){
			// 	chosenChannel = message.mentions.channels.first().id
			// } else {
			// 	chosenChannel = args[1]
			// }
			let mych = null;
			try {
				mych = message.guild.channels.cache.find(ch => ch.id === chosenChannel)
				console.log(`Channel found: ${mych.name}`)
			} catch (error) {
				console.log(`No channel mentioned or ID`)
				return message.channel.send(`${issuer}, It seems like you added something else that isn't a channel mention or id! Please check again!`)
			}
			guildsettings.findOne({
				ID: message.guild.id
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
							return message.channel.send(`Unfortunately an problem appeared while trying to process the livestream command. Please try again later. If this problem persist, contact my partner!`)
						}
						if(res) {
							console.log(`successfully added error to database!`)
						}
					})
				}
				if(res){
					res.systems.livestream.channel = mych.id
					res.save().catch(err=> console.log(err))
					message.channel.send(`${issuer}, done! I have set up the channel where I'll send the messages about streamers when they go live!`)
				}
			})
			return
		}
		if(args[0] == 'twitch' || args[0] == 'tw'){

			if (args[1] == 'switch') {
				if(res.systems.livestream.enableTW == true){
					res.systems.livestream.enabledTW = false;
					message.channel.send(`${issuer}, I have turned off twitch livestream feature. Twitch streamers won't be announced when they go online!`)
				} else {
					res.systems.livestream.enableTW = true
					message.channel.send(`${issuer}, I have turned on twitch livestream feature. Twitch streamers will be announced when they go online!.`)
				}
				res.save().catch(err=> console.log(err))
				return;
			}
			if (args[1] == 'islive') {
				fs.createReadStream('./src/Assets/minData.toml','utf8').pipe(concat((data) =>{
					let parsed = toml.parse(data);
					let client_id = parsed.twitch_client_id;
					let client_secret = parsed.twitch_client_secret;
					let bearer_token = parsed.twitch_bearer_token;
					// console.log(client_id+" tok:"+bearer_token)
					fetch(`https://api.twitch.tv/helix/search/channels?query=${args[2]}`, {
					method: 'GET',
					headers: {
						'Client-Id': client_id,
						'Authorization': 'Bearer ' + bearer_token
					}
				})
				 .then(res => res.json())
				 .then(res => {
					//  console.log(res)
					let myData = res[`data`].filter(obj => obj.broadcaster_login == args[2].toLowerCase())
					myData = myData[0]
					if(myData == undefined) return message.channel.send(`${issuer}, unfortunately I couldn't find that streamer...`)
					fetch(`https://api.twitch.tv/helix/games?id=${myData.game_id}`,{
						method: 'GET',
						headers: {
							'Client-ID': client_id,
							'Authorization': 'Bearer ' + bearer_token
						}
					}).then(res2 => res2.json())
					.then(res2 =>{
						// console.log(res2)
						let gameData = res2[`data`][0]
						console.log(myData)
						let embed = new SharuruEmbed()
						 .setAuthor(`Streamer: ${this.client.utils.capitalise(myData.display_name)}`,`https://cdn.discordapp.com/attachments/768885595228864513/804839366819577866/1593628073916.png`)
						 .setThumbnail(myData.thumbnail_url)
						 .setFooter(`ALL CREDITS FOR MATERIALS ARE GOING TO THEIR RESPECTIVE OWNERS! || Requested by ${issuer.tag} at`, issuer.displayAvatarURL())
						 .setTimestamp()
						 .setColor(myData.is_live ? `RED` : `GREY`)//
						 .setDescription(
							`${myData.is_live ? `🔴` : `🌑`} ${this.client.utils.capitalise(myData.display_name)} is currently ${myData.is_live ? `**live on [Twitch](https://www.twitch.tv/${myData.display_name})**!\n` : `**not live.**`}
							${myData.is_live ? `**Title:** ${myData.title}\n**They are streaming:** ${gameData.name}!\n**Started on:** ${moment(myData.started_at).format(`dddd, MMM Do YYYY, h:mm:ss a`)} *(${moment(myData.started_at).fromNow()})*` : `🎲 Last time they were streaming **${gameData.name}**!\n❓ You can [click here](https://www.twitch.tv/${myData.display_name}) to view ${this.client.utils.capitalise(myData.display_name)}'s channel and click on **follow** to view more awesome content!`}`,
						 )
						 message.channel.send({embeds: [embed] })
					})
				 });
				}));
				 return;
			}
			if (args[1] == 'add' || args[1] == 'ADD') {
				liveSystem.find({
					guild_ID: message.guild.id
				},(err,res)=>{
					if(err){
						sendError.create({
							Guild_Name: message.guild.name,
							Guild_ID: message.guild.id,
							User: issuer.tag,
							UserID: issuer.id,
							Error: err,
							Time: `${TheDate} || ${clock} ${amORpm}`,
							Command: this.name + 'twitch add option',
							Args: args,
						},async (err, res) => {
							if(err) {
								console.log(err)
								return message.channel.send(`Unfortunately an problem appeared while trying to add a twitch streamer. Please try again later. If this problem persist, contact my partner!`)
							}
							if(res) {
								console.log(`successfully added error to database!`)
							}
						})
					}
					if(res){
						if(res.length >= 7)	return message.channel.send(`${issuer}, Unfortunately you can't add channels anymore because you reached the limit imposed for performance! You can have up to 7 streamers, youtube/twitch combined.`)
					}
					fs.createReadStream('./src/Assets/minData.toml','utf8').pipe(concat((data) =>{
						let parsed = toml.parse(data);
						let client_id = parsed.twitch_client_id;
						let client_secret = parsed.twitch_client_secret;
						let bearer_token = parsed.twitch_bearer_token;
						fetch(`https://api.twitch.tv/helix/search/channels?query=${args[2]}`, {
						method: 'GET',
						headers: {
							'Client-ID': client_id,
							'Authorization': 'Bearer ' + bearer_token
						}
					})
					 .then(res => res.json())
					 .then(res => {

						let myData = res[`data`].filter(obj => obj.broadcaster_login == args[2])
						myData = myData[0]
						console.log(myData)
						if(myData == undefined) return message.channel.send(`${issuer}, unfortunately there isn't any twitch streamer with this name! Check again if **"${args[2]}"** is indeed your streamer!`)
						liveSystem.findOne({
							streamerID: myData.id
						},(err,res)=>{
							if(res){
								return message.channel.send(`${issuer}, this streamer is already in my list!`)
							} else {
								liveSystem.create({
									guild_Name: message.guild.name,
									guild_ID: message.guild.id,
									streamer: myData.display_name,
									streamerID: myData.id,
									streamerType: `twitch`,
									isNowLive: false,
									time: clock+" | "+amORpm,
									date: TheDate
								},(err2,res2)=>{
									if(err2){
										sendError.create({
											Guild_Name: message.guild.name,
											Guild_ID: message.guild.id,
											User: issuer.tag,
											UserID: issuer.id,
											Error: err2,
											Time: `${TheDate} || ${clock} ${amORpm}`,
											Command: this.name,
											Args: args,
										},async (err3, res3) => {
											if(err3) {
												console.log(err3)
												return message.channel.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
											}
											if(res3) {
												console.log(`successfully added error to database!`)
											}
										})
									}
									if(res2){
										console.log(`done`)
										return message.channel.send(`${issuer}, I have added **"${myData.display_name}"** to my list and I'll announce every time they go online!`)
									}
								})
							}
	
						})
					});
					}));
				})
				
			return;
			}
			if (args[1] == 'remove' || args[1] == 'del') {
				liveSystem.findOneAndDelete({
					streamerID: args[2]
				},(err,res)=>{
					if(err){
						sendError.create({
							Guild_Name: message.guild.name,
							Guild_ID: message.guild.id,
							User: issuer.tag,
							UserID: issuer.id,
							Error: err,
							Time: `${TheDate} || ${clock} ${amORpm}`,
							Command: this.name + " remove option",
							Args: args,
						},async (err, res) => {
							if(err) {
								console.log(err)
								return message.channel.send(`Unfortunately an problem appeared while trying to remove a streamer. Please try again later. If this problem persist, contact my partner!`)
							}
							if(res) {
								console.log(`successfully added error to database!`)
							}
						})
					}
					if(!res){
						return message.channel.send(`${issuer}, This twitch streamer isn't on my list!`)
					} else {
						console.log(`Deleted a twitch streamer!`)
						return message.channel.send(`${issuer}, done! I have deleted the twitch streamer with id ${args[2]}!`)
					}
				})
			}
			if (args[1] == `list`) {
				liveSystem.find({
					streamerType: `twitch`
				},(err,res)=>{
					if(err){
						sendError.create({
							Guild_Name: message.guild.name,
							Guild_ID: message.guild.id,
							User: issuer.tag,
							UserID: issuer.id,
							Error: err,
							Time: `${TheDate} || ${clock} ${amORpm}`,
							Command: this.name + " list option",
							Args: args,
						},async (err, res) => {
							if(err) {
								console.log(err)
								return message.channel.send(`Unfortunately an problem appeared while trying to list the streamers. Please try again later. If this problem persist, contact my partner!`)
							}
							if(res) {
								console.log(`successfully added error to database!`)
							}
						})
					}
					if(res.length > 0){
						let embed = new SharuruEmbed()
						 .setAuthor(`Currently watching these streamers when they go live!`,`https://cdn.discordapp.com/attachments/768885595228864513/804839366819577866/1593628073916.png`)
						//  .setThumbnail()
						 .setFooter(`ALL CREDITS FOR MATERIALS ARE GOING TO THEIR RESPECTIVE OWNERS! || Requested by ${issuer.tag} at`, issuer.displayAvatarURL())
						 .setTimestamp()
						 .setColor(`PURPLE`)
						 let streamers = ``
						 for(let i = 0; i<res.length; i++){
							streamers+= `**${i+1})** ${res[i].streamer} *(id: ${res[i].streamerID})*\n`
						 }
						 embed.setDescription(streamers+`\n\n*Note: To remove, use ${prefix}livestream yt remove <id of channel>*`)
						 return message.channel.send({embeds: [embed]})
					} else {
						let embed = new SharuruEmbed()
						 .setAuthor(`No streamers so far :(`,`https://cdn.discordapp.com/attachments/768885595228864513/804839366819577866/1593628073916.png`)
						//  .setThumbnail()
						 .setFooter(`ALL CREDITS FOR MATERIALS ARE GOING TO THEIR RESPECTIVE OWNERS! || Requested by ${issuer.tag} at`, issuer.displayAvatarURL())
						 .setTimestamp()
						 .setColor(`PURPLE`)
						 .setDescription(`There isn't any streamer on my list, add some to show!`)
						 return message.channel.send({embeds: [embed]})
					}
				})
			}
		}
		if(args[0] == 'youtube' || args[0] == 'yt'){

			if (args[1] == 'switch') {
				if(res.systems.livestream.enableYT == true){
					res.systems.livestream.enabledYT = false;
					message.channel.send(`${issuer}, I have turned off youtube livestream feature. Youtube streamers won't be announced when they go online!`)
				} else {
					res.systems.livestream.enableYT = true
					message.channel.send(`${issuer}, I have turned on youtube livestream feature. Youtube streamers will be announced when they go online!.`)
				}
				res.save().catch(err=> console.log(err))
				return;
			}
			if (args[1] == 'islive'){

				let ytlink = args[2]
				let chID = ``
				let suck = false
				if(ytlink.includes("/channel/")){
					// let dashes = ytlink.match(/\//gi).length
					ytlink = ytlink.split('/')
					chID = ytlink[4]
					ytlink = "https://www.youtube.com/"+ytlink[3]+"/"+ytlink[4]
				} else if(ytlink.includes("/c/")) {
					suck = true
					ytlink = ytlink.split('/')
					chID = ytlink[4]
					ytlink = "https://www.youtube.com/"+ytlink[3]+"/"+ytlink[4]
				}
				
				getScript(ytlink).then(r=>{//"channelId":"UCN1XO2_eZhxv7lJjAXSfxRw","title":
				let islive = false;
				let getNamePos = r.indexOf(`"channelId":"${chID}","title":`)
				let streamerName = r.substring(getNamePos+48,r.indexOf(`"`,getNamePos+49))

				let getPicPos = r.indexOf(`,"width":48,"height":48},{"url":`)
				let streamerPic = r.substring(getPicPos + 33, r.indexOf(`"`,getPicPos+34))

				let getTvPos = r.indexOf('tvBanner')
				let getTvString = r.substring(getTvPos+8,getTvPos-80)
				getTvString = reverse(getTvString)
				let x = getTvString.indexOf(`ed`)
				getTvString = getTvString.substring(x+2, getTvString.indexOf(`"`,x))
				getTvString = reverse(getTvString);

				let getTitlePos = r.indexOf(`,"width":336,"height":188}]},"title":{"runs":[{"text":"`)
				let streamerTitle = r.substring(getTitlePos+55, r.indexOf(`"}]`,getTitlePos+56))
				let streamerLink = ytlink + "/live"

				if(streamerTitle.length > 70) streamerTitle = `${streamerName}'s live now! Come and check it out!`

				if(suck){
					streamerName = chID
				}
				// console.log(streamerName)
				// console.log(streamerPic)
				// console.log(getTvString)
				// console.log(streamerTitle)
				let mypath = path.join(__dirname,'../../Assets/test.txt')
                fs.writeFile(mypath,r,(err,res)=>{
                    if(err) return console.log(err)
                    if(res) console.log(res)
                    console.log(`Done writing!`)
                })
				if(r.includes('{"text":"LIVE"}')) islive = true
				let embed = new SharuruEmbed()
						.setAuthor(`Streamer: ${streamerName}`,`https://media.discordapp.net/attachments/768885595228864513/805953643987337216/63UVUbGgLqAAAAAElFTkSuQmCC.png`)
						.setThumbnail(streamerPic)
						.setFooter(`ALL CREDITS FOR MATERIALS ARE GOING TO THEIR RESPECTIVE OWNERS! || Requested by ${issuer.tag} at`, issuer.displayAvatarURL())
						.setTimestamp()
						.setColor(islive ? `RED` : `GREY`)
						.setDescription(`${islive ? `🔴` : `🌑`} ${streamerName} is currently ${islive ? `**live on [Youtube](${ytlink}/live)**!\n` : `**not live.**`}
						${islive ? `**Title:** ${streamerTitle}` : ``}
						${islive ? `**Link:** 👉**[Click here to join!](${streamerLink})**👈` : ``}`)
						message.channel.send({embeds: [embed]})
				})
			}
			if (args[1] == 'add'){
				let ytlink = args[2]
				let chID = ``
				let ytMode = ``
				let suck = false
				if(ytlink.includes("/channel/")){
					console.log(`this doesn't sucks`)
					ytlink = ytlink.split('/')
					chID = ytlink[4]
					ytMode = ytlink[3]
					ytlink = "https://www.youtube.com/"+ytlink[3]+"/"+ytlink[4]
				} else if(ytlink.includes("/c/")){
					console.log(`this sucks`)
					suck = true
					ytlink = ytlink.split('/')
					chID = ytlink[4]
					ytMode = ytlink[3]
					ytlink = "https://www.youtube.com/"+ytlink[3]+"/"+ytlink[4]
				}
				liveSystem.find({
					guild_ID: message.guild.id
				},(err,res)=>{
					if(err){
						sendError.create({
							Guild_Name: message.guild.name,
							Guild_ID: message.guild.id,
							User: issuer.tag,
							UserID: issuer.id,
							Error: err,
							Time: `${TheDate} || ${clock} ${amORpm}`,
							Command: this.name + " yt add option",
							Args: args,
						},async (err, res) => {
							if(err) {
								console.log(err)
								return message.channel.send(`Unfortunately an problem appeared while trying to add this yt streamer. Please try again later. If this problem persist, contact my partner!`)
							}
							if(res) {
								console.log(`successfully added error to database!`)
							}
						})
					}
					if(res){
						if(res.length >= 7){
							return message.channel.send(`${issuer}, Unfortunately you can't add channels anymore because you reached the limit imposed for performance! You can have up to 7 streamers, youtube/twitch combined.`)
						}
						liveSystem.findOne({
							streamerID: chID
						},(err,res)=>{
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
										return message.channel.send(`Unfortunately an problem appeared while fetching the data about current streamers added. Please try again later. If this problem persist, contact my partner!`)
									}
									if(res) {
										console.log(`successfully added error to database!`)
									}
								})
							}
							if(res){
								return message.channel.send(`${issuer}, This youtube streamer is already added!`)
							} else {
								getScript(ytlink).then(r=>{
									let getChPos = r.indexOf(`,"header":{"c4TabbedHeaderRenderer":{"channelId":"`)
									let streamerChID = r.substring(getChPos+50,r.indexOf(`"`,getChPos+51))
									let getNamePos = r.indexOf(`"channelId":"${streamerChID}","title":`)
									let streamerName = r.substring(getNamePos+48,r.indexOf(`"`,getNamePos+49))
									if(suck){
										streamerName = chID
									}
									liveSystem.create({
										guild_Name: message.guild.name,
										guild_ID: message.guild.id,
										streamer: streamerName,
										streamerID: streamerChID,
										streamerType: `youtube`,
										streamerYTMode: ytMode,
										isNowLive: false,
										time: clock+" | "+amORpm,
										date: TheDate
									},(err2,res2)=>{
										if(err2){
											sendError.create({
												Guild_Name: message.guild.name,
												Guild_ID: message.guild.id,
												User: issuer.tag,
												UserID: issuer.id,
												Error: err2,
												Time: `${TheDate} || ${clock} ${amORpm}`,
												Command: this.name + " yt command add saving a streamer",
												Args: args,
											},async (err3, res3) => {
												if(err3) {
													console.log(err3)
													return message.channel.send(`Unfortunately an problem appeared while trying to save a streamer from yt. Please try again later. If this problem persist, contact my partner!`)
												}
												if(res3) {
													console.log(`successfully added error to database!`)
												}
											})
										}
										if(res2){
											console.log(`done`)
											return message.channel.send(`${issuer}, I have added ${streamerName} to my list and I'll announce every time they go online!`)
										}
									})
								})
							}
						})
					}
				})

				
			}
			if (args[1] == 'remove' || args[1] == 'del'){
				// if(args[2].length !== 24 && !args[2].includes(`UC`)) return message.channel.send(`${issuer}, please add a valid yt link!`)
				liveSystem.findOneAndDelete({
					streamerID: args[2]
				},(err,res)=>{
					if(err){
						sendError.create({
							Guild_Name: message.guild.name,
							Guild_ID: message.guild.id,
							User: issuer.tag,
							UserID: issuer.id,
							Error: err,
							Time: `${TheDate} || ${clock} ${amORpm}`,
							Command: this.name+ " remove yt option",
							Args: args,
						},async (err, res) => {
							if(err) {
								console.log(err)
								return message.channel.send(`Unfortunately an problem appeared while trying to remove a yt streamer. Please try again later. If this problem persist, contact my partner!`)
							}
							if(res) {
								console.log(`successfully added error to database!`)
							}
						})
					}
					if(!res){
						return message.channel.send(`${issuer}, This youtube streamer isn't on my list!`)
					} else {
						console.log(`Deleted a yt streamer!`)
						getScript(`https://www.youtube.com/channel/${args[2]}`).then(r=>{
							let getNamePos = r.indexOf(`"channelId":"${args[2]}","title":`)
							let streamerName = r.substring(getNamePos+48,r.indexOf(`"`,getNamePos+49))
							return message.channel.send(`${issuer}, done! I have deleted ${streamerName} from my list!`)
						})
					}
				})
			}
			if (args[1] == `list`){
				liveSystem.find({
					streamerType: `youtube`
				},(err,res)=>{
					if(err){
						sendError.create({
							Guild_Name: message.guild.name,
							Guild_ID: message.guild.id,
							User: issuer.tag,
							UserID: issuer.id,
							Error: err,
							Time: `${TheDate} || ${clock} ${amORpm}`,
							Command: this.name+ " list option yt",
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
					if(res.length > 0){
						let embed = new SharuruEmbed()
						 .setAuthor(`Currently watching these streamers when they go live!`,`https://media.discordapp.net/attachments/768885595228864513/805953643987337216/63UVUbGgLqAAAAAElFTkSuQmCC.png`)
						//  .setThumbnail()
						 .setFooter(`ALL CREDITS FOR MATERIALS ARE GOING TO THEIR RESPECTIVE OWNERS! || Requested by ${issuer.tag} at`, issuer.displayAvatarURL())
						 .setTimestamp()
						 .setColor(`RED`)
						 let streamers = ``
						 for(let i = 0; i<res.length; i++){
							streamers+= `**${i+1})** ${res[i].streamer} *(id: ${res[i].streamerID})*\n`
						 }
						 embed.setDescription(streamers+`\n\n*Note: To remove, use ${prefix}livestream yt remove <id of channel>*`)
						 message.channel.send({embeds: [embed]})
					} else {
						let embed = new SharuruEmbed()
						 .setAuthor(`No streamers so far :(`,`https://media.discordapp.net/attachments/768885595228864513/805953643987337216/63UVUbGgLqAAAAAElFTkSuQmCC.png`)
						//  .setThumbnail()
						 .setFooter(`ALL CREDITS FOR MATERIALS ARE GOING TO THEIR RESPECTIVE OWNERS! || Requested by ${issuer.tag} at`, issuer.displayAvatarURL())
						 .setTimestamp()
						 .setColor(`RED`)
						 .setDescription(`There isn't any streamer on my list, add some to show!`)
						 message.channel.send({embeds: [embed]})
					}
				})
			}
			return;
		}
		if(args[0] == 't' && issuer.id == `186533323403689986`){
			if(args[1] == 'tk') {
				fs.createReadStream('./src/Assets/minData.toml','utf8').pipe(concat((data)=>{
					let parsed = toml.parse(data);
					let client_id = parsed.twitch_client_id;
					let client_secret = parsed.twitch_client_secret;
					fetch(`https://id.twitch.tv/oauth2/token?client_id=${client_id}&client_secret=${client_secret}&grant_type=client_credentials`,{
						method: "POST"
					})
					.then(res => res.json())
					.then(res =>{
						console.log(res)
					})
				}));
				return;
			}
			if(args[1] == `bio`){
				fs.createReadStream('./src/Assets/minData.toml','utf8').pipe(concat((data)=>{
					let parsed = toml.parse(data);
					let client_id = parsed.twitch_client_id;
					let client_secret = parsed.twitch_client_secret;
					let bearer_token = parsed.twitch_bearer_token;
					fetch(`https://api.twitch.tv/helix/users/follows?to_id=412889208&first=100`, {//?login=${args[2]}
						method: 'GET',
						headers: {
							'Client-ID': client_id,
							'Authorization': 'Bearer ' + bearer_token,
							'Ratelimit': 'Remaining'
						}
					})
					.then(res => res.json())
					.then(res => {
						console.log(res)
						let twitchDATA = JSON.stringify(res);			
						let mypath = path.join(__dirname,'../../Assets/twitchDATA.json')
						fs.writeFile(mypath,twitchDATA,(err,res)=>{
							if(err) return console.log(err)
							if(res) console.log(res)
							console.log(`Done writing!`)
						})
						// let myData = res[`data`][0]
						// fetch(`https://api.twitch.tv/helix/users/follows?to_id=${myData.id}`,{
						// 	method: 'GET',
						// 	headers: {
						// 		'Client-ID': client_id,
						// 		'Authorization': 'Bearer' + bearer_token
						// 	}
						// })
						// .then(res => res.json())
						// .then(res => {
						// 	let followers = res.total;
						// 	let embed = new SharuruEmbed()
						// 	.setAuthor(`Streamer: ${myData.display_name}`,`https://cdn.discordapp.com/attachments/768885595228864513/804839366819577866/1593628073916.png`)
						// 	.setColor(`RANDOM`)
						// 	.setDescription([
						// 		// `**Streamer ID:** ${myData.id}`,
						// 		`**Description**: ${myData.description ? myData.description : `No description set`}`,
						// 		`${myData.broadcaster_type ? `**Affiliated/Partner?:** ${this.client.utils.capitalise(myData.broadcaster_type)}` : ``}`,
						// 		`**Is followed by:** ${abbreviateNumber(followers)} people!`,
						// 		`**Views count:** ${abbreviateNumber(myData.view_count)}!`,
						// 	])
						// 	.setFooter(`ALL CREDITS FOR MATERIALS ARE GOING TO THEIR RESPECTIVE OWNERS!  || Requested by ${issuer.tag} at `)
						// 	.setTimestamp()
						// 	.setThumbnail(myData.profile_image_url)
						// message.channel.send({embeds: [embed]})
						// })
						
					});
				}))
				return 
			}
		}

	}

};
