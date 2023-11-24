const Event = require('../../Structures/Event');
const SharuruEmbed = require('../../Structures/SharuruEmbed');
const GuildSettings = require('../../Models/GuildSettings')

module.exports = class extends Event {

    async run(rateLimitInfo) {
        console.log(`\n=======Rate Limited!=========\n`)
        console.log(rateLimitInfo)
        console.log(`\n=======Rate Limited!=========\n`)

    }
}