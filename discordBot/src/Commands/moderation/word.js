/* eslint-disable no-unused-vars */
const Command = require('../../Structures/Command.js');
const sendError = require('../../Models/Error');
const fs = require('fs');
const ms = require('ms');
const cfg = require('../../../config.json');
const GuildSettings = require('../../Models/GuildSettings.js');
const SharuruEmbed = require('../../Structures/SharuruEmbed.js');
const { PermissionsBitField } = require('discord.js');


module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'word',
			displaying: true,
			description: 'This stops people from saying a word in chat. If it\'s said, it will be deleted instantly.',
			options: `
			- \`switch\` => Turns on/off the word system
			- \`add <word>\` => Ban a word
			- \`remove <word>\` => Unban a word.
			- \`list\` => Gets a list of banned words & protected words/members/roles.
			- \`delete\` => delete all banned words (unban them all in other words).
			- \`protect <word/member/role> <word/@member/@role>\` => protect a word, member or role from being subject to the system.\n\nTL;DR: you can say banned words.\ne.g: \`word protect word example\` => everyone can use "example".\n\`word protect member @bob\` => it will allow bob to say banned words.\ne.g2: \`word protect role @admins\` => it will protect everyone that owns the role \`admins\`.
			- \`autowarn <switch/type> <type: shard/frostfang/blackice>\` => This feature, if enabled, will allow Sharuru to warn people. You can set only one of the 3: shard/frostfang & blackice `,
			usage: ' add <word> / remove <word>',
			example: ' add example => the word [example] will be added to the list of forbidden words',
			category: 'moderation',
			userPerms: [PermissionsBitField.Flags.ManageMessages,PermissionsBitField.Flags.ManageRoles],
			SharuruPerms: [PermissionsBitField.Flags.ManageMessages,PermissionsBitField.Flags.ManageRoles],
			args: true,
			guildOnly: true,
			ownerOnly: false,
			// aliases: ['']
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

		let amORpm;
		if (hrs >= 0 && hrs <= 12) {
			amORpm = 'AM';
		} else {
			amORpm = 'PM';
		}

		const prefix = this.client.prefixes.get(message.guild.id);
		const options = ['add','remove','delete','list','switch','protect','autowarn'];
		const chosenOption = args[0];
		const subOption = args[1];
		const issuer = message.author;
		let bannedWord = args.slice(1).join(' ');

		
		if(options.indexOf(chosenOption) === -1){
			return message.channel.send(`${issuer}, Sadly there isn't such an option like **\`${chosenOption}\`**. For a list of options, please type ${prefix}help word.`);
		}
		
			GuildSettings.findOne({
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
							return message.channel.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
						}
						if(res) {
							console.log(`successfully added error to database!`)
						}
					})
				}//end of error
				// setTimeout(() => {
					if(res){
						//add
						if(options.indexOf(chosenOption) === 0){
							if(res.systems.blacklistWord.words.includes(bannedWord)) return message.channel.send(`${issuer}, This word, \`${bannedWord}\`, is already banned.`);
							res.systems.blacklistWord.words.push(bannedWord)
							console.log(`${issuer.tag} (${issuer.id}) added "${bannedWord}" word in ${message.guild.name} (${message.guild.id})`)
							message.channel.send(`${issuer}, I have banned **\`${bannedWord}\`** from being used!`);
						}
						//remove
						if(options.indexOf(chosenOption) === 1){
							if(!res.systems.blacklistWord.words.includes(bannedWord)) {
								console.log(`${issuer.tag} (${issuer.id}) tried to remove a banned word, "${bannedWord}", but the word wasn't in the list. ${message.guild.name} (${message.guild.id})`);
								return message.channel.send(`${issuer}, There is no such **\`${bannedWord}\`** word banned. Please check the list again with: \`${prefix}word list\`.`);
							}
							let getIndex = res.systems.blacklistWord.words.findIndex(index => index === bannedWord);
							res.systems.blacklistWord.words.splice(getIndex,1)
							message.channel.send(`${issuer}, I have unbanned **\`${bannedWord}\`**.`);
						}
						//delete
						if(options.indexOf(chosenOption) === 2){
							message.channel.send(`${issuer}, Are you sure you wanna delete entire list? You have 30 seconds. Type \`yes\` or \`no\`. Other answers will be considered \`no\`.`);
							const filter = m => m.author.id === message.author.id;
							message.channel.awaitMessages({filter,max: 1, time: 30000}).then(answer => {
								if(answer.first().content === 'yes'){
									console.log(`${issuer.tag} (${issuer.id}) reset the list in ${message.guild.name} (${message.guild.id}).`)
									res.systems.blacklistWord.words = []
									message.channel.send(`${issuer}, As you wish, I have deleted the entire list.`);
								}else {
									message.channel.send(`${issuer}, ok not doing anything with the list...`)
								}
						})
						}
						//list of banned words, protected words/members/roles
						if(options.indexOf(chosenOption) === 3){
							
							let protected_users = []//res.blacklist_protected_people;
							let protected_roles = []//res.blacklist_protected_roles;
							let protected_words = []

							//#region iterating through the lists and adding them to show if any
							if(res.systems.blacklistWord.protected.people.length !== 0) {
								for(let i = 0; i< res.systems.blacklistWord.protected.people.length; i++){
									let replaceThis = `<@${res.systems.blacklistWord.protected.people[i]}>`;
									protected_users.push(replaceThis)
								}
								protected_users = protected_users.join(" | ")
							}
							if(res.systems.blacklistWord.protected.roles.length !== 0) {
								for(let i = 0; i< res.systems.blacklistWord.protected.roles.length; i++){
									let replaceThis = `<@&${res.systems.blacklistWord.protected.roles[i]}>`;
									protected_roles.push(replaceThis)
								}
								protected_roles = protected_roles.join(" | ")
							}
							if(res.systems.blacklistWord.protected.words.length !== 0) {
								for(let i = 0; i< res.systems.blacklistWord.protected.words.length; i++){
									// let replaceThis = `${res.systems.blacklistWord.protected.words[i]}`;
									protected_words.push(res.systems.blacklistWord.protected.words[i])
								}
								protected_words = protected_words.join(" | ")
							}
							//#endregion

							if(protected_roles.length == 0) protected_roles = `Empty`;
							if(protected_users.length == 0) protected_users = `Empty`;
							if(protected_words.length == 0) protected_words = `Empty`;

							let wEmbed = new SharuruEmbed()
							.setAuthor(`Currently I have:`,this.client.user.displayAvatarURL())
							.setColor(cfg.pink)
							.setTimestamp()
							.addFields(
								{name:`Banned words:`,value: `${res.systems.blacklistWord.words.length > 0 ? res.systems.blacklistWord.words.join(" | ") : "Empty"}`},
								{name:`Protected Roles:`,value: protected_roles},
								{name:`Protected Members:`,value: protected_users},
								{name:`Protected Words:`,value: protected_words}
							)
							.setFooter(`Requested by ${issuer.tag}.`)
							return message.channel.send({embeds: [wEmbed] })
						}
						//switch
						if(options.indexOf(chosenOption) === 4){
							if(!res.systems.blacklistWord.mode) res.systems.blacklistWord.mode = false
							if (res.systems.blacklistWord.mode == true) {
								res.systems.blacklistWord.mode = false;
								message.channel.send(`${issuer}, The word system is now disabled!`);
							} else {
								res.systems.blacklistWord.mode = true;
								message.channel.send(`${issuer}, The word system is now enabled!`);
							}
						}
						//protect roles/people/words
						if(options.indexOf(chosenOption) === 5){
							if (!subOption) return message.channel.send(`${issuer}, If you wanna protect a **role**, please specify \`role\` after \`protect\`.\nIf you wanna protect a **member**, please specify \`member\` after \`protect\`.\nIf you wanna see what you're protecting, please specify \`list\` after \`protect\`.`)
							bannedWord = args.slice(2).join(' ').toLowerCase();
							console.log(bannedWord)
							if (subOption == 'role'){
								try {
									let role = message.mentions.roles.first();
									if(message.guild.roles.cache.find(r=> r.id == role?.id)){
										if(res.systems.blacklistWord.protected.roles.includes(role)){//remove it if it's there
										let getIndex = res.systems.blacklistWord.protected.roles.findIndex(r=> r = role)
										res.systems.blacklistWord.protected.roles.splice(getIndex,1);
										message.channel.send(`${issuer}, I have removed ${role} from being a protected role!`)
										} else {
											res.systems.blacklistWord.protected.roles.push(role)
											message.channel.send(`${issuer}, I have added ${role} as a protected role!`)
										}
									}
								} catch (error) {
									console.log(error)
									return message.channel.send(`${issuer}, It seems like you didn't provided a mention. Please mention the role you want to protect!`)
								}
							}
							
							if (subOption == 'member'){
								try {
									let thismember = message.mentions.users.first();
									if(res.systems.blacklistWord.protected.people.includes(cfg.owners) && thismember?.id == cfg.owners) return message.channel.send(`${issuer}, No no no...`)
									if(message.guild.members.cache.get(thismember?.id))
										if(res.systems.blacklistWord.protected.people.includes(thismember.id)){//remove it if it's there
											let getIndex = res.systems.blacklistWord.protected.people.findIndex(r=> r == thismember.id)
											res.systems.blacklistWord.protected.people.splice(getIndex,1);
											message.channel.send(`${issuer}, I have removed ${thismember} from being a protected member!`)
										}else{
											res.systems.blacklistWord.protected.people.push(thismember.id)
											message.channel.send(`${issuer}, I have added ${thismember} as a protected member!`)
										}
								} catch (error) {
									console.log(error)
									return message.channel.send(`${issuer}, It seems like you didn't provided a mention or this member doesn't exist anymore in the guild.`)
								}
							}

							if (subOption == "word") {
								let addedWord = false;
								if (!bannedWord) return message.channel.send(`${issuer}, please specify a word!`)

								// if the word doesn't exist in protected words, add it
								if(!res.systems.blacklistWord.protected.words.includes(bannedWord)) {
									addedWord = true;
									console.log(`${issuer.tag} (${issuer.id}) added "${bannedWord}" as protected word in ${message.guild.name} (${message.guild.id})`)
									res.systems.blacklistWord.protected.words.push(bannedWord)
									message.channel.send(`${issuer}, I've added \`${bannedWord}\` as protected word.`);
								}
								
								// if the word exist in protected words, remove it
								if(res.systems.blacklistWord.protected.words.includes(bannedWord) && addedWord == false) {
									console.log(`${issuer.tag} (${issuer.id}) removed "${bannedWord}" from being a protected word in ${message.guild.name} (${message.guild.id})`)
									let getIndex = res.systems.blacklistWord.protected.words.findIndex(index => index === bannedWord);
									res.systems.blacklistWord.protected.words.splice(getIndex,1)
									message.channel.send(`${issuer}, I've removed \`${bannedWord}\` from being a protected word.`);
								}
							}
						}
						//behaviour/punish/autowarn
						if(options.indexOf(chosenOption) === 6){
							
							if(res.customWarns.enabled == false) return message.channel.send(`${issuer}, In order to use this feature, please activate the custom warning rule system first! You can do that by typing: \`${prefix}warn rules switch\``);
							if(res.customWarns.warns.length == 0) return message.channel.send(`${issuer}, please add a custom rule to be used for this feature!`);
							let whatToDo = new SharuruEmbed()
								.setAuthor(`${this.client.user.username} is here to help!`,this.client.user.displayAvatarURL())
								.setColor('RANDOM')
								
							if(!subOption) {
								whatToDo.addField("- \`switch\`",`=> allow or deny ${this.client.user} to warn members when they type a banned word;`)
								.addField("- \`type\` <shard/frostfant/blackice>",`=> set what type of warn you want ${this.client.user} to give.`)
								.setDescription(`You forgot to mention a sub-option! You have to choose from:`)
								return message.channel.send({embeds: [whatToDo]});
							}
							
							if(subOption.toLowerCase() == "switch"){
								if(!res.systems.blacklistWord.behaviour.mode) res.systems.blacklistWord.behaviour.mode = false
								if(res.systems.blacklistWord.behaviour.mode == true){
									res.systems.blacklistWord.behaviour.mode = false;
									whatToDo.setDescription(`The auto-warn feature is now disabled!`)
									message.channel.send({embeds: [whatToDo]});
								} else {
									res.systems.blacklistWord.behaviour.mode = true;
									whatToDo.setDescription(`The auto-warn feature is now enabled! Please specify what type of warning you want ${this.client.user} to give when a member write a banned word!`)
									.addField("You can do that by typing:",`\`${prefix}word autowarn <shard/frostfang/blackice>\``)
									message.channel.send({embeds: [whatToDo]})
								}
							}
							let allowedCases = ['shard','frostfang','blackice']
							if(subOption.toLowerCase() == 'type'){
								if(!args[2]) return message.channel.send(`${issuer}, Please provide a type of warn!`)
								if(!allowedCases.includes(args[2]?.toLowerCase())) return message.channel.send(`${issuer}, I don't recognize that type of warn. Available warnings: \`${allowedCases.join(", ")}\` `);
								res.systems.blacklistWord.behaviour.type = args[2].toUpperCase();
								whatToDo.setDescription(`Done! I set up so whenever someone type a banned word, they will be given a warn of that type: **${args[2]}**`)
								message.channel.send({embeds: [whatToDo]});
							}
						}
						res.save().catch(err=>console.log(err));
					}
				// }, 1000);
			})
	}

};
