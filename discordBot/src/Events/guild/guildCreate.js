const Event = require('../../Structures/Event');
const sendError = require('../../Models/Error');
const SharuruEmbed = require('../../Structures/SharuruEmbed');
const guildSettings = require('../../Models/GuildSettings')

module.exports = class extends Event {

    async run(guild) {
        
        if (!guild.available) return console.log(`[Sharuru]: I've joined a new guild sadly It's not available.`,guild);
        console.log(guild.systemChannel);
        guild.systemChannel.send("Hello, thank you for invitation! Now that I joined the server, I will try to make a new channel for myself where I can send all logs! In case I couldn't *(because of no permissions or there wasn't space for more channels, limit is 50)*, please make a channel with the name \`sharuru-logs\`.")
        console.log(`I have joined a new guild! This one is called: ${guild.name}`)
        let groupchannels = guild.channels.cache;
        let sendToThisChannel;
        let BreakException = "Break out of foreach because the scope has been reached!"
        try {
            for(let ch in groupchannels){
                if(groupchannels[ch].type === "text" && guild.me.permissions.has(Permissions.FLAGS.SEND_MESSAGES)){
                    console.log(`I found channel "${groupchannels[ch].name} (${groupchannels[ch].id}) where I can say if I have a trouble makin my channel log!"`)
                    sendToThisChannel = groupchannels[ch].id
                    break;
                }
            }
            // groupchannels.forEach(element => {
            //     if(element.type === "text" && guild.me.permissions.has(PermissionsBitField.Flags.SendMessages)){
            //     console.log(`I found channel "${element.name} (${element.id}) where I can say if I have a trouble makin my channel log!"`)
            //     sendToThisChannel = element.id
            //     throw BreakException;
            //     }
            // });
        } catch (e) {
        if (e !== BreakException) throw e;
        }
        let ThisChannel = guild.channels.cache.get(sendToThisChannel)
        const logs = guild.channels.cache.find(channel => channel.name === "sharuru-logs");
        try{ 
            if(!logs && guild.me.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)){
                guild.channels.create('sharuru-logs', {
                    type: 'text',
                    permissionOverwrites:[{
                        id: guild.id,
                        deny: ['VIEW_CHANNEL']
                    }]
                    })
                    .catch(console.error)
            } else {
                console.log(`my logs are already existent in this server, I was in this server before?`)
            }
            guildSettings.findOne({
                ID: guild.id
            },async(err,res)=>{
                if(err){
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
                        Guild_Name: guild.name,
                        Guild_ID: guild.id,
                        User: `guildCreate`,
                        UserID: `guildCreate`,
                        Error: err,
                        Time: `${TheDate} || ${clock} ${amORpm}`,
                        Command: this.name,
                        Args: `event so no args`,
                    },async (err2, res2) => {
                        if(err2) {
                            console.log(err2)
                            return message.channel.send(`Unfortunately an problem appeared when joining a new guild. Please try again later. If this problem persist, contact my partner!`)
                        }
                        if(res2) {
                            console.log(`successfully added error to database!`)
                        }
                    })
                }
                if(res){
                    return console.log(`I have been in this place before (name: ${guild.name}, id: ${guild.id}) so that means I'll do nothing about it`)
                } else {
                    guildSettings.create({
                        Guild_Name: guild.name,
                        ID: guild.id
                    },async(err,res)=>{
                        if(err){
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
                                Guild_Name: guild.name,
                                Guild_ID: guild.id,
                                User: `guildCreate`,
                                UserID: `guildCreate`,
                                Error: err,
                                Time: `${TheDate} || ${clock} ${amORpm}`,
                                Command: this.name,
                                Args: `event so no args`,
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
                            console.log(`Successfully created a new doc with default settings for this new guild: ${guild.name} (${guild.id})`)
                        }
                    })
                }
            })
            
        }catch(e){
            ThisChannel.send(`I don't have enough permissions to make my logs channel or I couldn't find the channel if it was already made so check for spelling to be 'sharuru-logs'.`)
        }
    }
}