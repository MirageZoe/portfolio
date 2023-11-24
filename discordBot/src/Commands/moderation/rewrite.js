/* eslint-disable no-unused-vars */
const Command = require('../../Structures/Command.js');
const sendError = require('../../Models/Error');
const { PermissionsBitField } = require('discord.js');
const fs = require('fs');
const ms = require('ms');
const pms = require('pretty-ms')

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'rewrite',
			displaying: true,
			description: 'Re-write permissions of a role/user in every channel that Sharuru has access to.',
			options: '\n- \`help\` => shows a list of help on how to use the command.',
			usage: '@role/@user -permission:option -permission2:option2 ...',
			example: ' @someRole -invites: 0-reactions: no - messages: false -see history: yes',
			category: 'moderation',
			userPerms: [PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.ManageRoles],
			SharuruPerms: [PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.ManageRoles],
			args: true,
			guildOnly: true,
            ownerOnly: false,
            aliases: ['rw']
		});
	}

	async run(message, args) {
		// eslint-disable-next-line id-length

        return message.reply(`this is in-dev command!`)
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

		const issuer = message.author;
        const modlog = message.guild.channels.cache.find(channel => channel.name === 'sharuru-logs');
        let prefix = this.client.prefixes.get(message.guild.id)
        function showNicely(arr) {
            let text = ``
            for(let m in arr){
                text += `${m}`;
            }
            return text
        }
        if(args[0] == `help` || !args[0]){
            let viewHelpEmbed = new MessageEmbed()
                .setAuthor(`How to use the rewrite command:`,this.client.user.displayAvatarURL())
                .setDescription(`To be able to use this command correctly, you will have to read this guide carefully and follw the steps below.
                First, the base command is: \`c!rewrite @role -permission:option -permission:option ...\`. The \`@role/@user\`, . 
                The \`-permission:option\` is formed from 2 parts: \`"permission"\` and \`"option"\`. 
                The \`permission\` is replaced by one of the 30 permissions from below, you choose what you wanna do with it. 
                The \`option\` can be only 1 value:
                        - true | yes | 1 => means it will allow the permission to be used by the role;
                        - false | no | 0 => means it will **not** allow the permission to be used by the role;
                **ATTENTION!**:
                   DO NOT FORGET TO PUT THE **":"** (double dots) BETWEEN THE PERMISSION AND OPTION OR IT WILL NOT WORK!
                   
                Permission list:
                -\`invites\` => Allows role to create invites.
                -\`kicks\` => Allows kicking members from server.
                -\`bans\` => Allows banning members from server.
                -\`messages\` => Allow role to manage messages. (Text channels only!)
                -\`roles\` => Allows management and editing of roles.
                -\`channels\` => Allows management and editing of channels.
                -\`guilds\` => Allows management and editing of the server.
                -\`own nickname\` => Allows for modification of own nickname.
                -\`others nickname\` => Allows for modification of other users nicknames.
                -\`webhooks\` => Allows management and editing of webhooks.
                -\`emojis\` => Allows management and editing of emojis.(Text channels only!)
                -\`reactions\` => Allows for the addition of reactions to messages. (Text channels only!)
                -\`logs\` => Allows for viewing of audit logs.`)
                .setFooter(`Page 1/2 | Requested by ${issuer.tag} at`)
                .setTimestamp()
                message.channel.send(viewHelpEmbed)
            let SecondHelpEmbed = new MessageEmbed()
                .setAuthor(`Permission List Part 2:`,this.client.user.displayAvatarURL())
                .setDescription(`-\`speaker\` => Allows for using priority speaker in a voice channel.(Voice channels only!)
				-\`stream\` => Allows the user to go live. (Voice channels only!)
                -\`view channel\` => Allows guild members to view a channel, which includes reading messages in text channels.(Text & Voice channel)
                -\`send message\` => Allows for sending messages in a channel. (Text channels only!)
                -\`send tts\` => Allows for sending of /tts messages. (Text channels only!) 
                -\`show links\` => Links sent by users with this permission will be auto-embedded. (Text channels only!) 
                -\`upload\` => Allows for uploading images and files. (Text channels only!)
                -\`see history\` => Allows for reading of message history. (Text channels only!)
                -\`everyone\` => Allows for using the @everyone tag to notify all users in a channel, and the @here tag to notify all online users in a channel. (Text channels only!) 
                -\`more emoji\` => Allows the usage of custom emojis from other servers.
                -\`insights\` => Allows for viewing guild insights.
                -\`connect voice\` => Allows for joining of a voice channel. (Text channels only!)
                -\`voice\` => Allows for speaking in a voice channel. (Voice channels only!)`)
                .setFooter(`Page 2/2 | Requested by ${issuer.tag} at`)
                .setTimestamp()
				
			let ThirdHelpEmbed = new MessageEmbed()
				.setDescription(`-\`mute others\` => Allows for muting members in a voice channel. (Voice channels only!)
                -\`deaf others\` => Allows for deafening of members in a voice channel. (Voice channels only!)
                -\`move others\` => Allows for moving of members between voice channels. (Voice channels only!)
                -\`voice detect\` => Allows for using voice-activity-detection in a voice channel. (Voice channels only!)
				
                Example of changing permissions in any channel for role "@someRole" to not create invite,add reactions, modify messages but he can see the history of messages:
                \`${prefix}re:write @someRole -invites: 0-reactions: no - messages: false -see history: yes\``)
                setTimeout(() => {
                    message.channel.send(SecondHelpEmbed)
                }, 1000);
				setTimeout(() => {
					message.channel.send(ThirdHelpEmbed)
				}, 2000);
            return;
        }
        let flags = [
            'ADMINISTRATOR',
            'CREATE_INSTANT_INVITE',
            'KICK_MEMBERS',
            'BAN_MEMBERS',
            'MANAGE_MESSAGES',
            'MANAGE_CHANNELS',//(edit and reorder channels)
            'MANAGE_GUILD',//(edit the guild information, region, etc.)
            'MANAGE_NICKNAMES',
            'MANAGE_ROLES',
            'MANAGE_WEBHOOKS',
            'MANAGE_EMOJIS_AND_STICKERS',
            'ADD_REACTIONS',// (add new reactions to messages)
            'VIEW_AUDIT_LOG',
            'PRIORITY_SPEAKER',
            'STREAM',
            'VIEW_CHANNEL',
            PermissionsBitField.Flags.SendMessages,
            'SEND_TTS_MESSAGES',
            'EMBED_LINKS',//(links posted will have a preview embedded)
            'ATTACH_FILES',
            'READ_MESSAGE_HISTORY',
            'MENTION_EVERYONE',
            'USE_EXTERNAL_EMOJIS',
            'VIEW_GUILD_INSIGHTS',
            'CONNECT',
            'SPEAK',
            'MUTE_MEMBERS',
            'DEAFEN_MEMBERS',//(deafen members across all voice channels)
            'MOVE_MEMBERS',//(move members between voice channels)
            'USE_VAD',//(use voice activity detection)
            'CHANGE_NICKNAME',
        ]
        if(args[0] == `perms`){

            let permList = ``;
            for(let i = 0; i< flags.length; i++){
                permList += `\`${flags[i]}\`\n`;
            }
            
            setTimeout(() => {
                // console.log(permList)
                message.channel.send(permList)
            }, 1500);
            return;
        }
        let permissions_List = {}
        let role_or_user_toApplyPermissions;
        if(message.content.includes(`<@&`)){
            role_or_user_toApplyPermissions = message.mentions.roles.first().id
        }else if(message.content.includes(`<@`)){
            role_or_user_toApplyPermissions = message.mentions.users.first().id
        }
        if(role_or_user_toApplyPermissions == undefined) return message.channel.send(`Unfortunately I couldn't execute that because you didn't mentioned a role/user to rewrite permissions!`)
        
        let entireString = message.content.split(`-`)
        if(entireString.length <= 1) return message.channel.send(`Please make sure you wrote down at least 1 permission. For a list of all permissions available, please type \`c!rewrite help\` !`)
        // return console.log(entireString)
        //sorting everything and converting to valid flags for discord to work with
        for(let thg in entireString){
            let element = entireString[thg];
            console.log(`first for`)
            console.log(element)
            let getIndexDoubleDots = element.indexOf(":")
            let extractName = element.substring(0,getIndexDoubleDots)
            let extractValue = element.substring(getIndexDoubleDots+1)

            extractValue = extractValue.replace(/\s/g, '');
            extractName = extractName.replace(/\s/g, '');

            //re-writing with permissions
			if(`${extractName}`.includes(`administrator`)) extractName = `ADMINISTRATOR`;
            if(`${extractName}`.includes(`invites`)) extractName = `CREATE_INSTANT_INVITE`;
            if(`${extractName}`.includes(`kicks`)) extractName = `KICK_MEMBERS`;
            if(`${extractName}`.includes(`bans`)) extractName = `BAN_MEMBERS`;
            if(`${extractName}`.includes(`messages`)) extractName = `MANAGE_MESSAGES`;
            if(`${extractName}`.includes(`channels`)) extractName = `MANAGE_CHANNELS`;
            if(`${extractName}`.includes(`guilds`)) extractName = `MANAGE_GUILD`;
            if(`${extractName}`.includes(`ownnickname`)) extractName = `CHANGE_NICKNAME`;
            if(`${extractName}`.includes(`othersnickname`)) extractName = `MANAGE_NICKNAMES`;
            if(`${extractName}`.includes(`roles`)) extractName = `MANAGE_ROLES`;
            if(`${extractName}`.includes(`webhooks`)) extractName = `MANAGE_WEBHOOKS`;
            if(`${extractName}`.includes(`emojis`)) extractName = `MANAGE_EMOJIS_AND_STICKERS`;
            if(`${extractName}`.includes(`reactions`)) extractName = `ADD_REACTIONS`;
            if(`${extractName}`.includes(`logs`)) extractName = `VIEW_AUDIT_LOG`;
            if(`${extractName}`.includes(`speaker`)) extractName = `PRIORITY_SPEAKER`;
            if(`${extractName}`.includes(`stream`)) extractName = `STREAM`;
            if(`${extractName}`.includes(`viewchannel`)) extractName = `VIEW_CHANNEL`;
            if(`${extractName}`.includes(`sendmessage`)) extractName = PermissionsBitField.Flags.SendMessages;
            if(`${extractName}`.includes(`sendtts`)) extractName = `SEND_TTS_MESSAGES`;
            if(`${extractName}`.includes(`showlinks`)) extractName = `EMBED_LINKS`;
            if(`${extractName}`.includes(`upload`)) extractName = `ATTACH_FILES`;
            if(`${extractName}`.includes(`seehistory`)) extractName = `READ_MESSAGE_HISTORY`;
            if(`${extractName}`.includes(`everyone`)) extractName = `MENTION_EVERYONE`;
            if(`${extractName}`.includes(`moreemoji`)) extractName = `USE_EXTERNAL_EMOJIS`;
            if(`${extractName}`.includes(`insights`)) extractName = `VIEW_GUILD_INSIGHTS`;
            if(`${extractName}`.includes(`connectvoice`)) extractName = `CONNECT`;
            if(`${extractName}`.includes(`voice`)) extractName = `SPEAK`;
            if(`${extractName}`.includes(`muteothers`)) extractName = `MUTE_MEMBERS`;
            if(`${extractName}`.includes(`deafothers`)) extractName = `DEAFEN_MEMBERS`;
            if(`${extractName}`.includes(`moveothers`)) extractName = `MOVE_MEMBERS`;
            if(`${extractName}`.includes(`voicedetect`)) extractName = `USE_VAD`;

            //modifying if they type true/false, yes/no, 1/0 to be set to true/false
            if(`${extractValue}`.includes(`no`) || `${extractValue}`.includes(`0`) || `${extractValue}`.includes(`false`)) extractValue = false
            if(`${extractValue}`.includes(`yes`) || `${extractValue}`.includes(`1`) || `${extractValue}`.includes(`true`)) extractValue = true
            permissions_List[extractName] = extractValue  
        }
        // entireString.forEach(element => {
        //     let getIndexDoubleDots = element.indexOf(":")
        //     let extractName = element.substring(0,getIndexDoubleDots)
        //     let extractValue = element.substring(getIndexDoubleDots+1)

        //     extractValue = extractValue.replace(/\s/g, '');
        //     extractName = extractName.replace(/\s/g, '');

        //     //re-writing with permissions
		// 	if(`${extractName}`.includes(`administrator`)) extractName = `ADMINISTRATOR`;
        //     if(`${extractName}`.includes(`invites`)) extractName = `CREATE_INSTANT_INVITE`;
        //     if(`${extractName}`.includes(`kicks`)) extractName = `KICK_MEMBERS`;
        //     if(`${extractName}`.includes(`bans`)) extractName = `BAN_MEMBERS`;
        //     if(`${extractName}`.includes(`messages`)) extractName = `MANAGE_MESSAGES`;
        //     if(`${extractName}`.includes(`channels`)) extractName = `MANAGE_CHANNELS`;
        //     if(`${extractName}`.includes(`guilds`)) extractName = `MANAGE_GUILD`;
        //     if(`${extractName}`.includes(`ownnickname`)) extractName = `CHANGE_NICKNAME`;
        //     if(`${extractName}`.includes(`othersnickname`)) extractName = `MANAGE_NICKNAMES`;
        //     if(`${extractName}`.includes(`roles`)) extractName = `MANAGE_ROLES`;
        //     if(`${extractName}`.includes(`webhooks`)) extractName = `MANAGE_WEBHOOKS`;
        //     if(`${extractName}`.includes(`emojis`)) extractName = `MANAGE_EMOJIS_AND_STICKERS`;
        //     if(`${extractName}`.includes(`reactions`)) extractName = `ADD_REACTIONS`;
        //     if(`${extractName}`.includes(`logs`)) extractName = `VIEW_AUDIT_LOG`;
        //     if(`${extractName}`.includes(`speaker`)) extractName = `PRIORITY_SPEAKER`;
        //     if(`${extractName}`.includes(`stream`)) extractName = `STREAM`;
        //     if(`${extractName}`.includes(`viewchannel`)) extractName = `VIEW_CHANNEL`;
        //     if(`${extractName}`.includes(`sendmessage`)) extractName = PermissionsBitField.Flags.SendMessages;
        //     if(`${extractName}`.includes(`sendtts`)) extractName = `SEND_TTS_MESSAGES`;
        //     if(`${extractName}`.includes(`showlinks`)) extractName = `EMBED_LINKS`;
        //     if(`${extractName}`.includes(`upload`)) extractName = `ATTACH_FILES`;
        //     if(`${extractName}`.includes(`seehistory`)) extractName = `READ_MESSAGE_HISTORY`;
        //     if(`${extractName}`.includes(`everyone`)) extractName = `MENTION_EVERYONE`;
        //     if(`${extractName}`.includes(`moreemoji`)) extractName = `USE_EXTERNAL_EMOJIS`;
        //     if(`${extractName}`.includes(`insights`)) extractName = `VIEW_GUILD_INSIGHTS`;
        //     if(`${extractName}`.includes(`connectvoice`)) extractName = `CONNECT`;
        //     if(`${extractName}`.includes(`voice`)) extractName = `SPEAK`;
        //     if(`${extractName}`.includes(`muteothers`)) extractName = `MUTE_MEMBERS`;
        //     if(`${extractName}`.includes(`deafothers`)) extractName = `DEAFEN_MEMBERS`;
        //     if(`${extractName}`.includes(`moveothers`)) extractName = `MOVE_MEMBERS`;
        //     if(`${extractName}`.includes(`voicedetect`)) extractName = `USE_VAD`;

        //     //modifying if they type true/false, yes/no, 1/0 to be set to true/false
        //     if(`${extractValue}`.includes(`no`) || `${extractValue}`.includes(`0`) || `${extractValue}`.includes(`false`)) extractValue = false
        //     if(`${extractValue}`.includes(`yes`) || `${extractValue}`.includes(`1`) || `${extractValue}`.includes(`true`)) extractValue = true
        //     permissions_List[extractName] = extractValue  
        // });
        delete permissions_List[""];
        // console.log(permissions_List)
        try {
            console.log(`Role ID: ${role_or_user_toApplyPermissions}, Permissions:`+"")
            console.log(permissions_List)
            let allChannels = message.guild.channels.cache
            for(ch in allChannels){
                let thechan = ch
                console.log(`second for`)
                console.log(thechan)
                await thechan.permissionOverwrites.edit(role_or_user_toApplyPermissions, permissions_List,`"Re-write": Role/Member: ${role_or_user_toApplyPermissions}\nPermissions changed: ${showNicely(permissions_List)}\nModerator: ${issuer.tag}`)
            }
            // message.guild.channels.cache.forEach(async (thechan, id) => {
            //   await thechan.permissionOverwrites.edit(role_or_user_toApplyPermissions, permissions_List,`"Re-write": Role/Member: ${role_or_user_toApplyPermissions}\nPermissions changed: ${showNicely(permissions_List)}\nModerator: ${issuer.tag}`)
            // })
            message.channel.send(`Done! I have re-writed every category, channel and voice channel to reflect the permissions you specified!`)
            } catch (error) {
              console.log(`\n\n================\nError:`)
              console.log(error)
              console.log(`================`)
              message.channel.send(`Unfortunately I couldn't execute that because you didn't mentioned a role/user to rewrite permissions! `)
            }
	}
};
