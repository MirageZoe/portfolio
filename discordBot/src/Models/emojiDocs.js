const mongoose = require("mongoose");
const mongooseLong = require("mongoose-long");

const muteTemplate = mongoose.Schema({
        // main things
        guildName: {type: String, default: "No Guild Provided"},
        guildID: {type: String, default: "No Guild Provided"},
        name: {type: String, default: "No Emoji Group Name Provided"},
        id: {type: String, default: "No Emoji GroupID Provided"},
        enabled: {type: Boolean, default: false},
        everyone: {type: Boolean, default: true},
        temporary: {type: String, default: "0"},
        emojiList: Array,
        members: Array,
        roles: Array,
    })

module.exports = mongoose.model("emoji",muteTemplate);