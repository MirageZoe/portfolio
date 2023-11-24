/* eslint-disable no-unused-vars */
const SharuruEmbed = require('../../Structures/SharuruEmbed');
const { createCanvas, loadImage } = require("canvas");
const { AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require("discord.js");
const profileSys = require('../../Models/profiles')
const Command = require('../../Structures/Command.js');
const keygen = require("keygenerator")
const pms = require("pretty-ms")
const fs = require('fs');
const ms = require('ms');
const sendError = require('../../Models/Error');
const { nameByRace } = require('fantasy-name-generator');
const gameAbilities = require("../../Models/gameModels/gameAbilities");
const gameManager = require('../../Models/gameModels/gameManager');
const gameAccs = require("../../Models/gameModels/gameAccounts");
const game_charNames = require('../../Assets/game_files/game_data/game_name_tools/names.json');
const gameMobs = require('../../Models/gameModels/gameMobs');
const MobListSpawn = require("../../Assets/game_files/game_data/gamemobs/game_mobs_spawnpoints.json");
const mobList = require("../../Assets/game_files/game_data/gamemobs/game_mobs.json")
const _interface = require('../../Assets/game_files/game_tools/interface.js');
const applyText = (canvas, text) => {
	const ctx = canvas.getContext('2d');

	// Declare a base size of the font
	let fontSize = 21;

	do {
		// Assign the font to the context and decrement it so it can be measured again
		ctx.font = `${fontSize -= 3}px Changa`;
		// Compare pixel width of the text to the canvas minus the approximate avatar size
	} while (ctx.measureText(text).width > canvas.width - 100);

	// Return the result to use in the actual canvas
	return ctx.font;
};
let gameTools = {
    interface: require('../../Assets/game_files/game_tools/interface.js')
};

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'game',
            // cooldown: 3000,
			displaying: false,
			description: 'This is my game!',
			options: '~',
			usage: '~',
			example: '~',
			category: 'owner',
			userPerms: [PermissionsBitField.Flags.SendMessages],
			SharuruPerms: [PermissionsBitField.Flags.SendMessages],
			args: false,
			guildOnly: true,
			ownerOnly: false,
            allowTesters: true,
			aliases: ['g']
		});
	}

	async run(message, args) {
		// eslint-disable-next-line id-length
		// if (!message.member.roles.cache.find(r => r.name === 'Disciplinary Committee')) return message.channel.send(`Command locked or it's in development`);

        message.delete()
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
		const issuer = message.author;

		let amORpm;
		if (hrs >= 0 && hrs <= 12) {
			amORpm = 'AM';
		} else {
			amORpm = 'PM';
        }
        let arrayShuffle = function(array) {
			for ( let i = 0, length = array.length, swap = 0, temp = ''; i < length; i++ ) {
			swap        = Math.floor(Math.random() * (i + 1));
			temp        = array[swap];
			array[swap] = array[i];
			array[i]    = temp;
			}
			return array;
		};
		let percentageChance = function(values, chances) {
			for ( var i = 0, pool = []; i < chances.length; i++ ) {
			for ( let i2 = 0; i2 < chances[i]; i2++ ) {
				pool.push(i);
			}
			}
			return values[arrayShuffle(pool)['0']];
        };
        function getRandomInt(min, max) {
			min = Math.ceil(min);
			max = Math.floor(max);
			return Math.floor(Math.random() * (max - min + 1)) + min;
		}
        const logChannel = message.guild.channels.cache.find(ch => ch.name == 'sharuru-logs')
        const sharuru = this.client
        const royalHouses = [`Kira`,`Silva`,`Vermillion`];
        const nobleHouses = [`Adlai`,`Boismortier`,`Vaude`,`Freese`,`Venieris`,'Shihoin'];
        const commonerFamilies = [`Agrippa`,`Astraea`,`Hephaestus`,`Hestia`,`Freya`,`Soma`,'Integra','Vessalius','Viltaria'];
        const gameData = {
            gameName: `Alfheim`,
            gameVersion: `Alpha 0.4.1!`
        }

        let statChange = function(stats_obj,pointsSpent_obj, pos,operation) {
            let myKeys = Object.keys(pointsSpent_obj);
            if (operation == 'plus' && stats_obj.available > 0) {
                pointsSpent_obj[myKeys[pos]] += 1;
                console.log(`added point to ${myKeys[pos]}`)
                stats_obj.spent++;
                stats_obj.available--;
                if (myKeys[pos] == 'endurance') stats_obj.hp += 25;
                if (myKeys[pos] == 'stamina') stats_obj.mana += 15;
            }
            if (operation == 'minus' && pointsSpent_obj[myKeys[pos]] > 0) {
                pointsSpent_obj[myKeys[pos]] -=1;
                stats_obj.spent--;
                stats_obj.available++;
                if (myKeys[pos] == 'endurance') stats_obj.hp -= 25;
                if (myKeys[pos] == 'stamina') stats_obj.mana -= 15;
            }
            // return stats_obj
        }
        if(args[0] == 'reload') {
            for(let i in gameTools) {
                try {
                    console.log(`\n`)
                    console.log(`Trying to reload ${i}...`)
                    delete require.cache[require.resolve(`../../Assets/game_files/game_tools/${i}.js`)];//`../../Assets/game_files/game_tools/${i}.js`
                    gameTools[i] = require(`../../Assets/game_files/game_tools/${i}.js`);
                    console.log(`Reloaded ${i}!`)
                } catch (error) {
                    console.log(`Unfortunately I couldn't reload ${i} because:\n${error}`)                    
                }
            }
            return;
        }
        if(args[0] == 'c'){
            let mobForm = require("../../Models/gameModels/gameMobs")
            // mobForm.create({
            //     name: "Blue",
            //     familyName: "Slime",
            //     level: {
            //         exp: 3,
            //         low: 1,
            //         high: 15
            //     },
            //     stats: {
            //         hp: 27,
            //         mana: 0,
            //         attack: -1,
            //         truedmg: 0,
            //         power: 4,
            //         defense: 7,
            //         armor: 0,
            //         magicArmor: 0,
            //         endurance: 0,
            //         intelligence: 2,
            //         agility: 0,
            //         dodge: 0,
            //         parry: 0,  
            //         critChance: 0,
            //         critDamage: 50,
            //         lifesteal: 0
            //     }
            // },(err,res) =>{
            //     if (err) console.log(err)
            //     if (res) console.log(`Done, mob added!`)
            // })
            // let test = mobForm.findOne({id: 1})
            let streams = this.client.game_one.get(issuer.id)
            console.log(streams)
			// let msg = message.guild.channels.cache.get('954728806197911582').messages.cache.get('957330236335357973')
            

            return //message.channel.send({embeds: [testfight]})//console.log(`total: ${streams.player_data.stats.critDamage}`)
        }
        if(args[0] == 'b') {
            let streams = this.client.mediaChannelPause
            return console.log(streams)
        }
        if(args[0] == 'a'){
            // let test = [{authorID: '1'},{authorID: '2'},{authorID: '3'},{authorID: '4'}]
            // gameTools.interface.access_game(this.client,issuer,message)
            let mediaRole = message.guild.roles.cache.find(rl => rl.name == 'role1').members.map(i => i.user.id);
            console.log(mediaRole)
            

            return 
            let myGuilds = [...this.client.guilds.cache.keys()]
            for(let i = 0; i < myGuilds.length; i++){
                this.client.guilds.fetch(myGuilds[i]).then(async guildFetched =>{
                    try {
                        await guildFetched.members.fetch(args[1]).then(g_mem_fetched =>{
                            if (g_mem_fetched.id == args[1]) console.log(`Member (${args[1]}) exist in guild ${guildFetched.name}!`)
                        })
                    } catch (error) {
                        console.log(`[UNKNOWN MEMBER]: Member (${args[1]}) isn't in guild ${guildFetched.name}`)
                    }
                })
            }
            return console.log(`done`)
            profileSys.find({},async(err,res)=>{
                if(err) {
                    console.log(err)
                    return;
                }
                if(res){
                    for(let i = 0; i < res.length; i++) {
                        let user = res[i];
                        if(!user.servers_data) {
                            console.log(`${user?.username || user.userID}[${i+1}] doesn't have server data, starting materialization...`)
                            
                        }
                    }
                }
            })
            
            // console.log(test.fields.find(fi => fi.name == 'Random Blue Slime'))
            // gameAbilities.create({
            //     id: 1,
            //     name: "Basic Attack",
            //     description: "It's a simple physical attack. Can it hurt?",
            //     requirements: {
            //         stamina: 5
            //     },
            //     heal: 0,
            //     damage: 10
            // },(err,res)=>{
            //     if(err) return console.log(err)
            //     if(res) {
            //         console.log(`Successfully added "${res.name}"!`)
            //     }
            // })
            // gameMobs.create({
            //     id: 1,
            //     name: "Blue Slime",
            //     familyName: "None",
            //     origin: "Slime",
            //     gender: "None",
            //     job: "None",
            //     abitilies: [1],

            //     //stats
            //     hp: 60,
            //     mana: 0,
            //     ad: 5,
            //     ap: 0,
            //     armor: 0,
            //     magicArmor: 0,
            //     endurance: 7,
            //     agility: 4,
            //     stamina: 100,
            //     critChance: 0,
            //     critDamage: 0,
            //     dodge: 0,
            //     block: 0,
            //     parry: 0,
            //     lifesteal: 0,
            //     spelldur: 0
            // },(err,res)=>{
            //     if(err) return console.log(err)
            //     if(res) {
            //         console.log(`Successfully added mob "${res.name}"!`)
            //     }
            // })
            // TO DO: After adding the ability to attack and mob, time to make the spawn points
            // and the fighting system: PVE
            
            // this.client.antispamCache.mutedUsers.push({id: message.author.id,gid:message.guild.id})
            // let filter = m => m.author.id == message.author.id
            // let sett ={
            //     session: true,
            //     map: false,
            //     a: 0,
            //     b: 0
            // }
            // while(sett.session){
            //     await message.channel.awaitMessages({filter,max: 1, time: 60000}).then(async collected =>{
            //         let an = collected.first().content
            //         switch(an){
            //             case "map":
            //                 sett.map = true
            //                 while(sett.map){
            //                     if(sett.b < 5){
            //                         console.log(`b: ${sett.b}`)
            //                         sett.b++
            //                     }
            //                     await message.channel.awaitMessages({filter,max: 1, time: 60000}).then(async collected =>{
            //                         let an = collected.first().content
            //                         if(an == 'back'){
            //                             sett.map = false
            //                             sett.b = 0
            //                         } else {
            //                             console.log(`b increased`)
            //                         }
            //                     }).catch(err=>{
            //                         console.log(`exit the map`)
            //                         sett.map = false
            //                     })
            //                 }
            //                 break;
            //             default:
            //                 console.log(`No option, ignoring this one...`)
            //         }
            //     })
            // }
            
            return
            let menuCreationEmbed = new SharuruEmbed()
                .setAuthor(`Welcome to ${gameData.gameName}'s Character Creation!`)
                .setDescription(`Below you can customize how you want your character to be.
                Basic Info:
                 - **Name**: **Choose a *__name!__***
                 - **\`Family Name: Unknown\`**
                 - **Race**: *Choose a race!*
                 - **Gender**: *Choose a gender!*
                 - **\`Class\`**: *\`Need to [Analyze]!\`*

                Stats:
                 - **\`Hit Points: 130\`**
                 - **\`Mana: 0\`**
                 - **Attack Damage**: 0
                 - **Attack Power**: 0
                 - **Armor**: 15
                 - **Magic Resist**: 0
                 - **Endurance**: 0
                 - **Agility**: 0
                 - **Stamina**: 0
                
                
                Available points: 7`)
                
            return message.channel.send(menuCreationEmbed)
            console.log(nameByRace('human',{gender: 'female', allowMultipleNames: true}))
            return console.log(Math.floor(Math.random() * 2))
        }
        function RegisterFormPickup(phrase) {
            let allRegForms = {}
            if(phrase.search(',')) phrase = phrase.split(",")
                for(let element in phrase){
                    let fieldG = phrase[element]
                    let getIndexDoubleDots = fieldG.indexOf(":")
                    let extractName = fieldG.substring(0,getIndexDoubleDots).trim()
                    let extractValue = fieldG.substring(getIndexDoubleDots+1)
                    extractName = extractName.toLowerCase();
                    // console.log(extractName)
                    if(extractName == "q1") extractName = `question1`;
                    if(extractName == "a1") extractName = `answer1`;
                    if(extractName == "q2") extractName = `question2`;
                    if(extractName == "a2") extractName = `answer2`;
                    if(extractName == "q3") extractName = `question3`;
                    if(extractName == "a3") extractName = `answer3`;
                    
                    if(!extractName.match("question")){
                        extractValue = extractValue.trim();
                        extractName = extractName.trim();
                    }
                    if(extractName == 'pass') extractName = 'password';
                    if(extractName == 'deletecode') extractValue = Number(extractValue);

                    // extractValue = extractValue.replace(/\s/g, '');
                    // extractName = extractName.replace(/\s/g, '');
                    allRegForms[extractName] = extractValue
                }
                    return allRegForms
        }
        
        gameManager.findOne({
            id: 1
        },async (err,res)=>{
            if(err){
                console.log(err)
                return message.channel.send(`Unfortunately an error happened. Please try again later. If this persist, tell my Partner!`);
            }
            if(res){
                //to register & delete acc only
                if(res.status.register == 1){
                    gameAccs.findOne({
                        account_userID: issuer.id
                    },async(err2,res2)=>{
                        if(err2) return console.log(err2)
                        if(!res2){
                            //#region Look for register channel if exist else create
                            let myChan = message.guild.channels.cache.find(ch => ch.name == `register-${issuer.id}`)
                            if(!myChan) myChan = message.guild.channels.create(`register-${issuer.id}`, {
                                type: 'text',
                                permissionOverwrites: [
                                   {
                                     id: message.guild.id,
                                     deny: ['VIEW_CHANNEL'],
                                  },
                                  {
                                      id: issuer.id,
                                      allow: ['VIEW_CHANNEL']
                                  }
                                ],
                              }).then(ch => {
                                  myChan = ch
                              })
                              //#endregion
                            setTimeout(() => {
                                let playerForm = {
                                    stage: "register",
                                    sessionID: issuer.id,
                                    formId: null,
                                    formCh: null,
                                    strikes: 0,
                                    questioned: 0,
                                    starting_date: Date.now(),
                                    menuNavigationState: {
                                        statPos: 1,
                                        doneWithName: false,
                                        doneWithRace: false,
                                        doneWithGender: false,
                                    },
                                    stats: {
                                        name: `*Choose a __name!__*`,
                                        race: {
                                            type: `*Choose a race!*`,
                                            sub_type: 0
                                        },
                                        gender: `*Choose a gender!*`,
                                        hp: 130,
                                        mana: 0,
                                        stamina: 100,

                                        attack: 20,
                                        power: 0,
                                        defense: 0,
                                        endurance: 0,
                                        intelligence: 0,
                                        agility: 10,
                                        
                                        available: 10,
                                        spent: 0
                                    },
                                    pointsSpent: {
                                        attack: 0,
                                        power: 0,
                                        defense: 0,
                                        endurance: 0,
                                        intelligence: 0,
                                        agility: 0,
                                    },
                                }
                                //#region MenuCreationEmbed
                                let menuCreationEmbed = new SharuruEmbed()
                                .setAuthor(`Welcome to ${gameData.gameName}'s Character Creation!`)
                                .setDescription(`You have \`10\` points available to add in the **Stats Area**!
                                Also please choose: Your name, Origin and Gender!
                                *__(Failing to do so, would result in randomizing stats)__*

                                **Basic Info:**
                                - **Name**: ${playerForm.stats.name}
                                - **Origin**: ${playerForm.stats.race.type}
                                - **Gender**: ${playerForm.stats.gender}

                                **Stats Area:**
                                - **\`Health: ${playerForm.stats.hp}\`** [?](http://www.google.com "This stat can't be increased directly!")
                                - **\`Mana: ${playerForm.stats.mana}\`** [?](http://www.google.com "This stat can't be increased directly!")
                                - **\`Stamina: ${playerForm.stats.stamina}\`** [?](http://www.google.com "This stat can't be increased directly!")

                                - ❯__**Attack Damage**: ${playerForm.stats.ad}__ [?](http://www.google.com "Your Physical Damage")
                                - **Attack Power**: ${playerForm.stats.ap} [?](http://www.google.com "Your Magical Damage")
                                - **Intelligence**: ${playerForm.stats.intelligence} [?](http://www.google.com "Increases your mana")
                                - **Defense**: ${playerForm.stats.defense} [?](http://www.google.com "Your resistance to physical damage without armor. Simple terms: Makes your skin stronger to physical damage")
                                - **Endurance**: ${playerForm.stats.endurance} [?](http://www.google.com "Increases your hp")
                                - **Agility**: ${playerForm.stats.agility} [?](http://www.google.com "Increases your stamina")
                                
                                
                                **Points Available:** ${playerForm.stats.available}
                                
                                **Reminder:**
                                -> *The stat that is __underlined__ is the one currently selected!*
                                `)
                                .setColor("RANDOM")
                                .setFooter(`Ver. ${gameData.gameVersion}`)
                                //#endregion
                            
                                const row4 = new ActionRowBuilder().addComponents(
                                    new ButtonBuilder()
                                    .setCustomId(`select_up`)
                                    .setLabel(`Select Upper Stat`)
                                    .setStyle(ButtonStyle.Primary),

                                    new ButtonBuilder()
                                    .setCustomId(`select_down`)
                                    .setLabel(`Select Lower stat`)
                                    .setStyle(ButtonStyle.Primary),

                                    new ButtonBuilder()
                                    .setCustomId(`rem_point`)
                                    .setLabel(`Remove 1 point`)
                                    .setStyle(ButtonStyle.Primary),

                                    new ButtonBuilder()
                                    .setCustomId(`add_point`)
                                    .setLabel(`Add 1 point`)
                                    .setStyle(ButtonStyle.Primary)
                                )
                                const row5 = new ActionRowBuilder().addComponents(
                                    new ButtonBuilder()
                                    .setCustomId(`name`)
                                    .setLabel(`Set name`)
                                    .setStyle(ButtonStyle.Primary),

                                    new ButtonBuilder()
                                    .setCustomId(`origin`)
                                    .setLabel(`Select origin`)
                                    .setStyle(ButtonStyle.Primary),

                                    new ButtonBuilder()
                                    .setCustomId(`gender`)
                                    .setLabel(`Select gender`)
                                    .setStyle(ButtonStyle.Primary),

                                    new ButtonBuilder()
                                    .setCustomId(`confirm`)
                                    .setLabel(`Confirm`)
                                    .setStyle(ButtonStyle.Success),

                                    new ButtonBuilder()
                                    .setCustomId(`cancel`)
                                    .setLabel(`Exit`)
                                    .setStyle(ButtonStyle.Danger)
                                )
                                myChan.send({content: `${issuer}`,embeds: [menuCreationEmbed], components: [row4,row5]}).then(msg =>{
                                    playerForm.formCh = msg.channel.id;
                                    playerForm.formId = msg.id;
                                    this.client.game_one.set(issuer.id,playerForm);
                                })
                            }, 500);// settimeout
                        }
                    })
                }
                //to login & play only
                if(res.status.login == 1) {
                    let myChan = message.guild.channels.cache.find(ch => ch.name == `${gameData.gameName.toLowerCase()}-${issuer.tag.replace("#","").toLowerCase()}`)
                    //console.log(`Channel Name: ${message.channel.name}\nName: "${gameData.gameName.toLowerCase()}-${issuer.tag.replace("#","").toLowerCase()}"`)
                    if(myChan != undefined || myChan != null){
                        console.log(`set existent channel for ${issuer.tag}!`)
                    } else {
                        console.log(`created channel for user!`)
                        myChan = message.guild.channels.create(`${gameData.gameName}-${issuer.tag}`, {
                            type: 'text',
                            permissionOverwrites: [
                               {
                                 id: message.guild.id,
                                 deny: ['VIEW_CHANNEL'],
                              },
                              {
                                  id: issuer.id,
                                  allow: ['VIEW_CHANNEL']
                              }
                            ],
                        }).then(ch => {
                            myChan = ch
                        })
                    }
                    let gameManagerSettings = {
                        accID: 0,
                        msgID: 0,
                        mainWhile: false,
                        menuSession: false,
                        newsSession: false,
                        mailSession: false,
                        mapSession: false,
                        settingsSession: false,
                        travelSession: false,
                        messageMapCache: [],
                        mapPosition: {
                            x:1,
                            y:2,
                        },
                        battleSettings:{
                            fighting: false,
                            startin_time: Date.now(),
                            isPowerfulMob: Math.floor(Math.random()*3)+1,
                        },
                        playerStats:{},
                        mobStats: {}
                    }
                    let ntt = {
                        1:"malseade",
                        2:"bewenwich",
                        3:"gazion",
                        4:"ateshobury",
                        5:"makinton",
                        6:"bretleton",
                        7:"skiptonz",
                        8:"oswesbuton",
                        9:"gabing",
                    }
                    setTimeout(() => {
                        let playerForm = {
                            stage: "game",
                            sessionID: issuer.id,
                            formId: null,
                            formCh: myChan.id,
                            formG: message.guild.id,
                            navigationState: "menu",
                            player_data: null,
                            warned: 0,
                            ranAway: 0
                        }
                        Object.defineProperty(playerForm, "stage", { configurable: false, writable: false }) // property descriptor can't be defined again. 
                        let menuEmbed = new SharuruEmbed()
                        .setDescription(`What would you like to do?
                        - Map (explore)
                        - News (updates game and events)
                        - Mailbox (view, send, receive content)
                        - Settings (to do)
                        - Logout (exit game)`)
                        .setColor(`RANDOM`)
                        .setFooter(`If the game lag sometimes, just wait a few seconds.`)
                        gameAccs.findOne({
                            account_userID: issuer.id
                        },async (err2,res2) =>{
                            if (err2){
                                sendError.create({
                                    Guild_Name: message.guild.name,
                                    Guild_ID: message.guild.id,
                                    User: issuer.tag,
                                    UserID: issuer.id,
                                    Error: err2,
                                    Time: `${TheDate} || ${clock} ${amORpm}`,
                                    Command: this.name + " - searching for user account in db",
                                    Args: args,
                                },async (err2, res2) => {
                                    if(err2) {
                                        console.log(err2)
                                        return message.channel.send(`[Game-${gameData.gameName}] Unfortunately an problem appeared while trying to log an error in db! Please try again later. If this problem persist, contact my partner!`)
                                    }
                                    if(res2) {
                                        console.log(`successfully added error to database!`)
                                        return message.channel.send(`[Game-${gameData.gameName}] Unfortunately an problem appeared while trying to login in the game. Please try again later. If this problem persist, contact my partner!`)
                                    }
                                })
                            }
                            if (res2)
                                playerForm.player_data = res2
                        })
                        const row_game = new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                            .setCustomId(`map`)
                            .setLabel(`Open Map`)
                            .setStyle(ButtonStyle.Primary),

                            new ButtonBuilder()
                            .setCustomId(`news`)
                            .setLabel(`News`)
                            .setStyle(ButtonStyle.Primary),

                            new ButtonBuilder()
                            .setCustomId(`mail`)
                            .setLabel(`Mailbox`)
                            .setStyle(ButtonStyle.Primary),

                            new ButtonBuilder()
                            .setCustomId(`settings`)
                            .setLabel(`Settings`)
                            .setStyle(ButtonStyle.Primary),

                            new ButtonBuilder()
                            .setCustomId(`exit`)
                            .setLabel(`Exit game`)
                            .setStyle(ButtonStyle.Primary)
                        )
                        
                        myChan.send({content: `${issuer}`, embeds: [menuEmbed], components: [row_game]}).then(msg =>{
                            playerForm.formId = msg.id
                            this.client.game_one.set(issuer.id,playerForm);
                        })
                        return;
                        // old code
                    myChan.send(`Hello ${issuer}, please log in by typing:\n\`username: yourUsernameHere, password: yourPasswordHere\` and after type \`login\`.`).then(async msg =>{
                        let filter = m => m.author.id == issuer.id
                        
                        console.log(`User logged: ${gameManagerSettings.username} with pass: ${gameManagerSettings.password}`)
                        let menuEmbed = new SharuruEmbed()
                            .setDescription(`What would you like to do?
                            - Map (explore and move)
                            - News (updates game and events)
                            - Mailbox (view, send)
                            - Settings (Change: email, password, security questions, delete Code)
                            - Logout (exit game)`)
                            .setColor(`RANDOM`)
                            .setFooter(`If the game lag sometimes, just wait like a few seconds.`)
                            filter = m => m.author.id == issuer.id
                            myChan.send(menuEmbed).then(async msg =>{
                                gameManagerSettings.msgID = msg.id
                                while(gameManagerSettings.mainWhile == true){
                                    await myChan.awaitMessages({filter,max: 1, time: 300000}).then(async collected =>{
                                        let an = collected.first().content
                                        collected.first().delete()
                                        switch(an){
                                            case "sim":
                                                fight_mob(gameManagerSettings, myChan, filter, message);
                                                break;
                                            case "map":
                                                console.log(`map`)
                                                gameManagerSettings.mapSession = true
                                                menuEmbed.setDescription(`This is the map of Orboria! To travel from your current location (${detectLocationMap(0,gameManagerSettings.mapPosition.x,gameManagerSettings.mapPosition.y,'normal',true)}) to any place, type \`travel\`!`)
                                                .setImage(`https://media.discordapp.net/attachments/768885595228864513/828563686430867486/orburia.png`)
                                                sendResponseGame(gameManagerSettings.msgID,menuEmbed,myChan)
                                                while(gameManagerSettings.mapSession){
                                                    await myChan.awaitMessages(filter, {max:1, time: 300000}).then(async mapCollected =>{
                                                        let mapAnswer = mapCollected.first().content.toLowerCase();

                                                        //send user back
                                                        if(mapAnswer == 'back' || mapAnswer == 'menu') {
                                                            backToMainMenu(menuEmbed, gameManagerSettings, message, myChan, mapCollected);
                                                        }

                                                        //explore the map: move up, left, down, right
                                                        if(mapAnswer == 'travel'){
                                                            console.log(`travelling`)
                                                            gameManagerSettings.travelSession = true
                                                            gameManagerSettings.mapSession = false
                                                            menuEmbed.setDescription(`Where to, adventurer? Choose a direction where to go based on your location on map. Below you have a basic knowledge (after exploring) of distance between cities:
                                                                - Malseade ${showDistanceTowns(gameManagerSettings.mapPosition,`malseade`,gameManagerSettings.playerStats.visitedCities)}
                                                                - Bewenwich Capital ${showDistanceTowns(gameManagerSettings.mapPosition,`bewenwich`,gameManagerSettings.playerStats.visitedCities)}
                                                                - Gazion ${showDistanceTowns(gameManagerSettings.mapPosition,`gazion`,gameManagerSettings.playerStats.visitedCities)}
                                                                - Ateshobury ${showDistanceTowns(gameManagerSettings.mapPosition,`ateshobury`,gameManagerSettings.playerStats.visitedCities)}
                                                                - Makinton ${showDistanceTowns(gameManagerSettings.mapPosition,`makinton`,gameManagerSettings.playerStats.visitedCities)}
                                                                - Bretleton ${showDistanceTowns(gameManagerSettings.mapPosition,`bretleton`,gameManagerSettings.playerStats.visitedCities)}
                                                                - Skiptonz ${showDistanceTowns(gameManagerSettings.mapPosition,`skiptonz`,gameManagerSettings.playerStats.visitedCities)}
                                                                - Oswesbuton ${showDistanceTowns(gameManagerSettings.mapPosition,`oswesbuton`,gameManagerSettings.playerStats.visitedCities)}
                                                                - Gabin ${showDistanceTowns(gameManagerSettings.mapPosition,`gabin`,gameManagerSettings.playerStats.visitedCities)}
                                                                `)
                                                                .setColor(`RANDOM`)
                                                                mapCollected.first().delete();
                                                                sendResponseGame(gameManagerSettings.msgID,menuEmbed,myChan)
                                                            while (gameManagerSettings.travelSession == true) {
                                                                await myChan.awaitMessages({filter,max:1, time: 60000}).then(async collectedTravel =>{
                                                                    let travelAnswer = collectedTravel.first().content;
                                                                    // if(travelAnswer == 'back' || travelAnswer == 'menu'){
                                                                    //     backToMainMenu(menuEmbed, gameManagerSettings, message, myChan, mapCollected);
                                                                    // }
                                                                    switch (travelAnswer) {
                                                                        case "back":
                                                                            gameManagerSettings.mapSession = true
                                                                            gameManagerSettings.travelSession = false
                                                                            menuEmbed.setDescription(`Where to, adventurer? Choose a direction where to go based on your location on map. Below you have a basic knowledge (after exploring) of distance between cities:
                                                                            - Malseade ${showDistanceTowns(gameManagerSettings.mapPosition,`malseade`,gameManagerSettings.playerStats.visitedCities)}
                                                                            - Bewenwich Capital ${showDistanceTowns(gameManagerSettings.mapPosition,`bewenwich`,gameManagerSettings.playerStats.visitedCities)}
                                                                            - Gazion ${showDistanceTowns(gameManagerSettings.mapPosition,`gazion`,gameManagerSettings.playerStats.visitedCities)}
                                                                            - Ateshobury ${showDistanceTowns(gameManagerSettings.mapPosition,`ateshobury`,gameManagerSettings.playerStats.visitedCities)}
                                                                            - Makinton ${showDistanceTowns(gameManagerSettings.mapPosition,`makinton`,gameManagerSettings.playerStats.visitedCities)}
                                                                            - Bretleton ${showDistanceTowns(gameManagerSettings.mapPosition,`bretleton`,gameManagerSettings.playerStats.visitedCities)}
                                                                            - Skiptonz ${showDistanceTowns(gameManagerSettings.mapPosition,`skiptonz`,gameManagerSettings.playerStats.visitedCities)}
                                                                            - Oswesbuton ${showDistanceTowns(gameManagerSettings.mapPosition,`oswesbuton`,gameManagerSettings.playerStats.visitedCities)}
                                                                            - Gabin ${showDistanceTowns(gameManagerSettings.mapPosition,`gabin`,gameManagerSettings.playerStats.visitedCities)}
                                                                            `)
                                                                            .setColor(`RANDOM`)
                                                                            sendResponseGame(gameManagerSettings.msgID,menuEmbed,collectedTravel.first().channel)
                                                                            saveGameData(gameManagerSettings);
                                                                            deleteMapCache(sharuru.test2,myChan)
                                                                            break;
                                                                        case "menu":
                                                                            deleteMapCache(sharuru.test2,myChan)
                                                                            menuEmbed.setDescription(`What would you like to do?
                                                                            - Map (explore and move)
                                                                            - News (updates game and events)
                                                                            - Mailbox (view, send)
                                                                            - Settings (Change: email, password, security questions, delete Code)
                                                                            - Logout (exit game)`)
                                                                            .setColor(`RANDOM`)
                                                                            .setFooter(`If the game lag sometimes, just wait like a few seconds.`)
                                                                            gameManagerSettings.travelSession = false
                                                                            gameManagerSettings.mapSession = false
                                                                            saveGameData(gameManagerSettings);
                                                                            backToMainMenu(menuEmbed, gameManagerSettings, message, myChan, collectedTravel);
                                                                            break;
                                                                        case "up":
                                                                            moveOnMap('up', gameManagerSettings, collectedTravel,myChan,menuEmbed)
                                                                            break;
                                                                        case "left":
                                                                            moveOnMap('left', gameManagerSettings, collectedTravel,myChan,menuEmbed)
                                                                            break;
                                                                        case "right":
                                                                            moveOnMap('right', gameManagerSettings, collectedTravel,myChan,menuEmbed)
                                                                            break;
                                                                        case "down":
                                                                            moveOnMap('down', gameManagerSettings, collectedTravel,myChan,menuEmbed)
                                                                            break;
                                                                        case "con":
                                                                            console.log(sharuru.test2)
                                                                            break;
                                                                        default:
                                                                            console.log(`option not recognized, doing nothing`)
                                                                            break;
                                                                    }
                                                                }).catch(err => {
                                                                    // to do if they don't respond to map
                                                                    console.log(`Error at travel option`)
                                                                    console.log(err)
                                                                })  
                                                            }
                                                        }
                                                    }).catch(err =>{
                                                        console.log(`Error happened when they typed "travel" in map session`)
                                                        console.log(err);
                                                    })
                                                }
                                                break;
                                            case "menu":
                                                menuEmbed.setDescription(`What would you like to do?
                                                - Map (explore and move)
                                                - News (updates game and events)
                                                - Mail (view, send)
                                                - Settings (Change: email, password, security questions, delete Code)
                                                - Logout (exit game)`)
                                                sendResponseGame(gameManagerSettings.msgID,menuEmbed,message,myChan.id)
                                                break;
                                            case 'news':
                                                menuEmbed.setDescription(`Not yet Implemented!`)
                                                sendResponseGame(gameManagerSettings.msgID,menuEmbed,message,myChan.id)
                                                break;
                                            case 'mailbox':
                                                menuEmbed.setDescription(`Not yet Implemented!!`)
                                                sendResponseGame(gameManagerSettings.msgID,menuEmbed,message,myChan.id)
                                                break;
                                            case 'settings':
                                                menuEmbed.setDescription(`Account settings available to change. Type the keyword that is present in the paranthesis and follow the guide to change.
                                                - Change email (email)
                                                - Change password (pass/password)
                                                - Change Security Question 1 (sq)
                                                - Change Security Question 2 (sq2)
                                                - Change Security Question 3 (sq3)
                                                - Change Security Answer 1 (sa)
                                                - Change Security Answer 2 (sa2)
                                                - Change Security Answer 3 (sa3)
                                                - Change Security Delete Code (deletecode)
                                                - Delete My account (deleteaccount)`)
                                                sendResponseGame(gameManagerSettings.msgID,menuEmbed,message,myChan.id)
                                                gameManagerSettings.settingsSession = true
                                                while(gameManagerSettings.settingsSession){
                                                    await myChan.awaitMessages(filter, {max:1, time: 150000}).then(async settingCollected =>{
                                                        let settingAnswer = settingCollected.first().content;
                                                        settingCollected.first().delete();
                                                        if(settingAnswer == 'back' || settingAnswer == 'menu') {
                                                            console.log(`go back`)
                                                            menuEmbed.setDescription(`What would you like to do?
                                                            - Map (explore and move)
                                                            - News (updates game and events)
                                                            - Mail (view, send)
                                                            - Settings (Change: email, password, security questions, delete Code)
                                                            - Logout (exit game)`)
                                                            sendResponseGame(gameManagerSettings.msgID,menuEmbed,message,myChan.id)
                                                            gameManagerSettings.menuSession = true;
                                                            gameManagerSettings.settingsSession = false;
                                                        }
                                                        gameAccs.findOne({
                                                            account_userLogin: gameManagerSettings.username
                                                        },async(err,res)=>{
                                                            if(err){
                                                                console.log(err)
                                                                return myChan.send(`Unfortunately a problem appeared when changing emails. Please try again later. If this problem persist, contant my partner.`)
                                                            }
                                                            if(res){
                                                                if(settingAnswer == 'email'){
                                                                        myChan.send(`Currently, your email is: \`${res.account_email.substring(0,3)}****${res.account_email.substring(res.account_email.indexOf("@"))}\`.Please type the new email:`)
                                                                        myChan.awaitMessages({filter,max:1,time:60000}).then(async newMail =>{
                                                                            newMail.first().delete();
                                                                            let newEmail = newMail.first().content
                                                                            if(newEmail){
                                                                                newEmail = newEmail.trim();
                                                                                let notPass = false;
                                                                                let msgBack = ``
                                                                                if (newEmail.search("@") == -1 && (newEmail.search(".com") == -1 || newEmail.search(".uk") == -1)) {
                                                                                    notPass = true
                                                                                    msgBack += `The email entered isn't a valid one!`
                                                                                }
                                                                                if(notPass == false) {
                                                                                    res.account_email = newEmail;
                                                                                    myChan.send(`The email has been updated sucessfully!`)
                                                                                    res.save().catch(err => console.log(err))
                                                                                }
                                                                                else myChan.send(msgBack)
                                                                            }
                                                                        }).catch(err =>{
                                                                            myChan.send(`Because It took you more than 1 min to provide a new email, you will have to type again the keyword setting you wanna change.`)
                                                                        })
                                                                }
                                                                if (settingAnswer == 'pass' || settingAnswer == 'password') {
                                                                    myChan.send(`Currently, your password is: \`${res.account_password.substring(0,2)}***\`.Please type the new password:`)
                                                                        myChan.awaitMessages({filter,max:1,time:60000}).then(async newPass =>{
                                                                            newPass.first().delete()
                                                                            let newPassword = newPass.first().content
                                                                            if(newPassword){
                                                                                let UpperCaseLetters = 0;
                                                                                let notPass = false
                                                                                let msgBack = ``
                                                                                if(newPassword.length < 6 || newPassword.length > 20) {
                                                                                    notPass = true
                                                                                    msgBack += `- Your password must have at least 6 characters and not over 20.\n`
                                                                                }
                                                                                for(let i = 0; i < newPassword.length; i++){
                                                                                    if(newPassword[i] == newPassword[i].toUpperCase() && isNaN(newPassword[i])) {
                                                                                        UpperCaseLetters++
                                                                                    }
                                                                                }
                                                                                if(UpperCaseLetters == 0) {
                                                                                    notPass = true;
                                                                                    msgBack += `- Your password must have at least an uppercase!\n`
                                                                                }
                                                                                if(/[0-9]{2}/g.test(newPassword) == false) {
                                                                                    notPass = true;
                                                                                    msgBack += `- Your password must have at least 2 numbers!\n`
                                                                                }
                                                                                if(notPass == false) { 
                                                                                    res.account_password = newPassword;
                                                                                    res.save().catch(err=>console.log(err))
                                                                                    myChan.send(`The password has been successfully updated`)
                                                                                } else myChan.send(msgBack)
                                                                            }
                                                                        }).catch(err =>{
                                                                            myChan.send(`Because It took you more than 1 min to provide a new password, you will have to type again the keyword setting you wanna change.`)
                                                                        })
                                                                }
                                                                if (settingAnswer == 'sq'){
                                                                    myChan.send(`Currently, your securit question 1 is: \`${res.account_security.question1}\`.Please type the new security question:`)
                                                                        myChan.awaitMessages({filter,max:1,time:60000}).then(async newsq =>{
                                                                            newsq.first().delete()
                                                                            let newSq1 = newsq.first().content
                                                                            if(newSq1){
                                                                                newSq1 = newSq1.trim();
                                                                                let notPass = false;
                                                                                let msgBack = ``
                                                                                if (newSq1.length < 5 || newSq1.length > 100) {
                                                                                    notPass = true
                                                                                    msgBack += `Please write security question 1 to have more than 5 characters and less than 100!`;
                                                                                }
                                                                                if(notPass == false) {
                                                                                    res.account_security.question1 = newSq1
                                                                                    res.save().catch(err => console.log(err))
                                                                                    myChan.send(`Your security question 1 has been updated successfully!`)
                                                                                } else myChan.send(msgBack)
                                                                            }
                                                                        }).catch(err =>{
                                                                            myChan.send(`Because It took you more than 1 min to provide a new security question, you will have to type again the keyword setting you wanna change.`)
                                                                        })
                                                                }
                                                            }
                                                        })
                                                    }).catch(err =>{
                                                        console.log(`User didn't responded in the time frame. Resorting to mainMenu`)
                                                        myChan.send(`Since you didn't take any more actions, I returned you to the main menu!`)
                                                        .setDescription(`What would you like to do?
                                                        - Map (explore and move)
                                                        - News (updates game and events)
                                                        - Mail (view, send)
                                                        - Settings (Change: email, password, security questions, delete Code)
                                                        - Logout (exit game)`)
                                                        sendResponseGame(gameManagerSettings.msgID,menuEmbed,message,myChan.id)
                                                        gameManagerSettings.menuSession = true;
                                                        gameManagerSettings.settingsSession = false;
                                                    })
                                                }
                                                break;
                                            case 'logout':
                                                menuEmbed.setDescription(`Bye bye!`)
                                                sendResponseGame(gameManagerSettings.msgID,menuEmbed,message,myChan.id)
                                                gameManagerSettings.mainWhile = false
                                                gameAccs.findOne({
                                                    account_userLogin: gameManagerSettings.username
                                                },async (err4,res4)=>{
                                                    if(err4){
                                                        console.log(err4)
                                                        return myChan.send(`Unfortunately an error happened while trying to save data of the account at logout. Please try again later. If this persist, please contact my partner.`)
                                                    }
                                                    if(res4){
                                                        console.log(`editing info acc to logout`)
                                                        res4.account_session_active = false
                                                        res4.save()
                                                    }
                                                })
                                                setTimeout(() => {
                                                    myChan.delete(`GAME: ${res.gname} | Session ended by user. ${issuer.tag}`)
                                                }, 3500);
                                                break;
                                            default:
                                                console.log(`No option, ignoring this one...`)
                                        }
                                    }).catch(err =>{
                                        // console.log(err)
                                        console.log(`The user didn't respond in the time frame for mainMenu, loggin out the user.`)
                                        myChan.send(`Since you didn't take any more actions in a while, I ended the game session. The channel will be deleted in 5 min.`)
                                        menuEmbed.setDescription(`Bye bye!`)
                                            sendResponseGame(gameManagerSettings.msgID,menuEmbed,myChan)
                                            gameManagerSettings.mainWhile = false
                                            gameChars.findOne({
                                                account_userLogin: gameManagerSettings.username
                                            },async (err4,res4)=>{
                                                if(err4){
                                                    console.log(err4)
                                                    return myChan.send(`Unfortunately an error happened while trying to save data of the account at logout. Please try again later. If this persist, please contact my partner.`)
                                                }
                                                if(res4){
                                                    console.log(`editing info acc to logout`)
                                                    res4.account_session_active = false
                                                    res4.save()
                                                }
                                            })
                                            setTimeout(() => {
                                                myChan.delete(`GAME: ${res.gname} | Session ended by user.`)
                                            }, 300000);
                                    })
                                }
                            })
                        })
                    }, 400);
                }//end of login & play only
                if(res.status.login == 0 && res.status.register == 0 && res.status.maintenance == 0) return message.channel.send(`sorry but ${res.gname} isn't available at the moment!`);
                if(res.status.login == 0 && res.status.register == 0 && res.status.maintenance == 1) return message.channel.send(`sorry but ${res.gname} is under maintenance! The maintenance will take about ${pms(res.maintenanceTime-Date.now())}`);    
            } else {//create game manager
                gameManager.create({
                    id: 1,
                    gname: `TestGame`,
                    status: `alpha`,
                })
                console.log(`created game settings id:1`)
            }
        })
    
    async function fightingSystem(gameManager, message_object, fightMode, menuEmbed){
        console.log(`in fighting system`)
        if(fightMode == 'pvp'){

        }
        if(fightMode == 'pve'){
            let searchMob = false;
            let searchMobID = 0;
            let getMobLevel = `${gameManager.mapPosition.x}-${gameManager.mapPosition.y}`
            let filter = m => m.author.id == issuer.id
            console.log(`in pve system: ${getMobLevel}`)
            if(MobListSpawn[getMobLevel].length > 1){
                // select a random enemy from the pool
                console.log(`system decided for normal monster`)
                gameManager.travelSession = false
                gameManager.battleSettings.fighting = true
                searchMob = true
                searchMobID = MobListSpawn[Math.floor(Math.random * MobListSpawn[getMobLevel].length)]
            }
            if(MobListSpawn[getMobLevel].length == 1){
                // select the only one mob
                console.log(`system decided for stronger monster`)
                gameManager.travelSession = false
                gameManager.battleSettings.fighting = true
                searchMob = true
                searchMobID = MobListSpawn[getMobLevel]
            }
            if(MobListSpawn[getMobLevel].length < 1){
                // well if that zone isn't one with mobs then that means what it means: do nothing
                console.log(`no mobs detected, doing nothing`)
            }
            if(searchMob){
                gameMobs.findOne({
                    id: searchMobID
                },async(err,res)=>{
                    if(err) {
                        console.log(`ERROR WITH USER ACCOUNT: ${gameManager.username} on: ${TheDate} || at ${clock} ${amORpm}`)
                        console.log(err)
                        return message.channel.send(`unfortunately an error happened. please try again later. if this error persist, please contact my partner`)
                    }
                    if(res){
                        console.log(`found mob data: ${res.name}`)
                        gameManager.mobStats = res;
                        
                        if (gameManager.battleSettings.isPowerfulMob == 1) {
                            console.log(`normal monsters`)
                            menuEmbed.setDescription()
                            .addFields([
                                {name:`You:`,value:`
                                **HP**: ${gameManager.playerStats.hp}/${gameManager.playerStats.maxHP}
                                **Magicules**: ${gameManager.playerStats.mana}/${gameManager.playerStats.maxMana}
                                **AD**: ${gameManager.playerStats.ad}
                                **AP**:  ${gameManager.playerStats.ap}
                                **Armor**: ${gameManager.playerStats.armor}
                                **Magic Armor**: ${gameManager.playerStats.magicArmor}
                                **Endurance**: ${gameManager.playerStats.endurance}
                                **Agility**: ${gameManager.playerStats.agility}
                                **Stamina**: ${gameManager.playerStats.stamina}
                                **Critical Chance**: ${gameManager.playerStats.critChance}%
                                **Critical Damage**: ${gameManager.playerStats.critDamage}%
                                **Dodge**: ${gameManager.playerStats.dodge}%
                                **Block**: ${gameManager.playerStats.block}
                                **Parry**: ${gameManager.playerStats.parry}%
                                **Life Steal**: ${gameManager.playerStats.lifesteal}%
                                **Spell Duration**: ${gameManager.playerStats.spelldur}%
                                `,inline: true},
                                {name:gameManager.mobStats.name,value:`
                                **HP**: ${gameManager.mobStats.hp}/${gameManager.mobStats.maxHP}
                                **Magicules**: ${gameManager.mobStats.mana}/${gameManager.mobStats.maxMana}
                                **AD**: ${gameManager.mobStats.ad}
                                **AP**:  ${gameManager.mobStats.ap}
                                **Armor**: ${gameManager.mobStats.armor}
                                **Magic Armor**: ${gameManager.mobStats.magicArmor}
                                **Endurance**: ${gameManager.mobStats.endurance}
                                **Agility**: ${gameManager.mobStats.agility}
                                **Stamina**: ${gameManager.mobStats.stamina}
                                **Critical Chance**: ${gameManager.mobStats.critChance}%
                                **Critical Damage**: ${gameManager.mobStats.critDamage}%
                                **Dodge**: ${gameManager.mobStats.dodge}%
                                **Block**: ${gameManager.mobStats.block}
                                **Parry**: ${gameManager.mobStats.parry}%
                                **Life Steal**: ${gameManager.mobStats.lifesteal}%
                                **Spell Duration**: ${gameManager.mobStats.spelldur}%
                                `,inline: true},
                                {name:`Actions`,value:`
                                - Attack
                                - Abilities 
                                - Backpack
                                - Run (if possible)`,inline: false},// to do: the mechanic if monster is low level, see stats from start, if medium, need to use appraisal, if high, fail to use appraisal or show just a few
                                //+ to make the choices for the actions and the infinite loop
                            ])
                        }
                        if (gameManager.battleSettings.isPowerfulMob == 2) {
                            console.log(`strong monster`)
                            menuEmbed.setDescription()
                            .addFields([
                            {name:`You:`,value:`
                            **HP**: ${gameManager.playerStats.hp}/${gameManager.playerStats.maxHP}
                            **Magicules**: ${gameManager.playerStats.mana}/${gameManager.playerStats.maxMana}
                            **AD**: ${gameManager.playerStats.ad}
                            **AP**:  ${gameManager.playerStats.ap}
                            **Armor**: ${gameManager.playerStats.armor}
                            **Magic Armor**: ${gameManager.playerStats.magicArmor}
                            **Endurance**: ${gameManager.playerStats.endurance}
                            **Agility**: ${gameManager.playerStats.agility}
                            **Stamina**: ${gameManager.playerStats.stamina}
                            **Critical Chance**: ${gameManager.playerStats.critChance}%
                            **Critical Damage**: ${gameManager.playerStats.critDamage}%
                            **Dodge**: ${gameManager.playerStats.dodge}%
                            **Block**: ${gameManager.playerStats.block}
                            **Parry**: ${gameManager.playerStats.parry}%
                            **Life Steal**: ${gameManager.playerStats.lifesteal}%
                            **Spell Duration**: ${gameManager.playerStats.spelldur}%
                            `,inline: true},
                            {name:gameManager.mobStats.name,value:`
                            **HP**: ${gameManager.mobStats.hp}/${gameManager.mobStats.maxHP}
                            **Magicules**: ${gameManager.mobStats.mana}/${gameManager.mobStats.maxMana}
                            **AD**: ${gameManager.mobStats.ad}
                            **AP**:  ${gameManager.mobStats.ap}
                            **Armor**: ${gameManager.mobStats.armor}
                            **Magic Armor**: ${gameManager.mobStats.magicArmor}
                            **Endurance**: ${gameManager.mobStats.endurance}
                            **Agility**: ${gameManager.mobStats.agility}
                            **Stamina**: ${gameManager.mobStats.stamina}
                            **Critical Chance**: ${gameManager.mobStats.critChance}%
                            **Critical Damage**: ${gameManager.mobStats.critDamage}%
                            **Dodge**: ${gameManager.mobStats.dodge}%
                            **Block**: ${gameManager.mobStats.block}
                            **Parry**: ${gameManager.mobStats.parry}%
                            **Life Steal**: ${gameManager.mobStats.lifesteal}%
                            **Spell Duration**: ${gameManager.mobStats.spelldur}%
                            `,inline: true},
                            {name:`Actions`,value:`
                            - Attack
                            - Abilities 
                            - Backpack
                            - Run (if possible)`,inline: false},// to do: the mechanic if monster is low level, see stats from start, if medium, need to use appraisal, if high, fail to use appraisal or show just a few
                            //+ to make the choices for the actions and the infinite loop
                            ])
                            gameManager.mobStats.level*=2
                            gameManager.mobStats.hp*=2
                            gameManager.mobStats.mana*=2
                            gameManager.mobStats.ad*=2
                            gameManager.mobStats.ap*=2
                            gameManager.mobStats.armor*=2
                            gameManager.mobStats.magicArmor*=2
                            gameManager.mobStats.endurance*=2
                            gameManager.mobStats.agility*=2
                            gameManager.mobStats.stamina*=2
                            gameManager.mobStats.critChance*=2
                            gameManager.mobStats.critDamage*=2
                            gameManager.mobStats.dodge*=2
                            gameManager.mobStats.block*=2
                            gameManager.mobStats.parry*=2
                            gameManager.mobStats.lifesteal*=2
                            gameManager.mobStats.spelldur*=2
                            
                        }
                        if (gameManager.battleSettings.isPowerfulMob == 3) {
                            console.log(`very powerful monster`)
                            menuEmbed.setDescription()
                            .addFields([
                                {name:`You:`,value:`
                                **HP**: ${gameManager.playerStats.hp}/${gameManager.playerStats.maxHP}
                                **Magicules**: ${gameManager.playerStats.mana}/${gameManager.playerStats.maxMana}
                                **AD**: ${gameManager.playerStats.ad}
                                **AP**:  ${gameManager.playerStats.ap}
                                **Armor**: ${gameManager.playerStats.armor}
                                **Magic Armor**: ${gameManager.playerStats.magicArmor}
                                **Endurance**: ${gameManager.playerStats.endurance}
                                **Agility**: ${gameManager.playerStats.agility}
                                **Stamina**: ${gameManager.playerStats.stamina}
                                **Critical Chance**: ${gameManager.playerStats.critChance}%
                                **Critical Damage**: ${gameManager.playerStats.critDamage}%
                                **Dodge**: ${gameManager.playerStats.dodge}%
                                **Block**: ${gameManager.playerStats.block}
                                **Parry**: ${gameManager.playerStats.parry}%
                                **Life Steal**: ${gameManager.playerStats.lifesteal}%
                                **Spell Duration**: ${gameManager.playerStats.spelldur}%
                                `,inline: true},
                                {name:gameManager.mobStats.name,value:`
                                The opponent is too strong to see it's stats.Use "Appraisal" ability
                                to have a posibility to see it's stats!.`,inline: true},
                                {name:`Actions`,value:`
                                - Attack
                                - Abilities 
                                - Backpack
                                - Run (if possible)`,inline: false},// to do: the mechanic if monster is low level, see stats from start, if medium, need to use appraisal, if high, fail to use appraisal or show just a few
                                //+ to make the choices for the actions and the infinite loop
                            ])
                            gameManager.mobStats.level*=5
                            gameManager.mobStats.hp*=5
                            gameManager.mobStats.mana*=5
                            gameManager.mobStats.ad*=5
                            gameManager.mobStats.ap*=5
                            gameManager.mobStats.armor*=5
                            gameManager.mobStats.magicArmor*=5
                            gameManager.mobStats.endurance*=5
                            gameManager.mobStats.agility*=5
                            gameManager.mobStats.stamina*=5
                            gameManager.mobStats.critChance*=5
                            gameManager.mobStats.critDamage*=5
                            gameManager.mobStats.dodge*=5
                            gameManager.mobStats.block*=5
                            gameManager.mobStats.parry*=5
                            gameManager.mobStats.lifesteal*=5
                            gameManager.mobStats.spelldur*=5
                        }
                        console.log(`fighting now!`)
                        message_object.send(menuEmbed).then(async fightMsg =>{
                            while(gameManager.battleSettings.fighting && gameManager.mobStats.hp >= 1){
                                await message_object.awaitMessages({filter,max: 1, time: 60000}).then(async fightCollected =>{
                                    let userInput = fightCollected.first().content;

                                    if(userInput == 'attack') {
                                        console.log(`player used attack`)
                                        let firstMove = 1; // first move will be always for mob if the agility of the member is below the monster one
                                        let didPlayerCrit = Math.random() <= gameManager.playerStats.critChance;
                                        let physicalDamage = (gameManager.playerStats.ad * (1 + gameManager.playerWeapon.damage_physical_percentage_bonus) + gameManager.playerWeapon.damage_flat) - gameManager.mobStats.armor;
                                        let physicalDamageWithCrit = ((gameManager.playerStats.ad * (1 + gameManager.playerWeapon.damage_physical_percentage_bonus) + gameManager.playerWeapon.damage_flat) * (1 + gameManager.playerStats.critDamage/100)) - gameManager.mobStats.armor
                                        let playerDamage = physicalDamage

                                        //defining who's going to attack first: 0 => player; 1 => mob
                                        if (gameManager.playerStats.agility > gameManager.mobStats.agility + Math.floor(Math.random() * 5)) firstMove = 0;

                                        
                                        //if the player crits
                                        if (didPlayerCrit == true) {
                                            playerDamage = physicalDamageWithCrit;
                                            //to do: the dmg calculation after crit
                                        }

                                        //normally if they don't crit, do this: TO DO: LATER
                                        // if(gameManager.playerWeapon.active_buff.buff_elemental_enhancement !== 'none'){
                                        //     playerDamage
                                        // }
                                    }
                                    if(userInput == 'abilities') {
                                        console.log(`player used abilities`)
                                        let magicDamage = (gameManager.playerStats.ap * (1 + gameManager.playerWeapon.damage_elemental_percentage_bonus) + gameManager.playerWeapon.damage_flat) - gameManager.mobStats.magicArmor;
                                        let magicDamageWithCrit = ((gameManager.playerStats.ap * (1 + gameManager.playerWeapon.damage_elemental_percentage_bonus) + gameManager.playerWeapon.damage_flat) * (1 + gameManager.playerStats.critDamage/100))- gameManager.mobStats.magicArmor
                                    }
                                    if(userInput == 'backpack') {
                                        console.log(`player used backpack`)
                                    }
                                    if(userInput == 'run') {
                                        console.log(`player used run`)
                                    }
                                    if(userInput == 'menu') {
                                        gameManager.battleSettings.fighting = false
                                    }
                                })
                            }
                        })
                    }
                })
            }
        }
    }

    async function moveOnMap(direction,gameManager, theMessage,myChan,menuEmbed) {
        let { x, y } = gameManager.mapPosition
        let moveChances = [60,40]
        theMessage.first().delete()
        if(direction == 'up'){
            if(y >= 5) {
                myChan.send(`Going furthermore isn't good! Better remain here or go back...`)
                return
            }
            y += 1;
            if(x == 3 && y == 1) moveChances = [10,90]//malseade
            if(x == 3 && y == 2) moveChances = [5,95]//bewenwich
            if(x == 2 && y == 2) moveChances = [25,75]//gazion
            if(x == 1 && y == 2) moveChances = [35,65]//Ateshobury
            if(x == 3 && y == 3) moveChances = [20,80]//makinton
            if(x == 5 && y == 4) moveChances = [20,80]//skiptonz
            if(x == 3 && y == 4) moveChances = [20,80]//Bretleton
            if(x == 2 && y == 5) moveChances = [10,90]//oswesbuton
            if(x == 1 && y == 5) moveChances = [10,90]//gabing
            if(x == 3 && y == 5) moveChances = [100,1]//TEST ZONE 100% MOB
            console.log(`right above the thing: ${moveChances} (x:${x}, y:${y})`)
            let chanceToFight = percentageChance(['monster','nothing'],moveChances);
            console.log(chanceToFight)
            if(chanceToFight == 'monster'){
                //fight system
                // gameManager.mapPosition.y += 1;
                const playerMap = await createMap();
                myChan.send(`You started your journey and you met a monster! What do you do?`, playerMap).then(msg => {
                    gameManager.messageMapCache.push(msg)
                    fightingSystem(gameManager,myChan,'pve',menuEmbed)
                })
            }
            if(chanceToFight == 'nothing'){
                const playerMap = await createMap();
                myChan.send(`You started your journey and advanced forward a bit. Luckily you didn't met any monsters on the way.`,playerMap).then(msg => gameManager.messageMapCache.push(msg))
            }
        }
        if(direction == 'down'){
            if(y <= 1) {
                myChan.send(`Going furthermore isn't good! Better remain here or go back...`)
                return
            }
            if(x == 3 && y == 1) moveChances = [10,90]//malseade
            if(x == 3 && y == 2) moveChances = [5,95]//bewenwich
            if(x == 2 && y == 2) moveChances = [25,75]//gazion
            if(x == 1 && y == 2) moveChances = [35,65]//Ateshobury
            if(x == 3 && y == 3) moveChances = [20,80]//makinton
            if(x == 5 && y == 4) moveChances = [20,80]//skiptonz
            if(x == 3 && y == 4) moveChances = [20,80]//Bretleton
            if(x == 2 && y == 5) moveChances = [10,90]//oswesbuton
            if(x == 1 && y == 5) moveChances = [10,90]//gabing
            // to do: movement up
            let chanceToFight = percentageChance(['monster','nothing'],moveChances);
            if(chanceToFight == 'monster'){
                //fight system
                gameManager.mapPosition.y -= 1;
                const playerMap = await createMap();
                myChan.send(`You started your journey and you met a monster! What do you do? Your Position is now: x:${x}, y:${gameManager.mapPosition.y}`,playerMap).then(msg => gameManager.messageMapCache.push(msg))
            }
            if(chanceToFight == 'nothing'){
                gameManager.mapPosition.y -= 1;
                const playerMap = await createMap();
                myChan.send(`You started your journey and advanced forward a bit. Luckily you didn't met any monsters on the way. Your Position is now: x:${x}, y:${gameManager.mapPosition.y}`,playerMap).then(msg => gameManager.messageMapCache.push(msg))
            }
        }
        if(direction == 'left'){
            if(x <= 1) {
                myChan.send(`Going furthermore isn't good! Better remain here or go back...`)
                return
            }
            if(x == 3 && y == 1) moveChances = [10,90]//malseade
            if(x == 3 && y == 2) moveChances = [5,95]//bewenwich
            if(x == 2 && y == 2) moveChances = [25,75]//gazion
            if(x == 1 && y == 2) moveChances = [35,65]//Ateshobury
            if(x == 3 && y == 3) moveChances = [20,80]//makinton
            if(x == 5 && y == 4) moveChances = [20,80]//skiptonz
            if(x == 3 && y == 4) moveChances = [20,80]//Bretleton
            if(x == 2 && y == 5) moveChances = [10,90]//oswesbuton
            if(x == 1 && y == 5) moveChances = [10,90]//gabing
            // to do: movement up
            let chanceToFight = percentageChance(['monster','nothing'],moveChances);
            console.log(chanceToFight)
            if(chanceToFight == 'monster'){
                //fight system
                gameManager.mapPosition.x -= 1;
                const playerMap = await createMap();
                myChan.send(`You started your journey and you met a monster! What do you do? Your Position is now: x:${gameManager.mapPosition.x}, y:${y}`,playerMap).then(msg => gameManager.messageMapCache.push(msg))
            }
            if(chanceToFight == 'nothing'){
                gameManager.mapPosition.x -= 1;
                const playerMap = await createMap();
                myChan.send(`You started your journey and advanced forward a bit. Luckily you didn't met any monsters on the way. Your Position is now: x:${gameManager.mapPosition.x}, y:${y}`,playerMap).then(msg => gameManager.messageMapCache.push(msg))
            }
        }
        if(direction == 'right'){
            if(x >= 5) {
                myChan.send(`Going furthermore isn't good! Better remain here or go back...`)
                return 
            }
            if(x == 3 && y == 1) moveChances = [10,90]//malseade
            if(x == 3 && y == 2) moveChances = [5,95]//bewenwich
            if(x == 2 && y == 2) moveChances = [25,75]//gazion
            if(x == 1 && y == 2) moveChances = [35,65]//Ateshobury
            if(x == 3 && y == 3) moveChances = [20,80]//makinton
            if(x == 5 && y == 4) moveChances = [20,80]//skiptonz
            if(x == 3 && y == 4) moveChances = [20,80]//Bretleton
            if(x == 2 && y == 5) moveChances = [10,90]//oswesbuton
            if(x == 1 && y == 5) moveChances = [10,90]//gabing
            let chanceToFight = percentageChance(['monster','nothing'],moveChances);
            console.log(chanceToFight)
            if(chanceToFight == 'monster'){
                //fight system
                gameManager.mapPosition.x += 1;
                const playerMap = await createMap();
                myChan.send(`You started your journey and you met a monster! What do you do? Your Position is now: x:${gameManager.mapPosition.x}, y:${y}`, playerMap).then(msg => gameManager.messageMapCache.push(msg))
            }
            if(chanceToFight == 'nothing'){
                gameManager.mapPosition.x += 1;
                const playerMap = await createMap();
                myChan.send(`You started your journey and advanced forward a bit. Luckily you didn't met any monsters on the way. Your Position is now: x:${gameManager.mapPosition.x}, y:${y}`, playerMap).then(msg => gameManager.messageMapCache.push(msg))
            }
        }
        // console.log(gameManager.mapPosition)

        async function createMap() {
            let playerGridPosition = {
                x: {
                    1: 27,
                    2: 150,
                    3: 270,
                    4: 395,
                    5: 520,
                },
                y: {
                    1: 525,
                    2: 400,
                    3: 260,
                    4: 135,
                    5: 10
                }
            };
            let playerIconPositionsMap = {
                x: playerGridPosition.x[gameManager.mapPosition.x],
                y: playerGridPosition.y[gameManager.mapPosition.y]
            };
            const canvas = createCanvas(615, 656);
            const ctx = canvas.getContext("2d");

            const background = await loadImage(`./src/Assets/game_files/game_maps/orburia_grid.png`);
            ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

            // playerIconPositionsMap.x = 
            // playerIconPositionsMap.y = 
            console.log(playerIconPositionsMap);
            const playerIcon = await loadImage(`./src/Assets/game_files/game_markers/player2.png`);
            ctx.drawImage(playerIcon, playerIconPositionsMap.x, playerIconPositionsMap.y, 73, 120);

            const playerMap = new AttachmentBuilder(canvas.toBuffer(), 'map.png');
            return playerMap;
        }
    }

    
    function saveGameData(gameManager) {
        gameChars.findOne({
            id: gameManager.accID
        },(err,res)=>{
            if(err){
                console.log(err)
                return myChan.send(`Unfortunately an error happened. Please try again later. If this persist, tell my Partner!`);
            }
            if (res) {
                console.log(`found user: ${gameManager.accID}. Saving data...`)
                res.mapPosition = gameManager.mapPosition
                res.job = gameManager.job;
                res.abitilies = gameManager.abitilies;
                res.inventory = gameManager.inventory;
                res.equipped = gameManager.equipped;
                res.visitedCities = gameManager.visitedCities;
                //stats
                res.hp = gameManager.hp;
                res.mana = gameManager.mana;
                res.ad = gameManager.ad;
                res.ap = gameManager.ap;
                res.armor = gameManager.armor;
                res.magicArmor = gameManager.magicArmor;
                res.endurance = gameManager.endurance;
                res.agility = gameManager.agility;
                res.stamina = gameManager.stamina;
                res.critChance = gameManager.critChance;
                res.critDamage = gameManager.critDamage;
                res.dodge = gameManager.dodge;
                res.block = gameManager.block;
                res.parry = gameManager.parry
                res.lifesteal = gameManager.lifesteal
                res.spelldur = gameManager.spelldur
            }
            res.save().catch(err => console.log(err));
            console.log(`if nothing wrong happened, the data should be saved`)
        })
    }
    async function deleteMapCache(mapCache,channel) {
        if(mapCache.length > 0){
            if (mapCache.length > 100) {
                console.log(`deleted over 100 messages`)
                let messagesToDelete = mapCache.splice(0,100);
                channel.bulkDelete(messagesToDelete);
            }
            if (mapCache.length < 100) {
                let messagesToDelete = mapCache.splice(0,mapCache.length);
                console.log(`deleted under 100 messages`)
                channel.bulkDelete(messagesToDelete);
            }
            return await deleteMapCache(mapCache,channel);
        } else return 0;
    }
    function sendResponseGame(msgid,theEmbed,channel) {
        channel.messages.fetch(msgid).then(thisThing =>{
            thisThing.edit(theEmbed)
        })
    }
    function backToMainMenu(menuEmbed, gameManagerSettings, message, myChan, awaitMsgCollected) {
        console.log(`go back`);
        menuEmbed.setDescription(`What would you like to do?
        - Map (explore)
        - News (updates game and events)
        - Mail (view, send)
        - Settings (Change: email, password, security questions, delete Code)
        - Logout (exit game)`)
        .setImage(``)
        .setColor('RANDOM')
        sendResponseGame(gameManagerSettings.msgID, menuEmbed, message, myChan.id);
        awaitMsgCollected.first().delete();
    }
	}//end of command running
};



//not finished
function fight_mob(gameManagerSettings, myChan, filter, message) {
    let battleEmbed = new SharuruEmbed()
        .setAuthor(`A ${gameManagerSettings.battleSettings.mobName} appeared in front of you! What would you do?`)
        .setDescription(`1) Fight!\n2)Run`)
        .setColor(`RANDOM`)
        .setFooter(`You have ${pms(30000 - (Date.now() - gameManagerSettings.battleSettings.startin_time))} left to answer! If you don't answer, you will die.`);
    myChan.send(battleEmbed).then(async (msg) => {
        myChan.awaitMessages(filter, { max: 1, time: 30000 }).then(async (fightOrNot) => {
            let ans = fightOrNot.first().content;
            if (ans == 'fight') {
                gameChars.findOne({
                    id: gameManagerSettings.accID
                }, async (err5, res5) => {
                    if (err5) {
                        console.log(err5);
                        return myChan.send(`Unfortunately an error happened. Please try again later. If this persist, tell my Partner!`);
                    }
                    if (res5) {
                        // to do: continue creating the interface for the game fight, fetch the data from gameChars and then show it in the interface
                        if (gameManagerSettings.battleSettings == 1) {
                            //weak monster: always shows everything
                            battleEmbed.addFields([
                                { name: `You`, value: `HP: ${res5.hp}  |  Mana: ${res5.mana}\nAD: ${res5.ad}  |  AP: ${res5.ap}\nArmor: ${res5.armor} |  Magic Armor: ${res5.magicArmor}\nEndurance: ${res5.endurance}  |  Agility: ${res5.agility}\nCrit Chance: ${res5.critChance}%\nCrit Damage: ${res5.critDamage}%\nDodge: ${res5.dodge}% | Block: ${res5.block}\nParry: ${res5.parry}%` },
                                { name: gameManagerSettings.battleSettings.mobName, value: `HP: ${gameManagerSettings.mobStats.hp}  |  Mana: ${gameManagerSettings.mobStats.mana}\nAD: ${gameManagerSettings.mobStats.ad}  |  AP: ${gameManagerSettings.mobStats.ap}\nArmor: ${gameManagerSettings.mobStats.armor} |  Magic Armor: ${gameManagerSettings.mobStats.magicArmor}\nEndurance: ${gameManagerSettings.mobStats.endurance}  |  Agility: ${gameManagerSettings.mobStats.agility}\nCrit Chance: ${gameManagerSettings.mobStats.critChance}%\nCrit Damage: ${gameManagerSettings.mobStats.critDamage}%\nDodge: ${gameManagerSettings.mobStats.dodge}% | Block: ${gameManagerSettings.mobStats.block}\nParry: ${gameManagerSettings.mobStats.parry}%` },
                            ])
                                .setDescription(`What you will do?:\n-Attack (atk)\n-Run (run)`);
                        }
                        if (gameManagerSettings.battleSettings == 2) {
                            //normal monster: unknown but possible to see using apraissal
                        }
                        if (gameManagerSettings.battleSettings == 3) {
                            //strong: unknown and impossible to use apprail on it.
                        }
                        myChan.send(battleEmbed);
                    }
                });
            } else {
                myChan.send(`You ran away from a little slime. Are you sure you wanna play this game?`);
            }
        });
    });
}
function showDistanceTowns(mapPosition,location,visitedCities) {
    const { x, y } = mapPosition;
    let distances = {
        malseade:{
            bewenwich: 24,
            gazion: 26,
            ateshubury: 38,
            makinton: 42,
            bretleton: 54,
            skiptonz: 69,
            oswesbuton: 68,
            gabing: 77
        },
        bewenwich:{
            malseade: 24,
            gazion: 18,
            ateshubury: 40,
            makinton: 23,
            bretleton: 34,
            skiptonz: 46,
            oswesbuton: 53,
            gabing: 65
        },
        gazion:{
            malseade: 26,
            bewenwich: 18,
            ateshubury: 22,
            makinton: 17,
            bretleton: 30,
            skiptonz: 56,
            oswesbuton: 42,
            gabing: 52
        },
        ateshubury:{
            malseade: 38,
            bewenwich: 40,
            gazion: 22,
            makinton: 33,
            bretleton: 43,
            skiptonz: 75,
            oswesbuton: 44,
            gabing: 46
        },
        makinton:{
            malseade: 41,
            bewenwich: 23,
            gazion: 17,
            ateshubury: 33,
            bretleton: 13,
            skiptonz: 42,
            oswesbuton: 30,
            gabing: 43
        },
        bretleton:{
            malseade: 54,
            bewenwich: 34,
            gazion: 30,
            ateshubury: 43,
            makinton: 13,
            skiptonz: 37,
            oswesbuton: 22,
            gabing: 38
        },
        skiptonz:{
            malseade: 70,
            bewenwich: 46,
            gazion: 56,//
            ateshubury: 75,
            makinton: 42,
            skiptonz: 37,
            oswesbuton: 56,
            gabing: 73
        },
        skiptonz:{
            malseade: 70,
            bewenwich: 46,
            gazion: 56,//
            ateshubury: 75,
            makinton: 42,
            skiptonz: 37,
            oswesbuton: 56,
            gabing: 73
        },
        oswesbuton:{
            malseade: 68,
            bewenwich: 53,
            gazion: 42,//
            ateshubury: 44,
            makinton: 29,
            skiptonz: 56,
            bretleton: 22,
            gabing: 16
        },
        gabing:{
            bewenwich: 65,
            gazion: 52,
            ateshubury: 46,
            makinton: 43,
            bretleton: 38,
            skiptonz: 72,
            oswesbuton: 16,
            malseade: 77
        },
    }
    let ttn = {
        "malseade":3,
        "bewenwich":8,
        "gazion":9,
        "ateshobury":10,
        "makinton":13,
        "bretleton":18,
        "skiptonz":16,
        "oswesbuton":24,
        "gabing":25,
    }
    let citiesLocation = {
        malseade:{
            x: 3,
            y: 1
        },
        bewenwich:{
            x: 3,
            y: 2
        },
        gazion:{
            x: 4,
            y: 2
        },
        ateshobury:{
            x: 5,
            y: 2
        },
        makinton:{
            x: 3,
            y: 3
        },
        bretleton:{
            x: 3,
            y: 4 
        },
        skiptonz:{
            x: 1,
            y: 4
        },
        oswesbuton:{
            x: 4,
            y: 5
        },
        gabing:{
            x: 5,
            y: 5
        },
    }
    let ntt = {
        3:"malseade",
        8:"bewenwich",
        9:"gazion",
        10:"ateshobury",
        13:"makinton",
        18:"bretleton",
        16:"skiptonz",
        24:"oswesbuton",
        25:"gabing",
    }
    let showme = ``
    if(ntt[detectLocationMap(0,x,y,'normal')] == location) return showme = `(Currently here)`
    if(ntt[detectLocationMap(0,x,y,'normal')] != location && visitedCities[ttn[location]] == true && (citiesLocation[location].x == x && citiesLocation[location].y == y)){
        console.log(`debug`)
        // if(!isNaN(distances[detectLocationMap(0,x,y,'normal',true,false)])){
            showme = `(${distances[detectLocationMap(0,x,y,'normal',true,false)][location]} miles away)`
            return showme
        // }
    }
    showme = `(?? miles away)`
    return showme
}

function create_acc_char(uniqueID, issuer, registerForm, logChannel, stats) {
    gameAccs.create({
        account_id: uniqueID,
        account_guild_session_Name: `logout`,
        account_guild_session_ID: `logout`,
        account_user: issuer.tag,
        account_userID: issuer.id,
        account_userLogin: registerForm.user,
        account_email: registerForm.email,
        account_password: registerForm.password,
        account_security: {
            question1: registerForm.question1,
            answer1: registerForm.answer1,
            question2: registerForm.question2,
            answer2: registerForm.answer2,
            question3: registerForm.question3,
            answer3: registerForm.answer3,
            deleteCode: parseInt(registerForm.deleteCode)
        },
        account_create_time: Date.now()
    }, (err, res) => {
        if (err) {
            logChannel.send(`An error happened while creating gameAccs doc:\n${err.stack}`);
            return console.log(err);
        }
        if (res) {
            console.log(`${issuer.tag} created their account! Doc saved successfully!`);
        }
    });
    gameChars.create({
        id: uniqueID,
        name: stats.name,
        familyName: `NOT IMPLEMENTED`,
        origin: stats.race,
        gender: stats.gender,
        // age: String,
        citiesTravalledTo:{
            "1":true,
            "2":false,
            "3":false,
            "4":false,
            "5":false,
            "6":false,
            "7":false,
            "8":false,
            "9":false
        },
        job: `None`,
        hp: stats.hp,
        mana: stats.mana,
        ad: stats.ad,
        ap: stats.ap,
        armor: stats.armor,
        magicArmor: stats.magicArmor,
        endurance: stats.endurance,
        agility: stats.agility,
        stamina: stats.stamina,
        critChance: stats.critChance,
        critDamage: stats.critDamage,
        dodge: stats.dodge,
        block: stats.block,
        parry: stats.parry,
        lifesteal: stats.lifesteal,
        spelldur: stats.spelldur
    }, (err, res) => {
        if (err) {
            logChannel.send(`An error happened while creating gameChars doc char:\n${err.stack}`);
            return console.log(err);
        }
        if (res) {
            console.log(`${issuer.tag} created their character! Doc saved successfully!`);
        }
    });
}
function popQuestion(questions) {
    let getQ = questions[Math.floor(Math.random() * questions.length)];
    let getA = ``
    if(getQ == "question1") getA = `answer1`
    if(getQ == "question2") getA = `answer2`
    if(getQ == "question3") getA = `answer3`
    let obj = {getQ,getA}
    questions.splice(getQ,1);
    return obj
}

function detectLocationMap(mapPos, mapPositionX, mapPositionY, mode, nameCities,keepWildness) {
    let mapNumber = 1
    if (!nameCities) nameCities = false;
    let ntt = {
        3:"malseade",
        8:"bewenwich",
        9:"gazion",
        10:"ateshobury",
        13:"makinton",
        18:"bretleton",
        16:"skiptonz",
        24:"oswesbuton",
        25:"gabing",
    }
    if (mode == 'normal'){
        if (mapPositionX == 1 && mapPositionY == 1) mapNumber = 1
        if (mapPositionX == 1 && mapPositionY == 2) mapNumber = 2
        if (mapPositionX == 1 && mapPositionY == 3) mapNumber = 3
        if (mapPositionX == 1 && mapPositionY == 4) mapNumber = 4
        if (mapPositionX == 1 && mapPositionY == 5) mapNumber = 5
        if (mapPositionX == 2 && mapPositionY == 1) mapNumber = 6
        if (mapPositionX == 2 && mapPositionY == 2) mapNumber = 7
        if (mapPositionX == 2 && mapPositionY == 3) mapNumber = 8
        if (mapPositionX == 2 && mapPositionY == 4) mapNumber = 9
        if (mapPositionX == 2 && mapPositionY == 5) mapNumber = 10
        if (mapPositionX == 3 && mapPositionY == 1) mapNumber = 11
        if (mapPositionX == 3 && mapPositionY == 2) mapNumber = 12
        if (mapPositionX == 3 && mapPositionY == 3) mapNumber = 13
        if (mapPositionX == 3 && mapPositionY == 4) mapNumber = 14
        if (mapPositionX == 3 && mapPositionY == 5) mapNumber = 15
        if (mapPositionX == 4 && mapPositionY == 1) mapNumber = 16
        if (mapPositionX == 4 && mapPositionY == 2) mapNumber = 17
        if (mapPositionX == 4 && mapPositionY == 3) mapNumber = 18
        if (mapPositionX == 4 && mapPositionY == 4) mapNumber = 19
        if (mapPositionX == 4 && mapPositionY == 5) mapNumber = 20
        if (mapPositionX == 5 && mapPositionY == 1) mapNumber = 21
        if (mapPositionX == 5 && mapPositionY == 2) mapNumber = 22
        if (mapPositionX == 5 && mapPositionY == 3) mapNumber = 23
        if (mapPositionX == 5 && mapPositionY == 4) mapNumber = 24
        if (mapPositionX == 5 && mapPositionY == 5) mapNumber = 25

        if (nameCities == true){
            if (ntt.hasOwnProperty(mapNumber)) {
                mapNumber = ntt[mapNumber]
            }
            if (keepWildness == true ) mapNumber = `wildness`
        }
        return mapNumber;
    }
    if (mode == 'reverse'){
        let mapposobj = {}
        if(mapPos == 1) return mapposobj = {x: 1,y: 1};
        if(mapPos == 2) return mapposobj = {x: 1,y: 2};
        if(mapPos == 3) return mapposobj = {x: 1,y: 3};
        if(mapPos == 4) return mapposobj = {x: 1,y: 4};
        if(mapPos == 5) return mapposobj = {x: 1,y: 5};
        if(mapPos == 6) return mapposobj = {x: 2,y: 1};
        if(mapPos == 7) return mapposobj = {x: 2,y: 2};
        if(mapPos == 8) return mapposobj = {x: 2,y: 3};
        if(mapPos == 9) return mapposobj = {x: 2,y: 4};
        if(mapPos == 10) return mapposobj = {x: 2,y: 5};
        if(mapPos == 11) return mapposobj = {x: 3,y: 1};
        if(mapPos == 12) return mapposobj = {x: 3,y: 2};
        if(mapPos == 13) return mapposobj = {x: 3,y: 3};
        if(mapPos == 14) return mapposobj = {x: 3,y: 4};
        if(mapPos == 15) return mapposobj = {x: 3,y: 5};
        if(mapPos == 16) return mapposobj = {x: 4,y: 1};
        if(mapPos == 17) return mapposobj = {x: 4,y: 2};
        if(mapPos == 18) return mapposobj = {x: 4,y: 3};
        if(mapPos == 19) return mapposobj = {x: 4,y: 4};
        if(mapPos == 20) return mapposobj = {x: 4,y: 5};
        if(mapPos == 21) return mapposobj = {x: 5,y: 1};
        if(mapPos == 22) return mapposobj = {x: 5,y: 2};
        if(mapPos == 23) return mapposobj = {x: 5,y: 3};
        if(mapPos == 24) return mapposobj = {x: 5,y: 4};
        if(mapPos == 25) return mapposobj = {x: 5,y: 5};
    }
}

