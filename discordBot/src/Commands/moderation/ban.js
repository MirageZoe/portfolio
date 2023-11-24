/* eslint-disable no-unused-vars */
const Command = require('../../Structures/Command.js');
const sendError = require('../../Models/Error');
const { Permissions } = require("discord.js")
const banSys = require("../../Models/banDocs");
const fs = require('fs');
const ms = require('ms');
const pms = require('pretty-ms');
const { PermissionsBitField } = require('discord.js')

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'ban',
			displaying: true,
			description: 'Call Thor\'s hammer on the super mean members!',
			options: '\n- \`soft\` => Ban & unban the member immediately.\n- \`temp [time:1min,1h,1d]\` => As the name suggest, a temporary ban. If the time isn\'t specified, it will be banned for 1h.',
			usage: '<@member> [reason]',
			example: '@Bob for being super mean',
			category: 'moderation',
			userPerms: [PermissionsBitField.Flags.KickMembers,PermissionsBitField.Flags.BanMembers],
			SharuruPerms: [PermissionsBitField.Flags.KickMembers,PermissionsBitField.Flags.BanMembers],
			args: true,
			guildOnly: true,
			ownerOnly: false,
		});
	}

	async run(message, args) {
		// eslint-disable-next-line id-length

		message.delete()
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

        const prefix = this.client.prefixes.get(message.guild.id)
        
		if(!args[0] || args[0] == "help"){
            return message.channel.send(`Usage: ${prefix}ban <user> [reason] => standard way to ban
            ${prefix}ban <user> soft => ban the user and immediately unban him
            ${prefix}ban <user> temp [time:10min, 1h, 2hours, 1d,20days] [reason] => ban the user for X amount of time and unban after time ended.`);
        }

		const issuer = message.author;
        const modlog = message.guild.channels.cache.find(channel => channel.name === 'sharuru-logs');
		const toBan = message.guild.members.cache.get(message.mentions.users.first()?.id || args[0]);
        let banTime = args[2]

        if (!toBan) return message.channel.send(`${issuer}, please mention a member or provide it's ID!`);
        
        if (toBan.id === issuer.id) return;

        if (toBan.permissions.has(Permissions.FLAGS.ADMINISTRATOR) || toBan.roles.highest.position >= (message.guild.me.roles.highest.position || message.member.roles.highest.position)) 
            return message.channel.send(`${issuer}, I can't do that because:\n1) May have Administrator permissions;\n2) May have same role (${toBan.roles.highest}) like you/me or higher.`)

        if(typeof(args[0] == 'object') && !['soft','temp'].includes(args[1])){
            console.log(`ban?`)
    		let reason =`Banned by ${issuer.tag} (${issuer.id}): ` + args.slice(1).join(" ");
    		if (!args[1]) reason = `Banned by ${issuer.tag} (${issuer.id}). No reason given at that time.`;

            if(toBan.bannable){
                try {
                    toBan.ban({days: 7, reason: reason}).then(r => {
                        message.channel.send(`I have successfully banned ${toBan}!`)
                        modlog.send(`I have banned ${toBan} at ${issuer.tag}'s request!\nReason: ${reason}`)
                    })
                } catch (error) {
                    if (error) {
                        sendError.create({
                            Guild_Name: message.guild.name,
                            Guild_ID: message.guild.id,
                            User: issuer.username,
                            UserID: issuer.id,
                            Error: error,
                            Time: `${TheDate} at ${clock} ${amORpm}`,
                            Command: this.name + " normal ban",
                            Args: args,
                        },async(erro,resu)=>{
                            if(erro) {
                                console.log(erro)
                            }
                            if(resu) {
                                console.log(`Error sent to database!`)
                                return message.channel.send(`Aw, a problem appeared. Please try again later and if this persist, please report it to my partner! ERROR_#S4`)
                            }
                        })
                    }
                    modlog.send(`I couldn't ban ${toBan} because of an error: \`${error.message}\`.\nIf this persist, please contant my partner!`)
                    return console.log(error)
                }
            } else {
                return message.channel.send(`${issuer}, sorry but I can't ban this person currently. Please check if they have administrator and higher role than me`)
            }
        }
        if(args[1] == 'soft'){
            console.log(`soft?`)
    		let reason =`Banned by ${issuer.tag} (${issuer.id}): ` + args.slice(2).join(" ");
    		if (!args[2]) reason = `Banned by ${issuer.tag} (${issuer.id}). No reason given at that time.`;

            if(toBan.bannable){
                try {
                    toBan.ban({days: 7, reason: reason}).then(r => {
                        message.guild.members.unban(toBan.id,`Soft ban issued by ${issuer.tag} (${issuer.id})`).then(m =>{
                            console.log(`Unbanned`);
                            message.channel.send(`I have successfully banned ${toBan}!`)
                            modlog.send(`I have soft-banned ${toBan} at ${issuer.tag}'s request!\nReason: ${reason}`)
                        })
                    })
                } catch (error) {
                    if (error) {
                        sendError.create({
                            Guild_Name: message.guild.name,
                            Guild_ID: message.guild.id,
                            User: issuer.username,
                            UserID: issuer.id,
                            Error: error,
                            Time: `${TheDate} at ${clock} ${amORpm}`,
                            Command: this.name + " soft ban option",
                            Args: args,
                        },async(erro,resu)=>{
                            if(erro) {
                                console.log(erro)
                            }
                            if(resu) {
                                console.log(`Error sent to database!`)
                                return message.channel.send(`Aw, a problem appeared. Please try again later and if this persist, please report it to my partner! ERROR_#S4`)
                            }
                        })
                    }
                    modlog.send(`I couldn't ban ${toBan} because of an error: \`${error.message}\`.\nIf this persist, please contant my partner!`)
                    return console.log(error)
                }
            } else {
                return message.channel.send(`${issuer}, sorry but I can't ban this person currently. Please check if they have administrator and higher role than me`)
            }
        }
		if(args[1] == 'temp'){
            if(toBan.bannable){
                if(!banTime) banTime = 3600 * 1000;
                try {
                    let invalidBanTime = false
                    banTime = isNaN(banTime) ? ms(banTime) : banTime
                    console.log(banTime)
                    if (invalidBanTime == true) return message.channel.send(`Please check that the ban time is either composed of a number and one of the letters that represent time like: \`[s,sec,m,min,h,hours,d,days]\` or just numbers!`)
                    let reason =`Banned by ${issuer.tag} (${issuer.id}) for ${pms(banTime)}: ` + args.slice(3).join(" ");
                    if (!args[3]) reason = `Banned by ${issuer.tag} (${issuer.id}) for ${pms(banTime)}. No reason given at that time.`;
                    if (banTime < 600000) return message.channel.send(`${issuer}, you cannot ban people for less than 10 min temporary.`)
                    if (banTime > 15778800000) return message.channel.send(`${issuer}, you cannot ban people for more than 6 months temporary.`)
                    toBan.ban({days: 7, reason: reason}).then(r => {
                        message.channel.send(`I have successfully banned ${toBan}!`)
                        modlog.send(`I have banned ${toBan} for ${pms(banTime)}, at ${issuer.tag}'s request!\nReason: ${reason}`)
                        banSys.create({
                            guild_Name: message.guild.name,
                            guild_ID: message.guild.id,
                            user: toBan.tag,
                            userID: toBan.id,
                            bannedBy: issuer.tag,
                            bannedByID: issuer.id,
                            reason: reason,
                            time: banTime
                        },(err,res)=>{
                            if (err) {
                                sendError.create({
                                    Guild_Name: message.guild.name,
                                    Guild_ID: message.guild.id,
                                    User: issuer.username,
                                    UserID: issuer.id,
                                    Error: err,
                                    Time: `${TheDate} at ${clock} ${amORpm}`,
                                    Command: this.name + " temp ban option - save doc",
                                    Args: args,
                                },async(erro,resu)=>{
                                    if(erro) {
                                        console.log(erro)
                                    }
                                    if(resu) {
                                        console.log(`Error sent to database!`)
                                        return message.channel.send(`Aw, a problem appeared. Please try again later and if this persist, please report it to my partner! ERROR_#S4`)
                                    }
                                })
                            }
                            if(res){
                                console.log(`[BanSystem : ${TheDate} | ${clock} ${amORpm}] Doc created sucessfully in guild "${message.guild.name} (${message.guild.id})" for ${toBan.user.username} (${toBan.id})`)
                            }
                        })
                    })
                } catch (error) {
                    if (error) {
                        sendError.create({
                            Guild_Name: message.guild.name,
                            Guild_ID: message.guild.id,
                            User: issuer.username,
                            UserID: issuer.id,
                            Error: error,
                            Time: `${TheDate} at ${clock} ${amORpm}`,
                            Command: this.name + " temp ban option",
                            Args: args,
                        },async(erro,resu)=>{
                            if(erro) {
                                console.log(erro)
                            }
                            if(resu) {
                                console.log(`Error sent to database!`)
                                return message.channel.send(`Aw, a problem appeared. Please try again later and if this persist, please report it to my partner! ERROR_#S4`)
                            }
                        })
                    }
                    return console.log(error)
                }
            } else {
                return message.channel.send(`${issuer}, sorry but I can't ban this person currently. Please check if they have administrator and higher role than me`)
            }
        }
        
	}
};
