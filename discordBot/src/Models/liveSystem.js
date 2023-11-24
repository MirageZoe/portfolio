const mongoose = require("mongoose");

const muteTemplate = mongoose.Schema({
        // main things
        guild_Name: String,
        guild_ID: String,
        streamer: String,
        streamerID: String,
        streamerType: String,
        streamerYTMode: String,
        isNowLive: Boolean,
        time: String,
        date: String
    })

module.exports = mongoose.model("Streamlive",muteTemplate);