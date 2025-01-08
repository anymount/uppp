const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../../config/config');
const configManager = require('../../utils/configManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('verificar')
        .setDescription('Inicia o processo de verificação'),
    
    async execute(interaction) {
        const embedConfig = configManager.getEmbed();

        const embed = new EmbedBuilder()
            .setTitle(embedConfig.title)
            .setDescription(embedConfig.description)
            .setColor(embedConfig.color)
            .setTimestamp()
            .setFooter({ text: embedConfig.footer });

        const button = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel(embedConfig.buttonLabel)
                    .setStyle(ButtonStyle.Link)
                    .setURL(`${config.website.url}/auth/discord`)
                    .setEmoji(embedConfig.buttonEmoji)
            );

        await interaction.reply({
            embeds: [embed],
            components: [button]
        });
    }
}; 