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

    async run(oldState, newState) {
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
            ID: oldState.guild.id
        },(err,res)=>{
            if(err){
                sendError.create({
                    Guild_Name: oldState.guild.name,
                    Guild_ID: channel.guild.id,
                    User: `VoiceStateUpdate`,
                    UserID: `VoiceStateUpdateID`,
                    Error: err,
                    Time: `${TheDate} || ${clock} ${amORpm}`,
                    Command: `VoiceStateUpdate Event`,
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
                if(!res.logs.voice) return;
                
                /**
                 * long story short: 
                 * someone joins when the old state doesn't have an id and new one has
                 * someone changes voice channels when: both have not undefined id and they are not the same as well
                 * someone leaves when the new state has no id
                 */
                const namae = `Voice Activity!`
                if(oldState.channelId == undefined && newState.channelId != undefined) {

                    // User Joins a voice channel
                    console.log(`[Logs-Voice | ${newState.guild.name} (${newState.guild.id})]: ${newState.id} joined ${newState.channelId}!`)
                    const embed = new SharuruEmbed()
                        .setAuthor({name: namae})
                        .setColor(`Random`)
                        .setDescription(`<@${newState.id}> joined <#${newState.channelId}>`)
                    const channelLog = oldState.guild.channels.cache.find(ch => ch.name === 'sharuru-logs');
                    if (channelLog) channelLog.send({embeds: [embed]});
                }
                if (newState.channelId == undefined) {
            
                    // User leaves a voice channel
                    console.log(`[Logs-Voice | ${oldState.guild.name} (${oldState.guild.id})]: ${oldState.id} left ${oldState.channelId}!`)
                    const embed = new SharuruEmbed()
                        .setAuthor({name: namae})
                        .setColor(`Random`)
                        .setDescription(`<@${oldState.id}> left <#${oldState.channelId}>`)
                    const channelLog = oldState.guild.channels.cache.find(ch => ch.name === 'sharuru-logs');
                    if (channelLog) channelLog.send({embeds: [embed]});
                }

                if ((oldState.channelId != undefined && newState.channelId != undefined) && oldState.channelId != newState.channelId) {

                    // User changed vc
                    console.log(`[Logs-Voice | ${newState.guild.name} (${newState.guild.id})]: ${oldState.id} changed voice channel! ${oldState.channelId} -> ${newState.channelId}!`)
                    const embed = new SharuruEmbed()
                        .setAuthor({name: namae})
                        .setColor(`Random`)
                        .setDescription(`<@${newState.id}> changed voice channels! <#${oldState.channelId}> -> <#${newState.channelId}>`)
                    const channelLog = oldState.guild.channels.cache.find(ch => ch.name === 'sharuru-logs');
                    if (channelLog) channelLog.send({embeds: [embed]});
                }

            }
        })
    }
}