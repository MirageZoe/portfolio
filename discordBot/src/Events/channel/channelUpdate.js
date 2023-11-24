const Event = require('../../Structures/Event');
const { Permissions } = require(`discord.js`);
const SharuruEmbed = require('../../Structures/SharuruEmbed');
const GuildSettings = require('../../Models/GuildSettings')
const sendError = require('../../Models/Error')
const _ = require("lodash")
const dod = require('deep-object-diff');
const whatIsThisObject = {
    name: `The name of the Channel`,
    rawPosition: `The position of the Channel`,
    parentID: `The Channel was moved from previous category!`,
    permissionOverwrites: `Permissions List Update\n\n`,
    topic: `The channel topic!`,
    nsfw: `The safety of the channel (nsfw)!`,
    rateLimitPerUser: `The slowmode of the channel!`,
    ADMINISTRATOR: `Admin`,
    CREATE_INSTANT_INVITE: `Create Invite`,
    KICK_MEMBERS: `Kick Members`,
    BAN_MEMBERS: `Ban Members`,
    MANAGE_MESSAGES: `Manage Messages`,
    MANAGE_CHANNELS: `Manage Channel`,//(edit and reorder channels)
    MANAGE_NICKNAMES: `Manage Nicknames`,
    MANAGE_ROLES: `Manage Roles`,
    MANAGE_WEBHOOKS:`Manage Webhooks`,
    MANAGE_EMOJIS_AND_STICKERS: `Manage Emojis & Stickers`,
    MANAGE_GUILD: `Manage Server`,
    ADD_REACTIONS: `Add Reactions`,// (add new reactions to messages)
    PRIORITY_SPEAKER: `Priority Speaker`,
    STREAM: `Video Stream`,
    VIEW_CHANNEL: `View Channel`,
    SEND_MESSAGES: `Send Messages`,
    SEND_TTS_MESSAGES: `Send TTS Messages`,
    EMBED_LINKS: `Embed Links`,//(links posted will have a preview embedded)
    ATTACH_FILES: `Attach Files`,
    READ_MESSAGE_HISTORY: `Read Message History`,
    MENTION_EVERYONE: `Mention @everyone, @here and All Roles`,
    USE_EXTERNAL_EMOJIS: `Use External Emoji`,
    VIEW_GUILD_INSIGHTS: `View Server Insights`,
    CONNECT: `Connect To Voice`,
    SPEAK: `Speak in Voice`,
    MUTE_MEMBERS: `Mute Members`,
    DEAFEN_MEMBERS: `Deafen Members`,//(deafen members across all voice channels)
    MOVE_MEMBERS: `Move Members`,//(move members between voice channels)
    USE_VAD: `Use Voice Activity`,//(use voice activity detection)
    CHANGE_NICKNAME: `Change Own Nickname`,
}

module.exports = class extends Event {

    async run(oldChannel, newChannel) {
        function mysize(obj) {
            let size = 0,key;
            for (key in obj) {
              if (obj.hasOwnProperty(key)) size++;
            }
            return size;
        };
        /*
        * Compare two objects by reducing an array of keys in obj1, having the
        * keys in obj2 as the intial value of the result. Key points:
        *
        * - All keys of obj2 are initially in the result.
        *
        * - If the loop finds a key (from obj1, remember) not in obj2, it adds
        *   it to the result.
        *
        * - If the loop finds a key that are both in obj1 and obj2, it compares
        *   the value. If it's the same value, the key is removed from the result.
        */
        function getObjectDiff(obj1, obj2) {
            const diff = Object.keys(obj1).reduce((result, key) => {
                if (!obj2.hasOwnProperty(key)) {
                    result.push(key);
                } else if (_.isEqual(obj1[key], obj2[key])) {
                    const resultKeyIndex = result.indexOf(key);
                    result.splice(resultKeyIndex, 1);
                }
                return result;
            }, Object.keys(obj2));

            return diff;
        }
        function renameNicely(toRename){
                let perms = [];
                for(let i = 0; i< toRename.length; i++){
                    if(whatIsThisObject.hasOwnProperty(toRename[i])){
                        perms.push(whatIsThisObject[toRename[i]])
                    }
                }
                return perms
        }

        

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
       GuildSettings.findOne({
           ID: oldChannel.guild.id
       },(err,res)=>{
           if(err){
            sendError.create({
                Guild_Name: channel.guild.name,
                Guild_ID: channel.guild.id,
                User: `channelUpdate`,
                UserID: `channelUpdateID`,
                Error: err,
                Time: `${TheDate} || ${clock} ${amORpm}`,
                Command: `channelUpdate Event`,
                Args: `No arguments`,
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
           if(res){
                if(res.logs.channel === true){
                   oldChannel.guild.fetchAuditLogs().then(audit =>{
                        // console.log(audit.entries.first().executor)
                        if(audit.entries.first().executor.id == this.client.user.id) return;
                        function slowModeCal(timeInSec) {
                            if(timeInSec > 0 && timeInSec <= 59){
                                return timeInSec+` seconds`
                            }
                            if(timeInSec >= 60 && timeInSec <= 1799){
                                return timeInSec/60+` minute(s)`
                            }
                            if(timeInSec >= 1800){
                                return timeInSec/3600+` hour(s)`
                            }
                            return `Off`
                        }
                        let thediff = getObjectDiff(oldChannel,newChannel)
                        let descriptionChanged2 = `\n\n**❯ Channel Name:** ${oldChannel.name} (${oldChannel.type})\n**❯ Channel ID:** ${oldChannel.id}\n**❯ Who updated?:** ${audit.entries.first().executor.username+"#"+audit.entries.first().executor.discriminator} (${audit.entries.first().executor.id})\n**❯ Changes:** ${renameNicely(thediff)}`
                        let descriptionChanged = ``
                        if(thediff.includes(`permissionOverwrites`)){
                            let oldObjectChannel = Object.fromEntries(oldChannel.permissionOverwrites)
                            let newObjectChannel = Object.fromEntries(newChannel.permissionOverwrites)
                            let whatAdded = dod.addedDiff(oldObjectChannel,newObjectChannel)
                            let whatUpdated = dod.updatedDiff(oldObjectChannel,newObjectChannel)
                            let whatDeleted = dod.deletedDiff(oldObjectChannel,newObjectChannel)
                            let resultsChange;
                            let whatHappened = ``
                            if(mysize(whatAdded) > 0) {
                                resultsChange = whatAdded
                                whatHappened = `added`
                            }
                            if(mysize(whatUpdated) > 0) {
                                resultsChange = whatUpdated
                                whatHappened = `updated`
                            }
                            if(mysize(whatDeleted) > 0) {
                                resultsChange = whatDeleted
                                whatHappened = `deleted`
                            }
                            let getKey = Object.keys(resultsChange)
                            let oldobj = oldChannel.permissionOverwrites.get(getKey[0])
                            let newObj = newChannel.permissionOverwrites.get(getKey[0])
                            let name = ``
                            
                                //if added
                            if(whatHappened == `added`){
                                if(newObj.type == `role`) name = `<@&${newObj.id}>`
                                else name = `<@${newObj.id}>`
                                console.log(`A new ${newObj.type} has been added!`)
                                descriptionChanged += `A new ${newObj.type} (${name}) was added in permission list of this channel!`

                                //if updated
                            } else if(whatHappened == 'updated'){
                                console.log(`${newObj.id} has been updated!`)
                                if(newObj.type == `role`) name = `<@&${newObj.id}>`
                                else name = `<@${newObj.id}>`
                                console.log(oldobj)
                                descriptionChanged += `The existing ${newObj.type} (${name}) permissions were modified:\n**❯ Previously:**\n │\n**╰Allowed**: ${renameNicely(oldobj.allow.toArray()).join("**,** ")}\n │\n**╰Denied**: ${renameNicely(oldobj.deny.toArray()).join("**,** ")}`
                                descriptionChanged += `\n \n**❯ Now:**\n|\n**╰Allowed**: ${renameNicely(newObj.allow.toArray()).join("**,** ")}\n |\n**╰Denied**: ${renameNicely(newObj.deny.toArray()).join("**,** ")}`

                                //if deleted
                            } else {
                                if(oldobj.type == `role`) name = `<@&${oldobj.id}>`
                                else name = `<@${oldobj.id}>`
                                console.log(`${oldobj.id} has been deleted!`)
                                // console.log(oldobj)
                                descriptionChanged += ` ${name} (${oldobj.type}) was deleted from the permission list of this channel!`
                                descriptionChanged += `It had the following permissions:\n │\n**╰Allowed**: ${renameNicely(oldobj.allow.toArray()).join("**,** ")}\n\n**╰Denied**: ${renameNicely(oldobj.deny.toArray()).join("**,** ")}`
                            }
                        } else {
                            if(thediff == `rateLimitPerUser`){
                                descriptionChanged += `\n\n**❯ Previously:**  ${slowModeCal(oldChannel[thediff])}\n\n**❯ Now:** ${slowModeCal(newChannel[thediff])}`
                            } else if(thediff == `topic`) {
                                let mtopic = `No topic`
                                let mtopic2 = `No topic`
                                if(oldChannel[thediff] !== null) mtopic = oldChannel[thediff]
                                if(newChannel[thediff] !== null) mtopic2 = newChannel[thediff]
                                descriptionChanged += `\n\n**❯ Previously:**  ${mtopic}\n\n**❯ Now:** ${mtopic2}`
                            } else {
                                descriptionChanged += `\n\n**❯ Previously:**  ${oldChannel[thediff]}\n\n**❯ Now:** ${newChannel[thediff]}`
                            }
                        }
                        const embed = new SharuruEmbed()
                            .setAuthor({name:`Channel Updated!`,iconURL:audit.entries.first().executor.displayAvatarURL()})
                            .setColor(`Random`)
                            .setDescription(descriptionChanged2+descriptionChanged)
                            // .setDescription([
                                
                            //     `**❯ Channel ID:** ${oldChannel.id} (${oldChannel.type})`,
                            //     `**❯ Changed: ${renameNicely(thediff)}`
                            //     `**❯ Who updated the channel:** ${audit.entries.first().executor.username+"#"+audit.entries.first().executor.discriminator} (${audit.entries.first().executor.id})`,
                            // ])
                            const channelLog = oldChannel.guild.channels.cache.find(ch => ch.name === 'sharuru-logs');
                            if (channelLog) channelLog.send({embeds: [embed]});
                   }).catch(err=>console.log(err))
               }
           }
       })
    }
}