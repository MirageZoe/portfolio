const Event = require('../../Structures/Event');
const SharuruEmbed = require('../../Structures/SharuruEmbed');
const guildSettings = require('../../Models/GuildSettings')

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

    let userlogs = member.guild.channels.cache.find(ch => ch.name == 'sharuru-logs')

    //autorole module
    guildSettings.findOne({
        ID: member.guild.id
    },async (error,results)=>{
        if(error){
            sendError.create({
                Guild_Name: member.guild.name,
                Guild_ID: member.guild.id,
                User: member.user.username,
                UserID: member.user.id,
                Error: error,
                Time: `${TheDate} || ${clock} ${amORpm}`,
                Command: this.name,
                Args: `No args in event`,
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

            let embed = new SharuruEmbed()
                .setAuthor({name:`Member left!`})
                .setThumbnail(member.user.displayAvatarURL())
                .setColor(`Random`)
                .setTimestamp()
                .setDescription(`A member left the server! Their name was: ${member.user.username}!`)

            if(userlogs) userlogs.send({embeds: [embed]})
        }
    })

    }// end of command
}