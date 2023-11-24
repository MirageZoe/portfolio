/* eslint-disable no-unused-vars */
const Command = require('../../Structures/Command.js');
const sendError = require('../../Models/Error');
const SharuruEmbed = require("../../Structures/SharuruEmbed")
const profileSys = require("../../Models/profiles");
const _ = require('lodash')
const math = require('mathjs')
const fs = require('fs');
const ms = require('ms');
const { all } = require('mathjs');
const { PermissionsBitField } = require('discord.js');


module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'rank',
			displaying: true,
			description: 'Check your level & rank on the server quickly.',
			options: '\n- \`top\` => Check top 50 members of the server!',
			usage: '',
			example: ' top => showing top 50 members of the server!',
			category: 'utilities',
			userPerms: [PermissionsBitField.Flags.SendMessages],
			SharuruPerms: [PermissionsBitField.Flags.SendMessages],
			args: false,
			guildOnly: true,
			ownerOnly: false,
			aliases: ['level']
		});
	}

	async run(message, args) {
		// eslint-disable-next-line id-length

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
        async function sendEmbeds(text,embed, channel) {
            const arr = text.match(/.{1,2048}/g); // Build the array
          
            for (let chunk of arr) { // Loop through every element
                embed.setDescription(chunk)
              await channel.send({ embed }); // Wait for the embed to be sent
            }
        }

        profileSys.find({},(err,res)=>{
            if(err){
                sendError.create({
                Guild_Name: message.guild.name,
                Guild_ID: message.guild.id,
                User: issuer.tag,
                UserID: issuer.id,
                Error: err,
                Time: `${TheDate} || ${clock} ${amORpm}`,
                Command: this.name,
                Args: args,
            },async (err, res) => {
                if(err) {
                    console.log(err)
                    return message.channel.send(`Unfortunately an problem appeared while working on rank command. Please try again later. If this problem persist, contact my partner!`)
                }
                if(res) {
                    console.log(`successfully added error to database!`)
                }
            })
            }
            if(res){
                let lvl = {
                    exp: 0,
                    level: 1,
                    money: 1000,
                    guildName: message.guild.name
                }
                let profileData = new Map()
                profileData.set(message.guild.id,lvl)
                if(!res.find(mem => mem.userID == issuer.id)){
                    profileSys.create({
                        username: issuer.tag,
                        userID: issuer.id,
                        guildID: message.guild.id,
                        guildName: message.guild.name,
                        backgroundsOwned: [`13`],
                        backgroundSelected: `https://cdn.discordapp.com/attachments/768885615759982634/799379961483231272/na_1.jpg`,
                        servers_data: profileData
                        // money: 1000,
                        // exp: 112,
                        // expLimit: 1000,
                      },(err,res)=>{
                        if(err) console.log(err)
                        if(res){
                          console.log(`Created ${issuer.tag}'s profile!`)
                        }
                      })
                      return message.reply(`I have created a profile for you! Try again if u still wanna see the rank.`)
                }
                let server_profiles = [];
                let global_profiles = [];

                // starting to be deprecated or more likely removed in v13.
                for(const user of res){
                    let highestLevel = 1;
                    if(user.servers_data == undefined) continue;
                    for(let i = 0; i < user.servers_data.length; i++){
                        if(user.servers_data[i].level > highestLevel) highestLevel = user.servers_data[i].level;
                    }
                    let obj2 = {
                        id: user.userID,
                        level: highestLevel
                    }
                    global_profiles.push(obj2)
                    if(message.guild.members.cache.get(user.userID)) {
                        let obj = {
                            id: user.userID,
                            level: user.servers_data.get(message.guild.id) ? user.servers_data.get(message.guild.id).level : 1
                        }
                        server_profiles.push(obj)
                    }
                }
                let sortedServerOnly = _.orderBy(server_profiles, 'level','desc');
                if(args[0] == 'g' || args[0] == 'top'){
                    let allUsers = ``
                    let pages = [];
                    let page = 1
                    for(let i = 0; i < sortedServerOnly.length; i++){
                        if(i <= 49){
                            if(i == 25){
                                pages.push(allUsers)
                                allUsers = ``
                            }
                            allUsers += `${i+1}) <@${sortedServerOnly[i].id}> **[Level: ${sortedServerOnly[i].level}]**\n`
                        }
                    }
                    if(allUsers.length > 0){
                        pages.push(allUsers);
                    }
                    // console.log(pages)
                    let embed = new SharuruEmbed()
                        .setAuthor(`Top 50 members of this server!`)
                        .setDescription(pages[page-1])
                        .setTimestamp()
                        .setFooter(`Page ${page}/${pages.length} | Requested by ${issuer.tag} at `)
                        .setColor("LUMINOUS_VIVID_PINK")
                        return message.channel.send({embeds: [embed]}).then(msg =>{
                            msg.react(`◀️`)
                            msg.react("▶️")
                            const CollectingReactions = (reaction, user) => user.id === message.author.id;
                            let myCollector = msg.createReactionCollector({CollectingReactions, time: 60000})

                            myCollector.on('collect', m=>{
                                switch (m._emoji.name) {
                                    case "◀️":
                                        msg.reactions.resolve("◀️").users.remove(issuer.id)
                                        if(page == 1) return console.log(`limit reached`)
                                        page--;
                                        embed.setDescription(pages[page-1])
                                        .setFooter(`Page ${page}/${pages.length} | Requested by ${issuer.tag} at `)
                                        msg.edit({embeds: [embed]})
                                        break;
                                    case "▶️":
                                        msg.reactions.resolve("▶️").users.remove(issuer.id)
                                        if(page == pages.length) return console.log(`limit reached`)
                                        page++;
                                        embed.setDescription(pages[page-1])
                                        msg.edit({embeds: [embed]})
                                        break;
                                }
                            })
                            myCollector.on('end', m=>{
                                // msg.reactions.resolve("◀️").users.remove(this.client.user.id)
                                // msg.reactions.resolve("▶️").users.remove(this.client.user.id)
                                msg.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error))
                            })
                        })//sendEmbeds(allUsers,embed,message.channel)
                     
                }
                let serverRank = sortedServerOnly.findIndex(mem => mem.id == issuer.id);
                let globalRank = _.orderBy(global_profiles,'level','desc').findIndex(user => user.id == issuer.id);
                let embed = new SharuruEmbed()
                    .setDescription(
                        `✦Your level is: **${server_profiles.find(mem => mem.id == issuer.id).level}**.
                        ✦You're ranked **#${serverRank+1}** in this server!
                        ✦You're ranked **#${globalRank+1}** globally!`
                    )
                    .setColor(`RANDOM`)
                    .setThumbnail(issuer.displayAvatarURL({dynamic: true}))
                    .setTimestamp()
                    .setAuthor(`Level & Rank!`)
                message.channel.send({embeds: [embed]}) 
            }
        })

        // return message.channel.send(embed)

	}

};
