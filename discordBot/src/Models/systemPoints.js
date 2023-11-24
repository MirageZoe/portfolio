const mongoose = require("mongoose");
require('mongoose-long')(mongoose);
const {Types: {Long}} = mongoose;

const mypinsSys = mongoose.Schema({
    uid: {type: String, default: 0},
    points: {type: Number, default: 0},
    server: {type: String, default: 0}
})

module.exports = mongoose.model("score_points",mypinsSys);