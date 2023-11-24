const { SlashCommandBuilder, ChatInputCommandInteraction, Colors } = require('discord.js');
const SharuruEmbed = require("../../Structures/SharuruEmbed")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("word")
        .setDescription("Lemme help you how to use this! Please select an action:")
        .addSubcommand(ban =>
            ban.setName(`ban`)
            .setDescription(`Ban a word!`)
            .addStringOption(word =>
                word.setName("word")
                .setDescription("Please type the word you wish to ban!")
                .setRequired(true)
                .setMinLength(3)
                .setMaxLength(16))
        )
        .addSubcommand(unban =>
            unban.setName(`unban`)
            .setDescription(`Unban a word!`)
            .addStringOption(word =>
                word.setName("word")
                .setDescription("Please type a banned word to be unbanned!")
                .setRequired(true)
                .setMinLength(3)
                .setMaxLength(16))
        )
        .addSubcommand(deleteAll =>
            deleteAll.setName("delete")
            .setDescription("Clears the entire list of banned words!")
        )
        .addSubcommand(listAll =>
            listAll.setName("list")
            .setDescription("Get a list of banned words & protected words/members/roles!")
        )
        .addSubcommand(switchOnOff =>
            switchOnOff.setName("switch")
            .setDescription("Enable/Disable the word system!")
        )
        .addSubcommandGroup(protect =>
            protect.setName("protect")
            .setDescription(`Protect a word, member or a role from the system!`)
            .addSubcommand(word =>
                word.setName("word")
                .setDescription("Protect a word!")
                .addStringOption(input =>
                    input.setName("input")
                    .setDescription("Please enter a word.")
                    .setRequired(true)
                    .setMinLength(3)
                    .setMaxLength(16)
                )
            )
            .addSubcommand(member =>
                member.setName("member")
                .setDescription("Protect a member!")
                .addUserOption(input =>
                    input.setName("input")
                    .setDescription("Please mention a member.")
                    .setRequired(true)
                )
            )
            .addSubcommand(role =>
                role.setName("role")
                .setDescription("Protect a role!")
                .addRoleOption(input =>
                    input.setName("input")
                    .setDescription("Please mention a role.")
                    .setRequired(true)
                )
            )
        )
        .addSubcommandGroup(autowarn =>
            autowarn.setName("autowarn")
            .setDescription("Edit the settings of auto-warn feature of the word system!")
            .addSubcommand(switchAutoWarn =>
                switchAutoWarn.setName("switch")
                .setDescription("Enable/Disable auto-warn feature when the word system detects an user!")
            )
            .addSubcommand(set_type =>
                set_type.setName("set")
                .setDescription("Set the warning type to give to the said user.")
                .addStringOption(valueToAdd =>
                    valueToAdd.setName("type")
                    .setDescription("Type Level")
                    .setRequired(true)
                    .addChoices(
                        {name: "Level 1 - Shard Type",value: "shard"},
                        {name: "Level 2 - FrostFang Type",value: "frostfang"},
                        {name: "Level 3 - BlackIce Type",value: "blackice"},
                    )
                )
            )
        ),
        /**
         * 
         * @param {ChatInputCommandInteraction} interaction 
         */
    async execute(interaction) {

        console.log(interaction.options)
        let completeCMD = `\`!word `
        let baseComment = `Here's your command to copy-paste in the chat:`
        const wordEmbed = new SharuruEmbed()
            .setAuthor({name: `Word Command Helper!`})
            .setColor(Colors.LuminousVividPink)
            .setFooter({text: `Requested by ${interaction.user.tag}`})

        // ban command
        if (interaction.options.getSubcommand() == "ban") {
            completeCMD += `add ${interaction.options.getString("word")}\``
            wordEmbed.setDescription(`${baseComment}\n\n${completeCMD}`)
            interaction.reply({embeds: [wordEmbed]})
            return;
        }

        // unban command
        if (interaction.options.getSubcommand() == "unban") {
            completeCMD += `remove ${interaction.options.getString("word")}\``
            wordEmbed.setDescription(`${baseComment}\n\n${completeCMD}`)
            interaction.reply({embeds: [wordEmbed]})
            return;
        }

        // delete command
        if (interaction.options.getSubcommand() == "delete") {
            completeCMD += `delete\``
            wordEmbed.setDescription(`${baseComment}\n\n${completeCMD}`)
            interaction.reply({embeds: [wordEmbed]})
            return;
        }

        // list command
        if (interaction.options.getSubcommand() == "list") {
            completeCMD += `list\``
            wordEmbed.setDescription(`${baseComment}\n\n${completeCMD}`)
            interaction.reply({embeds: [wordEmbed]})
            return;
        }

        // switch command
        if (interaction.options.getSubcommandGroup() == null && interaction.options.getSubcommand() == "switch") {
            completeCMD += `switch\``
            wordEmbed.setDescription(`${baseComment}\n\n${completeCMD}`)
            interaction.reply({embeds: [wordEmbed]})
            return;
        }

        if (interaction.options.getSubcommandGroup() == "protect") {
            if (interaction.options.getSubcommand() == "word") {
                completeCMD += `protect word ${interaction.options.getString("input")}\n\nP.S: To remove that word, use the command again!\``
                wordEmbed.setDescription(`${baseComment}\n\n${completeCMD}`)
                interaction.reply({embeds: [wordEmbed]})
                return;
            }

            if (interaction.options.getSubcommand() == "member") {
                completeCMD += `protect member ${interaction.options.getUser("input")}P.S: To remove that member, use the command again!\``
                wordEmbed.setDescription(`${baseComment}\n\n${completeCMD}`)
                interaction.reply({embeds: [wordEmbed]})
                return;
            }

            if (interaction.options.getSubcommand() == "role") {
                completeCMD += `protect role ${interaction.options.getRole("input")}\`P.S: To remove that role, use the command again!`
                wordEmbed.setDescription(`${baseComment}\n\n${completeCMD}`)
                interaction.reply({embeds: [wordEmbed]})
                return;
            }
        }

        if (interaction.options.getSubcommandGroup() == "autowarn") {
            if (interaction.options.getSubcommand() == "switch") {
                completeCMD += `autowarn switch\``
                wordEmbed.setDescription(`${baseComment}\n\n${completeCMD}`)
                interaction.reply({embeds: [wordEmbed]})
                return;
            }
            if (interaction.options.getSubcommand() == "set") {
                completeCMD += `autowarn type ${interaction.options.getString("type")}\``
                wordEmbed.setDescription(`${baseComment}\n\n${completeCMD}`)
                interaction.reply({embeds: [wordEmbed]})
                return;
            }
        }


        /**
         *  !word add <word>
            !word remove <word>
            !word delete
            !word list
            !word switch
            !word protect <what:word/member/role> <value: word/@member/@role>
            !word autowarn <switch/setType> [@type]
                // .addStringOption(option =>
            //     option.setName('base_option')
            //     .setDescription('Select what you want to do:')
            //     .setRequired(true)
            //     .addChoices(
            //         {name: `Enable/Disable the system`,value:`switch`},
            //         {name: `Ban a word`,value:`add`},
            //         {name: `Unban a word`,value:`remove`},
            //         {name: `Unban all words`,value:`delete`},
            //         {name: `See a list of banned words`,value:`list`},
            //         {name: `Protect words/roles/members from the system`,value:`protect`},
            //         {name: `Enable/Disable the feature of auto-warning if an user types a banned word`,value:`autowarn`},
            //     ))
            // .addStringOption(option2 =>
            //     option2.setName("second_option")
            //     .setDescription(`This sub-option helps you to select furthermore options after base option.`)
            //     .addChoices(
            //         {name: `Word to ban/unban`,value:`value`},
            //         {name: `PROTECT: Word`,value:`word`},
            //         {name: `PROTECT: Member`,value:`member`},
            //         {name: `PROTECT: Role`,value:`role`},
            //         {name: `AUTOWARN: Switch - Enable/Disable this feature!`,value:`switch`},
            //         {name: `AUTOWARN: Type - Set the type of warning for auto-warn feature!`,value:`type`},
            //     )
            //     .setRequired(true)
            //     )
            // .addStringOption(options3 =>
            //     options3.setName("third_option")
            //     .setDescription(`This sub-option is made for longer commands!`)
            //     .addChoices(
            //         {name: "PROTECT: value",value: "protectValue"},
            //         {name: "AUTOWARN: shard/frostfang/blackice",value: "autowarnValue"},
            //     ))
            .addSubcommand(protect_option =>
            protect_option.setName("protect")
            .setDescription("Protect a word, member or a role from the system!")
            .addStringOption(protectWord =>
                protectWord.setName("protect_word")
                .setDescription("Protect a word!")
                // .setRequired(true)
                .setMinLength(3)
                .setMaxLength(16))
            .addUserOption(protectUser =>
                protectUser.setName("protect_user")
                .setDescription("Protect a member!")
                // .setRequired(true)
            )
            .addRoleOption(protectRole =>
                protectRole.setName("protect_role")
                .setDescription("Protect a role!")
                // .setRequired(true)
            )
        )
         */
    }
}