const { SlashCommandBuilder, ChatInputCommandInteraction, Colors } = require('discord.js');
const SharuruEmbed = require("../../Structures/SharuruEmbed");
const sendError = require("../../Models/Error");
const ms = require("ms");
const pms = require("pretty-ms");
const config = require("../../../config.json")
const snow_players = require("../../Models/events/snowball/snowball_players");
const guildSettings = require('../../Models/GuildSettings');


module.exports = {
    data: new SlashCommandBuilder()
        .setName("snow")
        .setDescription("Welcome to Snowy Challenge!")
        .addSubcommand(collect =>
            collect.setName("gather")
            .setDescription("Gather snow!")
        )
        .addSubcommand(throww =>
            throww.setName("throw")// will need to aim at a member, soon choosing either him or his snowman
            .setDescription("Throw a snowball towards someone!")
            .addUserOption(input =>
                input.setName("member")
                .setDescription("Select a member to throw the snowball at!")
                .setRequired(true))
            .addStringOption(input =>
                input.setName("bonus")
                .setDescription("Think if you wanna shoot him or his snowman!")
                .addChoices(
                    {name: "Him!", value: "player"},
                    {name: "His Snowman!!", value: "snowman"},
                ))
        )
        .addSubcommand(stats =>
            stats.setName("stats")
            .setDescription("Show your current statistics in this Christmas Event!")
        )
        .addSubcommand(learderboard =>
            learderboard.setName("top")
            .setDescription("Show the leaderboard!")
        )
        .addSubcommand(wdizzy =>
            wdizzy.setName("whosdizzy")
            .setDescription("Who was hit last time? Maybe u can remember...")
        )
        .addSubcommandGroup(settings =>
            settings.setName("settings")
            .setDescription("Show some settings that can be changed in the event!")
            .addSubcommand(display =>
                display.setName("display")
                .setDescription("Display the current settings of the event!")
            )
            .addSubcommand(channels =>
                channels.setName("channels")
                .setDescription("Select specific channels where the command is allowed to be used!")
                .addChannelOption(channel =>
                    channel.setName("input")
                    .setDescription("The specified channel to process!")
                    .setRequired(true)
                )
                .addChannelOption(channel =>
                    channel.setName("input2")
                    .setDescription("The specified channel! Optional to process second channel!")
                )
                .addChannelOption(channel =>
                    channel.setName("input3")
                    .setDescription("The specified channel! Optional to process third channel!")
                )
                .addChannelOption(channel =>
                    channel.setName("input4")
                    .setDescription("The specified channel! Optional to process fourth channel!")
                )
                .addChannelOption(channel =>
                    channel.setName("input5")
                    .setDescription("The specified channel! Optional to process fifth channel!")
                )
            )
            .addSubcommand(gather =>
                gather.setName("gather")
                .setDescription("Set the cooldown (in seconds) of the gather command! It's applied to each user individually!")
                .addIntegerOption(input =>
                    input.setName("input")
                    .setDescription("Minimum 15s and max 1800s (30min)")
                    .setMinValue(15)
                    .setMaxValue(1800)
                    .setRequired(true)
                )
            )
            .addSubcommand(throww =>
                throww.setName("throw")
                .setDescription("Set the cooldown (in seconds) of the throw command! It's applied to each user individually!")
                .addIntegerOption(input =>
                    input.setName("input")
                    .setDescription("Minimum 15s and max 1800s (30min)")
                    .setMinValue(15)
                    .setMaxValue(1800)
                    .setRequired(true)
                )
            )
            .addSubcommand(dizzyEffect =>
                dizzyEffect.setName("dizzy_effect")
                .setDescription("Dizzy effect stops member from gathering/throwing! It's applied to each user individually!")
                .addIntegerOption(input =>
                    input.setName("input")
                    .setDescription("Set the cooldown (in seconds). Minimum 15s and max 1800s (30min)")
                    .setMinValue(15)
                    .setMaxValue(1800)
                    .setRequired(true)
                )
            )
            .addSubcommand(dizzyList =>
                dizzyList.setName("dizzy_list")
                .setDescription("Set the cooldown (in seconds) of the 'whodizzy' command!")
                .addIntegerOption(input =>
                    input.setName("input")
                    .setDescription("Minimum 15s and max 1800s (30min)")
                    .setMinValue(15)
                    .setMaxValue(1800)
                    .setRequired(true)
                )
            )
            .addSubcommand(immunity =>
                immunity.setName("immunity")
                .setDescription("Immunity effect blocks incoming dizzy effects! It's applied to each user individually!")
                .addIntegerOption(input =>
                    input.setName("input")
                    .setDescription("Set the duration (in seconds). Minimum 5s and max 900s (15min)")
                    .setMinValue(5)
                    .setMaxValue(900)
                    .setRequired(true)
                )
            )
            .addSubcommand(welcome =>
                welcome.setName("welcome")
                .setDescription("Some info about the event!!")
            )
            .addSubcommand(switchh =>
                switchh.setName("switch")
                .setDescription("Turn the event on/off!")
            )
            .addSubcommand(lockStatsTopChannels =>
                lockStatsTopChannels.setName("lockstats")
                .setDescription("Set a separate channel where \"stats\" && \"top\" commands can be used only there!")
                .addChannelOption(channel =>
                    channel.setName("input")
                    .setDescription("The specified channel to process!")
                    .setRequired(true)
                )
            )
            
        )
        ,
        /**
         * 
         * @param {ChatInputCommandInteraction} interaction 
         */
    async execute(interaction) {

        //#region Time variables
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
        //#endregion

        //#region const variables
        const issuer = interaction.user;
		const tools = interaction.client.utils;
		const logChannel = interaction.member.guild.channels.cache.find(ch => ch.name == "sharuru-logs");
		const prefix = interaction.client.prefixes.get(interaction.guildId);
		const optionListAdmin = ['welcome','switch','settings']
		const optionListUser = ['gather','throw','stats','top','leaderboard','whosdizzy']
		const subCommandGroupOption = interaction.options.getSubcommandGroup() ?? null;
		const subCommandOption = interaction.options.getSubcommand();
		const gameName = `Snowy Challenge!`
        const hexToDecimal = hex => parseInt(hex,16);
        const randomColor = Math.floor(Math.random() * 16777214) + 1
        //#endregion

        //#region Event Gifs
        let beautiful_christmas_emojis = [
			`https://cdn.discordapp.com/attachments/769228052165033994/921413339899383818/2021_Snowsgiving_Emojis_001_Icons_copy_3.png`,
			`https://cdn.discordapp.com/attachments/769228052165033994/921413339710627930/2021_Snowsgiving_Emojis_001_Icons.png`,
			`https://cdn.discordapp.com/attachments/769228052165033994/921413339366719569/2021_Snowsgiving_Emojis_001_Present.png`,
			`https://cdn.discordapp.com/attachments/769228052165033994/921413339169583154/2021_Snowsgiving_Emojis_001_Snumpus.png`,
			`https://cdn.discordapp.com/attachments/769228052165033994/921413338985009152/2021_Snowsgiving_Emojis_001_Stars.png`,
			`https://cdn.discordapp.com/attachments/769228052165033994/921413338745937981/2021_Snowsgiving_Emojis_001_Tree.png`,
		]
        let snowballMakerPool = [
			`https://media.discordapp.net/attachments/769228052165033994/921432703449038908/anime-roll-snow.gif`,
			`https://cdn.discordapp.com/attachments/769228052165033994/921432703734272011/jackfrost-snowball.gif`,
			`https://cdn.discordapp.com/attachments/769228052165033994/921432704044642396/test-over-de-as.gif`,
		]
		let dizzyGifs = [
			`https://cdn.discordapp.com/attachments/769228052165033994/921447821268353054/d4dj-first-mix-anime.gif`,
			`https://cdn.discordapp.com/attachments/769228052165033994/921447821582929950/haruhi-anime.gif`,
			`https://cdn.discordapp.com/attachments/769228052165033994/921447821838807100/raichu-faint.gif`
		]
		let dodgeDizzy = [
			`https://cdn.discordapp.com/attachments/769228052165033994/921484602701406208/tiantian-snow.gif`,
			`https://cdn.discordapp.com/attachments/769228052165033994/921484603255050240/corgi-dog.gif`,
			`https://cdn.discordapp.com/attachments/769228052165033994/921484603972263986/homer-simpson-simpsons.gif`
		]
		let immunityGifs = [
			`https://cdn.discordapp.com/attachments/769228052165033994/922571902315290694/anime-speed.gif`,
			`https://cdn.discordapp.com/attachments/769228052165033994/922571902873129042/inazuma-eleven-go-inago.gif`,
			`https://cdn.discordapp.com/attachments/769228052165033994/922571903338704956/one-punch-man-saitama.gif`,
		]
        let dodgeGifs = [
            `https://cdn.discordapp.com/attachments/769228052165033994/921448598833614908/SecondGraveIguanodon-size_restricted.gif`,
            `https://cdn.discordapp.com/attachments/769228052165033994/921448599215276042/snowball-anime.gif`,
            `https://cdn.discordapp.com/attachments/769228052165033994/921448599714426900/tumblr_inline_nlwbu5gXqW1res4w4540.gif`
        ]
        let hitGifs = [
            `https://cdn.discordapp.com/attachments/769228052165033994/921448883991773184/8bDm.gif`,
            `https://cdn.discordapp.com/attachments/769228052165033994/921448884503474206/bff1.gif`,
            `https://cdn.discordapp.com/attachments/769228052165033994/921448885120032848/DBvbJ4grTZuOgR3YyWClia4g2PTX-G3Z_Y76SoEvNaNRVGk_rEkRIno2SB1n0Qa8udiXO1Tticj0WABBL7YqFA.gif`
        ]
        let sharuruHit = [
            `https://cdn.discordapp.com/attachments/769228052165033994/922468644829667339/anime-angry.gif`,
            `https://cdn.discordapp.com/attachments/769228052165033994/922468645127467028/date-a-live-rage.gif`,
            `https://cdn.discordapp.com/attachments/769228052165033994/922468645446221844/mad-anime.gif`
        ]
        //#endregion

        //#region Message Responses

        let noResponse = [

        ]

        let not_throwing_yourself = [
            `You can't throw at yourself...`,
            `Are you for real? You wanna throw a snowball at yourself??`,
            `If your desire to get a snowball in face is that big, why not gather a lot of snow and jump in it?`,
            `Better put that snowball at down and use it for something more useful...`
        ]

        let miss_throw = [
            `Aw, even after trying really hard to aim, <user2> was too nimble and dodged! Next time will be better <user>!`,
            `Ah! This sun! It had to aid <user2> and that caused you to miss!! Get some sunglasses next time <user> :) `,
            `Imagine if <user2> was standing still... what a great life would have been, right <user>?`,
            `For real, what's with this strong wind?!? All snowballs of <user> missed <user2>!`,
            `<user>, it seems like after throwing many snowballs before, it caused your aim to be a bit sloppy and miss <user2>...`
        ]

        let hit_throw = [
            `<user>, a straight shot! <user2> didn't see it coming!`,
            `<user>: Victory! <user2> was successfully hit!`,
            `<user>: Bullseye! (<user2>)`,
            `<user>, <user2> was too slow to even think about dodging this one!`,
            `<user>, I think that was the best throwing technique that was ever seen in the history of snowball techniques in the world!!! <user2> needs more training in dodging if they wishes to not get hit by you!`,
            `<user2> was so bamboozled by that snowball that he's now daydreaming! Congrats <user>!`
        ]

        //#endregion

        let eventEmbed = new SharuruEmbed()
            .setAuthor({name: `Christmas Event: ${gameName}!`,iconURL: `https://cdn.discordapp.com/attachments/769228052165033994/921408133635670016/2021_Snowsgiving_Emojis_001_Snowflake.png`})
            .setThumbnail(beautiful_christmas_emojis[Math.floor(Math.random() * beautiful_christmas_emojis.length)])
            .setColor(hexToDecimal("Bfffff"))  
            .setFooter({text: `Emojis are provided by talented artists that participated in Discord Snowsgiving 2021 & 2022!`})

        guildSettings.findOne({
            ID: interaction.guildId
        }, async (err, res) =>{
            if (err) {
				sendError.create({
					Guild_Name: interaction.member.guild.name,
					Guild_ID: interaction.guildId,
					User: issuer.tag,
					UserID: issuer.id,
					Error: err,
					Time: `${TheDate} || ${clock} ${amORpm}`,
					Command: this.name+" looking in guild db",
					Args: `interaction`,
				},async (err, res) => {
					if(err) {
						console.log(err)
						interaction.reply(`[Snowy Event] Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
						return logChannel.send(`[Snowy Event] Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
					}
					if(res) {
						console.log(`successfully added error to database!`)
					}
				})
			}
            if (res) {

				let is_staff = interaction.member.roles.cache.find(r => r.id === res.importantData.staffRole)
                
                //#region subcommands without group
                if (subCommandGroupOption == null && subCommandOption == "gather") {
                    // try in the right channel !
                    if (res.events.snowball.channels.length > 0 && !res.events.snowball.channels.includes(interaction.channelId)) {
                        let availableChannels = res.events.snowball.channels.map(it => it = `<#${it}>`)
                        let noEmbed = new SharuruEmbed()
                            .setDescription(`${issuer}, you cannot use this command here! Head over to ${availableChannels.join(", ")} to use it!`)
                            .setColor(Colors.Orange)
                            .setImage(`https://cdn.discordapp.com/attachments/769228052165033994/1057410816883822703/qoobee-no-no-nonono.gif`)
                        return rep({embeds: [noEmbed], ephemeral: true})
                    }

                    snow_players.findOne({
                        userID: issuer.id,
                    },(err2,player)=>{
                        if (err2) {
                            sendError.create({
                                Guild_Name: interaction.member.guild.name,
                                Guild_ID: interaction.guildId,
                                User: issuer.tag,
                                UserID: issuer.id,
                                Error: err2,
                                Time: `${TheDate} || ${clock} ${amORpm}`,
                                Command: this.name+" gather snow",
                                Args: `interaction`,
                            },async (err, res) => {
                                if(err) {
                                    console.log(err)
                                    interaction.reply(`[Snowy Event] Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                    return logChannel.send(`[Snowy Event] Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                }
                                if(res) {
                                    console.log(`successfully added error to database!`)
                                }
                            })
                        }
                        if(player){
                            let playerData = player.guilds_data;
                            let playerServerData = playerData.get(interaction.guildId);

                            // if the player plays this event in a new server!
                            if (!playerServerData) {
                                let newServerData = {
                                    snowballs: 0,
                                    whenWasDizzy: 0,
                                    immunityPeriod: 0,
                                    cooldowns:  {
                                        collect: 0,
                                        throw: 0,
                                    },
                                    stats: {
                                        directHits: 0,
                                        totalMisses: 0, 
                                        knockedOut: 0,
                                        snowballsCollected: 0, 
                                    },
                                }
                                //player.guilds_data.set(interaction.guildId,newServerData)
                                playerServerData = newServerData
                            }
                            // check if player cooldown to gather is done
                            if (Date.now() < playerServerData.cooldowns.collect) {
                                eventEmbed.setDescription(`You've already gathered all the snow around! Take a small break or throw the current snowballs and wait for more snow to fall for more snowballs...`)
                                return rep({embeds: [eventEmbed], ephemeral: true})
                            }
                            // check if player is dizzy, otherwise can collect
                            if (Date.now() < playerServerData.whenWasDizzy) {
                                eventEmbed.setDescription(`Aw, you're still dizzy from the last snowball fight and u can't do anything...`)
                                eventEmbed.setImage(dizzyGifs[Math.floor(Math.random()* dizzyGifs.length)]);
                                return rep({embeds: [eventEmbed], ephemeral: true})
                            }
                            
                            playerServerData.cooldowns.collect = Date.now()+ res.events.snowball.cooldowns.collect;
                            playerServerData.snowballs++;
                            playerServerData.stats.snowballsCollected++;
                            player.guilds_data.set(interaction.guildId,playerServerData)
                            eventEmbed.setDescription(`Focused and equipped with a good pair of gloves, you gathered some snow to form a snowball. You got \`${playerServerData.snowballs}\` snowball(s)`)
                            eventEmbed.setImage(snowballMakerPool[Math.floor(Math.random()* snowballMakerPool.length)]);
                            playerData.set(interaction.guildId,playerServerData)
                            snow_players.updateOne({
                                'userID': issuer.id
                            },{'$set':{ 'guilds_data' : playerData}},(erro,reso)=>{
                                if (erro) {
                                    sendError.create({
                                        Guild_Name: interaction.member.guild.name,
                                        Guild_ID: interaction.guildId,
                                        User: issuer.tag,
                                        UserID: issuer.id,
                                        Error: erro,
                                        Time: `${TheDate} ${clock} ${amORpm}`,
                                        Command: this.name + `, throw function collect`,
                                        Args: `interaction`,
                                    },async (errr, ress) => {
                                        if(errr) {
                                            console.log(errr)
                                            return console.log(`Unfortunately an problem appeared in snow.js while trying to log an error. This is an additional error!`)
                                        }
                                        if(ress) {
                                            console.log(`successfully added error to database!`)
                                            console.log(err); 
                                            logChannel.send(`[Snowball Event] An error happened while trying to save data for player ${issuer.id} when using \`collect\` command!`)
                                        }
                                    })
                                    return;
                                }
                                if(reso) {
                                    console.log(`[Snowball Event]: Updated ${issuer.tag} snowball data: collect`)
                                }
                            });
                            // player.save().catch(err => { console.log(err); })
                            return rep({embeds: [eventEmbed]})
                        } else { // if player doens't exist in db
                            // console.log(`not exist`)
                            eventEmbed.setDescription(`Focused and equipped with a good pair of gloves, you gathered some snow to form a snowball. You got \`1\` snowball!`)
                            eventEmbed.setImage(snowballMakerPool[Math.floor(Math.random()* snowballMakerPool.length)]);
                            let mapGuilds = new Map()
                            let newServerData = {
                                snowballs: 1,
                                whenWasDizzy: 0,
                                immunityPeriod: 0,
                                cooldowns:  {
                                    collect: Date.now()+ res.events.snowball.cooldowns.collect,
                                    throw: 0,
                                },
                                stats: {
                                    directHits: 0,
                                    totalMisses: 0, 
                                    knockedOut: 0,
                                    snowballsCollected: 1, 
                                },
                            }
                            mapGuilds.set(interaction.guildId,newServerData)
                            snow_players.create({
                                userName: issuer.tag,
                                userID: issuer.id,
                                guilds_data: mapGuilds,
                            })
                            return rep({embeds: [eventEmbed]})
                        }
                    })
                    return;
                }

                if (subCommandGroupOption == null && subCommandOption == "throw") {
                    /**
                     * verify if:
                     * - issuer isn't targeting itself
                     * - is in the right channel
                     * - target is in the guild
                     */
                    //#region Verify Checks
                    if (res.events.snowball.channels.length > 0 && !res.events.snowball.channels.includes(interaction.channelId)) {
						let availableChannels = res.events.snowball.channels.map(it => it = `<#${it}>`)
						let noEmbed = new SharuruEmbed()
							
							.setDescription(`${issuer}, you cannot use this command here! Head over to ${availableChannels.join(", ")} to use it!`)
							.setColor(Colors.Orange)
							.setImage(`https://cdn.discordapp.com/attachments/769228052165033994/1057410816883822703/qoobee-no-no-nonono.gif`)
                        return rep({embeds: [noEmbed], ephemeral: true})
					}

					let target_player = interaction.options.getUser("member");
                    let player_or_snowman = interaction.options.getString("bonus");

					if (!interaction.member.guild.members.cache.get(target_player.id)) {
						eventEmbed.setDescription(`I couldn't find this person in the server, are you sure they're not hiding?`)
                        return rep({embeds: [eventEmbed], ephemeral: true})
					}
					if (target_player.id == issuer.id) {
						eventEmbed.setDescription(not_throwing_yourself[Math.floor(Math.random() * not_throwing_yourself.length)])
                        return rep({embeds: [eventEmbed]})
					}
                    //#endregion

                    snow_players.findOne({
                        userID: issuer.id
                    },async(err2, player_issuer) =>{
                        if (err2) {
							sendError.create({
								Guild_Name: interaction.member.guild.name,
								Guild_ID: interaction.guildId,
								User: issuer.tag,
								UserID: issuer.id,
								Error: err2,
								Time: `${TheDate} || ${clock} ${amORpm}`,
								Command: this.name+" throw command",
								Args: `slash command`,
							},async (err, res) => {
								if(err) {
									console.log(err)
									rep({content: `[Snowy Event] Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`})
									return logChannel.send(`[Snowy Event] Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
								}
								if(res) {
									console.log(`successfully added error to database!`)
								}
							})
						}
                        if (player_issuer) {
                            /**
                             * Verify if 
                             * - issuer can throw
                             * - has snowballs
                             * - isn't dizzy
                             * - 
                             */

                            let playerData = player_issuer.guilds_data;
                            let playerServerData = playerData.get(interaction.guildId);
                            

                            if (!playerServerData) {
                                eventEmbed.setDescription(`I'm sorry but you didn't go outside yet to gather snowballs! Try again after doing that! (P.S: please use /snow gather)`)
                                return rep({embeds: [eventEmbed], ephemeral: true})
                            }
                            console.log(`test: throw-player issuer`)
                            //#region Verify Checks
                            if (Date.now() < playerServerData.cooldowns.throw) {
                                eventEmbed.setDescription(`You can't throw a snowball since you thrown one already with your almighthy force so you need to rest a bit!`)
                                return rep({embeds: [eventEmbed], ephemeral: true})
                            }
                            if (playerServerData.snowballs <= 0) {
                                eventEmbed.setDescription(`You don't have any snowballs. Get your trusty gloves and make some using \`/snow gather\`!`)
                                return rep({embeds: [eventEmbed], ephemeral: true})
                            }
                            if (Date.now() < playerServerData.whenWasDizzy) {
                                eventEmbed.setDescription(`Since the last KO, you're still feeling dizzy so you remain on the bench resting for a bit more...`)
                                eventEmbed.setImage(dizzyGifs[Math.floor(Math.random()* dizzyGifs.length)]);
                                return rep({embeds: [eventEmbed], ephemeral: true})
                            }
                            // console.log(`${target_player.id} == ${interaction.client.user.id}`)
                            if (target_player.id == interaction.client.user.id || target_player.bot == true) {
                                eventEmbed.setDescription(`You tried to hit ${interaction.client.user} but that failed when ${interaction.client.user} dodged and now you got hit with 2 snowballs instead thanks to the skills she acquired a long time ago!`)
                                eventEmbed.setImage(sharuruHit[Math.floor(Math.random()* sharuruHit.length)])
                                playerServerData.stats.knockedOut+=2;
                                playerServerData.snowballs--;
                                playerServerData.whenWasDizzy = Date.now() + res.events.snowball.cooldowns.dizzy;
                                playerData.set(interaction.guildId,playerServerData)
                                snow_players.updateOne({
                                    'userID': issuer.id
                                },{'$set':{ 'guilds_data' : playerData}},(erro,reso)=>{
                                    if (erro) {
                                        sendError.create({
                                            Guild_Name: interaction.member.guild.name,
                                            Guild_ID: interaction.guildId,
                                            User: issuer.tag,
                                            UserID: issuer.id,
                                            Error: erro,
                                            Time: `${TheDate} ${clock} ${amORpm}`,
                                            Command: this.name + `, throw function save`,
                                            Args: `interaction`,
                                        },async (errr, ress) => {
                                            if(errr) {
                                                console.log(errr)
                                                return console.log(`Unfortunately an problem appeared in snow.js while trying to log an error. This is an additional error!`)
                                            }
                                            if(ress) {
                                                console.log(`successfully added error to database!`)
                                                console.log(err); 
                                                logChannel.send(`[Snowball Event] I got an error trying to save data of ${issuer}`)
                                            }
                                        })
                                        return;
                                    }
                                    if(reso) {
                                        console.log(`[Snowball Event]: Updated ${issuer.tag} snowball data`)
                                    }
                                });
                                // player_issuer.save().catch(err => { console.log(err); logChannel.send(`[Snowball Event] I got an error trying to save data of \`${issuer.tag}\``)})
                                return rep({embeds: [eventEmbed]})
                            }
                            //#endregion

                            // see if target has doc in db
                            snow_players.findOne({
                                userID: target_player.id
                            },(err3,player_target) =>{
                                if (err3) {
                                    sendError.create({
                                        Guild_Name: interaction.member.guild.name,
                                        Guild_ID: interaction.guildId,
                                        User: issuer.tag,
                                        UserID: issuer.id,
                                        Error: err3,
                                        Time: `${TheDate} || ${clock} ${amORpm}`,
                                        Command: this.name+" throw command",
                                        Args: `slash command`,
                                    },async (err, res) => {
                                        if(err) {
                                            console.log(err)
                                            rep({content: `[Snowy Event] Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`})
                                            return logChannel.send(`[Snowy Event] Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                        }
                                        if(res) {
                                            console.log(`successfully added error to database!`)
                                        }
                                    })
                                }
                                if (player_target) {// if player target is in db
                                    // calculate the chance to hit:
                                    // if missed, add total misses to issuer and remove 1 snowball + add cooldowns

                                    let playerTargetData = player_target.guilds_data;
                                    let playerTargetServerData = playerTargetData.get(interaction.guildId);
                                    if (!playerTargetServerData) {
                                        let newServerData = {
                                            snowballs: 0,
                                            whenWasDizzy: 0,
                                            immunityPeriod: 0,
                                            cooldowns:  {
                                                collect: 0,
                                                throw: 0,
                                            },
                                            stats: {
                                                directHits: 0,
                                                totalMisses: 0, 
                                                knockedOut: 0,
                                                snowballsCollected: 0, 
                                            },
                                        }
                                        player_target.guilds_data.set(interaction.guildId,newServerData)
                                    }

                                    console.log(`test: throw-playertarget has account on this sv`)
                                    let chanceToDodge = calculateDodgeChance(playerTargetServerData.stats.directHits,playerTargetServerData.stats.knockedOut)
                                    let chanceToHit = 100 - chanceToDodge;
                                    let hitOrMiss = percentageChance(['dodge','hit'],[chanceToDodge,chanceToHit])

                                    if (playerTargetServerData.whenWasDizzy > Date.now()) {
                                        eventEmbed.setDescription(`It seems like ${target_player} was hit recently by a heavy snowball and they're still dizzy so it's better to select another member!`)
                                        eventEmbed.setImage(dodgeDizzy[Math.floor(Math.random()* dodgeDizzy.length)])
                                        return rep({embeds: [eventEmbed], ephemeral: true})
                                    }
        
                                    if (playerTargetServerData.immunityPeriod > Date.now()) {
                                        eventEmbed.setDescription(`${target_player} recovered from their dizziness and they are mad! They seems so fast that nothing can stop them! But for how long will they last like this?`)
                                        eventEmbed.setImage(immunityGifs[Math.floor(Math.random() * immunityGifs.length)])
                                        return rep({embeds: [eventEmbed], ephemeral: true})
                                    }
        
                                    // if dodged, remove 1 snowball, add cooldown to player issuer and miss
                                    if (hitOrMiss == "dodge") {
                                        // console.log("before:\n",playerServerData)
                                        eventEmbed.setDescription(parseUserString(miss_throw[Math.floor(Math.random() * miss_throw.length)],issuer,target_player))
                                        eventEmbed.setImage(dodgeGifs[Math.floor(Math.random()* dodgeGifs.length)])
                                        // add cooldown
                                        playerServerData.cooldowns.throw = Date.now() + res.events.snowball.cooldowns.throw;
                                        // remove snowball
                                        playerServerData.snowballs--;
                                        // add misses
                                        playerServerData.stats.totalMisses++;
                                        // player_issuer.guilds_data.set(interaction.guildId,playerServerData)
                                        // player_issuer.save().catch(err => { console.log(err); logChannel.send(`[Snowball Event] I got an error trying to save data of \`${issuer.tag}\``)})
                                        playerData.set(interaction.guildId,playerServerData)
                                        // console.log("after:\n",playerServerData)
                                        snow_players.updateOne({
                                            'userID': issuer.id
                                        },{'$set':{ 'guilds_data' : playerData}},(erro,reso)=>{
                                            if (erro) {
                                                sendError.create({
                                                    Guild_Name: interaction.member.guild.name,
                                                    Guild_ID: interaction.guildId,
                                                    User: issuer.tag,
                                                    UserID: issuer.id,
                                                    Error: erro,
                                                    Time: `${TheDate} ${clock} ${amORpm}`,
                                                    Command: this.name + `, throw function save`,
                                                    Args: `interaction`,
                                                },async (errr, ress) => {
                                                    if(errr) {
                                                        console.log(errr)
                                                        return console.log(`Unfortunately an problem appeared in snow.js while trying to log an error. This is an additional error!`)
                                                    }
                                                    if(ress) {
                                                        console.log(`successfully added error to database!`)
                                                        console.log(err); 
                                                        logChannel.send(`[Snowball Event] I got an error trying to save data of ${issuer}`)
                                                    }
                                                })
                                                return;
                                            }
                                            if(reso) {
                                                console.log(`[Snowball Event]: Updated ${issuer.tag} snowball data`)
                                            }
                                        });
                                        console.log(`${target_player.tag} dodged ${issuer.tag} snowball`)
                                        return rep({embeds: [eventEmbed]})
                                    }
                                    
                                    //#region hit
                                    eventEmbed.setDescription(parseUserString(hit_throw[Math.floor(Math.random()* hit_throw.length)],issuer,target_player))
                                    eventEmbed.setImage(hitGifs[Math.floor(Math.random()* hitGifs.length)])
                                    console.log(`${issuer.tag} hit ${target_player.tag}`)
                                    // add cooldown
                                    playerServerData.cooldowns.throw = Date.now() + res.events.snowball.cooldowns.throw;
                                    // add DH to issuer
                                    playerServerData.stats.directHits++;
                                    // add KO to target
                                    playerTargetServerData.stats.knockedOut++;
                                    // remove snowball from issuer
                                    playerServerData.snowballs--;
                                    // add dizzy
                                    playerTargetServerData.whenWasDizzy = Date.now() + res.events.snowball.cooldowns.dizzy;
                                    playerTargetServerData.immunityPeriod = Date.now() + res.events.snowball.cooldowns.dizzy + res.events.snowball.cooldowns.immunity
                                    playerData.set(interaction.guildId,playerServerData)
                                    playerTargetData.set(interaction.guildId,playerTargetServerData)
                                    snow_players.updateOne({
                                        'userID': issuer.id
                                    },{'$set':{ 'guilds_data' : playerData}},(erro,reso)=>{
                                        if (erro) {
                                            sendError.create({
                                                Guild_Name: interaction.member.guild.name,
                                                Guild_ID: interaction.guildId,
                                                User: issuer.tag,
                                                UserID: issuer.id,
                                                Error: erro,
                                                Time: `${TheDate} ${clock} ${amORpm}`,
                                                Command: this.name + `, throw function save`,
                                                Args: `interaction`,
                                            },async (errr, ress) => {
                                                if(errr) {
                                                    console.log(errr)
                                                    return console.log(`Unfortunately an problem appeared in snow.js while trying to log an error. This is an additional error!`)
                                                }
                                                if(ress) {
                                                    console.log(`successfully added error to database!`)
                                                    console.log(err); 
                                                    logChannel.send(`[Snowball Event] I got an error trying to save data of ${issuer}`)
                                                }
                                            })
                                            return;
                                        }
                                        if(reso) {
                                            console.log(`[Snowball Event]: Updated ${issuer.tag} snowball data`)
                                        }
                                    });
                                    snow_players.updateOne({
                                        'userID': target_player.id
                                    },{'$set':{ 'guilds_data' : playerTargetData}},(erro,reso)=>{
                                        if (erro) {
                                            sendError.create({
                                                Guild_Name: interaction.member.guild.name,
                                                Guild_ID: interaction.guildId,
                                                User: issuer.tag,
                                                UserID: issuer.id,
                                                Error: erro,
                                                Time: `${TheDate} ${clock} ${amORpm}`,
                                                Command: this.name + `, throw function save`,
                                                Args: `interaction`,
                                            },async (errr, ress) => {
                                                if(errr) {
                                                    console.log(errr)
                                                    return console.log(`Unfortunately an problem appeared in snow.js while trying to log an error. This is an additional error!`)
                                                }
                                                if(ress) {
                                                    console.log(`successfully added error to database!`)
                                                    console.log(err); 
                                                    logChannel.send(`[Snowball Event] I got an error trying to save data of \`${target_player}\` hit by ${issuer}`)
                                                }
                                            })
                                            return;
                                        }
                                        if(reso) {
                                            console.log(`[Snowball Event]: Updated ${target_player.tag} snowball data`)
                                        }
                                    });
                                    return rep({embeds: [eventEmbed]})
                                    //#endregion
                                    
                                } else {// if player target isn't in db, create if hit
                                    let hitOrMiss = percentageChance(['dodge','hit'],[50,50])
                                    if (hitOrMiss == 'dodge') {
                                        eventEmbed.setDescription(parseUserString(miss_throw[Math.floor(Math.random() * miss_throw.length)],issuer,target_player))
                                        eventEmbed.setImage(dodgeGifs[Math.floor(Math.random()* dodgeGifs.length)])
                                        rep({embeds: [eventEmbed]})
                                        // add cooldown
                                        playerServerData.cooldowns.throw = Date.now() + res.events.snowball.cooldowns.throw;
                                        // remove snowball
                                        playerServerData.snowballs--;
                                        // add misses
                                        playerServerData.stats.totalMisses++;
                                        playerData.set(interaction.guildId,playerServerData)
                                        snow_players.updateOne({
                                            'userID': issuer.id
                                        },{'$set':{ 'guilds_data' : playerData}},(erro,reso)=>{
                                            if (erro) {
                                                sendError.create({
                                                    Guild_Name: interaction.member.guild.name,
                                                    Guild_ID: interaction.guildId,
                                                    User: issuer.tag,
                                                    UserID: issuer.id,
                                                    Error: erro,
                                                    Time: `${TheDate} ${clock} ${amORpm}`,
                                                    Command: this.name + `, throw function save`,
                                                    Args: `interaction`,
                                                },async (errr, ress) => {
                                                    if(errr) {
                                                        console.log(errr)
                                                        return console.log(`Unfortunately an problem appeared in snow.js while trying to log an error. This is an additional error!`)
                                                    }
                                                    if(ress) {
                                                        console.log(`successfully added error to database!`)
                                                        console.log(err); 
                                                        logChannel.send(`[Snowball Event] I got an error trying to save data of ${issuer}`)
                                                    }
                                                })
                                                return;
                                            }
                                            if(reso) {
                                                console.log(`[Snowball Event]: Updated ${issuer.tag} snowball data`)
                                            }
                                        });
                                        let mapGuildData = new Map();
                                        let newServerData = {
                                            snowballs: 0,
                                            whenWasDizzy: 0,
                                            immunityPeriod: 0,
                                            cooldowns:  {
                                                collect: 0,
                                                throw: 0,
                                            },
                                            stats: {
                                                directHits: 0,
                                                totalMisses: 0, 
                                                knockedOut: 0,
                                                snowballsCollected: 0, 
                                            },
                                        }
                                        mapGuildData.set(interaction.guildId,newServerData)
                                        snow_players.create({
                                            userName: target_player.tag,
                                            userID: target_player.id,
                                            guilds_data: mapGuildData
                                        })
                                        return console.log(`[Snowy Challenge]: done creating target player (${target_player.tag}) entry in db since it didn't have one.`)
                                    }
        
                                    if (hitOrMiss == 'hit') {
                                        eventEmbed.setDescription(parseUserString(hit_throw[Math.floor(Math.random()* hitGifs.length)],issuer,target_player))
                                        eventEmbed.setImage(hitGifs[Math.floor(Math.random()* hitGifs.length)])
                                        // add cooldown
                                        playerServerData.cooldowns.throw = Date.now() + res.events.snowball.cooldowns.throw;
                                        // add DH to issuer
                                        playerServerData.stats.directHits++;
                                        // remove snowball from issuer
                                        playerServerData.snowballs--;
                                        // add dizzy
                                        playerData.set(interaction.guildId,playerServerData)
                                        snow_players.updateOne({
                                            'userID': issuer.id
                                        },{'$set':{ 'guilds_data' : playerData}},(erro,reso)=>{
                                            if (erro) {
                                                sendError.create({
                                                    Guild_Name: interaction.member.guild.name,
                                                    Guild_ID: interaction.guildId,
                                                    User: issuer.tag,
                                                    UserID: issuer.id,
                                                    Error: erro,
                                                    Time: `${TheDate} ${clock} ${amORpm}`,
                                                    Command: this.name + `, throw function save`,
                                                    Args: `interaction`,
                                                },async (errr, ress) => {
                                                    if(errr) {
                                                        console.log(errr)
                                                        return console.log(`Unfortunately an problem appeared in snow.js while trying to log an error. This is an additional error!`)
                                                    }
                                                    if(ress) {
                                                        console.log(`successfully added error to database!`)
                                                        console.log(err); 
                                                        logChannel.send(`[Snowball Event] I got an error trying to save data of ${issuer}`)
                                                    }
                                                })
                                                return;
                                            }
                                            if(reso) {
                                                console.log(`[Snowball Event]: Updated ${issuer.tag} snowball data`)
                                            }
                                        });
                                        let mapGuildData = new Map();
                                        let newServerData = {
                                            snowballs: 0,
                                            whenWasDizzy: Date.now() + res.events.snowball.cooldowns.dizzy,
                                            immunityPeriod: Date.now() + res.events.snowball.cooldowns.dizzy + res.events.snowball.cooldowns.immunity,
                                            cooldowns:  {
                                                collect: 0,
                                                throw: 0,
                                            },
                                            stats: {
                                                directHits: 0,
                                                totalMisses: 0, 
                                                knockedOut: 0,
                                                snowballsCollected: 0, 
                                            },
                                        }
                                        mapGuildData.set(interaction.guildId,newServerData)
                                        snow_players.create({
                                            userName: target_player.tag,
                                            userID: target_player.id,
                                            guilds_data: mapGuildData
                                        })
                                        return rep({embeds: [eventEmbed]})
                                    }
                                }
                            })
                        } else {
                            eventEmbed.setDescription(`I'm sorry but you didn't go outside yet to gather snowballs! Try again after doing that! (P.S: please use /snow gather)`)
                            return rep({embeds: [eventEmbed], ephemeral: true})
                        }
                    })
                }

                if (subCommandGroupOption == null && subCommandOption == "stats") {
                    // use in the available channels
                    let checkChannel = interaction.member.guild.channels.cache.find(ch => ch.id == res.events.snowball.statsLockChannel) ?? null;
                    if (res.events.snowball.channels.length > 0 && 
                        !res.events.snowball.channels.includes(interaction.channelId) && 
                        (res.events.snowball.statsLockChannel == "Not Set" || checkChannel == null )) {
						let availableChannels = res.events.snowball.channels.map(it => it = `<#${it}>`)

						let noEmbed = new SharuruEmbed()
							.setDescription(`${issuer}, you cannot use this command here! Head over to <#${availableChannels.join(", ")}> to use it!`)
							.setColor(Colors.Orange)
							.setImage(`https://cdn.discordapp.com/attachments/769228052165033994/1057410816883822703/qoobee-no-no-nonono.gif`)
						return rep({embeds: [noEmbed], ephemeral: true})
					} else if ((res.events.snowball.statsLockChannel != "Not set" || checkChannel != null) && interaction.channelId != checkChannel.id) {
						let noEmbed = new SharuruEmbed()
							.setDescription(`${issuer}, this command is available only in ${checkChannel}!`)
							.setColor(Colors.Orange)
							.setImage(`https://cdn.discordapp.com/attachments/769228052165033994/1057410816883822703/qoobee-no-no-nonono.gif`)
						return rep({embeds: [noEmbed], ephemeral: true})
                    }
					
					snow_players.findOne({
						userID: issuer.id
					},(err2,player)=>{
						if (err2) {
							sendError.create({
								Guild_Name: interaction.member.guild.name,
								Guild_ID: interaction.guildId,
								User: issuer.tag,
								UserID: issuer.id,
								Error: err2,
								Time: `${TheDate} || ${clock} ${amORpm}`,
								Command: this.name+" stats command",
								Args: `interaction`,
							},async (err, res) => {
								if(err) {
									console.log(err)
						            rep({content: `[Snowy Event]: Unfortunately an problem appeared trying to gather stats. Please try again later. If this problem persist, contact my partner!`, ephemeral: true})
									return logChannel.send(`[Snowy Event]: Unfortunately an problem appeared trying to gather stats. Please try again later. If this problem persist, contact my partner!`)
								}
								if(res) {
									console.log(`successfully added error to database!`)
								}
							})
						}
						if (player) {
							snow_players.find({},(err3,players) =>{
								if (err3) {
                                    sendError.create({
                                        Guild_Name: interaction.member.guild.name,
                                        Guild_ID: interaction.guildId,
                                        User: issuer.tag,
                                        UserID: issuer.id,
                                        Error: err3,
                                        Time: `${TheDate} || ${clock} ${amORpm}`,
                                        Command: this.name+" stats command snowplayers search with guild",
                                        Args: `interaction`,
                                    },async (err, res) => {
                                        if(err) {
                                            console.log(err)
                                            rep({content: `[Snowy Event]: Unfortunately an problem appeared trying to gather stats. Please try again later. If this problem persist, contact my partner!`, ephemeral: true})
                                            return logChannel.send(`[Snowy Event]: Unfortunately an problem appeared trying to gather stats. Please try again later. If this problem persist, contact my partner!`)
                                        }
                                        if(res) {
                                            console.log(`successfully added error to database!`)
                                        }
                                    })
                                }
								if (players) {
                                    let players_of_thisServer = []
                                    for (let i = 0; i < players.length; i++) {
                                        const element = players[i];
                                        if (element.guilds_data.get(interaction.guildId) != null || element.guilds_data.get(interaction.guildId)) {
                                            let obj = {
                                                userID: element.userID,
                                                data: element.guilds_data.get(interaction.guildId)
                                            }
                                            players_of_thisServer.push(obj);
                                        }
                                    }
									let sortedRanks = []
                                    if (players_of_thisServer.length == 0) {
                                        eventEmbed.setDescription(`It seems like nobody started playing this event yet on this server! Check later if someone started!`)
                                        return rep({embeds: [eventEmbed], ephemeral: true})
                                    }
									for (let i = 0; i < players_of_thisServer.length; i++) {
										const element = players_of_thisServer[i];
										let obj = {
											id: element.userID,
											score: element.data.stats.directHits*5+element.data.stats.totalMisses*2 ?? 0
										}
										sortedRanks.push(obj)
									}
									sortedRanks = sortedRanks.sort((a,b) => b.score - a.score)
                                    // console.log(sortedRanks)
									eventEmbed.setDescription(`${issuer.tag} stats in the Event: ${gameName}`)
                                    let playerData = players_of_thisServer.find(item => item.userID == issuer.id)
                                    // console.log(playerData)

									eventEmbed.addFields([
										{name: `Current Rank | Score:`,value: `${sortedRanks.findIndex(i => i.id == issuer.id)+1 ?? "Not participating yet."} | ${sortedRanks[sortedRanks.findIndex(i => i.id == issuer.id)].score ?? "Not participating yet."}`},
										{name: `Direct Hits:`,value: `${playerData.data.stats.directHits}`},
										{name: `Total Misses:`,value: `${playerData.data.stats.totalMisses}`},
										{name: `KO's:`,value: `${playerData.data.stats.knockedOut}`},
										{name: `Snowballs Owned:`,value: `${playerData.data.snowballs}`},
										{name: `Snowballs Collected:`,value: `${playerData.data.stats.snowballsCollected}`,inline: true},
										{name: `Cooldowns:`,value: `- collect: ${displayIconPerNumber(playerData.data.cooldowns.collect,res.events.snowball.cooldowns.collect)}\n- throw: ${displayIconPerNumber(playerData.data.cooldowns.throw,res.events.snowball.cooldowns.throw)}\n- dizziness: ${displayIconPerNumber(playerData.data.whenWasDizzy,res.events.snowball.cooldowns.dizzy)}`}
									])
									return rep({embeds: [eventEmbed]})
								}
							})
						} else {
							eventEmbed.setDescription(`I'm sorry but you didn't go outside yet to gather snowballs and throw at someone! Try again after doing that! (P.S: please use /snow gather)`)
                            return rep({embeds: [eventEmbed], ephemeral: true})
						}
					})
                }

                if (subCommandGroupOption == null && subCommandOption == "top") {
                    let availableChannels = res.events.snowball.channels.map(it => it = `<#${it}>`)
                    let checkChannel = interaction.member.guild.channels.cache.find(ch => ch.id == res.events.snowball.statsLockChannel) ?? null;
					if (res.events.snowball.channels.length > 0 && 
                        !res.events.snowball.channels.includes(interaction.channelId) &&
                        (res.events.snowball.statsLockChannel == "Not Set" || checkChannel == null )) {
						let noEmbed = new SharuruEmbed()
							
							.setDescription(`${issuer}, you cannot use this command here! Head over to <#${availableChannels.join(", ")}> to use it!`)
							.setColor(Colors.Orange)
							.setImage(`https://cdn.discordapp.com/attachments/769228052165033994/1057410816883822703/qoobee-no-no-nonono.gif`)
						return rep({embeds: [noEmbed], ephemeral: true})
					} else if ((res.events.snowball.statsLockChannel != "Not set" || checkChannel != null) && interaction.channelId != checkChannel.id) {
						let noEmbed = new SharuruEmbed()
							.setDescription(`${issuer}, this command is available only in ${checkChannel}!`)
							.setColor(Colors.Orange)
							.setImage(`https://cdn.discordapp.com/attachments/769228052165033994/1057410816883822703/qoobee-no-no-nonono.gif`)
						return rep({embeds: [noEmbed], ephemeral: true})
                    }

					snow_players.find({},async (err2,players) =>{
						if (err2) {
							sendError.create({
								Guild_Name: interaction.member.guild.name,
								Guild_ID: interaction.guildId,
								User: issuer.tag,
								UserID: issuer.id,
								Error: err2,
								Time: `${TheDate} || ${clock} ${amORpm}`,
								Command: this.name+" top command",
								Args: `interaction`,
							},async (err, res) => {
								if(err) {
									console.log(err)
						            rep({content: `[Snowy Event]: Unfortunately an problem appeared trying to gather everyone for leaderboard. Please try again later. If this problem persist, contact my partner!`, ephemeral: true})
									return logChannel.send(`[Snowy Event]: Unfortunately an problem appeared trying to gather everyone for leaderboard. Please try again later. If this problem persist, contact my partner!`)
								}
								if(res) {
									console.log(`successfully added error to database!`)
								}
							})
						}
						if (players.length > 0) {
							let sortedRanks = []
							let Pages = [];
							let page = 1;
							let Rarray = [];
                            let players_of_thisServer = []
                            for (let i = 0; i < players.length; i++) {
                                const element = players[i];
                                if (element.guilds_data.get(interaction.guildId) != null || element.guilds_data.get(interaction.guildId)) {
                                    let obj = {
                                        userID: element.userID,
                                        data: element.guilds_data.get(interaction.guildId)
                                    }
                                    players_of_thisServer.push(obj);
                                }
                            }
                            if (players_of_thisServer.length == 0) {
                                eventEmbed.setDescription(`It seems like nobody started playing this event yet on this server! Check later if someone started!`)
                                return rep({embeds: [eventEmbed], ephemeral: true})
                            }
							for (let i = 0; i < players_of_thisServer.length; i++) {
                                const element = players_of_thisServer[i];
                                let obj = {
                                    id: element.userID,
                                    score: element.data.stats.directHits*5+element.data.stats.totalMisses*2 ?? 0
                                }
                                sortedRanks.push(obj)
                            }
							sortedRanks = sortedRanks.sort((a,b) => b.score - a.score)
							Pages = await arrangePlayers(sortedRanks,Rarray)
							eventEmbed.setAuthor({ name: `Christmas Event: ${gameName} | Leaderboard `,iconURL: `https://cdn.discordapp.com/attachments/769228052165033994/921408133635670016/2021_Snowsgiving_Emojis_001_Snowflake.png`})
							.setFooter({text: `Page ${page}/${Pages.length} | Emojis are provided by talented artists that participated in Discord Snowsgiving 2021 & 2022!`})
							.setDescription(Pages[page-1].join("\n"))
                            console.log(sortedRanks.length)
                            if (sortedRanks.length > 24) 
                                interaction.reply({embeds: [eventEmbed], fetchReply: true}).then(msg =>{
                                    msg.react(`◀️`)
                                    msg.react(`▶️`).then(msg2 =>{

                                        const CollectingReactions = (reaction, user) => user.id === message.author.id;
                                        const gimmeReactions = msg.createReactionCollector({CollectingReactions,time: 60000})
                                        
                                        gimmeReactions.on('collect', r=>{
                                            let user_emoji = r._emoji.name;
                
                                            switch(user_emoji){
                                                case `◀️`:
                                                    if (issuer.bot == false)
                                                        msg.reactions.resolve(`◀️`).users.remove(interaction.user.id);
                                                    if(page === 1) return;
                                                    page--;
                                                    eventEmbed.setDescription(Pages[page-1].join("\n"))
                                                    .setFooter({text: `Page ${page}/${Pages.length} | Emojis are provided by talented artists that participated in Discord Snowsgiving 2021 & 2022!`})
                                                    msg.edit({embeds: [eventEmbed]})
                                                    break;
                                                
                                                case `▶️`:
                                                    if (issuer.bot == false)
                                                        msg.reactions.resolve(`▶️`).users.remove(interaction.user.id);
                                                    if(page === Pages.length) return;
                                                    page++;
                                                    eventEmbed.setDescription(Pages[page-1].join("\n"))
                                                    .setFooter({text: `Page ${page}/${Pages.length} | Emojis are provided by talented artists that participated in Discord Snowsgiving 2021 & 2022!`})
                                                    msg.edit({embeds: [eventEmbed]})
                                                    break;
                                            }
                                        })

                                        gimmeReactions.on('end', r=>{
                                            msg.reactions.removeAll()
                                            console.log(`[Snowball event]: Removed all emojis from ${issuer.id} leader msg`)
                                        })
                                    })
                                })// end of sent msg
                            else rep({embeds: [eventEmbed]})
						} else {
							eventEmbed.setDescription(`Unfortunately there were no one that entered in the leaderboard. Try throwing a snowball at someone to enter first!`)
							return rep({embeds: [eventEmbed], ephemeral: true})
						}
					})
                }

                if (subCommandGroupOption == null && subCommandOption == "whosdizzy") {
                    let availableChannels = res.events.snowball.channels.map(it => it = `<#${it}>`)
					if (res.events.snowball.channels.length > 0 && !res.events.snowball.channels.includes(interaction.channelId)) {
						let noEmbed = new SharuruEmbed()
							
							.setDescription(`${issuer}, you cannot use this command here! Head over to <#${availableChannels.join(", ")}> to use it!`)
							.setColor(Colors.Orange)
							.setImage(`https://cdn.discordapp.com/attachments/769228052165033994/1057410816883822703/qoobee-no-no-nonono.gif`)
						return rep({embeds: [noEmbed], ephemeral: true})
                        
					}
					if (res.events.snowball.dizzyListGlobal > Date.now()) {
						eventEmbed.setDescription(`Aw, this ancient power seems like isn't yet ready after last use! You have to wait a bit more before the next use...`)
						return rep({embeds: [eventEmbed], ephemeral: true})
					}
					// set the cooldown after use
					res.events.snowball.dizzyListGlobal = Date.now() + res.events.snowball.cooldowns.dizzyList;

					snow_players.find({},async (err2,players) =>{
						if (err2) {
							sendError.create({
								Guild_Name: interaction.member.guild.name,
								Guild_ID: interaction.guildId,
								User: issuer.tag,
								UserID: issuer.id,
								Error: err2,
								Time: `${TheDate} || ${clock} ${amORpm}`,
								Command: this.name+" whosdizzy command",
								Args: `interaction`,
							},async (err, res) => {
								if(err) {
									console.log(err)
						            rep({content: `[Snowy Event]: Unfortunately an problem appeared trying to gather everyone for whosdizzy. Please try again later. If this problem persist, contact my partner!`, ephemeral: true})
									return logChannel.send(`[Snowy Event]: Unfortunately an problem appeared trying to gather everyone for whosdizzy. Please try again later. If this problem persist, contact my partner!`)
								}
								if(res) {
									console.log(`successfully added error to database!`)
								}
							})
						}
						if (players.length > 0) {
							let sortedDizzyPeople = []
							for (let i = 0; i < players.length; i++) {
								const element = players[i];
								if (element.whenWasDizzy > Date.now())
									sortedDizzyPeople.push(`- <@${element.userID}>`)
							}
							eventEmbed.setAuthor({name:`Christmas Event: ${gameName} `,iconURL:`https://cdn.discordapp.com/attachments/769228052165033994/921408133635670016/2021_Snowsgiving_Emojis_001_Snowflake.png`})
							.setFooter({text:`Emojis are provided by talented artists that participated in Discord Snowsgiving 2021!`})
							.setDescription(sortedDizzyPeople.length > 1 ? sortedDizzyPeople.join("\n") : `Nobody is dizzy so far! That's great!`)
							.setTitle(`People that might be dizzy...`)
							rep({embeds: [eventEmbed]})
						} else {
							eventEmbed.setDescription(`Not enought people to make a list!!`)
							rep({embeds: [eventEmbed]})
						}
					})
                }

                //#endregion
                if (subCommandGroupOption == "settings" && is_staff) {
                    eventEmbed.setTitle(`Snowball Event Settings:`)
                    if (subCommandOption == "welcome") {
                        // get date for EU, NA & AS. Credits Lucy
                        eventEmbed
                        .setDescription(`Welcome to the **${gameName}**! It's time to get your trusty warm clothes and gather snowballs! In this event, all you have to do is to have fun by throwing snowballs at people, easy right?`)
                        .addFields([//1639998000
                            {name: `⏰ Schedule:`,value:`Starting on: <t:1672183620> (<t:1672183620:R>)\nEnding on: <t:1672434000> (<t:1672434000:R>)`},
                            {name: `⚙️ Mechanics:`,value:`The main command is \`/snow\`. There are about 4 sub-commands:
        - \`/snow gather\` => used to gather snow for snowballs!
        
        - \`/snow throw @person\` => used for throwing the snowball at your friend!
        
        - \`/snow stats\` => look at your stats (Direct hits, misses, KOs, snowballs collected, cooldowns & rank)
        
        - \`/snow top\` => Shows top 50 members with highest score.
        
        - \`/snow whodizzy\` => Shows people that might be dizzy...
        
        💠 For each **"Direct hit"**, you will receive 5 points.
        💠 For each **"Miss"**, you will receive 2 points.
                            `},
                            {name: `📜 Rules*:`,value: `**[1]** Have fun in this event!
                            `},
                            //{name: `❗ Important Notes!`,value: `NONE! GATHER SOME SNOW!!!`},
                            // {name: `🏆 Prize:`,value: `The person who is ranked #1 in the leaderboard will receive unique role **<@&772037576105787392>**!`},
                        ])
                        .setImage(`https://drewreviewmovies.files.wordpress.com/2019/07/elf-snowball-fight.gif?w=444&h=250`)//https://thumbs.gfycat.com/ChiefDearestHedgehog-size_restricted.gif
                        // or https://media.giphy.com/media/lz3Uod7usIIT9pJ6e7/giphy.gif
                        // or https://media.giphy.com/media/xT0xeG2jahi1bMm2Z2/giphy.gif
                        return rep({embeds: [eventEmbed]})
                    }
    
                    if (subCommandOption == "switch") {
                        if (!res.events.snowball.enabled) res.events.snowball.enabled = false;
                        res.events.snowball.enabled = !res.events.snowball.enabled
                        eventEmbed.setDescription(`I have turned **${res.events.snowball.enabled ? `on` : "off"}** the snowball event.`)
                        rep({embeds: [eventEmbed]})
                    }

					if (subCommandOption == "display") {
						eventEmbed.addFields([
								{name: `Is Enabled?:`,value: res.events.snowball.enabled ? `Yes` : `No`,inline: false},
								{name: `Cooldowns Applied:`,value: `
- \`[i]\`collect: \`${pms(res.events.snowball.cooldowns.collect)}\`   (keyword: \`collect\`)
- \`[i]\`throw: \`${pms(res.events.snowball.cooldowns.throw)}\`   (keyword: \`throw\`)
- \`[i]\`dizzy effect: \`${pms(res.events.snowball.cooldowns.dizzy)}\`   (keyword: \`dizzy_effect\`)
- \`[G]\`dizzy list: \`${pms(res.events.snowball.cooldowns.dizzyList)}\`   (keyword: \`dizzy_list\`)
- \`[i]\`immunity period: \`${pms(res.events.snowball.cooldowns.immunity)}\`   (keyword: \`immunity\`)
`,inline: false},
								{name: `Channels that allow commands:`,value: res.events.snowball.channels.length > 0 ? "\n- "+res.events.snowball.channels.map(i => `<#${i}>`).join("\n- ") : `No channels added yet;`,inline: false},
								{name: `Channel where only \`stats/leaderboard\` can be used in:`,value: `- <#${res.events.snowball.statsLockChannel}>`},
								{name: config.extra.emptyField,value: config.extra.emptyField},
								{name: `Details:`,value: `Flags \`[i,G]\`:\n- \`i\` => for individuals, each member with their own.\n- \`G\` => global, for everyone, shared.`}
							])
						return rep({embeds: [eventEmbed]})
					}

					if (subCommandOption == "channels") {
                        let channelsMentioned = []
						let snowballChannels = res.events.snowball.channels;
						let changes = ``
						let changes2 = ``
                        
                        if (interaction.options.getChannel("input") != null) channelsMentioned.push(interaction.options.getChannel("input").id)
                        if (interaction.options.getChannel("input2") != null) channelsMentioned.push(interaction.options.getChannel("input2").id)
                        if (interaction.options.getChannel("input3") != null) channelsMentioned.push(interaction.options.getChannel("input3").id)
                        if (interaction.options.getChannel("input4") != null) channelsMentioned.push(interaction.options.getChannel("input4").id)
                        if (interaction.options.getChannel("input5") != null) channelsMentioned.push(interaction.options.getChannel("input5").id)

						for (const channel of channelsMentioned) {
							if(!snowballChannels.includes(channel)){
								snowballChannels.push(channel)
								changes += `- <#${channel}>.\n`
							} else {
								let getIndex = snowballChannels.findIndex(index => index === channel);
								snowballChannels.splice(getIndex,1)
								changes2 += `- <#${channel}>.\n`
							}
						}
						res.events.snowball.channels = snowballChannels
						console.log(`Ch: "${changes}"\nCh2: "${changes2}"\nCH: ${snowballChannels}`)
						eventEmbed.addFields([
							{name: `The following channel(s) will allow the use of commands:`,value: changes.length > 0 ? changes : `No Changes made.`,inline: true},
							{name: `The following channel(s) will not allow the use of commands anymore:`,value: changes2.length > 0 ? changes2 : `No Changes made.`,inline: true},
							{name: `Commands are allowed in the following channel(s):`,value: snowballChannels.length > 0 ? snowballChannels.map(item => item = `<#${item}>`).join("\n") : `No channels are allowed to use commmands!`}
						])
						rep({embeds: [eventEmbed]},"30s")
					}

					if (subCommandOption == "gather") {
						res.events.snowball.cooldowns.collect = ms(`${interaction.options.getInteger("input")}s`);
						eventEmbed.setDescription(`I have set up the cooldown of **\`gather\`** command to **\`${pms(ms(`${interaction.options.getInteger("input")}s`))}\`**!`)
						rep({embeds: [eventEmbed]},"15s")
					}

					if (subCommandOption == "throw") {
						res.events.snowball.cooldowns.throw = ms(`${interaction.options.getInteger("input")}s`);
						eventEmbed.setDescription(`I have set up the cooldown of **\`throw\`** command to **\`${pms(ms(`${interaction.options.getInteger("input")}s`))}\`**!`)
                        rep({embeds: [eventEmbed]},"15s")
					}

					if (subCommandOption == "dizzy_effect") {
						res.events.snowball.cooldowns.dizzy = ms(`${interaction.options.getInteger("input")}s`);
						eventEmbed.setDescription(`I have set up the cooldown of dizzy effect to **\`${pms(ms(`${interaction.options.getInteger("input")}s`))}\`**!`)
                        rep({embeds: [eventEmbed]},"15s")
					}

					if (subCommandOption == "dizzy_list") {
						res.events.snowball.cooldowns.dizzyList = ms(`${interaction.options.getInteger("input")}s`);
						eventEmbed.setDescription(`I have set up the cooldown of **\`dizzy list\`** command to **\`${pms(ms(`${interaction.options.getInteger("input")}s`))}\`**!`)
                        rep({embeds: [eventEmbed]},"15s")
					}
                    
					if (subCommandOption == "immunity") {
						res.events.snowball.cooldowns.immunity = ms(`${interaction.options.getInteger("input")}s`);
						eventEmbed.setDescription(`I have set up the cooldown of **\`immunity\`** command to **\`${pms(ms(`${interaction.options.getInteger("input")}s`))}\`**!`)
                        rep({embeds: [eventEmbed]},"15s")
					}

                    if (subCommandOption == "lockstats") {
                        res.events.snowball.statsLockChannel = interaction.options.getChannel("input").id;
                        eventEmbed.setDescription(`${issuer}, I've now set it so that the \`stats/top\` commands are going to be used only in ${interaction.options.getChannel("input")} from now on!`)
                        rep({embeds:[eventEmbed]})
                    }

                    res.save().catch(err2 => {
                        sendError.create({
                            Guild_Name: interaction.member.guild.name,
                            Guild_ID: interaction.guildId,
                            User: issuer.tag,
                            UserID: issuer.id,
                            Error: err2,
                            Time: `${TheDate} || ${clock} ${amORpm}`,
                            Command: this.name+" saving to db after using "+subCommandGroupOption+"::"+subCommandOption,
                            Args: `interaction`,
                        },async (err, res) => {
                            if(err) {
                                console.log(err)
                                interaction.reply(`[Snowy Event] Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                return logChannel.send(`[Snowy Event] Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                            }
                            if(res) {
                                console.log(`successfully added error to database!`)
                            }
                        })
                        
                    })
                } else if (subCommandGroupOption == "settings" && !is_staff){
                    eventEmbed.setDescription(`${issuer}, you can't use this since you're not an organizator or part of staff team!`)
                    return rep({embeds: [eventEmbed], ephemeral: true})
                }
            }
        })

        /**
         * 
         * @param {Object} msg The object option that can contain: contents (string msg only) or embeds
         * @param {String} deleteAfter Leave 0 to not be deleted after or specify a time in seconds in string format
         */
		function rep(options,deleteAfter = "0s") {
            options.fetchReply = true;
			let thismsg = interaction.reply(options)
			if (deleteAfter != "0s") {
				thismsg.then(m => {
					tools.mgoAdd(interaction.guildId,interaction.channelId,m.id,ms(deleteAfter))
				})
			}
		}
        function calculateDodgeChance(DH,KO) {
			let dodgeCH = 50 + (KO-DH) * 5;
			if (dodgeCH < 15) dodgeCH = 15
			if (dodgeCH > 100) dodgeCH = 100
			console.log("dodge:"+dodgeCH+`\nhit: ${100-dodgeCH}`)
			return dodgeCH;
		}
        function arrayShuffle(array) {
			for ( let i = 0, length = array.length, swap = 0, temp = ''; i < length; i++ ) {
			swap        = Math.floor(Math.random() * (i + 1));
			temp        = array[swap];
			array[swap] = array[i];
			array[i]    = temp;
			}
			return array;
		};
		function percentageChance(values, chances) {
			for ( var i = 0, pool = []; i < chances.length; i++ ) {
			for ( let i2 = 0; i2 < chances[i]; i2++ ) {
				pool.push(i);
			}
			}
			return values[arrayShuffle(pool)['0']];
		};

        function displayIconPerNumber(the_date,cooldown_ability) {
			let icons = {
				empty: {
					left: "<:ele:922267674245992489>",
					center: "<:ece:922267674107609149>",
					right: "<:ere:922267674359238736>"
				},
				full: {
					left: "<:el:922267674283749446>",
					center: "<:ec:922267674422173706>",
					right: "<:er:922267674376011786>"
				}
			}
			let start = the_date-cooldown_ability;
			let today = Date.now();
			let q = Math.abs(today - start)
			let d = Math.abs(the_date-start);
			let roundedAn = Math.round((q/d)*100)
			let fractionAn = (q/d)*100
			let finalDisplay = ``
			// console.log(roundedAn)
			// console.log(Math.floor(roundedAn/10))
			let cnt = 0;

			if (roundedAn < 10) finalDisplay += `${icons.empty.left}`
			if (roundedAn > 10) finalDisplay += `${icons.full.left}`

			for(let i = 0; i < 8; i++) {
				if (i < Math.floor(roundedAn/10)) finalDisplay += `${icons.full.center}`
				if (i >= Math.floor(roundedAn/10)) finalDisplay += `${icons.empty.center}`
			}
			
			if (roundedAn < 100) finalDisplay += `${icons.empty.right}`
			if (roundedAn > 100) finalDisplay += `${icons.full.right}`

			return finalDisplay
			
			// console.log(`Rounded: ${roundedAn}%\nFraction: ${fractionAn}%`)
		}
        function arrangePlayers(arraySorted,raray) {
			let pag = []
			for(let i = 0; i < arraySorted.length; i++){
				// console.log(arraySorted[i])
				if (i < 50) {
					raray.push(`\`${i+1}\`) __<@${arraySorted[i].id}>__; Score: **${arraySorted[i].score}**`);
					i++
					if(i % 25 == 0) {
						pag.push(raray);
						raray = []
					}
					i--
				}
			}
			if(raray.length > 0) pag.push(raray)
			return pag
		}
        function parseUserString(string,user,user2 = null) {
            if (user2 != null) string = string.replace("<user2>",`${user2}`)
            return string.replace("<user>",`${user}`)
        }
    }
}