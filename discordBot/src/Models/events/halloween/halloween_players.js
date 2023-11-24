const mongoose = require("mongoose");

const hallo = mongoose.Schema({
    userName:   {type: String, default: "errUser"},
    userID:     {type: String, default: "errID"},
    guild:      {type: String, default: "errGuild"},
    points:     {type: Number, default: 0},
    inventory:  {type: Array, default: []},

})
module.exports = mongoose.model(`halloween_playerbase`,hallo)