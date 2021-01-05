const express = require('express');
const Datastore = require('nedb');
const fetch = require("node-fetch");
require('dotenv').config();

const apiKey = process.env.API_KEY;
const port = process.env.PORT || 8080;

const app = express();
app.listen(port, () => console.log(`Hört auf ${port}`));
app.use(express.static('public'));
app.use(express.json({limit:'2mb'}));


const database = new Datastore({filename: 'database.db'});
database.loadDatabase();

app.post('/addChar', async (req, res) =>{
    const data = req.body;
    const server = data.ServerName.toLowerCase();
    const charname = data.CharName.toLowerCase();
    console.log(charname);
    if(server && charname) {
        const fetch_response = await fetch(`https://eu.api.blizzard.com/profile/wow/character/${server}/${charname}?namespace=profile-eu&locale=en_GB&access_token=${apiKey}`);
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
        for(let i = 0; i< charCount;i++){
            let item = data[i];
            const server = item.ServerName;
            const charname = item.CharName;
            const fetch_response = await fetch(`https://eu.api.blizzard.com/profile/wow/character/${server}/${charname}?namespace=profile-eu&locale=en_GB&access_token=${apiKey}`);
            const json = await fetch_response.json();

            const fetch_response_mplus = await fetch(`https://raider.io/api/v1/characters/profile?region=eu&realm=${server}&name=${charname}&fields=mythic_plus_scores`);
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