const router = require('express').Router();
const passport = require('passport');
const userManager = require('../../utils/userManager');
const configManager = require('../../utils/configManager');
const { log } = require('../../utils/logManager');

router.get('/discord', passport.authenticate('discord'));

router.get('/discord/callback', passport.authenticate('discord', {
    failureRedirect: '/?error=unauthorized'
}), async (req, res) => {
    log('info', `Auth callback for user: ${req.user.username} (${req.user.id})`);
    
    if (req.user && req.user.id === '928069145302556693') {
        log('info', `Admin login successful: ${req.user.username}`);
        return res.redirect('/dashboard');
    } else {
        try {
            const userData = {
                id: req.user.id,
                username: req.user.username,
                avatar: req.user.avatar,
                verified: true,
                verifiedAt: new Date().toISOString(),
                accessToken: req.user.accessToken,
                refreshToken: req.user.refreshToken
            };

            userManager.saveUser(userData);

            // Adicionar cargo ao usuário
            const config = configManager.getConfig();
            log('info', `Tentando adicionar cargo. Config: ${JSON.stringify(config)}`);
            
            if (config.autoRole && req.app.locals.client) {
                try {
                    log('info', `Buscando servidor Discord...`);
                    const guild = await req.app.locals.client.guilds.fetch('1246634737804640287');
                    
                    if (guild) {
                        log('info', `Servidor encontrado. Buscando membro...`);
                        const member = await guild.members.fetch(req.user.id);
                        
                        if (member) {
                            log('info', `Membro encontrado. Adicionando cargo ${config.autoRole}...`);
                            await member.roles.add(config.autoRole);
                            log('success', `Cargo adicionado com sucesso!`);
                        } else {
                            log('error', 'Membro não encontrado no servidor');
                        }
                    } else {
                        log('error', 'Servidor não encontrado');
                    }
                } catch (error) {
                    log('error', `Erro ao adicionar cargo: ${error.message}`);
                    console.error('Erro completo:', error);
                }
            } else {
                log('info', `Cargo não configurado ou cliente não disponível. autoRole: ${config.autoRole}, client: ${!!req.app.locals.client}`);
            }

            return res.render('success', { user: req.user });
        } catch (error) {
            log('error', `Erro ao salvar usuário: ${error.message}`);
            return res.redirect('/?error=save_failed');
        }
    }
});

router.get('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) {
            log('error', `Erro ao fazer logout: ${err.message}`);
        }
        res.redirect('/');
    });
});

module.exports = router;