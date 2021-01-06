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
const allDataDB = new Datastore({filename: 'allDataDB.db'});
allDataDB.loadDatabase();

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
        try{
            const player = await characterService.getCharakter(server, charname, oauthToken);
            allDataDB.count({CharName: player.CharName, ServerName: player.ServerName}, (err, count) => {
                if (count < 1) {
                    console.log(player);
                    allDataDB.insert(player);
                }
            });
        }catch (error){
            console.log(error);
        }

        res.end();
    }
});

app.get('/getData', async (request, response) => {
    let charCount = 0;
    allDataDB.count({},(err, count) => {
        charCount = count;
    })

    allDataDB.find({},async (err, data) => {

        if(err) {
            response.end();
            return;
        }

        data.sort(((a, b) => {
            return a.Itemlvl - b.Itemlvl
        }))
        console.log(data);
        response.json(data);
    })
});

app.get('/refresh', async (request, response) => {
    const charData = [] ;
    let charCount = 0;
    allDataDB.count({},(err, count) => {
        charCount = count;
    })

    allDataDB.find({},async (err, data) => {
        if (err) {
            response.end();
            return;
        }
        const oauthToken = await oauthClient.getToken();

        for (let i = 0; i < charCount; i++) {
            let item = data[i];
            const server = item.ServerName.toLowerCase();
            const charname = item.CharName.toLowerCase();

            let player;
            try {
                player = await characterService.getCharakter(server, charname, oauthToken);
            } catch (error) {
                console.log(`Fehler beim Laden eines Chars(${charname})`);
                const data = {
                    status: error.status,
                    statusText: error.statusText
                };
                response.json(data);
                return;
            }
            console.log(player);
            allDataDB.update({ CharName: player.CharName }, { $set: { Itemlvl: player.Itemlvl, Spec: player.Spec, Class: player.Class, Covenant: player.Covenant, Renown: player.Renown, MplusScore: player.MplusScore } }, { multi: false }, function (err, numReplaced) {
                console.log(numReplaced);
            });
        }
        response.json({status:200});
    });
});