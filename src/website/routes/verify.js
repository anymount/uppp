const router = require('express').Router();
const userManager = require('../../utils/userManager');

router.get('/', (req, res) => {
    res.redirect('/auth/discordusers');
});

router.post('/submit', (req, res) => {
    if (!req.user) {
        return res.redirect('/auth/discordusers');
    }

    try {
        const userData = {
            id: req.user.id,
            username: req.user.username,
            avatar: req.user.avatar,
            verified: true,
            verifiedAt: new Date().toISOString()
        };

        userManager.saveUser(userData);
        res.render('success', { user: req.user });
    } catch (error) {
        console.error('Erro ao salvar usuário:', error);
        res.redirect('/verify?error=save_failed');
    }
});

module.exports = router; 