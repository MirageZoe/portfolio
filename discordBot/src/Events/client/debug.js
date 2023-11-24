const Event = require('../../Structures/Event');
const SharuruEmbed = require('../../Structures/SharuruEmbed');
const GuildSettings = require('../../Models/GuildSettings')

module.exports = class extends Event {

    async run(debug) {
        console.log(debug)
    }
}