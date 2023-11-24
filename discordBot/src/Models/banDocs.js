const mongoose = require("mongoose");

const muteTemplate = mongoose.Schema({
        // main things
        guild_Name: String,
        guild_ID: String,
        user: String,
        userID: String,
        bannedBy: String,
        bannedByID: String,
        reason: String,
        time: String
    })

module.exports = mongoose.model("bans",muteTemplate);