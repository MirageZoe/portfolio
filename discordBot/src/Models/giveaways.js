const mongoose = require("mongoose");

const Giveaway = mongoose.Schema({
        raffleId: {type: String, default: "NOT_SET"},
        creator: {
                name: {type: String, default:"NOT_SET"},
                id: {type: String, default:"NOT_SET"},
                ok: {type: Boolean, default: true}
        },
        location: {
                messageId: {type: String, default: "NOT_SET"},
                channelId: {type: String, default: "NOT_SET"},
                guildId: {type: String, default: "NOT_SET"},
        },
        key: {
                enabled: {type: Boolean, default: false},
                word: {type: String, default: "NOT_SET"},
                public: {type: Boolean, default: false},
                allowDuplicateKeywords: {type: Boolean, default: true}
        },
        timeAt: {
                start: {type: String, default: "NOT_SET"}, // previously known as "startAt"
                duration: {type: String, default: "NOT_SET"},
                end: {type: String, default: "NOT_SET"},// previously known as "endAt"
        },
        ended: {type: Boolean, default: false},
        cutWinnersHalf: {type: Boolean, default: false},
        winnerCount: {type: String, default: "NOT_SET"},
        behavior: {// previously known as "modified/modifiedRoleChances"
                roles: {
                        chances: {type: Array, default: []},
                        restrictions: {
                                block: {type: Array, default: []},
                                require: {
                                        pool: {type: Array, default: []},
                                        mode: {type: Boolean, default: false}
                                },
                                special: {
                                        pool: {type: Array, default: []},
                                        mode: {type: String, default: "mode1"}
                                }
                        },
                        assignRoleOnJoining: {
                                role_id: {type: String, default: "NOT_SET"},
                                namae: {type: String, default: "NOT_SET"}
                        },
                        assignRoleOnLeaving: {
                                role_id: {type: String, default: "NOT_SET"},
                                namae: {type: String, default: "NOT_SET"}
                        }
                },
                messages: {
                        block: {type: String, default: "unfortunately you own a role that's blocked from joining this giveaway."},
                        entry: {type: String, default: "unfortunately this giveaway has the entries closed! That means either it ended or the entries were closed by a moderator!"},
                        require: {type: String, default: "unfortunately you need one or more roles to join this giveaway!"}
                },
                entry: {// previously known as "entryType"
                        type: {type: String, default: "slash"},
                        open: {type: Boolean, default: true},
                },
        },
        prize: {type: String, default: "NOT_SET"},
        messagesG: {type: String, default: "NOT_SET"},
        people_reacted: {type: Array, default: []},
        winners_list: {type:Array, default: []},
        tempBan: {type: Array, default: []},
})

module.exports = mongoose.model("giveaways",Giveaway);