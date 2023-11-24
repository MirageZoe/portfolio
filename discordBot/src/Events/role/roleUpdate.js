const Event = require('../../Structures/Event');
const { Permissions } = require(`discord.js`);
const SharuruEmbed = require('../../Structures/SharuruEmbed');
const GuildSettings = require('../../Models/GuildSettings')
const sendError = require('../../Models/Error')
const _ = require("lodash")
const dod = require('deep-object-diff');
const whatIsThisObject = {
    name: `The name of the Role`,
    rawPosition: `The position of the Role`,
    permissions: `Permissions Update\n\n`,
    color: `The color of Role`,
    hoist: `If role is displaying or not on right side`,
    managed: `Whether or not the role is managed by an external service`,
    mentionable: `Whether or not the role can be mentioned by anyone`,
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

    async run(oldRole, newRole) {
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
        function MissingPermsViewer(OldPerms, newPerms){
                let perms = [];
                let tempDUMP = ``;
                let currentLongestName = 0;
                let whichPermIsLarger = null;
                const oldPermsLength = OldPerms.length;
                const newPermsLength = newPerms.length;

                if (oldPermsLength > newPermsLength) {
                    //oldPerms is longer meaning permissions were taken
                    console.log(`permissions removed`)
                    for(let i = 0; i < oldPermsLength; i++)
                    {
                        let currentPermChecked = OldPerms[i];
                        currentLongestName = currentPermChecked.replace(/([A-Z])/g, ' $1').trim().length;
                        whichPermIsLarger = oldPermsLength;
                        if (!newPerms.includes(currentPermChecked))
                            tempDUMP = `${currentPermChecked.replace(/([A-Z])/g, ' $1').trim()} - **Missing Permission!**\n`
                        else
                            tempDUMP = `${currentPermChecked.replace(/([A-Z])/g, ' $1').trim()} - *still exist*\n`
                        perms.push(tempDUMP)
                    }
                }
                else if (oldPermsLength < newPermsLength) {
                    //oldPerms is shorter meaning permissions were given
                    console.log(`permissions added`)
                    for(let i = 0; i < newPermsLength; i++)
                    {
                        let currentPermChecked = newPerms[i];
                        currentLongestName = currentPermChecked.replace(/([A-Z])/g, ' $1').trim().length;

                        whichPermIsLarger = newPermsLength;
                        if (!OldPerms.includes(currentPermChecked))
                            tempDUMP = `${currentPermChecked.replace(/([A-Z])/g, ' $1').trim()} - **New Permission!**\n`
                        else
                            tempDUMP = `${currentPermChecked.replace(/([A-Z])/g, ' $1').trim()} - *still exist*\n`
                        perms.push(tempDUMP)
                    }
                } else {
                    // they are both equal, meaning some perms were taken and some were granted without changing the lenght of permissions
                    console.log(`permissions were modified but same length`)
                    // OldPerms.sort();
                    // newPerms.sort();
                    for(let i = 0; i < newPermsLength; i++)
                    {
                        let currentPermChecked = newPerms[i];
                        currentLongestName = currentPermChecked.replace(/([A-Z])/g, ' $1').trim().length;
                        whichPermIsLarger = oldPermsLength;
                        tempDUMP = `${!newPerms.includes(OldPerms[i]) ? `**` : ``}${OldPerms[i].replace(/([A-Z])/g, ' $1').trim()}${!newPerms.includes(OldPerms[i]) ? `**(🔴?)` : ``} - ${!OldPerms.includes(newPerms[i]) ? `**` : ``}${newPerms[i].replace(/([A-Z])/g, ' $1').trim()}${!OldPerms.includes(newPerms[i]) ? `**(🟢?)` : ``}\n`
                        
                        perms.push(tempDUMP)
                    }
                }

                // formatting nicely

                for(let i = 0; i < whichPermIsLarger; i++) {
                    const index = perms[i].indexOf("-")
                    const amountToAdd = currentLongestName - perms[i].slice(0,index-1).length > 0 ? currentLongestName - perms[i].slice(0,index-1).length : 0
                    console.log(amountToAdd)
                    perms[i] = perms[i].slice(0,index) + "-".repeat(amountToAdd)+perms[i].slice(index);//‎
                }

                return perms
        }

        function DiffChange(whateverDifference) {
            if(whatIsThisObject.hasOwnProperty(whateverDifference)){
                return whatIsThisObject[whateverDifference];
            } else return whateverDifference
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
        const userlogs = newRole.guild.channels.cache.find(ch => ch.name == 'sharuru-logs')
       GuildSettings.findOne({
           ID: oldRole.guild.id
       },(err,res)=>{
           if(err){
            sendError.create({
                Guild_Name: newRole.guild.name,
                Guild_ID: newRole.guild.id,
                User: `roleUpdate`,
                UserID: `RoleUpdateID`,
                Error: err,
                Time: `${TheDate} || ${clock} ${amORpm}`,
                Command: `RoleUpdate Event`,
                Args: `No arguments`,
            },async (err, res) => {
                if(err) {
                    console.log(err)
                    return userlogs.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                }
                if(res) {
                    console.log(`successfully added error to database!`)
                }
            })
           }
           if(res){
            //    console.log(oldRole.hexColor)
            //    console.log(newRole)
               if(res.logs.role === true){
                console.log(`this works`)
                   oldRole.guild.fetchAuditLogs().then(audit =>{
                        // console.log(audit.entries.first())
                        if(audit.entries.first().executor.id == this.client.user.id) return;
                        let thediff = getObjectDiff(oldRole,newRole)
                        let descriptionChanged2 = `\n\n**❯ Role Name:** ${oldRole.name}\n**❯ Role ID:** ${oldRole.id}\n**❯ Who updated?:** ${audit.entries.first().executor.username+"#"+audit.entries.first().executor.discriminator} (${audit.entries.first().executor.id})\n**❯ Changes:** ${DiffChange(thediff)}`
                        let descriptionChanged = ``
                        if(thediff.includes(`permissions`)){
                            let oldPermsArr = oldRole.permissions.toArray();
                            let newPermsArr = newRole.permissions.toArray();
                            if(oldPermsArr.length == 0) oldPermsArr = `No permissions`
                            if(newPermsArr.length == 0) newPermsArr = `No permissions`
                            console.log(`oldperms`)
                            console.log(oldPermsArr)
                            console.log(`newperms`)
                            console.log(newPermsArr)
                            descriptionChanged += `**❯ These permissions were modified (old - new)**:\n\n${MissingPermsViewer(oldPermsArr,newPermsArr).join(" ")}`//╰
                            descriptionChanged += ``//╰
                        } else if(thediff.includes("color")){
                            descriptionChanged += `\n\n**❯ Previously:** ${oldRole.hexColor}\n\n**❯ Now:** ${newRole.hexColor}`
                        } else {
                            if (thediff.includes("tags") && thediff.length == 2) thediff = thediff[0]
                            descriptionChanged += `\n\n**❯ Previously:** ${oldRole[thediff]}\n\n**❯ Now:** ${newRole[thediff]}`
                        }
                        const embed = new SharuruEmbed()
                            .setAuthor({name: `Role Updated!`,iconURL: audit.entries.first().executor.displayAvatarURL()})
                            .setColor(`Random`)
                            .setDescription(descriptionChanged2+descriptionChanged)
                            // .setDescription([
                                
                            //     `**❯ Channel ID:** ${oldRole.id} (${oldRole.type})`,
                            //     `**❯ Changed: ${renameNicely(thediff)}`
                            //     `**❯ Who updated the channel:** ${audit.entries.first().executor.username+"#"+audit.entries.first().executor.discriminator} (${audit.entries.first().executor.id})`,
                            // ])
                            const channelLog = oldRole.guild.channels.cache.find(ch => ch.name === 'sharuru-logs');
                            if (channelLog) channelLog.send({embeds: [embed]});
                   }).catch(err=>console.log(err))
               }
           }
       })
    }
}