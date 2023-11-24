const mongoose = require("mongoose");

const hallo = mongoose.Schema({
    userName:   {type: String, default: "errUser"},
    userID:     {type: String, default: "errID"},
    guild:      {type: String, default: "errGuild"},
    pair:       {type: String, default: "0"},
    rank:       {type: Number, default: 0},
    trade: {
        tokens: {type: Number, default: 2},
        limit: {type: Number, default: 2},
        lastPick: {type: String, default: "0"},
    },
    points:     {
        stranger: {type: Number, default: 0},
        acquaintance: {type: Number, default: 0},
        friendship: {type: Number, default: 0},
        lover: {type: Number, default: 0},
        soulmate: {type: Number, default: 0}
    },
    cooldowns: {
        cook: {type: String, default: "0"},
        gather: {type: String, default: "0"},
        pair: {type: String, default: "0"},
        top: {type: String, default: "0"},
        lastAirdrop: {type: String, default: "0"},
    },
    inventory:  {
        ingredients: {
            //Basic
            banana: {type: Number, default: 0},
            carrot: {type: Number, default: 0},
            egg: {type: Number, default: 0},
            flour: {type: Number, default: 0},
            pepper: {type: Number, default: 0},
            rice: {type: Number, default: 0},
            salt: {type: Number, default: 0},
            sugar: {type: Number, default: 0},
            water: {type: Number, default: 0},
            
            //zone1
            bell_peppers: {type: Number, default: 0},
            butter: {type: Number, default: 0},
            cabbage: {type: Number, default: 0},
            fowl: {type: Number, default: 0},
            garlic: {type: Number, default: 0},
            milk: {type: Number, default: 0},
            mushroom: {type: Number, default: 0},
            oil: {type: Number, default: 0},
            onion: {type: Number, default: 0},
            strawberry: {type: Number, default: 0},
            strawberry_jam: {type: Number, default: 0},
            tomato: {type: Number, default: 0},
            
            //zone2
            bacon: {type: Number, default: 0},
            blackberry_jam: {type: Number, default: 0},
            bread: {type: Number, default: 0},
            chocolate: {type: Number, default: 0},
            kiwi: {type: Number, default: 0},
            lemon: {type: Number, default: 0},
            mandarin: {type: Number, default: 0},
            pork: {type: Number, default: 0},
            potato: {type: Number, default: 0},
            
            //zone3
            beef: {type: Number, default: 0},
            chocolate_syrup: {type: Number, default: 0},
            mint_leaves: {type: Number, default: 0},
            mirin: {type: Number, default: 0},
            raspberry_jam: {type: Number, default: 0},
            soy_sauce: {type: Number, default: 0},

            //zone4
            crab: {type: Number, default: 0},
            fish: {type: Number, default: 0},
            pineapple: {type: Number, default: 0},
            shiitake_mushrooms: {type: Number, default: 0},
            shrimp: {type: Number, default: 0},
            sour_cream: {type: Number, default: 0},
            walnut: {type: Number, default: 0},
        },
        dishes: []
    },

})
module.exports = mongoose.model(`cooking_playerbase`,hallo)