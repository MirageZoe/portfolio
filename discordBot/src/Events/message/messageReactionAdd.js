const reactmsgDocs = require('../../Models/mattjestic_models/react_to_msg')
const SharuruEmbed = require('../../Structures/SharuruEmbed');
const temporaryRoles = require('../../Models/temporaryRoles');
const guildSettings = require("../../Models/GuildSettings");
const roleMenuDocs = require("../../Models/roleMenuDocs");
const profileSys = require("../../Models/profiles");
const giveaway = require('../../Models/giveaways');
const sendError = require('../../Models/Error');
const Event = require('../../Structures/Event');

module.exports = class extends Event {

    async run (reaction, theUser) {
        
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
        const logChannel = reaction.message.guild.channels.cache.find(ch => ch.name === 'sharuru-logs')
        const thisMsgID = reaction.message.id;
        const thisChannelID = reaction.message.channel.id;
        const thisGuildID = reaction.message.guild.id
        if (theUser.bot) return;
        if (!reaction.message.guild) return;
        if (reaction.message.partial) await reaction.message.fetch();
        if (reaction.partial) await reaction.fetch();

        function extension(reaction, attachment) {
            const imageLink = attachment.split('.');
            const typeOfImage = imageLink[imageLink.length - 1];
            const image = /(jpg|jpeg|png|gif)/gi.test(typeOfImage);
            if (!image) return '';
            return attachment;
          }

        // add users to giveaway
        await giveaway.findOne({
                "location.messageId": reaction.message.id
            },async(err,res)=>{
                if (err) {
                    sendError.create({
                        Guild_Name: `Can't retrieve guildName because it's in error form the "reaction add" event.`,
                        Guild_ID:  `Can't retrieve guildID because it's in error form the "reaction add" event.`,
                        User: `Can't retrieve user because it's in error form the "reaction add" event.`,
                        UserID: `Can't retrieve userid because it's in error form the "reaction add" event.`,
                        Error: err,
                        Time: `${TheDate} || ${clock} ${amORpm}`,
                        Command: `messageReactionAdd`,
                        Args: `Can't retrieve args because it's in error form "reaction add" the event.`,
                    },async (err, res) => {
                        if(err) {
                            console.log(err)
                        }
                        if(res) {
                            console.log(`successfully added error to database from messageReactionAdd event!`)    
                        }
                    })
                }
                if (res) {
                    // finish to add to search in db after id and if it match, add it to db.
                    // console.log(`This message is from a giveaway reacted from partials. I'll add the user immediately!`)
                    let thisMember = this.client.guilds.cache.get(reaction.message.guildId).members.cache.get(theUser.id)
                    let usrObj = {
                        name: theUser.username,
                        userId: theUser.id,
                        time: Date.now(),
                        roles: thisMember._roles,

                    }
                    console.log(usrObj)
                    if (!res.people_reacted.some(people => people['userId'] === usrObj['userId'])) res.people_reacted.push(usrObj);
                    res.save().catch(err=>console.log(err))
                }
        })

        
        
        // roleMenuSystem
        // console.log(reaction.message.reactions.cache)
        let roleMenuData = this.client.roleMenuData.get(thisGuildID)
        let roleMenuChecker = true
        if (!roleMenuData) roleMenuChecker = false;
        if (roleMenuChecker == true) {
            if (roleMenuData.hasOwnProperty(thisChannelID)) {
                console.log(`this was triggered because of a reaction added in channel "${reaction.message.channel.name}" with a menu ${roleMenuData[reaction.message.channel.id]}!`)
                if (roleMenuData[thisChannelID].find(msgid => msgid == thisMsgID)){
                    console.log(`reacted to a role menu message!`)
                    roleMenuDocs.findOne({
                        group_messageID: thisMsgID,
                        group_guildID: thisGuildID
                    },async(err,res)=>{
                        if (err) {
                            console.log(err)
                            return logChannel.send(`Unfortunately an error appeared while trying to read from db for the role menu with msg id ${reaction.message.id}! If this persist please tell my partner about it! Error: ${err.message}`)
                        }
                        if (res) {
                            //fetching user data
                            // console.log(`fetching user data...`)
                            let myData = this.client.impData.get(thisGuildID)
                            let thisGuildObject = this.client.guilds.cache.get(thisGuildID)
                            let searchMember = thisGuildObject.members.cache.get(theUser.id)
                            let sharuruMember = thisGuildObject.members.me
                            let myHighestRole = thisGuildObject.roles.cache.get(myData.highestRole)
    
                            //checking if the roles are still the same, if not, fetching new data
                            if (myData.totalRolesNumber != sharuruMember._roles.length || myData.highestRoleOrder != myHighestRole.position){
                                let totalRolesNumber = sharuruMember._roles.length
                                let highestRoleOrder = 0
                                let highestRole = 0;
                                for(let i = 0; i < sharuruMember._roles.length; i++){
                                    let getRolePos = thisGuildObject.roles.cache.get(sharuruMember._roles[i]).position
                                    if (getRolePos > highestRoleOrder) {
                                        highestRoleOrder = getRolePos;
                                        highestRole = sharuruMember._roles[i]
                                    }
                                }
                                myData.totalRolesNumber = sharuruMember._roles.length;
                                myData.highestRoleOrder = highestRoleOrder;
                                myData.highestRole = highestRole;
                                this.client.impData.set(thisGuildID,myData)
                                console.log(`found the highest role: ${highestRole}, Pos: ${highestRoleOrder}, # of roles: ${totalRolesNumber}`)
                            }
    
                            let searchEmoji = reaction._emoji.name;
                            if (reaction._emoji.id != null) searchEmoji = reaction._emoji.id  
                            //fetching emoji & role data from role menu
                            let emojiToRole = res.group_roles.find(role => role.emoji == searchEmoji)    
                            if (!emojiToRole) return;
    
                            //checking if they have the ignored role, if yes, ignore them
                            if (res.group_ignored_role !== null) 
                                if (searchMember._roles.find(role => role == res.group_ignored_role)) return console.log(`${theUser.username}#${theUser.id} has ${res.group_ignored_role} role that is ignored!`)
    
                            //checking if they have required role, if not, ignore them
                            if (res.group_required_role !== null)
                                if (!searchMember._roles.find(role => role == res.group_required_role)) return console.log(`${theUser.username}#${theUser.id} doesn't have ${res.group_required_role} role that is required!`)
                            //standard mode: can pick any role
    
                            // checking if the role ignore another one
                            if (emojiToRole.ignores_this != null) {
                                console.log(`searching for ignored role`)
                                if (searchMember._roles.find(role => role == emojiToRole.ignores_this)){
                                    if (emojiToRole.notify == true) {
                                        return theUser.send(`**[Role Bundle:** *${res.group_name}* **]**This role, **${thisGuildObject.roles.cache.get(emojiToRole.role).name}**, isn't available for you at the moment in the **"${reaction.guild.name}"** server!`)
                                    }
                                    return console.log(`${theUser.username}#${theUser.id} has ${emojiToRole.ignores_this} role that is specific to ${emojiToRole.role} to ignore, so no role for them!`)
                                }
                            }
    
                            // checking if the role requires another one
                            if (emojiToRole.requires_this != null) {
                                console.log(`searching for required role`)
                                if (!searchMember._roles.find(role => role == emojiToRole.requires_this)) {
                                    if (emojiToRole.notify == true) {
                                        return theUser.send(`**[Role Bundle:** *${res.group_name}* **]**This role, **${thisGuildObject.roles.cache.get(emojiToRole.role).name}**, requires **${thisGuildObject.roles.cache.get(emojiToRole.requires_this).name}** role to get it in the **"${thisGuildObject.name}"** server!`)
                                    }
                                    return console.log(`${theUser.username}#${theUser.id} requires ${emojiToRole.requires_this} role that is specific to ${emojiToRole.role}, so no role for them!`)
                                }
                            }
                            // checking if they chose a role from temporary group
                            if (res.group_temporary != 0) {
                                temporaryRoles.create({
                                    name: theUser.username,
                                    user_id: theUser.id,
                                    role_id: emojiToRole.role,
                                    time_for_role: Number(res.group_temporary) + Date.now(),
                                    guild_id: thisGuildObject.id,
                                    guild_name: thisGuildObject.name
                                })
                            }
    
                            if (res.group_mode == 'standard') {
                                //assign the role if user doesn't have it already
                                try {
                                    if (!searchMember._roles.find(role => role == emojiToRole.role)) {
                                        if (thisGuildObject.roles.cache.get(emojiToRole.role).position > thisGuildObject.roles.cache.get(myData.highestRole).position) return logChannel.send(`[Role Menu System Warning]: It seems like a role (<@&${emojiToRole.role}>) that is in a higher position than my highest role was added. I can't do anything with this role since it's above my highest role!\n\nPlease fix this by setting up my role above every role you desire to assign/remove this role to people in the menu!`)
                                        searchMember.roles.add(emojiToRole.role)
                                        console.log(`added role to ${theUser.username} role id ${emojiToRole.role}`)
                                    } else console.log(`${theUser.username}#${theUser.id} has already role`)
                                } catch (error) {
                                    console.log(error)
                                    return logChannel.send(`Unfortunately an error happened out of nowhere when working on role bundle: ${res.group_name} for someone and nothing work out (probably). Wait a bit and try again later. If this persist, contant my partner!\nError: ${error.message}`)
                                }
                            }
    
                            //unique mode: can pick only 1 role out of everything else. 
                            //Picking anything else after having one role would result in removing what you had and adding the one you chose lately
                            if (res.group_mode == 'unique') {
                                //assign the role if user doesn't have a role from this group already. if they have, remove them and add the one they wanted
                                try {
                                for(let i = 0; i < res.group_roles.length; i++){
                                    if(searchMember._roles.includes(res.group_roles[i].role)){    
                                        if (thisGuildObject.roles.cache.get(res.group_roles[i].role).position > thisGuildObject.roles.cache.get(myData.highestRole).position) {
                                            logChannel.send(`[Role Menu System Warning]: It seems like a role (<@&${res.group_roles[i].role}>) that is in a higher position than my highest role was added. I can't do anything with this role since it's above my highest role!\n\nPlease fix this by setting up my role above every role you desire to assign/remove this role to people in the menu!`)
                                            continue;
                                        }
                                        searchMember.roles.remove(res.group_roles[i].role)
                                    }                                                 
                                }
                                if (!searchMember._roles.find(role => role == emojiToRole.role)) {
                                    if (thisGuildObject.roles.cache.get(emojiToRole.role).position > thisGuildObject.roles.cache.get(myData.highestRole).position) return logChannel.send(`[Role Menu System Warning]: It seems like a role (<@&${emojiToRole.role}>) that is in a higher position than my highest role was added. I can't do anything with this role since it's above my highest role!\n\nPlease fix this by setting up my role above every role you desire to assign/remove this role to people in the menu!`)
                                    searchMember.roles.add(emojiToRole.role)
                                    console.log(`added unique role to ${theUser.username} role id ${emojiToRole.role}`)
                                } else console.log(`${theUser.username}#${theUser.id} has already role`)
                                } catch (error) {
                                console.log(error)
                                return logChannel.send(`Unfortunately an error happened out of nowhere and nothing work out (probably). Wait a bit and try again later. If this persist, contant my partner!\nError: ${error.message}`)
                                }
                            }
                            
                            //multi mode: can set the minimum and maximum number of roles a member can have in the group
                            if (res.group_mode == 'multi') {
                                let memberMaxRoles = 0;
                                //assign the role if user has below maximum amount of roles
                                try {
                                    for(let i = 0; i < res.group_roles.length; i++){
                                        if(searchMember._roles.includes(res.group_roles[i].role)){    
                                            memberMaxRoles++;
                                        }                                                 
                                    }
                                    if (memberMaxRoles >= res.group_max_roles) return theUser.send(`In "\`${res.group_name}\`", you can receive up to "\`${res.group_max_roles}\`" role(s)!`)
                                if (!searchMember._roles.find(role => role == emojiToRole.role)) {
                                    if (thisGuildObject.roles.cache.get(emojiToRole.role).position > thisGuildObject.roles.cache.get(myData.highestRole).position) return logChannel.send(`[Role Menu System Warning]: It seems like a role (<@&${emojiToRole.role}>) that is in a higher position than my highest role was added. I can't do anything with this role since it's above my highest role!\n\nPlease fix this by setting up my role above every role you desire to assign/remove this role to people in the menu!`)
                                    searchMember.roles.add(emojiToRole.role)
                                    console.log(`added multi role to ${theUser.username} role id ${emojiToRole.role}: ${memberMaxRoles}`)
                                } else console.log(`${theUser.username}#${theUser.id} has already role`)
                                } catch (error) {
                                console.log(error)
                                return logChannel.send(`Unfortunately an error happened out of nowhere and nothing work out (probably). Wait a bit and try again later. If this persist, contant my partner!\nError: ${error.message}`)
                                }
                            }
                        }
                    })
                }
            }
        }
        
        // starboard system
        // reactMsg system
        // Versus Event
        guildSettings.findOne({
            ID: thisGuildID
        },async(err,res)=>{
            if (err) {
                sendError.create({
                    Guild_Name: `Can't retrieve guildName because it's in error form the "reaction add" event.`,
                    Guild_ID:  `Can't retrieve guildID because it's in error form the "reaction add" event.`,
                    User: `Can't retrieve user because it's in error form the "reaction add" event.`,
                    UserID: `Can't retrieve userid because it's in error form the "reaction add" event.`,
                    Error: err,
                    Time: `${TheDate} || ${clock} ${amORpm}`,
                    Command: `messageReactionAdd- starboard system`,
                    Args: `Can't retrieve args because it's in error form "reaction add" the event.`,
                },async (err, res) => {
                    if(err) {
                        console.log(err)
                    }
                    if(res) {
                        console.log(`successfully added error to database from messageReactionAdd event!`)    
                    }
                })
            }
            if (res) {
                if (res.systems.starboard.enabled == true) {
                    if (reaction._emoji.name !== '⭐') return;
                    let starChannel = this.client.guilds.cache.get(thisGuildID).channels.cache.get(res.systems.starboard.channel);
                    if (!starChannel) logChannel.send(`The Starboard channel isn't set up! If you wish to continue using this feature, please set up a starboard channel in settings panel!`)
                    if (starChannel !== undefined) {
                        if (reaction.message.author.id === theUser.id) return console.log(`[Starboard| ${TheDate}| ${clock} ${amORpm}] ${reaction.message.author.tag}: Owners cannot star their own messages!`)
                        if (reaction.message.author.bot) return console.log(`[Starboard| ${TheDate}| ${clock} ${amORpm}] ${reaction.message.author.tag}: bots cannot use starboard feature!`)
                        let starCount = reaction.count
                        //checking if the owner didn't react to their own message, if yes, don't count them!
                        if (reaction.users.cache.get(reaction.message.author.id) != undefined) starCount--;
                        
                        if (starCount < res.systems.starboard.count) return;

                        this.client.guilds.cache.get(reaction.message.guild.id).channels.cache.get(reaction.message.channel.id).messages.fetch(reaction.message.id).then(msg =>{
                            console.log(msg.reactions.cache)
                        })
                        // console.log(reaction)
                        //fetching the 100 messages in channel:
                        const fetch = await starChannel.messages.fetch({ limit: 100 }); 
                        const stars = fetch.find(m => m.embeds[0]?.footer.text.startsWith("⭐") && m.embeds[0].footer.text.endsWith(reaction.message.id))

                        if (stars) {
                            const foundStar = stars.embeds[0];
                            const image = reaction.message.attachments.size > 0 ? await extension(reaction, reaction.message.attachments.array()[0].url) : ''; 
                            const embed = new SharuruEmbed()
                              .setColor(foundStar.color)
                              .setDescription(foundStar.description)
                              .setAuthor(reaction.message.author.tag, reaction.message.author.displayAvatarURL())
                              .setTimestamp()
                              .addField(`Jump to`,`[Message!](https://discord.com/channels/${reaction.message.guild.id}/${reaction.message.channel.id}/${reaction.message.id})`)
                              .setFooter(`⭐ ${starCount} | `+reaction.message.id)
                              .setImage(image);
                            
                            const starMsg = await starChannel.messages.fetch(stars.id);
                            await starMsg.edit({embeds: [embed]}); 
                        }
                        // Now we use an if statement for if a message isn't found in the systems.starboard for the message.
                        if (!stars) {
                            // console.log(`created message`)
                            const image = reaction.message.attachments.size > 0 ? await extension(reaction, reaction.message.attachments.array()[0].url) : ''; 
                            if (image === '' && reaction.message.cleanContent.length < 1) return console.log(`[Starboard| ${TheDate}| ${clock} ${amORpm}] ${reaction.message.author.tag}: you cannot star an empty message.`); 
                            const embed = new SharuruEmbed()
                                .setColor(15844367)
                                .setDescription(reaction.message.cleanContent) 
                                .setAuthor(reaction.message.author.tag, reaction.message.author.displayAvatarURL())
                                .addField(`Jump to`,`[Message!](https://discord.com/channels/${reaction.message.guild.id}/${reaction.message.channel.id}/${reaction.message.id})`)
                                .setTimestamp(new Date())
                                .setFooter(`⭐ ${starCount} | ${reaction.message.id}`)
                                .setImage(image);
                            await starChannel.send({embeds: [embed]});
                        }
                    }
                }

                if (res.systems.reactMsg.enabled == true) {
                    let msgURL = `https://discord.com/channels/${reaction.message.guild.id}/${reaction.message.channel.id}/${reaction.message.id}`
                    reactmsgDocs.findOne({
                        mid: msgURL,
                        server: reaction.message.guild.id
                    },(err2,res2) =>{
                        if (err2) {
                            sendError.create({
                                Guild_Name: `Can't retrieve guildName because it's in error form the "reaction add" event.`,
                                Guild_ID:  `Can't retrieve guildID because it's in error form the "reaction add" event.`,
                                User: `Can't retrieve user because it's in error form the "reaction add" event.`,
                                UserID: `Can't retrieve userid because it's in error form the "reaction add" event.`,
                                Error: err2.stack,
                                Time: `${TheDate} || ${clock} ${amORpm}`,
                                Command: `messageReactionAdd- starboard system`,
                                Args: `Can't retrieve args because it's in error form "reaction add" the event.`,
                            },async (err, res) => {
                                if(err) {
                                    console.log(err)
                                }
                                if(res) {
                                    console.log(`successfully added error to database from messageReactionAdd event!`)    
                                }
                            })
                        }
                        if (res2) {
                            if (res2.enabled == true) {
                                try {
                                    let jackpot = res2.emojis_and_texts.find(ob => reaction._emoji.id == null ? ob.emoji == reaction._emoji.name : ob.emoji == reaction._emoji.id)
                                    let get_dataLink = res2.mid.split("/")
                                    if (jackpot) {
                                        theUser.send(jackpot.text).catch(err => {
                                            if (err.httpStatus == 403) this.client.guilds.cache.get(get_dataLink[get_dataLink.length-3]).channels.cache.get(get_dataLink[get_dataLink.length-2]).send(`${theUser}, please change your privacy settings for this server to send you messages!`) 
                                        })
                                        console.log(`[ReactToDM]: sent the text to ${theUser.username}`)
                                        let infoembed = new SharuruEmbed()
                                            .setAuthor(`React to DM!`)
                                            .setDescription(`${theUser} (${theUser.username}) reacted with (${reaction._emoji.id == null ? reaction._emoji.name : this.client.guilds.cache.get(get_dataLink[get_dataLink.length-3]).emojis.cache.get(reaction._emoji.id)}) on [this message!](${res2.mid})`)
                                            .setColor(`LUMINOUS_VIVID_PINK`)
                                        if (res.systems.reactMsg.logs == true)
                                            if (res2.logs == true)
                                                logChannel.send({embeds: [infoembed]})
                                    }
                                } catch (error) {
                                    console.log(error)
                                    let get_dataLink = res2.mid.split("/")
                                    this.client.guilds.cache.get(get_dataLink[get_dataLink.length-3]).channels.cache.get(get_dataLink[get_dataLink.length-2]).send(`${theUser}, please notify a moderator/admin that an issue appeared!\nERROR: ${error.message}`)
                                }
                            }
                        }
                    })
                }

                //#region versus event
                let isPlayerInRedTeam = res.events.versus.red.players.find(item => item == theUser.id)
                let isPlayerInBlueTeam = res.events.versus.blue.players.find(item => item == theUser.id)
//                 console.log(`\n\nChecking event missions...\n${isPlayerInBlueTeam != undefined ? `Player is in blue team`: `Player not found in blue team`}
// ${isPlayerInRedTeam != undefined ? `Player is in red team`: `Player not found in red team`}`)

                if (isPlayerInBlueTeam || isPlayerInRedTeam) {
                    if (reaction.message.author.id == this.client.user.id)
                        profileSys.findOne({
                            userID: theUser.id
                        },async (err2,res2)=>{
                            if(err2) {
                                sendError.create({
                                    Guild_Name: `Can't retrieve guildName because it's in error form the "reaction add" event.`,
                                    Guild_ID:  `Can't retrieve guildID because it's in error form the "reaction add" event.`,
                                    User: `Can't retrieve user because it's in error form the "reaction add" event.`,
                                    UserID: `Can't retrieve userid because it's in error form the "reaction add" event.`,
                                    Error: err,
                                    Time: `${TheDate} || ${clock} ${amORpm}`,
                                    Command: `messageReactionAdd- versusEvent`,
                                    Args: `Can't retrieve args because it's in error form "reaction add" the event.`,
                                },async (err, res) => {
                                    if(err) {
                                        console.log(err)
                                    }
                                    if(res) {
                                        console.log(`successfully added error to database from messageReactionAdd event!`)    
                                    }
                                })
                            }
                            if (res2) {
                                let eventData = res2.events.versus;
                                let getMissionData = eventData.missions.list.find(item => item.id == 1)

                                if (getMissionData.completed == true) return console.log(`[Versus Event-React to Messages # ${TheDate}-${clock} ${amORpm}]: User ${theUser.username} (${theUser.id}) has completed this mission already!`)
                                
                                if (eventData.missions.messages.includes(reaction.message.id)) return console.log(`[Versus Event-React to Messages # ${TheDate}-${clock} ${amORpm}]: User ${theUser.username} (${theUser.id}) has reacted to this message (chId:${reaction.message.channelId}/mId:${reaction.message.id}) already for today!`)

                                eventData.missions.messages.push(`${reaction.message.id}`) // add the message to the list.
                                getMissionData.finished++;// add +1 to finished
                                eventData.tickets += getMissionData.reward
                                console.log(`[Versus Event-React to Messages # ${TheDate}-${clock} ${amORpm}]: User ${theUser.username} (${theUser.id}) reacted to (chId:${reaction.message.channelId}/mId:${reaction.message.id}) ${getMissionData.finished}/${getMissionData.perDay}`)
                                if (getMissionData.finished >= getMissionData.perDay) getMissionData.completed = true;

                                for (let i = 0; i < eventData.missions.list.length; i++) {
                                    if (eventData.missions.list[i].id == 1) {
                                        eventData.missions.list[i] = getMissionData
                                    }
                                }
                                profileSys.updateOne({
                                    'userID': `${theUser.id}`
                                },{'$set':{ 'events.versus' : eventData}},(erro,reso)=>{
                                    if (erro) {
                                        sendError.create({
                                            Guild_Name: `MesssageReactionAdd event file - no guild name, check id`,
                                            Guild_ID: reaction.message.guildId,
                                            User: theUser.username,
                                            UserID: theUser.id,
                                            Error: erro,
                                            Time: `${TheDate} || ${clock} ${amORpm}`,
                                            Command: this.name + `, update vsEV MISSION LIST `,
                                            Args: args,
                                        },async (errr, ress) => {
                                            if(errr) {
                                                console.log(errr)
                                                return logChannel.send(`[${this.name}]: Unfortunately an problem appeared while trying to save data of an user in VERSUS EVENT COMMMAND- MISSIONS. Please try again later. If this problem persist, contact my partner!`)
                                            }
                                            if(ress) {
                                                console.log(`successfully added error to database!`)
                                            }
                                        })
                                        return;
                                    }
                                    if(reso) {
                                        // console.log(reso)
                                        console.log(`[VersusEvent-Missions]: Successfully Updated ${theUser.username} (${theUser.id}) mission list.`)
                                    }
                                });

                            }
                        })
                    else
                        console.log(`[Versus Event-React to Messages # ${TheDate}-${clock} ${amORpm}]: User ${theUser.username} (${theUser.id}) didn't react to one of my messages (Sharuru)`)
                }
                //#endregion

            }
        })
        
        // console.log(`This is a partial reaction and recovered:\n- Emoji was used in: ${reaction.message.channel.name};\n- Message ID: ${reaction.message.id}\n- Added by ${reaction.message.author.username}#${reaction.message.author.discriminator};\n- Emoji used: ${reaction._emoji.name} (${reaction._emoji.id ? reaction._emoji.id : "Discord basic emoji"})`)
    }
}