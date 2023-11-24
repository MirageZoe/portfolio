const Event = require('../../Structures/Event');
const SharuruEmbed = require('../../Structures/SharuruEmbed');
const GuildSettings = require('../../Models/GuildSettings')
const sendError = require('../../Models/Error')

module.exports = class extends Event {

    async run(emoji) {

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
        const channelLog = emoji.guild.channels.cache.find(ch => ch.name === 'sharuru-logs');
        console.log(`emoji deleted`)
       GuildSettings.findOne({
           ID: emoji.guild.id
       },(err,res)=>{
           if(err){
            sendError.create({
                Guild_Name: emoji.guild.name,
                Guild_ID: emoji.guild.id,
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
            if(res.logs.emoji === true){
                   emoji.guild.fetchAuditLogs().then(audit =>{
                        // console.log(audit.entries.first())
                        if(audit.entries.first().executor.id == this.client.user.id) return;

                        const embed = new SharuruEmbed()
                            .setColor(`Random`)
                            .setAuthor({name:`Emoji Deleted!`,iconURL:audit.entries.first().executor.displayAvatarURL()})
                            .setDescription(
                                `**❯ Emoji Name:** ${emoji.name}
                                **❯ Emoji ID:** ${emoji.id}
                                **❯ Was animated?:** ${emoji.animated ? `Yes`: `No`}
                                **❯ Deleted by:** ${audit.entries.first().executor.username+"#"+audit.entries.first().executor.discriminator} (${audit.entries.first().executor.id})`,
                            )
                            if (channelLog) channelLog.send({embeds: [embed]});
                   }).catch(err=>console.log(err))
               }
           }
       })
    }
}