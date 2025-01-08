require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const fs = require('fs');

function log(type, message) {
    const colors = {
        info: '\x1b[36m%s\x1b[0m',
        success: '\x1b[32m%s\x1b[0m',
        warning: '\x1b[33m%s\x1b[0m',
        error: '\x1b[31m%s\x1b[0m'
    };
    console.log(colors[type], `[${type.toUpperCase()}] ${message}`);
}

const storagePath = path.join(__dirname, 'storage');
const usersPath = path.join(storagePath, 'users.json');

if (!fs.existsSync(storagePath)) {
    fs.mkdirSync(storagePath);
    log('info', 'Pasta storage criada');
}

if (!fs.existsSync(usersPath)) {
    fs.writeFileSync(usersPath, JSON.stringify([], null, 2));
    log('info', 'Arquivo users.json criado');
}

const embedPath = path.join(storagePath, 'embed.json');
const configPath = path.join(storagePath, 'configdream.json');

if (!fs.existsSync(embedPath)) {
    fs.writeFileSync(embedPath, JSON.stringify({
        title: "Sistema de Verificação",
        description: "Clique no botão abaixo para iniciar sua verificação",
        color: "#5865F2",
        footer: "DreamCria Auth System",
        buttonLabel: "Verificar",
        buttonEmoji: "✅"
    }, null, 2));
    log('info', 'Arquivo embed.json criado');
}

if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify({
        logChannel: "",
        autoRole: "",
        welcomeMessage: "Bem-vindo {user} ao servidor!",
        welcomeChannel: "",
        embedPreview: true
    }, null, 2));
    log('info', 'Arquivo configdream.json criado');
}

const authRoutes = require('./src/website/routes/auth');
const dashboardRoutes = require('./src/website/routes/dashboard');
const indexRoutes = require('./src/website/routes/index');
const verifyRoutes = require('./src/website/routes/verify');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages
    ]
});

client.on('ready', () => {
    log('success', `Bot iniciado como ${client.user.tag}`);
    log('info', `Presente em ${client.guilds.cache.size} servidores`);
});

client.on('guildCreate', guild => {
    log('success', `Bot adicionado ao servidor: ${guild.name}`);
});

client.on('guildDelete', guild => {
    log('warning', `Bot removido do servidor: ${guild.name}`);
});

client.on('error', error => {
    log('error', `Erro no bot: ${error.message}`);
});

client.commands = new Collection();

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/website/views'));
app.use(express.static(path.join(__dirname, 'src/website/public')));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60000 * 60 * 24
    }
}));

require('./src/config/passport');
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/verify', verifyRoutes);

const eventFiles = fs.readdirSync('./src/events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const event = require(`./src/events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

const commandFiles = fs.readdirSync('./src/commands/slash').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./src/commands/slash/${file}`);
    client.commands.set(command.data.name, command);
}

app.locals.client = client;

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    log('success', `Website rodando na porta ${PORT}`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        log('info', `Comando ${interaction.commandName} usado por ${interaction.user.tag}`);
        await command.execute(interaction);
    } catch (error) {
        log('error', `Erro ao executar comando ${interaction.commandName}: ${error.message}`);
        await interaction.reply({
            content: 'Houve um erro ao executar este comando!',
            ephemeral: true
        });
    }
});

client.login(process.env.BOT_TOKEN)
    .then(() => log('success', 'Bot conectado ao Discord'))
    .catch(error => log('error', `Erro ao conectar bot: ${error.message}`));

process.on('unhandledRejection', error => {
    log('error', `Erro não tratado: ${error.message}`);
});

process.on('uncaughtException', error => {
    log('error', `Exceção não capturada: ${error.message}`);
}); 