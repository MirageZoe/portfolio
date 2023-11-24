const SharuruEmbed = require('../../Structures/SharuruEmbed');
const GuildSettings = require('../../Models/GuildSettings');
const { escapeMarkdown, Colors } = require('discord.js');
const Event = require('../../Structures/Event');
const { diffWordsWithSpace } = require('diff');
const config = require("../../../config.json")
const sendError = require("../../Models/Error")


module.exports = class extends Event {
    
    async run(oldMessage, newMessage) {

        const userlogs = newMessage.guild.channels.cache.find(ch => ch.name ==='sharuru-logs')

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
            ID: newMessage.guildId
        },(err,res)=>{
            if (err) {
                sendError.create({
                    Guild_Name: " cannot get name in this event",
                    Guild_ID: newMessage.guildId,
                    User: newMessage.author?.username,
                    UserID: newMessage.author.id,
                    Error: err,
                    Time: `${TheDate} || ${clock} ${amORpm}`,
                    Command: this.name,
                    Args: `No args`,
                },async (errr, ress) => {
                    if(errr) {
                        console.log(errr)
                        return userlogs.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                    }
                    if(ress) {
                        console.log(`successfully added error to database!`)
                    }
                })
                console.log(err)
                return userlogs.send(`Unfortunately an error appeared while trying to read from db for the role menu with msg id ${newMessage.id}! If this persist please tell my partner about it! Error: ${err.message}`)
            }

            if (res){
                if(res.logs.message === true) {
                    // if (!newMessage.guildId || oldMessage.content === newMessage.content) return;
                    const channel = newMessage.guild.channels.cache.find(ch => ch.name === 'sharuru-logs');
                    let i =0, ii = 0;
                    const oldAttachments = oldMessage.attachments.size ? oldMessage.attachments.map(attachment => {
                        let tempName = `- **[#${i}) ${attachment.name}](${attachment.proxyURL})**`
                        i++
                        return tempName;
                    }).join("\n") : null;
                    const newAttachments = newMessage.attachments.size ? newMessage.attachments.map(attachment => {
                        let tempName = `- **[#${ii}) ${attachment.name}](${attachment.proxyURL})**`
                        ii++
                        return tempName;
                    }).join("\n") : null;

                    if(newMessage.author == null){
                        
                        let embed = new SharuruEmbed()
                            .setColor("LuminousVividPink")
                            .setAuthor({name: `Message Updated!`})
                            .setDescription(`
**❯ Message ID:** ${oldMessage.id}
**❯ Channel:** ${oldMessage.channel}
**❯ Author:** ${oldMessage.author ? oldMessage.author.tag : `Unknown`} (${oldMessage.author ? oldMessage.author.id : `Unknown`})`
                            )
                    if (channel) channel.send({embeds: [embed]});
                    return;                       
                    }
                    if(newMessage.author.bot) return;
                    console.log(`[Log Messages - ${TheDate} | ${clock} ${amORpm}]: Looking if the oldMessage isn't partial:\nold.content: ${oldMessage.content}\nnew.content: ${newMessage.content}`)
                    if (oldMessage.partial) {
                        console.log(`[Log Messages - ${TheDate} | ${clock} ${amORpm}]: The old Message is a partial! I will try to request the additional missing data!`)
                        oldMessage.fetch().then(fullMessage =>{
                            // process the full message
                            const embed = new SharuruEmbed()
                            .setColor("LuminousVividPink")
                            .setAuthor({name: fullMessage.member ? fullMessage.member.displayName : `Unknown author`, iconURL: fullMessage.author ? fullMessage.author.displayAvatarURL({ dynamic: true }): null})
                            .setTitle(`Message Updated!`)
                            .setDescription(`
**❯ Message ID:** ${fullMessage.id}
**❯ Channel:** ${fullMessage.channel}
**❯ Author:** ${fullMessage.author ? fullMessage.author.tag : "Unknown author"} (${fullMessage.author ? fullMessage.author.id : "Unknown author"})`)
                            .setURL(fullMessage.url)
                            if (fullMessage.content != "")
                                embed.addFields(
                                    {name: `Message Updated:`, value:diffWordsWithSpace(escapeMarkdown(fullMessage.content), escapeMarkdown(newMessage.content))
                                    .map(result => result.added ? `**${result.value.trim()}**` : result.removed ? `~~${result.value.trim()}~~` : result.value.trim())
                                    .join(" ")},
                                    {name: config.extra.emptyField,value:config.extra.emptyField},
                                    {name: "ATTENTION:", value: `This message was sent before I was online and that means I couldn't find the old message! What I retrieved is the modified message!`}
                                )
                            if (channel) channel.send({embeds: [embed]});
                        })
                        .catch(errPartial =>{
                            console.log(`[Log Messages - ${TheDate} | ${clock} ${amORpm}]: I've tried to request the additional Data of the partial but I got an error: ${errPartial.message}`,errPartial)
                        })
                    } else {
                        console.log(`[Log Messages - ${TheDate} | ${clock} ${amORpm}]: This isn't a partial! This message is full!`)
                        const embed = new SharuruEmbed()
                        .setColor("LuminousVividPink")
                        .setAuthor({name: oldMessage.member ? oldMessage.member.displayName : `Unknown author`, iconURL: oldMessage.author ? oldMessage.author.displayAvatarURL({ dynamic: true }): null})
                        .setTitle(`Message Updated!`)
                        .setDescription(`
**❯ Message ID:** ${oldMessage.id}
**❯ Channel:** ${oldMessage.channel}
**❯ Author:** ${oldMessage.author ? oldMessage.author.tag : "Unknown author"} (${oldMessage.author ? oldMessage.author.id : "Unknown author"})`)
                        .setURL(oldMessage.url)
                        if (oldAttachments?.length != newAttachments?.length) 
                            embed.addFields(
                                {name: `Old Attachments (${oldMessage.attachments.size}):`,value: oldAttachments},
                                {name: `New Attachments (${newMessage.attachments.size}):`,value: newAttachments}
                            )
                        if (oldMessage.content != newMessage.content)
                        embed.addFields(//oldMessage.content == newMessage.content ? "*No change in message. Possible change in Attachments!*":
                            {name: `Message:`, value: `${config.extra.emptyField}${diffWordsWithSpace(escapeMarkdown(oldMessage.content), escapeMarkdown(newMessage.content))
                                .map(result => result.added ? `**${result.value.trim()}**` : result.removed ? `~~${result.value.trim()}~~` : result.value.trim())
                                .join(" ")}`},
                            {name: "Legend:", value: `- old message is ~~striked~~\n- new message is **bold**`}
                        )
                        if (channel) channel.send({embeds: [embed]});
                    }
                }
            }
        })
    }
}