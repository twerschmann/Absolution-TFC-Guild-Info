const fetch = require("node-fetch");

class CharacterService{



    async getCharakter(server, characterName, oauthToken){
        const url = `https://eu.api.blizzard.com/profile/wow/character/${server}/${characterName}?namespace=profile-eu&locale=en_GB&access_token=${oauthToken}`
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`${response.status}: ${response.statusText}: ${url}`);
        }
        const json = await response.json()

        const fetch_response_mplus = await fetch(`https://raider.io/api/v1/characters/profile?region=eu&realm=${server}&name=${characterName}&fields=gear%2Ccovenant%2Cmythic_plus_scores`);
        const json_mplus = await fetch_response_mplus.json();
        return {
            CharName: json.name,
            ServerName: json.realm.name,
            Itemlvl: json.average_item_level,
            Class: json.character_class.name,
            Spec: json.active_spec.name,
            Covenant: json.covenant_progress.chosen_covenant.name,
            Renown: json.covenant_progress.renown_level,
            MplusScore: json_mplus.mythic_plus_scores.all || 0
        };
    }
}
module.exports = CharacterService;