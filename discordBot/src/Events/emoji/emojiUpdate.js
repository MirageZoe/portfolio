const Event = require('../../Structures/Event');
const SharuruEmbed = require('../../Structures/SharuruEmbed');
const GuildSettings = require('../../Models/GuildSettings')
const sendError = require('../../Models/Error')

module.exports = class extends Event {

    async run(oldEmoji,newEmoji) {

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
        const channelLog = oldEmoji.guild.channels.cache.find(ch => ch.name === 'sharuru-logs');
        console.log(`Emoji updated`)
       GuildSettings.findOne({
           ID: oldEmoji.guild.id
       },(err,res)=>{
           if(err){
            sendError.create({
                Guild_Name: oldEmoji.guild.name,
                Guild_ID: oldEmoji.guild.id,
                User: `emojiCreate`,
                UserID: `emojiCreateID`,
                Error: err,
                Time: `${TheDate} || ${clock} ${amORpm}`,
                Command: `emojiCreate Event`,
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
            if(res.logs.emoji === true){
                   oldEmoji.guild.fetchAuditLogs().then(audit =>{
                        // console.log(audit.entries.first())
                        if(audit.entries.first().executor.id == this.client.user.id) return;
                        const embed = new SharuruEmbed()
                            .setColor(`Random`)
                            .setAuthor({name:`Emoji Updated!`,iconURL:audit.entries.first().executor.displayAvatarURL()})
                            .setDescription(
                                `**❯ Previous Name:** ${oldEmoji.name}
                                **❯ Actual Name:** ${newEmoji.name}
                                **❯ Emoji:** <:${newEmoji.name+":"+newEmoji.id}>
                                **❯ Modified by:** ${audit.entries.first().executor.username+"#"+audit.entries.first().executor.discriminator} (${audit.entries.first().executor.id})`,
                            )
                            if (channelLog) channelLog.send({embeds: [embed]});
                   }).catch(err=>console.log(err))
               }
           }
       })
    }
}