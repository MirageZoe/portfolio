/* eslint-disable no-unused-vars */
const Command = require('../../Structures/Command.js');
const { PermissionsBitField, Collection, GuildAuditLogs } = require('discord.js');
const fs = require('fs');
const ms = require('ms');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'lock',
			displaying: true,
			description: 'It\'s locking the channel from the view of members. This is not working on members with special permissions to view selected channels.',
			options: `
            - \`no option\` => It will lock the channel where the command was used. To unlock, use the command again.
            - \`all\` => it will lock all channels from the view of members. Use again the option \`all\` to unlock all.
            
            **\`ATTENTION\`**\n\nMake sure that the **staff channels** are inside a category called \`Staff\`.`,
			usage: 'lock',
			example: 'lock all',
			category: 'moderation',
			userPerms: [PermissionsBitField.Flags.ManageChannels],
			SharuruPerms: [PermissionsBitField.Flags.ManageChannels],
			args: false,
			guildOnly: true,
			ownerOnly: false,
			aliases: ['lockdown']
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
        let thisChannel = message.channel;
        let thechannels = message.guild.channels.cache;
        let GuildRolePerms = message.channel.permissionOverwrites.cache.get(message.guild.id)
        let staffChat = null
        let channelKeysArray = [...thechannels.keys()]
        let doItorNot = true
        let logs = message.guild.channels.cache.find(r=> r.name === 'sharuru-logs')
        let channelTypes = ['GUILD_TEXT','GUILD_VOICE','GUILD_NEWS','GUILD_STORE','GUILD_STAGE_VOICE']
        let typesToRead = {
            GUILD_TEXT: "Text Channel",
            GUILD_VOICE: 'Voide Channel',
            GUILD_NEWS: "News Channel",
            GUILD_STORE: "Store Channel",
            GUILD_STAGE_VOICE: "Stage Channel"
        }

        for(let i = 0; i< channelKeysArray.length; i++ ){
            let obj = thechannels.get(channelKeysArray[i])
            if(obj.type === 'GUILD_CATEGORY' && obj.name === "Staff" || obj.name === "staff"){
                // console.log(`Found this category: ${obj.name}`)
                staffChat = obj.id
            }
            
        }
        setTimeout(() => {
        if(!staffChat) console.log(`No staff chat found`);
            
        }, 500);

        if (args[0] == 'all') {
            let report = `**I have unlocked the next channels:**\n`;
            let report2 = `**I have locked the next channels:**\n`
            let report3 = `**I haven't touch the next channels:**\n`
            if(!staffChat) {
                message.channel.send(`I couldn't find a category called "Staff" in the server, are you sure you want to continue? I'll lock all channels that I can see. If you wanna unlock them type again and I'll do it but be careful because I might reveal as well the Staff channels/other channels that members are not supposed to see because they are not in a category called "Staff" *(the category must be exactly like that, capital "S" and small letters after.)*\n\nI'll wait 1 min for your answer. Please answer with either **\`yes\`** or **\`no\`**. Any other answer will be considered **\`no\`**`).then(msg=>{
                    let filter = m => m.author.id == message.author.id
                    message.channel.awaitMessages({filter,max: 1, time: 60000, errors:['time']}).then(collected=>{
                        let answer = collected.first().content;
                        if(answer == 'yes'){
                            for (let i = 0; i < channelKeysArray.length; i++) {
                                let thechan = thechannels.get(channelKeysArray[i])
                                if(channelTypes.includes(thechan.type)){
                                        let perms = message.guild.channels.cache.find(r=> r.id == thechan.id).permissionOverwrites.cache.get(message.guild.id).deny
                                        if(perms == 1024) {
                                            thechan.permissionOverwrites.edit(message.guild.id,{
                                                VIEW_CHANNEL: null
                                            })
                                            .catch(err =>{
                                                console.log(err)
                                                message.channel.send(`Unfortunately an error popped up while trying to lock a channel... If this persist, please contact my partner!`)
                                            })
                                            report+= `- ${thechan.name} (${typesToRead[thechan.type]})\n`
                                            // message.channel.send(`I have unlocked **\`${thechan.name}\`** channel!`)
                                        } else {
                                            thechan.permissionOverwrites.edit(message.guild.id,{
                                                VIEW_CHANNEL: false
                                            })
                                            .catch(err =>{
                                                console.log(err)
                                                message.channel.send(`Unfortunately an error popped up while trying to lock a channel... If this persist, please contact my partner!`)
                                            })
                                            report2+= `- ${thechan.name} (${typesToRead[thechan.type]})\n`
                                            // message.channel.send(`I have locked **\`${thechan.name}\`** channel!`)
                                        }
                                }
                            }
                            setTimeout(() => {
                                logs.send(`I have done the next things at ${issuer.tag} request!\n\n${report}\n${report2}`)
                            }, 2000);
                        } else {
                            return message.channel.send(`Ok, I'm stopping now from locking/unlocking the channels! ${issuer.tag}`)
                        }
                    })
                })
                return;
            }
            for (let i = 0; i < channelKeysArray.length; i++) {
                const thechan = thechannels.get(channelKeysArray[i])
                doItorNot = true
                if(channelTypes.includes(thechan.type)){
                    if (thechan.parentId == staffChat) {
                        doItorNot = false
                        console.log(`${thechan.name} is part of Staff chat ${staffChat}, I'm skipping it.`)
                        report3+=`- ${thechan.name} (${typesToRead[thechan.type]})\n`
                    }
    
                    if(doItorNot == true) {
                        let perms = message.guild.channels.cache.find(r=> r.id == thechan.id).permissionOverwrites.cache.get(message.guild.id).deny
                        if(perms == 1024) {
                            thechan.permissionOverwrites.edit(message.guild.id,{
                                VIEW_CHANNEL: null
                            })
                            .catch(console.error)
                            report+= `- ${thechan.name} (${typesToRead[thechan.type]})\n`
                        } else {
                            thechan.permissionOverwrites.edit(message.guild.id,{
                                VIEW_CHANNEL: false
                            })
                            .catch(console.error)
                            report2+= `- ${thechan.name} (${typesToRead[thechan.type]})\n`
                        }
                    }
                }
            }
            setTimeout(() => {
                logs.send(`I have done the next things at ${issuer.tag} request!\n\n${report}\n${report2}\n${report3}`)
            }, 2000);
            return
        }
        
        if(message.channel.parentId == staffChat) return message.reply(`I can't unlock/lock this channel since it's in the Staff category`)
        if (GuildRolePerms.deny == 1024) {
            // message.channel.send(`The channel will be unlocked in 3 seconds!`)
            // setTimeout(() => {
                thisChannel.permissionOverwrites.edit(message.guild.id,{
                    VIEW_CHANNEL: true
                })
                .then(channel => console.log(`Successfully unlocked the ${message.channel.name} at ${issuer.tag} (${issuer.id}) request at ${clock} ${amORpm} on ${TheDate}!`))
                .catch(console.error)
                return message.channel.send(`I have unlocked this channel!`)
            // }, 3000);
        } else {
            thisChannel.permissionOverwrites.edit(message.guild.id,{
                VIEW_CHANNEL: false
            })
            .then(channel => console.log(`Successfully locked the ${message.channel.name} at ${issuer.tag} (${issuer.id}) request at ${clock} ${amORpm} on ${TheDate}!`))
            .catch(console.error)
            return message.channel.send(`I have locked this channel!`)
        }
	}
};
