const Event = require('../../Structures/Event');
const SharuruEmbed = require('../../Structures/SharuruEmbed');
const GuildSettings = require('../../Models/GuildSettings')
const sendError = require('../../Models/Error')

module.exports = class extends Event {

    async run(channel) {

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
        // console.log(`\n\nTHIS IS A POSSIBLE MISS-EVENT!!!\n\n`)
        // console.log(channel)
        // console.log(`\n\nTHIS IS A POSSIBLE MISS-EVENT!!!\n\n`)
        if (channel.type == 'DM') return console.log(`No dm events accepted for now! Possible triggered by roleMenu event (min/max roles multi mode)`)
       GuildSettings.findOne({
           ID: channel.guild.id
       },(err,res)=>{
           if(err){
            sendError.create({
                Guild_Name: channel.guild.name,
                Guild_ID: channel.guild.id,
                User: `channelCreate`,
                UserID: `channelCreateID`,
                Error: err,
                Time: `${TheDate} || ${clock} ${amORpm}`,
                Command: `ChannelCreate Event`,
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
                   channel.guild.fetchAuditLogs().then(audit =>{
                        // console.log(audit.entries.first())
                        if(audit.entries.first().executor.id == this.client.user.id) return;
                        const embed = new SharuruEmbed()
                            .setAuthor({name: `New Channel Created!`,iconURL: audit.entries.first().executor.displayAvatarURL()})
                            .setColor(`Random`)
                            .setDescription(
                                `**❯ Channel Name:** ${channel.name}
                                **❯ Channel ID:** ${channel.id}
                                **❯ Channel Type:** ${channel.type}
                                ${channel.parent ? `**❯ Channel Category:** ${channel.parent}` : ``}
                                **❯ Created by:** ${audit.entries.first().executor.username+"#"+audit.entries.first().executor.discriminator} (${audit.entries.first().executor.id})`,
                            )
                            const channelLog = channel.guild.channels.cache.find(ch => ch.name === 'sharuru-logs');
                            if (channelLog) channelLog.send({embeds: embed});
                   }).catch(err=>console.log(err))
               }
           }
       })
    }
}