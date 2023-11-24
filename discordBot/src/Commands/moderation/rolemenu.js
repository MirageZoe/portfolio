/* eslint-disable no-unused-vars */
const Command = require('../../Structures/Command.js');
const SharuruEmbed = require('../../Structures/SharuruEmbed');
const sendError = require('../../Models/Error');
const fs = require('fs');
const ms = require('ms');
const pms = require('pretty-ms');
const roleMenuDocs = require('../../Models/roleMenuDocs.js');
const keygenerator = require('keygenerator');
const { PermissionsBitField } = require('discord.js');


module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'rolemenu',
            aliases: ['rm','rolemanager'],
			displaying: true,
			description: 'The reaction role system at your command. Create, edit and remove easily reaction roles to your liking! More info on the [website](https://www.google.com)!',
			options: `\n- \`create <-name: Name of the menu> [-desc: Description of the menu] <-mode: [standard/unique/multi]> <-roles: @role1 @role2 @role3...> [-g ignore role: @roleToIgnore] [-g require role: @roleToRequire] [-temporary role: 5min-30days] [-min: 0-20] [-max: 0-20]\` => creates a group of roles from where members can take whatever they want.
			\n- \`edit <id of the role menu> [-name: Name of the menu], [-desc: Description of the menu], [-mode: [standard/unique/multi]], [-g ignore role: @roleToIgnore], [-g require role: @roleToRequire] [-temporary role: 5min-30days] [-min: 0-20] [-max: 0-20]\` => edit any option specified. If you want to edit the roles of the menu,
			you will have to type: \`<-roles: #POsitionOfRole>\` followed by an option like \`-replace role: @role, -notify: yes/no, -emoji: newEmoji, -ignore role: @role, -require role: @role\`.\n
			- \`remove <id of the role menu>\` => it will remove a role menu created.\n
			- \`list\` => Shows a list of role menu created so far.\n
			- \`send <id of the role menu> <#channelToSend> <Emoji1> <Emoji2> <Emoji3> ...\` => After the creation of the role menu, you will have to send it to a channel. When adding the emojis after \`#channel\`, you will have to add as many the role menu roles has! For example the role menu has 3 roles, you will need 3 emojis.
			Example 2: role menu has 9 roles, you will need 9 emojis and so on.`,
			usage: '',
			example: '',
			category: 'moderation',
			userPerms: [PermissionsBitField.Flags.ManageMessages,PermissionsBitField.Flags.ManageRoles,PermissionsBitField.Flags.EmbedLinks,PermissionsBitField.Flags.AddReactions],
			SharuruPerms: [PermissionsBitField.Flags.ManageMessages,PermissionsBitField.Flags.ManageRoles,PermissionsBitField.Flags.EmbedLinks,PermissionsBitField.Flags.AddReactions],
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

		const sharuru = this.client
		const issuer = message.author;
		const prefix = this.client.prefixes.get(message.guild.id)
		const userlogs = message.guild.channels.cache.find(ch => ch.name == 'sharuru-logs')
		let allowedTimeletters = ['s','sec','min','h']
        let commandOptions = ['create','edit','remove','list','send','display','r'];
        let roleMenuOptions = ['standard','unique','multi']
        let userOption = args[0]

		//no option
		if (commandOptions.indexOf(userOption) == -1){
			return message.channel.send(`${issuer},I don\'t have that kind of option. `)
		}

		// create
        if (commandOptions.indexOf(userOption) == 0) {
            let randomID = `${message.guild.id.slice(-3)}${keygenerator.number({length:7})}`;
            let contentOfGroup = args.slice(1).join(" ").split('-');
			let groupMenuOptions = new Map();
			let reworkedRoles = []

			//sorting options
            for(let groupOption in contentOfGroup){
				let element = contentOfGroup[groupOption];
				let getIndexDoubleDots = element.indexOf(":")
				let extractName = element.substring(0,getIndexDoubleDots)//.trim()
				let extractValue = element.substring(getIndexDoubleDots+1)//.trim()
				let tempSafe = extractValue.trim()
				
				extractValue = extractValue.replace(/\s/g, '');
				extractName = extractName.replace(/\s/g, '');
				if (extractName.includes('name')) extractValue = tempSafe
				if (extractName.includes('desc')) extractValue = tempSafe
				if (extractName.includes('roles')) extractValue = tempSafe
				console.log(`we have=> ${extractName} : ${extractValue}`)
				if(extractName.includes("roles")) {
					extractValue = extractValue.replace(/<@&/gi,' ').trim()
					extractValue = extractValue.replace(/>/gi,' ').trim()
					extractValue = extractValue.split(" ").filter(Number);
				}
				if(extractName.includes("ignorerole") || extractName.includes("requirerole")){
					extractValue = extractValue.replace("<@&","").trim()
					extractValue = extractValue.replace(">","").trim()
				}
				if(extractName.includes("gignorerole") || extractName.includes("grequirerole")){
					extractValue = extractValue.replace("<@&","").trim()
					extractValue = extractValue.replace(">","").trim()
				}
	
				//modifying if they type true/false, yes/no, 1/0 to be set to true/false
				if(`${extractValue}`.includes(`no`) && (extractName == 'requireone' || extractName == 'singlerole') || `${extractValue}`.includes(`0`) && (extractName == 'requireone' || extractName == 'singlerole') || `${extractValue}`.includes(`false`) && (extractName == 'requireone' || extractName == 'singlerole')) extractValue = false
				if(`${extractValue}`.includes(`yes`) && (extractName == 'requireone' || extractName == 'singlerole')|| `${extractValue}`.includes(`1`) && (extractName == 'requireone' || extractName == 'singlerole')|| `${extractValue}`.includes(`true`) && (extractName == 'requireone' || extractName == 'singlerole')) extractValue = true
				// groupOptions[extractName] = extractValue
				// console.log(`results=> ${extractName} : ${extractValue}`)
				groupMenuOptions.set(extractName,extractValue)  
			}
			if (roleMenuOptions.indexOf(groupMenuOptions.get("mode")) == -1) return message.channel.send(`${issuer},please specify a correct mode for the role menu! Available modes: **${roleMenuOptions}**`)
			if (groupMenuOptions.get("roles").length <= 1) return message.channel.send(`${issuer},If you are making a menu only for 1 role then you shouldn't use the command in the first place for this...`)
			if (groupMenuOptions.get('name').length < 4 || groupMenuOptions.get('name').length > 40) return message.channel.send(`${issuer},The name of the role menu cannot be lower than 4 characters neither exceed more than 40!`)
			if (groupMenuOptions.get('desc')?.length < 6 || groupMenuOptions.get('desc')?.length > 100) return message.channel.send(`${issuer},The description of the role menu cannot be lower than 6 characters neither exceed more than 100!`)
			if (groupMenuOptions.get('mode') == 'unique' && (groupMenuOptions.get("min") || groupMenuOptions.get("max"))) return message.channel.send(`${issuer},You cannot use the minimum roles needed and maximum roles allowed feature with "unique" mode!`)
			if (groupMenuOptions.get('mode') == 'standard' && (groupMenuOptions.get("min") || groupMenuOptions.get("max"))) return message.channel.send(`${issuer},To use the minimum roles needed and maximum roles allowed feature, you need to use "multi" mode!`)
			if (groupMenuOptions.get('mode') == 'multi' && groupMenuOptions.get("min") == undefined || 
			groupMenuOptions.get('mode') == 'multi' && groupMenuOptions.get("max") == undefined || 
			groupMenuOptions.get('mode') == 'multi' && groupMenuOptions.get("min") == undefined && groupMenuOptions.get("max") == undefined ) return message.channel.send(`${issuer},if you're going to use the "multi" mode, please specify the minimum & maximum
			of roles a member must have/can have.`)
			if(groupMenuOptions.get('temporaryrole') !== undefined) {
				if(!checkForItems(groupMenuOptions.get('temporaryrole'),allowedTimeletters,'includes')) groupMenuOptions.set("temporaryrole",groupMenuOptions.get('temporaryrole')+'s')
				if(ms(groupMenuOptions.get('temporaryrole')) < 300000 || ms(groupMenuOptions.get('temporaryrole')) > 2629800000) return message.channel.send(`${issuer},When you set temporary roles time, you can't set it lower than 5 min or longer than 1 month!`)
			}
			for (const element of groupMenuOptions.get("roles")) {
				let obj = {}
				obj.emoji = null;
				obj.role = element
				obj.requires_this = null;
				obj.ignores_this = null;
				obj.notify = null;
				reworkedRoles.push(obj)
			}
			setTimeout(() => {
				roleMenuDocs.create({
					group_id: randomID,
					group_name: groupMenuOptions.get('name'),
					group_description: groupMenuOptions.get('desc'),
					group_mode: groupMenuOptions.get('mode'),
					group_details: groupMenuOptions.get('details') ? groupMenuOptions.get('details') : false, 
					group_roles: reworkedRoles,
					group_required_role: groupMenuOptions.get('grequirerole') ? groupMenuOptions.get('grequirerole') : null,
					group_ignored_role: groupMenuOptions.get('gignorerole') ? groupMenuOptions.get('gignorerole') : null,
					group_temporary: groupMenuOptions.get('temporaryrole') ? ms(groupMenuOptions.get('temporaryrole')) : 0,
					// group_require_one: groupMenuOptions.get('requireone') ? groupMenuOptions.get('requireone') : false,
					// group_single_role: groupMenuOptions.get('singlerole') ? groupMenuOptions.get('singlerole') : false,
					group_min_roles: groupMenuOptions.get("min") ? groupMenuOptions.get("min") : 0,
					group_max_roles: groupMenuOptions.get("max") ? groupMenuOptions.get("max") : 0,
					group_guildID: message.guild.id,
				},(err,res)=>{
					if(err){
						console.log(err)
						userlogs.send(`Unfortunately an error appeared while trying to save a role menu in \`rolemenu\` command ! If this persist please tell my partner about it! Error: ${err.message}`)
						return message.channel.send(`${issuer},unfortunately an error happened. Please try again later! If this persist, tell my partner about this!`)
					}
					if(res){
						return message.channel.send(`${issuer},Your role menu with the name of \`${groupMenuOptions.get('name')}\` (id: ${randomID}) was successfully created! Please use \`${prefix}rolemenu send <id of the role menu> <#channel> <emoji_1> <emoji_2> <emoji_3> ...\` to send it to a channel and assign at the same time required emojis to get the roles!\n\nExample: you created a role menu with 3 roles, that means you will have something like this:\n\n\`${prefix}rolemenu send 0000000000 #self-assign-role :one: :two: :three:\``)
					}
				})
			}, 300);
        }

		// edit
		if (commandOptions.indexOf(userOption) == 1) {
			let roleMenuID = args[1];
			if (!args[2]) return message.channel.send(`${issuer},Please tell me what you want to edit!`)
			if (!args[3]) return message.channel.send(`${issuer},Please tell me with what you want to replace!!`)
			roleMenuDocs.findOne({
				group_id: roleMenuID,
				group_guildID: message.guild.id
			},async(err,res)=>{
				if (err) {
					sendError.create({
						Guild_Name: message.guild.name,
						Guild_ID:  message.guild.id,
						User: issuer.tag,
						UserID: issuer.id,
						Error: err,
						Time: `${TheDate} || ${clock} ${amORpm}`,
						Command: `roleMenu - edit option`,
						Args: args,
					},async (err, res) => {
						if(err) {
							console.log(err)
							return userlogs.send(`Unfortunately an error happened while trying to save error report in db for roleMenu command. Please contact my partner!`)
						}
						if(res) {
							console.log(`successfully added error to database from messageReactionAdd event!`)    
						}
					})
					return userlogs.send(`Unfortunately an error appeared while trying to read from db for the role menu with msg id ${reaction.message.id}! If this persist please tell my partner about it! Error: ${err.message}`)
				}
				if(res){
					let errorMessage = `Unfortunately, I some errors appeared :(:\n\n`
					// return console.log(`length error: ${errorMessage.length}`)
					let successMessage = `I have successfully changed the next things:\n\n`
					let allowedEdits = ['name','desc','mode','grequirerole','gignorerole','temporaryrole','min','max','roles','ignorerole','requirerole']
					const digits_only = string => [...string].every(c => '0123456789'.includes(c));
					let allowedModes = ['standard','unique','multi']
					let rolesOption = args.slice(2).join(" ").split('-')
					let currentRoles = res.group_roles;
					let newRolesOptions = new Map()
					const thisChannelID = res.group_channelID.toString()
					const thisMessageID = res.group_messageID.toString()

					// if (!checkForItems(newRolesOptions.get,allowedEdits,'same')) return message.channel.send(`${issuer},This edit option is unfortunately not recognized: ${newValue}`)
					
					for(let groupOption in rolesOption){
						let element = rolesOption[groupOption];
						let getIndexDoubleDots = element.indexOf(":")
						let extractName = element.substring(0,getIndexDoubleDots)//.trim()
						let extractValue = element.substring(getIndexDoubleDots+1).trim()


						extractName = extractName.replace(/\s/g, '');
						// console.log(`we have=> ${extractName} : ${extractValue}`)
						if(extractName.includes("roles")) {
							extractValue = extractValue.replace(/<@&/gi,'').trim()
							extractValue = extractValue.replace(/>/gi,'').trim()
						}
						if(extractName.includes("replacerole")) {
							extractValue = extractValue.replace(/<@&/gi,'').trim()
							extractValue = extractValue.replace(/>/gi,'').trim()
						}
						if(extractName.includes("ignorerole") || extractName.includes("requirerole")){
							extractValue = extractValue.replace("<@&","").trim()
							extractValue = extractValue.replace(">","").trim()
						}
						if(extractName.includes("gignorerole") || extractName.includes("grequirerole")){
							extractValue = extractValue.replace("<@&","").trim()
							extractValue = extractValue.replace(">","").trim()
						}
			
						//modifying if they type true/false, yes/no, 1/0 to be set to true/false
						if(`${extractValue}`.includes(`no`) && (extractName == 'notify' || extractName == 'details') || `${extractValue}`.includes(`0`) && (extractName == 'notify' || extractName == 'details') || `${extractValue}`.includes(`false`) && (extractName == 'notify' || extractName == 'details')) extractValue = false
						if(`${extractValue}`.includes(`yes`) && (extractName == 'notify' || extractName == 'details') || `${extractValue}`.includes(`1`) && (extractName == 'notify' || extractName == 'details') || `${extractValue}`.includes(`true`) && (extractName == 'notify' || extractName == 'details')) extractValue = true
						newRolesOptions.set(extractName,extractValue)  
					}

					if (newRolesOptions.get('name')) {
						let oldname = res.group_name
						console.log(`This is the new name: ${newRolesOptions.get('name')}`)
						if (newRolesOptions.get('name').length < 4 || newRolesOptions.get('name').length > 40) return message.channel.send(`${issuer},The name of the role menu cannot be lower than 4 characters neither exceed more than 40!`)
						res.group_name = newRolesOptions.get('name');
						successMessage+= `- Changed the name of role menu from \`${oldname}\` to \`${res.group_name}\`\n`
						message.guild.channels.cache.get(thisChannelID).messages.fetch(thisMessageID).then(msg =>{
							let newEmbed = msg.embeds[0];
							newEmbed.author.name = `Role Bundle: ${res.group_name}`
							msg.edit( {embeds: [newEmbed] })
							console.log(`name changed!`)
						})
					}
					
					if (newRolesOptions.get('desc')) {
						let olddesc = res.group_description
						console.log(`This is the new desc: ${newRolesOptions.get('desc')}`)
						if (newRolesOptions.get('desc').length < 6 || newRolesOptions.get('desc').length > 100) return message.channel.send(`${issuer},The description of the role menu cannot be lower than 6 characters neither exceed more than 100!`)
						res.group_description = newRolesOptions.get('desc')
						successMessage+= `- Changed the description of role menu from \`${olddesc}\` to \`${res.group_description}\`\n`
						message.guild.channels.cache.get(thisChannelID).messages.fetch(thisMessageID).then(msg =>{
							msg.embeds[0].footer.text = res.group_description;
							console.log(`desc changed!`)
						})
					}
					
					if (newRolesOptions.get('mode')) {
						let oldmode = res.group_mode
						console.log(`This is the new mode: ${newRolesOptions.get('mode')}`)
						if (!checkForItems(newRolesOptions.get('mode'),allowedModes,'same')) return message.channel.send(`${issuer},This mode is unfortunately not recognized: ${newRolesOptions.get('mode')}`);
						res.group_mode =newRolesOptions.get('mode')
						successMessage+= `- Changed the mode of role menu from \`${oldmode}\` to \`${res.group_mode}\`\n`
					}

					if (newRolesOptions.get('details') != undefined) {
						let oldDetails = res.group_details
						console.log(`in details option`)
						let correctValue = true
							if (typeof(newRolesOptions.get("details")) !== 'boolean') {
								errorMessage += `- The '**Details**' option isn't valid! It accepts only yes/no, true/false or 1/0!`;
								correctValue = false;
							}
							if (correctValue == true) {
								res.group_details = newRolesOptions.get('details')
								console.log(`new details: ${res.group_details}`)
								successMessage+= `- Changed to ${res.group_details ? `show details on role menu like what role they need to interact or what role will be ignored` : `not show details on role menu like what role they need to interact or what role will be ignored`}.\n`
								message.guild.channels.cache.get(thisChannelID).messages.fetch(thisMessageID).then(msg =>{
									let newEmbed = msg.embeds[0];
									if (res.group_details == true) {
										console.log(`true details`)
										newEmbed.description = `**Requires role:**\n<@&${res.group_required_role}>\n**Ignores role:**\n<@&${res.group_ignored_role}>\n`
										msg.edit({embeds: [newEmbed] });
									}
									if (res.group_details == false) {
										console.log(`false details`)
										newEmbed.description = null;
										msg.edit({embeds: [newEmbed] });
									}
								})
							}
					}

					if (newRolesOptions.get('roles')) {
						let totalRoles = currentRoles.length
						if(newRolesOptions.get('roles') < 1 || newRolesOptions.get('roles') > totalRoles) return message.channel.send(`${issuer},unfortunately I couldn't find a role with position ${newRolesOptions.get('roles')}`)
						let roleToEdit = currentRoles[newRolesOptions.get('roles')-1];

						// console.log(`current object to edit:`)
						// console.log(roleToEdit)
						
						if (newRolesOptions.get('replacerole') != undefined) {
							let oldrole = roleToEdit.role;
							let findRole = message.guild.roles.cache.get(newRolesOptions.get('replacerole'))
							if (message.mentions.roles.size == 1){
								findRole = message.guild.roles.cache.find(role => role.id == message.mentions.roles.first().id)
							}
							if (!findRole) errorMessage += `- I couldn't find the you want to replace. Please mention the role or provide a valid role id!`
							if (findRole) {
								roleToEdit.role = findRole.id;
								successMessage+= `- Changed a role of role menu from <@&${oldrole}> to <@&${roleToEdit.role}>.\n`;
								message.guild.channels.cache.get(thisChannelID).messages.fetch(thisMessageID).then(msg =>{
									let newEmbed = msg.embeds[0];
									replaceRole: for (let i = 0; i < newEmbed.fields.length; i++) {
										console.log(newEmbed.fields[i].value)
										if(newEmbed.fields[i].value.includes(oldrole)) {
											newEmbed.fields[i].value = `To get <@&${roleToEdit.role}>`
											msg.edit({embeds: [newEmbed] });
											console.log(`role changed!`)
											break replaceRole;
										}
									}
								})
							}
						}

						if (newRolesOptions.get("notify") != undefined) {
							let correctValue = true
							if (typeof(newRolesOptions.get("notify")) !== 'boolean') {
								errorMessage += `- The '**Notify**' option isn't valid! It accepts only yes/no, true/false or 1/0!`;
								correctValue = false;
							}
							if (correctValue == true) {
								roleToEdit.notify = newRolesOptions.get('notify')
								successMessage+= `- Changed to ${roleToEdit.notify ? `notify members when they can't take roles or remove.` : `not notify members when they can or not take roles or remove.`}.\n`
							}						
						}

						if (newRolesOptions.get('requirerole')){
							let oldRrole = roleToEdit.requires_this;
							let heMentioned = false;
							let findRole = message.guild.roles.cache.get(newRolesOptions.get('requirerole'))
							if (message.mentions.roles.size == 1){
								heMentioned = true
								findRole = message.guild.roles.cache.find(role => role.id == message.mentions.roles.first().id)
							}
							if (!findRole) errorMessage += `- I couldn't find the \`required role\` you have mentioned earlier. Please mention the role or provide a valid role id!`
							if (findRole) {
								roleToEdit.requires_this = findRole.id
								successMessage+= `- Changed the required role of <@&${roleToEdit.role}> to ${findRole} from <@&${oldRrole}>.\n`
							}
						}

						if (newRolesOptions.get('ignorerole')) {
							let oldIrole = roleToEdit.ignores_this;
							let heMentioned = false;
							let findRole = message.guild.roles.cache.get(newRolesOptions.get('ignorerole'))
							if (message.mentions.roles.size == 1){
								heMentioned = true
								findRole = message.guild.roles.cache.find(role => role.id == message.mentions.roles.first().id)
							}
							if (!findRole) errorMessage += `- I couldn't find the \`ignored role\` you have mentioned earlier. Please mention the role or provide a valid role id!`
							if (findRole) {
								roleToEdit.ignores_this = findRole.id
								successMessage+= `- Changed the required role of <@&${roleToEdit.role}> to ${findRole} from <@&${oldIrole}>.\n`
							}
						}

						if (newRolesOptions.get('emoji')) {
							//checking if it's custom emoji
							let oldEmoji = roleToEdit.emoji;
							let intactEmoji = newRolesOptions.get('emoji')
							let customEmoji = false
							if (checkForItems(newRolesOptions.get('emoji'),[0,1,2,3,4,5,6,7,8,9],'includes')) customEmoji = true;
							if (customEmoji == false) {
								roleToEdit.emoji = newRolesOptions.get('emoji')
							}
							if (customEmoji == true) {
								let clearCustomEmoji = newRolesOptions.get('emoji').replace(/[^0-9.]/g,'')//.trim()
								roleToEdit.emoji = clearCustomEmoji
							}
							let emojiToSearch = digits_only(oldEmoji)
							if (emojiToSearch) emojiToSearch = sharuru.emojis.cache.get(oldEmoji)
							if (!emojiToSearch) emojiToSearch = oldEmoji
							successMessage = successMessage +  `- Changed the emoji of <@&${roleToEdit.role}> role to ${intactEmoji} from ${emojiToSearch}.\n`;
							message.guild.channels.cache.get(thisChannelID).messages.fetch(thisMessageID).then(msg =>{
								if (msg.reactions.cache.get(oldEmoji)) {
									msg.reactions.cache.get(oldEmoji).remove()
								}
								msg.react(roleToEdit.emoji)
								let newEmbed = msg.embeds[0]
								replaceEmoji: for (let i = 0; i < newEmbed.fields.length; i++) {
									let thisField = msg.embeds[0].fields[i];
									if(thisField.name.includes(emojiToSearch)){ // to do: make the edit command search for the field with emoji and role and change them
										if (customEmoji == true) {
											thisField.name = `React with ${sharuru.emojis.cache.get(roleToEdit.emoji)}`
											msg.edit(newEmbed)
											break replaceEmoji;
										}
										if (!customEmoji) {
											thisField.name = `React with ${roleToEdit.emoji}`
											msg.edit(newEmbed)
											break replaceEmoji;
										}
									}
								}
							})
						}

						// console.log(`current object edited finally:`)
						// console.log(roleToEdit)
						let newRolesGroup = Object.assign(currentRoles,roleToEdit)

						roleMenuDocs.updateOne({
							'group_id': `${roleMenuID}`
						},{'$set':{ 'group_roles' : newRolesGroup}},(erro,reso)=>{
							if (erro) {
								sendError.create({
									Guild_Name: message.guild.name,
									Guild_ID: message.guild.id,
									User: issuer.tag,
									UserID: issuer.id,
									Error: erro,
									Time: `${TheDate} || ${clock} ${amORpm}`,
									Command: this.name + `, rolemenu send subcommand`,
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
								console.log(`I have updated the group_roles master`)
							}
						});
					}

					if (newRolesOptions.get('grequirerole')) {
						let oldGrequiredRole = res.group_required_role
						let findRole = message.guild.roles.cache.get(newRolesOptions.get('grequirerole'))
						if(message.mentions.roles.size > 0) findRole = message.guild.roles.cache.find((role) => role.id === message.mentions.roles.first().id)
						if(!findRole) return message.channel.send(`${issuer},Sadly I can't find this role you want to require... Please provide a role id that is valid or mention the role better!`)
						res.group_required_role = newRolesOptions.get('grequirerole');
						successMessage+= `- Changed the required role to interact with the role menu entirely to <@&${res.group_required_role}> role from <@&${oldGrequiredRole}> .\n`
						message.guild.channels.cache.get(thisChannelID).messages.fetch(thisMessageID).then(msg =>{
							let newEmbed = msg.embeds[0];
							replaceGrequireRole: for (let i = 0; i < newEmbed.fields.length; i++) {
								console.log(newEmbed.fields[i].name)
								if(newEmbed.fields[i].name == 'You need this role to pick anything:') {
									newEmbed.fields[i].value = `<@&${res.group_required_role}>`
									msg.edit({embeds: [newEmbed] })
									break replaceGrequireRole;
								}
							}
						})
					}
					
					if (newRolesOptions.get('gignorerole')) {
						let oldGignoreRole = res.group_ignored_role
						let findRole = message.guild.roles.cache.get(newRolesOptions.get('gignorerole'))
						if(message.mentions.roles.size > 0) findRole = message.guild.roles.cache.find((role) => role.id === message.mentions.roles.first().id)
						if(!findRole) return message.channel.send(`${issuer},Sadly I can't find this role you want to ignore... Please provide a role id that is valid or mention the role better!`)
						res.group_ignored_role = newRolesOptions.get('gignorerole');
						successMessage+= `- Changed the role to ignore members from interacting with the role menu entirely to <@&${res.group_ignored_role}> role from <@&${oldGignoreRole}> .\n`
						message.guild.channels.cache.get(thisChannelID).messages.fetch(thisMessageID).then(msg =>{
							let newEmbed = msg.embeds[0];
							replaceGignoreRole: for (let i = 0; i < newEmbed.fields.length; i++) {
								console.log(newEmbed.fields[i].name)
								if(newEmbed.fields[i].name == 'Anyone with this role will be ignored:') {
									newEmbed.fields[i].value = `<@&${res.group_ignored_role}>`
									msg.edit({embeds: [newEmbed] })
									break replaceGignoreRole;
								}
							}
						})
					}
					
					if (newRolesOptions.get('temporaryrole')) {
						let oldTemporary = res.group_temporary
						if(!checkForItems(newRolesOptions.get('temporaryrole'),allowedTimeletters,'includes') && /^\d+$/.test(newRolesOptions.get('temporaryrole')) == false) return message.channel.send(`${issuer},Please specify numbers only if you want seconds or these: 1min, 25min, 1h, 12h for easier understanding.`)
						if(!checkForItems(newRolesOptions.get('temporaryrole'),allowedTimeletters,'includes') && /^\d+$/.test(newRolesOptions.get('temporaryrole')) == true) newRolesOptions.set('temporaryrole',newRolesOptions.get('temporaryrole')+'s')
						newRolesOptions.set('temporaryrole',ms(newRolesOptions.get('temporaryrole')));
						if (newRolesOptions.get('temporaryrole') < 300000 || newRolesOptions.get('temporaryrole') > 2629800000) return message.channel.send(`${issuer},When you set temporary roles time, you can't set it lower than 5 min or longer than 1 month!`)
						res.group_temporary = newRolesOptions.get('temporaryrole');
						successMessage+= `- Changed the time after which roles expires to ${pms(res.group_temporary)} from ${pms(oldTemporary)}.\n`
					}
					
					if (newRolesOptions.get('min')) {
						let oldMin = res.group_min_roles
						if (digits_only(newRolesOptions.get('min')) == false) return message.channel.send(`${issuer},you need to use numbers only between 0 and 20 & lower than the maximum roles allowed!`)
						if (res.group_min_roles >= newRolesOptions.get('max') || res.group_min_roles >= res.group_max_roles) return message.channel.send(`${issuer},the minimum roles needed shouldn't be bigger or equally to the maximum roles allowed!`)
						if (newValue < 0 || newValue > 20) return message.channel.send(`${issuer},The minimum roles needed in a group is 0 and the maximum roles allowed in a group is 20.`)
						res.group_min_roles = newRolesOptions.get('min')
						message.guild.channels.cache.get(thisChannelID).messages.fetch(thisMessageID).then(msg =>{
							let newEmbed = msg.embeds[0];
							replaceGignoreRole: for (let i = 0; i < newEmbed.fields.length; i++) {
								console.log(newEmbed.fields[i].name)
								if(newEmbed.fields[i].name == '') {
									newEmbed.fields[i].value = `<@&${res.group_ignored_role}>`
									msg.edit({embeds: [newEmbed] })
									break replaceGignoreRole;
								}
							}
						})
						successMessage+= `- Changed the minimum roles needed for this role menu to ${res.group_min_roles} from ${oldMin}.\n`
					}

					if (newRolesOptions.get('max')) {
						let oldMax = res.group_max_roles
						if (digits_only(newRolesOptions.get('max')) == false) return message.channel.send(`${issuer},you need to use numbers only between 0 and 20 & bigger than minimum roles needed!!`)
						if (newRolesOptions.get('max') <= res.group_min_roles) return message.channel.send(`${issuer},the maximum roles allowed shouldn't be lower or equally to the minimum roles needed!`)
						if (newValue < 0 || newValue > 20) return message.channel.send(`${issuer},The minimum roles needed in a group is 0 and the maximum roles allowed in a group is 20.`)
						res.group_max_roles = newRolesOptions.get('max')
						successMessage+= `- Changed the maximum roles allowed for this role menu to ${res.group_max_roles} from ${oldMax}.\n`

					}

					res.save().catch(err2 => console.log(err2))
					let pushToUser = successMessage
					if(errorMessage.length > 45) pushToUser += errorMessage
					return message.channel.send(pushToUser)
				}
			})
		}

		// delete
		if (commandOptions.indexOf(userOption) == 2) {
			let roleMenuID = args[1]
			roleMenuDocs.findOne({
				group_id: roleMenuID,
				group_guildID: message.guild.id
			},(err,res)=>{
				if (err) {
					sendError.create({
						Guild_Name: message.guild.name,
						Guild_ID:  message.guild.id,
						User: issuer.tag,
						UserID: issuer.id,
						Error: err,
						Time: `${TheDate} || ${clock} ${amORpm}`,
						Command: `roleMenu - delete option`,
						Args: args,
					},async (err, res) => {
						if(err) {
							console.log(err)
							return userlogs.send(`Unfortunately an error happened while trying to save error report in db for roleMenu command. Please contact my partner!`)
						}
						if(res) {
							console.log(`successfully added error to database from messageReactionAdd event!`)    
						}
					})
					return userlogs.send(`Unfortunately an error appeared while trying to read from db for the role menu with msg id ${reaction.message.id}! If this persist please tell my partner about it! Error: ${err.message}`)
				}
				if (res) {
					roleMenuDocs.findOneAndDelete({
						group_id: roleMenuID
					},(err,res2)=>{
						if (err) {
							sendError.create({
								Guild_Name: message.guild.name,
								Guild_ID:  message.guild.id,
								User: issuer.tag,
								UserID: issuer.id,
								Error: err,
								Time: `${TheDate} || ${clock} ${amORpm}`,
								Command: `roleMenu - delete option`,
								Args: args,
							},async (err, res) => {
								if(err) {
									console.log(err)
									return userlogs.send(`Unfortunately an error happened while trying to save error report in db for roleMenu command. Please contact my partner!`)
								}
								if(res) {
									console.log(`successfully added error to database from messageReactionAdd event!`)    
								}
							})
							return userlogs.send(`Unfortunately an error appeared while trying to read from db for the role menu with msg id ${reaction.message.id}! If this persist please tell my partner about it! Error: ${err.message}`)
						}
						if (res) {
							message.guild.channels.cache.get(res.group_channelID.toString()).messages.fetch(res.group_messageID.toString()).then(msg =>{
								msg.delete({timeout: 1000})
							})
							return message.channel.send(`${issuer},I have deleted role menu "${res.group_name}" from ${message.guild.channels.cache.get(res.group_channelID.toString())} channel!`)
						}
						if (!res) {
							return message.channel.send(`${issuer},I couldn't find this role menu.`)
						}
					})
				}
			})
			
		}

		// list
		if (commandOptions.indexOf(userOption) == 3) {
			roleMenuDocs.find({ 
				group_guildID: message.guild.id
			},async(err,res)=>{
				if(err){
					sendError.create({
						Guild_Name: message.guild.name,
						Guild_ID:  message.guild,
						User: issuer.tag,
						UserID: issuer.id,
						Error: err,
						Time: `${TheDate} || ${clock} ${amORpm}`,
						Command: this.name +` command - list option`,
						Args: args,
					},async (err, res) => {
						if(err) {
							console.log(err)
						}
						if(res) {
							userlogs.send(`An erorr happened while using the \`rolemenu\` command. Please try again later. If this persist, contact my partner and tell this: \`ERROR_#S3\`!`)
							return console.log(`successfully added error to database from mute system!`)    
						}
					})
					return message.channel.send(`${issuer},unfortunately an error happened. Please try again later! If this persist, tell my partner about this!`)
				}
				if(!res){
					return message.channel.send(`${issuer},there isn't any role menu created for this server. Are you sure you created at least one?`)
				}
				if(res){
					let roleMenuIDs = []
					for(let i = 0; i < res.length; i++){
						roleMenuIDs.push(`${res[i].group_name} *(id: ${res[i].group_id})*`)
					}
					
					let roleMenuList = new SharuruEmbed()
						.setAuthor(`Role Menus Created so far:`,issuer.displayAvatarURL())
						.setColor(`RANDOM`)
						.setFooter(`Requested by ${issuer.tag} (${issuer.id}) at `)
						.setTimestamp()
						.setDescription(`- ${roleMenuIDs.join(",\n- ")}`)
					return message.channel.send({ embeds: [roleMenuList] })
				}
			})
		}

		// send
		if (commandOptions.indexOf(userOption) == 4) {
			let roleMenuID = args[1]
			let channelProvided = args[2]
			let emojisToReact = args.slice(3).join(" ").split(" ")
			// return console.log(emojisToReact)
			let emojisRefined = []
			let channelToSend = message.guild.channels.cache.get(channelProvided) || message.guild.channels.cache.find(ch => ch.name === channelProvided);
			// return console.log(intactEmojis)
			if(message.mentions.channels.size > 0) channelToSend = message.guild.channels.cache.find(ch => ch.id == message.mentions.channels.first().id)
			// return console.log(channelToSend)
			if(!channelToSend) return message.channel.send(`${issuer}, please verify if you mentioned a channel/provided a channel id correctly!`)
			roleMenuDocs.findOne({
				group_id: roleMenuID,
				group_guildID: message.guild.id
			},(err,res)=>{
				if(err){
					sendError.create({
						Guild_Name: message.guild.name,
						Guild_ID: message.guild.id,
						User: issuer.tag,
						UserID: issuer.id,
						Error: err,
						Time: `${TheDate} || ${clock} ${amORpm}`,
						Command: this.name + `, rolemenu send subcommand`,
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
				if(res){
					if (emojisToReact.length < res.group_roles.length) return message.channel.send(`${issuer},please type after channel mentioned enough emojis! There are ${res.group_roles.length} roles so type ${res.group_roles.length} emojis!`)
					for(let thisEmoji of emojisToReact) {
						if (thisEmoji.includes(`<:`) == true) {
							thisEmoji = thisEmoji.replace(/[^0-9.]/g,"").trim();
							let testEmoji = sharuru.emojis.cache.get(thisEmoji)
							if(testEmoji !== undefined)	emojisRefined.push(thisEmoji)
							continue;
						}
						///\d/.test(thisEmoji) == false
						emojisRefined.push(thisEmoji)
						
					}
					// console.log(emojisRefined)
					let helpText = res.group_description;
					let menus = this.client.roleMenuData.get(message.guild.id);
					let roleMenuEmbed = new SharuruEmbed()
						.setAuthor({name: `Role Bundle: ${res.group_name}`})
						.setColor('Random')
						.setFooter({text:`.${helpText}`})
						.setTimestamp()
					helpText = ``;
					let placeHolderRoles = res.group_roles;
					for(let i = 0; i < emojisRefined.length; i++){
							// console.log(emojisRefined[i])
							let displayProperly = emojisRefined[i]
							let testEmoji = sharuru.emojis.cache.get(emojisRefined[i])
							if(testEmoji !== undefined)	displayProperly = sharuru.emojis.cache.get(emojisRefined[i])
						roleMenuEmbed.addFields({name: `React with ${displayProperly}`,value: `To get <@&${res.group_roles[i].role}>${res.group_details ? `
						${res.group_roles[i].requires_this ? `Needs: <@&${res.group_roles[i].requires_this}>` : ``}
						${res.group_roles[i].ignores_this ? `Ignores: <@&${res.group_roles[i].ignores_this}>` : ``}` : ``}`})
						placeHolderRoles[i].emoji = emojisRefined[i]
					}
					if (res.group_required_role !== null && res.group_details == true) {
						helpText +=`**Requires role:**\n<@&${res.group_required_role}>\n`
					}
					if (res.group_ignored_role !== null && res.group_details == true) {
						helpText +=`**Ignores role:**\n<@&${res.group_ignored_role}>`

					}
					if (helpText.length >= 1)
						roleMenuEmbed.setDescription(`${helpText}`)
					roleMenuDocs.updateOne({
						'group_id': `${roleMenuID}`
					},{'$set':{ 'group_roles' : placeHolderRoles}},(erro,reso)=>{
						if (erro) {
							sendError.create({
								Guild_Name: message.guild.name,
								Guild_ID: message.guild.id,
								User: issuer.tag,
								UserID: issuer.id,
								Error: erro,
								Time: `${TheDate} || ${clock} ${amORpm}`,
								Command: this.name + `, rolemenu send subcommand`,
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
							console.log(`I have updated the group_roles master`)
						}
					});
					setTimeout(() => {
						// console.log(roleMenuEmbed)
						channelToSend.send({ embeds: [roleMenuEmbed] }).then(msg =>{
							for(let i = 0; i < emojisRefined.length; i++){
								msg.react(emojisRefined[i])
							}
							// menus[channelToSend.id] = [msg.id]
							if(!menus) menus = {}
							//checking if the channel exist, 
							//if not, create a property with the channel id and empty array
							//if yes, push into the array more
							console.log(`assigning data...`)
							if(menus.hasOwnProperty(channelToSend.id) && !menus[channelToSend.id].find(msgid => msgid == msg.id)) menus[channelToSend.id].push(msg.id)
							if(!menus.hasOwnProperty(channelToSend.id)) menus[channelToSend.id] = [msg.id]
							this.client.roleMenuData.set(message.guild.id,menus)
							res.group_messageID = msg.id
							res.group_channelID = channelToSend.id
							res.save().catch(err=> console.log(err))
						})
					}, 300);
					console.log(`done`)
				}
				
			})
		}

		// display
		if (commandOptions.indexOf(userOption) == 5) {
			let roleMenuID = args[1]
			console.log(roleMenuID)
			if (!roleMenuID) return message.channel.send(`${issuer},provide an ID of a role menu!`)
			roleMenuDocs.findOne({
				group_id: roleMenuID,
				group_guildID: message.guild.id
			},(err,res)=>{
				if(err){
					sendError.create({
						Guild_Name: message.guild.name,
						Guild_ID: message.guild.id,
						User: issuer.tag,
						UserID: issuer.id,
						Error: err,
						Time: `${TheDate} || ${clock} ${amORpm}`,
						Command: this.name + `, rolemenu display subcommand`,
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
					let roleEmbed = new SharuruEmbed()
						.setAuthor(`Role Menu Name: ${res.group_name}`)
						.setColor(`RANDOM`)
						.setDescription(`
						**|===============================|**
						**Mode**: ${res.group_mode}
						**Requires following role**: <@&${res.group_required_role}>
						**Ignores following role**: <@&${res.group_ignored_role}>
						**Show Details? (like requires/ignores)**: ${res.group_details ? "yes" : 'no'}
						**Is Temporary Roles?**: ${res.group_temporary.length > 0 ? pms(res.group_temporary) : "No. They are permanent!"}\n
						**Min roles to have in this group**: ${res.group_min_roles}
						**Max roles to have in this group**: ${res.group_max_roles}
						**|===============================|**`)
						.setFooter(res.group_description)
						for(let i = 0; i < res.group_roles.length; i++){
							roleEmbed.addField(`Role #${i+1}:`,"<@&"+res.group_roles[i].role+">")
						}
						return message.channel.send({embeds: [roleEmbed] })
				}
				if (!res){
					return message.channel.send(`${issuer},I don't recognize this id...`)
				}
			})
		}

		//show r
		if (commandOptions.indexOf(userOption) == 6 && issuer.id == '186533323403689986') {
			console.log(`showing:`)
			roleMenuDocs.find({},async (err,res)=>{
				if (err) {
					sendError.create({
						Guild_Name: `Can't retrieve guildName because it's in error  from the event.`,
						Guild_ID:  `Can't retrieve guildID because it's in error  from the event.`,
						User: `Can't retrieve user because it's in error  from the event.`,
						UserID: `Can't retrieve userid because it's in error  from the event.`,
						Error: err,
						Time: `${TheDate} || ${clock} ${amORpm}`,
						Command: `mute system => roleMenu system`,
						Args: `Can't retrieve args because it's in error  from the event.`,
					},async (err, res) => {
						if(err) {
							console.log(err)
						}
						if(res) {
							console.log(`successfully added error to database from mute system!`)    
						}
					})
				}
				if(res){
					for(let i = 0; i < res.length; i++){                        
						let menus = this.client.roleMenuData.get(res[i].group_guildID.toString())
						if (menus == undefined) menus = {}
						if(!menus.hasOwnProperty(res[i].group_channelID.toString())) menus[res[i].group_channelID.toString()] = []
						if (menus.hasOwnProperty(res[i].group_channelID.toString()) && !menus[res[i].group_channelID.toString()].find(msgid => msgid == res[i].group_messageID.toString())) menus[res[i].group_channelID.toString()].push(res[i].group_messageID.toString())
						this.client.roleMenuData.set(res[i].group_guildID.toString(),menus)
					}
				}
			})
		setTimeout(() => {
			console.log(this.client.roleMenuData)
		}, 500);
		}

		if (args[0] == 't' && issuer.id == '186533323403689986') {
			//fetching actual data
			console.log(`fetching data...`)
			let menus = this.client.roleMenuData.get(message.guild.id);
			if(!menus) menus = {}
			//checking if the channel exist, 
			//if not, create a property with the channel id and empty array
			//if yes, push into the array more
			console.log(`assigning data...`)
			if(menus.hasOwnProperty(channelToSend.id)) menus[channelToSend.id].push(args[1])
			if(!menus.hasOwnProperty(channelToSend.id)) menus[channelToSend.id] = [msg.id]
			this.client.roleMenuData.set(message.guild.id,menus)
			console.log(`done!`)
		}


		/**
		 * 
		 * @param {String} userInput The input of the user.
		 * @param {[]} checkfor The items to check, based on condition, what the user input
		 * @param {String} condition The conditions to check for:
		 * 
		 * - 'includes' => checks if the user input includes one of the following items in the "checkfor" array.
		 * - 'same' => checks if the user input is the same as one of the following items in the 'checkfor' array.
		 * @returns true/false if the condition is met.
		 */
		function checkForItems(userInput,checkfor,condition) {
			if(userInput?.length == 0 || checkfor.length == 0) return 0
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
					const item = checkfor[i];
					console.log(item)
					if(userInput == item) {
						sameItem = true;
						break sameLoop;
					} 
				}
				return sameItem
			}
		}
		// to do: I guess to make the other parts of the command because the system I think it's done, just need testing

	}// end of command running
};