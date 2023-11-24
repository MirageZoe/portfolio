/* eslint-disable no-unused-vars */
const SharuruEmbed = require("../../Structures/SharuruEmbed");
const userProfileDATA = require("../../Models/profiles");
const Command = require('../../Structures/Command.js');
const sendError = require('../../Models/Error');
const pinSys = require('../../Models/pins.js');
const concat = require('concat-stream');
const toml = require('toml');
const path = require("path");
const fs = require('fs');
const ms = require('ms');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require("discord.js");

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'mypins',
			displaying: true,
			description: 'Save messages for later if you need them!',
			options: '\n- \`list\` => shows your pins!\n- \`delete\` => deletes one of your pins!',
			usage: ' https://discord.com/channels/123456789101112131/415161718192021222/324252627282930313  => it will pin this message for you!',
			example: ' delete 32 => it will delete pin #32 (if you have 32)',
			category: 'utilities',
			userPerms: [PermissionsBitField.Flags.SendMessages],
			SharuruPerms: [PermissionsBitField.Flags.SendMessages],
			args: false,
			guildOnly: true,
			ownerOnly: false,
			aliases: ['mp','pin']
		});
	}

	async run(message, args) {
		// eslint-disable-next-line id-length

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
		let dM = this.client.utils
        const dateAndHour = TheDate + " |\| " + clock + " " + amORpm;
		const sharuru = this.client;
		const prefix = this.client.prefixes.get(message.guild.id)
		let tempPreview = ``
		let NewPinID = null;
		let optionsChecked = {
			"-p": false
		}
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

		async function getPreviewOfLink(link) {
			let urlArray = link.split('/');
            let urlId = urlArray[urlArray.length - 1];
			let getchannel = urlArray[urlArray.length - 2];
			try {
				let giveMeMessage = await sharuru.channels.cache.get(getchannel).messages.fetch(urlId)
				let sliceThis = giveMeMessage.content.slice(0,25)
				tempPreview += sliceThis
				console.log(tempPreview)
				console.log(`got the preview! Saving it...`)
			} catch (error) {
				console.log(error)
				console.log(`The message link is either broken,I can't see the channel where the message link is coming from or the message itself was deleted.`);
				return message.channel.send(`I'm sorry but I can't do anything with this link because:\n- the message link is broken;\n- I can't see the channel where message is coming from;\n- the message itself was deleted.`)
			}
		}

		//.replace(/(?:<@&|>)/g,"") ====>> removes the symbols from mentions
        if(!args[0]){
            return message.channel.send(`Please add a link to the message to pin!`).then(msg => dM.deleteMsg(msg,'3.5s'))
        }

		if (args[0] == 't')
		{
			await userProfileDATA.findOne({
				userID: issuer.id
			},(err,res)=>{
				if (err) console.log(err)
				if (res) {
					// console.log(res)
					// let test = res.pinNumber;
					NewPinID = res.pinNumber
					res.pinNumber++;
					res.save().catch(err => console.log(err))
				}
			})
			console.log(`Did it work?: ${NewPinID}`)
			console.log(`Work2: ${NewPinID}`)
			return console.log(`done`)
		}

        if(args[0] == 'list'){
            pinSys.find({
                userID: issuer.id
            }, (err, results) =>{
                if(err) {
                    console.log(`[${dateAndHour}] I couldn't load all pins of ${issuer} because:\n\n${err}\n\n`);
					// message.channel.send(`Oops, something bad happened. Tell to my partner that an error happened while using this command!!`)
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
							return message.channel.send(`Unfortunately an problem appeared while trying to pin a message in my db. Please try again later. If this problem persist, contact my partner!`)
						}
						if(res) {
							console.log(`successfully added error to database!`)
						}
					})
                    return;
                }
                if(!results){
                    return message.channel.send(`You don't have any pins! Add a new pin using \`c!mypins <link to the message>\`! for more info, use \`${prefix}help mypins\``)
                } else {
                    let N = results.length;
					let N_private = 0;
                    console.log(`My pins: ${N}`);
					let listOfPrivatePins = ``
                    let listOfPublicPins = ``;
                    for(let i = 0; i<N; i++){
						if (results[i].isPrivate == true) {
							N_private++;
							listOfPrivatePins += `\n**[Pin #${results[i].pinID}]**: ${results[i].messagePinned}... [Click me](${results[i].linkToMessagePinned})`;
						} else listOfPublicPins += `\n**[Pin #${results[i].pinID}]**: ${results[i].messagePinned}... [Click me](${results[i].linkToMessagePinned})`;
                    }
                    // if(N == 0) listOfPublicPins = `You don't have any pin! Add more pins if you want to see something here`
                    let pinsEmbed = new SharuruEmbed()
                    .setAuthor(`${issuer.username}'s pins [${N - N_private}]:`)
                    .setDescription(`${listOfPublicPins}`)
					.setColor("LUMINOUS_VIVID_PINK")
					console.log(`currently having ${N_private} private pins`)
					//button
					const row = new ActionRowBuilder()
					.addComponents(
						new ButtonBuilder()
						.setCustomId('mypins_private')
						.setEmoji("📌")
						.setLabel("Show private pins")
						.setStyle(ButtonStyle.Secondary)
					)
                    message.channel.send({embeds: [pinsEmbed], components: [row] }).then(async msg =>{

						const collector = message.channel.createMessageComponentCollector({
							componentType: 'BUTTON',
							time: 1000 * 15
						})
						row.components[0].setDisabled(true);
						row.components[0].setLabel("Private pins sent in DM!")
						pinsEmbed.setDescription(`${listOfPrivatePins}`)
						.setAuthor(`${issuer.username}'s private pins [${N_private}]:`)

						collector.on('collect', i => {
							// console.log(i)
							if (i.user.id != message.author.id) return i.reply({content: "You can't use this!", ephemeral: true});
							if (i.customId == 'mypins_private') {
								i.deferUpdate();
								message.author.send({embeds: [pinsEmbed]}).catch(e =>{
									if (e.httpStatus == 403)
										message.channel.send(`It seems like something broke... :(\nPlease try again the command and make sure you're allowing me to dm you (aka allow in privacy to receive messages from server members!)`)
									if (e.httpStatus != 403)
										message.channel.send(`It seems like something broke... :(\nPlease tell my partner about this error: ${e.httpStatus}\n${e.message}`)
								})
								msg.edit({components: [row]})
							}
						})

						collector.on("end", i =>{
							msg.edit({components: []})
						})
					})
                }
            })
			return;
		} // to do list. DO NOT FORGET TO MAKE THE PINS SAVE USING THE NEW PARSER
		
		if(args[0] == 'delete'){
			if(isNaN(args[1])) return message.reply(`The pins have an ID that is made out of a number only! Check again!`)
            pinSys.findOne({
                pinID: args[1]
            },(err, results) =>{
                if(err){
                    console.log(`[${dateAndHour}] I couldn't remove pin ${args[1]} because:\n\n${err}\n\n`);
					// message.channel.send(`Oops, something bad happened. Tell to my partner that an error happened while using this command!!`)
					sendError.create({
						Guild_Name: message.guild.name,
						Guild_ID: message.guild.id,
						User: issuer.tag,
						UserID: issuer.id,
						Error: err,
						Time: `${TheDate} || ${clock} ${amORpm}`,
						Command: this.name + " delete option",
						Args: args,
					},async (err, res) => {
						if(err) {
							console.log(err)
							return message.channel.send(`Unfortunately an problem appeared while trying to delete the pin. Please try again later. If this problem persist, contact my partner!`)
						}
						if(res) {
							console.log(`successfully added error to database!`)
						}
					})
                    return;
                }
                if(!results) return message.channel.send(`There isn't such a pin! Make sure you check your list again!`)
                let getUserID = results.userID;
                if(issuer.id == getUserID){
                    pinSys.findOneAndDelete({
                        pinID: args[1]
                    },(err, results2)=>{
                        if(err){
                            console.log(`[${dateAndHour}] I couldn't remove pin ${args[1]} because:\n\n${err}\n\n`);
							// message.channel.send(`Oops, something bad happened. Tell to my partner that an error happened while using this command!!`)
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
                            return;
						}
						if(results2){
							return message.channel.send(`I have deleted your pin #${args[1]}!`)
						}
                    })
                } else {
                    return message.channel.send(`There's no such a pin in your collection! Check your pin list again!`)
                }
            })
		}
		//checks for discord link if meets the requirements
		// if(message.content){
		console.log(`checking...`)
		let doesntInclude = ``
		let urlArray = message.content.split('/');
		let serverID = urlArray[urlArray.length - 3];
		if(!message.content.includes('https://discord.com')) doesntInclude +=`\n- an official discord message link;`
		if(message.channel.type != 'GUILD_TEXT') doesntInclude += `\n- in a discord server;`
		if(message.guild.id !== serverID) doesntInclude += `\n- in the same discord server where the command was used;`;
		if(doesntInclude.length > 0) return message.channel.send(`Please make sure your message link is:\n${doesntInclude}`)
		// }

		getPreviewOfLink(args[0])
		// fs.createReadStream("./src/Assets/minData.toml",'utf8').pipe(concat((data)=>{
		// 	let parsed = toml.parse(data);
		// 	NewPinID = parsed.pins;
		// 	parsed.pins += 1;
		// 	let newData = SimpleJsonToToml(parsed);
		// 	let mypath = path.join(__dirname,'../../Assets/minData.toml')
        //         fs.writeFile(mypath,newData,(err,res)=>{
        //             if(err) return console.log(err)
        //             if(res) console.log(res)
        //             console.log(`Done writing!`)
        //         })
		// }));
		if (args.length > 1) {
			const pinOptions = ['-p']
			let optionsProvided = args.slice(1)
			for(let i = 0; i < optionsProvided.length; i++)
				if (pinOptions.includes(optionsProvided[i])) optionsChecked[optionsProvided[i]] = true
		}
		await pinSys.countDocuments({
				userID: issuer.id
			}, async (err, results)=> {
				if(err){
					console.log(`[${dateAndHour}] I couldn't add the pin of ${issuer.username} because:\n\n${err}\n\n`);
					// message.channel.send(`Oops, something bad happened. Tell to my partner that an error happened while using this command!!`)
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
					return;
				}
				if (results >= 25)
					return message.channel.send(`Limit reached! Delete some of your pins to add new ones!`).then(m => dM.deleteMsg(m,'3.5s'))
				await userProfileDATA.findOne({
					userID: issuer.id
				},(err,res)=>{
					if (err) console.log(err)
					if (res) {
						// console.log(res)
						// let test = res.pinNumber;
						NewPinID = res.pinNumber
						res.pinNumber++;
						res.save().catch(err => console.log(err))
					}
				})
				// console.log(NewPinID)
				await pinSys.create({
					pinID: NewPinID,
					username: issuer.tag,
					userID: issuer.id,
					fromGuildID: message.guild.id,
					guildName: message.guild.name,
					channelID: message.channel.id,
					linkToMessagePinned: args[0],
					messagePinned: tempPreview,
					isPrivate: optionsChecked['-p'] ? true : false,
					date: TheDate + " | " + clock + " " + amORpm,
				}, (err, results2) =>{
					if(err){
						console.log(`[${dateAndHour}] I couldn't add the pin of ${issuer.username} because:\n\n${err}\n\n`);
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
								return message.channel.send(`Unfortunately an problem appeared while trying to add a pin for a user. Please try again later. If this problem persist, contact my partner!`)
							}
							if(res) {
								console.log(`successfully added error to database!`)
							}
						})
						return;
					}
					if(results2){
						let addedPin = new SharuruEmbed()
							.setAuthor(`Awesome!`)
							.setColor(`LUMINOUS_VIVID_PINK`)
							.setDescription(optionsChecked["-p"] == true ? `You pinned a private message!` : `You pinned a message!`)
							.setTimestamp()
						message.channel.send({embeds: [addedPin]}).then(msg => dM.deleteMsg(msg,"3.5s"))
					}
				})//adding the pin
			})//CHECKING IF IT HAS OVER THE LIMIT
    }//end of command
};
