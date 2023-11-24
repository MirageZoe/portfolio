const mongoose = require("mongoose");
require('mongoose-long')(mongoose);
const {Types: {Long}} = mongoose;

const mypinsSys = mongoose.Schema({
    group_id: {type: Long, default: 0},
    group_name: {type: String, default: 'This is a group Name!'},
    group_description: {type: String, default: 'This is a group description!'},
    group_mode: {type: String, default: 'standard'},
    group_details: {type: Boolean, default: false},
    group_roles: Array,
    group_required_role: {type: String, default: null},
    group_ignored_role: {type: String, default: null},
    group_temporary: {type: Long, default: 0},
    // group_require_one: {type: Boolean, default: false},
    // group_single_role: {type: Boolean, default: false},
    group_min_roles: {type: Number, default: 0},
    group_max_roles: {type: Number, default: 0},
    group_guildID: {type: Long, default: 0},
    group_channelID: {type: Long, default: 0},
    group_messageID: {type: Long, default: 0},
})

module.exports = mongoose.model("roleMenu",mypinsSys);