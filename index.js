require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const express = require('express');
const session = require('express-session');
const MemoryStore = session.MemoryStore;
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
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildPresences
    ]
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'src/commands/slash');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    client.commands.set(command.data.name, command);
    log('info', `Comando carregado: ${command.data.name}`);
}

client.on('ready', () => {
    log('success', `Bot online como ${client.user.tag}`);
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

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
        log('info', `Comando ${interaction.commandName} executado por ${interaction.user.tag}`);
    } catch (error) {
        log('error', `Erro ao executar comando ${interaction.commandName}: ${error}`);
        await interaction.reply({ 
            content: 'Houve um erro ao executar este comando!', 
            ephemeral: true 
        }).catch(console.error);
    }
});

const app = express();

// Configuração do Express
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/website/views'));
app.use(express.static(path.join(__dirname, 'src/website/public')));

// Configuração da sessão
app.use(session({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60000 * 60 * 24 // 24 horas
    },
    store: new MemoryStore({
        checkPeriod: 86400000 // 24 horas
    })
}));

// Configuração do Passport
require('./src/config/passport');
app.use(passport.initialize());
app.use(passport.session());

// Middleware para disponibilizar user em todas as views
app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});

// Configuração do body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
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

app.locals.client = client;

const PORT = process.env.PORT || 3000;

// Primeiro inicia o servidor web
const server = app.listen(PORT, '0.0.0.0', () => {
    log('success', `Website rodando na porta ${PORT}`);
});

// Depois conecta o bot
client.login(process.env.BOT_TOKEN)
    .then(() => {
        log('success', `Bot conectado como ${client.user.tag}`);
    })
    .catch(error => {
        log('error', `Erro ao conectar bot: ${error}`);
    });

// Tratamento de erros do processo
process.on('unhandledRejection', error => {
    log('error', `Erro não tratado: ${error}`);
});

process.on('uncaughtException', error => {
    log('error', `Exceção não capturada: ${error}`);
});

// Tratamento de desligamento gracioso
process.on('SIGTERM', () => {
    log('info', 'Recebido sinal SIGTERM. Iniciando desligamento gracioso...');
    server.close(() => {
        log('info', 'Servidor HTTP fechado.');
        client.destroy();
        log('info', 'Cliente Discord desconectado.');
        process.exit(0);
    });
});