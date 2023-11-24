const SharuruEmbed = require('../../Structures/SharuruEmbed');
const temporaryRoles = require('../../Models/temporaryRoles');
const guildSettings = require("../../Models/GuildSettings")
const roleMenuDocs = require('../../Models/roleMenuDocs');
const emojiDocs = require('../../Models/emojiDocs');
const Event = require('../../Structures/Event');
const sendError = require("../../Models/Error");
const banSys = require("../../Models/banDocs");
const muteSys = require("../../Models/mutes");
const config = require('../../../config.json');
const pms = require("pretty-ms")
const halloweenCardsDB = require('../../Models/events/halloween/halloween_queue');
const { Colors } = require("discord.js")

module.exports = class extends Event {

    async run (options) {
        
        setInterval(() => {
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
            const sharuru = this.client
            console.log(`[${TheDate} || ${clock} ${amORpm}] Checking media channel records...`)
            console.log(`[${TheDate} || ${clock} ${amORpm}] Checking roleMenu records...`)
            console.log(`[${TheDate} || ${clock} ${amORpm}] Checking emoji records...`)
            console.log(`[${TheDate} || ${clock} ${amORpm}] Checking mute records...`)
            console.log(`[${TheDate} || ${clock} ${amORpm}] Checking ban records...`)

            // checking emojis
            emojiDocs.find({},async (err,res)=>{
                if (err) {
                    sendError.create({
                        Guild_Name: `Can't retrieve guildName because it's in error  from the event.`,
                        Guild_ID:  `Can't retrieve guildID because it's in error  from the event.`,
                        User: `Can't retrieve user because it's in error  from the event.`,
                        UserID: `Can't retrieve userid because it's in error  from the event.`,
                        Error: err,
                        Time: `${TheDate} || ${clock} ${amORpm}`,
                        Command: `multi system => emoji system`,
                        Args: `Can't retrieve args because it's in error  from the event.`,
                    },async (err, res) => {
                        if(err) {
                            console.log(err)
                        }
                        if(res) {
                            console.log(`successfully added error to database from multi system!`)    
                        }
                    })
                }
                if (res) {
                    for(let i = 0; i < res.length; i++) {
                        // if it's temporary...
                        if(res[i].temporary != '0'){
                            let j = res[i].members.length-1;
                            let g = res[i].roles.length-1;
                            // checking the members length
                            while(j >= 0) {
                                if(res[i].members[j].time <= Date.now()) {
                                    // let oldData = res[i].members[j];
                                    let modifiedData = res[i].members;
                                    modifiedData.splice(j,1);
                                    res[i].members = modifiedData
                                    // console.log(`Removed ${oldData.id} (member) (${res[i].name}) because time limit was hit!`)
                                }
                                j--;
                            }

                            // checking now the roles length
                            while(g >= 0) {
                                if(res[i].roles[g].time <= Date.now()) {
                                    // let oldData = res[i].roles[g];
                                    let modifiedData = res[i].roles;
                                    modifiedData.splice(g,1)
                                    res[i].roles = modifiedData
                                    // console.log(`Removed ${oldData.id} (role) (${res[i].name}) because time limit was hit!`)
                                }
                                g--;
                            }
                        }
                        res[i].save().catch(err => console.log(err))
                    }
                }
            })

            // checking bans
            banSys.find({},async (err,res)=>{
                if (err) {
                    sendError.create({
                        Guild_Name: `Can't retrieve guildName because it's in error  from the event.`,
                        Guild_ID:  `Can't retrieve guildID because it's in error  from the event.`,
                        User: `Can't retrieve user because it's in error  from the event.`,
                        UserID: `Can't retrieve userid because it's in error  from the event.`,
                        Error: err,
                        Time: `${TheDate} || ${clock} ${amORpm}`,
                        Command: `multi system => ban system`,
                        Args: `Can't retrieve args because it's in error  from the event.`,
                    },async (err, res) => {
                        if(err) {
                            console.log(err)
                        }
                        if(res) {
                            console.log(`successfully added error to database from multi system!`)    
                        }
                    })
                }
                if(res){
                    for(let i = 0; i < res.length; i++){                        
                        if(Date.now() > res[i].time){
                            let guild = this.client.guilds.cache.get(res[i].guild_ID);
                            let logs = this.client.guilds.cache.get(res[i].guild_ID).channels.cache.find(ch=> ch.name == 'sharuru-logs');
                            guild.members.unban(res[i].userID).then(m =>{
                                console.log(`[BanSystem : ${TheDate} | ${clock} ${amORpm}] Successfully unbanned ${res[i].user} from "${res[i].guild_Name} (${res[i].guild_ID})"`)
                                logs.send(`I have successfully unbanned ${res[i].user}! Previously banned for: ${res[i].reason}`)
                            })
                            // to delete after
                            banSys.findOneAndDelete({
                                userID: res[i].userID
                            },(erro,resu)=>{
                                if(erro) console.log(erro)
                                if(resu) console.log(`Successfully deleted from database ${res[i].user} since he is unbanned!`)
                            })                         
                        }
                    }
                }
            })

            // roleMenu
            roleMenuDocs.find({},async (err,res)=>{
                if (err) {
                    sendError.create({
                        Guild_Name: `Can't retrieve guildName because it's in error  from the event.`,
                        Guild_ID:  `Can't retrieve guildID because it's in error  from the event.`,
                        User: `Can't retrieve user because it's in error  from the event.`,
                        UserID: `Can't retrieve userid because it's in error  from the event.`,
                        Error: err,
                        Time: `${TheDate} || ${clock} ${amORpm}`,
                        Command: `multi system => roleMenu system`,
                        Args: `Can't retrieve args because it's in error  from the event.`,
                    },async (err, res) => {
                        if(err) {
                            console.log(err)
                        }
                        if(res) {
                            console.log(`successfully added error to database from multi system!`)    
                        }
                    })
                }
                if(res){
                    for(let i = 0; i < res.length; i++){                        
                        let menus = this.client.roleMenuData.get(res[i].group_guildID.toString())
                        if (menus == undefined) menus = {}
                        if (!menus.hasOwnProperty(res[i].group_channelID.toString())) menus[res[i].group_channelID.toString()] = []
                        if (menus.hasOwnProperty(res[i].group_channelID.toString()) && !menus[res[i].group_channelID.toString()].find(msgid => msgid == res[i].group_messageID.toString())) menus[res[i].group_channelID.toString()].push(res[i].group_messageID.toString())
                        this.client.roleMenuData.set(res[i].group_guildID.toString(),menus)
                    }
                }
            })

            temporaryRoles.find({},async (err, res)=>{
                if (err) {
                    sendError.create({
                        Guild_Name: `Can't retrieve guildName because it's in error  from the event.`,
                        Guild_ID:  `Can't retrieve guildID because it's in error  from the event.`,
                        User: `Can't retrieve user because it's in error  from the event.`,
                        UserID: `Can't retrieve userid because it's in error  from the event.`,
                        Error: err,
                        Time: `${TheDate} || ${clock} ${amORpm}`,
                        Command: `tempRoles for Rolemenu in mute System`,
                        Args: `Can't retrieve args because it's in error  from the event.`,
                    },async (err, res) => {
                        if(err) {
                            console.log(err)
                        }
                        if(res) {
                            console.log(`successfully added error to database from raffle system!`)    
                        }
                    })
                }
                if (res) {
                    for(let i = 0; i < res.length; i++){
                        let thisGuildObject = this.client.guilds.cache.get(res[i].guild_id) 
                        let memberGuild = thisGuildObject.members.cache.get(res[i].user_id);
                        let myData = this.client.impData.get(thisGuildObject.id)
                        const logs = thisGuildObject.channels.cache.find(ch => ch.name == 'sharuru-logs')

                        if (memberGuild) {
                            console.log(`${res[i].name} is still on the "${thisGuildObject.name}" server...`)
                            let temporaryRoleSelected = thisGuildObject.roles.cache.get(res[i].role_id);
                            if (temporaryRoleSelected) {
                                //checking if I can remove it (higher pos?)
                                if (temporaryRoleSelected.position > thisGuildObject.roles.cache.get(myData.highestRole).position) {
                                    console.log(`[Role Menu]: I can't remove the temporary role "${temporaryRoleSelected.name} (${temporaryRoleSelected.id})" from ${res[i].user_id} since higher role.`)
                                    logs.send(`[Role Menu System Warning]: I can't remove "${temporaryRoleSelected}" from member "${memberGuild}" because it's higher position than my highest role! Please remove it manually or put it below my role so next time when I check for temporary roles so I can remove it!`)
                                    continue;
                                }
                                console.log(`${temporaryRoleSelected.name} is still available in the "${thisGuildObject.name}" server...`)
                                if(Date.now() > res[i].time_for_role){
                                    console.log(`${res[i].user_id} from (${res[i].guild_name}) has run out of time for this role: ${temporaryRoleSelected.name}.`)
                                    memberGuild.roles.remove(temporaryRoleSelected);
                                    temporaryRoles.findOneAndDelete({
                                        user_id: res[i].user_id
                                    },(erro,resu)=>{
                                        if(erro) console.log(erro)
                                        if(resu) console.log(`Successfully deleted from database ${res[i].user_id} since their temporary role expired!!`)
                                    })                  
                                }
                            }
                            if (!temporaryRoleSelected) {
                                console.log(`The role "${res[i].role_id}" is not available anymore in the "${thisGuildObject.name}" server... Commencing the delete method for doc`)
                                temporaryRoles.findOneAndDelete({
                                    user_id: res[i].user_id
                                },(erro,resu)=>{
                                    if(erro) console.log(erro)
                                    if(resu) console.log(`Successfully deleted from database ${res[i].user_id} since the role isn't anymore on the "${thisGuildObject.name}" server`)
                                })
                            }
                        }
                    }
                }
            })

            // checking mutes
            muteSys.find({},async (err, res)=>{
                if (err) {
                    sendError.create({
                        Guild_Name: `Can't retrieve guildName because it's in error  from the event.`,
                        Guild_ID:  `Can't retrieve guildID because it's in error  from the event.`,
                        User: `Can't retrieve user because it's in error  from the event.`,
                        UserID: `Can't retrieve userid because it's in error  from the event.`,
                        Error: err,
                        Time: `${TheDate} || ${clock} ${amORpm}`,
                        Command: `mute System`,
                        Args: `Can't retrieve args because it's in error  from the event.`,
                    },async (err, res) => {
                        if(err) {
                            console.log(err)
                        }
                        if(res) {
                            console.log(`successfully added error to database from raffle system!`)    
                        }
                    })
                }
                if (res) {
                    for(let i = 0; i < res.length; i++){
                        let muted = this.client.guilds.cache.get(res[i].Guild_ID).members.cache.get(res[i].UserID);
                        let mutedrole = this.client.guilds.cache.get(res[i].Guild_ID).roles.cache.find(r=> r.name == `muted`);
                        let guildObject = this.client.guilds.cache.get(res[i].Guild_ID)
                        const logs = guildObject.channels.cache.find(ch => ch.name == 'sharuru-logs')
                        let twoWeeksOver = res[i].Time + 1209600000 //time in ms for 2 weeks
                        let myData = sharuru.impData.get(res[i].Guild_ID)
                        if(Date.now() > res[i].Time){
                            let muteEmbed = new SharuruEmbed()
                                .setAuthor(`Media Channel System`)
                                .setColor(`LUMINOUS_VIVID_PINK`)
                            console.log(`${res[i].User} from (${res[i].Guild_Name}) isn't anymore muted.`)
                            if(muted && mutedrole){
                                if (muted.roles.cache.get(mutedrole.id)) {
                                    if (mutedrole.position < guildObject.roles.cache.get(myData.highestRole).position) {
                                        muted.roles.remove(mutedrole);
                                        muteSys.findOneAndDelete({
                                            UserID: res[i].UserID
                                        },(erro,resu)=>{
                                            if(erro) console.log(erro)
                                            if(resu) console.log(`Successfully deleted from database ${res[i].User} since he is unmuted!`)
                                        })
                                    } else {
                                        // notice the mods if the role is higher than mine because idiots are not giving administrator/role management perm or put my personal role below everything to me ^^
                                        muteEmbed.setDescription(`Unfortunately I can't remove the mute role of <@&${res[i].UserID}> because my role, ${guildObject.roles.cache.get(myData.highestRole)}, isn't high enough to manage!
Please remove it manually if you want that user to type again!`)
                                        logs.send({embeds: [muteEmbed]})
                                    }
                                } else {
                                    // if member doesn't have the role anymore by any chance
                                    muteEmbed.setDescription(`It seems like <@${res[i].userID}> doesn't have the mute role anymore... Well nothing to do here then!`)
                                    logs.send({embeds: [muteEmbed]})
                                    muteSys.findOneAndDelete({
                                        UserID: res[i].UserID
                                    },(erro,resu)=>{
                                        if(erro) console.log(erro)
                                        if(resu) console.log(`Successfully deleted from database ${res[i].User} since he is unmuted!`)
                                    })
                                }
                            } else {
                                // no role/member or both in the server...
                                muteEmbed.setDescription(`It seems like  either <@${res[i].userID}> or the mute role isn't available anymore in the server... Well nothing to do here then!`)
                                logs.send({embeds: [muteEmbed]})
                            }
                            if(!muted && res[i].Time < twoWeeksOver) {
                                muteSys.findOneAndDelete({
                                    UserID: res[i].UserID
                                },(erro,resu)=>{
                                    if(erro) console.log(erro)
                                    if(resu) console.log(`Successfully deleted ${res[i].User} since 2 weeks passed after they left the server!`)
                                })
                            } else console.log(`${res[i].User} left the server but I'll still keep him there until ${this.client.utils.convertTime(res[i].Time)}!`);                            
                        }
                    }
                }
            })

            // media channel
            let mediaPool = sharuru.mediaChannelPause
            let mediaKeys = [...mediaPool.keys()]
            if (mediaKeys.length >= 1) { // if there was anyone added
                for (let i = 0; i < mediaKeys.length; i++) {
                    let aGuild = mediaPool.get(mediaKeys[i])
                    let guildKey = mediaKeys[i]
                    for (const pUser of aGuild) {
                        if (Date.now() > pUser.time) {
                            let mediaChannel = new SharuruEmbed()
                                .setAuthor(`Media Channel System`)
                                .setColor(`LUMINOUS_VIVID_PINK`)
                            console.log(`[Media Channel]: User ${pUser.id} (g: ${pUser.guild}) is allowed to post in media channels!`)
                            let guildObject = sharuru.guilds.cache.get(pUser.guild)
                            const logs = guildObject.channels.cache.find(ch => ch.name == 'sharuru-logs')
                            let guildRole = guildObject.roles.cache.find(role => role.id == pUser.role)
                            let guildMember = guildObject.members.cache.get(pUser.id)
                            let myData = sharuru.impData.get(pUser.guild)
            
                            if (guildRole && guildMember) { // if the role & the member is are still there in the guild
                                if (guildMember.roles.cache.get(pUser.role)) {
                                    if (guildRole.position < guildObject.roles.cache.get(myData.highestRole).position) { // if my role is higher
                                        // remove role
                                        guildMember.roles.remove(guildRole.id)                                        
                                        mediaChannel.setDescription(`The time for <@${pUser}> is over! Now they are able to post again in media channels`)
                                        logs.send({embeds: [mediaChannel]})

                                        // update the media map
                                        let indexPuser = aGuild.findIndex(item => item.id == pUser.id)
                                        aGuild.splice(indexPuser,1)
                                        sharuru.mediaChannelPause.set(guildKey,aGuild)
                                    } else {
                                        // notice the mods if the role is higher than mine because idiots are not giving administrator/role management perm or put my personal role below everything to me ^^
                                        mediaChannel.setDescription(`Unfortunately I can't remove the media role of <@&${pUser.id}> because my role, ${guildObject.roles.cache.get(myData.highestRole)}, isn't high enough to manage <@&${pUser.role}>!
Please remove it manually if you want that user to type again in media channels!`)
                                        logs.send({embeds: [mediaChannel]})

                                        // update the media map
                                        let indexPuser = aGuild.findIndex(item => item.id == pUser.id)
                                        aGuild.splice(indexPuser,1)
                                        sharuru.mediaChannelPause.set(guildKey,aGuild)
                                    }
                                } else { 
                                    // if member doesn't have the role anymore by any chance
                                    mediaChannel.setDescription(`It seems like <@${pUser.id}> doesn't have the media role anymore... Well nothing to do here then!`)
                                    logs.send({embeds: [mediaChannel]})

                                    // update the media map
                                    let indexPuser = aGuild.findIndex(item => item.id == pUser.id)
                                    aGuild.splice(indexPuser,1)
                                    sharuru.mediaChannelPause.set(guildKey,aGuild)
                                }
                            } else { 
                                // no role/member or both in the server...
                                mediaChannel.setDescription(`It seems like  either <@${pUser.id}> or the media channel role isn't available anymore in the server... Well nothing to do here then!`)
                                logs.send({embeds: [mediaChannel]})

                                // update the media map
                                let indexPuser = aGuild.findIndex(item => item.id == pUser.id)
                                aGuild.splice(indexPuser,1)
                                sharuru.mediaChannelPause.set(guildKey,aGuild)
                            }
                        } else console.log(`[Media Channel]: ${pUser.id}, their time isn't over yet. (${pUser.guild})`)
                    }
                }
            } else console.log(`No media keys`)

        }, 300 * 1000);

        // one time loading on startup: 
        // halloween event to set up chances engine
        guildSettings.find({},(err,res)=>{
            if (err) {
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
                sendError.create({
                    Guild_Name: `Can't retrieve guildName because it's in error  from the event.`,
                    Guild_ID:  `Can't retrieve guildID because it's in error  from the event.`,
                    User: `Can't retrieve user because it's in error  from the event.`,
                    UserID: `Can't retrieve userid because it's in error  from the event.`,
                    Error: err,
                    Time: `${TheDate} || ${clock} ${amORpm}`,
                    Command: `multi system => one time startup system- halloween`,
                    Args: `Can't retrieve args because it's in error  from the event.`,
                },async (err, res) => {
                    if(err) {
                        console.log(err)
                    }
                    if(res) {
                        console.log(`successfully added error to database from multi system!`)    
                    }
                })
            }
    		if (Date.now() > config.event_dates.halloweenEnd) return console.log(`[Halloween-event]: The event is over! Not setting up anymore the spawners! (multisystem.js)!`)
            //#region time Var
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
            //#endregion
            if (res == null || res == undefined) return;
            for (const item of res) {
                if (item.events.halloween.enabled == true) {
                    console.log(`\n\n[Halloween-Event | ${TheDate} - ${clock} ${amORpm}]: Enabling Halloween event for "${item.Guild_Name}" server...`)
                    let timer = setInterval(() => {
                        //#region time Var
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
                        //#endregion
                        guildSettings.findOne({
                            ID: item.ID
                        },(err2,res2)=>{
                            if (err2) {
                                sendError.create({
                                    Guild_Name: `Can't retrieve guildName because it's in error  from the event.`,
                                    Guild_ID:  `Can't retrieve guildID because it's in error  from the event.`,
                                    User: `Can't retrieve user because it's in error  from the event.`,
                                    UserID: `Can't retrieve userid because it's in error  from the event.`,
                                    Error: err2,
                                    Time: `${TheDate} || ${clock} ${amORpm}`,
                                    Command: `multi system => one time startup system - 2nd search`,
                                    Args: `Can't retrieve args because it's in error  from the event.`,
                                },async (err3, res3) => {
                                    if(err3) {
                                        console.log(err3)
                                    }
                                    if(res3) {
                                        console.log(`successfully added error to database from multi system!`)    
                                    }
                                })
                            }
                            if (res2) {
                                // console.log(Date.now())
                                // console.log(config.event_dates.halloweenEnd)
                                if (Date.now() > config.event_dates.halloweenEnd) {// end of halloween event date
                                    let halloEventTimer = this.client.halloweenEvent.get(res2.ID)
                                    clearInterval(halloEventTimer)
                                    return console.log(`\n\n[Halloween Event | ${TheDate} | ${clock} ${amORpm}]: The event is over! Not spawning anymore the cards! (interval cleared)!`)
                                } else {
                                    let options = {
                                        guild: res2.ID,
                                        channels: res2.events.halloween.channels,
                                        prefix: res2.prefix
                                    }
                                    if (res2.events.halloween.currentChance == 1 && res2.events.halloween.startChance == 10)
                                    res2.events.halloween.currentChance = res2.events.halloween.startChance
            
                                    if (res2.events.halloween.cooldown.recentSpawn > Date.now())
									{
										console.log(`[Halloween Event | ${TheDate} | ${clock} ${amORpm}]: Waiting for at least ${(res2.events.halloween.cooldown.amount/60)/1000}min before trying to spawn a card again on ${res2.ID} (${res2.Guild_Name}).`)
										return;
									}

                                    let chanceToDrop = this.percentageChance(['spawn','dontspawn'],[res2.events.halloween.currentChance,100-res2.events.halloween.currentChance])
                                
                                    if (chanceToDrop == "spawn"){
                                        this.client.emit('halloween',options)
                                        res2.events.halloween.currentChance = res2.events.halloween.startChance
                                        console.log(`[Halloween Event | ${TheDate} | ${clock} ${amORpm}]: Spawned a card in ${res2.ID} (${res2.Guild_Name}) at ${res2.events.halloween.currentChance}%!`)
										res2.events.halloween.cooldown.recentSpawn = Date.now() + Number(res2.events.halloween.cooldown.amount)
                                    } else {
                                        res2.events.halloween.currentChance += res2.events.halloween.increaseBy
                                        console.log(`[Halloween Event | ${TheDate} | ${clock} ${amORpm}]: increased chance for ${res2.ID} (${res2.Guild_Name}) by ${res2.events.halloween.increaseBy}. Total ${res2.events.halloween.currentChance}`)
                                    }
                                    res2.save().catch(err =>console.log(err))
                                }
                            }
                        })

                    }, item.events.halloween.every);//
                    let timerToExpire = setInterval(() => {
                        halloweenCardsDB.find({},async (err2,res2)=>{
                            //#region time var
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
                            //#endregion
                            let allMsgsPendingDelete = []
                            let finalMsg = `\n\n[Halloween-Event | ${TheDate} - ${clock} ${amORpm}]: -`
                            if (err2) {
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
                                sendError.create({
                                    Guild_Name: `Can't retrieve guildName because it's in error  from the event.`,
                                    Guild_ID:  `Can't retrieve guildID because it's in error  from the event.`,
                                    User: `Can't retrieve user because it's in error  from the event.`,
                                    UserID: `Can't retrieve userid because it's in error  from the event.`,
                                    Error: err2,
                                    Time: `${TheDate} || ${clock} ${amORpm}`,
                                    Command: `multi system => one time startup system- halloweenCardsDB`,
                                    Args: `Can't retrieve args because it's in error  from the event.`,
                                },async (err3, res3) => {
                                    if(err3) {
                                        console.log(err3)
                                    }
                                    if(res3) {
                                        console.log(`successfully added error to database from multi system!`)    
                                    }
                                })
                            }
                            if (res2) {
                                console.log(`\n\n[Halloween-Event | ${TheDate} - ${clock} ${amORpm}]: Starting to delete expired cards... about ${res2.length} found in total!`)

                                for(const card of res2) {
                                    if (card.expireAt < Date.now())
                                    {// if the msg is old, fetch and delete it
                                        try {
                                            const msgFetched = await this.client.guilds.cache.get(card.server).channels.cache.get(card.message.channel).messages.fetch(card.message.id)
                                            if (msgFetched)
                                            {
                                                console.log(`\n\n[Halloween-Event | ${TheDate} - ${clock} ${amORpm}]: I've fetched the msg of [${card.name} by ${card.artist}] and added to delete array...`)
                                                // finalMsg =+ `I've fetched the soul msg of [${card.name} by ${card.artist}] & `
                                                // this.client.utils.deleteMsg(msgFetched,'1s')
                                                allMsgsPendingDelete.push(msgFetched)
                                                halloweenCardsDB.findOneAndRemove({
                                                    server: card.server,
                                                    code: card.code,
                                                    name: card.name
                                                },(err3,res3)=>{
                                                    if (err3) {
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
                                                        sendError.create({
                                                            Guild_Name: `Can't retrieve guildName because it's in error  from the event.`,
                                                            Guild_ID:  `Can't retrieve guildID because it's in error  from the event.`,
                                                            User: `Can't retrieve user because it's in error  from the event.`,
                                                            UserID: `Can't retrieve userid because it's in error  from the event.`,
                                                            Error: err3,
                                                            Time: `${TheDate} || ${clock} ${amORpm}`,
                                                            Command: `multi system => one time startup system- halloweenCardsDB`,
                                                            Args: `Can't retrieve args because it's in error  from the event.`,
                                                        },async (err4, res4) => {
                                                            if(err4) {
                                                                console.log(err4)
                                                            }
                                                            if(res4) {
                                                                console.log(`successfully added error to database from multi system!`)    
                                                            }
                                                        })
                                                    }
                                                    if (res3) {
                                                        finalMsg += `successfully deleted from DB`
                                                        // console.log(`\n\n[Halloween-Event | ${TheDate} - ${clock} ${amORpm}]: The soul msg of [${card.name} by ${card.artist}] has been deleted successfully from DB! `)
                                                    }
                                                })
                                                // console.log(`\n\n[Halloween-Event | ${TheDate} - ${clock} ${amORpm}]: The soul msg of [${card.name} by ${card.artist}] has been deleted successfully from channel! `)
                                            } else {
                                                // finalMsg+=`I tried to fetch the soul msg of [${card.name} by ${card.artist}] and the response was not found. Did the message got deleted or channel hidden from me? I'll delete anyway the entry in DB...`
                                                console.log(`\n\n[Halloween-Event | ${TheDate} - ${clock} ${amORpm}]: I tried to fetch the soul msg of [${card.name} by ${card.artist}] and the response was not found. Did the message got deleted or channel hidden from me? I'll delete anyway the entry in DB... `)
                                                halloweenCardsDB.findOneAndRemove({
                                                    server: card.server,
                                                    code: card.code,
                                                    name: card.name
                                                },(err3,res3)=>{
                                                    if (err3) {
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
                                                        sendError.create({
                                                            Guild_Name: `Can't retrieve guildName because it's in error  from the event.`,
                                                            Guild_ID:  `Can't retrieve guildID because it's in error  from the event.`,
                                                            User: `Can't retrieve user because it's in error  from the event.`,
                                                            UserID: `Can't retrieve userid because it's in error  from the event.`,
                                                            Error: err3,
                                                            Time: `${TheDate} || ${clock} ${amORpm}`,
                                                            Command: `multi system => one time startup system- halloweenCardsDB`,
                                                            Args: `Can't retrieve args because it's in error  from the event.`,
                                                        },async (err4, res4) => {
                                                            if(err4) {
                                                                console.log(err4)
                                                            }
                                                            if(res4) {
                                                                console.log(`successfully added error to database from multi system!`)    
                                                            }
                                                        })
                                                    }
                                                    if (res3) {
                                                        finalMsg += `successfully deleted from DB`
                                                        // console.log(`\n\n[Halloween-Event | ${TheDate} - ${clock} ${amORpm}]: The soul msg of [${card.name} by ${card.artist}] has been deleted successfully from DB! `)
                                                    }
                                                })
                                            }
                                            
                                        } catch (error) {
                                            console.log(`\n\n[Halloween-Event | ${TheDate} - ${clock} ${amORpm}]: I've got an error while trying to delete [${card.name} by ${card.artist}]:`)
                                            console.log(error)
                                        }
                                    }
                                }
                                setTimeout(() => {
                                    try {
                                        if (allMsgsPendingDelete.length > 5)
                                        {
                                            this.client.guilds.cache.get(card.server).channels.cache.get(card.message.channel).bulkDelete(allMsgsPendingDelete)
                                            console.log(`\n\n[Halloween-Event | ${TheDate} - ${clock} ${amORpm}]: Deleted from discord in bulk ${allMsgsPendingDelete.length} msgs!`)
                                            // finalMsg+= ` deleted from discord channel in bulk ${allMsgsPendingDelete.length} msgs!`
                                        } 
                                        else if (allMsgsPendingDelete.length > 0 && allMsgsPendingDelete.length < 6)
                                        {
                                            for (let i = 0; i < allMsgsPendingDelete.length; i++) {
                                                const element = allMsgsPendingDelete[i];
                                                
                                                element.delete()
                                            }
                                            console.log(`\n\n[Halloween-Event | ${TheDate} - ${clock} ${amORpm}]: Deleted from discord about ${allMsgsPendingDelete.length} msg(s) individually!`)
                                            // finalMsg+= ` deleted from discord channel ${allMsgsPendingDelete.length} msg individually!`
                                        }
                                        // if (allMsgsPendingDelete.length != 0)
                                            // console.log(`\n\n[Halloween-Event | ${TheDate} - ${clock} ${amORpm}]: ${finalMsg}`)
                                    } catch (error) {
                                        console.log(error)
                                    }
                                }, 1000);
                                
                            }
                        })
                    }, 300 * 1000);
                    this.client.halloweenEvent.set(item.ID, timer)
                    if (this.client.halloweenEvent.get("halloweenCardGarbageCollector") == null || this.client.halloweenEvent.get("halloweenCardGarbageCollector") == undefined )
                    {
                        this.client.halloweenEvent.set(`halloweenCardGarbageCollector`, timerToExpire)
                        console.log(`\n\n[Halloween Event | ${TheDate} | ${clock} ${amORpm}]: Halloween Card Garbage Collector was established!`)
                    } else console.log(`\n\n[Halloween Event | ${TheDate} | ${clock} ${amORpm}]: Halloween Card Garbage Collector is already running and will not be reinitialized again!`)
                    console.log(`\n\n[Halloween Event | ${TheDate} | ${clock} ${amORpm}]: If everything went alright, "${item.Guild_Name}" server should have the halloween event enabled!`)
                }
            }
        })

        const eventSettings = {
            intervals: {
                bigBoss: [
                    {
                        starting: "11:30:00",
                        ending: "12:30:00"
                    },
                    {
                        starting: "23:30:00",
                        ending: "00:30:00"
                    },
                ],
                miniBoss: [
                    {
                        starting: "03:30:00",
                        ending: "04:30:00"
                    },
                    {
                        starting: "09:30:00",
                        ending: "10:30:00"
                    },
                    {
                        starting: "15:30:00",
                        ending: "16:30:00"
                    },
                    {
                        starting: "21:30:00",
                        ending: "22:30:00"
                    },
                ]
            },
            durations: {
                bigBoss : {
                    min: 240,
                    max: 480
                },
                miniBoss: {
                    min: 120,
                    max: 300
                }
            },
            chances: {
                bigBoss: 10,
                miniBoss: 25,
                increaseBy: 3
            }
        }
        // VS EVENT 1.0 2022
        //#region Embed Msgs
			let smallBossMessage = new SharuruEmbed()
            .setAuthor({name: `Versus Event: Choose a side & win together with your team!`})
            .setColor(Colors.LuminousVividPink)
            .setDescription(`Oh no! A Boss appeared out of nowhere! Quick, shoot the boss with your weapons and defend the channel!`)
            .setImage(`https://cdn.discordapp.com/attachments/769228052165033994/1010532759485292745/unknown.png`)

         let bigBossMessage = new SharuruEmbed()
            .setAuthor({name: `Versus Event: Choose a side & win together with your team!`})
            .setColor(Colors.LuminousVividPink)
            .setDescription(`Oh no! A Giant Boss appeared out of nowhere! Quick, shoot the boss with your weapons and defend the channel!`)
            .setImage(`https://cdn.discordapp.com/attachments/769228052165033994/1010199450007908515/unknown.png`)
        //#endregion
        //// big boss
        guildSettings.find({},async(err,res) => {
            if (err) {
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
                sendError.create({
                    Guild_Name: `Can't retrieve guildName because it's in error  from the event.`,
                    Guild_ID:  `Can't retrieve guildID because it's in error  from the event.`,
                    User: `Can't retrieve user because it's in error  from the event.`,
                    UserID: `Can't retrieve userid because it's in error  from the event.`,
                    Error: err,
                    Time: `${TheDate} || ${clock} ${amORpm}`,
                    Command: `multi system => one time startup system- VSEVENT`,
                    Args: `Can't retrieve args because it's in error  from the event.`,
                },async (err, res) => {
                    if(err) {
                        console.log(err)
                    }
                    if(res) {
                        console.log(`successfully added error to database from multi system!`)    
                    }
                })
            }
            if (Date.now() > config.event_dates.vs_end) return console.log(`[VSEVENT-event]: The event is over! Not setting up anymore the spawners! (multisystem.js)!`)

            for (const guildDOC of res) {
                //if settings isn't set up
                if (!guildDOC.events.versus.settings) {
                    guildDOC.events.versus.settings = eventSettings
                    console.log(`[VSEVENT - multisystem.jsb]: Set up guild ${guildDOC.Guild_Name} (${guildDOC.ID}) the versus settings! Skipping to next`)
                    guildDOC.save().catch(err => console.log(err))
                    return;
                }

                if (guildDOC.events.versus.enabled == false) {
                    console.log(`[VSEVENT-multisystem-bigboss]: Event on server ${guildDOC.Guild_Name} (${guildDOC.ID}) is disabled!`)
                    continue;
                }
                console.log(`[VSEVENT]: Enabling VS Event (bigboss edition) for "${guildDOC.Guild_Name}"" server.`)
                let timerEvent = setInterval(async() => {
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

                    const versusEventMap = this.client.versusEvent.get(1);
                    
                    // for searching each date set 
                    for (const timeObj of guildDOC.events.versus.settings.intervals.bigBoss) {
                        let temptime = new Date(2022,7,23,11,30,"00")
                        let dt = new Date();//current Date that gives us current Time also
        
                        let s =  timeObj.starting.split(':');
                        let dt1 = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), parseInt(s[0]), parseInt(s[1]), parseInt(s[2]));
        
                        let e =  timeObj.ending.split(':');
                        let dt2 = new Date(dt.getFullYear(), dt.getMonth(),	dt.getDate(), parseInt(e[0]), parseInt(e[1]), parseInt(e[2]));
        
                        if (dt >= dt1 && dt <= dt2) // if it's 
                            console.log(`[VSEVENT-${guildDOC.ID}]: Time to spawn a boss...`,timeObj)
                        else {
                            // console.log(`[VSEV-EVENT-${guildDOC.ID}]: Can't spawn a boss bcs not right time `,timeObj)
                            continue;
                        }
                        
                        // creating channel variables
                        let channelsToSpawn = guildDOC.events.versus.channels
                        let freeChannels = []

                        // console.log(`channels in DB:`,channelsToSpawn)

                        // generating chances to spawn and checking with the current amount
                        let getDataFromMaps = versusEventMap.chances.get(guildDOC.ID)
                        if (!getDataFromMaps) getDataFromMaps = 0
                        let chanceToSpawn = this.percentageChance(["yes","no"],[guildDOC.events.versus.settings.chances.bigBoss+getDataFromMaps,100-(guildDOC.events.versus.settings.chances.bigBoss+getDataFromMaps)])

                        // if we spawn, we reset the bonus chance to spawn to 0 in chances and spawn the boss in a random channel. otherwise increase chance
                        if (chanceToSpawn == "no") {
                            getDataFromMaps += guildDOC.events.versus.settings.chances.increaseBy
                            versusEventMap.chances.set(guildDOC.ID,getDataFromMaps)
                            return console.log(`[VSEVENT-SPAWN-${guildDOC.ID}]: Spawn failed, increased chance to ${getDataFromMaps}% (${guildDOC.events.versus.settings.chances.bigBoss+getDataFromMaps}% total)`)
                        }
                        if (chanceToSpawn == "yes") {
                            getDataFromMaps = 0
                            // console.log(`[VSEVENT]: This should be resetted but left for debugging!!! DO NOT FORGET TO SET THE CHANCE TO 0 AFTER GETTING GREENLIGHT\n`)
                            versusEventMap.chances.set(guildDOC.ID,getDataFromMaps) // maybe it saves or not
                            // this.client.versusEvent.set(1,versusEventMap)
                        }

                        //#region check if there is already a boss spawned. This way we do not spawn big bosses/more minibosses than require (1 bigboss, 4 mini)
                        let maxAllowed = 1
                        let maxFound = 0
                        let maxAllowedHIT = false;
                        for(let [key, value] of versusEventMap.spawns) {
                            if (value.bossType == "bigBoss") {
                                maxFound++;
                                console.log(`[VSEVENT-${guildDOC.ID}]: Found a big boss type spawned in ${key} channel!`)
                            }
                            if (maxFound == maxAllowed) {
                                maxAllowedHIT = true;
                                break;
                            }
                        }

                        if (maxAllowedHIT == true) {
                            console.log(`[VSEVENT-${guildDOC.ID}]: MaxAllowedHIT is on, not spawning anymore! Next!\n`)
                            continue;
                        };
                        //#endregion

                        // if we have 1 ch only, use that and get to the chances
                        if (channelsToSpawn.length == 1) {
                            let randomEndTime = this.getRandomInt(guildDOC.events.versus.settings.durations.bigBoss.min,guildDOC.events.versus.settings.durations.bigBoss.max)
                            //  if the channel is in use, return; Continue otherwise.		
                            if (versusEventMap.spawns.get(channelsToSpawn[0]) != undefined) return;
                            let objBoss = {
                                bossType: "bigBoss",
                                start_time: Date.now(),
                                end_time: Date.now() + randomEndTime * 1000,
                                red: 0,
                                blue: 0
                            }
                            versusEventMap.spawns.set(channelsToSpawn[0],objBoss)
                            this.client.versusEvent.set(1,versusEventMap)
                            let msgSent = await this.client.guilds.cache.get(guildDOC.ID).channels.cache.get(channelsToSpawn[0]).send({embeds: [bigBossMessage]})
                            this.client.guilds.cache.get(guildDOC.ID).channels.cache.find(item => item.name == "sharuru-logs").send(`[VSEVENT]: I've spawned a big boss in <#${channelsToSpawn[0]}>!Duration: ${pms(randomEndTime*1000)}`)
                            // console.log(`found a single channel`)
                            setTimeout(() => {
                            
                                // what we do here:
                                // save the data in the server doc and end the boss spawn.
                                let getBossData = versusEventMap.spawns.get(channelsToSpawn[0])
    
                                // red team
                                guildDOC.events.versus.red.damage += getBossData.red
                                // blue team
                                guildDOC.events.versus.blue.damage += getBossData.blue
    
                                versusEventMap.spawns.delete(channelsToSpawn[0])
                                console.log(`[VSEVENT-${guildDOC.ID}]: Deleted Bigboss for channel ${channelsToSpawn[0]}`)
                                guildDOC.save().catch(err => console.log(err))
                                msgSent.delete()

                            }, randomEndTime* 1000);
                            return;
                        }

                        // if more than 1, add the free ones in the new array "freeChannels"
                        for (let i = 0; i < channelsToSpawn.length; i++) {
                            if (versusEventMap.spawns.get(channelsToSpawn[i]) == undefined) {
                                freeChannels.push(channelsToSpawn[i])
                                // console.log(`found free channel: ${channelsToSpawn[i]}`)
                            }
                        }
                        
                        // if there is no channel left, return
                        if (freeChannels.length == 0) {
                            console.log(`[VSEVENT-${guildDOC.ID}]: Can't find free channels to spawn.`)
                            return;
                        };
                        // console.log(`found multiple channels`)
                        // let randomSelectedChannel = freeChannels[0]
                        // if (freeChannels.length > 1)
                        let randomSelectedChannel = freeChannels[Math.floor(Math.random() * freeChannels.length)];
                        let randomEndTime = this.getRandomInt(guildDOC.events.versus.settings.durations.bigBoss.min,guildDOC.events.versus.settings.durations.bigBoss.max)
                        let objBoss = {
                            bossType: "bigBoss",
                            start_time: Date.now(),
                            end_time: Date.now() + randomEndTime * 1000,
                            red: 0,
                            blue: 0
                        }
                        versusEventMap.spawns.set(randomSelectedChannel,objBoss)
                        console.log(`[VSEVENT-SPAWN-${guildDOC.ID}]: Spawned a big boss that last ${pms(randomEndTime*1000)} in channel ${randomSelectedChannel}`)
                        //this.client.versusEvent.set(1,versusEventMap)
                        let msgSent = await this.client.guilds.cache.get(guildDOC.ID).channels.cache.get(randomSelectedChannel).send({embeds: [bigBossMessage]})
                        this.client.guilds.cache.get(guildDOC.ID).channels.cache.find(item => item.name == "sharuru-logs").send(`[VSEVENT]: I've spawned a big boss in <#${randomSelectedChannel}>!Duration: ${pms(randomEndTime*1000)}`)
                        setTimeout(() => {
                            
                            // what we do here:
                            // save the data in the server doc and end the boss spawn.
                            let getBossData = versusEventMap.spawns.get(randomSelectedChannel)

                            // red team
                            guildDOC.events.versus.red.damage += getBossData.red
                            // blue team
                            guildDOC.events.versus.blue.damage += getBossData.blue

                            versusEventMap.spawns.delete(randomSelectedChannel)
                            console.log(`[VSEVENT-${guildDOC.ID}]: Deleted Bigboss for channel ${randomSelectedChannel}`)
                            guildDOC.save().catch(err => console.log(err))
                            msgSent.delete()
                        }, randomEndTime* 1000);
                    }

                }, 120000);
                
                this.client.versusEvent.get(2).bigboss.set(guildDOC.ID,timerEvent)
            }
        })
        
        //// mini bosses
        guildSettings.find({},async(err,res) => {
            if (err) {
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
                sendError.create({
                    Guild_Name: `Can't retrieve guildName because it's in error  from the event.`,
                    Guild_ID:  `Can't retrieve guildID because it's in error  from the event.`,
                    User: `Can't retrieve user because it's in error  from the event.`,
                    UserID: `Can't retrieve userid because it's in error  from the event.`,
                    Error: err,
                    Time: `${TheDate} || ${clock} ${amORpm}`,
                    Command: `multi system => one time startup system- VSEVENT`,
                    Args: `Can't retrieve args because it's in error  from the event.`,
                },async (err, res) => {
                    if(err) {
                        console.log(err)
                    }
                    if(res) {
                        console.log(`successfully added error to database from multi system!`)    
                    }
                })
            }
            if (Date.now() > config.event_dates.vs_end) return console.log(`[VSEVENT-event]: The event is over! Not setting up anymore the spawners! (multisystem.js)!`)

            for (const guildDOC of res) {
                //if settings isn't set up
                if (!guildDOC.events.versus.settings) {
                    guildDOC.events.versus.settings = eventSettings
                    console.log(`[VSEVENT-multisystem-${guildDOC.ID}]: Set up guild ${guildDOC.Guild_Name} (${guildDOC.ID}) the versus settings! Skipping to next`)
                    guildDOC.save().catch(err => console.log(err))
                    return;
                }

                if (guildDOC.events.versus.enabled == false) {
                    console.log(`[VSEVENT-multisystem-miniboss]: Event on server ${guildDOC.Guild_Name} (${guildDOC.ID}) is disabled!`)
                    continue;
                }
                console.log(`[VSEVENT]: Enabling VS Event (miniboss edition) for "${guildDOC.Guild_Name}"" server.`)
                let timerEvent = setInterval(async() => {
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

                    const versusEventMap = this.client.versusEvent.get(1);
                    
                    // for searching each date set 
                    for (const timeObj of guildDOC.events.versus.settings.intervals.miniBoss) {
                        let temptime = new Date(2022,7,23,11,30,"00")
                        let dt = new Date();//current Date that gives us current Time also
        
                        let s =  timeObj.starting.split(':');
                        let dt1 = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), parseInt(s[0]), parseInt(s[1]), parseInt(s[2]));
        
                        let e =  timeObj.ending.split(':');
                        let dt2 = new Date(dt.getFullYear(), dt.getMonth(),	dt.getDate(), parseInt(e[0]), parseInt(e[1]), parseInt(e[2]));
        
                        if (dt >= dt1 && dt <= dt2) // if it's 
                            console.log(`[VSEVENT-${guildDOC.ID}]: Time to spawn a miniboss...`,timeObj)
                        else {
                            // console.log(`[VSEV-EVENT-${guildDOC.ID}]: Can't spawn a miniboss bcs not right time `,timeObj)
                            continue;
                        }
                        
                        // creating channel variables
                        let channelsToSpawn = guildDOC.events.versus.channels
                        let freeChannels = []

                        // console.log(`channels in DB:`,channelsToSpawn)

                        // generating chances to spawn and checking with the current amount
                        let getDataFromMaps = versusEventMap.chances.get(guildDOC.ID)
                        if (!getDataFromMaps) getDataFromMaps = 0
                        let chanceToSpawn = this.percentageChance(["yes","no"],[guildDOC.events.versus.settings.chances.miniBoss+getDataFromMaps,100-(guildDOC.events.versus.settings.chances.miniBoss+getDataFromMaps)])

                        // if we spawn, we reset the bonus chance to spawn to 0 in chances and spawn the boss in a random channel. otherwise increase chance
                        if (chanceToSpawn == "no") {
                            getDataFromMaps += guildDOC.events.versus.settings.chances.increaseBy
                            versusEventMap.chances.set(guildDOC.ID,getDataFromMaps)
                            return console.log(`[VSEVENT-SPAWN-MINIBOSS-${guildDOC.ID}]: not spawning, increased chance to ${getDataFromMaps}% (${guildDOC.events.versus.settings.chances.miniBoss+getDataFromMaps}% total)`)
                        }
                        if (chanceToSpawn == "yes") {
                            getDataFromMaps = 0
                            // console.log(`[VSEVENT]: This should be resetted but left for debugging!!! DO NOT FORGET TO SET THE CHANCE TO 0 AFTER GETTING GREENLIGHT\n`)
                            versusEventMap.chances.set(guildDOC.ID,getDataFromMaps) // maybe it saves or not
                            // this.client.versusEvent.set(1,versusEventMap)
                        }

                        //#region check if there is already a boss spawned. This way we do not spawn big bosses/more minibosses than require (1 bigboss, 4 mini)
                        let maxAllowed = 4
                        let maxFound = 0
                        let maxAllowedHIT = false;
                        for(let [key, value] of versusEventMap.spawns) {
                            if (value.bossType == "miniBoss") {
                                maxFound++;
                                console.log(`[VSEVENT-${guildDOC.ID}]: Found a mini boss type spawned in ${key} channel!`)
                            }
                            if (maxFound == maxAllowed) {
                                maxAllowedHIT = true;
                                break;
                            }
                        }

                        if (maxAllowedHIT == true) {
                            console.log(`[VSEVENT-${guildDOC.ID}]: MaxAllowedHIT is on, not spawning anymore the miniboss! Next!\n`)
                            continue;
                        };
                        //#endregion

                        // if we have 1 ch only, use that and get to the chances
                        if (channelsToSpawn.length == 1) {
                            let randomEndTime = this.getRandomInt(guildDOC.events.versus.settings.durations.miniBoss.min,guildDOC.events.versus.settings.durations.miniBoss.max)
                            //  if the channel is in use, return; Continue otherwise.		
                            if (versusEventMap.spawns.get(channelsToSpawn[0]) != undefined) return;
                            let objBoss = {
                                bossType: "miniBoss",
                                start_time: Date.now(),
                                end_time: Date.now() + randomEndTime * 1000,
                                red: 0,
                                blue: 0
                            }
                            versusEventMap.spawns.set(channelsToSpawn[0],objBoss)
                            this.client.versusEvent.set(1,versusEventMap)
                            let msgSent = await this.client.guilds.cache.get(guildDOC.ID).channels.cache.get(channelsToSpawn[0]).send({embeds: [smallBossMessage]})
                            this.client.guilds.cache.get(guildDOC.ID).channels.cache.find(item => item.name == "sharuru-logs").send(`[VSEVENT]: I've spawned a mini boss in <#${channelsToSpawn[0]}>! Duration: ${pms(randomEndTime*1000)}`)
                            console.log(`[VSEVENT-SPAWN-MINIBOSS-${guildDOC.ID}]: Spawned on the only channel available the miniboss in ${guildDOC.Guild_Name} (${guildDOC.ID})`)
                            setTimeout(() => {
                            
                                // what we do here:
                                // save the data in the server doc and end the boss spawn.
                                let getBossData = versusEventMap.spawns.get(channelsToSpawn[0])
    
                                
                                // red team
                                guildDOC.events.versus.red.damage += getBossData.red

                                // blue team
                                guildDOC.events.versus.blue.damage += getBossData.blue
    
                                versusEventMap.spawns.delete(channelsToSpawn[0])
                                console.log(`[VSEVENT-${guildDOC.ID}]: Deleted miniBoss for channel ${channelsToSpawn[0]}`)
                                guildDOC.save().catch(err => console.log(err))
                                msgSent.delete()

                            }, randomEndTime* 1000);
                            return;
                        }

                        // if more than 1, add the free ones in the new array "freeChannels"
                        for (let i = 0; i < channelsToSpawn.length; i++) {
                            if (versusEventMap.spawns.get(channelsToSpawn[i]) == undefined) {
                                freeChannels.push(channelsToSpawn[i])
                                // console.log(`[VSEVENT]: Found free channel: ${channelsToSpawn[i]}`)
                            }
                        }
                        
                        // if there is no channel left, return
                        if (freeChannels.length == 0) {
                            console.log(`[VSEVENT-${guildDOC.ID}]: Can't find free channels to spawn miniboss.`)
                            return;
                        };
                        // console.log(`found multiple channels`)
                        // let randomSelectedChannel = freeChannels[0]
                        // if (freeChannels.length > 1)
                        let randomSelectedChannel = freeChannels[Math.floor(Math.random() * freeChannels.length)];
                        let randomEndTime = this.getRandomInt(guildDOC.events.versus.settings.durations.miniBoss.min,guildDOC.events.versus.settings.durations.miniBoss.max)
                        let objBoss = {
                            bossType: "miniBoss",
                            start_time: Date.now(),
                            end_time: Date.now() + randomEndTime * 1000,
                            red: 0,
                            blue: 0
                        }
                        versusEventMap.spawns.set(randomSelectedChannel,objBoss)
                        console.log(`[VSEVENT-SPAWN-MINIBOSS-${guildDOC.ID}]: Spawned a mini boss that last ${pms(randomEndTime*1000)} in channel ${randomSelectedChannel}`)
                        //this.client.versusEvent.set(1,versusEventMap)
                        let msgSent = await this.client.guilds.cache.get(guildDOC.ID).channels.cache.get(randomSelectedChannel).send({embeds: [smallBossMessage]})
                        this.client.guilds.cache.get(guildDOC.ID).channels.cache.find(item => item.name == "sharuru-logs").send(`[VSEVENT]: I've spawned a mini boss in <#${randomSelectedChannel}>! Duration: ${pms(randomEndTime*1000)}`)
                        setTimeout(() => {
                            
                            // what we do here:
                            // save the data in the server doc and end the boss spawn.
                            let getBossData = versusEventMap.spawns.get(randomSelectedChannel)

                            // red team
                            guildDOC.events.versus.red.damage += getBossData.red

                            // blue team
                            guildDOC.events.versus.blue.damage += getBossData.blue

                            versusEventMap.spawns.delete(randomSelectedChannel)
                            console.log(`[VSEVENT-SPAWN-MINIBOSS-${guildDOC.ID}]: Deleted miniboss for channel ${randomSelectedChannel}`)
                            guildDOC.save().catch(err => console.log(err))
                            msgSent.delete()
                        }, randomEndTime* 1000);
                    }

                }, 20000);
                this.client.versusEvent.get(2).miniboss.set(guildDOC.ID,timerEvent)
            }
        })
            
    }
    arrayShuffle = function(array) {
        for ( let i = 0, length = array.length, swap = 0, temp = ''; i < length; i++ ) {
        swap        = Math.floor(Math.random() * (i + 1));
        temp        = array[swap];
        array[swap] = array[i];
        array[i]    = temp;
        }
        return array;
    };
    percentageChance = function(values, chances) {
        for ( var i = 0, pool = []; i < chances.length; i++ ) {
        for ( let i2 = 0; i2 < chances[i]; i2++ ) {
            pool.push(i);
        }
        }
        return values[this.arrayShuffle(pool)['0']];
    };
    getRandomInt = function(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };
}