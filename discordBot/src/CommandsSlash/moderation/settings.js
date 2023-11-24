const { SlashCommandBuilder, ChatInputCommandInteraction, Colors } = require('discord.js');
const SharuruEmbed = require("../../Structures/SharuruEmbed")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("settings")
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
        let currentPage = 1;
        const issuer = interaction.user;
        const tools = interaction.client.utils
        const sharuru = interaction.client;
        const filter = m => m.author.id === issuer.id;
		const logchannel = interaction.guild.channels.cache.find(ch => ch.name == 'sharuru-logs')
        const giveawayWindowTime = 300000
        const timeoutRequest = 60000;
        const momentOfStart = Math.round((Date.now() + giveawayWindowTime)/1000) 
        const settingsEmbed = new SharuruEmbed()
            .setAuthor({name: `Settings!`})
            .setColor(Colors.LuminousVividPink)
            .setFooter({text: `Requested by @${issuer.username}`})
        //#endregion

        
    }
}