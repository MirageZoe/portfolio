const mongoose = require("mongoose");
require('mongoose-long')(mongoose);
const {Types: {Long}} = mongoose;

const mypinsSys = mongoose.Schema({
    bgID: String,
    bgLink: String,
    bgCategory: String,
    bgPrice: {type: Long, default: 1000},
    bgAvailability: {type: Long, default: -1},
    bgAvailabilityInShop: {type: Number,default: -1}
})

module.exports = mongoose.model("shopBG",mypinsSys);