const mongoose = require("mongoose");
require('mongoose-long')(mongoose);
const {Types: {Long}} = mongoose;

const mypinsSys = mongoose.Schema({
    username: String,
    userID: String,
    guildID: String,
    guildName: String,
    textColor: {type: String, default: `#000000`},
    numberColor: {type: String, default: `#00e326`},
    servers_data: Map,
    badges: {
        currentBadges: {type: Array, default: [], maxItems: 8},
        list: {type: Array, default: []}
    },
    title: {
        currentTitle: {type: String, default: ""},
        list: {type: Array, default: []}
    },
    description2: {type: String, default: `I'm a friendly person!`},//, lowercase: true
    backgroundSelected: {type: String, default: `https://media.discordapp.net/attachments/768885595228864513/799329013939175484/na_1.jpg?width=720&height=481`},
    backgroundsOwned:{type: Array},
    coinBuffs: {
        doubleWin: {type: Number, default: 0},
        noLose: {type: Number, default: 0},
        noPay: {type: Number, default: 0},
        moreMoney: {
            charges: {type: Number, default: 0},
            amount: {type: Number, default: 0}
        },
    },
    coinDebuffs: {
        doubleLose: {type: Number, default: 0},
        noWin: {type: Number, default: 0},
        doublePay: {type: Number, default: 0},
        lessMoney: {
            charges: {type: Number, default: 0},
            amount: {type: Number, default: 0}
        },
    },
    lastBet: {type: Number, default: 0},
    pinNumber: {type: Long, default: 1},
    events: {
        versus: {
            missions: {
                lastCompletion: {
                    day: {type: Number, default: 0},
                    month: {type: Number, default: 0}
                },
                list: {type: Array, default: []},
                sml: {type: Array, default: []},
                nickname: {type: String, default: "not_set"},
                messages: {type: Array, default: []},
                completedM: {type: Number, default: 0}
            },
            team: {type: String, default: "none"},
            damage: {type: String, default: "0"},
            inventory: {
                weapons: {type: Array, default: []},
                items: {
                    small_bomb: {type: Number, default: 0},
                    medium_bomb: {type: Number, default: 0},
                    large_bomb: {type: Number, default: 0},
                    special_bomb: {type: Number, default: 0},
                }
            },
            weaponHold: {type: Number, default: 0},
            weaponFruitAdded: {type: Number, default: 0},
            tickets: {type: Number, default: 0},
            patchfix: {type: Boolean, default: false}
        }
    },
    farm: {
        tools: {
            solution30: {type: Number, default: 0},
            solution60: {type: Number, default: 0},
            solution90: {type: Number, default: 0},
            repelent: {type: Number, default: 0},
        },
        fruits: {
            apple: {
                seeds: {type: Number, default: 0},
                harvested: {type: Number, default: 0}
            },
            orange: {
                seeds: {type: Number, default: 0},
                harvested: {type: Number, default: 0}
            },
            banana: {
                seeds: {type: Number, default: 0},
                harvested: {type: Number, default: 0}
            },
            cherries: {
                seeds: {type: Number, default: 0},
                harvested: {type: Number, default: 0}
            },
            grapes: {
                seeds: {type: Number, default: 0},
                harvested: {type: Number, default: 0}
            },
            kiwi: {
                seeds: {type: Number, default: 0},
                harvested: {type: Number, default: 0}
            },
            lemon: {
                seeds: {type: Number, default: 0},
                harvested: {type: Number, default: 0}
            },
            peach: {
                seeds: {type: Number, default: 0},
                harvested: {type: Number, default: 0}
            },
        },
        trees: {
            wood: {
                seeds: {type: Number, default: 0},
                harvested: {type: Number, default: 0}
            },
            palm: {
                seeds: {type: Number, default: 0},
                harvested: {type: Number, default: 0}
            },
            rich: {
                seeds: {type: Number, default: 0},
                harvested: {type: Number, default: 0}
            },
            boreal: {
                seeds: {type: Number, default: 0},
                harvested: {type: Number, default: 0}
            },
            ebon: {
                seeds: {type: Number, default: 0},
                harvested: {type: Number, default: 0}
            },
            shade: {
                seeds: {type: Number, default: 0},
                harvested: {type: Number, default: 0}
            },
            pearl: {
                seeds: {type: Number, default: 0},
                harvested: {type: Number, default: 0}
            },
            dynasty: {
                seeds: {type: Number, default: 0},
                harvested: {type: Number, default: 0}
            },
        },
        planters: {
            p1: {
                status: {type: String, default: "idle"},
                seed: {type: Number, default: 0},
                startTime: {type: String, default: "0"},
                duration:  {type: String, default: "0"},
                unlocked: {type: Boolean, default: true}
            },
            p2: {
                status: {type: String, default: "idle"},
                seed: {type: Number, default: 0},
                startTime: {type: String, default: "0"},
                duration:  {type: String, default: "0"},
                unlocked: {type: Boolean, default: false}
            },
            p3: {
                status: {type: String, default: "idle"},
                seed: {type: Number, default: 0},
                startTime: {type: String, default: "0"},
                duration:  {type: String, default: "0"},
                unlocked: {type: Boolean, default: false}
            },
            p4: {
                status: {type: String, default: "idle"},
                seed: {type: Number, default: 0},
                startTime: {type: String, default: "0"},
                duration:  {type: String, default: "0"},
                unlocked: {type: Boolean, default: false}
            },
            p5: {
                status: {type: String, default: "idle"},
                seed: {type: Number, default: 0},
                startTime: {type: String, default: "0"},
                duration:  {type: String, default: "0"},
                unlocked: {type: Boolean, default: false}
            },
            p6: {
                status: {type: String, default: "idle"},
                seed: {type: Number, default: 0},
                startTime: {type: String, default: "0"},
                duration:  {type: String, default: "0"},
                unlocked: {type: Boolean, default: false}
            },
            
        }
    }
})

module.exports = mongoose.model("profiles",mypinsSys);