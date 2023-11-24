const Event = require('../../Structures/Event');
const SharuruEmbed = require('../../Structures/SharuruEmbed');
const GuildSettings = require('../../Models/GuildSettings')
const { mainLog } = require("../../../config.json")

module.exports = class extends Event {

    async run(message) {
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

        const logsChannel = message.guild.channels.cache.find(ch => ch.name === 'sharuru-logs')
        GuildSettings.findOne({
            ID: message.guild.id
        },(err, res)=>{
            if (err) {
                sendError.create({
                    Guild_Name: message.guild.name,
                    Guild_ID: message.guild.id,
                    User: `messageDelete`,
                    UserID: `messageDelete`,
                    Error: err,
                    Time: `${TheDate} || ${clock} ${amORpm}`,
                    Command: this.name,
                    Args: `no args`,
                },async (err, ress) => {
                    if(err) {
                        console.log(err)
                        return logsChannel.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                    }
                    if(ress) {
                        console.log(`successfully added error to database!`)
                    }
                })
            }
            if (res){
                const channel = message.guild.channels.cache.find(ch => ch.name === 'sharuru-logs');
                // console.log(message)
                if(res.logs.message === true) {
                    if (!message.guild) return;
                    if (message.author?.id == this.client.user.id) return;
                    let i = 0;
                    const attachments = message.attachments.size ? message.attachments.map(attachment => {
                        let tempName = `- **[#${i}) ${attachment.name}](${attachment.proxyURL})**`
                        i++
                        return tempName;
                    }) : null;
                    const embed = new SharuruEmbed()
                        .setColor("LuminousVividPink")
                        .setAuthor({name: message.member ? message.member.displayName : `Unknown author`, iconURL: message.author ? message.author.displayAvatarURL({ dynamic: true }): null})
                        .setTitle(`Message Deleted!`)
                        .setDescription(`
**❯ Message ID:** ${message.id}
**❯ Channel:** ${message.channel}
**❯ Author:** ${message.author ? message.author.tag : `Unknown`} (${message.author ? message.author.id : `Unknown ID`})
${message.content ? `**❯ Content Deleted:** ${message.content}` : ""}
${attachments ? `**❯ Attachements (${attachments.length}):**\n${attachments.join('\n')}` : ""}
`)
                        .addFields({name: `ATTENTION:`,value: `If the message author is unknown, that means the message deleted was made while I was offline.`})

                    if (channel) channel.send({embeds: [embed]});
                }
            }
        })
    }
}