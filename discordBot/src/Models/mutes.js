const mongoose = require("mongoose");

const muteTemplate = mongoose.Schema({
        // main things
        Guild_Name: String,
        Guild_ID: String,
        User: String,
        UserID: String,
        MutedBy: String,
        Time: String,
        Reason: String,
        Date: String
        
    })

module.exports = mongoose.model("Mutes",muteTemplate);