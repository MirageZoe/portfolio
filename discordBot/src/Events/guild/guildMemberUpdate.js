const Event = require('../../Structures/Event');
const SharuruEmbed = require('../../Structures/SharuruEmbed');
const guildSettings = require('../../Models/GuildSettings');
const dod = require("deep-object-diff")
const _ = require("lodash");
const profiles = require('../../Models/profiles');
const sendError = require("../../Models/Error")

module.exports = class extends Event {

    async run(oldMember,newMember) {
        
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
    const logChannel = oldMember.guild.channels.cache.find(ch => ch.name == 'sharuru-logs')

    function getObjectDiff(obj1, obj2) {
        const diff = Object.keys(obj1).reduce((result, key) => {
            if (!obj2.hasOwnProperty(key)) {
                result.push(key);
            } else if (_.isEqual(obj1[key], obj2[key])) {
                const resultKeyIndex = result.indexOf(key);
                result.splice(resultKeyIndex, 1);
            }
            return result;
        }, Object.keys(obj2));

        return diff;
    }
    function mysize(obj) {
        let size = 0,key;
        for (key in obj) {
          if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    };
    const uflags = {
        DISCORD_EMPLOYEE: `Discord staff`,
        PARTNERED_SERVER_OWNER: `Server Partner`,
        DISCORD_PARTNER: `Discord Partner`,
        HYPESQUAD_EVENTS: `HypeSquad Event Organizer`,
        BUGHUNTER_LEVEL_1: `Bug Hunter 1`,
        HOUSE_BRAVERY: `House of Bravery`,
        HOUSE_BRILLIANCE: `House of Brilliance`,
        HOUSE_BALANCE: `House of Balance`,
        EARLY_SUPPORTER: `Early Suporter`,
        TEAM_USER: `Team user`,
        SYSTEM: `System`,
        BUGHUNTER_LEVEL_2: `Bug Hunter 2`,
        VERIFIED_BOT: `Verified bot!`,
        EARLY_VERIFIED_BOT_DEVELOPER: `Early verified bot developer`,
        VERIFIED_DEVELOPER: `Verified developer`,
    
    }
    const possibleChanges ={
        nickname: `Nick`,
        username: `Name`,
        discriminator: `Discord tag (e.g: #0000)`,
        avatar: `Profile Picture`,
        flags: `Badges`,
        _roles: `Roles`,
    }
    function checkWhat(oldState,newState,diff,stopOldDisplay,change){
        if(diff == `_roles`){
            let returnRoles = ``
            let oldLen = oldState[diff]
            let newLen = newState[diff]
            if(stopOldDisplay !== true) return `Check below.`
            if(mysize(change.added) > 0){
                for (let i = 0; i < newLen.length; i++) {
                    if(oldLen.includes(newLen[i])){
                        returnRoles += `\n- <@&${newLen[i]}>`
                    }else{
                        returnRoles += `\n**[New]** __ <@&${newLen[i]}>__`
                    }
                }
            }else if (mysize(change.deleted) > 0){
                for (let i = 0; i < oldLen.length; i++) {
                    // if(newLen[i] == undefined) continue
                    oldLen = oldLen.sort((a, b) => a-b)
                    if(newLen.includes(oldLen[i])){
                        returnRoles += `\n- <@&${oldLen[i]}>`
                    }else{
                        returnRoles += `\n**[Removed]** __ <@&${oldLen[i]}>__`
                    }
                }
            }
            return returnRoles;
        }
        if (diff == `nickname`) {
            if (stopOldDisplay) return newState[diff]
            return oldState[diff]
        }
        return newState[diff]
    }
    //serverlogs module
    guildSettings.findOne({
        ID: oldMember.guild.id
    },async (error,results)=>{
        if(error){
            sendError.create({
                Guild_Name: newMember.guild.name,
                Guild_ID: newMember.guild.id,
                User: `guildMemberUpdate`,
                UserID: newMember.user.id,
                Error: error,
                Time: `${TheDate} || ${clock} ${amORpm}`,
                Command: this.name,
                Args: `no args in event`,
            },async (err2, res2) => {
                if(err2) {
                    console.log(err2)
                    return userlogs.send(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                }
                if(res2) {
                    console.log(`successfully added error to database!`)
                }
            })
        }
        // server logs when a member is updated
        if(results.logs.guild == true){
            const detdiff = dod.detailedDiff(oldMember,newMember)
            const diff = getObjectDiff(oldMember,newMember)
            // console.log(detdiff)
            // console.log(diff)
            // console.log(mysize(detdiff.added))
            // console.log(mysize(detdiff.updated))
            // console.log(mysize(detdiff.deleted))
            if(mysize(detdiff.added) == 0 && mysize(detdiff.deleted) == 0 && mysize(detdiff.updated) == 0) return console.log(`[Server-logs#${oldMember.guild.id}]: Nothing to report`)
            const embed = new SharuruEmbed()
                .setAuthor(`Member Updated!`)
                .setColor(`Random`)
                .setThumbnail(newMember.user.displayAvatarURL())
                .setDescription(
                    `**❯ Member name:** ${newMember.nickname ?? newMember.user.username} (${newMember.user.id})
                    **❯ Changed:** ${possibleChanges[diff]}
                    **❯ Previously:** ${checkWhat(oldMember,newMember,diff,false,detdiff)}
                    **❯ Now:** ${checkWhat(oldMember,newMember,diff,true,detdiff)}
                    \n\nP.S: null => nothing\n`
                )
                if (logChannel) logChannel.send({embeds: [embed]});
        }

        // versus event
        const diff = getObjectDiff(oldMember,newMember)
        // console.log(diff)
        if (diff != "nickname") return;

        profiles.findOne({
            userID: oldMember.user.id
        },async(err,res)=>{
            if (err) {
                sendError.create({
                    Guild_Name: oldMember.guild.name,
                    Guild_ID:  oldMember.guild.id,
                    User: oldMember.user.username,
                    UserID: oldMember.user.id,
                    Error: err,
                    Time: `${TheDate} || ${clock} ${amORpm}`,
                    Command: `guildMemberUpdate- Versus Event`,
                    Args: `Can't retrieve args because it's in error form "guild member update" event.`,
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
                // verifying if user new nick matches the event one
                if (newMember.nickname.toLowerCase() != res.events.versus.missions.nickname.toLowerCase()) return console.log(`[Versus Event-Nickname # ${TheDate}-${clock} ${amORpm}]: ${newMember.user.username} (${newMember.user.id}) nickname doesn't match the one from the mission.`)
                // gather event data & find the mission by id
                let eventData = res.events.versus;
                let getMissionData = eventData.missions.list.find(item => item.id == 3)
                // console.log(`event data;`,eventData.missions.list)
                // console.log(`what I got:`,getMissionData)

                // if the mission is completed already, return
                if (getMissionData.completed == true) return console.log(`[Versus Event-Nickname # ${TheDate}-${clock} ${amORpm}]: User ${newMember.user.username} (${newMember.user.id}) completed this mission already!`)

                // complete the mission & add the damage points to our player
                getMissionData.finished++;
                if (getMissionData.finished >= getMissionData.perDay) getMissionData.completed = true;
                eventData.tickets += getMissionData.reward
                for (let i = 0; i < eventData.missions.list.length; i++) {
                    if (eventData.missions.list[i].id == 3)
                        eventData.missions.list[i] = getMissionData
                }

                // res.events.versus = eventData
                console.log(`[Versus Event-Nickname # ${TheDate}-${clock} ${amORpm}]: User ${newMember.user.username} (${newMember.user.id}) completed nickname mission!`)
                profiles.updateOne({
                    'userID': `${newMember.user.id}`
                },{'$set':{ 'events.versus' : eventData}},(erro,reso)=>{
                    if (erro) {
                        sendError.create({
                            Guild_Name: newMember.guild.name,
                            Guild_ID: newMember.guild.id,
                            User: newMember.user.username,
                            UserID: newMember.user.id,
                            Error: erro,
                            Time: `${TheDate} || ${clock} ${amORpm}`,
                            Command: this.name + `, update vsEV MISSION LIST -nick `,
                            Args: `no args bcs event`,
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
                        console.log(`[VersusEvent-Missions]: Successfully Updated ${newMember.user.username} (${newMember.user.id}) mission list (nick).`)
                    }
                });
            }
        })
    })

    }// end of command
}