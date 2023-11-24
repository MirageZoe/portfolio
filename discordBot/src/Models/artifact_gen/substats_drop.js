const mongoose = require("mongoose");
require('mongoose-long')(mongoose);
const {Types: {Long}} = mongoose;

const mypinsSys = mongoose.Schema({
    artType: String,
    other: Array,
    values: Array,
    EPDMGBONUS: Array,
    CRITRD: Array,
    values2: Array,
    HEAL: Array,
    values3: Array,

})

module.exports = mongoose.model("artgen_substats",mypinsSys);