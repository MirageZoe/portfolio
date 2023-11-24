/* eslint-disable no-unused-vars */
const Command = require('../../Structures/Command.js');
const sendError = require('../../Models/Error');
const giveawayModel = require('../../Models/giveaways');
const SharuruEmbed = require('../../Structures/SharuruEmbed')
const fs = require('fs');
const ms = require('ms');
const pms = require("pretty-ms")
const cfg = require("../../../config.json")
const GuildSettings = require('../../Models/GuildSettings.js');
const green = `#00ff00`;
const red = `#ff0066`;
const { PermissionsBitField } = require('discord.js');


module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'raffle',
			displaying: true,
			cooldown: 3000,
			description: '',
			options: `\n- \`ban <@mention> [giveaway id]\` => bans a member from being selected as a potential winner in the future giveaways.
            Using the command with same person unbans them. Providing the [giveaway id] will ban the member from current giveaway, otherwise it will be banned from future giveaways excluding the active ones.
            \n- \`banlist\` => shows a list of banned users from future giveaways. Automatic bans from giveaways won't ban members from current giveaways.
            \n- \`list\` => shows a list of giveaways that happened in the server.
            \n- \`close <giveaway id>\` => It's forcing the giveaway to end with no winner(s) selected. To get the giveaway id, use the \`list\` option.
            \n- \`reroll <giveaway id>\` => It will reroll a giveaway that ended, choosing new people that won. To get the giveaway id, use the \`list\` option.
            \n- \`quick <options>\` => This option let you create a quick giveaway without going through the guide.\nTemplate: !raffle quick #channel, how much it last(15min,1h,10days), winners count(1,3,6), prize, generous person that is giving away, message for participants.
            \n- \`finish <giveaway id>\` => It ends a giveaway selecting winners as well. To get the giveaway id, use the \`list\` option.`,
			usage: 'raffle',
			example: '',
			category: 'moderation',
			userPerms: [PermissionsBitField.Flags.ManageMessages, PermissionsBitField.Flags.ManageEmojisAndStickers, PermissionsBitField.Flags.UseExternalEmojis],
			SharuruPerms: [PermissionsBitField.Flags.ManageMessages, PermissionsBitField.Flags.ManageEmojisAndStickers, PermissionsBitField.Flags.UseExternalEmojis],
			args: false,
			guildOnly: true,
			ownerOnly: true,
			roleDependable: '0', // not 0, either id or name
			allowTesters: true,
			aliases: ['r']
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
		const logChannel = message.guild.channels.cache.find(ch => ch.name == "sharuru-logs");
		const prefix = this.client.prefixes.get(message.guild.id);
		const momentOfStart = Date.now() + 120000
		const issuer = message.author;
		const tools = this.client.utils

		let amORpm;
		if (hrs >= 0 && hrs <= 12) {
			amORpm = 'AM';
		} else {
			amORpm = 'PM';
		}
		async function messageFetcher (_messageID, _targetedChannel, _CustomError) {
			let foundMessage = new String();
			
			// Check if the message contains only numbers (Beacause ID contains only numbers)
			if (!Number(_messageID)) return 'FAIL_ID=NAN';
		
			// Check if the Message with the targeted ID is found from the Discord.js API
			try {
				await Promise.all([_targetedChannel.messages.fetch(_messageID)]);
			} catch (error) {
				// Error: Message not found
				if (error.code == 10008) {
                    if(_CustomError != undefined || _CustomError != null) {
                        console.log(_CustomError)
                    } else {
                        console.error('Failed to find the message! Setting value to error message...');
                    }
					foundMessage = 'MESSAGE_NOT_FOUND';
				}
			} finally {
				// If the type of variable is string (Contains an error message inside) then just return the fail message.
				if (typeof foundMessage == 'string') return foundMessage;
				// Else if the type of the variable is not a string (beacause is an object with the message props) return back the targeted message object.
				return _targetedChannel.messages.fetch(_messageID);
			}
        }

        function toMention(arrayOfIds){
            let mentions = []
            if(arrayOfIds.length == 0) return false
            arrayOfIds.forEach(element => {
                mentions.push(`<@${element}>`)
            });
            return mentions
        }
		let giveaway_options = {
			channel: null,
			time: null,
        	winners: null,
        	prize: null,
        	theMessage: null
		}
		let questions = [
			`:tada: Hello ${issuer}, this is a setup to create a giveaway. Please mention a channel. Cancel setup by typing "cancel":`,
			`Please provide the giveaway duration (e.g: 10min,1h, 1d):`,
			`Please provide the amount of winners now:`,
			`Please provide the name of the prize:`,
			`Now lastly, please provide a message from host/sponsor for the participants. Time limit for writing message: 5min.`
		]
		const filter = m => m.author.id === message.author.id;

		//#region Start the setup of giveaway + EMBED
		let initialSetup = true
		let i = 0;
		while (initialSetup == true & i <= 4) {
			// for (let i = 0; i < questions.length; i++) {
				// const element = questions[i];
				await message.channel.send(questions[i]);
				await message.channel.awaitMessages({filter,max: 1, time: 300000}).then(rawAnswer =>{
					if(rawAnswer.first().content == "cancel" || rawAnswer.first().content == "stop") {
						initialSetup = false;
						return message.channel.send(`${issuer}, I have canceled the setup of the giveaway!`);
					}
					if (i == 0) giveaway_options.channel = rawAnswer.first().mentions.channels.first().id;
					if (i == 1) giveaway_options.time = ms(rawAnswer.first().content.replace(/\s/g,""))
					if (i == 2) giveaway_options.winners = rawAnswer.first().content
					if (i == 3) giveaway_options.prize = rawAnswer.first().content
					if (i == 4) giveaway_options.theMessage = rawAnswer.first().content
				})
				i++;
			// }
		}
			
		
		let giveawaySetupEmbed = new SharuruEmbed()
			.setColor(`LUMINOUS_VIVID_PINK`)
			.setFooter(`Giveaway setup is closing in: ${pms(momentOfStart - Date.now())}`,issuer.displayAvatarURL({dynamic: true}))
			.setTitle(`${issuer.tag}, I got the following things below:`)
			.setDescription(`Type \`cancel\`/\`start\` to stop/start the giveaway earlier.
To edit an option: \`keyword: new value\`. E.g: \`winners: 5\`
P.S: The double dots "\`:\`" are mandatory.`)
			.addFields([
				{name: `★ Giveaway Channel: (keyword: \`channel\`)`, value: giveaway_options.channel ? `<#${giveaway_options.channel}>` : `Not set up`, inline: false},
				{name: `★ Giveaway Duration: (keyword: \`time\`)`, value: giveaway_options.time ? pms(giveaway_options.time) :  `Not set up`, inline: false},
				{name: `★ Number of winners: (keyword: \`winners\`)`, value: giveaway_options.winners ? giveaway_options.winners : `Not set up`, inline: false},
				{name: `★ Giveaway Prize: (keyword: \`prize\`)`, value: giveaway_options.prize ? giveaway_options.prize : `Not set up`, inline: false},
				{name: `★ Message from host/sponsor: (keyword: \`message\`)`, value: giveaway_options.theMessage ? giveaway_options.theMessage : `Not set up`, inline: false},
			])
		//#endregion
		
		//#region Edit giveaway options
		if (initialSetup != false)
			await message.channel.send({embeds: [giveawaySetupEmbed]}).then(async msg=>{
				let timerSetup = setInterval(() => {
					giveawaySetupEmbed.setFooter(`Giveaway setup is closing in: ${pms(momentOfStart - Date.now())}`,issuer.displayAvatarURL({dynamic: true}))
					msg.edit({embeds: [giveawaySetupEmbed]})
				}, 10000);
				let editGiveaway = true;
					while (editGiveaway) {
						try {
							await message.channel.awaitMessages({filter, time:120000, max:1}).then(editCollector=>{
								if(editCollector.first().content == "cancel"  || editCollector.first().content == `stop`) {
									clearInterval(timerSetup)
									editGiveaway = false
									return message.channel.send(`${issuer}, Okay, canceled creation of the giveaway!`);
								}
								if(editCollector.first().content == "start") {
									clearInterval(timerSetup)
									editGiveaway = false
									let giveawayEmbed = new SharuruEmbed()
										.setAuthor(`Prize: ${giveaway_options.prize} | ${giveaway_options.winners} Winner(s)`)
										.setDescription(`A giveaway started! React with :tada: to enter!\n\nEnds at: <t:${parseInt((Date.now()+giveaway_options.time)/1000)}> <t:${parseInt((Date.now()+giveaway_options.time)/1000)}:R>`)
										.addField('\u200b', '\u200b')
										.addField(`Message from the host/sponsor:`, giveaway_options.theMessage)
										.setColor('GREEN')
										.setFooter(`Started at: <t:${Date.now()}>`)
									let giveawayChan = this.client.channels.cache.find(chan => chan.id === giveaway_options.channel)
									giveawayChan.send({embeds: [giveawayEmbed] }).then(r =>{
										r.react("🎉")
									setTimeout(() => {
										giveawayModel.create({
											messageID: r.id,
											channelID: r.channel.id,
											guildID: r.guild.id,
											startAt: Date.now(),
											endAt: giveaway_options.time + Date.now(),
											ended: false,
											winnerCount: giveaway_options.winners,
											prize: giveaway_options.prize,
											messagesG: giveaway_options.theMessage,
										})
									}, 1000);
									})
									return message.channel.send(`${issuer}, Okay, started the giveaway!`).then(m => tools.deleteMsg(m,'3.5s'));
								}
								let theResponse = editCollector.first().content
								let getIndexDoubleDots = theResponse.indexOf(":")
								let extractName = theResponse.substring(0,getIndexDoubleDots)
								let extractValue = theResponse.substring(getIndexDoubleDots+1)
								//#region Assign the new values if edited
									if (extractName == `channel`) {
										console.log(`New Channel detected!`)
										if (editCollector.first().mentions.channels) {
											giveaway_options.channel = editCollector.first().mentions.channels.first().id
										} else return message.channel.send(`${issuer}, there wasn't any channel mentioned. Please try again!`).then(m => tools.deleteMsg(m,"3.5s"))
									}
									console.log(extractName)
									if (extractName == `time`) {
										extractValue = extractValue.replace(/\s/g,"")
										let timesuf = ['s','min','h','hour','hours','d','days','w','weeks']
										if (checkForItems(extractValue,timesuf,"includes")) {
											giveaway_options.time = ms(extractValue);
											console.log(`contain not months`)
										}
										if (checkForItems(extractValue,['mon','months'],"includes")){
											console.log(`collected: `+extractValue)
											let pleasework = extractValue.replace(/\s/g,'')
											let response = parseInt(pleasework)
											console.log(`after parsing: ${response}`)
											let month = 2629746000
											displayTime = response
											giveaway_options.time = response * month
											console.log(`months: `+giveaway_options.time)
										}
										if (isNaN(giveaway_options.time)) {
											return message.channel.send(`${issuer}, that doesn\'t seem to be a valid number for time. Please try again.`).then(m => tools.deleteMsg(m,"3.5s"));
										}
										if (giveaway_options.time < 299999 || giveaway_options.time > 31557600000){
											return message.channel.send(`${issuer}, you can't make a giveaway that isn't lasting 5 min or last more than 1 year! Please try again.`).then(m => tools.deleteMsg(m,"3.5s"));
										}
									}
									if (extractName == `winners`) {
										if (isNaN(extractValue)) return message.channel.send(`${issuer}, that doesn\'t seem to be a valid number. Please try again.`).then(m => tools.deleteMsg(m,"3.5s"));
										giveaway_options.winners = extractValue
									}
									if (extractName == `prize`) giveaway_options.prize = extractValue
									if (extractName == `message`) giveaway_options.theMessage = extractValue
								//#endregion

								//#region Apply the settings
								giveawaySetupEmbed.fields[0].value = `<#${giveaway_options.channel}>`
								giveawaySetupEmbed.fields[1].value = pms(giveaway_options.time)
								giveawaySetupEmbed.fields[2].value = giveaway_options.winners
								giveawaySetupEmbed.fields[3].value = giveaway_options.prize
								giveawaySetupEmbed.fields[4].value = giveaway_options.theMessage
									//#endregion
								msg.edit({embeds: [giveawaySetupEmbed]})
								editCollector.first().delete();
							})
						} catch (error) {
							console.log(error)
							editGiveaway = false;
							clearInterval(timerSetup)
						}
					}
			});
		//#endregion
		console.log(giveaway_options)
		return console.log(`done`);
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
	}
};
