const mongoose = require("mongoose");

const muteTemplate = mongoose.Schema({
        server: {type: String, default: "0"},
        points: {type: Number, default: 1},
        expireAt: {type: String, default: "0"},
        code: {type: String, default: "0"},
        fav: {type: String, default:"trick"},
        message: {
            link: {type: String, default: "err"},
            channel: {type: String, default: "err"},
            id: {type: String, default: "err"}
        },
        cardDisplayDataPath: {
            rarity: {type: String, default: "err"},
            fullname: {type: String, default: "err"},
        },
        name: {type: String, default: "noname"},
        artist: {type: String, default:""}
    })

module.exports = mongoose.model("halloween_queue",muteTemplate);