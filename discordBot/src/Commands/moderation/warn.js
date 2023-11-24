/* eslint-disable no-unused-vars */
const Command = require('../../Structures/Command.js');
const sendError = require('../../Models/Error');
const { PermissionsBitField } = require('discord.js');
const guildSettings = require('../../Models/GuildSettings')
const warnSys = require(`../../Models/warns`);
const concat = require('concat-stream');
const keygen = require('keygenerator');
const pms = require(`pretty-ms`);
const _ = require('lodash');
const path = require('path');
const toml = require('toml');
const fs = require('fs');
const ms = require('ms');
const SharuruEmbed = require('../../Structures/SharuruEmbed.js');


module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'warn',
			displaying: true,
			description: `Warn bad people! There are in total 3 type of warnings: \`shard\`, \`frostfang\` & \`blackice\`
			
			In general, to warn someone you must follow this template:
			\`warn @memberMention <type: shard/frostfang/blackice> [reason]\`
			E.g: \`\`\`warn @Bob shard for spamming in general chat\`\`\` 
			=> Bob will be given a \`shard\` warning with the reason of "spaming in general chat".
			For more info about warning types, please [click here](http://sharurubins.ddns.net/customRuleset).`,
			options: `
			- \`view <#>\`=> Used to view information about a case (each warning is labeled as a "case"). Requires # (number) of the case: *warn view 1*

			- \`view-all @mention\`=> Shows all warns of a member. Requires mention. If the member left the server, please copy the id of the user and add \`-l\` after id.

			- \`remove <#>\`=> Remove a warning. Requires #number of the warning (if exists): *!warn remove 1*

			- \`clear @someone\`=> It clears the person of all the warnings.

			- \`rule/rules\` => sub-command needed to use the custom warning system. It has the following parameters:\n
			--- \`switch\` => it's turns off and on the custom rules system.
			--- \`list\` => shows a list of custom warns created so far + details of what it does.
			--- \`add <type: shard/frostfang/blackice> <limit of warnings: 1,2,3,...,20> <action: giveawayban>\` => creates a custom rule based on your preferences. Available actions to use: \`mute, kick, temporary ban (tban), permanent ban (pban), strip roles, giveaway ban\`
			--- \`edit <ruleId> <option: type/limit/action> <new value> <secondary new value (for mute)>\` => Edit a custom rule. At the moment, only the type(shard/frostfang/blackice), limit (number of warnings to trigger the rule) & the action (mute, kick, ban,strip roles, giveaway ban) of a rule.
			\nTo edit a custom rule to mute for 3h: warn rule edit 123456 action mute 3h
			To edit a custom rule to strip the role of a member: warn rule edit 123456 action striproles
			To edit a custom rule to increase number of warnings to 5: warn rule edit 123456 limit 5
			To edit a custom rule type to black ice: warn rule edit 123456 type blackice
			--- \`delete <ruleId>\` => deletes a custom rule created.
			`,
			usage: '@someone <type: shard, frostfang, blackice> [reason]',
			example: ' @Bob shard because he spammed',
			category: 'moderation',
			userPerms: [PermissionsBitField.Flags.KickMembers,PermissionsBitField.Flags.ManageMessages,PermissionsBitField.Flags.ManageRoles],
			SharuruPerms: [PermissionsBitField.Flags.KickMembers,PermissionsBitField.Flags.BanMembers,PermissionsBitField.Flags.ManageMessages,PermissionsBitField.Flags.ManageRoles],
			args: true,
			guildOnly: true,
			ownerOnly: false,
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
		let amORpm;
		if (hrs >= 0 && hrs <= 12) {
			amORpm = 'AM';
		} else {
			amORpm = 'PM';
		}
		let minDataOBJ = null;
		let mypath = path.join(__dirname,'../../Assets/minData.toml');
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
		fs.createReadStream(mypath,'utf8').pipe(concat((data)=>{
			let parsed = toml.parse(data);
			minDataOBJ = parsed;
		}));

		function rep(msg) {
			return message.channel.send(`${issuer}, ${msg}`)
		}
		function displayNicely(myAction) {
			let showme;
			if (myAction== "stripRoles") {
				showme = `Strip the Roles`
			} else if(myAction == "giveawayban") {
				showme = `Banned from Giveaways`
			} else {
				showme = myAction
			}
			return showme;
		}
		function displayTimeWhenNeeded(isMute,time) {
			let showOrNot = ``
			if(isMute == "mute" || isMute == 'tban') {
				showOrNot+= `Rule time: ${time}\n\n`
			}
			return showOrNot
		}
		
		const issuer = message.author;
		const prefix = this.client.prefixes.get(message.guild.id)
		const dateAndHour = TheDate + " | " + clock + " " + amORpm;
		let guild_member = message.guild.members.cache.get(message.mentions.members.first()?.id || args[1]);
		let reason = args.slice(2).join(" ");
		let type_case = args[1];
		const valid_cases = ['SHARD','FROSTFANG','BLACKICE'];
		const logs = message.guild.channels.cache.find(ch=> ch.name === 'sharuru-logs');

		setTimeout(() => {
			if (args[0] == "help"){
				// console.log()
				let helpEmbed = new SharuruEmbed()
					.setColor("LUMINOUS_VIVID_PINK")
					.setFooter(`Requested by ${issuer.tag} at`)
					.setTimestamp()
					.setDescription(`\`=>\` To warn someone: \`${prefix}warn @member <shard/frostfang/blackice> [reason]\`;
					E.g: ${prefix}warn @bob shard he's mean towards alice
					
	\`=>\` To view more info about what each type of warning means, [click here](http://sharurubins.ddns.net/customRuleset)
	\`=>\`To view someone's warns, type \`${prefix}warn view-all <@member>\`
	\`=>\` To view more details of the case, type: \`${prefix}warn view <caseNumber>\`
	\`=>\` To remove a case, type: \`${prefix}warn remove-case <caseNumber>\`
	\`=>\` Do you want ${this.client.user} to punish bad members that reach a number of warnings automatically? You can do that by using custom warning rules. First, you'll need to activate the custom warning rules system. You do that like this: \`${prefix}warn rule switch\`.
	\`=>\` To add a custom warning rule, type: \`${prefix}warn rule add <type: shard/frostfang/blackice> <warnings needed: 1,2,3..,20> <action: giveawayban/striproles/mute/kick/ban> <mute time: 1sec/1min/1h/2h 30min/ 5h 25min; only if the punishment is mute>\`
	**P.S: If you turn on the system, if there is no custom rule created, it will use the default custom roles!**`)
				return message.channel.send({embeds: [helpEmbed]})
			}
			
			if (args[0] === "clear"){
				// if (!guild_member) return message.channel.send(`${issuer}, please verify again if you mentioned a member or provided an id of a member!`)
				if(!guild_member && (!args[2] || args[2] !== `-l`)) return message.channel.send(`Make sure to mention a member of the server! In case the member left the server, copy their discord id & mention this parameter after: \`-l\`!`)
				if(guild_member)
					guild_member = guild_member.id
				
				if(args[2] == '-l'){
					guild_member = args[1]
				}
				warnSys.deleteMany({
					userID: guild_member.id
				},(err, results)=> {
					if(err){
						sendError.create({
							Guild_Name: message.guild.name,
							Guild_ID: message.guild.id,
							User: issuer.tag,
							userID: issuer.id,
							Error: err,
							Time: `${TheDate} || ${clock} ${amORpm}`,
							Command: this.name + `, clear subcommand`,
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
						console.log(`[${dateAndHour}] I couldn't clear ${args[1]} because:\n\n${err}\n\n`);
						return;
					}
					if(results.deletedCount == 0){
						// console.log(guild_member)
						message.channel.send(`${issuer}, This member is not behaving bad so there is nothing to clear.`);
					} else {
						console.log(`Cleared ${guild_member.user.username} of all ${results.deletedCount} warnings!`)
						let clearCases = new MessageEmbed()
							.setAuthor(`Member Cleared of warnings!`)
							.setDescription(`Moderator ${issuer} deleted all ${guild_member}'s warnings. `)
							.setFooter(`Total cases: ${results.deletedCount}`)
							.setTimestamp()
							.setColor("#FFC0CB")
							logs.send({embeds: [clearCases] })
						message.channel.send(`${issuer}, I have cleared ${guild_member} of all accusations!`)
					}
				})
				return;
			}

			if (args[0] === "remove-case"){
				if(!args[1]) return message.channel.send(`${issuer}, please provide a case!`)
				if(isNaN(args[1])) return message.channel.send(`${issuer}, Please provide a number`)
				if(!reason) return message.channel.send(`Why you want to remove that case? Give a reason after the number of the case!`)
				warnSys.findOneAndDelete({
					caseID: args[1]
				},(err, results)=> {
					if(err){
						sendError.create({
							Guild_Name: message.guild.name,
							Guild_ID: message.guild.id,
							User: issuer.tag,
							UserID: issuer.id,
							Error: err,
							Time: `${TheDate} || ${clock} ${amORpm}`,
							Command: this.name + `, remove-case subcommand`,
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
						console.log(`[${dateAndHour}] I couldn't remove case ${args[1]} because:\n\n${err}\n\n`);
						return;
					}
					if(!results){
						message.channel.send(`${issuer}, That case doesn't exist!`);
					}else{
						let CaseViewEmbed = new MessageEmbed()
							.setAuthor(`Case removed!`)
							.setDescription(`Author (who warned): ${results.authorCase}
											 Member warned: ${results.userCase}
											 Case Type: ${results.caseType}
											 Reason: ${results.reason}
											 Date (when happened):  ${results.date}
											 **Removed by:** **|| ${issuer.username} ||**`)
							.setFooter(`Case #${results.caseID}`)
							.setColor("#FFC0CB")
							.setTimestamp()
							message.channel.send(`${issuer}, Removed successfully case #${getCaseID}!`)
						logs.send({embeds: [CaseViewEmbed]});
					}
				})
				return;
			}

			if (args[0] === "view-all"){
				if(!guild_member && (!args[2] || args[2] !== `-l`)) return message.channel.send(`Make sure to mention a member of the server! In case the member left the server, copy their discord id & mention this parameter after: \`-l\`!`)
				if(guild_member)
					guild_member = guild_member.id
				
				if(args[2] == '-l'){
					guild_member = args[1]
				}
				warnSys.find({
					userID: guild_member
				},async (err, results)=> {
					if(err){
						console.log(`[${dateAndHour}] I couldn't load all cases of ${args[1]} because:\n\n${err}\n\n`);
						sendError.create({
							Guild_Name: message.guild.name,
							Guild_ID: message.guild.id,
							User: issuer.tag,
							UserID: issuer.id,
							Error: err,
							Time: `${TheDate} || ${clock} ${amORpm}`,
							Command: this.name + `, view-all subcommand`,
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
						return;
					}
					if(results.length <= 0) return message.channel.send(`This person is clean. Nothing to complain about <@${guild_member}>...`)
					
						let N = results.length;
						let listOfCases = ``;
						for(let i = 0; i<N; i++){
							listOfCases += `**\`Case #${results[i].caseID} [${(results[i].caseType).slice(0,1)}]\`**\n- **Reason**: ${results[i].reason}\n- **Date**: ${results[i].date}\n`
						}
						let punishmentsForMember = new MessageEmbed()
							.setAuthor(`${results[0].userCase}'s Warnings [${N}]:`)
							.setDescription(`${listOfCases}`)
							.setFooter(`For more info, type: ${prefix}warn view <case ID>`)
						message.channel.send({embeds: [punishmentsForMember]})
					
				})
				return;
			}

			if (args[0] === "view"){
				if(!args[1]) return message.channel.send(`${issuer}, please provide a case!`)
				if(isNaN(args[1])) return message.channel.send(`${issuer}, Please provide a valid case number !`)
				warnSys.findOne({
					caseID: args[1]
				},(err, results)=> {
					if(err){
						console.log(`[${dateAndHour}] I couldn't load 1 case ${args[1]} because:\n\n${err}\n\n`);
						sendError.create({
							Guild_Name: message.guild.name,
							Guild_ID: message.guild.id,
							User: issuer.tag,
							UserID: issuer.id,
							Error: err,
							Time: `${TheDate} || ${clock} ${amORpm}`,
							Command: this.name + `, view subcommand`,
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
						return;
					}
					if(!results){
						message.channel.send(`That case doesn't exist!`);
					}else{
						if(results.fromGuildID != message.guild.id) return message.channel.send(`That case doesn't exist!`);
						let CaseViewEmbed = new MessageEmbed()
							.setAuthor(`Author case: ${results.authorCase}`)
							.setDescription(`Legend: \n**Shard(S)** => Spam, griefing, advertising, etc\n **FrostFang(FF)** => flamed someone, acted rude, screamed in vc, etc\n**Black Ice(BI)** => all above and much more! Needs kicked/banned at next warning (any type)!\n
											 **\`Member warned\`**: ${results.userCase}
											 **\`Type of warn\`**: ${results.caseType}
											 **\`Reason\`**: ${results.reason}
											 **\`Date\`**:  ${results.date}, ${results.Hour}`)
							.setFooter(`Case #${results.caseID}`)
							.setColor("#FFC0CB")
							.setTimestamp()
						message.channel.send({embeds: [CaseViewEmbed]});
					}
				})
				return;
			}

			//update 2.0
			if(args[0] === 'rule' || args[0] ==='rules' || args[0] === 'sys') {

				const allowedActions = ['mute','kick','tban','pban','striproles','giveawayban']
				const allowedEdits = ['type','limit','action']
				if(!args[1]) return rep(`please provide an option from:
				\n- \`switch\` => it will turn on and off the custom rules.
				\n- \`list\` => shows a list of the custom rules created.
				\n- \`add\` => creates a new rule. Template: ${prefix}warn rule add <type> <limit> <action> <time parameter if mute action is provided>.
				\n- \`edit\` => edit an existent rule. Temaple: ${prefix}warn rule edit <rule ID> <type/limit/action> <new value> <secondary parameter  mute action is provided>.
				\n- \`delete / del\` => deletes an existent rule. Template: ${prefix}warn rule delete <rule ID>.`)
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
							Command: this.name + `, sys subcommand`,
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
						return
					}
					if (res) {
						if (args[1] === "switch") {
							if(res.systems.customWarns.enabled == true){
								res.systems.customWarns.enabled = false;
								message.channel.send(`${issuer}, I have turned off the custom warn system.`)
							} else {
								res.systems.customWarns.enabled = true
								message.channel.send(`${issuer}, I have activated the custom warn system.`)
							}
						}
						
						if (args[1] === 'list') {
							let listEmbed = new SharuruEmbed()
								.setColor(`LUMINOUS_VIVID_PINK`)
								.setFooter(`Requested by ${issuer.tag} at `,issuer.displayAvatarURL({dynamic: true}))
								.setTimestamp()
							if(res.systems.customWarns.enabled== false) {
								listEmbed.setDescription(`${issuer}, please activate the custom rules option first.`)
								return message.channel.send({embeds: {listEmbed}})
							}
							if(res.customWarns.warns.length == 0) {
								listEmbed.setDescription(`${issuer}, there isn't any custom warn rules set yet so that means I'm using the [default](http://sharurubins.ddns.net/customRuleset.txt) ones!
								To do create a rule, use: \`\`\`${prefix}warn rule add <type> <nr of warnings to reach> <action> <time parameter if necessary>\`\`\`
								\nExample:
								\`${prefix}warn rule add shard 4 mute 20h\` => this will make a custom warn that mutes the person at 4 shard warns
								💠Available types: [\`shard, frostfang, blackice\`]
								💠Available Actions: [\`mute, kick, ban, stripRoles, giveawayBan\`]
								💠Available time parameters: [\`1min, 1h, 20h\`]`)
								return message.channel.send({embeds: [listEmbed]})
							}
							// setTimeout(() => {
								let Pages = [];
								let page = 1;
								let a = 0;
								let Rarray = [];
								while (a < res.customWarns.warns.length) {
									Rarray.push(`Rule ID: ${res.customWarns.warns[a].id}\nRule Type: ${res.customWarns.warns[a].type}\nRule limit: ${res.customWarns.warns[a].number}\nRule action: ${displayNicely(res.customWarns.warns[a].action)}\n${displayTimeWhenNeeded(res.customWarns.warns[a].action,pms(res.customWarns.warns[a].time))}`)
									a++
									if (a % 5 == 0) {
										Pages.push(Rarray);
										Rarray = []
									}
								}
								if(Rarray.length > 0) {
									Pages.push(Rarray)
								}

								let ruleEmbed = new MessageEmbed()
									.setAuthor(`${message.guild.name}'s Custom Rules:`,message.guild.iconURL({dynamic: true}))
									.setTitle(`This is the list with the custom rules:`)
									.setDescription(Pages[page-1].join("\n"))
									.setFooter(`Page ${page}/${Pages.length} | Requested by ${issuer.username} at `)
									.setTimestamp()
									.setColor(`#ffc0cb`)
									message.channel.send({embeds: [ruleEmbed]}).then(msg =>{
										msg.react(`◀️`).then(r => {
											msg.react(`▶️`);

											setTimeout(() => {
												msg.reactions.resolve(`◀️`).users.remove(this.client.user.id);
												msg.reactions.resolve(`▶️`).users.remove(this.client.user.id);
											}, 61000);

											const CollectingReactions = (reaction, user) => user.id === message.author.id;
											const gimmeReactions = msg.createReactionCollector({CollectingReactions,time: 60000})
											
											gimmeReactions.on('collect', r=>{
												let the_emoji = r._emoji.name;

												switch(the_emoji) {
													case `◀️`:
													if(page === 1) return;
													page--;
													ruleEmbed.setDescription(Pages[page-1]);
													ruleEmbed.setFooter(`Page ${page}/${Pages.length} | Requested by ${issuer.username} at `)
													ruleEmbed.setTimestamp()
													msg.edit({embeds:[ruleEmbed]})
													msg.reactions.resolve(`◀️`).users.remove(message.author.id);
													break;
													case `▶️`:
													// console.log(r.users.cache);
													if(page === Pages.length) return;
													page++;
													ruleEmbed.setDescription(Pages[page-1]);
													ruleEmbed.setFooter(`Page ${page}/${Pages.length} | Requested by ${issuer.username} at `)
													ruleEmbed.setTimestamp()
													msg.edit({embeds:[ruleEmbed]})
													msg.reactions.resolve(`▶️`).users.remove(message.author.id);
													break;
													default:
														console.log(`do nothing, reacted with smth else.`)
													break;
												}
											})
										})
									})
							// }, 200);
						}

						if (args[1] === 'add') {
							let timeInMilliseconds = 0;
							let type_provided = args[2]
							let warningsLimit_provided = args[3];
							let action_provided = args[4];
							let time_provided = args.splice(5)
							if(res.systems.customWarns.enabled== false) return message.channel.send(`${issuer}, please activate the custom rules system first.`)
							if(res.customWarns.warns.length >= 10) return message.channel.send(`${issuer}, for better optimization and speed, currently this server is limited to 10 custom rules. Delete some rules to make new ones or edit them.`)
							if(!valid_cases.includes(type_provided.toUpperCase())) return rep(`you said a case that I don't know about it. The cases that I know are:\n-shard\n-frostfang\n-blackice\nThe correct format can be found in \`${prefix}warn help\``);
							if(isNaN(warningsLimit_provided)) return message.channel.send(`${issuer}, you need to add a number! Preferably not below 1, neither above 20.`)
							if(warningsLimit_provided <=0 || warningsLimit_provided > 20) return message.channel.send(`${issuer}, I'm sorry but you can set the limit to be between 1 (inclusive) and 20 (inclusive)!`)
							if(!allowedActions.includes(action_provided.toLowerCase())) return rep(`you provided an action that I don't know about it. This is what I know:
							-\`mute\` <time: 10sec, 1min,1h,1d>. It works as well: 1min 30sec, 7min 30sec
							-\`kick\`
							\`-tban <time: 5min, 5h, 5d\`
							\`-pban\`
							-\`stripRoles\` => when it reach the limit of warnings, their roles are removed completely.
							-\`giveawayBan\` => when it reach the limit, the member will be banned from joining future giveaways until unbanned manually.`)
							if(time_provided) {
								console.log(time_provided)
								let acceptedLetters = ['sec','min','h','d']	
								try {
									for(let i = 0; i< time_provided.length; i++) {
										timeInMilliseconds += ms(time_provided[i])
									};
								} catch (error) {
									let yourErr = ``
									for(let j = 0; j < time_provided.length; j++) {
										time_provided[j] = time_provided[j].replace(/[0-9]/g, '');
										console.log(time_provided)
										if(!acceptedLetters.includes(time_provided[j])) {
											yourErr+= `-${time_provided[j]}\n`
										}
									}
									rep(`sorry but you provided a bad thing:\n\n${yourErr}`)
								}
							}
							console.log(timeInMilliseconds)
							let checkForDups = true;
							let randomID = `${message.guild.id.slice(-3)}${keygen.number({length:6})}`;
							// return console.log(randomID)
							let newRule = {
								id: randomID,
								type: type_provided.toUpperCase(),
								number: warningsLimit_provided,
								action: action_provided,
								time: timeInMilliseconds
							}
							let finalmsg = `your custom rule was added and the id is #${newRule.id}! Every time someone reach **${newRule.number} ${newRule.type}** warning(s), they will be punished by receiving **${newRule.action == 'pban' ? `permanent ban` : newRule.action} ${newRule.time ? pms(timeInMilliseconds,{verbose: true}) : ``}**!`
							while (checkForDups == true) {
								if(res.customWarns.warns.some(ids => ids['id'] === newRule['id'])) {
									console.log(`found same id created, generating a new one`)
									newRule.id = `${message.guild.id.slice(-3)}${keygen.number({length:6})}`;
								} else {
									checkForDups = false
								}
							}
							let copyCustomWarns = res.customWarns.warns;
							let idNewRule = newRule.id
							delete newRule.id
							for(let i = 0; i < copyCustomWarns.length; i++) {
								delete copyCustomWarns[i].id
								if(_.isEqual(copyCustomWarns[i],newRule)) finalmsg += `\n\n**Warning[${i}]: You have already a custom rule (#${res.customWarns.warns[i].id}) that has same amount of warning limits (${newRule.number}) & same type (${newRule.type}) as your newest rule added. Please check the list and edit/remove one of them otherwise you will waste a space for another rule with different options!** `
							}
							newRule.id = idNewRule
							res.customWarns.warns.push(newRule)
							rep(finalmsg)
						}
						
						if (args[1] === 'edit') {
							let ruleID = args[2]
							let editWhat = args[3]
							let newValue = args[4]
							if(res.systems.customWarns.enabled== false) return message.channel.send(`${issuer}, please activate the custom rules option first.`)
							if(!ruleID) return rep("you forgot the id of the rule!")
							if(!editWhat) return rep("you forgot to say what option you want to change!")
							if(!newValue) return rep("you forgot to say the value you want to replace with!")
							if(!res.customWarns.warns.find(o=> o.id == ruleID)) return message.channel.send(`${issuer}, sorry but there isn't such a rule like **\`${ruleID}\`**.`)
							if(!allowedEdits.includes(editWhat)) return message.channel.send(`${issuer}, sorry but there isn't such an option like **\`${ruleID}\`**.`)
							let getIndex = res.customWarns.warns.findIndex(r=> r.id === ruleID);
							if(editWhat == 'type') {
								if(!valid_cases.includes(newValue.toUpperCase())) return message.channel.send(`${issuer}, I'm sorry but I don't recognize what you said. I know only \`shard, frostfang and blackice\`!`)
								guildSettings.updateOne({
									'customWarns.warns.id': `${res.customWarns.warns[getIndex].id}`
								},{'$set':{ 'customWarns.warns.$.type' : newValue}},(erro,reso)=>{
									if (erro) {
										sendError.create({
											Guild_Name: message.guild.name,
											Guild_ID: message.guild.id,
											User: issuer.tag,
											UserID: issuer.id,
											Error: erro,
											Time: `${TheDate} || ${clock} ${amORpm}`,
											Command: this.name + `, sys subcommand`,
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
									if(reso) {
										message.channel.send(`${issuer}, Done! I have replaced the type of rule \`#${ruleID}\` with **${newValue}**`)
										console.log(reso)
									}
								});
							}
							if (editWhat == 'limit') {
								if(isNaN(newValue)) return message.channel.send(`${issuer}, you need to add a number! Preferably not below 1, neither above 20.`)
								if(newValue <=0 || newValue > 20) return message.channel.send(`${issuer}, I'm sorry but you can set the limit between 1 (inclusive) and 20 (inclusive)!`)
								guildSettings.updateOne({
									'customWarns.warns.id': `${res.customWarns.warns[getIndex].id}`
								},{'$set':{ 'customWarns.warns.$.number' : newValue}},(erro,reso)=>{
									if (erro) {
										sendError.create({
											Guild_Name: message.guild.name,
											Guild_ID: message.guild.id,
											User: issuer.tag,
											UserID: issuer.id,
											Error: erro,
											Time: `${TheDate} || ${clock} ${amORpm}`,
											Command: this.name + `, sys subcommand - limit edit`,
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
									if(reso) {
										message.channel.send(`${issuer}, Done! The limit of rule \`#${ruleID}\` was set to **${newValue}**`)
										console.log(reso)
									}
								});
							}
							if (editWhat == 'action') {
								if(!allowedActions.includes(newValue.toLowerCase())) return message.channel.send(`${issuer}, I'm sorry but I don't recognize "**\`${newValue}\`**" as a valid action.
								Available Actions are: [\`mute, kick, ban, stripRoles, giveawayBan\`]`)
								if(newValue.toLowerCase() == `mute` || newValue.toLowerCase() == 'tban') {
									let secondValue = args[5]
									if(!secondValue) return message.channel.send(`${issuer}, please specify a time for mute/tban: 1min,1h,1d etc;\nYou can also type multiple time values like:\n\n\`mute 2h 39min 19sec\``);
									let thing = args.splice(5)//.join(" ").split(" ");
									let result = 0;
									try {
										for(let i = 0; i< thing.length; i++) {
											result += ms(thing[i])
										};
									} catch (error) {
										let yourErr = ``
										for(let j = 0; j < thing.length; j++) {
											thing[j] = thing[j].replace(/[0-9]/g, '');
											if(!acceptedLetters.includes(thing[j])) {
												yourErr+= `-${thing[j]}\n`
											}
										}
										rep(`sorry but you provided a bad thing:\n\n${yourErr}`)
									}
									console.log(result)
									// if(isNaN(result)) return rep(`sorry but you provided something I couldn't understand. Make sure you typed correctly the time(I accept: sec,min,h,d)!`)
									guildSettings.updateOne({
										'customWarns.warns.id': `${res.customWarns.warns[getIndex].id}`
									},{'$set':{ 'customWarns.warns.$.action' : newValue}},(erro,reso)=>{
										if (erro) {
											sendError.create({
												Guild_Name: message.guild.name,
												Guild_ID: message.guild.id,
												User: issuer.tag,
												UserID: issuer.id,
												Error: erro,
												Time: `${TheDate} || ${clock} ${amORpm}`,
												Command: this.name + `, sys subcommand - edit mute action`,
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
										if(reso) {
											// message.channel.send(`${issuer}, Done! I have replaced the type of rule \`#${ruleID}\` with **${newValue}**`)
											console.log(reso)
										}
									});
									guildSettings.updateOne({
										'customWarns.warns.id': `${res.customWarns.warns[getIndex].id}`
									},{'$set':{ 'customWarns.warns.$.time' : result}},(erro,reso)=>{
										if (erro) {
											sendError.create({
												Guild_Name: message.guild.name,
												Guild_ID: message.guild.id,
												User: issuer.tag,
												UserID: issuer.id,
												Error: erro,
												Time: `${TheDate} || ${clock} ${amORpm}`,
												Command: this.name + `, sys subcommand - edit time action`,
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
										if(reso) {//
											message.channel.send(`${issuer}, Done! I have changed the rule \`#${ruleID}\`! When a member reach **${res.customWarns.warns[getIndex].number}** **${res.customWarns.warns[getIndex].type}** warnings, they will be **${res.customWarns.warns[getIndex].action == 'tban' ? `temporary banned for` : `muted for`}** **${thing}**!`)
											console.log(reso)
										}
									});
									return
								} else {
									// console.log(`it was kick,ban,strip or bangive`)
									guildSettings.updateOne({
										'customWarns.warns.id': `${res.customWarns.warns[getIndex].id}`
									},{'$set':{ 'customWarns.warns.$.action' : newValue}},(erro,reso)=>{
										if (erro) {
											sendError.create({
												Guild_Name: message.guild.name,
												Guild_ID: message.guild.id,
												User: issuer.tag,
												UserID: issuer.id,
												Error: erro,
												Time: `${TheDate} || ${clock} ${amORpm}`,
												Command: this.name + `, sys subcommand`,
												Args: args,
											},async (errr, ress) => {
												if(errr) {
													console.log(errr)
													return message.channel.send(`Unfortunately an problem appeared while trying to process the rule action editing. Please try again later. If this problem persist, contact my partner!`)
												}
												if(ress) {
													console.log(`successfully added error to database!`)
												}
											})
											return;
										}
										if(reso) {
											message.channel.send(`${issuer}, Done! I have changed the rule \`#${ruleID}\`! When a member reach **${res.customWarns.warns[getIndex].number}** **${res.customWarns.warns[getIndex].type}** warnings, they will be **${newValue == 'pban' ? `permanent ban` : newValue}**!`)
											console.log(reso)
										}
									});
								}
							}
						}

						if (args[1] === 'delete' || args[1] === 'del') {
							let ruleID = args[2]
							if(res.systems.customWarns.enabled== false) return message.channel.send(`${issuer}, please activate the custom rules option first.`)
							if(!ruleID) return rep("you forgot the id of the rule!")
							if(!res.customWarns.warns.find(o=> o.id == ruleID)) return rep(`sorry but there isn't such a rule like **\`${ruleID}\`**.`)
							let getIndex = res.customWarns.warns.findIndex(r=> r.id === ruleID);
							let ruleInfo = res.customWarns.warns[getIndex];
							res.customWarns.warns.splice(getIndex,1);
							rep(`done! I have deleted rule #\`${ruleID}\`! It was a **${ruleInfo.type}** warning with a limit of **${ruleInfo.number}** and it was having as punishment: **${ruleInfo.action}** ${ruleInfo.time ? `for ${pms(ruleInfo.time)}` : ``}`)
						}
						res.save().catch(err=> console.log(err))
					}
				})
				return
			}
			if (args[0] == 'list') return message.channel.send(`It seems like you tried to see the rule list (since you typed "list"). That is incorrect. To see the rule list, please type: \`${prefix}warn rule list\``)
			guild_member = message.guild.members.cache.get(message.mentions.members.first()?.id || args[0]);
			try {
				if (guild_member.id === this.client.user.id) return message.channel.send(`${issuer}, so tell me again, with what reason are you warning me?`)

				if (issuer.id !== "186533323403689986"){
					if(guild_member.roles.highest.position >= message.member.roles.highest.position) return message.channel.send(`${issuer}, you can't do that since ${guild_member} is equally or higher rank than you.`);
					if(guild_member.id === issuer.id) return message.channel.send(`${issuer}, instead of warning yourself, what about telling to someone why you feel guilty? `)
				}
	
				if (guild_member.id === "186533323403689986") return message.channel.send(`${issuer}, No one can warn my partner!`);
			} catch (error) {
				console.log(error)
				return rep(`it seems like you either forgot to mention or provide a valid ID of them member to warn. If you didn't wanted to warn then you probably forgot to add \`rule\` option for custom rules!\n\nIf there is nothing wrong with anything above, then that means the member left this server or I can't simply find it.`)
			}

			if (!reason) reason = "No reason given yet."

			//update 2.1, quick warn if no warn type was provided
			if (!type_case) {
				reason = `No reason given. This is a quick warn (shard only)!`
				let warnEmbed = new MessageEmbed()
				.setTitle(`Case #${minDataOBJ.cases}`)
				.setThumbnail(guild_member.user.displayAvatarURL({ dynamic: true }))
				.setDescription("A member has been warned!")
				.addField("Member warned:", guild_member.toString())
				.addField("Type:", `Shard (quick warn)`)
				.addField("Reason:", reason)
				.setColor("#FFC0CB")
				.setTimestamp()
				logs.send({embeds: [warnEmbed]})
				type_case = `SHARD`
				warnSys.create({
					caseID: minDataOBJ.cases,
					caseType: type_case,
					userCase: guild_member.user.username,
					userID: guild_member.id,
					fromGuildID: message.guild.id,
					guildName: message.guild.name,
					authorCase: issuer.tag,
					authorID: issuer.id,
					reason: reason,
					date: dateAndHour,
				}, (err, results) => {
					if (err) {
						sendError.create({
							Guild_Name: message.guild.name,
							Guild_ID: message.guild.id,
							User: issuer.tag,
							UserID: issuer.id,
							Error: err,
							Time: `${TheDate} || ${clock} ${amORpm}`,
							Command: this.name + `, warn command`,
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
					if (results) {
						let warnOptions = {
							wtype: type_case,
							uID: guild_member.id,
							gID: message.guild.id,
							gName: message.guild.name,
							author: issuer,
						}

						this.client.emit(`warnSystem`,warnOptions);
						message.channel.send(`${issuer}, Done! File #${minDataOBJ.cases} for ${guild_member} has been created and saved!`)
						console.log(`${issuer.tag} reported successfully ${guild_member} at ${dateAndHour}.`)
						minDataOBJ.cases++;
						let newData = SimpleJsonToToml(minDataOBJ);
						fs.writeFile(mypath,newData,(err,res)=>{
							if(err) return console.log(err)
							if(res) console.log(res)
							console.log(`Done writing!`)
						})
					}
				})
				return;
			}

			if (valid_cases.indexOf(type_case.toUpperCase()) === -1) {
				return message.channel.send(`${issuer}, Sorry, ${type_case} isn't a valid warning. Only **\`shard\`**, **\`frostfang\`** and **\`blackice\`**.
				\nExample: ${prefix}warn <@someone> <warnType> [some random reason]\n\nP.S: Importance of arguments: <> = highest, [] = optional.`)
			}

			if(type_case === "frostfang") type_case = "Frost Fang"
			if(type_case === "blackice") type_case = "Black Ice";

			let warnEmbed = new MessageEmbed()
				.setTitle(`Case #${minDataOBJ.cases}`)
				.setThumbnail(guild_member.user.displayAvatarURL({ dynamic: true }))
				.setDescription("A member has been warned!")
				.addField("Member warned:", guild_member.toString())
				.addField("Type:", type_case)
				.addField("Reason:", reason)
				.setColor("#FFC0CB")
				.setTimestamp()
			logs.send({embeds: [warnEmbed]})
			type_case = type_case.toUpperCase().replace(/\s/g, '');
			warnSys.create({
				caseID: minDataOBJ.cases,
				caseType: type_case,
				userCase: guild_member.user.username,
				userID: guild_member.id,
				fromGuildID: message.guild.id,
				guildName: message.guild.name,
				authorCase: issuer.tag,
				authorID: issuer.id,
				reason: reason,
				date: dateAndHour,
			}, (err, results) => {
				if (err) {
					sendError.create({
						Guild_Name: message.guild.name,
						Guild_ID: message.guild.id,
						User: issuer.tag,
						UserID: issuer.id,
						Error: err,
						Time: `${TheDate} || ${clock} ${amORpm}`,
						Command: this.name + `, warn command`,
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
				if (results) {
					let warnOptions = {
						wtype: type_case,
						uID: guild_member.id,
						gID: message.guild.id,
						gName: message.guild.name,
						author: issuer,
					}

					this.client.emit(`warnSystem`,warnOptions);
					message.channel.send(`${issuer}, Done! File #${minDataOBJ.cases} for ${guild_member} has been created and saved!`)
					console.log(`${issuer.tag} reported successfully ${guild_member} at ${dateAndHour}.`)
					minDataOBJ.cases++;
					let newData = SimpleJsonToToml(minDataOBJ);
					fs.writeFile(mypath,newData,(err,res)=>{
						if(err) return console.log(err)
						if(res) console.log(res)
						console.log(`Done writing!`)
					})
				}
			})
		}, 500);
		
	}

};
