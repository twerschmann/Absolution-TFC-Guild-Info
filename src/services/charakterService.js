const fetch = require("node-fetch");

class CharacterService{

    constructor(oauthClient) {
        this.oauthClient = oauthClient;
        //this.config = config;
    }

    async getBlizzardCharakter(server, characterName, oauthToken){
        const url = `https://eu.api.blizzard.com/profile/wow/character/${server}/${characterName}?namespace=profile-eu&locale=en_GB&access_token=${oauthToken}`
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`${response.status}: ${response.statusText}: ${url}`);
        }

        return await response.json();
    }
}
module.exports = CharacterService;