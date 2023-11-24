const mongoose = require("mongoose");
require('mongoose-long')(mongoose);
const {Types: {Long}} = mongoose;

const mypinsSys = mongoose.Schema({
    person: String,
    id: String,
    guild: String,
    date: String,
    suggestion: String
})

module.exports = mongoose.model("suggestions",mypinsSys);