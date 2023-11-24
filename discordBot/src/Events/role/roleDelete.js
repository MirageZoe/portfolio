const Event = require('../../Structures/Event');
const SharuruEmbed = require('../../Structures/SharuruEmbed');
const GuildSettings = require('../../Models/GuildSettings')
const sendError = require('../../Models/Error')
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

    async run(role) {

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
        function renameNicely(toRename){
            let perms = [];
            for(let i = 0; i< toRename.length; i++){
                if(whatIsThisObject.hasOwnProperty(toRename[i])){
                    perms.push(whatIsThisObject[toRename[i]])
                }
            }
            return perms
    }
        const channelLog = role.guild.channels.cache.find(ch => ch.name === 'sharuru-logs');
        console.log(`role deleted`)
       GuildSettings.findOne({
           ID: role.guild.id
       },(err,res)=>{
           if(err){
            sendError.create({
                Guild_Name: role.guild.name,
                Guild_ID: role.guild.id,
                User: `emojiDelete`,
                UserID: `emojiDeleteID`,
                Error: err,
                Time: `${TheDate} || ${clock} ${amORpm}`,
                Command: `emojiDelete Event`,
                Args: `No arguments`,
            },async (err, res) => {
                if(err) {
                    console.log(err)
                    return channelLog.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                }
                if(res) {
                    console.log(`successfully added error to database!`)
                }
            })
           }
           if(res){
               if(res.logs.role === true){
                   role.guild.fetchAuditLogs().then(audit =>{
                        // console.log(audit.entries.first())
                        if(audit.entries.first().executor.id == this.client.user.id) return;
                        let newObj = role.permissions.toArray();
                        
                        const embed = new SharuruEmbed()
                            .setColor(`Random`)
                            .setAuthor({name: `Role Deleted!`,iconURL: audit.entries.first().executor.displayAvatarURL()})
                            .setDescription(
                                `**❯ Role Name:** ${role.name}
                                **❯ Role ID:** ${role.id}
                                **❯ Role color:** ${role.hexColor}
                                **❯ Role Hoisted:** ${role.hoist ? `Yes` : `No`}
                                **❯ Role Position:** ${role.rawPosition}
                                **❯ Role Managed by a service:** ${role.managed ? `Yes`: `No`}
                                **❯ Role Mentionable:** ${role.mentionable ? `Yes` : `No`}
                                **❯ Role Permissions:** ${renameNicely(newObj).join("**,** ")}
                                **❯ Deleted by:** ${audit.entries.first().executor.username+"#"+audit.entries.first().executor.discriminator} (${audit.entries.first().executor.id})`,
                            )
                            if (channelLog) channelLog.send({embeds: [embed]});
                   }).catch(err=>console.log(err))
               }
           }
       })
    }
}