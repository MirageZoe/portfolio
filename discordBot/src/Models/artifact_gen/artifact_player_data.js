const mongoose = require("mongoose");
require('mongoose-long')(mongoose);
const {Types: {Long}} = mongoose;

const mypinsSys = mongoose.Schema({
    userID: {type: String, default: 0},
    userName: {type:String, default: "N/A"},
    artifact: {
        name: {type: String, default: "N/A"},
        artType: {type: String, default: "N/A"},
        artLevel: {type: Number, default: 0},
        artMain: {
            stat: {type: String, default: "N/A"},
            value: {type: String, default: "N/A"}
        },
        artSub: {
            stat1: {type: String, default: "N/A"}, 
            stat2: {type: String, default: "N/A"},
            stat3: {type: String, default: "N/A"}, 
            stat4: {type: String, default: "N/A"}, 
        },
        artVal: {
            value1: {type: Number, default: 0},
            value2: {type: Number, default: 0},
            value3: {type: Number, default: 0},
            value4: {type: Number, default: 0},
        }
    },

})

module.exports = mongoose.model("artgen_inventories",mypinsSys);