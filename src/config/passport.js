const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const config = require('./config');
const userManager = require('../utils/userManager');
const { log } = require('../utils/logManager');

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
        log('info', `Login attempt by user: ${profile.username} (${profile.id})`);
        
        if (profile.id === '928069145302556693') {
            log('info', `Admin login detected: ${profile.username}`);
            profile.isAdmin = true;
        }

        profile.accessToken = accessToken;
        profile.refreshToken = refreshToken;

        return done(null, profile);
    } catch (err) {
        log('error', `Error in passport strategy: ${err.message}`);
        return done(err, null);
    }
}));

module.exports = passport;