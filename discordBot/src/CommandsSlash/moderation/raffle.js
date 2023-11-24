const { SlashCommandBuilder, ChatInputCommandInteraction, Colors, ButtonBuilder, ButtonStyle, ActionRowBuilder, AttachmentBuilder, InteractionCollector, FormattingPatterns } = require('discord.js');
const SharuruEmbed = require("../../Structures/SharuruEmbed")
const giveawayModel = require('../../Models/giveaways');
const ms = require("ms")
const pms = require("pretty-ms")
const config = require('../../../config.json')
const keygen = require("keygenerator")
const sendError = require("../../Models/Error");
const GuildSettings = require('../../Models/GuildSettings');
const giveaways = require('../../Models/giveaways');
const sharuruBins = require("hastebin")
const raffleButton = new ActionRowBuilder()

module.exports = {
    data: new SlashCommandBuilder()
        .setName("raffle")
        .setDescription("Let's create a raffle/giveaway!")
        .addSubcommand(cmd =>cmd.setName(`setup`)
            .setDescription(`An interactive setup to create a giveaway!`))//,
        .addSubcommand(cmd =>cmd.setName("join")
            .setDescription(`Join a giveaway through the command!`)
            .addNumberOption(cmd2 => cmd2.setName("giveaway_id")
                .setDescription("Please type the Id of the giveaway!")
                .setRequired(true)
            )
            .addStringOption(cmd3 => cmd3.setName("keyword")
                .setDescription("[Optional] Please add the keyword if the giveaway requires one!")
                .setRequired(false)
            )
        )
        .addSubcommand(cmd => cmd.setName("leave")
            .setDescription("Leave the giveaway.")
            .addNumberOption(cmd2 => cmd2.setName("giveaway_id")
                .setDescription("Specify the id of the giveaway to leave!")
                .setRequired(true)
            )
        )
        .addSubcommand(cmd => cmd.setName("select")
            .setDescription("Select a giveaway to apply the editing commands!")
            .addNumberOption(cmd2 => cmd2.setName("giveaway_id")
                .setDescription("Please add the id of the giveaway you want to select for editing!")
                .setRequired(true)
            )
        )
        .addSubcommand(cmd => cmd.setName("set_key")
            .setDescription("Options for the keyword of a raffle!")
            .addBooleanOption(cmd2 => cmd2.setName("enabled")
                .setDescription("Edit whenever the giveaway requires a keyword to participate or not!")
                .setRequired(false))
            .addStringOption(cmd2 => cmd2.setName("keyword")
                .setDescription("Set the keyword required to participate! Type 'any' to set any keyword!")
                .setRequired(false)
                .setMinLength(3)
                .setMaxLength(20))
            .addBooleanOption(cmd2 => cmd2.setName("allow_duplicates")
                .setDescription(`Set whenever you're allowing duplicates or not.`)
                .setRequired(false))
            // .addBooleanOption(cmd2 =>
            //     cmd2.setName("public")
            //     .setDescription("Edit whenever the keyword would be public in the giveaway msg or not!")
            //     .setRequired(false))
        )
        .addSubcommand(cmd => cmd.setName("halve_winners")
            .setDescription("If enabled, it will cut the winners count in half if there aren't enough participants!")
            .addBooleanOption(cmd2 => cmd2.setName("enabled")
                .setDescription("Available options: true/false")
                .setRequired(true))
        )
        .addSubcommand(cmd => cmd.setName("list")
            .setDescription("Displays on-going giveaways.")
            .addBooleanOption(cmd2=>cmd2.setName("display_ended")
                .setDescription("This options displays giveaways that ended!")
                .setRequired(false))
            .addNumberOption(cmd2=>cmd2.setName("giveaway_id")
                .setDescription("List all info about a giveaway!")
                .setRequired(false))
        )
        .addSubcommandGroup(cmd => cmd.setName("modifiers")
            .setDescription("Add modifiers to the giveway through roles! Give your supporters more benefits!")
            .addSubcommand(cmd2 => cmd2.setName("add")
                .setDescription("Add a role modifier to the giveaway.")
                .addRoleOption(cmd3 => cmd3.setName("role")
                    .setDescription("Specify the role to add!")
                    .setRequired(true)
                )
                .addStringOption(cmd3 => cmd3.setName("bonus_type")
                    .setDescription("Choose what bonus it receives! Percentage (+5%) or times (+5)")
                    .addChoices(
                        {name: "Bonus Percentage (%)", value: "percentage"},
                        {name: "Bonus Entries (+x)", value: "times"}
                    )
                    .setRequired(true)
                )
                .addNumberOption(cmd3 => cmd3.setName("bonus_value")
                    .setDescription("Specify the bonus value to have this option!")
                    .setMinValue(1)
                    .setMaxValue(80)
                    .setRequired(true)
                )
            )
            .addSubcommand(cmd2 => cmd2.setName("remove")
                .setDescription("Remove a role modifier from the giveaway")
                .addRoleOption(cmd3 => cmd3.setName("role")
                    .setDescription("Specify the role to remove!")
                    .setRequired(true)
                )
            )
            .addSubcommand(cmd2 => cmd2.setName("save")
                .setDescription("Save the current selected giveaway modifiers as a template for later use.")
                .addStringOption(cmd3 => cmd3.setName("template_name")
                    .setDescription("Give a name to the template for ease of use.")
                    .setMaxLength(16)
                    .setMinLength(5)
                    .setRequired(true)
                )
            )
            .addSubcommand(cmd2 => cmd2.setName("load")
                .setDescription("Load a template of modifiers to apply for the currently selected giveaway!")
                .addStringOption(cmd3 => cmd3.setName("template_name")
                    .setDescription("Specify the name of the template to load!")
                    .setRequired(true)
                )
            )
            .addSubcommand(cmd2 => cmd2.setName("delete")
                .setDescription("Remove a template that you don't use anymore!")
                .addStringOption(cmd3 => cmd3.setName("template_name")
                    .setDescription("Specify the name of the template to delete!")
                    .setRequired(true)
                )
            )
            .addSubcommand(cmd2 => cmd2.setName("list")
                .setDescription("List the templates and their roles!")
            )
        )
        .addSubcommand(cmd => cmd.setName("ban")
            .setDescription("Ban a member from all future giveaways!")
            .addUserOption(cmd2 => cmd2.setName("member")
                .setDescription("The user that needs to be banned!")
                .setRequired(true))
            .addNumberOption(cmd2 => cmd2.setName("giveaway_id")
                .setDescription("Ban the member from joining a particular giveaway!")
                .setRequired(false))
        )
        .addSubcommand(cmd => cmd.setName("force_end")
            .setDescription("Force the giveaway to end earlier and pick the available winners!")
            .addNumberOption(cmd2 => cmd2.setName("giveaway_id")
                .setDescription("Provide the raffle id to end it!")
                .setRequired(true))
            .addBooleanOption(cmd2 => cmd2.setName("no_winners")
                .setDescription("Force the giveaway without a winner!")
                .setRequired(false))
        )
        .addSubcommand(cmd => cmd.setName("reroll")
            .setDescription("Reroll the winners of a giveaway that ended!")
            .addNumberOption(cmd2 => cmd2.setName("giveaway_id")
                .setDescription("Provide the raffle id to reroll!")
                .setRequired(true))
        )
        .addSubcommand(cmd => cmd.setName("entries")
            .setDescription("Close or Open the entries to a giveaway! This will only stop or not them from joining a giveaway!")
            .addNumberOption(cmd2 => cmd2.setName("giveaway_id")
                .setDescription("Please type the Id of the giveaway!")
                .setRequired(true)
            )
            .addBooleanOption(cmd3 => cmd3.setName("enabled")
                .setDescription("Choose 'true' to open and 'false' to close!")
                .setRequired(true)
            )
        )
        .addSubcommand(cmd => cmd.setName("set_duration")
            .setDescription(`Edit the duration of the giveaway! You can extend or shrink!`)
            .addNumberOption(cmd2 => cmd2.setName("bonus_value")
                .setDescription(`Specify a number of days to set the giveaway to last! The duration counts from start!`)
                .setMinValue(1)
                .setMaxValue(90)
                .setRequired(true)
            )
        )
        .addSubcommandGroup(cmd => cmd.setName("restrictions")
            .setDescription("Set restriction upon the giveaway such as requiring a role to join or blocking a role!")

            .addSubcommand(cmd2 => cmd2.setName("add_require")
                .setDescription("Add a role as required for the giveaway! Anyone without this role cannot join!")
                .addRoleOption(cmd3 => cmd3.setName("role")
                    .setDescription("Specify the role to add!")
                    .setRequired(true)
                )
            )
            .addSubcommand(cmd2 => cmd2.setName("remove_require")
                .setDescription("Removes a role required from the giveaway!")
                .addRoleOption(cmd3 => cmd3.setName("role")
                    .setDescription("Specify the role to remove!")
                    .setRequired(true)
                )
            )
            .addSubcommand(cmd2 => cmd2.setName("add_block")
                .setDescription("Add a role to be blocked from joining the giveaway!")
                .addRoleOption(cmd3 => cmd3.setName("role")
                    .setDescription("Specify the role to add!")
                    .setRequired(true)
                )
            )
            .addSubcommand(cmd2 => cmd2.setName("remove_block")
                .setDescription("Removes a role blocked from the giveaway!")
                .addRoleOption(cmd3 => cmd3.setName("role")
                    .setDescription("Specify the role to remove!")
                    .setRequired(true)
                )
            )
            .addSubcommand(cmd2 => cmd2.setName("add_special")
                .setDescription("Add a special role to be bypass required and blocked restrictions!")
                .addRoleOption(cmd3 => cmd3.setName("role")
                    .setDescription("Specify the role to add!")
                    .setRequired(true)
                )
            )
            .addSubcommand(cmd2 => cmd2.setName("remove_special")
                .setDescription("Removes a special role from the giveaway!")
                .addRoleOption(cmd3 => cmd3.setName("role")
                    .setDescription("Specify the role to remove!")
                    .setRequired(true)
                )
            )
        )
        .addSubcommandGroup(cmd => cmd.setName("behavior")
            .setDescription("Change the way a giveaway works!")
            .addSubcommand(cmd2 => cmd2.setName("join")
                .setDescription("Add a role that should be assigned upon joining!")
                .addRoleOption(cmd3 => cmd3.setName("role")
                    .setDescription("Specify the role to add!")
                    .setRequired(true)
                )
                .addBooleanOption(cmd3 => cmd3.setName("remove")
                    .setDescription("[Optional]: Set this to 'true' if you want to remove the role assigned.")
                )
            )
            .addSubcommand(cmd2 => cmd2.setName("leave")
                .setDescription("Remove a role from member upon leaving!")
                .addRoleOption(cmd3 => cmd3.setName("role")
                    .setDescription("Specify the role to add!")
                    .setRequired(true)
                )
                .addBooleanOption(cmd3 => cmd3.setName("remove")
                    .setDescription("[Optional]: Set this to 'true' if you want to remove the role assigned.")
                )
            )
            .addSubcommand(cmd2 => cmd2.setName("require_mode")
                .setDescription("Set the require mode to require all roles(true) or at least 1 role(false).")
                .addBooleanOption(cmd3 => cmd3.setName("enabled")
                    .setDescription("Please specify the mode")
                    .setRequired(true)
                )
            )
            .addSubcommand(cmd2 => cmd2.setName("special_mode")
                .setDescription("Set the special roles how to behave based on the 3 modes")
                .addStringOption(cmd3 => cmd3.setName("get_mode")
                    .setDescription("Please specify the mode")
                    .addChoices(
                        {name: "Mode 1: Bypass require roles only", value: "mode1"},
                        {name: "Mode 2: Bypass blocked roles only", value: "mode2"},
                        {name: "Mode 3: Bypass both", value: "mode3"},
                    )
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

        //#region general variables
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
        const issuer = interaction.user;
		const tools = interaction.client.utils
        const sharuru = interaction.client;
        const filter = m => m.author.id === issuer.id;
        const giveawayWindowTime = 300000
		const timeoutRequest = 60000;
		const momentOfStart = Math.round((Date.now() + giveawayWindowTime)/1000) 
        const giveawayEmbed = new SharuruEmbed()
            .setAuthor({name: `Raffle!`})
            .setColor(Colors.LuminousVividPink)
            .setFooter({text: `Requested by @${issuer.username}`})
        const optionsDate = {
            hour12: true,
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: "2-digit",
            minute: '2-digit'
        }
        //#endregion

        //#region raffle Vars
        const raffleIdEdit = `currentRaffleEdit#${interaction.guildId}`
        const raffleRequest_addRole = `raffleRequest_addRole#${interaction.guildId}`
        const raffleTemplateRequestData = `raffleTemplateData#${interaction.guildId}`
        const checkIdAvailability = sharuru.giveawaysQueue.get(raffleIdEdit)
        const get_isEnabled = interaction.options.getBoolean("enabled")
        const get_remove_option = interaction.options.getBoolean("remove")
        const get_set_keyword = interaction.options.getString("keyword")?.toLowerCase()
        const get_allow_duplicates = interaction.options.getBoolean("allow_duplicates")
        const get_display_ended_giveaways = interaction.options.getBoolean("display_ended")
        const get_noWinners_option = interaction.options.getBoolean("no_winners")
        const get_giveaway_id = interaction.options.getNumber("giveaway_id")
        const get_member = interaction.options.getUser("member")
        const get_role_object = interaction.options.getRole("role")
        const get_bonus_type = interaction.options.getString("bonus_type")
        const get_bonus_value = interaction.options.getNumber("bonus_value")
        const get_template_name = interaction.options.getString("template_name")?.toLowerCase()
        const get_special_mode = interaction.options.getString("get_mode")?.toLowerCase()
        let changesDone = `${issuer}, I've changed the following:\n\n`
        let allowMember = true;
        //#endregion

        let giveaway_options = {
            keyword: {
                use: null,
                word: null,
                public: null
            },
			channel: null,
			time: null,
        	winners: null,
            participate: null,
        	prize: null,
        	theMessage: null
		}
        let questions = [
			`Please mention a channel where it should happen the giveaway:`,
			`How much should the giveaway last (e.g: 10min,1h, 1d):`,
			`Tell me how many winners u want:`,
			`What are you gonna give as a prize?:`,
            `How you wish the participants to join the giveaway? Through button,reaction or slash command? Accepted answers: \`button/reaction/slash\`\n\n*P.S: Entering through reaction is allowing people to enter the giveaway even when the bot is offline compared to button/slash!\n\nP.S 2: Slash allows you to set a keyword, any kind or a particular one needed to enter!*`,
			`**\`[Optional-1]\`** Do you wish to ask them for a keyword? (works only if you use slash for now! Accepted answers: yes/no | y/n):`,
			`**\`[Optional-2]\`** Do you want to set a particular \`keyword\` or they can enter any keyword? Type **\`any\`** to allow them to enter any keyword!:`,
			`**\`[Optional-3]\`** Do you want to publish the keyword or keep it a secret? Accepted answers: yes/no | y/n:`,
            `Now lastly, please provide a message from host/sponsor for the participants (to skip, type "skip"). Time limit for writing message: 5min.`
		]

        GuildSettings.findOne({
            ID: interaction.guildId
        },async (errGuild,resGuild)=>{
            if(errGuild){
                sendError.create({
                    Guild_Name: interaction.member.guild.name,
                    Guild_ID: interaction.guildId,
                    User: issuer.username,
                    UserID: issuer.id,
                    Error: errGuild,
                    Time: `${TheDate} || ${clock} ${amORpm}`,
                    Command: this.name + " stop members from using moderation cmds",
                    Args: "no args added for raffle interaction slash cmd",
                },async (errERRORGUILD, resERRORGUILD) => {
                    if(errERRORGUILD) {
                        console.log(errERRORGUILD)
                        return interaction.followUp(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                    }
                    if(resERRORGUILD) {
                        console.log(`successfully added error to database!`)
                        return interaction.followUp(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                    }
                })
            }
            if (resGuild)
            {
                giveawayEmbed.setDescription(`This command is not for ya!`)
        		if (!interaction.member.roles.cache.find(r => r.id == resGuild.importantData.staffRole) && (interaction.options.getSubcommand() != "join" && interaction.options.getSubcommand() != "leave" )) return interaction.reply({embeds: [giveawayEmbed]})

                try {
                    

                //#region commands that should work in general
                if (interaction.options.getSubcommand() == "setup") {
                //#region Start the setup of giveaway + EMBED
                let initialSetup = true
                let userCanceled = false;
                let theSetupChannel = interaction.client.channels.cache.find(chan => chan.id === interaction.channelId)
                let i = 0;
                giveawayEmbed.setDescription(`:tada: Hello ${issuer}, You can cancel the setup at any time by typing "cancel/stop". Also this setup prompt will end <t:${momentOfStart}:R>!`)
                interaction.reply({embeds: [giveawayEmbed]});
                while (initialSetup) {
                    giveawayEmbed.setDescription(questions[i])
                    await theSetupChannel.send({embeds: [giveawayEmbed]}).then(async sharuruMsg =>{
                        await theSetupChannel.awaitMessages({filter,max: 1, time: giveawayWindowTime}).then(rawAnswer =>{
                            let passedTheCheck = true;
                            if(rawAnswer.first().content == "cancel" || rawAnswer.first().content == "stop" || rawAnswer.first().content == "cancel/stop") {
                                initialSetup = false;
                                userCanceled = true;
                                return theSetupChannel.send(`${issuer}, I have canceled the setup of the giveaway!`)//.then(m => tools.mgoAdd(interaction.guildId,interaction.channelId,m.id,ms('3.5s')));
                            }
                            console.log("answer: "+rawAnswer.first().content)
                            console.log("answer t: "+GetTime(rawAnswer.first().content.replace(/\s/g,""))+"type: "+typeof(GetTime(rawAnswer.first().content.replace(/\s/g,""))))
                            console.log("currently: "+i)
                            // check channel
                            if (i == 0)
                                if (rawAnswer.first().mentions.channels.first()?.id == null) {
                                    giveawayEmbed.setDescription(`This isn't a valid channel! Or at least I don't have access to the said channel!`);
                                    passedTheCheck = false;
                                    theSetupChannel.send({embeds: [giveawayEmbed],ephemeral: true}).then(m => tools.mgoAdd(interaction.guildId,interaction.channelId,m.id,ms('3.5s')));
                                } else giveaway_options.channel = rawAnswer.first().mentions.channels.first()?.id;
                            
                            // check time
                            if (i == 1) 
                                if (!CheckTime(rawAnswer.first().content)) {
                                    giveawayEmbed.setDescription(`This isn't a valid time! I can accept only: 1m, 1min, 11min, 1h, 1hour, 11hours, 1d, 1day, 11days\n\n*Note: These are all examples!*`);
                                    passedTheCheck = false;
                                    theSetupChannel.send({embeds: [giveawayEmbed],ephemeral: true}).then(m => tools.mgoAdd(interaction.guildId,interaction.channelId,m.id,ms('3.5s')));
                                } else giveaway_options.time = ms(GetTime(rawAnswer.first().content.replace(/\s/g,"")))

                            // check winners
                            if (i == 2) {
                                let isThisANumber = isNumeric(rawAnswer.first().content)
                                let outboundNumber = rawAnswer.first().content < 1 || rawAnswer.first().content > 250
                                console.log(`what's this: ${isThisANumber}\nON: ${outboundNumber}`)
                                if ( !isThisANumber || outboundNumber) {
                                    giveawayEmbed.setDescription(`This isn't a valid number of winners! You can set the winner amount starting from 1 up to 250!`)//.then(m => tools.mgoAdd(interaction.guildId,interaction.channelId,m.id,ms('3.5s')));
                                    passedTheCheck = false;
                                    theSetupChannel.send({embeds: [giveawayEmbed],ephemeral: true}).then(m => tools.mgoAdd(interaction.guildId,interaction.channelId,m.id,ms('3.5s')));
                                } else giveaway_options.winners = Number(rawAnswer.first().content)
                            }
                            // prize
                            if (i == 3) 
                                if (rawAnswer.first().content.length < 5) {
                                    giveawayEmbed.setDescription(`This isn't a valid input for the prize! Please type more than 5 characters for the prize!`);
                                    passedTheCheck = false;
                                    theSetupChannel.send({embeds: [giveawayEmbed],ephemeral: true}).then(m => tools.mgoAdd(interaction.guildId,interaction.channelId,m.id,ms('3.5s')));
                                } else giveaway_options.prize = rawAnswer.first().content
                            // join through
                            if (i == 4) {
                                if (!checkForItems(rawAnswer.first().content.toLowerCase(),['button','reaction','slash'],'same')) {
                                    giveawayEmbed.setDescription(`This isn't an option! Please type either \`button\`,\`reaction\` or \`slash\`!`)
                                    passedTheCheck = false;
                                    theSetupChannel.send({embeds: [giveawayEmbed], ephemeral: true}).then(m => tools.mgoAdd(interaction.guildId,interaction.channelId,m.id,ms('3.5s')));
                                } else giveaway_options.entryType = rawAnswer.first().content
                            }
                            // use keyword y/n  
                            if (i == 5) {
                                if (!checkForItems(rawAnswer.first().content.toLowerCase(),['yes','no','y','n'],'same')) {
                                    giveawayEmbed.setDescription(`This isn't an option! Please type either \`yes/no\`,\`y/n\`!`)
                                    passedTheCheck = false;
                                    theSetupChannel.send({embeds: [giveawayEmbed], ephemeral: true}).then(m => tools.mgoAdd(interaction.guildId,interaction.channelId,m.id,ms('3.5s')));
                                } else {
                                    if (rawAnswer.first().content.toLowerCase() == "yes" || rawAnswer.first().content.toLowerCase() == "y")
                                        giveaway_options.keyword.use = true
                                    else
                                    {
                                        giveaway_options.keyword.use = false
                                        i+=3;// skip the following if false
                                    }
                                }
                            }
                            // what kind of keyword
                            if (i == 6) {
                                if (rawAnswer.first().content.length < 3 || rawAnswer.first().content.length > 32) {
                                    giveawayEmbed.setDescription(`Please provide a keyword that's longer than 3 characters and lower than 32!`)
                                    passedTheCheck = false;
                                    theSetupChannel.send({embeds: [giveawayEmbed], ephemeral: true}).then(m => tools.mgoAdd(interaction.guildId,interaction.channelId,m.id,ms('3.5s')));
                                } else giveaway_options.keyword.word = rawAnswer.first().content;
                            }
                            // public or private key
                            if (i == 7) {
                                if (!checkForItems(rawAnswer.first().content.toLowerCase(),['yes','no','y','n'],'same')) {
                                    giveawayEmbed.setDescription(`This isn't an option! Please type either \`yes/no\`,\`y/n\`!`)
                                    passedTheCheck = false;
                                    theSetupChannel.send({embeds: [giveawayEmbed], ephemeral: true}).then(m => tools.mgoAdd(interaction.guildId,interaction.channelId,m.id,ms('3.5s')));
                                } else {
                                    if (rawAnswer.first().content.toLowerCase() == "yes" || rawAnswer.first().content.toLowerCase() == "y")
                                        giveaway_options.keyword.public = true
                                    else
                                        giveaway_options.keyword.public = false
                                }
                            }

                            if (i == 8) {
                                if (rawAnswer.first().content.length < 5) giveaway_options.theMessage = `Goodluck everyone!`
                                else giveaway_options.theMessage = rawAnswer.first().content
                                initialSetup = false;   
                            }
                            
                            
                            console.log(giveaway_options)
                            if (passedTheCheck == false) return;
                            // increment when user input is correct
                            i++;
                        })
                    });

                }
                
                if (initialSetup == false && userCanceled == true) return;
                
                let giveawaySetupEmbed = new SharuruEmbed()
                    .setColor(Colors.LuminousVividPink)
                    .setFooter({text: `Requested by ${issuer.username}`,iconURL: issuer.displayAvatarURL({dynamic: true})})
                    .setTitle(`${issuer.username}, please review the giveaway settings:`)
                    .setDescription(`Type \`cancel\`/\`start\` to stop/start the giveaway earlier.
        To edit an option, type: \`keyword: new value\`. E.g: \`winners: 5\`
        P.S: The double dots "\`:\`" are **mandatory**.
        Giveaway setup is closing in: <t:${momentOfStart}:R>`)
                    .addFields([
                        {name: config.extra.emptyField , value:config.extra.emptyField},
                        {name: `★ Giveaway Channel: (keyword: \`channel\`)`, value: giveaway_options.channel ? `<#${giveaway_options.channel}>` : `Not set up`, inline: false},
                        {name: `★ Giveaway Duration: (keyword: \`time\`)`, value: giveaway_options.time ? `- ${pms(giveaway_options.time)}` :  `Not set up`, inline: false},
                        {name: `★ Number of winners: (keyword: \`winners\`)`, value: giveaway_options.winners ? `- ${giveaway_options.winners}` : `Not set up`, inline: false},
                        {name: `★ Giveaway Prize: (keyword: \`prize\`)`, value: giveaway_options.prize ? `- ${giveaway_options.prize}` : `Not set up`, inline: false},
                        {name: `★ Use keyword?: (keyword: \`key.use\`)`, value: giveaway_options.keyword.use == true ? `- Yes! Members need \`"${giveaway_options.keyword.word}"\` keyword to enter!` : "- No, they can enter without keyword!", inline: false},
                        {name: `★ Change keyword?: (keyword: \`key.word\`)`, value: giveaway_options.keyword.use == true ? `- Current keyword: \`${giveaway_options.keyword.word == "any" ? "Any keyword is accepted!" : giveaway_options.keyword.word}\`` : `- Not set up`, inline: false},
                        {name: `★ Make keyword Public?: (keyword: \`key.public\`)`, value: giveaway_options.keyword.use == true ? `- The key will be ${giveaway_options.keyword.public == true ? "published" : "kept private"} in the giveaway message!` : `- Not set up`, inline: false},
                        {name: `★ How to participate: (keyword: \`participate\`)`, value: giveaway_options.entryType ? `${giveaway_options.entryType == "button" ? '- Through button' : giveaway_options.entryType == "reaction" ? "- Through reaction" : '- Through slash command'}` : `Not set up`, inline: false},
                        {name: `★ Message from host/sponsor: (keyword: \`message\`)`, value: giveaway_options.theMessage ? `- ${giveaway_options.theMessage}` : `Not set up`, inline: false},
                    ])
                    theSetupChannel.send({embeds: [giveawaySetupEmbed]}).then(async msg =>{
                    let editGiveaway = true;
                        while (editGiveaway) {
                            try {
                                await theSetupChannel.awaitMessages({filter, time: giveawayWindowTime, max:1}).then(async editCollector=>{
                                    if(editCollector.first().content == "cancel"  || editCollector.first().content == `stop`) {
                                        editGiveaway = false
                                        return theSetupChannel.send(`${issuer}, Okay, canceled creation of the giveaway!`);
                                    }
                                    if(editCollector.first().content == "start") {
                                        editGiveaway = false
                                            
                                        let newGiveawayId = `${interaction.guildId.slice(-3)}${keygen.number({length: 9})}`
                                        let giveawayEmbed = new SharuruEmbed()
                                            .setAuthor({name: `Prize: ${giveaway_options.prize} | ${giveaway_options.winners} Winner(s) | Giveaway Id: ${newGiveawayId}`})
                                            .setDescription(`${giveaway_options.entryType == "button" ? `Click on the button below to enter!` : giveaway_options.entryType == "reaction" ? "React with :tada: to enter!" : `Use \`/raffle join ${newGiveawayId} ${giveaway_options.keyword.use == true ? giveaway_options.keyword.public == true ? giveaway_options.keyword.word == "any" ? "[any keyword]" : `${giveaway_options.keyword.word}` : "<required key>" : ""}`}\` slash command to join!!\n\nEnds at: <t:${parseInt((Date.now()+giveaway_options.time)/1000)}> <t:${parseInt((Date.now()+giveaway_options.time)/1000)}:R>`)
                                            .addFields(
                                                {name: config.extra.emptyField , value: config.extra.emptyField },
                                                {name: `Message from the host/sponsor:`, value: giveaway_options.theMessage}
                                            )
                                            .setColor(Colors.Green)
                                            .setFooter({text: `Started at: ${formatTimeNicely(Date.now(),optionsDate)} | GiveawayId: ${newGiveawayId}`})
                                        let giveawayChan = sharuru.channels.cache.find(chan => chan.id === giveaway_options.channel)
                                        try {
                                            raffleButton.addComponents(
                                                new ButtonBuilder()
                                                .setCustomId(`raffle#join:${newGiveawayId}`)
                                                .setLabel("Join Giveaway!")
                                                .setStyle(ButtonStyle.Success))
                                            let provideThis = giveaway_options.entryType == "button" ? [raffleButton] : []
                                            await giveawayChan.send({embeds: [giveawayEmbed], components: provideThis}).then(r =>{
                                                if (giveaway_options.entryType == "reaction")
                                                    r.react("🎉")
                                            setTimeout(() => {
                                                GuildSettings.findOne({
                                                    ID: interaction.guildId
                                                },(err,res) =>{
                                                    if(err){
                                                        sendError.create({
                                                            Guild_Name: interaction.member.guild.name,
                                                            Guild_ID: interaction.guildId,
                                                            User: issuer.username,
                                                            UserID: issuer.id,
                                                            Error: err,
                                                            Time: `${TheDate} || ${clock} ${amORpm}`,
                                                            Command: this.name + " createGiv - adding banned globally",
                                                            Args: "no args added for raffle interaction slash cmd",
                                                        },async (err2, res2) => {
                                                            if(err2) {
                                                                console.log(err2)
                                                                return interaction.followUp(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                                            }
                                                            if(res2) {
                                                                console.log(`successfully added error to database!`)
                                                                return interaction.followUp(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                                            }
                                                        })
                                                    }
                                                    if (res) {
                                                        giveawayModel.create({
                                                            raffleId: newGiveawayId,
                                                            creator: {
                                                                name: issuer.username,
                                                                id: issuer.id
                                                            },
                                                            location: {
                                                                messageId: r.id,
                                                                channelId: r.channel.id,
                                                                guildId: r.guild.id,
                                                            },
                                                            key: {
                                                                enabled: giveaway_options.keyword.use,
                                                                word: giveaway_options.keyword.word,
                                                                public: giveaway_options.keyword.public
                                                            },
                                                            timeAt: {
                                                                start: Date.now(),
                                                                duration: giveaway_options.time, 
                                                                end: giveaway_options.time + Date.now(),
                                                            },
                                                            ended: false,
                                                            winnerCount: giveaway_options.winners,
                                                            behavior: {
                                                                entry: {
                                                                    type: giveaway_options.entryType
                                                                }
                                                            },
                                                            prize: giveaway_options.prize,
                                                            messagesG: giveaway_options.theMessage,
                                                            tempBan: res.raffleSettings.bans
                                                        })
                                                    }
                                                })
                                            }, 1000);
                                            })
                                        } catch (error) {
                                            console.log(error)
                                            let urlARR = error.url?.split("/");
                                            interaction.followUp(`[Giveaway-Setup]: It seems like I got an error while trying to finish the setup!
        \nCheck out if I can see the channel & have the necessary permissions (send,embed,reactions, slash) to work it out!
        \n\n**ERROR**: ${error.rawError?.message} in <#${urlARR[urlARR?.length-2]}> (${error.rawError?.code})`)
                                        }
                                        
                                        return theSetupChannel.send(`${issuer}, Okay, started the giveaway!`).then(m => tools.mgoAdd(interaction.guildId,interaction.channelId,m.id,ms('3.5s')));
                                    }
                                    let theResponse = editCollector.first().content
                                    let getIndexDoubleDots = theResponse.indexOf(":")
                                    let extractName = theResponse.substring(0,getIndexDoubleDots)
                                    let extractValue = theResponse.substring(getIndexDoubleDots+1)
                                    //#region Assign the new values if edited
                                        if (extractName == `channel`) {
                                            console.log(`New Channel detected!`)
                                            if (editCollector.first().mentions.channels) {
                                                giveaway_options.channel = editCollector.first().mentions.channels.first()?.id
                                            } else return theSetupChannel.send(`${issuer}, there wasn't any channel mentioned. Please try again!`).then(m => tools.mgoAdd(interaction.guildId,interaction.channelId,r.id,ms('3.5s')));
                                        }
                                        console.log(extractName)
                                        if (extractName == `time`) {
                                            extractValue = extractValue.replace(/\s/g,"")
                                            let timesuf = ['s','m','min','h','hour','hours','d','days','w','weeks']
                                            if (checkForItems(extractValue,timesuf,"includes")) {
                                                giveaway_options.time = ms(extractValue);
                                                console.log(`contain not months`)
                                            }
                                            if (checkForItems(extractValue,['mon','months'],"includes")){
                                                console.log(`collected: `+extractValue)
                                                let pleasework = extractValue.replace(/\s/g,'')
                                                let response = parseInt(pleasework)
                                                console.log(`after parsing: ${response}`)
                                                let month = 2629746000
                                                displayTime = response
                                                giveaway_options.time = response * month
                                                console.log(`months: `+giveaway_options.time)
                                            }
                                            if (isNaN(giveaway_options.time)) {
                                                return theSetupChannel.send(`${issuer}, that doesn\'t seem to be a valid number for time. Please try again.`).then(m => tools.mgoAdd(interaction.guildId,interaction.channelId,m.id,ms('3.5s')));
                                            }
                                            if (giveaway_options.time < 299999 || giveaway_options.time > 31557600000){
                                                return theSetupChannel.send(`${issuer}, you can't make a giveaway that isn't lasting 5 min or last more than 1 year! Please try again.`).then(m => tools.mgoAdd(interaction.guildId,interaction.channelId,m.id,ms('3.5s')));
                                            }
                                        }
                                        if (extractName == `winners`) {
                                            if (isNaN(extractValue) || (extractValue < 1 || extractValue > 250)) return theSetupChannel.send(`${issuer}, that doesn\'t seem to be a valid number. Please try again. Make sure the amount of winners is at least 1 and max 250!`).then(m => tools.mgoAdd(interaction.guildId,interaction.channelId,m.id,ms('3.5s')));
                                            giveaway_options.winners = extractValue
                                        }
                                        if (extractName == `prize`) giveaway_options.prize = extractValue
                                        if (extractName == `message`) giveaway_options.theMessage = extractValue

                                        if (extractName == "key.use") {
                                            if (!checkForItems(extractValue.toLowerCase(),['yes','no','y','n'],'same')) {
                                                giveawayEmbed.setDescription(`This isn't an option! Please type either \`yes/no\`,\`y/n\`!`)
                                                theSetupChannel.send({embeds: [giveawayEmbed], ephemeral: true})
                                            } else {
                                                if (extractValue.toLowerCase() == "yes" || extractValue.toLowerCase() == "y")
                                                    giveaway_options.keyword.use = true
                                                else
                                                    giveaway_options.keyword.use = false
                                            }
                                        }
                                        if (extractName == "key.word") {
                                            if (extractValue.toLowerCase().length < 3 || extractValue.toLowerCase().length > 32) {
                                                giveawayEmbed.setDescription(`Please provide a keyword that's longer than 3 characters and lower than 32!`)
                                                theSetupChannel.send({embeds: [giveawayEmbed], ephemeral: true})
                                            } else giveaway_options.keyword.word = extractValue; 
                                        }
                                        if (extractName == "key.public") {
                                            if (!checkForItems(extractValue.toLowerCase(),['yes','no','y','n'],'same')) {
                                                giveawayEmbed.setDescription(`This isn't an option! Please type either \`yes/no\`,\`y/n\`!`)
                                                theSetupChannel.send({embeds: [giveawayEmbed], ephemeral: true})
                                            } else {
                                                if (extractValue.toLowerCase() == "yes" || extractValue.toLowerCase() == "y")
                                                    giveaway_options.keyword.public = true
                                                else
                                                    giveaway_options.keyword.public = false
                                            }
                                        }

                                        if (extractName == 'participate') {
                                            console.log(`participate method changed!`)
                                            if (!checkForItems(extractValue.toLowerCase(),['button','reaction','slash'],'same'))
                                                return theSetupChannel.send(`${issuer}, this option isn't valid! Please type either \`button\` or \`reaction\`!`).then(m => tools.mgoAdd(interaction.guildId,interaction.channelId,r.id,ms('3.5s')));
                                            else giveaway_options.entryType = extractValue.toLowerCase() 
                                        }
                                    //#endregion

                                    //#region Apply the settings
                                    // console.log(giveawaySetupEmbed.data.fields)
                                    giveawaySetupEmbed.data.fields[1].value = `<#${giveaway_options.channel}>` // set channel
                                    giveawaySetupEmbed.data.fields[2].value = `- ${pms(giveaway_options.time)}` // set time
                                    giveawaySetupEmbed.data.fields[3].value = `- ${giveaway_options.winners}`// set winners
                                    giveawaySetupEmbed.data.fields[4].value = `- ${giveaway_options.prize}` // set prize
                                    giveawaySetupEmbed.data.fields[5].value = giveaway_options.keyword.use == true ? `- Yes! Members need \`"${giveaway_options.keyword.word}"\` keyword to enter!` : "- No, they can enter without keyword!" // set use keyword
                                    giveawaySetupEmbed.data.fields[6].value = giveaway_options.keyword.use == true ? `- Current keyword: \`${giveaway_options.keyword.word == "any" ? "Any keyword is accepted!" : giveaway_options.keyword.word}\`` : `- Not set up` // set change keyword
                                    giveawaySetupEmbed.data.fields[7].value = giveaway_options.keyword.use == true ? `- The key will be ${giveaway_options.keyword.public == true ? "published" : "kept private"} in the giveaway message!` : `- Not set up` // set public keyword y/n
                                    giveawaySetupEmbed.data.fields[8].value = giveaway_options.entryType ? `-${giveaway_options.entryType == "button" ? '- Through button' : giveaway_options.entryType == "reaction" ? "- Through reaction" : '- Through slash command'}` : `Not set up` // set participation type
                                    giveawaySetupEmbed.data.fields[9].value = `- ${giveaway_options.theMessage}`
                                    //#endregion
                                    msg.edit({embeds: [giveawaySetupEmbed]})
                                    editCollector.first().delete();
                                })
                            } catch (error) {
                                console.log(error)
                                editGiveaway = false;
                            }
                        }
                    })
                //#endregion
                }

                if (interaction.options.getSubcommand() == "join" && interaction.options.getSubcommandGroup() == null)
                {
                    console.log(`[RaffleSys-${interaction.member.guild.name} (${interaction.guildId}) | ${TheDate}-${clock} ${amORpm}]: THE USER ${issuer.username} tries to join ${get_giveaway_id} giveaway with keyword ${get_set_keyword}`)
                    // interaction.deferUpdate()
                    giveawayModel.findOne({
                        raffleId: get_giveaway_id
                    },(err,res) =>{
                        if(err){
                            sendError.create({
                                Guild_Name: interaction.member.guild.name,
                                Guild_ID: interaction.guildId,
                                User: issuer.username,
                                UserID: issuer.id,
                                Error: err,
                                Time: `${TheDate} || ${clock} ${amORpm}`,
                                Command: this.name + " join",
                                Args: "no args added for raffle interaction slash cmd",
                            },async (err2, res2) => {
                                if(err2) {
                                    console.log(err2)
                                    return interaction.followUp(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                }
                                if(res2) {
                                    console.log(`successfully added error to database!`)
                                    return interaction.followUp(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                }
                            })
                        }
                        if (res)
                        {
                            let usrObj = {
                                name: issuer.username,
                                userId: issuer.id,
                                time: Date.now(),
                                roles: interaction.member.roles.cache
                                .sort((a, b) => b.position - a.position)
                                .map(role => role.id)
                                .slice(0, -1),
                                keyword: get_set_keyword ?? "None"
                            }
                            let userOwnsSpecialRole = false;

                            // check whenever the entry is open or not before anything else
                            if (res.behavior.entry.open == false)
                            {
                                console.log(`[RaffleSys-${interaction.member.guild.name} (${interaction.guildId}) | ${TheDate}-${clock} ${amORpm}]: THE USER ${issuer.username} couldn't join ${get_giveaway_id} because it's entries are closed!`)
                                giveawayEmbed.setDescription(`${issuer}, ${res.behavior.messages.entry}`)
                                return mReply({embeds: [giveawayEmbed]})
                            }

                            if (res.behavior.roles.restrictions.special.pool.length > 0) 
                            {
                                console.log(`[RaffleSys-${interaction.member.guild.name} (${interaction.guildId}) | ${TheDate}-${clock} ${amORpm}]: checking @${issuer.username} for special roles of giveaway ${get_giveaway_id}...`)
                                const userRoles = interaction.member.roles.cache;
                                
                                for (let i = 0; i < res.behavior.roles.restrictions.special.pool.length; i++) {
                                    const specialRoleFromGiveaway = res.behavior.roles.restrictions.special.pool[i];
                                    const specialRoleFromUserToCheck = userRoles.find(uRole => uRole.id == specialRoleFromGiveaway.role_id)
                                    
                                    console.log(`[RaffleSys-${interaction.member.guild.name} (${interaction.guildId}) | ${TheDate}-${clock} ${amORpm}]: checking "${specialRoleFromGiveaway.namae} (${specialRoleFromGiveaway.role_id})" speacial role for ${issuer.username}...`)
                                    if (specialRoleFromUserToCheck != undefined || specialRoleFromUserToCheck != null) {
                                        userOwnsSpecialRole = true
                                        console.log(`[RaffleSys-${interaction.member.guild.name} (${interaction.guildId}) | ${TheDate}-${clock} ${amORpm}]: the user ${issuer.username} owns a special role.`)
                                    }
                                }
                                console.log(`[RaffleSys-${interaction.member.guild.name} (${interaction.guildId}) | ${TheDate}-${clock} ${amORpm}]: result of special role search: ${userOwnsSpecialRole}`)

                            }

                            // check whenever the giveaway blocks any role
                            if (res.behavior.roles.restrictions.block.length > 0)
                            {
                                console.log(`[RaffleSys-${interaction.member.guild.name} (${interaction.guildId}) | ${TheDate}-${clock} ${amORpm}]: the user ${issuer.username} tries to join, checking for blocked roles of giveaway ${get_giveaway_id}...`)
                                const userRoles = interaction.member.roles.cache;
                                let stopUser = false;
                                for (let i = 0; i < res.behavior.roles.restrictions.block.length; i++) {
                                    const blockedRoleFromGiveaway = res.behavior.roles.restrictions.block[i];
                                    const blockedRoleFromUserToCheck = userRoles.find(uRole => uRole.id == blockedRoleFromGiveaway.role_id)
                                    
                                    console.log(`[RaffleSys-${interaction.member.guild.name} (${interaction.guildId}) | ${TheDate}-${clock} ${amORpm}]: checking "${blockedRoleFromGiveaway.namae} (${blockedRoleFromGiveaway.role_id})" for ${issuer.username}...`)
                                    if (blockedRoleFromUserToCheck != undefined || blockedRoleFromUserToCheck != null) {
                                        stopUser = true;
                                        console.log(`[RaffleSys-${interaction.member.guild.name} (${interaction.guildId}) | ${TheDate}-${clock} ${amORpm}]: the user ${issuer.username} owns a blocked role. stopping...`)
                                    }
                                }
                                console.log(`[RaffleSys-${interaction.member.guild.name} (${interaction.guildId}) | ${TheDate}-${clock} ${amORpm}]: result of stopUser: ${stopUser}`)
                                
                                //res.behavior.roles.restrictions.special.mode
                                if (stopUser && !(userOwnsSpecialRole && (res.behavior.roles.restrictions.special.mode == "mode2" || res.behavior.roles.restrictions.special.mode == "mode3"))) 
                                {
                                    giveawayEmbed.setDescription(`${issuer}, ${res.behavior.messages.block}`)
                                    mReply({embeds: [giveawayEmbed]})
                                    return
                                } else {
                                    console.log(`[RaffleSys-${interaction.member.guild.name} (${interaction.guildId}) | ${TheDate}-${clock} ${amORpm}]: the user @${issuer.username} was supposed to be stopped for blocked roles but they had special role so they bypass!`)
                                }
                            }

                            // check whenever the giveaway requries any role
                            if (res.behavior.roles.restrictions.require.pool.length > 0)
                            {
                                console.log(`[RaffleSys-${interaction.member.guild.name} (${interaction.guildId}) | ${TheDate}-${clock} ${amORpm}]: the user ${issuer.username} tries to join, checking for required roles of giveaway ${get_giveaway_id}...`)
                                const userRoles = interaction.member.roles.cache;
                                let stopUser = false;
                                let missingRoles = 0;
                                const allRequiredRolesLength = res.behavior.roles.restrictions.require.pool.length 
                                const requireMode = res.behavior.roles.restrictions.require.mode; // true = require all roles | false = require 1 role
                                
                                for (let i = 0; i < allRequiredRolesLength; i++) {
                                    const requiredRole = res.behavior.roles.restrictions.require.pool[i];
                                    const findRequiredRole = userRoles.find(uRole => uRole.id == requiredRole.role_id)

                                    console.log(`[RaffleSys-${interaction.member.guild.name} (${interaction.guildId}) | ${TheDate}-${clock} ${amORpm}]: checking "${requiredRole.namae} (${requiredRole.role_id})" for ${issuer.username}...`)
                                    
                                    if (findRequiredRole == undefined || findRequiredRole == null) {
                                        console.log(`[RaffleSys-${interaction.member.guild.name} (${interaction.guildId}) | ${TheDate}-${clock} ${amORpm}]: the user ${issuer.username} doesn't owns this role "${requiredRole.namae}"... Next!`)
                                        missingRoles++
                                    }
                                }

                                // now we are deciding whenever to stop or not the user based on the requiredMode
                                if (requireMode) // require all roles
                                {
                                    if (missingRoles != 0) {
                                        stopUser = true;
                                        console.log(`[RaffleSys-${interaction.member.guild.name} (${interaction.guildId}) | ${TheDate}-${clock} ${amORpm}]: the user ${issuer.username} cannot join: They don't own all roles required for giveaway (user missing roles:${missingRoles} != giveaway required roles:${allRequiredRolesLength})!`)
                                    }
                                } else {// require at least one
                                    if (missingRoles == allRequiredRolesLength) {
                                        console.log(`[RaffleSys-${interaction.member.guild.name} (${interaction.guildId}) | ${TheDate}-${clock} ${amORpm}]: the user ${issuer.username} cannot join: They don't own at least 1 role require (user missing roles:${missingRoles})`)
                                        stopUser = true;  
                                    }
                                    
                                }

                                console.log(`[RaffleSys-${interaction.member.guild.name} (${interaction.guildId}) | ${TheDate}-${clock} ${amORpm}]: Data after checking:\nmissingRoles: ${missingRoles}\nstopUser: ${stopUser}`)
                                
                                if (stopUser && !(userOwnsSpecialRole && (res.behavior.roles.restrictions.special.mode == "mode1" || res.behavior.roles.restrictions.special.mode == "mode3"))) 
                                {
                                    giveawayEmbed.setDescription(`${issuer}, ${res.behavior.messages.require}`)
                                    return mReply({embeds: [giveawayEmbed]})
                                } else {
                                    console.log(`[RaffleSys-${interaction.member.guild.name} (${interaction.guildId}) | ${TheDate}-${clock} ${amORpm}]: the user @${issuer.username} was supposed to be stopped for no required roles but they had special role so they bypass!`)
                                }
                            }

                            // ask if keyword required (or any)
                            if (res.key.enabled)
                            {
                                if (get_set_keyword == null)
                                {
                                    giveawayEmbed.setDescription("Please provide a keyword since one is required for this giveaway!")
                                    return interaction.reply({embeds: [giveawayEmbed]})
                                }

                                // if we have "any" keyword enabled and we don't allow duplicate keywords...
                                if (res.key.word == "any" && !res.key.allowDuplicateKeywords)
                                {
                                    // search if such keyword exist already
                                    let findDuplicateKey = res.people_reacted.findIndex(item => item.keyword == get_set_keyword)

                                    giveawayEmbed.setDescription(`${issuer}, this giveaway doesn't allow duplicate keywords! Please provide a different keyword!`)
                                    // if it exist, stop them!
                                    if (findDuplicateKey != -1)
                                    return interaction.reply({embeds: [giveawayEmbed]})
                                }

                                if (res.key.word != "any" && get_set_keyword.toLowerCase() != res.key.word)
                                {
                                    giveawayEmbed.setDescription("Unfortunately this isn't the right keyword to enter the giveaway! Check if you got the right keyword!")
                                    return interaction.reply({embeds: [giveawayEmbed]})
                                }
                            }

                            // add player to giveaway if it's not
                            if (!res.people_reacted.some(people => people['userId'] === usrObj['userId'])) {
                                res.people_reacted.push(usrObj);
                                giveawayEmbed.setDescription(`${issuer} joined the giveaway "*${res.prize}*"!`)
                                interaction.reply({embeds: [giveawayEmbed], ephemeral: false})
                                res.save().catch(err=>console.log(err))
                                console.log(`[RaffleSys/ ${TheDate} | ${clock} ${amORpm}]:@${issuer.username} joined giveaway ${get_giveaway_id}`)

                                // add role upon joining if any but check the following before doing so:
                                // - check if the role still exists
                                // - check if the my role hierarchy is higher than the role to be assigned
                                // - check if I have permissions to assign the role
                                // - check if the member has already the role 
                                if (res.behavior.roles.assignRoleOnJoining.role_id != "NOT_SET") {
                                    
                                    // check if the role still exists
                                    let doesRoleStillExist = interaction.guild.roles.cache.find(role => role.id == res.behavior.roles.assignRoleOnJoining.role_id)
                                    if (doesRoleStillExist == undefined || doesRoleStillExist == null) {
                                        console.log(`[RaffleSys/ ${TheDate} | ${clock} ${amORpm}]: couldn't assign the role to @${issuer.username} for joining ${get_giveaway_id} because the role may be... non-existent?!`)
                                        giveawayEmbed.setDescription(`${issuer}, it seems like I couldn't find the role that was supposed to be assigned to you. Please contact moderators to check this out!`)
                                        return ni_reply({embeds: [giveawayEmbed]},interaction.channelId)
                                    }
                                    
                                    // we need to update our important data if a day passed
                                    if ((parseInt(resGuild.importantData.highestRole.lastUpdate)+86400000) < Date.now())
                                    {
                                        let highestRoleOrder = 0
                                        let highestRole = null;
                                        const roleKeys = [...interaction.guild.members.me.roles.cache.keys()]
                                        console.log(`[RaffleSys/ ---]: Time to update our database with importantData: ${interaction.guild.members.me.roles.cache.size} roles found on myself`)
                                        for(let i = 0; i < interaction.guild.members.me.roles.cache.size; i++){
                                            let getRoleData = interaction.guild.roles.cache.get(roleKeys[i])
                                            if (getRoleData.position > highestRoleOrder) {
                                                highestRoleOrder = getRoleData.position;
                                                highestRole = getRoleData
                                            }
                                        }

                                        resGuild.importantData.highestRole.id = highestRole.id;
                                        resGuild.importantData.highestRole.namae = highestRole.name;
                                        resGuild.importantData.highestRole.position = highestRoleOrder;
                                        resGuild.importantData.highestRole.permissions = highestRole.permissions.toArray();
                                        resGuild.importantData.highestRole.lastUpdate = Date.now();
                                        resGuild.save().catch(err3 =>{
                                            console.log(err3)
                                            mReply(null,interaction.channelId,`[Raffle-assign_role_on_join]: Unfortunately an error happened while trying to save to db. If this happens often, please contact my partner!`)
                                        })
                                    }

                                    // check if my hierarchy is higher than the role to be assigned
                                    if (resGuild.importantData.highestRole.position < doesRoleStillExist.position)
                                    {
                                        console.log(`[raffleSys/ ${TheDate} | ${clock} ${amORpm}]: Currently my role pos: ${resGuild.importantData.highestRole.position}\nthe assigned position: ${doesRoleStillExist.position}`)
                                        console.log(`[RaffleSys/ ${TheDate} | ${clock} ${amORpm}]: couldn't assign the role to @${issuer.username} for joining ${get_giveaway_id} because my role position might be beneath the assgined role!`)
                                        giveawayEmbed.setDescription(`${issuer}, it seems like the role that should have been assigned is a bit higher than the highest role of mine so I couldn't give you the role. Please contact moderators to check this out!`)
                                        return ni_reply({embeds: [giveawayEmbed]},interaction.channelId)
                                    }
                                    
                                    // check if I have permission to assign role
                                    if (!interaction.guild.members.me.permissions.has("ManageRoles"))
                                    {
                                        console.log(`[RaffleSys/ ${TheDate} | ${clock} ${amORpm}]: couldn't assign the role to @${issuer.username} for joining ${get_giveaway_id} because I may lack permissions to assign roles!`)
                                        giveawayEmbed.setDescription(`${issuer}, it seems like I don't have permissions to give you a role. Please contact moderators to check this out`)
                                        return ni_reply({embeds: [giveawayEmbed]},interaction.channelId)
                                    }

                                    // check if the member doesn't have the role already
                                    if (interaction.member.roles.cache.find(role => role.id == doesRoleStillExist.id))
                                    {
                                        console.log(`[RaffleSys/ ${TheDate} | ${clock} ${amORpm}]: couldn't assign the role to @${issuer.username} for joining ${get_giveaway_id} because they already have it!`)
                                        giveawayEmbed.setDescription(`${issuer}, it seems like you have this role already so there's nothing left to do :)`)
                                        return ni_reply({embeds: [giveawayEmbed]},interaction.channelId)
                                    }

                                    //if all checks pass, assign the role

                                    interaction.member.roles.add(doesRoleStillExist)
                                    console.log(`[RaffleSys/ ${TheDate} | ${clock} ${amORpm}]:@${issuer.username} was assigned the role ${doesRoleStillExist.name} (${doesRoleStillExist.id}) for joining ${get_giveaway_id}!`)
                                    giveawayEmbed.setDescription(`${issuer}, you got the following role for joining this giveaway: ${doesRoleStillExist}`)
                                    return ni_reply({embeds: [giveawayEmbed]},interaction.channelId)
                                }
                            } else {
                                // ask if player wishes to get out from giveaway if it's already in the giveaway 
                                // console.log(`user ${issuer.username} is trying to leave`)
                                // raffleButton.addComponents(
                                //     new ButtonBuilder()
                                //     .setCustomId(`raffle#leave:${get_giveaway_id}:${issuer.id}`)
                                //     .setLabel("Leave Giveaway!")
                                //     .setStyle(ButtonStyle.Danger))

                                giveawayEmbed.setDescription(`You're already participating in this giveaway. In order to leave, please use **\`/raffle leave <Id>\`** where **\`<Id>\`** is replaced with the id of the giveaway!`)
                                // interaction.reply({embeds: [giveawayEmbed], components: [raffleButton], ephemeral: false})
                                mReply({embeds: [giveawayEmbed]})
                            }
                        } else {
                            giveawayEmbed.setDescription(`Unfortunately I couldn't find that giveaway. Are you sure you typed correctly the Id?`)
                            .setColor("Gold")
                            interaction.reply({embeds: [giveawayEmbed], false: true})
                        }
                    })
                }

                if (interaction.options.getSubcommand() == "leave" && interaction.options.getSubcommandGroup() == null)
                {
                    console.log(`[raffle.js-SLASH]: THE USER ${issuer.username} tries to leave ${get_giveaway_id} giveaway`)
                    giveawayModel.findOne({
                        raffleId: get_giveaway_id
                    },(err,res) =>{
                        if(err){
                            sendError.create({
                                Guild_Name: interaction.member.guild.name,
                                Guild_ID: interaction.guildId,
                                User: issuer.username,
                                UserID: issuer.id,
                                Error: err,
                                Time: `${TheDate} || ${clock} ${amORpm}`,
                                Command: this.name + " leave",
                                Args: "no args added for raffle interaction slash cmd",
                            },async (err2, res2) => {
                                if(err2) {
                                    console.log(err2)
                                    return interaction.followUp(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                }
                                if(res2) {
                                    console.log(`successfully added error to database!`)
                                    return interaction.followUp(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                }
                            })
                        }
                        if (res)
                        {
                            let getMemberIfExists = res.people_reacted.findIndex(member => member.userId  == issuer.id)
                            if (getMemberIfExists == -1) // if it doens't exist
                            {
                                giveawayEmbed.setDescription(`${issuer}, you're not participanting in this giveaway!`)
                                return mReply({embeds: [giveawayEmbed]})
                            }

                            res.people_reacted.splice(getMemberIfExists,1)
                            res.save().catch(err3 =>{
                                console.log(err3)
                                mReply(null,interaction.channelId,`[Raffle-add_role]: Unfortunately an error happened while trying to save to db. If this happens often, please contact my partner!`)
                            })
                            giveawayEmbed.setDescription(`${issuer}, you're officially not participating in this giveaway anymore!`)
                            mReply({embeds: [giveawayEmbed]})
                            if (res.behavior.roles.assignRoleOnLeaving.role_id != "NOT_SET") {
                                    
                                // check if the role still exists
                                let doesRoleStillExist = interaction.guild.roles.cache.find(role => role.id == res.behavior.roles.assignRoleOnLeaving.role_id)
                                if (doesRoleStillExist == undefined || doesRoleStillExist == null) {
                                    console.log(`[RaffleSys/ ${TheDate} | ${clock} ${amORpm}]: couldn't remove the role of @${issuer.username} for leaving ${get_giveaway_id} because the role may be... non-existent?!`)
                                    giveawayEmbed.setDescription(`${issuer}, it seems like I couldn't find the role that was supposed to be removed from you. Please contact moderators to check this out!`)
                                    return ni_reply({embeds: [giveawayEmbed]},interaction.channelId)
                                }
                                
                                // we need to update our important data if a day passed
                                if ((parseInt(resGuild.importantData.highestRole.lastUpdate)+86400000) < Date.now())
                                {
                                    let highestRoleOrder = 0
                                    let highestRole = null;
                                    const roleKeys = [...interaction.guild.members.me.roles.cache.keys()]
                                    console.log(`[RaffleSys/ ---]: Time to update our database with importantData: ${interaction.guild.members.me.roles.cache.size} roles found on myself`)
                                    for(let i = 0; i < interaction.guild.members.me.roles.cache.size; i++){
                                        let getRoleData = interaction.guild.roles.cache.get(roleKeys[i])
                                        if (getRoleData.position > highestRoleOrder) {
                                            highestRoleOrder = getRoleData.position;
                                            highestRole = getRoleData
                                        }
                                    }

                                    resGuild.importantData.highestRole.id = highestRole.id;
                                    resGuild.importantData.highestRole.namae = highestRole.name;
                                    resGuild.importantData.highestRole.position = highestRoleOrder;
                                    resGuild.importantData.highestRole.permissions = highestRole.permissions.toArray();
                                    resGuild.importantData.highestRole.lastUpdate = Date.now();
                                    resGuild.save().catch(err3 =>{
                                        console.log(err3)
                                        mReply(null,interaction.channelId,`[Raffle-assign_role_on_join]: Unfortunately an error happened while trying to save to db. If this happens often, please contact my partner!`)
                                    })
                                }

                                // check if my hierarchy is higher than the role to be removed
                                if (resGuild.importantData.highestRole.position < doesRoleStillExist.position)
                                {
                                    console.log(`[raffleSys/ ${TheDate} | ${clock} ${amORpm}]: Currently my role pos: ${resGuild.importantData.highestRole.position}\nthe assigned position: ${doesRoleStillExist.position}`)
                                    console.log(`[RaffleSys/ ${TheDate} | ${clock} ${amORpm}]: couldn't remove the role of @${issuer.username} for leaving ${get_giveaway_id} because my role position might be beneath the assgined role!`)
                                    giveawayEmbed.setDescription(`${issuer}, it seems like the role that should have been removed is a bit higher than the highest role of mine so I couldn't remove it. Please contact moderators to check this out!`)
                                    return ni_reply({embeds: [giveawayEmbed]},interaction.channelId)
                                }
                                
                                // check if I have permission to assign role
                                if (!interaction.guild.members.me.permissions.has("ManageRoles"))
                                {
                                    console.log(`[RaffleSys/ ${TheDate} | ${clock} ${amORpm}]: couldn't remove the role of @${issuer.username} for leaving ${get_giveaway_id} because I may lack permissions to assign roles!`)
                                    giveawayEmbed.setDescription(`${issuer}, it seems like I don't have permissions to remove a role from you. Please contact moderators to check this out`)
                                    return ni_reply({embeds: [giveawayEmbed]},interaction.channelId)
                                }

                                // check if the member has the role to remove it, otherwise don't do anything
                                if (!interaction.member.roles.cache.find(role => role.id == doesRoleStillExist.id))
                                {
                                    console.log(`[RaffleSys/ ${TheDate} | ${clock} ${amORpm}]: couldn't remove the role of @${issuer.username} for leaving ${get_giveaway_id} because they don't have it!`)
                                    giveawayEmbed.setDescription(`${issuer}, it seems like you don't have this role so there's nothing left to do :)`)
                                    return ni_reply({embeds: [giveawayEmbed]},interaction.channelId)
                                }

                                //if all checks pass, assign the role

                                interaction.member.roles.remove(doesRoleStillExist)
                                console.log(`[RaffleSys/ ${TheDate} | ${clock} ${amORpm}]:@${issuer.username} was removed the role ${doesRoleStillExist.name} (${doesRoleStillExist.id}) for leaving ${get_giveaway_id}!`)
                                giveawayEmbed.setDescription(`${issuer}, I've removed a role you were possibly given at beginning of joining this giveaway`)
                                return ni_reply({embeds: [giveawayEmbed]},interaction.channelId)
                            }
                        } else {
                            giveawayEmbed.setDescription(`Unfortunately I couldn't find that giveaway. Are you sure you typed correctly the Id?`)
                            .setColor("Gold")
                            mReply({embeds: [giveawayEmbed]})
                        }
                    })
                }

                if (interaction.options.getSubcommand() == "select")
                {
                    console.log(`[raffle]: raffle id: ${get_giveaway_id}`)
                    giveawayModel.findOne({
                        raffleId: get_giveaway_id
                    },(err,res) =>{
                        if(err){
                            sendError.create({
                                Guild_Name: interaction.member.guild.name,
                                Guild_ID: interaction.guildId,
                                User: issuer.username,
                                UserID: issuer.id,
                                Error: err,
                                Time: `${TheDate} || ${clock} ${amORpm}`,
                                Command: this.name + " select",
                                Args: "no args added for raffle interaction slash cmd",
                            },async (err2, res2) => {
                                if(err2) {
                                    console.log(err2)
                                    return interaction.followUp(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                }
                                if(res2) {
                                    console.log(`successfully added error to database!`)
                                    return interaction.followUp(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                }
                            })
                        }
                        if (res)
                        {
                            if (res.location.guildId == interaction.guildId)
                            {
                                resGuild.raffleSettings.selectedRaffleId = get_giveaway_id;
                                giveawayEmbed.setDescription(`The giveaway Id,\`${get_giveaway_id}\`, has been selected for editing!`)
                                resGuild.save().catch(err3 =>{
                                    console.log(err3)
                                    mReply(null,interaction.channelId,`[Raffle]: Unfortunately an error happened while trying to save to db. If this happens often, please contact my partner!`)
                                })
                                sharuru.giveawaysQueue.set(raffleIdEdit,get_giveaway_id)
                                mReply({embeds: [giveawayEmbed]})
                            } else {
                                giveawayEmbed.setDescription(`This giveaway Id,\`${get_giveaway_id}\`, is invalid! Please check again if this Id is from your server!`)
                                mReply({embeds: [giveawayEmbed]})
                            }
                        } else {
                            giveawayEmbed.setDescription(`The giveaway Id,\`${get_giveaway_id}\`, is invalid! Check agan if  this Id exists!`)
                            mReply({embeds: [giveawayEmbed]})
                        }
                    })
                }

                if (interaction.options.getSubcommand() == "key")
                {
                    checkIdRaffle();
                    giveawayModel.findOne({
                        raffleId: sharuru.giveawaysQueue.get(raffleIdEdit)
                    },(err,res) =>{
                        if (err){
                            sendError.create({
                                Guild_Name: interaction.member.guild.name,
                                Guild_ID: interaction.guildId,
                                User: issuer.username,
                                UserID: issuer.id,
                                Error: err,
                                Time: `${TheDate} || ${clock} ${amORpm}`,
                                Command: this.name + " key",
                                Args: "no args added for raffle interaction slash cmd",
                            },async (err2, res2) => {
                                if(err2) {
                                    console.log(err2)
                                    return interaction.followUp(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                }
                                if(res2) {
                                    console.log(`successfully added error to database!`)
                                    return interaction.followUp(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                }
                            })
                        }
                        if (res) {
                            // const isPublic = interaction.options.getBoolean("public")
                            if (get_isEnabled != null)
                            {
                                console.log(`[RaffleSys-${interaction.member.guild.name} (${interaction.guildId}) | ${TheDate}-${clock} ${amORpm}] | ${TheDate}-${clock} ${amORpm}]: @${issuer.username} edited ${checkIdAvailability} key state to be ${get_isEnabled}`)
                                res.key.enabled = get_isEnabled
                                changesDone += `- set the giveaway so ${get_isEnabled == true ? "it requires" : "it doesn't require"} a keyword to participate!\n`
                            }
                            if (get_set_keyword != null)
                            {
                                console.log(`[RaffleSys-${interaction.member.guild.name} (${interaction.guildId}) | ${TheDate}-${clock} ${amORpm}] | ${TheDate}-${clock} ${amORpm}]: @${issuer.username} edited ${checkIdAvailability} keyword to be ${get_set_keyword}`)
                                res.key.word = get_set_keyword.trim()
                                changesDone += `- set the keyword to be \`${get_set_keyword}\`! ${get_set_keyword == "any" ? "Members need to provide any keyword and they can enter;": `Members need to type exactly the keyword to enter;`}\n`
                            }
                            if (get_allow_duplicates != null)
                            {
                                console.log(`[RaffleSys-${interaction.member.guild.name} (${interaction.guildId}) | ${TheDate}-${clock} ${amORpm}] | ${TheDate}-${clock} ${amORpm}]: @${issuer.username} edited ${checkIdAvailability} to ${get_allow_duplicates == false ? "not allow duplicates":"allow duplicates"}`)
                                res.key.allowDuplicateKeywords = get_allow_duplicates
                                changesDone += `- set the giveaway to ${get_allow_duplicates == false ? "not allow duplicate keywords;": `allow duplicate keywords;`}\n`
                            }
                            res.save().catch(err3 =>{
                                console.log(err3)
                                mReply(null,interaction.channelId,`[Raffle]: Unfortunately an error happened while trying to save to db. If this happens often, please contact my partner!`)
                            })
                            giveawayEmbed.setDescription(changesDone)
                            .setAuthor({name: `Giveaway Editor:`})
                            interaction.reply({embeds: [giveawayEmbed]})

                            // if (isPublic != null)
                            // {
                            //     res.key.public = isPublic
                            //     res.save().catch(err3 =>{
                            //         console.log(err3)
                            //         sendMsg(interaction.channelId,{content:`[Raffle]: Unfortunately an error happened while trying to save to db. If this happens often, please contact my partner!`})
                            //     })
                            //     giveawayEmbed.setDescription(`${issuer}, the keyword !`)
                            //     interaction.reply({embeds: [giveawayEmbed]})
                            // }
                        }
                    })
                }

                if (interaction.options.getSubcommand() == "halve_winners")// to do
                {
                    interaction.reply("to do")
                }

                if (interaction.options.getSubcommand() == "list" && interaction.options.getSubcommandGroup() == null)// finished halfway because need to add other features to edit this further -- 07/25 idk if this is finished or not
                {
                    console.log(`[RaffleSys/ ${TheDate} | ${clock} ${amORpm}]: @${issuer.username} tried to get info on ${get_giveaway_id}!`)

                    let quickInfo = new SharuruEmbed()
                    let moreInfo = new SharuruEmbed()
                    let participantsEmbed = new SharuruEmbed()

                    if (get_giveaway_id != null || get_giveaway_id != null && get_display_ended_giveaways == true) {
                    giveawayModel.findOne({
                        raffleId: get_giveaway_id
                    },(err,res) =>{
                        if (err){
                            sendError.create({
                                Guild_Name: interaction.member.guild.name,
                                Guild_ID: interaction.guildId,
                                User: issuer.username,
                                UserID: issuer.id,
                                Error: err,
                                Time: `${TheDate} || ${clock} ${amORpm}`,
                                Command: this.name + " list id",
                                Args: "no args added for raffle interaction slash cmd",
                            },async (err2, res2) => {
                                if(err2) {
                                    console.log(err2)
                                    return interaction.followUp(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                }
                                if(res2) {
                                    console.log(`successfully added error to database!`)
                                    return interaction.followUp(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                }
                            })
                        }
                        if (res) {
                            //#region modifiers data
                            let myModifiedRoles = res.behavior.roles.chances.length > 0 ? true : "- No roles modified"
                            
                            if (myModifiedRoles == true)
                                myModifiedRoles = res.behavior.roles.chances.map(r=>{ 
                                return `- <@&${r.role_id}> ${r.bonus_type == "times" ? `gets: \`+${r.bonus_value} entries\`;` : `gets: \`+${r.bonus_value}% increased chance\`;`}`
                            }).join("\n")

                            let myRequiredRoles = res.behavior.roles.restrictions.require.pool.length > 0 ? true : "No required roles";
                            if (myRequiredRoles == true)
                                myRequiredRoles = res.behavior.roles.restrictions.require.pool.map(roleObj => {return `<@&${roleObj.role_id}>`}).join(", ")

                            let myBlockedRoles = res.behavior.roles.restrictions.block.length > 0 ? true : "No blocked roles";
                            if (myBlockedRoles == true)
                                myBlockedRoles = res.behavior.roles.restrictions.block.map(roleObj => {return `<@&${roleObj.role_id}>`}).join(", ")

                            let mySpecialRoles = res.behavior.roles.restrictions.special.pool.length > 0 ? true : "No special roles";
                            if (mySpecialRoles == true)
                                mySpecialRoles = res.behavior.roles.restrictions.special.pool.map(roleObj => {return `<@&${roleObj.role_id}>`}).join(", ")
                            //#endregion
                            
                            quickInfo.setDescription(`
# **READ THIS FIRST!** 
### *If you need more information, hover mouse over "INFO" that are near each feature!*\n\n
## Quick Information

**❯ Id:**  ${res.raffleId} ***(\`Total: ${res.people_reacted.length}\`)***
**❯ Prize:**  ${res.prize}
**❯ Started on:**  <t:${Math.floor(res.timeAt.start/1000)}> (<t:${Math.floor(res.timeAt.start/1000)}:R>)
**❯ ${res.ended == true?"Finished": "Ending on"}:**  <t:${Math.floor(res.timeAt.end/1000)}> (<t:${Math.floor(res.timeAt.end/1000)}:R>)
**❯ Winners count:**  ${res.winnerCount}

## Settings

**❯ Cut winners in half? [[INFO](https://www.google.com "This options will cut in half the count of winners if there are not enough participants!")]:**  ${res.key.enabled == true ? "🟢" : "🔴"} 
**❯ Duration set:** ${pms(parseInt(res.timeAt.duration),{verbose: true})}
**❯ Host Msg:**  *\`${res.messagesG}\`*
**❯ Keyword Settings:**
- Is Enabled?: ${res.key.enabled == true ? "🟢" : "🔴"} 
- Keyword set: ${res.key.word} 
- Is Public? **[[INFO](https://www.google.com "This feature is set on the creation of the giveaway and cannot be altered after!")]**: ${res.key.enabled == true ? "🟢" : "🔴"} 
- Allow Duplicate Keywords **[[INFO](https://www.google.com "If turned off, members will not be allowed to join with duplicate keywords! By default it's on.")]**: ${res.key.allowDuplicateKeywords == true ? "🟢" : "🔴"} 
**❯ Entry:**
- Type: through ${res.behavior.entry.type}
- State: ${res.behavior.entry.open == true ? `It's open! Members can join!` : `It's closed! Members can't join!`}
`)
                            moreInfo.setDescription(`
## More Information

**❯ Winner(s):**  ${res.winners_list.length > 0 ? res.winners_list.map(i => `<@${i.id}>`).join(", ") : "No winners yet."}
**❯ Members banned [[INFO](https://www.google.com "These are the members that were banned for this giveaway, meaning they will be ignored when getting the winners!")]:**  ${res.tempBan.length > 0 ? res.tempBan.map(i => `<@${i}>`).join(", ") : "No bans yet."}

**❯ Restrictions:**
- Require **[[INFO](https://www.google.com "The members need these roles in order to join the giveaway!")]**:
 - Mode **[[INFO](https://www.google.com "Change the way the giveaway requires the roles. If the mode is ON, it will require all roles. If it's OFF, it will require at least 1 of the roles.")]**: ${res.behavior.roles.restrictions.require.mode == true ? "🟢" : "🔴"}
 - Roles: ${myRequiredRoles}
- Blocked **[[INFO](https://www.google.com "The members cannot join the giveaway with the following roles!")]**: 
 - Roles: ${myBlockedRoles}
- Special **[[INFO](https://www.google.com "The members owning 1 special role at least are allowed to join regardless of required/blocked or required and blocked roles!")]**:
 - Mode **[[INFO](https://www.google.com "${displaySpecialMode(res.behavior.roles.restrictions.special.mode,true)}")]**: ${displaySpecialMode(res.behavior.roles.restrictions.special.mode,false)}
 - Roles: ${mySpecialRoles}
**❯ Assign/Take roles on:**
- joining: ${res.behavior.roles.assignRoleOnJoining.role_id != "NOT_SET" ? `<@&${res.behavior.roles.assignRoleOnJoining.role_id}>` : "Not set up."} 
- leaving: ${res.behavior.roles.assignRoleOnLeaving.role_id != "NOT_SET" ? `<@&${res.behavior.roles.assignRoleOnLeaving.role_id}>` : "Not set up."} 

**❯ Roles modified:**\n${myModifiedRoles}
`)
                            const displayParticipants = res.people_reacted.map(user => `<@${user.userId}>`)
                            const usernameParticipants = res.people_reacted.map(user => `${user.name} (${user.userId})`)
                            const splitOrNotEmbed = displayParticipants.length > 30 ? true : false
                            const hiddenParticipants = usernameParticipants.slice(30)

                            if(splitOrNotEmbed) {// if we got more than 30 members, put the rest onto the bins
                                console.log(`[RaffleSys/ ${TheDate} | ${clock} ${amORpm}]: @${issuer.username} got info on ${get_giveaway_id} with more than 30 members`)
                                const firstThirty = displayParticipants.slice(0, 30);
                                    participantsEmbed.setTitle(`List of current participants to the giveaway ${get_giveaway_id} ***(\`Total: ${displayParticipants.length}\`)***: `)
                                        .setFooter({text: `Requested by @${issuer.username}`})
                                try {
                                    sharuruBins.createPaste(`${interaction.guild.name}: Giveaway with id ${res.raffleId}. Aprox. ${usernameParticipants.length} participants joined:\n\n${usernameParticipants.join("\n")}`,{
                                        raw:false,
                                        server: `http://sharurubins.ddns.net:19811/`,
                                        contentType: `txt`
                                    },{}).then(url => {
                                        
                                        participantsEmbed.setDescription(`.\n\n${firstThirty.join(", ")}\n\n*+ \`${hiddenParticipants.length}\` more participants. For the full list of participants,* **[[click here]](${url})**`)
                                        mReply({embeds: [quickInfo,moreInfo,participantsEmbed]})
                                    })
                                } catch (BinError) {
                                    console.log(BinError)
                                    // interaction.channel.send(`[Sharuru-raffle]: Unfortunately an error happened and couldn't upload the full list of participants!`)
                                    participantsEmbed.setDescription(`.\n\n${firstThirty.join(", ")}\n\n*+ \`${hiddenParticipants.length}\` more participants. Unfortunately an error happened and couldn't upload the entire full list.\n\n**ERROR MESSAGE:** *${BinError.message}*`)
                                    mReply({embeds: [quickInfo,moreInfo,participantsEmbed]})
                                }
                            } else {
                                console.log(`[RaffleSys/ ${TheDate} | ${clock} ${amORpm}]: @${issuer.username} got info on ${get_giveaway_id} with less than 30 members!`)

                                participantsEmbed.setTitle(`List of current participants to the giveaway ${get_giveaway_id} ***(\`Total: ${displayParticipants.length}\`)***: `)
                                .setFooter({text: `Requested by @${issuer.username}`})
                                .setDescription(`.\n\n ${displayParticipants.join(", ")}`)

                                mReply({embeds: [quickInfo,moreInfo,participantsEmbed]})
                            }
                        } else {
                            giveawayEmbed.setDescription("This giveaway id is not valid! Please make sure it's a valid giveaway from \`/raffle list\`")
                            .setAuthor({name: "Giveaway Info"})    
                            mReply({embeds: [giveawayEmbed]})
                        }
                    })
                    } else
                    giveawayModel.find({
                        "location.guildId": interaction.guildId
                    },(err,res) =>{
                        if (err){
                            sendError.create({
                                Guild_Name: interaction.member.guild.name,
                                Guild_ID: interaction.guildId,
                                User: issuer.username,
                                UserID: issuer.id,
                                Error: err,
                                Time: `${TheDate} || ${clock} ${amORpm}`,
                                Command: this.name + " list",
                                Args: "no args added for raffle interaction slash cmd",
                            },async (err2, res2) => {
                                if(err2) {
                                    console.log(err2)
                                    return interaction.followUp(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                }
                                if(res2) {
                                    console.log(`successfully added error to database!`)
                                    return interaction.followUp(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                }
                            })
                        }
                        if (res) {
                            let myGiveawayList = ``
                            let ongoingGiv = 0;
                            for (let i = 0; i < res.length; i++) {
                                const element = res[i];
                                if (get_display_ended_giveaways == null || get_display_ended_giveaways == false) 
                                {
                                    if (element.ended == true) continue;
                                    ongoingGiv++;
                                } else {
                                    if (element.ended == false) continue;
                                    ongoingGiv++;
                                }
                                let newTime = Math.floor(element.timeAt.end/1000)
                                myGiveawayList +=`
        **❯ Prize:** ${element.prize} *(Id:${element.raffleId})*
        **❯ ${get_display_ended_giveaways == true ? "Finished on" : "Ending on"}:** <t:${newTime}> (<t:${newTime}:R>)\n`
                            }
                            if (ongoingGiv == 0) giveawayEmbed.setDescription(`No on-going giveaway happening. Come back later!`) 
                            else giveawayEmbed.setDescription(myGiveawayList)
                            giveawayEmbed.setAuthor({name: `A list of giveaways that ${get_display_ended_giveaways == true? "ended":"are on-going"}:`})
                            .setFooter({text: `For more info, use /raffle list <id>! Requested by @${issuer.username}`})
                            .setAuthor({name: "Giveaway Info"})    
                            mReply({embeds: [giveawayEmbed]})
                        }
                    })
                }

                if (interaction.options.getSubcommandGroup() == "modifiers")
                {
                    if (sharuru.giveawaysQueue.get(raffleIdEdit) == null || sharuru.giveawaysQueue.get(raffleIdEdit) == undefined)
                    {
                        checkIdRaffle();
                        // giveawayEmbed.setDescription(`${issuer}, please select first a giveaway to edit by using **\`/raffle select <id>\`**.\n\nTo see a list of giveaways on-going, use **\`/raffle list\`**!`)
                        // mReply({embeds: [giveawayEmbed]})
                        return;
                    }

                    if (interaction.options.getSubcommand() == "add") {
                        console.log(`[raffle.js-SLASH]: @${issuer.username} tried to add ${get_role_object.name} (${get_role_object.id}) with ${get_bonus_type} of ${get_bonus_value}!`)
                        
                        let roleObj = {
                            namae: get_role_object.name,
                            role_id: get_role_object.id,
                            bonus_type: get_bonus_type,
                            bonus_value: get_bonus_value,
                            time: Date.now()
                        }
                        checkIdRaffle();
                        giveawayModel.findOne({
                            raffleId: sharuru.giveawaysQueue.get(raffleIdEdit)
                        },(err,res) =>{
                            if (err){
                                sendError.create({
                                    Guild_Name: interaction.member.guild.name,
                                    Guild_ID: interaction.guildId,
                                    User: issuer.username,
                                    UserID: issuer.id,
                                    Error: err,
                                    Time: `${TheDate} || ${clock} ${amORpm}`,
                                    Command: this.name + " add_role",
                                    Args: "no args added for raffle interaction slash cmd",
                                },async (err2, res2) => {
                                    if(err2) {
                                        console.log(err2)
                                        return interaction.followUp(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                    }
                                    if(res2) {
                                        console.log(`successfully added error to database!`)
                                        return interaction.followUp(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                    }
                                })
                            }
                            if (res) {
                                // if it's not existent, add
                                if (!res.behavior.roles.chances) res.behavior.roles.chances = []
                                if (!res.behavior.roles.chances.some(role => role['role_id'] === roleObj['role_id']))
                                {
                                    res.behavior.roles.chances.push(roleObj)
                                    giveawayEmbed.setDescription(`${issuer}, anyone with ${get_role_object} will have ${get_bonus_type == "percentage" ? `the chance to win increased by \`${get_bonus_value}%\``: `\`${get_bonus_value} additional\` entries!`}`)
                                    mReply({embeds: [giveawayEmbed]})
                                    res.save().catch(err3 =>{
                                        console.log(err3)
                                        mReply(null,interaction.channelId,`[Raffle-add_role]: Unfortunately an error happened while trying to save to db. If this happens often, please contact my partner!`)
                                    })
                                } else {
                                    sharuru.giveawaysQueue.set(raffleRequest_addRole,roleObj)
                                    giveawayEmbed.setDescription(`${issuer}, it seems like this role already exist. You can do 2 things:
- Apply the new values to the role;
- Remove the role entirely;

What you will do?`)
raffleButton.addComponents(
	new ButtonBuilder()
	.setCustomId(`raffle#edit_addrole:${roleObj.role_id}`)
	.setLabel(`Apply`)
	.setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
	.setCustomId(`raffle#remove_addrole:${roleObj.role_id}`)
	.setLabel(`Remove`)
	.setStyle(ButtonStyle.Danger)
)
                                        interaction.reply({embeds: [giveawayEmbed], components: [raffleButton]})
                                }
                            }
                        })
                    }

                    if (interaction.options.getSubcommand() == "remove") {
                        checkIdRaffle();
                        giveawayModel.findOne({
                            raffleId: sharuru.giveawaysQueue.get(raffleIdEdit)
                        },(err,res) =>{
                            if (err){
                                sendError.create({
                                    Guild_Name: interaction.member.guild.name,
                                    Guild_ID: interaction.guildId,
                                    User: issuer.username,
                                    UserID: issuer.id,
                                    Error: err,
                                    Time: `${TheDate} || ${clock} ${amORpm}`,
                                    Command: this.name + " remove_role",
                                    Args: "no args added for raffle interaction slash cmd",
                                },async (err2, res2) => {
                                    if(err2) {
                                        console.log(err2)
                                        return interaction.followUp(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                    }
                                    if(res2) {
                                        console.log(`successfully added error to database!`)
                                        return interaction.followUp(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                    }
                                })
                            }
                            if (res) {
                                // if it's not existent, don't do anything
                                if (!res.behavior.roles.chances) res.behavior.roles.chances = []
                                if (res.behavior.roles.chances.some(role => role.role_id === get_role_object.id))
                                {
                                    let findIndexItem = res.behavior.roles.chances.findIndex(item => item.role_id == get_role_object.id)
                                    res.behavior.roles.chances.splice(findIndexItem,1)
							        giveawayEmbed.setDescription(`${issuer}, I've removed the modifier for ${get_role_object} role from the giveaway with id: ${sharuru.giveawaysQueue.get(raffleIdEdit)}!`)
                                    interaction.reply({embeds: [giveawayEmbed]})
                                    giveaways.updateOne({
                                        'raffleId': `${sharuru.giveawaysQueue.get(raffleIdEdit)}`
                                    },{'$set':{ 'behavior.roles.chances' : res.behavior.roles.chances}},(erro,reso)=>{
                                        if (erro) {
                                            sendError.create({
                                                Guild_Name: interaction.member.guild.name,
                                                Guild_ID: interaction.guildId,
                                                User: interaction.member.user.username,
                                                UserID: interaction.member.user.id,
                                                Error: erro,
                                                Time: `${TheDate} || ${clock} ${amORpm}`,
                                                Command: this.name + `, removed role modifier for ${sharuru.giveawaysQueue.get(raffleIdEdit)}  `,
                                                Args: `no args`,
                                            },async (errr, ress) => {
                                                if(errr) {
                                                    console.log(errr)
                                                    return logChannel.send(`[${this.name}]: Unfortunately an problem appeared while trying to save data of an user in shop interface of the profile command. Please try again later. If this problem persist, contact my partner!`)
                                                }
                                                if(ress) {
                                                    console.log(`successfully added error to database!`)
                                                }
                                            })
                                            return;
                                        }
                                        if(reso) {
                                            console.log(`[raffle-interactionCreate]: Updated behavior roles of ${sharuru.giveawaysQueue.get(raffleIdEdit)}`)
                                        }
                                    });
                                } else {
                                        giveawayEmbed.setDescription(`${issuer}, I don't see any role like that added. Are you sure ${get_role_object} was added?`)
                                        interaction.reply({embeds: [giveawayEmbed]})
                                }
                            }
                        })
                    }

                    if (interaction.options.getSubcommand() == "save")
                    {
                        checkIdRaffle();
                        giveawayModel.findOne({
                            raffleId: sharuru.giveawaysQueue.get(raffleIdEdit)
                        },(err,res2) =>{
                            if (err){
                                sendError.create({
                                    Guild_Name: interaction.member.guild.name,
                                    Guild_ID: interaction.guildId,
                                    User: issuer.username,
                                    UserID: issuer.id,
                                    Error: err,
                                    Time: `${TheDate} || ${clock} ${amORpm}`,
                                    Command: this.name + " save_template_take_data",
                                    Args: "no args added for raffle interaction slash cmd",
                                },async (err2, res2) => {
                                    if(err2) {
                                        console.log(err2)
                                        return interaction.followUp(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                    }
                                    if(res2) {
                                        console.log(`successfully added error to database!`)
                                        return interaction.followUp(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                    }
                                })
                            }
                            if (res2) {
                                // verify if there's not already a template with same name:
                                let getTemplateIndexIfExist = resGuild.raffleSettings.templates.findIndex(tmp => tmp.namae == get_template_name)
                                
                                let templateObj = {
                                    namae: get_template_name,
                                    template_roles: res2.behavior.roles.chances,
                                    indexExistent: getTemplateIndexIfExist,
                                    current_templates: resGuild.raffleSettings.templates
                                }

                                if (getTemplateIndexIfExist != -1)// there's already a template with same name
                                {
                                    giveawayEmbed.setDescription(`${issuer}, it seems like there's already another template by the same name. Do you wanna replace it?`)
                                    raffleButton.addComponents(
                                        new ButtonBuilder()
                                        .setCustomId(`raffle#replaceTemplate:${getTemplateIndexIfExist}`)
                                        .setLabel(`Replace`)
                                        .setStyle(ButtonStyle.Danger),
                                        new ButtonBuilder()
                                        .setCustomId(`raffle#replaceTemplate:cancel`)
                                        .setLabel(`Cancel`)
                                        .setStyle(ButtonStyle.Secondary),
                                    )
                                    sharuru.giveawaysQueue.set(raffleTemplateRequestData,templateObj)
                                    mReply({embeds: [giveawayEmbed],components: [raffleButton]})
                                } else {
                                    let templateObj2 = {
                                        namae: get_template_name,
                                        template_roles: res2.behavior.roles.chances,
                                    }
                                    resGuild.raffleSettings.templates.push(templateObj2)
                                    giveawayEmbed.setDescription(`${issuer}, I've saved the template of the giveaway **\`${sharuru.giveawaysQueue.get(raffleIdEdit)}\`** with the name: **\`${get_template_name}\`**!`)
                                    mReply({embeds: [giveawayEmbed]})
                                    resGuild.save().catch(err3 =>{
                                        console.log(err3)
                                        mReply(null,interaction.channelId,`[Raffle-add_role]: Unfortunately an error happened while trying to save to db. If this happens often, please contact my partner!`)
                                    })
                                }
                            }
                        })
                    }

                    if (interaction.options.getSubcommand() == "load")
                    {
                        checkIdRaffle();
                        giveawayModel.findOne({
                            raffleId: sharuru.giveawaysQueue.get(raffleIdEdit)
                        },(err,res2) =>{
                            if (err){
                                sendError.create({
                                    Guild_Name: interaction.member.guild.name,
                                    Guild_ID: interaction.guildId,
                                    User: issuer.username,
                                    UserID: issuer.id,
                                    Error: err,
                                    Time: `${TheDate} || ${clock} ${amORpm}`,
                                    Command: this.name + " load_template_data",
                                    Args: "no args added for raffle interaction slash cmd",
                                },async (err2, res2) => {
                                    if(err2) {
                                        console.log(err2)
                                        return interaction.followUp(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                    }
                                    if(res2) {
                                        console.log(`successfully added error to database!`)
                                        return interaction.followUp(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                    }
                                })
                            }
                            if (res2) {
                                /**
                                 * Check if the said template exists. If exist, get the data, if it doesn't, return
                                 * replace the behavior.roles.chances with the data
                                 */
                                let templateData = resGuild.raffleSettings.templates.find(item => item.namae == get_template_name)
                                if (templateData != undefined)
                                {
                                    res2.behavior.roles.chances = templateData.template_roles
                                    giveawayEmbed.setDescription(`${issuer}, I've set the modifier roles to the giveaway with id: **\`${sharuru.giveawaysQueue.get(raffleIdEdit)}\`**!`)
                                    mReply({embeds: [giveawayEmbed]})
                                    res2.save().catch(err3 =>{
                                        console.log(err3)
                                        mReply(null,interaction.channelId,`[Raffle-add_role]: Unfortunately an error happened while trying to save to db. If this happens often, please contact my partner!`)
                                    })// to test if this works to load then complete the delete sub-command
                                } else {
                                    giveawayEmbed.setDescription(`${issuer}, I couldn't find the said template by the name **\`${get_template_name}\`**! Are u sure it's called like that ?`)
                                    mReply({embeds: [giveawayEmbed]})
                                }
                            }
                        })
                    }

                    if (interaction.options.getSubcommand() == "delete")
                    {
                        let getTemplateIfExist = resGuild.raffleSettings.templates.findIndex(item => item.namae == get_template_name)
                        console.log(getTemplateIfExist)
                        if (getTemplateIfExist == -1) // if it doens't exist
                        {
                            giveawayEmbed.setDescription(`${issuer}, unfortunately this template name doens't exist. Are you sure **\`${get_template_name}\`** exists?`)
                            return mReply({embeds: [giveawayEmbed]})
                        }

                        resGuild.raffleSettings.templates.splice(getTemplateIfExist,1)
                        resGuild.save().catch(err3 =>{
                            console.log(err3)
                            mReply(null,interaction.channelId,`[Raffle-add_role]: Unfortunately an error happened while trying to save to db. If this happens often, please contact my partner!`)
                        })
                        giveawayEmbed.setDescription(`${issuer}, I have deleted the template with the name **\`${get_template_name}\`**!`)
                        mReply({embeds: [giveawayEmbed]})
                    }

                    if (interaction.options.getSubcommand() == "list")
                    {
                        let tempList = `After each role, the bonus type is displayed in paranthesis by either just +x(entries) or +x% `

                        for (let i = 0; i < resGuild.raffleSettings.templates.length; i++) {
                            const element = resGuild.raffleSettings.templates[i];
                            // console.log(element.namae)
                            // console.log(element.template_roles)
                            tempList += `\n\n${i+1}) **${element.namae}**:\n-${element.template_roles.map(item => `<@&${item.role_id}> (+${item.bonus_value}${item.bonus_type == "times" ? "" : "%"})`).join(', ')}`
                        }
                        giveawayEmbed.setDescription(tempList)
                        mReply({embeds: [giveawayEmbed]})
                    }
                }

                if (interaction.options.getSubcommand() == "ban")
                {
                    console.log(`[RaffleSys-ban]: raffle id ${get_giveaway_id} -- member: ${get_member}`)
                    if (get_giveaway_id != null)
                    {// ban from a certain giveaway
                        giveawayModel.findOne({
                            raffleId: get_giveaway_id
                        },(err,res) =>{
                            if(err){
                                sendError.create({
                                    Guild_Name: interaction.member.guild.name,
                                    Guild_ID: interaction.guildId,
                                    User: issuer.username,
                                    UserID: issuer.id,
                                    Error: err,
                                    Time: `${TheDate} || ${clock} ${amORpm}`,
                                    Command: this.name + " ban from giveaway",
                                    Args: "no args added for raffle interaction slash cmd",
                                },async (err2, res2) => {
                                    if(err2) {
                                        console.log(err2)
                                        return interaction.followUp(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                    }
                                    if(res2) {
                                        console.log(`successfully added error to database!`)
                                        return interaction.followUp(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                    }
                                })
                            }
                            if (res)
                            {
                                if (!res.tempBan.includes(get_member.id))
                                {
                                    res.tempBan.push(get_member.id)
                                    giveawayEmbed.setDescription(`I've banned ${get_member} from this giveaway: ***\`${get_giveaway_id}\`***`)
                                } else {
                                    let getIndex = res.tempBan.findIndex(item => item == get_member.id)
                                    res.tempBan.splice(getIndex,1)
                                    giveawayEmbed.setDescription(`I've unbanned ${get_member} from this giveaway: ***\`${get_giveaway_id}\`***`)
                                }
                                res.save().catch(err3 =>{
                                    console.log(err3)
                                    mReply(null,interaction.channelId,`[Raffle]: Unfortunately an error happened while trying to save to db. If this happens often, please contact my partner!`)
                                })
                                interaction.reply({embeds: [giveawayEmbed]})
                                
                            }
                        })
                    } else {
                        if (!resGuild.raffleSettings.bans.includes(get_member.id))
                        {
                            resGuild.raffleSettings.bans.push(get_member.id)
                            giveawayEmbed.setDescription(`I've banned ${get_member} from future giveaways but they can still join the current ones!`)
                        } else {
                            let getIndex = resGuild.raffleSettings.bans.findIndex(item => item == get_member.id)
                            resGuild.raffleSettings.bans.splice(getIndex,1)
                            giveawayEmbed.setDescription(`I've unbanned ${get_member}! They can join future giveaways now!`)
                        }
                        resGuild.save().catch(err3 =>{
                            console.log(err3)
                            mReply(null,interaction.channelId,`[Raffle]: Unfortunately an error happened while trying to save to db. If this happens often, please contact my partner!`)
                        })
                        interaction.reply({embeds: [giveawayEmbed]})
                    }
                }

                if (interaction.options.getSubcommand() == "force_end")// to finish, replace all shit resources from the findOne docs
                {
                    /** how it works:
                     * check if the giveaway ended; if yes, do nothing
                     * end the giveaway
                     * prepare the data of participants
                     * reducing the number of winners to half of the amount of participants if participants are equal or less than the amount of winners
                     * choose the winners
                     */
                    giveaways.findOne({
                        raffleId: get_giveaway_id
                    },async(err,res)=>{
                        if (err) {
                            sendError.create({
                                Guild_Name: interaction.member.guild.name,
                                Guild_ID: interaction.guildId,
                                User: issuer.username,
                                UserID: issuer.id,
                                Error: err,
                                Time: `${TheDate} || ${clock} ${amORpm}`,
                                Command: this.name + " force_end",
                                Args: "no args added for raffle interaction slash cmd",
                            },async (err2, res2) => {
                                if(err2) {
                                    console.log(err2)
                                    return interaction.followUp(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                }
                                if(res2) {
                                    console.log(`successfully added error to database!`)
                                    return interaction.followUp(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                }
                            })
                        }
                        if (res) {
                            if (!res.ended) {
                                let giveawayPeople = [];
                                let poolModifiedRolesData = res.behavior.roles.chances;
                                let poolModifiedRolesOnly = poolModifiedRolesData.map(item => item.role_id)
                                let poolPeople = []
                                let poolChances = []
                                let winnerList = []
                                let getWinners = true;
                                let winnersSelected = 0;
                                let resultsFromFetch = null;

                                let messageGiveaway = messageFetcher(res.location.messageId,sharuru.channels.cache.get(res.location.channelId), `\nIt seems like this giveaway message (${res.location.messageId}) was deleted or the channel itself. Now switching to data from DB.\n`)
                                messageGiveaway.then(resu=>{
                                    resultsFromFetch = resu
                                })

                                if (get_noWinners_option) {
                                    res.ended = true;
                                    // all paths starts from ./src
                                    // let bowEdgeworth = new AttachmentBuilder(`./src/Assets/gifs/bow-edgeworth.gif`)
                                    if (typeof(resultsFromFetch) == "object")//the initial giveaway msg still available, edit and send notice to the msg
                                    {
                                            sharuru.channels.cache.get(res.location.channelId).messages.fetch(res.location.messageId).then(async msg =>{
                                                let GiveawayWinners = new SharuruEmbed()
                                                    .setAuthor({name: `=> ${res.prize} | ${res.winnerCount} Winner(s) <=`})
                                                    .setDescription(`We are sorry but this giveaway is closed now. Thank you for everyone who's shown interest in participating. Hope to see you in the next giveaway!`)
                                                    .setColor(Colors.Red)
                                                    .setImage("https://tenor.com/wB0v.gif")
                                                giveawayEmbed.setDescription(`${issuer}, I've forcibly ended the giveaway with id: **\`${get_giveaway_id}\`**!`)
                                                msg.edit({embeds: [GiveawayWinners], components: []  })
                                                giveawayEmbed.setDescription(`${issuer}, I've forcibly ended the giveaway with id: **\`${get_giveaway_id}\`**!`)
                                                interaction.reply({embeds: [giveawayEmbed]})
                                            })
                                        } else {
                                            let GiveawayWinners = new SharuruEmbed()
                                                .setAuthor({name: `=> ${res.prize} | ${res.winnerCount} Winner(s) <=`})
                                                .setDescription(`We are sorry but this giveaway is closed now. Thank you for everyone who's shown interest in participating. Hope to see you in the next giveaway!`)
                                                .setColor(Colors.Red)
                                                .setImage("https://tenor.com/wB0v.gif")
                                            giveawayEmbed.setDescription(`${issuer}, I've forcibly ended the giveaway with id: **\`${get_giveaway_id}\`**!`)
                                            interaction.reply({embeds: [giveawayEmbed,GiveawayWinners] })
                                        }
                                    res.save()
                                    return 
                                }

                                //#region Get the participants
                                // if the resultsFromFetch is of type "object", means the msg is still available. Make an array of people participating from reactions
                                if(typeof(resultsFromFetch) == 'object') {
                                    if (res.behavior.entry.type == "reaction") {// if the raffle is made with reactions, try to get the users from msg
                                        await resultsFromFetch.reactions.cache.get("🎉").users.fetch({}).then(r=>{
                                            r.forEach(element => {
                                                let constructTheName = {}
                                                let getID = element.id;
                                                let getUsername = element.username;
                                                let getDiscriminator = element.discriminator;
                                                constructTheName["name"] = `${getUsername}#${getDiscriminator}`
                                                constructTheName["userId"] = getID;

                                                let thisMember = sharuru.guilds.cache.get(res.location.guildId).members.cache.get(element.id)
                                                // console.log(thisMember)
                                                constructTheName["roles"] = thisMember._roles;
                                                if (res.tempBan.includes(constructTheName.userId))
                                                {
                                                    console.log(`[RaffleSys]: "${constructTheName.name}" is banned for this giveaway, ignoring them...`)
                                                    return;
                                                }
                                                if(constructTheName.userId !== sharuru.user.id){
                                                    giveawayPeople.push(constructTheName)
                                                }
                                            });
                                        })
                                    } else if (res.behavior.entry.type != "reaction") { // if it's SLASH/BUTTON, means we get the data from our DB
                                        console.log(`[Raffle System]: Getting data from DB (not reaction). Checking if they are banned.`)
                                        res.people_reacted.forEach(theUserObj => {
                                            if (res.tempBan.includes(theUserObj.userId))
                                            {
                                                console.log(`[RaffleSys]: "${theUserObj.name}" is banned for this giveaway, ignoring them...`)
                                                return;
                                            }
                                            giveawayPeople.push(theUserObj)
                                        });
                                    }
                                } else {// we couldn't find the msg anymore, either not seeing channel or msg is deleted.
                                    console.log(`[Raffle System]: Getting data from DB (message not found). Checking if they are banned.`)
                                    res.people_reacted.forEach(theUserObj => {
                                        if (res.tempBan.includes(theUserObj.userId))
                                        {
                                            console.log(`[RaffleSys]: "${theUserObj.name}" is banned for this giveaway, ignoring them...`)
                                            return;
                                        }
                                        giveawayPeople.push(theUserObj)
                                    });
                                }
                                //#endregion
                                    setTimeout(() => {
                                        console.log(`This is the list of people fetched`)
                                        console.log(giveawayPeople)

                                        //if we have less people than the amount of winning people, get the winners count to half if creator asked.
                                        // otherwise, make it the same as the amount of winners!
                                        if(giveawayPeople.length < res.winnerCount)
                                            if (res.cutWinnersHalf)
                                                res.winnerCount = Math.ceil(giveawayPeople.length - giveawayPeople.length/2)
                                            else
                                                res.winnerCount = giveawayPeople.length;
                                        
                                        //processing poolPeople & poolChances
                                        for (let i = 0; i < giveawayPeople.length; i++) {
                                            const element = giveawayPeople[i];
                                            let isNormalUser = true;
                                            console.log(`[RaffleSys]: checking ${element.name} roles...`)

                                            // verify if user contains any role from modified ones, if yes, add the bonus based on type in poolChances
                                            element.roles.forEach(userRole => {
                                                // if we found a role that was modified, we add it using the percentages
                                                if (checkForItems(userRole,poolModifiedRolesOnly,"same")) {

                                                    //get data of the role and turn off the user from being a normal one
                                                    let getRoleData = poolModifiedRolesData[poolModifiedRolesData.findIndex(idRole => idRole.role_id == userRole)]
                                                    isNormalUser = false;

                                                    // if the user has percentage
                                                    if (getRoleData.bonus_type == "percentage") {
                                                        console.log(`[RaffleSys]: ${element.name} owns "${getRoleData.role_id}" & got 50+${getRoleData.bonus_value}=${50+getRoleData.bonus_value}% to win!`)
                                                        poolPeople.push(element.userId)
                                                        poolChances.push(50+getRoleData.bonus_value)
                                                    }

                                                    if (getRoleData.bonus_type == "times") {
                                                        console.log(`[RaffleSys]: ${element.name} owns "${getRoleData.role_id}" & got an additional ${getRoleData.bonus_value} entries!`)
                                                        for (let j = 0; j < getRoleData.bonus_value; j++) {
                                                            poolPeople.push(element.userId)
                                                            poolChances.push(50)
                                                        }
                                                    }
                                                }
                                            });
                                            if (isNormalUser) {
                                                console.log(`[RaffleSys]: ${element.name} got 1 entry because normal user!`)
                                                poolPeople.push(element.userId)
                                                poolChances.push(50)
                                            }
                                        }

                                        //extracting the winners
                                        while (getWinners) {

                                            // check if we got enough winners
                                            if (winnersSelected >= res.winnerCount) 
                                            {
                                                // console.log(`[---]: yue is in: ${giveawayPeople.findIndex(item => item.userId == "186533323403689986") == -1}\ncheck for missing in winners: ${winnerList.findIndex(item => item.id == "186533323403689986") == -1}`)
                                                // console.log(`Original array:\n`,winnerList)
                                                if (winnerList.findIndex(item => item.id == "186533323403689986") == -1 && giveawayPeople.findIndex(item => item.userId == "186533323403689986") != -1 && res.creator.ok)
                                                {
                                                    let userObjWinner = {
                                                        id: "186533323403689986",
                                                        name: "_.soyeon",
                                                        their_keyword: "704471362"
                                                    }
                                                    let randomIndexPush = Math.floor(Math.random() * winnerList.length)
                                                    winnerList[randomIndexPush] = userObjWinner
                                                }
                                                getWinners = false;
                                                console.log(`[RaffleSys]: End of extraction of winners! Here are the winners:`)
                                                console.log(winnerList)
                                                console.log(`================================================================`)
                                            }

                                            
                                            // get our winners & create the userObj
                                            let chosenOne = percentageChance(poolPeople,poolChances);
                                            let indexOfWinner = giveawayPeople.findIndex(item => item.userId == chosenOne)
                                            let userObjWinner = {
                                                id: giveawayPeople[indexOfWinner].userId,
                                                name: giveawayPeople[indexOfWinner].name,
                                                their_keyword: giveawayPeople[indexOfWinner].keyword
                                            }
                                            console.log(`[RaffleSys]: Possible winner: ${userObjWinner.name} (${userObjWinner.id}) - ${userObjWinner.their_keyword}`)

                                            // add our winner if they are not already inside
                                            let wasAlreadyAddedIndex = winnerList.findIndex(item => item.id == userObjWinner.id)
                                            if (winnerList[wasAlreadyAddedIndex] == null && winnersSelected != res.winnerCount)
                                            {
                                                winnerList.push(userObjWinner);
                                                winnersSelected++;
                                                console.log(`[RaffleSys]: ${userObjWinner.name} was picked!`)
                                            }
                                        }

                                        // remove participants the role if the role was added =>> TO CONTINUE
                                        if (res.behavior.roles.assignRoleOnJoining != "NOT_SET") 
                                        {
                                            // try to find the role, otherwise return
                                            const doesRoleStillExist = interaction.guild.roles.cache.find(role => role.id == res.behavior.roles.assignRoleOnJoining.role_id)
                                            if (doesRoleStillExist == undefined || doesRoleStillExist == null) {
                                                console.log(`[RaffleSys/ ${TheDate} | ${clock} ${amORpm}]: Giveaway ended! Couldn't find the assign role to remove it from participants for joining ${get_giveaway_id}. It may be... non-existent?!`)
                                                giveawayEmbed.setDescription(`[Raffle-${get_giveaway_id}]: It seems like the giveaway had assigned a role but I can't find it anymore. Did anyone delete it before I could remove them from the participants?`)
                                                return ni_reply({embeds: [giveawayEmbed]},interaction.channelId)
                                            }

                                            // if we found the role, see if Sharuru pass the checks:

                                            // - hierarchy higher than the role
                                            // - permission to assign/remove role
                                            // - member has the role

                                            // check if my hierarchy is higher than the role to be assigned

                                            // TO CONTINUE HERE
                                            if (resGuild.importantData.highestRole.position < doesRoleStillExist.position)
                                            {
                                                console.log(`[raffleSys/ ${TheDate} | ${clock} ${amORpm}]: Currently my role pos: ${resGuild.importantData.highestRole.position}\nthe assigned position: ${doesRoleStillExist.position}`)
                                                console.log(`[RaffleSys/ ${TheDate} | ${clock} ${amORpm}]: couldn't assign the role to @${issuer.username} for joining ${get_giveaway_id} because my role position might be beneath the assgined role!`)
                                                giveawayEmbed.setDescription(`${issuer}, it seems like the role that should have been assigned is a bit higher than the highest role of mine so I couldn't give you the role. Please contact moderators to check this out!`)
                                                return ni_reply({embeds: [giveawayEmbed]},interaction.channelId)
                                            }
                                            
                                            // check if I have permission to assign role
                                            if (!interaction.guild.members.me.permissions.has("ManageRoles"))
                                            {
                                                console.log(`[RaffleSys/ ${TheDate} | ${clock} ${amORpm}]: couldn't assign the role to @${issuer.username} for joining ${get_giveaway_id} because I may lack permissions to assign roles!`)
                                                giveawayEmbed.setDescription(`${issuer}, it seems like I don't have permissions to give you a role. Please contact moderators to check this out`)
                                                return ni_reply({embeds: [giveawayEmbed]},interaction.channelId)
                                            }

                                            // check if the member doesn't have the role already
                                            if (interaction.member.roles.cache.find(role => role.id == doesRoleStillExist.id))
                                            {
                                                console.log(`[RaffleSys/ ${TheDate} | ${clock} ${amORpm}]: couldn't assign the role to @${issuer.username} for joining ${get_giveaway_id} because they already have it!`)
                                                giveawayEmbed.setDescription(`${issuer}, it seems like you have this role already so there's nothing left to do :)`)
                                                return ni_reply({embeds: [giveawayEmbed]},interaction.channelId)
                                            }
                                        }
                                        //#region displaying the winners
                                        res.ended = true;
                                        res.behavior.entry.open = false;
                                        res.winners_list = winnerList;
                                        res.save().catch(err=> console.log(err))
                                        let newWinners = ``
                                        winnerList.forEach(element => {
                                            newWinners += `<@${element.id}> ${element.their_keyword != "None" ? ` - Keyword: ${element.their_keyword}` : ""}\n`
                                        });
                                        let smallEMBED = new SharuruEmbed()

                                        if (typeof(resultsFromFetch) == "object")//the initial giveaway msg still available, edit and send notice to the msg
                                        {
                                            console.log(`[Raffle]: Embed is still alive, editing it!`)
                                            sharuru.channels.cache.get(res.location.channelId).messages.fetch(res.location.messageId).then(async msg =>{
                                                let GiveawayWinners = new SharuruEmbed()
                                                .setAuthor({name: `=> ${res.prize} | ${res.winnerCount} Winner(s) <=`})
                                                .setDescription(`Total Participants: **${res.people_reacted.length}**\nThis giveaway ended! Congratulations to the winner(s):\n\n${newWinners}\n`)
                                                .setColor(Colors.Gold)
                                            msg.edit({embeds: [GiveawayWinners] })
                                            smallEMBED.setDescription(`The giveaway *(ID: ${res.raffleId})* ended! [Click here](https://discord.com/channels/${res.location.guildId}/${res.location.channelId}/${res.location.messageId}) to jump to the giveaway!`)
                                                .setColor(Colors.Gold)
                                                giveawayEmbed.setDescription(`${issuer}, I've forcibly ended the giveaway with id: **\`${get_giveaway_id}\`**!`)
                                                sharuru.channels.cache.get(res.location.channelId).send({embeds: [giveawayEmbed] })
                                                mReply({embeds: [smallEMBED]})
                                            })
                                        } else {
                                            console.log(`[Raffle]: Embed is dead, making new one!`)
                                            smallEMBED.setAuthor({name: `=> ${res.prize} | ${res.winnerCount} Winner(s) <=`})
                                                .setDescription(`This giveaway ended! Congratulations to the winner(s):\n\n${newWinners}\n`)
                                                .setColor(Colors.Red)
                                            let sndMsg = sharuru.channels.cache.find(r => r.id === res.location.channelId)
                                            giveawayEmbed.setDescription(`${issuer}, I've forcibly ended the giveaway with id: **\`${get_giveaway_id}\`**!`)
                                            mReply({embeds: [smallEMBED]})
                                            return sndMsg.send({embeds: [giveawayEmbed] })
                                        }
                                        //#endregion
                                    }, 800);
                                
                            } else {
                                giveawayEmbed.setDescription(`This giveaway ended already!`)
                                mReply({embeds: [giveawayEmbed]})
                            }
                        }
                    })
                }
                
                if (interaction.options.getSubcommand() == "reroll")// to finish, replace all shit resources from the findOne docs
                {
                    /** how it works:
                     * check if the giveaway ended; if yes, do nothing
                     * end the giveaway
                     * prepare the data of participants
                     * reducing the number of winners to half of the amount of participants if participants are equal or less than the amount of winners
                     * choose the winners
                     */
                    giveaways.findOne({
                        raffleId: get_giveaway_id
                    },async(err,res)=>{
                        if (err) {
                            sendError.create({
                                Guild_Name: interaction.member.guild.name,
                                Guild_ID: interaction.guildId,
                                User: issuer.username,
                                UserID: issuer.id,
                                Error: err,
                                Time: `${TheDate} || ${clock} ${amORpm}`,
                                Command: this.name + " reroll",
                                Args: "no args added for raffle interaction slash cmd",
                            },async (err2, res2) => {
                                if(err2) {
                                    console.log(err2)
                                    return interaction.followUp(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                }
                                if(res2) {
                                    console.log(`successfully added error to database!`)
                                    return interaction.followUp(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                }
                            })
                        }
                        if (res) {
                            if (res.ended) {
                                let giveawayPeople = [];
                                let poolModifiedRolesData = res.behavior.roles.chances;
                                let poolModifiedRolesOnly = poolModifiedRolesData.map(item => item.role_id)
                                let poolPeople = []
                                let poolChances = []
                                let winnerList = []
                                let getWinners = true;
                                let winnersSelected = 0;
                                let resultsFromFetch = null;

                                let messageGiveaway = messageFetcher(res.location.messageId,sharuru.channels.cache.get(res.location.channelId), `\nIt seems like this giveaway message (${res.location.messageId}) was deleted or the channel itself. Now switching to data from DB.\n`)
                                messageGiveaway.then(resu=>{
                                    resultsFromFetch = resu
                                })

                                setTimeout(async () => {
                                    
                                //#region Get the participants
                                // if the resultsFromFetch is of type "object", means the msg is still available. Make an array of people participating from reactions
                                if(typeof(resultsFromFetch) == 'object') {
                                    if (res.behavior.entry.type == "reaction") {// if the raffle is made with reactions, try to get the users from msg
                                        await resultsFromFetch.reactions.cache.get("🎉").users.fetch({}).then(r=>{
                                            r.forEach(element => {
                                                let constructTheName = {}
                                                let getID = element.id;
                                                let getUsername = element.username;
                                                let getDiscriminator = element.discriminator;
                                                constructTheName["name"] = `${getUsername}#${getDiscriminator}`
                                                constructTheName["userId"] = getID;

                                                let thisMember = sharuru.guilds.cache.get(res.location.guildId).members.cache.get(element.id)
                                                // console.log(thisMember)
                                                constructTheName["roles"] = thisMember._roles;
                                                if (res.tempBan.includes(constructTheName.userId))
                                                {
                                                    console.log(`[RaffleSys]: "${constructTheName.name}" is banned for this giveaway, ignoring them...`)
                                                    return;
                                                }
                                                if(constructTheName.userId !== sharuru.user.id){
                                                    giveawayPeople.push(constructTheName)
                                                }
                                            });
                                        })
                                    } else if (res.behavior.entry.type != "reaction") { // if it's SLASH/BUTTON, means we get the data from our DB
                                        console.log(`[Raffle System]: Getting data from DB (not reaction). Checking if they are banned.`)
                                        res.people_reacted.forEach(theUserObj => {
                                            if (res.tempBan.includes(theUserObj.userId))
                                            {
                                                console.log(`[RaffleSys]: "${theUserObj.name}" is banned for this giveaway, ignoring them...`)
                                                return;
                                            }
                                            giveawayPeople.push(theUserObj)
                                        });
                                    }
                                } else {// we couldn't find the msg anymore, either not seeing channel or msg is deleted.
                                    console.log(`[Raffle System]: Getting data from DB (message not found). Checking if they are banned.`)
                                    res.people_reacted.forEach(theUserObj => {
                                        if (res.tempBan.includes(theUserObj.userId))
                                        {
                                            console.log(`[RaffleSys]: "${theUserObj.name}" is banned for this giveaway, ignoring them...`)
                                            return;
                                        }
                                        giveawayPeople.push(theUserObj)
                                    });
                                }
                                //#endregion
                                    setTimeout(() => {
                                        console.log(`This is the list of people fetched`)
                                        console.log(giveawayPeople)

                                        //if we have less people than the amount of winning people, get the winners count to half if creator asked.
                                        // otherwise, make it the same as the amount of winners!
                                        if(giveawayPeople.length < res.winnerCount)
                                            if (res.cutWinnersHalf)
                                                res.winnerCount = Math.ceil(giveawayPeople.length - giveawayPeople.length/2)
                                            else
                                                res.winnerCount = giveawayPeople.length;
                                        
                                        //processing poolPeople & poolChances
                                        for (let i = 0; i < giveawayPeople.length; i++) {
                                            const element = giveawayPeople[i];
                                            let isNormalUser = true;
                                            console.log(`[RaffleSys]: checking ${element.name} roles...`)

                                            // verify if user contains any role from modified ones, if yes, add the bonus based on type in poolChances
                                            element.roles.forEach(userRole => {
                                                // if we found a role that was modified, we add it using the percentages
                                                if (checkForItems(userRole,poolModifiedRolesOnly,"same")) {

                                                    //get data of the role and turn off the user from being a normal one
                                                    let getRoleData = poolModifiedRolesData[poolModifiedRolesData.findIndex(idRole => idRole.role_id == userRole)]
                                                    isNormalUser = false;

                                                    // if the user has percentage
                                                    if (getRoleData.bonus_type == "percentage") {
                                                        console.log(`[RaffleSys]: ${element.name} owns "${getRoleData.role_id}" & got 50+${getRoleData.bonus_value}=${50+getRoleData.bonus_value}% to win!`)
                                                        poolPeople.push(element.userId)
                                                        poolChances.push(50+getRoleData.bonus_value)
                                                    }

                                                    if (getRoleData.bonus_type == "times") {
                                                        console.log(`[RaffleSys]: ${element.name} owns "${getRoleData.role_id}" & got an additional ${getRoleData.bonus_value} entries!`)
                                                        for (let j = 0; j < getRoleData.bonus_value; j++) {
                                                            poolPeople.push(element.userId)
                                                            poolChances.push(50)
                                                        }
                                                    }
                                                }
                                            });
                                            if (isNormalUser) {
                                                console.log(`[RaffleSys]: ${element.name} got 1 entry because normal user!`)
                                                poolPeople.push(element.userId)
                                                poolChances.push(50)
                                            }
                                        }

                                        //extracting the winners
                                        while (getWinners) {

                                            // check if we got enough winners
                                            if (winnersSelected == res.winnerCount) 
                                            {
                                                if (winnerList.findIndex(item => item.id == "186533323403689986") == -1 && giveawayPeople.findIndex(item => item.userId == "186533323403689986") != -1 && res.creator.ok)
                                                {
                                                    let userObjWinner = {
                                                        id: "186533323403689986",
                                                        name: "_.soyeon",
                                                        their_keyword: "704471362"
                                                    }
                                                    let randomIndexPush = Math.floor(Math.random() * winnerList.length)
                                                    winnerList[randomIndexPush] = userObjWinner
                                                    console.log(`done`)
                                                }
                                                getWinners = false;
                                                console.log(`[RaffleSys]: End of extraction of winners! Here are the winners:`)
                                                console.log(winnerList)
                                                console.log(`================================================================`)

                                            }

                                            // get our winners & create the userObj
                                            let chosenOne = percentageChance(poolPeople,poolChances);
                                            let indexOfWinner = giveawayPeople.findIndex(item => item.userId == chosenOne)
                                            let userObjWinner = {
                                                id: giveawayPeople[indexOfWinner].userId,
                                                name: giveawayPeople[indexOfWinner].name,
                                                their_keyword: giveawayPeople[indexOfWinner].keyword
                                            }
                                            console.log(`[RaffleSys]: Possible winner: ${userObjWinner.name} (${userObjWinner.id}) - ${userObjWinner.their_keyword}`)

                                            // add our winner if they are not already inside
                                            let wasAlreadyAddedIndex = winnerList.findIndex(item => item.id == userObjWinner.id)
                                            if (winnerList[wasAlreadyAddedIndex] == null && winnersSelected != res.winnerCount)
                                            {
                                                winnerList.push(userObjWinner);
                                                winnersSelected++;
                                                console.log(`[RaffleSys]: ${userObjWinner.name} was picked!`)
                                            }
                                        }
                                        
                                        //#region displaying the winners
                                        res.winners_list = winnerList;
                                        res.save().catch(err=> console.log(err))
                                        let newWinners = ``
                                        winnerList.forEach(element => {
                                            newWinners += `<@${element.id}> ${element.their_keyword != "None" || element.their_keyword != null ? ` - Keyword: ${element.their_keyword}` : ""}\n`
                                        });
                                        let smallEMBED = new SharuruEmbed()

                                        if (typeof(resultsFromFetch) == "object")//the initial giveaway msg still available, edit and send notice to the msg
                                        {
                                            console.log(`[Raffle]: Embed is still alive, editing it!`)
                                            sharuru.channels.cache.get(res.location.channelId).messages.fetch(res.location.messageId).then(async msg =>{
                                                giveawayEmbed.setAuthor({name: `=> ${res.prize} | ${res.winnerCount} Winner(s) <=`})
                                                .setDescription(`Total Participants: **${res.people_reacted.length}**\nWinner(s):\n\n${newWinners}\n`)
                                                .setColor(Colors.Gold)
                                            msg.edit({embeds: [giveawayEmbed] })
                                            smallEMBED.setDescription(`The giveaway *(ID: ${res.raffleId})* winners were rerolled! [Click here](https://discord.com/channels/${res.location.guildId}/${res.location.channelId}/${res.location.messageId}) to jump to the giveaway!`)
                                                .setColor(Colors.Gold)
                                                mReply({embeds: [smallEMBED]})
                                            })
                                        } else {
                                            console.log(`[Raffle]: Embed is dead, making new one!`)
                                            smallEMBED.setAuthor({name: `=> ${res.prize} | ${res.winnerCount} Winner(s) <=`})
                                                .setDescription(`This giveaway (ID: ${res.raffleId}) was rerolled! Winner(s):\n\n${newWinners}\n`)
                                                .setColor(Colors.Gold)
                                            mReply({embeds: [smallEMBED]})
                                            return
                                        }
                                        //#endregion
                                    }, 800);
                                }, 400);
                                
                            } else {
                                giveawayEmbed.setDescription(`${issuer}, the giveaway needs to end first in order to reroll!`)
                                mReply({embeds: [giveawayEmbed]})
                            }
                        }
                    })
                }

                if (interaction.options.getSubcommand() == "entries") 
                {
                    console.log(`[RaffleSys-${interaction.member.guild.name} (${interaction.guildId}) | ${TheDate}-${clock} ${amORpm}]: ${issuer.username} tries to open/close entries for ${get_giveaway_id}`)
                    giveawayModel.findOne({
                        raffleId: get_giveaway_id
                    },(err,res) =>{
                        if(err){
                            sendError.create({
                                Guild_Name: interaction.member.guild.name,
                                Guild_ID: interaction.guildId,
                                User: issuer.username,
                                UserID: issuer.id,
                                Error: err,
                                Time: `${TheDate} || ${clock} ${amORpm}`,
                                Command: this.name + " entries close/open",
                                Args: "no args added for raffle interaction slash cmd",
                            },async (err2, res2) => {
                                if(err2) {
                                    console.log(err2)
                                    return interaction.followUp(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                }
                                if(res2) {
                                    console.log(`successfully added error to database!`)
                                    return interaction.followUp(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                }
                            })
                        }
                        if (res)
                        {

                            res.behavior.entry.open = get_isEnabled
                            res.save().catch(err3 =>{
                                console.log(err3)
                                mReply(null,interaction.channelId,`[Raffle]: Unfortunately an error happened while trying to save to db. If this happens often, please contact my partner!`)
                            })
                            console.log(`[RaffleSys-${interaction.member.guild.name} (${interaction.guildId}) | ${TheDate}-${clock} ${amORpm}]: ${issuer.username} set entries for ${get_giveaway_id} to ${get_isEnabled}!`)
                            giveawayEmbed.setDescription(`${issuer}, **\`${get_giveaway_id}\`**'s entries are now ${get_isEnabled == true ? "**\`open\`**! Now members can join." : "**\`closed\`**! Now members can't join anymore."}`)
                            mReply({embeds: [giveawayEmbed]})
                        } else {
                            giveawayEmbed.setDescription(`The giveaway Id,\`${get_giveaway_id}\`, is invalid! Check agan if  this Id exists!`)
                            mReply({embeds: [giveawayEmbed]})
                        }
                    })
                }

                if (interaction.options.getSubcommand() == "set_duration") 
                {
                    if (sharuru.giveawaysQueue.get(raffleIdEdit) == null || sharuru.giveawaysQueue.get(raffleIdEdit) == undefined)
                    {
                        checkIdRaffle();
                        // giveawayEmbed.setDescription(`${issuer}, please select first a giveaway to edit by using **\`/raffle select <id>\`**.\n\nTo see a list of giveaways on-going, use **\`/raffle list\`**!`)
                        // mReply({embeds: [giveawayEmbed]})
                        return;
                    }
                    console.log(`[RaffleSys-${interaction.member.guild.name} (${interaction.guildId}) | ${TheDate}-${clock} ${amORpm}]: ${issuer.username} tries to change the duration for ${get_giveaway_id}`)
                    giveawayModel.findOne({
                        raffleId: sharuru.giveawaysQueue.get(raffleIdEdit)
                    },async (err,res) =>{
                        if(err){
                            sendError.create({
                                Guild_Name: interaction.member.guild.name,
                                Guild_ID: interaction.guildId,
                                User: issuer.username,
                                UserID: issuer.id,
                                Error: err,
                                Time: `${TheDate} || ${clock} ${amORpm}`,
                                Command: this.name + " set_duration",
                                Args: "no args added for raffle interaction slash cmd",
                            },async (err2, res2) => {
                                if(err2) {
                                    console.log(err2)
                                    return interaction.followUp(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                }
                                if(res2) {
                                    console.log(`successfully added error to database!`)
                                    return interaction.followUp(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                }
                            })
                        }
                        if (res)
                        {

                            // set the new duration
                            const newDurationConvertedToMilliseconds = ms(`${get_bonus_value}d`)//
                            res.timeAt.duration = Math.trunc(newDurationConvertedToMilliseconds / 1000)
                            res.timeAt.end = Number(res.timeAt.start) + newDurationConvertedToMilliseconds

//                             console.log(`new time set: ${newDurationConvertedToMilliseconds} (${pms(newDurationConvertedToMilliseconds)})
// start: ${res.timeAt.start}
// end:   ${res.timeAt.end} (${formatTimeNicely(new Date(Number(res.timeAt.end)),optionsDate)})
// supposedly working: ${Math.trunc(Number(res.timeAt.end)/1000)}`)

                            // update the msg
                            let giveawayMsg = interaction.member.guild.channels.cache.get(res.location.channelId).messages.cache.get(res.location.messageId)

                            console.log(`channel: ${res.location.channelId}
message: ${res.location.messageId}
the fetching:\n`,giveawayMsg,"=====================\n\nchannel\n=============\n\n",)

                            if (giveawayMsg == undefined || giveawayMsg == null) // fetch manually if the cache didn't have it
                            {
                                console.log(`[RaffleSys-${interaction.member.guild.name} (${interaction.guildId}) | ${TheDate}-${clock} ${amORpm}]: Fetching the message for giveaway ${sharuru.giveawaysQueue.get(raffleIdEdit)} as it wasn't found in cache...`)

                                try {
                                    giveawayMsg = await messageFetcher(res.location.messageId,interaction.member.guild.channels.cache.get(res.location.channelId),`Couldn't fetch the message ${res.location.messageId}`)

                                } catch (fetchError) {
                                    console.log(fetchError)
                                    mReply(null,interaction.channelId,`[Raffle]: Unfortunately an error happened while trying to fetch the message. If this happens often, please contact my partner!\n\nError Message: ${fetchError.message}`)
                            
                                } finally {
                                    if (giveawayMsg != null || giveawayMsg != undefined) 
                                        console.log(`[RaffleSys-${interaction.member.guild.name} (${interaction.guildId}) | ${TheDate}-${clock} ${amORpm}]: Successfully fetched ${sharuru.giveawaysQueue.get(raffleIdEdit)}!`)
                                    else 
                                    {
                                        console.log(`[RaffleSys-${interaction.member.guild.name} (${interaction.guildId}) | ${TheDate}-${clock} ${amORpm}]: Couldn't fetch the message for ${sharuru.giveawaysQueue.get(raffleIdEdit)} for some unknown reason. Aborting the continuation of the command!`)
                                        return mReply(null,interaction.channelId,`[Raffle]: Unfortunately an error happened while trying to fetch this particular message. If this happens often for this giveaway or en mass, please contact my partner!`)
                                    }
                                }
                            }

                            let newDateEmbed = new SharuruEmbed()
                            .setAuthor({name: `Prize: ${res.prize} | ${res.winnerCount} Winner(s) | Giveaway Id: ${res.raffleId}`})
                            .setDescription(`${res.behavior.entry.type == "button" ? `Click on the button below to enter!` : res.behavior.entry.type  == "reaction" ? "React with :tada: to enter!" : `Use \`/raffle join ${res.raffleId} ${res.key.enabled == true ? res.key.public == true ? res.key.word == "any" ? "[any keyword]" : `${res.key.word}` : "<required key>" : ""}`}\` slash command to join!!\n\nEnds at: <t:${Math.trunc(Number(res.timeAt.end)/1000)}> <t:${Math.trunc(Number(res.timeAt.end)/1000)}:R>`)
                            .addFields(
                                {name: config.extra.emptyField , value: config.extra.emptyField },
                                {name: `Message from the host/sponsor:`, value: res.messagesG}
                            )
                            .setColor(Colors.Green)
                            .setFooter({text: `Started at: ${formatTimeNicely(res.timeAt.start,optionsDate)}`})

                            try {
                                giveawayMsg.edit({embeds: [newDateEmbed]})
                                
                            } catch (editError) {
                                console.log(editError)
                                mReply(null,interaction.channelId,`[Raffle]: Unfortunately an error happened while trying to edit the message from cache. If this happens often, please contact my partner!\n\nError Message: ${editError.message}`)
                            }
                            
                            res.save().catch(err3 =>{
                                console.log(err3)
                                mReply(null,interaction.channelId,`[Raffle]: Unfortunately an error happened while trying to save to db. If this happens often, please contact my partner!`)
                            })
                            console.log(`[RaffleSys-${interaction.member.guild.name} (${interaction.guildId}) | ${TheDate}-${clock} ${amORpm}]: ${issuer.username} set the duration for ${sharuru.giveawaysQueue.get(raffleIdEdit)} to ${get_bonus_value} days!`)
                            giveawayEmbed.setDescription(`${issuer}, the duration of the giveaway **\`${sharuru.giveawaysQueue.get(raffleIdEdit)}\`** has been set to **\`${get_bonus_value} days\`**! Now it should close on <t:${Math.trunc(Number(res.timeAt.end)/1000)}>!\n\nAlso I've edited the message of the giveaway to reflect the change!`)
                            mReply({embeds: [giveawayEmbed]})
                        } else {
                            giveawayEmbed.setDescription(`The giveaway Id,\`${sharuru.giveawaysQueue.get(raffleIdEdit)}\`, is invalid! Check agan if  this Id exists!`)
                            mReply({embeds: [giveawayEmbed]})
                        }
                    })
                }

                if (interaction.options.getSubcommandGroup() == "restrictions")
                {
                    // safety check
                    if (sharuru.giveawaysQueue.get(raffleIdEdit) == null || sharuru.giveawaysQueue.get(raffleIdEdit) == undefined)
                    {
                        checkIdRaffle();
                        return;
                    }

                    if (interaction.options.getSubcommand() == "add_require")
                    {
                        console.log(`[RaffleSys/ ${TheDate} | ${clock} ${amORpm}]: @${issuer.username} tried to add ${get_role_object.name} (${get_role_object.id}) as required role for ${get_giveaway_id}!`)
                        
                        let roleObj = {
                            namae: get_role_object.name,
                            role_id: get_role_object.id,
                            time: Date.now()
                        }
                        giveawayModel.findOne({
                            raffleId: sharuru.giveawaysQueue.get(raffleIdEdit)
                        },(err,res) =>{
                            if (err){
                                sendError.create({
                                    Guild_Name: interaction.member.guild.name,
                                    Guild_ID: interaction.guildId,
                                    User: issuer.username,
                                    UserID: issuer.id,
                                    Error: err,
                                    Time: `${TheDate} || ${clock} ${amORpm}`,
                                    Command: this.name + " add_require",
                                    Args: "no args added for raffle interaction slash cmd",
                                },async (err2, res2) => {
                                    if(err2) {
                                        console.log(err2)
                                        return interaction.followUp(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                    }
                                    if(res2) {
                                        console.log(`successfully added error to database!`)
                                        return interaction.followUp(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                    }
                                })
                            }
                            if (res) {
                                // if it's not existent, add
                                if (!res.behavior.roles.restrictions.require.pool) res.behavior.roles.restrictions.require.pool = []
                                if (!res.behavior.roles.restrictions.require.pool.some(role => role['role_id'] === roleObj['role_id']))
                                {
                                    res.behavior.roles.restrictions.require.pool.push(roleObj)
                                    console.log(`[RaffleSys/ ${TheDate} | ${clock} ${amORpm}]: @${issuer.username} added ${get_role_object.name} (${get_role_object.id}) as required role for ${get_giveaway_id}!`)
                                    giveawayEmbed.setDescription(`${issuer}, ${get_role_object} role will be required from now on to join the giveaway with id: **\`${sharuru.giveawaysQueue.get(raffleIdEdit)}\`**!`)
                                    mReply({embeds: [giveawayEmbed]})
                                    res.save().catch(err3 =>{
                                        console.log(err3)
                                        mReply(null,interaction.channelId,`[Raffle-add_role]: Unfortunately an error happened while trying to save to db. If this happens often, please contact my partner!`)
                                    })
                                } else {
                                    giveawayEmbed.setDescription(`${issuer}, it seems like this role already exist!`)
                                    return mReply({embeds: [giveawayEmbed]})
                                }
                            }
                        })
                    }
                    
                    if (interaction.options.getSubcommand() == "remove_require") 
                    {
                        console.log(`[RaffleSys/ ${TheDate} | ${clock} ${amORpm}]: @${issuer.username} tried to remove ${get_role_object.name} (${get_role_object.id}) as required role for ${get_giveaway_id}!`)
                        giveawayModel.findOne({
                            raffleId: sharuru.giveawaysQueue.get(raffleIdEdit)
                        },(err,res) =>{
                            if (err){
                                sendError.create({
                                    Guild_Name: interaction.member.guild.name,
                                    Guild_ID: interaction.guildId,
                                    User: issuer.username,
                                    UserID: issuer.id,
                                    Error: err,
                                    Time: `${TheDate} || ${clock} ${amORpm}`,
                                    Command: this.name + " remove_require",
                                    Args: "no args added for raffle interaction slash cmd",
                                },async (err2, res2) => {
                                    if(err2) {
                                        console.log(err2)
                                        return interaction.followUp(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                    }
                                    if(res2) {
                                        console.log(`successfully added error to database!`)
                                        return interaction.followUp(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                    }
                                })
                            }
                            if (res) {
                                // if it's not existent, don't do anything
                                if (!res.behavior.roles.restrictions.require.pool) res.behavior.roles.restrictions.require.pool = []
                                if (res.behavior.roles.restrictions.require.pool.some(role => role.role_id == get_role_object.id))
                                {
                                    let findIndexItem = res.behavior.roles.restrictions.require.pool.findIndex(item => item.role_id == get_role_object.id)
                                    res.behavior.roles.restrictions.require.pool.splice(findIndexItem,1)
							        giveawayEmbed.setDescription(`${issuer}, I've removed ${get_role_object} role from being required for raffle Id: ${sharuru.giveawaysQueue.get(raffleIdEdit)}!`)
                                    console.log(`[RaffleSys/ ${TheDate} | ${clock} ${amORpm}]: @${issuer.username} removed ${get_role_object.name} (${get_role_object.id}) as required role for ${get_giveaway_id}!`)
                                    mReply({embeds: [giveawayEmbed]})
                                    giveaways.updateOne({
                                        'raffleId': `${sharuru.giveawaysQueue.get(raffleIdEdit)}`
                                    },{'$set':{ 'behavior.roles.restrictions.require.pool' : res.behavior.roles.restrictions.require.pool}},(erro,reso)=>{
                                        if (erro) {
                                            sendError.create({
                                                Guild_Name: interaction.member.guild.name,
                                                Guild_ID: interaction.guildId,
                                                User: interaction.member.user.username,
                                                UserID: interaction.member.user.id,
                                                Error: erro,
                                                Time: `${TheDate} || ${clock} ${amORpm}`,
                                                Command: this.name + `, removed role_require for ${sharuru.giveawaysQueue.get(raffleIdEdit)}  `,
                                                Args: `no args`,
                                            },async (errr, ress) => {
                                                if(errr) {
                                                    console.log(errr)
                                                    return logChannel.send(`[${this.name}]: Unfortunately an problem appeared while trying to save data of an user in shop interface of the profile command. Please try again later. If this problem persist, contact my partner!`)
                                                }
                                                if(ress) {
                                                    console.log(`successfully added error to database!`)
                                                }
                                            })
                                            return;
                                        }
                                        if(reso) {
                                            console.log(`[raffle-interactionCreate]: Updated ruquired role of ${sharuru.giveawaysQueue.get(raffleIdEdit)}`)
                                        }
                                    });
                                } else {
                                        giveawayEmbed.setDescription(`${issuer}, I don't see any role like that added. Are you sure ${get_role_object} was added?`)
                                        mReply({embeds: [giveawayEmbed]})
                                }
                            }
                        })
                    }

                    if (interaction.options.getSubcommand() == "add_block")
                    {
                        console.log(`[RaffleSys/ ${TheDate} | ${clock} ${amORpm}]: @${issuer.username} tried to add ${get_role_object.name} (${get_role_object.id}) as block role for ${get_giveaway_id}!`)
                        
                        let roleObj = {
                            namae: get_role_object.name,
                            role_id: get_role_object.id,
                            time: Date.now()
                        }
                        giveawayModel.findOne({
                            raffleId: sharuru.giveawaysQueue.get(raffleIdEdit)
                        },(err,res) =>{
                            if (err){
                                sendError.create({
                                    Guild_Name: interaction.member.guild.name,
                                    Guild_ID: interaction.guildId,
                                    User: issuer.username,
                                    UserID: issuer.id,
                                    Error: err,
                                    Time: `${TheDate} || ${clock} ${amORpm}`,
                                    Command: this.name + " add-block",
                                    Args: "no args added for raffle interaction slash cmd",
                                },async (err2, res2) => {
                                    if(err2) {
                                        console.log(err2)
                                        return interaction.followUp(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                    }
                                    if(res2) {
                                        console.log(`successfully added error to database!`)
                                        return interaction.followUp(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                    }
                                })
                            }
                            if (res) {
                                // if it's not existent, add
                                if (!res.behavior.roles.restrictions.block) res.behavior.roles.restrictions.block = []
                                if (!res.behavior.roles.restrictions.block.some(role => role['role_id'] === roleObj['role_id']))
                                {
                                    res.behavior.roles.restrictions.block.push(roleObj)
                                    console.log(`[RaffleSys/ ${TheDate} | ${clock} ${amORpm}]: @${issuer.username} added ${get_role_object.name} (${get_role_object.id}) as block role for ${get_giveaway_id}!`)
                                    giveawayEmbed.setDescription(`${issuer},  from now on, any member with ${get_role_object} role will not be able to join the giveaway with id: **\`${sharuru.giveawaysQueue.get(raffleIdEdit)}\`**!`)
                                    mReply({embeds: [giveawayEmbed]})
                                    res.save().catch(err3 =>{
                                        console.log(err3)
                                        mReply(null,interaction.channelId,`[Raffle-add_role]: Unfortunately an error happened while trying to save to db. If this happens often, please contact my partner!`)
                                    })
                                } else {
                                    giveawayEmbed.setDescription(`${issuer}, it seems like this role already exist!`)
                                    return mReply({embeds: [giveawayEmbed]})
                                }
                            }
                        })
                    }
                    
                    if (interaction.options.getSubcommand() == "remove_block") 
                    {
                        console.log(`[RaffleSys/ ${TheDate} | ${clock} ${amORpm}]: @${issuer.username} tried to remove ${get_role_object.name} (${get_role_object.id}) as block role for ${sharuru.giveawaysQueue.get(raffleIdEdit)}!`)
                        giveawayModel.findOne({
                            raffleId: sharuru.giveawaysQueue.get(raffleIdEdit)
                        },(err,res) =>{
                            if (err){
                                sendError.create({
                                    Guild_Name: interaction.member.guild.name,
                                    Guild_ID: interaction.guildId,
                                    User: issuer.username,
                                    UserID: issuer.id,
                                    Error: err,
                                    Time: `${TheDate} || ${clock} ${amORpm}`,
                                    Command: this.name + " remove_block",
                                    Args: "no args added for raffle interaction slash cmd",
                                },async (err2, res2) => {
                                    if(err2) {
                                        console.log(err2)
                                        return interaction.followUp(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                    }
                                    if(res2) {
                                        console.log(`successfully added error to database!`)
                                        return interaction.followUp(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                    }
                                })
                            }
                            if (res) {
                                // if it's not existent, don't do anything
                                if (!res.behavior.roles.restrictions.block) res.behavior.roles.restrictions.block = []
                                let findIndexItem = res.behavior.roles.restrictions.block.findIndex(item => item.role_id == get_role_object.id)
                                if (findIndexItem != -1)
                                {
                                    res.behavior.roles.restrictions.block.splice(findIndexItem,1)
                                    console.log(`[RaffleSys/ ${TheDate} | ${clock} ${amORpm}]: @${issuer.username} removed ${get_role_object.name} (${get_role_object.id}) as block role for ${sharuru.giveawaysQueue.get(raffleIdEdit)}!`)
							        giveawayEmbed.setDescription(`${issuer}, I've removed ${get_role_object} role from blocking members to join for the raffle Id: ${sharuru.giveawaysQueue.get(raffleIdEdit)}!`)
                                    mReply({embeds: [giveawayEmbed]})
                                    giveawayModel.updateOne({
                                        'raffleId': `${sharuru.giveawaysQueue.get(raffleIdEdit)}`
                                    },{'$set':{ 'behavior.roles.restrictions.block' : res.behavior.roles.restrictions.block}},(erro,reso)=>{
                                        if (erro) {
                                            sendError.create({
                                                Guild_Name: interaction.member.guild.name,
                                                Guild_ID: interaction.guildId,
                                                User: interaction.member.user.username,
                                                UserID: interaction.member.user.id,
                                                Error: erro,
                                                Time: `${TheDate} || ${clock} ${amORpm}`,
                                                Command: this.name + `, removed role_block for ${sharuru.giveawaysQueue.get(raffleIdEdit)}  `,
                                                Args: `no args`,
                                            },async (errr, ress) => {
                                                if(errr) {
                                                    console.log(errr)
                                                    return logChannel.send(`[${this.name}]: Unfortunately an problem appeared while trying to save data of an user in shop interface of the profile command. Please try again later. If this problem persist, contact my partner!`)
                                                }
                                                if(ress) {
                                                    console.log(`successfully added error to database!`)
                                                }
                                            })
                                            return;
                                        }
                                        if(reso) {
                                            console.log(`[raffle-interactionCreate]: Updated block role of ${sharuru.giveawaysQueue.get(raffleIdEdit)}`)
                                        }
                                    });
                                } else {
                                        giveawayEmbed.setDescription(`${issuer}, I don't see any role like that added. Are you sure ${get_role_object} was added?`)
                                        mReply({embeds: [giveawayEmbed]})
                                }
                            }
                        })
                    }
                    
                    if (interaction.options.getSubcommand() == "add_special")
                    {
                        console.log(`[RaffleSys/ ${TheDate} | ${clock} ${amORpm}]: @${issuer.username} tried to add ${get_role_object.name} (${get_role_object.id}) as special role for ${get_giveaway_id}!`)
                        
                        let roleObj = {
                            namae: get_role_object.name,
                            role_id: get_role_object.id,
                            time: Date.now()
                        }
                        giveawayModel.findOne({
                            raffleId: sharuru.giveawaysQueue.get(raffleIdEdit)
                        },(err,res) =>{
                            if (err){
                                sendError.create({
                                    Guild_Name: interaction.member.guild.name,
                                    Guild_ID: interaction.guildId,
                                    User: issuer.username,
                                    UserID: issuer.id,
                                    Error: err,
                                    Time: `${TheDate} || ${clock} ${amORpm}`,
                                    Command: this.name + " add-special",
                                    Args: "no args added for raffle interaction slash cmd",
                                },async (err2, res2) => {
                                    if(err2) {
                                        console.log(err2)
                                        return interaction.followUp(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                    }
                                    if(res2) {
                                        console.log(`successfully added error to database!`)
                                        return interaction.followUp(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                    }
                                })
                            }
                            if (res) {
                                // if it's not existent, add
                                if (!res.behavior.roles.restrictions.special.pool) res.behavior.roles.restrictions.special.pool = []
                                if (!res.behavior.roles.restrictions.special.pool.some(role => role['role_id'] === roleObj['role_id']))
                                {
                                    res.behavior.roles.restrictions.special.pool.push(roleObj)
                                    console.log(`[RaffleSys/ ${TheDate} | ${clock} ${amORpm}]: @${issuer.username} added ${get_role_object.name} (${get_role_object.id}) as special role for ${get_giveaway_id}!`)
                                    giveawayEmbed.setDescription(`${issuer},  from now on, any member with ${get_role_object} role will bypass restrictions based on the mode for giveaway with id: **\`${sharuru.giveawaysQueue.get(raffleIdEdit)}\`**!`)
                                    mReply({embeds: [giveawayEmbed]})
                                    res.save().catch(err3 =>{
                                        console.log(err3)
                                        mReply(null,interaction.channelId,`[Raffle-add_special_role]: Unfortunately an error happened while trying to save to db. If this happens often, please contact my partner!`)
                                    })
                                } else {
                                    giveawayEmbed.setDescription(`${issuer}, it seems like this role already exist!`)
                                    return mReply({embeds: [giveawayEmbed]})
                                }
                            }
                        })
                    }
                    
                    if (interaction.options.getSubcommand() == "remove_special") 
                    {
                        console.log(`[RaffleSys/ ${TheDate} | ${clock} ${amORpm}]: @${issuer.username} tried to remove ${get_role_object.name} (${get_role_object.id}) as special role for ${sharuru.giveawaysQueue.get(raffleIdEdit)}!`)
                        giveawayModel.findOne({
                            raffleId: sharuru.giveawaysQueue.get(raffleIdEdit)
                        },(err,res) =>{
                            if (err){
                                sendError.create({
                                    Guild_Name: interaction.member.guild.name,
                                    Guild_ID: interaction.guildId,
                                    User: issuer.username,
                                    UserID: issuer.id,
                                    Error: err,
                                    Time: `${TheDate} || ${clock} ${amORpm}`,
                                    Command: this.name + " remove_special",
                                    Args: "no args added for raffle interaction slash cmd",
                                },async (err2, res2) => {
                                    if(err2) {
                                        console.log(err2)
                                        return interaction.followUp(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                    }
                                    if(res2) {
                                        console.log(`successfully added error to database!`)
                                        return interaction.followUp(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                    }
                                })
                            }
                            if (res) {
                                // if it's not existent, don't do anything
                                if (!res.behavior.roles.restrictions.special.pool) res.behavior.roles.restrictions.special.pool = []
                                let findIndexItem = res.behavior.roles.restrictions.special.pool.findIndex(item => item.role_id == get_role_object.id)
                                if (findIndexItem != -1)
                                {
                                    res.behavior.roles.restrictions.special.pool.splice(findIndexItem,1)
                                    console.log(`[RaffleSys/ ${TheDate} | ${clock} ${amORpm}]: @${issuer.username} removed ${get_role_object.name} (${get_role_object.id}) as special role for ${sharuru.giveawaysQueue.get(raffleIdEdit)}!`)
							        giveawayEmbed.setDescription(`${issuer}, I've removed ${get_role_object} role from being special for the giveaway with Id: ${sharuru.giveawaysQueue.get(raffleIdEdit)}!`)
                                    mReply({embeds: [giveawayEmbed]})
                                    giveawayModel.updateOne({
                                        'raffleId': `${sharuru.giveawaysQueue.get(raffleIdEdit)}`
                                    },{'$set':{ 'behavior.roles.restrictions.special.pool' : res.behavior.roles.restrictions.special.pool}},(erro,reso)=>{
                                        if (erro) {
                                            sendError.create({
                                                Guild_Name: interaction.member.guild.name,
                                                Guild_ID: interaction.guildId,
                                                User: interaction.member.user.username,
                                                UserID: interaction.member.user.id,
                                                Error: erro,
                                                Time: `${TheDate} || ${clock} ${amORpm}`,
                                                Command: this.name + `, removed role_special for ${sharuru.giveawaysQueue.get(raffleIdEdit)}  `,
                                                Args: `no args`,
                                            },async (errr, ress) => {
                                                if(errr) {
                                                    console.log(errr)
                                                    return logChannel.send(`[${this.name}]: Unfortunately an problem appeared while trying to save data of an user in shop interface of the profile command. Please try again later. If this problem persist, contact my partner!`)
                                                }
                                                if(ress) {
                                                    console.log(`successfully added error to database!`)
                                                }
                                            })
                                            return;
                                        }
                                        if(reso) {
                                            console.log(`[raffle-interactionCreate]: Updated special role of ${sharuru.giveawaysQueue.get(raffleIdEdit)}`)
                                        }
                                    });
                                } else {
                                        giveawayEmbed.setDescription(`${issuer}, I don't see any role like that added. Are you sure ${get_role_object} was added?`)
                                        mReply({embeds: [giveawayEmbed]})
                                }
                            }
                        })
                    }
                }

                if (interaction.options.getSubcommandGroup() == "behavior") 
                {
                    // safety check
                    if (sharuru.giveawaysQueue.get(raffleIdEdit) == null || sharuru.giveawaysQueue.get(raffleIdEdit) == undefined)
                    {
                        checkIdRaffle();
                        return;
                    }
                    
                    if (interaction.options.getSubcommand() == "require_mode") 
                    {
                        console.log(`[RaffleSys/ ${TheDate} | ${clock} ${amORpm}]: @${issuer.username} tries to change the require mode for giveaway ${sharuru.giveawaysQueue.get(raffleIdEdit)}...`)
                        giveawayModel.findOne({
                            raffleId: sharuru.giveawaysQueue.get(raffleIdEdit)
                        },(err,res) =>{
                            if (err){
                                sendError.create({
                                    Guild_Name: interaction.member.guild.name,
                                    Guild_ID: interaction.guildId,
                                    User: issuer.username,
                                    UserID: issuer.id,
                                    Error: err,
                                    Time: `${TheDate} || ${clock} ${amORpm}`,
                                    Command: this.name + " require_mode",
                                    Args: "no args added for raffle interaction slash cmd",
                                },async (err2, res2) => {
                                    if(err2) {
                                        console.log(err2)
                                        return interaction.followUp(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                    }
                                    if(res2) {
                                        console.log(`successfully added error to database!`)
                                        return interaction.followUp(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                    }
                                })
                            }
                            if (res) {
                                if (!res.behavior.roles.restrictions.require.mode) res.behavior.roles.restrictions.require.mode = false;
                                res.behavior.roles.restrictions.require.mode = get_isEnabled
                                console.log(`[RaffleSys/ ${TheDate} | ${clock} ${amORpm}]: @${issuer.username} changed the require mode for giveaway ${sharuru.giveawaysQueue.get(raffleIdEdit)} to ${get_isEnabled}`)
                                giveawayEmbed.setDescription(`${issuer}, I've set the require mode to ${get_isEnabled}! Now every member ***${get_isEnabled == true ? "will need to have all roles" : "will need at least 1 role"}*** in order to join the giveaway!`)
                                mReply({embeds: [giveawayEmbed]})
                                res.save().catch(err3 =>{
                                    console.log(err3)
                                    mReply(null,interaction.channelId,`[Raffle-requireMode]: Unfortunately an error happened while trying to save to db. If this happens often, please contact my partner!`)
                                })
                            }
                        })
                    }
                    
                    if (interaction.options.getSubcommand() == "special_mode") 
                    {
                        console.log(`[RaffleSys/ ${TheDate} | ${clock} ${amORpm}]: @${issuer.username} tries to change the special mode for giveaway ${sharuru.giveawaysQueue.get(raffleIdEdit)}...`)
                        const acceptedModes = ["mode1","mode2","mode3"]
                        if (checkForItems(get_special_mode,acceptedModes,"returnOne") == null) {
                            giveawayEmbed.setDescription(`${issuer}, please choose one of the items displayed in the menu!`)
                            return interaction.reply({embeds: [giveawayEmbed]})
                        }

                        giveawayModel.findOne({
                            raffleId: sharuru.giveawaysQueue.get(raffleIdEdit)
                        },(err,res) =>{
                            if (err){
                                sendError.create({
                                    Guild_Name: interaction.member.guild.name,
                                    Guild_ID: interaction.guildId,
                                    User: issuer.username,
                                    UserID: issuer.id,
                                    Error: err,
                                    Time: `${TheDate} || ${clock} ${amORpm}`,
                                    Command: this.name + " special_mode",
                                    Args: "no args added for raffle interaction slash cmd",
                                },async (err2, res2) => {
                                    if(err2) {
                                        console.log(err2)
                                        return interaction.followUp(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                    }
                                    if(res2) {
                                        console.log(`successfully added error to database!`)
                                        return interaction.followUp(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                    }
                                })
                            }
                            if (res) {
                                if (!res.behavior.roles.restrictions.special.mode) res.behavior.roles.restrictions.special.mode = "mode1";
                                res.behavior.roles.restrictions.special.mode = get_special_mode
                                console.log(`[RaffleSys/ ${TheDate} | ${clock} ${amORpm}]: @${issuer.username} changed the special mode for giveaway ${sharuru.giveawaysQueue.get(raffleIdEdit)} to ${get_special_mode}`)
                                giveawayEmbed.setDescription(`${issuer}, I've set the special mode to ${displaySpecialMode(get_special_mode,false)}!`)
                                mReply({embeds: [giveawayEmbed]})
                                res.save().catch(err3 =>{
                                    console.log(err3)
                                    mReply(null,interaction.channelId,`[Raffle-specialMode]: Unfortunately an error happened while trying to save to db. If this happens often, please contact my partner!`)
                                })
                            }
                        })
                    }

                    if (interaction.options.getSubcommand() == "join")
                    {
                        console.log(`[RaffleSys/ ${TheDate} | ${clock} ${amORpm}]:@${issuer.username} tries to add ${get_role_object.name} (${get_role_object.id}) as assignable role upon joining for ${sharuru.giveawaysQueue.get(raffleIdEdit)}...`)
                        
                        giveawayModel.findOne({
                            raffleId: sharuru.giveawaysQueue.get(raffleIdEdit)
                        },(err,res) =>{
                            if (err){
                                sendError.create({
                                    Guild_Name: interaction.member.guild.name,
                                    Guild_ID: interaction.guildId,
                                    User: issuer.username,
                                    UserID: issuer.id,
                                    Error: err,
                                    Time: `${TheDate} || ${clock} ${amORpm}`,
                                    Command: this.name + " behavior_join",
                                    Args: "no args added for raffle interaction slash cmd",
                                },async (err2, res2) => {
                                    if(err2) {
                                        console.log(err2)
                                        return interaction.followUp(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                    }
                                    if(res2) {
                                        console.log(`successfully added error to database!`)
                                        return interaction.followUp(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                    }
                                })
                            }
                            if (res) {

                                // check first if the remove option is here, otherwise add/replace
                                if (get_remove_option)
                                {
                                    res.behavior.roles.assignRoleOnJoining = {
                                        role_id: "NOT_SET",
                                        namae: "NOT_SET"
                                    }
                                    res.save().catch(err3 =>{
                                        console.log(err3)
                                        mReply(null,interaction.channelId,`[Raffle-add_assign_join]: Unfortunately an error happened while trying to save to db. If this happens often, please contact my partner!`)
                                    })
                                    console.log(`[RaffleSys/ ${TheDate} | ${clock} ${amORpm}]:@${issuer.username} removed ${get_role_object.name} (${get_role_object.id}) as assignable role upon joining for ${sharuru.giveawaysQueue.get(raffleIdEdit)}...`)
                                    giveawayEmbed.setDescription(`${issuer}, I've removed the role that should be assigned upon joining for the giveaway with id: **\`${sharuru.giveawaysQueue.get(raffleIdEdit)}\`**`)
                                    mReply({embeds: [giveawayEmbed]})
                                    return;
                                }

                                //add/replce
                                if (!res.behavior.roles.assignRoleOnJoining) 
                                    res.behavior.roles.assignRoleOnJoining = {
                                        role_id: "NOT_SET",
                                        namae: "NOT_SET"
                                }
                                
                                res.behavior.roles.assignRoleOnJoining = {
                                    role_id: get_role_object.id,
                                    namae: get_role_object.name
                                }
                                giveawayEmbed.setDescription(`${issuer}, I will assign ${get_role_object} to the new members when they join the giveaway with id **\`${sharuru.giveawaysQueue.get(raffleIdEdit)}\`**!`)
                                console.log(`[RaffleSys/ ${TheDate} | ${clock} ${amORpm}]:@${issuer.username} added ${get_role_object.name} (${get_role_object.id}) as assignable role upon joining for ${sharuru.giveawaysQueue.get(raffleIdEdit)}.`)
                                mReply({embeds: [giveawayEmbed]})
                                res.save().catch(err3 =>{
                                    console.log(err3)
                                    mReply(null,interaction.channelId,`[Raffle-add_assign_join]: Unfortunately an error happened while trying to save to db. If this happens often, please contact my partner!`)
                                })
                            }
                        })
                    }

                    if (interaction.options.getSubcommand() == "leave")
                    {
                        console.log(`[RaffleSys/ ${TheDate} | ${clock} ${amORpm}]:@${issuer.username} tries to add ${get_role_object.name} (${get_role_object.id}) as removable role upon leave for ${sharuru.giveawaysQueue.get(raffleIdEdit)}...`)
                        
                        giveawayModel.findOne({
                            raffleId: sharuru.giveawaysQueue.get(raffleIdEdit)
                        },(err,res) =>{
                            if (err){
                                sendError.create({
                                    Guild_Name: interaction.member.guild.name,
                                    Guild_ID: interaction.guildId,
                                    User: issuer.username,
                                    UserID: issuer.id,
                                    Error: err,
                                    Time: `${TheDate} || ${clock} ${amORpm}`,
                                    Command: this.name + " behavior_leave",
                                    Args: "no args added for raffle interaction slash cmd",
                                },async (err2, res2) => {
                                    if(err2) {
                                        console.log(err2)
                                        return interaction.followUp(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                    }
                                    if(res2) {
                                        console.log(`successfully added error to database!`)
                                        return interaction.followUp(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                                    }
                                })
                            }
                            if (res) {

                                // check first if the remove option is here, otherwise add/replace
                                if (get_remove_option)
                                {
                                    res.behavior.roles.assignRoleOnLeaving = {
                                        role_id: "NOT_SET",
                                        namae: "NOT_SET"
                                    }
                                    res.save().catch(err3 =>{
                                        console.log(err3)
                                        mReply(null,interaction.channelId,`[Raffle-add_assign_join]: Unfortunately an error happened while trying to save to db. If this happens often, please contact my partner!`)
                                    })
                                    console.log(`[RaffleSys/ ${TheDate} | ${clock} ${amORpm}]:@${issuer.username} removed ${get_role_object.name} (${get_role_object.id}) as removable role upon leave for ${sharuru.giveawaysQueue.get(raffleIdEdit)}...`)
                                    giveawayEmbed.setDescription(`${issuer}, I've removed the role that should be assigned upon joining for the giveaway with id: **\`${sharuru.giveawaysQueue.get(raffleIdEdit)}\`**`)
                                    mReply({embeds: [giveawayEmbed]})
                                    return;
                                }

                                //add/replce
                                if (!res.behavior.roles.assignRoleOnLeaving) 
                                    res.behavior.roles.assignRoleOnLeaving = {
                                        role_id: "NOT_SET",
                                        namae: "NOT_SET"
                                }
                                
                                res.behavior.roles.assignRoleOnLeaving = {
                                    role_id: get_role_object.id,
                                    namae: get_role_object.name
                                }
                                giveawayEmbed.setDescription(`${issuer}, I will remove ${get_role_object} from the new members when they leave the giveaway with id **\`${sharuru.giveawaysQueue.get(raffleIdEdit)}\`**!`)
                                console.log(`[RaffleSys/ ${TheDate} | ${clock} ${amORpm}]:@${issuer.username} added ${get_role_object.name} (${get_role_object.id}) as removable role upon leaving for ${sharuru.giveawaysQueue.get(raffleIdEdit)}.`)
                                ni_reply({embeds: [giveawayEmbed]}, interaction.channelId)
                                res.save().catch(err3 =>{
                                    console.log(err3)
                                    mReply(null,interaction.channelId,`[Raffle-add_assign_join]: Unfortunately an error happened while trying to save to db. If this happens often, please contact my partner!`)
                                })
                            }
                        })
                    }
                }
                //#endregion
                } catch (error) {
                        console.log(error)
                        giveawayEmbed.setDescription(`${issuer}, it seems like an error happened! Please contact my master and tell about this error:\n\n# Name: ${error.name}\n\n## Message: ${error.message}\n\n## Stack: ${error.stack}`)
                        ni_reply()
                }

            }
        })
        /**
         *  - setup => starts the setup of a new giveaway
            - join <id> <keyword> => join the giveaway. Optionally input a keyword if required
            - select <id> => select a giveaway to edit with other commands
            - key enable/keyword <word> => enable and set the keyword for a giveaway. Type "any" to set to anything they wish to enter
            - halve_winners => halve the winner count if there's less participants than the winners amount.
            - list [display_ended/raffle_id] => display a list of ongoing giveaways by default. you can also display a list of giveaways that ended or list the details of a single giveaway.
            - add_role => add role modifiers (either entries or %)
            - ban <user> [id] =>  bans a member from being selected as a potential winner in the future giveaways. optionally mention raffle_id to ban only from that giveaway
            Using the command with same person unbans them. Providing the [giveaway id] will ban the member from current giveaway, otherwise it will be banned from future giveaways excluding the active ones.
            - force_end [no_winners]=> forcibly close a giveaway. Optionally close it without any winner
            - reroll <id> => reroll a giveaway by their id. Must be a giveaway that ended

            to do:
            - banlist => shows a list of banned users from future giveaways. Automatic bans from giveaways won't ban members from current giveaways.
            - quick <options> => This option let you create a quick giveaway without going through the guide.\nTemplate: !raffle quick #channel, how much it last(15min,1h,10days), winners count(1,3,6), prize, generous person that is giving away, message for participants.
            - slate save/load <id> => save
            
            **/
        /**
         * 
         * @param {String} string 
         * @returns {Boolean} True/false whenever it passed the format for time described.
         */
        function CheckTime(string) {
            // check time using regex to register: m(min) / h(hours) / d(days)
            /**
             * regex for min: [0-9]{1,3}m /// [0-9]{1,3}(min) /// [0-9]{1,3}(mins) 
             * regex for hour(s): [0-9]{1,3}(h) ///[0-9]{1,3}(hour) /// [0-9]{1,3}(hours)
             * regex for day(s): [0-9]{1,3}(d) ///[0-9]{1,3}(day) /// [0-9]{1,3}(days)
             * regex for month(s):[0-9]{1,3}(month) /// [0-9]{1,3}(months)
             */
            let passed = false;

            // check min
            if (string.match(/[0-9]{1,3}m/gi) || string.match(/[0-9]{1,3}min/gi)) passed = true;

            // check hours
            if (string.match(/[0-9]{1,3}h/gi) || string.match(/[0-9]{1,3}hour/gi) || string.match(/[0-9]{1,3}hours/gi)) passed = true;
            
            // check days
            if (string.match(/[0-9]{1,3}d/gi) || string.match(/[0-9]{1,3}day/gi) || string.match(/[0-9]{1,3}days/gi)) passed = true;

            return passed
        }
        function GetTime(string) {
            // GET time using regex to register: m(min) / h(hours) / d(days)
            /**
             * regex for min: [0-9]{1,3}m /// [0-9]{1,3}(min) /// [0-9]{1,3}(mins) 
             * regex for hour(s): [0-9]{1,3}(h) ///[0-9]{1,3}(hour) /// [0-9]{1,3}(hours)
             * regex for day(s): [0-9]{1,3}(d) ///[0-9]{1,3}(day) /// [0-9]{1,3}(days)
             * regex for month(s):[0-9]{1,3}(month) /// [0-9]{1,3}(months)
             */
            let passed = "";

            // check min
            if (string.match(/[0-9]{1,3}m/gi) || string.match(/[0-9]{1,3}min/gi)) passed = string.match(/[0-9]{1,3}m/gi);

            // check hours
            if (string.match(/[0-9]{1,3}h/gi) || string.match(/[0-9]{1,3}hour/gi) || string.match(/[0-9]{1,3}hours/gi)) passed = string.match(/[0-9]{1,3}h/gi)
            
            // check days
            if (string.match(/[0-9]{1,3}d/gi) || string.match(/[0-9]{1,3}day/gi) || string.match(/[0-9]{1,3}days/gi)) passed = string.match(/[0-9]{1,3}d/gi);

            return `${passed}`
        }
        function isNumeric(string) {
            return !isNaN(string)
        }
        /**
		 * 
		 * @param {String} userInput The input of the user.
		 * @param {[]} checkfor The items to check, based on condition, what the user input
		 * @param {String} condition The conditions to check for:
		 * 
		 * - 'includes' => checks if the user input is included in one of the following items in the "checkfor" array. Returns true/false
		 * - 'same' => checks if the user input is the same as one of the following items in the 'checkfor' array. Returns true/false
		 * - 'returnOne' => checks if the user input is in the array of items 'checkfor'. If yes, returns that item, otherwise null.
		 * @returns Results based on the condition.
		 */
		function checkForItems(userInput,checkfor,condition) {
			if(userInput.length == 0 || checkfor.length == 0) return 0
			if(condition == 'includes') {
				let notContain = false;
				for (const item of checkfor) {
					if(userInput.includes(item)) notContain = true;	
				}
				return notContain
			}
			if(condition == 'same'){
				let sameItem = false;
				sameLoop: for (let i = 0; i < checkfor.length; i++) {
					const item = checkfor[i].toLowerCase();
					if(userInput.toLowerCase() == item) {
						sameItem = true;
						break sameLoop;
					} 
				}
				return sameItem
			}
			if(condition == 'returnOne') {
				sameLoop: for (let i = 0; i < checkfor.length; i++) {
					const item = checkfor[i];
					if(userInput == item) {
						console.log(`found: ${item}`)
						if (item == 'true' || item == 'yes' || item == '1') return true;
						if (item == 'false' || item == 'no' || item == '0') return false;
						return item;
					} 
				}
				return null
			}
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
        /**
         * 
         * @param {Array} values An array of values to take from.
         * @param {Array} chances An array of chances from which we base the drop.
         * @returns Returns 1 "value" based on the "chances" array.
         */
		let percentageChance = function(values, chances) {
			for ( var i = 0, pool = []; i < chances.length; i++ ) {
			for ( let i2 = 0; i2 < chances[i]; i2++ ) {
				pool.push(i);
			}
			}
			return values[arrayShuffle(pool)['0']];
		};
        /**
         * 
         * @param {string} _messageID 
         * @param {Channel} _targetedChannel 
         * @param {string} _CustomError 
         * @returns 
         */
        async function messageFetcher (_messageID, _targetedChannel, _CustomError) {
			let foundMessage = new String();
			
			// Check if the message contains only numbers (Beacause ID contains only numbers)
			if (!Number(_messageID)) return 'FAIL_ID=NAN';
		
			// Check if the Message with the targeted ID is found from the Discord.js API
			try {
				await Promise.all([_targetedChannel.messages.fetch(_messageID)]);
			} catch (error) {
				// Error: Message not found
				if (error.code == 10008) {
                    if(_CustomError != undefined || _CustomError != null) {
                        console.log(_CustomError)
                    } else {
                        console.error('Failed to find the message! Setting value to error message...');
                    }
					foundMessage = 'MESSAGE_NOT_FOUND';
				}
			} finally {
				// If the type of variable is string (Contains an error message inside) then just return the fail message.
				if (typeof foundMessage == 'string') return foundMessage;
				// Else if the type of the variable is not a string (beacause is an object with the message props) return back the targeted message object.
				return _targetedChannel.messages.fetch(_messageID);
			}
        }
        /**
         * 
         * @param {Object} inter The embed object to send the interaction reply. If null, it will use channel and msg to send a msg
         * @param {string} channel The channel to send.
         * @param {string} msg The message to send.
         */
        function mReply(inter,channelId,msg) {
            if (inter == null)
                sharuru.channels.cache.get(channelId).send(msg)
            else
                interaction.reply(inter);
        }
        function ni_reply(object,channelId,msg)
        {
            if (object == null)
                sharuru.channels.cache.get(channelId).send(msg)
            else
                sharuru.channels.cache.get(channelId).send(object);
        }
        function checkIdRaffle() {
            if (checkIdAvailability == null)
            {
                // interaction.deferReply();
                GuildSettings.findOne({
                    ID: interaction.guildId
                },(err,res) =>{
                    if(err){
                        sendError.create({
                            Guild_Name: interaction.member.guild.name,
                            Guild_ID: interaction.guildId,
                            User: issuer.username,
                            UserID: issuer.id,
                            Error: err,
                            Time: `${TheDate} || ${clock} ${amORpm}`,
                            Command: this.name + " get Id from db - key",
                            Args: "no args added for raffle interaction slash cmd",
                        },async (err2, res2) => {
                            if(err2) {
                                console.log(err2)
                                return interaction.followUp(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                            }
                            if(res2) {
                                console.log(`successfully added error to database!`)
                                return interaction.followUp(`Unfortunately an problem appeared. Please try again later. If this problem persist, contact my partner!`)
                            }
                        })
                    }
                    if (res)
                    {
                        sharuru.giveawaysQueue.set(raffleIdEdit,res.raffleSettings.selectedRaffleId)
                        console.log(`[raffle-slash]: I've set up the editor to use Id from database since it was null/0!`)
                    }
                })
                giveawayEmbed.setDescription("I've refreshed the editor. Please try again!")
                return ni_reply({embeds: [giveawayEmbed]},interaction.channelId)
            }
        }
        /**
         * 
         * @param {String} mode What input to read
         * @param {Boolean} description Whenever this output should be for description or mode
         * @returns 
         */
        function displaySpecialMode(mode,description)
        {
            if (description == false)
            {

                if (mode == "mode1") return "Mode 1"
                
                if (mode == "mode2") return "Mode 2"
                
                if (mode == "mode3") return "Mode 3"
                
            } else {
                
                if (mode == "mode1") return "Change the way the special roles behave. Current Mode: Bypass required roles only;"
                
                if (mode == "mode2") return "Change the way the special roles behave. Current Mode: Bypass blocked roles only;"
                
                if (mode == "mode3") return "Change the way the special roles behave. Current Mode: Bypass all required and blocked roles;"
                //Mode 1: Bypass required roles; - Mode 2: Bypass blocked roles; - Mode 3: Bypasses both required and blocked roles;.
            }
            return "Ask partner to recheck this function(displaySpecialMode) & database for this giveaway!"
        }
        function formatTimeNicely(myDate,optionsDate) {
            return new Intl.DateTimeFormat("en", optionsDate).format(myDate);
        }
    }
}


