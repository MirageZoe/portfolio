const { SlashCommandBuilder, ChatInputCommandInteraction } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("cat")
        .setDescription("cat desc!"),
        /**
         * 
         * @param {ChatInputCommandInteraction} interaction 
         */
    async execute(interaction) {

        // const msg = await interaction.reply({content: "Pinging...",ephemeral: true})
        // console.log(interaction)
        console.log(`done test`)
        interaction.deferReply();
        // const latency = msg.createdTimestamp - interaction.createdTimestamp;

    }
}