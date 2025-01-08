require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

function log(type, message) {
    const colors = {
        info: '\x1b[36m%s\x1b[0m',
        success: '\x1b[32m%s\x1b[0m',
        warning: '\x1b[33m%s\x1b[0m',
        error: '\x1b[31m%s\x1b[0m'
    };
    console.log(colors[type], `[${type.toUpperCase()}] ${message}`);
}

const commands = [];
const commandsPath = path.join(__dirname, 'src/commands/slash');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    commands.push(command.data.toJSON());
    log('info', `Comando carregado: ${command.data.name}`);
}

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

async function deployCommands(guildId) {
    try {
        log('info', `Iniciando deploy de ${commands.length} comandos para o servidor ${guildId}...`);

        const data = await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId),
            { body: commands },
        );

        log('success', `Deploy realizado com sucesso! ${data.length} comandos registrados.`);
    } catch (error) {
        log('error', `Erro no deploy: ${error.message}`);
    }
}

const args = process.argv.slice(2);
const guildId = args[0];

if (!guildId) {
    log('error', 'Por favor, forneça o ID do servidor como argumento.');
    log('info', 'Exemplo: node deploy.js 123456789012345678');
    process.exit(1);
}

deployCommands(guildId); 