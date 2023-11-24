const Event = require('../../Structures/Event');
const SharuruEmbed = require('../../Structures/SharuruEmbed');
const GuildSettings = require('../../Models/GuildSettings');
const sendError = require('../../Models/Error')

module.exports = class extends Event {

    async run(guild, user) {

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
        const channelLog = guild.channels.cache.find(ch => ch.name === 'sharuru-logs');
        // console.log(`new ban`)
       GuildSettings.findOne({
           ID: guild.id
       },(err,res)=>{
           if(err){
            sendError.create({
                Guild_Name: guild.name,
                Guild_ID: guild.id,
                User: `guildBanRemove`,
                UserID: `guildBanRemoveID`,
                Error: err,
                Time: `${TheDate} || ${clock} ${amORpm}`,
                Command: `guildBanRemove Event`,
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
               if(res.logs.guild === true){
                   guild.fetchAuditLogs().then(audit =>{
                        // console.log(audit.entries.first())
                        let embed = new SharuruEmbed()
                            .setColor(`Random`)
                            .setThumbnail(user.displayAvatarURL({ dynamic: true}))
                            .setAuthor({name:`Thor lifted his hammer!`,iconURL: audit.entries.first().executor.displayAvatarURL()})
                            .setDescription(
                                `**❯ Member:** ${user.tag} (${user.id})
                                **❯ Unbanned by:** ${audit.entries.first().executor.username+"#"+audit.entries.first().executor.discriminator} (${audit.entries.first().executor.id})
                                **❯ Reason:** ${audit.entries.first().reason ?? `No reason provided or it was unbanned manually (not using one of my commands)!`}`
                            )
                            if (channelLog) channelLog.send({embeds: [embed]});
                   }).catch(err=>console.log(err))
               }
           }
       })
    }
}