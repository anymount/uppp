const fs = require('fs');
const path = require('path');

class ConfigManager {
    constructor() {
        this.storagePath = path.join(__dirname, '../../storage');
        this.embedPath = path.join(this.storagePath, 'embed.json');
        this.configPath = path.join(this.storagePath, 'configdream.json');
    }

    getEmbed() {
        return JSON.parse(fs.readFileSync(this.embedPath, 'utf8'));
    }

    getConfig() {
        return JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
    }

    saveEmbed(embedData) {
        fs.writeFileSync(this.embedPath, JSON.stringify(embedData, null, 2));
    }

    saveConfig(configData) {
        fs.writeFileSync(this.configPath, JSON.stringify(configData, null, 2));
    }
}

module.exports = new ConfigManager(); 