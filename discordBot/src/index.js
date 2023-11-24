const SharuruClient = require('./Structures/SharuruClient');
const config = require('../config.json');
const client = new SharuruClient(config);
client.on('shardError', error => {
    var clock = new Date();
    var ss = String(clock.getSeconds()).padStart(2, '0');
    var min = String(clock.getMinutes()).padStart(2, '0');
    var hrs = String(clock.getHours()).padStart(1, '0');
    clock = `${hrs}:${min}:${ss}`;

    var TheDate = new Date();
    var zilelesaptamanii = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var weekday = zilelesaptamanii[TheDate.getDay()];
    var dd = String(TheDate.getDate()).padStart(2, '0');
    var mon = String(TheDate.getMonth() + 1);
    var year = String(TheDate.getFullYear()).padStart(4, '00');
    TheDate = `${weekday}, ${mon}/${dd}/${year}`;
    let amORpm;
    if (hrs >= 0 && hrs <= 12) {
        amORpm = 'AM';
    } else {
        amORpm = 'PM';
    }
    console.error(`[Sharuru-${TheDate}-${clock}-${amORpm}]: A websocket connection encountered an error:`, error);
});
process.on('unhandledRejection', error => {
    var clock = new Date();
    var ss = String(clock.getSeconds()).padStart(2, '0');
    var min = String(clock.getMinutes()).padStart(2, '0');
    var hrs = String(clock.getHours()).padStart(1, '0');
    clock = `${hrs}:${min}:${ss}`;

    var TheDate = new Date();
    var zilelesaptamanii = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var weekday = zilelesaptamanii[TheDate.getDay()];
    var dd = String(TheDate.getDate()).padStart(2, '0');
    var mon = String(TheDate.getMonth() + 1);
    var year = String(TheDate.getFullYear()).padStart(4, '00');
    TheDate = `${weekday}, ${mon}/${dd}/${year}`;
    let amORpm;
    if (hrs >= 0 && hrs <= 12) {
        amORpm = 'AM';
    } else {
        amORpm = 'PM';
    }
	console.error(`[Sharuru-${TheDate}-${clock}-${amORpm}]: Unhandled promise rejection:`, error);
});
process.on('uncaughtException', err => {
    var clock = new Date();
    var ss = String(clock.getSeconds()).padStart(2, '0');
    var min = String(clock.getMinutes()).padStart(2, '0');
    var hrs = String(clock.getHours()).padStart(1, '0');
    clock = `${hrs}:${min}:${ss}`;

    var TheDate = new Date();
    var zilelesaptamanii = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var weekday = zilelesaptamanii[TheDate.getDay()];
    var dd = String(TheDate.getDate()).padStart(2, '0');
    var mon = String(TheDate.getMonth() + 1);
    var year = String(TheDate.getFullYear()).padStart(4, '00');
    TheDate = `${weekday}, ${mon}/${dd}/${year}`;
    let amORpm;
    if (hrs >= 0 && hrs <= 12) {
        amORpm = 'AM';
    } else {
        amORpm = 'PM';
    }
    console.error(`[Sharuru-${TheDate}-${clock}-${amORpm}]: There was an uncaught error:`, err)
})

client.afk = new Map();
client.impData = new Map();
client.prefixes = new Map();
client.GuildInvites = new Map();
client.antispamCache = new Map();
client.cooldownCMDS = new Map();
client.xp_cooldown_map = new Map();
client.teamaker = new Map();
client.roleMenuData = new Map();
client.livestreams = new Map();
client.mediaChannelPause = new Map();
client.profileShopClients = new Map();
client.msgGarbageCollector = new Map();
client.giveawaysQueue = new Map();
client.timeouts = new Map();
client.halloweenEvent = new Map();
client.versusEvent = new Map();
let template = {
    confirmations: new Map(),
    spawns: new Map(),
    chances: new Map()
}
let template2 = {
    bigboss: new Map(),
    miniboss: new Map()
}
client.versusEvent.set(1,template)
client.versusEvent.set(2,template2)

// cooking event
client.tradeSystem = new Array();// myEvents old name: map
client.airdropClients = new Map();

// Games:
// 1 - Alfheim (temp name)
client.game_one = new Map();

client.test = new Map();
client.test2 = new Array();
client.start();