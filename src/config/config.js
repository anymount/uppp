module.exports = {
    bot: {
        token: process.env.BOT_TOKEN,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET
    },
    website: {
        url: process.env.WEBSITE_URL,
        port: process.env.PORT || 3000
    },
    database: {
        uri: process.env.MONGODB_URI
    }
}; 