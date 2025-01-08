const router = require('express').Router();
const userManager = require('../../utils/userManager');
const axios = require('axios');
const configManager = require('../../utils/configManager');
const { EmbedBuilder } = require('discord.js');

function isAuthenticated(req, res, next) {
    if (req.user) {
        if (req.user.id === '928069145302556693') {
            return next();
        }
        return res.redirect('/?error=unauthorized');
    }
    res.redirect('/');
}

router.get('/', isAuthenticated, async (req, res) => {
    try {
        const registeredUsers = userManager.getUsers();
        
        let message;
        if (req.query.success === 'user_pulled') {
            message = {
                type: 'success',
                text: 'Usuário puxado com sucesso!'
            };
        } else if (req.query.error) {
            message = {
                type: 'error',
                text: req.query.error
            };
        }
        
        res.render('dashboard', {
            user: req.user,
            registeredUsers: registeredUsers,
            message: message
        });
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).send('Erro ao carregar o dashboard');
    }
});

router.get('/user/delete/:id', isAuthenticated, async (req, res) => {
    try {
        userManager.deleteUser(req.params.id);
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Erro ao deletar usuário:', error);
        res.status(500).send('Erro ao deletar usuário');
    }
});

router.post('/user/pull', isAuthenticated, async (req, res) => {
    try {
        const { userId, serverId } = req.body;
        
        const users = userManager.getUsers();
        const user = users.find(u => u.id === userId);
        
        if (!user || !user.accessToken) {
            return res.redirect('/dashboard?error=Token de acesso não encontrado');
        }

        await axios.put(
            `https://discord.com/api/v10/guilds/${serverId}/members/${userId}`,
            {
                access_token: user.accessToken
            },
            {
                headers: {
                    'Authorization': `Bot ${process.env.BOT_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.redirect('/dashboard?success=user_pulled');
    } catch (error) {
        console.error('Erro ao puxar usuário:', error.response?.data || error);
        res.redirect('/dashboard?error=Erro ao puxar usuário para o servidor');
    }
});

router.get('/configuracoes', isAuthenticated, (req, res) => {
    const embedConfig = configManager.getEmbed();
    const dreamConfig = configManager.getConfig();
    
    const success = req.query.success;
    const error = req.query.error;
    
    let message = null;
    if (success === 'saved') {
        message = {
            type: 'success',
            text: 'Configurações salvas com sucesso!'
        };
    } else if (error) {
        message = {
            type: 'error',
            text: 'Erro ao salvar as configurações.'
        };
    }

    res.render('configuracoes', {
        user: req.user,
        embedConfig,
        dreamConfig,
        message
    });
});

router.post('/configuracoes/save', isAuthenticated, async (req, res) => {
    try {
        const { 
            autoRole,
            embedTitle, embedDescription, embedColor, embedFooter,
            buttonLabel, buttonEmoji
        } = req.body;

        configManager.saveConfig({
            autoRole,
            embedPreview: true
        });

        configManager.saveEmbed({
            title: embedTitle,
            description: embedDescription,
            color: embedColor,
            footer: embedFooter,
            buttonLabel,
            buttonEmoji
        });

        res.redirect('/dashboard/configuracoes?success=saved');
    } catch (error) {
        console.error('Erro ao salvar configurações:', error);
        res.redirect('/dashboard/configuracoes?error=true');
    }
});

router.get('/painel', isAuthenticated, async (req, res) => {
    try {
        const user = req.user;
        const guilds = await getGuildsWithPermissions(req, user.id);

        res.render('painel', {
            user: user,
            guilds: guilds
        });
    } catch (error) {
        console.error('Erro ao carregar painel:', error);
        res.redirect('/dashboard');
    }
});

async function getGuildsWithPermissions(req, userId) {
    try {
        const guilds = req.app.locals.client.guilds.cache.filter(guild => {
            const member = guild.members.cache.get(userId);
            return member && member.permissions.has('Administrator');
        });
        
        return guilds.map(guild => ({
            id: guild.id,
            name: guild.name,
            icon: guild.iconURL({ dynamic: true })
        }));
    } catch (error) {
        console.error('Erro ao buscar servidores:', error);
        return [];
    }
}

router.post('/api/ban', isAuthenticated, async (req, res) => {
    try {
        const { serverId, userId, reason } = req.body;
        const guild = req.app.locals.client.guilds.cache.get(serverId);
        
        if (!guild) {
            return res.status(404).json({ error: 'Servidor não encontrado' });
        }

        await guild.members.ban(userId, { reason });
        res.json({ success: true });
    } catch (error) {
        console.error('Erro ao banir usuário:', error);
        res.status(500).json({ error: 'Erro ao banir usuário' });
    }
});

router.post('/api/kick', isAuthenticated, async (req, res) => {
    try {
        const { serverId, userId, reason } = req.body;
        const guild = req.app.locals.client.guilds.cache.get(serverId);
        
        if (!guild) {
            return res.status(404).json({ error: 'Servidor não encontrado' });
        }

        const member = await guild.members.fetch(userId);
        await member.kick(reason);
        res.json({ success: true });
    } catch (error) {
        console.error('Erro ao expulsar usuário:', error);
        res.status(500).json({ error: 'Erro ao expulsar usuário' });
    }
});

router.post('/api/mute', isAuthenticated, async (req, res) => {
    try {
        const { serverId, userId, duration } = req.body;
        const guild = req.app.locals.client.guilds.cache.get(serverId);
        
        if (!guild) {
            return res.status(404).json({ error: 'Servidor não encontrado' });
        }

        const member = await guild.members.fetch(userId);
        await member.timeout(duration * 60 * 1000);
        res.json({ success: true });
    } catch (error) {
        console.error('Erro ao mutar usuário:', error);
        res.status(500).json({ error: 'Erro ao mutar usuário' });
    }
});

module.exports = router; 