const Event = require('../../Structures/Event');
const SharuruEmbed = require('../../Structures/SharuruEmbed');
const GuildSettings = require('../../Models/GuildSettings');
const liveSystem = require("../../Models/liveSystem")
const sendError = require('../../Models/Error');
const concat = require('concat-stream');
const moment = require("moment");
const toml = require('toml');
const path = require('path');
const fs = require("fs")
const config = require('../../../config.json');

module.exports = class extends Event {

    async run() {
        
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
            console.log(`[${TheDate} || ${clock} ${amORpm}] Checking stream records...`)
            let userlogs = this.client.guilds.cache.get(config.myGuilds.main_guild).channels.cache.get(config.myGuilds.main_channel);
            const sharuru = this.client
            function sendRegulary(theClient) {
                let streamMAP = theClient.livestreams
                let streamKEYS = Array.from(streamMAP.keys());
                for (let i = 0; i < streamKEYS.length; i++) {
                    let thisMap = streamMAP.get(streamKEYS[i])
                    if(thisMap.length > 0) {
                        for (let ii = 0; ii < thisMap.length; ii++) {
                            console.log(`Checking ${thisMap[ii].namae}...`)
                            // console.log(thisMap[ii])
                            let sendCheck = true;
                            if (thisMap[ii].embed == null) sendCheck = false;
                            if (thisMap[ii].namae == null) sendCheck = false;
                            if (thisMap[ii].channel == null) sendCheck = false;
                            if (sendCheck == true) {
                                console.log(`This stream Obj (${thisMap[ii].namae}) is alright! Sending it!`)
                                thisMap[ii].channel.send({embeds: [thisMap[ii].embed]})
                                thisMap.shift()
                                ii--;
                                theClient.livestreams.set(streamKEYS[i],thisMap)
                            } else {
                                console.log(`this embed: ${thisMap[ii].namae} is not having a channel, embed or embed.description...`)
                                thisMap.shift()
                                ii--;
                                theClient.livestreams.set(streamKEYS[i],thisMap)
                            }
                        }
                    }
                }
            }
            const getScript = (url) => {
                return new Promise((resolve, reject) => {
                    const http      = require('http'),
                          https     = require('https');
            
                    let client = http;
            
                    if (url.toString().indexOf("https") === 0) {
                        client = https;
                    }
            
                    client.get(url, (resp) => {
                        let data = '';
            
                        // A chunk of data has been recieved.
                        resp.on('data', (chunk) => {
                            data += chunk;
                        });
            
                        // The whole response has been received. Print out the result.
                        resp.on('end', () => {
                            resolve(data);
                        });
            
                    }).on("error", (err) => {
                        reject(err);
                    });
                });
            };
            liveSystem.find({},(err,res)=>{
                if(err){
                    sendError.create({
                        Guild_Name: `Couldn't retrieve because it's an event`,
                        Guild_ID: `Couldn't retrieve because it's an event`,
                        User: `Couldn't retrieve because it's an event`,
                        UserID: `Couldn't retrieve because it's an event`,
                        Error: err,
                        Time: `${TheDate} || ${clock} ${amORpm}`,
                        Command: `guildStreamCheck`,
                    },async (err2, res2) => {
                        if(err2) {
                            console.log(err2)
                            return userlogs.send(`Unfortunately an problem appeared in live system. If this problem persist, contact my partner!`)
                        }
                        if(res2) {
                            console.log(`successfully added error to database!`)
                        }
                    })
                }
                if(res){
                    for(let i = 0; i < res.length; i++){
                        let thisGuild = res[i].guild_ID;
                        userlogs = this.client.guilds.cache.get(thisGuild).channels.cache.find(ch => ch.name == 'sharuru-logs') ? this.client.guilds.cache.get(thisGuild).channels.cache.find(ch => ch.name == 'sharuru-logs') : this.client.guilds.cache.get(thisGuild).channels.cache.get(this.client.guilds.cache.get(thisGuild).systemChannelID); 
                        let thisStreamer = res[i].streamer
                        let chID = res[i].streamerID
                        let database_isLive = res[i].isNowLive;
                        let thisStreamerYTMODE = res[i].streamerYTMode
                        let streamOBJ = {
                            embed: null,
                            namae: null,
                            channel: null,
                        }
                            if(res[i].streamerType == `twitch`){
                                let streamEmbed = new SharuruEmbed()
                                GuildSettings.findOne({
                                    ID: thisGuild
                                },(err,resCheck)=>{
                                    if(err){
                                        sendError.create({
                                            Guild_Name: `Couldn't retrieve because it's an event`,
                                            Guild_ID: `Couldn't retrieve because it's an event`,
                                            User: `Couldn't retrieve because it's an event`,
                                            UserID: `Couldn't retrieve because it's an event`,
                                            Error: err,
                                            Time: `${TheDate} || ${clock} ${amORpm}`,
                                            Command: `guildStreamCheck`,
                                        },async (err2, res2) => {
                                            if(err2) {
                                                console.log(err2)
                                                return userlogs.send(`Unfortunately an problem appeared in live system. If this problem persist, contact my partner!`)
                                            }
                                            if(res2) {
                                                console.log(`successfully added error to database!`)
                                            }
                                        })
                                    }
                                    if(resCheck){
                                        if (resCheck.systems.livestream.enableTW == false) return //console.log(`[Livestream]: Guild ${this.client.guilds.cache.get(thisGuild).name} (${this.client.guilds.cache.get(thisGuild).id}) has twitch feature off. No send.`)
                                        fs.createReadStream('./src/Assets/minData.toml','utf8').pipe(concat((data) =>{
                                            let parsed = toml.parse(data);
                                            let client_id = parsed.twitch_client_id;
                                            let client_secret = parsed.twitch_client_secret;
                                            let bearer_token = parsed.twitch_bearer_token;
                                            fetch(`https://api.twitch.tv/helix/search/channels?query=${thisStreamer}`, {
                                            method: 'GET',
                                            headers: {
                                                'Client-ID': client_id,
                                                'Authorization': 'Bearer ' + bearer_token
                                            }
                                        })
                                        .then(res2 => res2.json())
                                        .then(resp => {
                                            let myData = resp[`data`].filter(obj => obj.broadcaster_login == thisStreamer.toLowerCase())
                                            myData = myData[0]
                                            if(myData == undefined) return console.log(`some random undefined:`,myData)
                                            // console.log(myData)
                                            streamEmbed.setAuthor(`Streamer: ${this.client.utils.capitalise(myData.display_name)}`,`https://cdn.discordapp.com/attachments/768885595228864513/804839366819577866/1593628073916.png`)
                                            .setThumbnail(myData.thumbnail_url)
                                            .setFooter(`ALL CREDITS FOR MATERIALS ARE GOING TO THEIR RESPECTIVE OWNERS!`)
                                            .setTimestamp()
                                            .setColor(myData.is_live ? `PURPLE` : `GRAY`)
                                            if(myData.is_live == true && database_isLive == true) return console.log(`[Twitch] ${thisStreamer} is live but I sent already the message, ignoring...`)
                                            if(myData.is_live == false && database_isLive == false) return console.log(`[Twitch] ${thisStreamer} is offline and so my db is, ignoring...`)
                                            if(myData.is_live == true && database_isLive == false){
                                                streamEmbed.setDescription(
                                                    `🔴 ${this.client.utils.capitalise(myData.display_name)} is **now live on [Twitch](https://www.twitch.tv/${myData.display_name})**!
                                                    **Title:** ${myData.title}\n**Started on:** ${moment(myData.started_at).format(`dddd, MMM Do YYYY, h:mm:ss a`)} *(${moment(myData.started_at).fromNow()})*`
                                                    )
                                                streamOBJ.embed = streamEmbed
                                                res[i].isNowLive = true
                                                res[i].save().catch(err=>console.log(err))
                                                if (resCheck.systems.livestream.channel != '0'){
                                                    let checkChannel = this.client.guilds.cache.get(thisGuild).channels.cache.find(ch=> ch.id == resCheck.systems.livestream.channel)
                                                    const logs = this.client.guilds.cache.get(thisGuild).channels.cache.find(channel => channel.name === "sharuru-logs");
                                                    let prefix = this.client.prefixes.get(thisGuild)
                                                    if(checkChannel){
                                                        streamOBJ.channel = checkChannel
                                                        let streamMAP = this.client.livestreams.get(thisGuild)
                                                        if (!streamMAP) streamMAP = []
                                                        if (!streamMAP.find(st => st.namae == streamOBJ.namae) && streamOBJ.embed !== null) {
                                                            streamMAP.push(streamOBJ)
                                                            this.client.livestreams.set(thisGuild,streamMAP)
                                                        }
                                                    } else {
                                                        logs.send(`A Streamer (${thisStreamer}) went live but I couldn't send the message because a channel for streams was not set up.\nPlease do so by typing \`${prefix}livestream channel <#mention channel>\``)
                                                    }
                                                }
                                            }
                                            if(myData.is_live == false && database_isLive == true) {
                                                streamEmbed.setDescription(`🌑 ${this.client.utils.capitalise(myData.display_name)} is **not live anymore**.\n`)
                                                streamOBJ.embed = streamEmbed
                                                res[i].isNowLive = false
                                                res[i].time = clock +" | "+ amORpm
                                                res[i].date = TheDate
                                                res[i].save().catch(err=>console.log(err))
                                                if (resCheck.systems.livestream.channel != '0'){
                                                    let checkChannel = this.client.guilds.cache.get(thisGuild).channels.cache.find(ch=> ch.id == resCheck.systems.livestream.channel)
                                                    const logs = this.client.guilds.cache.get(thisGuild).channels.cache.find(channel => channel.name === "sharuru-logs");
                                                    let prefix = this.client.prefixes.get(thisGuild)
                                                    if(checkChannel){
                                                        streamOBJ.channel = checkChannel
                                                        let streamMAP = this.client.livestreams.get(thisGuild)
                                                        if (!streamMAP) streamMAP = []
                                                        if (!streamMAP.find(st => st.namae == streamOBJ.namae) && streamOBJ.embed !== null) {
                                                            streamMAP.push(streamOBJ)
                                                            this.client.livestreams.set(thisGuild,streamMAP)
                                                        }
                                                    } else {
                                                        logs.send(`A Streamer (${thisStreamer}) went live but I couldn't send the message because a channel for streams was not set up.\nPlease do so by typing \`${prefix}livestream channel <#mention channel>\``)
                                                    }
                                                }
                                            }
                                            streamOBJ.namae = myData.display_name
                                        });
                                        }));
                                    }
                                })
                            } else {
                                let streamEmbed = new SharuruEmbed()
                                    .setFooter({text:`Latest lives with Sharuru!`})
                                GuildSettings.findOne({
                                    ID: thisGuild
                                },async(err,resCheck)=>{
                                    if(err){
                                        sendError.create({
                                            Guild_Name: `Couldn't retrieve because it's an event`,
                                            Guild_ID: `Couldn't retrieve because it's an event`,
                                            User: `Couldn't retrieve because it's an event`,
                                            UserID: `Couldn't retrieve because it's an event`,
                                            Error: err,
                                            Time: `${TheDate} || ${clock} ${amORpm}`,
                                            Command: `guildStreamCheck`,
                                        },async (err2, res2) => {
                                            if(err2) {
                                                console.log(err2)
                                                return userlogs.send(`Unfortunately an problem appeared in live system. If this problem persist, contact my partner!`)
                                            }
                                            if(res2) {
                                                console.log(`successfully added error to database!`)
                                            }
                                        })
                                    }
                                    if(resCheck){
                                        if (resCheck.systems.livestream.enableYT == false) return //console.log(`[Livestream]: Guild ${this.client.guilds.cache.get(thisGuild).name} (${this.client.guilds.cache.get(thisGuild).id}) has yt feature off. No send.`)
                                        let myYtLink = `https://www.youtube.com/`
                                        if(thisStreamerYTMODE == 'channel'){
                                            myYtLink += `channel/${res[i].streamerID}`
                                        } else {
                                            myYtLink += `c/${res[i].streamer}`
                                        }
                                        getScript(myYtLink).then(r=>{//"channelId":"UCN1XO2_eZhxv7lJjAXSfxRw","title":
                                        // fs.writeFile("src\\Assets\\test2.txt",r,(err) =>{
                                        //     if(err) console.log(err)
                                        // })
                                        let islive = false;
                                        let getNamePos = r.indexOf(`"channelId":"${chID}","title":`)
                                        let streamerName = r.substring(getNamePos+48,r.indexOf(`"`,getNamePos+49))

                                        let getPicPos = r.indexOf(`,"width":48,"height":48},{"url":`)
                                        let streamerPic = r.substring(getPicPos + 33, r.indexOf(`"`,getPicPos+34))

                                        let getTitlePos = r.indexOf(`,"width":336,"height":188}]},"title":{"runs":[{"text":"`)
                                        let streamerTitle = r.substring(getTitlePos+55, r.indexOf(`"}]`,getTitlePos+56))
                                        let streamerLink = myYtLink + "/live"
                                            streamEmbed.setAuthor(`Streamer: ${streamerName}`,`https://media.discordapp.net/attachments/768885595228864513/805953643987337216/63UVUbGgLqAAAAAElFTkSuQmCC.png`)
                                            .setThumbnail(streamerPic)
                                            .setTimestamp()
                                        // if(thisStreamerYTMODE == 'c'){
                                        //     streamerName = chID
                                        // }
                                        if(streamerTitle.length > 70) streamerTitle = `${streamerName}'s live now! Come and check it out!`
                                        
                                        if(r.includes('{"text":"LIVE"}')) islive = true

                                        // console.log(`${streamerName} is live?: ${islive}`)
                                        if(islive == true && database_isLive == true) return console.log(`[Youtube] ${thisStreamer} is live but I sent already the message, ignoring...`)
                                        if(islive == false && database_isLive == false) return console.log(`[Youtube] ${thisStreamer} is offline and so my db is, ignoring...`)
                                        if(islive == true && database_isLive == false){
                                            streamEmbed.setColor(`RED`)
                                            .setDescription(`🔴 ${streamerName} is ${islive ? `**now live on [Youtube](${streamerLink})**!\n` : `**not live anymore.**`}
                                                ${streamerTitle}
                                                ${islive ? `**Link:** **[Click here to join!](${streamerLink})**` : ``}`)
                                            streamOBJ.embed = streamEmbed
                                            res[i].isNowLive = true
                                            res[i].save().catch(err=>console.log(err))
                                            const logs = this.client.guilds.cache.get(thisGuild).channels.cache.find(channel => channel.name === "sharuru-logs");
                                        if(resCheck.systems.livestream.channel != `0`){
                                            let checkChannel = this.client.guilds.cache.get(thisGuild).channels.cache.find(ch=> ch.id == resCheck.systems.livestream.channel)
                                            let prefix = this.client.prefixes.get(thisGuild)
                                            if (checkChannel) {
                                                streamOBJ.channel = checkChannel;
                                                streamOBJ.namae = thisStreamer;
                                                let streamMAP = this.client.livestreams.get(thisGuild)
                                                if (!streamMAP) streamMAP = []
                                                if (!streamMAP.find(st => st.namae == streamOBJ.namae) && streamOBJ.embed !== null) {
                                                    streamMAP.push(streamOBJ)
                                                    this.client.livestreams.set(thisGuild,streamMAP)
                                                }
                                            } else {
                                                logs.send(`A Streamer (${thisStreamer}) went live but I couldn't send the message because a channel for streams was not set up.\nPlease do so by typing \`${prefix}livestream channel <#mention channel>\``)
                                            }
                                        } else {
                                            logs.send(`A Streamer (${thisStreamer}) went live but I couldn't send the message because a channel for streams was not set up.\nPlease do so by typing \`${prefix}livestream channel <#mention channel>\``)
                                        }
                                        }
                                        if(islive == false && database_isLive == true) {
                                            streamEmbed.setColor(`GREY`)
                                            .setDescription(`🌑 ${this.client.utils.capitalise(streamerName)} is **not live anymore**.\n`)
                                            streamOBJ.embed = streamEmbed
                                            res[i].isNowLive = false
                                            res[i].time = clock +" | "+ amORpm
                                            res[i].date = TheDate
                                            res[i].save().catch(err=>console.log(err))
                                            const logs = this.client.guilds.cache.get(thisGuild).channels.cache.find(channel => channel.name === "sharuru-logs");
                                        if(resCheck.systems.livestream.channel != `0`){
                                            let checkChannel = this.client.guilds.cache.get(thisGuild).channels.cache.find(ch=> ch.id == resCheck.systems.livestream.channel)
                                            let prefix = this.client.prefixes.get(thisGuild)
                                            if (checkChannel) {
                                                streamOBJ.channel = checkChannel;
                                                streamOBJ.namae = thisStreamer;
                                                let streamMAP = this.client.livestreams.get(thisGuild)
                                                if (!streamMAP) streamMAP = []
                                                if (!streamMAP.find(st => st.namae == streamOBJ.namae) && streamOBJ.embed !== null) {
                                                    streamMAP.push(streamOBJ)
                                                    this.client.livestreams.set(thisGuild,streamMAP)
                                                }
                                            } else {
                                                logs.send(`A Streamer (${thisStreamer}) went live but I couldn't send the message because a channel for streams was not set up.\nPlease do so by typing \`${prefix}livestream channel <#mention channel>\``)
                                            }
                                        } else {
                                            logs.send(`A Streamer (${thisStreamer}) went live but I couldn't send the message because a channel for streams was not set up.\nPlease do so by typing \`${prefix}livestream channel <#mention channel>\``)
                                        }
                                        }  
                                        })
                                        
                                    }
                                })//guild search
                            }//end of yt mode
                    }
                    setInterval(() => {
                        sendRegulary(sharuru)
                    }, 3.5 * 1000);
                }
            })
        }, 300 * 1000);
    }
}