const mongoose = require("mongoose");
require('mongoose-long')(mongoose);
const {Types: {Long}} = mongoose;

const mypinsSys = mongoose.Schema({
    name: {type: String, default: 'no name provided'},
    user_id: {type: String, default: 0},
    role_id: {type: String, default: 0},
    time_for_role: {type: String, default: 0},
    guild_id: {type: String, default: 0},
    guild_name: {type: String, default: 'no server name provided'},
})

module.exports = mongoose.model("temporaryRoles",mypinsSys);