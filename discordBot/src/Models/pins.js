const mongoose = require("mongoose");

const mypinsSys = mongoose.Schema({
    pinID: Number,
    username: {type: String, default: "Not_processed"},
    userID: Number,
    fromGuildID: Number,
    guildName: {type: String, default: "Not_processed"},
    channelID: Number,
    linkToMessagePinned: String,
    messagePinned: String,
    isPrivate: {type: Boolean, default: false},
    date: String,

})

module.exports = mongoose.model("mypinsboard",mypinsSys);