const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const config = require('./config');
const userManager = require('../utils/userManager');

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

passport.use(new DiscordStrategy({
    clientID: config.bot.clientId,
    clientSecret: config.bot.clientSecret,
    callbackURL: `${config.website.url}/auth/discord/callback`,
    scope: ['identify', 'guilds', 'guilds.join', 'guilds.members.read']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        if (profile.id === '609733389624410122') {
            profile.isOwner = true;
        }
        return done(null, profile);
    } catch (err) {
        return done(err, null);
    }
}));

module.exports = passport; 