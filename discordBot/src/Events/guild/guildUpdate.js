const Event = require('../../Structures/Event');
const SharuruEmbed = require('../../Structures/SharuruEmbed');
const guildSettings = require('../../Models/GuildSettings');
const dod = require("deep-object-diff")
const _ = require("lodash")

module.exports = class extends Event {

    async run(oldGuild,newGuild) {
        
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
    let userlogs = oldGuild.channels.cache.find(ch => ch.name == 'sharuru-logs')

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
    //autorole module
    guildSettings.findOne({
        ID: oldGuild.id
    },async (error,results)=>{
        if(error){
            sendError.create({
                Guild_Name: newGuild.name,
                Guild_ID: newGuild.id,
                User: `guildUpdate`,
                UserID: `guildUpdate`,
                Error: error,
                Time: `${TheDate} || ${clock} ${amORpm}`,
                Command: this.name,
                Args: `no args`,
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
        // server logs when someone joins
        if(results.logs.guild === true){

            const detdiff = dod.detailedDiff(oldGuild,newGuild)
            const diff = getObjectDiff(oldGuild,newGuild)
            console.log(detdiff)
            console.log(diff)

            // console.log(oldGuild)
            // if(mysize(detdiff.added) == 0 || mysize(detdiff.deleted) == 0 || mysize(detdiff.updated) == 0) return

            // const embed = new SharuruEmbed()
            //     .setAuthor(`Member Updated!`)
            //     .setColor(`Random`)
            //     .setThumbnail(newGuild.user.displayAvatarURL())
            //     .setDescription(
            //         `**❯ Member name:** ${newGuild.nickname ?? newGuild.user.username} (${newGuild.user.id})
            //         **❯ Changed:** ${possibleChanges[diff] ? possibleChanges[diff] : `Unknown`}
            //         **❯ Previously:** ${oldGuild[diff]}
            //         **❯ Now:** ${newGuild[diff]}
            //         \n\nP.S: null => nothing\n`
            //     )
                const channelLog = oldGuild.guild.channels.cache.find(ch => ch.name === 'sharuru-logs');
                if (channelLog) channelLog.send("This feature, \`server logs\`, is still in developing! please check it later!");
        }
    })

    }// end of command
}