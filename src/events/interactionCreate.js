module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (interaction.isButton()) {
            if (interaction.customId === 'verify_button') {
                const authUrl = `${process.env.WEBSITE_URL}/auth/discord`;
                await interaction.reply({
                    content: ` Clique aqui para verificar sua conta: ${authUrl}`,
                    ephemeral: true
                });
            }
        }

        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                await interaction.reply({
                    content: 'Houve um erro ao executar este comando!',
                    ephemeral: true
                });
            }
        }
    }
}; 