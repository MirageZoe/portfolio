const Event = require('../../Structures/Event');
const SharuruEmbed = require('../../Structures/SharuruEmbed');
const guildsettings = require('../../Models/GuildSettings');
const giveawaySys = require('../../Models/giveaways');
const sendError = require('../../Models/Error');
const warningSys = require('../../Models/warns');
const muteSystem = require("../../Models/mutes");
const pms = require('pretty-ms');
const ms = require("ms");
const banSys = require('../../Models/banDocs');

module.exports = class extends Event {

    async run(options) {
        
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
		const logs = this.client.guilds.cache.get(options.gID).channels.cache.find(ch=> ch.name =='sharuru-logs');
        const defaultRules = {
            SHARD: {
                3: {
                    action: `mute`,
                    time: `2h`
                },
                6: {
                    action: `mute`,
                    time: `6h`
                },
                9: {
                    action: `kick`,
                },
                12: {
                    action: `tban`,
                    time: `3d`
                },
                15: {
                    action: `pban`
                }
            },
            FROSTFANG: {
                2: {
                    action: `mute`,
                    time: `6h`
                },
                5: {
                    action: `kick`
                },
                7: {
                    action: `tban`,
                    time: `5d`
                },
                9: {
                    action: `pban`
                }

            },
            BLACKICE: {
                2: {
                    action: `kick`
                },
                3: {
                    action: `pban`
                }
            }
        }
        // console.log(defaultRules.frostfang[1])

        function mute(Culprit, tguild, time, toChannel,ruleID,default_or_custom) {
            let mutedRole = tguild.roles.cache.find(r => r.name === 'muted')
            try {
                if(!mutedRole)
                // Create a mutedRole called "Muted"
                mutedRole = tguild.roles.create({
                        name: 'muted',
                        color: '#000000',
                        permissions: [],
                        reason: `Muted role not found, created!`
                });
                // Prevent the user from sending messages or reacting to messages etc
                tguild.channels.cache.forEach(async (channel, id) => {
                await channel.permissionOverwrites.edit(mutedRole, {
                    SEND_MESSAGES: false,
                    ADD_REACTIONS: false,
                    SEND_TTS_MESSAGES: false,
                    ATTACH_FILES: false,
                    USE_EXTERNAL_EMOJIS: false,
                    CONNECT: false,
                    SPEAK: false
                });
                });
            } catch (e) {
                console.log(e.stack);
                }
                if (Culprit.roles.cache.has(mutedRole.id)) return toChannel.send(`Okay nothing to do here since ${Culprit}'s already muted.`);
                muteSystem.create({
                    Guild_Name: tguild.name,
                    Guild_ID: tguild.id,
                    User: Culprit.username,
                    UserID: Culprit.id,
                    MutedBy: `Rule #${ruleID}`,
                    Time: Date.now() + time,
                    Reason: `Culprit reach the limit of warnings for ${default_or_custom} rule #${ruleID}`,
                    Date: TheDate + " || " + clock + " " + amORpm
                },async (error, res) => {
                    if(error) {
                        sendError.create({
                            Guild_Name: tguild.name,
                            Guild_ID: tguild.id,
                            User: `Warning system`,
                            UserID: `Warning system`,
                            Error: error,
                            Time: `${TheDate} || ${clock} ${amORpm}`,
                            Command: `Warn system generated an error while trying to mute ${Culprit.id} in ${tguild}`,
                            Args: `no args`,
                        },async (err, res) => {
                            if(err) {
                                console.log(err)
                                return toChannel.send(`Unfortunately a problem appeared while trying to mute automatically ${Culprit} for ${pms(time)}. This means they need to be muted manually. If this problem persist, contact my partner!`)
                            }
                            if(res) {
                                console.log(`successfully added error to database!`)
                                return toChannel.send(`Sadly an error appeared while working on my warning system. Please notify my partner!!`).then(m => m.delete({timeout: 5500}))
        
                            }
                        })
                    }
                    if(res) {
                        Culprit.roles.add(mutedRole)
                        console.log(time)
                        toChannel.send(`${Culprit} has been muted for ${pms(time)} because they reach the limit of warnings for ${default_or_custom} rule #${ruleID}`)
                    }
                })
		}//done function

        /**
         * 
         * @param {Object} mentionedUser 
         * @param {Object} theguild 
         * @param {Object} ruleData 
         * @param {Object} logChannel 
         * @param {Database} database 
         * @param {Client} Carla 
         * @param {String} default_or_custom 
         */
        function customPunish(mentionedUser,theguild,ruleData,logChannel,database,Carla,default_or_custom) {
            if (ruleData.action == 'kick') {
                console.log(`Going to kick ${mentionedUser.user.username} (${mentionedUser.user.id}) from ${mentionedUser.guild.name} (${mentionedUser.id})`)
                mentionedUser.kick(`Custom rule limit reached. Rule #${ruleData.id}`).then(()=>{
                    logChannel.send(`I have kicked ${mentionedUser} because he reached a limit of a ${default_or_custom} rule! (#${ruleData.id})`)
                }).catch(erro=>{
                    logChannel.send(`Unfortunately I couldn't kick ${mentionedUser}.`)
                    console.log(erro)
                })
            }
            if (ruleData.action == "tban") {
                mentionedUser.ban({reason: `${default_or_custom} rule limit reached. Rule #${ruleData.id}`,days: 7}).then(()=>{
                    logChannel.send(`I have banned temporary ${mentionedUser} for ${pms(ruleData.time)} because he reached a limit of a ${default_or_custom} rule! (#${ruleData.id})`)
                    console.log(mentionedUser)
                    banSys.create({
                        guild_Name: theguild.name,
                        guild_ID: theguild.id,
                        user: mentionedUser.user.username,
                        userID: mentionedUser.id,
                        bannedBy: `Sharuru - rule ${ruleData.id} `,
                        bannedByID: Carla.user.id,
                        reason: `banned ${mentionedUser.id} because they reached the warning limit of a ${default_or_custom} rule! (#${ruleData.id}) `,
                        time: ruleData.time
                    },(err,res)=>{
                        if (err) {
                            sendError.create({
                                Guild_Name: theguild.name,
                                Guild_ID: theguild.id,
                                User: `Sharuru`,
                                UserID: Carla.user.id,
                                Error: err,
                                Time: `${TheDate} at ${clock} ${amORpm}`,
                                Command: this.name + " temp ban option - warn system event",
                                Args: `NO ARGS IN EVENT FILE`,
                            },async(erro,resu)=>{
                                if(erro) {
                                    console.log(erro)
                                }
                                if(resu) {
                                    console.log(`Error sent to database!`)
                                    return logChannel.send(`Aw, a problem appeared while trying to process the punishment in warning system. Please try again later and if this persist, please report it to my partner! ERROR_#S4`)
                                }
                            })
                        }
                        if(res){
                            console.log(`[BanSystem : ${TheDate} | ${clock} ${amORpm}] Doc created sucessfully in guild "${theguild.name} (${theguild.id})" for ${mentionedUser.user.username} (${mentionedUser.id})`)
                        }
                    })
                }).catch(erro=>{
                    logChannel.send(`Unfortunately I couldn't ban ${mentionedUser}.`)
                    console.log(erro)
                })
            }
            if (ruleData.action == "pban") {
                mentionedUser.ban({reason: `${default_or_custom} rule limit reached. Rule #${ruleData.id}`,days: 7}).then(()=>{
                    logChannel.send(`I have banned ${mentionedUser} because he reached a limit of a ${default_or_custom} rule! (#${ruleData.id})`)
                }).catch(erro=>{
                    logChannel.send(`Unfortunately I couldn't ban ${mentionedUser}.`)
                    console.log(erro)
                })
            }
            if (ruleData.action == "mute") {
                if(isNaN(ruleData.time)) ruleData.time = ms(ruleData.time)
                mute(mentionedUser,theguild,ruleData.time,logChannel,ruleData.id,default_or_custom)
            }
            if (ruleData.action == "striproles") {
                let memberRoles = mentionedUser.roles.cache.map(role => role.id.toString()).slice(0, -1);
                for(let i = 0; i<memberRoles.length;i++) {
                    try {
                        mentionedUser.roles.remove(memberRoles[i])
                    } catch (error) {
                        logChannel.send(`Unfortunately I couldn't remove this role from ${mentionedUser}:\n\n- ${memberRoles[i]}`)
                        console.log(error)
                    }
                }
                logChannel.send(`I tried to strip ${mentionedUser} of all roles since this is the punishment given by a ${default_or_custom} rule #${ruleData.id}.\nIf the member wasn't someone with administrator permission or someone that is higher role than me then I successfully stripped this member of the all roles. Otherwise, I couldn't remove any role since I have not enough permissions to do that.`)
            }
            if (ruleData.action == 'giveawayban') {
                if(!database.raffleSettings.bans.includes(mentionedUser.user.id)) {
                    database.raffleSettings.bans.push(mentionedUser.user.id)
                    database.save().catch(err=>console.log(err))
                    logChannel.send(`[Warning system]I have banned ${mentionedUser} from entering any future giveaways **but** not from current ones because he reached a limit of a ${default_or_custom} rule! You will have to ban them manually for active giveaways. If you wish to do that then please type \n\n"***${Carla.prefixes.get(options.gID)}raffle ban ${mentionedUser}***"\n\n Trying to ban again someone that is banned will unban them.`)
                }else {
                    logChannel.send(`This member, ${mentionedUser}, was already banned from future giveaways so nothing will happen.`)
                }
            }
        }

        // return
        guildsettings.findOne({
            ID: options.gID
        },(err,res)=>{
            if (err) {
                sendError.create({
                    Guild_Name: options.gName,
                    Guild_ID: options.gID,
                    User: options.author.tag,
                    UserID: options.author.id,
                    Error: err,
                    Time: `${TheDate} || ${clock} ${amORpm}`,
                    Command:`warn system`,
                    Args: args,
                },async (err, ress) => {
                    if(err) {
                        console.log(err)
                        return logs.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                    }
                    if(ress) {
                        console.log(`successfully added error to database!`)
                        return logs.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                    }
                })
            }
            if(res){
                if(res.customWarns.enabled == true) {//if the custom system is enabled, apply those things
                    console.log(`custom rules used`)
                    warningSys.find({
                        userID: options.uID,
                        caseType: options.wtype
                    },(err,wSys)=>{
                        if (err) {
                            sendError.create({
                                Guild_Name: options.gName,
                                Guild_ID: options.gID,
                                User: options.author.tag,
                                UserID: options.author.id,
                                Error: err,
                                Time: `${TheDate} || ${clock} ${amORpm}`,
                                Command:`warn system - custom warn system`,
                                Args: args,
                            },async (err, ress) => {
                                if(err) {
                                    console.log(err)
                                    return logs.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                }
                                if(ress) {
                                    console.log(`successfully added error to database!`)
                                    return logs.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                }
                            })
                        }
                        if(wSys) {
                            let amountOfWwarnings = wSys.length;
                            let availableWarnings = []
                            for(let i = 0; i < res.customWarns.warns.length; i++) {
                                if(res.customWarns.warns[i].type.toLowerCase() == options.wtype.toLowerCase()) {
                                    availableWarnings.push(res.customWarns.warns[i])
                                }
                            }
                            setTimeout(() => {
                                let chosenRule;
                                for(let i = 0; i < availableWarnings.length; i++){
                                    if(availableWarnings[i].number == amountOfWwarnings) {
                                        console.log(`[${options.wtype}]He's getting punished for this rule:`)
                                        console.log(res.customWarns.warns[i])
                                        chosenRule = res.customWarns.warns[i];
                                    }
                                }
                                //starting the job
                                //first fetching the member if it's still in the guild & getting the guild object
                                if(!chosenRule) return console.log(`No rule matched. Doing nothing now.`)
                                let myGuild = this.client.guilds.cache.get(options.gID)
                                let myMember = myGuild.members.cache.get(options.uID)
                                if(myMember) { // now we are letting our custom function do it's job
                                    customPunish(myMember,myGuild,chosenRule,logs,res,this.client,`custom`)
                                } else {
                                    console.log(`This member ${options.uID} (${options.gID}), isn't anymore in the guild!`);
                                }
                            }, 200);
                        }
                    })//end of searching the user warned
                } else { // if it's not enabled, use default ones
                    console.log(`default rules used`);
                    warningSys.find({
                        userID: options.uID,
                        caseType: options.wtype
                    },(err,res)=>{
                        if (err) {
                            sendError.create({
                                Guild_Name: options.gName,
                                Guild_ID: options.gID,
                                User: options.author.tag,
                                UserID: options.author.id,
                                Error: err,
                                Time: `${TheDate} || ${clock} ${amORpm}`,
                                Command:`warn system - default warn system`,
                                Args: args,
                            },async (err, ress) => {
                                if(err) {
                                    console.log(err)
                                    return logs.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                }
                                if(ress) {
                                    console.log(`successfully added error to database!`)
                                    return logs.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                }
                            })
                        }
                        if(res){
                            let amountOfWwarnings = res.length;
                            let chosenRule = null;
                            for(let punish in defaultRules[options.wtype]){
                                if(punish == amountOfWwarnings){
                                    chosenRule = defaultRules[options.wtype][punish]
                                    chosenRule.id = punish
                                    console.log(`Default rule type: ${options.wtype}, Rule #${amountOfWwarnings}:\nAction: ${chosenRule.action}\n${chosenRule.time ? `Time: ${chosenRule.time}`: ""}`)
                                }
                            }
                            setTimeout(() => {
                                //starting the job
                                //first fetching the member if it's still in the guild & getting the guild object
                                if(chosenRule == undefined || chosenRule == null) return console.log(`No rule matched. Doing nothing now.`)
                                let myGuild = this.client.guilds.cache.get(options.gID)
                                let myMember = myGuild.members.cache.get(options.uID)
                                if(myMember) { // now we are letting our custom function do it's job
                                    customPunish(myMember,myGuild,chosenRule,logs,res,this.client,`default`)
                                } else {
                                    console.log(`This member ${options.uID} (${options.gID}), isn't anymore in the guild!`);
                                }
                            }, 200);
                        }
                    })
                }
            }
        })
    }
}