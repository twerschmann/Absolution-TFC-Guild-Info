const express = require('express');
const Datastore = require('nedb');
const fetch = require("node-fetch");
const CharacterService = require("./services/charakterService");
const OauthClient = require("./oauth/client.js");
require('dotenv').config();



const oauthOptions = {
    client: {
        id: process.env.CLIENT_ID,
        secret: process.env.CLIENT_SECRET
    },
    auth: {
        tokenHost: process.env.OAUTH_TOKEN_HOST || "https://eu.battle.net"
    }
};

const oauthClient = new OauthClient({ oauthOptions });
const characterService = new CharacterService(oauthClient);

const port = process.env.PORT || 8080;

const app = express();
app.listen(port, () => console.log(`Hört auf ${port}`));
app.use(express.static('public'));
app.use(express.json({limit:'2mb'}));



const database = new Datastore({filename: 'database.db'});
database.loadDatabase();

app.get('/getChar', async (request, response) => {
    const character = await characterService.getBlizzardCharakter('frostwolf','youkago');
    response.json(character);
});

app.post('/addChar', async (req, res) =>{
    const data = req.body;
    const server = data.ServerName.toLowerCase();
    const charname = data.CharName.toLowerCase();
    console.log(charname);
    if(server && charname) {
        const oauthToken = await oauthClient.getToken();
        const fetch_response = await fetch(`https://eu.api.blizzard.com/profile/wow/character/${server}/${charname}?namespace=profile-eu&locale=en_GB&access_token=${oauthToken}`);
        const json = await fetch_response.json();
        if (json.code) {
            console.log(json);
        } else {
            database.count({CharName: charname, ServerName: server}, (err, count) => {
                if (count < 1) {
                    database.insert({ServerName: server, CharName: charname});
                }
            });
        }
        res.end();
    }
});

app.get('/getData', async (request, response) => {
    const charData = [] ;
    let charCount = 0;
    database.count({},(err, count) => {
        charCount = count;
    })

    database.find({},async (err, data) => {


        if(err){
            response.end();
            return;
        }
        const oauthToken = await oauthClient.getToken();

        for(let i = 0; i< charCount;i++){
            let item = data[i];
            const server = item.ServerName;
            const charname = item.CharName;

            let json;
            try{
                 json = await characterService.getBlizzardCharakter(server,charname,oauthToken)
            }catch (error){
                console.log('fehler!!!!!!!!!!!!!!!!!!!!!!')
                const data = {
                    status: fetch_response.status,
                    statusText: fetch_response.statusText
                };
                response.json(data);
                return;
            }




            const fetch_response_mplus = await fetch(`https://raider.io/api/v1/characters/profile?region=eu&realm=${server}&name=${charname}&fields=gear%2Ccovenant%2Cmythic_plus_scores`);
            const json_mplus = await fetch_response_mplus.json();

            const player = {
                CharName: json.name,
                ServerName: json.realm.name,
                Itemlvl: json.average_item_level,
                Class: json.character_class.name,
                Spec: json.active_spec.name,
                Covenant: json.covenant_progress.chosen_covenant.name,
                Renown: json.covenant_progress.renown_level,
                MplusScore: json_mplus.mythic_plus_scores.all || 0
            }
            charData.push(player);
        }
        charData.sort(((a, b) => {
            return a.Itemlvl - b.Itemlvl
        }))
        //console.log(charData);
        response.json(charData);
    })
});