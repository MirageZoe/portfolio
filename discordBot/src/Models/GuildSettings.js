const mongoose = require("mongoose");
require('mongoose-long')(mongoose);
const {Types: {Long}} = mongoose;

const guildSettings = mongoose.Schema({
        // main things
        Guild_Name: String, // base property, locked
        ID: String,// base property, locked
        prefix: {type: String, default: `c!`},// base property, locked
        systems: {
            economy: {type: String, default: `disabled`},
            autorole: {
                enabled: {type: Boolean, default: false},
                role: {type: String, default: '0'},// old name: selectedRole
            },
            inviteTracker: { // old name: invites
                enabled: {type: Boolean, default: false},
                channel: {type: String, default: `0`},//old name: invitesChannel
            },
            blacklistWord: { // old name: blacklist_system
                mode: {type: Boolean, default: false},
                protected: {
                    people: {type: Array},
                    roles: {type: Array},
                    words: {type: Array},
                },
                words: {type: Array},
                behaviour:{
                    mode: {type: Boolean, default: false},
                    type: {type: String, default: "SHARD"}
                }
            },
            livestream: {
                all: {type: Boolean, default: false},
                enableYT: {type: Boolean, default: false},
                enableTW: {type: Boolean, default: false},
                channel: {type: String, default:`0`}, // old name: streamChannel
            },
            customWarns: { // old name: customWarnsSwitch
                enabled: {type: Boolean, default: false},
                warns: Array,// old name: customWarns
            },
            exp: {//old name: xp_system
                enabled: {type: Boolean, default: false},
                coin_drop:{
                    min: {type: Number, default: 1},
                    max: {type: Number, default: 3},
                },
                xp_per_message: {
                    min: {type: Number, default: 1},
                    max: {type: Number, default: 10},
                },
                expLimit: {type: Number, default: 1000},
                xp_rate: {type: Number, default: 1},
                cooldownMsg: {type: Number, default: 30},
                ignoredChannels: {type: Array},
            },
            antispam:{
                enabled: {type: Boolean, default: false},
                //How many messages needed to send to trigger the threshold
                warnThreshold: {type: Number, default: 3},
                muteThreshold: {type: Number, default: 4},
                kickThreshold: {type: Number, default: 5},
                banThreshold: {type: Number, default: 7},
                
                //check if the thresholds were met during this interval 
                maxInterval: {type: Number, default: 2900},
                maxDuplicatesInterval: {type: Number, default: 10000},
                checkForMutedRoleInterval: {type: Number, default: 300000},
    
                maxDuplicatesWarn: {type: Number, default: 4},
                maxDuplicatesMute: {type: Number, default: 6},
                maxDuplicatesKick: {type: Number, default: 8},
                maxDuplicatesBan: {type: Number, default: 10},
    
                muteRole: {type: String, default: 'muted'},
    
                modLogsChannelName: {type: String, default: 'sharuru-logs'},
                modLogsEnabled: {type: Boolean, default: false},
    
                warnMessage: {type: String, default: '{member}, stop sending so fast messages! You\'ll destroy discord\'s servers by typing that fast!.' },
                muteMessage: {type: String, default: '{member} was silenced *(not killed)* for being too hot...' },
                kickMessage: {type: String, default: 'Even Usain Bolt would kicked from the competition sometimes for being too good, just as **{member_tag}** was...' },
                banMessage: {type: String, default: 'It\'s insane how fast **{member_tag}** can type... Thor got interested in them'},
    
                errorMessages: {type: Boolean, default: true},
                kickErrorMessage: {type: String, default: 'I couldn\'t kick **{member_tag}** because I don\'t have enough permissions.'} ,
                banErrorMessage: {type: String, default: 'I couldn\'t ban **{member_tag}** because I don\'t have enough permissions.'} ,
                muteErrorMessage: {type: String, default: 'I couldn\'t mute **{member_tag}** because I don\'t have enough permissions, I don\'t see the mute role or I can\'t assign the mute role (member is above my role or has administrator permissions).'},
    
                ignoredMembers: {type: Array, default: []},
                ignoredRoles: {type: Array, default: []},
                ignoredChannels: {type: Array, default: []},
                ignoredPermissions: {type: Array, default: []},
                ignoreBots: {type: Boolean, default: true},
    
                warnEnabled: {type: Boolean, default: true},
                kickEnabled: {type: Boolean, default: true},
                muteEnabled: {type: Boolean, default: true},
                banEnabled: {type: Boolean, default: true},
    
                deleteMessagesAfterBanForPastDays: {type: Number, default: 1},
                removeMessages: {type: Boolean, default: true},
    
                removeBotMessages: {type: Boolean, default: false},
                removeBotMessagesAfter: {type: Number, default: 10000}
            },
            starboard:{
                enabled: {type: Boolean, default: false},
                channel: {type: String, default:"none"},
                count: {type: Number, default: 5}
            },
            emojiPack: {type: Boolean, default: false},
            mediaChannel: {
                enabled: {type: Boolean, default: false},
                timeout: {type: String, default: `900000`},
                strikes: {type: Number, default: 4},
                channels: {type: Array, default: []},
                role: {type: String, default: `0`}
            },
            reactMsg: {
                enabled: {type: Boolean, default: false},
                logs: {type: Boolean, default: false}
            },
            disabledCommands: {type: Array, default: []}
        },
        events:{
            halloween: {
                enabled: {type: Boolean, default: false},
                channels: {type: Array, default: []},
                startChance: {type: Number, default: 10},
                every: {type: Number, default: 300000},
                increaseBy: {type: Number, default: 2},
                cooldown: {
                    recentSpawn: {type: String, default: "0"},
                    amount: {type: Number, default: 0}
                },
                currentChance: {type: Number, default: 1},
                limitedChannels: {type: Array, default:[]},
                enableEvilSouls: {type: Boolean, default: false},
                bonusRate: {type: Number, default: 1}
            },
            snowball: {
                enabled: {type: Boolean, default: false},
                channels: {type: Array, default: []},
                cooldowns: {
                    collect: {type: Number, default: 60000},
                    throw: {type: Number, default: 60000},
                    dizzy: {type: Number, default: 300000},
                    immunity: {type: Number, default: 30000},
                    dizzyList: {type: Number, default: 180000},
                },
                statsLockChannel: {type: String, default: "Not set"},
                dizzyListGlobal: {type: String, default: "0"}
            },
            cooking: {
                enabled: {type: Boolean, default: false},
                cookingHall: {type: String, default: 'Not set'},
                threads: {
                    basic: {type: String, default: "Not set"},
                    zone1: {type: String, default: "Not set"},
                    zone2: {type: String, default: "Not set"},
                    zone3: {type: String, default: "Not set"},
                    zone4: {type: String, default: "Not set"},
                },
                rankLimits: {
                    stranger: {type: Number, default: 100},
                    acquaintance : {type: Number, default: 500},
                    friendship: {type: Number, default: 1000},
                    lover: {type: Number, default: 3000},
                    soulmate: {type: Number, default: 999999},
                },
                dish_chances: {
                    suspicious: {type: Number, default: 30},
                    normal: {type: Number, default: 60},
                    delicious: {type: Number, default: 10},
                },
                cooldowns: {
                    pair: {type: Number, default: 30},
                    top: {type: Number, default: 30},
                    airdrop: {type: Number, default: 120},
                    airdropTries: {type: Number, default: 2}
                },
                trade: {
                    normal_cost: {type: Number, default: 3},
                    liquid_cost: {type: Number, default: 6}
                },
                banned: {type: Array, default: []},
                statsLockChannel: {type: String, default: "0"},
            },
            versus:{
                red: {
                    players: {type: Array, default: []},
                    damage: {type: Number, default: 0},
                },
                blue: {
                    players: {type: Array, default: []},
                    damage: {type: Number, default: 0},
                },
                channels: {type: Array, default: []},
                enabled: {type: Boolean, default: false},
                settings: {
                    intervals: {
                        bigBoss: {type: Array, default: [
                            {
                                starting: "11:30:00",
                                ending: "12:30:00"
                            },
                            {
                                starting: "23:30:00",
                                ending: "00:30:00"
                            },
                        ]},
                        miniBoss: {type: Array, default: [
                            {
                                starting: "03:30:00",
                                ending: "04:30:00"
                            },
                            {
                                starting: "09:30:00",
                                ending: "10:30:00"
                            },
                            {
                                starting: "15:30:00",
                                ending: "16:30:00"
                            },
                            {
                                starting: "21:30:00",
                                ending: "22:30:00"
                            },
                        ]}
                    },
                    durations: {
                        bigBoss : {
                            min: {type: Number, default: 240},
                            max: {type: Number, default: 480}
                        },
                        miniBoss: {
                            min: {type: Number, default: 128},
                            max: {type: Number, default: 300}
                        }
                    },
                    chances: {
                        bigBoss: {type: Number, default: 10},
                        miniBoss: {type: Number, default: 25},
                        increaseBy: {type: Number, default: 3}
                    }
                }
            }
        },
        importantData: {
            staffRole: {type: String, default:`NOT_SET`},// base property, locked
            highestRole: {
                id: {type: String, default: "NOT_SET"},
                namae: {type: String, default: "NOT_SET"},
                position: {type: Number, default: "0"},
                permissions: {type: Array, default: []},
                lastUpdate: {type: String, default: "0"}
            }  
        },
        logs:{
            log_channel: {type: String, default: "0"},
            voice: {type: Boolean, default: false},
            channel: {type: Boolean, default: false},
            emoji: {type: Boolean, default: false},
            guild: {type: Boolean, default: false},
            message: {type: Boolean, default: false},
            role: {type: Boolean, default: false},
            moderation: {type: Boolean, default: false},
        }, // base property, locked
        games:{
            ouat: {
               isLocked: {type: Boolean, default: false},
            },
        },
        raffleSettings: {
            bans: {type: Array, default: []},
            selectedRaffleId: {type: String, default: "0"},
            templates: {type: Array, default: []}
        },// base property, locked
        members: {type: Array, default: []}
    })

module.exports = mongoose.model("Guilds_Settings",guildSettings);