const router = require('express').Router();
const passport = require('passport');
const userManager = require('../../utils/userManager');
const configManager = require('../../utils/configManager');

router.get('/discord', passport.authenticate('discord'));

router.get('/discord/callback', passport.authenticate('discord', {
    failureRedirect: '/?error=unauthorized'
}), async (req, res) => {
    if (req.user && req.user.id === '928069145302556693') {
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
            if (config.autoRole && req.app.locals.client) {
                try {
                    const guild = await req.app.locals.client.guilds.fetch('1246634737804640287');
                    if (guild) {
                        const member = await guild.members.fetch(req.user.id);
                        if (member) {
                            await member.roles.add(config.autoRole);
                        }
                    }
                } catch (error) {
                    console.error('Erro ao adicionar cargo:', error);
                }
            }

            return res.render('success', { user: req.user });
        } catch (error) {
            console.error('Erro ao salvar usuário:', error);
            return res.redirect('/?error=save_failed');
        }
    }
});

router.get('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) {
            console.error('Erro ao fazer logout:', err);
        }
        res.redirect('/');
    });
});

module.exports = router;