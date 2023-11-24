const mongoose = require("mongoose");

const hallo = mongoose.Schema({
    userName:   {type: String, default: "errUser"},
    userID:     {type: String, default: "errID"},
    guilds_data: {type: Map, default: new Map()}

})
module.exports = mongoose.model(`snowball_playerbase`,hallo)