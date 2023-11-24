const mongoose = require("mongoose");
require('mongoose-long')(mongoose);
const {Types: {Long}} = mongoose;

const mypinsSys = mongoose.Schema({
    Role_Name: String,
    Role_Namae: String,
    Role_ID: String,
    Guild_ID: String,
    Auto: Boolean,
    Visible: Boolean,
    Level_required: Number,
    Roles_required: String,
    Unique_between: Array
})

module.exports = mongoose.model("autoroles",mypinsSys);