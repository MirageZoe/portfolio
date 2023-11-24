const mongoose = require("mongoose");

const WarningBag = mongoose.Schema({
    caseID: String,
    caseType: String,
    userCase: String,
    userID: String,
    fromGuildID: String,
    guildName: String,
    authorCase: String,
    authorID: String,
    reason: String,
    date: String,
})

module.exports = mongoose.model("WarningBoard", WarningBag);