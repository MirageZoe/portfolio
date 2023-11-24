/* eslint-disable no-unused-vars */
const SharuruEmbed = require("../../Structures/SharuruEmbed");
const guildSettings = require("../../Models/GuildSettings");
const RoleManagement = require("../../Models/roleForm");
const Command = require('../../Structures/Command.js');
const profileSys = require("../../Models/profiles");
const sendError = require('../../Models/Error');
const _ = require('lodash')
const fs = require('fs');
const ms = require('ms');
const { PermissionsBitField } = require('discord.js');


module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'rolem',
			displaying: true,
			cooldown: 60000,
			description: "Want a role without asking admins/mods? This is your command! With this, you can claim available roles (if it was set up) without asking for admins/mods!",
			options: "none",
			usage: " => wait for list to appear => look for what you want, check as well level above => react to the number corresponding to the role you want => profit",
			category: 'utilities',
			userPerms: [PermissionsBitField.Flags.SendMessages],
			SharuruPerms: [PermissionsBitField.Flags.SendMessages,PermissionsBitField.Flags.ManageRoles],
			args: false,
			guildOnly: true,
			ownerOnly: false,
			aliases:["iam"],
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
		const issuer = message.author;

		let amORpm;
		if (hrs >= 0 && hrs <= 12) {
			amORpm = 'AM';
		} else {
			amORpm = 'PM';
        }
		const logs = message.guild.channels.cache.find(ch => ch.name === 'sharuru-logs')
		const prefix = this.client.prefixes.get(message.guild.id)
        if(!args[0]){
            RoleManagement.find({Guild_ID: `${message.guild.id}`}).sort({ Level_required: -1}).exec(function(err, results_roleMan){
                if(err){
                    sendError.create({
						Guild_Name: message.guild.name,
						Guild_ID: message.guild.id,
						User: issuer.tag,
						UserID: issuer.id,
						Error: err,
						Time: `${TheDate} || ${clock} ${amORpm}`,
						Command: this.name +" no option",
						Args: args,
					},async (err, res) => {
						if(err) {
							console.log(err)
							return message.channel.send(`Unfortunately an problem appeared while trying to process the main iam command. Please try again later. If this problem persist, contact my partner!`)
						}
						if(res) {
							console.log(`successfully added error to database!`)
							return message.channel.send(`Unfortunately a problem appeared while trying to process the main iam command. Please try again later. If this problem persist, contact my partner!`)
						}
					})
                }
                let pounch_of_ids = [];
                let Pages = [];
                let page = 1;
                if(results_roleMan.length >= 1){
                      let a = 0;
                      let Rarray = []
                      while (a < results_roleMan.length){
                        Rarray.push(`${a % 10 + 1}) Available from level: ${results_roleMan[a].Level_required}\nName: <@&${results_roleMan[a].Role_ID}>`);
                        pounch_of_ids.push(results_roleMan[a].Role_ID);
                        a++;
                        if(a % 10 == 0){
                          Pages.push(Rarray)
                          Rarray = []
                          }
                      }
                     if(Rarray.length > 0){
                        Pages.push(Rarray)
                     }
                     profileSys.findOne({
                        userID: issuer.id,
                    },(err2,results_level)=>{
						if(err2){
							sendError.create({
								Guild_Name: message.guild.name,
								Guild_ID: message.guild.id,
								User: issuer.tag,
								UserID: issuer.id,
								Error: err2,
								Time: `${TheDate} || ${clock} ${amORpm}`,
								Command: this.name + " profile search",
								Args: args,
							},async (err, res) => {
								if(err) {
									console.log(err)
									return message.channel.send(`Unfortunately an problem appeared while trying to search for a profile. Please try again later. If this problem persist, contact my partner!`)
								}
								if(res) {
									console.log(`successfully added error to database!`)
									return message.channel.send(`Unfortunately a problem appeared while trying to search for a profile. Please try again later. If this problem persist, contact my partner!`)
								}
							})
						}
						let myLevel = results_level.servers_data.get(message.guild.id) ? results_level.servers_data.get(message.guild.id).level : undefined;
						if(myLevel == undefined) {
							message.channel.send(`Something needed to be done and so you will have to try again. If this persist, please contact my partner or a staff member in this server!`)
							let lvl = {
								exp: 0,
								level: 1,
								money: 1000,
								guildName: message.guild.name
							}
							results_level.servers_data.set(message.guild.id,lvl);
							results_level.save().catch(err=> console.log(err))
							return
						}
                    let rolelist = new SharuruEmbed()
                        .setAuthor(`Available roles to get:`)
                        .setDescription(Pages[page-1].join("\n"))
                        .addField(`**${issuer.tag}**, your level is: **${myLevel}**`,`In case you don't know how to use this, follow this link: coming soon`) // [guide](https://www.youtube.com)
                        .setFooter(`Page ${page}/${Pages.length} | Requested by ${issuer.tag} at `)
                        .setTimestamp()
						message.channel.send({embeds: [rolelist] }).then(msg => {
							msg.react(`◀️`).then(r => {
								msg.react(`▶️`)
								
								const CollectingReactions = (reaction, user) => user.id === message.author.id;
								const gimmeReactions = msg.createReactionCollector({CollectingReactions,time: 60000})
								//collectors for 1-10

								gimmeReactions.on('collect', r=>{
									let the_emoji = r._emoji.name;
									
										if(results_level){
											let index_Of_role = -1;
											switch (the_emoji) {
												case `◀️`:
													if (issuer.bot == false)
														msg.reactions.resolve(`◀️`).users.remove(message.author.id);
													if(page == 1) return;
													page--;
													rolelist.setDescription(Pages[page-1].join("\n"));
													rolelist.setFooter(`Page ${page}/${Pages.length} | Requested by ${issuer.username} at `)
													rolelist.setTimestamp()
													msg.edit({embeds: [rolelist]})
													break;
												case `▶️`:
													if (issuer.bot == false)
														msg.reactions.resolve(`▶️`).users.remove(message.author.id);
													if(page == Pages.length) return;
													page++;
													rolelist.setDescription(Pages[page-1].join("\n"));
													rolelist.setFooter(`Page ${page}/${Pages.length} | Requested by ${issuer.username} at `)
													rolelist.setTimestamp()
													msg.edit({embeds: [rolelist]});
													break;
												case `1️⃣`:
													index_Of_role = (page-1) * 10;
													msg.reactions.resolve(`1️⃣`).users.remove(message.author.id);
													break;
												case `2️⃣`:
													index_Of_role = (page-1) * 10+1;
													if(index_Of_role>results_roleMan.length){
														index_Of_role = -1;
													}
													msg.reactions.resolve(`2️⃣`).users.remove(message.author.id);
													break;
												case `3️⃣` :
													index_Of_role = (page-1) * 10+2;
													if(index_Of_role>results_roleMan.length){
														index_Of_role = -1;
													}
													msg.reactions.resolve(`3️⃣`).users.remove(message.author.id);
													break;
												case `4️⃣` :
													index_Of_role = (page-1) * 10+3;                                                
													if(index_Of_role>results_roleMan.length){
														index_Of_role = -1;
													}
													msg.reactions.resolve(`4️⃣`).users.remove(message.author.id);                                                
													break;
												case `5️⃣` :
													index_Of_role = (page-1) * 10+4;                                                
													if(index_Of_role>results_roleMan.length){
														index_Of_role = -1;
													}
													msg.reactions.resolve(`5️⃣`).users.remove(message.author.id);
													break;
												case `6️⃣` :
													index_Of_role = (page-1) * 10+5;
													if(index_Of_role>results_roleMan.length){
														index_Of_role = -1;
													}
													msg.reactions.resolve(`6️⃣`).users.remove(message.author.id);
													break;
												case `7️⃣` :
													index_Of_role = (page-1) * 10+6;
													if(index_Of_role>results_roleMan.length){
														index_Of_role = -1;
													}
													msg.reactions.resolve(`7️⃣`).users.remove(message.author.id);
													break;
												case `8️⃣` :
													index_Of_role = (page-1) * 10+7;
													if(index_Of_role>results_roleMan.length){
														index_Of_role = -1;
													}
													msg.reactions.resolve(`8️⃣`).users.remove(message.author.id);
													break;
												case `9️⃣` :
													index_Of_role = (page-1) * 10+8;
													if(index_Of_role>results_roleMan.length){
														index_Of_role = -1;
													}
													msg.reactions.resolve(`9️⃣`).users.remove(message.author.id);
													break;
												case `🔟` :
													index_Of_role = (page-1) * 10+9;
													if(index_Of_role>results_roleMan.length){
														index_Of_role = -1;
													}
													msg.reactions.resolve(`🔟`).users.remove(message.author.id);
													
													break;                                                  
												default:
													message.channel.send(`If you wanna claim a role, React with numbers from :one: to :ten: to receive the role from that position!\n\nE.g: position 7: Active member => you have to react with :seven: to get it!`)
													break;
											}
											if(index_Of_role > -1){//(pagenum - 1 ) * 10 + the num, it can make an optimization as well: 10*page-9 for twoo
												// console.log(pounch_of_ids[index_Of_role]);
												// console.log(results_roleMan[index_Of_role].Role_Namae);
												//checking if they has already the role.
												if(message.member.roles.cache.find(r=> r.id === results_roleMan[index_Of_role].Role_ID)) {
													message.member.roles.remove(results_roleMan[index_Of_role].Role_ID)
													console.log(`Removed ${results_roleMan[index_Of_role].Role_Name} from ${issuer.tag}`)
													return message.channel.send(`I have removed ${results_roleMan[index_Of_role].Role_Name} from you because you had it already! If you wish to get it back, react again!`)
												}
												
												//checking if they has the right level for it.
												if(myLevel >= results_roleMan[index_Of_role].Level_required){
													let getUserToMember = message.guild.members.cache.get(issuer.id);
													let totalRoles = getUserToMember._roles
													let findRole;
													let keepThisRole = message.guild.roles.cache.find(r=> r.id === results_roleMan[index_Of_role].Role_ID)
													if(!results_roleMan[index_Of_role].Unique_between.includes(false)){
														console.log(`This role has Unique between roles!`)
														for(let y = 0; y < results_roleMan[index_Of_role].Unique_between.length; y++){
															// console.log(totalRoles[y])
																if(totalRoles.includes(results_roleMan[index_Of_role].Unique_between[y])){                                                                
																	message.member.roles.remove(results_roleMan[index_Of_role].Unique_between[y])
																	findRole = message.guild.roles.cache.find(r=> r.id === results_roleMan[index_Of_role].Unique_between[y]);
																	message.channel.send(`I have removed ***\`${findRole.name}\`*** because it's an unique role with ***\`${keepThisRole.name}\`***.`)   
																}                                                 
														}
													}else{console.log(`This role doesn't have unique between roles!`)}
													
													message.member.roles.add(results_roleMan[index_Of_role].Role_ID)
													message.channel.send(`You received ***\`${keepThisRole.name}\`***!`)
													console.log(`Added ${issuer.tag} the role ${results_roleMan[index_Of_role].Role_Name}`)
													return;
												}else{
													return message.channel.send(`Unfortunately, you're do not meet the required level to get this role! You need ${results_roleMan[index_Of_role].Level_required - myLevel} more levels to get it!`)
												}
											}
										}
								})
								gimmeReactions.on('end', r =>{
									msg.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error))
								})
							})
						})
                    })
                }else{
                    return message.channel.send(`No roles available to get!`)
                }
			})
			return;
		}
		
		if(args[0]){
			guildSettings.findOne({
				ID: message.guild.id
			},async (err,res)=>{
				if(err){
                    sendError.create({
						Guild_Name: message.guild.name,
						Guild_ID: message.guild.id,
						User: issuer.tag,
						UserID: issuer.id,
						Error: err,
						Time: `${TheDate} || ${clock} ${amORpm}`,
						Command: this.name + " + argument",
						Args: args,
					},async (err, res) => {
						if(err) {
							console.log(err)
							return message.channel.send(`Unfortunately an problem appeared while trying to edit something in moderation mode for rolem command. Please try again later. If this problem persist, contact my partner!`)
						}
						if(res) {
							console.log(`successfully added error to database!`)
							return message.channel.send(`Unfortunately a problem appeared while trying to edit something in moderation mode for rolem command. Please try again later. If this problem persist, contact my partner!`)
						}
					})
				}
				if(res){
					if(res.importantData.staffRole !== `disabled` || res.importantData.staffRole !== undefined){
						if(message.member.roles.cache.find(role => role.id == res.importantData.staffRole)){
							if(args[0] == "add"){
								let entireString = message.content.split(`-`)
								let ObjectRole = {}
								console.log(`The content of message made as array:`)
								console.log(entireString)
								if(entireString.length <= 1) return message.channel.send(`Please mention at least 1 argument! The accepted format:\n\`${prefix}iam add -name: @mentionRole -auto: yes\` -visible: false -level required: 99 -roles required: @role -unique between: @role1 @role2 @role3 @role4 @role5`)
								//adding 
								entireString.forEach(element => {
									let getIndexDoubleDots = element.indexOf(":")
									let extractName = element.substring(0,getIndexDoubleDots)
									let extractValue = element.substring(getIndexDoubleDots+1)
									let idd;
									if(`${extractValue}`.includes(`<@&`)) {idd = extractValue; extractValue = extractValue.replace(/\s/g, '');}
									if(`${extractValue}`.includes(`no`)) extractValue = false
									if(`${extractValue}`.includes(`yes`)) extractValue = true
									if(`${extractName}`.includes(`level required`)) extractValue = parseInt(extractValue)
									if(`${extractName}`.includes(`level required`)) extractName = `level_req`
									if(`${extractName}`.includes(`unique between`)) extractName = `unique_between`
									ObjectRole[extractName] = extractValue
									
								});
								let getID = ObjectRole.name.replace(/(?:<@&|>)/g,"")
								ObjectRole.roleID = getID
								if(!`${ObjectRole.name}`.includes(`<@&`)) return message.channel.send(`Please mention an existent role!`)
								console.log(`Checking for missing parameters...`)
								if(!ObjectRole.name){
									console.log(`Checking name if it's correct... the mention wasn't provided. Stopping configrole`)
									return message.channel.send(`I can't configure a non-existing role! You need to put arguments like this:\n\n__*-argument name* **:** *value*__\n\nThe two dots between argument and value are ***\`needed\`****. You have to mention the role!\nExample: \`${prefix}iam edit -name: @Role name \``)
								}else{
									let wowGimmeThis = message.guild.roles.cache.find(r=> r.id === ObjectRole.roleID)
									ObjectRole.Role_Name = wowGimmeThis.name
									console.log(`The name of role is: ${ObjectRole.name}`)
									console.log(`The namae => ${ObjectRole.namae}`)
								}
								if(!ObjectRole.auto){
									console.log(`Checking auto... not detected, setting to false...`)
									ObjectRole.auto = false
								}else{
									let check = false;
									if(ObjectRole.auto == true || ObjectRole.auto == false) check = true
									if(check == false) return message.channel.send(`${issuer}, please verify what you provided in "auto" option to be either "yes/true/1" or "no/false/0"!`)
									console.log(`Detected auto, it was set to: ${ObjectRole.auto}`)
								}
								if(!ObjectRole.visible){
									console.log(`Checking visible... not detected, setting to false...`)
									ObjectRole.visible = false
								}else{
									let check = false;
									if(ObjectRole.auto == true || ObjectRole.auto == false) check = true
									if(check == false) return message.channel.send(`${issuer}, please verify what you provided in "visible" option to be either "yes/true/1" or "no/false/0"!`)
									console.log(`Detected visible, it was set to: ${ObjectRole.visible}`)
								}
								if(!ObjectRole.level_req){
									console.log(`Checking level required... not detected, setting it to level 1...`)
									ObjectRole.level_req = 1
								}else{
									if(ObjectRole.level_req < 0 || ObjectRole.level_req >999) return message.channel.send(`${issuer}, The required level cannot be below 0 or greater than 999!`)
									console.log(`Detected level required, it was set to: ${ObjectRole.level_req}`)
								}
								if(!ObjectRole.role_req){
									console.log(`Checking role required... not detected, setting it to none...`)
									ObjectRole.role_req = false
								}else{
									let role = message.mentions.roles.first() ? message.mentions.roles.first() : null 
									if (role == null) return message.channel.send(`${issuer}, You have not mentioned a role or I couldn't find them...`)
									ObjectRole.role_req = role.id
									console.log(`Detected roles required, it was set to: ${ObjectRole.role_req}`)
								}
								if(!ObjectRole.unique_between){
									console.log(`Checking unique between... not detected, setting it to none...`)
									// ObjectRole.unique_between = false
								}else{
									console.log(`Detected unique between, it was set to: ${ObjectRole.unique_between}`)
									let rolesUnique = ObjectRole.unique_between
									let putSpace = rolesUnique.replace(/>/g,`> `)
									let splitIt = putSpace.split(` `)
									splitIt.pop()
									console.log(`\n\nSplitting it\n\n`)
									console.log(splitIt)
									let newArry = []
									splitIt.forEach(element => {
										newArry.push(element.replace(/(?:<@&|>)/g,""))
									});
									ObjectRole.unique_between = newArry
								}
					
								console.log(`Final results:`)
								console.log(ObjectRole)
								console.log(`Adding to database...`)
								let NewRole = new RoleManagement({
									Role_Name: ObjectRole.Role_Name,
									Role_ID: ObjectRole.roleID,
									Guild_ID: message.guild.id,
									Auto: ObjectRole.auto,
									Visible: ObjectRole.visible,
									Level_required: ObjectRole.level_req,
									Roles_required: ObjectRole.role_req,
									Unique_between: ObjectRole.unique_between
								})
								NewRole.save(function(err, doc) {
									if (err) return console.error(err);
									console.log(`${issuer.username} (${issuer.id}) created successfully a role management doc!`);
								});
							   return message.channel.send(`Added ${ObjectRole.name} to the list of available roles!`)
					
							}//add
							if(args[0] == "edit"){
								let options = ["auto","visible","level required","role required","unique between"]
								let EditRole = {}
								let anotherArray = message.content.split(`-`)
								anotherArray.forEach(element =>{
										let getIndexDoubleDots = element.indexOf(":")
										let extractName = element.substring(0,getIndexDoubleDots)
										let extractValue = element.substring(getIndexDoubleDots+1)
										extractName = extractName.toLowerCase();
										extractName = extractName.replace(/\s/g,"")
										if(`${extractName}`.includes(`auto`)) extractValue = extractValue.replace(/\s/g,"")
										if(`${extractName}`.includes(`visible`)) extractValue = extractValue.replace(/\s/g,"")
										if(`${extractName}`.includes(`uniquebetween`)) {
											extractName = `unique_between`
											extractValue = extractValue.split('>')
											// extractValue = extractValue.replace(/(?:<@&|>)/g,"")
										}
										if(`${extractValue}`.includes(`<@&`)) {
											// extractValue = extractValue.replace(/\s/g, '');
											//extractValue.replace(/(?:<@&|>)/g,"")
										}
										if(`${extractName}`.includes(`levelrequired`)) {
											extractName = `level_req`
											extractValue = parseInt(extractValue)
										}
										if(`${extractName}`.includes(`rolerequired`)) extractName = `role_req`
										if(`${extractName}`.includes(`role_req`)) extractValue = extractValue.replace(/(?:<@&|>)/g,"")
										// if(`${extractName}`.includes(`uniquebetween`)) {
										//     extractValue = extractValue.replace(/(?:<@&|>)/g,"").join(" ")
										// }
										EditRole[extractName] = extractValue
								})
								if(!EditRole.name) return message.channel.send(`${issuer}, To edit a role added, use this template:\n\n\`${prefix}iam edit -name: @mentionRole -auto: yes\` -visible: false -level required: 99 -roles required: @role -unique between: @role1 @role2 @role3 @role4 @role5`)
								EditRole.roleID = EditRole.name.replace(/(?:<@&|>)/g,"").trim();
								console.log(EditRole)
								RoleManagement.findOne({
									Role_ID: EditRole.roleID
								},(err, results)=>{
									if(err){
										sendError.create({
											Guild_Name: message.guild.name,
											Guild_ID: message.guild.id,
											User: issuer.tag,
											UserID: issuer.id,
											Error: err,
											Time: `${TheDate} || ${clock} ${amORpm}`,
											Command: this.name+" edit option",
											Args: args,
										},async (err2, res2) => {
											if(err2) {
												console.log(err2)
												return message.channel.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
											}
											if(res2) {
												console.log(`successfully added error to database!`)
											}
										})
									}
									function yeno(res) {
										let answer;
										if(res == false) answer = `No`
										if(res == true) answer = `Yes`
										if(res == "false") answer = "No"
										return answer
									}
									function showAll(thearray){
										let theString = ``
										if(thearray[0] == null){
											theString += `No role unique attached!`
										}else{
											for(let i=0; i<thearray.length; i++){
												theString += `<@&${thearray[i]}>\n`
											}
										}
										return theString
									}
									let ReturnMessage = ``;
									if(results){
										if(!args[3]){
										let EmbedRole = new SharuruEmbed()
										.setDescription(`Legend:\n- Auto: (true/false) => Sets whether the role is given when the person levels up.\n- Visible: (true/false) - Sets whether the role will be displayed in the list of available roles to choose from.\n- level required:(number) - Sets level requirement to obtain or assign the role.\n- role required:(role name) - Sets what other role is required to obtain this role.\n- unique between: (mention) - Sets this role unique so that means you can only have this role active at one time. If you choose other role that is unique between this one and others, the one you choose will be assigned to you and the current one *(before choosing)* will be removed from you.\n\nExample how to edit a parameter:\n**c!rolem editrole -name: @rolename**  *-auto: yes*\n*__(P.S: You can also add more options!)__*\n\n [***Available options to change***:](https://www.google.com)\n- Auto *(not implemented)*\n- Visible *(not implemented)*\n- Level Required\n- Role Required *(not implemented)*\n- Unique Between`)
										.addField(`-Role:`,results.Role_Name)
										.addField(`-ID:`,results.Role_ID)
										.addField(`-Auto:`,yeno(results.Auto))
										.addField(`-Visible:`,yeno(results.Visible))
										.addField(`-Level Required:`,results.Level_required)
										.addField(`-Role Required:`,yeno(results.Roles_required) ? yeno(results.Roles_required) : results.Roles_required)
										// .addField('\u200b', '\u200b',true)
										.addField(`-Unique Between:`,showAll(results.Unique_between))
										.setTimestamp()
										.setFooter(`Requested by ${issuer.username}`,issuer.displayAvatarURL())
										.setColor(`PINK`)
										.setAuthor(`Settings Panel:`)
										message.channel.send({embeds: [EmbedRole]})
										return;
										}else{
											console.log(EditRole)
											if(EditRole.auto){
												console.log(`"Auto" detected(${EditRole.auto})\nChecking for valid value...`)
												ReturnMessage += `\nThe \`Auto\` setting was changed to **\`${EditRole.auto}\`**.`
												results.auto = EditRole.auto
												
											}
											if(EditRole.visible){
												console.log(`"Visible" detected(${EditRole.visible})\nChecking for valid value...`)
												ReturnMessage += `\nThe \`visible\` setting was changed to **\`${EditRole.visible}\`**.`
												results.visible = EditRole.visible
											}
											if(EditRole.level_req){
												console.log(`"Level Required" detected(${EditRole.level_req})...\nChecking for valid value...`)
												if(EditRole.level_req >= 1 && EditRole.level_req <= 999){
													results.Level_required = EditRole.level_req
													ReturnMessage += `\nThe \`Level Required\` setting was changed to **\`${EditRole.level_req}\`**`
												}else{
													ReturnMessage += `\nThe \`level_req\` value isn't accepted. Please specify a value between 1 and 999.`
												}
											}
											if(EditRole.role_req){
												console.log(`"Role Required" detected(${EditRole.role_req})...\nChecking for valid value...`)
												ReturnMessage += `\nThe \`role required\` setting was changed to **\`${EditRole.role_req}\`**.`
											}
											if(EditRole.unique_between){
												console.log(`"Unuque between" detected(${EditRole.unique_between})...\nChecking for valid value...`)
												let newRoles = Object.values(EditRole.unique_between);
												let oldRoles = results.Unique_between;
												for (let i = 0; i< newRoles.length; i++){
													if(newRoles[i] == '') {
														newRoles.pop();
														continue;
													}
													newRoles[i] = newRoles[i].replace(/(?:<@&|>)/g,"").trim();
													if(message.guild.roles.cache.find(r=> r.id == newRoles[i])) {
														if(!oldRoles.includes(newRoles[i])) {
															oldRoles.push(newRoles[i])
															// console.log(`Added ${newRoles[i]}`)
															ReturnMessage += `\nRole <@&${newRoles[i]}> was added as an unique role between others!`
														} else {
															// console.log(`Removed ${newRoles[i]}`)
															for(let p = 0; p < oldRoles.length; p++)
															if(oldRoles[p] == newRoles[i]){
																ReturnMessage += `\nRole <@&${oldRoles[p]}> was removed from being an unique role between others!`
																oldRoles.splice(p,1);
															}
														}
													} else {
														ReturnMessage += `\nThis (${newRoles[i]}) isn't a role found on the server!`
													}
												}
											}
										}
										if(ReturnMessage.length < 1) ReturnMessage = `\nUnfortunately nothing got saved and an error happened. Please try again later. If this happens persistently then contact my partner!`
										message.channel.send(`Confirmation Message(if a setting wasn't saved correctly, below it will appear the problems):\n\n${ReturnMessage}`)
										return results.save().catch(err => console.log(err))
									} else {
										return message.channel.send(`I'm sorry ${issuer}, but I couldn't find ${message.mentions.roles.first()} in my list of configurated roles!`)
									}
								})
							}//edit
							if(args[0] == 'remove'){
								let findThisRole = message.mentions.roles.first() ? message.mentions.roles.first().id : 'notMentioned'
								if(findThisRole == 'notMentioned') return message.channel.send(`${issuer}, You didn't mention a role!`)
								if(!findThisRole) return message.channel.send(`${issuer}, Please mention a role!`)
								RoleManagement.findOneAndDelete({
									Role_ID: findThisRole,
								},(err,res) => {
									if(err){
										sendError.create({
											Guild_Name: message.guild.name,
											Guild_ID: message.guild.id,
											User: issuer.tag,
											UserID: issuer.id,
											Error: err,
											Time: `${TheDate} || ${clock} ${amORpm}`,
											Command: this.name+" remove option",
											Args: args,
										},async (err2, res2) => {
											if(err2) {
												console.log(err2)
												return message.channel.send(`Unfortunately an problem appeared while trying to remove in rolem command. Please try again later. If this problem persist, contact my partner!`)
											}
											if(res2) {
												console.log(`successfully added error to database!`)
											}
										})
									}
									if(!res) {
										return message.channel.send(`${issuer}, unfortunately there isn't such a role in my list, please check the list again and make sure you mentioned the correct role and try again.`)
									} else {
										message.channel.send(`${issuer}, I have deleted **${findThisRole}** from my list of roles available for members.`)
										res.save().catch(err => console.log(err))
									}
								})
							}//remove
							if(args[0] == 'clean'){
								// let findThisRole = message.mentions.roles.first() ? message.mentions.roles.first().id : 'notMentioned'
								// if(findThisRole == 'notMentioned') return message.channel.send(`${issuer}, You didn't mention a role!`)
								// if(!findThisRole) return message.channel.send(`${issuer}, Please mention a role!`)
								RoleManagement.find({
									Guild_ID: message.guild.id,
								},(err,res) => {
									if(err){
										sendError.create({
											Guild_Name: message.guild.name,
											Guild_ID: message.guild.id,
											User: issuer.tag,
											UserID: issuer.id,
											Error: err,
											Time: `${TheDate} || ${clock} ${amORpm}`,
											Command: this.name+" clean option",
											Args: args,
										},async (err2, res2) => {
											if(err2) {
												console.log(err2)
												return message.channel.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
											}
											if(res2) {
												console.log(`successfully added error to database!`)
											}
										})
									}
									if (!res) return message.channel.send(`${issuer}, unfortunately there is not a single role configured for this server, ${issuer}.`)
									if (res.length == 1) return message.channel.send(`Can't clean a single role, ${issuer}!`)
									if (res.length > 1) {
										
									}
								})
							}
						} else {
							return message.channel.send(`${issuer}, please set up the staff role!`)
						}
					}
				}
			})
		}
	}

};
