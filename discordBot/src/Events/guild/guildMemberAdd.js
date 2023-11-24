const Event = require('../../Structures/Event');
const SharuruEmbed = require('../../Structures/SharuruEmbed');
const guildSettings = require('../../Models/GuildSettings');
const muteLogs = require("../../Models/mutes")
const sendError = require("../../Models/Error")
const { createCanvas, loadImage } = require("canvas");
const { AttachmentBuilder, Colors } = require("discord.js");
const applyText = (canvas, text) => {
	const ctx = canvas.getContext('2d');

	// Declare a base size of the font
	let fontSize = 21;

	do {
		// Assign the font to the context and decrement it so it can be measured again
		ctx.font = `${fontSize -= 3}px Changa`;
		// Compare pixel width of the text to the canvas minus the approximate avatar size
	} while (ctx.measureText(text).width > canvas.width - 100);

	// Return the result to use in the actual canvas
	return ctx.font;
};
var noSpecial = /[^\u0000-\u00ff]/; // Small performance gain from pre-compiling the regex
function containsDoubleByte(str) {
    if (!str.length) return false;
    if (str.charCodeAt(0) > 255) return true;
    return noSpecial.test(str);
}
module.exports = class extends Event {

    async run(member) {
        
    //creating the attachement and sending in the channel
    var clock = new Date();
    var ss = String(clock.getSeconds()).padStart(2, '0');
    var min = String(clock.getMinutes()).padStart(2, '0');
    var hrs = String(clock.getHours()).padStart(1, '0');
    clock = hrs + ':' + min +':' + ss;

    var TheDate = new Date()
    var zilelesaptamanii = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var weekday = zilelesaptamanii[TheDate.getDay()];
    var dd = String(TheDate.getDate()).padStart(2, '0');
    var mon = String(TheDate.getMonth()+ 1);
    var year = String(TheDate.getFullYear()).padStart(4,'00');
    TheDate = weekday+", " + mon + '/' + dd +'/' + year;
    //verify if it's pm or AM
    let amORpm;
    if(hrs >= 0 && hrs <= 12){
        amORpm = "AM"
    }else{
        amORpm = "PM"
    };

    const userlogs = member.guild.channels.cache.find(ch => ch.name == 'sharuru-logs')
    let mutedRole = member.guild.roles.cache.find(role => role.name == `muted` || role.name == `Muted` )
    let willBeMuted = false
    //if they were muted
    muteLogs.findOne({
        UserID: member.user.id
    },(err,res)=>{
        if(err){
            sendError.create({
                Guild_Name: member.guild.name,
                Guild_ID: member.guild.id,
                User: `guildMemberAdd`,
                UserID: `guildMemberAddID`,
                Error: err,
                Time: `${TheDate} || ${clock} ${amORpm}`,
                Command: `guildMemberAdd event`,
                Args: `event`,
            },async (err2, res2) => {
                if(err2) {
                    console.log(err2)
                    return message.channel.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                }
                if(res2) {
                    console.log(`successfully added error to database!`)
                }
            })
        }
        if(res){
            willBeMuted = true
            console.log(`This member was muted before and left the server to get rid of mute but nah fam.`)
            if(!member.roles.cache.find(role => role.id == mutedRole.id)) member.roles.add(mutedRole)
        }
    })


    //autorole module
    guildSettings.findOne({
        ID: member.guild.id
    },async (err,results)=>{
        if(err){
            sendError.create({
                Guild_Name: member.guild.name,
                Guild_ID: member.guild.id,
                User: `guildMemberAdd`,
                UserID: `guildMemberAddID`,
                Error: err,
                Time: `${TheDate} || ${clock} ${amORpm}`,
                Command: `guildMemberAdd event`,
                Args: `event`,
            },async (err2, res2) => {
                if(err2) {
                    console.log(err2)
                    return message.channel.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                }
                if(res2) {
                    console.log(`successfully added error to database!`)
                }
            })
        }
        // autorole module
        if(results.systems.autorole.enabled == true){
                try {
                    const checkAutoroleIfStillExists = member.guild.roles.cache.get(results.systems.autorole.role)
                    const sharuruRoleInfo = member.guild.members.me.roles.highest
                    if (checkAutoroleIfStillExists.position > sharuruRoleInfo.position) 
                    {
                        const errorLog = new SharuruEmbed()
                        .setAuthor({name: `Newcomer Role Assign`})
                        .setColor(Colors.LuminousVividPink)
                        .addFields(
                            {name: `A problem appeared because:`,value:`The selected role to assign, ${checkAutoroleIfStillExists}, is in a higher position than my highest role ${sharuruRoleInfo}! Please fix this!`}
                        )
                        .setFooter({text: `Warning generated when member @${member.user.username} joined.`})
                        userlogs.send({embeds: [errorLog]})
                    }
                    else
                        member.roles.add(checkAutoroleIfStillExists)
                    // console.log(`Autorole executing...done!`)
                } catch (err) {
                    console.log(err)
                    sendError.create({
                        Guild_Name: member.guild.name,
                        Guild_ID: member.guild.id,
                        User: `guildMemberAdd`,
                        UserID: `guildMemberAddID`,
                        Error: err,
                        Time: `${TheDate} || ${clock} ${amORpm}`,
                        Command: `guildMemberAdd event`,
                        Args: `event`,
                    },async (err2, res2) => {
                        if(err2) {
                            console.log(err2)
                            return message.channel.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                        }
                        if(res2) {
                            console.log(`successfully added error to database!`)
                        }
                    })
                }
        }
        // serverlogs module
        if(results.logs.guild === true){
            let embed = new SharuruEmbed()
                .setAuthor({name:`New Member joined!`})
                .setThumbnail(member.user.displayAvatarURL())
                .setColor(`Random`)
                .setTimestamp()
                .setDescription(`Their name is: **${member.user.username}**!${willBeMuted ? `\n\n**[AUTO-MUTE]**${member} joined back after leaving to get rid mute role but I made sure they doesn't get unpunished.` : ``}`)

            if(userlogs) userlogs.send({embeds: [embed]})
        }
        // invites module
        if(results.systems.inviteTracker.enabled === true){
            try {
                const GuildInvites = this.client.GuildInvites;
                const cachedInvites = GuildInvites.get(member.guild.id);
                console.log(`Invites:`)
                console.log(cachedInvites)
                const newInvites = await member.guild.invites.fetch().catch(err => console.log(err));
                const getInvitesValues = [...newInvites.values()]
                GuildInvites.set(member.guild.id, getInvitesValues);
                const findDiff = cachedInvites.filter(({ uses: id1 }) => !getInvitesValues.some(({ uses: id2 }) => id2 === id1));
                const usedInvite = getInvitesValues.find(inv => findDiff[0].uses < inv.uses);
                console.log(usedInvite.code + " was used!")
        
                const canvas = createCanvas(320, 100);
                const ctx = canvas.getContext("2d");
        
                const background = await loadImage(`./src/Assets/invites/TEMPLATE_INVITE_TRACKER.png`);
                ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        
                ctx.strokeStyle = '#74037b';
                ctx.strokeRect(0, 0, canvas.width, canvas.height);
                
                //adding text
                let userName = member.user.tag

                if(containsDoubleByte(userName)) userName = `Random Member`
                //name of new member
                ctx.font = applyText(canvas, `${userName}`)
                ctx.fillStyle = `#ffffff`;
                ctx.fillText(`${userName}`, 21,  35)
        
                //name of inviter
                ctx.font = applyText(canvas, `${usedInvite.inviter.tag}`)
                ctx.fillStyle = `#ffffff`;
                ctx.fillText(`${usedInvite.inviter.tag}`, 21,  75)
        
                //invite code
                ctx.font = `16px Changa`;
                ctx.fillStyle = `#ffffff`;
                ctx.fillText(usedInvite.code, 50,  95)
        
                //uses
                ctx.font = `16px Changa`;
                ctx.fillStyle = `#ffffff`;
                ctx.fillText(`(#${usedInvite.uses})`, 260,  95)
        
        
                //saving first the state of canvas or so I understood.
                ctx.save();
        
                //avatar circle 
                // ctx.arc(x,y,radius,starAngle,endAngle,anticlockwise)
                ctx.beginPath();
                ctx.arc(151,69,20, 0, Math.PI * 2, true);
                ctx.closePath();
                ctx.clip();
        
                //avatar of the invite member
                const avatar2 = await loadImage(usedInvite.inviter.displayAvatarURL({ extension: "png"}))
                ctx.drawImage(avatar2, 131, 49, 40, 40)
        
                //we are restoring the state of canvas to show other avatar as well
                ctx.restore();
        
                //============================
                //avatar circle for new member
                //============================
                ctx.beginPath();
                ctx.arc(281,40,25, 0, Math.PI * 2, true);
                // ctx.arc(x,y,radius,starAngle,endAngle,anticlockwise)
                ctx.closePath();
                ctx.clip();
        
                const avatar = await loadImage(member.user.displayAvatarURL({ extension: 'png' }));
                ctx.drawImage(avatar, 256, 15, 50, 50);
        
                const attachement = new AttachmentBuilder(canvas.toBuffer(), {name: 'welcome.png'})
                let sendToThisChannel = this.client.guilds.cache.get(member.guild.id).channels.cache.find(ch => ch.id == results.systems.inviteTracker.channel)
                if(sendToThisChannel) sendToThisChannel.send({ files: [attachement] });
                if(!sendToThisChannel) userlogs.send(`It seems like someone set up a channel that doesn't exist. This can happen only if someone set up the channel earlier then deleted the respective channel. Please select an existent channel.`)
        
            } catch (error) {
                console.log(error)
                console.log(`\n\n Error in guildmemberadd`)
                return userlogs.send(`Unfortunately something went wrong with The invite tracker system. This can be happening because there was created an invite to a channel that I cannot see. Please check if I can see all channels!\n**ERROR**: ${error.message}`)
            }
        }
    })

    }// end of command
}