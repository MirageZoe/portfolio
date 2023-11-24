const Event = require('../../Structures/Event');
const SharuruEmbed = require('../../Structures/SharuruEmbed');
const GuildSettings = require('../../Models/GuildSettings')
const sendError = require('../../Models/Error')

module.exports = class extends Event {

    async run(button) {

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
        await button.clicker.fetch();
        console.log(button.message.embeds[0])
        // console.log(button)


        if (button.id == '1') {
            let oldEmbed = button.message.embeds[0]
            let oldPoints = oldEmbed.fields[0].value
            let embed = new SharuruEmbed()
                .addField(`Points:`,`${Number(oldPoints)+1}`)
                .setColor(`RANDOM`)
            return button.message.edit({
                embed: embed
            })
        }

        if (button.id == '2') {
            let oldEmbed = button.message.embeds[0]
            let oldPoints = oldEmbed.fields[0].value
            let embed = new SharuruEmbed()
                .addField(`Points:`,`${Number(oldPoints)-1}`)
                .setColor(`RANDOM`)
            return button.message.edit({
                embed: embed
            })
            
        }
        
    }
}