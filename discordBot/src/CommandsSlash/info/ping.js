const { SlashCommandBuilder, ChatInputCommandInteraction } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("How fast do I respond, OwO?"),
        /**
         * 
         * @param {ChatInputCommandInteraction} interaction 
         */
    async execute(interaction) {

        const msg = await interaction.reply({content: "Pinging...",ephemeral: true,fetchReply: true})
        // console.log(msg.interaction.createdTimestamp,interaction.createdTimestamp)
        // console.log(`done ping updated AGAIN!! FOOLS`)
        // interaction.deferReply();
        const latency = msg.createdTimestamp - interaction.createdTimestamp;
        const choices = ['Is this really my ping?', 'Is this okay? I can\'t look!', 'Hope it\'s not that bad...'];
		const response = choices[Math.floor(Math.random() * choices.length)];
        interaction.editReply({content:`${response}\nLatency: \`${latency}ms\``});
    }
}